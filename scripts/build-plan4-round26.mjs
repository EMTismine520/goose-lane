import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { starterSavoryCandidates } from '../artwork/plan4-food/round26/starter-savory.mjs';
import { starterSweetCandidates } from '../artwork/plan4-food/round26/starter-sweet.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round26-feedback.json'),'utf8'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
const previous=JSON.parse(await readFile(path.join(archive,'round25.json'),'utf8'));
const mixerFinal=JSON.parse(await readFile(path.join(site,'mixer-final.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||mixerFinal.reviewId!==feedback.confirmedMixerReviewId||mixerFinal.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Mixer confirmation must precede recipe review');
const materialBaseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const content=await readFile(path.join(root,'src/content/expansion-data.json')),baseCatalog=await readFile(path.join(root,'src/content/catalog.ts'));
if(hash(content)!==feedback.actualContentSha256)throw Error('Actual content changed');
const catalogBytes=await readFile(path.join(root,'artwork/v3-b/catalog.json')),catalog=JSON.parse(catalogBytes.toString('utf8'));
const recipes=catalog.filter(r=>r.kind==='recipe'),mapping=JSON.parse(await readFile(path.join(root,'src/content/v3-art.json'),'utf8'));
if(recipes.length!==123||new Set(recipes.map(r=>r.id)).size!==123)throw Error('Recipe catalog scope differs');
const candidates=new Map([...starterSavoryCandidates,...starterSweetCandidates].map(r=>[r.id,r]));
if(candidates.size!==6)throw Error('Six starter recipe candidates required');
function bounds(data,info){
  let left=info.width,top=info.height,right=-1,bottom=-1,edge=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    const a=data[(y*info.width+x)*4+3];
    if(x===0||y===0||x===info.width-1||y===info.height-1)edge=Math.max(edge,a);
    if(a<=16)continue;
    left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<left)throw Error('Empty artwork');
  return {left,top,width:right-left+1,height:bottom-top+1,edge};
}
function validate(svg,id){
  if(/<(?:image|script|foreignObject)\b|(?:href|src)\s*=|data:/i.test(svg))throw Error(id+': SVG must be self-contained');
  const ids=[...svg.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)throw Error(id+': duplicate SVG definition');
  for(const m of svg.matchAll(/url\(["']?#([^)'"\s]+)["']?\)/g))if(!ids.includes(m[1]))throw Error(id+': missing definition');
  const box=svg.match(/\bviewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
  if(!box||box.length!==4||box.some(v=>!Number.isFinite(v))||box[2]<=0||box[3]<=0)throw Error(id+': invalid viewBox');
  return box;
}
async function inspect(bytes,size,id,expected){
  const meta=await sharp(bytes).metadata();
  if(meta.width!==size||meta.height!==size||!meta.hasAlpha)throw Error(id+': export dimensions or alpha differ');
  const raw=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  const occupancy=Math.max(b.width,b.height)/size;
  if(b.edge||Math.abs(occupancy-expected)>.006)throw Error(id+': occupancy differs '+occupancy);
  return {occupancy,bounds:b};
}
async function render(source,id,occupancy){
  const svg=source.toString('utf8'),box=validate(svg,id);
  const raw=await sharp(source).resize(1024,1024).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  if(b.edge)throw Error(id+': source touches edge');
  const side=Math.max(b.width/1024*box[2],b.height/1024*box[3])/occupancy;
  const cx=box[0]+(b.left+b.width/2)/1024*box[2],cy=box[1]+(b.top+b.height/2)/1024*box[3];
  const fitted=svg.replace(/(<svg\b[^>]*\bviewBox\s*=\s*)["'][^"']+["']/,'$1"'+[cx-side/2,cy-side/2,side,side].map(v=>v.toFixed(6)).join(' ')+'"');
  const highres=await sharp(Buffer.from(fitted)).resize(1024,1024).png().toBuffer(),png=await sharp(highres).resize(512,512).png().toBuffer(),webp=await sharp(png).webp({lossless:true,effort:6}).toBuffer();
  return {source,png,webp,highres,inspection:{png:await inspect(png,512,id,occupancy),webp:await inspect(webp,512,id,occupancy),highres:await inspect(highres,1024,id,occupancy)}};
}
async function archivedArtwork(asset,occupancy,id,base){
  const art={};
  for(const [key,field]of [['source','source'],['png','png'],['webp','image'],['highres','highres']]){
    art[key]=await readFile(path.join(base,asset[field]));
    if(hash(art[key])!==asset.sha256[field])throw Error(id+': archived asset changed');
  }
  validate(art.source.toString('utf8'),id);
  for(const [key,size]of [['png',512],['webp',512],['highres',1024]])await inspect(art[key],size,id,occupancy);
  return art;
}
for(const dir of ['assets/round26/original','assets/round26/proposal','assets/round26/highres','sources/round26','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round26/${id}-${group}.svg`,png:`assets/round26/${group}/${id}.png`,image:`assets/round26/${group}/${id}.webp`,highres:`assets/round26/highres/${id}-${group}.png`};
  const bytes={source:art.source,png:art.png,image:art.webp,highres:art.highres};
  for(const key of Object.keys(files))await writeFile(path.join(site,files[key]),bytes[key]);
  return {...files,sha256:Object.fromEntries(Object.entries(bytes).map(([k,b])=>[k,hash(b)]))};
}
async function verify(asset,id,base){
  for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': fixed artwork changed');
}
const previousFinalReviews=[...previous.previousFinalReviews,{chain:'fresh-mixer',reviewId:mixerFinal.reviewId,stem:'mixer-final',count:13}];
let fixedCount=0;
for(const entry of [...previousFinalReviews,{reviewId:'3106315e39b7',stem:'round2-final',count:14},{reviewId:'d978fdf8f32e',stem:'beast-final',count:10}]){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  if(final.reviewId!==entry.reviewId||final.samples.length!==entry.count)throw Error('Fixed inventory differs');
  for(const row of final.samples){await verify(row.proposal,row.code,site);await verify(row.proposal,row.code,archive);fixedCount++;}
}
if(fixedCount!==107)throw Error('Fixed material inventory count differs');
let retainedCount=0;
for(const chain of [materialBaseline.plannedMilkChain,materialBaseline.plannedExoticChain])for(const row of chain.slots){
  const a=row.artwork;
  for(const [file,digest]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error('Current milk or fruit artwork changed');
  retainedCount++;
}
if(retainedCount!==15)throw Error('Retained milk or fruit scope differs');
const sampleReviewId='437a9a667ee5',sampleBase=path.join(output,'checkpoints',sampleReviewId,'site');
const sampleReview=JSON.parse(await readFile(path.join(sampleBase,'samples.json'),'utf8'));
const legacyRecipes=sampleReview.samples.filter(r=>r.kind==='recipe');
if(legacyRecipes.length!==7)throw Error('Seven original recipe sample selections required');
const legacySelected=new Map();
for(const row of legacyRecipes){
  const asset={source:row.source,png:row.png,image:row.after,highres:row.highres,sha256:{source:row.sha256.source,png:row.sha256.png512,image:row.sha256.webp512,highres:row.sha256.highres}};
  await verify(asset,row.id,sampleBase);
  legacySelected.set(row.id,{reviewId:sampleReviewId,selection:row.selection,status:row.status,expectedOccupancy:.8,artwork:{source:`output/plan4-food-review/checkpoints/${sampleReviewId}/site/${asset.source}`,preview512:`output/plan4-food-review/checkpoints/${sampleReviewId}/site/${asset.image}`,png512:`output/plan4-food-review/checkpoints/${sampleReviewId}/site/${asset.png}`,highres:`output/plan4-food-review/checkpoints/${sampleReviewId}/site/${asset.highres}`,sha256:asset.sha256}});
}
if(legacyRecipes.some(r=>!recipes.some(c=>c.id===r.id)))throw Error('A recipe sample identity is absent from the catalog');
const recipeBaselineFile=path.join(output,'recipe-baseline.json');
let recipeBaseline;
try{recipeBaseline=JSON.parse(await readFile(recipeBaselineFile,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
if(!recipeBaseline){
  const items=[];
  for(const [i,entry]of recipes.entries()){
    const source=await readFile(path.join(root,entry.svg)),runtime=`public/assets/v3-b/${entry.id}.webp`,runtimeBytes=await readFile(path.join(root,runtime));
    const legacy=legacySelected.get(entry.id);
    items.push({id:entry.id,code:'DS'+String(i+1).padStart(2,'0'),name:entry.name,kind:'recipe',stage:entry.stage,group:entry.family||(entry.id.includes('-home-')?'home-kitchen':'starter-fresh'),ingredients:entry.ingredients||entry.inputNames||[],original:{source:entry.svg,sourceSha256:hash(source),runtime,runtimeSha256:hash(runtimeBytes),presentation:mapping[entry.id]},choice:legacy?'LEGACY_SAMPLE_SELECTED':'RETAIN_ORIGINAL_PENDING_REVIEW',userReview:legacy?'SELECTED_IN_24_ITEM_REVIEW':'NOT_YET_REVIEWED',...(legacy?{selectedArtwork:legacy}:{} )});
  }
  recipeBaseline={title:'Plan4 配方成品美术逐项基线',date:feedback.date,status:'RECIPE_ARTWORK_REVIEW_IN_PROGRESS',catalogSource:'artwork/v3-b/catalog.json',catalogSha256:hash(catalogBytes),contentSources:['src/content/catalog.ts','src/content/expansion-data.json'],counts:{total:123,legacySamplesSelected:7,notYetIndividuallyReviewed:116},groups:[...new Set(items.map(r=>r.group))].map(group=>({id:group,count:items.filter(r=>r.group===group).length})),sampleAcceptanceReviewId:sampleReviewId,authoringPolicy:feedback.authoringPolicy,items};
}
if(recipeBaseline.items.length!==123||recipeBaseline.items.some(r=>!recipes.some(c=>c.id===r.id&&c.name===r.name)))throw Error('Recipe baseline identities differ');
const rows=[],exportInspections={};
for(const [i,id]of feedback.orderedIds.entries()){
  const item=recipeBaseline.items.find(r=>r.id===id),catalogRow=recipes.find(r=>r.id===id),candidate=candidates.get(id),occupancy=feedback.occupancies[i];
  if(!item||item.group!==feedback.batchId||item.name!==feedback.orderedNames[i]||candidate?.name!==item.name||candidate.expectedOccupancy!==occupancy||legacySelected.has(id))throw Error('Starter recipe scope differs');
  if(!baseCatalog.toString('utf8').includes(feedback.recipeDescriptions[i]))throw Error('Recipe description differs from current base catalog');
  const source=await readFile(path.join(root,catalogRow.svg));
  if(hash(source)!==item.original.sourceSha256)throw Error('Original recipe master changed');
  const original=await save('original',id,await render(source,item.code+'-original',.8));
  const art=await render(Buffer.from(candidate.svg),item.code+'-new',occupancy),proposal=await save('proposal',id,art);
  if(proposal.sha256.source===original.sha256.source||proposal.sha256.image===original.sha256.image)throw Error('Each starter dish must have independently redesigned artwork');
  rows.push({index:i+1,code:item.code,id,name:item.name,oldName:item.name,nameChanged:false,kind:'recipe',batch:feedback.batchId,group:'开局鲜食',course:feedback.courses[i],stage:item.stage,level:1,ingredients:item.ingredients,recipeDescription:feedback.recipeDescriptions[i],status:'CANDIDATE',statusLabel:'全新料理设计 · 待你选择',displayLabel:'新版候选 · 待选择',selection:'candidate',artworkStatus:'RECIPE_CANDIDATE_PENDING',changeType:'redesign',expectedOccupancy:occupancy,priorExpectedOccupancy:.8,reason:candidate.reason,design:candidate.design,sourceLabel:'V4原版保持，本轮根据现有菜谱另绘成品候选',authoringSource:'artwork/plan4-food/round26/'+(i<3?'starter-savory.mjs':'starter-sweet.mjs'),original,proposal});
  exportInspections[item.code]=art.inspection;
}
if(rows.length!==6||recipeBaseline.items.filter(r=>r.group===feedback.batchId).length!==6)throw Error('Six-dish starter batch required');
if(new Set(rows.map(r=>r.proposal.sha256.source)).size!==6||new Set(rows.map(r=>r.proposal.sha256.image)).size!==6)throw Error('Duplicate starter artwork');
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12),counts={total:6,candidates:6,accepted:0};
async function contact(items,size,mode){
  const compare=mode==='proposals',cols=3,cw=compare?340:220,ch=compare?192:174,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const titles={proposals:'开局鲜食六道 / V4原版与新版料理对照',candidates:'开局鲜食六道 / 六张全新料理',starter:'本批六道料理 / 主料与盛器各有辨识'};
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${titles[mode]} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：V4原版；右：本轮新版，由你逐项决定采用':'清楚细深描边 · 开局低阶控制体量 · 按现有菜谱表现主料'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+118}" text-anchor="middle" font-size="10">${j?'新版候选':'V4原版'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+141}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    texts.push(`<text x="${x+cw/2}" y="${y+161}" text-anchor="middle" font-size="10" fill="#84745f">${xml('主料：'+row.ingredients.join('、'))}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round26-${mode}-${size}.png`;
  await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={proposals:[],candidates:[],starter:[]};for(const size of [40,96])for(const mode of Object.keys(contacts))contacts[mode].push(await contact(rows,size,mode));
if(hash(await readFile(path.join(root,'src/content/catalog.ts')))!==hash(baseCatalog)||hash(await readFile(path.join(root,'src/content/expansion-data.json')))!==hash(content))throw Error('Actual recipes changed during generation');
const checks={confirmedMixerSourceAndExportsByteIdentical:13,previousFixedMaterialSourceAndExportsByteIdentical:107,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,legacyRecipeSampleSelectionsPreserved:7,recipeBaselineTotal:123,newStarterRecipeArtworks:6,starterOriginalMastersUnchanged:6,recipeNamesAndIdsPreserved:6,recipeDescriptionsMatchCurrentBaseCatalog:true,actualGameContentUnchanged:true,actualContentSha256:hash(content),actualBaseCatalogSha256:hash(baseCatalog),actualRecipeChanges:0,actualGameNameChanges:0,transparentPadding:true,uniqueSources:6,uniqueRenders:6,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 开局鲜食六道',round:26,phase:'recipe-artwork',reviewId,status:'SIX_STARTER_RECIPE_CANDIDATES_PENDING_MIXER_CONFIRMED',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,counts,previousFinalReviews,confirmedMixerReviewId:mixerFinal.reviewId,recipeProgress:{total:123,legacySamplesSelected:7,currentCandidates:6,covered:13,notYetIndividuallyReviewed:110},contacts,checks,exportInspections,samples:rows};
await writeFile(path.join(site,'round26.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round26.html'),'utf8');if(!template.includes('/*__ROUND26_DATA__*/'))throw Error('Round26 template marker missing');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND26_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,key='proposal')=>({source:'output/plan4-food-review/site/'+r[key].source,preview512:'output/plan4-food-review/site/'+r[key].image,highres:'output/plan4-food-review/site/'+r[key].highres,sha256:r[key].sha256});
recipeBaseline.currentReview={round:26,reviewId,status:manifest.status,counts,batchId:feedback.batchId,manifest:'output/plan4-food-review/site/round26.json',url:'http://127.0.0.1:5284/',checks};
recipeBaseline.plannedStarterBatch={reviewId,status:'SIX_STARTER_RECIPE_CANDIDATES_PENDING',count:6,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:r.status,ingredients:r.ingredients,recipeDescription:r.recipeDescription,expectedOccupancy:r.expectedOccupancy,original:artRef(r,'original'),artwork:artRef(r)}))};
for(const row of rows){const item=recipeBaseline.items.find(r=>r.id===row.id);item.latestReview={reviewId,status:'CANDIDATE',artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={reviewId,status:'CANDIDATE',artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};}
recipeBaseline.counts={total:123,legacySamplesSelected:7,currentCandidates:6,reviewCovered:13,notYetIndividuallyReviewed:110};
await writeFile(recipeBaselineFile,JSON.stringify(recipeBaseline,null,2)+'\n');
await mkdir(path.join(root,'output/plan4-round26-work'),{recursive:true});await writeFile(path.join(root,'output/plan4-round26-work/checks.json'),JSON.stringify({reviewId,counts,recipeProgress:manifest.recipeProgress,checks,exportInspections,humanAcceptance:'PENDING_SIX_STARTER_RECIPE_ARTWORKS'},null,2)+'\n');
console.log(JSON.stringify({reviewId,status:manifest.status,counts,confirmedMixerReviewId:mixerFinal.reviewId,recipeProgress:manifest.recipeProgress,checks,url:'http://127.0.0.1:5284/'},null,2));

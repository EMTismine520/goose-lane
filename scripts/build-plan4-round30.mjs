import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { tsImport } from 'tsx/esm/api';
import { coldFrontCandidates } from '../artwork/plan4-food/round30/cold-front.mjs';
import { coldTailCandidates } from '../artwork/plan4-food/round30/cold-tail.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round30-feedback.json'),'utf8'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
const previous=JSON.parse(await readFile(path.join(archive,'round29.json'),'utf8'));
const starterFinal=JSON.parse(await readFile(path.join(site,'starter-final.json'),'utf8'));
const homeFinal=JSON.parse(await readFile(path.join(site,'home-final.json'),'utf8'));
if(homeFinal.reviewId!==feedback.confirmedHomeReviewId||homeFinal.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED'||homeFinal.samples.length!==10)throw Error('Confirmed home recipes required');
if(previous.reviewId!==feedback.sourceReviewId||starterFinal.reviewId!==feedback.confirmedStarterReviewId||starterFinal.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Starter confirmation must precede home recipe review');
const materialBaseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const recipeBaselineFile=path.join(output,'recipe-baseline.json'),recipeBaseline=JSON.parse(await readFile(recipeBaselineFile,'utf8'));
const baseCatalog=await readFile(path.join(root,'src/content/catalog.ts')),expansion=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(baseCatalog)!==feedback.actualBaseCatalogSha256||hash(expansion)!==feedback.actualExpansionSha256)throw Error('Actual recipe content changed');
const { RECIPES, ITEMS }=await tsImport('../src/content/catalog.ts',import.meta.url);
const candidates=new Map([...coldFrontCandidates,...coldTailCandidates].map(r=>[r.id,r]));
if(candidates.size!==5)throw Error('Five independent cold recipe candidates required');
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
for(const dir of ['assets/round30/original','assets/round30/proposal','assets/round30/highres','sources/round30','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round30/${id}-${group}.svg`,png:`assets/round30/${group}/${id}.png`,image:`assets/round30/${group}/${id}.webp`,highres:`assets/round30/highres/${id}-${group}.png`};
  const bytes={source:art.source,png:art.png,image:art.webp,highres:art.highres};
  for(const key of Object.keys(files))await writeFile(path.join(site,files[key]),bytes[key]);
  return {...files,sha256:Object.fromEntries(Object.entries(bytes).map(([k,b])=>[k,hash(b)]))};
}
async function verify(asset,id,bases=[site,archive]){
  for(const base of bases)for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': fixed artwork changed');
}
let fixedCount=0;
for(const entry of [...previous.previousFinalReviews,{reviewId:'3106315e39b7',stem:'round2-final',count:14},{reviewId:'d978fdf8f32e',stem:'beast-final',count:10}]){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  if(final.reviewId!==entry.reviewId||final.samples.length!==entry.count)throw Error('Fixed material inventory differs');
  for(const row of final.samples){await verify(row.proposal,row.code);fixedCount++;}
}
if(fixedCount!==107)throw Error('Fixed material scope differs');
for(const row of starterFinal.samples)await verify(row.proposal,row.code);
for(const row of homeFinal.samples)await verify(row.proposal,row.code);
if(starterFinal.samples.length!==6)throw Error('Six confirmed starter dishes required');
let retainedCount=0;
for(const chain of [materialBaseline.plannedMilkChain,materialBaseline.plannedExoticChain])for(const row of chain.slots){
  const a=row.artwork;
  for(const [file,digest]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error('Retained ingredient artwork changed');
  retainedCount++;
}
if(retainedCount!==15)throw Error('Retained milk or fruit scope differs');
const legacyItems=recipeBaseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW');
if(legacyItems.length!==6)throw Error('Six active prior recipe sample choices required; DS08 has been explicitly superseded');
const legacySnapshot=()=>JSON.stringify(legacyItems.map(r=>({id:r.id,choice:r.choice,userReview:r.userReview,selectedArtwork:r.selectedArtwork})));
const legacyBefore=legacySnapshot();
function legacyAsset(item){
  const a=item.selectedArtwork.artwork;
  return {source:a.source,png:a.png512||a.preview512.replace(/\.webp$/,'.png'),image:a.preview512,highres:a.highres,sha256:a.sha256};
}
for(const item of legacyItems)await verify(legacyAsset(item),item.id,[root]);
const homeItems=recipeBaseline.items.filter(r=>r.group===feedback.batchId);
if(homeItems.length!==5)throw Error('Cold recipe baseline scope differs');
const rows=[],exportInspections={};let preservedGardenSalad=false;
for(const [i,id]of feedback.orderedIds.entries()){
  const item=homeItems.find(r=>r.id===id),candidate=candidates.get(id),actual=RECIPES.find(r=>r.output===id),occupancy=feedback.occupancies[i];
  if(!item||candidate?.name!==item.name||item.name!==feedback.orderedNames[i]||candidate.expectedOccupancy!==occupancy||!actual?.description||JSON.stringify(actual.inputs.map(r=>ITEMS[r.item].name))!==JSON.stringify(item.ingredients))throw Error('Home recipe identity or ingredients differ');
  const source=await readFile(path.join(root,item.original.source));
  if(hash(source)!==item.original.sourceSha256)throw Error('Original home recipe master changed');
  const inherited=legacyItems.some(r=>r.id===id);
  let originalArt;
  if(inherited){
    if(id!=='dish-fresh-ico-0141'||item.selectedArtwork.selection!=='original')throw Error('Unexpected prior recipe selection');
    originalArt=await archivedArtwork(legacyAsset(item),.8,item.code,root);
    if(hash(originalArt.source)!==hash(source))throw Error('Previously selected garden-salad source differs');
    preservedGardenSalad=true;
  }else originalArt=await render(source,item.code+'-original',.8);
  const original=await save('original',id,originalArt);
  if(inherited&&JSON.stringify(original.sha256)!==JSON.stringify(legacyAsset(item).sha256))throw Error('Garden-salad selected source or export changed');
  const art=await render(Buffer.from(candidate.svg),item.code+'-new',occupancy),proposal=await save('proposal',id,art);
  if(original.sha256.source===proposal.sha256.source||original.sha256.image===proposal.sha256.image)throw Error('Every home dish needs independent new artwork');
  rows.push({index:i+1,code:item.code,id,name:item.name,oldName:item.name,nameChanged:false,kind:'recipe',batch:feedback.batchId,group:'砧板冷食',course:feedback.courses[i],stage:item.stage,level:1,ingredients:item.ingredients,recipeDescription:actual.description,recipeId:actual.id,durationSeconds:actual.duration/1000,status:'CANDIDATE',statusLabel:inherited?'原版已选 · 新稿另供选择':'全新料理设计 · 待你选择',displayLabel:'新版候选 · 待选择',selection:'candidate',artworkStatus:'COLD_RECIPE_CANDIDATE_PENDING',changeType:'redesign',expectedOccupancy:occupancy,priorExpectedOccupancy:.8,reason:candidate.reason,design:candidate.design,sourceLabel:inherited?'437既定原版源与全部导出精确保留；本轮新版另供选择':'V4原版保持，本轮根据现有菜谱另绘冷食成品候选',authoringSource:'artwork/plan4-food/round30/'+(i<3?'cold-front.mjs':'cold-tail.mjs'),...(inherited?{baselineAcceptedReviewId:'437a9a667ee5',baselineSelectionPreserved:true}:{}),original,proposal});
  exportInspections[item.code]=art.inspection;
}
if(rows.length!==5||!preservedGardenSalad)throw Error('Cold candidate batch incomplete');
if(new Set(rows.map(r=>r.proposal.sha256.source)).size!==5||new Set(rows.map(r=>r.proposal.sha256.image)).size!==5)throw Error('Duplicate home artwork');
const counts={total:5,candidates:5,accepted:0};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
async function contact(items,size,mode){
  const compare=mode==='proposals',cols=compare?3:5,cw=compare?300:200,ch=compare?192:174,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const titles={proposals:'砧板冷食五道 / 原版与新版成品对照',candidates:'砧板冷食五道 / 五张全新料理',home:'砧板冷食 / 卷、叶、壳与切面各有辨识'};
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${titles[mode]} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：原版；右：本轮新版，由你逐项决定采用':'清楚细深描边 · 成品按构图美观定尺寸 · 既定选用保持'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+118}" text-anchor="middle" font-size="10">${j?'新版候选':row.baselineAcceptedReviewId?'原版 · 已选用':'V4原版'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+141}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    texts.push(`<text x="${x+cw/2}" y="${y+161}" text-anchor="middle" font-size="10" fill="#84745f">${xml('主料：'+row.ingredients.join('、'))}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round30-${mode}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={proposals:[],candidates:[],home:[]};for(const size of [40,96])for(const mode of Object.keys(contacts))contacts[mode].push(await contact(rows,size,mode));
const coveredIds=new Set([...legacyItems.map(r=>r.id),...starterFinal.samples.map(r=>r.id),...homeFinal.samples.map(r=>r.id),...rows.map(r=>r.id)]);
if(coveredIds.size!==26)throw Error('Recipe coverage count differs');
const recipeProgress={total:123,legacySampleIdentities:7,activeLegacySelections:6,confirmedStarterRecipes:6,confirmedHomeRecipes:10,currentCandidates:5,currentLegacyOverlap:1,reviewCovered:26,notYetIndividuallyReviewed:97};
const checks={confirmedStarterSourcesAndExportsByteIdentical:6,confirmedHomeSourcesAndExportsByteIdentical:10,previousFixedMaterialSourcesAndExportsByteIdentical:107,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,legacyRecipeSampleSelectionsPreserved:6,originalGardenSaladSourceAndExportsByteIdentical:true,newColdRecipeArtworks:5,coldOriginalMastersUnchanged:5,recipeNamesAndIdsPreserved:5,recipeDescriptionsAndIngredientsMatchCurrentCatalog:true,actualExpansionContentUnchanged:true,actualExpansionSha256:hash(expansion),actualBaseCatalogUnchanged:true,actualBaseCatalogSha256:hash(baseCatalog),actualRecipeChangesThisRound:0,actualGameNameChanges:0,transparentPadding:true,uniqueSources:5,uniqueRenders:5,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 砧板冷食五道',round:30,phase:'recipe-artwork',reviewId,status:'FIVE_COLD_RECIPE_CANDIDATES_PENDING_HOME_CONFIRMED',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,counts,previousFinalReviews:previous.previousFinalReviews,previousRecipeFinalReviews:[{batch:'starter-fresh',reviewId:starterFinal.reviewId,stem:'starter-final',count:6},{batch:'home-kitchen',reviewId:homeFinal.reviewId,stem:'home-final',count:10}],confirmedStarterReviewId:starterFinal.reviewId,confirmedHomeReviewId:homeFinal.reviewId,recipeProgress,contacts,checks,exportInspections,samples:rows};
await writeFile(path.join(site,'round30.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round30.html'),'utf8');if(!template.includes('/*__ROUND30_DATA__*/'))throw Error('Round28 data marker missing');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND30_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,key='proposal')=>({source:'output/plan4-food-review/site/'+r[key].source,preview512:'output/plan4-food-review/site/'+r[key].image,highres:'output/plan4-food-review/site/'+r[key].highres,sha256:r[key].sha256});
recipeBaseline.currentReview={round:30,reviewId,status:manifest.status,counts,batchId:feedback.batchId,manifest:'output/plan4-food-review/site/round30.json',url:'http://127.0.0.1:5284/?round=30',checks};
recipeBaseline.plannedColdBatch={reviewId,status:'FIVE_COLD_RECIPE_CANDIDATES_PENDING',count:5,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:r.status,ingredients:r.ingredients,recipeDescription:r.recipeDescription,expectedOccupancy:r.expectedOccupancy,original:artRef(r,'original'),artwork:artRef(r),baselineAcceptedReviewId:r.baselineAcceptedReviewId}))};
for(const row of rows){const item=recipeBaseline.items.find(r=>r.id===row.id);item.latestReview={reviewId,status:'CANDIDATE',artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={reviewId,status:'CANDIDATE',artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};}
if(legacyBefore!==legacySnapshot())throw Error('Prior recipe sample selection changed');
recipeBaseline.counts={total:123,legacySampleIdentities:7,activeLegacySelections:6,confirmedStarterRecipes:6,confirmedHomeRecipes:10,currentCandidates:5,reviewCovered:26,notYetIndividuallyReviewed:97};
await writeFile(recipeBaselineFile,JSON.stringify(recipeBaseline,null,2)+'\n');
await mkdir(path.join(root,'output/plan4-round30-work'),{recursive:true});await writeFile(path.join(root,'output/plan4-round30-work/checks.json'),JSON.stringify({reviewId,counts,recipeProgress,checks,exportInspections,humanAcceptance:'PENDING_FIVE_COLD_RECIPE_ARTWORKS'},null,2)+'\n');
console.log(JSON.stringify({reviewId,status:manifest.status,counts,confirmedStarterReviewId:starterFinal.reviewId,confirmedHomeReviewId:homeFinal.reviewId,recipeProgress,checks,url:'http://127.0.0.1:5284/?round=30'},null,2));

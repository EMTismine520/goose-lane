import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {tsImport} from 'tsx/esm/api';
import {ovenVegetableCandidates} from '../artwork/plan4-food/round39/oven-vegetables.mjs';
import {ovenNewDishCandidates} from '../artwork/plan4-food/round39/oven-new-dishes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex'),json=async f=>JSON.parse(await readFile(f,'utf8')),saveJson=(f,v)=>writeFile(f,JSON.stringify(v,null,2)+'\n');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=await json(path.join(root,'artwork/plan4-food/round39-feedback.json')),archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
const previous=await json(path.join(archive,'round38.json')),selected=await json(path.join(site,'oven-selected.json'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==16||selected.reviewId!==feedback.selectedOvenReviewId||selected.counts.accepted!==11)throw Error('Oven selections differ');
const recipeBaselineFile=path.join(output,'recipe-baseline.json'),recipeBaseline=await json(recipeBaselineFile),materialBaseline=await json(path.join(output,'material-baseline.json'));
const baseCatalog=await readFile(path.join(root,'src/content/catalog.ts')),expansion=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(baseCatalog)!==feedback.actualBaseCatalogSha256||hash(expansion)!==feedback.actualExpansionSha256)throw Error('Actual content changed');
const {RECIPES,ITEMS}=await tsImport('../src/content/catalog.ts',import.meta.url),contract=await json(path.join(root,'artwork/plan4-food/content-contract.json'));
for(const t of contract.rawItems)if(ITEMS[t.id]?.name!==t.name)throw Error('Ingredient differs: '+t.id);
for(const t of contract.recipes){const a=RECIPES.find(r=>r.id===t.id);if(a?.name!==t.name||JSON.stringify(a.inputs)!==JSON.stringify(t.inputs))throw Error('Recipe differs: '+t.id);}
for(const a of JSON.parse(expansion).recipes)if(JSON.stringify(a.inputNames)!==JSON.stringify(a.inputs.map(r=>ITEMS[r.item].name)))throw Error('Input labels differ: '+a.id);
const candidates=new Map([...ovenVegetableCandidates,...ovenNewDishCandidates].map(r=>[r.id,r]));
if(candidates.size!==5||feedback.redesignIds.some(id=>!candidates.has(id)))throw Error('Five redesigns required');
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
  if(Math.abs((b.left+b.width/2)/size-.5)>.006||Math.abs((b.top+b.height/2)/size-.5)>.006)throw Error(id+': artwork is not centered');
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
for(const dir of ['assets/round39/proposal','assets/round39/highres','sources/round39','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(id,art){
 const files={source:`sources/round39/${id}-proposal.svg`,png:`assets/round39/proposal/${id}.png`,image:`assets/round39/proposal/${id}.webp`,highres:`assets/round39/highres/${id}-proposal.png`},bytes={source:art.source,png:art.png,image:art.webp,highres:art.highres};
 for(const key of Object.keys(files))await writeFile(path.join(site,files[key]),bytes[key]);
 return {...files,sha256:Object.fromEntries(Object.entries(bytes).map(([k,b])=>[k,hash(b)]))};
}
async function verify(asset,id,bases=[site,archive]){
  for(const base of bases)for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': fixed artwork changed');
}

let fixedMaterials=0;
for(const entry of [...previous.previousFinalReviews,{reviewId:'3106315e39b7',stem:'round2-final',count:14},{reviewId:'d978fdf8f32e',stem:'beast-final',count:10}]){
 const m=await json(path.join(site,entry.stem+'.json'));if(m.reviewId!==entry.reviewId||m.samples.length!==entry.count)throw Error('Material inventory differs');
 for(const row of m.samples){await verify(row.proposal,row.code);fixedMaterials++;}
}
if(fixedMaterials!==107)throw Error('Material scope differs');
let retainedMaterials=0;
for(const chain of [materialBaseline.plannedMilkChain,materialBaseline.plannedExoticChain])for(const row of chain.slots){const a=row.artwork;for(const [f,h]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,f)))!==h)throw Error('Retained material changed');retainedMaterials++;}
if(retainedMaterials!==15)throw Error('Milk or fruit scope differs');
let fixedRecipes=0;
for(const e of previous.previousRecipeFinalReviews){const m=await json(path.join(site,e.stem+'.json'));if(m.reviewId!==e.reviewId||m.samples.length!==e.count)throw Error('Recipe final differs');for(const r of m.samples){await verify(r.proposal,r.code);fixedRecipes++;}}
if(fixedRecipes!==62)throw Error('Recipe final scope differs: '+fixedRecipes);
const legacy=recipeBaseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW');
if(legacy.length!==1)throw Error('One active unrelated legacy choice required');
const legacySnapshot=JSON.stringify(legacy);
for(const r of legacy){const a=r.selectedArtwork.artwork;await verify({source:a.source,png:a.png512||a.preview512.replace(/\.webp$/,'.png'),image:a.preview512,highres:a.highres,sha256:a.sha256},r.id,[root]);}
const rows=[],exportInspections={};
for(const old of previous.samples){
 const adopted=selected.samples.find(r=>r.id===old.id),item=recipeBaseline.items.find(r=>r.id===old.id),actual=RECIPES.find(r=>r.output===old.id),candidate=candidates.get(old.id);
 if(!adopted||!item||!actual||JSON.stringify(adopted.proposal.sha256)!==JSON.stringify(old.proposal.sha256))throw Error('Adoption source differs');
 await verify(adopted.proposal,old.code);
 if(!candidate){if(actual.name!==old.name||JSON.stringify(actual.inputs.map(r=>ITEMS[r.item].name))!==JSON.stringify(old.ingredients))throw Error('Fixed recipe changed');rows.push({...adopted,status:'ACCEPTED',statusLabel:'第38轮新版 · 已确认',displayLabel:'已确认新版',comparisonLabel:'已确认新版',original:adopted.proposal,proposal:adopted.proposal});exportInspections[old.code]={copiedSourceAndExportsByteIdentical:true};continue;}
 if(actual.name!==candidate.name||candidate.expectedOccupancy!==.82)throw Error('Candidate identity differs');
 const art=await render(Buffer.from(candidate.svg),old.code,.82),proposal=await save(old.id,art),ingredients=actual.inputs.map(r=>ITEMS[r.item].name);
 if(proposal.sha256.source===old.proposal.sha256.source||proposal.sha256.image===old.proposal.sha256.image)throw Error('New artwork required');
 rows.push({...adopted,name:actual.name,oldName:old.name,previousRecipeName:old.name,nameChanged:actual.name!==old.name,ingredients,inputIds:actual.inputs.map(r=>r.item),recipeDescription:actual.description,durationSeconds:actual.duration/1000,minDeviceLevel:actual.minDeviceLevel,stage:actual.stage,course:['DS65','DS71','DS73'].includes(old.code)?'veg':old.code==='DS76'?'meat':'bread',status:'CANDIDATE',statusLabel:old.code==='DS65'?'薯角形态重做 · 待确认':'重复品类已替换 · 新稿待确认',displayLabel:'第39轮新稿 · 待确认',selection:'candidate',userAcceptedNewArtwork:false,selectedBaseArtworkAccepted:true,artworkStatus:'DISTINCT_OVEN_REDESIGN_PENDING',artworkSelection:'round39-candidate',baseArtworkSelection:'round38-new',changeType:old.code==='DS65'?'shape-redesign':'recipe-replacement',expectedOccupancy:.82,priorExpectedOccupancy:old.expectedOccupancy,comparisonLabel:old.code==='DS65'?'旧烤土豆片 · 形态重做参考':'旧'+old.name+' · 已替换',comparisonSource:{kind:'USER_ACCEPTED_PRE_CHANGE_ARTWORK',reviewId:previous.reviewId,name:old.name,ingredients:old.ingredients,sha256:old.proposal.sha256},reason:candidate.reason,design:candidate.design,sourceLabel:'左侧为第38轮已选的变更前美术，仅作历史对照；右侧为当前实际菜品的新稿，待你确认。实际名称、输入、描述、售价与订单奖励已同步，原编号、烤箱等级、解锁阶段和制作时间保持。',authoringSource:'artwork/plan4-food/round39/'+(['DS76','DS78'].includes(old.code)?'oven-new-dishes.mjs':'oven-vegetables.mjs'),approvedPreviousArtwork:adopted.proposal,original:adopted.proposal,proposal});
 exportInspections[old.code]=art.inspection;
}
const pending=rows.filter(r=>r.status==='CANDIDATE');
if(rows.length!==16||pending.length!==5||pending.map(r=>r.code).join(',')!==feedback.redesignCodes.join(','))throw Error('Round39 scope differs');
if(new Set(rows.map(r=>r.proposal.sha256.source)).size!==16||new Set(rows.map(r=>r.proposal.sha256.image)).size!==16)throw Error('Duplicate artwork');
const counts={total:16,accepted:11,candidates:5,shapeRedesigns:1,replacedRecipes:4};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
async function contact(size,compare){
 const cols=compare?2:5,cw=compare?350:210,ch=compare?196:178,width=cols*cw,height=56+Math.ceil(pending.length/cols)*ch,layers=[];
 const texts=[`<text x="20" y="27" font-size="16" font-weight="700">${compare?'五道烤箱料理 / 去重重做对照':'五道烤箱料理 / 第39轮新稿'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：变更前已选稿，仅作历史参考；右：当前菜品新稿，待你确认':'热狗、汉堡、贝果各留一款 · 细描边 · 鲜活熟色 · 克制份量'}</text>`];
 for(const [i,row]of pending.entries()){
  const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
  for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
   const cx=compare?x+cw*(j+.5)/2:x+cw/2;
   layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
   if(compare)texts.push(`<text x="${cx}" y="${y+120}" text-anchor="middle" font-size="9">${xml(j?'新稿 · 待确认':row.comparisonLabel)}</text>`);
  }
  texts.push(`<text x="${x+cw/2}" y="${y+145}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
  texts.push(`<text x="${x+cw/2}" y="${y+164}" text-anchor="middle" font-size="10" fill="#84745f">${xml('主料：'+row.ingredients.join('、'))}</text>`);
 }
 layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
 const filename=`contacts/round39-${compare?'redesign':'candidates'}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={redesign:[],candidates:[]};for(const size of [40,96]){contacts.redesign.push(await contact(size,true));contacts.candidates.push(await contact(size,false));}
const recipeProgress={...previous.recipeProgress,activeLegacySelections:1,confirmedOvenRecipes:11,currentOvenCandidates:5,currentCandidates:5,currentAccepted:11,currentLegacyOverlap:0,fullyConfirmedRecipeArtworks:73,reviewCovered:79,notYetIndividuallyReviewed:44};
const checks={earlierConfirmedRecipeSourcesAndExportsByteIdentical:62,fixedCurrentArtworksByteIdentical:11,approvedPreChangeOvenArtworksPreserved:16,previousFixedMaterialSourcesAndExportsByteIdentical:107,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,unrelatedLegacySelectionsPreserved:1,newDistinctOvenArtworks:5,recipeDescriptionsAndIngredientsMatchCurrentCatalog:true,actualExpansionSha256:hash(expansion),actualBaseCatalogSha256:hash(baseCatalog),actualRecipeInputChangesThisRound:4,actualGameNameChanges:5,retainedSingleTypes:{hotdog:'DS69',burger:'DS74',bagel:'DS68'},transparentPadding:true,uniqueNewSources:5,uniqueNewRenders:5,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={...previous,title:'鹅巷食光 · 烤箱去重重做',round:39,reviewId,status:'ELEVEN_OVEN_ARTWORKS_CONFIRMED_FIVE_DISTINCT_REDESIGNS_PENDING',sourceReviewId:previous.reviewId,selectedOvenReviewId:selected.reviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,counts,recipeProgress,contacts,checks,exportInspections,samples:rows};
await saveJson(path.join(site,'round39.json'),manifest);await saveJson(path.join(site,'samples.json'),manifest);
const template=await readFile(path.join(root,'scripts/build-plan4-round39.html'),'utf8');if(!template.includes('/*__ROUND39_DATA__*/'))throw Error('Data marker missing');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND39_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,key='proposal')=>({source:'output/plan4-food-review/site/'+r[key].source,png512:'output/plan4-food-review/site/'+r[key].png,preview512:'output/plan4-food-review/site/'+r[key].image,highres:'output/plan4-food-review/site/'+r[key].highres,sha256:r[key].sha256});
recipeBaseline.currentReview={round:39,reviewId,status:manifest.status,counts,batchId:'oven',manifest:'output/plan4-food-review/site/round39.json',url:'http://127.0.0.1:5284/?round=39',checks};
recipeBaseline.plannedOvenBatch={...recipeBaseline.plannedOvenBatch,reviewId,status:manifest.status,counts,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:r.status,ingredients:r.ingredients,recipeDescription:r.recipeDescription,expectedOccupancy:r.expectedOccupancy,original:artRef(r,'original'),artwork:artRef(r)}))};
for(const row of rows){const item=recipeBaseline.items.find(r=>r.id===row.id);item.name=row.name;item.ingredients=row.ingredients;item.inputIds=row.inputIds;item.latestReview={reviewId,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={...item.latestReview};if(row.status==='CANDIDATE'){delete item.selectedArtwork;item.previousRecipeName=row.oldName;item.semanticRevision={round:39,reviewId,previousName:row.oldName,name:row.name,inputs:RECIPES.find(r=>r.output===row.id).inputs,recipeDescription:row.recipeDescription,kind:row.changeType};item.userReview='CURRENT_REDESIGN_PENDING';item.choice='CURRENT_REDESIGN_PENDING';}}
if(legacySnapshot!==JSON.stringify(legacy))throw Error('Unrelated legacy changed');
recipeBaseline.counts={...recipeBaseline.counts,...recipeProgress};await saveJson(recipeBaselineFile,recipeBaseline);
await saveJson(path.join(root,'output/plan4-round39-work/checks.json'),{reviewId,counts,recipeProgress,checks,exportInspections,humanAcceptance:'PENDING_DS65_DS71_DS73_DS76_DS78'});
console.log(JSON.stringify({reviewId,counts,recipeProgress,url:'http://127.0.0.1:5284/?round=39'},null,2));

import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {tsImport} from 'tsx/esm/api';
import {steamerFrontCandidates} from '../artwork/plan4-food/round40/steamer-front.mjs';
import {steamerMiddleCandidates} from '../artwork/plan4-food/round40/steamer-middle.mjs';
import {steamerTailCandidates} from '../artwork/plan4-food/round40/steamer-tail.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex'),json=async f=>JSON.parse(await readFile(f,'utf8')),saveJson=(f,v)=>writeFile(f,JSON.stringify(v,null,2)+'\n');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=await json(path.join(root,'artwork/plan4-food/round40-feedback.json')),archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site'),previous=await json(path.join(archive,'round39.json'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==16)throw Error('Frozen round39 differs');
const ovenFinal=await json(path.join(site,'oven-final.json'));
if(ovenFinal.reviewId!==feedback.confirmedOvenReviewId||ovenFinal.samples.length!==16||ovenFinal.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Oven acceptance required');
const recipeBaselineFile=path.join(output,'recipe-baseline.json'),recipeBaseline=await json(recipeBaselineFile),materialBaseline=await json(path.join(output,'material-baseline.json'));
const baseCatalog=await readFile(path.join(root,'src/content/catalog.ts')),expansion=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(baseCatalog)!==feedback.actualBaseCatalogSha256||hash(expansion)!==feedback.actualExpansionSha256)throw Error('Actual content changed');
const {RECIPES,ITEMS}=await tsImport('../src/content/catalog.ts',import.meta.url),contract=await json(path.join(root,'artwork/plan4-food/content-contract.json'));
for(const t of contract.rawItems)if(ITEMS[t.id]?.name!==t.name)throw Error('Ingredient differs: '+t.id);
for(const t of contract.recipes){const a=RECIPES.find(r=>r.id===t.id);if(a?.name!==t.name||JSON.stringify(a.inputs)!==JSON.stringify(t.inputs))throw Error('Recipe differs: '+t.id);}
for(const a of JSON.parse(expansion).recipes)if(JSON.stringify(a.inputNames)!==JSON.stringify(a.inputs.map(r=>ITEMS[r.item].name)))throw Error('Input labels differ: '+a.id);
const candidates=new Map([...steamerFrontCandidates,...steamerMiddleCandidates,...steamerTailCandidates].map(r=>[r.id,r]));
if(candidates.size!==12||feedback.orderedIds.some(id=>!candidates.has(id)))throw Error('Twelve independent candidates required');
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
for(const dir of ['assets/round40/proposal','assets/round40/original','assets/round40/historical','assets/round40/highres','sources/round40','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(id,art,variant='proposal'){
 const files={source:`sources/round40/${id}-${variant}.svg`,png:`assets/round40/${variant}/${id}.png`,image:`assets/round40/${variant}/${id}.webp`,highres:`assets/round40/highres/${id}-${variant}.png`},bytes={source:art.source,png:art.png,image:art.webp,highres:art.highres};
 for(const key of Object.keys(files))await writeFile(path.join(site,files[key]),bytes[key]);
 return {...files,sha256:Object.fromEntries(Object.entries(bytes).map(([k,b])=>[k,hash(b)]))};
}
async function verify(asset,id,bases=[site,archive]){
  for(const base of bases)for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': fixed artwork changed');
}


let fixedMaterials=0;
for(const e of [...previous.previousFinalReviews,{reviewId:'3106315e39b7',stem:'round2-final',count:14},{reviewId:'d978fdf8f32e',stem:'beast-final',count:10}]){const m=await json(path.join(site,e.stem+'.json'));if(m.reviewId!==e.reviewId||m.samples.length!==e.count)throw Error('Material inventory differs');for(const r of m.samples){await verify(r.proposal,r.code);fixedMaterials++;}}
if(fixedMaterials!==107)throw Error('Material scope differs');
let retainedMaterials=0;
for(const chain of [materialBaseline.plannedMilkChain,materialBaseline.plannedExoticChain])for(const row of chain.slots){const a=row.artwork;for(const [f,h]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,f)))!==h)throw Error('Retained material changed');retainedMaterials++;}
if(retainedMaterials!==15)throw Error('Milk or fruit scope differs');
const previousRecipeFinalReviews=[...previous.previousRecipeFinalReviews,{batch:'oven',reviewId:ovenFinal.reviewId,stem:'oven-final',count:16}];
let fixedRecipes=0;
for(const e of previousRecipeFinalReviews){const m=await json(path.join(site,e.stem+'.json'));if(m.reviewId!==e.reviewId||m.samples.length!==e.count)throw Error('Recipe final differs');for(const r of m.samples){await verify(r.proposal,r.code);fixedRecipes++;}}
if(fixedRecipes!==78)throw Error('Recipe final scope differs');
const legacy=recipeBaseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW');if(legacy.length!==1)throw Error('One active unrelated legacy choice required');const legacySnapshot=JSON.stringify(legacy);
for(const r of legacy){const a=r.selectedArtwork.artwork;await verify({source:a.source,png:a.png512||a.preview512.replace(/\.webp$/,'.png'),image:a.preview512,highres:a.highres,sha256:a.sha256},r.id,[root]);}
const batchItems=recipeBaseline.items.filter(r=>r.group==='steamer');if(batchItems.length!==12)throw Error('Steamer recipe scope differs');
const rows=[],exportInspections={};let semanticComparisons=0,replacements=0;
for(const [i,id]of feedback.orderedIds.entries()){
 const item=batchItems.find(r=>r.id===id),candidate=candidates.get(id),actual=RECIPES.find(r=>r.output===id),occupancy=feedback.occupancies[i],replacement=feedback.replacedCodes.includes(item?.code),target=contract.recipes.find(r=>r.output===id);
 if(!item||candidate.name!==actual?.name||candidate.name!==feedback.orderedNames[i]||candidate.expectedOccupancy!==occupancy)throw Error('New recipe identity or size differs');
 const originalName=replacement?target.previousName:item.name,oldIngredients=replacement?target.previousInputNames:item.ingredients;
 if(!replacement&&(actual.name!==item.name||JSON.stringify(actual.inputs.map(r=>ITEMS[r.item].name))!==JSON.stringify(item.ingredients)))throw Error('Retained recipe identity differs');
 const v4Source=await readFile(path.join(root,item.original.source));if(hash(v4Source)!==item.original.sourceSha256)throw Error('Immutable V4 original changed');
 const semantic=feedback.currentSemanticComparisons.find(r=>r.id===id);let originalArt,v4Original,comparisonLabel,comparisonSource;
 if(semantic){const source=await readFile(path.join(root,semantic.source));if(hash(source)!==semantic.sourceSha256||!source.toString('utf8').includes('<title>'+actual.name+' ·'))throw Error('Current semantic comparison differs');originalArt=await render(source,item.code+'-current',.8);v4Original=await save(id,await render(v4Source,item.code+'-history',.8),'historical');comparisonLabel='现用美术 · 配方同步版';comparisonSource={kind:'CURRENT_SEMANTIC_BASELINE',source:semantic.source,sourceSha256:semantic.sourceSha256,semanticRevisionReviewId:item.semanticRevision.reviewId,name:actual.name};semanticComparisons++;}
 else{originalArt=await render(v4Source,item.code+'-original',.8);comparisonLabel=replacement?'旧'+originalName+' · 已替换':'V4原版';comparisonSource={kind:replacement?'SUPERSEDED_RECIPE_HISTORY':'V4_ORIGINAL',source:item.original.source,sourceSha256:item.original.sourceSha256,name:originalName,ingredients:oldIngredients};}
 const original=await save(id,originalArt,'original');v4Original??=original;
 const art=await render(Buffer.from(candidate.svg),item.code+'-new',occupancy),proposal=await save(id,art);
 if(original.sha256.source===proposal.sha256.source||original.sha256.image===proposal.sha256.image)throw Error('Independent steamer artwork required');
 const ingredients=actual.inputs.map(r=>ITEMS[r.item].name);
 rows.push({index:i+1,code:item.code,id,name:actual.name,oldName:originalName,nameChanged:replacement,previousRecipeName:replacement?originalName:item.previousRecipeName,kind:'recipe',batch:'steamer',group:'蒸笼',course:feedback.courses[i],stage:actual.stage,minDeviceLevel:actual.minDeviceLevel,ingredients,inputIds:actual.inputs.map(r=>r.item),recipeDescription:actual.description,recipeId:actual.id,durationSeconds:actual.duration/1000,status:'CANDIDATE',statusLabel:replacement?'重复肠粉已替换 · 新稿待选择':'全新蒸笼料理 · 待你选择',displayLabel:'第40轮新版候选 · 待选择',selection:'candidate',userAcceptedNewArtwork:false,artworkStatus:'STEAMER_RECIPE_CANDIDATE_PENDING',changeType:replacement?'recipe-replacement':'redesign',expectedOccupancy:occupancy,priorExpectedOccupancy:.8,comparisonLabel,comparisonSource,reason:candidate.reason,design:candidate.design,sourceLabel:replacement?'左侧为修改前的旧肠粉，仅留历史参考；右侧按当前新菜与真实输入重绘，名称、配方、售价与订单已同步，新稿仍由你选择。':semantic?'左侧为第31轮按当前火鸡食材同步的现用美术，旧原版只留历史参考；右侧为本轮独立新版，实际配方保持。':'V4原版完整保留，右侧按当前真实配方独立绘制新版，由你逐项决定采用。',authoringSource:'artwork/plan4-food/round40/'+(i<4?'steamer-front.mjs':i<8?'steamer-middle.mjs':'steamer-tail.mjs'),...(semantic?{semanticComparisonPreserved:true}:{}),v4Original,original,proposal});
 if(replacement)replacements++;exportInspections[item.code]=art.inspection;
}
if(rows.length!==12||replacements!==2||semanticComparisons!==1||new Set(rows.map(r=>r.proposal.sha256.source)).size!==12||new Set(rows.map(r=>r.proposal.sha256.image)).size!==12)throw Error('Steamer artwork scope differs');
const counts={total:12,candidates:12,accepted:0,replacedRecipes:2,currentSemanticComparisons:1};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
async function contact(size,compare){
 const cols=compare?2:6,cw=compare?350:180,ch=compare?196:178,width=cols*cw,height=56+Math.ceil(rows.length/cols)*ch,layers=[];
 const texts=[`<text x="20" y="27" font-size="16" font-weight="700">${compare?'蒸笼十二道 / 现用与新稿对照':'蒸笼十二道 / 第40轮新版候选'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：现用或旧菜历史参考；右：当前菜品新版候选，逐项由你选择':'细深描边 · 透明虾皮、滑粉、流沙与嫩海鲜 · 克制份量 · 不提前采用'}</text>`];
 for(const [i,row]of rows.entries()){
  const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
  for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
   const cx=compare?x+cw*(j+.5)/2:x+cw/2;
   layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
   if(compare)texts.push(`<text x="${cx}" y="${y+120}" text-anchor="middle" font-size="9">${xml(j?'本轮新版 · 待选择':row.comparisonLabel)}</text>`);
  }
  texts.push(`<text x="${x+cw/2}" y="${y+145}" text-anchor="middle" font-size="11">${xml(row.code+' · '+row.name)}</text>`);
  texts.push(`<text x="${x+cw/2}" y="${y+164}" text-anchor="middle" font-size="9" fill="#84745f">${xml('主料：'+row.ingredients.join('、'))}</text>`);
 }
 layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
 const filename=`contacts/round40-${compare?'comparisons':'candidates'}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={comparisons:[],candidates:[]};for(const size of [40,96]){contacts.comparisons.push(await contact(size,true));contacts.candidates.push(await contact(size,false));}
const recipeProgress={...previous.recipeProgress,confirmedOvenRecipes:16,fullyConfirmedRecipeArtworks:78,currentOvenCandidates:0,currentSteamerCandidates:12,currentCandidates:12,currentAccepted:0,activeLegacySelections:1,reviewCovered:91,notYetIndividuallyReviewed:32};
const checks={earlierConfirmedRecipeSourcesAndExportsByteIdentical:78,confirmedOvenRound39ArtworksByteIdentical:5,confirmedOvenRound38ArtworksByteIdentical:11,immutableSteamerV4SourcesUnchanged:12,currentSemanticComparisonMastersPreserved:1,previousFixedMaterialSourcesAndExportsByteIdentical:107,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,unrelatedLegacySelectionsPreserved:1,newSteamerArtworks:12,recipeDescriptionsAndIngredientsMatchCurrentCatalog:true,actualExpansionSha256:hash(expansion),actualBaseCatalogSha256:hash(baseCatalog),actualRecipeInputChangesThisRound:2,actualGameNameChanges:2,singleRiceRoll:'DS80',transparentPadding:true,uniqueNewSources:12,uniqueNewRenders:12,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={...previous,title:'鹅巷食光 · 蒸笼十二道',round:40,reviewId,status:'TWELVE_STEAMER_RECIPE_CANDIDATES_PENDING_OVEN_CONFIRMED',sourceReviewId:previous.reviewId,confirmedOvenReviewId:ovenFinal.reviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,counts,previousRecipeFinalReviews,recipeProgress,contacts,checks,exportInspections,samples:rows};
delete manifest.selectedOvenReviewId;
await saveJson(path.join(site,'round40.json'),manifest);await saveJson(path.join(site,'samples.json'),manifest);
const template=await readFile(path.join(root,'scripts/build-plan4-round40.html'),'utf8');if(!template.includes('/*__ROUND40_DATA__*/'))throw Error('Data marker missing');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND40_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,key='proposal')=>({source:'output/plan4-food-review/site/'+r[key].source,png512:'output/plan4-food-review/site/'+r[key].png,preview512:'output/plan4-food-review/site/'+r[key].image,highres:'output/plan4-food-review/site/'+r[key].highres,sha256:r[key].sha256});
recipeBaseline.currentReview={round:40,reviewId,status:manifest.status,counts,batchId:'steamer',manifest:'output/plan4-food-review/site/round40.json',url:'http://127.0.0.1:5284/?round=40',checks};
recipeBaseline.plannedSteamerBatch={reviewId,status:manifest.status,counts,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:r.status,ingredients:r.ingredients,recipeDescription:r.recipeDescription,expectedOccupancy:r.expectedOccupancy,original:artRef(r,'original'),comparisonSource:r.comparisonSource,artwork:artRef(r)}))};
for(const row of rows){const item=recipeBaseline.items.find(r=>r.id===row.id);item.name=row.name;item.ingredients=row.ingredients;item.inputIds=row.inputIds;item.latestReview={reviewId,status:'CANDIDATE',artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={...item.latestReview};if(row.nameChanged){item.previousRecipeName=row.oldName;item.semanticRevision={round:40,reviewId,previousName:row.oldName,name:row.name,inputs:RECIPES.find(r=>r.output===row.id).inputs,recipeDescription:row.recipeDescription,kind:'recipe-replacement'};}}
if(legacySnapshot!==JSON.stringify(legacy))throw Error('Unrelated legacy changed');recipeBaseline.counts={...recipeBaseline.counts,...recipeProgress};await saveJson(recipeBaselineFile,recipeBaseline);
await saveJson(path.join(root,'output/plan4-round40-work/checks.json'),{reviewId,counts,recipeProgress,checks,exportInspections,humanAcceptance:'PENDING_DS79_TO_DS90_STEAMER_ARTWORKS'});
console.log(JSON.stringify({reviewId,counts,recipeProgress,url:'http://127.0.0.1:5284/?round=40'},null,2));

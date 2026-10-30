import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {tsImport} from 'tsx/esm/api';
import {ovenFrontCandidates} from '../artwork/plan4-food/round38/oven-front.mjs';
import {ovenMiddleCandidates} from '../artwork/plan4-food/round38/oven-middle.mjs';
import {ovenTailCandidates} from '../artwork/plan4-food/round38/oven-tail.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex'),json=async f=>JSON.parse(await readFile(f,'utf8')),saveJson=(f,v)=>writeFile(f,JSON.stringify(v,null,2)+'\n');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=await json(path.join(root,'artwork/plan4-food/round38-feedback.json')),archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site'),previous=await json(path.join(archive,'round37.json'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==27)throw Error('Round37 source differs');
const starterFinal=await json(path.join(site,'starter-final.json')),homeFinal=await json(path.join(site,'home-final.json')),coldFinal=await json(path.join(site,'cold-final.json')),drinkFinal=await json(path.join(site,'drinks-final.json')),potFinal=await json(path.join(site,'pot-final.json')),fryingFinal=await json(path.join(site,'frying-final.json')),grillFinal=await json(path.join(site,'grill-final.json'));
for(const [record,key,count]of [[starterFinal,'confirmedStarterReviewId',6],[homeFinal,'confirmedHomeReviewId',10],[coldFinal,'confirmedColdReviewId',5],[drinkFinal,'confirmedDrinkReviewId',10],[potFinal,'confirmedPotReviewId',4],[fryingFinal,'confirmedFryingReviewId',10],[grillFinal,'confirmedGrillReviewId',17]])if(record.reviewId!==feedback[key]||record.samples.length!==count||record.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Confirmed recipe inventory differs');
if(grillFinal.sourceReviewId!==feedback.sourceReviewId)throw Error('Grill refinements must be confirmed before oven review');
const materialBaseline=await json(path.join(output,'material-baseline.json')),recipeBaselineFile=path.join(output,'recipe-baseline.json'),recipeBaseline=await json(recipeBaselineFile);
const baseCatalog=await readFile(path.join(root,'src/content/catalog.ts')),expansion=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(baseCatalog)!==feedback.actualBaseCatalogSha256||hash(expansion)!==feedback.actualExpansionSha256)throw Error('Actual content changed');
const {RECIPES,ITEMS}=await tsImport('../src/content/catalog.ts',import.meta.url),contract=await json(path.join(root,'artwork/plan4-food/content-contract.json'));
for(const target of contract.rawItems)if(ITEMS[target.id]?.name!==target.name)throw Error('Ingredient identity differs: '+target.id);
for(const target of contract.recipes){const actual=RECIPES.find(r=>r.id===target.id);if(actual?.name!==target.name||JSON.stringify(actual.inputs)!==JSON.stringify(target.inputs))throw Error('Recipe identity differs: '+target.id);}
for(const actual of JSON.parse(expansion.toString('utf8')).recipes)if(JSON.stringify(actual.inputNames)!==JSON.stringify(actual.inputs.map(r=>ITEMS[r.item].name)))throw Error('Input labels differ: '+actual.id);
const candidates=new Map([...ovenFrontCandidates,...ovenMiddleCandidates,...ovenTailCandidates].map(r=>[r.id,r]));if(candidates.size!==16)throw Error('Sixteen independent oven artworks required');
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
for(const dir of ['assets/round38/original','assets/round38/proposal','assets/round38/historical','assets/round38/highres','sources/round38','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round38/${id}-${group}.svg`,png:`assets/round38/${group}/${id}.png`,image:`assets/round38/${group}/${id}.webp`,highres:`assets/round38/highres/${id}-${group}.png`};
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
for(const row of coldFinal.samples)await verify(row.proposal,row.code);
for(const row of drinkFinal.samples)await verify(row.proposal,row.code);
for(const row of potFinal.samples)await verify(row.proposal,row.code);
for(const row of fryingFinal.samples)await verify(row.proposal,row.code);
for(const row of grillFinal.samples)await verify(row.proposal,row.code);
if(starterFinal.samples.length!==6)throw Error('Six confirmed starter dishes required');
let retainedCount=0;
for(const chain of [materialBaseline.plannedMilkChain,materialBaseline.plannedExoticChain])for(const row of chain.slots){
  const a=row.artwork;
  for(const [file,digest]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error('Retained ingredient artwork changed');
  retainedCount++;
}
if(retainedCount!==15)throw Error('Retained milk or fruit scope differs');
const legacyItems=recipeBaseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW');
if(legacyItems.length!==2)throw Error('Two active legacy recipe selections required');
const legacySnapshot=()=>JSON.stringify(legacyItems.map(r=>({id:r.id,choice:r.choice,userReview:r.userReview,selectedArtwork:r.selectedArtwork})));
const legacyBefore=legacySnapshot();
function legacyAsset(item){
  const a=item.selectedArtwork.artwork;
  return {source:a.source,png:a.png512||a.preview512.replace(/\.webp$/,'.png'),image:a.preview512,highres:a.highres,sha256:a.sha256};
}
for(const item of legacyItems)await verify(legacyAsset(item),item.id,[root]);
const batchItems=recipeBaseline.items.filter(r=>r.group===feedback.batchId);
if(batchItems.length!==16||feedback.currentSemanticComparisons.length!==1)throw Error('Oven recipe scope differs');
const rows=[],exportInspections={};let inheritedCount=0,semanticComparisonCount=0;
for(const [i,id]of feedback.orderedIds.entries()){
 const item=batchItems.find(r=>r.id===id),candidate=candidates.get(id),actual=RECIPES.find(r=>r.output===id),occupancy=feedback.occupancies[i];
 if(!item||candidate?.name!==item.name||item.name!==feedback.orderedNames[i]||candidate.expectedOccupancy!==occupancy||actual?.name!==item.name||JSON.stringify(actual.inputs.map(r=>ITEMS[r.item].name))!==JSON.stringify(item.ingredients))throw Error('Oven identity or ingredients differ');
 const v4Source=await readFile(path.join(root,item.original.source));if(hash(v4Source)!==item.original.sourceSha256)throw Error('Immutable V4 original changed');
 const inherited=legacyItems.some(r=>r.id===id),semantic=feedback.currentSemanticComparisons.find(r=>r.id===id);
 let originalArt,v4Original,comparisonLabel,comparisonSource;
 if(inherited){
  if(item.code!=='DS66'||item.selectedArtwork.reviewId!=='437a9a667ee5'||item.selectedArtwork.selection!=='original')throw Error('Unexpected oven legacy choice');
  originalArt=await archivedArtwork(legacyAsset(item),.8,item.code,root);if(hash(originalArt.source)!==hash(v4Source))throw Error('DS66 selected original differs from V4');
  inheritedCount++;comparisonLabel='此前原版 · 已选用';comparisonSource={kind:'USER_ACCEPTED_LEGACY',reviewId:'437a9a667ee5',variant:'original',sha256:legacyAsset(item).sha256};
 }else if(semantic){
  const source=await readFile(path.join(root,semantic.source));if(hash(source)!==semantic.sourceSha256||!source.toString('utf8').includes('<title>'+actual.name+' ·'))throw Error('Current semantic comparison differs');
  originalArt=await render(source,item.code+'-current-semantic',.8);semanticComparisonCount++;
  v4Original=await save('historical',id,await render(v4Source,item.code+'-v4-history',.8));comparisonLabel='现用美术 · 配方同步版';comparisonSource={kind:'CURRENT_SEMANTIC_BASELINE',source:semantic.source,sourceSha256:semantic.sourceSha256,semanticRevisionReviewId:item.semanticRevision.reviewId,name:actual.name};
 }else{
  originalArt=await render(v4Source,item.code+'-original',.8);comparisonLabel='V4原版';comparisonSource={kind:'V4_ORIGINAL',source:item.original.source,sourceSha256:item.original.sourceSha256};
 }
 const original=await save('original',id,originalArt);v4Original??=original;
 if(inherited&&JSON.stringify(original.sha256)!==JSON.stringify(legacyAsset(item).sha256))throw Error('DS66 selected source or export changed');
 const art=await render(Buffer.from(candidate.svg),item.code+'-new',occupancy),proposal=await save('proposal',id,art);
 if(original.sha256.source===proposal.sha256.source||original.sha256.image===proposal.sha256.image)throw Error('Independent oven artwork required');
 rows.push({index:i+1,code:item.code,id,name:item.name,oldName:item.name,nameChanged:false,previousRecipeName:item.previousRecipeName,kind:'recipe',batch:feedback.batchId,group:'烤箱',course:feedback.courses[i],stage:item.stage,level:1,ingredients:item.ingredients,inputIds:actual.inputs.map(r=>r.item),recipeDescription:actual.description,recipeId:actual.id,durationSeconds:actual.duration/1000,status:'CANDIDATE',statusLabel:inherited?'既定原版已选 · 本轮新稿另供选择':'全新烤箱料理 · 待你选择',displayLabel:'第38轮新版候选 · 待选择',selection:'candidate',artworkStatus:'OVEN_RECIPE_CANDIDATE_PENDING',changeType:'redesign',expectedOccupancy:occupancy,priorExpectedOccupancy:.8,comparisonLabel,comparisonSource,reason:candidate.reason,design:candidate.design,sourceLabel:inherited?'此前已选原版源与全部导出精确保留；右侧为本轮独立候选，未经确认不会替换既定用图。':semantic?'左侧为第31轮已按当前食材同步的现用美术，旧整鸡图仅留历史参考；右侧本轮独立新稿，实际菜名与配方保持。':'V4原版完整保留，右侧为本轮按实际配方独立绘制的烤箱成品候选。',authoringSource:'artwork/plan4-food/round38/'+(i<5?'oven-front.mjs':i<10?'oven-middle.mjs':'oven-tail.mjs'),...(inherited?{baselineAcceptedReviewId:'437a9a667ee5',baselineSelectionPreserved:true}:{}),...(semantic?{semanticComparisonPreserved:true}:{}),v4Original,original,proposal});
 exportInspections[item.code]=art.inspection;
}
if(rows.length!==16||inheritedCount!==1||semanticComparisonCount!==1)throw Error('Oven comparison scope differs');
if(new Set(rows.map(r=>r.proposal.sha256.source)).size!==16||new Set(rows.map(r=>r.proposal.sha256.image)).size!==16)throw Error('Duplicate oven artwork');
const counts={total:16,candidates:16,accepted:0,priorAcceptedSelectionsPreserved:1};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
async function contact(size,compare){
 const cols=compare?2:6,cw=compare?320:180,ch=compare?198:178,width=cols*cw,height=56+Math.ceil(rows.length/cols)*ch,layers=[];
 const texts=[`<text x="20" y="27" font-size="16" font-weight="700">${compare?'烤箱十六道 / 现用与本轮新稿':'烤箱十六道 / 独立新版候选'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：现用美术，DS66为此前已选原版；右：第38轮新稿，由你逐项决定采用':'清楚细深描边 · 鲜活熟色 · 夹馅与层次各异 · 成品按构图控制美观体量'}</text>`];
 for(const [i,row]of rows.entries()){
  const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
  for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
   const cx=compare?x+cw*(j+.5)/2:x+cw/2;
   layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
   if(compare)texts.push(`<text x="${cx}" y="${y+120}" text-anchor="middle" font-size="9">${j?'本轮新版 · 待选择':xml(row.comparisonLabel)}</text>`);
  }
  texts.push(`<text x="${x+cw/2}" y="${y+145}" text-anchor="middle" font-size="11">${xml(row.code+' · '+row.name)}</text>`);
  texts.push(`<text x="${x+cw/2}" y="${y+164}" text-anchor="middle" font-size="9" fill="#84745f">${xml('主料：'+row.ingredients.join('、'))}</text>`);
 }
 layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
 const filename=`contacts/round38-${compare?'comparisons':'candidates'}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={comparisons:[],candidates:[]};for(const size of [40,96]){contacts.comparisons.push(await contact(size,true));contacts.candidates.push(await contact(size,false));}
const finalRecipes=[starterFinal,homeFinal,coldFinal,drinkFinal,potFinal,fryingFinal,grillFinal],coveredIds=new Set([...legacyItems.map(r=>r.id),...finalRecipes.flatMap(m=>m.samples.map(r=>r.id)),...rows.map(r=>r.id)]);
if(coveredIds.size!==79)throw Error('Recipe coverage differs');
const recipeProgress={total:123,legacySampleIdentities:7,activeLegacySelections:2,confirmedStarterRecipes:6,confirmedHomeRecipes:10,confirmedColdRecipes:5,confirmedDrinkRecipes:10,confirmedPotRecipes:4,confirmedFryingRecipes:10,confirmedGrillRecipes:17,currentOvenCandidates:16,currentCandidates:16,currentLegacyOverlap:1,reviewCovered:79,notYetIndividuallyReviewed:44};
const checks={earlierConfirmedRecipeSourcesAndExportsByteIdentical:62,confirmedGrillRefinementsByteIdentical:5,confirmedGrillRound36ArtworksByteIdentical:12,DS66LegacyOriginalSourceAndExportsByteIdentical:true,DS66NewCandidateNotAdopted:true,currentSemanticComparisonMastersPreserved:1,immutableOvenV4SourcesUnchanged:16,previousFixedMaterialSourcesAndExportsByteIdentical:107,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,legacySelectionsPreserved:2,newOvenArtworks:16,recipeDescriptionsAndIngredientsMatchCurrentCatalog:true,actualExpansionContentUnchanged:true,actualExpansionSha256:hash(expansion),actualBaseCatalogUnchanged:true,actualBaseCatalogSha256:hash(baseCatalog),actualRecipeChangesThisRound:0,actualGameNameChanges:0,transparentPadding:true,uniqueNewSources:16,uniqueNewRenders:16,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 烤箱十六道',round:38,phase:'recipe-artwork',reviewId,status:'SIXTEEN_OVEN_RECIPE_CANDIDATES_PENDING_GRILL_CONFIRMED',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,counts,previousFinalReviews:previous.previousFinalReviews,previousRecipeFinalReviews:[...previous.previousRecipeFinalReviews,{batch:'charcoal-grill',reviewId:grillFinal.reviewId,stem:'grill-final',count:17}],confirmedStarterReviewId:starterFinal.reviewId,confirmedHomeReviewId:homeFinal.reviewId,confirmedColdReviewId:coldFinal.reviewId,confirmedDrinkReviewId:drinkFinal.reviewId,confirmedPotReviewId:potFinal.reviewId,confirmedFryingReviewId:fryingFinal.reviewId,confirmedGrillReviewId:grillFinal.reviewId,recipeProgress,contacts,checks,exportInspections,samples:rows};
await saveJson(path.join(site,'round38.json'),manifest);await saveJson(path.join(site,'samples.json'),manifest);
const template=await readFile(path.join(root,'scripts/build-plan4-round38.html'),'utf8');if(!template.includes('/*__ROUND38_DATA__*/'))throw Error('Round38 data marker missing');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND38_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,key='proposal')=>({source:'output/plan4-food-review/site/'+r[key].source,png512:'output/plan4-food-review/site/'+r[key].png,preview512:'output/plan4-food-review/site/'+r[key].image,highres:'output/plan4-food-review/site/'+r[key].highres,sha256:r[key].sha256});
recipeBaseline.currentReview={round:38,reviewId,status:manifest.status,counts,batchId:feedback.batchId,manifest:'output/plan4-food-review/site/round38.json',url:'http://127.0.0.1:5284/?round=38',checks};
recipeBaseline.plannedOvenBatch={reviewId,status:'SIXTEEN_OVEN_RECIPE_CANDIDATES_PENDING',count:16,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:r.status,ingredients:r.ingredients,recipeDescription:r.recipeDescription,expectedOccupancy:r.expectedOccupancy,original:artRef(r,'original'),comparisonSource:r.comparisonSource,artwork:artRef(r),baselineAcceptedReviewId:r.baselineAcceptedReviewId}))};
for(const row of rows){const item=recipeBaseline.items.find(r=>r.id===row.id);item.latestReview={reviewId,status:'CANDIDATE',artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={...item.latestReview};}
if(legacyBefore!==legacySnapshot())throw Error('Legacy selections changed');
recipeBaseline.counts={...recipeBaseline.counts,total:123,activeLegacySelections:2,confirmedFryingRecipes:10,confirmedGrillRecipes:17,currentCandidates:16,currentAccepted:0,reviewCovered:79,notYetIndividuallyReviewed:44};await saveJson(recipeBaselineFile,recipeBaseline);
await mkdir(path.join(root,'output/plan4-round38-work'),{recursive:true});await saveJson(path.join(root,'output/plan4-round38-work/checks.json'),{reviewId,counts,recipeProgress,checks,exportInspections,humanAcceptance:'PENDING_DS63_TO_DS78_OVEN_ARTWORKS'});
console.log(JSON.stringify({reviewId,status:manifest.status,counts,recipeProgress,checks,url:'http://127.0.0.1:5284/?round=38'},null,2));

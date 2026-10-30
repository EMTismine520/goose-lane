import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {tsImport} from 'tsx/esm/api';
import {grillColourFrontCandidates} from '../artwork/plan4-food/round37/grill-colour-front.mjs';
import {grillColourMiddleCandidates} from '../artwork/plan4-food/round37/grill-colour-middle.mjs';
import {tunaColourCandidate} from '../artwork/plan4-food/round37/tuna-colour.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex'),json=async f=>JSON.parse(await readFile(f,'utf8')),saveJson=(f,v)=>writeFile(f,JSON.stringify(v,null,2)+'\n');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=await json(path.join(root,'artwork/plan4-food/round37-feedback.json')),archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
const previous=await json(path.join(archive,'round36.json'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==27)throw Error('Round36 archive differs');
const starterFinal=await json(path.join(site,'starter-final.json')),homeFinal=await json(path.join(site,'home-final.json')),coldFinal=await json(path.join(site,'cold-final.json')),drinkFinal=await json(path.join(site,'drinks-final.json')),potFinal=await json(path.join(site,'pot-final.json')),fryingFinal=await json(path.join(site,'frying-final.json')),grillSelected=await json(path.join(site,'grill-selected.json'));
for(const [record,key,count]of [[starterFinal,'confirmedStarterReviewId',6],[homeFinal,'confirmedHomeReviewId',10],[coldFinal,'confirmedColdReviewId',5],[drinkFinal,'confirmedDrinkReviewId',10],[potFinal,'confirmedPotReviewId',4]])if(record.reviewId!==previous[key]||record.samples.length!==count||record.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Earlier final inventory differs');
if(fryingFinal.reviewId!==feedback.confirmedFryingReviewId||fryingFinal.samples.length!==10||fryingFinal.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED'||grillSelected.reviewId!==feedback.selectedGrillReviewId||grillSelected.samples.length!==17||grillSelected.counts.accepted!==12)throw Error('Current selections required');
const materialBaseline=await json(path.join(output,'material-baseline.json')),recipeBaselineFile=path.join(output,'recipe-baseline.json'),recipeBaseline=await json(recipeBaselineFile);
const baseCatalog=await readFile(path.join(root,'src/content/catalog.ts')),expansion=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(baseCatalog)!==feedback.actualBaseCatalogSha256||hash(expansion)!==feedback.actualExpansionSha256)throw Error('Actual content changed');
const {RECIPES,ITEMS}=await tsImport('../src/content/catalog.ts',import.meta.url),contract=await json(path.join(root,'artwork/plan4-food/content-contract.json'));
for(const target of contract.rawItems)if(ITEMS[target.id]?.name!==target.name)throw Error('Ingredient identity differs: '+target.id);
for(const target of contract.recipes){const actual=RECIPES.find(r=>r.id===target.id);if(actual?.name!==target.name||JSON.stringify(actual.inputs)!==JSON.stringify(target.inputs))throw Error('Recipe identity differs: '+target.id);}
for(const actual of JSON.parse(expansion.toString('utf8')).recipes)if(JSON.stringify(actual.inputNames)!==JSON.stringify(actual.inputs.map(r=>ITEMS[r.item].name)))throw Error('Input labels differ: '+actual.id);
const candidates=new Map([...grillColourFrontCandidates,...grillColourMiddleCandidates,tunaColourCandidate].map(r=>[r.id,r]));
if(candidates.size!==5||feedback.redesignIds.some(id=>!candidates.has(id)))throw Error('Five specific refinements required');
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
for(const dir of ['assets/round37/proposal','assets/round37/highres','sources/round37','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(id,art){
 const files={source:`sources/round37/${id}-proposal.svg`,png:`assets/round37/proposal/${id}.png`,image:`assets/round37/proposal/${id}.webp`,highres:`assets/round37/highres/${id}-proposal.png`},bytes={source:art.source,png:art.png,image:art.webp,highres:art.highres};
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
for(const row of grillSelected.samples)await verify(row.proposal,row.code);
if(starterFinal.samples.length!==6)throw Error('Six confirmed starter dishes required');
let retainedCount=0;
for(const chain of [materialBaseline.plannedMilkChain,materialBaseline.plannedExoticChain])for(const row of chain.slots){
  const a=row.artwork;
  for(const [file,digest]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error('Retained ingredient artwork changed');
  retainedCount++;
}
if(retainedCount!==15)throw Error('Retained milk or fruit scope differs');
const legacyItems=recipeBaseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW');
if(legacyItems.length!==2)throw Error('Two unrelated active legacy recipe selections required');
const legacySnapshot=()=>JSON.stringify(legacyItems.map(r=>({id:r.id,choice:r.choice,userReview:r.userReview,selectedArtwork:r.selectedArtwork})));
const legacyBefore=legacySnapshot();
function legacyAsset(item){
  const a=item.selectedArtwork.artwork;
  return {source:a.source,png:a.png512||a.preview512.replace(/\.webp$/,'.png'),image:a.preview512,highres:a.highres,sha256:a.sha256};
}
for(const item of legacyItems)await verify(legacyAsset(item),item.id,[root]);
const selectedMap=new Map([...fryingFinal.samples,...grillSelected.samples].map(r=>[r.id,r]));
if(selectedMap.size!==27)throw Error('Selected inventory differs');
const rows=[],exportInspections={};
for(const old of previous.samples){
 const selectedRow=selectedMap.get(old.id),item=recipeBaseline.items.find(r=>r.id===old.id),actual=RECIPES.find(r=>r.output===old.id),candidate=candidates.get(old.id),redesign=!!candidate;
 if(!selectedRow||!item||actual?.name!==old.name||JSON.stringify(actual.inputs.map(r=>ITEMS[r.item].name))!==JSON.stringify(old.ingredients)||JSON.stringify(selectedRow.proposal.sha256)!==JSON.stringify(old.proposal.sha256))throw Error('Adopted recipe identity or source differs');
 if(!redesign){rows.push({...selectedRow,status:'ACCEPTED',comparisonLabel:selectedRow.displayLabel,changeType:'unchanged',reason:'本次选用与尺寸固定，批准来源、母稿和全部导出原字节保持。',original:selectedRow.proposal,proposal:selectedRow.proposal});exportInspections[old.code]={copiedSourceAndExportsByteIdentical:true};continue;}
 if(candidate.name!==old.name||candidate.expectedOccupancy!==old.expectedOccupancy||!feedback.redesignCodes.includes(old.code))throw Error('Refinement identity differs');
 const art=await render(Buffer.from(candidate.svg),old.code+'-refinement',old.expectedOccupancy),proposal=await save(old.id,art);
 if(proposal.sha256.source===old.proposal.sha256.source||proposal.sha256.image===old.proposal.sha256.image)throw Error('Refinement unchanged');
 rows.push({...selectedRow,status:'CANDIDATE',statusLabel:'第36轮新版已选 · 精修新稿待确认',displayLabel:'第37轮精修 · 待确认',comparisonLabel:'第36轮新版 · 已选基底',selection:'candidate',artworkStatus:'COLOUR_AND_APPETITE_REDESIGN_PENDING',artworkSelection:'round37-candidate',baseArtworkSelection:selectedRow.artworkSelection,userAcceptedNewArtwork:false,selectedBaseArtworkAccepted:true,changeType:'redesign',baselineAcceptedReviewId:feedback.sourceReviewId,baselineSelectionPreserved:true,expectedOccupancy:old.expectedOccupancy,priorExpectedOccupancy:old.expectedOccupancy,reason:candidate.reason,design:candidate.design,sourceLabel:'左侧为本次已选第36轮新版，右侧为颜色与食欲表现精修稿；牛胸肉同时打磨柔软厚切造型。已选基底保持，精修新稿待你确认。',authoringSource:'artwork/plan4-food/round37/'+(old.code==='DS57'?'tuna-colour.mjs':['DS46','DS47'].includes(old.code)?'grill-colour-front.mjs':'grill-colour-middle.mjs'),selectedArtwork:selectedRow.proposal,original:selectedRow.proposal,proposal});
 exportInspections[old.code]=art.inspection;
}
const pending=rows.filter(r=>r.status==='CANDIDATE');
if(rows.length!==27||pending.length!==5||pending.map(r=>r.code).join(',')!==feedback.redesignCodes.join(','))throw Error('Round37 scope differs');
if(new Set(rows.map(r=>r.proposal.sha256.source)).size!==27||new Set(rows.map(r=>r.proposal.sha256.image)).size!==27)throw Error('Duplicate artwork');
const counts={total:27,accepted:22,candidates:5,colourRefinements:5,selectedRound36BasesPreserved:5};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
async function contact(size,compare){
 const cols=compare?2:5,cw=compare?340:200,ch=compare?196:178,width=cols*cw,height=56+Math.ceil(pending.length/cols)*ch,layers=[];
 const texts=[`<text x="20" y="27" font-size="16" font-weight="700">${compare?'五道炭烤 / 色彩与食欲精修对照':'五道炭烤 / 第37轮精修候选'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：已选第36轮新版；右：第37轮精修，待你确认':'鲜活熟色 · 油润与鲜嫩 · 牛胸肉软厚造型 · 细描边和体量保持'}</text>`];
 for(const [i,row]of pending.entries()){
  const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
  for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
   const cx=compare?x+cw*(j+.5)/2:x+cw/2;
   layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
   if(compare)texts.push(`<text x="${cx}" y="${y+120}" text-anchor="middle" font-size="10">${j?'精修新稿 · 待确认':'第36轮新版 · 已选'}</text>`);
  }
  texts.push(`<text x="${x+cw/2}" y="${y+145}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
  texts.push(`<text x="${x+cw/2}" y="${y+164}" text-anchor="middle" font-size="10" fill="#84745f">${xml('主料：'+row.ingredients.join('、'))}</text>`);
 }
 layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
 const filename=`contacts/round37-${compare?'redesign':'candidates'}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={redesign:[],candidates:[]};for(const size of [40,96]){contacts.redesign.push(await contact(size,true));contacts.candidates.push(await contact(size,false));}
const recipeProgress={...previous.recipeProgress,confirmedFryingRecipes:10,confirmedGrillRecipes:12,currentFryingRedesigns:0,currentGrillCandidates:0,currentGrillRedesigns:5,currentRedesigns:5,currentCandidates:5,currentAccepted:22,reviewCovered:64,notYetIndividuallyReviewed:59};
const checks={earlierConfirmedRecipeSourcesAndExportsByteIdentical:45,selectedGrillBaseSourcesAndExportsByteIdentical:17,fixedCurrentArtworksByteIdentical:22,fiveRound36NewBasesPreserved:true,refinementsNotMarkedRejected:true,DS40Round36RefinementConfirmed:true,DS43Prior437SelectionPreserved:true,previousFixedMaterialSourcesAndExportsByteIdentical:107,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,unrelatedLegacySelectionsPreserved:2,newColourAndAppetiteArtworks:5,DS53SoftThickMeatShapeRefined:true,recipeDescriptionsAndIngredientsMatchCurrentCatalog:true,actualExpansionContentUnchanged:true,actualExpansionSha256:hash(expansion),actualBaseCatalogUnchanged:true,actualBaseCatalogSha256:hash(baseCatalog),actualRecipeChangesThisRound:0,actualGameNameChanges:0,transparentPadding:true,uniqueNewSources:5,uniqueNewRenders:5,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 五道炭烤色彩精修',round:37,phase:'recipe-artwork',reviewId,status:'TWENTYTWO_ARTWORKS_CONFIRMED_FIVE_APPETITE_REFINEMENTS_PENDING',sourceReviewId:feedback.sourceReviewId,selectedGrillReviewId:grillSelected.reviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,counts,previousFinalReviews:previous.previousFinalReviews,previousRecipeFinalReviews:[...previous.previousRecipeFinalReviews,{batch:'frying-station',reviewId:fryingFinal.reviewId,stem:'frying-final',count:10}],confirmedStarterReviewId:starterFinal.reviewId,confirmedHomeReviewId:homeFinal.reviewId,confirmedColdReviewId:coldFinal.reviewId,confirmedDrinkReviewId:drinkFinal.reviewId,confirmedPotReviewId:potFinal.reviewId,confirmedFryingReviewId:fryingFinal.reviewId,recipeProgress,contacts,checks,exportInspections,samples:rows};
await saveJson(path.join(site,'round37.json'),manifest);await saveJson(path.join(site,'samples.json'),manifest);
const template=await readFile(path.join(root,'scripts/build-plan4-round37.html'),'utf8');if(!template.includes('/*__ROUND37_DATA__*/'))throw Error('Round37 data marker missing');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND37_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,key='proposal')=>({source:'output/plan4-food-review/site/'+r[key].source,png512:'output/plan4-food-review/site/'+r[key].png,preview512:'output/plan4-food-review/site/'+r[key].image,highres:'output/plan4-food-review/site/'+r[key].highres,sha256:r[key].sha256});
recipeBaseline.currentReview={round:37,reviewId,status:manifest.status,counts,batchId:feedback.batchId,manifest:'output/plan4-food-review/site/round37.json',url:'http://127.0.0.1:5284/?round=37',checks};
recipeBaseline.plannedGrillBatch.refinementReview={reviewId,status:'PENDING_FIVE_COLOUR_AND_APPETITE_REFINEMENTS',slots:pending.map(r=>({id:r.id,code:r.code,name:r.name,expectedOccupancy:r.expectedOccupancy,artwork:artRef(r),selectedBaseArtwork:artRef(r,'original')}))};
for(const row of pending){const item=recipeBaseline.items.find(r=>r.id===row.id);item.latestReview={reviewId,status:'CANDIDATE',artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={...item.latestReview};}
if(legacyBefore!==legacySnapshot())throw Error('Unrelated legacy choices changed');
recipeBaseline.counts={...recipeBaseline.counts,total:123,activeLegacySelections:2,confirmedFryingRecipes:10,confirmedGrillRecipes:12,currentCandidates:5,currentAccepted:22,reviewCovered:64,notYetIndividuallyReviewed:59};await saveJson(recipeBaselineFile,recipeBaseline);
await mkdir(path.join(root,'output/plan4-round37-work'),{recursive:true});await saveJson(path.join(root,'output/plan4-round37-work/checks.json'),{reviewId,counts,recipeProgress,checks,exportInspections,humanAcceptance:'PENDING_DS46_DS47_DS53_DS56_DS57_REFINEMENTS'});
console.log(JSON.stringify({reviewId,status:manifest.status,counts,recipeProgress,checks,url:'http://127.0.0.1:5284/?round=37'},null,2));

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { tsImport } from 'tsx/esm/api';
import {grillFrontCandidates} from '../artwork/plan4-food/round36/grill-front.mjs';
import {grillMiddleCandidates} from '../artwork/plan4-food/round36/grill-middle.mjs';
import {grillTailCandidates} from '../artwork/plan4-food/round36/grill-tail.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round36-feedback.json'),'utf8'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
const previous=JSON.parse(await readFile(path.join(archive,'round35.json'),'utf8'));
const starterFinal=JSON.parse(await readFile(path.join(site,'starter-final.json'),'utf8'));
const homeFinal=JSON.parse(await readFile(path.join(site,'home-final.json'),'utf8'));
const coldFinal=JSON.parse(await readFile(path.join(site,'cold-final.json'),'utf8'));
const drinkFinal=JSON.parse(await readFile(path.join(site,'drinks-final.json'),'utf8'));
const potFinal=JSON.parse(await readFile(path.join(site,'pot-final.json'),'utf8'));
const fryingSelected=JSON.parse(await readFile(path.join(site,'frying-selected.json'),'utf8'));
if(fryingSelected.reviewId!==feedback.selectedFryingReviewId||fryingSelected.sourceReviewId!==feedback.sourceReviewId||fryingSelected.samples.length!==10||fryingSelected.counts.accepted!==9)throw Error('Frying selections must be recorded first');
for(const [record,key,count]of [[starterFinal,'confirmedStarterReviewId',6],[homeFinal,'confirmedHomeReviewId',10],[coldFinal,'confirmedColdReviewId',5],[drinkFinal,'confirmedDrinkReviewId',10]])if(record.reviewId!==feedback[key]||record.samples.length!==count||record.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Confirmed recipe inventory differs');
if(previous.reviewId!==feedback.sourceReviewId||potFinal.reviewId!==feedback.confirmedPotReviewId||potFinal.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED'||potFinal.samples.length!==4)throw Error('Pot recipes must be confirmed first');
const materialBaseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const recipeBaselineFile=path.join(output,'recipe-baseline.json'),recipeBaseline=JSON.parse(await readFile(recipeBaselineFile,'utf8'));
const baseCatalog=await readFile(path.join(root,'src/content/catalog.ts')),expansion=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(baseCatalog)!==feedback.actualBaseCatalogSha256||hash(expansion)!==feedback.actualExpansionSha256)throw Error('Actual recipe content changed');
const {RECIPES,ITEMS}=await tsImport('../src/content/catalog.ts',import.meta.url);
const contract=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/content-contract.json'),'utf8'));
for(const target of contract.rawItems)if(ITEMS[target.id]?.name!==target.name)throw Error('Ingredient identity differs: '+target.id);
for(const target of contract.recipes){const actual=RECIPES.find(r=>r.id===target.id);if(actual?.name!==target.name||JSON.stringify(actual.inputs)!==JSON.stringify(target.inputs))throw Error('Recipe identity differs: '+target.id);}
for(const actual of JSON.parse(expansion.toString('utf8')).recipes)if(JSON.stringify(actual.inputNames)!==JSON.stringify(actual.inputs.map(r=>ITEMS[r.item].name)))throw Error('Input labels differ: '+actual.id);
const candidates=new Map([...grillFrontCandidates,...grillMiddleCandidates,...grillTailCandidates].map(r=>[r.id,r]));
if(candidates.size!==18)throw Error('Seventeen grill artworks and one scallop redesign required');
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
for(const dir of ['assets/round36/original','assets/round36/proposal','assets/round36/historical','assets/round36/highres','sources/round36','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round36/${id}-${group}.svg`,png:`assets/round36/${group}/${id}.png`,image:`assets/round36/${group}/${id}.webp`,highres:`assets/round36/highres/${id}-${group}.png`};
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
for(const row of fryingSelected.samples)await verify(row.proposal,row.code);
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
const batchItems=recipeBaseline.items.filter(r=>r.group===feedback.batchId);
if(batchItems.length!==17||feedback.currentSemanticComparisons.length!==4)throw Error('Grill scope differs');
const rows=[],exportInspections={};
for(const old of fryingSelected.samples){
 const redesign=old.code==='DS40';
 if(!redesign){rows.push({...old,status:'ACCEPTED',changeType:'unchanged',comparisonLabel:old.displayLabel,reason:'本次已确认选用，母稿、全部导出与体量保持。',original:old.proposal,proposal:old.proposal});exportInspections[old.code]={copiedSourceAndExportsByteIdentical:true};continue;}
 const candidate=candidates.get(old.id);if(!candidate||candidate.name!==old.name||candidate.expectedOccupancy!==.82)throw Error('Scallop redesign identity differs');
 const art=await render(Buffer.from(candidate.svg),old.code+'-redesign',.82),proposal=await save('proposal',old.id,art);
 if(proposal.sha256.source===old.proposal.sha256.source||proposal.sha256.image===old.proposal.sha256.image)throw Error('Scallop redesign unchanged');
 rows.push({...old,status:'CANDIDATE',statusLabel:'已选新版继续精修 · 待你确认',displayLabel:'扇贝精修新稿 · 待确认',comparisonLabel:'第35轮新版 · 已选基底',selection:'candidate',artworkStatus:'SCALLOP_REDESIGN_PENDING',changeType:'redesign',baselineAcceptedReviewId:feedback.sourceReviewId,baselineSelectionPreserved:true,expectedOccupancy:.82,priorExpectedOccupancy:.82,reason:candidate.reason,design:candidate.design,sourceLabel:'左侧为本次已选第35轮新版；右侧重新设计自然贝肉、纤维与酥边的新稿，待你确认。已选基底保持，未把精修请求记为拒稿。',authoringSource:'artwork/plan4-food/round36/grill-front.mjs',original:old.proposal,proposal,selectedArtwork:old.proposal});
 exportInspections[old.code]=art.inspection;
}
let semanticComparisonCount=0;
for(const [i,id]of feedback.orderedIds.entries()){
 const item=batchItems.find(r=>r.id===id),candidate=candidates.get(id),actual=RECIPES.find(r=>r.output===id),occupancy=feedback.occupancies[i];
 if(!item||candidate?.name!==item.name||item.name!==feedback.orderedNames[i]||candidate.expectedOccupancy!==occupancy||actual?.name!==item.name||JSON.stringify(actual.inputs.map(r=>ITEMS[r.item].name))!==JSON.stringify(item.ingredients))throw Error('Grill identity or ingredients differ');
 const v4Source=await readFile(path.join(root,item.original.source));if(hash(v4Source)!==item.original.sourceSha256)throw Error('Immutable V4 original changed');
 const semantic=feedback.currentSemanticComparisons.find(r=>r.id===id);
 let originalArt,v4Original,comparisonLabel,comparisonSource;
 if(semantic){
  const source=await readFile(path.join(root,semantic.source));if(hash(source)!==semantic.sourceSha256||!source.toString('utf8').includes('<title>'+actual.name+' ·'))throw Error('Current semantic comparison differs');
  originalArt=await render(source,item.code+'-current-semantic',.8);semanticComparisonCount++;
  v4Original=await save('historical',id,await render(v4Source,item.code+'-v4-history',.8));comparisonLabel='现用美术 · 配方同步版';
  comparisonSource={kind:'CURRENT_SEMANTIC_BASELINE',source:semantic.source,sourceSha256:semantic.sourceSha256,semanticRevisionReviewId:item.semanticRevision.reviewId,name:actual.name};
 }else{
  originalArt=await render(v4Source,item.code+'-original',.8);comparisonLabel='V4原版';comparisonSource={kind:'V4_ORIGINAL',source:item.original.source,sourceSha256:item.original.sourceSha256};
 }
 const original=await save('original',id,originalArt);v4Original??=original;
 const art=await render(Buffer.from(candidate.svg),item.code+'-new',occupancy),proposal=await save('proposal',id,art);
 if(original.sha256.source===proposal.sha256.source||original.sha256.image===proposal.sha256.image)throw Error('Independent grill artwork required');
 rows.push({index:rows.length+1,code:item.code,id,name:item.name,oldName:item.name,nameChanged:false,previousRecipeName:item.previousRecipeName,kind:'recipe',batch:feedback.batchId,group:'炭烤架',course:feedback.courses[i],stage:item.stage,level:1,ingredients:item.ingredients,inputIds:actual.inputs.map(r=>r.item),recipeDescription:actual.description,recipeId:actual.id,durationSeconds:actual.duration/1000,status:'CANDIDATE',statusLabel:'全新炭烤料理 · 待你选择',displayLabel:'第36轮新版候选 · 待选择',selection:'candidate',artworkStatus:'GRILL_RECIPE_CANDIDATE_PENDING',changeType:'redesign',expectedOccupancy:occupancy,priorExpectedOccupancy:.8,comparisonLabel,comparisonSource,reason:candidate.reason,design:candidate.design,sourceLabel:semantic?'左侧为第31轮已按当前食材同步的现用美术，旧菜图仅留历史参考；右侧本轮新稿，配方与名称保持。':'V4原版完整保留，右侧为本轮独立炭烤新稿，实际菜名、主料与逻辑保持。',authoringSource:'artwork/plan4-food/round36/'+(i<5?'grill-front.mjs':i<11?'grill-middle.mjs':'grill-tail.mjs'),...(semantic?{semanticComparisonPreserved:true}:{}),v4Original,original,proposal});
 exportInspections[item.code]=art.inspection;
}
const pending=rows.filter(r=>r.status==='CANDIDATE'),grill=rows.filter(r=>r.batch===feedback.batchId),scallop=rows.filter(r=>r.code==='DS40');
if(rows.length!==27||pending.length!==18||grill.length!==17||semanticComparisonCount!==4)throw Error('Round36 scope differs');
if(new Set(rows.map(r=>r.proposal.sha256.source)).size!==27||new Set(rows.map(r=>r.proposal.sha256.image)).size!==27)throw Error('Duplicate artwork');
const counts={total:27,accepted:9,candidates:18,newGrillCandidates:17,scallopRedesigns:1,selectedPreviousNew:9,retainedPreviousVersion:1};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
async function contact(items,size,mode){
 const compare=mode!=='grill',scallopMode=mode==='redesign',cols=scallopMode?1:compare?2:6,cw=scallopMode?600:compare?320:180,ch=scallopMode?234:compare?198:178,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
 const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${scallopMode?'酥炸扇贝 / 自然贝肉精修':compare?'炭烤十七道 / 现用与本轮新版':'炭烤十七道 / 独立新版候选'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${scallopMode?'左：已选第35轮新版；右：本轮精修，待你确认':compare?'左：现用美术；右：第36轮候选，由你逐项决定采用':'清楚细深描边 · 主料克制 · 炭面与熟色 · 成品按构图控制美观体量'}</text>`];
 for(const [i,row]of items.entries()){
  const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
  for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
   const cx=compare?x+cw*(j+.5)/2:x+cw/2;
   layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
   if(compare)texts.push(`<text x="${cx}" y="${y+120}" text-anchor="middle" font-size="10">${j?scallopMode?'精修新稿 · 待确认':'本轮新稿 · 待选择':xml(row.comparisonLabel)}</text>`);
  }
  texts.push(`<text x="${x+cw/2}" y="${y+145}" text-anchor="middle" font-size="11">${xml(row.code+' · '+row.name)}</text>`);
  texts.push(`<text x="${x+cw/2}" y="${y+164}" text-anchor="middle" font-size="9" fill="#84745f">${xml('主料：'+row.ingredients.join('、'))}</text>`);
  if(scallopMode)texts.push(`<text x="${x+cw/2}" y="${y+198}" text-anchor="middle" font-size="10" fill="#84745f">自然贝肉与纤维 · 不规则金黄酥边 · 82%体量</text>`);
 }
 layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
 const filename=`contacts/round36-${mode}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={redesign:[],grill:[],comparisons:[]};for(const size of [40,96])for(const mode of Object.keys(contacts))contacts[mode].push(await contact(mode==='redesign'?scallop:grill,size,mode));
const coveredIds=new Set([...legacyItems.map(r=>r.id),...starterFinal.samples.map(r=>r.id),...homeFinal.samples.map(r=>r.id),...coldFinal.samples.map(r=>r.id),...drinkFinal.samples.map(r=>r.id),...potFinal.samples.map(r=>r.id),...rows.map(r=>r.id)]);
if(coveredIds.size!==64)throw Error('Recipe coverage differs');
const recipeProgress={total:123,legacySampleIdentities:7,activeLegacySelections:2,confirmedStarterRecipes:6,confirmedHomeRecipes:10,confirmedColdRecipes:5,confirmedDrinkRecipes:10,confirmedPotRecipes:4,confirmedFryingRecipes:9,currentFryingRedesigns:1,currentGrillCandidates:17,currentCandidates:18,reviewCovered:64,notYetIndividuallyReviewed:59};
const checks={confirmedEarlierRecipeSourcesAndExportsByteIdentical:35,selectedFryingBaseSourcesAndExportsByteIdentical:10,fullyConfirmedFryingArtworksUnchanged:9,DS43Prior437ArtworkReaffirmed:true,DS40SelectedNewBasePreserved:true,DS40RedesignNotMarkedRejected:true,previousFixedMaterialSourcesAndExportsByteIdentical:107,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,unrelatedLegacySelectionsPreserved:2,currentSemanticComparisonMastersPreserved:4,immutableGrillV4SourcesUnchanged:17,newGrillArtworks:17,newScallopArtwork:1,recipeDescriptionsAndIngredientsMatchCurrentCatalog:true,actualExpansionContentUnchanged:true,actualExpansionSha256:hash(expansion),actualBaseCatalogUnchanged:true,actualBaseCatalogSha256:hash(baseCatalog),actualRecipeChangesThisRound:0,actualGameNameChanges:0,transparentPadding:true,uniqueNewSources:18,uniqueNewRenders:18,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 炭烤十七道与扇贝精修',round:36,phase:'recipe-artwork',reviewId,status:'SEVENTEEN_GRILL_CANDIDATES_AND_SCALLOP_REDESIGN_PENDING',sourceReviewId:feedback.sourceReviewId,selectedFryingReviewId:fryingSelected.reviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,counts,previousFinalReviews:previous.previousFinalReviews,previousRecipeFinalReviews:previous.previousRecipeFinalReviews,confirmedStarterReviewId:starterFinal.reviewId,confirmedHomeReviewId:homeFinal.reviewId,confirmedColdReviewId:coldFinal.reviewId,confirmedDrinkReviewId:drinkFinal.reviewId,confirmedPotReviewId:potFinal.reviewId,recipeProgress,contacts,checks,exportInspections,samples:rows};
await writeFile(path.join(site,'round36.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round36.html'),'utf8');if(!template.includes('/*__ROUND36_DATA__*/'))throw Error('Round36 data marker missing');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND36_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,key='proposal')=>({source:'output/plan4-food-review/site/'+r[key].source,png512:'output/plan4-food-review/site/'+r[key].png,preview512:'output/plan4-food-review/site/'+r[key].image,highres:'output/plan4-food-review/site/'+r[key].highres,sha256:r[key].sha256});
recipeBaseline.currentReview={round:36,reviewId,status:manifest.status,counts,batchId:feedback.batchId,manifest:'output/plan4-food-review/site/round36.json',url:'http://127.0.0.1:5284/?round=36',checks};
recipeBaseline.plannedGrillBatch={reviewId,status:'SEVENTEEN_GRILL_RECIPE_CANDIDATES_PENDING',count:17,slots:grill.map(r=>({id:r.id,code:r.code,name:r.name,status:r.status,ingredients:r.ingredients,expectedOccupancy:r.expectedOccupancy,original:artRef(r,'original'),comparisonSource:r.comparisonSource,artwork:artRef(r)}))};
recipeBaseline.plannedFryingBatch.refinementReview={reviewId,status:'PENDING_DS40_SCALLOP_REDESIGN',artwork:artRef(scallop[0]),selectedBaseArtwork:artRef(scallop[0],'original')};
for(const row of pending){const item=recipeBaseline.items.find(r=>r.id===row.id);item.latestReview={reviewId,status:'CANDIDATE',artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={...item.latestReview};}
if(legacyBefore!==legacySnapshot())throw Error('Unrelated legacy choices changed');
recipeBaseline.counts={...recipeBaseline.counts,total:123,activeLegacySelections:2,confirmedFryingRecipes:9,currentCandidates:18,currentAccepted:9,reviewCovered:64,notYetIndividuallyReviewed:59};await writeFile(recipeBaselineFile,JSON.stringify(recipeBaseline,null,2)+'\n');
await mkdir(path.join(root,'output/plan4-round36-work'),{recursive:true});await writeFile(path.join(root,'output/plan4-round36-work/checks.json'),JSON.stringify({reviewId,counts,recipeProgress,checks,exportInspections,humanAcceptance:'PENDING_SEVENTEEN_GRILL_AND_DS40_REDESIGN'},null,2)+'\n');
console.log(JSON.stringify({reviewId,status:manifest.status,counts,recipeProgress,checks,url:'http://127.0.0.1:5284/?round=36'},null,2));

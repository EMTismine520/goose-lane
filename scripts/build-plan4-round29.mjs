import { createHash } from 'node:crypto';
import { access, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { tsImport } from 'tsx/esm/api';
import { searedPorkCandidate } from '../artwork/plan4-food/round29/seared-pork.mjs';
import { orangeRibsCandidate } from '../artwork/plan4-food/round29/orange-ribs.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const json=async f=>JSON.parse(await readFile(f,'utf8'));
const saveJson=(f,v)=>writeFile(f,JSON.stringify(v,null,2)+'\n');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=await json(path.join(root,'artwork/plan4-food/round29-feedback.json'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
try{await access(path.join(archive,'round28.json'));}catch{
  if((await json(path.join(site,'samples.json'))).reviewId!==feedback.sourceReviewId)throw Error('Live review is not round28');
  await cp(site,archive,{recursive:true,errorOnExist:true,force:false});
}
const previous=await json(path.join(archive,'round28.json'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==10)throw Error('Round28 archive differs');
const recipeBaselineFile=path.join(output,'recipe-baseline.json'),baseline=await json(recipeBaselineFile);
const material=await json(path.join(output,'material-baseline.json'));
const baseCatalog=await readFile(path.join(root,'src/content/catalog.ts')),expansion=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(baseCatalog)!==feedback.actualBaseCatalogSha256||hash(expansion)!==feedback.actualExpansionSha256)throw Error('Recipe content differs');
const {HOME_RECIPES,ITEMS}=await tsImport('../src/content/catalog.ts',import.meta.url);
async function verify(asset,id,bases=[site,archive]){
  for(const base of bases)for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': artwork bytes changed');
}
function bounds(data,info){
  let left=info.width,top=info.height,right=-1,bottom=-1,edge=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    const a=data[(y*info.width+x)*4+3];
    if(x===0||y===0||x===info.width-1||y===info.height-1)edge=Math.max(edge,a);
    if(a<=16)continue;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<left)throw Error('Empty artwork');return {left,top,width:right-left+1,height:bottom-top+1,edge};
}
function validate(svg,id){
  if(/<(?:image|script|foreignObject)\b|(?:href|src)\s*=|data:/i.test(svg))throw Error(id+': non-native SVG');
  const ids=[...svg.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)throw Error(id+': duplicate SVG definition');
  for(const m of svg.matchAll(/url\(["']?#([^)'"\s]+)["']?\)/g))if(!ids.includes(m[1]))throw Error(id+': missing definition');
  const box=svg.match(/\bviewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
  if(!box||box.length!==4||box.some(v=>!Number.isFinite(v))||box[2]<=0||box[3]<=0)throw Error(id+': invalid viewBox');return box;
}
async function inspect(bytes,size,id,expected){
  const meta=await sharp(bytes).metadata();if(meta.width!==size||meta.height!==size||!meta.hasAlpha)throw Error(id+': dimensions or alpha differ');
  const raw=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info),occupancy=Math.max(b.width,b.height)/size;
  if(b.edge||Math.abs(occupancy-expected)>.006)throw Error(id+': occupancy differs '+occupancy);
  if(Math.abs((b.left+b.width/2)/size-.5)>.006||Math.abs((b.top+b.height/2)/size-.5)>.006)throw Error(id+': artwork not centered');
  return {occupancy,bounds:b};
}
async function render(source,id,occupancy){
  const svg=source.toString('utf8'),box=validate(svg,id),raw=await sharp(source).resize(1024,1024).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  if(b.edge)throw Error(id+': source touches edge');
  const side=Math.max(b.width/1024*box[2],b.height/1024*box[3])/occupancy,cx=box[0]+(b.left+b.width/2)/1024*box[2],cy=box[1]+(b.top+b.height/2)/1024*box[3];
  const fitted=svg.replace(/(<svg\b[^>]*\bviewBox\s*=\s*)["'][^"']+["']/,'$1"'+[cx-side/2,cy-side/2,side,side].map(v=>v.toFixed(6)).join(' ')+'"');
  const highres=await sharp(Buffer.from(fitted)).resize(1024,1024).png().toBuffer(),png=await sharp(highres).resize(512,512).png().toBuffer(),webp=await sharp(png).webp({lossless:true,effort:6}).toBuffer();
  return {source,png,webp,highres,inspection:{png:await inspect(png,512,id,occupancy),webp:await inspect(webp,512,id,occupancy),highres:await inspect(highres,1024,id,occupancy)}};
}
for(const dir of ['assets/round29/proposal','assets/round29/highres','sources/round29','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(id,art){
  const files={source:`sources/round29/${id}-proposal.svg`,png:`assets/round29/proposal/${id}.png`,image:`assets/round29/proposal/${id}.webp`,highres:`assets/round29/highres/${id}-proposal.png`};
  const bytes={source:art.source,png:art.png,image:art.webp,highres:art.highres};
  for(const key of Object.keys(files))await writeFile(path.join(site,files[key]),bytes[key]);
  return {...files,sha256:Object.fromEntries(Object.entries(bytes).map(([k,b])=>[k,hash(b)]))};
}
let fixedMaterial=0;
for(const entry of [...previous.previousFinalReviews,{reviewId:'3106315e39b7',stem:'round2-final',count:14},{reviewId:'d978fdf8f32e',stem:'beast-final',count:10}]){
  const final=await json(path.join(site,entry.stem+'.json'));if(final.reviewId!==entry.reviewId||final.samples.length!==entry.count)throw Error('Fixed material inventory differs');
  for(const row of final.samples){await verify(row.proposal,row.code);fixedMaterial++;}
}
if(fixedMaterial!==107)throw Error('Fixed material count differs');
const starter=await json(path.join(site,'starter-final.json'));
if(starter.reviewId!==previous.confirmedStarterReviewId||starter.samples.length!==6)throw Error('Starter final differs');
for(const row of starter.samples)await verify(row.proposal,row.code);
for(const chain of [material.plannedMilkChain,material.plannedExoticChain])for(const row of chain.slots){
  const a=row.artwork;for(const [file,digest]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error('Retained ingredient changed');
}
const priorLegacy=baseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW'||r.legacySelection?.reviewId==='437a9a667ee5');
if(priorLegacy.length!==7)throw Error('Legacy sample count differs');
const legacyUnchanged=JSON.stringify(priorLegacy.filter(r=>r.code!=='DS08').map(r=>({id:r.id,choice:r.choice,userReview:r.userReview,selectedArtwork:r.selectedArtwork})));
const candidates=new Map([searedPorkCandidate,orangeRibsCandidate].map(r=>[r.id,r]));
const rows=[],exportInspections={};
for(const old of previous.samples){
  await verify(old.original,old.code+'-v4');await verify(old.proposal,old.code+'-round28');
  const item=baseline.items.find(r=>r.id===old.id),actual=HOME_RECIPES.find(r=>r.output===old.id);
  if(!item||actual?.description!==old.recipeDescription||JSON.stringify(actual.inputs.map(r=>ITEMS[r.item].name))!==JSON.stringify(old.ingredients))throw Error('Recipe semantics differ');
  if(hash(await readFile(path.join(root,item.original.source)))!==item.original.sourceSha256)throw Error('Original recipe master changed');
  const selectedNew=feedback.selectedNewCodes.includes(old.code),selectedOriginal=feedback.selectedOriginalCodes.includes(old.code),redesign=feedback.redesignCodes.includes(old.code);
  if(selectedNew===selectedOriginal)throw Error('Missing or ambiguous selection');
  const variant=selectedNew?'proposal':'original',selected=old[variant],priorOccupancy=selectedNew?old.expectedOccupancy:.8;
  let proposal=selected,expectedOccupancy=priorOccupancy;
  if(redesign){
    const candidate=candidates.get(old.id);if(!candidate||candidate.name!==old.name||candidate.expectedOccupancy!==priorOccupancy)throw Error('Redesign contract differs');
    const art=await render(Buffer.from(candidate.svg),old.code,expectedOccupancy);proposal=await save(old.id,art);exportInspections[old.code]=art.inspection;
    if(proposal.sha256.source===selected.sha256.source||proposal.sha256.image===selected.sha256.image)throw Error('Redesign did not change');
  }else exportInspections[old.code]={copiedSourceAndExportsByteIdentical:true};
  const candidate=candidates.get(old.id),status=redesign?'CANDIDATE':'ACCEPTED';
  rows.push({...old,index:rows.length+1,status,statusLabel:redesign?'已选新版 · 减量新稿待确认':selectedNew?'新版 · 已确认采用':'原版 · 已确认保留',displayLabel:redesign?'减量新稿 · 待确认':selectedNew?'已采用新版':'已采用原版',comparisonLabel:selectedNew?'第28轮新版 · 已选用':'V4原版 · 已选用',selection:redesign?'candidate':'selected',artworkStatus:redesign?'QUANTITY_REDESIGN_PENDING':'USER_ACCEPTED',artworkSelection:selectedNew?'round28-new':'original',changeType:redesign?'redesign':'unchanged',baselineAcceptedReviewId:feedback.sourceReviewId,baselineSelectionPreserved:true,sourceSelection:{reviewId:feedback.sourceReviewId,variant,sha256:selected.sha256},selectedArtwork:selected,priorExpectedOccupancy:priorOccupancy,expectedOccupancy,reason:redesign?candidate.reason:selectedNew?'按本次选择固定第28轮新版，SVG母稿与PNG512、WebP512、PNG1024原字节保持。':'按本次选择保留V4原版，SVG母稿与全部导出原字节保持。',design:redesign?candidate.design:old.design,sourceLabel:redesign?'左侧为本次已选第28轮新版；右侧减少主体数量、保留配方身份的新稿，待你确认。':'本次选定来源与尺寸固定，当前不改形状、配色、描边或导出。',authoringSource:redesign?'artwork/plan4-food/round29/'+(old.code==='DS13'?'seared-pork.mjs':'orange-ribs.mjs'):old.authoringSource,v4Original:old.original,original:selected,proposal});
}
if(rows.length!==10||rows.filter(r=>r.status==='CANDIDATE').length!==2||candidates.size!==2)throw Error('Home selection scope differs');
if(new Set(rows.map(r=>r.proposal.sha256.source)).size!==10||new Set(rows.map(r=>r.proposal.sha256.image)).size!==10)throw Error('Duplicate artwork');
const counts={total:10,selectedNew:9,selectedOriginal:1,accepted:8,candidates:2,pending:2};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
async function contact(items,size,compare){
  const cols=compare?2:5,cw=compare?350:200,ch=compare?212:174,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch,layers=[];
  const texts=[`<text x="20" y="27" font-size="16" font-weight="700">${compare?'两道肉菜 / 减少数量，清楚摆盘':'家常十道 / 当前选用与两张减量新稿'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：已选第28轮新版；右：本轮减量新稿，待你确认':'DS09原版，其余已选新版；DS13、DS16减量新稿待确认'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+120}" text-anchor="middle" font-size="10">${j?'减量新稿 · 待确认':'第28轮新版 · 已选'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+145}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    texts.push(`<text x="${x+cw/2}" y="${y+165}" text-anchor="middle" font-size="10" fill="#84745f">${xml(compare?(row.code==='DS13'?'4片 → 2片 · 熟肉脂肪带与紫洋葱':'6块 → 3块 · 短排、甜橙与红椒'):row.statusLabel)}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round29-${compare?'redesign':'home'}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={redesign:[],home:[]};for(const size of [40,96]){contacts.redesign.push(await contact(rows.filter(r=>r.status==='CANDIDATE'),size,true));contacts.home.push(await contact(rows,size,false));}
const checks={selectedNewSourcesAndExportsByteIdentical:9,selectedOriginalSourcesAndExportsByteIdentical:1,unchangedCurrentArtworksByteIdentical:8,newReducedQuantityArtworks:2,homeOriginalMastersUnchanged:10,confirmedStarterSourcesAndExportsByteIdentical:6,previousFixedMaterialSourcesAndExportsByteIdentical:107,currentMilkAndFruitSourcesAndExportsByteIdentical:15,legacyOtherSelectionsPreserved:6,DS08ExplicitlySupersedes437Original:true,recipeDescriptionsAndIngredientsMatchCurrentCatalog:true,actualRecipeChangesThisRound:0,actualGameNameChanges:0,actualBaseCatalogSha256:hash(baseCatalog),actualExpansionSha256:hash(expansion),transparentPadding:true,uniqueSources:10,uniqueRenders:10,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const recipeProgress={total:123,legacySampleIdentities:7,confirmedStarterRecipes:6,currentRedesigns:2,currentAccepted:8,reviewCovered:22,notYetIndividuallyReviewed:101};
const manifest={title:'鹅巷食光 · 两道肉菜减量精修',round:29,phase:'recipe-artwork',reviewId,status:'HOME_SELECTIONS_CONFIRMED_TWO_QUANTITY_REDESIGNS_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,counts,previousFinalReviews:previous.previousFinalReviews,previousRecipeFinalReviews:previous.previousRecipeFinalReviews,confirmedStarterReviewId:starter.reviewId,recipeProgress,contacts,checks,exportInspections,samples:rows};
await saveJson(path.join(site,'round29.json'),manifest);await saveJson(path.join(site,'samples.json'),manifest);
const template=await readFile(path.join(root,'scripts/build-plan4-round29.html'),'utf8');if(!template.includes('/*__ROUND29_DATA__*/'))throw Error('Template marker missing');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND29_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(row,key='proposal')=>({source:'output/plan4-food-review/site/'+row[key].source,png512:'output/plan4-food-review/site/'+row[key].png,preview512:'output/plan4-food-review/site/'+row[key].image,highres:'output/plan4-food-review/site/'+row[key].highres,sha256:row[key].sha256});
for(const row of rows){
  const item=baseline.items.find(r=>r.id===row.id);
  if(row.code==='DS08'&&!item.legacySelection)item.legacySelection={reviewId:'437a9a667ee5',choice:item.choice,userReview:item.userReview,selectedArtwork:item.selectedArtwork,supersededBy:feedback.sourceReviewId};
  item.choice=row.artworkSelection==='original'?'USER_SELECTED_ORIGINAL':'USER_SELECTED_NEW';item.userReview=row.status==='CANDIDATE'?'NEW_SELECTED_QUANTITY_REDESIGN_REQUESTED':'ARTWORK_AND_PRESENTATION_CONFIRMED';
  item.latestReview={reviewId,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={...item.latestReview};
  item.selectedArtwork={reviewId:feedback.sourceReviewId,selection:row.artworkSelection,selectedVariant:row.sourceSelection.variant,userAcceptedArtwork:true,presentationStatus:'USER_CONFIRMED',expectedOccupancy:row.priorExpectedOccupancy,artwork:artRef(row,'original')};
}
if(legacyUnchanged!==JSON.stringify(baseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW').map(r=>({id:r.id,choice:r.choice,userReview:r.userReview,selectedArtwork:r.selectedArtwork}))))throw Error('Unrelated legacy choices changed');
baseline.currentReview={round:29,reviewId,status:manifest.status,counts,batchId:feedback.batchId,manifest:'output/plan4-food-review/site/round29.json',url:'http://127.0.0.1:5284/?round=29',checks};
baseline.plannedHomeBatch={reviewId,sourceReviewId:feedback.sourceReviewId,status:manifest.status,counts,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:r.status,ingredients:r.ingredients,recipeDescription:r.recipeDescription,expectedOccupancy:r.expectedOccupancy,selectedArtwork:artRef(r,'original'),artwork:artRef(r)}))};
baseline.counts={total:123,legacySampleIdentities:7,confirmedStarterRecipes:6,currentCandidates:2,currentAccepted:8,reviewCovered:22,notYetIndividuallyReviewed:101};await saveJson(recipeBaselineFile,baseline);
const bookFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=await json(bookFile);
const acceptance={reviewId:feedback.sourceReviewId,date:feedback.date,userQuote:feedback.userQuote,status:'HOME_ARTWORK_SELECTED_TWO_QUANTITY_REDESIGNS_REQUESTED',selectedNewCodes:feedback.selectedNewCodes,selectedOriginalCodes:feedback.selectedOriginalCodes,redesignCodes:feedback.redesignCodes,counts,selectedArtwork:rows.map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:r.sourceSelection,expectedOccupancy:r.priorExpectedOccupancy,presentationStatus:'USER_CONFIRMED',redesignPending:r.status==='CANDIDATE'})),supersededLegacySelection:{code:'DS08',reviewId:'437a9a667ee5',variant:'original',replacedBy:'round28-new'},actualGameArtIntegrationPending:true};
const at=book.reviews.findIndex(r=>r.reviewId===feedback.sourceReviewId);if(at<0)book.reviews.push(acceptance);else book.reviews[at]=acceptance;await saveJson(bookFile,book);
await mkdir(path.join(root,'output/plan4-round29-work'),{recursive:true});await saveJson(path.join(root,'output/plan4-round29-work/checks.json'),{reviewId,counts,recipeProgress,checks,exportInspections,humanAcceptance:'PENDING_DS13_DS16_REDUCED_QUANTITY_ARTWORKS'});
console.log(JSON.stringify({reviewId,status:manifest.status,counts,recipeProgress,checks,url:'http://127.0.0.1:5284/?round=29'},null,2));

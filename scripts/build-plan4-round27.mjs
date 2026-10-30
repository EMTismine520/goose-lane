import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, access, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { tsImport } from 'tsx/esm/api';
import { gardenBowlRedesign } from '../artwork/plan4-food/round27/garden-bowl.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round27-feedback.json'),'utf8'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
try{await access(path.join(archive,'round26.json'));}catch{const live=JSON.parse(await readFile(path.join(site,'round26.json'),'utf8'));if(live.reviewId!==feedback.sourceReviewId)throw Error('Source review differs');await cp(site,archive,{recursive:true,errorOnExist:true,force:false});}
const previous=JSON.parse(await readFile(path.join(archive,'round26.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==6)throw Error('Round26 archive incomplete');
const materialBaseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const recipeBaselineFile=path.join(output,'recipe-baseline.json'),recipeBaseline=JSON.parse(await readFile(recipeBaselineFile,'utf8'));
const baseCatalog=await readFile(path.join(root,'src/content/catalog.ts')),expansion=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(expansion)!==feedback.actualExpansionSha256)throw Error('Unrelated expansion content changed');
const { FRESH_RECIPES, ITEMS }=await tsImport('../src/content/catalog.ts',import.meta.url);
const revised=FRESH_RECIPES.find(r=>r.id===feedback.recipeRevision.recipeId);
if(!revised||revised.output!==feedback.recipeRevision.outputId||revised.name!==feedback.recipeRevision.name||revised.duration!==30000||revised.description!==feedback.recipeRevision.description||revised.unlockDay!==1||revised.inputs.length!==2||revised.inputs.some((r,i)=>r.item!==feedback.recipeRevision.newInputIds[i]||r.count!==1)||ITEMS[revised.output].sell!==feedback.recipeRevision.sellPrice)throw Error('Actual recipe does not match the new artwork contract');
if(gardenBowlRedesign.id!==feedback.redesignId||gardenBowlRedesign.expectedOccupancy!==feedback.redesignOccupancy)throw Error('Garden bowl identity differs');
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
for(const dir of ['assets/round27/proposal','assets/round27/highres','sources/round27','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(id,art){
  const files={source:`sources/round27/${id}-proposal.svg`,png:`assets/round27/proposal/${id}.png`,image:`assets/round27/proposal/${id}.webp`,highres:`assets/round27/highres/${id}-proposal.png`};
  const bytes={source:art.source,png:art.png,image:art.webp,highres:art.highres};
  for(const key of Object.keys(files))await writeFile(path.join(site,files[key]),bytes[key]);
  return {...files,sha256:Object.fromEntries(Object.entries(bytes).map(([k,b])=>[k,hash(b)]))};
}
async function verify(asset,id,bases=[site,archive]){
  for(const base of bases)for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': prior artwork changed');
}
let fixedCount=0;
for(const entry of [...previous.previousFinalReviews,{reviewId:'3106315e39b7',stem:'round2-final',count:14},{reviewId:'d978fdf8f32e',stem:'beast-final',count:10}]){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  if(final.reviewId!==entry.reviewId||final.samples.length!==entry.count)throw Error('Fixed inventory differs');
  for(const row of final.samples){await verify(row.proposal,row.code);fixedCount++;}
}
if(fixedCount!==107)throw Error('Fixed material inventory differs');
const retainedBefore=JSON.stringify([materialBaseline.plannedMilkChain,materialBaseline.plannedExoticChain]);
let retainedCount=0;
for(const chain of [materialBaseline.plannedMilkChain,materialBaseline.plannedExoticChain])for(const row of chain.slots){
  const a=row.artwork;
  for(const [file,digest]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error('Current milk or fruit artwork changed');
  retainedCount++;
}
if(retainedCount!==15)throw Error('Retained ingredient scope differs');
const legacyBefore=JSON.stringify(recipeBaseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW'));
const rows=[],exportInspections={};let originals=0,resized=0;
for(const old of previous.samples){
  await verify(old.original,old.code+'-original');await verify(old.proposal,old.code+'-round26');
  const item=recipeBaseline.items.find(r=>r.id===old.id);if(!item)throw Error('Recipe baseline identity missing');
  if(hash(await readFile(path.join(root,item.original.source)))!==item.original.sourceSha256)throw Error('V4 recipe master changed');
  const selectedNew=feedback.selectedNewCodes.includes(old.code),selectedOriginal=feedback.selectedOriginalCodes.includes(old.code),redesign=old.id===feedback.redesignId;
  if(selectedNew===selectedOriginal)throw Error('Unspecified recipe selection');
  const variant=selectedNew?'proposal':'original',original=old[variant],priorOccupancy=selectedNew?old.expectedOccupancy:.8;
  let proposal=original,inspection={copiedByteIdentical:true},expectedOccupancy=priorOccupancy;
  if(selectedNew){
    expectedOccupancy=feedback.newSizeTargets[old.code];
    if(expectedOccupancy!==.8)throw Error('Selected dish presentation target differs');
    const art=await render(await readFile(path.join(archive,original.source)),old.code+'-selected-larger',expectedOccupancy);proposal=await save(old.id,art);inspection=art.inspection;
    if(proposal.sha256.source!==original.sha256.source)throw Error('Selected artwork geometry or colours changed');resized++;
  }else if(redesign){
    expectedOccupancy=feedback.redesignOccupancy;
    const art=await render(Buffer.from(gardenBowlRedesign.svg),old.code+'-redesign',expectedOccupancy);proposal=await save(old.id,art);inspection=art.inspection;
    if(proposal.sha256.source===old.original.sha256.source||proposal.sha256.source===old.proposal.sha256.source)throw Error('Harvest bowl must be independently redesigned');
  }else originals++;
  const status=redesign?'CANDIDATE':selectedNew?'SIZE_PENDING':'ACCEPTED';
  rows.push({...old,index:rows.length+1,status,statusLabel:redesign?'新田园碗与配方 · 美术待你确认':selectedNew?'新版美术已采用 · 展示尺寸待看':'V4原版 · 已采用',displayLabel:redesign?'新田园丰收碗 · 待选':selectedNew?'已采用新版 · 主体80%':'V4原版 · 已采用',comparisonLabel:selectedNew?'已选第26轮新版 · 调整前':'V4原版 · 对照',selection:redesign?'candidate':'selected',artworkStatus:redesign?'HARVEST_REDESIGN_PENDING':selectedNew?'ARTWORK_SELECTED_PRESENTATION_PENDING':'USER_ACCEPTED',artworkSelection:redesign?'garden-bowl-redesign':selectedNew?'round26-new':'original',changeType:redesign?'redesign':selectedNew?'resize':'unchanged',ingredients:redesign?feedback.recipeRevision.newInputs:old.ingredients,recipeDescription:redesign?revised.description:old.recipeDescription,oldIngredients:old.ingredients,oldRecipeDescription:old.recipeDescription,reason:redesign?gardenBowlRedesign.reason:selectedNew?'保留已采用的新版SVG造型、配色与细描边，按成品构图将主体恢复至80%，展示更饱满。':'按本次选择使用V4原版，source、所有导出与80%占比原样保持。',design:redesign?gardenBowlRedesign.design:selectedNew?{size:'配方成品按美观确定体量；所选SVG原字节保持，展示占比由'+Math.round(priorOccupancy*100)+'%恢复至80%'}:old.design,expectedOccupancy,priorExpectedOccupancy:priorOccupancy,presentationScale:expectedOccupancy/priorOccupancy,sourceSelection:{reviewId:feedback.sourceReviewId,variant,sha256:original.sha256},baselineAcceptedReviewId:feedback.sourceReviewId,sourceLabel:redesign?'V4原版为选用对照；未采用的第26轮候选单独留存。本地真实配方已改为西兰花＋彩椒，新画面待确认。':selectedNew?'已选第26轮新版母稿完全保持，仅重新导出更饱满的成品尺寸。':'V4原版源与各档导出逐字节保持。',...(redesign?{authoringSource:'artwork/plan4-food/round27/garden-bowl.mjs',previousCandidate:old.proposal}:{}),original,proposal});
  exportInspections[old.code]=inspection;
}
if(rows.length!==6||resized!==2||originals!==3)throw Error('Round27 selection scope differs');
if(new Set(rows.map(r=>r.proposal.sha256.source)).size!==6||new Set(rows.map(r=>r.proposal.sha256.image)).size!==6)throw Error('Duplicate final artwork');
const counts={total:6,candidates:1,sizePending:2,accepted:3,pending:3};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.ingredients,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
async function contact(items,size,mode){
  const compare=mode!=='starter',cols=mode==='redesign'?1:mode==='sizes'?2:3,cw=compare?340:220,ch=compare?210:174,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const titles={proposals:'料理选用 / 两项成品尺寸与田园丰收碗重设计',sizes:'已采用新版 / 恢复饱满成品尺寸',redesign:'田园丰收碗 / 西兰花＋彩椒新配方',starter:'开局鲜食六道 / 本轮选用与新提案'};
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${titles[mode]} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：调整前；右：本轮方案，由你确认':'DS01、DS02采用新版；DS04—DS06原版；DS03新碗待选'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+120}" text-anchor="middle" font-size="10">${xml(row.status==='SIZE_PENDING'?j?'已选新版 · 80%':'已选新版 · '+Math.round(row.priorExpectedOccupancy*100)+'%':j?'新碗候选 · 82%':'V4原版 · 80%')}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+144}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    texts.push(`<text x="${x+cw/2}" y="${y+165}" text-anchor="middle" font-size="10" fill="#84745f">${xml('主料：'+row.ingredients.join('、'))}</text>`);
    if(compare)texts.push(`<text x="${x+cw/2}" y="${y+185}" text-anchor="middle" font-size="10" fill="#84745f">${row.status==='CANDIDATE'?'配方已同步 · 30秒 · 新美术待确认':'所选母稿保持 · 成品按美观控制尺寸'}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round27-${mode}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={proposals:[],sizes:[],redesign:[],starter:[]};for(const size of [40,96])for(const [mode,items]of [['proposals',rows.filter(r=>r.status!=='ACCEPTED')],['sizes',rows.filter(r=>r.status==='SIZE_PENDING')],['redesign',rows.filter(r=>r.status==='CANDIDATE')],['starter',rows]])contacts[mode].push(await contact(items,size,mode));
const checks={selectedNewSvgSourcesByteIdentical:2,selectedOriginalSourcesAndExportsByteIdentical:3,originalRecipeMastersUnchanged:6,newHarvestArtwork:1,selectedNewPresentationsRestoredTo80Percent:2,previousFixedMaterialSourcesAndExportsByteIdentical:107,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,legacyRecipeSampleSelectionsPreserved:7,recipeIdsAndOutputsPreserved:true,actualChangedRecipeIds:['fresh-garden-bowl'],actualRecipeChanges:1,actualGameNameChanges:0,actualExpansionContentUnchanged:true,actualExpansionSha256:hash(expansion),actualBaseCatalogSha256:hash(baseCatalog),previousBaseCatalogSha256:feedback.previousBaseCatalogSha256,actualInputIds:revised.inputs.map(r=>r.item),durationMs:revised.duration,sellPrice:ITEMS[revised.output].sell,transparentPadding:true,uniqueSources:6,uniqueRenders:6,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 田园碗重设计与成品尺寸',round:27,phase:'recipe-artwork',reviewId,status:'STARTER_SELECTIONS_CONFIRMED_HARVEST_AND_TWO_SIZES_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,latestSteering:feedback.latestSteering,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,recipeRevision:feedback.recipeRevision,counts,previousFinalReviews:previous.previousFinalReviews,recipeProgress:{total:123,legacySamplesSelected:7,reviewCovered:13,notYetIndividuallyReviewed:110,currentRedesigns:1,presentationPending:2},contacts,checks,exportInspections,samples:rows};
await writeFile(path.join(site,'round27.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round27.html'),'utf8');if(!template.includes('/*__ROUND27_DATA__*/'))throw Error('Round27 template marker missing');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND27_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,key='proposal')=>({source:'output/plan4-food-review/site/'+r[key].source,preview512:'output/plan4-food-review/site/'+r[key].image,highres:'output/plan4-food-review/site/'+r[key].highres,sha256:r[key].sha256});
recipeBaseline.currentReview={round:27,reviewId,status:manifest.status,counts,batchId:'starter-fresh',manifest:'output/plan4-food-review/site/round27.json',url:'http://127.0.0.1:5284/',checks};
recipeBaseline.sizePolicy=feedback.sizePolicy;
recipeBaseline.plannedStarterBatch={reviewId,status:manifest.status,counts,recipeRevision:feedback.recipeRevision,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:r.status,ingredients:r.ingredients,recipeDescription:r.recipeDescription,expectedOccupancy:r.expectedOccupancy,selectedArtwork:artRef(r,r.status==='CANDIDATE'?'original':'proposal'),artwork:artRef(r)}))};
for(const row of rows){
  const item=recipeBaseline.items.find(r=>r.id===row.id),selectedNew=feedback.selectedNewCodes.includes(row.code);
  item.choice=selectedNew?'USER_SELECTED_NEW':'USER_SELECTED_ORIGINAL';
  item.userReview=row.status==='CANDIDATE'?'ORIGINAL_SELECTED_REDESIGN_REQUESTED':row.status==='SIZE_PENDING'?'ARTWORK_SELECTED_PRESENTATION_PENDING':'ARTWORK_AND_PRESENTATION_CONFIRMED';
  item.latestReview={reviewId,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};
  item.proposal={reviewId,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};
  item.selectedArtwork={reviewId:feedback.sourceReviewId,selection:selectedNew?'round26-new':'original',userAcceptedArtwork:true,presentationStatus:row.status==='SIZE_PENDING'?'PENDING_USER':'SELECTED_EXISTING_SIZE',expectedOccupancy:row.status==='CANDIDATE'?row.priorExpectedOccupancy:row.expectedOccupancy,artwork:artRef(row,row.status==='CANDIDATE'?'original':'proposal')};
  if(row.id===feedback.redesignId){item.priorRecipe={ingredients:row.oldIngredients,description:row.oldRecipeDescription,baseCatalogSha256:feedback.previousBaseCatalogSha256};item.ingredients=row.ingredients;item.recipeDescription=row.recipeDescription;item.recipeRevision={...feedback.recipeRevision,artworkStatus:'PENDING_USER'};}
}
if(legacyBefore!==JSON.stringify(recipeBaseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW')))throw Error('Legacy recipe sample choices changed');
if(retainedBefore!==JSON.stringify([materialBaseline.plannedMilkChain,materialBaseline.plannedExoticChain]))throw Error('Retained ingredient state changed');
recipeBaseline.counts={total:123,legacySamplesSelected:7,reviewCovered:13,notYetIndividuallyReviewed:110,currentCandidates:1,presentationPending:2};
await writeFile(recipeBaselineFile,JSON.stringify(recipeBaseline,null,2)+'\n');
const acceptedFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=JSON.parse(await readFile(acceptedFile,'utf8'));
const entry={reviewId:feedback.sourceReviewId,date:feedback.date,userQuote:feedback.userQuote,latestSteering:feedback.latestSteering,status:'TWO_STARTER_NEW_FOUR_ORIGINAL_BASELINES_HARVEST_REDESIGN_REQUESTED',selectedNewCodes:feedback.selectedNewCodes,selectedOriginalCodes:feedback.selectedOriginalCodes,selectedArtwork:rows.map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:r.sourceSelection,expectedOccupancy:r.priorExpectedOccupancy})),redesignRequestedIds:[feedback.redesignId],sizePolicy:feedback.sizePolicy,nextReviewId:reviewId,recipeRevision:feedback.recipeRevision};
const at=book.reviews.findIndex(r=>r.reviewId===feedback.sourceReviewId);if(at<0)book.reviews.push(entry);else book.reviews[at]=entry;
await writeFile(acceptedFile,JSON.stringify(book,null,2)+'\n');
await mkdir(path.join(root,'output/plan4-round27-work'),{recursive:true});await writeFile(path.join(root,'output/plan4-round27-work/checks.json'),JSON.stringify({reviewId,counts,checks,recipeRevision:feedback.recipeRevision,exportInspections,humanAcceptance:'PENDING_HARVEST_ARTWORK_AND_TWO_DISH_PRESENTATIONS'},null,2)+'\n');
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks,url:'http://127.0.0.1:5284/'},null,2));

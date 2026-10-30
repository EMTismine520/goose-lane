import { createHash } from 'node:crypto';
import { access, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { tsImport } from 'tsx/esm/api';
import { onionRiceCandidate } from '../artwork/plan4-food/round34/onion-rice.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const json=async f=>JSON.parse(await readFile(f,'utf8'));
const saveJson=(f,v)=>writeFile(f,JSON.stringify(v,null,2)+'\n');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=await json(path.join(root,'artwork/plan4-food/round34-feedback.json'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
try{await access(path.join(archive,'round33.json'));}catch{
  if((await json(path.join(site,'samples.json'))).reviewId!==feedback.sourceReviewId)throw Error('Round33 review required before archiving');
  await cp(site,archive,{recursive:true,errorOnExist:true,force:false});
}
const previous=await json(path.join(archive,'round33.json'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==4)throw Error('Round33 archive differs');
const starterFinal=await json(path.join(site,'starter-final.json'));
const homeFinal=await json(path.join(site,'home-final.json'));
const coldFinal=await json(path.join(site,'cold-final.json'));
const drinkFinal=await json(path.join(site,'drinks-final.json'));
for(const [record,key,count]of [[starterFinal,'confirmedStarterReviewId',6],[homeFinal,'confirmedHomeReviewId',10],[coldFinal,'confirmedColdReviewId',5],[drinkFinal,'confirmedDrinkReviewId',10]])if(record.reviewId!==previous[key]||record.samples.length!==count||record.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Confirmed recipe inventory differs');
const materialBaseline=await json(path.join(output,'material-baseline.json'));
const recipeBaselineFile=path.join(output,'recipe-baseline.json'),recipeBaseline=await json(recipeBaselineFile);
const baseCatalog=await readFile(path.join(root,'src/content/catalog.ts')),expansion=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(baseCatalog)!==feedback.actualBaseCatalogSha256||hash(expansion)!==feedback.actualExpansionSha256)throw Error('Actual recipe content changed');
const {RECIPES,ITEMS}=await tsImport('../src/content/catalog.ts',import.meta.url);
const contract=await json(path.join(root,'artwork/plan4-food/content-contract.json'));
for(const target of contract.rawItems)if(ITEMS[target.id]?.name!==target.name)throw Error('Ingredient identity differs: '+target.id);
for(const target of contract.recipes){const actual=RECIPES.find(r=>r.id===target.id);if(actual?.name!==target.name||JSON.stringify(actual.inputs)!==JSON.stringify(target.inputs))throw Error('Recipe identity differs: '+target.id);}
for(const actual of JSON.parse(expansion.toString('utf8')).recipes)if(JSON.stringify(actual.inputNames)!==JSON.stringify(actual.inputs.map(r=>ITEMS[r.item].name)))throw Error('Input labels differ: '+actual.id);
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
for(const dir of ['assets/round34/proposal','assets/round34/highres','sources/round34','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(id,art){
  const files={source:`sources/round34/${id}-proposal.svg`,png:`assets/round34/proposal/${id}.png`,image:`assets/round34/proposal/${id}.webp`,highres:`assets/round34/highres/${id}-proposal.png`};
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
if(starterFinal.samples.length!==6)throw Error('Six confirmed starter dishes required');
let retainedCount=0;
for(const chain of [materialBaseline.plannedMilkChain,materialBaseline.plannedExoticChain])for(const row of chain.slots){
  const a=row.artwork;
  for(const [file,digest]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error('Retained ingredient artwork changed');
  retainedCount++;
}
if(retainedCount!==15)throw Error('Retained milk or fruit scope differs');
const legacyItems=recipeBaseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW');
if(legacyItems.length!==3)throw Error('Three unrelated active legacy recipe selections required');
const legacySnapshot=()=>JSON.stringify(legacyItems.map(r=>({id:r.id,choice:r.choice,userReview:r.userReview,selectedArtwork:r.selectedArtwork})));
const legacyBefore=legacySnapshot();
function legacyAsset(item){
  const a=item.selectedArtwork.artwork;
  return {source:a.source,png:a.png512||a.preview512.replace(/\.webp$/,'.png'),image:a.preview512,highres:a.highres,sha256:a.sha256};
}
for(const item of legacyItems)await verify(legacyAsset(item),item.id,[root]);
const rows=[],exportInspections={};
for(const old of previous.samples){
  await verify(old.original,old.code+'-v4');await verify(old.proposal,old.code+'-round33');
  const item=recipeBaseline.items.find(r=>r.id===old.id),actual=RECIPES.find(r=>r.output===old.id);
  if(!item||item.group!==feedback.batchId||actual?.name!==old.name||actual.description!==old.recipeDescription||JSON.stringify(actual.inputs.map(r=>ITEMS[r.item].name))!==JSON.stringify(old.ingredients))throw Error('Pot recipe semantics differ');
  if(hash(await readFile(path.join(root,item.original.source)))!==item.original.sourceSha256)throw Error('Immutable V4 original changed');
  const selectedNew=feedback.selectedNewCodes.includes(old.code),selectedOriginal=feedback.selectedOriginalCodes.includes(old.code),redesign=feedback.redesignCodes.includes(old.code);
  if(Number(selectedNew)+Number(selectedOriginal)+Number(redesign)!==1)throw Error('Ambiguous pot feedback');
  const variant=selectedNew?'proposal':'original',selected=old[variant],occupancy=selectedNew?old.expectedOccupancy:.8;
  if(!redesign){
    await archivedArtwork(selected,occupancy,old.code,site);
    rows.push({...old,status:'ACCEPTED',statusLabel:selectedNew?'新版 · 已确认采用':'原版 · 已确认保留',displayLabel:selectedNew?'已采用新版':'已保留原版',comparisonLabel:selectedNew?'第33轮新版 · 已确认':'V4原版 · 已确认',selection:'selected',artworkStatus:'USER_ACCEPTED',artworkSelection:selectedNew?'round33-new':'original',changeType:'unchanged',baselineAcceptedReviewId:feedback.sourceReviewId,baselineSelectionPreserved:true,sourceSelection:{reviewId:feedback.sourceReviewId,variant,sha256:selected.sha256},selectedArtwork:selected,expectedOccupancy:occupancy,priorExpectedOccupancy:occupancy,reason:selectedNew?'按本次选择固定第33轮新版，母稿与三档图片导出保持原字节。':'按本次选择保留V4原版，母稿与全部导出保持原字节。',design:selectedNew?old.design:{identity:'保留用户选定的V4原版形状、配色与细描边。',size:'主体80%，原字节保留。'},sourceLabel:'本次已确认选用，当前不改形状、配色、描边、体量或导出。',authoringSource:selectedNew?old.authoringSource:item.original.source,v4Original:old.original,original:selected,proposal:selected});
    exportInspections[old.code]={copiedSourceAndExportsByteIdentical:true};
  }else{
    const candidate=onionRiceCandidate;
    if(candidate.id!==old.id||candidate.name!==old.name||candidate.expectedOccupancy!==.82)throw Error('Onion redesign contract differs');
    const art=await render(Buffer.from(candidate.svg),old.code+'-new',.82),proposal=await save(old.id,art);
    if(proposal.sha256.source===old.proposal.sha256.source||proposal.sha256.image===old.proposal.sha256.image)throw Error('Onion redesign unchanged');
    rows.push({...old,status:'CANDIDATE',statusLabel:'块瓣状洋葱新稿 · 待你确认',displayLabel:'重绘新稿 · 待确认',comparisonLabel:'第33轮条状新稿 · 已撤回',selection:'candidate',artworkStatus:'ONION_CHUNK_REDESIGN_PENDING',changeType:'redesign',expectedOccupancy:.82,priorExpectedOccupancy:old.expectedOccupancy,reason:candidate.reason,design:candidate.design,sourceLabel:'左侧是未被采用的第33轮条状新稿，仅作修改前对照；右侧为本轮块瓣状洋葱新稿。V4原版仍默认保留，尚未确认采用本轮新版。',authoringSource:'artwork/plan4-food/round34/onion-rice.mjs',comparisonSourceSelection:{reviewId:feedback.sourceReviewId,variant:'proposal',status:'REJECTED_BY_USER',sha256:old.proposal.sha256},defaultArtwork:old.original,v4Original:old.original,original:old.proposal,proposal});
    exportInspections[old.code]=art.inspection;
  }
}
if(rows.length!==4||rows.filter(r=>r.status==='CANDIDATE').length!==1||rows.find(r=>r.status==='CANDIDATE').code!=='DS34')throw Error('Pot selection scope differs');
if(new Set(rows.map(r=>r.proposal.sha256.source)).size!==4||new Set(rows.map(r=>r.proposal.sha256.image)).size!==4)throw Error('Duplicate pot artwork');
const counts={total:4,selectedNew:2,selectedOriginal:1,accepted:3,candidates:1,pending:1,rejectedPriorCandidates:1};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
async function contact(items,size,compare){
  const cols=compare?1:4,cw=compare?600:200,ch=compare?244:190,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch,layers=[];
  const texts=[`<text x="20" y="27" font-size="16" font-weight="700">${compare?'焦香洋葱饭 / 块瓣状重绘':'料理锅四道 / 本次选用与重绘'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：第33轮条状新稿，已撤回；右：本轮重绘，待确认':'DS32原版；DS33、DS35新版已确认；DS34重绘待确认'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((116-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+135}" text-anchor="middle" font-size="11">${j?'第34轮块瓣状新稿 · 待确认':'第33轮条状新稿 · 已撤回'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+157}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    texts.push(`<text x="${x+cw/2}" y="${y+177}" text-anchor="middle" font-size="10" fill="#84745f">${xml(compare?'少量短块瓣 · 形态与朝向各异 · 金棕焦边与柔紫内层':row.statusLabel)}</text>`);
    if(compare)texts.push(`<text x="${x+cw/2}" y="${y+204}" text-anchor="middle" font-size="10" fill="#84745f">主料：${xml(row.ingredients.join('、'))} · 82%体量 · 清楚细深描边</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round34-${compare?'redesign':'pot'}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={redesign:[],pot:[]};for(const size of [40,96]){contacts.redesign.push(await contact(rows.filter(r=>r.status==='CANDIDATE'),size,true));contacts.pot.push(await contact(rows,size,false));}
const recipeProgress={...previous.recipeProgress,currentCandidates:1,currentAccepted:3,currentRedesigns:1,reviewCovered:38,notYetIndividuallyReviewed:85};
const checks={confirmedStarterSourcesAndExportsByteIdentical:6,confirmedHomeSourcesAndExportsByteIdentical:10,confirmedColdSourcesAndExportsByteIdentical:5,confirmedDrinkSourcesAndExportsByteIdentical:10,previousFixedMaterialSourcesAndExportsByteIdentical:107,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,legacyRecipeSampleSelectionsPreserved:3,selectedNewSourcesAndExportsByteIdentical:2,selectedOriginalSourcesAndExportsByteIdentical:1,newOnionChunkArtwork:1,rejectedStripCandidateNotAdopted:true,DS34OriginalRemainsUnconfirmedDefault:true,potOriginalSourcesUnchanged:4,recipeDescriptionsAndIngredientsMatchCurrentCatalog:true,actualRecipeChangesThisRound:0,actualGameNameChanges:0,actualExpansionContentUnchanged:true,actualExpansionSha256:hash(expansion),actualBaseCatalogUnchanged:true,actualBaseCatalogSha256:hash(baseCatalog),transparentPadding:true,uniqueSources:4,uniqueRenders:4,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 焦香洋葱饭重绘',round:34,phase:'recipe-artwork',reviewId,status:'THREE_POT_SELECTIONS_CONFIRMED_ONION_REDESIGN_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,counts,previousFinalReviews:previous.previousFinalReviews,previousRecipeFinalReviews:previous.previousRecipeFinalReviews,confirmedStarterReviewId:starterFinal.reviewId,confirmedHomeReviewId:homeFinal.reviewId,confirmedColdReviewId:coldFinal.reviewId,confirmedDrinkReviewId:drinkFinal.reviewId,recipeProgress,contacts,checks,exportInspections,samples:rows};
await saveJson(path.join(site,'round34.json'),manifest);await saveJson(path.join(site,'samples.json'),manifest);
const template=await readFile(path.join(root,'scripts/build-plan4-round34.html'),'utf8');if(!template.includes('/*__ROUND34_DATA__*/'))throw Error('Round34 template marker missing');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND34_DATA__*/',JSON.stringify(manifest).replace(/</g,'\u003c')));
const artRef=(r,key='proposal')=>({source:'output/plan4-food-review/site/'+r[key].source,png512:'output/plan4-food-review/site/'+r[key].png,preview512:'output/plan4-food-review/site/'+r[key].image,highres:'output/plan4-food-review/site/'+r[key].highres,sha256:r[key].sha256});
recipeBaseline.currentReview={round:34,reviewId,status:manifest.status,counts,batchId:feedback.batchId,manifest:'output/plan4-food-review/site/round34.json',url:'http://127.0.0.1:5284/?round=34',checks};
recipeBaseline.plannedPotBatch={reviewId,sourceReviewId:feedback.sourceReviewId,status:manifest.status,count:4,counts,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:r.status,ingredients:r.ingredients,recipeDescription:r.recipeDescription,expectedOccupancy:r.expectedOccupancy,defaultArtwork:artRef(r,r.status==='CANDIDATE'?'defaultArtwork':'proposal'),artwork:artRef(r),...(r.status==='ACCEPTED'?{sourceSelection:r.sourceSelection}:{rejectedPreviousCandidate:r.comparisonSourceSelection})}))};
for(const row of rows){
  const item=recipeBaseline.items.find(r=>r.id===row.id);
  item.latestReview={reviewId,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={...item.latestReview};
  if(row.status==='ACCEPTED'){
    item.choice=row.artworkSelection==='original'?'USER_SELECTED_ORIGINAL':'USER_SELECTED_NEW';item.userReview='ARTWORK_AND_PRESENTATION_CONFIRMED';
    item.selectedArtwork={reviewId:feedback.sourceReviewId,selection:row.artworkSelection,selectedVariant:row.sourceSelection.variant,userAcceptedArtwork:true,presentationStatus:'USER_CONFIRMED',expectedOccupancy:row.expectedOccupancy,sourceSelection:row.sourceSelection,artwork:artRef(row)};
  }else{
    item.choice='RETAIN_ORIGINAL_PENDING_REVIEW';item.userReview='REDESIGN_REQUESTED_ORIGINAL_DEFAULT_RETAINED';
    item.rejectedCandidate={reviewId:feedback.sourceReviewId,reason:'紫洋葱不要呈条状且重复',artwork:artRef(row,'original'),sourceSelection:row.comparisonSourceSelection};
    if(item.selectedArtwork?.userAcceptedArtwork)throw Error('DS34 acceptance must not be invented');
  }
}
if(legacyBefore!==legacySnapshot())throw Error('Prior legacy recipe selection changed');
recipeBaseline.counts={...recipeBaseline.counts,currentCandidates:1,currentAccepted:3,reviewCovered:38,notYetIndividuallyReviewed:85};await saveJson(recipeBaselineFile,recipeBaseline);
const bookFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=await json(bookFile);
const acceptance={reviewId:feedback.sourceReviewId,date:feedback.date,userQuote:feedback.userQuote,status:manifest.status,selectedNewCodes:feedback.selectedNewCodes,selectedOriginalCodes:feedback.selectedOriginalCodes,redesignCodes:feedback.redesignCodes,rejectedCandidateCodes:feedback.rejectedCandidateCodes,counts,selectedArtwork:rows.filter(r=>r.status==='ACCEPTED').map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:r.sourceSelection,expectedOccupancy:r.expectedOccupancy,presentationStatus:'USER_CONFIRMED'})),rejectedCandidates:rows.filter(r=>r.status==='CANDIDATE').map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:r.comparisonSourceSelection,originalDefaultRetained:true,originalUserAccepted:false,redesignPending:true})),actualGameArtIntegrationPending:true};
const at=book.reviews.findIndex(r=>r.reviewId===feedback.sourceReviewId);if(at<0)book.reviews.push(acceptance);else book.reviews[at]=acceptance;await saveJson(bookFile,book);
await mkdir(path.join(root,'output/plan4-round34-work'),{recursive:true});await saveJson(path.join(root,'output/plan4-round34-work/checks.json'),{reviewId,counts,recipeProgress,checks,exportInspections,humanAcceptance:'PENDING_DS34_ONION_CHUNK_ARTWORK'});
console.log(JSON.stringify({reviewId,status:manifest.status,counts,recipeProgress,checks,url:'http://127.0.0.1:5284/?round=34'},null,2));

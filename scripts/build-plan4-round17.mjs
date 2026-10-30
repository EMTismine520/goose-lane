import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, cp, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { mangoRedesign } from '../artwork/plan4-food/round17/mango.mjs';
import { milkFrontCandidates } from '../artwork/plan4-food/round17/milk-front.mjs';
import { milkTailCandidates } from '../artwork/plan4-food/round17/milk-tail.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round17-feedback.json'),'utf8'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
try{await access(path.join(archive,'round16.json'));}catch{const live=JSON.parse(await readFile(path.join(site,'round16.json'),'utf8'));if(live.reviewId!==feedback.sourceReviewId)throw Error('Source review differs');await cp(site,archive,{recursive:true,errorOnExist:true,force:false});}
const previous=JSON.parse(await readFile(path.join(archive,'round16.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==19)throw Error('Round 16 archive incomplete');
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const content=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(content)!==feedback.actualContentSha256)throw Error('Actual game content changed');
const candidates=new Map([mangoRedesign,...milkFrontCandidates,...milkTailCandidates].map(x=>[x.id,x]));
if(candidates.size!==8||mangoRedesign.id!==feedback.redesignTargetId)throw Error('Round 17 scope differs');
function bounds(data,info){
  let left=info.width,top=info.height,right=-1,bottom=-1,edge=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    const a=data[(y*info.width+x)*4+3];
    if(x===0||y===0||x===info.width-1||y===info.height-1)edge=Math.max(edge,a);
    if(a<=16)continue;
    left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<left)throw Error('Artwork is empty');
  return {left,top,width:right-left+1,height:bottom-top+1,edge};
}
function validate(svg,id){
  if(/<(?:image|script|foreignObject)\b|(?:href|src)\s*=|data:/i.test(svg))throw Error(id+': artwork must be self-contained editable SVG');
  const ids=[...svg.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)throw Error(id+': duplicate SVG definition');
  for(const m of svg.matchAll(/url\(["']?#([^)'"\s]+)["']?\)/g))if(!ids.includes(m[1]))throw Error(id+': missing definition '+m[1]);
  const box=svg.match(/\bviewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
  if(!box||box.length!==4||box.some(v=>!Number.isFinite(v))||box[2]<=0||box[3]<=0)throw Error(id+': invalid viewBox');
  return box;
}
async function inspect(bytes,size,id,expected){
  const meta=await sharp(bytes).metadata();
  if(meta.width!==size||meta.height!==size||!meta.hasAlpha)throw Error(id+': dimensions or transparency differ');
  const raw=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  const occupancy=Math.max(b.width,b.height)/size;
  if(b.edge||Math.abs(occupancy-expected)>.006)throw Error(id+': incorrect occupancy '+occupancy+' / '+expected);
  return {occupancy,bounds:b};
}
async function render(source,id,occupancy){
  const svg=source.toString('utf8'),box=validate(svg,id);
  const raw=await sharp(source).resize(1024,1024).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  if(b.edge)throw Error(id+': master touches its canvas edge');
  const side=Math.max(b.width/1024*box[2],b.height/1024*box[3])/occupancy;
  const cx=box[0]+(b.left+b.width/2)/1024*box[2],cy=box[1]+(b.top+b.height/2)/1024*box[3];
  const fitted=svg.replace(/(<svg\b[^>]*\bviewBox\s*=\s*)["'][^"']+["']/,'$1"'+[cx-side/2,cy-side/2,side,side].map(v=>v.toFixed(6)).join(' ')+'"');
  const highres=await sharp(Buffer.from(fitted)).resize(1024,1024).png().toBuffer(),png=await sharp(highres).resize(512,512).png().toBuffer(),webp=await sharp(png).webp({lossless:true,effort:6}).toBuffer();
  const inspection={png:await inspect(png,512,id,occupancy),webp:await inspect(webp,512,id,occupancy),highres:await inspect(highres,1024,id,occupancy)};
  return {source,png,webp,highres,inspection};
}

async function archivedArtwork(asset,occupancy,id,base=archive){
  const art={};
  for(const [key,field,digest]of [['source','source','source'],['png','png','png'],['webp','image','image'],['highres','highres','highres']]){
    art[key]=await readFile(path.join(base,asset[field]));if(hash(art[key])!==asset.sha256[digest])throw Error(id+': archived artwork differs');
  }
  validate(art.source.toString('utf8'),id);
  for(const [key,size]of [['png',512],['webp',512],['highres',1024]])await inspect(art[key],size,id,occupancy);
  return art;
}
for(const dir of ['assets/round17/original','assets/round17/proposal','assets/round17/highres','sources/round17','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round17/${id}-${group}.svg`,png:`assets/round17/${group}/${id}.png`,image:`assets/round17/${group}/${id}.webp`,highres:`assets/round17/highres/${id}-${group}.png`};
  for(const [key,bytes]of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]])await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
const seaRows=[];
for(const old of previous.samples.filter(r=>r.chain==='fresh-sea')){
  await archivedArtwork(old.proposal,old.expectedOccupancy,old.code);
  const replacement=feedback.acceptedReplacementCodes.includes(old.code);
  seaRows.push({...old,index:seaRows.length+1,status:'ACCEPTED',statusLabel:'用图与尺寸已确认',displayLabel:'已确认选用',selection:'selected',nameChanged:replacement,artworkStatus:'ARTWORK_SELECTED',sourceReviewId:feedback.sourceReviewId,sourceTargetId:old.id,selectedFromReviewId:feedback.sourceReviewId,confirmedPresentationReviewId:feedback.sourceReviewId,acceptedReplacement:replacement,actualGameName:old.actualGameName||old.oldName,sourceSelection:{reviewId:feedback.sourceReviewId,variant:'proposal',sha256:old.proposal.sha256}});
}
if(seaRows.length!==11||feedback.acceptedReplacementCodes.some((code,i)=>seaRows.find(r=>r.code===code)?.name!==feedback.acceptedReplacementNames[i]))throw Error('Confirmed seafood identity differs');
const seaReviewId=hash(JSON.stringify(['sea-final',seaRows.map(r=>[r.id,r.proposal.sha256,r.expectedOccupancy])])).slice(0,12);
const seaFinal={title:'海鲜 · 已确认选用',reviewId:seaReviewId,sourceReviewId:feedback.sourceReviewId,status:'ALL_ARTWORK_AND_PRESENTATION_CONFIRMED',userQuote:feedback.userQuote,chain:'fresh-sea',counts:{total:11,accepted:11},checks:{selectedSourceAndExportsByteIdentical:11,actualGameContentUnchanged:true,replacementMappingsPendingRuntimeIntegration:3},samples:seaRows};
await writeFile(path.join(site,'sea-final.json'),JSON.stringify(seaFinal,null,2)+'\n');
const finalStyle=(await readFile(path.join(site,'seasonal-final.html'),'utf8')).match(/<style>([\s\S]*?)<\/style>/)[1];
const seaFinalHtml=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>鹅巷食光 · 海鲜已确认选用</title><style>${finalStyle}</style><main><nav><a href="index.html">← 当前审阅</a><a href="poultry-final.html">禽肉已确认</a><a href="spice-final.html">香料已确认</a><a href="seasonal-final.html">时蔬已确认</a></nav><h1>海鲜 · 用图与尺寸已确认</h1><p>鱿鱼、生蚝采用第15轮新版；扇贝、鲷鱼、青蟹采用第16轮重设计；其余使用原版或此前既定稿，龙虾保留原版。前五级按66%／72%／68%／70%／70%控制体量。已选资产原字节固定，替换映射待后续统一接入游戏。</p><div class="grid">${seaRows.map(r=>`<article><a href="${r.proposal.highres}" target="_blank" rel="noopener"><img src="${r.proposal.image}" alt="${xml(r.name)}" width="96" height="96"></a><h2>${r.code} · ${xml(r.name)}</h2><p>已确认 · 主体约${Math.round(r.expectedOccupancy*100)}%</p><a href="${r.proposal.source}" target="_blank" rel="noopener">SVG母稿</a> · <a href="${r.proposal.highres}" target="_blank" rel="noopener">1024px大图</a></article>`).join('')}</div><footer>海鲜11项固定摘要 · ${seaReviewId} · <a href="sea-final.json">来源清单</a></footer></main></html>`;
await writeFile(path.join(site,'sea-final.html'),seaFinalHtml);
const previousFinalReviews=[...previous.previousFinalReviews,{chain:'fresh-sea',reviewId:seaReviewId,stem:'sea-final',count:11}];
let preservedPrevious=0;
for(const entry of previousFinalReviews){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  if(final.reviewId!==entry.reviewId||final.samples.length!==entry.count||final.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Confirmed final differs');
  for(const row of final.samples){for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(site,row.proposal[key])))!==row.proposal.sha256[key]||hash(await readFile(path.join(archive,row.proposal[key])))!==row.proposal.sha256[key])throw Error(row.code+': fixed artwork changed');preservedPrevious++;}
}
if(preservedPrevious!==37)throw Error('Confirmed cross-chain count differs');
const rows=[],exportInspections={};
let preservedFruit=0;
for(const old of previous.samples.filter(r=>r.chain==='fresh-exotic')){
  const fresh=old.id===feedback.redesignTargetId,candidate=candidates.get(old.id),beforeArt=await archivedArtwork(old.proposal,old.expectedOccupancy,old.code);
  const art=fresh?await render(Buffer.from(candidate.svg),old.code+'-new',.68):beforeArt;
  const original=await save('original',old.id,beforeArt),proposal=await save('proposal',old.id,art);
  if(!fresh){if(JSON.stringify(original.sha256)!==JSON.stringify(proposal.sha256))throw Error('Retained fruit differs');preservedFruit++;}
  else if(candidate.name!=='芒果'||candidate.expectedOccupancy!==.68||original.sha256.source===proposal.sha256.source)throw Error('Mango needs new design');
  const accepted=old.code==='EX08';
  rows.push({...old,index:rows.length+1,status:fresh?'CANDIDATE':accepted?'ACCEPTED':'RETAINED',statusLabel:fresh?'芒果重设计 · 待你选择':accepted?'桑葚新版 · 已采用':'鲜果当前用图保持',displayLabel:fresh?'新版候选 · 待选':accepted?'新版 · 已采用':'当前选用与大小保持',artworkStatus:fresh?'MANGO_REDESIGN_PENDING':old.artworkStatus,artworkSelection:fresh?'redesign':old.artworkSelection,nameChanged:false,oldName:old.name,changeType:fresh?'redesign':'retained',sourceLabel:fresh?'芒果独立重画，突出橙红长果与金橙切面，避免与柠檬混淆':'第16轮当前选用及显示大小全档原字节保持',reason:fresh?candidate.reason:'当前选用及尺寸原样保持',design:fresh?candidate.design:old.design,expectedOccupancy:old.expectedOccupancy,original,proposal,...(fresh?{authoringSource:'artwork/plan4-food/round17/mango.mjs',sourceOrigin:'ROUND17_MANGO_REDESIGN'}:{})});
  if(fresh)exportInspections[old.code]=art.inspection;
}
const milkItems=baseline.items.filter(r=>r.chain===feedback.nextChain);
const cheeseArchive=path.join(output,'checkpoints',feedback.originalCheeseReviewId,'site');
const cheeseReview=JSON.parse(await readFile(path.join(cheeseArchive,'samples.json'),'utf8'));
const cheese=cheeseReview.samples.find(r=>r.id==='fresh-milk-3');
if(!cheese||cheese.selection!=='original')throw Error('Original cheese slice selection missing');
for(const [i,item]of milkItems.entries()){
  const candidate=candidates.get(item.id),occupancy=feedback.milkOccupancies[i],code='MI'+String(i+1).padStart(2,'0');
  if(item.level!==i+1||candidate?.name!==item.name||candidate.expectedOccupancy!==occupancy||feedback.orderedMilkNames[i]!==item.name)throw Error('Milk candidate identity differs');
  const source=await readFile(path.join(root,item.original.source));if(hash(source)!==item.original.sourceSha256)throw Error('Original dairy master changed');
  let beforeArt;
  if(i===2){const asset={source:cheese.source,png:cheese.png,image:cheese.after,highres:cheese.highres,sha256:{source:cheese.sha256.source,png:cheese.sha256.png512,image:cheese.sha256.webp512,highres:cheese.sha256.highres}};beforeArt=await archivedArtwork(asset,.8,code,cheeseArchive);if(hash(beforeArt.source)!==hash(source))throw Error('Original cheese source drift');}
  else beforeArt=await render(source,code+'-original',.8);
  const art=await render(Buffer.from(candidate.svg),code+'-new',occupancy),original=await save('original',item.id,beforeArt),proposal=await save('proposal',item.id,art);
  if(original.sha256.source===proposal.sha256.source||original.sha256.image===proposal.sha256.image)throw Error('All seven dairy items need independent new artwork');
  rows.push({index:rows.length+1,code,id:item.id,name:item.name,oldName:item.name,nameChanged:false,chain:item.chain,group:'乳品',level:item.level,status:'CANDIDATE',statusLabel:i===2?'原版已选用 · 新稿另供选择':'乳品全新设计 · 待你选择',displayLabel:'新版候选 · 待选',selection:'candidate',artworkStatus:'NEW_DAIRY_CANDIDATE_PENDING',artworkSelection:'candidate',changeType:'redesign',expectedOccupancy:occupancy,priorExpectedOccupancy:.8,sourceLabel:i===2?'芝士片此前已选原版来源全档保留，新稿单独待选':'V4原版保留，新稿全新绘制供选择',reason:candidate.reason,design:candidate.design,authoringSource:'artwork/plan4-food/round17/'+(i<3?'milk-front.mjs':'milk-tail.mjs'),...(i===2?{baselineAcceptedReviewId:feedback.originalCheeseReviewId,baselineSelectionPreserved:true}:{}),original,proposal});
  exportInspections[code]=art.inspection;
}
if(rows.length!==15||preservedFruit!==7||milkItems.length!==7||rows.filter(r=>r.status==='CANDIDATE').length!==8)throw Error('Round 17 inventory differs');
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
for(const row of rows){row.sourceReviewId=reviewId;row.sourceTargetId=row.id;}
async function contact(items,size,mode){
  const compare=mode==='proposals',cols=compare?4:4,cw=compare?280:180,ch=compare?180:158,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const titles={proposals:'芒果与乳品 / 八项原版与新版对照',candidates:'芒果重设计与乳品 / 八张新稿',fruit:'鲜果整链 / 芒果新稿待选',milk:'乳品整链 / 七项全新候选'};
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${titles[mode]} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：原版或当前稿；右：本轮候选，由你决定':'细深色描边 · 前五级控制体量 · 新稿仍待选用'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+118}" text-anchor="middle" font-size="10">${j?'新版候选':row.code==='EX04'?'当前芒果':row.baselineAcceptedReviewId?'原版 · 已选用':'原版'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+139}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    if(!compare)texts.push(`<text x="${x+cw/2}" y="${y+154}" text-anchor="middle" font-size="9" fill="#84745f">${xml(row.status==='CANDIDATE'?'新版候选 · 待选择':row.displayLabel)}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round17-${mode}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={proposals:[],candidates:[],fruit:[],milk:[]};for(const size of [40,96])for(const [mode,items]of [['proposals',rows.filter(r=>r.status==='CANDIDATE')],['candidates',rows.filter(r=>r.status==='CANDIDATE')],['fruit',rows.filter(r=>r.chain==='fresh-exotic')],['milk',rows.filter(r=>r.chain==='fresh-milk')]])contacts[mode].push(await contact(items,size,mode));
const counts={total:15,candidates:8,accepted:1,retained:6};
const checks={confirmedSeaSourceAndExportsByteIdentical:11,previousConfirmedSourceAndExportsByteIdentical:26,totalFixedSourceAndExportsByteIdentical:37,currentFruitSourceAndExportsByteIdentical:7,newMangoDesigns:1,newDairyDesigns:7,dairyOriginalSourcesUnchanged:7,originalCheeseSourceAndExportsByteIdentical:true,transparentPadding:true,actualGameContentUnchanged:true,actualContentSha256:hash(content),actualGameNameChanges:0,actualRecipeChanges:0,ingredientIdentitiesPreserved:15,uniqueSources:new Set(rows.map(r=>r.proposal.sha256.source)).size,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 芒果重设计与乳品新一轮',round:17,reviewId,status:'MANGO_AND_SEVEN_DAIRY_CANDIDATES_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,authoringPolicy:feedback.authoringPolicy,sizePolicy:feedback.sizePolicy,counts,previousFinalReviews,confirmedSeaReviewId:seaReviewId,contacts,checks,exportInspections,samples:rows};
await writeFile(path.join(site,'round17.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round17.html'),'utf8');if(!template.includes('/*__ROUND17_DATA__*/'))throw Error('Round 17 template marker missing');await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND17_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,field='proposal')=>({source:'output/plan4-food-review/site/'+r[field].source,preview512:'output/plan4-food-review/site/'+r[field].image,highres:'output/plan4-food-review/site/'+r[field].highres,sha256:r[field].sha256});
baseline.currentReview={round:17,reviewId,status:manifest.status,scope:feedback.scope,counts,manifest:'output/plan4-food-review/site/round17.json',url:'http://127.0.0.1:5284/',feedbackSource:'artwork/plan4-food/round17-feedback.json',checks,sizePolicy:feedback.sizePolicy};
baseline.finalizedSeaReview={reviewId:seaReviewId,sourceReviewId:feedback.sourceReviewId,status:seaFinal.status,count:11,manifest:'output/plan4-food-review/site/sea-final.json',url:'http://127.0.0.1:5284/sea-final.html'};
baseline.plannedSeaChain={...baseline.plannedSeaChain,status:seaFinal.status,reviewId:seaReviewId,counts:{total:11,accepted:11,candidates:0},replacementNamesAreProposals:false,runtimeIntegrationStatus:'PENDING',slots:seaRows.map(r=>({id:r.id,code:r.code,name:r.name,actualGameName:r.actualGameName,level:r.level,status:'ACCEPTED',expectedOccupancy:r.expectedOccupancy,artwork:artRef(r)}))};
baseline.plannedMilkChain={status:'SEVEN_NEW_DAIRY_CANDIDATES_PENDING',reviewId,manifest:'output/plan4-food-review/site/round17.json',counts:{total:7,candidates:7},slots:rows.filter(r=>r.chain==='fresh-milk').map(r=>({id:r.id,code:r.code,name:r.name,level:r.level,status:r.status,expectedOccupancy:r.expectedOccupancy,baselineArtwork:artRef(r,'original'),artwork:artRef(r)}))};
baseline.plannedExoticChain={...baseline.plannedExoticChain,status:'MANGO_REDESIGN_PENDING_OTHER_CURRENT_RESULTS_RETAINED',reviewId,counts:{total:8,candidates:1,acceptedNew:1,retained:6},slots:rows.filter(r=>r.chain==='fresh-exotic').map(r=>({id:r.id,code:r.code,name:r.name,status:r.status,previousReviewStatus:r.previousReviewStatus,expectedOccupancy:r.expectedOccupancy,artwork:artRef(r)}))};
for(const row of [...seaRows,...rows]){const item=baseline.items.find(x=>x.id===row.id);if(!item)continue;item.latestReview={reviewId:row.chain==='fresh-sea'?seaReviewId:reviewId,code:row.code,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};if(row.chain==='fresh-sea')item.selectedArtwork={reviewId:feedback.sourceReviewId,userAccepted:true,selectedName:row.name,actualGameName:row.actualGameName,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy,runtimeIntegrationStatus:'PENDING'};item.proposal={reviewId:row.chain==='fresh-sea'?seaReviewId:reviewId,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};}
await writeFile(path.join(output,'material-baseline.json'),JSON.stringify(baseline,null,2)+'\n');
const acceptedFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=JSON.parse(await readFile(acceptedFile,'utf8'));
const entry={reviewId:feedback.sourceReviewId,date:feedback.date,userQuote:feedback.userQuote,status:'THREE_SEA_REPLACEMENTS_ACCEPTED_MANGO_REDESIGN_NEXT_DAIRY',acceptedReplacementCodes:feedback.acceptedReplacementCodes,acceptedReplacementArtwork:seaRows.filter(r=>r.acceptedReplacement).map(r=>({targetId:r.id,code:r.code,name:r.name,actualGameName:r.actualGameName,artwork:r.proposal,expectedOccupancy:r.expectedOccupancy})),finalizedSeaReviewId:seaReviewId,redesignRequestedIds:[feedback.redesignTargetId],nextCandidateChain:'fresh-milk',nextReviewId:reviewId};
const at=book.reviews.findIndex(x=>x.reviewId===feedback.sourceReviewId);if(at<0)book.reviews.push(entry);else book.reviews[at]=entry;await writeFile(acceptedFile,JSON.stringify(book,null,2)+'\n');
await mkdir(path.join(root,'output/plan4-round17-work'),{recursive:true});await writeFile(path.join(root,'output/plan4-round17-work/checks.json'),JSON.stringify({reviewId,counts,confirmedSeaReviewId:seaReviewId,checks,exportInspections,humanNewArtworkAcceptance:'PENDING_EIGHT'},null,2)+'\n');
console.log(JSON.stringify({reviewId,status:manifest.status,counts,seaReviewId,checks,url:'http://127.0.0.1:5284/'},null,2));

import { createHash } from 'node:crypto';
import { access, cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const sourceReviewId='1c520e665c1e',userQuote='确认采用新版。继续下一轮，要做得顶尖';
const contentSha256='771950d46856633eaea94d3547b27fff3b837c3945572d1ede46a943e8acd0c0';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async filename=>JSON.parse(await readFile(filename,'utf8'));
const saveJson=(filename,value)=>writeFile(filename,JSON.stringify(value,null,2)+'\n');
const archive=path.join(output,'checkpoints',sourceReviewId,'site');
try{await access(path.join(archive,'round23.json'));}catch{
  const live=await json(path.join(site,'round23.json'));
  if(live.reviewId!==sourceReviewId)throw Error('Round 23 source differs');
  await cp(site,archive,{recursive:true,errorOnExist:true,force:false});
}
const previous=await json(path.join(archive,'round23.json'));
if(previous.reviewId!==sourceReviewId||previous.samples.length!==15)throw Error('Round 23 archive differs');
if(hash(await readFile(path.join(root,'src/content/expansion-data.json')))!==contentSha256)throw Error('Actual content changed');
const baselineFile=path.join(output,'material-baseline.json'),baseline=await json(baselineFile);
const retainedBefore=JSON.stringify([baseline.plannedMilkChain,baseline.plannedExoticChain]);
async function verifyAsset(asset,id){
  for(const base of [site,archive])for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': selected asset changed');
}
let fixedCount=0;
for(const entry of previous.previousFinalReviews){
  const fixed=await json(path.join(site,entry.stem+'.json'));
  if(fixed.reviewId!==entry.reviewId||fixed.samples.length!==entry.count||fixed.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Fixed review inventory differs');
  for(const row of fixed.samples){await verifyAsset(row.proposal,row.code);fixedCount++;}
}
if(fixedCount!==64)throw Error('Previous fixed count differs');
const rows=[];
for(const old of previous.samples.filter(r=>r.chain==='fresh-tea')){
  await verifyAsset(old.proposal,old.code);
  rows.push({...old,index:rows.length+1,status:'ACCEPTED',statusLabel:'用图与尺寸已确认',displayLabel:'新版 · 已确认',selection:'selected',artworkStatus:'USER_ACCEPTED',artworkSelection:'round23-new',changeType:'unchanged',selectedFromReviewId:sourceReviewId,confirmedPresentationReviewId:sourceReviewId,acceptedReviewId:sourceReviewId,userAcceptedNewArtwork:true,actualGameName:old.name,sourceSelection:{reviewId:sourceReviewId,variant:'proposal',sha256:old.proposal.sha256},sourceLabel:'第23轮新版及尺寸已确认，源稿与全部导出原字节保持',reason:'按用户本次确认固定第23轮六项新版及显示尺寸。',original:old.proposal,proposal:old.proposal});
}
if(rows.length!==6)throw Error('Tea selection scope differs');
const reviewId=hash(JSON.stringify(['tea-final',rows.map(r=>[r.id,r.proposal.sha256,r.expectedOccupancy])])).slice(0,12);
const status='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED';
const counts={total:6,accepted:6,selectedNew:6,selectedOriginal:0,candidates:0,sizePending:0,pending:0};
const checks={selectedSourceAndExportsByteIdentical:6,previousFixedSourceAndExportsByteIdentical:64,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,actualGameContentUnchanged:true,actualContentSha256:contentSha256,actualGameNameChanges:0,actualRecipeChanges:0};
const manifest={title:'茶饮 · 已确认选用',reviewId,sourceReviewId,status,userQuote,chain:'fresh-tea',counts,checks,previousFinalReviews:previous.previousFinalReviews,samples:rows};
await saveJson(path.join(site,'tea-final.json'),manifest);
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const style=(await readFile(path.join(site,'coffee-final.html'),'utf8')).match(/<style>([\s\S]*?)<\/style>/)[1];
await writeFile(path.join(site,'tea-final.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>鹅巷食光 · 茶饮已确认选用</title><style>${style}</style><main><nav><a href="index.html">← 当前审阅</a><a href="coffee-final.html">咖啡已确认</a><a href="sweet-final.html">糖果甜料已确认</a></nav><h1>茶饮 · 六项新版与尺寸已确认</h1><p>TE01—TE06全部采用第23轮新版。前五级主体最长边约66%／68%／70%／70%／70%，第六级80%；源稿及各档导出保持。</p><div class="grid">${rows.map(r=>`<article><a href="${r.proposal.highres}" target="_blank" rel="noopener"><img src="${r.proposal.image}" alt="${xml(r.name)}" width="96" height="96"></a><h2>${r.code} · ${xml(r.name)}</h2><p>${xml(r.displayLabel)} · 主体约${Math.round(r.expectedOccupancy*100)}%</p><a href="${r.proposal.source}" target="_blank" rel="noopener">SVG母稿</a> · <a href="${r.proposal.highres}" target="_blank" rel="noopener">1024px大图</a></article>`).join('')}</div><footer>茶饮6项固定摘要 · ${reviewId} · <a href="tea-final.json">来源清单</a></footer></main></html>`);
const artRef=r=>({source:'output/plan4-food-review/site/'+r.proposal.source,preview512:'output/plan4-food-review/site/'+r.proposal.image,highres:'output/plan4-food-review/site/'+r.proposal.highres,sha256:r.proposal.sha256});
baseline.finalizedTeaReview={reviewId,sourceReviewId,status,count:6,manifest:'output/plan4-food-review/site/tea-final.json',url:'http://127.0.0.1:5284/tea-final.html'};
baseline.plannedTeaChain={status,reviewId,sourceReviewId,manifest:'output/plan4-food-review/site/tea-final.json',counts,orderedNames:rows.map(r=>r.name),actualGameIntegrationPending:true,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,level:r.level,status:'ACCEPTED',expectedOccupancy:r.expectedOccupancy,selectedVariant:'proposal',selectedArtwork:artRef(r),artwork:artRef(r)}))};
for(const r of rows){
  const item=baseline.items.find(x=>x.id===r.id);if(!item)throw Error('Tea identity missing');
  item.latestReview={reviewId,sourceReviewId,code:r.code,status:'ACCEPTED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
  item.proposal={reviewId,status:'ACCEPTED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
  item.selectedArtwork={reviewId,sourceReviewId,userAcceptedArtwork:true,selectedName:r.name,selectedVariant:'proposal',presentationStatus:'USER_CONFIRMED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
}
baseline.currentReview={round:23,reviewId,sourceReviewId,status,counts,manifest:'output/plan4-food-review/site/tea-final.json',url:'http://127.0.0.1:5284/tea-final.html',checks};
if(retainedBefore!==JSON.stringify([baseline.plannedMilkChain,baseline.plannedExoticChain]))throw Error('Retained chain state changed');
await saveJson(baselineFile,baseline);
const acceptedFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=await json(acceptedFile);
const acceptance={reviewId:sourceReviewId,date:'2026-10-29',userQuote,status,finalizedReviewId:reviewId,counts,selectedArtwork:rows.map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:r.sourceSelection,expectedOccupancy:r.expectedOccupancy,presentationStatus:'USER_CONFIRMED'})),actualGameIntegrationPending:true};
const at=book.reviews.findIndex(r=>r.reviewId===sourceReviewId);if(at<0)book.reviews.push(acceptance);else book.reviews[at]=acceptance;
await saveJson(acceptedFile,book);
console.log(JSON.stringify({reviewId,sourceReviewId,status,counts,checks,url:'http://127.0.0.1:5284/tea-final.html'},null,2));

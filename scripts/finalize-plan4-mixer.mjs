import { createHash } from 'node:crypto';
import { access, cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const sourceReviewId='496793313c2a',userQuote='确认采用。继续下一轮，要做得顶尖';
const contentSha256='771950d46856633eaea94d3547b27fff3b837c3945572d1ede46a943e8acd0c0';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async filename=>JSON.parse(await readFile(filename,'utf8'));
const saveJson=(filename,value)=>writeFile(filename,JSON.stringify(value,null,2)+'\n');
const archive=path.join(output,'checkpoints',sourceReviewId,'site');
try{await access(path.join(archive,'round25.json'));}catch{
  const live=await json(path.join(site,'round25.json'));
  if(live.reviewId!==sourceReviewId)throw Error('Round 25 source differs');
  await cp(site,archive,{recursive:true,errorOnExist:true,force:false});
}
const previous=await json(path.join(archive,'round25.json'));
if(previous.reviewId!==sourceReviewId||previous.samples.length!==13)throw Error('Round 25 archive differs');
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
if(fixedCount!==70)throw Error('Previous fixed count differs');
let retainedCount=0;
for(const chain of [baseline.plannedMilkChain,baseline.plannedExoticChain])for(const row of chain.slots){
  const a=row.artwork;
  for(const [file,digest]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error(row.code+': retained artwork changed');
  retainedCount++;
}
if(retainedCount!==15)throw Error('Retained milk or fruit scope differs');
const round25Codes=new Set(['MX05','MX08','MX09','MX10']);
const rows=[];
for(const old of previous.samples){
  if(old.chain!=='fresh-mixer')throw Error('Unexpected selected chain');
  await verifyAsset(old.proposal,old.code);
  rows.push({...old,index:rows.length+1,status:'ACCEPTED',statusLabel:'用图、名称与尺寸已确认',displayLabel:'新版 · 已确认',selection:'selected',artworkStatus:'USER_ACCEPTED',artworkSelection:round25Codes.has(old.code)?'round25-new':'round24-new',changeType:'unchanged',selectedFromReviewId:sourceReviewId,confirmedPresentationReviewId:sourceReviewId,acceptedReviewId:sourceReviewId,userAcceptedNewArtwork:true,actualGameName:old.actualGameName||old.oldName||old.name,proposedName:undefined,sourceSelection:{reviewId:sourceReviewId,variant:'proposal',sha256:old.proposal.sha256},sourceLabel:'第25轮选用结果已确认，源稿与全部导出原字节保持',reason:'按用户本次确认固定特调基底十三项新版；四项新饮品名称、美术和显示尺寸已确认。',original:old.proposal,proposal:old.proposal});
}
if(rows.length!==13)throw Error('Mixer selection scope differs');
const reviewId=hash(JSON.stringify(['mixer-final',rows.map(r=>[r.id,r.proposal.sha256,r.expectedOccupancy])])).slice(0,12);
const status='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED';
const counts={total:13,accepted:13,selectedNew:13,selectedOriginal:0,candidates:0,sizePending:0,pending:0};
const checks={selectedSourceAndExportsByteIdentical:13,previousFixedSourceAndExportsByteIdentical:70,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,confirmedReplacementNames:4,actualGameContentUnchanged:true,actualContentSha256:contentSha256,actualGameNameChanges:0,actualRecipeChanges:0};
const manifest={title:'特调基底 · 已确认选用',reviewId,sourceReviewId,status,userQuote,chain:'fresh-mixer',counts,checks,replacementNamesAreProposals:false,actualGameIntegrationPending:true,previousFinalReviews:previous.previousFinalReviews,samples:rows};
await saveJson(path.join(site,'mixer-final.json'),manifest);
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const style=(await readFile(path.join(site,'tea-final.html'),'utf8')).match(/<style>([\s\S]*?)<\/style>/)[1];
await writeFile(path.join(site,'mixer-final.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>鹅巷食光 · 特调基底已确认选用</title><style>${style}</style><main><nav><a href="index.html">← 当前审阅</a><a href="tea-final.html">茶饮已确认</a><a href="coffee-final.html">咖啡已确认</a></nav><h1>特调基底 · 十三项新版已确认</h1><p>MX05西柚气泡水、MX08蓝柑气泡饮、MX09橙子冰沙、MX10椰青水采用第25轮替换设计，名称、美术与尺寸已确认；其余九项采用第24轮新版。前五级主体最长边约66%／68%／70%／68%／70%，高阶80%；各档导出保持。</p><div class="grid">${rows.map(r=>`<article><a href="${r.proposal.highres}" target="_blank" rel="noopener"><img src="${r.proposal.image}" alt="${xml(r.name)}" width="96" height="96"></a><h2>${r.code} · ${xml(r.name)}</h2><p>${xml(r.displayLabel)} · 主体约${Math.round(r.expectedOccupancy*100)}%</p><a href="${r.proposal.source}" target="_blank" rel="noopener">SVG母稿</a> · <a href="${r.proposal.highres}" target="_blank" rel="noopener">1024px大图</a></article>`).join('')}</div><footer>特调基底13项固定摘要 · ${reviewId} · <a href="mixer-final.json">来源清单</a></footer></main></html>`);
const artRef=r=>({source:'output/plan4-food-review/site/'+r.proposal.source,preview512:'output/plan4-food-review/site/'+r.proposal.image,highres:'output/plan4-food-review/site/'+r.proposal.highres,sha256:r.proposal.sha256});
baseline.finalizedMixerReview={reviewId,sourceReviewId,status,count:13,manifest:'output/plan4-food-review/site/mixer-final.json',url:'http://127.0.0.1:5284/mixer-final.html'};
baseline.plannedMixerChain={status,reviewId,sourceReviewId,manifest:'output/plan4-food-review/site/mixer-final.json',counts,orderedNames:rows.map(r=>r.name),replacementNamesAreProposals:false,actualGameIntegrationPending:true,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,actualGameName:r.actualGameName,level:r.level,status:'ACCEPTED',expectedOccupancy:r.expectedOccupancy,selectedVariant:'proposal',selectedArtwork:artRef(r),artwork:artRef(r)}))};
for(const r of rows){
  const item=baseline.items.find(x=>x.id===r.id);if(!item)throw Error('Mixer identity missing');
  item.latestReview={reviewId,sourceReviewId,code:r.code,status:'ACCEPTED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
  item.proposal={reviewId,status:'ACCEPTED',selectedName:r.name,actualGameName:r.actualGameName,artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
  item.selectedArtwork={reviewId,sourceReviewId,userAcceptedArtwork:true,selectedName:r.name,actualGameName:r.actualGameName,selectedVariant:'proposal',presentationStatus:'USER_CONFIRMED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
}
baseline.currentReview={round:25,reviewId,sourceReviewId,status,counts,manifest:'output/plan4-food-review/site/mixer-final.json',url:'http://127.0.0.1:5284/mixer-final.html',checks};
if(retainedBefore!==JSON.stringify([baseline.plannedMilkChain,baseline.plannedExoticChain]))throw Error('Retained chain state changed');
await saveJson(baselineFile,baseline);
const acceptedFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=await json(acceptedFile);
const acceptance={reviewId:sourceReviewId,date:'2026-10-29',userQuote,status,finalizedReviewId:reviewId,counts,confirmedReplacementCodes:[...round25Codes],selectedArtwork:rows.map(r=>({targetId:r.id,code:r.code,name:r.name,actualGameName:r.actualGameName,sourceSelection:r.sourceSelection,expectedOccupancy:r.expectedOccupancy,presentationStatus:'USER_CONFIRMED'})),actualGameIntegrationPending:true};
const at=book.reviews.findIndex(r=>r.reviewId===sourceReviewId);if(at<0)book.reviews.push(acceptance);else book.reviews[at]=acceptance;
await saveJson(acceptedFile,book);
console.log(JSON.stringify({reviewId,sourceReviewId,status,counts,checks,retainedMilkAndFruitStateUnchanged:true,url:'http://127.0.0.1:5284/mixer-final.html'},null,2));

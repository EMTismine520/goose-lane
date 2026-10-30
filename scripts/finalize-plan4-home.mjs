import { createHash } from 'node:crypto';
import { access, cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const sourceReviewId='4eddc982c70a',userQuote='确认采用。继续下一轮，要做得顶尖';
const baseCatalogSha256='07b19a67d40d86396d60403e853654c22b75d91a53e7b72278cb1be76f73cbaf';
const expansionSha256='771950d46856633eaea94d3547b27fff3b837c3945572d1ede46a943e8acd0c0';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async filename=>JSON.parse(await readFile(filename,'utf8'));
const saveJson=(filename,value)=>writeFile(filename,JSON.stringify(value,null,2)+'\n');
const archive=path.join(output,'checkpoints',sourceReviewId,'site');
try{await access(path.join(archive,'round29.json'));}catch{
  const live=await json(path.join(site,'samples.json'));
  if(live.reviewId!==sourceReviewId)throw Error('Round29 source differs');
  await cp(site,archive,{recursive:true,errorOnExist:true,force:false});
}
const previous=await json(path.join(archive,'round29.json'));
if(previous.reviewId!==sourceReviewId||previous.samples.length!==10)throw Error('Round29 archive differs');
if(hash(await readFile(path.join(root,'src/content/catalog.ts')))!==baseCatalogSha256||hash(await readFile(path.join(root,'src/content/expansion-data.json')))!==expansionSha256)throw Error('Actual recipe content differs');
const baselineFile=path.join(output,'recipe-baseline.json'),baseline=await json(baselineFile);
const legacySamples=baseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW');
if(legacySamples.length!==6)throw Error('Six unrelated legacy sample choices required');
const legacyBefore=JSON.stringify(legacySamples);
const tomatoEggs=baseline.items.find(r=>r.code==='DS08');
if(tomatoEggs?.legacySelection?.reviewId!=='437a9a667ee5')throw Error('DS08 legacy original history missing');
const legacyTomatoHistory=JSON.stringify(tomatoEggs.legacySelection);
async function verifyAsset(asset,id,bases){
  for(const base of bases)for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': selected artwork changed');
}
for(const item of legacySamples){
  const art=item.selectedArtwork.artwork;
  for(const [file,digest]of [[art.source,art.sha256.source],[art.png512,art.sha256.png],[art.preview512,art.sha256.image],[art.highres,art.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error(item.id+': legacy selected artwork changed');
}
const starter=await json(path.join(site,'starter-final.json'));
if(starter.reviewId!=='9ecc918006ca'||starter.samples.length!==6)throw Error('Starter inventory differs');
for(const row of starter.samples)await verifyAsset(row.proposal,row.code,[site,archive]);
const rows=[];
for(const old of previous.samples){
  await verifyAsset(old.proposal,old.code,[site,archive]);
  const isNew=old.code!=='DS09',revised=['DS13','DS16'].includes(old.code);
  const sourceSelection={reviewId:sourceReviewId,variant:'proposal',sha256:old.proposal.sha256};
  rows.push({...old,index:rows.length+1,status:'ACCEPTED',statusLabel:'用图与尺寸已确认',displayLabel:isNew?'新版 · 已确认':'原版 · 已确认',selection:'selected',artworkStatus:'USER_ACCEPTED',artworkSelection:isNew?revised?'round29-new':'round28-new':'original',changeType:'unchanged',selectedFromReviewId:sourceReviewId,confirmedPresentationReviewId:sourceReviewId,acceptedReviewId:sourceReviewId,userAcceptedNewArtwork:isNew,sourceSelection,selectedArtwork:old.proposal,sourceLabel:'家常十道用图及尺寸已确认，所选源稿与全部导出原字节保持',reason:'按用户本次确认固定家常十道选用与展示尺寸；DS13采用两片肉、DS16采用三块小排的第29轮减量新稿。',original:old.proposal,proposal:old.proposal});
}
if(rows.length!==10||rows.some((r,i)=>r.code!=='DS'+String(i+7).padStart(2,'0')))throw Error('Home selected scope differs');
const reviewId=hash(JSON.stringify(['home-final',rows.map(r=>[r.id,r.proposal.sha256,r.expectedOccupancy])])).slice(0,12);
const status='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED';
const counts={total:10,accepted:10,selectedNew:9,selectedOriginal:1,candidates:0,sizePending:0,pending:0};
const checks={selectedSourceAndExportsByteIdentical:10,confirmedStarterSourcesAndExportsByteIdentical:6,legacyOtherRecipeSampleSelectionsPreserved:6,DS08LegacyOriginalHistoryPreserved:true,quantityTargets:{DS13:2,DS16:3},actualBaseCatalogUnchanged:true,actualBaseCatalogSha256:baseCatalogSha256,actualExpansionContentUnchanged:true,actualExpansionSha256:expansionSha256,actualRecipeChanges:0,actualGameNameChanges:0};
const manifest={title:'家常料理十道 · 已确认选用',reviewId,sourceReviewId,status,userQuote,batch:'home-kitchen',counts,checks,previousFinalReviews:previous.previousFinalReviews,confirmedStarterReviewId:starter.reviewId,actualGameArtIntegrationPending:true,samples:rows};
await saveJson(path.join(site,'home-final.json'),manifest);
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const style=(await readFile(path.join(site,'starter-final.html'),'utf8')).match(/<style>([\s\S]*?)<\/style>/)[1];
await writeFile(path.join(site,'home-final.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>鹅巷食光 · 家常料理已确认选用</title><style>${style}</style><main><nav><a href="index.html">← 当前审阅</a><a href="starter-final.html">开局鲜食已确认</a><a href="mixer-final.html">特调基底已确认</a></nav><h1>家常料理 · 十道用图与尺寸已确认</h1><p>DS09肉丸蔬菜汤保留原版；DS07、DS08、DS10—DS12、DS14、DS15采用第28轮新版；DS13香煎肉片采用两片肉、DS16橙香小排采用三块小排的第29轮减量新稿。成品按构图美观定尺寸，源稿与各档导出保持。</p><div class="grid">${rows.map(r=>`<article><a href="${r.proposal.highres}" target="_blank" rel="noopener"><img src="${r.proposal.image}" alt="${xml(r.name)}" width="96" height="96"></a><h2>${r.code} · ${xml(r.name)}</h2><p>${xml(r.displayLabel)} · 主体约${Math.round(r.expectedOccupancy*100)}%</p><p>主料：${xml(r.ingredients.join('、'))}</p><a href="${r.proposal.source}" target="_blank" rel="noopener">SVG母稿</a> · <a href="${r.proposal.highres}" target="_blank" rel="noopener">1024px大图</a></article>`).join('')}</div><footer>家常料理10道固定摘要 · ${reviewId} · <a href="home-final.json">来源清单</a></footer></main></html>`);
const artRef=r=>({source:'output/plan4-food-review/site/'+r.proposal.source,png512:'output/plan4-food-review/site/'+r.proposal.png,preview512:'output/plan4-food-review/site/'+r.proposal.image,highres:'output/plan4-food-review/site/'+r.proposal.highres,sha256:r.proposal.sha256});
baseline.finalizedHomeReview={reviewId,sourceReviewId,status,count:10,manifest:'output/plan4-food-review/site/home-final.json',url:'http://127.0.0.1:5284/home-final.html'};
baseline.plannedHomeBatch={reviewId,sourceReviewId,status,counts,actualGameArtIntegrationPending:true,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:'ACCEPTED',ingredients:r.ingredients,recipeDescription:r.recipeDescription,expectedOccupancy:r.expectedOccupancy,selectedVariant:'proposal',selectedArtwork:artRef(r),artwork:artRef(r)}))};
for(const r of rows){
  const item=baseline.items.find(x=>x.id===r.id);if(!item)throw Error('Home identity missing');
  item.choice=r.userAcceptedNewArtwork?'USER_SELECTED_NEW':'USER_SELECTED_ORIGINAL';item.userReview='ARTWORK_AND_PRESENTATION_CONFIRMED';
  item.latestReview={reviewId,sourceReviewId,code:r.code,status:'ACCEPTED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
  item.proposal={reviewId,status:'ACCEPTED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
  item.selectedArtwork={reviewId,sourceReviewId,selection:r.artworkSelection,selectedVariant:'proposal',userAcceptedArtwork:true,presentationStatus:'USER_CONFIRMED',sourceSelection:r.sourceSelection,artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
}
baseline.currentReview={round:29,reviewId,sourceReviewId,status,counts,batchId:'home-kitchen',manifest:'output/plan4-food-review/site/home-final.json',url:'http://127.0.0.1:5284/home-final.html',checks};
baseline.counts={...baseline.counts,currentCandidates:0,presentationPending:0,currentAccepted:10};
if(legacyBefore!==JSON.stringify(baseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW'))||legacyTomatoHistory!==JSON.stringify(tomatoEggs.legacySelection))throw Error('Legacy recipe choices or history changed');
await saveJson(baselineFile,baseline);
const acceptedFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=await json(acceptedFile);
const acceptance={reviewId:sourceReviewId,date:'2026-10-29',userQuote,status,finalizedReviewId:reviewId,counts,selectedNewCodes:rows.filter(r=>r.userAcceptedNewArtwork).map(r=>r.code),selectedOriginalCodes:['DS09'],selectedArtwork:rows.map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:r.sourceSelection,expectedOccupancy:r.expectedOccupancy,presentationStatus:'USER_CONFIRMED'})),actualGameArtIntegrationPending:true};
const at=book.reviews.findIndex(r=>r.reviewId===sourceReviewId);if(at<0)book.reviews.push(acceptance);else book.reviews[at]=acceptance;
await saveJson(acceptedFile,book);
console.log(JSON.stringify({reviewId,sourceReviewId,status,counts,checks,url:'http://127.0.0.1:5284/home-final.html'},null,2));

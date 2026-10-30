import { createHash } from 'node:crypto';
import { access, cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const sourceReviewId='9b722695d7fc',userQuote='确认。继续下一轮，要做得顶尖';
const baseCatalogSha256='07b19a67d40d86396d60403e853654c22b75d91a53e7b72278cb1be76f73cbaf';
const expansionSha256='771950d46856633eaea94d3547b27fff3b837c3945572d1ede46a943e8acd0c0';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async filename=>JSON.parse(await readFile(filename,'utf8'));
const saveJson=(filename,value)=>writeFile(filename,JSON.stringify(value,null,2)+'\n');
const archive=path.join(output,'checkpoints',sourceReviewId,'site');
try{await access(path.join(archive,'round27.json'));}catch{
  const live=await json(path.join(site,'round27.json'));
  if(live.reviewId!==sourceReviewId)throw Error('Round27 source differs');
  await cp(site,archive,{recursive:true,errorOnExist:true,force:false});
}
const previous=await json(path.join(archive,'round27.json'));
if(previous.reviewId!==sourceReviewId||previous.samples.length!==6)throw Error('Round27 archive differs');
if(hash(await readFile(path.join(root,'src/content/catalog.ts')))!==baseCatalogSha256||hash(await readFile(path.join(root,'src/content/expansion-data.json')))!==expansionSha256)throw Error('Actual recipe content differs');
const baselineFile=path.join(output,'recipe-baseline.json'),baseline=await json(baselineFile);
const legacySamples=baseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW');
if(legacySamples.length!==7)throw Error('Legacy recipe sample inventory differs');
const legacyBefore=JSON.stringify(legacySamples);
async function verifyAsset(asset,id,bases){
  for(const base of bases)for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': selected artwork changed');
}
for(const item of legacySamples){
  const art=item.selectedArtwork.artwork;
  for(const [file,digest]of [[art.source,art.sha256.source],[art.png512,art.sha256.png],[art.preview512,art.sha256.image],[art.highres,art.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error(item.id+': legacy selected artwork changed');
}
const rows=[];
for(const old of previous.samples){
  await verifyAsset(old.proposal,old.code,[site,archive]);
  const isNew=['DS01','DS02','DS03'].includes(old.code);
  rows.push({...old,index:rows.length+1,status:'ACCEPTED',statusLabel:'用图与尺寸已确认',displayLabel:isNew?'新版 · 已确认':'原版 · 已确认',selection:'selected',artworkStatus:'USER_ACCEPTED',artworkSelection:isNew?old.code==='DS03'?'round27-new':'round26-new':'original',changeType:'unchanged',selectedFromReviewId:sourceReviewId,confirmedPresentationReviewId:sourceReviewId,acceptedReviewId:sourceReviewId,userAcceptedNewArtwork:isNew,sourceSelection:{reviewId:sourceReviewId,variant:'proposal',sha256:old.proposal.sha256},sourceLabel:'第27轮选用及展示尺寸已确认，源稿与全部导出原字节保持',reason:'按用户本次确认固定开局鲜食六道的选用结果与显示尺寸。',original:old.proposal,proposal:old.proposal});
}
if(rows.length!==6||rows.some((r,i)=>r.code!=='DS'+String(i+1).padStart(2,'0')))throw Error('Starter selected scope differs');
const reviewId=hash(JSON.stringify(['starter-final',rows.map(r=>[r.id,r.proposal.sha256,r.expectedOccupancy])])).slice(0,12);
const status='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED';
const counts={total:6,accepted:6,selectedNew:3,selectedOriginal:3,candidates:0,sizePending:0,pending:0};
const checks={selectedSourceAndExportsByteIdentical:6,legacyRecipeSampleSelectionsPreserved:7,actualBaseCatalogUnchanged:true,actualBaseCatalogSha256:baseCatalogSha256,actualExpansionContentUnchanged:true,actualExpansionSha256:expansionSha256,actualRecipeChanges:0,actualGameNameChanges:0};
const manifest={title:'开局鲜食六道 · 已确认选用',reviewId,sourceReviewId,status,userQuote,batch:'starter-fresh',counts,checks,recipeRevision:{...previous.recipeRevision,artworkStatus:'USER_CONFIRMED'},previousFinalReviews:previous.previousFinalReviews,actualGameArtIntegrationPending:true,samples:rows};
await saveJson(path.join(site,'starter-final.json'),manifest);
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const style=(await readFile(path.join(site,'mixer-final.html'),'utf8')).match(/<style>([\s\S]*?)<\/style>/)[1];
await writeFile(path.join(site,'starter-final.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>鹅巷食光 · 开局鲜食已确认选用</title><style>${style}</style><main><nav><a href="index.html">← 当前审阅</a><a href="mixer-final.html">特调基底已确认</a><a href="tea-final.html">茶饮已确认</a></nav><h1>开局鲜食 · 六道用图与尺寸已确认</h1><p>DS01番茄小沙拉、DS02胡萝卜花园采用第26轮新版造型和第27轮80%展示尺寸；DS03田园丰收碗采用第27轮西兰花与彩椒新稿，主体82%；DS04—DS06保留原版80%。成品按构图与美观确定尺寸，各档导出保持。</p><div class="grid">${rows.map(r=>`<article><a href="${r.proposal.highres}" target="_blank" rel="noopener"><img src="${r.proposal.image}" alt="${xml(r.name)}" width="96" height="96"></a><h2>${r.code} · ${xml(r.name)}</h2><p>${xml(r.displayLabel)} · 主体约${Math.round(r.expectedOccupancy*100)}%</p><p>主料：${xml(r.ingredients.join('、'))}</p><a href="${r.proposal.source}" target="_blank" rel="noopener">SVG母稿</a> · <a href="${r.proposal.highres}" target="_blank" rel="noopener">1024px大图</a></article>`).join('')}</div><footer>开局鲜食6道固定摘要 · ${reviewId} · <a href="starter-final.json">来源清单</a></footer></main></html>`);
const artRef=r=>({source:'output/plan4-food-review/site/'+r.proposal.source,preview512:'output/plan4-food-review/site/'+r.proposal.image,highres:'output/plan4-food-review/site/'+r.proposal.highres,sha256:r.proposal.sha256});
baseline.finalizedStarterReview={reviewId,sourceReviewId,status,count:6,manifest:'output/plan4-food-review/site/starter-final.json',url:'http://127.0.0.1:5284/starter-final.html'};
baseline.plannedStarterBatch={reviewId,sourceReviewId,status,counts,recipeRevision:manifest.recipeRevision,actualGameArtIntegrationPending:true,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:'ACCEPTED',ingredients:r.ingredients,recipeDescription:r.recipeDescription,expectedOccupancy:r.expectedOccupancy,selectedVariant:'proposal',selectedArtwork:artRef(r),artwork:artRef(r)}))};
for(const r of rows){
  const item=baseline.items.find(x=>x.id===r.id);if(!item)throw Error('Starter identity missing');
  item.choice=r.userAcceptedNewArtwork?'USER_SELECTED_NEW':'USER_SELECTED_ORIGINAL';
  item.userReview='ARTWORK_AND_PRESENTATION_CONFIRMED';
  item.latestReview={reviewId,sourceReviewId,code:r.code,status:'ACCEPTED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
  item.proposal={reviewId,status:'ACCEPTED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
  item.selectedArtwork={reviewId,sourceReviewId,selection:r.artworkSelection,selectedVariant:'proposal',userAcceptedArtwork:true,presentationStatus:'USER_CONFIRMED',sourceSelection:r.sourceSelection,artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
  if(r.code==='DS03'&&item.recipeRevision)item.recipeRevision.artworkStatus='USER_CONFIRMED';
}
baseline.currentReview={round:27,reviewId,sourceReviewId,status,counts,batchId:'starter-fresh',manifest:'output/plan4-food-review/site/starter-final.json',url:'http://127.0.0.1:5284/starter-final.html',checks};
baseline.counts={...baseline.counts,currentCandidates:0,presentationPending:0,currentAccepted:6};
if(legacyBefore!==JSON.stringify(baseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW')))throw Error('Legacy recipe choices changed');
await saveJson(baselineFile,baseline);
const acceptedFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=await json(acceptedFile);
const acceptance={reviewId:sourceReviewId,date:'2026-10-29',userQuote,status,finalizedReviewId:reviewId,counts,selectedNewCodes:['DS01','DS02','DS03'],selectedOriginalCodes:['DS04','DS05','DS06'],selectedArtwork:rows.map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:r.sourceSelection,expectedOccupancy:r.expectedOccupancy,presentationStatus:'USER_CONFIRMED'})),recipeRevision:manifest.recipeRevision,actualGameArtIntegrationPending:true};
const at=book.reviews.findIndex(r=>r.reviewId===sourceReviewId);if(at<0)book.reviews.push(acceptance);else book.reviews[at]=acceptance;
await saveJson(acceptedFile,book);
console.log(JSON.stringify({reviewId,sourceReviewId,status,counts,checks,url:'http://127.0.0.1:5284/starter-final.html'},null,2));

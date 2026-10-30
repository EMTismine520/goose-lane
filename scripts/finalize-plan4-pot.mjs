import { createHash } from 'node:crypto';
import { access, cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const sourceReviewId='773fe4a2e4b6',userQuote='确认。继续下一轮，要做得顶尖';
const baseCatalogSha256='16f50aaae40fb8b54f90511b73908b0c7a6b7edad720dd8b23749ead3dced4df';
const expansionSha256='0c427f5beecb6587bfee47cf70eda856f9df391811585c7bd080164df758feee';
const runtimeManifestSha256='4b549e279d217c68dd788b8c03afaf336a61272db58517b5559765bac5e02b2d';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async filename=>JSON.parse(await readFile(filename,'utf8'));
const saveJson=(filename,value)=>writeFile(filename,JSON.stringify(value,null,2)+'\n');
const archive=path.join(output,'checkpoints',sourceReviewId,'site');
let archived=true;
try{await access(archive);}catch(error){if(error.code!=='ENOENT')throw error;archived=false;}
if(!archived){
  const live=await json(path.join(site,'samples.json'));
  if(live.reviewId!==sourceReviewId)throw Error('Round34 source differs');
  await cp(site,archive,{recursive:true,errorOnExist:true,force:false});
}
const previous=await json(path.join(archive,'round34.json'));
if(previous.reviewId!==sourceReviewId||previous.samples.length!==4)throw Error('Round34 archive differs');
for(const [file,digest]of [['src/content/catalog.ts',baseCatalogSha256],['src/content/expansion-data.json',expansionSha256],['public/assets/v3-manifest.json',runtimeManifestSha256]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error(file+': formal content differs');
const baselineFile=path.join(output,'recipe-baseline.json'),baseline=await json(baselineFile);
const potCodes=['DS32','DS33','DS34','DS35'];
const currentReviewBefore=JSON.stringify(baseline.currentReview);
const unrelatedBefore=JSON.stringify(baseline.items.filter(r=>!potCodes.includes(r.code)));
const legacy=baseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW');
if(legacy.length!==3)throw Error('Three active legacy choices required');
async function verifyAsset(asset,id,bases){
  for(const base of bases)for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': selected artwork changed');
}
for(const [stem,id,count]of [['starter-final','9ecc918006ca',6],['home-final','7b4a11197419',10],['cold-final','5caee26b153b',5],['drinks-final','feb086daf312',10]]){
  const final=await json(path.join(site,stem+'.json'));
  if(final.reviewId!==id||final.samples.length!==count)throw Error('Earlier final inventory differs');
  for(const row of final.samples)await verifyAsset(row.proposal,row.code,[site,archive]);
}
for(const item of legacy){const a=item.selectedArtwork.artwork;for(const [file,digest]of [[a.source,a.sha256.source],[a.png512,a.sha256.png],[a.preview512,a.sha256.image],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error(item.code+': legacy asset changed');}
const rows=[];
for(const old of previous.samples){
  const item=baseline.items.find(r=>r.id===old.id);if(!item)throw Error('Pot identity missing');
  const selected=old.proposal,isNew=old.code!=='DS32',isOnion=old.code==='DS34';
  await verifyAsset(selected,old.code,[site,archive]);
  const expectedOccupancy=isNew?.82:.8;
  if(old.expectedOccupancy!==expectedOccupancy)throw Error(old.code+': selected size differs');
  const sourceSelection=isOnion?{reviewId:sourceReviewId,variant:'proposal',sha256:selected.sha256}:old.sourceSelection;
  if(!sourceSelection||JSON.stringify(sourceSelection.sha256)!==JSON.stringify(selected.sha256))throw Error(old.code+': selected provenance differs');
  if(!isOnion&&(sourceSelection.reviewId!=='20d05b6ee8a4'||sourceSelection.variant!==(isNew?'proposal':'original')))throw Error(old.code+': round33 selection differs');
  const {comparisonLabel,comparisonSourceSelection,defaultArtwork,...kept}=old;
  rows.push({...kept,index:rows.length+1,status:'ACCEPTED',statusLabel:'用图与尺寸已确认',displayLabel:isNew?'新版 · 已确认':'原版 · 已确认',selection:'selected',artworkStatus:'USER_ACCEPTED',artworkSelection:isNew?isOnion?'round34-new':'round33-new':'original',changeType:'unchanged',expectedOccupancy,selectedFromReviewId:sourceSelection.reviewId,confirmedPresentationReviewId:sourceReviewId,acceptedReviewId:sourceSelection.reviewId,finalizedByReviewId:sourceReviewId,userAcceptedNewArtwork:isNew,sourceSelection,confirmationSourceSelection:{reviewId:sourceReviewId,variant:'proposal',sha256:selected.sha256},sourceLabel:'料理锅四道用图与尺寸已确认，原始选用来源及全部导出字节保持',reason:'DS32原版80%；DS33、DS35第33轮新版82%；DS34第34轮四块短洋葱瓣新版82%。',original:selected,proposal:selected,defaultArtwork:selected,...(isOnion?{historicalComparison:{label:comparisonLabel,sourceSelection:comparisonSourceSelection,artwork:old.original},v4Original:old.v4Original}:{} )});
}
if(rows.some((r,i)=>r.code!==potCodes[i]))throw Error('Pot selected scope differs');
const reviewId=hash(JSON.stringify(['pot-final',rows.map(r=>[r.id,r.proposal.sha256,r.expectedOccupancy])])).slice(0,12);
const status='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED';
const counts={total:4,accepted:4,selectedNew:3,selectedOriginal:1,candidates:0,sizePending:0,pending:0};
const checks={selectedSourceAndExportsByteIdentical:4,confirmedEarlierRecipeSourcesAndExportsByteIdentical:31,legacyRecipeSelectionsPreserved:3,round33RejectedOnionCandidateHistoryPreserved:true,v4OriginalHistoryPreserved:true,actualBaseCatalogUnchanged:true,actualBaseCatalogSha256:baseCatalogSha256,actualExpansionContentUnchanged:true,actualExpansionSha256:expansionSha256,actualRecipeChanges:0,actualGameNameChanges:0,runtimeGeometryAndImagesUnchanged:true,runtimeManifestSha256};
const manifest={title:'料理锅四道 · 已确认选用',reviewId,sourceReviewId,status,userQuote,batch:'home-cooking-pot',counts,checks,previousFinalReviews:previous.previousFinalReviews,previousRecipeFinalReviews:previous.previousRecipeFinalReviews,actualGameArtIntegrationPending:true,samples:rows};
await saveJson(path.join(site,'pot-final.json'),manifest);
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const style=(await readFile(path.join(site,'drinks-final.html'),'utf8')).match(/<style>([\s\S]*?)<\/style>/)[1];
await writeFile(path.join(site,'pot-final.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>鹅巷食光 · 料理锅已确认选用</title><style>${style}</style><main><nav><a href="index.html">← 当前审阅</a><a href="drinks-final.html">果饮奶茶已确认</a><a href="cold-final.html">砧板冷食已确认</a></nav><h1>料理锅 · 四道用图与尺寸已确认</h1><p>DS32什锦海鲜汤保留80%原版；DS33特色白粥、DS35黄油拌饭采用第33轮82%新版；DS34焦香洋葱饭采用第34轮82%块瓣状洋葱新版。母稿和全部导出保持原字节，第33轮条状洋葱拒稿与V4原版留作历史。当前为选定源与审阅资产摘要，正式美术仍待后续统一接入。</p><div class="grid">${rows.map(r=>`<article><a href="${r.proposal.highres}" target="_blank" rel="noopener"><img src="${r.proposal.image}" alt="${xml(r.name)}" width="96" height="96"></a><h2>${r.code} · ${xml(r.name)}</h2><p>${xml(r.displayLabel)} · 主体约${Math.round(r.expectedOccupancy*100)}%</p><p>主料：${xml(r.ingredients.join('、'))}</p><a href="${r.proposal.source}" target="_blank" rel="noopener">SVG母稿</a> · <a href="${r.proposal.highres}" target="_blank" rel="noopener">1024px大图</a></article>`).join('')}</div><footer>料理锅4道固定摘要 · ${reviewId} · <a href="pot-final.json">来源清单</a></footer></main></html>`);
const artRef=r=>({source:'output/plan4-food-review/site/'+r.proposal.source,png512:'output/plan4-food-review/site/'+r.proposal.png,preview512:'output/plan4-food-review/site/'+r.proposal.image,highres:'output/plan4-food-review/site/'+r.proposal.highres,sha256:r.proposal.sha256});
baseline.finalizedPotReview={reviewId,sourceReviewId,status,count:4,manifest:'output/plan4-food-review/site/pot-final.json',url:'http://127.0.0.1:5284/pot-final.html',actualGameArtIntegrationPending:true};
baseline.plannedPotBatch={reviewId,sourceReviewId,status,count:4,counts,actualGameArtIntegrationPending:true,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:'ACCEPTED',ingredients:r.ingredients,inputIds:baseline.items.find(i=>i.id===r.id).inputIds,recipeDescription:r.recipeDescription,expectedOccupancy:r.expectedOccupancy,selectedVariant:'proposal',sourceSelection:r.sourceSelection,selectedArtwork:artRef(r),artwork:artRef(r)}))};
for(const r of rows){
  const item=baseline.items.find(x=>x.id===r.id);
  item.choice=r.userAcceptedNewArtwork?'USER_SELECTED_NEW':'USER_SELECTED_ORIGINAL';item.userReview='ARTWORK_AND_PRESENTATION_CONFIRMED';
  item.latestReview={reviewId,sourceReviewId,code:r.code,status:'ACCEPTED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};item.proposal={reviewId,status:'ACCEPTED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
  item.selectedArtwork={reviewId,sourceReviewId,selection:r.artworkSelection,selectedVariant:'proposal',userAcceptedArtwork:true,presentationStatus:'USER_CONFIRMED',sourceSelection:r.sourceSelection,confirmationSourceSelection:r.confirmationSourceSelection,artwork:artRef(r),expectedOccupancy:r.expectedOccupancy,actualGameArtIntegrationPending:true};
}
if(unrelatedBefore!==JSON.stringify(baseline.items.filter(r=>!potCodes.includes(r.code)))||currentReviewBefore!==JSON.stringify(baseline.currentReview))throw Error('Unrelated baseline state changed');
await saveJson(baselineFile,baseline);
const bookFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=await json(bookFile);
const acceptance={reviewId:sourceReviewId,date:'2026-10-29',userQuote,status,finalizedReviewId:reviewId,counts,selectedNewCodes:['DS33','DS34','DS35'],selectedOriginalCodes:['DS32'],selectedArtwork:rows.map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:r.sourceSelection,confirmationSourceSelection:r.confirmationSourceSelection,expectedOccupancy:r.expectedOccupancy,presentationStatus:'USER_CONFIRMED'})),round33RejectedOnionCandidateHistoryPreserved:true,actualGameArtIntegrationPending:true};
const at=book.reviews.findIndex(r=>r.reviewId===sourceReviewId);if(at<0)book.reviews.push(acceptance);else book.reviews[at]=acceptance;await saveJson(bookFile,book);
console.log(JSON.stringify({reviewId,sourceReviewId,status,counts,checks,currentReviewPreserved:true,url:'http://127.0.0.1:5284/pot-final.html'},null,2));

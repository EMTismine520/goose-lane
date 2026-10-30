import { createHash } from 'node:crypto';
import { access, cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const sourceReviewId='dacce046ad49',userQuote='确认。继续下一轮，要做得顶尖';
const baseCatalogSha256='16f50aaae40fb8b54f90511b73908b0c7a6b7edad720dd8b23749ead3dced4df';
const expansionSha256='0c427f5beecb6587bfee47cf70eda856f9df391811585c7bd080164df758feee';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async filename=>JSON.parse(await readFile(filename,'utf8'));
const saveJson=(filename,value)=>writeFile(filename,JSON.stringify(value,null,2)+'\n');
const archive=path.join(output,'checkpoints',sourceReviewId,'site');
try{await access(path.join(archive,'round31.json'));}catch{
  const live=await json(path.join(site,'samples.json'));
  if(live.reviewId!==sourceReviewId)throw Error('Round31 source differs');
  await cp(site,archive,{recursive:true,errorOnExist:true,force:false});
}
const previous=await json(path.join(archive,'round31.json'));
if(previous.reviewId!==sourceReviewId||previous.samples.length!==5)throw Error('Round31 archive differs');
if(hash(await readFile(path.join(root,'src/content/catalog.ts')))!==baseCatalogSha256||hash(await readFile(path.join(root,'src/content/expansion-data.json')))!==expansionSha256)throw Error('Actual recipe content differs');
const baselineFile=path.join(output,'recipe-baseline.json'),baseline=await json(baselineFile);
const legacy=baseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW');
if(legacy.length!==5)throw Error('Five active historical recipe selections required');
const legacyBefore=JSON.stringify(legacy);
const legacyHistories=JSON.stringify(['DS08','DS20'].map(code=>baseline.items.find(r=>r.code===code)?.legacySelection));
async function verifyAsset(asset,id,bases){
  for(const base of bases)for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': selected artwork changed');
}
for(const item of legacy){
  const art=item.selectedArtwork.artwork;
  for(const [file,digest]of [[art.source,art.sha256.source],[art.png512,art.sha256.png],[art.preview512,art.sha256.image],[art.highres,art.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error(item.id+': legacy selected artwork changed');
}
const starter=await json(path.join(site,'starter-final.json')),home=await json(path.join(site,'home-final.json'));
if(starter.reviewId!=='9ecc918006ca'||home.reviewId!=='7b4a11197419')throw Error('Earlier recipe final inventory differs');
for(const row of [...starter.samples,...home.samples])await verifyAsset(row.proposal,row.code,[site,archive]);
const rows=[];
for(const old of previous.samples){
  await verifyAsset(old.proposal,old.code,[site,archive]);
  const isNew=!['DS17','DS19'].includes(old.code),isGoose=old.code==='DS21';
  const sourceSelection={reviewId:sourceReviewId,variant:'proposal',sha256:old.proposal.sha256};
  rows.push({...old,index:rows.length+1,status:'ACCEPTED',statusLabel:'用图与尺寸已确认',displayLabel:isNew?'新版 · 已确认':'原版 · 已确认',selection:'selected',artworkStatus:'USER_ACCEPTED',artworkSelection:isNew?isGoose?'round31-new':'round30-new':'original',changeType:'unchanged',selectedFromReviewId:sourceReviewId,confirmedPresentationReviewId:sourceReviewId,acceptedReviewId:sourceReviewId,userAcceptedNewArtwork:isNew,priorSourceSelection:old.sourceSelection,sourceSelection,selectedArtwork:old.proposal,sourceLabel:'五道砧板冷食用图与尺寸已确认，源稿与全部导出原字节保持',reason:'DS17、DS19原版；DS18、DS20第30轮新版；DS21采用第31轮卤鹅肉、紫洋葱和红椒新稿。',original:old.proposal,proposal:old.proposal});
}
if(rows.some((r,i)=>r.code!=='DS'+String(i+17).padStart(2,'0')))throw Error('Cold recipe selected scope differs');
const reviewId=hash(JSON.stringify(['cold-final',rows.map(r=>[r.id,r.proposal.sha256,r.expectedOccupancy])])).slice(0,12);
const status='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED';
const counts={total:5,accepted:5,selectedNew:3,selectedOriginal:2,candidates:0,sizePending:0,pending:0};
const checks={selectedSourceAndExportsByteIdentical:5,confirmedEarlierRecipeSourcesAndExportsByteIdentical:16,legacyRecipeSelectionsPreserved:5,DS08AndDS20LegacyHistoriesPreserved:true,actualBaseCatalogUnchanged:true,actualBaseCatalogSha256:baseCatalogSha256,actualExpansionContentUnchanged:true,actualExpansionSha256:expansionSha256,actualRecipeChanges:0,actualGameNameChanges:0,runtimeGeometryAndImagesUnchanged:true,DS21ApprovalMetadataUpdated:true};
const manifest={title:'砧板冷食五道 · 已确认选用',reviewId,sourceReviewId,status,userQuote,batch:'chopping-board',counts,checks,previousFinalReviews:previous.previousFinalReviews,previousRecipeFinalReviews:previous.previousRecipeFinalReviews,semanticReconciliation:baseline.semanticReconciliation,runtimeArtworkIntegrationStatus:'LOCAL_IMPLEMENTED',samples:rows};
await saveJson(path.join(site,'cold-final.json'),manifest);
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const style=(await readFile(path.join(site,'home-final.html'),'utf8')).match(/<style>([\s\S]*?)<\/style>/)[1];
await writeFile(path.join(site,'cold-final.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>鹅巷食光 · 砧板冷食已确认选用</title><style>${style}</style><main><nav><a href="index.html">← 当前审阅</a><a href="home-final.html">家常料理已确认</a><a href="starter-final.html">开局鲜食已确认</a></nav><h1>砧板冷食 · 五道用图与尺寸已确认</h1><p>DS17凉拌鸡肉卷、DS19新鲜生蚝保留原版；DS18手撕紫甘蓝、DS20田园沙拉采用第30轮新版；DS21凉拌卤鹅肉采用第31轮新稿，主料为卤鹅肉、紫洋葱与红椒。成品按构图美观定尺寸，源稿与各档导出保持。</p><div class="grid">${rows.map(r=>`<article><a href="${r.proposal.highres}" target="_blank" rel="noopener"><img src="${r.proposal.image}" alt="${xml(r.name)}" width="96" height="96"></a><h2>${r.code} · ${xml(r.name)}</h2><p>${xml(r.displayLabel)} · 主体约${Math.round(r.expectedOccupancy*100)}%</p><p>主料：${xml(r.ingredients.join('、'))}</p><a href="${r.proposal.source}" target="_blank" rel="noopener">SVG母稿</a> · <a href="${r.proposal.highres}" target="_blank" rel="noopener">1024px大图</a></article>`).join('')}</div><footer>砧板冷食5道固定摘要 · ${reviewId} · <a href="cold-final.json">来源清单</a></footer></main></html>`);
const artRef=r=>({source:'output/plan4-food-review/site/'+r.proposal.source,png512:'output/plan4-food-review/site/'+r.proposal.png,preview512:'output/plan4-food-review/site/'+r.proposal.image,highres:'output/plan4-food-review/site/'+r.proposal.highres,sha256:r.proposal.sha256});
baseline.finalizedColdReview={reviewId,sourceReviewId,status,count:5,manifest:'output/plan4-food-review/site/cold-final.json',url:'http://127.0.0.1:5284/cold-final.html'};
baseline.plannedColdBatch={reviewId,sourceReviewId,status,counts,runtimeArtworkIntegrationStatus:'LOCAL_IMPLEMENTED',slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:'ACCEPTED',ingredients:r.ingredients,inputIds:r.inputIds,recipeDescription:r.recipeDescription,expectedOccupancy:r.expectedOccupancy,selectedVariant:'proposal',selectedArtwork:artRef(r),artwork:artRef(r)}))};
for(const r of rows){
  const item=baseline.items.find(x=>x.id===r.id);if(!item)throw Error('Cold recipe identity missing');
  item.choice=r.userAcceptedNewArtwork?'USER_SELECTED_NEW':'USER_SELECTED_ORIGINAL';item.userReview='ARTWORK_AND_PRESENTATION_CONFIRMED';
  item.latestReview={reviewId,sourceReviewId,code:r.code,status:'ACCEPTED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
  item.proposal={reviewId,status:'ACCEPTED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
  item.selectedArtwork={reviewId,sourceReviewId,selection:r.artworkSelection,selectedVariant:'proposal',userAcceptedArtwork:true,presentationStatus:'USER_CONFIRMED',sourceSelection:r.sourceSelection,artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
}
baseline.currentReview={round:31,reviewId,sourceReviewId,status,counts,batchId:'chopping-board',manifest:'output/plan4-food-review/site/cold-final.json',url:'http://127.0.0.1:5284/cold-final.html',checks};
baseline.counts={...baseline.counts,currentCandidates:0,presentationPending:0,currentAccepted:5};
if(legacyBefore!==JSON.stringify(baseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW'))||legacyHistories!==JSON.stringify(['DS08','DS20'].map(code=>baseline.items.find(r=>r.code===code)?.legacySelection)))throw Error('Historical recipe selections changed');
await saveJson(baselineFile,baseline);
const bookFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=await json(bookFile);
const acceptance={reviewId:sourceReviewId,date:'2026-10-29',userQuote,status,finalizedReviewId:reviewId,counts,selectedNewCodes:['DS18','DS20','DS21'],selectedOriginalCodes:['DS17','DS19'],selectedArtwork:rows.map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:r.sourceSelection,expectedOccupancy:r.expectedOccupancy,presentationStatus:'USER_CONFIRMED'})),runtimeArtworkIntegrationStatus:'LOCAL_IMPLEMENTED'};
const at=book.reviews.findIndex(r=>r.reviewId===sourceReviewId);if(at<0)book.reviews.push(acceptance);else book.reviews[at]=acceptance;await saveJson(bookFile,book);
const registryFile=path.join(root,'artwork/plan4-food/runtime-overrides.json'),registry=await json(registryFile);
const goose=rows.find(r=>r.code==='DS21'),entry=registry.find(r=>r.id===goose.id);
if(!entry||entry.sourceSha256!==goose.proposal.sha256.source)throw Error('Runtime goose source differs from approved artwork');
const approvedSourceSelection={reviewId,sourceReviewId,variant:'final-selected',sha256:goose.proposal.sha256};
entry.approvalStatus='USER_CONFIRMED';entry.sourceSelection=approvedSourceSelection;
await saveJson(registryFile,registry);
const metadataFiles=['artwork/v3-b/catalog.json','artwork/v3-b/manifest.json','public/assets/v3-manifest.json'];
for(const file of metadataFiles){const data=await json(path.join(root,file)),row=data.find(r=>r.id===goose.id);if(!row||row.mode!=='plan4-approved-svg')throw Error('Goose runtime metadata missing');row.approvalStatus='USER_CONFIRMED';row.sourceSelection=approvedSourceSelection;await saveJson(path.join(root,file),data);}
const runtime=await json(path.join(root,'public/assets/v3-manifest.json')),mobile=await json(path.join(root,'public/assets/mobile-manifest.json'));
for(const row of runtime)if(hash(await readFile(path.join(root,'public',row.path)))!==row.sha256)throw Error('Runtime image changed');
for(const row of mobile)if(hash(await readFile(path.join(root,'public',row.path)))!==row.sha256)throw Error('Mobile image changed');
const template=await readFile(path.join(root,'artwork/v3-b/review-template.html'),'utf8');if(!template.includes('__MANIFEST__'))throw Error('Runtime review marker missing');
const overview=template.replace('__MANIFEST__',JSON.stringify(runtime));
await writeFile(path.join(root,'artwork/v3-b/overview.html'),overview);await writeFile(path.join(root,'public/art-v4.html'),overview);
console.log(JSON.stringify({reviewId,sourceReviewId,status,counts,checks,approvalMetadataFiles:['artwork/plan4-food/runtime-overrides.json',...metadataFiles,'artwork/v3-b/overview.html','public/art-v4.html'],runtimeImageHashesPreserved:runtime.length,mobileImageHashesPreserved:mobile.length,url:'http://127.0.0.1:5284/cold-final.html'},null,2));

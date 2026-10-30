import { createHash } from 'node:crypto';
import { access, cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const sourceReviewId='38c27e8618f6',userQuote='新版采用DS30和DS31，其它保留原版。继续下一轮，要做得顶尖。';
const baseCatalogSha256='16f50aaae40fb8b54f90511b73908b0c7a6b7edad720dd8b23749ead3dced4df';
const expansionSha256='0c427f5beecb6587bfee47cf70eda856f9df391811585c7bd080164df758feee';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async filename=>JSON.parse(await readFile(filename,'utf8'));
const saveJson=(filename,value)=>writeFile(filename,JSON.stringify(value,null,2)+'\n');
const archive=path.join(output,'checkpoints',sourceReviewId,'site');
try{await access(path.join(archive,'round32.json'));}catch{
  const live=await json(path.join(site,'samples.json'));
  if(live.reviewId!==sourceReviewId)throw Error('Round32 source differs');
  await cp(site,archive,{recursive:true,errorOnExist:true,force:false});
}
const previous=await json(path.join(archive,'round32.json'));
if(previous.reviewId!==sourceReviewId||previous.samples.length!==10)throw Error('Round32 archive differs');
if(hash(await readFile(path.join(root,'src/content/catalog.ts')))!==baseCatalogSha256||hash(await readFile(path.join(root,'src/content/expansion-data.json')))!==expansionSha256)throw Error('Actual recipe content differs');
const baselineFile=path.join(output,'recipe-baseline.json'),baseline=await json(baselineFile);
const legacyCodes=['DS24','DS26'];
const activeLegacy=baseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW');
const unrelatedLegacy=activeLegacy.filter(r=>!legacyCodes.includes(r.code));
if(unrelatedLegacy.length!==3)throw Error('Three unrelated legacy choices required');
const unrelatedSnapshot=JSON.stringify(unrelatedLegacy);
const earlierHistories=JSON.stringify(['DS08','DS20'].map(code=>baseline.items.find(r=>r.code===code)?.legacySelection));
async function verifyAsset(asset,id,bases){
  for(const base of bases)for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': selected artwork changed');
}
const earlierFinals=[];
for(const [stem,id,count]of [['starter-final','9ecc918006ca',6],['home-final','7b4a11197419',10],['cold-final','5caee26b153b',5]]){
  const final=await json(path.join(site,stem+'.json'));
  if(final.reviewId!==id||final.samples.length!==count)throw Error('Earlier final inventory differs');
  for(const row of final.samples)await verifyAsset(row.proposal,row.code,[site,archive]);
  earlierFinals.push(final);
}
for(const item of unrelatedLegacy){const a=item.selectedArtwork.artwork;for(const [file,digest]of [[a.source,a.sha256.source],[a.png512,a.sha256.png],[a.preview512,a.sha256.image],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error('Legacy asset changed');}
const rows=[];
for(const old of previous.samples){
  const isNew=['DS30','DS31'].includes(old.code),variant=isNew?'proposal':'original',selected=old[variant];
  await verifyAsset(selected,old.code,[site,archive]);
  const item=baseline.items.find(r=>r.id===old.id);if(!item)throw Error('Drink identity missing');
  if(legacyCodes.includes(old.code)){
    const originalSelection=item.legacySelection?.selectedArtwork??item.selectedArtwork;
    if(originalSelection?.reviewId!=='437a9a667ee5'||originalSelection.selection!=='original'||JSON.stringify(originalSelection.artwork.sha256)!==JSON.stringify(selected.sha256))throw Error('Reaffirmed original source differs');
  }
  const sourceSelection={reviewId:sourceReviewId,variant,sha256:selected.sha256};
  rows.push({...old,index:rows.length+1,status:'ACCEPTED',statusLabel:'用图与尺寸已确认',displayLabel:isNew?'新版 · 已确认':'原版 · 已确认',selection:'selected',artworkStatus:'USER_ACCEPTED',artworkSelection:isNew?'round32-new':'original',changeType:'unchanged',expectedOccupancy:.8,selectedFromReviewId:sourceReviewId,confirmedPresentationReviewId:sourceReviewId,acceptedReviewId:sourceReviewId,userAcceptedNewArtwork:isNew,sourceSelection,sourceLabel:legacyCodes.includes(old.code)?'再次确认437既定原版，原始批准记录与源稿、全部导出保持':'本次选定用图与尺寸固定，源稿及全部导出原字节保持',reason:'仅DS30优酪乳与DS31益生菌饮品采用第32轮新版，其余八款保留原版。',original:selected,proposal:selected});
}
if(rows.some((r,i)=>r.code!=='DS'+String(i+22).padStart(2,'0')))throw Error('Drink selected scope differs');
for(const row of rows)if(!row.userAcceptedNewArtwork){
  row.authoringSource=baseline.items.find(item=>item.id===row.id).original.source;
  row.design={identity:'沿用V4原版主料表现，所选造型与配色保持',container:'原版杯型与配料位置原样保持',size:'主体最长边80%，沿用原版全部导出'};
}
const reviewId=hash(JSON.stringify(['drinks-final',rows.map(r=>[r.id,r.proposal.sha256,r.expectedOccupancy])])).slice(0,12);
const status='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED';
const counts={total:10,accepted:10,selectedNew:2,selectedOriginal:8,candidates:0,sizePending:0,pending:0};
const checks={selectedSourceAndExportsByteIdentical:10,confirmedEarlierRecipeSourcesAndExportsByteIdentical:21,reaffirmed437OriginalSourcesAndExportsByteIdentical:2,unrelatedLegacySelectionsPreserved:3,DS08AndDS20LegacyHistoriesPreserved:true,actualBaseCatalogUnchanged:true,actualBaseCatalogSha256:baseCatalogSha256,actualExpansionContentUnchanged:true,actualExpansionSha256:expansionSha256,actualRecipeChanges:0,actualGameNameChanges:0,runtimeGeometryAndImagesUnchanged:true};
const manifest={title:'果饮奶茶十款 · 已确认选用',reviewId,sourceReviewId,status,userQuote,batch:'fruit-press',counts,checks,previousFinalReviews:previous.previousFinalReviews,previousRecipeFinalReviews:previous.previousRecipeFinalReviews,actualGameArtIntegrationPending:true,samples:rows};
await saveJson(path.join(site,'drinks-final.json'),manifest);
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const style=(await readFile(path.join(site,'cold-final.html'),'utf8')).match(/<style>([\s\S]*?)<\/style>/)[1];
await writeFile(path.join(site,'drinks-final.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>鹅巷食光 · 果饮奶茶已确认选用</title><style>${style}</style><main><nav><a href="index.html">← 当前审阅</a><a href="cold-final.html">砧板冷食已确认</a><a href="home-final.html">家常料理已确认</a></nav><h1>果饮奶茶 · 十款用图与尺寸已确认</h1><p>DS30优酪乳、DS31益生菌饮品采用第32轮新版，其余八款保留原版，主体均80%。DS24鹅鹅手打柠檬茶与DS26珍珠奶茶是再次确认此前437既定原版，历史批准来源继续保持。当前为选定源与审阅资产摘要，饮品用图等待后续统一接入正式美术流程。</p><div class="grid">${rows.map(r=>`<article><a href="${r.proposal.highres}" target="_blank" rel="noopener"><img src="${r.proposal.image}" alt="${xml(r.name)}" width="96" height="96"></a><h2>${r.code} · ${xml(r.name)}</h2><p>${xml(r.displayLabel)} · 主体约80%</p><p>主料：${xml(r.ingredients.join('、'))}</p><a href="${r.proposal.source}" target="_blank" rel="noopener">SVG母稿</a> · <a href="${r.proposal.highres}" target="_blank" rel="noopener">1024px大图</a></article>`).join('')}</div><footer>果饮奶茶10款固定摘要 · ${reviewId} · <a href="drinks-final.json">来源清单</a></footer></main></html>`);
const artRef=r=>({source:'output/plan4-food-review/site/'+r.proposal.source,png512:'output/plan4-food-review/site/'+r.proposal.png,preview512:'output/plan4-food-review/site/'+r.proposal.image,highres:'output/plan4-food-review/site/'+r.proposal.highres,sha256:r.proposal.sha256});
baseline.finalizedDrinkReview={reviewId,sourceReviewId,status,count:10,manifest:'output/plan4-food-review/site/drinks-final.json',url:'http://127.0.0.1:5284/drinks-final.html'};
baseline.plannedDrinkBatch={reviewId,sourceReviewId,status,counts,actualGameArtIntegrationPending:true,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:'ACCEPTED',ingredients:r.ingredients,recipeDescription:r.recipeDescription,expectedOccupancy:r.expectedOccupancy,selectedVariant:'proposal',selectedArtwork:artRef(r),artwork:artRef(r)}))};
for(const r of rows){
  const item=baseline.items.find(x=>x.id===r.id);
  if(legacyCodes.includes(r.code)&&!item.legacySelection)item.legacySelection={reviewId:'437a9a667ee5',choice:item.choice,userReview:item.userReview,selectedArtwork:structuredClone(item.selectedArtwork),reaffirmedBy:sourceReviewId};
  const legacy=item.legacySelection;
  item.choice=r.userAcceptedNewArtwork?'USER_SELECTED_NEW':'USER_SELECTED_ORIGINAL';item.userReview='ARTWORK_AND_PRESENTATION_CONFIRMED';
  item.latestReview={reviewId,sourceReviewId,code:r.code,status:'ACCEPTED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};item.proposal={reviewId,status:'ACCEPTED',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};
  item.selectedArtwork={reviewId,sourceReviewId,selection:r.artworkSelection,selectedVariant:'proposal',userAcceptedArtwork:true,presentationStatus:'USER_CONFIRMED',sourceSelection:legacyCodes.includes(r.code)?legacy.selectedArtwork.sourceSelection??{reviewId:'437a9a667ee5',variant:'original',sha256:legacy.selectedArtwork.artwork.sha256}:r.sourceSelection,confirmationSourceSelection:r.sourceSelection,artwork:artRef(r),expectedOccupancy:r.expectedOccupancy,...(legacyCodes.includes(r.code)?{legacyApprovalReviewId:'437a9a667ee5',originalSelectionPreserved:true}:{})};
}
baseline.currentReview={round:32,reviewId,sourceReviewId,status,counts,batchId:'fruit-press',manifest:'output/plan4-food-review/site/drinks-final.json',url:'http://127.0.0.1:5284/drinks-final.html',checks};
baseline.counts={...baseline.counts,activeLegacySelections:3,currentCandidates:0,presentationPending:0,currentAccepted:10};
if(unrelatedSnapshot!==JSON.stringify(baseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW'))||earlierHistories!==JSON.stringify(['DS08','DS20'].map(code=>baseline.items.find(r=>r.code===code)?.legacySelection)))throw Error('Unrelated legacy choices changed');
await saveJson(baselineFile,baseline);
const bookFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=await json(bookFile);
const acceptance={reviewId:sourceReviewId,date:'2026-10-29',userQuote,status,finalizedReviewId:reviewId,counts,selectedNewCodes:['DS30','DS31'],selectedOriginalCodes:rows.filter(r=>!r.userAcceptedNewArtwork).map(r=>r.code),reaffirmedLegacyOriginalCodes:['DS24','DS26'],selectedArtwork:rows.map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:r.sourceSelection,expectedOccupancy:r.expectedOccupancy,presentationStatus:'USER_CONFIRMED'})),actualGameArtIntegrationPending:true};
const at=book.reviews.findIndex(r=>r.reviewId===sourceReviewId);if(at<0)book.reviews.push(acceptance);else book.reviews[at]=acceptance;await saveJson(bookFile,book);
console.log(JSON.stringify({reviewId,sourceReviewId,status,counts,checks,url:'http://127.0.0.1:5284/drinks-final.html'},null,2));

import {createHash} from 'node:crypto';
import {access,cp,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const sourceReviewId='3dc5636f053d',userQuote='原版保留DS43，其它采用新版。重做DS40 · 酥炸扇贝。继续下一轮，要做得顶尖';
const hash=b=>createHash('sha256').update(b).digest('hex');
const json=async f=>JSON.parse(await readFile(f,'utf8'));
const saveJson=(f,v)=>writeFile(f,JSON.stringify(v,null,2)+'\n');
const archive=path.join(output,'checkpoints',sourceReviewId,'site');
try{await access(path.join(archive,'round35.json'));}catch(error){
 if(error.code!=='ENOENT')throw error;
 if((await json(path.join(site,'samples.json'))).reviewId!==sourceReviewId)throw Error('Round35 source required');
 await cp(site,archive,{recursive:true,errorOnExist:true,force:false});
}
const previous=await json(path.join(archive,'round35.json'));
if(previous.reviewId!==sourceReviewId||previous.samples.length!==10)throw Error('Round35 scope differs');
for(const [f,digest]of [['src/content/catalog.ts','16f50aaae40fb8b54f90511b73908b0c7a6b7edad720dd8b23749ead3dced4df'],['src/content/expansion-data.json','0c427f5beecb6587bfee47cf70eda856f9df391811585c7bd080164df758feee'],['public/assets/v3-manifest.json','4b549e279d217c68dd788b8c03afaf336a61272db58517b5559765bac5e02b2d']])if(hash(await readFile(path.join(root,f)))!==digest)throw Error('Formal content changed: '+f);
const baselineFile=path.join(output,'recipe-baseline.json'),baseline=await json(baselineFile);
const currentBefore=JSON.stringify(baseline.currentReview),unrelatedBefore=JSON.stringify(baseline.items.filter(r=>r.group!=='frying-station'));
const legacyOther=baseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW'&&r.code!=='DS43');
if(legacyOther.length!==2)throw Error('Two unrelated legacy choices required');
async function verify(asset,id){for(const base of [site,archive])for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error('Selected bytes changed: '+id);}
for(const [stem,id,count]of [['starter-final','9ecc918006ca',6],['home-final','7b4a11197419',10],['cold-final','5caee26b153b',5],['drinks-final','feb086daf312',10],['pot-final','f3871dd4bf1b',4]]){
 const final=await json(path.join(site,stem+'.json'));if(final.reviewId!==id||final.samples.length!==count)throw Error('Earlier final differs');
 for(const row of final.samples)await verify(row.proposal,row.code);
}
const rows=[];
for(const old of previous.samples){
 const existing=old.code==='DS43',redesign=old.code==='DS40',variant=existing?'original':'proposal',selected=old[variant],item=baseline.items.find(r=>r.id===old.id);
 await verify(selected,old.code);
 const legacy=item.legacySelection?.selectedArtwork??item.selectedArtwork;
 if(existing&&(legacy.reviewId!=='437a9a667ee5'||JSON.stringify(legacy.artwork.sha256)!==JSON.stringify(selected.sha256)))throw Error('DS43 retained selection differs');
 const occupancy=existing?.8:old.expectedOccupancy;
 rows.push({...old,index:rows.length+1,status:redesign?'REDESIGN_REQUESTED':'ACCEPTED',statusLabel:redesign?'第35轮新版已选 · 扇贝精修待确认':existing?'既定版本 · 已确认保留':'第35轮新版 · 已确认采用',displayLabel:redesign?'已选新版 · 精修待确认':existing?'保留此前版本':'已采用新版',selection:'selected',artworkStatus:redesign?'SELECTED_NEW_REDESIGN_PENDING':'USER_ACCEPTED',artworkSelection:existing?'retained-437-new':'round35-new',changeType:'unchanged',expectedOccupancy:occupancy,priorExpectedOccupancy:occupancy,userAcceptedNewArtwork:!existing,sourceSelection:existing?{reviewId:'437a9a667ee5',variant:'approved-sample',sha256:selected.sha256}:{reviewId:sourceReviewId,variant:'proposal',sha256:selected.sha256},confirmationSourceSelection:{reviewId:sourceReviewId,variant,sha256:selected.sha256},sourceLabel:redesign?'第35轮新版作为已选基底保持，新一轮重新设计扇贝，待用户确认精修稿。':existing?'保留本次评审左侧的此前既定版本，原始437来源和全部导出保持。':'按本次选择固定第35轮新版，母稿与全部导出原字节保持。',reason:existing?'保留此前已选版本，母稿、全部导出与80%体量保持。':old.reason,design:existing?{identity:'此前已选版本的牛排造型、配色与细描边保持。',container:'原有摆盘与配料位置保持。',size:'既定80%体量，全部导出原字节保持。'}:old.design,authoringSource:existing?legacy.artwork.source:old.authoringSource,original:selected,proposal:selected});
}
const reviewId=hash(JSON.stringify(['frying-selected',rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy])])).slice(0,12),status='NINE_FRYING_ARTWORKS_CONFIRMED_SCALLOP_REDESIGN_PENDING';
const counts={total:10,accepted:9,selectedNew:9,selectedOriginal:1,retainedExistingSelections:1,candidates:1,pending:1};
const checks={selectedSourceAndExportsByteIdentical:10,earlierConfirmedRecipeSourcesAndExportsByteIdentical:35,DS43Prior437ArtworkReaffirmed:true,DS40NewSelectedAsRedesignBase:true,unrelatedLegacySelectionsPreserved:2,actualRecipeChanges:0,actualGameNameChanges:0,runtimeGeometryAndImagesUnchanged:true};
const manifest={title:'煎炸十道 · 本次选用与扇贝精修',reviewId,sourceReviewId,status,userQuote,batch:'frying-station',counts,checks,previousFinalReviews:previous.previousFinalReviews,previousRecipeFinalReviews:previous.previousRecipeFinalReviews,actualGameArtIntegrationPending:true,samples:rows};
await saveJson(path.join(site,'frying-selected.json'),manifest);
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const style=(await readFile(path.join(site,'pot-final.html'),'utf8')).match(/<style>([\s\S]*?)<\/style>/)[1];
await writeFile(path.join(site,'frying-selected.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>鹅巷食光 · 煎炸选用记录</title><style>${style}</style><main><nav><a href="index.html">← 当前审阅</a><a href="pot-final.html">料理锅已确认</a></nav><h1>煎炸十道 · 九道固定，扇贝继续精修</h1><p>DS43保留上一轮左侧的此前既定版本，其余九道选用第35轮新版。DS40酥炸扇贝以已选新版为基底重新设计，新精修稿仍待你确认；其余九道选用与尺寸已固定。当前为选用源与审阅资产记录，正式美术待后续统一接入。</p><div class="grid">${rows.map(r=>`<article><a href="${r.proposal.highres}" target="_blank" rel="noopener"><img src="${r.proposal.image}" alt="${xml(r.name)}" width="96" height="96"></a><h2>${r.code} · ${xml(r.name)}</h2><p>${xml(r.displayLabel)} · 主体约${Math.round(r.expectedOccupancy*100)}%</p><p>主料：${xml(r.ingredients.join('、'))}</p><a href="${r.proposal.source}" target="_blank" rel="noopener">SVG母稿</a> · <a href="${r.proposal.highres}" target="_blank" rel="noopener">1024px大图</a></article>`).join('')}</div><footer>${reviewId} · <a href="frying-selected.json">来源清单</a></footer></main></html>`);
const artRef=r=>({source:'output/plan4-food-review/site/'+r.proposal.source,png512:'output/plan4-food-review/site/'+r.proposal.png,preview512:'output/plan4-food-review/site/'+r.proposal.image,highres:'output/plan4-food-review/site/'+r.proposal.highres,sha256:r.proposal.sha256});
for(const row of rows){
 const item=baseline.items.find(r=>r.id===row.id),existing=row.code==='DS43',redesign=row.code==='DS40';
 if(existing&&!item.legacySelection)item.legacySelection={reviewId:'437a9a667ee5',choice:item.choice,userReview:item.userReview,selectedArtwork:structuredClone(item.selectedArtwork),reaffirmedBy:sourceReviewId};
 item.choice=existing?'USER_RETAINED_EXISTING_SELECTION':'USER_SELECTED_NEW';item.userReview=redesign?'NEW_SELECTED_REDESIGN_REQUESTED':'ARTWORK_AND_PRESENTATION_CONFIRMED';
 item.latestReview={reviewId,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={...item.latestReview};
 item.selectedArtwork={reviewId,sourceReviewId,selection:row.artworkSelection,selectedVariant:existing?'original':'proposal',userAcceptedArtwork:true,presentationStatus:redesign?'REDESIGN_REQUESTED':'USER_CONFIRMED',sourceSelection:row.sourceSelection,confirmationSourceSelection:row.confirmationSourceSelection,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy,actualGameArtIntegrationPending:true,...(existing?{legacyApprovalReviewId:'437a9a667ee5',existingSelectionPreserved:true}:{})};
}
baseline.selectedFryingReview={reviewId,sourceReviewId,status,counts,manifest:'output/plan4-food-review/site/frying-selected.json',url:'http://127.0.0.1:5284/frying-selected.html'};
baseline.plannedFryingBatch={reviewId,sourceReviewId,status,counts,actualGameArtIntegrationPending:true,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:r.status,ingredients:r.ingredients,recipeDescription:r.recipeDescription,expectedOccupancy:r.expectedOccupancy,sourceSelection:r.sourceSelection,selectedArtwork:artRef(r),artwork:artRef(r)}))};
if(currentBefore!==JSON.stringify(baseline.currentReview)||unrelatedBefore!==JSON.stringify(baseline.items.filter(r=>r.group!=='frying-station')))throw Error('Unrelated baseline changed');
await saveJson(baselineFile,baseline);
const bookFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=await json(bookFile);
const acceptance={reviewId:sourceReviewId,date:'2026-10-29',userQuote,status,selectedReviewId:reviewId,counts,selectedNewCodes:rows.filter(r=>r.code!=='DS43').map(r=>r.code),selectedOriginalCodes:['DS43'],originalMeansReviewLeftSide:true,reaffirmedLegacyCode:'DS43',redesignCodes:['DS40'],selectedArtwork:rows.map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:r.sourceSelection,confirmationSourceSelection:r.confirmationSourceSelection,expectedOccupancy:r.expectedOccupancy,presentationStatus:r.code==='DS40'?'REDESIGN_REQUESTED':'USER_CONFIRMED'})),actualGameArtIntegrationPending:true};
const at=book.reviews.findIndex(r=>r.reviewId===sourceReviewId);if(at<0)book.reviews.push(acceptance);else book.reviews[at]=acceptance;await saveJson(bookFile,book);
console.log(JSON.stringify({reviewId,status,counts,checks,url:'http://127.0.0.1:5284/frying-selected.html'},null,2));

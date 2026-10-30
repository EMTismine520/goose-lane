import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, cp, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round18-feedback.json'),'utf8'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
try{await access(path.join(archive,'round17.json'));}catch{const live=JSON.parse(await readFile(path.join(site,'round17.json'),'utf8'));if(live.reviewId!==feedback.sourceReviewId)throw Error('Source review differs');await cp(site,archive,{recursive:true,errorOnExist:true,force:false});}
const previous=JSON.parse(await readFile(path.join(archive,'round17.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==15)throw Error('Round 17 archive incomplete');
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const content=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(content)!==feedback.actualContentSha256)throw Error('Actual game content changed');
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
async function archivedArtwork(asset,occupancy,id,base=archive){
  const art={};
  for(const [key,field,digest]of [['source','source','source'],['png','png','png'],['webp','image','image'],['highres','highres','highres']]){
    art[key]=await readFile(path.join(base,asset[field]));if(hash(art[key])!==asset.sha256[digest])throw Error(id+': archived artwork differs');
  }
  validate(art.source.toString('utf8'),id);
  for(const [key,size]of [['png',512],['webp',512],['highres',1024]])await inspect(art[key],size,id,occupancy);
  return art;
}
async function verifyCenteredScale(before,after,size,inner,offset,id){
  const expected=await sharp(before).resize(inner,inner,{kernel:'lanczos3'}).ensureAlpha().raw().toBuffer();
  const actual=await sharp(after).ensureAlpha().raw().toBuffer();
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const a=(y*size+x)*4;
    if(x<offset||y<offset||x>=offset+inner||y>=offset+inner){if(actual[a+3]!==0)throw Error(id+': scaled border is not transparent');continue;}
    const b=((y-offset)*inner+x-offset)*4;
    if(actual[a+3]!==expected[b+3]||(expected[b+3]&&[0,1,2].some(channel=>actual[a+channel]!==expected[b+channel])))throw Error(id+': pixels differ from the declared uniform resize');
  }
}
async function shrink(bytes,size,format,id,scale,occupancy){
  const inner=Math.round(size*scale),left=Math.floor((size-inner)/2),right=size-inner-left;
  const job=sharp(bytes).resize(inner,inner,{kernel:'lanczos3'}).extend({top:left,bottom:right,left,right,background:{r:0,g:0,b:0,alpha:0}});
  const result=await (format==='webp'?job.webp({lossless:true,effort:6}):job.png()).toBuffer();
  await verifyCenteredScale(bytes,result,size,inner,left,id);
  const inspection=await inspect(result,size,id,occupancy);
  return {bytes:result,size,format,inner,padding:{left,top:left,right,bottom:right},occupancy:inspection.occupancy,inspection};
}
async function resizedArtwork(original,row,scale,occupancy){
  const png=await shrink(original.png,512,'png',row.code+' PNG',scale,occupancy);
  const webp=await shrink(original.png,512,'webp',row.code+' WebP',scale,occupancy);
  const highres=await shrink(original.highres,1024,'png',row.code+' 1024px',scale,occupancy);
  return {source:original.source,png:png.bytes,webp:webp.bytes,highres:highres.bytes,inspection:{png:png.inspection,webp:webp.inspection,highres:highres.inspection},resizeProof:{scale,relativeToReviewId:feedback.sourceReviewId,relativeToVariant:'original',canonical512Source:'selected-original-png',sourceMasterUnchanged:true,verifiedUniformResizeAndTransparentPadding:true,priorExpectedOccupancy:original.occupancy,expectedOccupancy:occupancy,exports:[png,webp,highres].map(({bytes,inspection,...record})=>record)}};
}

for(const dir of ['assets/round18/original','assets/round18/proposal','assets/round18/highres','sources/round18','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round18/${id}-${group}.svg`,png:`assets/round18/${group}/${id}.png`,image:`assets/round18/${group}/${id}.webp`,highres:`assets/round18/highres/${id}-${group}.png`};
  for(const [key,bytes]of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]])await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
let preservedFixed=0;
for(const entry of previous.previousFinalReviews){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  if(final.reviewId!==entry.reviewId||final.samples.length!==entry.count||final.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Fixed inventory differs');
  for(const row of final.samples){for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(site,row.proposal[key])))!==row.proposal.sha256[key]||hash(await readFile(path.join(archive,row.proposal[key])))!==row.proposal.sha256[key])throw Error(row.code+': confirmed artwork changed');preservedFixed++;}
}
if(preservedFixed!==37)throw Error('Confirmed inventory count differs');
const rows=[],exportInspections={},resizeProofs={};
let adoptedNew=0,retainedFruit=0,originalSourcePreserved=0;
for(const old of previous.samples){
  const resize=feedback.selectedOriginalCodes.includes(old.code),isNew=feedback.selectedNewCodes.includes(old.code),target=resize?feedback.originalSizeTargets[old.code]:old.expectedOccupancy;
  const selectedVariant=resize?'original':'proposal',priorOccupancy=resize?.8:old.expectedOccupancy;
  const beforeArt=await archivedArtwork(old[selectedVariant],priorOccupancy,old.code);beforeArt.occupancy=priorOccupancy;
  const selectedArt=resize?await resizedArtwork(beforeArt,old,target/priorOccupancy,target):beforeArt;
  const original=await save('original',old.id,beforeArt),proposal=await save('proposal',old.id,selectedArt);
  if(resize){
    const master=baseline.items.find(x=>x.id===old.id)?.original;
    if(!master||hash(await readFile(path.join(root,master.source)))!==proposal.sha256.source||proposal.sha256.source!==old.original.sha256.source)throw Error('Selected original source changed');
    originalSourcePreserved++;resizeProofs[old.code]=selectedArt.resizeProof;
  }else{
    if(JSON.stringify(proposal.sha256)!==JSON.stringify(old.proposal.sha256))throw Error(old.code+': selected exports changed');
    if(isNew)adoptedNew++;else if(old.chain==='fresh-exotic')retainedFruit++;
  }
  const accepted=isNew||old.code==='EX08',status=resize?'SIZE_PENDING':accepted?'ACCEPTED':'RETAINED';
  const selectedKind=resize?'original':isNew?'round17-new':old.artworkSelection;
  rows.push({...old,index:rows.length+1,status,statusLabel:resize?'原版已选 · 缩小尺寸待确认':accepted?'新版美术 · 已采用':'当前用图与大小保持',displayLabel:resize?'选用原版 · '+Math.round(target*100)+'%':accepted?'新版 · 已采用':'当前选用与大小保持',selection:'selected',artworkStatus:resize?'ORIGINAL_SELECTED_PRESENTATION_PENDING':accepted?'USER_ACCEPTED':'RETAINED',artworkSelection:selectedKind,changeType:resize?'resize':'unchanged',reason:resize?'保留原版'+old.name+'的造型、配色和细描边，只作等比缩小与透明补边，控制低阶食材体量。':isNew?'按本次选择采用第17轮新版，各档导出与显示大小原样保持。':'沿用当前选用图和既有大小，全部源稿与导出字节保持。',sourceLabel:resize?(old.baselineAcceptedReviewId?'437既定原版来源，':'V4原版来源，')+'母稿保持，仅缩小显示尺寸':isNew?'第17轮新版明确采用，源稿与全档导出保持':'既定用图与尺寸保持',design:resize?{size:'原版主体最长边由约80%收至约'+Math.round(target*100)+'%，仅等比缩放并补足透明边距'}:old.design,expectedOccupancy:target,priorExpectedOccupancy:priorOccupancy,presentationScale:resize?target/priorOccupancy:1,relativePresentationScale:resize?target/priorOccupancy:1,sourceSelection:{reviewId:feedback.sourceReviewId,variant:selectedVariant,sha256:old[selectedVariant].sha256},...(isNew?{acceptedReviewId:feedback.sourceReviewId,userAcceptedNewArtwork:true}:{}),...(resize?{authoringSource:baseline.items.find(x=>x.id===old.id).original.source,sourceOrigin:'V4_ORIGINAL',sizeAdjustment:{from:priorOccupancy,to:target,scale:target/priorOccupancy},resizeProof:selectedArt.resizeProof}:{}),original,proposal});
  exportInspections[old.code]=selectedArt.inspection||{copiedByteIdentical:true,expectedOccupancy:target};
}
if(adoptedNew!==4||retainedFruit!==7||originalSourcePreserved!==4||rows.length!==15)throw Error('Selection scope differs');
const counts={total:15,sizePending:4,accepted:5,retained:6,candidates:0};
for(const [status,count]of [['SIZE_PENDING',4],['ACCEPTED',5],['RETAINED',6]])if(rows.filter(r=>r.status===status).length!==count)throw Error('Status counts differ');
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
for(const row of rows){row.sourceReviewId=reviewId;row.sourceTargetId=row.id;}
async function contact(items,size,mode){
  const compare=mode==='adjustments',cols=4,cw=compare?280:180,ch=compare?180:158,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const titles={adjustments:'乳品原版尺寸 / 调整前后对照',selected:'鲜果与乳品 / 当前选用',fruit:'鲜果整链 / 芒果新版已采用',milk:'乳品整链 / 三项新版与四项原版'};
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${titles[mode]} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：选用原版80%；右：原版缩小，造型、颜色与描边保持':'美术按用户选择 · 前五级控制体量 · 四项原版新尺寸待确认'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+118}" text-anchor="middle" font-size="10">${j?'选用原版 · '+Math.round(row.expectedOccupancy*100)+'%':'调整前 · 80%'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+139}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    if(!compare)texts.push(`<text x="${x+cw/2}" y="${y+154}" text-anchor="middle" font-size="9" fill="#84745f">${xml(row.status==='SIZE_PENDING'?'原版已选 · 尺寸待确认':row.displayLabel)}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round18-${mode}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={adjustments:[],selected:[],fruit:[],milk:[]};for(const size of [40,96])for(const [mode,items]of [['adjustments',rows.filter(r=>r.status==='SIZE_PENDING')],['selected',rows],['fruit',rows.filter(r=>r.chain==='fresh-exotic')],['milk',rows.filter(r=>r.chain==='fresh-milk')]])contacts[mode].push(await contact(items,size,mode));
const checks={fourAdoptedNewSourcesAndExportsByteIdentical:4,otherFruitSourcesAndExportsByteIdentical:7,originalDairyMastersByteIdentical:4,uniformResizeAndTransparentPaddingVerified:true,previousConfirmedSourceAndExportsByteIdentical:37,artworkChoicesSelected:8,newArtworkCandidates:0,resizedOriginalArtworks:4,actualGameContentUnchanged:true,actualContentSha256:hash(content),actualGameNameChanges:0,actualRecipeChanges:0,ingredientIdentitiesPreserved:15,transparentPadding:true,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 鲜果乳品选用与尺寸校准',round:18,reviewId,status:'ARTWORK_SELECTED_FOUR_ORIGINAL_SIZES_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,counts,selectedNewCodes:feedback.selectedNewCodes,selectedOriginalCodes:feedback.selectedOriginalCodes,previousFinalReviews:previous.previousFinalReviews,confirmedSeaReviewId:previous.confirmedSeaReviewId,contacts,checks,resizeProofs,exportInspections,samples:rows};
await writeFile(path.join(site,'round18.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round18.html'),'utf8');if(!template.includes('/*__ROUND18_DATA__*/'))throw Error('Round 18 template marker missing');await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND18_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,field='proposal')=>({source:'output/plan4-food-review/site/'+r[field].source,preview512:'output/plan4-food-review/site/'+r[field].image,highres:'output/plan4-food-review/site/'+r[field].highres,sha256:r[field].sha256});
baseline.currentReview={round:18,reviewId,status:manifest.status,scope:feedback.scope,counts,manifest:'output/plan4-food-review/site/round18.json',url:'http://127.0.0.1:5284/',feedbackSource:'artwork/plan4-food/round18-feedback.json',checks,sizePolicy:feedback.sizePolicy};
baseline.plannedMilkChain={status:'ALL_ARTWORK_SELECTED_FOUR_ORIGINAL_PRESENTATIONS_PENDING',reviewId,manifest:'output/plan4-food-review/site/round18.json',counts:{total:7,selectedNew:3,selectedOriginal:4,sizePending:4,candidates:0},slots:rows.filter(r=>r.chain==='fresh-milk').map(r=>({id:r.id,code:r.code,name:r.name,level:r.level,status:r.status,selectedVariant:feedback.selectedOriginalCodes.includes(r.code)?'original':'round17-new',expectedOccupancy:r.expectedOccupancy,artwork:artRef(r),resizeProof:r.resizeProof}))};
baseline.plannedExoticChain={...baseline.plannedExoticChain,status:'MANGO_ROUND17_NEW_ACCEPTED_OTHER_CURRENT_RESULTS_RETAINED',reviewId,counts:{total:8,acceptedNew:2,retained:6,candidates:0},slots:rows.filter(r=>r.chain==='fresh-exotic').map(r=>({id:r.id,code:r.code,name:r.name,status:r.status,previousReviewStatus:r.previousReviewStatus,expectedOccupancy:r.expectedOccupancy,artwork:artRef(r)}))};
for(const row of rows){const item=baseline.items.find(x=>x.id===row.id);if(!item)continue;item.latestReview={reviewId,code:row.code,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={reviewId,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};if(feedback.selectedNewCodes.includes(row.code)||feedback.selectedOriginalCodes.includes(row.code))item.selectedArtwork={reviewId:feedback.sourceReviewId,userAcceptedArtwork:true,selectedVariant:feedback.selectedOriginalCodes.includes(row.code)?'original':'round17-new',presentationStatus:row.status==='SIZE_PENDING'?'PENDING_USER':'SELECTED_EXISTING_SIZE',artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};}
await writeFile(path.join(output,'material-baseline.json'),JSON.stringify(baseline,null,2)+'\n');
const acceptedFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=JSON.parse(await readFile(acceptedFile,'utf8'));
const entry={reviewId:feedback.sourceReviewId,date:feedback.date,userQuote:feedback.userQuote,status:'FOUR_NEW_SELECTED_FOUR_DAIRY_ORIGINAL_SELECTED_SIZES_PENDING',selectedNewCodes:feedback.selectedNewCodes,selectedOriginalCodes:feedback.selectedOriginalCodes,selectedArtwork:rows.filter(r=>feedback.selectedNewCodes.includes(r.code)||feedback.selectedOriginalCodes.includes(r.code)).map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:r.sourceSelection,expectedOccupancy:r.expectedOccupancy,presentationStatus:r.status})),sizeReviewId:reviewId};
const at=book.reviews.findIndex(x=>x.reviewId===feedback.sourceReviewId);if(at<0)book.reviews.push(entry);else book.reviews[at]=entry;await writeFile(acceptedFile,JSON.stringify(book,null,2)+'\n');
await mkdir(path.join(root,'output/plan4-round18-work'),{recursive:true});await writeFile(path.join(root,'output/plan4-round18-work/checks.json'),JSON.stringify({reviewId,counts,checks,resizeProofs,exportInspections,humanSizeAcceptance:'PENDING_FOUR_ORIGINALS'},null,2)+'\n');
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks,url:'http://127.0.0.1:5284/'},null,2));

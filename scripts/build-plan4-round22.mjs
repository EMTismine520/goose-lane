import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, cp, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { latteRedesign } from '../artwork/plan4-food/round22/latte.mjs';
import { sparklingColdbrewRedesign } from '../artwork/plan4-food/round22/sparkling-coldbrew.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round22-feedback.json'),'utf8'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
try{await access(path.join(archive,'round21.json'));}catch{const live=JSON.parse(await readFile(path.join(site,'round21.json'),'utf8'));if(live.reviewId!==feedback.sourceReviewId)throw Error('Source review differs');await cp(site,archive,{recursive:true,errorOnExist:true,force:false});}
const previous=JSON.parse(await readFile(path.join(archive,'round21.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==18)throw Error('Round 21 archive incomplete');
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const content=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(content)!==feedback.actualContentSha256)throw Error('Actual game content changed');
const candidates=new Map([latteRedesign,sparklingColdbrewRedesign].map(x=>[x.id,x]));
if(candidates.size!==2)throw Error('Two replacement candidates required');
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

for(const dir of ['assets/round22/original','assets/round22/proposal','assets/round22/highres','sources/round22','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round22/${id}-${group}.svg`,png:`assets/round22/${group}/${id}.png`,image:`assets/round22/${group}/${id}.webp`,highres:`assets/round22/highres/${id}-${group}.png`};
  for(const [key,bytes]of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]])await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
let fixedCount=0;
for(const entry of previous.previousFinalReviews){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  if(final.reviewId!==entry.reviewId||final.samples.length!==entry.count||final.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Fixed inventory differs');
  for(const row of final.samples){for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(site,row.proposal[key])))!==row.proposal.sha256[key]||hash(await readFile(path.join(archive,row.proposal[key])))!==row.proposal.sha256[key])throw Error(row.code+': fixed artwork changed');fixedCount++;}
}
if(fixedCount!==55)throw Error('Fixed cross-chain count differs');
async function verifyCurrentChain(slots,label){
  for(const row of slots){const a=row.artwork;for(const [file,digest]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error(label+': current artwork changed');}
  return slots.length;
}
const milkKept=await verifyCurrentChain(baseline.plannedMilkChain.slots,'Milk'),fruitKept=await verifyCurrentChain(baseline.plannedExoticChain.slots,'Fruit');
if(milkKept!==7||fruitKept!==8)throw Error('Retained milk or fruit count differs');
const rows=[],exportInspections={},resizeProofs={};let selectedNew=0,originalSources=0;
for(const old of previous.samples.filter(r=>r.chain==='fresh-coffee')){
  const candidate=candidates.get(old.id),accepted=feedback.selectedNewCodes.includes(old.code),resize=Object.hasOwn(feedback.originalSizeTargets,old.code),variant=accepted?'proposal':'original';
  const occupancy=resize?feedback.originalSizeTargets[old.code]:old.expectedOccupancy,priorOccupancy=accepted?old.expectedOccupancy:.8;
  const beforeArt=await archivedArtwork(old[variant],priorOccupancy,old.code);beforeArt.occupancy=priorOccupancy;
  let art=beforeArt;
  if(candidate){if(candidate.previousName!==old.name||candidate.name!==feedback.replacementNames[old.code]||candidate.expectedOccupancy!==.8)throw Error('Replacement identity differs');art=await render(Buffer.from(candidate.svg),old.code+'-replacement',.8);}
  else if(resize)art=await resizedArtwork(beforeArt,old,occupancy/priorOccupancy,occupancy);
  const original=await save('original',old.id,beforeArt),proposal=await save('proposal',old.id,art);
  if(accepted){if(JSON.stringify(proposal.sha256)!==JSON.stringify(old.proposal.sha256))throw Error(old.code+': adopted artwork changed');selectedNew++;}
  else{
    if(!feedback.selectedOriginalCodes.includes(old.code))throw Error('Unspecified original selection');
    const master=baseline.items.find(x=>x.id===old.id)?.original;
    if(!master||original.sha256.source!==old.original.sha256.source||hash(await readFile(path.join(root,master.source)))!==original.sha256.source)throw Error('Original coffee master changed');
    originalSources++;
  }
  if(candidate&&(proposal.sha256.source===old.proposal.sha256.source||proposal.sha256.source===old.original.sha256.source))throw Error('Replacement must be independently redesigned');
  const status=candidate?'CANDIDATE':resize?'SIZE_PENDING':'ACCEPTED';
  const sourceLabel=candidate?'原版保留对照，替换饮品名称与美术仅为本轮候选':resize?(old.baselineAcceptedReviewId?'437既定原版来源，':'V4原版来源，')+'母稿保持，仅等比缩小显示尺寸':'第21轮新版明确采用，源稿与全部导出原字节保持';
  const reason=candidate?candidate.reason:resize?'保持原版'+old.name+'的造型、配色和细描边，仅等比缩小并补足透明边距，控制低阶饮品的体量。':'按本次选择采用第21轮新版，各档导出与显示大小原样保持。';
  rows.push({...old,index:rows.length+1,name:candidate?.name||old.name,oldName:old.name,actualGameName:old.name,nameChanged:Boolean(candidate),proposedName:candidate?.name,status,statusLabel:candidate?'饮品替换方案 · 待你选择':resize?'原版已选 · 尺寸待确认':'新版美术 · 已采用',displayLabel:candidate?'替换候选 · 待选':resize?'选用原版 · '+Math.round(occupancy*100)+'%':'新版 · 已采用',selection:candidate?'candidate':'selected',artworkStatus:candidate?'REPLACEMENT_PENDING':resize?'ORIGINAL_SELECTED_PRESENTATION_PENDING':'USER_ACCEPTED',artworkSelection:candidate?'replacement-candidate':resize?'original':'round21-new',changeType:candidate?'replacement':resize?'resize':'unchanged',sourceLabel,reason,design:candidate?candidate.design:resize?{size:'原版主体最长边由约80%收至约'+Math.round(occupancy*100)+'%，只等比缩小并透明补边'}:old.design,expectedOccupancy:occupancy,priorExpectedOccupancy:priorOccupancy,presentationScale:resize?occupancy/priorOccupancy:1,relativePresentationScale:resize?occupancy/priorOccupancy:1,sourceSelection:{reviewId:feedback.sourceReviewId,variant,sha256:old[variant].sha256},...(accepted?{acceptedReviewId:feedback.sourceReviewId,userAcceptedNewArtwork:true}:{}),...(candidate?{authoringSource:'artwork/plan4-food/round22/'+(old.level===7?'latte.mjs':'sparkling-coldbrew.mjs'),sourceOrigin:'ROUND22_DRINK_REPLACEMENT',replacementTargetId:old.id}:{}),...(resize?{authoringSource:baseline.items.find(x=>x.id===old.id).original.source,sourceOrigin:'V4_ORIGINAL',sizeAdjustment:{from:priorOccupancy,to:occupancy,scale:occupancy/priorOccupancy},resizeProof:art.resizeProof}:{}),original,proposal});
  exportInspections[old.code]=art.inspection||{copiedByteIdentical:true,expectedOccupancy:occupancy};if(resize)resizeProofs[old.code]=art.resizeProof;
}
if(rows.length!==9||selectedNew!==4||originalSources!==5||rows.filter(r=>r.status==='CANDIDATE').length!==2||rows.filter(r=>r.status==='SIZE_PENDING').length!==3)throw Error('Round 22 selection scope differs');
const counts={total:9,candidates:2,sizePending:3,accepted:4,pending:5};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.name,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
for(const row of rows){row.sourceReviewId=reviewId;row.sourceTargetId=row.id;}
async function contact(items,size,mode){
  const compare=mode==='proposals'||mode==='sizes',cols=mode==='replacements'?2:3,cw=compare?300:180,ch=compare?180:158,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const titles={proposals:'咖啡选用 / 两项重设计与三项尺寸',replacements:'两项饮品替换 / 拿铁与气泡冷萃',sizes:'三项原版 / 等比收小尺寸',coffee:'咖啡整链 / 本轮选用与调整'};
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${titles[mode]} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：所选原版；右：新方案或缩小尺寸，由你确认':'细深色描边 · 已采用四新版保持 · 本轮调整待选择'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+118}" text-anchor="middle" font-size="10">${xml(row.status==='SIZE_PENDING'?j?'选用原版 · '+Math.round(row.expectedOccupancy*100)+'%':'原版 · 80%':j?'替换候选 · '+row.name:'原版 · '+row.oldName)}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+139}" text-anchor="middle" font-size="12">${xml(row.code+' · '+(compare&&row.nameChanged?row.oldName+' → '+row.name:row.name))}</text>`);
    if(!compare)texts.push(`<text x="${x+cw/2}" y="${y+154}" text-anchor="middle" font-size="9" fill="#84745f">${xml(row.status==='SIZE_PENDING'?'原版已选 · 尺寸待确认':row.displayLabel)}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round22-${mode}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={proposals:[],replacements:[],sizes:[],coffee:[]};for(const size of [40,96])for(const [mode,items]of [['proposals',rows.filter(r=>r.status!=='ACCEPTED')],['replacements',rows.filter(r=>r.status==='CANDIDATE')],['sizes',rows.filter(r=>r.status==='SIZE_PENDING')],['coffee',rows]])contacts[mode].push(await contact(items,size,mode));
const checks={fourAdoptedNewSourcesAndExportsByteIdentical:4,originalCoffeeSourcesByteIdentical:5,resizedOriginalArtworks:3,uniformResizeAndTransparentPaddingVerified:true,newReplacementCandidates:2,previousFixedSourceAndExportsByteIdentical:55,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,originalEspressoSourceMasterPreserved:true,actualGameContentUnchanged:true,actualContentSha256:hash(content),actualGameNameChanges:0,actualRecipeChanges:0,proposedReplacementNames:2,ingredientIdsAndLevelsPreserved:9,transparentPadding:true,uniqueSources:new Set(rows.map(r=>r.proposal.sha256.source)).size,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 咖啡选用与两项重设计',round:22,reviewId,status:'FOUR_COFFEE_NEW_SELECTED_THREE_ORIGINAL_SIZES_TWO_REPLACEMENTS_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,counts,selectedNewCodes:feedback.selectedNewCodes,selectedOriginalCodes:feedback.selectedOriginalCodes,previousFinalReviews:previous.previousFinalReviews,contacts,checks,resizeProofs,exportInspections,samples:rows};
await writeFile(path.join(site,'round22.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round22.html'),'utf8');if(!template.includes('/*__ROUND22_DATA__*/'))throw Error('Round 22 template marker missing');await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND22_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,field='proposal')=>({source:'output/plan4-food-review/site/'+r[field].source,preview512:'output/plan4-food-review/site/'+r[field].image,highres:'output/plan4-food-review/site/'+r[field].highres,sha256:r[field].sha256});
baseline.currentReview={round:22,reviewId,status:manifest.status,scope:feedback.scope,counts,manifest:'output/plan4-food-review/site/round22.json',url:'http://127.0.0.1:5284/',feedbackSource:'artwork/plan4-food/round22-feedback.json',checks,sizePolicy:feedback.sizePolicy};
baseline.plannedCoffeeChain={status:'FOUR_NEW_SELECTED_THREE_ORIGINAL_SIZES_TWO_REPLACEMENTS_PENDING',reviewId,manifest:'output/plan4-food-review/site/round22.json',counts,orderedNames:rows.map(r=>r.name),replacementNamesAreProposals:true,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,actualGameName:r.oldName,level:r.level,status:r.status,expectedOccupancy:r.expectedOccupancy,selectedArtwork:artRef(r,r.status==='CANDIDATE'?'original':'proposal'),candidateArtwork:r.status==='CANDIDATE'?artRef(r):undefined,artwork:artRef(r),resizeProof:r.resizeProof}))};
for(const row of rows){const item=baseline.items.find(x=>x.id===row.id);if(!item)continue;item.latestReview={reviewId,code:row.code,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={reviewId,status:row.status,proposedName:row.proposedName,actualGameName:row.oldName,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.selectedArtwork={reviewId:feedback.sourceReviewId,userAcceptedArtwork:true,selectedName:row.status==='CANDIDATE'?row.oldName:row.name,selectedVariant:row.sourceSelection.variant,presentationStatus:row.status==='SIZE_PENDING'?'PENDING_USER':'SELECTED_EXISTING_SIZE',artwork:artRef(row,row.status==='CANDIDATE'?'original':'proposal'),expectedOccupancy:row.expectedOccupancy};}
await writeFile(path.join(output,'material-baseline.json'),JSON.stringify(baseline,null,2)+'\n');
const acceptedFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=JSON.parse(await readFile(acceptedFile,'utf8'));
const entry={reviewId:feedback.sourceReviewId,date:feedback.date,userQuote:feedback.userQuote,status:'FOUR_COFFEE_NEW_SELECTED_OTHERS_ORIGINAL_TWO_REDESIGNS',selectedNewCodes:feedback.selectedNewCodes,selectedOriginalCodes:feedback.selectedOriginalCodes,selectedArtwork:rows.map(r=>({targetId:r.id,code:r.code,name:r.oldName,sourceSelection:r.sourceSelection,expectedOccupancy:r.expectedOccupancy,presentationStatus:r.status==='SIZE_PENDING'?'PENDING_USER':'SELECTED_EXISTING_SIZE'})),redesignRequestedIds:feedback.replacementIds,nextReviewId:reviewId};
const at=book.reviews.findIndex(x=>x.reviewId===feedback.sourceReviewId);if(at<0)book.reviews.push(entry);else book.reviews[at]=entry;await writeFile(acceptedFile,JSON.stringify(book,null,2)+'\n');
await mkdir(path.join(root,'output/plan4-round22-work'),{recursive:true});await writeFile(path.join(root,'output/plan4-round22-work/checks.json'),JSON.stringify({reviewId,counts,checks,resizeProofs,exportInspections,humanAcceptance:'PENDING_THREE_SIZES_AND_TWO_DRINKS'},null,2)+'\n');
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks,url:'http://127.0.0.1:5284/'},null,2));

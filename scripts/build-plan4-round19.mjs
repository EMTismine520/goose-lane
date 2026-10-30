import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, cp, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { grainFrontCandidates } from '../artwork/plan4-food/round19/grain-front.mjs';
import { grainMidCandidates } from '../artwork/plan4-food/round19/grain-mid.mjs';
import { grainTailCandidates } from '../artwork/plan4-food/round19/grain-tail.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round19-feedback.json'),'utf8'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
try{await access(path.join(archive,'round18.json'));}catch{const live=JSON.parse(await readFile(path.join(site,'round18.json'),'utf8'));if(live.reviewId!==feedback.sourceReviewId)throw Error('Source review differs');await cp(site,archive,{recursive:true,errorOnExist:true,force:false});}
const previous=JSON.parse(await readFile(path.join(archive,'round18.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==15)throw Error('Round 18 archive incomplete');
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const content=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(content)!==feedback.actualContentSha256)throw Error('Actual game content changed');
const candidates=new Map([...grainFrontCandidates,...grainMidCandidates,...grainTailCandidates].map(x=>[x.id,x]));
if(candidates.size!==9)throw Error('Nine grain candidates required');
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

for(const dir of ['assets/round19/original','assets/round19/proposal','assets/round19/highres','sources/round19','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round19/${id}-${group}.svg`,png:`assets/round19/${group}/${id}.png`,image:`assets/round19/${group}/${id}.webp`,highres:`assets/round19/highres/${id}-${group}.png`};
  for(const [key,bytes]of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]])await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
function centroid(data,info){
  let mass=0,xsum=0,ysum=0;for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const a=data[(y*info.width+x)*4+3];mass+=a;xsum+=x*a;ysum+=y*a;}return {x:xsum/mass,y:ysum/mass};
}
async function shiftExport(bytes,size,format,dx,dy,id){
  const before=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const padded=await sharp(bytes).extend({left:Math.max(dx,0),right:Math.max(-dx,0),top:Math.max(dy,0),bottom:Math.max(-dy,0),background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
  const shifted=sharp(padded).extract({left:Math.max(-dx,0),top:Math.max(-dy,0),width:size,height:size});
  const result=await (format==='webp'?shifted.webp({lossless:true,effort:6}):shifted.png()).toBuffer();
  const after=await sharp(result).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const a=(y*size+x)*4,tx=x+dx,ty=y+dy;
    if(before.data[a+3]&&(tx<0||ty<0||tx>=size||ty>=size))throw Error(id+': visible pixels would be cropped');
    const ox=x-dx,oy=y-dy,b=(oy*size+ox)*4,valid=ox>=0&&oy>=0&&ox<size&&oy<size;
    if(valid){if(after.data[a+3]!==before.data[b+3]||(before.data[b+3]&&[0,1,2].some(k=>after.data[a+k]!==before.data[b+k])))throw Error(id+': translation altered visible pixels');}
    else if(after.data[a+3])throw Error(id+': translated padding is not transparent');
  }
  const inspection=await inspect(result,size,id,.8),beforeCentroid=centroid(before.data,before.info),afterCentroid=centroid(after.data,after.info);
  if(Math.hypot(afterCentroid.x-size/2,afterCentroid.y-size/2)>=Math.hypot(beforeCentroid.x-size/2,beforeCentroid.y-size/2))throw Error('Translation must improve visual centering');
  return {bytes:result,inspection,proof:{size,format,dx,dy,visiblePixelsUnchanged:true,noClipping:true,transparentPadding:true,beforeCentroid,afterCentroid}};
}
async function reposition(art){
  const {x:dx,y:dy}=feedback.positionOffset512;
  const png=await shiftExport(art.png,512,'png',dx,dy,'MI07 PNG'),webp=await shiftExport(art.png,512,'webp',dx,dy,'MI07 WebP'),highres=await shiftExport(art.highres,1024,'png',dx*2,dy*2,'MI07 1024px');
  return {source:art.source,png:png.bytes,webp:webp.bytes,highres:highres.bytes,inspection:{png:png.inspection,webp:webp.inspection,highres:highres.inspection},positionProof:{sourceMasterUnchanged:true,uniformTranslationOnly:true,scaleUnchanged:true,expectedOccupancy:.8,exports:[png.proof,webp.proof,highres.proof]}};
}
let fixedCount=0;
for(const entry of previous.previousFinalReviews){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  if(final.reviewId!==entry.reviewId||final.samples.length!==entry.count||final.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Fixed inventory differs');
  for(const row of final.samples){for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(site,row.proposal[key])))!==row.proposal.sha256[key]||hash(await readFile(path.join(archive,row.proposal[key])))!==row.proposal.sha256[key])throw Error(row.code+': fixed artwork changed');fixedCount++;}
}
if(fixedCount!==37)throw Error('Fixed cross-chain count differs');
let preservedFruit=0;
for(const row of previous.samples.filter(r=>r.chain==='fresh-exotic')){await archivedArtwork(row.proposal,row.expectedOccupancy,row.code);for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(site,row.proposal[key])))!==row.proposal.sha256[key])throw Error('Current fruit changed');preservedFruit++;}
const rows=[],exportInspections={};let preservedMilk=0;
for(const old of previous.samples.filter(r=>r.chain==='fresh-milk')){
  const isPosition=old.id===feedback.positionTargetId,originalArt=await archivedArtwork(old.proposal,old.expectedOccupancy,old.code),art=isPosition?await reposition(originalArt):originalArt;
  const original=await save('original',old.id,originalArt),proposal=await save('proposal',old.id,art);
  if(!isPosition){if(JSON.stringify(original.sha256)!==JSON.stringify(proposal.sha256))throw Error('Fixed milk must be byte-identical');preservedMilk++;}
  else if(proposal.sha256.source!==original.sha256.source)throw Error('Position adjustment changed SVG artwork');
  rows.push({...old,index:rows.length+1,status:isPosition?'POSITION_PENDING':'ACCEPTED',statusLabel:isPosition?'炼乳位置微调 · 待确认':'用图与尺寸已确认',displayLabel:isPosition?'位置微调 · 待确认':'既定选用 · 已确认',changeType:isPosition?'position':'unchanged',presentationScale:1,relativePresentationScale:1,priorExpectedOccupancy:old.expectedOccupancy,confirmedPresentationReviewId:feedback.sourceReviewId,reason:isPosition?'斜勺使原图主体视觉上偏左下，整体向右上微调，让罐身在棋盘中更稳更居中；造型、配色、描边及大小保持。':'按已确认来源保留全部用图和显示大小，源稿与所有导出原字节保持。',sourceLabel:isPosition?'已采用炼乳仅整体平移，不缩放、不重画':'已确认乳品用图及尺寸固定保持',design:isPosition?{...old.design,position:'整体向右上轻移，以罐身视觉分量居中；最长边仍约80%'}:old.design,...(isPosition?{positionAdjustment:{dx:feedback.positionOffset512.x,dy:feedback.positionOffset512.y,referenceCanvas:512,canvasRatio:{x:feedback.positionOffset512.x/512,y:feedback.positionOffset512.y/512}},positionProof:art.positionProof}:{}),original,proposal});
  if(isPosition)exportInspections[old.code]=art.inspection;
}
const grainItems=baseline.items.filter(r=>r.chain===feedback.nextChain),toastArchive=path.join(output,'checkpoints',feedback.originalToastReviewId,'site');
const toastReview=JSON.parse(await readFile(path.join(toastArchive,'samples.json'),'utf8')),toast=toastReview.samples.find(r=>r.id==='fresh-grain-5');
if(!toast||toast.selection!=='original')throw Error('Previously selected original toast is missing');
for(const [i,item]of grainItems.entries()){
  const candidate=candidates.get(item.id),occupancy=feedback.grainOccupancies[i],code='GR'+String(i+1).padStart(2,'0');
  if(item.level!==i+1||candidate?.name!==item.name||candidate.expectedOccupancy!==occupancy||feedback.orderedGrainNames[i]!==item.name)throw Error('Grain candidate identity differs');
  const source=await readFile(path.join(root,item.original.source));if(hash(source)!==item.original.sourceSha256)throw Error('Original grain master changed');
  let originalArt;
  if(i===4){const asset={source:toast.source,png:toast.png,image:toast.after,highres:toast.highres,sha256:{source:toast.sha256.source,png:toast.sha256.png512,image:toast.sha256.webp512,highres:toast.sha256.highres}};originalArt=await archivedArtwork(asset,.8,code,toastArchive);if(hash(originalArt.source)!==hash(source))throw Error('Original toast source drift');}
  else originalArt=await render(source,code+'-original',.8);
  const art=await render(Buffer.from(candidate.svg),code+'-new',occupancy),original=await save('original',item.id,originalArt),proposal=await save('proposal',item.id,art);
  if(original.sha256.source===proposal.sha256.source||original.sha256.image===proposal.sha256.image)throw Error('Every grain ingredient needs new artwork');
  rows.push({index:rows.length+1,code,id:item.id,name:item.name,oldName:item.name,nameChanged:false,chain:item.chain,group:'谷物面点',level:item.level,status:'CANDIDATE',statusLabel:i===4?'原版已选用 · 新稿另供选择':'全新设计 · 待你选择',displayLabel:'新版候选 · 待选',selection:'candidate',artworkStatus:'GRAIN_CANDIDATE_PENDING',artworkSelection:'candidate',changeType:'redesign',expectedOccupancy:occupancy,priorExpectedOccupancy:.8,sourceLabel:i===4?'吐司既定原版来源全档保留，新稿单独待选':'V4原版保留，本轮另绘新版供选择',reason:candidate.reason,design:candidate.design,authoringSource:'artwork/plan4-food/round19/'+(i<3?'grain-front.mjs':i<6?'grain-mid.mjs':'grain-tail.mjs'),...(i===4?{baselineAcceptedReviewId:feedback.originalToastReviewId,baselineSelectionPreserved:true}:{}),original,proposal});
  exportInspections[code]=art.inspection;
}
if(rows.length!==16||grainItems.length!==9||preservedMilk!==6||preservedFruit!==8)throw Error('Round 19 scope differs');
const counts={total:16,candidates:9,positionPending:1,accepted:6,pending:10};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
for(const row of rows){row.sourceReviewId=reviewId;row.sourceTargetId=row.id;}
async function contact(items,size,mode){
  const compare=['proposals','position'].includes(mode),cols=mode==='position'?1:mode==='pending'?5:mode==='grain'?3:4,cw=compare?280:180,ch=compare?180:158,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const titles={proposals:'炼乳位置与谷物 / 本轮前后对照',pending:'炼乳位置与谷物面点 / 本轮十项',position:'炼乳位置 / 微调前后',milk:'乳品整链 / 炼乳位置微调',grain:'谷物面点 / 九项新版候选'};
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${titles[mode]} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：原版或原位置；右：本轮方案':'细深色描边 · 低阶控制体量 · 本轮方案待你选择'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+118}" text-anchor="middle" font-size="10">${row.status==='POSITION_PENDING'?j?'位置微调':'原位置':j?'新版候选':row.baselineAcceptedReviewId?'原版 · 已选用':'原版'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+139}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    if(!compare)texts.push(`<text x="${x+cw/2}" y="${y+154}" text-anchor="middle" font-size="9" fill="#84745f">${xml(row.status==='CANDIDATE'?'新版候选 · 待选择':row.displayLabel)}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round19-${mode}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={proposals:[],pending:[],position:[],milk:[],grain:[]};for(const size of [40,96])for(const [mode,items]of [['proposals',rows.filter(r=>r.status!=='ACCEPTED')],['pending',rows.filter(r=>r.status!=='ACCEPTED')],['position',rows.filter(r=>r.status==='POSITION_PENDING')],['milk',rows.filter(r=>r.chain==='fresh-milk')],['grain',rows.filter(r=>r.chain==='fresh-grain')]])contacts[mode].push(await contact(items,size,mode));
const positionProof=rows.find(r=>r.status==='POSITION_PENDING').positionProof;
const checks={confirmedOriginalDairySizes:4,otherMilkSourcesAndExportsByteIdentical:6,currentFruitSourcesAndExportsByteIdentical:8,previousConfirmedSourceAndExportsByteIdentical:37,milkPositionSourceMasterUnchanged:true,milkPositionOnlyTranslationVerified:true,milkPositionScaleUnchanged:true,milkPositionNoClipping:true,newGrainDesigns:9,grainOriginalSourcesUnchanged:9,originalToastSourceAndExportsByteIdentical:true,actualGameContentUnchanged:true,actualContentSha256:hash(content),actualGameNameChanges:0,actualRecipeChanges:0,ingredientIdentitiesPreserved:16,transparentPadding:true,uniqueSources:new Set(rows.map(r=>r.proposal.sha256.source)).size,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 炼乳居中与谷物新一轮',round:19,reviewId,status:'CONDENSED_MILK_POSITION_AND_NINE_GRAIN_CANDIDATES_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,counts,previousFinalReviews:previous.previousFinalReviews,confirmedSeaReviewId:previous.confirmedSeaReviewId,contacts,checks,positionProof,exportInspections,samples:rows};
await writeFile(path.join(site,'round19.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round19.html'),'utf8');if(!template.includes('/*__ROUND19_DATA__*/'))throw Error('Round 19 template marker missing');await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND19_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,field='proposal')=>({source:'output/plan4-food-review/site/'+r[field].source,preview512:'output/plan4-food-review/site/'+r[field].image,highres:'output/plan4-food-review/site/'+r[field].highres,sha256:r[field].sha256});
baseline.currentReview={round:19,reviewId,status:manifest.status,scope:feedback.scope,counts,manifest:'output/plan4-food-review/site/round19.json',url:'http://127.0.0.1:5284/',feedbackSource:'artwork/plan4-food/round19-feedback.json',checks,sizePolicy:feedback.sizePolicy};
baseline.plannedMilkChain={...baseline.plannedMilkChain,status:'ARTWORK_AND_SIZES_CONFIRMED_MI07_POSITION_PENDING',reviewId,manifest:'output/plan4-food-review/site/round19.json',counts:{total:7,accepted:6,positionPending:1,sizePending:0,candidates:0},slots:rows.filter(r=>r.chain==='fresh-milk').map(r=>({id:r.id,code:r.code,name:r.name,level:r.level,status:r.status,expectedOccupancy:r.expectedOccupancy,artwork:artRef(r),positionAdjustment:r.positionAdjustment,positionProof:r.positionProof}))};
baseline.plannedGrainChain={status:'NINE_GRAIN_CANDIDATES_PENDING',reviewId,manifest:'output/plan4-food-review/site/round19.json',counts:{total:9,candidates:9},slots:rows.filter(r=>r.chain==='fresh-grain').map(r=>({id:r.id,code:r.code,name:r.name,level:r.level,status:r.status,expectedOccupancy:r.expectedOccupancy,baselineArtwork:artRef(r,'original'),artwork:artRef(r)}))};
for(const row of rows){const item=baseline.items.find(x=>x.id===row.id);if(!item)continue;item.latestReview={reviewId,code:row.code,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={reviewId,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};if(row.chain==='fresh-milk')item.selectedArtwork={...item.selectedArtwork,reviewId:feedback.sourceReviewId,userAcceptedArtwork:true,presentationStatus:'CONFIRMED',positionStatus:row.status==='POSITION_PENDING'?'PENDING_USER':'CONFIRMED',artwork:artRef(row),expectedOccupancy:row.expectedOccupancy,positionAdjustment:row.positionAdjustment};}
await writeFile(path.join(output,'material-baseline.json'),JSON.stringify(baseline,null,2)+'\n');
const acceptedFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=JSON.parse(await readFile(acceptedFile,'utf8'));
const entry={reviewId:feedback.sourceReviewId,date:feedback.date,userQuote:feedback.userQuote,status:'FOUR_DAIRY_ORIGINAL_SIZES_CONFIRMED_MI07_POSITION_NEXT_GRAIN',confirmedSizeCodes:feedback.confirmedSizeCodes,confirmedSizeArtwork:previous.samples.filter(r=>feedback.confirmedSizeCodes.includes(r.code)).map(r=>({targetId:r.id,code:r.code,name:r.name,artwork:r.proposal,expectedOccupancy:r.expectedOccupancy})),positionAdjustmentRequestedId:feedback.positionTargetId,nextCandidateChain:'fresh-grain',nextReviewId:reviewId};
const at=book.reviews.findIndex(x=>x.reviewId===feedback.sourceReviewId);if(at<0)book.reviews.push(entry);else book.reviews[at]=entry;await writeFile(acceptedFile,JSON.stringify(book,null,2)+'\n');
await mkdir(path.join(root,'output/plan4-round19-work'),{recursive:true});await writeFile(path.join(root,'output/plan4-round19-work/checks.json'),JSON.stringify({reviewId,counts,checks,positionProof,exportInspections,humanAcceptance:'PENDING_POSITION_AND_NINE_NEW_ARTWORKS'},null,2)+'\n');
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks,url:'http://127.0.0.1:5284/'},null,2));

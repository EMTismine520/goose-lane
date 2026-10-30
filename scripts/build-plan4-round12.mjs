import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { mushroomCandidates } from '../artwork/plan4-food/round12/mushroom.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round12-feedback.json'),'utf8'));
if(feedback.sourceReviewId!=='93eb1db22c7b')throw Error('Round 12 must use the reviewed round 11 seasonal artworks');
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
const previous=JSON.parse(await readFile(path.join(archive,'round11.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==8)throw Error('The round 11 source archive is incomplete');
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const contentBytes=await readFile(path.join(root,'src/content/expansion-data.json'));
const gameContent=JSON.parse(contentBytes.toString('utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const percent=scale=>Math.round((1-scale)*1000)/10;
if(hash(contentBytes)!==feedback.actualContentSha256)throw Error('Actual game content changed during artwork review');
const redesignId='fresh-seasonal-1',cornId='fresh-seasonal-2';
const expectedVariants={'fresh-seasonal-1':'proposal','fresh-seasonal-2':'original','fresh-seasonal-3':'proposal','fresh-seasonal-4':'proposal','fresh-seasonal-5':'proposal','fresh-seasonal-6':'original','fresh-seasonal-7':'original','fresh-seasonal-8':'original'};
if(feedback.redesignTargetId!==redesignId||feedback.redesignExpectedOccupancy!==.66)throw Error('Only SV01 may receive the restrained new mushroom design');
if(mushroomCandidates.length!==1||mushroomCandidates[0].id!==redesignId||mushroomCandidates[0].name!=='蘑菇'||mushroomCandidates[0].expectedOccupancy!==.66)throw Error('A single new mushroom artwork is required');
for(const row of previous.samples)if(feedback.selectedVariants?.[row.id]!==expectedVariants[row.id])throw Error(row.code+': source choice differs from the user selection');
if(Object.keys(feedback.selectedVariants??{}).length!==8)throw Error('All eight source choices must be explicit');
const cornAdjustment=feedback.presentationAdjustments?.[cornId];
if(cornAdjustment?.scale!==.9||cornAdjustment?.expectedOccupancy!==.72||Object.keys(feedback.presentationAdjustments??{}).length!==1)throw Error('Only the selected original corn may be resized by 0.90');

async function archivedFile(relative){
  const target=path.resolve(archive,relative),r=path.relative(archive,target);
  if(r==='..'||r.startsWith('..'+path.sep)||path.isAbsolute(r))throw Error('Source asset leaves the selected archive');
  return readFile(target);
}
let preservedPrevious=0;
for(const entry of feedback.previousFinalReviews??previous.previousFinalReviews??[]){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  if(final.reviewId!==entry.reviewId||final.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED'||final.samples.length!==entry.count)throw Error(entry.stem+': confirmed selection differs');
  for(const row of final.samples){
    for(const key of ['source','png','image','highres']){
      const rel=row.proposal[key],expected=row.proposal.sha256[key];
      if(hash(await readFile(path.join(site,rel)))!==expected||hash(await archivedFile(rel))!==expected)throw Error(row.code+': previously confirmed master or size changed');
    }
    preservedPrevious++;
  }
}
if(preservedPrevious!==18)throw Error('The confirmed poultry and spice selections must remain complete');

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
  if(new Set(ids).size!==ids.length)throw Error(id+': repeated SVG definition');
  for(const m of svg.matchAll(/url\(["']?#([^)'"\s]+)["']?\)/g))if(!ids.includes(m[1]))throw Error(id+': missing SVG definition '+m[1]);
  const box=svg.match(/\bviewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
  if(!box||box.length!==4||box.some(v=>!Number.isFinite(v))||box[2]<=0||box[3]<=0)throw Error(id+': invalid viewBox');
  return box;
}
async function checkExport(bytes,size,id,expectedOccupancy){
  const meta=await sharp(bytes).metadata();
  if(meta.width!==size||meta.height!==size||!meta.hasAlpha)throw Error(id+': export dimensions or transparency differ');
  const raw=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  const occupancy=Math.max(b.width,b.height)/size;
  if(b.edge||Math.abs(occupancy-expectedOccupancy)>.006)throw Error(id+': image occupancy differs: '+occupancy+' vs '+expectedOccupancy);
  return {occupancy,bounds:b};
}
async function selectedArtwork(row,variant){
  const files=row[variant];
  const [source,png,webp,highres]=await Promise.all([files.source,files.png,files.image,files.highres].map(archivedFile));
  for(const [key,bytes]of [['source',source],['png',png],['image',webp],['highres',highres]])if(hash(bytes)!==files.sha256[key])throw Error(row.code+': selected '+key+' changed');
  validate(source.toString('utf8'),row.code);
  const occupancy=variant==='original'?(row.priorExpectedOccupancy??.8):row.expectedOccupancy;
  await Promise.all([checkExport(png,512,row.code,occupancy),checkExport(webp,512,row.code,occupancy),checkExport(highres,1024,row.code,occupancy)]);
  return {source,png,webp,highres,occupancy};
}
async function render(source,id,occupancy){
  const svg=source.toString('utf8'),box=validate(svg,id);
  const raw=await sharp(source).resize(1024,1024).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  if(b.edge)throw Error(id+': master touches its canvas edge');
  const side=Math.max(b.width/1024*box[2],b.height/1024*box[3])/occupancy;
  const cx=box[0]+(b.left+b.width/2)/1024*box[2],cy=box[1]+(b.top+b.height/2)/1024*box[3];
  const fitted=svg.replace(/(<svg\b[^>]*\bviewBox\s*=\s*)["'][^"']+["']/,'$1"'+[cx-side/2,cy-side/2,side,side].map(v=>v.toFixed(6)).join(' ')+'"');
  const highres=await sharp(Buffer.from(fitted)).resize(1024,1024).png().toBuffer(),png=await sharp(highres).resize(512,512).png().toBuffer(),webp=await sharp(png).webp({lossless:true,effort:6}).toBuffer();
  const inspection={png:await checkExport(png,512,id,occupancy),webp:await checkExport(webp,512,id,occupancy),highres:await checkExport(highres,1024,id,occupancy)};
  return {source,png,webp,highres,inspection};
}
// Check the exported pixels against a uniform resize, including transparent padding.
async function verifyCenteredScale(before,after,size,inner,offset,id){
  const expected=await sharp(before).resize(inner,inner,{kernel:'lanczos3'}).ensureAlpha().raw().toBuffer();
  const actual=await sharp(after).ensureAlpha().raw().toBuffer();
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const a=(y*size+x)*4;
    if(x<offset||y<offset||x>=offset+inner||y>=offset+inner){if(actual[a+3]!==0)throw Error(id+': scaled border is not transparent');continue;}
    const b=((y-offset)*inner+x-offset)*4;
    if(actual[a+3]!==expected[b+3]||(expected[b+3]&&[0,1,2].some(c=>actual[a+c]!==expected[b+c])))throw Error(id+': pixels differ from the declared resize');
  }
}
async function shrink(bytes,size,format,id,scale,expectedOccupancy){
  const inner=Math.round(size*scale),left=Math.floor((size-inner)/2),right=size-inner-left;
  let job=sharp(bytes).resize(inner,inner,{kernel:'lanczos3'}).extend({top:left,bottom:right,left,right,background:{r:0,g:0,b:0,alpha:0}});
  const result=await (format==='webp'?job.webp({lossless:true,effort:6}):job.png()).toBuffer();
  await verifyCenteredScale(bytes,result,size,inner,left,id);
  const inspection=await checkExport(result,size,id,expectedOccupancy);
  return {bytes:result,size,format,inner,padding:{left,top:left,right,bottom:right},occupancy:inspection.occupancy};
}
async function resizedArtwork(original,row,variant,scale,expectedOccupancy){
  const [png,webp,highres]=await Promise.all([shrink(original.png,512,'png',row.code+' PNG',scale,expectedOccupancy),shrink(original.png,512,'webp',row.code+' WebP',scale,expectedOccupancy),shrink(original.highres,1024,'png',row.code+' 1024px',scale,expectedOccupancy)]);
  return {source:original.source,png:png.bytes,webp:webp.bytes,highres:highres.bytes,resizeProof:{scale,relativeToReviewId:feedback.sourceReviewId,relativeToVariant:variant,sourceMasterUnchanged:true,verifiedUniformResizeAndTransparentPadding:true,priorExpectedOccupancy:original.occupancy,expectedOccupancy,exports:[png,webp,highres].map(({bytes,...record})=>record)}};
}
for(const dir of ['assets/round12/original','assets/round12/proposal','assets/round12/v4','assets/round12/highres','sources/round12','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round12/${id}-${group}.svg`,png:`assets/round12/${group}/${id}.png`,image:`assets/round12/${group}/${id}.webp`,highres:`assets/round12/highres/${id}-${group}.png`};
  for(const [key,bytes]of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]])await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
const originalItems=baseline.items.filter(r=>r.chain==='fresh-seasonal');
if(originalItems.length!==8)throw Error('Eight original seasonal nodes are required');
for(const item of originalItems){
  if(hash(await readFile(path.join(root,item.original.source)))!==item.original.sourceSha256)throw Error(item.id+': original master changed');
  const live=gameContent.items.find(r=>r.id===item.id);
  if(live?.name!==item.name||live.level!==item.level)throw Error(item.id+': actual game identity changed');
}
const rows=[],resizeProofs={},exportInspections={};
for(const old of previous.samples){
  const variant=feedback.selectedVariants[old.id],isRedesign=old.id===redesignId,adjustment=feedback.presentationAdjustments?.[old.id];
  const original=await selectedArtwork(old,variant),scale=adjustment?.scale??1;
  const expectedOccupancy=isRedesign?feedback.redesignExpectedOccupancy:original.occupancy*scale;
  if(adjustment&&Math.abs(adjustment.expectedOccupancy-expectedOccupancy)>1e-8)throw Error(old.code+': declared corn occupancy differs from its selected source scale');
  const proposal=isRedesign?await render(Buffer.from(mushroomCandidates[0].svg),old.code,expectedOccupancy):adjustment?await resizedArtwork(original,old,variant,scale,expectedOccupancy):original;
  const before=await save('original',old.id,original),after=await save('proposal',old.id,proposal);
  if(isRedesign){
    if(after.sha256.source===before.sha256.source||after.sha256.image===before.sha256.image||after.sha256.source===old.original.sha256.source)throw Error('SV01 requires a new mushroom composition');
    exportInspections[old.code]=proposal.inspection;
  }else{
    if(before.sha256.source!==after.sha256.source)throw Error(old.code+': selected SVG master changed');
    if(adjustment){if(before.sha256.png===after.sha256.png)throw Error('Corn size did not change');resizeProofs[old.id]=proposal.resizeProof;}
    else if(Object.keys(before.sha256).some(key=>before.sha256[key]!==after.sha256[key]))throw Error(old.code+': fixed selected export changed');
  }
  const isV4=variant==='original',choiceLabel=isRedesign?'蘑菇重设计':isV4?'原版已选':'新版已选';
  const {authoringSource:oldAuthoringSource,resizeProof:oldResizeProof,...prior}=old;
  const sourceInfo=isRedesign?{sourceOrigin:'ROUND12_REDESIGN',sourceTargetId:old.id,authoringSource:'artwork/plan4-food/round12/mushroom.mjs'}:isV4?{sourceOrigin:'V4',sourceReviewId:'V4',sourceTargetId:old.id}:{sourceOrigin:'SELECTED_REVIEW',sourceReviewId:feedback.sourceReviewId,sourceTargetId:old.id,...(oldAuthoringSource?{authoringSource:oldAuthoringSource}:{})};
  const v4Original=isRedesign?await save('v4',old.id,await selectedArtwork(old,'original')):undefined;
  rows.push({...prior,...sourceInfo,index:rows.length+1,status:isRedesign?'CANDIDATE':adjustment?'SIZE_PENDING':'ACCEPTED',statusLabel:isRedesign?'蘑菇新稿 · 待选用':choiceLabel+(adjustment?' · 尺寸待确认':' · 显示保持'),selection:isRedesign?'candidate':'selected',artworkStatus:isRedesign?'REDESIGN_PENDING':'ARTWORK_SELECTED',artworkSelection:isRedesign?'redesign':variant,selectedFromReviewId:isRedesign?null:feedback.sourceReviewId,sourceSelection:{reviewId:feedback.sourceReviewId,variant,sha256:old[variant].sha256,...(isRedesign?{purpose:'previous-proposal-comparison'}:{})},changeType:isRedesign?'redesign':adjustment?'resize':'unchanged',presentationScale:scale,relativePresentationScale:scale,priorExpectedOccupancy:original.occupancy,expectedOccupancy,comparisonArchiveReviewId:feedback.sourceReviewId,confirmedPresentationReviewId:isRedesign||adjustment?null:feedback.sourceReviewId,sourceLabel:isRedesign?'蘑菇重新设计，保留上轮新版作为对照':choiceLabel+'，'+(adjustment?'母稿不变，仅居中缩小10%':'各档图像精确保持'),reason:isRedesign?mushroomCandidates[0].reason:adjustment?'保留所选玉米原版造型、颜色与描边，将各档实际图像内容居中缩小10%，让二级食材体量与整链更协调。':choiceLabel+'；保留所选SVG、PNG512、WebP512与PNG1024及已确认显示大小。',design:isRedesign?mushroomCandidates[0].design:isV4?null:old.design,original:before,proposal:after,...(v4Original?{v4Original}:{}),...(adjustment?{resizeProof:proposal.resizeProof}:{}),...(oldResizeProof?{previousResizeProof:oldResizeProof}:{})});
}
const counts={total:8,candidates:1,accepted:6,pendingPresentation:1,artworkChoicesConfirmed:7};
if(rows.length!==8||rows.filter(r=>r.status==='CANDIDATE').length!==1||rows.filter(r=>r.status==='SIZE_PENDING').length!==1||rows.filter(r=>r.status==='ACCEPTED').length!==6)throw Error('Redesign, size and fixed selection counts differ');
if(new Set(rows.map(r=>r.id)).size!==8||new Set(rows.map(r=>r.proposal.sha256.source)).size!==8||new Set(rows.map(r=>r.proposal.sha256.image)).size!==8)throw Error('All eight identities and artworks must remain unique');
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.artworkSelection,r.status,r.proposal.sha256.source,r.proposal.sha256.image,r.expectedOccupancy]))).slice(0,12);
rows.find(r=>r.id===redesignId).sourceReviewId=reviewId;
async function contact(items,size,mode){
  const compare=mode==='proposals',cols=compare?2:4,cw=compare?320:156,ch=compare?176:158,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${compare?'蘑菇新稿与玉米尺寸 / 两项前后对照':'时蔬选用 / 蘑菇新稿，原版玉米收小'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'每组左：上轮或所选原版　右：本轮；其余六项选用已固定':'SV02/06/07/08原版 · SV03/04/05新版 · 只看本轮两处调整'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare){const label=row.changeType==='redesign'?(j?'蘑菇重新设计':'上轮新版'):(j?'原版缩小10%':'所选原版原尺寸');texts.push(`<text x="${cx}" y="${y+116}" text-anchor="middle" font-size="10" fill="${j?'#4b714a':'#7a6b56'}">${label}</text>`);}
    }
    texts.push(`<text x="${x+cw/2}" y="${y+137}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    if(!compare){const label=row.status==='CANDIDATE'?'蘑菇新稿待选':row.status==='SIZE_PENDING'?'原版已选 · 缩小10%':row.artworkSelection==='original'?'原版已选 · 保持':'新版已选 · 保持';texts.push(`<text x="${x+cw/2}" y="${y+153}" text-anchor="middle" font-size="9" fill="#84745f">${label}</text>`);}
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round12-${mode}-${size}.png`;
  await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));
  return {size,path:filename};
}
const contacts={proposals:[],chains:[]};for(const size of [40,96]){contacts.proposals.push(await contact(rows.filter(r=>r.status!=='ACCEPTED'),size,'proposals'));contacts.chains.push(await contact(rows,size,'chain'));}
const checks={originalSourcesUnchanged:8,selectedSourceMastersByteIdentical:7,unchangedSelectedExportsByteIdentical:6,newMushroomDesigns:1,resizedOriginalCorn:1,cornPresentationScale:.9,cornUniformResizeAndTransparentPaddingVerified:true,previousConfirmedSourcesAndExportsByteIdentical:preservedPrevious,previousConfirmedSizesPreserved:true,artworkChoicesConfirmed:7,newRecipeOrNameChanges:0,transparentPadding:true,actualGameContentUnchanged:true,actualContentSha256:hash(contentBytes),uniqueIdentities:8,uniqueSources:8,uniqueRenderedImages:8,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 蘑菇重设计与玉米尺寸',round:12,reviewId,status:'MUSHROOM_REDESIGN_AND_CORN_SIZE_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,authoringPolicy:feedback.authoringPolicy??previous.authoringPolicy,sizePolicy:feedback.sizePolicy,orderedNames:rows.map(r=>r.name),counts,selectedVariants:feedback.selectedVariants,presentationAdjustments:feedback.presentationAdjustments,redesignTargetId:redesignId,previousFinalReviews:feedback.previousFinalReviews??previous.previousFinalReviews,checks,resizeProofs,exportInspections,contacts,samples:rows};
await writeFile(path.join(site,'round12.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round12.html'),'utf8');
if(!template.includes('/*__ROUND12_DATA__*/'))throw Error('Round 12 template has no data marker');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND12_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks,url:'http://127.0.0.1:5284/'},null,2));

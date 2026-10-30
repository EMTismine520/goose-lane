import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import * as adjustments from '../artwork/plan4-food/round14/fruit-adjustments.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round14-feedback.json'),'utf8'));
if(feedback.sourceReviewId!=='3cdac59d280c'||feedback.chain!=='fresh-exotic')throw Error('Round 14 must follow the selected round 13 exotic fruit artworks');
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
const previous=JSON.parse(await readFile(path.join(archive,'round13.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==8)throw Error('The round 13 source archive is incomplete');
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const items=baseline.items.filter(row=>row.chain==='fresh-exotic');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const xml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const percent=scale=>Math.round((1-scale)*1000)/10;
const expectedOccupancies=[.66,.72,.68,.68,.68,.8,.8,.8];
const expectedScales={'fresh-exotic-2':.9,'fresh-exotic-3':.85,'fresh-exotic-4':.85,'fresh-exotic-5':.85};
const artworkAdjustmentIds=['fresh-exotic-1','fresh-exotic-8'];
const candidates=new Map([...(adjustments.blueberryClusterCandidates??[]),...(adjustments.mulberryColourCandidates??[])].map(row=>[row.id,row]));
if(items.length!==8||candidates.size!==2||artworkAdjustmentIds.some(id=>!candidates.has(id)))throw Error('Only the original blueberry arrangement and selected mulberry palette may receive artwork adjustments');
if(JSON.stringify(feedback.targetOccupancies)!==JSON.stringify(expectedOccupancies))throw Error('The approved per-item size policy differs');
if(JSON.stringify([...(feedback.artworkAdjustmentIds??[])].sort())!==JSON.stringify([...artworkAdjustmentIds].sort()))throw Error('The artwork adjustment scope differs');
if(Object.keys(feedback.selectedVariants??{}).length!==8||Object.keys(feedback.presentationAdjustments??{}).length!==4)throw Error('All eight base choices and only four presentation adjustments must be explicit');
for(const [id,scale]of Object.entries(expectedScales))if(feedback.presentationAdjustments[id]?.scale!==scale)throw Error(id+': unexpected presentation scale');
const contentBytes=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(contentBytes)!==feedback.actualContentSha256)throw Error('Actual game content changed during artwork review');
const gameContent=JSON.parse(contentBytes.toString('utf8'));
const template=await readFile(path.join(root,'scripts/build-plan4-round14.html'),'utf8');
if(!template.includes('/*__ROUND14_DATA__*/'))throw Error('Round 14 template has no data marker');

async function archivedFile(relative){
  const target=path.resolve(archive,relative),rel=path.relative(archive,target);
  if(rel==='..'||rel.startsWith('..'+path.sep)||path.isAbsolute(rel))throw Error('Selected asset leaves the round 13 archive');
  return readFile(target);
}
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
  const ids=[...svg.matchAll(/\bid=["']([^"']+)["']/g)].map(match=>match[1]);
  if(new Set(ids).size!==ids.length)throw Error(id+': duplicate SVG definition');
  for(const match of svg.matchAll(/url\(["']?#([^)'"\s]+)["']?\)/g))if(!ids.includes(match[1]))throw Error(id+': missing SVG definition '+match[1]);
  const box=svg.match(/\bviewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
  if(!box||box.length!==4||box.some(value=>!Number.isFinite(value))||box[2]<=0||box[3]<=0)throw Error(id+': invalid viewBox');
  return box;
}
async function inspect(bytes,size,id,expectedOccupancy){
  const meta=await sharp(bytes).metadata();
  if(meta.width!==size||meta.height!==size||!meta.hasAlpha)throw Error(id+': export dimensions or transparency differ');
  const raw=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  const occupancy=Math.max(b.width,b.height)/size;
  if(b.edge||Math.abs(occupancy-expectedOccupancy)>.006)throw Error(id+': export occupancy differs: '+occupancy+' / '+expectedOccupancy);
  return {occupancy,bounds:b};
}
async function inspectArtwork(art,id,occupancy){
  return {png:await inspect(art.png,512,id+' PNG',occupancy),webp:await inspect(art.webp,512,id+' WebP',occupancy),highres:await inspect(art.highres,1024,id+' 1024px',occupancy)};
}
async function selectedArtwork(row,variant){
  const files=row[variant],art={};
  for(const [key,field]of [['source','source'],['png','png'],['webp','image'],['highres','highres']]){
    art[key]=await archivedFile(files[field]);
    const expected=files.sha256[field];
    if(hash(art[key])!==expected||hash(await readFile(path.join(site,files[field])))!==expected)throw Error(row.code+': selected '+field+' changed');
  }
  validate(art.source.toString('utf8'),row.code);
  art.occupancy=variant==='original'?(row.priorExpectedOccupancy??.8):row.expectedOccupancy;
  art.inspection=await inspectArtwork(art,row.code,art.occupancy);
  return art;
}

let preservedPrevious=0;
for(const entry of feedback.previousFinalReviews){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  const archived=JSON.parse(await archivedFile(entry.stem+'.json'));
  if(final.reviewId!==entry.reviewId||archived.reviewId!==entry.reviewId||final.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED'||final.samples.length!==entry.count)throw Error(entry.stem+': finalized selection differs');
  const calculatedId=hash(JSON.stringify([entry.stem,final.samples.map(row=>[row.id,row.proposal.sha256,row.expectedOccupancy])])).slice(0,12);
  if(calculatedId!==entry.reviewId)throw Error(entry.stem+': finalized source inventory or size changed');
  for(const row of final.samples){
    const old=archived.samples.find(item=>item.id===row.id);
    if(!old||row.name!==old.name||row.level!==old.level||row.expectedOccupancy!==old.expectedOccupancy||JSON.stringify(row.proposal)!==JSON.stringify(old.proposal))throw Error(row.code+': finalized artwork or occupancy metadata changed');
    const art={};
    for(const [key,field]of [['source','source'],['png','png'],['webp','image'],['highres','highres']]){
      art[key]=await archivedFile(row.proposal[field]);
      const expected=row.proposal.sha256[field];
      if(hash(art[key])!==expected||hash(await readFile(path.join(site,row.proposal[field])))!==expected)throw Error(row.code+': finalized source or export changed');
    }
    await inspectArtwork(art,row.code,row.expectedOccupancy);
    preservedPrevious++;
  }
  await readFile(path.join(site,entry.stem+'.html'));
}
if(preservedPrevious!==26)throw Error('All twenty-six confirmed poultry, spice and seasonal artworks must be preserved');

async function verifyPeach(original){
  const reviewId=feedback.baselinePeachReviewId;
  if(reviewId!=='437a9a667ee5')throw Error('The approved original peach provenance differs');
  const peachSite=path.join(output,'checkpoints',reviewId,'site');
  const review=JSON.parse(await readFile(path.join(peachSite,'samples.json'),'utf8'));
  const peach=review.samples.find(row=>row.id==='fresh-exotic-5');
  if(peach?.selection!=='original')throw Error('The previously approved original peach is required');
  for(const [key,field,digest]of [['source','source','source'],['png','png','png512'],['webp','after','webp512'],['highres','highres','highres']]){
    const bytes=await readFile(path.join(peachSite,peach[field]));
    if(hash(bytes)!==peach.sha256[digest]||!bytes.equals(original[key]))throw Error('EX05: the approved original '+key+' was not copied exactly');
  }
}
function verifyArrangement(original,candidate){
  const proof=candidate.arrangementProof??adjustments.arrangementProof;
  if(!proof||proof.sourceSha256!==hash(original)||proof.originalBerryCount!==3||proof.resultingBerryCount!==3||proof.transforms?.length!==4)throw Error('EX01: original three-berry arrangement proof is incomplete');
  let expected=original.toString('utf8');
  for(const {part,originalTransform,translate}of proof.transforms){
    if(!['berry-1','berry-2','berry-3','leaf'].includes(part)||translate?.length!==2||translate.some(value=>!Number.isFinite(value)))throw Error('EX01: invalid placement translation');
    const start=`<g transform="${originalTransform}">`,at=expected.indexOf(start),end=expected.indexOf('</g>',at)+4;
    if(at<0||end<at)throw Error('EX01: original fruit or leaf group is missing');
    const group=expected.slice(at,end);
    expected=expected.slice(0,at)+`<g data-round14-position="${part}" transform="translate(${translate.join(' ')})">${group}</g>`+expected.slice(end);
  }
  if(expected!==candidate.svg)throw Error('EX01: geometry, palette or individual scale changed beyond the declared translations');
  return {...proof,verifiedOriginalBytesPreservedWithinTranslationWrappers:true,verifiedGeometryAndPaletteUnchanged:true,verifiedIndividualScalesUnchanged:true};
}
function verifyColour(original,candidate){
  const proof=candidate.colourProof??adjustments.colourProof;
  if(!proof||proof.sourceId!=='fresh-exotic-8'||proof.sourceSha256!==hash(original)||!Object.keys(proof.mapping??{}).length)throw Error('EX08: the selected shape palette proof is incomplete');
  const expected=original.toString('utf8').replace(/#[0-9a-f]{6}\b/gi,hex=>proof.mapping[hex.toLowerCase()]??hex);
  if(expected!==candidate.svg||expected===original.toString('utf8'))throw Error('EX08: the result must change only the selected shape palette');
  return {...proof,verifiedPaletteMappingOnly:true,verifiedGeometryAndOutlineWidthsUnchanged:true};
}
async function render(source,id,occupancy){
  const svg=source.toString('utf8'),box=validate(svg,id);
  const raw=await sharp(source).resize(1024,1024).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  if(b.edge)throw Error(id+': master touches its canvas edge');
  const side=Math.max(b.width/1024*box[2],b.height/1024*box[3])/occupancy;
  const cx=box[0]+(b.left+b.width/2)/1024*box[2],cy=box[1]+(b.top+b.height/2)/1024*box[3];
  const fitted=svg.replace(/(<svg\b[^>]*\bviewBox\s*=\s*)["'][^"']+["']/,'$1"'+[cx-side/2,cy-side/2,side,side].map(value=>value.toFixed(6)).join(' ')+'"');
  const highres=await sharp(Buffer.from(fitted)).resize(1024,1024).png().toBuffer();
  const png=await sharp(highres).resize(512,512).png().toBuffer(),webp=await sharp(png).webp({lossless:true,effort:6}).toBuffer();
  const art={source,png,webp,highres};
  art.inspection=await inspectArtwork(art,id,occupancy);
  return art;
}
// Verify both the exact uniformly resized inner pixels and the transparent
// padding. WebP uses the selected PNG as its canonical lossless pixel source.
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
for(const dir of ['assets/round14/original','assets/round14/proposal','assets/round14/highres','sources/round14','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round14/${id}-${group}.svg`,png:`assets/round14/${group}/${id}.png`,image:`assets/round14/${group}/${id}.webp`,highres:`assets/round14/highres/${id}-${group}.png`};
  for(const [key,bytes]of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]])await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}

const rows=[],resizeProofs={},artworkAdjustmentProofs={},exportInspections={};
for(const [index,item]of items.entries()){
  const old=previous.samples.find(row=>row.id===item.id),variant=item.level===8?'proposal':'original',occupancy=expectedOccupancies[index];
  if(!old||item.level!==index+1||old.name!==item.name||feedback.orderedNames[index]!==item.name||feedback.selectedVariants[item.id]!==variant)throw Error(item.id+': identity, order or selected base artwork differs');
  const live=gameContent.items.find(row=>row.id===item.id);
  if(live?.name!==item.name||live.level!==item.level)throw Error(item.id+': actual game identity changed');
  const v4Source=await readFile(path.join(root,item.original.source));
  if(hash(v4Source)!==item.original.sourceSha256)throw Error(item.id+': V4 source master changed');
  const original=await selectedArtwork(old,variant),candidate=candidates.get(item.id),adjustment=feedback.presentationAdjustments[item.id];
  if(variant==='original'&&!original.source.equals(v4Source))throw Error(item.id+': the selected original master differs from V4');
  if(item.level===5)await verifyPeach(original);
  let proposal=original,proof=null;
  if(candidate){
    if(candidate.name!==item.name||candidate.expectedOccupancy!==occupancy)throw Error(item.id+': artwork adjustment identity or size differs');
    proof=item.level===1?verifyArrangement(original.source,candidate):verifyColour(original.source,candidate);
    artworkAdjustmentProofs[item.id]=proof;
    proposal=await render(Buffer.from(candidate.svg),old.code,occupancy);
  }else if(adjustment){
    if(Math.abs(adjustment.expectedOccupancy-original.occupancy*adjustment.scale)>1e-8||adjustment.expectedOccupancy!==occupancy)throw Error(item.id+': declared resize occupancy differs');
    proposal=await resizedArtwork(original,old,adjustment.scale,occupancy);
    resizeProofs[item.id]=proposal.resizeProof;
  }
  const before=await save('original',item.id,original),after=await save('proposal',item.id,proposal);
  if(!candidate&&before.sha256.source!==after.sha256.source)throw Error(old.code+': the selected source master changed');
  if(candidate&&(before.sha256.source===after.sha256.source||before.sha256.image===after.sha256.image))throw Error(old.code+': the requested artwork adjustment did not change');
  if(!candidate&&!adjustment&&Object.keys(before.sha256).some(key=>before.sha256[key]!==after.sha256[key]))throw Error(old.code+': fixed selected export changed');
  const isBlueberry=item.level===1,isMulberry=item.level===8,isPeach=item.level===5;
  const status=candidate?'ART_PENDING':adjustment?'SIZE_PENDING':'ACCEPTED';
  const sourceLabel=isBlueberry?'原版三颗蓝莓已选；仅平移聚拢，原果形、配色、描边与个体缩放保持':isMulberry?'第13轮新版桑葚造型已选；只调整果皮配色，形状、位置、颗粒与描边宽度保持':adjustment?'原版已选；母稿保持，各档导出居中缩小'+percent(adjustment.scale)+'%':'原版已选；SVG、PNG512、WebP512与PNG1024精确保持';
  rows.push({index:index+1,code:old.code,id:item.id,name:item.name,oldName:item.name,nameChanged:false,chain:item.chain,group:'风味鲜果',level:item.level,status,statusLabel:isBlueberry?'原版已选 · 聚拢效果待确认':isMulberry?'新版造型已选 · 新配色待确认':adjustment?'原版已选 · 尺寸待确认':'原版用图与尺寸保持',selection:'selected',artworkStatus:'BASE_ARTWORK_SELECTED',artworkSelection:variant,baseArtworkSelected:true,selectedFromReviewId:feedback.sourceReviewId,sourceOrigin:variant==='original'?'V4':'ROUND13_SELECTED_ARTWORK',sourceReviewId:variant==='original'?'V4':feedback.sourceReviewId,sourceTargetId:item.id,sourceSelection:{reviewId:feedback.sourceReviewId,variant,sha256:old[variant].sha256},changeType:isBlueberry?'arrangement':isMulberry?'recolour':adjustment?'resize':'unchanged',presentationScale:adjustment?.scale??1,relativePresentationScale:adjustment?.scale??1,priorExpectedOccupancy:original.occupancy,expectedOccupancy:occupancy,comparisonArchiveReviewId:feedback.sourceReviewId,confirmedPresentationReviewId:status==='ACCEPTED'?feedback.sourceReviewId:null,sourceLabel,reason:candidate?.reason??(adjustment?'保留原版'+item.name+'的造型、配色与细描边，只以选定的原图作等比缩小并补足透明边距，前五级视觉体量保持协调。':'保留所选原版全部源文件与各档导出，不重绘或重新归一尺寸。'),design:candidate?.design??null,...(candidate?{authoringSource:'artwork/plan4-food/round14/fruit-adjustments.mjs',artworkAdjustment:feedback.artworkAdjustments[item.id],artworkAdjustmentProof:proof}:{}),...(adjustment?{resizeProof:proposal.resizeProof}:{}),...(isPeach?{baselineAcceptedReviewId:feedback.baselinePeachReviewId,baselineSelection:'original',baselineArtworkStatus:'USER_SELECTED_ORIGINAL',baselineSelectionPreserved:true}:{}),original:before,proposal:after});
  exportInspections[old.code]=proposal.inspection;
}
const counts={total:8,candidates:0,accepted:2,pendingArtworkAdjustments:2,pendingPresentation:4,artworkChoicesConfirmed:8};
if(rows.filter(row=>row.status==='ART_PENDING').length!==2||rows.filter(row=>row.status==='SIZE_PENDING').length!==4||rows.filter(row=>row.status==='ACCEPTED').length!==2)throw Error('Artwork choice and pending adjustment counts differ');
if(new Set(rows.map(row=>row.id)).size!==8||new Set(rows.map(row=>row.proposal.sha256.source)).size!==8||new Set(rows.map(row=>row.proposal.sha256.image)).size!==8)throw Error('Every fruit must retain its unique identity and artwork');
const reviewId=hash(JSON.stringify(rows.map(row=>[row.id,row.artworkSelection,row.status,row.proposal.sha256.source,row.proposal.sha256.image,row.expectedOccupancy]))).slice(0,12);
async function contact(contactRows,size,mode){
  const compare=mode==='proposals',cols=compare?3:4,cw=compare?320:156,ch=compare?176:158;
  const width=cols*cw,height=56+Math.ceil(contactRows.length/cols)*ch;
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${compare?'风味鲜果 / 两项艺术调整与四项尺寸':'风味鲜果整链 / 基础用图全部已选'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'每组左：选定基础稿　右：本轮调整；蓝莓原版聚拢，桑葚已选新版换色':'EX01–EX07选用原版 · 仅EX08选用新版造型 · 前五级控制体量'}</text>`];
  for(const [index,row]of contactRows.entries()){
    const x=index%cols*cw,y=56+Math.floor(index/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare){
        const label=row.changeType==='arrangement'?(j?'原版聚拢后':'原版三果原排列'):row.changeType==='recolour'?(j?'已选新版新配色':'已选新版原配色'):(j?'原版缩小'+percent(row.presentationScale)+'%':'所选原版原尺寸');
        texts.push(`<text x="${cx}" y="${y+116}" text-anchor="middle" font-size="10" fill="${j?'#4b714a':'#7a6b56'}">${xml(label)}</text>`);
      }
    }
    texts.push(`<text x="${x+cw/2}" y="${y+137}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    if(!compare)texts.push(`<text x="${x+cw/2}" y="${y+153}" text-anchor="middle" font-size="9" fill="#84745f">${xml(row.changeType==='arrangement'?'原版聚拢待确认':row.changeType==='recolour'?'新版配色待确认':row.changeType==='resize'?'原版缩小'+percent(row.presentationScale)+'%':'原版已选 · 完整保持')}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round14-${mode}-${size}.png`;
  await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));
  return {size,path:filename};
}
const contacts={proposals:[],chains:[]};
for(const size of [40,96]){
  contacts.proposals.push(await contact(rows.filter(row=>row.status!=='ACCEPTED'),size,'proposals'));
  contacts.chains.push(await contact(rows,size,'chain'));
}
const checks={originalSourcesUnchanged:8,selectedBaseCopiesByteIdentical:8,selectedSourceMastersByteIdentical:6,unchangedSelectedSourcesAndExportsByteIdentical:2,previousConfirmedSourcesAndExportsByteIdentical:preservedPrevious,previousConfirmedSizesPreserved:true,previousFinalizedChainCounts:{poultry:8,spice:10,seasonal:8},acceptedPeachBeforeSourceAndExportsByteIdentical:1,originalPeachSelectionPreserved:true,blueberryOriginalThreeBerriesPreserved:true,blueberryGeometryPaletteAndIndividualScalesPreserved:true,mulberrySelectedNewShapePreserved:true,mulberryPaletteOnlyChangeVerified:true,selectedNewArtworkOnly:['EX08'],artworkChoicesConfirmed:8,newArtworkCandidates:0,artworkAdjustments:2,resizedSelectedArtworks:4,uniformResizeAndTransparentPaddingVerified:true,unchangedIngredientIdentities:8,newRecipeOrNameChanges:0,transparentPadding:true,actualGameContentUnchanged:true,actualContentSha256:hash(contentBytes),uniqueIdentities:8,uniqueSources:8,uniqueRenderedImages:8,perItemOccupancy:Object.fromEntries(rows.map(row=>[row.code,row.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 风味鲜果用图选定与局部调整',round:14,reviewId,status:'EXOTIC_BASE_SELECTIONS_CONFIRMED_ADJUSTMENTS_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,orderedNames:feedback.orderedNames,counts,selectedVariants:feedback.selectedVariants,artworkAdjustmentIds:feedback.artworkAdjustmentIds,artworkAdjustments:feedback.artworkAdjustments,presentationAdjustments:feedback.presentationAdjustments,targetOccupancies:feedback.targetOccupancies,previousFinalReviews:feedback.previousFinalReviews,checks,artworkAdjustmentProofs,resizeProofs,exportInspections,contacts,samples:rows};
await writeFile(path.join(site,'round14.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND14_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks,url:'http://127.0.0.1:5284/'},null,2));

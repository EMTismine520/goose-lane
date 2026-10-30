import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round10-feedback.json'),'utf8'));
if(feedback.sourceReviewId!=='9c51568df014')throw Error('Round 10 must use the user-selected round 9 artworks');
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
const previous=JSON.parse(await readFile(path.join(archive,'round9.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==18)throw Error('The round 9 source archive is incomplete');
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const contentBytes=await readFile(path.join(root,'src/content/expansion-data.json'));
const gameContent=JSON.parse(contentBytes.toString('utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const percent=scale=>Math.round((1-scale)*1000)/10;
if(hash(contentBytes)!==feedback.actualContentSha256)throw Error('Actual game content changed during artwork review');
const expectedAdjustments={'fresh-poultry-2':.85,'fresh-spice-1':.875,'fresh-spice-2':.9,'fresh-spice-3':.85,'fresh-spice-4':.875,'fresh-spice-5':.85};
const adoptedNewSpiceIds=['fresh-spice-8','fresh-spice-10'];
const expectedVariant=row=>row.id==='fresh-poultry-2'||(row.chain==='fresh-spice'&&!adoptedNewSpiceIds.includes(row.id))?'original':'proposal';
for(const row of previous.samples)if(feedback.selectedVariants?.[row.id]!==expectedVariant(row))throw Error(row.code+': selected artwork differs from the user choice');
if(Object.keys(feedback.selectedVariants??{}).length!==18)throw Error('All 18 artwork choices must be explicit');
for(const [id,scale]of Object.entries(expectedAdjustments))if(feedback.presentationAdjustments?.[id]?.scale!==scale)throw Error(id+': unexpected presentation factor');
if(Object.keys(feedback.presentationAdjustments??{}).length!==6)throw Error('Only the original gizzard and the first five spice levels may be resized');

async function archivedFile(relative){
  const target=path.resolve(archive,relative),r=path.relative(archive,target);
  if(r==='..'||r.startsWith('..'+path.sep)||path.isAbsolute(r))throw Error('Source asset leaves the selected archive');
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
  const ids=[...svg.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)throw Error(id+': repeated SVG definition');
  for(const m of svg.matchAll(/url\(["']?#([^)'"\s]+)["']?\)/g))if(!ids.includes(m[1]))throw Error(id+': missing SVG definition '+m[1]);
  const box=svg.match(/\bviewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
  if(!box||box.length!==4||box.some(v=>!Number.isFinite(v))||box[2]<=0||box[3]<=0)throw Error(id+': invalid viewBox');
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
// The inner pixels must equal a uniform resize of the selected artwork, and the
// added canvas border must be transparent. This checks exports rather than CSS.
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
for(const dir of ['assets/round10/original','assets/round10/proposal','assets/round10/highres','sources/round10','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round10/${id}-${group}.svg`,png:`assets/round10/${group}/${id}.png`,image:`assets/round10/${group}/${id}.webp`,highres:`assets/round10/highres/${id}-${group}.png`};
  for(const [key,bytes]of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]])await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
for(const item of baseline.items.filter(i=>['fresh-poultry','fresh-spice'].includes(i.chain))){
  if(hash(await readFile(path.join(root,item.original.source)))!==item.original.sourceSha256)throw Error(item.id+': legacy source changed');
  const live=gameContent.items.find(r=>r.id===item.id);
  if(live?.name!==item.name||live.level!==item.level)throw Error(item.id+': actual game identity changed');
}
for(const recipe of feedback.recipeProposals??[])if(gameContent.recipes.find(r=>r.id===recipe.id)?.name!==recipe.before)throw Error(recipe.id+': proposed recipe changed in actual game');

const rows=[],resizeProofs={};
for(const old of previous.samples){
  const variant=feedback.selectedVariants[old.id],original=await selectedArtwork(old,variant),adjustment=feedback.presentationAdjustments[old.id];
  const scale=adjustment?.scale??1,expectedOccupancy=original.occupancy*scale;
  if(adjustment&&Math.abs(adjustment.expectedOccupancy-expectedOccupancy)>1e-8)throw Error(old.code+': declared occupancy differs from its selected source scale');
  const proposal=adjustment?await resizedArtwork(original,old,variant,scale,expectedOccupancy):original;
  const before=await save('original',old.id,original),after=await save('proposal',old.id,proposal);
  if(before.sha256.source!==after.sha256.source)throw Error(old.code+': selected SVG master changed');
  if(adjustment){
    if(before.sha256.png===after.sha256.png)throw Error(old.code+': resized pixels did not change');
    resizeProofs[old.id]=proposal.resizeProof;
  }else if(Object.keys(before.sha256).some(key=>before.sha256[key]!==after.sha256[key]))throw Error(old.code+': fixed selected export changed');
  const isV4=variant==='original',choiceLabel=isV4?'原版已选':old.chain==='fresh-spice'?'新版已选':'既定用图';
  const {resizeProof:oldResizeProof,previousResizeProof:oldPreviousProof,authoringSource:oldAuthoringSource,...prior}=old;
  const priorSourceId=baseline.plannedPoultryChain?.slots.find(row=>row.id===old.id)?.sourceId;
  const sourceInfo=isV4?{sourceOrigin:'V4',sourceReviewId:'V4',sourceTargetId:old.id}:{sourceOrigin:'SELECTED_REVIEW',sourceReviewId:old.sourceReviewId,sourceTargetId:old.sourceTargetId??priorSourceId??old.id,...(oldAuthoringSource?{authoringSource:oldAuthoringSource}:{})};
  const priorPresentationProof=variant==='proposal'?(oldResizeProof??oldPreviousProof):null;
  rows.push({...prior,...sourceInfo,index:rows.length+1,name:old.name,oldName:old.name,nameChanged:false,status:adjustment?'SIZE_PENDING':'ACCEPTED',statusLabel:choiceLabel+(adjustment?' · 尺寸待确认':' · 显示保持'),artworkStatus:'ARTWORK_SELECTED',selection:'selected',artworkSelection:variant,selectedFromReviewId:feedback.sourceReviewId,sourceSelection:{reviewId:feedback.sourceReviewId,variant,sha256:old[variant].sha256},changeType:adjustment?'resize':'unchanged',presentationScale:scale,relativePresentationScale:scale,priorExpectedOccupancy:original.occupancy,expectedOccupancy,comparisonArchiveReviewId:feedback.sourceReviewId,confirmedPresentationReviewId:adjustment?null:feedback.sourceReviewId,sourceLabel:choiceLabel+'，'+(adjustment?'保留母稿，仅居中缩小'+percent(scale)+'%':'各档图像精确保持'),reason:adjustment?'保留'+old.name+'原版造型、颜色与描边，将各档导出居中缩小'+percent(scale)+'%，使低阶视觉体量更协调。':choiceLabel+'；保留所选SVG、PNG512、WebP512与PNG1024，不重新归一显示占比。',design:isV4?null:old.design,original:before,proposal:after,...(adjustment?{resizeProof:proposal.resizeProof}:{}),...(priorPresentationProof?{previousResizeProof:priorPresentationProof}:{})});
}
const counts={total:18,candidates:0,accepted:12,pendingPresentation:6,artworkChoicesConfirmed:18};
if(rows.length!==18||rows.filter(r=>r.status==='SIZE_PENDING').length!==6||rows.filter(r=>r.status==='ACCEPTED').length!==12)throw Error('Artwork choice and presentation counts differ');
if(new Set(rows.map(r=>r.id)).size!==18||new Set(rows.map(r=>r.proposal.sha256.source)).size!==18||new Set(rows.map(r=>r.proposal.sha256.image)).size!==18)throw Error('Each selected ingredient must keep its unique identity and artwork');
const selectedNewSpices=rows.filter(r=>r.chain==='fresh-spice'&&r.artworkSelection==='proposal').map(r=>r.id).sort();
if(selectedNewSpices.join(',')!==[...adoptedNewSpiceIds].sort().join(','))throw Error('Only SP08 and SP10 may use the new spice artwork');
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.artworkSelection,r.status,r.proposal.sha256.source,r.proposal.sha256.image,r.expectedOccupancy]))).slice(0,12);
async function contact(items,size,mode){
  const compare=mode==='changes',cols=compare?3:mode==='poultry'?4:mode==='spice'?5:6,cw=compare?320:156,ch=compare?176:158;
  const width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const title=compare?'前五级尺寸 / 六项所选原版前后对照':mode==='poultry'?'禽肉选用 / 原版鸡胗收小':mode==='spice'?'香料选用 / 仅SP08与SP10采用新版':'禽肉与香料 / 十八项用图已定';
  const subtitle=compare?'每组左：所选原版原尺寸　右：同一母稿收小；只确认尺寸':'保留清晰细描边 · 前五级控制视觉体量 · 不重画已选稿';
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${title} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${subtitle}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+116}" text-anchor="middle" font-size="10" fill="${j?'#4b714a':'#7a6b56'}">${j?'缩小'+percent(row.presentationScale)+'%':'所选原版原尺寸'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+137}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    if(!compare){const label=row.status==='SIZE_PENDING'?'原版已选 · 缩小'+percent(row.presentationScale)+'%':row.chain==='fresh-spice'?(row.artworkSelection==='proposal'?'新版已选':'原版已选'):'用图与尺寸保持';texts.push(`<text x="${x+cw/2}" y="${y+153}" text-anchor="middle" font-size="9" fill="#84745f">${xml(label)}</text>`);}
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round10-${mode}-${size}.png`;
  await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));
  return {size,path:filename};
}
const contacts={proposals:[],selected:[],poultry:[],spice:[]};
for(const size of [40,96]){
  contacts.proposals.push(await contact(rows.filter(r=>r.status==='SIZE_PENDING'),size,'changes'));
  contacts.selected.push(await contact(rows,size,'selected'));
  contacts.poultry.push(await contact(rows.filter(r=>r.chain==='fresh-poultry'),size,'poultry'));
  contacts.spice.push(await contact(rows.filter(r=>r.chain==='fresh-spice'),size,'spice'));
}
const checks={legacyOriginalSourcesUnchanged:18,selectedSourceMastersByteIdentical:18,unchangedSelectedExportsByteIdentical:12,resizedSelectedArtworks:6,uniformResizeAndTransparentPaddingVerified:true,acceptedPoultrySizesPreserved:7,originalGizzardSelected:true,newSpiceArtworkSelectedOnly:['SP08','SP10'],artworkChoicesConfirmed:18,newArtworkCandidates:0,transparentPadding:true,actualGameContentUnchanged:true,actualContentSha256:hash(contentBytes),uniqueIdentities:18,uniqueSources:18,uniqueRenderedImages:18,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const poultryNames=rows.filter(r=>r.chain==='fresh-poultry').map(r=>r.name);
const manifest={title:'鹅巷食光 · 用图选定与前五级尺寸',round:10,reviewId,status:'SIZE_ADJUSTMENTS_PENDING_SELECTIONS_CONFIRMED',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,counts,orderedPoultryNames:poultryNames,orderedNames:poultryNames,selectedVariants:feedback.selectedVariants,presentationAdjustments:feedback.presentationAdjustments,resizeProofs,idRelocations:feedback.idRelocations??previous.idRelocations,recipeProposals:feedback.recipeProposals??previous.recipeProposals,recipeSummary:feedback.recipeSummary??previous.recipeSummary,checks,contacts,samples:rows};
await writeFile(path.join(site,'round10.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round10.html'),'utf8');
if(!template.includes('/*__ROUND10_DATA__*/'))throw Error('Round 10 template has no data marker');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND10_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks,url:'http://127.0.0.1:5284/'},null,2));

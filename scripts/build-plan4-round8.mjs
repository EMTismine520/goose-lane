import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { p02Candidates } from '../artwork/plan4-food/round8/chicken-cartilage.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round8-feedback.json'),'utf8'));
if(feedback.sourceReviewId!=='9ec60b04fc94')throw Error('Round 8 must use the accepted round 7 selection');
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
const previous=JSON.parse(await readFile(path.join(archive,'round7.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==8)throw Error('The selected round 7 archive is incomplete');
const orderedNames=['鸡蛋','鸡软骨','鸭掌','鸽肉串','鸡胸肉','鹅肝','火鸡腿','卤鹅肉'];
if(feedback.orderedNames?.join(',')!==orderedNames.join(','))throw Error('Only the P02 ingredient may change in the selected order');
if(p02Candidates.length!==1||p02Candidates[0].id!=='fresh-poultry-2'||p02Candidates[0].name!=='鸡软骨')throw Error('The new P02 proposal must be chicken cartilage');
const expectedScales={'fresh-poultry-3':.92,'fresh-poultry-4':.94,'fresh-poultry-5':.86};
for(const [id,scale]of Object.entries(expectedScales))if(feedback.presentationAdjustments?.[id]?.scale!==scale)throw Error(id+': unexpected resize factor');
if(Object.keys(feedback.presentationAdjustments??{}).some(id=>!(id in expectedScales)))throw Error('Only P03/P04/P05 may receive further display resizing');
const replacementOccupancy=feedback.replacement?.expectedOccupancy??feedback.replacement?.targetOccupancy??.66;
if(replacementOccupancy!==.66)throw Error('P02 must use the restrained 0.66 presentation occupancy');
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const gameContent=JSON.parse(await readFile(path.join(root,'src/content/expansion-data.json'),'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const percent=scale=>Math.round((1-scale)*100);
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
  return box;
}
async function checkExport(bytes,size,id,expectedOccupancy){
  const meta=await sharp(bytes).metadata();
  if(meta.width!==size||meta.height!==size||!meta.hasAlpha)throw Error(id+': export dimensions or transparency differ');
  const raw=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  const occupancy=Math.max(b.width,b.height)/size;
  if(b.edge||Math.abs(occupancy-expectedOccupancy)>.006)throw Error(id+': image occupancy differs from its intended presentation scale: '+occupancy+' vs '+expectedOccupancy);
  return {occupancy,bounds:b};
}
async function selectedArtwork(row){
  const files=row.proposal;
  const [source,png,webp,highres]=await Promise.all([files.source,files.png,files.image,files.highres].map(archivedFile));
  for(const [key,bytes]of [['source',source],['png',png],['image',webp],['highres',highres]])if(hash(bytes)!==files.sha256[key])throw Error(row.code+': selected '+key+' changed');
  validate(source.toString('utf8'),row.code);
  const occupancy=row.expectedOccupancy??.8;
  await checkExport(png,512,row.code,occupancy);await checkExport(webp,512,row.code,occupancy);await checkExport(highres,1024,row.code,occupancy);
  return {source,png,webp,highres};
}
async function render(source,id,targetOccupancy){
  const svg=source.toString('utf8'),box=validate(svg,id);
  const raw=await sharp(source).resize(1024,1024).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  if(b.edge)throw Error(id+': source touches its edge');
  const side=Math.max(b.width/1024*box[2],b.height/1024*box[3])/targetOccupancy,cx=box[0]+(b.left+b.width/2)/1024*box[2],cy=box[1]+(b.top+b.height/2)/1024*box[3];
  const fitted=svg.replace(/(<svg\b[^>]*\bviewBox\s*=\s*)["'][^"']+["']/,'$1"'+[cx-side/2,cy-side/2,side,side].map(v=>v.toFixed(6)).join(' ')+'"');
  const highres=await sharp(Buffer.from(fitted)).resize(1024,1024).png().toBuffer(),png=await sharp(highres).resize(512,512).png().toBuffer(),webp=await sharp(png).webp({lossless:true,effort:6}).toBuffer();
  await Promise.all([checkExport(highres,1024,id,targetOccupancy),checkExport(png,512,id,targetOccupancy),checkExport(webp,512,id,targetOccupancy)]);
  return {source,png,webp,highres};
}
// Verify actual pixels: each export is the same selected image uniformly resized,
// centered in the original canvas, with an entirely transparent added border.
async function verifyCenteredScale(before,after,size,inner,offset,id){
  const expected=await sharp(before).resize(inner,inner,{kernel:'lanczos3'}).ensureAlpha().raw().toBuffer();
  const actual=await sharp(after).ensureAlpha().raw().toBuffer();
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const a=(y*size+x)*4;
    if(x<offset||y<offset||x>=offset+inner||y>=offset+inner){if(actual[a+3]!==0)throw Error(id+': scaled border is not transparent');continue;}
    const b=((y-offset)*inner+x-offset)*4;
    if(actual[a+3]!==expected[b+3]||(expected[b+3]&&[0,1,2].some(c=>actual[a+c]!==expected[b+c])))throw Error(id+': scaling altered the selected artwork beyond the declared resize');
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
async function resizedArtwork(original,row,scale,expectedOccupancy){
  const [png,webp,highres]=await Promise.all([shrink(original.png,512,'png',row.code+' PNG',scale,expectedOccupancy),shrink(original.png,512,'webp',row.code+' WebP',scale,expectedOccupancy),shrink(original.highres,1024,'png',row.code+' 1024px',scale,expectedOccupancy)]);
  return {source:original.source,png:png.bytes,webp:webp.bytes,highres:highres.bytes,resizeProof:{scale,relativeToReviewId:feedback.sourceReviewId,sourceMasterUnchanged:true,verifiedUniformResizeAndTransparentPadding:true,priorExpectedOccupancy:row.expectedOccupancy??.8,expectedOccupancy,exports:[png,webp,highres].map(({bytes,...record})=>record)}};
}
for(const dir of ['assets/round8/original','assets/round8/proposal','assets/round8/highres','sources/round8','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round8/${id}-${group}.svg`,png:`assets/round8/${group}/${id}.png`,image:`assets/round8/${group}/${id}.webp`,highres:`assets/round8/highres/${id}-${group}.png`};
  for(const [key,bytes]of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]])await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
for(const item of baseline.items.filter(i=>i.chain==='fresh-poultry')){
  if(hash(await readFile(path.join(root,item.original.source)))!==item.original.sourceSha256)throw Error(item.id+': legacy master changed');
  const live=gameContent.items.find(r=>r.id===item.id);
  if(live?.name!==item.name||live.level!==item.level)throw Error(item.id+': actual game identities must remain unchanged during review');
}
for(const recipe of feedback.recipeProposals??[])if(gameContent.recipes.find(r=>r.id===recipe.id)?.name!==recipe.before)throw Error(recipe.id+': proposed recipe already changed in actual game');
const rows=[],resizeProofs={};
for(const [index,old]of previous.samples.entries()){
  if(old.level!==index+1||old.code!=='P'+String(index+1).padStart(2,'0')||old.id!=='fresh-poultry-'+(index+1))throw Error('The archived target order is inconsistent');
  const original=await selectedArtwork(old),adjustment=feedback.presentationAdjustments?.[old.id],isReplacement=index===1,pending=isReplacement||!!adjustment;
  const priorExpectedOccupancy=old.expectedOccupancy??.8,scale=adjustment?.scale??1,expectedOccupancy=isReplacement?replacementOccupancy:priorExpectedOccupancy*scale;
  if(adjustment?.expectedOccupancy!==undefined&&Math.abs(adjustment.expectedOccupancy-expectedOccupancy)>1e-8)throw Error(old.code+': declared occupancy does not match its scale');
  const proposal=isReplacement?await render(Buffer.from(p02Candidates[0].svg),old.code,expectedOccupancy):adjustment?await resizedArtwork(original,old,scale,expectedOccupancy):original;
  if(adjustment){if(!proposal.source.equals(original.source)||proposal.png.equals(original.png))throw Error(old.code+': selected master must stay unchanged while actual pixels shrink');resizeProofs[old.id]=proposal.resizeProof;}
  if(isReplacement&&(proposal.source.equals(original.source)||proposal.webp.equals(original.webp)))throw Error('P02 must receive a new ingredient artwork');
  const before=await save('original',old.id,original),after=await save('proposal',old.id,proposal);
  if(!pending&&Object.keys(before.sha256).some(key=>before.sha256[key]!==after.sha256[key]))throw Error(old.code+': fixed artwork must remain byte-identical');
  const changeType=isReplacement?'ingredient-replacement':adjustment?'resize':'unchanged';
  const sourceLabel=isReplacement?'P02以鸡软骨替换鸡胗，新食材小体量方案':adjustment?`保留${old.name}母稿，各档导出居中缩小${percent(scale)}%`:index===0?'上轮已通过鸡蛋尺寸，母稿和各档导出精确保持':old.sourceLabel;
  const {resizeProof:priorResizeProof,...previousRow}=old;
  rows.push({...previousRow,name:orderedNames[index],oldName:old.name,status:pending?'CANDIDATE':'ACCEPTED',statusLabel:adjustment?'尺寸调整 · 待确认':isReplacement?'新食材方案 · 待选用':'既定用图保持',selection:pending?'candidate':'selected',changeType,presentationScale:scale,priorExpectedOccupancy,expectedOccupancy,comparisonArchiveReviewId:feedback.sourceReviewId,sourceLabel,reason:isReplacement?p02Candidates[0].reason:adjustment?`保留${old.name}的造型、颜色和描边，各档图像内容统一居中缩小${percent(scale)}%，按视觉分量校准低阶食材大小。`:sourceLabel,design:isReplacement?p02Candidates[0].design:adjustment?null:old.design,original:before,proposal:after,...(adjustment?{resizeProof:proposal.resizeProof}:{}),...(priorResizeProof?{previousResizeProof:priorResizeProof}:{})});
}
if(new Set(rows.map(r=>r.id)).size!==8||new Set(rows.map(r=>r.proposal.sha256.source)).size!==8||new Set(rows.map(r=>r.proposal.sha256.image)).size!==8)throw Error('All eight target identities and artworks must remain unique');
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.name,r.status,r.proposal.sha256.source,r.proposal.sha256.image,r.presentationScale,r.expectedOccupancy]))).slice(0,12);
Object.assign(rows[0],{confirmedPresentationReviewId:feedback.sourceReviewId});
Object.assign(rows[1],{sourceReviewId:reviewId,sourceTargetId:'fresh-poultry-2',authoringSource:'artwork/plan4-food/round8/chicken-cartilage.mjs'});
Object.assign(rows[2],{sourceReviewId:feedback.sourceReviewId,sourceTargetId:'fresh-poultry-3',authoringSource:'artwork/plan4-food/round7/duck-feet.mjs',confirmedArtworkReviewId:feedback.sourceReviewId});
const beforeLabel=row=>row.changeType==='resize'?'上轮尺寸':row.oldName;
const afterLabel=row=>row.changeType==='resize'?`缩小${percent(row.presentationScale)}%`:row.name+'新方案';
async function contact(items,size,mode){
  const compare=mode==='changes',cols=compare?2:4,cw=compare?320:156,ch=compare?176:158,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${compare?'鸡软骨新稿与低阶尺寸 / 前后对照':'禽肉整链 / 低阶视觉分量校准'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'每组左：上一轮　右：本轮；鸡蛋及6—8级用图保持':xml(orderedNames.join('、'))}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+116}" text-anchor="middle" font-size="10" fill="${j?'#4b714a':'#7a6b56'}">${xml(j?afterLabel(row):beforeLabel(row))}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+137}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    if(!compare)texts.push(`<text x="${x+cw/2}" y="${y+153}" text-anchor="middle" font-size="9" fill="#84745f">${row.status==='ACCEPTED'?'既定用图保持':row.changeType==='resize'?`仅尺寸缩小${percent(row.presentationScale)}%`:'新食材待选用'}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round8-${mode}-${size}.png`;
  await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));
  return {size,path:filename};
}
const contacts={proposals:[],chains:[]};for(const size of [40,96]){contacts.proposals.push(await contact(rows.filter(r=>r.status==='CANDIDATE'),size,'changes'));contacts.chains.push(await contact(rows,size,'chain'));}
const counts={total:8,candidates:4,proposedKeep:0,accepted:4};
const checks={legacyOriginalSourcesUnchanged:8,selectedSourceMastersByteIdentical:7,unchangedSelectedExportsByteIdentical:4,acceptedEggMasterAndExportsUnchanged:true,newIngredientArtwork:1,resizedSelectedArtworks:3,uniformResizeAndTransparentPaddingVerified:true,legIngredientCount:1,actualGameContentUnchanged:true,transparentPadding:true,uniqueIdentities:8,uniqueSources:8,uniqueRenderedImages:8,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 鸡软骨新稿与低阶尺寸',round:8,reviewId,status:'P02_REPLACEMENT_AND_LOW_LEVEL_SIZE_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:'P02以鸡软骨替换鸡胗提出新稿，鸭掌、鸽肉串、鸡胸肉仅缩小显示尺寸；已通过的鸡蛋与6—8级用图保持。目标顺序与投料映射尚未接入正式游戏。',orderedNames,counts,eggPresentation:previous.eggPresentation,resizeProofs,presentationAdjustments:feedback.presentationAdjustments,sizePolicy:feedback.sizePolicy??'5级及更低级食材按视觉分量控制大小，厚实主体更收敛；不以同一最长边机械放大低阶食材。',idRelocations:feedback.idRelocations??previous.idRelocations,recipeProposals:feedback.recipeProposals??previous.recipeProposals,recipeSummary:feedback.recipeSummary??previous.recipeSummary,checks,contacts,samples:rows};
await writeFile(path.join(site,'round8.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round8.html'),'utf8');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND8_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
console.log(JSON.stringify({reviewId,status:manifest.status,counts,orderedNames,checks,url:'http://127.0.0.1:5284/'},null,2));

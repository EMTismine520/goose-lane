import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { gizzardCandidates } from '../artwork/plan4-food/round9/gizzard.mjs';
import { spiceFrontCandidates } from '../artwork/plan4-food/round9/spice-front.mjs';
import { spiceTailCandidates } from '../artwork/plan4-food/round9/spice-tail.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round9-feedback.json'),'utf8'));
if(feedback.sourceReviewId!=='8dec5a3b7204')throw Error('Round 9 must preserve the accepted round 8 sizes');
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
const previous=JSON.parse(await readFile(path.join(archive,'round8.json'),'utf8'));
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const contentBytes=await readFile(path.join(root,'src/content/expansion-data.json'));
const gameContent=JSON.parse(contentBytes.toString('utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
if(hash(contentBytes)!==feedback.actualContentSha256)throw Error('Actual game content changed during artwork review');
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==8)throw Error('Round 8 archive is incomplete');
const poultryNames=['鸡蛋','鸡胗','鸭掌','鸽肉串','鸡胸肉','鹅肝','火鸡腿','卤鹅肉'];
if(feedback.orderedPoultryNames.join(',')!==poultryNames.join(','))throw Error('Only the P02 name is restored');
const spices=baseline.items.filter(r=>r.chain==='fresh-spice');
const candidates=new Map([...gizzardCandidates,...spiceFrontCandidates,...spiceTailCandidates].map(r=>[r.id,r]));
if(candidates.size!==11||!candidates.has('fresh-poultry-2')||spices.some(r=>!candidates.has(r.id)))throw Error('P02 and every spice require new artwork');

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
  if(/<(?:image|script|foreignObject)\b|(?:href|src)\s*=|data:/i.test(svg))throw Error(id+': source must be self-contained editable SVG');
  const ids=[...svg.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)throw Error(id+': repeated SVG definition');
  for(const m of svg.matchAll(/url\(["']?#([^)'"\s]+)["']?\)/g))if(!ids.includes(m[1]))throw Error(id+': missing definition '+m[1]);
  const box=svg.match(/\bviewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
  if(!box||box.length!==4||box.some(v=>!Number.isFinite(v))||box[2]<=0||box[3]<=0)throw Error(id+': invalid viewBox');
  return box;
}
async function inspect(bytes,size,id,expected){
  const meta=await sharp(bytes).metadata();
  if(meta.width!==size||meta.height!==size||!meta.hasAlpha)throw Error(id+': export dimensions or transparency differ');
  const raw=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  const occupancy=Math.max(b.width,b.height)/size;
  if(b.edge||Math.abs(occupancy-expected)>.006)throw Error(id+': incorrect image occupancy '+occupancy+' / '+expected);
  return {occupancy,bounds:b};
}
async function selectedArtwork(row,group='proposal'){
  const files=row[group],keys=['source','png','image','highres'];
  const bytes=await Promise.all(keys.map(key=>archivedFile(files[key])));
  for(const [i,key]of keys.entries())if(hash(bytes[i])!==files.sha256[key])throw Error(row.code+': archived '+key+' differs');
  const [source,png,webp,highres]=bytes;
  validate(source.toString('utf8'),row.code);
  const occupancy=group==='original'?(row.priorExpectedOccupancy??.8):row.expectedOccupancy;
  await inspect(png,512,row.code,occupancy);await inspect(webp,512,row.code,occupancy);await inspect(highres,1024,row.code,occupancy);
  return {source,png,webp,highres,occupancy};
}
async function render(source,id,occupancy=.8){
  const svg=source.toString('utf8'),box=validate(svg,id);
  const raw=await sharp(source).resize(1024,1024).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  if(b.edge)throw Error(id+': source touches its edge');
  const side=Math.max(b.width/1024*box[2],b.height/1024*box[3])/occupancy;
  const cx=box[0]+(b.left+b.width/2)/1024*box[2],cy=box[1]+(b.top+b.height/2)/1024*box[3];
  const fitted=svg.replace(/(<svg\b[^>]*\bviewBox\s*=\s*)["'][^"']+["']/,'$1"'+[cx-side/2,cy-side/2,side,side].map(v=>v.toFixed(6)).join(' ')+'"');
  const highres=await sharp(Buffer.from(fitted)).resize(1024,1024).png().toBuffer(),png=await sharp(highres).resize(512,512).png().toBuffer(),webp=await sharp(png).webp({lossless:true,effort:6}).toBuffer();
  const inspection={png:await inspect(png,512,id,occupancy),webp:await inspect(webp,512,id,occupancy),highres:await inspect(highres,1024,id,occupancy)};
  return {source,png,webp,highres,occupancy,inspection};
}
for(const dir of ['assets/round9/original','assets/round9/proposal','assets/round9/highres','sources/round9','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round9/${id}-${group}.svg`,png:`assets/round9/${group}/${id}.png`,image:`assets/round9/${group}/${id}.webp`,highres:`assets/round9/highres/${id}-${group}.png`};
  for(const [key,bytes]of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]])await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
const originalItems=baseline.items.filter(i=>['fresh-poultry','fresh-spice'].includes(i.chain));
for(const item of originalItems){
  if(hash(await readFile(path.join(root,item.original.source)))!==item.original.sourceSha256)throw Error(item.id+': original master changed');
  const live=gameContent.items.find(r=>r.id===item.id);
  if(live?.name!==item.name||live.level!==item.level)throw Error(item.id+': actual game identity changed');
}
const rows=[],exportInspections={};
for(const [index,old]of previous.samples.entries()){
  const isNew=index===1,candidate=candidates.get(old.id),original=await selectedArtwork(old,isNew?'original':'proposal');
  if(isNew&&candidate.name!=='鸡胗')throw Error('P02 must remain gizzard');
  const occupancy=isNew?.68:old.expectedOccupancy;
  const proposal=isNew?await render(Buffer.from(candidate.svg),old.id,occupancy):original;
  const before=await save('original',old.id,original),after=await save('proposal',old.id,proposal);
  if(!isNew&&Object.keys(before.sha256).some(key=>before.sha256[key]!==after.sha256[key]))throw Error(old.code+': accepted artwork differs');
  if(isNew&&(after.sha256.source===before.sha256.source||after.sha256.image===before.sha256.image||after.sha256.source===old.proposal.sha256.source))throw Error('P02 needs a new gizzard design');
  const {resizeProof,...prior}=old;
  rows.push({...prior,index:rows.length+1,name:poultryNames[index],oldName:poultryNames[index],group:'禽肉',chain:'fresh-poultry',nameChanged:false,status:isNew?'CANDIDATE':'ACCEPTED',statusLabel:isNew?'鸡胗重设计 · 待选用':'用图与尺寸已通过',selection:isNew?'candidate':'selected',changeType:isNew?'redesign':'unchanged',presentationScale:1,priorExpectedOccupancy:original.occupancy,expectedOccupancy:occupancy,comparisonArchiveReviewId:feedback.sourceReviewId,confirmedPresentationReviewId:isNew?null:feedback.sourceReviewId,reason:isNew?candidate.reason:'保留第8轮已通过的用图和尺寸，各档图像字节保持。',sourceLabel:isNew?'鸡胗全新造型与材质；鸡软骨方案撤回':'第8轮已通过的'+old.name+'，用图与尺寸保持',design:isNew?candidate.design:old.design,original:before,proposal:after,...(resizeProof?{previousResizeProof:resizeProof}:{}),...(isNew?{authoringSource:'artwork/plan4-food/round9/gizzard.mjs'}:{})});
  if(isNew)exportInspections[old.code]=proposal.inspection;
}
for(const item of spices){
  const candidate=candidates.get(item.id);
  if(candidate.name!==item.name)throw Error(item.id+': spice identity must remain unchanged');
  const occupancy=candidate.expectedOccupancy??(item.level<=5?.7:.8);
  if(item.level<=5&&occupancy>.74)throw Error(item.id+': low-level ingredient is oversized');
  const original=await render(await readFile(path.join(root,item.original.source)),item.id+'-original');
  const proposal=await render(Buffer.from(candidate.svg),item.id+'-proposal',occupancy);
  const before=await save('original',item.id,original),after=await save('proposal',item.id,proposal);
  if(before.sha256.source===after.sha256.source||before.sha256.image===after.sha256.image)throw Error(item.id+': every spice needs new artwork');
  const code='SP'+String(item.level).padStart(2,'0');
  rows.push({index:rows.length+1,code,id:item.id,name:item.name,oldName:item.name,nameChanged:false,chain:item.chain,group:'香料',level:item.level,status:'CANDIDATE',statusLabel:'全新设计 · 待选用',selection:'candidate',changeType:'redesign',presentationScale:1,priorExpectedOccupancy:.8,expectedOccupancy:occupancy,sourceLabel:'香料链全新候选，原版保留对照，由你决定采用',reason:candidate.reason,design:candidate.design,authoringSource:'artwork/plan4-food/round9/'+(item.level<=5?'spice-front.mjs':'spice-tail.mjs'),original:before,proposal:after});
  exportInspections[code]=proposal.inspection;
}
const counts={total:18,candidates:11,proposedKeep:0,accepted:7};
if(rows.length!==18||rows.filter(r=>r.status==='CANDIDATE').length!==11||rows.filter(r=>r.status==='ACCEPTED').length!==7)throw Error('Review counts differ');
for(const key of ['id'])if(new Set(rows.map(r=>r[key])).size!==18)throw Error('Repeated identity');
for(const key of ['source','image'])if(new Set(rows.map(r=>r.proposal.sha256[key])).size!==18)throw Error('Repeated artwork');
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.name,r.status,r.proposal.sha256.source,r.proposal.sha256.image,r.expectedOccupancy]))).slice(0,12);
for(const row of rows.filter(r=>r.status==='CANDIDATE')){row.sourceReviewId=reviewId;row.sourceTargetId=row.id;}
async function contact(items,size,mode){
  const compare=mode==='changes',cols=compare?3:(mode==='poultry'?4:mode==='spice'?5:6),cw=compare?320:156,ch=compare?176:158;
  const width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const title=mode==='poultry'?'禽肉整链 / 鸡胗新稿，其余7项已通过':mode==='spice'?'香料整链 / 10项全新候选':compare?'鸡胗与香料 / 11项原版和新版对照':'鸡胗重设计与香料 / 本轮11项新稿';
  const subtitle=compare?'每组左：原版或既定稿　右：新版候选；采用由你决定':'清晰细描边 · 低阶体量克制 · 新稿待你选择';
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${title} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${subtitle}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+116}" text-anchor="middle" font-size="10" fill="${j?'#4b714a':'#7a6b56'}">${j?'新版候选':'原版对照'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+137}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    if(!compare)texts.push(`<text x="${x+cw/2}" y="${y+153}" text-anchor="middle" font-size="9" fill="#84745f">${row.status==='ACCEPTED'?'用图与尺寸已通过':'新版候选待选用'}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round9-${mode}-${size}.png`;
  await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));
  return {size,path:filename};
}
const contacts={proposals:[],candidates:[],poultry:[],spice:[]};
for(const size of [40,96]){
  const pending=rows.filter(r=>r.status==='CANDIDATE');
  contacts.proposals.push(await contact(pending,size,'changes'));contacts.candidates.push(await contact(pending,size,'candidates'));
  contacts.poultry.push(await contact(rows.filter(r=>r.chain==='fresh-poultry'),size,'poultry'));contacts.spice.push(await contact(rows.filter(r=>r.chain==='fresh-spice'),size,'spice'));
}
const checks={legacyOriginalSourcesUnchanged:18,acceptedPoultrySourcesAndExportsByteIdentical:7,acceptedLowLevelSizesPreserved:true,newGizzardDesigns:1,newSpiceDesigns:10,freshAlternatives:11,transparentPadding:true,actualGameContentUnchanged:true,actualContentSha256:hash(contentBytes),uniqueIdentities:18,uniqueSources:18,uniqueRenderedImages:18,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 鸡胗重设计与香料新一轮',round:9,reviewId,status:'GIZZARD_REDESIGN_AND_SPICE_CANDIDATES_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,authoringPolicy:feedback.authoringPolicy,sizePolicy:feedback.sizePolicy,counts,orderedPoultryNames:poultryNames,orderedNames:poultryNames,idRelocations:feedback.idRelocations,recipeProposals:feedback.recipeProposals,recipeSummary:feedback.recipeSummary,withdrawnP02:{reviewId:feedback.sourceReviewId,name:'鸡软骨',status:'NOT_ADOPTED'},checks,exportInspections,contacts,samples:rows};
await writeFile(path.join(site,'round9.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round9.html'),'utf8');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND9_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks,url:'http://127.0.0.1:5284/'},null,2));

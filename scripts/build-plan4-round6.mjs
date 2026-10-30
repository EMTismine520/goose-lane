import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { duckBloodCandidates } from '../artwork/plan4-food/round6/duck-blood.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round6-feedback.json'),'utf8'));
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const gameContent=JSON.parse(await readFile(path.join(root,'src/content/expansion-data.json'),'utf8'));
const orderedNames=['鸡蛋','鸡胗','鸭血','鸽肉串','鸡胸肉','鹅肝','火鸡腿','卤鹅肉'];
const slots=[...feedback.slots].sort((a,b)=>a.level-b.level);
if(slots.length!==8||slots.some((s,i)=>s.level!==i+1||s.code!=='P'+String(i+1).padStart(2,'0')||s.id!=='fresh-poultry-'+(i+1)||s.name!==orderedNames[i])) throw Error('The eight target slots must follow the user-confirmed poultry order');
if(slots.filter(s=>s.status==='ACCEPTED').length!==7||slots.filter(s=>s.status==='CANDIDATE').length!==1||slots[2].status!=='CANDIDATE') throw Error('Only the redesigned duck blood remains pending');
const relocations=feedback.idRelocations??[];
if(relocations.length!==8||new Set(relocations.map(r=>r.fromItemId)).size!==8||new Set(relocations.map(r=>r.toItemId)).size!==8||slots.some(s=>!relocations.some(r=>r.toItemId===s.id&&r.fromItemId===(s.semanticLegacyId??s.sourceId)&&r.selectedName===s.name&&r.toLevel===s.level))) throw Error('Target slots and legacy ingredient relocation must stay distinct and match the selected order');
if(duckBloodCandidates.length!==1||duckBloodCandidates[0].id!=='fresh-poultry-3'||duckBloodCandidates[0].name!=='鸭血') throw Error('The sole new artwork must be duck blood at target P03');
if(orderedNames.filter(name=>name.endsWith('腿')).length!==1) throw Error('The selected order must contain a single leg ingredient');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const checkpoints=new Map();
async function checkpoint(reviewId,manifestName){
  if(!/^[a-f0-9]{12}$/.test(reviewId)||!['round4.json','round5.json'].includes(manifestName)) throw Error('Unexpected selected-art archive');
  const key=reviewId+'/'+manifestName;
  if(!checkpoints.has(key)){
    const directory=path.join(output,'checkpoints',reviewId,'site');
    const manifest=JSON.parse(await readFile(path.join(directory,manifestName),'utf8'));
    if(manifest.reviewId!==reviewId) throw Error('Selected-art archive has the wrong review identity');
    checkpoints.set(key,{directory,manifest});
  }
  return checkpoints.get(key);
}
async function archivedFile(directory,relative){
  const target=path.resolve(directory,relative),r=path.relative(directory,target);
  if(r==='..'||r.startsWith('..'+path.sep)||path.isAbsolute(r)) throw Error('Archive asset leaves its selected review');
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
async function checkExport(bytes,size,id){
  const meta=await sharp(bytes).metadata();
  if(meta.width!==size||meta.height!==size||!meta.hasAlpha)throw Error(id+': selected image dimensions or transparency differ');
  const raw=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  if(b.edge||Math.abs(Math.max(b.width,b.height)/size-.8)>.006)throw Error(id+': selected image clear space differs');
}
async function selectedArtwork(slot){
  const c=await checkpoint(slot.sourceReviewId,slot.sourceManifest),row=c.manifest.samples.find(r=>r.id===slot.sourceId);
  if(!row||!['original','proposal'].includes(slot.sourceVariant))throw Error(slot.code+': selected source is missing');
  const files=row[slot.sourceVariant];
  const [source,png,webp,highres]=await Promise.all([files.source,files.png,files.image,files.highres].map(r=>archivedFile(c.directory,r)));
  for(const [key,bytes]of [['source',source],['png',png],['image',webp],['highres',highres]])if(hash(bytes)!==files.sha256[key])throw Error(slot.code+': selected '+key+' changed');
  validate(source.toString('utf8'),slot.code);
  await checkExport(png,512,slot.code);await checkExport(webp,512,slot.code);await checkExport(highres,1024,slot.code);
  return {source,png,webp,highres,sourceFoodName:slot.sourceVariant==='original'?(row.oldName??row.name):row.name,sourceCode:row.code,design:slot.sourceVariant==='proposal'?row.design:null};
}
async function render(source,id){
  const svg=source.toString('utf8'),box=validate(svg,id);
  const raw=await sharp(source).resize(1024,1024).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  if(b.edge)throw Error(id+': source touches its edge');
  const side=Math.max(b.width/1024*box[2],b.height/1024*box[3])/.8,cx=box[0]+(b.left+b.width/2)/1024*box[2],cy=box[1]+(b.top+b.height/2)/1024*box[3];
  const fitted=svg.replace(/(<svg\b[^>]*\bviewBox\s*=\s*)["'][^"']+["']/,'$1"'+[cx-side/2,cy-side/2,side,side].map(v=>v.toFixed(6)).join(' ')+'"');
  const highres=await sharp(Buffer.from(fitted)).resize(1024,1024).png().toBuffer(),png=await sharp(highres).resize(512,512).png().toBuffer(),webp=await sharp(png).webp({lossless:true,effort:6}).toBuffer();
  await checkExport(highres,1024,id);
  return {source,png,webp,highres};
}
for(const dir of ['assets/round6/original','assets/round6/proposal','assets/round6/highres','sources/round6','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round6/${id}-${group}.svg`,png:`assets/round6/${group}/${id}.png`,image:`assets/round6/${group}/${id}.webp`,highres:`assets/round6/highres/${id}-${group}.png`};
  for(const [key,bytes]of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]])await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
// The preview describes a target-slot reorder. The legacy game IDs and names stay untouched here.
for(const item of baseline.items.filter(i=>i.chain==='fresh-poultry')){
  if(hash(await readFile(path.join(root,item.original.source)))!==item.original.sourceSha256)throw Error(item.id+': legacy master changed');
  const live=gameContent.items.find(r=>r.id===item.id);
  if(live?.name!==item.name||live.level!==item.level)throw Error(item.id+': game identities must stay unchanged until integration');
}
for(const recipe of feedback.recipeProposals??[])if(gameContent.recipes.find(r=>r.id===recipe.id)?.name!==recipe.before)throw Error(recipe.id+': a proposed recipe was changed in the actual game');
const rows=[];
for(const slot of slots){
  const original=await selectedArtwork(slot),candidate=slot.status==='CANDIDATE';
  const design=candidate?duckBloodCandidates[0].design:original.design;
  const proposal=candidate?await render(Buffer.from(duckBloodCandidates[0].svg),slot.code):original;
  if(candidate&&(hash(proposal.source)===hash(original.source)||hash(proposal.webp)===hash(original.webp)))throw Error('Duck blood needs a new source and visible rendering');
  const before=await save('original',slot.id,original),after=await save('proposal',slot.id,proposal);
  if(!candidate&&Object.keys(before.sha256).some(key=>before.sha256[key]!==after.sha256[key]))throw Error(slot.code+': selected artwork must remain byte-identical');
  rows.push({index:slot.level,level:slot.level,code:slot.code,id:slot.id,targetId:slot.id,name:slot.name,chain:'fresh-poultry',group:'禽肉',status:slot.status,statusLabel:candidate?'鸭血新稿 · 待确认':'顺序与用图已确认',selection:candidate?'candidate':'selected',oldName:original.sourceFoodName,semanticLegacyId:slot.semanticLegacyId??slot.sourceId,legacySourceId:slot.sourceId,legacySourceCode:original.sourceCode,sourceReviewId:slot.sourceReviewId,sourceManifest:slot.sourceManifest,sourceVariant:slot.sourceVariant,sourceLabel:slot.sourceLabel,reason:candidate?duckBloodCandidates[0].reason:slot.sourceLabel,design,original:before,proposal:after});
}
if(new Set(rows.map(r=>r.id)).size!==8||new Set(rows.map(r=>r.proposal.sha256.source)).size!==8||new Set(rows.map(r=>r.proposal.sha256.image)).size!==8)throw Error('The reordered chain must retain eight unique food identities and artworks');
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.name,r.status,r.proposal.sha256.source]))).slice(0,12);
async function contact(items,size,mode){
  const compare=mode==='duckblood',cols=compare?1:4,cw=compare?384:156,ch=compare?176:158,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${compare?'P03鸭血 · 前后对照':'禽肉新顺序 · 七项已选，仅鸭血待确认'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：上轮鸭血　右：本轮新稿':'鸡蛋、鸡胗、鸭血、鸽肉串、鸡胸肉、鹅肝、火鸡腿、卤鹅肉'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+116}" text-anchor="middle" font-size="10" fill="${j?'#4b714a':'#7a6b56'}">${j?'本轮新稿':'上轮鸭血'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+137}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    if(!compare)texts.push(`<text x="${x+cw/2}" y="${y+153}" text-anchor="middle" font-size="9" fill="#84745f">${row.status==='ACCEPTED'?'用图已确认':'鸭血新稿待确认'}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round6-${compare?'duckblood':'chain'}-${size}.png`;
  await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));
  return {size,path:filename};
}
const contacts={proposals:[],chains:[]};for(const size of [40,96]){contacts.proposals.push(await contact(rows.filter(r=>r.status==='CANDIDATE'),size,'duckblood'));contacts.chains.push(await contact(rows,size,'chain'));}
const counts={total:8,candidates:1,proposedKeep:0,accepted:7};
const manifest={title:'鹅巷食光 · 禽肉顺序与鸭血精修',round:6,reviewId,status:'ORDER_CONFIRMED_DUCK_BLOOD_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:'禽肉顺序与七项用图已确认，仅P03鸭血为本轮新稿；目标槽位重排与菜谱衔接尚未接入正式游戏。',orderedNames,counts,orderConfirmed:true,idRelocations:feedback.idRelocations??[],recipeProposals:feedback.recipeProposals??[],recipeSummary:feedback.recipeSummary??{},checks:{legacyOriginalSourcesUnchanged:8,selectedSourcesAndExportsByteIdentical:7,acceptedOrderPreserved:true,newDuckBloodArtwork:1,legIngredientCount:1,actualGameContentUnchanged:true,transparentPadding:true,normalizedSubjectRatio:.8,uniqueIdentities:8,uniqueSources:8,uniqueRenderedImages:8},contacts,samples:rows};
await writeFile(path.join(site,'round6.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round6.html'),'utf8');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND6_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
console.log(JSON.stringify({reviewId,status:manifest.status,counts,orderedNames,checks:manifest.checks,url:'http://127.0.0.1:5284/'},null,2));

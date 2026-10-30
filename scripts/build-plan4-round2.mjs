import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { watermelonCandidates } from '../artwork/plan4-food/round2/watermelon.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'output/plan4-food-review');
const site = path.join(output, 'site');
const acceptedId = '437a9a667ee5';
const archive = path.join(output, 'checkpoints', acceptedId, 'site');
const accepted = JSON.parse(await readFile(path.join(archive, 'samples.json'), 'utf8'));
const feedback = JSON.parse(await readFile(path.join(root, 'artwork/plan4-food/round2-feedback.json'), 'utf8'));
if (feedback.sourceReviewId !== 'ff7e98ad1789' || feedback.inheritedAcceptedReview !== acceptedId) throw Error('Round 2 feedback does not match the reviewed versions');
const firstRoundArchive = path.join(output, 'checkpoints', feedback.sourceReviewId, 'site');
const firstRound = JSON.parse(await readFile(path.join(firstRoundArchive, 'round2.json'), 'utf8'));
if (firstRound.reviewId !== feedback.sourceReviewId || firstRound.samples.length !== 14) throw Error('Round 2 feedback archive is incomplete');
const acceptance = JSON.parse(await readFile(path.join(root, 'artwork/plan4-food/accepted-reviews.json'), 'utf8'));
if (!acceptance.reviews.some(row => row.reviewId === acceptedId && row.status === 'USER_ACCEPTED')) throw Error('Previous review must be accepted before round 2');
const baseline = JSON.parse(await readFile(path.join(output, 'material-baseline.json'), 'utf8'));
const input = watermelonCandidates;
const expected = ['fresh-fruit-6'];
const candidates = new Map(input.map(row => [row.id, row]));
if (candidates.size !== 1 || expected.some(id => !candidates.has(id))) throw Error('Only F06 watermelon may be revised');
const acceptedModifiedIds = new Set(feedback.acceptedModifiedIds), keepOriginalIds = new Set(feedback.keepOriginalIds), revisionIds = new Set(feedback.revisionIds);
const originalIds = ['fresh-veg-3','fresh-veg-4','fresh-veg-6','fresh-fruit-3','fresh-fruit-4','fresh-fruit-5','fresh-fruit-7'];
if (acceptedModifiedIds.size !== 1 || !acceptedModifiedIds.has('fresh-veg-7') || keepOriginalIds.size !== 7 || originalIds.some(id => !keepOriginalIds.has(id)) || revisionIds.size !== 1 || !revisionIds.has('fresh-fruit-6')) throw Error('Feedback must retain V07, restore seven originals and revise only F06');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const xml = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const read = relative => readFile(path.join(root, relative));
const archived = relative => readFile(path.join(archive, relative));
for (const directory of ['assets/round2/original','assets/round2/proposal','assets/round2/highres','sources/round2','contacts']) await mkdir(path.join(site, directory), { recursive: true });
// The accepted review remains available exactly as delivered, alongside the next round.
await cp(archive, path.join(site, 'round1'), { recursive: true });
await cp(firstRoundArchive, path.join(site, 'round2-first'), { recursive: true });

function bounds(data, info) {
  let left=info.width,top=info.height,right=-1,bottom=-1,edge=0;
  for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) {
    const a=data[(y*info.width+x)*4+3];
    if(x===0||y===0||x===info.width-1||y===info.height-1) edge=Math.max(edge,a);
    if(a<=16) continue;
    left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<left) throw Error('Artwork is empty');
  return {left,top,width:right-left+1,height:bottom-top+1,edge};
}
function validate(svg,id) {
  if(/<(?:image|script|foreignObject)\b|(?:href|src)\s*=|data:/i.test(svg)) throw Error(id+': source must be editable, self-contained SVG');
  const ids=[...svg.matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1]);
  if(new Set(ids).size!==ids.length) throw Error(id+': duplicate SVG definition');
  for(const match of svg.matchAll(/url\(["']?#([^)'"\s]+)["']?\)/g)) if(!ids.includes(match[1])) throw Error(id+': missing '+match[1]);
  const box=svg.match(/\bviewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
  if(!box||box.length!==4||box.some(x=>!Number.isFinite(x))) throw Error(id+': invalid viewBox');
  return box;
}
async function render(source,id) {
  const svg=source.toString('utf8'),box=validate(svg,id);
  const raw=await sharp(source).resize(1024,1024).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const b=bounds(raw.data,raw.info);
  if(b.edge) throw Error(id+': source touches canvas edge');
  const side=Math.max(b.width/1024*box[2],b.height/1024*box[3])/.8;
  const cx=box[0]+(b.left+b.width/2)/1024*box[2],cy=box[1]+(b.top+b.height/2)/1024*box[3];
  const fitted=svg.replace(/(<svg\b[^>]*\bviewBox\s*=\s*)["'][^"']+["']/,'$1"'+[cx-side/2,cy-side/2,side,side].map(x=>x.toFixed(6)).join(' ')+'"');
  const highres=await sharp(Buffer.from(fitted)).resize(1024,1024).png().toBuffer();
  const png=await sharp(highres).resize(512,512).png().toBuffer();
  const webp=await sharp(png).webp({lossless:true,effort:6}).toBuffer();
  const final=await sharp(highres).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const f=bounds(final.data,final.info),occupancy=Math.max(f.width,f.height)/1024;
  if(f.edge||Math.abs(occupancy-.8)>.003) throw Error(id+': transparent padding or display occupancy differs');
  return {source,png,webp,highres,occupancy};
}
async function save(group,id,art) {
  const files={source:`sources/round2/${id}-${group}.svg`,png:`assets/round2/${group}/${id}.png`,image:`assets/round2/${group}/${id}.webp`,highres:`assets/round2/highres/${id}-${group}.png`};
  for(const [key,bytes] of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]]) await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
const rows=[];
let preservedAccepted = 0, restoredOriginals = 0;
for(const item of baseline.items.filter(x=>['fresh-veg','fresh-fruit'].includes(x.chain))) {
  const source=await read(item.original.source);
  if(hash(source)!==item.original.sourceSha256) throw Error(item.id+': original source changed');
  const original=await render(source,item.id+'-original');
  const locked=accepted.samples.find(x=>x.id===item.id);
  const acceptedModified=acceptedModifiedIds.has(item.id);
  const keepOriginal=keepOriginalIds.has(item.id);
  const candidate=candidates.get(item.id);
  if([Boolean(locked),acceptedModified,keepOriginal,Boolean(candidate)].filter(Boolean).length!==1) throw Error(item.id+': every food must have one explicit feedback selection');
  let proposal=original;
  let design=null,reason='用户确认保持原版；未采用本轮未通过的修改稿。',selection='original',acceptedReviewId=feedback.sourceReviewId;
  if(locked) {
    const [source,png,webp,highres]=await Promise.all([locked.source,locked.png,locked.after,locked.highres].map(archived));
    if(hash(source)!==locked.sha256.source||hash(png)!==locked.sha256.png512||hash(webp)!==locked.sha256.webp512||hash(highres)!==locked.sha256.highres) throw Error(item.id+': accepted artwork hash differs');
    proposal={source,png,webp,highres};
    preservedAccepted++;
    selection='inherited';acceptedReviewId=acceptedId;reason='沿用之前已确认的结果，本轮保持。';
  } else if(acceptedModified) {
    const selected=firstRound.samples.find(row=>row.id===item.id);
    if(!selected || selected.status!=='CANDIDATE') throw Error(item.id+': accepted V07 proposal is missing');
    const files=selected.proposal;
    const [source,png,webp,highres]=await Promise.all([files.source,files.png,files.image,files.highres].map(relative=>readFile(path.join(firstRoundArchive,relative))));
    if(hash(source)!==files.sha256.source||hash(png)!==files.sha256.png||hash(webp)!==files.sha256.image||hash(highres)!==files.sha256.highres) throw Error(item.id+': accepted V07 source or export differs');
    proposal={source,png,webp,highres};preservedAccepted++;
    selection='modified';design=selected.design;reason='用户确认本轮只有V07修改版通过，固定采用该归档源稿与导出。';
  } else if(candidate) {
    if(candidate.name!==item.name) throw Error(item.id+': food identity changed');
    proposal=await render(Buffer.from(candidate.svg),item.id+'-proposal');
    if(hash(proposal.source)===hash(original.source)) throw Error(item.id+': proposal has no artwork change');
    selection='candidate';design=candidate.design;reason=candidate.reason;acceptedReviewId=null;
  } else if(keepOriginal) {
    if(!proposal.source.equals(original.source)||!proposal.png.equals(original.png)||!proposal.webp.equals(original.webp)||!proposal.highres.equals(original.highres)) throw Error(item.id+': original selection must remain byte-identical');
    restoredOriginals++;
  }
  const status=candidate?'CANDIDATE':'ACCEPTED';
  const statusLabel=candidate?'西瓜精修 · 待确认':acceptedModified?'已确认 · 采用修改版':keepOriginal?'已确认 · 保持原版':'之前已确认 · 保持';
  rows.push({index:rows.length+1,code:(item.chain==='fresh-veg'?'V':'F')+String(item.level).padStart(2,'0'),id:item.id,name:item.name,chain:item.chain,group:item.chain==='fresh-veg'?'蔬菜':'鲜果',level:item.level,status,statusLabel,selection,reason,design,acceptedReviewId,acceptanceQuote:candidate?null:locked?'符合预期，进入下一轮修改，和我确认':feedback.userQuote,original:await save('original',item.id,original),proposal:await save('proposal',item.id,proposal)});
}
const counts={total:rows.length,candidates:rows.filter(x=>x.status==='CANDIDATE').length,proposedKeep:rows.filter(x=>x.status==='PROPOSE_KEEP').length,accepted:rows.filter(x=>x.status==='ACCEPTED').length};
if(JSON.stringify(counts)!==JSON.stringify({total:14,candidates:1,proposedKeep:0,accepted:13}) || preservedAccepted!==6 || restoredOriginals!==7) throw Error('Unexpected feedback scope');
if(new Set(rows.map(x=>x.proposal.sha256.source)).size!==14||new Set(rows.map(x=>x.proposal.sha256.image)).size!==14) throw Error('Foods must retain unique identities');
const reviewId=hash(JSON.stringify(rows.map(x=>[x.id,x.status,x.proposal.sha256.source]))).slice(0,12);
async function contact(items,size,mode) {
  const columns=mode==='proposals'?Math.min(3,items.length):7,cellWidth=mode==='proposals'&&items.length===1?384:mode==='proposals'?256:144,cellHeight=mode==='proposals'?176:154;
  const width=columns*cellWidth,height=56+Math.ceil(items.length/columns)*cellHeight;
  const layers=[],labels=[`<text x="20" y="27" font-size="16" font-weight="700">${mode==='proposals'?`F06 · 西瓜 / ${items.length}项精修候选`:'两条链 · 当前选用结果'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${mode==='proposals'?'左：原版　右：精修候选；西瓜效果待你确认':'13项已确认 · 仅F06西瓜精修待确认'}</text>`];
  for(const [i,item] of items.entries()) {
    const x=i%columns*cellWidth,y=56+Math.floor(i/columns)*cellHeight;
    const images=mode==='proposals'?[item.original,item.proposal]:[item.proposal];
    for(const [j,asset]of images.entries()) {
      const cx=mode==='proposals'?x+cellWidth*(j+.5)/2:x+72;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(mode==='proposals') labels.push(`<text x="${cx}" y="${y+116}" text-anchor="middle" font-size="10" fill="${j?'#4b714a':'#7a6b56'}">${j?'精修候选':'原版'}</text>`);
    }
    labels.push(`<text x="${x+cellWidth/2}" y="${y+137}" text-anchor="middle" font-size="12">${xml(item.code+' · '+item.name)}</text>`);
    if(mode!=='proposals') labels.push(`<text x="${x+cellWidth/2}" y="${y+153}" text-anchor="middle" font-size="8.5" fill="#84745f">${xml(item.statusLabel)}</text>`);
  }
  layers.push({input:Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><g font-family="Microsoft YaHei, sans-serif" fill="#514234">${labels.join('')}</g></svg>`),left:0,top:0});
  const name=`contacts/round2-${mode}-${size}.png`;
  await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,name));
  return {size,path:name};
}
const contacts={proposals:[],chains:[]};
for(const size of [40,96]) {contacts.proposals.push(await contact(rows.filter(x=>x.status==='CANDIDATE'),size,'proposals'));contacts.chains.push(await contact(rows,size,'chains'));}
const manifest={title:'鹅巷食光 · F06西瓜精修',round:2,revision:2,reviewId,status:'AWAITING_USER_REVIEW',previousAcceptedReview:acceptedId,feedbackSourceReview:feedback.sourceReviewId,feedbackQuote:feedback.userQuote,selectionCounts:{acceptedModified:1,acceptedOriginal:7,inheritedAccepted:5,revisionCandidate:1},scope:'阶段3第一批果蔬反馈：仅V07采用修改版，七项保持原版，五项之前已确认结果保持；仅F06西瓜为新精修候选。审阅资源尚未接入正式游戏。',counts,checks:{originalSourcesUnchanged:14,acceptedSourcesAndExportsByteIdentical:6,inheritedAcceptedPreserved:5,acceptedV07Preserved:true,originalSelectionsByteIdentical:7,priorAcceptedReviewArchived:true,feedbackReviewArchived:true,transparentPadding:true,normalizedSubjectRatio:.8,uniqueIdentities:14,uniqueProposalSources:14,uniqueRenderedImages:14},contacts,samples:rows};
await writeFile(path.join(site,'round2.json'),JSON.stringify(manifest,null,2)+'\n');
// Keep samples.json readable by the existing local review server.
await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round2.html'),'utf8');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND2_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks:manifest.checks,url:'http://127.0.0.1:5284/'},null,2));

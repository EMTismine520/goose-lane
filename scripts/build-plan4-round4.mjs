import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { beastACandidates } from '../artwork/plan4-food/round4/beast-a.mjs';
import { beastBCandidates } from '../artwork/plan4-food/round4/beast-b.mjs';
import { poultryFrontCandidates } from '../artwork/plan4-food/round4/poultry-front.mjs';
import { poultryTailCandidates } from '../artwork/plan4-food/round4/poultry-tail.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'output/plan4-food-review');
const site = path.join(output, 'site');
const acceptedId = '437a9a667ee5';
const archive = path.join(output, 'checkpoints', acceptedId, 'site');
const accepted = JSON.parse(await readFile(path.join(archive, 'samples.json'), 'utf8'));
const acceptance = JSON.parse(await readFile(path.join(root, 'artwork/plan4-food/accepted-reviews.json'), 'utf8'));
if (!acceptance.reviews.some(row => row.reviewId === acceptedId && row.status === 'USER_ACCEPTED')) throw Error('Accepted sample sources are required');
const feedback = JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round4-feedback.json'),'utf8'));
const previousProposalArchive = path.join(output,'checkpoints',feedback.sourceReviewId,'site');
const previousProposal = JSON.parse(await readFile(path.join(previousProposalArchive,'round3.json'),'utf8'));
if(previousProposal.reviewId!=='1b494fd39424') throw Error('Rejected round 3 archive differs');
const previousRound = JSON.parse(await readFile(path.join(output, 'round2-final.json'), 'utf8'));
if (previousRound.status !== 'ALL_14_SELECTIONS_CONFIRMED' || previousRound.counts.accepted !== 14 || previousRound.samples.find(row => row.id === 'fresh-fruit-6')?.selection !== 'original') throw Error('Fruit and vegetable selections must be resolved before round 3');
const baseline = JSON.parse(await readFile(path.join(output, 'material-baseline.json'), 'utf8'));
const candidates = new Map([...beastACandidates,...beastBCandidates,...poultryFrontCandidates,...poultryTailCandidates].map(row=>[row.id,row]));
const expected = baseline.items.filter(row=>['fresh-beast','fresh-poultry'].includes(row.chain)).map(row=>row.id);
if(candidates.size!==18||expected.some(id=>!candidates.has(id))) throw Error('Every meat and poultry node must receive a newly authored alternative');
const proposedRenames = new Map([['fresh-poultry-3','鸡里脊'],['fresh-poultry-6','鸭胸肉'],['fresh-poultry-7','鸭腿'],['fresh-poultry-8','卤鹅肉']]);
const gameContent = JSON.parse(await readFile(path.join(root,'src/content/expansion-data.json'),'utf8'));
for(const item of baseline.items.filter(row=>expected.includes(row.id))) if(gameContent.items.find(row=>row.id===item.id)?.name!==item.name) throw Error(item.id+': actual game content must retain its existing identity while alternatives await selection');
for(const recipe of feedback.recipeProposals) if(gameContent.recipes.find(row=>row.id===recipe.id)?.name!==recipe.before) throw Error(recipe.id+': recipe preview must not silently alter the game recipe');
const lockedIds = ['fresh-beast-4','fresh-beast-8','fresh-poultry-1','fresh-poultry-4','fresh-poultry-5'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const xml = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const read = relative => readFile(path.join(root, relative));
const archived = relative => readFile(path.join(archive, relative));
for (const directory of ['assets/round4/original','assets/round4/v4','assets/round4/proposal','assets/round4/highres','sources/round4','contacts']) await mkdir(path.join(site, directory), { recursive: true });
await cp(archive, path.join(site, 'round1'), { recursive: true });

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
  if(!box||box.length!==4||box.some(x=>!Number.isFinite(x))||box[2]<=0||box[3]<=0) throw Error(id+': invalid viewBox');
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
  const files={source:`sources/round4/${id}-${group}.svg`,png:`assets/round4/${group}/${id}.png`,image:`assets/round4/${group}/${id}.webp`,highres:`assets/round4/highres/${id}-${group}.png`};
  for(const [key,bytes] of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]]) await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
const rows=[];
let preservedAccepted=0;
for(const item of baseline.items.filter(x=>['fresh-beast','fresh-poultry'].includes(x.chain))) {
  const source=await read(item.original.source);
  if(hash(source)!==item.original.sourceSha256) throw Error(item.id+': original source changed');
  const v4=await render(source,item.id+'-v4');
  let original=v4;
  const locked=lockedIds.includes(item.id)?accepted.samples.find(row=>row.id===item.id):null;
  if(lockedIds.includes(item.id)&&!locked) throw Error(item.id+': accepted sample is missing');
  const candidate=candidates.get(item.id);
  if(locked) {
    const [source,png,webp,highres]=await Promise.all([locked.source,locked.png,locked.after,locked.highres].map(archived));
    if(hash(source)!==locked.sha256.source||hash(png)!==locked.sha256.png512||hash(webp)!==locked.sha256.webp512||hash(highres)!==locked.sha256.highres) throw Error(item.id+': accepted source or export differs');
    validate(source.toString('utf8'),item.id+'-accepted');
    original={source,png,webp,highres};preservedAccepted++;
  }
  if(candidate.name!==(proposedRenames.get(item.id)??item.name)) throw Error(item.id+': proposed food name does not match the reviewed chain design');
  const proposal=await render(Buffer.from(candidate.svg),item.id+'-proposal');
  const old=previousProposal.samples.find(row=>row.id===item.id);
  if(hash(proposal.source)===hash(original.source)||hash(proposal.source)===hash(v4.source)||hash(proposal.webp)===hash(original.webp)||hash(proposal.source)===old.proposal.sha256.source||hash(proposal.webp)===old.proposal.sha256.image) throw Error(item.id+': every item requires a fresh alternative, distinct from the previous rejected or retained artwork');
  const code=(item.chain==='fresh-beast'?'B':'P')+String(item.level).padStart(2,'0');
  rows.push({index:rows.length+1,code,id:item.id,oldName:item.name,name:candidate.name,nameChanged:candidate.name!==item.name,chain:item.chain,group:item.chain==='fresh-beast'?'兽肉':'禽肉',level:item.level,status:'CANDIDATE',statusLabel:'全新设计 · 待你选用',selection:'candidate',priority:['B01','B02','B03','P03','P06','P07','P08'].includes(code),reason:candidate.reason,design:candidate.design,baselineAcceptedReviewId:locked?acceptedId:null,original:await save('original',item.id,original),v4Original:await save('v4',item.id,v4),proposal:await save('proposal',item.id,proposal)});
}
const counts={total:rows.length,candidates:rows.filter(x=>x.status==='CANDIDATE').length,proposedKeep:rows.filter(x=>x.status==='PROPOSE_KEEP').length,accepted:rows.filter(x=>x.status==='ACCEPTED').length};
if(JSON.stringify(counts)!==JSON.stringify({total:18,candidates:18,proposedKeep:0,accepted:0})||preservedAccepted!==5) throw Error('Every new artwork must remain a candidate until the user chooses it');
if(new Set(rows.map(x=>x.proposal.sha256.source)).size!==18||new Set(rows.map(x=>x.proposal.sha256.image)).size!==18) throw Error('Foods must retain unique identities');
const reviewId=hash(JSON.stringify(rows.map(x=>[x.id,x.status,x.proposal.sha256.source]))).slice(0,12);
async function contact(items,size,mode) {
  const columns=mode==='proposals'?3:6,cellWidth=mode==='proposals'?320:156,cellHeight=mode==='proposals'?176:158;
  const width=columns*cellWidth,height=56+Math.ceil(items.length/columns)*cellHeight;
  const layers=[],labels=[`<text x="20" y="27" font-size="16" font-weight="700">${mode==='proposals'?'肉禽整链 / 18项前后对照':'肉禽整链 / 18张全新设计'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${mode==='proposals'?'每组左：当前选用　右：全新候选；由你决定采用':'兽肉10项 · 禽肉8项 · 全部为待选方案，尚未替换已有选用'}</text>`];
  for(const [i,item] of items.entries()) {
    const x=i%columns*cellWidth,y=56+Math.floor(i/columns)*cellHeight;
    const images=mode==='proposals'?[item.original,item.proposal]:[item.proposal];
    for(const [j,asset]of images.entries()) {
      const cx=mode==='proposals'?x+cellWidth*(j+.5)/2:x+cellWidth/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(mode==='proposals') labels.push(`<text x="${cx}" y="${y+116}" text-anchor="middle" font-size="10" fill="${j?'#4b714a':'#7a6b56'}">${j?'全新候选':'当前选用'}</text>`);
    }
    labels.push(`<text x="${x+cellWidth/2}" y="${y+137}" text-anchor="middle" font-size="12">${xml(item.code+' · '+item.name)}</text>`);
    if(mode!=='proposals') labels.push(`<text x="${x+cellWidth/2}" y="${y+153}" text-anchor="middle" font-size="8.5" fill="#84745f">${xml(item.statusLabel)}</text>`);
  }
  layers.push({input:Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><g font-family="Microsoft YaHei, sans-serif" fill="#514234">${labels.join('')}</g></svg>`),left:0,top:0});
  const name=`contacts/round4-${mode}-${size}.png`;
  await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,name));
  return {size,path:name};
}
const contacts={proposals:[],chains:[]};
for(const size of [40,96]) {contacts.proposals.push(await contact(rows.filter(x=>x.status==='CANDIDATE'),size,'proposals'));contacts.chains.push(await contact(rows,size,'chains'));}
const manifest={title:'鹅巷食光 · 肉禽整链重设计',round:4,reviewId,status:'AWAITING_USER_SELECTION',previousAcceptedReview:acceptedId,rejectedReview:feedback.sourceReviewId,previousRoundReview:previousRound.reviewId,userQuote:feedback.userQuote,authoringPolicy:feedback.futurePolicy,scope:feedback.scope,counts,proposedIdentityChanges:rows.filter(x=>x.nameChanged).map(({code,id,oldName,name})=>({code,id,before:oldName,after:name})),recipeProposals:feedback.recipeProposals,checks:{originalSourcesUnchanged:18,baselineAcceptedSourcesAndExportsByteIdentical:5,freshAlternatives:18,distinctFromPreviousProposals:18,proposedIdentityChanges:4,actualGameContentUnchanged:true,previousFruitVegetableSelectionsConfirmed:true,transparentPadding:true,normalizedSubjectRatio:.8,uniqueIdentities:18,uniqueProposalSources:18,uniqueRenderedImages:18},contacts,samples:rows};
await writeFile(path.join(site,'round4.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round4.html'),'utf8');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND4_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks:manifest.checks,url:'http://127.0.0.1:5284/'},null,2));

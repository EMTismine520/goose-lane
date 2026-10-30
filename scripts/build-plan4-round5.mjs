import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { poultryFoundationCandidates } from '../artwork/plan4-food/round5/poultry-foundation.mjs';
import { poultrySpecialtyCandidates } from '../artwork/plan4-food/round5/poultry-specialty.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'output/plan4-food-review');
const site = path.join(output, 'site');
const acceptedId = '437a9a667ee5';
const archive = path.join(output, 'checkpoints', acceptedId, 'site');
const accepted = JSON.parse(await readFile(path.join(archive, 'samples.json'), 'utf8'));
const acceptance = JSON.parse(await readFile(path.join(root, 'artwork/plan4-food/accepted-reviews.json'), 'utf8'));
if (!acceptance.reviews.some(row => row.reviewId === acceptedId && row.status === 'USER_ACCEPTED')) throw Error('Accepted sample sources are required');
const feedback = JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round5-feedback.json'),'utf8'));
const previousProposalArchive = path.join(output,'checkpoints',feedback.sourceReviewId,'site');
const previousProposal = JSON.parse(await readFile(path.join(previousProposalArchive,'round4.json'),'utf8'));
if(previousProposal.reviewId!=='c124d8672c9e') throw Error('Previous meat and poultry review archive differs');
const beastModifiedIds=['fresh-beast-7','fresh-beast-8','fresh-beast-9','fresh-beast-10'];
const beastOriginalIds=['fresh-beast-1','fresh-beast-2','fresh-beast-3','fresh-beast-4','fresh-beast-5','fresh-beast-6'];
if(feedback.beastModifiedIds?.join(',')!==beastModifiedIds.join(',')||feedback.beastOriginalIds?.join(',')!==beastOriginalIds.join(',')) throw Error('The ten beast selections must preserve the explicit user decision');
const previousRound = JSON.parse(await readFile(path.join(output, 'round2-final.json'), 'utf8'));
if (previousRound.status !== 'ALL_14_SELECTIONS_CONFIRMED' || previousRound.counts.accepted !== 14 || previousRound.samples.find(row => row.id === 'fresh-fruit-6')?.selection !== 'original') throw Error('Fruit and vegetable selections must be resolved before round 3');
const baseline = JSON.parse(await readFile(path.join(output, 'material-baseline.json'), 'utf8'));
const candidates = new Map([...poultryFoundationCandidates,...poultrySpecialtyCandidates].map(row=>[row.id,row]));
const expected = baseline.items.filter(row=>row.chain==='fresh-poultry').map(row=>row.id);
const poultryNames=['鹌鹑蛋','鸡胗','鹅肝','鸡胸肉','火鸡腿','鸭血','鸽肉串','卤鹅肉'];
if(candidates.size!==8||expected.length!==8||expected.some(id=>!candidates.has(id))) throw Error('All eight poultry nodes require new alternatives');
if(feedback.proposedPoultryNames?.join(',')!==poultryNames.join(',')) throw Error('Poultry proposals must match the whole-chain design');
if([...candidates.values()].filter(row=>row.name.endsWith('腿')).length!==1) throw Error('The redesigned chain must contain one leg ingredient, without repeating the same cut by species');
const proposedRenames = new Map(poultryNames.map((name,index)=>['fresh-poultry-'+(index+1),name]));
const gameContent = JSON.parse(await readFile(path.join(root,'src/content/expansion-data.json'),'utf8'));
for(const item of baseline.items.filter(row=>expected.includes(row.id))) if(gameContent.items.find(row=>row.id===item.id)?.name!==item.name) throw Error(item.id+': actual game content must retain its existing identity while alternatives await selection');
for(const recipe of feedback.recipeProposals) if(gameContent.recipes.find(row=>row.id===recipe.id)?.name!==recipe.before) throw Error(recipe.id+': recipe preview must not silently alter the game recipe');
const lockedIds = ['fresh-poultry-1','fresh-poultry-4','fresh-poultry-5'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const xml = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const read = relative => readFile(path.join(root, relative));
const archived = relative => readFile(path.join(archive, relative));
for (const directory of ['assets/round5/original','assets/round5/v4','assets/round5/proposal','assets/round5/highres','sources/round5','contacts']) await mkdir(path.join(site, directory), { recursive: true });
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
  const files={source:`sources/round5/${id}-${group}.svg`,png:`assets/round5/${group}/${id}.png`,image:`assets/round5/${group}/${id}.webp`,highres:`assets/round5/highres/${id}-${group}.png`};
  for(const [key,bytes] of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]]) await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
const rows=[];
let preservedAccepted=0;
for(const item of baseline.items.filter(x=>x.chain==='fresh-poultry')) {
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
  const code='P'+String(item.level).padStart(2,'0');
  rows.push({index:rows.length+1,code,id:item.id,oldName:item.name,name:candidate.name,nameChanged:candidate.name!==item.name,chain:item.chain,group:'禽肉',level:item.level,status:'CANDIDATE',statusLabel:'全新设计 · 待你选用',selection:'candidate',segment:item.level<=4?'foundation':'specialty',structureRole:feedback.structureRoles?.[item.level-1]??'',reason:candidate.reason,design:candidate.design,baselineAcceptedReviewId:locked?acceptedId:null,original:await save('original',item.id,original),v4Original:await save('v4',item.id,v4),proposal:await save('proposal',item.id,proposal)});
}
const counts={total:rows.length,candidates:rows.filter(x=>x.status==='CANDIDATE').length,proposedKeep:rows.filter(x=>x.status==='PROPOSE_KEEP').length,accepted:rows.filter(x=>x.status==='ACCEPTED').length};
if(JSON.stringify(counts)!==JSON.stringify({total:8,candidates:8,proposedKeep:0,accepted:0})||preservedAccepted!==3||rows.filter(row=>row.nameChanged).length!==6) throw Error('The eight new poultry artworks must remain candidates until the user chooses them');
if(new Set(rows.map(x=>x.proposal.sha256.source)).size!==8||new Set(rows.map(x=>x.proposal.sha256.image)).size!==8) throw Error('Foods must retain unique identities');
const reviewId=hash(JSON.stringify(rows.map(x=>[x.id,x.status,x.proposal.sha256.source]))).slice(0,12);
async function contact(items,size,mode) {
  const columns=mode==='proposals'?2:4,cellWidth=mode==='proposals'?320:156,cellHeight=mode==='proposals'?176:158;
  const width=columns*cellWidth,height=56+Math.ceil(items.length/columns)*cellHeight;
  const layers=[],labels=[`<text x="20" y="27" font-size="16" font-weight="700">${mode==='proposals'?'禽肉整链 / 8项前后对照':'禽肉整链 / 8张全新设计'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${mode==='proposals'?'每组左：当前选用　右：全新候选；由你决定采用':'不同食材结构 · 唯一腿类 · 8项全部待你选用'}</text>`];
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
  const name=`contacts/round5-${mode}-${size}.png`;
  await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,name));
  return {size,path:name};
}
const contacts={proposals:[],chains:[]};
for(const size of [40,96]) {contacts.proposals.push(await contact(rows.filter(x=>x.status==='CANDIDATE'),size,'proposals'));contacts.chains.push(await contact(rows,size,'chains'));}
const manifest={title:'鹅巷食光 · 禽肉食材整链重设计',round:5,reviewId,status:'AWAITING_USER_SELECTION',previousAcceptedReview:acceptedId,rejectedPoultryReview:feedback.sourceReviewId,previousRoundReview:previousRound.reviewId,userQuote:feedback.userQuote,authoringPolicy:feedback.futurePolicy??'每批全部提供新版，由用户逐项决定采用。',scope:feedback.scope??'禽肉八项全部重新设计；不同结构，不按同部位换物种重复。兽肉十项已按用户选择固定。',diversityRule:feedback.diversityRule,counts,beastSelections:{modifiedIds:beastModifiedIds,originalIds:beastOriginalIds,page:'beast-final.html',manifest:'beast-final.json'},proposedIdentityChanges:rows.filter(x=>x.nameChanged).map(({code,id,oldName,name})=>({code,id,before:oldName,after:name})),recipeProposals:feedback.recipeProposals,recipeSummary:feedback.recipeSummary,checks:{originalSourcesUnchanged:8,baselineAcceptedSourcesAndExportsByteIdentical:3,freshAlternatives:8,distinctFromPreviousProposals:8,proposedIdentityChanges:6,legIngredientCount:1,actualGameContentUnchanged:true,previousFruitVegetableSelectionsConfirmed:true,beastSelectionDecisionPreserved:true,transparentPadding:true,normalizedSubjectRatio:.8,uniqueIdentities:8,uniqueProposalSources:8,uniqueRenderedImages:8},contacts,samples:rows};
await writeFile(path.join(site,'round5.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round5.html'),'utf8');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND5_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks:manifest.checks,url:'http://127.0.0.1:5284/'},null,2));

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { seaFrontCandidates } from '../artwork/plan4-food/round15/sea-front.mjs';
import { seaMidCandidates, mulberryCandidates } from '../artwork/plan4-food/round15/sea-mid-mulberry.mjs';
import { seaTailCandidates } from '../artwork/plan4-food/round15/sea-tail.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round15-feedback.json'),'utf8'));
if(feedback.sourceReviewId!=='bcf029fa03a3'||feedback.nextChain!=='fresh-sea')throw Error('Round 15 must use the current fruit selections and next seafood chain');
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
const previous=JSON.parse(await readFile(path.join(archive,'round14.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==8)throw Error('Round 14 archive is incomplete');
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const seaItems=baseline.items.filter(r=>r.chain==='fresh-sea');
const candidates=new Map([...seaFrontCandidates,...seaMidCandidates,...seaTailCandidates,...mulberryCandidates].map(r=>[r.id,r]));
if(seaItems.length!==11||candidates.size!==12||seaItems.some(r=>!candidates.has(r.id))||!candidates.has(feedback.redesignTargetId))throw Error('All eleven seafood ingredients and mulberry require new candidates');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const contentBytes=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(contentBytes)!==feedback.actualContentSha256)throw Error('Actual game content changed during artwork review');
const gameContent=JSON.parse(contentBytes.toString('utf8'));
let preservedPrevious=0;
for(const entry of feedback.previousFinalReviews){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  if(final.reviewId!==entry.reviewId||final.samples.length!==entry.count||final.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error(entry.stem+': confirmed inventory differs');
  if(hash(JSON.stringify([entry.stem,final.samples.map(r=>[r.id,r.proposal.sha256,r.expectedOccupancy])])).slice(0,12)!==entry.reviewId)throw Error(entry.stem+': confirmed artwork inventory changed');
  for(const row of final.samples){
    for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(site,row.proposal[key])))!==row.proposal.sha256[key]||hash(await readFile(path.join(archive,row.proposal[key])))!==row.proposal.sha256[key])throw Error(row.code+': confirmed export changed');
    preservedPrevious++;
  }
}
if(preservedPrevious!==26)throw Error('All 26 confirmed ingredients must remain unchanged');

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
for(const dir of ['assets/round15/original','assets/round15/proposal','assets/round15/v4','assets/round15/highres','sources/round15','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round15/${id}-${group}.svg`,png:`assets/round15/${group}/${id}.png`,image:`assets/round15/${group}/${id}.webp`,highres:`assets/round15/highres/${id}-${group}.png`};
  for(const [key,bytes]of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]])await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}


async function archivedArtwork(row){
  const files=row.proposal,art={};
  for(const [key,field]of [['source','source'],['png','png'],['webp','image'],['highres','highres']]){
    art[key]=await readFile(path.join(archive,files[field]));
    if(hash(art[key])!==files.sha256[field])throw Error(row.code+': archived current result changed');
  }
  validate(art.source.toString('utf8'),row.code);
  await inspect(art.png,512,row.code,row.expectedOccupancy);await inspect(art.webp,512,row.code,row.expectedOccupancy);await inspect(art.highres,1024,row.code,row.expectedOccupancy);
  return art;
}
const seaSampleArchive=path.join(output,'checkpoints',feedback.approvedSeaSampleReviewId,'site');
const seaSampleReview=JSON.parse(await readFile(path.join(seaSampleArchive,'samples.json'),'utf8'));
async function approvedSeaArtwork(id){
  const row=seaSampleReview.samples.find(r=>r.id===id);if(!row||!row.selection.startsWith('approved-'))throw Error(id+': approved seafood sample missing');
  const art={};for(const [key,field,digest]of [['source','source','source'],['png','png','png512'],['webp','after','webp512'],['highres','highres','highres']]){
    art[key]=await readFile(path.join(seaSampleArchive,row[field]));if(hash(art[key])!==row.sha256[digest])throw Error(id+': approved sample bytes changed');
  }
  validate(art.source.toString('utf8'),id);await inspect(art.png,512,id,.8);await inspect(art.webp,512,id,.8);await inspect(art.highres,1024,id,.8);
  return art;
}
const rows=[],exportInspections={};
for(const old of previous.samples){
  const isNew=old.id===feedback.redesignTargetId,original=await archivedArtwork(old),candidate=candidates.get(old.id);
  const proposal=isNew?await render(Buffer.from(candidate.svg),old.id+'-redesign',feedback.redesignExpectedOccupancy):original;
  const before=await save('original',old.id,original),after=await save('proposal',old.id,proposal);
  if(!isNew&&Object.keys(before.sha256).some(k=>before.sha256[k]!==after.sha256[k]))throw Error(old.code+': retained current result must remain byte-identical');
  if(isNew){
    if(candidate.name!==old.name||candidate.expectedOccupancy!==.8||before.sha256.source===after.sha256.source||before.sha256.image===after.sha256.image)throw Error('Mulberry needs a new lively design');
    const paths=s=>[...s.matchAll(/\bd="([^"]+)"/g)].map(m=>m[1]).join('|');
    if(paths(original.source.toString('utf8'))===paths(candidate.svg))throw Error('Mulberry redesign must change form rather than only colour');
    exportInspections[old.code]=proposal.inspection;
  }
  const {artworkAdjustmentProof,resizeProof,...prior}=old;
  rows.push({...prior,index:rows.length+1,status:isNew?'CANDIDATE':'RETAINED',statusLabel:isNew?'桑葚重新设计 · 待选用':'当前选用与大小保持',previousReviewStatus:old.status,selection:isNew?'candidate':'selected',artworkStatus:isNew?'REDESIGN_PENDING':old.artworkStatus,artworkSelection:isNew?'redesign':old.artworkSelection,changeType:isNew?'redesign':'unchanged',sourceLabel:isNew?'桑葚全新玫红与明紫方案，替代上一轮深蓝黑方向提出新稿':'第14轮当前选用与显示大小原样保持',reason:isNew?candidate.reason:'保持第14轮当前展示，所选SVG、PNG512、WebP512和PNG1024全部逐字节相同。',design:isNew?candidate.design:old.design,expectedOccupancy:old.expectedOccupancy,presentationScale:1,relativePresentationScale:1,comparisonArchiveReviewId:feedback.sourceReviewId,currentResultRetainedFromReviewId:feedback.sourceReviewId,...(isNew?{sourceOrigin:'ROUND15_MULBERRY_REDESIGN',authoringSource:'artwork/plan4-food/round15/sea-mid-mulberry.mjs'}:{}),original:before,proposal:after,...(artworkAdjustmentProof?{previousArtworkAdjustmentProof:artworkAdjustmentProof}:{}),...(resizeProof?{previousResizeProof:resizeProof}:{})});
}
let preservedApprovedSea=0;
for(const [index,item]of seaItems.entries()){
  const candidate=candidates.get(item.id),occupancy=feedback.seaOccupancies[index];
  if(item.level!==index+1||candidate.name!==item.name||feedback.orderedSeaNames[index]!==item.name||candidate.expectedOccupancy!==occupancy||item.level<=5&&occupancy>.74)throw Error(item.id+': candidate identity or presentation differs');
  const source=await readFile(path.join(root,item.original.source));if(hash(source)!==item.original.sourceSha256)throw Error(item.id+': original master changed');
  const live=gameContent.items.find(r=>r.id===item.id);if(live?.name!==item.name||live.level!==item.level)throw Error(item.id+': actual game identity changed');
  const isApproved=feedback.approvedSeaIds.includes(item.id),v4=await render(source,item.id+'-v4',.8),original=isApproved?await approvedSeaArtwork(item.id):v4;
  const proposal=await render(Buffer.from(candidate.svg),item.id+'-proposal',occupancy);
  const before=await save('original',item.id,original),after=await save('proposal',item.id,proposal);
  if(before.sha256.source===after.sha256.source||before.sha256.image===after.sha256.image||hash(source)===after.sha256.source)throw Error(item.id+': every seafood item needs independent new artwork');
  const code='SE'+String(item.level).padStart(2,'0');
  const v4Original=isApproved?await save('v4',item.id,v4):undefined;
  if(isApproved)preservedApprovedSea++;
  rows.push({index:rows.length+1,code,id:item.id,name:item.name,oldName:item.name,nameChanged:false,chain:item.chain,group:'海鲜',level:item.level,status:'CANDIDATE',statusLabel:isApproved?'既定稿保留 · 本轮新版待选':'全新设计 · 待你选用',selection:'candidate',artworkStatus:'CANDIDATE_PENDING',artworkSelection:'candidate',changeType:'redesign',expectedOccupancy:occupancy,priorExpectedOccupancy:.8,sourceLabel:isApproved?'437a细描边既定用图精确保留，新稿单独比较':'原版V4保留，本轮海鲜独立新绘供选择',reason:candidate.reason,design:candidate.design,authoringSource:'artwork/plan4-food/round15/'+(item.level<=5?'sea-front.mjs':item.level<=8?'sea-mid-mulberry.mjs':'sea-tail.mjs'),...(isApproved?{baselineAcceptedReviewId:feedback.approvedSeaSampleReviewId,baselineArtworkStatus:'PREVIOUSLY_USER_SELECTED',baselineSelectionPreserved:true,v4Original}:{}),original:before,proposal:after});
  exportInspections[code]=proposal.inspection;
}
if(preservedApprovedSea!==2||rows.length!==19||rows.filter(r=>r.status==='CANDIDATE').length!==12||rows.filter(r=>r.status==='RETAINED').length!==7)throw Error('Review scope or counts differ');
if(new Set(rows.map(r=>r.id)).size!==19||new Set(rows.map(r=>r.proposal.sha256.source)).size!==19||new Set(rows.map(r=>r.proposal.sha256.image)).size!==19)throw Error('Review identities and artwork must remain unique');
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256.source,r.proposal.sha256.image,r.expectedOccupancy]))).slice(0,12);
for(const row of rows.filter(r=>r.status==='CANDIDATE')){row.sourceReviewId=reviewId;row.sourceTargetId=row.id;}
async function contact(items,size,mode){
  const compare=mode==='proposals',cols=compare?3:mode==='fruit'?4:6,cw=compare?320:156,ch=compare?176:158,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const title=compare?'桑葚与海鲜 / 十二项前后对照':mode==='fruit'?'鲜果当前展示 / 桑葚活泼新稿':mode==='sea'?'海鲜整链 / 十一项全新候选':'活泼桑葚与海鲜 / 十二张新稿';
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${title} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'每组左：当前选用或原版　右：本轮新版；由你选择':'细深描边 · 前五级控制体量 · 新稿仍待选用'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+116}" text-anchor="middle" font-size="10" fill="${j?'#4b714a':'#7a6b56'}">${j?'新版待选':row.id===feedback.redesignTargetId?'上轮深蓝黑稿':row.baselineAcceptedReviewId?'既定选用':'原版'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+137}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    if(!compare)texts.push(`<text x="${x+cw/2}" y="${y+153}" text-anchor="middle" font-size="9" fill="#84745f">${row.status==='RETAINED'?'当前展示保持':'新稿待选用'}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round15-${mode}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={proposals:[],candidates:[],fruit:[],sea:[]};for(const size of [40,96]){const pending=rows.filter(r=>r.status==='CANDIDATE');contacts.proposals.push(await contact(pending,size,'proposals'));contacts.candidates.push(await contact(pending,size,'candidates'));contacts.fruit.push(await contact(rows.filter(r=>r.chain==='fresh-exotic'),size,'fruit'));contacts.sea.push(await contact(rows.filter(r=>r.chain==='fresh-sea'),size,'sea'));}
const counts={total:19,candidates:12,retained:7,accepted:0};
const checks={seaOriginalSourcesUnchanged:11,retainedFruitSourceAndExportsByteIdentical:7,retainedFruitSizesPreserved:true,previousConfirmedSourcesAndExportsByteIdentical:26,approvedSeaSourceAndExportsByteIdentical:2,approvedSeaDefaultsPreserved:true,freshSeaAlternatives:11,newMulberryDesigns:1,mulberryGeometryRedesigned:true,unchangedIngredientIdentities:19,newRecipeOrNameChanges:0,transparentPadding:true,actualGameContentUnchanged:true,actualContentSha256:hash(contentBytes),uniqueIdentities:19,uniqueSources:19,uniqueRenderedImages:19,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 活泼桑葚与海鲜新一轮',round:15,reviewId,status:'LIVELY_MULBERRY_AND_11_SEA_CANDIDATES_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,authoringPolicy:feedback.authoringPolicy,sizePolicy:feedback.sizePolicy,counts,previousFinalReviews:feedback.previousFinalReviews,retainedFruitAcceptanceNote:feedback.retainedFruitAcceptanceNote,checks,exportInspections,contacts,samples:rows};
await writeFile(path.join(site,'round15.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round15.html'),'utf8');if(!template.includes('/*__ROUND15_DATA__*/'))throw Error('Missing round 15 template marker');await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND15_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks,url:'http://127.0.0.1:5284/'},null,2));

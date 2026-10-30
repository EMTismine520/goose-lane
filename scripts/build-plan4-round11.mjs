import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { seasonalFrontCandidates } from '../artwork/plan4-food/round11/seasonal-front.mjs';
import { seasonalTailCandidates } from '../artwork/plan4-food/round11/seasonal-tail.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round11-feedback.json'),'utf8'));
if(feedback.sourceReviewId!=='d6a12bd86191'||feedback.chain!=='fresh-seasonal')throw Error('Round 11 must follow the confirmed poultry and spice review');
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
const previous=JSON.parse(await readFile(path.join(archive,'round10.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==18)throw Error('The confirmed round 10 archive is incomplete');
const acceptance=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/accepted-reviews.json'),'utf8'));
if(!acceptance.reviews.some(r=>r.reviewId===feedback.sourceReviewId&&r.status==='ALL_18_ARTWORK_AND_PRESENTATION_CONFIRMED'))throw Error('All eighteen previous selections and sizes require user confirmation');
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const items=baseline.items.filter(r=>r.chain==='fresh-seasonal');
const candidates=new Map([...seasonalFrontCandidates,...seasonalTailCandidates].map(r=>[r.id,r]));
if(items.length!==8||candidates.size!==8||items.some(r=>!candidates.has(r.id)))throw Error('Every seasonal vegetable must receive a new design');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const contentBytes=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(contentBytes)!==feedback.actualContentSha256)throw Error('Actual game content changed during artwork review');
const gameContent=JSON.parse(contentBytes.toString('utf8'));

for(const row of previous.samples)for(const key of ['source','png','image','highres']){
  const rel=row.proposal[key],expected=row.proposal.sha256[key];
  if(hash(await readFile(path.join(archive,rel)))!==expected||hash(await readFile(path.join(site,rel)))!==expected)throw Error(row.code+': confirmed artwork or size changed');
}
for(const entry of feedback.previousFinalReviews){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  if(final.reviewId!==entry.reviewId||final.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED'||final.samples.length!==entry.count)throw Error(entry.stem+': finalized selection differs');
  for(const row of final.samples){
    const confirmed=previous.samples.find(r=>r.id===row.id);
    if(!confirmed||row.name!==confirmed.name||row.expectedOccupancy!==confirmed.expectedOccupancy||JSON.stringify(row.proposal)!==JSON.stringify(confirmed.proposal))throw Error(row.code+': finalized selection does not match the confirmed archive');
  }
  await readFile(path.join(site,entry.stem+'.html'));
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
for(const dir of ['assets/round11/original','assets/round11/proposal','assets/round11/highres','sources/round11','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round11/${id}-${group}.svg`,png:`assets/round11/${group}/${id}.png`,image:`assets/round11/${group}/${id}.webp`,highres:`assets/round11/highres/${id}-${group}.png`};
  for(const [key,bytes]of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]])await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
const rows=[],exportInspections={};
for(const [i,item]of items.entries()){
  const candidate=candidates.get(item.id),occupancy=feedback.presentationOccupancies[i];
  if(item.level!==i+1||candidate.name!==item.name||feedback.orderedNames[i]!==item.name)throw Error(item.id+': seasonal identity or order differs');
  if(candidate.expectedOccupancy!==occupancy||item.level<=5&&occupancy>.74)throw Error(item.id+': intended presentation size differs');
  const live=gameContent.items.find(r=>r.id===item.id);
  if(live?.name!==item.name||live.level!==item.level)throw Error(item.id+': actual game identity differs');
  const source=await readFile(path.join(root,item.original.source));
  if(hash(source)!==item.original.sourceSha256)throw Error(item.id+': original master changed');
  const original=await render(source,item.id+'-original',.8),proposal=await render(Buffer.from(candidate.svg),item.id+'-proposal',occupancy);
  const before=await save('original',item.id,original),after=await save('proposal',item.id,proposal);
  if(before.sha256.source===after.sha256.source||before.sha256.image===after.sha256.image)throw Error(item.id+': every item requires a fresh design');
  const code='SV'+String(item.level).padStart(2,'0');
  rows.push({index:i+1,code,id:item.id,name:item.name,oldName:item.name,nameChanged:false,chain:item.chain,group:'时蔬',level:item.level,status:'CANDIDATE',statusLabel:'全新设计 · 待你选用',selection:'candidate',changeType:'redesign',expectedOccupancy:occupancy,priorExpectedOccupancy:.8,sourceLabel:'时蔬链独立新绘，原版保留比较；由你决定采用',reason:candidate.reason,design:candidate.design,authoringSource:'artwork/plan4-food/round11/'+(item.level<=4?'seasonal-front.mjs':'seasonal-tail.mjs'),original:before,proposal:after});
  exportInspections[code]=proposal.inspection;
}
if(new Set(rows.map(r=>r.id)).size!==8||new Set(rows.map(r=>r.proposal.sha256.source)).size!==8||new Set(rows.map(r=>r.proposal.sha256.image)).size!==8)throw Error('All eight identities and artworks must remain unique');
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.name,r.proposal.sha256.source,r.proposal.sha256.image,r.expectedOccupancy]))).slice(0,12);
for(const row of rows){row.sourceReviewId=reviewId;row.sourceTargetId=row.id;}
async function contact(items,size,mode){
  const compare=mode==='proposals',cols=compare?2:4,cw=compare?320:156,ch=compare?176:158,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${compare?'时蔬8项 / 原版与新版对照':'时蔬整链 / 八张全新候选'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'每组左：原版　右：新版；采用由你决定':'清晰细描边 · 前五级控制体量 · 原版保留比较'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+116}" text-anchor="middle" font-size="10" fill="${j?'#4b714a':'#7a6b56'}">${j?'新版候选':'原版'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+137}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    if(!compare)texts.push(`<text x="${x+cw/2}" y="${y+153}" text-anchor="middle" font-size="9" fill="#84745f">新版待选用</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round11-${mode}-${size}.png`;
  await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));
  return {size,path:filename};
}
const contacts={proposals:[],chains:[]};for(const size of [40,96]){contacts.proposals.push(await contact(rows,size,'proposals'));contacts.chains.push(await contact(rows,size,'chain'));}
const counts={total:8,candidates:8,accepted:0};
const checks={originalSourcesUnchanged:8,previousConfirmedSourcesAndExportsByteIdentical:18,previousConfirmedSizesPreserved:true,previousFinalizedChainCounts:{poultry:8,spice:10},freshAlternatives:8,unchangedIngredientIdentities:8,newRecipeOrNameChanges:0,transparentPadding:true,actualGameContentUnchanged:true,actualContentSha256:hash(contentBytes),uniqueIdentities:8,uniqueSources:8,uniqueRenderedImages:8,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 时蔬全项新一轮',round:11,reviewId,status:'SEASONAL_8_CANDIDATES_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,authoringPolicy:feedback.authoringPolicy,sizePolicy:feedback.sizePolicy,orderedNames:feedback.orderedNames,counts,previousFinalReviews:feedback.previousFinalReviews,checks,exportInspections,contacts,samples:rows};
await writeFile(path.join(site,'round11.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round11.html'),'utf8');
if(!template.includes('/*__ROUND11_DATA__*/'))throw Error('Round 11 template has no data marker');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND11_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks,url:'http://127.0.0.1:5284/'},null,2));

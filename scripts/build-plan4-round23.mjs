import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { teaFrontCandidates } from '../artwork/plan4-food/round23/tea-front.mjs';
import { teaTailCandidates } from '../artwork/plan4-food/round23/tea-tail.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round23-feedback.json'),'utf8'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
await access(path.join(archive,'round22.json'));
const previous=JSON.parse(await readFile(path.join(archive,'round22.json'),'utf8'));
const coffeeFinal=JSON.parse(await readFile(path.join(site,'coffee-final.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||coffeeFinal.sourceReviewId!==feedback.sourceReviewId||coffeeFinal.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Coffee confirmation must precede tea review');
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const content=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(content)!==feedback.actualContentSha256)throw Error('Actual game content changed');
const candidates=new Map([...teaFrontCandidates,...teaTailCandidates].map(x=>[x.id,x]));
if(candidates.size!==6)throw Error('Six tea candidates required');
function bounds(data,info){
  let left=info.width,top=info.height,right=-1,bottom=-1,edge=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    const a=data[(y*info.width+x)*4+3];
    if(x===0||y===0||x===info.width-1||y===info.height-1)edge=Math.max(edge,a);
    if(a<=16)continue;
    left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<left)throw Error('Empty artwork');
  return {left,top,width:right-left+1,height:bottom-top+1,edge};
}
function validate(svg,id){
  if(/<(?:image|script|foreignObject)\b|(?:href|src)\s*=|data:/i.test(svg))throw Error(id+': SVG must be self-contained');
  const ids=[...svg.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)throw Error(id+': duplicate SVG definition');
  for(const m of svg.matchAll(/url\(["']?#([^)'"\s]+)["']?\)/g))if(!ids.includes(m[1]))throw Error(id+': missing definition');
  const box=svg.match(/\bviewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
  if(!box||box.length!==4||box.some(v=>!Number.isFinite(v))||box[2]<=0||box[3]<=0)throw Error(id+': invalid viewBox');
  return box;
}
async function inspect(bytes,size,id,expected){
  const meta=await sharp(bytes).metadata();
  if(meta.width!==size||meta.height!==size||!meta.hasAlpha)throw Error(id+': export dimensions or alpha differ');
  const raw=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  const occupancy=Math.max(b.width,b.height)/size;
  if(b.edge||Math.abs(occupancy-expected)>.006)throw Error(id+': occupancy differs '+occupancy);
  return {occupancy,bounds:b};
}
async function render(source,id,occupancy){
  const svg=source.toString('utf8'),box=validate(svg,id);
  const raw=await sharp(source).resize(1024,1024).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  if(b.edge)throw Error(id+': source touches edge');
  const side=Math.max(b.width/1024*box[2],b.height/1024*box[3])/occupancy;
  const cx=box[0]+(b.left+b.width/2)/1024*box[2],cy=box[1]+(b.top+b.height/2)/1024*box[3];
  const fitted=svg.replace(/(<svg\b[^>]*\bviewBox\s*=\s*)["'][^"']+["']/,'$1"'+[cx-side/2,cy-side/2,side,side].map(v=>v.toFixed(6)).join(' ')+'"');
  const highres=await sharp(Buffer.from(fitted)).resize(1024,1024).png().toBuffer(),png=await sharp(highres).resize(512,512).png().toBuffer(),webp=await sharp(png).webp({lossless:true,effort:6}).toBuffer();
  return {source,png,webp,highres,inspection:{png:await inspect(png,512,id,occupancy),webp:await inspect(webp,512,id,occupancy),highres:await inspect(highres,1024,id,occupancy)}};
}
async function archivedArtwork(asset,occupancy,id,base){
  const art={};
  for(const [key,field]of [['source','source'],['png','png'],['webp','image'],['highres','highres']]){
    art[key]=await readFile(path.join(base,asset[field]));
    if(hash(art[key])!==asset.sha256[field])throw Error(id+': archived asset changed');
  }
  validate(art.source.toString('utf8'),id);
  for(const [key,size]of [['png',512],['webp',512],['highres',1024]])await inspect(art[key],size,id,occupancy);
  return art;
}
for(const dir of ['assets/round23/original','assets/round23/proposal','assets/round23/highres','sources/round23','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round23/${id}-${group}.svg`,png:`assets/round23/${group}/${id}.png`,image:`assets/round23/${group}/${id}.webp`,highres:`assets/round23/highres/${id}-${group}.png`};
  const bytes={source:art.source,png:art.png,image:art.webp,highres:art.highres};
  for(const key of Object.keys(files))await writeFile(path.join(site,files[key]),bytes[key]);
  return {...files,sha256:Object.fromEntries(Object.entries(bytes).map(([k,b])=>[k,hash(b)]))};
}
const previousFinalReviews=[...previous.previousFinalReviews,{chain:'fresh-coffee',reviewId:coffeeFinal.reviewId,stem:'coffee-final',count:9}];
let fixedCount=0;
for(const entry of [...previousFinalReviews,{reviewId:'3106315e39b7',stem:'round2-final',count:14},{reviewId:'d978fdf8f32e',stem:'beast-final',count:10}]){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  if(final.reviewId!==entry.reviewId||final.samples.length!==entry.count)throw Error('Fixed inventory differs: '+entry.stem);
  for(const row of final.samples){
    const asset=row.proposal;
    for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(site,asset[key])))!==asset.sha256[key])throw Error(row.code+': fixed asset changed');
    fixedCount++;
  }
}
if(fixedCount!==88)throw Error('Fixed artwork count differs');
let retainedCount=0;
for(const chain of [baseline.plannedMilkChain,baseline.plannedExoticChain])for(const row of chain.slots){
  const a=row.artwork;
  for(const [file,digest]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error('Retained milk or fruit changed');
  retainedCount++;
}
if(retainedCount!==15)throw Error('Retained milk or fruit scope differs');
const rows=coffeeFinal.samples.map((r,i)=>({...r,index:i+1,original:r.proposal,proposal:r.proposal,status:'ACCEPTED',statusLabel:'用图与尺寸已确认',displayLabel:'已确认选用',changeType:'unchanged'}));
const teaItems=baseline.items.filter(r=>r.chain===feedback.nextChain),exportInspections={};
const greenBase=path.join(output,'checkpoints',feedback.originalGreenTeaReviewId,'site');
const greenManifest=JSON.parse(await readFile(path.join(greenBase,'samples.json'),'utf8'));
const green=greenManifest.samples.find(r=>r.id==='fresh-tea-2');
if(!green||green.selection!=='original')throw Error('Previously selected original green tea missing');
for(const [i,item]of teaItems.entries()){
  const candidate=candidates.get(item.id),occupancy=feedback.teaOccupancies[i],code='TE'+String(i+1).padStart(2,'0');
  if(item.level!==i+1||candidate?.name!==item.name||candidate.expectedOccupancy!==occupancy||feedback.orderedTeaNames[i]!==item.name)throw Error('Tea identity differs');
  const source=await readFile(path.join(root,item.original.source));
  if(hash(source)!==item.original.sourceSha256)throw Error('Original tea master changed');
  let originalArt;
  if(i===1){
    const asset={source:green.source,png:green.png,image:green.after,highres:green.highres,sha256:{source:green.sha256.source,png:green.sha256.png512,image:green.sha256.webp512,highres:green.sha256.highres}};
    originalArt=await archivedArtwork(asset,.8,code,greenBase);
    if(hash(originalArt.source)!==hash(source))throw Error('Original green tea source drift');
  }else originalArt=await render(source,code+'-original',.8);
  const art=await render(Buffer.from(candidate.svg),code+'-new',occupancy),original=await save('original',item.id,originalArt),proposal=await save('proposal',item.id,art);
  if(original.sha256.source===proposal.sha256.source||original.sha256.image===proposal.sha256.image)throw Error('Every tea item needs a new candidate');
  rows.push({index:rows.length+1,code,id:item.id,name:item.name,oldName:item.name,nameChanged:false,chain:item.chain,group:'茶饮',level:item.level,status:'CANDIDATE',statusLabel:i===1?'原版已选用 · 新稿另供选择':'全新设计 · 待你选择',displayLabel:'新版候选 · 待选',selection:'candidate',artworkStatus:'TEA_CANDIDATE_PENDING',artworkSelection:'candidate',changeType:'redesign',expectedOccupancy:occupancy,priorExpectedOccupancy:.8,sourceLabel:i===1?'绿茶437既定原版全档保留，本轮新稿单独待选':'V4原版保留，本轮另绘新版供选择',reason:candidate.reason,design:candidate.design,authoringSource:'artwork/plan4-food/round23/'+(i<3?'tea-front.mjs':'tea-tail.mjs'),...(i===1?{baselineAcceptedReviewId:feedback.originalGreenTeaReviewId,baselineSelectionPreserved:true}:{}),original,proposal});
  exportInspections[code]=art.inspection;
}
if(rows.length!==15||teaItems.length!==6)throw Error('Round 23 scope differs');
if(new Set(rows.map(r=>r.proposal.sha256.source)).size!==15||new Set(rows.map(r=>r.proposal.sha256.image)).size!==15)throw Error('Duplicate artwork');
const counts={total:15,candidates:6,accepted:9};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
async function contact(items,size,mode){
  const compare=mode==='proposals',cols=compare?3:mode==='selected'?5:3,cw=compare?300:180,ch=compare?180:158,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const titles={proposals:'茶饮 / 六项原版与新版对照',candidates:'茶饮 / 六张全新美术',tea:'茶饮整链 / 六项新版候选',coffee:'咖啡整链 / 九项已确认选用',selected:'茶饮与咖啡 / 两链总览'};
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${titles[mode]} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：原版；右：本轮新版，由你决定采用':'清楚细深描边 · 前五级控制体量 · 既定咖啡保持'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+118}" text-anchor="middle" font-size="10">${j?'新版候选':row.baselineAcceptedReviewId?'原版 · 已选用':'原版'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+139}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    if(!compare)texts.push(`<text x="${x+cw/2}" y="${y+154}" text-anchor="middle" font-size="9" fill="#84745f">${xml(row.displayLabel)}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round23-${mode}-${size}.png`;
  await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));
  return {size,path:filename};
}
const contacts={proposals:[],candidates:[],tea:[],coffee:[],selected:[]};
for(const size of [40,96])for(const [mode,items]of [['proposals',rows.filter(r=>r.status==='CANDIDATE')],['candidates',rows.filter(r=>r.status==='CANDIDATE')],['tea',rows.filter(r=>r.chain==='fresh-tea')],['coffee',rows.filter(r=>r.chain==='fresh-coffee')],['selected',rows]])contacts[mode].push(await contact(items,size,mode));
const checks={confirmedCoffeeSourcesAndExportsByteIdentical:9,totalFixedSourceAndExportsByteIdentical:88,previousFixedCrossChainArtworks:55,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,newTeaDesigns:6,teaOriginalSourcesUnchanged:6,originalGreenTeaSourceAndExportsByteIdentical:true,actualGameContentUnchanged:true,actualContentSha256:hash(content),actualGameNameChanges:0,actualRecipeChanges:0,ingredientIdsAndLevelsPreserved:15,transparentPadding:true,uniqueSources:15,uniqueRenders:15,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 茶饮新一轮',round:23,reviewId,status:'SIX_TEA_CANDIDATES_PENDING_COFFEE_CONFIRMED',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,counts,previousFinalReviews,confirmedCoffeeReviewId:coffeeFinal.reviewId,contacts,checks,exportInspections,samples:rows};
await writeFile(path.join(site,'round23.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round23.html'),'utf8');
if(!template.includes('/*__ROUND23_DATA__*/'))throw Error('Round 23 data marker missing');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND23_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,field='proposal')=>({source:'output/plan4-food-review/site/'+r[field].source,preview512:'output/plan4-food-review/site/'+r[field].image,highres:'output/plan4-food-review/site/'+r[field].highres,sha256:r[field].sha256});
baseline.currentReview={round:23,reviewId,status:manifest.status,scope:feedback.scope,counts,manifest:'output/plan4-food-review/site/round23.json',url:'http://127.0.0.1:5284/',feedbackSource:'artwork/plan4-food/round23-feedback.json',checks,sizePolicy:feedback.sizePolicy};
baseline.plannedTeaChain={status:'SIX_TEA_CANDIDATES_PENDING',reviewId,manifest:'output/plan4-food-review/site/round23.json',counts:{total:6,candidates:6},slots:rows.filter(r=>r.chain==='fresh-tea').map(r=>({id:r.id,code:r.code,name:r.name,level:r.level,status:r.status,expectedOccupancy:r.expectedOccupancy,baselineArtwork:artRef(r,'original'),artwork:artRef(r)}))};
for(const row of rows.filter(r=>r.chain==='fresh-tea')){
  const item=baseline.items.find(x=>x.id===row.id);
  item.latestReview={reviewId,code:row.code,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};
  item.proposal={reviewId,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};
}
await writeFile(path.join(output,'material-baseline.json'),JSON.stringify(baseline,null,2)+'\n');
await mkdir(path.join(root,'output/plan4-round23-work'),{recursive:true});
await writeFile(path.join(root,'output/plan4-round23-work/checks.json'),JSON.stringify({reviewId,counts,confirmedCoffeeReviewId:coffeeFinal.reviewId,checks,exportInspections,humanNewArtworkAcceptance:'PENDING_SIX_TEA_CANDIDATES'},null,2)+'\n');
console.log(JSON.stringify({reviewId,status:manifest.status,counts,coffeeReviewId:coffeeFinal.reviewId,checks,url:'http://127.0.0.1:5284/'},null,2));

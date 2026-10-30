import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, cp, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { coffeeFrontCandidates } from '../artwork/plan4-food/round21/coffee-front.mjs';
import { coffeeMidCandidates } from '../artwork/plan4-food/round21/coffee-mid.mjs';
import { coffeeTailCandidates } from '../artwork/plan4-food/round21/coffee-tail.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round21-feedback.json'),'utf8'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
try{await access(path.join(archive,'round20.json'));}catch{const live=JSON.parse(await readFile(path.join(site,'round20.json'),'utf8'));if(live.reviewId!==feedback.sourceReviewId)throw Error('Source review differs');await cp(site,archive,{recursive:true,errorOnExist:true,force:false});}
const previous=JSON.parse(await readFile(path.join(archive,'round20.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==18)throw Error('Round 20 archive incomplete');
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const content=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(content)!==feedback.actualContentSha256)throw Error('Actual game content changed');
const candidates=new Map([...coffeeFrontCandidates,...coffeeMidCandidates,...coffeeTailCandidates].map(x=>[x.id,x]));
if(candidates.size!==9)throw Error('Nine coffee candidates required');
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

async function archivedArtwork(asset,occupancy,id,base=archive){
  const art={};
  for(const [key,field,digest]of [['source','source','source'],['png','png','png'],['webp','image','image'],['highres','highres','highres']]){
    art[key]=await readFile(path.join(base,asset[field]));if(hash(art[key])!==asset.sha256[digest])throw Error(id+': archived artwork differs');
  }
  validate(art.source.toString('utf8'),id);
  for(const [key,size]of [['png',512],['webp',512],['highres',1024]])await inspect(art[key],size,id,occupancy);
  return art;
}

for(const dir of ['assets/round21/original','assets/round21/proposal','assets/round21/highres','sources/round21','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round21/${id}-${group}.svg`,png:`assets/round21/${group}/${id}.png`,image:`assets/round21/${group}/${id}.webp`,highres:`assets/round21/highres/${id}-${group}.png`};
  for(const [key,bytes]of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]])await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
const sweetRows=[];
for(const old of previous.samples.filter(r=>r.chain==='fresh-sweet')){
  const variant='proposal',asset=old.proposal;
  if(!feedback.selectedNewSweetCodes.includes(old.code))throw Error('Unspecified sweet selection');
  await archivedArtwork(asset,old.expectedOccupancy,old.code);
  const {baselineAcceptedReviewId,baselineSelectionPreserved,...prior}=old;
  sweetRows.push({...prior,index:sweetRows.length+1,status:'ACCEPTED',statusLabel:'新版用图与尺寸已确认',displayLabel:'新版 · 已确认',selection:'selected',artworkSelection:'round20-new',artworkStatus:'ARTWORK_SELECTED',changeType:'unchanged',reason:'按本次选择采用第20轮新版，source及所有导出逐字节保持。',sourceLabel:'第20轮新版已采用，源稿与各档导出精确保持',sourceReviewId:feedback.sourceReviewId,sourceTargetId:old.id,selectedFromReviewId:feedback.sourceReviewId,confirmedPresentationReviewId:feedback.sourceReviewId,sourceSelection:{reviewId:feedback.sourceReviewId,variant,sha256:asset.sha256},sourceOrigin:'ROUND20_SELECTED_NEW',original:asset,proposal:asset});
}
if(sweetRows.length!==9||feedback.selectedNewSweetCodes.length!==9)throw Error('Sweet selected scope differs');
const sweetReviewId=hash(JSON.stringify(['sweet-final',sweetRows.map(r=>[r.id,r.proposal.sha256,r.expectedOccupancy])])).slice(0,12);
const sweetFinal={title:'糖果甜料 · 已确认选用',reviewId:sweetReviewId,sourceReviewId:feedback.sourceReviewId,status:'ALL_ARTWORK_AND_PRESENTATION_CONFIRMED',userQuote:feedback.userQuote,chain:'fresh-sweet',counts:{total:9,accepted:9,selectedNew:9,selectedOriginal:0},checks:{selectedSourceAndExportsByteIdentical:9,actualGameContentUnchanged:true},samples:sweetRows};
await writeFile(path.join(site,'sweet-final.json'),JSON.stringify(sweetFinal,null,2)+'\n');
const finalStyle=(await readFile(path.join(site,'seasonal-final.html'),'utf8')).match(/<style>([\s\S]*?)<\/style>/)[1];
await writeFile(path.join(site,'sweet-final.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>鹅巷食光 · 糖果甜料已确认选用</title><style>${finalStyle}</style><main><nav><a href="index.html">← 当前审阅</a><a href="sea-final.html">海鲜已确认</a><a href="seasonal-final.html">时蔬已确认</a></nav><h1>糖果甜料 · 用图与尺寸已确认</h1><p>SW01—SW09全部采用第20轮新版。前五级主体最长边约66%／68%／70%／68%／70%，高阶80%；选中源稿与各档导出原字节保持。</p><div class="grid">${sweetRows.map(r=>`<article><a href="${r.proposal.highres}" target="_blank" rel="noopener"><img src="${r.proposal.image}" alt="${xml(r.name)}" width="96" height="96"></a><h2>${r.code} · ${xml(r.name)}</h2><p>${xml(r.displayLabel)} · 主体约${Math.round(r.expectedOccupancy*100)}%</p><a href="${r.proposal.source}" target="_blank" rel="noopener">SVG母稿</a> · <a href="${r.proposal.highres}" target="_blank" rel="noopener">1024px大图</a></article>`).join('')}</div><footer>糖果甜料9项固定摘要 · ${sweetReviewId} · <a href="sweet-final.json">来源清单</a></footer></main></html>`);
const previousFinalReviews=[...previous.previousFinalReviews,{chain:'fresh-sweet',reviewId:sweetReviewId,stem:'sweet-final',count:9}];
let fixedCount=0;
for(const entry of previousFinalReviews){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  if(final.reviewId!==entry.reviewId||final.samples.length!==entry.count||final.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Fixed inventory differs');
  for(const row of final.samples){for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(site,row.proposal[key])))!==row.proposal.sha256[key]||hash(await readFile(path.join(archive,row.proposal[key])))!==row.proposal.sha256[key])throw Error(row.code+': fixed artwork changed');fixedCount++;}
}
if(fixedCount!==55)throw Error('Fixed cross-chain count differs');
let milkKept=0,fruitKept=0;
for(const row of baseline.plannedMilkChain.slots){const a=row.artwork;for(const [file,digest]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error('Current milk artwork changed');milkKept++;}
for(const row of baseline.plannedExoticChain.slots){const a=row.artwork;for(const [file,digest]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error('Current fruit artwork changed');fruitKept++;}
if(milkKept!==7||fruitKept!==8)throw Error('Retained milk or fruit count differs');
const rows=sweetRows.map(r=>({...r,index:sweetRows.indexOf(r)+1})),exportInspections={};
const coffeeItems=baseline.items.filter(r=>r.chain===feedback.nextChain);
const espressoArchive=path.join(output,'checkpoints',feedback.originalEspressoReviewId,'site');
const espressoReview=JSON.parse(await readFile(path.join(espressoArchive,'samples.json'),'utf8')),espresso=espressoReview.samples.find(r=>r.id==='fresh-coffee-2');
if(!espresso||espresso.selection!=='original')throw Error('Previously selected original espresso is missing');
for(const [i,item]of coffeeItems.entries()){
  const candidate=candidates.get(item.id),occupancy=feedback.coffeeOccupancies[i],code='CF'+String(i+1).padStart(2,'0');
  if(item.level!==i+1||candidate?.name!==item.name||candidate.expectedOccupancy!==occupancy||feedback.orderedCoffeeNames[i]!==item.name)throw Error('Coffee candidate identity differs');
  const source=await readFile(path.join(root,item.original.source));if(hash(source)!==item.original.sourceSha256)throw Error('Original coffee master changed');
  let originalArt;
  if(i===1){const asset={source:espresso.source,png:espresso.png,image:espresso.after,highres:espresso.highres,sha256:{source:espresso.sha256.source,png:espresso.sha256.png512,image:espresso.sha256.webp512,highres:espresso.sha256.highres}};originalArt=await archivedArtwork(asset,.8,code,espressoArchive);if(hash(originalArt.source)!==hash(source))throw Error('Original espresso source drift');}
  else originalArt=await render(source,code+'-original',.8);
  const art=await render(Buffer.from(candidate.svg),code+'-new',occupancy),original=await save('original',item.id,originalArt),proposal=await save('proposal',item.id,art);
  if(original.sha256.source===proposal.sha256.source||original.sha256.image===proposal.sha256.image)throw Error('Every coffee ingredient needs new artwork');
  rows.push({index:rows.length+1,code,id:item.id,name:item.name,oldName:item.name,nameChanged:false,chain:item.chain,group:'咖啡',level:item.level,status:'CANDIDATE',statusLabel:i===1?'原版已选用 · 新稿另供选择':'全新设计 · 待你选择',displayLabel:'新版候选 · 待选',selection:'candidate',artworkStatus:'COFFEE_CANDIDATE_PENDING',artworkSelection:'candidate',changeType:'redesign',expectedOccupancy:occupancy,priorExpectedOccupancy:.8,sourceLabel:i===1?'浓缩咖啡437原版既定来源全档保留，新稿单独待选':'V4原版保留，本轮另绘新版供选择',reason:candidate.reason,design:candidate.design,authoringSource:'artwork/plan4-food/round21/'+(i<3?'coffee-front.mjs':i<6?'coffee-mid.mjs':'coffee-tail.mjs'),...(i===1?{baselineAcceptedReviewId:feedback.originalEspressoReviewId,baselineSelectionPreserved:true}:{}),original,proposal});
  exportInspections[code]=art.inspection;
}
if(rows.length!==18||coffeeItems.length!==9||rows.filter(r=>r.status==='CANDIDATE').length!==9)throw Error('Round 21 scope differs');
const counts={total:18,candidates:9,accepted:9};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
for(const row of rows){row.sourceReviewId=reviewId;row.sourceTargetId=row.id;}
async function contact(items,size,mode){
  const compare=mode==='proposals',cols=compare?3:mode==='selected'?6:3,cw=compare?300:180,ch=compare?180:158,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const titles={proposals:'咖啡 / 九项原版与新版对照',candidates:'咖啡 / 九张全新美术',coffee:'咖啡整链 / 九项新版候选',sweet:'糖果甜料整链 / 九项已采用新版',selected:'糖果甜料与咖啡 / 两链总览'};
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${titles[mode]} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：原版；右：本轮新版，由你决定采用':'细深色描边 · 前五级控制体量 · 咖啡新稿待你选择'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+118}" text-anchor="middle" font-size="10">${j?'新版候选':row.baselineAcceptedReviewId?'原版 · 已选用':'原版'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+139}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    if(!compare)texts.push(`<text x="${x+cw/2}" y="${y+154}" text-anchor="middle" font-size="9" fill="#84745f">${xml(row.status==='CANDIDATE'?'新版候选 · 待选择':row.displayLabel)}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round21-${mode}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={proposals:[],candidates:[],coffee:[],sweet:[],selected:[]};for(const size of [40,96])for(const [mode,items]of [['proposals',rows.filter(r=>r.status==='CANDIDATE')],['candidates',rows.filter(r=>r.status==='CANDIDATE')],['coffee',rows.filter(r=>r.chain==='fresh-coffee')],['sweet',rows.filter(r=>r.chain==='fresh-sweet')],['selected',rows]])contacts[mode].push(await contact(items,size,mode));
const checks={selectedNewSweetSourcesAndExportsByteIdentical:9,confirmedSweetArtworks:9,totalFixedSourceAndExportsByteIdentical:55,previousFixedSourceAndExportsByteIdentical:46,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,milkCurrentPositionRetained:true,newCoffeeDesigns:9,coffeeOriginalSourcesUnchanged:9,originalEspressoSourceAndExportsByteIdentical:true,actualGameContentUnchanged:true,actualContentSha256:hash(content),actualGameNameChanges:0,actualRecipeChanges:0,ingredientIdentitiesPreserved:18,transparentPadding:true,uniqueSources:new Set(rows.map(r=>r.proposal.sha256.source)).size,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 咖啡新一轮',round:21,reviewId,status:'NINE_COFFEE_CANDIDATES_PENDING_SWEET_SELECTIONS_CONFIRMED',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,milkPositionAcceptanceNote:feedback.milkPositionAcceptanceNote,counts,previousFinalReviews,confirmedSweetReviewId:sweetReviewId,contacts,checks,exportInspections,samples:rows};
await writeFile(path.join(site,'round21.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round21.html'),'utf8');if(!template.includes('/*__ROUND21_DATA__*/'))throw Error('Round 21 template marker missing');await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND21_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,field='proposal')=>({source:'output/plan4-food-review/site/'+r[field].source,preview512:'output/plan4-food-review/site/'+r[field].image,highres:'output/plan4-food-review/site/'+r[field].highres,sha256:r[field].sha256});
baseline.currentReview={round:21,reviewId,status:manifest.status,scope:feedback.scope,counts,manifest:'output/plan4-food-review/site/round21.json',url:'http://127.0.0.1:5284/',feedbackSource:'artwork/plan4-food/round21-feedback.json',checks,sizePolicy:feedback.sizePolicy};
baseline.finalizedSweetReview={reviewId:sweetReviewId,sourceReviewId:feedback.sourceReviewId,status:sweetFinal.status,count:9,manifest:'output/plan4-food-review/site/sweet-final.json',url:'http://127.0.0.1:5284/sweet-final.html'};
baseline.plannedSweetChain={status:sweetFinal.status,reviewId:sweetReviewId,manifest:'output/plan4-food-review/site/sweet-final.json',counts:{total:9,accepted:9,selectedNew:9,selectedOriginal:0,candidates:0},slots:sweetRows.map(r=>({id:r.id,code:r.code,name:r.name,level:r.level,status:'ACCEPTED',selectedVariant:r.sourceSelection.variant,expectedOccupancy:r.expectedOccupancy,artwork:artRef(r)}))};
baseline.plannedCoffeeChain={status:'NINE_COFFEE_CANDIDATES_PENDING',reviewId,manifest:'output/plan4-food-review/site/round21.json',counts:{total:9,candidates:9},slots:rows.filter(r=>r.chain==='fresh-coffee').map(r=>({id:r.id,code:r.code,name:r.name,level:r.level,status:r.status,expectedOccupancy:r.expectedOccupancy,baselineArtwork:artRef(r,'original'),artwork:artRef(r)}))};
for(const row of rows){const item=baseline.items.find(x=>x.id===row.id);if(!item)continue;item.latestReview={reviewId,code:row.code,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={reviewId,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};if(row.chain==='fresh-sweet')item.selectedArtwork={reviewId:feedback.sourceReviewId,userAcceptedArtwork:true,presentationStatus:'CONFIRMED',selectedVariant:row.sourceSelection.variant,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};}
await writeFile(path.join(output,'material-baseline.json'),JSON.stringify(baseline,null,2)+'\n');
const acceptedFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=JSON.parse(await readFile(acceptedFile,'utf8'));
const entry={reviewId:feedback.sourceReviewId,date:feedback.date,userQuote:feedback.userQuote,status:'NINE_SWEETS_SELECTED_NEXT_COFFEE',selectedNewCodes:feedback.selectedNewSweetCodes,selectedOriginalCodes:[],selectedArtwork:sweetRows.map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:r.sourceSelection,expectedOccupancy:r.expectedOccupancy})),finalizedSweetReviewId:sweetReviewId,milkPositionAcceptanceNote:feedback.milkPositionAcceptanceNote,nextCandidateChain:'fresh-coffee',nextReviewId:reviewId};
const at=book.reviews.findIndex(x=>x.reviewId===feedback.sourceReviewId);if(at<0)book.reviews.push(entry);else book.reviews[at]=entry;await writeFile(acceptedFile,JSON.stringify(book,null,2)+'\n');
await mkdir(path.join(root,'output/plan4-round21-work'),{recursive:true});await writeFile(path.join(root,'output/plan4-round21-work/checks.json'),JSON.stringify({reviewId,counts,confirmedSweetReviewId:sweetReviewId,checks,exportInspections,humanNewArtworkAcceptance:'PENDING_NINE_COFFEES'},null,2)+'\n');
console.log(JSON.stringify({reviewId,status:manifest.status,counts,sweetReviewId,checks,url:'http://127.0.0.1:5284/'},null,2));

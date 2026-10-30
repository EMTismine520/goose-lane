import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, cp, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { seaCodRedesign } from '../artwork/plan4-food/round16/scallop.mjs';
import { seaCatfishRedesign } from '../artwork/plan4-food/round16/seabream.mjs';
import { seaCrabRedesign } from '../artwork/plan4-food/round16/mudcrab.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round16-feedback.json'),'utf8'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
try { await access(path.join(archive,'round15.json')); }
catch { const current=JSON.parse(await readFile(path.join(site,'round15.json'),'utf8'));if(current.reviewId!==feedback.sourceReviewId)throw Error('Round 15 source differs');await cp(site,archive,{recursive:true,errorOnExist:true,force:false}); }
const previous=JSON.parse(await readFile(path.join(archive,'round15.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==19)throw Error('Round 15 archive incomplete');
const content=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(content)!==feedback.actualContentSha256)throw Error('Actual game content changed');
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const candidates=new Map([seaCodRedesign,seaCatfishRedesign,seaCrabRedesign].map(x=>[x.id,x]));
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

for(const dir of ['assets/round16/original','assets/round16/proposal','assets/round16/highres','sources/round16','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round16/${id}-${group}.svg`,png:`assets/round16/${group}/${id}.png`,image:`assets/round16/${group}/${id}.webp`,highres:`assets/round16/highres/${id}-${group}.png`};
  for(const [key,bytes]of [['source',art.source],['png',art.png],['image',art.webp],['highres',art.highres]])await writeFile(path.join(site,files[key]),bytes);
  return {...files,sha256:{source:hash(art.source),png:hash(art.png),image:hash(art.webp),highres:hash(art.highres)}};
}
async function archivedArtwork(asset,occupancy,id){
  const art={};
  for(const [key,field]of [['source','source'],['png','png'],['webp','image'],['highres','highres']]){
    art[key]=await readFile(path.join(archive,asset[field]));
    if(hash(art[key])!==asset.sha256[field])throw Error(id+': archived bytes differ');
  }
  validate(art.source.toString('utf8'),id);
  for(const [key,size]of [['png',512],['webp',512],['highres',1024]])await inspect(art[key],size,id,occupancy);
  return art;
}
let preservedPrevious=0;
for(const entry of previous.previousFinalReviews){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  if(final.reviewId!==entry.reviewId||final.samples.length!==entry.count)throw Error('Confirmed inventory changed');
  for(const row of final.samples){
    for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(site,row.proposal[key])))!==row.proposal.sha256[key]||hash(await readFile(path.join(archive,row.proposal[key])))!==row.proposal.sha256[key])throw Error(row.code+': confirmed export changed');
    preservedPrevious++;
  }
}
if(preservedPrevious!==26)throw Error('Confirmed cross-chain scope differs');
const rows=[],exportInspections={},sizeAdjustments=[];
let retainedFruit=0,preservedSelected=0,preservedSeaSources=0;
for(const old of previous.samples){
  const candidate=candidates.get(old.id),accepted=feedback.acceptedNewCodes.includes(old.code),fruit=old.chain==='fresh-exotic';
  const occupancy=fruit?old.expectedOccupancy:feedback.seaOccupancies[old.level-1];
  const status=candidate?'CANDIDATE':accepted?'ACCEPTED':'RETAINED';
  let selected,original,sourceNote;
  if(fruit||accepted){
    selected=await archivedArtwork(old.proposal,old.expectedOccupancy,old.code);
    original=selected;
    if(accepted)preservedSelected++;else retainedFruit++;
    sourceNote=accepted?'第15轮明确采用的新稿，SVG和三档导出逐字节保持':'鲜果当前选用、显示尺寸与此前状态原样保持';
  }else{
    const currentOriginal=await archivedArtwork(old.original,.8,old.code+'-original');
    original=occupancy===.8?currentOriginal:await render(currentOriginal.source,old.code+'-original-sized',occupancy);
    if(hash(original.source)!==old.original.sha256.source)throw Error(old.code+': original master changed');
    preservedSeaSources++;
    selected=original;
    sourceNote=old.baselineAcceptedReviewId?'此前437细描边既定稿保留':'原版V4美术保留';
    if(occupancy!==.8){sizeAdjustments.push({code:old.code,from:.8,to:occupancy,sourceSha256:hash(original.source)});sourceNote+='，只控制显示尺寸';}
  }
  if(candidate){
    if(candidate.previousName!==old.name||feedback.candidateNames[old.code]!==candidate.name||candidate.expectedOccupancy!==occupancy)throw Error('Replacement candidate identity differs');
    selected=await render(Buffer.from(candidate.svg),old.code+'-redesign',occupancy);
    if(hash(selected.source)===old.proposal.sha256.source||hash(selected.source)===old.original.sha256.source)throw Error('Replacement needs independent artwork');
    sourceNote='原有食材保留对照；替换名称和新稿仅为本轮候选';
  }
  const before=await save('original',old.id,original),after=await save('proposal',old.id,selected);
  const {v4Original,...prior}=old;
  rows.push({...prior,index:rows.length+1,name:candidate?.name||old.name,oldName:old.name,nameChanged:Boolean(candidate),proposedName:candidate?.name,actualGameName:old.name,status,selection:status==='CANDIDATE'?'candidate':'selected',artworkSelection:candidate?'replacement-candidate':accepted?'round15-new':'original',artworkStatus:candidate?'REPLACEMENT_PENDING':accepted?'USER_ACCEPTED':'ORIGINAL_SELECTED',statusLabel:candidate?'食材替换方案 · 待你选择':accepted?'第15轮新版 · 已采用':fruit?'鲜果当前用图保持':'原有美术 · 保留',displayLabel:candidate?'替换候选 · 待选':accepted?'新版 · 已采用':fruit?'当前选用与大小保持':old.baselineAcceptedReviewId?'既定细描边稿 · 保留':'原版 · 保留',changeType:candidate?'replacement':accepted?'accepted':'retained',sourceLabel:sourceNote,reason:candidate?candidate.reason:sourceNote,design:candidate?candidate.design:accepted||fruit?old.design:undefined,expectedOccupancy:occupancy,priorExpectedOccupancy:fruit||accepted?old.expectedOccupancy:.8,previousReviewStatus:fruit?old.previousReviewStatus:old.status,original:before,proposal:after,...(accepted?{acceptedReviewId:feedback.sourceReviewId,acceptedSourceArtwork:old.proposal,userAcceptedNewArtwork:true}:{}),...(candidate?{authoringSource:'artwork/plan4-food/round16/'+(old.level===3?'scallop.mjs':old.level===4?'seabream.mjs':'mudcrab.mjs'),replacementTargetId:old.id,sourceOrigin:'ROUND16_REPLACEMENT_CANDIDATE'}:{})});
  exportInspections[old.code]=selected.inspection||{copiedByteIdentical:true,expectedOccupancy:occupancy};
}
if(rows.length!==19||preservedSelected!==3||retainedFruit!==7||preservedSeaSources!==9||candidates.size!==3)throw Error('Review selection scope differs');
const counts={total:19,candidates:3,accepted:3,retained:13};
for(const [status,count]of [['CANDIDATE',3],['ACCEPTED',3],['RETAINED',13]])if(rows.filter(r=>r.status===status).length!==count)throw Error('Review status count differs');
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.name,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
for(const row of rows){row.sourceReviewId=reviewId;row.sourceTargetId=row.id;}
async function contact(items,size,mode){
  const compare=mode==='proposals',cols=compare?3:mode==='candidates'?3:mode==='fruit'?4:6,cw=compare?320:156,ch=compare?180:158,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const titles={proposals:'海鲜重设计 / 原有食材与替换候选',candidates:'三张新稿 / 扇贝 · 鲷鱼 · 青蟹',fruit:'鲜果整链 / 桑葚新版已采用',sea:'海鲜整链 / 三新稿与已选用图'};
  const layers=[],texts=[`<text x="20" y="27" font-size="16" font-weight="700">${titles[mode]} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：原有食材；右：替换候选，由你决定采用':'细深色描边 · 前五级控制体量 · 三项新方案待选'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+118}" text-anchor="middle" font-size="11">${xml(j?'替换候选 · '+row.name:'原版 · '+row.oldName)}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+139}" text-anchor="middle" font-size="12">${xml(row.code+' · '+(compare?row.oldName+' → '+row.name:row.name))}</text>`);
    if(!compare)texts.push(`<text x="${x+cw/2}" y="${y+154}" text-anchor="middle" font-size="9" fill="#84745f">${xml(row.displayLabel)}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round16-${mode}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));return {size,path:filename};
}
const contacts={proposals:[],candidates:[],fruit:[],sea:[]};
for(const size of [40,96]){const pending=rows.filter(r=>r.status==='CANDIDATE');for(const [mode,items]of [['proposals',pending],['candidates',pending],['fruit',rows.filter(r=>r.chain==='fresh-exotic')],['sea',rows.filter(r=>r.chain==='fresh-sea')]])contacts[mode].push(await contact(items,size,mode));}
const checks={selectedRound15SourceAndExportsByteIdentical:preservedSelected,retainedFruitSourceAndExportsByteIdentical:retainedFruit,originalSeaSourcesPreserved:preservedSeaSources,previousConfirmedSourceAndExportsByteIdentical:preservedPrevious,newReplacementCandidates:3,actualGameContentUnchanged:true,actualContentSha256:hash(content),actualGameNameChanges:0,actualRecipeChanges:0,proposedReplacementNames:3,ingredientIdsAndLevelsPreserved:19,transparentPadding:true,uniqueProposalSources:new Set(rows.map(r=>r.proposal.sha256.source)).size,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy])),sizeAdjustments};
const manifest={title:'鹅巷食光 · 三种海鲜重设计',round:16,reviewId,status:'THREE_NEW_ART_SELECTED_THREE_SEA_REPLACEMENTS_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,userCorrection:feedback.userCorrection,scope:feedback.scope,authoringPolicy:feedback.authoringPolicy,sizePolicy:feedback.sizePolicy,counts,previousFinalReviews:previous.previousFinalReviews,checks,exportInspections,contacts,samples:rows};
await writeFile(path.join(site,'round16.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round16.html'),'utf8');if(!template.includes('/*__ROUND16_DATA__*/'))throw Error('Round 16 template marker missing');await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND16_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=r=>({source:'output/plan4-food-review/site/'+r.proposal.source,preview512:'output/plan4-food-review/site/'+r.proposal.image,highres:'output/plan4-food-review/site/'+r.proposal.highres,sha256:r.proposal.sha256});
baseline.currentReview={round:16,reviewId,status:manifest.status,scope:feedback.scope,counts,manifest:'output/plan4-food-review/site/round16.json',url:'http://127.0.0.1:5284/',feedbackSource:'artwork/plan4-food/round16-feedback.json',acceptedSource:'artwork/plan4-food/accepted-reviews.json',checks,sizePolicy:feedback.sizePolicy};
baseline.plannedSeaChain={status:'TWO_NEW_SELECTED_SIX_ORIGINAL_RETAINED_THREE_REPLACEMENTS_PENDING',reviewId,manifest:'output/plan4-food-review/site/round16.json',counts:{total:11,acceptedNew:2,retainedOriginal:6,candidates:3},orderedNames:rows.filter(r=>r.chain==='fresh-sea').map(r=>r.name),replacementNamesAreProposals:true,slots:rows.filter(r=>r.chain==='fresh-sea').map(r=>({id:r.id,code:r.code,name:r.name,actualGameName:r.oldName,level:r.level,status:r.status,expectedOccupancy:r.expectedOccupancy,selectedArtwork:candidates.has(r.id)?{...r.original}:r.proposal,candidateArtwork:candidates.has(r.id)?r.proposal:undefined,artwork:artRef(r),acceptedReviewId:r.acceptedReviewId,baselineAcceptedReviewId:r.baselineAcceptedReviewId}))};
baseline.plannedExoticChain={...baseline.plannedExoticChain,status:'MULBERRY_ROUND15_NEW_ACCEPTED_OTHER_CURRENT_RESULTS_RETAINED',counts:{total:8,acceptedNew:1,retained:7,candidates:0},reviewId,manifest:'output/plan4-food-review/site/round16.json',slots:rows.filter(r=>r.chain==='fresh-exotic').map(r=>({id:r.id,code:r.code,name:r.name,level:r.level,status:r.status,previousReviewStatus:r.previousReviewStatus,acceptedReviewId:r.acceptedReviewId,expectedOccupancy:r.expectedOccupancy,artwork:artRef(r)}))};
for(const row of rows){const item=baseline.items.find(i=>i.id===row.id);if(!item)continue;item.latestReview={reviewId,code:row.code,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};if(row.status==='ACCEPTED'||row.chain==='fresh-sea'&&row.status==='RETAINED')item.selectedArtwork={reviewId:feedback.sourceReviewId,userAccepted:true,userAcceptedNew:row.status==='ACCEPTED',selection:row.status==='ACCEPTED'?'new':'original',artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};if(row.status==='CANDIDATE')item.proposal={reviewId,code:row.code,status:'REPLACEMENT_PENDING',proposedName:row.name,actualGameName:row.oldName,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};else item.proposal={reviewId,status:'SELECTED_NEW_OR_RETAINED_ORIGINAL',artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};}
await writeFile(path.join(output,'material-baseline.json'),JSON.stringify(baseline,null,2)+'\n');
const acceptedFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=JSON.parse(await readFile(acceptedFile,'utf8'));
const entry={reviewId:feedback.sourceReviewId,date:feedback.date,userQuote:feedback.userQuote,userCorrection:feedback.userCorrection,status:'THREE_NEW_SELECTED_SE10_ORIGINAL_THREE_REDESIGNS_REQUESTED',acceptedNewCodes:feedback.acceptedNewCodes,acceptedNewArtwork:rows.filter(r=>r.status==='ACCEPTED').map(r=>({targetId:r.id,code:r.code,name:r.name,sourceReviewId:feedback.sourceReviewId,sourceArtwork:r.acceptedSourceArtwork,expectedOccupancy:r.expectedOccupancy})),retainedOriginalSeaCodes:feedback.retainedSeaCodes,redesignRequestedCodes:feedback.redesignCodes,previousFruitPresentationAcceptance:'No new explicit acceptance inferred',nextReviewId:reviewId};
const entryIndex=book.reviews.findIndex(r=>r.reviewId===feedback.sourceReviewId);if(entryIndex<0)book.reviews.push(entry);else book.reviews[entryIndex]=entry;await writeFile(acceptedFile,JSON.stringify(book,null,2)+'\n');
await mkdir(path.join(root,'output/plan4-round16-work'),{recursive:true});await writeFile(path.join(root,'output/plan4-round16-work/checks.json'),JSON.stringify({reviewId,counts,checks,exportInspections,humanReplacementAcceptance:'PENDING_3'},null,2)+'\n');
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks,url:'http://127.0.0.1:5284/'},null,2));

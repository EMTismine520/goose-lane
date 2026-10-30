import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, access, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { citrusBlueCandidates } from '../artwork/plan4-food/round25/citrus-blue.mjs';
import { orangeCoconutCandidates } from '../artwork/plan4-food/round25/orange-coconut.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=JSON.parse(await readFile(path.join(root,'artwork/plan4-food/round25-feedback.json'),'utf8'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site');
try{await access(path.join(archive,'round24.json'));}catch{const live=JSON.parse(await readFile(path.join(site,'round24.json'),'utf8'));if(live.reviewId!==feedback.sourceReviewId)throw Error('Source review differs');await cp(site,archive,{recursive:true,errorOnExist:true,force:false});}
const previous=JSON.parse(await readFile(path.join(archive,'round24.json'),'utf8'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==19)throw Error('Round 24 archive incomplete');
const baseline=JSON.parse(await readFile(path.join(output,'material-baseline.json'),'utf8'));
const retainedBefore=JSON.stringify([baseline.plannedMilkChain,baseline.plannedExoticChain]);
const content=await readFile(path.join(root,'src/content/expansion-data.json'));
if(hash(content)!==feedback.actualContentSha256)throw Error('Actual content changed');
const candidates=new Map([...citrusBlueCandidates,...orangeCoconutCandidates].map(r=>[r.id,r]));
if(candidates.size!==4)throw Error('Four replacement designs required');
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
for(const dir of ['assets/round25/original','assets/round25/proposal','assets/round25/highres','sources/round25','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(group,id,art){
  const files={source:`sources/round25/${id}-${group}.svg`,png:`assets/round25/${group}/${id}.png`,image:`assets/round25/${group}/${id}.webp`,highres:`assets/round25/highres/${id}-${group}.png`};
  const bytes={source:art.source,png:art.png,image:art.webp,highres:art.highres};
  for(const key of Object.keys(files))await writeFile(path.join(site,files[key]),bytes[key]);
  return {...files,sha256:Object.fromEntries(Object.entries(bytes).map(([k,b])=>[k,hash(b)]))};
}
async function verify(asset,id,bases=[site,archive]){
  for(const base of bases)for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': fixed artwork changed');
}
let fixedCount=0;
for(const entry of [...previous.previousFinalReviews,{reviewId:'3106315e39b7',stem:'round2-final',count:14},{reviewId:'d978fdf8f32e',stem:'beast-final',count:10}]){
  const final=JSON.parse(await readFile(path.join(site,entry.stem+'.json'),'utf8'));
  if(final.reviewId!==entry.reviewId||final.samples.length!==entry.count)throw Error('Fixed inventory differs');
  for(const row of final.samples){await verify(row.proposal,row.code);fixedCount++;}
}
if(fixedCount!==94)throw Error('Previous fixed scope differs');
let retainedCount=0;
for(const chain of [baseline.plannedMilkChain,baseline.plannedExoticChain])for(const row of chain.slots){
  const a=row.artwork;
  for(const [file,digest]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,file)))!==digest)throw Error('Retained milk or fruit artwork changed');
  retainedCount++;
}
if(retainedCount!==15)throw Error('Milk or fruit scope differs');
const rows=[],exportInspections={};let unchangedCount=0;
const oldRows=previous.samples.filter(r=>r.chain==='fresh-mixer');
if(oldRows.length!==13||feedback.selectedNewCodes.length!==13)throw Error('Selected mixer scope differs');
for(const old of oldRows){
  if(!feedback.selectedNewCodes.includes(old.code))throw Error('Unspecified mixer selection');
  await verify(old.proposal,old.code);await verify(old.original,old.code+'-V4');
  const master=baseline.items.find(r=>r.id===old.id)?.original;
  if(!master||hash(await readFile(path.join(root,master.source)))!==master.sourceSha256||master.sourceSha256!==old.original.sha256.source)throw Error('V4 original master changed');
  const candidate=candidates.get(old.id),redesign=feedback.redesignCodes.includes(old.code);
  if(Boolean(candidate)!==redesign)throw Error('Redesign identity differs');
  let original=old.proposal,proposal=old.proposal;
  if(candidate){
    if(candidate.previousName!==old.name||candidate.name!==feedback.replacementNames[old.code]||candidate.expectedOccupancy!==feedback.occupancies[old.code])throw Error('Replacement mapping differs');
    original=await save('original',old.id,await archivedArtwork(old.proposal,old.expectedOccupancy,old.code,archive));
    const art=await render(Buffer.from(candidate.svg),old.code+'-replacement',candidate.expectedOccupancy);
    proposal=await save('proposal',old.id,art);exportInspections[old.code]=art.inspection;
    if(proposal.sha256.source===old.proposal.sha256.source||proposal.sha256.source===old.original.sha256.source||proposal.sha256.image===old.proposal.sha256.image)throw Error('Replacement must have independently redesigned artwork');
  }else unchangedCount++;
  rows.push({...old,index:rows.length+1,name:candidate?.name||old.name,oldName:old.name,actualGameName:old.name,proposedName:candidate?.name,nameChanged:Boolean(candidate),status:candidate?'CANDIDATE':'ACCEPTED',statusLabel:candidate?'替换饮品提案 · 待你选择':'第24轮新版 · 已采用',displayLabel:candidate?'替换候选 · 待选':'第24轮新版 · 已采用',selection:candidate?'candidate':'selected',artworkStatus:candidate?'REPLACEMENT_PENDING':'USER_ACCEPTED',artworkSelection:candidate?'replacement-candidate':'round24-new',changeType:candidate?'replacement':'unchanged',reason:candidate?candidate.reason:'按本次确认采用第24轮新版，源稿、所有导出及显示尺寸原样保持。',design:candidate?.design||old.design,expectedOccupancy:candidate?.expectedOccupancy||old.expectedOccupancy,priorExpectedOccupancy:old.expectedOccupancy,sourceLabel:candidate?'左侧为第24轮已采用新版；本轮新名称与新美术待你确认，V4原版另留参照':'第24轮新版已采用，源稿与各档导出逐字节保持',sourceSelection:{reviewId:feedback.sourceReviewId,variant:'proposal',sha256:old.proposal.sha256},baselineAcceptedReviewId:feedback.sourceReviewId,acceptedBaselineArtwork:old.proposal,baselineArtworkSelected:true,...(!candidate?{acceptedReviewId:feedback.sourceReviewId,confirmedPresentationReviewId:feedback.sourceReviewId,userAcceptedNewArtwork:true}:{}),...(candidate?{authoringSource:'artwork/plan4-food/round25/'+(old.code==='MX05'||old.code==='MX08'?'citrus-blue.mjs':'orange-coconut.mjs'),sourceOrigin:'ROUND25_DRINK_REPLACEMENT',replacementTargetId:old.id}:{}),v4Reference:old.original,original,proposal});
}
if(rows.length!==13||unchangedCount!==9||rows.filter(r=>r.status==='CANDIDATE').length!==4)throw Error('Round 25 scope differs');
if(new Set(rows.map(r=>r.proposal.sha256.source)).size!==13||new Set(rows.map(r=>r.proposal.sha256.image)).size!==13)throw Error('Duplicate artwork');
const counts={total:13,candidates:4,accepted:9,pending:4};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.name,r.status,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
async function contact(items,size,mode){
  const compare=mode==='proposals',cols=compare?2:mode==='replacements'?4:5,cw=compare?420:mode==='replacements'?200:180,ch=compare?208:mode==='replacements'?180:158,width=cols*cw,height=56+Math.ceil(items.length/cols)*ch;
  const titles={proposals:'四项饮品 / 第24轮已采用与本轮替换候选',replacements:'四种新饮品 / 轮廓、色彩与材质区分',mixer:'特调基底整链 / 九项已采用，四项替换待选'};
  const texts=[`<text x="20" y="27" font-size="16" font-weight="700">${titles[mode]} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：第24轮已采用；右：本轮替换候选，由你决定':'清楚细深描边 · 五级控制体量 · 四项新饮品待选择'}</text>`],layers=[];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+120}" text-anchor="middle" font-size="10">${xml((j?'替换候选 · ':'第24轮已采用 · ')+(j?row.name:row.oldName))}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+(compare?151:139)}" text-anchor="middle" font-size="12">${xml(row.code+' · '+(compare?row.oldName+' → '+row.name:row.name))}</text>`);
    if(compare)texts.push(`<text x="${x+cw/2}" y="${y+176}" text-anchor="middle" font-size="10" fill="#84745f">主体约${Math.round(row.expectedOccupancy*100)}% · 新名称与新稿待你选择</text>`);
    else texts.push(`<text x="${x+cw/2}" y="${y+155}" text-anchor="middle" font-size="9" fill="#84745f">${xml(row.displayLabel)}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const filename=`contacts/round25-${mode}-${size}.png`;
  await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,filename));
  return {size,path:filename};
}
const contacts={proposals:[],replacements:[],mixer:[]};
for(const size of [40,96])for(const [mode,items]of [['proposals',rows.filter(r=>r.status==='CANDIDATE')],['replacements',rows.filter(r=>r.status==='CANDIDATE')],['mixer',rows]])contacts[mode].push(await contact(items,size,mode));
const checks={adoptedRound24BaselinesByteIdentical:13,unchangedAdoptedNewSourcesAndExportsByteIdentical:9,comparisonBaselinesAreRound24SelectedArtwork:4,previousFixedSourceAndExportsByteIdentical:94,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,v4OriginalMastersUnchanged:13,v4ReferencesPreserved:13,newReplacementDesigns:4,actualGameContentUnchanged:true,actualContentSha256:hash(content),actualGameNameChanges:0,actualRecipeChanges:0,proposedReplacementNames:4,ingredientIdsAndLevelsPreserved:13,transparentPadding:true,uniqueSources:13,uniqueRenders:13,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const manifest={title:'鹅巷食光 · 四种特调新提案',round:25,reviewId,status:'NINE_MIXER_NEW_FIXED_FOUR_DRINK_REPLACEMENTS_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,counts,previousFinalReviews:previous.previousFinalReviews,adoptedRound24Codes:feedback.selectedNewCodes,redesignCodes:feedback.redesignCodes,contacts,checks,exportInspections,samples:rows};
await writeFile(path.join(site,'round25.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(site,'samples.json'),JSON.stringify(manifest,null,2)+'\n');
const template=await readFile(path.join(root,'scripts/build-plan4-round25.html'),'utf8');if(!template.includes('/*__ROUND25_DATA__*/'))throw Error('Round25 template marker missing');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND25_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
const artRef=(r,key='proposal')=>({source:'output/plan4-food-review/site/'+r[key].source,preview512:'output/plan4-food-review/site/'+r[key].image,highres:'output/plan4-food-review/site/'+r[key].highres,sha256:r[key].sha256});
baseline.currentReview={round:25,reviewId,status:manifest.status,scope:feedback.scope,counts,manifest:'output/plan4-food-review/site/round25.json',url:'http://127.0.0.1:5284/',feedbackSource:'artwork/plan4-food/round25-feedback.json',checks,sizePolicy:feedback.sizePolicy};
baseline.plannedMixerChain={status:manifest.status,reviewId,adoptedBaselineReviewId:feedback.sourceReviewId,manifest:'output/plan4-food-review/site/round25.json',counts,orderedNames:rows.map(r=>r.name),replacementNamesAreProposals:true,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,actualGameName:r.oldName,level:r.level,status:r.status,expectedOccupancy:r.expectedOccupancy,selectedArtwork:artRef(r,'original'),candidateArtwork:r.status==='CANDIDATE'?artRef(r):undefined,artwork:artRef(r)}))};
for(const row of rows){
  const item=baseline.items.find(r=>r.id===row.id);if(!item)throw Error('Mixer identity missing');
  item.latestReview={reviewId,code:row.code,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};
  item.proposal={reviewId,status:row.status,proposedName:row.proposedName,actualGameName:row.oldName,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};
  item.selectedArtwork={reviewId:feedback.sourceReviewId,userAcceptedArtwork:true,selectedName:row.oldName,selectedVariant:'proposal',presentationStatus:'USER_CONFIRMED',artwork:artRef(row,'original'),expectedOccupancy:row.priorExpectedOccupancy};
}
if(retainedBefore!==JSON.stringify([baseline.plannedMilkChain,baseline.plannedExoticChain]))throw Error('Retained chain state changed');
await writeFile(path.join(output,'material-baseline.json'),JSON.stringify(baseline,null,2)+'\n');
const acceptedFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=JSON.parse(await readFile(acceptedFile,'utf8'));
const entry={reviewId:feedback.sourceReviewId,date:feedback.date,userQuote:feedback.userQuote,status:'THIRTEEN_NEW_BASELINES_SELECTED_FOUR_REDESIGNS_PENDING',selectedNewCodes:feedback.selectedNewCodes,counts:{selectedNew:13,fixedCurrentArtwork:9,redesignRequested:4},selectedArtwork:oldRows.map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:{reviewId:feedback.sourceReviewId,variant:'proposal',sha256:r.proposal.sha256},expectedOccupancy:r.expectedOccupancy,presentationStatus:'USER_CONFIRMED'})),redesignRequestedCodes:feedback.redesignCodes,nextReviewId:reviewId,actualGameIntegrationPending:true};
const at=book.reviews.findIndex(r=>r.reviewId===feedback.sourceReviewId);if(at<0)book.reviews.push(entry);else book.reviews[at]=entry;
await writeFile(acceptedFile,JSON.stringify(book,null,2)+'\n');
await mkdir(path.join(root,'output/plan4-round25-work'),{recursive:true});await writeFile(path.join(root,'output/plan4-round25-work/checks.json'),JSON.stringify({reviewId,counts,checks,exportInspections,humanAcceptance:'PENDING_FOUR_REPLACEMENT_DRINKS'},null,2)+'\n');
console.log(JSON.stringify({reviewId,status:manifest.status,counts,checks,url:'http://127.0.0.1:5284/'},null,2));

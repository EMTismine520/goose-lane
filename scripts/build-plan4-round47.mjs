import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';import {fileURLToPath} from 'node:url';import sharp from 'sharp';
import {producerProduceCandidates} from '../artwork/plan4-food/round47/producer-produce.mjs';
import {producerBeastCandidates} from '../artwork/plan4-food/round47/producer-beast.mjs';
import {producerPoultryCandidates} from '../artwork/plan4-food/round47/producer-poultry.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex'),json=async f=>JSON.parse(await readFile(f,'utf8')),saveJson=(f,v)=>writeFile(f,JSON.stringify(v,null,2)+'\n');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=await json(path.join(root,'artwork/plan4-food/round47-feedback.json')),archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site'),previous=await json(path.join(archive,'round46.json'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==7)throw Error('Frozen round46 differs');
const barFinal=await json(path.join(site,'bar-final.json'));if(barFinal.reviewId!==feedback.confirmedBarReviewId||barFinal.samples.length!==12||barFinal.status!=='ALL_ARTWORK_AND_PRESENTATION_CONFIRMED')throw Error('Bar acceptance required');
const baselineFile=path.join(output,'equipment-baseline.json'),baseline=await json(baselineFile),materialBaseline=await json(path.join(output,'material-baseline.json')),data=await json(path.join(root,'src/content/expansion-data.json'));
if(hash(await readFile(path.join(root,'src/content/expansion-data.json')))!==feedback.actualExpansionSha256||hash(await readFile(path.join(root,'src/content/catalog.ts')))!==feedback.actualBaseCatalogSha256)throw Error('Actual content changed');
const candidates=new Map([...producerProduceCandidates,...producerBeastCandidates,...producerPoultryCandidates].map(r=>[r.id,r]));if(candidates.size!==12||feedback.orderedIds.some(id=>!candidates.has(id)))throw Error('Twelve new equipment candidates required');
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
  if(Math.abs((b.left+b.width/2)/size-.5)>.006||Math.abs((b.top+b.height/2)/size-.5)>.006)throw Error(id+': artwork is not centered');
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
for(const dir of ['assets/round47/proposal','assets/round47/original','assets/round47/historical','assets/round47/highres','sources/round47','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(id,art,variant='proposal'){
 const files={source:`sources/round47/${id}-${variant}.svg`,png:`assets/round47/${variant}/${id}.png`,image:`assets/round47/${variant}/${id}.webp`,highres:`assets/round47/highres/${id}-${variant}.png`},bytes={source:art.source,png:art.png,image:art.webp,highres:art.highres};
 for(const key of Object.keys(files))await writeFile(path.join(site,files[key]),bytes[key]);
 return {...files,sha256:Object.fromEntries(Object.entries(bytes).map(([k,b])=>[k,hash(b)]))};
}
async function verify(asset,id,bases=[site,archive]){
  for(const base of bases)for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': fixed artwork changed');
}


let fixedMaterials=0;
for(const e of [...previous.previousFinalReviews,{reviewId:'3106315e39b7',stem:'round2-final',count:14},{reviewId:'d978fdf8f32e',stem:'beast-final',count:10}]){const m=await json(path.join(site,e.stem+'.json'));if(m.reviewId!==e.reviewId||m.samples.length!==e.count)throw Error('Material inventory differs');for(const r of m.samples){await verify(r.proposal,r.code);fixedMaterials++;}}
if(fixedMaterials!==107)throw Error('Material scope differs');
let retainedMaterials=0;
for(const chain of [materialBaseline.plannedMilkChain,materialBaseline.plannedExoticChain])for(const row of chain.slots){const a=row.artwork;for(const [f,h]of [[a.source,a.sha256.source],[a.preview512,a.sha256.image],[a.preview512.replace(/\.webp$/,'.png'),a.sha256.png],[a.highres,a.sha256.highres]])if(hash(await readFile(path.join(root,f)))!==h)throw Error('Retained material changed');retainedMaterials++;}
if(retainedMaterials!==15)throw Error('Milk or fruit scope differs');
const previousRecipeFinalReviews=[...previous.previousRecipeFinalReviews.filter(r=>r.stem!=='bar-front-selected'),{batch:'bar',reviewId:barFinal.reviewId,stem:'bar-final',count:12}];
let fixedRecipes=0;for(const ref of previousRecipeFinalReviews){const m=await json(path.join(site,ref.stem+'.json'));if(m.reviewId!==ref.reviewId||m.samples.length!==ref.count)throw Error('Recipe final differs');for(const r of m.samples){await verify(r.proposal,r.code);fixedRecipes++;}}if(fixedRecipes!==123)throw Error('123 confirmed recipe identities required');
let archivedEquipment=0;for(const r of baseline.items){if(hash(await readFile(path.join(root,r.original.source)))!==r.original.sourceSha256||hash(await readFile(path.join(root,r.original.runtime)))!==r.original.runtimeSha256)throw Error('Equipment original changed '+r.id);archivedEquipment++;}if(archivedEquipment!==78)throw Error('Equipment baseline inventory differs');
const labels={'fresh-veg':'蔬菜链','fresh-fruit':'鲜果链','fresh-beast':'兽肉链','fresh-poultry':'禽肉链'},rows=[],exportInspections={};
for(const [i,id]of feedback.orderedIds.entries()){
 const item=baseline.items.find(r=>r.id===id),candidate=candidates.get(id),actual=data.devices.find(d=>d.id===item?.familyId),occupancy=feedback.occupancies[item?.level-1];
 if(!item||!actual||candidate.name!==item.name||candidate.level!==item.level||candidate.familyId!==item.familyId||candidate.code!==item.code||candidate.expectedOccupancy!==occupancy||actual.name!==item.name||JSON.stringify(actual.chains)!==JSON.stringify(item.outputChains))throw Error('Equipment identity or function differs '+id);
 const source=await readFile(path.join(root,item.original.source));const original=await save(id,await render(source,item.code+'-original',.8),'original'),art=await render(Buffer.from(candidate.svg),item.code+'-new',occupancy),proposal=await save(id,art);
 if(original.sha256.source===proposal.sha256.source||original.sha256.image===proposal.sha256.image)throw Error('Independent equipment artwork required');
 const outputLabels=item.outputChains.map(c=>labels[c]);
 rows.push({index:i+1,code:item.code,id,name:item.name+' · '+item.level+'级',deviceName:item.name,familyId:item.familyId,familyCode:item.familyCode,level:item.level,kind:'device',deviceKind:item.deviceKind,stage:item.stage,course:item.familyId,outputChains:item.outputChains,outputLabels,functionDescription:'对应'+outputLabels.join('、')+'，沿用当前产出关系、生产规则与升级规则。',status:'CANDIDATE',statusLabel:'全新器材外观 · 待你选择',displayLabel:'第47轮新版候选 · 待选择',selection:'candidate',userAcceptedNewArtwork:false,artworkStatus:'EQUIPMENT_CANDIDATE_PENDING',expectedOccupancy:occupancy,priorExpectedOccupancy:.8,comparisonLabel:'原版外观',comparisonSource:{kind:'EQUIPMENT_BASELINE',source:item.original.source,sourceSha256:item.original.sourceSha256},reason:candidate.reason,design:candidate.design,sourceLabel:'原版源稿完整保留，右侧独立新版仅供选择；当前生产器功能、价格及实际游戏外观保持。',authoringSource:'artwork/plan4-food/round47/'+(i<6?'producer-produce.mjs':i<9?'producer-beast.mjs':'producer-poultry.mjs'),original,proposal});exportInspections[item.code]=art.inspection;
}
if(rows.length!==12||new Set(rows.map(r=>r.proposal.sha256.source)).size!==12||new Set(rows.map(r=>r.proposal.sha256.image)).size!==12)throw Error('Twelve distinct equipment drawings required');
const counts={total:12,candidates:12,accepted:0},reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
async function contact(size,compare){const cols=3,cw=compare?350:240,ch=160,width=cols*cw,height=56+4*ch,layers=[],texts=[`<text x="20" y="26" font-size="16" font-weight="700">生产器四族三级 / ${compare?'原版与新版对照':'第47轮独立候选'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'每组左原版、右新版；同一行是同类生产器的1、2、3级':'结构升级 · 细深描边 · 左上光 · 未经确认不替换实际游戏外观'}</text>`];
for(const [i,row]of rows.entries()){const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;for(const [j,a]of(compare?[row.original,row.proposal]:[row.proposal]).entries()){const cx=compare?x+cw*(j+.5)/2:x+cw/2;layers.push({input:await sharp(await readFile(path.join(site,a.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((104-size)/2)});if(compare)texts.push(`<text x="${cx}" y="${y+116}" text-anchor="middle" font-size="9">${j?'新版待选择':'原版'}</text>`);}texts.push(`<text x="${x+cw/2}" y="${y+135}" text-anchor="middle" font-size="11">${xml(row.name)}</text><text x="${x+cw/2}" y="${y+153}" text-anchor="middle" font-size="9" fill="#84745f">${xml(row.code+' · '+row.outputLabels.join('、'))}</text>`);}
layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});const file=`contacts/round47-${compare?'comparisons':'candidates'}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,file));return{size,path:file};}
const contacts={comparisons:[],candidates:[]};for(const size of [40,96]){contacts.comparisons.push(await contact(size,true));contacts.candidates.push(await contact(size,false));}
const equipmentProgress={total:78,families:26,currentFamilies:4,currentCandidates:12,fullyConfirmed:0,reviewCovered:12,notYetReviewed:66},recipeProgress={total:123,fullyConfirmedRecipeArtworks:123,currentCandidates:0,notYetIndividuallyReviewed:0};
const checks={earlierConfirmedRecipeSourcesAndExportsByteIdentical:123,barSelectionNew:11,barSelectionOriginal:1,previousFixedMaterialSourcesAndExportsByteIdentical:107,currentMilkSourcesAndExportsByteIdentical:7,currentFruitSourcesAndExportsByteIdentical:8,immutableEquipmentSourcesAndRuntimeUnchanged:78,newEquipmentSources:12,newEquipmentRenders:12,actualContentUnchanged:true,actualEquipmentFunctionsUnchanged:true,actualExpansionSha256:feedback.actualExpansionSha256,transparentPadding:true,visualCenters:true,uniqueSourceIdentities:12,perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const families=feedback.familyIds.map(id=>({id,name:data.devices.find(d=>d.id===id).name,code:rows.find(r=>r.familyId===id).familyCode}));
const manifest={title:'鹅巷食光 · 生产器四族三级',round:47,reviewId,status:'TWELVE_EQUIPMENT_CANDIDATES_PENDING_ALL_RECIPES_CONFIRMED',sourceReviewId:previous.reviewId,confirmedBarReviewId:barFinal.reviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,authoringPolicy:feedback.authoringPolicy,counts,equipmentProgress,recipeProgress,previousRecipeFinalReviews,families,contacts,checks,exportInspections,samples:rows};
await saveJson(path.join(site,'round47.json'),manifest);await saveJson(path.join(site,'samples.json'),manifest);const template=await readFile(path.join(root,'scripts/build-plan4-round47.html'),'utf8');if(!template.includes('/*__ROUND47_DATA__*/'))throw Error('Data marker missing');await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND47_DATA__*/',JSON.stringify(manifest).replace(/</g,()=>String.fromCharCode(92)+'u003c')));
const artRef=r=>({source:'output/plan4-food-review/site/'+r.proposal.source,png512:'output/plan4-food-review/site/'+r.proposal.png,preview512:'output/plan4-food-review/site/'+r.proposal.image,highres:'output/plan4-food-review/site/'+r.proposal.highres,sha256:r.proposal.sha256});
for(const r of rows){const item=baseline.items.find(i=>i.id===r.id);item.status='CANDIDATE';item.latestReview={reviewId,round:47,status:'CANDIDATE',artwork:artRef(r),expectedOccupancy:r.expectedOccupancy};item.proposal={...item.latestReview};}baseline.currentReview={round:47,reviewId,status:manifest.status,counts,familyIds:feedback.familyIds,manifest:'output/plan4-food-review/site/round47.json',url:'http://127.0.0.1:5284/?round=47'};baseline.counts={total:78,families:26,candidates:12,accepted:0,notYetReviewed:66};await saveJson(baselineFile,baseline);
await saveJson(path.join(root,'output/plan4-round47-work/checks.json'),{reviewId,counts,equipmentProgress,recipeProgress,checks,exportInspections,humanAcceptance:'PENDING_EQ01_TO_EQ04_ALL_THREE_LEVELS'});console.log(JSON.stringify({reviewId,counts,equipmentProgress,recipeProgress,url:'http://127.0.0.1:5284/?round=47'},null,2));

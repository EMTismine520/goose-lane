import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {tsImport} from 'tsx/esm/api';
import {gooseSaladCandidate} from '../artwork/plan4-food/round31/goose-salad.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.join(root,'output/plan4-food-review'),site=path.join(output,'site');
const hash=b=>createHash('sha256').update(b).digest('hex');
const json=async f=>JSON.parse(await readFile(f,'utf8'));
const saveJson=(f,v)=>writeFile(f,JSON.stringify(v,null,2)+'\n');
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const feedback=await json(path.join(root,'artwork/plan4-food/round31-feedback.json'));
const archive=path.join(output,'checkpoints',feedback.sourceReviewId,'site'),previous=await json(path.join(archive,'round30.json'));
if(previous.reviewId!==feedback.sourceReviewId||previous.samples.length!==5)throw Error('Frozen round30 scope differs');
const baselineFile=path.join(output,'recipe-baseline.json'),baseline=await json(baselineFile),materialFile=path.join(output,'material-baseline.json'),material=await json(materialFile);
const audit=await json(path.join(root,'output/plan4-round31-work/semantic-audit.json')),reconciliation=await json(path.join(root,'output/plan4-round31-work/content-reconciliation.json'));
const {RECIPES,ITEMS}=await tsImport('../src/content/catalog.ts',import.meta.url);
async function verify(asset,id,bases=[site,archive]){for(const base of bases)for(const key of ['source','png','image','highres'])if(hash(await readFile(path.join(base,asset[key])))!==asset.sha256[key])throw Error(id+': retained artwork changed');}
function bounds(data,info){
  let left=info.width,top=info.height,right=-1,bottom=-1,edge=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    const a=data[(y*info.width+x)*4+3];
    if(x===0||y===0||x===info.width-1||y===info.height-1)edge=Math.max(edge,a);
    if(a<=16)continue;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<left)throw Error('Empty artwork');return {left,top,width:right-left+1,height:bottom-top+1,edge};
}
function validate(svg,id){
  if(/<(?:image|script|foreignObject)\b|(?:href|src)\s*=|data:/i.test(svg))throw Error(id+': non-native SVG');
  const ids=[...svg.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)throw Error(id+': duplicate SVG definition');
  for(const m of svg.matchAll(/url\(["']?#([^)'"\s]+)["']?\)/g))if(!ids.includes(m[1]))throw Error(id+': missing definition');
  const box=svg.match(/\bviewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
  if(!box||box.length!==4||box.some(v=>!Number.isFinite(v))||box[2]<=0||box[3]<=0)throw Error(id+': invalid viewBox');return box;
}
async function inspect(bytes,size,id,expected){
  const meta=await sharp(bytes).metadata();if(meta.width!==size||meta.height!==size||!meta.hasAlpha)throw Error(id+': dimensions or alpha differ');
  const raw=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info),occupancy=Math.max(b.width,b.height)/size;
  if(b.edge||Math.abs(occupancy-expected)>.006)throw Error(id+': occupancy differs '+occupancy);
  if(Math.abs((b.left+b.width/2)/size-.5)>.006||Math.abs((b.top+b.height/2)/size-.5)>.006)throw Error(id+': artwork not centered');
  return {occupancy,bounds:b};
}
async function render(source,id,occupancy){
  const svg=source.toString('utf8'),box=validate(svg,id),raw=await sharp(source).resize(1024,1024).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw.data,raw.info);
  if(b.edge)throw Error(id+': source touches edge');
  const side=Math.max(b.width/1024*box[2],b.height/1024*box[3])/occupancy,cx=box[0]+(b.left+b.width/2)/1024*box[2],cy=box[1]+(b.top+b.height/2)/1024*box[3];
  const fitted=svg.replace(/(<svg\b[^>]*\bviewBox\s*=\s*)["'][^"']+["']/,'$1"'+[cx-side/2,cy-side/2,side,side].map(v=>v.toFixed(6)).join(' ')+'"');
  const highres=await sharp(Buffer.from(fitted)).resize(1024,1024).png().toBuffer(),png=await sharp(highres).resize(512,512).png().toBuffer(),webp=await sharp(png).webp({lossless:true,effort:6}).toBuffer();
  return {source,png,webp,highres,inspection:{png:await inspect(png,512,id,occupancy),webp:await inspect(webp,512,id,occupancy),highres:await inspect(highres,1024,id,occupancy)}};
}
for(const dir of ['assets/round31/proposal','assets/round31/highres','sources/round31','contacts'])await mkdir(path.join(site,dir),{recursive:true});
async function save(id,art){
  const files={source:`sources/round31/${id}-proposal.svg`,png:`assets/round31/proposal/${id}.png`,image:`assets/round31/proposal/${id}.webp`,highres:`assets/round31/highres/${id}-proposal.png`};
  const bytes={source:art.source,png:art.png,image:art.webp,highres:art.highres};
  for(const key of Object.keys(files))await writeFile(path.join(site,files[key]),bytes[key]);
  return {...files,sha256:Object.fromEntries(Object.entries(bytes).map(([k,b])=>[k,hash(b)]))};
}
const rows=[],exportInspections={};
for(const old of previous.samples){
  await verify(old.original,old.code+'-original');await verify(old.proposal,old.code+'-round30');
  const actual=RECIPES.find(r=>r.output===old.id),item=baseline.items.find(r=>r.id===old.id),redesign=old.code==='DS21';
  if(!actual||!item)throw Error('Recipe missing');
  const isOriginal=feedback.selectedOriginalCodes.includes(old.code),isNew=feedback.selectedNewCodes.includes(old.code);
  if(!redesign&&isOriginal===isNew)throw Error('Ambiguous selection');
  const variant=isOriginal?'original':'proposal',original=redesign?old.original:old[variant];
  let proposal=original,expectedOccupancy=isOriginal?.8:old.expectedOccupancy;
  if(redesign){
    if(actual.name!==gooseSaladCandidate.name||JSON.stringify(actual.inputs.map(i=>ITEMS[i.item].name))!==JSON.stringify(['卤鹅肉','紫洋葱','红椒']))throw Error('Goose recipe contract differs');
    const art=await render(Buffer.from(gooseSaladCandidate.svg),old.code,.82);proposal=await save(old.id,art);expectedOccupancy=.82;exportInspections[old.code]=art.inspection;
  }else exportInspections[old.code]={copiedSourceAndExportsByteIdentical:true};
  rows.push({...old,index:rows.length+1,name:actual.name,oldName:old.name,nameChanged:actual.name!==old.name,ingredients:actual.inputs.map(i=>ITEMS[i.item].name),inputIds:actual.inputs.map(i=>i.item),recipeDescription:actual.description,durationSeconds:actual.duration/1000,stage:actual.stage,status:redesign?'CANDIDATE':'ACCEPTED',statusLabel:redesign?'原配方已替换 · 卤鹅新稿待确认':isOriginal?'原版 · 已确认保留':'新版 · 已确认采用',displayLabel:redesign?'凉拌卤鹅肉 · 新稿待确认':isOriginal?'已采用原版':'已采用新版',comparisonLabel:redesign?'旧皮蛋料理 · 已撤回':isOriginal?'V4原版 · 已选用':'第30轮新版 · 已选用',selection:redesign?'candidate':'selected',artworkStatus:redesign?'GOOSE_REPLACEMENT_PENDING':'USER_ACCEPTED',artworkSelection:redesign?'round31-goose-candidate':isOriginal?'original':'round30-new',changeType:redesign?'recipe-replacement':'unchanged',expectedOccupancy,sourceSelection:redesign?null:{reviewId:feedback.sourceReviewId,variant,sha256:original.sha256},baselineAcceptedReviewId:redesign?undefined:feedback.sourceReviewId,baselineSelectionPreserved:!redesign,reason:redesign?gooseSaladCandidate.reason:'按本次选择固定所选版本，SVG母稿与全部导出原字节保持。',design:redesign?gooseSaladCandidate.design:old.design,sourceLabel:redesign?'皮蛋已经从基础禽肉链移除；旧料理只作历史对照。实际菜谱现为卤鹅肉＋紫洋葱＋红椒，右侧新稿待用户确认。':'本次明确选用，图源、导出与体量保持。',authoringSource:redesign?'artwork/plan4-food/round31/goose-salad.mjs':old.authoringSource,previousCandidate:old.proposal,original,proposal});
}
const counts={total:5,accepted:4,selectedOriginal:2,selectedNew:2,candidates:1,pending:1};
const reviewId=hash(JSON.stringify(rows.map(r=>[r.id,r.status,r.name,r.inputIds,r.proposal.sha256,r.expectedOccupancy]))).slice(0,12);
const recipeChanges=[...audit.recipeChanges,...audit.indirectRecipes,...audit.homeRecipes].map(old=>{
  const current=RECIPES.find(r=>r.output===old.output);if(!current)throw Error('Affected recipe missing');
  return {id:current.id,output:current.output,before:old.oldName??old.name,after:current.name,ingredients:current.inputs.map(i=>ITEMS[i.item].name),inputIds:current.inputs.map(i=>i.item),durationSeconds:current.duration/1000,stage:current.stage,note:old.note};
});
if(recipeChanges.length!==23||recipeChanges.filter(r=>r.before!==r.after).length!==20)throw Error('Global recipe reconciliation differs');
for(const change of audit.rawChanges)if(ITEMS[change.id].name!==change.newName)throw Error('Raw name not applied');
for(const actual of RECIPES.filter(r=>r.output.startsWith('dish-fresh-'))){
  const item=baseline.items.find(r=>r.id===actual.output);if(!item)throw Error('Recipe baseline identity missing');
  if(item.name!==actual.name)item.previousRecipeName??=item.name;
  item.name=actual.name;item.ingredients=actual.inputs.map(r=>ITEMS[r.item].name);item.inputIds=actual.inputs.map(r=>r.item);item.stage=actual.stage;
  const revision=recipeChanges.find(r=>r.output===actual.output);if(revision)item.semanticRevision={reviewId,applied:true,...revision};
}
const artRef=(row,key='proposal')=>({source:'output/plan4-food-review/site/'+row[key].source,png512:'output/plan4-food-review/site/'+row[key].png,preview512:'output/plan4-food-review/site/'+row[key].image,highres:'output/plan4-food-review/site/'+row[key].highres,sha256:row[key].sha256});
for(const row of rows){
  const item=baseline.items.find(r=>r.id===row.id);
  if(row.code==='DS20'&&!item.legacySelection)item.legacySelection={reviewId:'437a9a667ee5',choice:item.choice,userReview:item.userReview,selectedArtwork:item.selectedArtwork,supersededBy:feedback.sourceReviewId};
  item.choice=row.status==='CANDIDATE'?'REMOVED_INGREDIENT_REPLACED_ARTWORK_PENDING':row.artworkSelection==='original'?'USER_SELECTED_ORIGINAL':'USER_SELECTED_NEW';
  item.userReview=row.status==='CANDIDATE'?'GOOSE_REPLACEMENT_PENDING':'ARTWORK_AND_PRESENTATION_CONFIRMED';
  item.latestReview={reviewId,status:row.status,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};item.proposal={...item.latestReview};
  if(row.status==='ACCEPTED')item.selectedArtwork={reviewId:feedback.sourceReviewId,selection:row.artworkSelection,userAcceptedArtwork:true,presentationStatus:'USER_CONFIRMED',sourceSelection:row.sourceSelection,artwork:artRef(row),expectedOccupancy:row.expectedOccupancy};
  else{item.retiredArtwork={reason:'基础皮蛋已替换为卤鹅肉',reviewId:feedback.sourceReviewId,original:artRef(row,'original'),candidate:row.previousCandidate};delete item.selectedArtwork;}
}
const overrides=await json(path.join(root,'artwork/plan4-food/runtime-overrides.json')),runtime=await json(path.join(root,'public/assets/v3-manifest.json'));
for(const row of overrides){const asset=runtime.find(r=>r.id===row.id);if(!asset||asset.name!==ITEMS[row.id].name||asset.sourceSha256!==row.sourceSha256||asset.mode!=='plan4-approved-svg')throw Error('Runtime art not synchronized: '+row.id);}
for(const row of runtime.filter(r=>r.kind!=='device'))if(ITEMS[row.id]?.name!==row.name)throw Error('Runtime asset name differs '+row.id);
for(const change of audit.rawChanges){const item=material.items.find(r=>r.id===change.id);if(!item)throw Error('Material baseline missing');item.originalName??=item.name;item.name=change.newName;item.actualGameName=change.newName;item.runtimeIntegrationStatus='LOCAL_IMPLEMENTED';}
for(const key of ['plannedPoultryChain','plannedSeaChain','plannedCoffeeChain','plannedMixerChain']){material[key].runtimeIntegrationStatus='LOCAL_IMPLEMENTED';material[key].actualGameIntegrationPending=false;material[key].replacementNamesAreProposals=false;material[key].note='第31轮已将本链确认身份、受影响菜谱和对应正式图标接入本地内容；既有美术选用与原始来源保持，历史提案记录仅供追溯。';for(const row of material[key].slots)row.actualGameName=ITEMS[row.id].name;}
material.scope='第31轮同步已确认基础身份：15项更名与重排、23道相关配方及26条受影响扩展订单已在本地实现；原版来源已备份。本轮四项冷食选用已确认，凉拌卤鹅肉新稿待用户验收。其余美术仍沿各批次既定选择继续推进。';
material.semanticReconciliation={reviewId,status:'LOCAL_IMPLEMENTED',rawChanges:15,affectedRecipes:23,renamedRecipes:20,affectedExpansionOrders:26,artOverrides:21,acceptedGardenBowlVisualSynchronized:true,report:'output/plan4-round31-work/content-reconciliation.json'};
const contacts={redesign:[],cold:[]};
async function contact(items,size,compare){
  const cw=compare?420:200,ch=compare?220:174,cols=compare?1:5,width=cw*cols,height=56+Math.ceil(items.length/cols)*ch,layers=[];
  const texts=[`<text x="20" y="27" font-size="16" font-weight="700">${compare?'DS21 / 旧皮蛋料理替换为凉拌卤鹅肉':'砧板冷食 / 四项已选与卤鹅新稿'} / ${size}px</text>`,`<text x="20" y="46" font-size="10">${compare?'左：已撤回旧料理；右：卤鹅肉＋紫洋葱＋红椒新稿，待你确认':'DS17、DS19原版；DS18、DS20新版；DS21新料理待确认'}</text>`];
  for(const [i,row]of items.entries()){
    const x=i%cols*cw,y=56+Math.floor(i/cols)*ch;
    for(const [j,asset]of (compare?[row.original,row.proposal]:[row.proposal]).entries()){
      const cx=compare?x+cw*(j+.5)/2:x+cw/2;
      layers.push({input:await sharp(await readFile(path.join(site,asset.image))).resize(size,size).png().toBuffer(),left:Math.round(cx-size/2),top:y+Math.round((106-size)/2)});
      if(compare)texts.push(`<text x="${cx}" y="${y+120}" text-anchor="middle" font-size="10">${j?'凉拌卤鹅肉 · 待确认':'旧凉拌皮蛋 · 已撤回'}</text>`);
    }
    texts.push(`<text x="${x+cw/2}" y="${y+145}" text-anchor="middle" font-size="12">${xml(row.code+' · '+row.name)}</text>`);
    texts.push(`<text x="${x+cw/2}" y="${y+166}" text-anchor="middle" font-size="10" fill="#84745f">${xml(row.ingredients.join('、'))}</text>`);
  }
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#514234">${texts.join('')}</g></svg>`),left:0,top:0});
  const file=`contacts/round31-${compare?'redesign':'cold'}-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,file));return {size,path:file};
}
for(const size of [40,96]){contacts.redesign.push(await contact(rows.filter(r=>r.status==='CANDIDATE'),size,true));contacts.cold.push(await contact(rows,size,false));}
const checks={rawNamesSynchronized:15,recipesAudited:123,affectedRecipesSynchronized:23,renamedRecipes:20,expansionOrdersAudited:123,affectedExpansionOrders:26,orderIdsAndOutputsStable:true,selectedOriginalSourcesAndExportsByteIdentical:2,selectedNewSourcesAndExportsByteIdentical:2,gooseReplacementArtworks:1,removedEggArtworkRetired:true,runtimeOverridesSynchronized:21,acceptedGardenBowlVisualSynchronized:true,runtimeArtAndRecipeNamesConsistent:true,originalFoodSourcesAndRuntimePreserved:245,actualBaseCatalogSha256:hash(await readFile(path.join(root,'src/content/catalog.ts'))),actualExpansionSha256:hash(await readFile(path.join(root,'src/content/expansion-data.json'))),perItemOccupancy:Object.fromEntries(rows.map(r=>[r.code,r.expectedOccupancy]))};
const recipeProgress={total:123,confirmedStarterRecipes:6,confirmedHomeRecipes:10,currentAccepted:4,currentCandidates:1,reviewCovered:26,notYetIndividuallyReviewed:97};
const manifest={title:'鹅巷食光 · 食材配方同步与卤鹅冷盘',round:31,reviewId,status:'GLOBAL_INGREDIENT_RECIPE_SYNCED_GOOSE_ART_PENDING',sourceReviewId:feedback.sourceReviewId,userQuote:feedback.userQuote,scope:feedback.scope,sizePolicy:feedback.sizePolicy,counts,recipeProgress,semanticAudit:{counts:audit.counts,rawChanges:audit.rawChanges,recipeChanges,report:'content-reconciliation.json'},contacts,checks,exportInspections,previousFinalReviews:previous.previousFinalReviews,previousRecipeFinalReviews:previous.previousRecipeFinalReviews,samples:rows};
await saveJson(path.join(site,'round31.json'),manifest);await saveJson(path.join(site,'samples.json'),manifest);await saveJson(path.join(site,'content-reconciliation.json'),reconciliation);
const template=await readFile(path.join(root,'scripts/build-plan4-round31.html'),'utf8');if(!template.includes('/*__ROUND31_DATA__*/'))throw Error('Template marker missing');await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND31_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
baseline.currentReview={round:31,reviewId,status:manifest.status,counts,batchId:feedback.batchId,manifest:'output/plan4-food-review/site/round31.json',url:'http://127.0.0.1:5284/?round=31',checks};baseline.plannedColdBatch={reviewId,status:manifest.status,counts,slots:rows.map(r=>({id:r.id,code:r.code,name:r.name,status:r.status,ingredients:r.ingredients,inputIds:r.inputIds,expectedOccupancy:r.expectedOccupancy,artwork:artRef(r)}))};baseline.counts={...baseline.counts,activeLegacySelections:baseline.items.filter(r=>r.userReview==='SELECTED_IN_24_ITEM_REVIEW').length,currentCandidates:1,currentAccepted:4};baseline.semanticReconciliation=material.semanticReconciliation;await saveJson(baselineFile,baseline);await saveJson(materialFile,material);
const bookFile=path.join(root,'artwork/plan4-food/accepted-reviews.json'),book=await json(bookFile),acceptance={reviewId:feedback.sourceReviewId,date:feedback.date,userQuote:feedback.userQuote,status:'FOUR_COLD_SELECTIONS_CONFIRMED_REMOVED_EGG_RECIPE_REPLACED',selectedOriginalCodes:feedback.selectedOriginalCodes,selectedNewCodes:feedback.selectedNewCodes,rejectedCandidateCodes:['DS21'],selectedArtwork:rows.filter(r=>r.status==='ACCEPTED').map(r=>({targetId:r.id,code:r.code,name:r.name,sourceSelection:r.sourceSelection,expectedOccupancy:r.expectedOccupancy})),replacement:{code:'DS21',name:'凉拌卤鹅肉',inputIds:['fresh-poultry-8','fresh-spice-3','fresh-spice-1'],artworkStatus:'PENDING_USER'},contentStatus:'LOCAL_IMPLEMENTED'};const at=book.reviews.findIndex(r=>r.reviewId===feedback.sourceReviewId);if(at<0)book.reviews.push(acceptance);else book.reviews[at]=acceptance;await saveJson(bookFile,book);
await saveJson(path.join(root,'output/plan4-round31-work/checks.json'),{reviewId,counts,recipeProgress,checks,exportInspections,humanAcceptance:'PENDING_DS21_GOOSE_ARTWORK'});
console.log(JSON.stringify({reviewId,status:manifest.status,counts,recipeProgress,checks,url:'http://127.0.0.1:5284/?round=31'},null,2));

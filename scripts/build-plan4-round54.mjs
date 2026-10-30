import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

// Run after the selected-export art pipeline. This generator never changes runtime or acceptance ledgers.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const site=path.join(root,'output/plan4-food-review/site'),work=path.join(root,'output/plan4-round54-work');
const before=path.join(work,'before'),registryFile=path.join(root,'artwork/plan4-food/runtime-overrides.json');
const hash=b=>createHash('sha256').update(b).digest('hex');
const json=async f=>JSON.parse(await readFile(f,'utf8'));
const save=(f,v)=>writeFile(f,JSON.stringify(v,null,2)+'\n');
const repoPath=f=>path.resolve(root,f);
const publicPath=f=>path.resolve(root,'public',f);
const formalSourcePath=f=>f.startsWith('assets/')?publicPath(f):repoPath(f);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).filter(k=>k!=='assetPath').sort().map(k=>[k,canonical(v[k])])):v;
const semanticHash=v=>hash(JSON.stringify(canonical(v)));
const registry=await json(registryFile),formalBytes=await readFile(publicPath('assets/v3-manifest.json'));
const formal=JSON.parse(formalBytes),oldFormalBytes=await readFile(path.join(before,'public/assets/v3-manifest.json'));
const oldFormal=JSON.parse(oldFormalBytes),baseline=await json(path.join(work,'baseline.json'));
const catalog=await json(publicPath('content/v3-catalog.json')),oldCatalog=await json(path.join(before,'dist/content/v3-catalog.json'));
if(!Array.isArray(registry)||registry.length!==323||!Array.isArray(formal)||formal.length!==323||!Array.isArray(oldFormal)||oldFormal.length!==323)throw Error('Exactly 323 registry, formal and before identities are required');
if(hash(oldFormalBytes)!==baseline.manifestSha256)throw Error('Before manifest differs from the captured baseline');
const contentChecks={};
for(const [file,key]of [['src/content/catalog.ts','catalogSha256'],['src/content/expansion-data.json','contentSha256']]){
 const current=hash(await readFile(repoPath(file))),captured=hash(await readFile(path.join(before,file)));
 if(current!==baseline[key]||captured!==current)throw Error(file+': actual content differs from before');
 contentChecks[file]={sha256:current,byteIdenticalToBefore:true};
}
const currentSemantic=semanticHash(catalog),beforeSemantic=semanticHash(oldCatalog);
if(currentSemantic!==beforeSemantic)throw Error('Game catalog semantics changed; only assetPath is excluded from this comparison');
const outputs=new Set(catalog.recipes.map(r=>r.output)),identities=new Map();
for(const item of catalog.items)identities.set(item.id,{kind:outputs.has(item.id)?'recipe':'material',name:item.name,level:item.level});
for(const device of catalog.equipment)identities.set(device.id,{kind:'device',name:device.name,level:device.level,familyId:device.familyId});
if(identities.size!==323||outputs.size!==123)throw Error('Current game catalog identity coverage differs');
const formalMap=new Map(formal.map(r=>[r.id,r])),oldMap=new Map(oldFormal.map(r=>[r.id,r]));
if(formalMap.size!==323||oldMap.size!==323||new Set(registry.map(r=>r.id)).size!==323)throw Error('Duplicate art identities');
const paths=['assets/round54/before','assets/round54/selected','assets/round54/highres','sources/round54','contacts'];
for(const dir of paths)await mkdir(path.join(site,dir),{recursive:true});
await mkdir(work,{recursive:true});
const rows=[],fileChecks=[];
const categoryNames={material:'合成食材',recipe:'配方成品',device:'生产与烹饪器材'};
for(const [index,entry]of registry.entries()){
 const identity=identities.get(entry.id),actual=formalMap.get(entry.id),prior=oldMap.get(entry.id),selected=entry.selectedExports;
 if(!identity||!actual||!prior||identity.kind!==entry.kind||!selected?.sha256)throw Error(entry.id+': identity, kind or selected export is missing');
 const baseName=entry.name.replace(/\s*·\s*[123]级$/,'');
 if(baseName!==identity.name||actual.kind!==entry.kind||actual.mode!=='plan4-selected-export')throw Error(entry.id+': actual identity or selected-export mode differs');
 if(!Number.isFinite(entry.expectedOccupancy)||entry.expectedOccupancy<=0||entry.expectedOccupancy>=1)throw Error(entry.id+': missing chosen display occupancy');
 const approved={},copied={source:`sources/round54/${entry.id}.svg`,png:`assets/round54/selected/${entry.id}.png`,image:`assets/round54/selected/${entry.id}.webp`,highres:`assets/round54/highres/${entry.id}.png`};
 for(const key of ['source','png','image','highres']){
  approved[key]=await readFile(repoPath(selected[key]));
  if(hash(approved[key])!==selected.sha256[key])throw Error(entry.id+': approved '+key+' hash differs');
  await writeFile(path.join(site,copied[key]),approved[key]);
 }
 const live=await readFile(publicPath(actual.path)),master=await readFile(formalSourcePath(actual.source)),png=await readFile(formalSourcePath(actual.rasterSource));
 if(hash(live)!==selected.sha256.image||actual.sha256!==selected.sha256.image||hash(master)!==selected.sha256.source||actual.sourceSha256!==selected.sha256.source||hash(png)!==selected.sha256.png)throw Error(entry.id+': formal WebP, editable SVG or PNG is not the chosen original bytes');
 if(actual.runtimeSvg&&hash(await readFile(formalSourcePath(actual.runtimeSvg)))!==selected.sha256.source)throw Error(entry.id+': runtime SVG differs from the selected editable master');
 const liveMeta=await sharp(live).metadata(),pngMeta=await sharp(png).metadata(),largeMeta=await sharp(approved.highres).metadata();
 if(liveMeta.width!==512||liveMeta.height!==512||pngMeta.width!==512||pngMeta.height!==512||largeMeta.width!==1024||largeMeta.height!==1024)throw Error(entry.id+': selected export dimensions differ');
 const oldBytes=await readFile(path.join(before,'public',prior.path));
 if(hash(oldBytes)!==prior.sha256)throw Error(entry.id+': captured before image differs');
 const beforeImage=`assets/round54/before/${entry.id}.webp`;await writeFile(path.join(site,beforeImage),oldBytes);
 const presentationStatus=entry.presentationStatus??entry.presentation?.status??null;
 const presentationPending=/PENDING|NOT_EXPLICIT|UNCONFIRMED|NOT_CONFIRMED/i.test(String(presentationStatus));
 const sourceReviewId=entry.sourceSelection?.reviewId??entry.reviewOrigin?.reviewId??null;
 const originFile=entry.reviewOrigin?.file??entry.reviewOrigin?.manifest??null;
 const sourceReviewUrl=originFile?.startsWith('output/plan4-food-review/site/')?originFile.slice('output/plan4-food-review/site/'.length):null;
 rows.push({index:index+1,id:entry.id,code:entry.code||entry.id,name:entry.name,kind:entry.kind,kindLabel:categoryNames[entry.kind],level:identity.level??null,familyId:identity.familyId??null,expectedOccupancy:entry.expectedOccupancy,selectionKind:entry.selectionKind??null,sourceSelection:entry.sourceSelection??null,sourceReviewId,sourceReviewUrl,reviewOrigin:entry.reviewOrigin??null,presentation:entry.presentation??null,approvalStatus:entry.approvalStatus??null,presentationStatus,presentationPending,status:'SELECTED_ARTWORK_INTEGRATED',statusLabel:'已按选用接入 · 整体效果待验收',runtime:{image:'/game/'+actual.path,sha256:actual.sha256,width:512,height:512,mode:actual.mode},before:{image:beforeImage,sha256:prior.sha256},selected:{...copied,sha256:selected.sha256},selectedExports:selected,runtimeChanged:prior.sha256!==actual.sha256});
 fileChecks.push({id:entry.id,kind:entry.kind,selectedFourFilesVerified:true,formalWebpByteIdentical:true,formalSvgByteIdentical:true,formalPngByteIdentical:true,beforeImageVerified:true,runtimeChanged:prior.sha256!==actual.sha256});
}
const counts={total:323,material:rows.filter(r=>r.kind==='material').length,recipe:rows.filter(r=>r.kind==='recipe').length,device:rows.filter(r=>r.kind==='device').length,integrated:rows.length,newArtCandidates:0,presentationPending:rows.filter(r=>r.presentationPending).length,runtimeChanged:rows.filter(r=>r.runtimeChanged).length};
if(counts.material!==122||counts.recipe!==123||counts.device!==78)throw Error('Expected 122 materials, 123 recipes and 78 equipment forms');
const byId=new Map(rows.map(r=>[r.id,r])),byCode=new Map(rows.map(r=>[r.code,r]));
const focus=[];const addFocus=id=>{const row=byId.get(id)||byCode.get(id);if(row&&!focus.includes(row.id))focus.push(row.id);};
for(const id of ['fresh-veg-1','fresh-veg-2','fresh-veg-3','fresh-veg-4','fresh-veg-5','fresh-poultry-1','fresh-poultry-2','fresh-poultry-5','MI07','DS01','DS03','DS22','DS34','DS43','DS57','DS78','DS104','DS117','vegetable-cart-l1','vegetable-cart-l2','vegetable-cart-l3','blender-l1','blender-l2','blender-l3'])addFocus(id);
// MI07 is also selected by name when a registry uses a decorated presentation code.
if(!focus.some(id=>byId.get(id).name.includes('炼乳'))){const milk=rows.find(r=>r.kind==='material'&&r.name==='炼乳');if(milk)focus.splice(Math.min(8,focus.length),0,milk.id);}
for(const row of rows)if(focus.length<24&&!focus.includes(row.id))focus.push(row.id);
if(focus.length>24)focus.length=24;
if(focus.length!==24||!focus.some(id=>byId.get(id).name.includes('鸡胗'))||!focus.some(id=>byId.get(id).name.includes('炼乳')))throw Error('Focus contact selection must include chicken gizzard and condensed milk');
const boardIds=[...focus],addBoard=id=>{if(boardIds.length<63&&!boardIds.includes(id))boardIds.push(id);};
const families=[...new Set(rows.filter(r=>r.kind==='device').map(r=>r.familyId))];
for(const [i,family]of families.entries()){const forms=rows.filter(r=>r.kind==='device'&&r.familyId===family).sort((a,b)=>a.level-b.level);if(forms.length!==3)throw Error('Equipment family must have three forms');addBoard(forms[i%3].id);}
const buckets=['material','recipe','device'].map(kind=>rows.filter(r=>r.kind===kind));
for(let i=0;boardIds.length<63;i++)for(const bucket of buckets)if(bucket[i])addBoard(bucket[i].id);
const contacts=[];
for(const size of [96,40]){
 const cols=6,cellWidth=172,cellHeight=size+48,width=cols*cellWidth,height=48+4*cellHeight,layers=[],texts=[`<text x="18" y="28" font-size="15" font-weight="700">全量选用美术已接入 · 24项重点 / ${size}px</text>`];
 for(const [i,id]of focus.entries()){
  const row=byId.get(id),x=i%cols*cellWidth,y=48+Math.floor(i/cols)*cellHeight;
  layers.push({input:await sharp(await readFile(publicPath(formalMap.get(id).path))).resize(size,size).png().toBuffer(),left:Math.round(x+(cellWidth-size)/2),top:y});
  texts.push(`<text x="${x+cellWidth/2}" y="${y+size+17}" text-anchor="middle" font-size="10">${esc(row.code)}</text><text x="${x+cellWidth/2}" y="${y+size+33}" text-anchor="middle" font-size="10">${esc(row.name)}</text>`);
 }
 layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Microsoft YaHei,sans-serif" fill="#4d4033">${texts.join('')}</g></svg>`),left:0,top:0});
 const file=`contacts/round54-focus-${size}.png`;await sharp({create:{width,height,channels:4,background:'#fff4de'}}).composite(layers).png().toFile(path.join(site,file));contacts.push({size,path:file,width,height,ids:focus});
}
const reviewId=hash(JSON.stringify(['round54-selected-integration',rows.map(r=>[r.id,r.runtime.sha256,r.selected.sha256.source,r.expectedOccupancy,r.presentationStatus,r.presentation,r.approvalStatus]),currentSemantic])).slice(0,12);
const status='ALL_SELECTED_ARTWORK_INTEGRATED_PENDING_USER_ACCEPTANCE';
const manifest={title:'鹅巷食光 · 全量选用美术已接入',round:54,reviewId,status,sourceReviewId:'2e18f2110fc5',confirmedEquipmentReviewId:'967df250fb6c',counts,artworkSelectionState:'123道配方与78级器材的既定选用已固定；原料来源与早期展示状态原样保留',overallUserAcceptance:'PENDING_USER_ACCEPTANCE',overallPlanComplete:false,contentChecks,catalogSemantics:{before:beforeSemantic,after:currentSemantic,unchanged:true,excludedArtworkKeys:['assetPath']},runtimeManifestSha256:hash(formalBytes),registrySha256:hash(await readFile(registryFile)),contacts,focusIds:focus,boardIds,gameLinks:[{label:'后期场景',url:'/game/ui-preview.html?scenario=late&run=plan4-round54'},{label:'全部图鉴',url:'/game/ui-preview.html?scenario=complete&run=plan4-round54'},{label:'满棋盘',url:'/game/ui-preview.html?scenario=full&run=plan4-round54'},{label:'烹饪场景',url:'/game/ui-preview.html?scenario=cooking&run=plan4-round54'}],samples:rows};
await save(path.join(site,'round54.json'),manifest);await save(path.join(site,'samples.json'),manifest);
const template=await readFile(repoPath('scripts/build-plan4-round54.html'),'utf8');if(!template.includes('/*__ROUND54_DATA__*/'))throw Error('Round54 HTML data marker missing');
await writeFile(path.join(site,'index.html'),template.replace('/*__ROUND54_DATA__*/',JSON.stringify(manifest).replace(/</g,'\\u003c')));
await save(path.join(work,'checks.json'),{reviewId,status,counts,contentChecks,catalogSemantics:manifest.catalogSemantics,runtimeManifestSha256:manifest.runtimeManifestSha256,registrySha256:manifest.registrySha256,sourceAndExportFileChecks:fileChecks,board:{cells:63,uniqueIds:new Set(boardIds).size,sameIdSameLayout:true},contacts,verification:{generation:'PASSED',formalSelectedBytes:'PASSED',contentSemantics:'PASSED',browser:'NOT_RUN_BY_GENERATOR',fullTests:'NOT_RUN_BY_GENERATOR',productionBuild:'NOT_RUN_BY_GENERATOR',userAcceptance:'PENDING_USER_ACCEPTANCE',overallPlanComplete:false}});
console.log(JSON.stringify({reviewId,status,counts,contacts:contacts.map(({size,path,width,height})=>({size,path,width,height})),url:'http://127.0.0.1:5284/?round=54',generatorOnly:true},null,2));

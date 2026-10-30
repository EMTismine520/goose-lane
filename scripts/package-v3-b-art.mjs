import path from 'node:path';
import sharp from 'sharp';
import {readFile,writeFile,mkdir,readdir,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {measure,MEASURE_SIZE,svgGeometry,fitSvgViewport} from './b-art-lib.mjs';
const catalog=JSON.parse(await readFile('artwork/v3-b/catalog.json','utf8'));
const stageOnly=process.argv.includes('--stage-only'),map={},manifest=[];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
async function bitmapBounds(bytes){
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width,top=info.height,right=-1,bottom=-1,edgeAlpha=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const alpha=data[(y*info.width+x)*info.channels+info.channels-1];
  if(x===0||y===0||x===info.width-1||y===info.height-1)edgeAlpha=Math.max(edgeAlpha,alpha);
  if(alpha<=16)continue;
  left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
 }
 if(right<left)throw new Error('Selected image has no visible subject');
 return {left,top,width:right-left+1,height:bottom-top+1,edgeAlpha,canvasWidth:info.width,canvasHeight:info.height};
}
for(const dir of ['artwork/v3-b/runtime','artwork/v3-b/qa','art/v3-b/masters','public/assets/v3-b'])await mkdir(dir,{recursive:true});
for(const x of catalog){
 const source=await readFile(x.svg,'utf8'),sourceBox=svgGeometry(source);
 if(x.mode==='plan4-selected-export'){
  const selected=x.selectedExports;
  if(!selected?.sha256)throw new Error(`${x.id}: selected export provenance missing`);
  const files={};
  for(const key of ['source','png','image','highres']){
   if(!selected[key]||!selected.sha256[key])throw new Error(`${x.id}: selected ${key} provenance missing`);
   files[key]=await readFile(selected[key]);
   if(sha(files[key])!==selected.sha256[key])throw new Error(`${x.id}: selected ${key} hash differs`);
  }
  if(sha(source)!==selected.sha256.source||(x.originSha256&&x.originSha256!==selected.sha256.source))throw new Error(`${x.id}: selected SVG source differs`);
  const supplied=x.presentation;
  if(!supplied||![supplied.displaySize,supplied.offsetX,supplied.offsetY,supplied.svgSize].every(Number.isFinite)||supplied.displaySize<=0||supplied.svgSize!==sourceBox[2]||!Number.isFinite(x.expectedOccupancy)||x.expectedOccupancy<=0||x.expectedOccupancy>=1)throw new Error(`${x.id}: selected presentation differs`);
  const presentation={displaySize:supplied.displaySize,offsetX:supplied.offsetX,offsetY:supplied.offsetY,svgSize:supplied.svgSize};
  for(const key of ['png','image']){
   const metadata=await sharp(files[key]).metadata();
   if(metadata.width!==512||metadata.height!==512||!metadata.hasAlpha)throw new Error(`${x.id}: selected ${key} must be transparent 512x512`);
  }
  const bounds=await bitmapBounds(files.image),target=presentation.displaySize*x.expectedOccupancy,actual=Math.max(bounds.width,bounds.height)/bounds.canvasWidth*presentation.displaySize;
  if(bounds.edgeAlpha||Math.abs(actual-target)>.75)throw new Error(`${x.id}: selected bitmap visible-size mismatch ${actual}/${target}`);
  const pngPath=`art/v3-b/masters/${x.id}.png`,path=`assets/v3-b/${x.id}.webp`;
  // The accepted raster already includes size and intentional positioning. Never fit it again.
  await writeFile(pngPath,files.png);
  await writeFile('public/'+path,files.image);
  map[x.id]={path,...presentation};
  manifest.push({id:x.id,name:x.name,kind:x.kind,level:x.level??null,family:x.base??null,stage:x.kind==='device'&&x.level>1?Math.max(3,x.stage):x.stage,path,bytes:files.image.length,source:x.svg,rasterSource:pngPath,mode:x.mode,sha256:selected.sha256.image,sourceSha256:selected.sha256.source,rasterSha256:selected.sha256.png,origin:x.origin??selected.source,originSha256:selected.sha256.source,selectedExports:selected,selectionKind:x.selectionKind,expectedOccupancy:x.expectedOccupancy,sourceSelection:x.sourceSelection,approvalStatus:x.approvalStatus,...(x.presentationStatus?{presentationStatus:x.presentationStatus}:{}),targetVisibleSize:target,visibleSize:Number(actual.toFixed(4)),approvedPresentation:presentation,bitmapBounds:bounds});
  continue;
 }
 const plan4=x.mode==='plan4-approved-svg',displaySize=x.kind==='recipe'?38/.75:48;
 const target=plan4?displaySize*x.expectedOccupancy:x.kind==='device'?42:x.kind==='recipe'?38:x.name==='鸡蛋'?34:36;
 if(plan4&&(!Number.isFinite(x.expectedOccupancy)||x.expectedOccupancy<=0||x.expectedOccupancy>=1))throw new Error(`${x.id}: invalid approved occupancy`);
 if(plan4&&createHash('sha256').update(source).digest('hex')!==x.originSha256)throw new Error(`${x.id}: approved source no longer matches provenance`);
 const before=await measure(source);if(before.edgeAlpha&&x.mode!=='approved-svg-reuse')throw new Error(`${x.id}: source touches canvas edge`);
 let runtimeSvg=source,presentation;
 if(plan4){
   runtimeSvg=fitSvgViewport(source,before,x.expectedOccupancy);
   presentation={displaySize,offsetX:0,offsetY:-2,svgSize:sourceBox[2]};
 }else if(x.mode==='native-b-svg'){
   const side=Math.max(before.width,before.height)/MEASURE_SIZE*96/.75,cx=(before.left+before.width/2)/MEASURE_SIZE*96,cy=(before.top+before.height/2)/MEASURE_SIZE*96;
   runtimeSvg=source.replace(/viewBox="[^"]+"/,`viewBox="${(cx-side/2).toFixed(6)} ${(cy-side/2).toFixed(6)} ${side.toFixed(6)} ${side.toFixed(6)}"`);
   presentation={displaySize:target/.75,offsetX:0,offsetY:-2,svgSize:96};
 }else if(x.presentation)presentation={displaySize:x.presentation.displaySize,offsetX:x.presentation.offsetX,offsetY:x.presentation.offsetY,svgSize:x.presentation.svgSize};
 else {
   // Original opening SVGs include soft drop shadows. Preserve their exact source
   // paths while fitting an expanded runtime viewport to the same B clear-space rule.
   const broad=source.replace(/viewBox="[^"]+"/,'viewBox="-24 -24 144 144"'),m=await measure(broad),side=Math.max(m.width,m.height)/MEASURE_SIZE*144/.75,cx=-24+(m.left+m.width/2)/MEASURE_SIZE*144,cy=-24+(m.top+m.height/2)/MEASURE_SIZE*144;
   runtimeSvg=source.replace(/viewBox="[^"]+"/,`viewBox="${cx-side/2} ${cy-side/2} ${side} ${side}"`);
   presentation={displaySize:target/.75,offsetX:0,offsetY:-2,svgSize:96};
 }
 const runtimeSvgPath=`artwork/v3-b/runtime/${x.id}.svg`,pngPath=`art/v3-b/masters/${x.id}.png`,path=`assets/v3-b/${x.id}.webp`;
 await writeFile(runtimeSvgPath,runtimeSvg);
 const png=await sharp(Buffer.from(runtimeSvg)).resize(512,512).png().toBuffer();await writeFile(pngPath,png);
 const webp=await sharp(png).resize(256,256).webp({lossless:true,effort:4}).toBuffer();await writeFile('public/'+path,webp);
 const bounds=await measure(runtimeSvg),actual=Math.max(bounds.width,bounds.height)/MEASURE_SIZE*presentation.displaySize;
 if(bounds.edgeAlpha||Math.abs(actual-target)>.75)throw new Error(`${x.id}: visible-size mismatch ${actual}/${target}`);
 map[x.id]={path,...presentation};
 manifest.push({id:x.id,name:x.name,kind:x.kind,level:x.level??null,family:x.base??null,stage:x.kind==='device'&&x.level>1?Math.max(3,x.stage):x.stage,path,bytes:webp.length,source:x.svg,rasterSource:pngPath,runtimeSvg:runtimeSvgPath,mode:x.mode,sha256:createHash('sha256').update(webp).digest('hex'),sourceSha256:createHash('sha256').update(source).digest('hex'),...(x.origin?{origin:x.origin,originSha256:x.originSha256}:{}),...(plan4?{expectedOccupancy:x.expectedOccupancy,sourceSelection:x.sourceSelection,approvalStatus:x.approvalStatus}:{}),targetVisibleSize:target,visibleSize:Number(actual.toFixed(4)),...(x.presentation?{approvedPresentation:x.presentation}:{})});
}
await writeFile('artwork/v3-b/presentation.json',JSON.stringify(map,null,2)+'\n');
await writeFile('artwork/v3-b/manifest.json',JSON.stringify(manifest,null,2)+'\n');
if(!stageOnly){await writeFile('src/content/v3-art.json',JSON.stringify(map,null,2)+'\n');await writeFile('public/assets/v3-manifest.json',JSON.stringify(manifest,null,2)+'\n');}
for(const{size,kind}of[{size:32},{size:96},...['material','recipe','device'].map(kind=>({size:96,kind}))]){
 const subset=kind?manifest.filter(x=>x.kind===kind):manifest,cols=kind?8:12,cell=size+22,rows=Math.ceil(subset.length/cols),images=[];
 for(let i=0;i<subset.length;i++){images.push({input:await sharp('public/'+subset[i].path).resize(size).png().toBuffer(),left:i%cols*cell+11,top:Math.floor(i/cols)*cell+3});images.push({input:Buffer.from(`<svg width="${cell}" height="16"><text x="${cell/2}" y="11" text-anchor="middle" font-size="8" fill="#795438">${i+1}</text></svg>`),left:i%cols*cell,top:Math.floor(i/cols)*cell+size+4});}
 await sharp({create:{width:cols*cell,height:rows*cell,channels:4,background:'#fff3dd'}}).composite(images).png().toFile(`artwork/v3-b/qa/contact-${kind?kind+'-':''}${size}.png`);
}
const html=(await readFile('artwork/v3-b/review-template.html','utf8')).replace('__MANIFEST__',JSON.stringify(manifest));
await writeFile('artwork/v3-b/overview.html',html);
await writeFile('public/art-v4.html',html);
// Drop only obsolete generated runtime files; the V3 masters and exports were archived first.
for(const [directory,extension] of [['public/assets/v3-b','.webp'],['art/v3-b/masters','.png']]){
 const absolute=path.resolve(directory),wanted=new Set(catalog.map(x=>x.id+extension));
 for(const name of await readdir(absolute)){const target=path.resolve(absolute,name);if(path.dirname(target)!==absolute)throw new Error('Unexpected generated path');if(name.endsWith(extension)&&!wanted.has(name))await unlink(target);}
}
console.log(JSON.stringify({assets:manifest.length,approved:manifest.filter(x=>['approved-svg-reuse','plan4-approved-svg','plan4-selected-export'].includes(x.mode)).length,selectedExports:manifest.filter(x=>x.mode==='plan4-selected-export').length,newNative:manifest.filter(x=>x.mode==='native-b-svg').length,runtimeBytes:manifest.reduce((s,x)=>s+x.bytes,0),maxVisibleSizeError:Math.max(...manifest.map(x=>Math.abs(x.visibleSize-x.targetVisibleSize))),stageOnly},null,2));

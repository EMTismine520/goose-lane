import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {measure,MEASURE_SIZE,svgGeometry} from './b-art-lib.mjs';
const stageOnly=process.argv.includes('--stage-only');
const data=JSON.parse(await readFile('src/content/expansion-data.json','utf8'));
const base=JSON.parse(await readFile('artwork/v3-b/base-recipes.json','utf8'));
const entries=JSON.parse(await readFile(stageOnly?'artwork/v3-b/manifest.json':'public/assets/v3-manifest.json','utf8'));
const map=JSON.parse(await readFile(stageOnly?'artwork/v3-b/presentation.json':'src/content/v3-art.json','utf8'));
const expected=[...data.items.map(x=>x.id),...data.recipes.map(x=>x.output),...base.map(x=>x.id),...data.devices.flatMap(x=>[1,2,3].map(level=>`${x.id}-l${level}`))];
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
 if(right<left)throw new Error('Selected bitmap has no visible subject');
 return {left,top,width:right-left+1,height:bottom-top+1,edgeAlpha,canvasWidth:info.width,canvasHeight:info.height};
}
if(entries.length!==expected.length||Object.keys(map).length!==expected.length||new Set(entries.map(x=>x.id)).size!==expected.length)throw new Error('V4 art must cover every unique content entry');
const hashes=new Set();let bytes=0,maxError=0;
const baseline=JSON.parse(await readFile('output/v4-art-upgrade/before/manifest.json','utf8').catch(()=> '[]'));
let reworkedExisting=0;
for(const id of expected){
 const entry=entries.find(x=>x.id===id),presentation=map[id];
 if(!entry||presentation?.path!==entry.path||!entry.path.startsWith('assets/v3-b/'))throw new Error(`${id}: missing B runtime mapping`);
 if(!['native-b-svg','plan4-approved-svg','plan4-selected-export'].includes(entry.mode))throw new Error(`${id}: incorrect artwork mode`);
 const selected=entry.mode==='plan4-selected-export',source=await readFile(entry.source,'utf8'),sourceBox=svgGeometry(source);
 if(sha(source)!==entry.sourceSha256)throw new Error(`${id}: native source hash mismatch`);
 let runtimeSvg;
 if(!selected){
  runtimeSvg=await readFile(entry.runtimeSvg,'utf8');svgGeometry(runtimeSvg);
  if(source.replace(/viewBox=["'][^"']+["']/,'').trim()!==runtimeSvg.replace(/viewBox=["'][^"']+["']/,'').trim())throw new Error(`${id}: runtime changed native SVG geometry`);
 }
 if(selected){
   const exports=entry.selectedExports;
   if(!exports?.sha256)throw new Error(`${id}: selected export provenance missing`);
   if(!['new','original'].includes(entry.selectionKind))throw new Error(`${id}: selected artwork choice missing`);
   for(const key of ['source','png','image','highres']){
    if(!exports[key]||!exports.sha256[key]||sha(await readFile(exports[key]))!==exports.sha256[key])throw new Error(`${id}: selected ${key} provenance differs`);
   }
   if(entry.sourceSha256!==exports.sha256.source||entry.sha256!==exports.sha256.image||entry.rasterSha256!==exports.sha256.png||!entry.origin||sha(await readFile(entry.origin))!==exports.sha256.source||entry.originSha256!==exports.sha256.source)throw new Error(`${id}: selected source or export identity differs`);
   const approved=entry.approvedPresentation;
   if(!approved||![presentation.displaySize,presentation.offsetX,presentation.offsetY,presentation.svgSize].every(Number.isFinite)||presentation.displaySize<=0||presentation.svgSize!==sourceBox[2]||['displaySize','offsetX','offsetY','svgSize'].some(key=>presentation[key]!==approved[key])||!Number.isFinite(entry.expectedOccupancy)||entry.expectedOccupancy<=0||entry.expectedOccupancy>=1||Math.abs(entry.targetVisibleSize-presentation.displaySize*entry.expectedOccupancy)>.00001)throw new Error(`${id}: selected presentation differs`);
 }else if(entry.mode==='plan4-approved-svg'){
   if(!entry.origin||sha(await readFile(entry.origin))!==entry.originSha256||entry.sourceSha256!==entry.originSha256)throw new Error(`${id}: approved source provenance differs`);
   const displaySize=entry.kind==='recipe'?38/.75:48;
   if(!Number.isFinite(entry.expectedOccupancy)||entry.expectedOccupancy<=0||entry.expectedOccupancy>=1||Math.abs(presentation.displaySize-displaySize)>.00001||presentation.offsetX!==0||presentation.offsetY!==-2||presentation.svgSize!==svgGeometry(source)[2]||Math.abs(entry.targetVisibleSize-displaySize*entry.expectedOccupancy)>.00001)throw new Error(`${id}: approved presentation differs`);
 }
 const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 if(new Set(ids).size!==ids.length)throw new Error(`${id}: duplicate SVG definition IDs`);
 for(const m of source.matchAll(/url\(#([^)]+)\)/g))if(!ids.includes(m[1]))throw new Error(`${id}: missing SVG definition ${m[1]}`);
 const old=baseline.find(x=>x.id===id);if(old){if(!selected&&old.sha256===entry.sha256)throw new Error(id+': V4 still uses its old runtime artwork');if(old.sha256!==entry.sha256)reworkedExisting++;}
 const png=await readFile(entry.rasterSource),raster=await sharp(png).metadata(),webp=await readFile('public/'+entry.path),image=await sharp(webp).metadata();
 const runtimeSize=selected?512:256;
 if(raster.width!==512||raster.height!==512||!raster.hasAlpha||image.width!==runtimeSize||image.height!==runtimeSize||!image.hasAlpha)throw new Error(`${id}: dimensions or alpha`);
 if(selected&&sha(png)!==entry.selectedExports.sha256.png)throw new Error(`${id}: selected PNG bytes differ`);
 if(sha(webp)!==entry.sha256||hashes.has(entry.sha256))throw new Error(`${id}: runtime hash mismatch or duplicate artwork`);hashes.add(entry.sha256);
 const bounds=selected?await bitmapBounds(webp):await measure(runtimeSvg),actual=Math.max(bounds.width,bounds.height)/(selected?bounds.canvasWidth:MEASURE_SIZE)*presentation.displaySize,error=Math.abs(actual-entry.targetVisibleSize);maxError=Math.max(maxError,error);
 if(bounds.edgeAlpha||error>.75)throw new Error(`${id}: visible size or padding ${actual}/${entry.targetVisibleSize}`);
 const {data:p,info}=await sharp(webp).ensureAlpha().raw().toBuffer({resolveWithObject:true});let visible=0,edge=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const a=p[(y*info.width+x)*4+3];if(a>32)visible++;if(x===0||y===0||x===info.width-1||y===info.height-1)edge=Math.max(edge,a);}
 if(visible<300||edge>0)throw new Error(`${id}: empty or clipped runtime`);
 if(!Number.isInteger(entry.stage)||entry.stage<1||entry.stage>8)throw new Error(`${id}: invalid theme`);
 bytes+=webp.length;
}
const selectedExports=entries.filter(row=>row.mode==='plan4-selected-export').length;
if(!selectedExports&&bytes>8*1024*1024)throw new Error(`B runtime art exceeds 8MiB: ${bytes}`);
console.log(JSON.stringify({assets:entries.length,chainNodes:data.items.length,recipeOutputs:data.recipes.length+base.length,equipmentForms:data.devices.length*3,originalAssetsReused:entries.filter(row=>row.mode==='plan4-selected-export'&&row.selectionKind==='original').length,newNativeSvg:entries.filter(row=>row.mode==='native-b-svg').length,plan4ApprovedSvg:entries.filter(row=>row.mode==='plan4-approved-svg').length,selectedExports,reworkedExisting,runtimeBytes:bytes,maxVisibleSizeError:Number(maxError.toFixed(4)),source:'editable native SVG + 512x512 PNG',runtime:selectedExports?'selected 512x512 exports preserved byte-identically; legacy 256x256 where present':'256x256 lossless transparent WebP',uniqueHashes:hashes.size,stageOnly},null,2));

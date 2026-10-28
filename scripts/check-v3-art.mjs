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
if(entries.length!==expected.length||Object.keys(map).length!==expected.length||new Set(entries.map(x=>x.id)).size!==expected.length)throw new Error('V4 art must cover every unique content entry');
const hashes=new Set();let bytes=0,maxError=0;
const baseline=JSON.parse(await readFile('output/v4-art-upgrade/before/manifest.json','utf8').catch(()=> '[]'));
let reworkedExisting=0;
for(const id of expected){
 const entry=entries.find(x=>x.id===id),presentation=map[id];
 if(!entry||presentation?.path!==entry.path||!entry.path.startsWith('assets/v3-b/'))throw new Error(`${id}: missing B runtime mapping`);
 if(entry.mode!=='native-b-svg')throw new Error(`${id}: incorrect artwork mode`);
 const source=await readFile(entry.source,'utf8'),runtimeSvg=await readFile(entry.runtimeSvg,'utf8');svgGeometry(source);svgGeometry(runtimeSvg);
 if(source.replace(/viewBox="[^"]+"/,'').trim()!==runtimeSvg.replace(/viewBox="[^"]+"/,'').trim())throw new Error(`${id}: runtime changed native SVG geometry`);
 if(sha(source)!==entry.sourceSha256)throw new Error(`${id}: native source hash mismatch`);
 const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 if(new Set(ids).size!==ids.length)throw new Error(`${id}: duplicate SVG definition IDs`);
 for(const m of source.matchAll(/url\(#([^)]+)\)/g))if(!ids.includes(m[1]))throw new Error(`${id}: missing SVG definition ${m[1]}`);
 const old=baseline.find(x=>x.id===id);if(old){if(old.sha256===entry.sha256)throw new Error(id+': V4 still uses its old runtime artwork');reworkedExisting++;}
 const png=await readFile(entry.rasterSource),raster=await sharp(png).metadata(),webp=await readFile('public/'+entry.path),image=await sharp(webp).metadata();
 if(raster.width!==512||raster.height!==512||!raster.hasAlpha||image.width!==256||image.height!==256||!image.hasAlpha)throw new Error(`${id}: dimensions or alpha`);
 if(sha(webp)!==entry.sha256||hashes.has(entry.sha256))throw new Error(`${id}: runtime hash mismatch or duplicate artwork`);hashes.add(entry.sha256);
 const bounds=await measure(runtimeSvg),actual=Math.max(bounds.width,bounds.height)/MEASURE_SIZE*presentation.displaySize,error=Math.abs(actual-entry.targetVisibleSize);maxError=Math.max(maxError,error);
 if(bounds.edgeAlpha||error>.75)throw new Error(`${id}: visible size or padding ${actual}/${entry.targetVisibleSize}`);
 const {data:p,info}=await sharp(webp).ensureAlpha().raw().toBuffer({resolveWithObject:true});let visible=0,edge=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const a=p[(y*info.width+x)*4+3];if(a>32)visible++;if(x===0||y===0||x===info.width-1||y===info.height-1)edge=Math.max(edge,a);}
 if(visible<300||edge>0)throw new Error(`${id}: empty or clipped runtime`);
 if(!Number.isInteger(entry.stage)||entry.stage<1||entry.stage>8)throw new Error(`${id}: invalid theme`);
 bytes+=webp.length;
}
if(bytes>8*1024*1024)throw new Error(`B runtime art exceeds 8MiB: ${bytes}`);
console.log(JSON.stringify({assets:entries.length,chainNodes:data.items.length,recipeOutputs:data.recipes.length+base.length,equipmentForms:data.devices.length*3,originalAssetsReused:0,newNativeSvg:entries.length,reworkedExisting,runtimeBytes:bytes,maxVisibleSizeError:Number(maxError.toFixed(4)),source:'editable native 96-unit SVG + 512x512 PNG',runtime:'256x256 lossless transparent WebP',uniqueHashes:hashes.size,stageOnly},null,2));

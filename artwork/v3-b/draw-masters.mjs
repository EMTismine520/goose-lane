// Complete B-style collection. Approved assets are copied byte-for-byte;
// additions are composed from editable vector shapes in the same native system.
import { readFile,writeFile,mkdir,copyFile } from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {defs,ink} from './primitives.mjs';
import {material} from './materials.mjs';
import {recipe} from './recipes.mjs';
import {device} from './devices.mjs';
import {measure,MEASURE_SIZE} from '../../scripts/b-art-lib.mjs';
const data=JSON.parse(await readFile('src/content/expansion-data.json','utf8'));
const baseRecipes=JSON.parse(await readFile('artwork/v3-b/base-recipes.json','utf8'));
const b=JSON.parse(await readFile('src/content/b-art.json','utf8'));
const bCatalog=JSON.parse(await readFile('artwork/b/catalog.json','utf8'));
const dir='artwork/v3-b/masters';await mkdir(dir,{recursive:true});
const svg=(name,body,transform='')=>`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><title>${name} · B暖色卡通原生SVG</title><defs>${defs()}</defs><g stroke="${ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"${transform?' transform="'+transform+'"':''}>${body}</g></svg>\n`;
const oldNode=x=>['fresh-veg','fresh-fruit','fresh-beast'].includes(x.chain)||x.chain==='fresh-poultry'&&x.level<=7||x.chain==='fresh-spice'&&x.level<=7;
const originalFamilies=['vegetable-cart','fruit-cart','beast-meat-cart','poultry-cart','spice-box','chopping-board','fruit-press','home-cooking-pot'];
const rawMap=new Map(),entries=[];
const originalFile=(id,device=false)=>'public/'+(b[id]?.path??`assets/${device?'entities':'items'}/${id}.svg`);
const inner=s=>s.replace(/^\s*<svg\b[^>]*>/,'').replace(/<\/svg>\s*$/,'').replace(/<defs>[\s\S]*?<\/defs>/g,'').replace(/<title>[\s\S]*?<\/title>/g,'');
const reused=[...data.items.filter(oldNode).map(x=>({...x,kind:'material',origin:originalFile(x.id)})),...baseRecipes.map(x=>({...x,kind:'recipe',origin:originalFile(x.id)})),...data.devices.filter(x=>originalFamilies.includes(x.id)).map(x=>({...x,id:x.id+'-l1',base:x.id,kind:'device',level:1,origin:originalFile(x.id,true)}))];
for(const x of reused){const source=await readFile(x.origin,'utf8');rawMap.set(x.kind==='device'?'device:'+x.base:x.name,inner(source));await copyFile(x.origin,`${dir}/${x.id}.svg`);const preset=b[x.base??x.id];entries.push({...x,svg:`${dir}/${x.id}.svg`,mode:'approved-svg-reuse',originSha256:createHash('sha256').update(source).digest('hex'),...(preset?{presentation:preset}:{})});}
for(const x of data.items.filter(x=>!oldNode(x)))rawMap.set(x.name,material(x.name));
const raw=name=>{const v=rawMap.get(name);if(!v)throw new Error(`Missing ingredient geometry: ${name}`);return v;};
const additions=[...data.items.filter(x=>!oldNode(x)).map(x=>({...x,kind:'material',body:raw(x.name)})),...data.recipes.map(x=>({...x,id:x.output,kind:'recipe',body:recipe(x.name,raw)})),...data.devices.flatMap(x=>[1,2,3].filter(level=>level!==1||!originalFamilies.includes(x.id)).map(level=>({...x,id:x.id+'-l'+level,base:x.id,level,kind:'device',body:device(x.id,level,raw)})))];
for(const x of additions){
 // Measure an expanded view first so even long handles remain intact before fitting.
 const broad=svg(x.name,x.body).replace('viewBox="0 0 96 96"','viewBox="-24 -24 144 144"'),bounds=await measure(broad);
 const longest=Math.max(bounds.width,bounds.height)/MEASURE_SIZE*144,scale=80/longest,cx=-24+(bounds.left+bounds.width/2)/MEASURE_SIZE*144,cy=-24+(bounds.top+bounds.height/2)/MEASURE_SIZE*144;
 const transform=`translate(${(48-cx*scale).toFixed(5)} ${(48-cy*scale).toFixed(5)}) scale(${scale.toFixed(6)})`;
 const source=svg(x.name,x.body,transform);await writeFile(`${dir}/${x.id}.svg`,source);
 const {body,...metadata}=x;entries.push({...metadata,svg:`${dir}/${x.id}.svg`,mode:'native-b-svg',design:'96-unit editable geometry; approved B palette, 2.4-unit outline and soft highlights'});
}
if(entries.length!==311||new Set(entries.map(x=>x.id)).size!==311)throw new Error(`B art count mismatch: ${entries.length}`);
await writeFile('artwork/v3-b/catalog.json',JSON.stringify(entries,null,2)+'\n');
console.log(JSON.stringify({assets:entries.length,unchangedApproved:reused.length,newNative:additions.length}));

// V4 collection: every item is authored in the shared vector language, without legacy bitmap reuse.
import {readFile,writeFile,mkdir,readdir,unlink,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {defs,ink} from './primitives.mjs';
import {material} from './materials.mjs';
import {recipe} from './recipes.mjs';
import {device} from './devices.mjs';
import {measure,MEASURE_SIZE} from '../../scripts/b-art-lib.mjs';
import sharp from 'sharp';

const data=JSON.parse(await readFile('src/content/expansion-data.json','utf8'));
const base=JSON.parse(await readFile('artwork/v3-b/base-recipes.json','utf8'));
const sample=process.argv.includes('--sample');
const output='output/v4-art-upgrade';
await mkdir(output+'/before',{recursive:true});
for(const name of ['contact-32.png','contact-96.png','contact-device-96.png']){
 const target=output+'/before/'+name;
 try{await readFile(target);}catch{await copyFile('artwork/v3-b/qa/'+name,target);}
}
try{await readFile(output+'/before/manifest.json');}catch{await copyFile('public/assets/v3-manifest.json',output+'/before/manifest.json');}
const rawMap=new Map(data.items.map(x=>[x.name,material(x.name)]));
const raw=name=>{const shape=rawMap.get(name);if(!shape)throw new Error('Missing ingredient geometry: '+name);return shape;};
const entries=[...data.items.map(x=>({...x,kind:'material',body:raw(x.name)})),...base.map(x=>({...x,kind:'recipe',body:recipe(x.name,raw)})),...data.recipes.map(x=>({...x,id:x.output,kind:'recipe',body:recipe(x.name,raw)})),...data.devices.flatMap(x=>[1,2,3].map(level=>({...x,id:x.id+'-l'+level,base:x.id,level,kind:'device',body:device(x.id,level,raw)})))];
const expected=data.items.length+base.length+data.recipes.length+data.devices.length*3;
if(entries.length!==expected||new Set(entries.map(x=>x.id)).size!==expected)throw new Error('V4 collection identities are incomplete');
const sampleIds=new Set(['beast-meat-cart','poultry-cart','coffee-grinder','tea-caddy'].flatMap(id=>[1,2,3].map(l=>id+'-l'+l)));
['oven-l1','microwave-l1','fresh-veg-1','fresh-veg-3','fresh-spice-1','fresh-beast-2','fresh-beast-4','fresh-beast-8','fresh-poultry-4','fresh-poultry-5','fresh-poultry-6','fresh-fruit-4','fresh-exotic-1','fresh-exotic-8'].forEach(id=>sampleIds.add(id));
for(const x of data.items.filter(x=>['fresh-coffee','fresh-tea'].includes(x.chain)))sampleIds.add(x.id);
const selected=sample?entries.filter(x=>sampleIds.has(x.id)):entries;
const dir=sample?output+'/samples/masters':'artwork/v3-b/masters';
await mkdir(dir,{recursive:true});
const svg=(name,body,transform='')=>'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><title>'+name+' · V4精致暖色卡通</title><defs>'+defs()+'</defs><g stroke="'+ink+'" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"'+(transform?' transform="'+transform+'"':'')+'>'+body+'</g></svg>\n';
const catalog=[];
for(const x of selected){
 const broad=svg(x.name,x.body).replace('viewBox="0 0 96 96"','viewBox="-24 -24 144 144"');
 const bounds=await measure(broad);
 if(bounds.edgeAlpha)throw new Error('Expanded design canvas clips '+x.id);
 const longest=Math.max(bounds.width,bounds.height)/MEASURE_SIZE*144,scale=80/longest;
 const cx=-24+(bounds.left+bounds.width/2)/MEASURE_SIZE*144,cy=-24+(bounds.top+bounds.height/2)/MEASURE_SIZE*144;
 const transform='translate('+(48-cx*scale).toFixed(5)+' '+(48-cy*scale).toFixed(5)+') scale('+scale.toFixed(6)+')';
 await writeFile(dir+'/'+x.id+'.svg',svg(x.name,x.body,transform));
 const {body,...metadata}=x;
 catalog.push({...metadata,svg:dir+'/'+x.id+'.svg',mode:'native-b-svg',design:'V4: dedicated silhouette, upper-left light, warm ink, material-specific volume; editable 96-unit vectors'});
}
if(sample){
 for(const mode of ['color','gray','silhouette']){
  const size=mode==='color'?64:40,cell=size+30,cols=7,rows=Math.ceil(catalog.length/cols),layers=[];
  for(let i=0;i<catalog.length;i++){
   let im=sharp(Buffer.from(await readFile(catalog[i].svg))).resize(size,size);
   if(mode==='gray')im=im.grayscale();
   if(mode==='silhouette')im=im.tint('#624737').linear(0,80);
   layers.push({input:await im.png().toBuffer(),left:i%cols*cell+15,top:Math.floor(i/cols)*cell+3});
   layers.push({input:Buffer.from('<svg width="'+cell+'" height="23"><text x="'+cell/2+'" y="12" text-anchor="middle" font-family="Microsoft YaHei, sans-serif" font-size="9" fill="#624737">'+catalog[i].name+(catalog[i].level?' L'+catalog[i].level:'')+'</text></svg>'),left:i%cols*cell,top:Math.floor(i/cols)*cell+size+6});
  }
  await sharp({create:{width:cols*cell,height:rows*cell,channels:4,background:'#fff5df'}}).composite(layers).png().toFile(output+'/samples/'+mode+'.png');
 }
 await writeFile(output+'/samples/catalog.json',JSON.stringify(catalog,null,2)+'\n');
}else{
 await writeFile('artwork/v3-b/catalog.json',JSON.stringify(catalog,null,2)+'\n');
 // Only remove obsolete generated SVGs in these exact directories; originals are archived before generation.
 const wanted=new Set(catalog.map(x=>x.id+'.svg'));
 for(const directory of ['artwork/v3-b/masters','artwork/v3-b/runtime']){
  const absolute=path.resolve(directory);
  for(const name of await readdir(absolute)){
   const target=path.resolve(absolute,name);
   if(path.dirname(target)!==absolute)throw new Error('Unexpected generated artwork path');
   if(name.endsWith('.svg')&&!wanted.has(name))await unlink(target);
  }
 }
}
console.log(JSON.stringify({version:data.version,sample,assets:catalog.length,expected,originalAssetsReused:0,output:dir}));

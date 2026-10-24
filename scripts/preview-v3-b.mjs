import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {measure,MEASURE_SIZE} from './b-art-lib.mjs';
const b=JSON.parse(await readFile('src/content/b-art.json','utf8'));
const refs=JSON.parse(await readFile('artwork/b/catalog.json','utf8'));
const ids=['fresh-sea-11','dish-fresh-ico-0009','dish-fresh-ico-0100','blender-l1','steamer-l1','drink-fridge-l1'];
const entries=[];
for(const id of ids){let s=await readFile(`artwork/v3-b/masters/${id}.svg`,'utf8');const m=await measure(s),side=Math.max(m.width,m.height)/MEASURE_SIZE*96/.75,cx=(m.left+m.width/2)/MEASURE_SIZE*96,cy=(m.top+m.height/2)/MEASURE_SIZE*96;s=s.replace(/viewBox="[^"]+"/,`viewBox="${cx-side/2} ${cy-side/2} ${side} ${side}"`);entries.push({id,source:s,kind:'new'});}
for(const x of refs)entries.push({id:x.id,source:await readFile('public/'+b[x.id].path,'utf8'),kind:'approved'});
await mkdir('artwork/v3-b/qa',{recursive:true});
for(const size of [32,96]){const cell=size+22,cols=8,rows=Math.ceil(entries.length/cols),composite=[];for(let i=0;i<entries.length;i++){const image=await sharp(Buffer.from(entries[i].source)).resize(512).png().toBuffer();composite.push({input:await sharp(image).resize(size).png().toBuffer(),left:i%cols*cell+11,top:Math.floor(i/cols)*cell+3});composite.push({input:Buffer.from(`<svg width="${cell}" height="16"><text text-anchor="middle" x="${cell/2}" y="11" font-size="8" fill="#795438">${i+1}${entries[i].kind==='new'?' NEW':''}</text></svg>`),left:i%cols*cell,top:Math.floor(i/cols)*cell+size+4});}await sharp({create:{width:cols*cell,height:rows*cell,channels:4,background:'#fff3dd'}}).composite(composite).png().toFile(`artwork/v3-b/qa/calibration-${size}.png`);}
await writeFile('artwork/v3-b/qa/calibration.json',JSON.stringify(entries.map(({id,kind},i)=>({index:i+1,id,kind})),null,2));
console.log('B comparison: 6 new silhouettes + 38 unchanged approved originals, 32px and 96px');

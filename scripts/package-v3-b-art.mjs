import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {measure,MEASURE_SIZE,svgGeometry} from './b-art-lib.mjs';
const catalog=JSON.parse(await readFile('artwork/v3-b/catalog.json','utf8'));
const stageOnly=process.argv.includes('--stage-only'),map={},manifest=[];
for(const dir of ['artwork/v3-b/runtime','artwork/v3-b/qa','art/v3-b/masters','public/assets/v3-b'])await mkdir(dir,{recursive:true});
for(const x of catalog){
 const source=await readFile(x.svg,'utf8');svgGeometry(source);
 const target=x.kind==='device'?42:x.kind==='recipe'?38:x.name==='鸡蛋'?34:36;
 const before=await measure(source);if(before.edgeAlpha&&x.mode!=='approved-svg-reuse')throw new Error(`${x.id}: source touches canvas edge`);
 let runtimeSvg=source,presentation;
 if(x.mode==='native-b-svg'){
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
 manifest.push({id:x.id,name:x.name,kind:x.kind,stage:x.kind==='device'&&x.level>1?Math.max(3,x.stage):x.stage,path,bytes:webp.length,source:x.svg,rasterSource:pngPath,runtimeSvg:runtimeSvgPath,mode:x.mode,sha256:createHash('sha256').update(webp).digest('hex'),sourceSha256:createHash('sha256').update(source).digest('hex'),...(x.origin?{origin:x.origin,originSha256:x.originSha256}:{}),targetVisibleSize:target,visibleSize:Number(actual.toFixed(4)),...(x.presentation?{approvedPresentation:x.presentation}:{})});
}
await writeFile('artwork/v3-b/presentation.json',JSON.stringify(map,null,2)+'\n');
await writeFile('artwork/v3-b/manifest.json',JSON.stringify(manifest,null,2)+'\n');
if(!stageOnly){await writeFile('src/content/v3-art.json',JSON.stringify(map,null,2)+'\n');await writeFile('public/assets/v3-manifest.json',JSON.stringify(manifest,null,2)+'\n');}
for(const{size,kind}of[{size:32},{size:96},...['material','recipe','device'].map(kind=>({size:96,kind}))]){
 const subset=kind?manifest.filter(x=>x.kind===kind):manifest,cols=kind?8:12,cell=size+22,rows=Math.ceil(subset.length/cols),images=[];
 for(let i=0;i<subset.length;i++){images.push({input:await sharp('public/'+subset[i].path).resize(size).png().toBuffer(),left:i%cols*cell+11,top:Math.floor(i/cols)*cell+3});images.push({input:Buffer.from(`<svg width="${cell}" height="16"><text x="${cell/2}" y="11" text-anchor="middle" font-size="8" fill="#795438">${i+1}</text></svg>`),left:i%cols*cell,top:Math.floor(i/cols)*cell+size+4});}
 await sharp({create:{width:cols*cell,height:rows*cell,channels:4,background:'#fff3dd'}}).composite(images).png().toFile(`artwork/v3-b/qa/contact-${kind?kind+'-':''}${size}.png`);
}
const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>鹅巷食光 · B暖色卡通图鉴美术</title><style>body{margin:0;background:#fff3dd;color:#795438;font:15px/1.6 system-ui,sans-serif}header{padding:20px;position:sticky;top:0;background:#fff3dded;border-bottom:1px solid #d6bc92}h1{margin:0;font-size:22px}p{margin:6px 0 12px}input,select{padding:8px;border:1px solid #c4a77d;border-radius:8px;background:#fff8e6;color:inherit;font:inherit}main{padding:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px}article{text-align:center;padding:12px 4px;border:1px solid #dcc59f;border-radius:10px;background:#fff8e8}img{width:var(--size,96px);height:var(--size,96px);object-fit:contain}small{display:block;font-size:10px;word-break:break-all}</style><header><h1>B暖色卡通 · 311项完整图鉴美术</h1><p>62项原样复用，249项延续原生SVG系统；材料36、料理38、设备42设计可见尺寸，鸡蛋34。</p><input id="q" aria-label="搜索" placeholder="名称 / ID"><select id="kind" aria-label="类别"><option value="">全部</option><option value="material">合成节点</option><option value="recipe">料理饮品</option><option value="device">设备等级</option></select><select id="size" aria-label="尺寸"><option>96</option><option>64</option><option>32</option></select> <span id="count"></span></header><main id="grid"></main><script>const data=${JSON.stringify(manifest)},prefix=location.protocol==='file:'?'../../public/':'../../';function render(){const q=document.querySelector('#q').value.toLowerCase(),kind=document.querySelector('#kind').value;document.documentElement.style.setProperty('--size',document.querySelector('#size').value+'px');const rows=data.filter(x=>(!kind||x.kind===kind)&&(!q||(x.id+' '+x.name).toLowerCase().includes(q)));document.querySelector('#count').textContent=rows.length+' / 311';document.querySelector('#grid').replaceChildren(...rows.map(x=>{const a=document.createElement('article'),im=document.createElement('img'),n=document.createElement('div'),s=document.createElement('small');im.src=prefix+x.path;im.alt=x.name;im.loading='lazy';n.textContent=x.name;s.textContent=x.id+' · '+x.mode;a.append(im,n,s);return a}));}document.querySelectorAll('input,select').forEach(x=>x.addEventListener('input',render));render()</script></html>`;
await writeFile('artwork/v3-b/overview.html',html);
console.log(JSON.stringify({assets:manifest.length,approved:manifest.filter(x=>x.mode==='approved-svg-reuse').length,newNative:manifest.filter(x=>x.mode==='native-b-svg').length,runtimeBytes:manifest.reduce((s,x)=>s+x.bytes,0),maxVisibleSizeError:Math.max(...manifest.map(x=>Math.abs(x.visibleSize-x.targetVisibleSize))),stageOnly},null,2));

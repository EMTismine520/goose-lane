import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Only outline the two root-authored foods. Approved geometry and fills stay verbatim.
const archive = 'output/plan4-food-review/checkpoints/dac74a498613/site/sources/';
const destination = 'artwork/plan4-food/outlined/';
const output = 'output/plan4-outline-review/';
const ink = '#2b211c';
const path = (d, extra = '') => `<path d="${d}" ${extra}/>`;
const ellipse = (cx, cy, rx, ry, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${extra}/>`;

const cucumber = `<g transform="translate(126 126) rotate(-37)">
${path('M-107-10L-107 12C-98 35-54 51 0 51 59 49 105 30 109 2L108-15','stroke-width="3.1"')}
${ellipse(0,-10,107,40,'stroke-width="2.75"')}
${ellipse(0,-12,100,34,'stroke-width="1.25"')}
</g>`;

const steakTop = 'M49 109q12-35 55-34 40-6 62 26 7 16-16 29-32 25-71 12-34-8-30-33Z';
const steakBody = 'M51 112q14-37 55-35 44-8 62 29l-6 37q-33 34-78 18-38-9-33-49Z';
const sliceOutline = 'M-39-13 19-23l18 19-3 17-57 12-19-17Z';
const potato = 'M-17-10Q-10-24 5-19L19-4q4 15-15 23-20-2-21-29Z';
const potatoes = [[170,105,-14],[192,117,25],[180,136,12]];
const potatoShape = (i, extra) => { const [x,y,a]=potatoes[i]; return `<g transform="translate(${x} ${y}) rotate(${a})">${path(potato,extra)}</g>`; };
const potatoShapes = extra => potatoes.map((_,i) => potatoShape(i,extra)).join('');
const sliceMask = `<g transform="translate(91 161) rotate(-6)">${path(sliceOutline,'fill="#000" stroke="#000" stroke-width="1.7"')}</g>`;
const asparagusMask = [0,1,2].map(i => `<g transform="translate(${184+i*10} ${161-i*5}) rotate(28)">${path('M-3 20 1-36l8 1-2 55Z','fill="#000" stroke="#000" stroke-width="1.4"')}${path('M1-34-2-42l6-15 7 14-2 9Z','fill="#000" stroke="#000" stroke-width="1.4"')}</g>`).join('');
const mask = (id, obscured) => `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256"><rect x="0" y="0" width="256" height="256" fill="#fff" stroke="none"/>${obscured}</mask>`;
const meatMask = path(steakBody,'fill="#000" stroke="#000" stroke-width="2"') + path(steakTop,'fill="#000" stroke="#000" stroke-width="2"');
const steak = `<defs>
${mask('p4-steak-plate-visible',meatMask+sliceMask+potatoShapes('fill="#000" stroke="#000" stroke-width="1.5"')+asparagusMask)}
${mask('p4-steak-main-visible',sliceMask)}
${potatoes.map((_,i)=>mask('p4-steak-potato-visible-'+i,meatMask+sliceMask+asparagusMask+potatoes.slice(i+1).map((_,j)=>potatoShape(i+j+1,'fill="#000" stroke="#000" stroke-width="1.5"')).join(''))).join('')}
</defs>
<g mask="url(#p4-steak-plate-visible)">
${ellipse(128,174,109,53,'stroke-width="2.6"')}
${ellipse(128,167,111,53,'stroke-width="1.35"')}
</g>
${potatoes.map((_,i)=>`<g mask="url(#p4-steak-potato-visible-${i})" stroke-width="1.4">${potatoShape(i,'')}</g>`).join('')}
<g mask="url(#p4-steak-main-visible)">
${path(steakTop,'stroke-width="3.05"')}
${path('M166 110l-4 33q-33 34-78 18','stroke-width="1.8"')}
</g>
<g transform="translate(91 161) rotate(-6)">
${path(sliceOutline,'stroke-width="2.85"')}
${path('M-39-13 19-23 37-4-20 9Z','stroke-width="1.4"')}
</g>`;

await mkdir(destination,{recursive:true});
await mkdir(output,{recursive:true});
const records = [], layers = [];
for (const [i, [id, name, outlines]] of [['fresh-veg-2','黄瓜',cucumber],['dish-fresh-ico-0085','红酒酱牛排',steak]].entries()) {
  const base = await readFile(archive+id+'.svg','utf8');
  const added = `<!-- plan4:outline:start --><g id="plan4-outline" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round">${outlines}</g><!-- plan4:outline:end -->`;
  const svg = base.replace('</svg>',added+'</svg>');
  if(svg.replace(/<!-- plan4:outline:start -->[\s\S]*?<!-- plan4:outline:end -->/,'')!==base)throw new Error(id+': approved base changed');
  await writeFile(destination+id+'.svg',svg);
  const png = await sharp(Buffer.from(svg)).resize(512,512).png().toBuffer();
  await writeFile(output+id+'.png',png);
  for(const [column,source]of [base,svg].entries())layers.push({input:await sharp(Buffer.from(source)).resize(256,256).png().toBuffer(),left:column*280+12,top:i*280+12});
  records.push({id,name,baseReviewId:'dac74a498613',baseSha256:createHash('sha256').update(base).digest('hex'),sourceSha256:createHash('sha256').update(svg).digest('hex'),basePreserved:true,outlineColor:ink,mainStrokeRange:[2.6,3.1],previousMainStrokeRange:[5.1,5.8],adjustment:'参考原有美术的视觉重量收细；只改可见描边线宽，遮罩与所有形状和填色保持'});
}
await sharp({create:{width:560,height:560,channels:4,background:'#fff4df'}}).composite(layers).png().toFile(output+'root-before-after.png');
await writeFile(destination+'root-outline-notes.json',JSON.stringify(records,null,2)+'\n');
console.log(JSON.stringify(records,null,2));

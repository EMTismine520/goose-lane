// Round 53: open drink-preparation worktables, not enclosed bottle or ice-storage cabinets.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const r=(x,y,w,h,rx,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line=(d,c,w=1.5,o=1)=>p(d,'none',`stroke="${c}" stroke-width="${w}" opacity="${o}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".1" y1="0" x2=".86" y2="1">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const defs=id=>grad(`${id}-wood`,['#c8a17a','#a67b55','#79543e'])
 +grad(`${id}-side`,['#ac855e','#8a633f','#654735'])
 +grad(`${id}-green`,['#7caa8e','#527f69','#315c4c'])
 +grad(`${id}-brass`,['#f3dda2','#d8b979','#af8b50'])
 +grad(`${id}-metal`,['#f1f7ed','#cadbd4','#8daaa4'])
 +grad(`${id}-glass`,['#f8fff5','#dfefe9','#9cc7cb'])
 +grad(`${id}-bottle`,['#92b398','#618873','#355e51'])
 +grad(`${id}-ice`,['#f5fffb','#cbe6e9','#9fc9d4'])
 +grad(`${id}-coral`,['#ffd2b7','#eda98d','#cf8570']);
const doc=(id,art,dx,dy)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>调饮台 · 胡桃木翠绿开放工作台候选</title><defs>${defs(id)}</defs><g transform="translate(${dx} ${dy})" stroke="#443a30" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
const shaker=(id,x,bottom,s=1)=>`<g transform="translate(${x} ${bottom}) scale(${s})">${p('M-20-45Q0-40 21-46L17-7Q16 0 0 1Q-15 0-16-7Z',`url(#${id}-metal)`,'stroke="#687f76" stroke-width="1.8"')}${p('M-20-45L-14-62Q0-69 14-62L21-46Q0-39-20-45Z',`url(#${id}-metal)`,'stroke="#687f76" stroke-width="1.8"')}${p('M-9-64V-72Q0-77 9-72V-64Z',`url(#${id}-coral)`,'stroke="#a28369" stroke-width="1.5"')}${line('M-11-39L-9-13M-9-56L-6-60','#fcfff3',1.6,.98)}${line('M-12-5Q1-1 13-6','#849f95',1.3,.9)}</g>`;
const mixingGlass=(id,x,bottom,s=1)=>`<g transform="translate(${x} ${bottom}) scale(${s})">${p('M-20-43L21-43L16-5Q15 1 0 2Q-14 1-15-5Z',`url(#${id}-glass)`,'stroke="#71988c" stroke-width="1.8" fill-opacity=".77"')}${p('M-20-43Q-8-51 16-46L24-49L23-41Q4-33-15-39Z','#edf8ed','stroke="#71988c" stroke-width="1.6" fill-opacity=".8"')}${line('M-12-34L-10-12M-10-4Q2 0 12-5','#ffffff',1.6,.97)}${line('M-10-36Q0-41 11-39','#b6d6c9',1.3,.9)}</g>`;
const bottle=(id,x,bottom,s=1)=>`<g transform="translate(${x} ${bottom}) scale(${s})">${p('M-7-70H7V-50Q7-45 13-39Q17-36 17-28V-5Q17 2 10 3H-11Q-17 2-17-5V-28Q-17-36-13-39Q-7-45-7-50Z',`url(#${id}-bottle)`,'stroke="#526c55" stroke-width="1.8"')}${r(-9,-75,18,8,2,`url(#${id}-coral)`,'stroke="#9e7b5e" stroke-width="1.4"')}${r(-7,-62,14,7,1.5,`url(#${id}-brass)`,'stroke="#998459" stroke-width="1.3"')}${line('M-11-28V-9M-3-48V-53','#cae2bc',1.6,.9)}${line('M-9-2H9','#2e5448',1.3,.8)}</g>`;
const table=(id,y,tier=1)=>{
 let art=p(`M53 ${y+20}H69L65 ${y+58}H52ZM181 ${y+20}H198L201 ${y+57}H186Z`,`url(#${id}-wood)`,'stroke-width="2.4"');
 art+=p(`M47 ${y+8}H207V${y+30}Q128 ${y+40} 48 ${y+29}Z`,`url(#${id}-wood)`);
 art+=p(`M207 ${y+8}L220 ${y-2}V${y+20}L207 ${y+30}Z`,`url(#${id}-side)`,'stroke-width="2.4"');
 art+=p(`M36 ${y+3}L56 ${y-10}H214Q222 ${y-9} 222 ${y-2}L207 ${y+12}H45Q35 ${y+11} 36 ${y+3}Z`,`url(#${id}-green)`,'stroke-width="2.5"');
 art+=line(`M47 ${y+4}H200M59 ${y+20}Q128 ${y+29} 195 ${y+20}`,'#d9bf84',1.6,.94);
 art+=line(`M59 ${y+39}L57 ${y+51}M189 ${y+39}L192 ${y+50}`,'#d1ad7f',1.4,.94);
 if(tier>1){art+=p(`M63 ${y+48}L77 ${y+40}H191L194 ${y+49}Q129 ${y+61} 62 ${y+51}Z`,`url(#${id}-wood)`,'stroke="#886345" stroke-width="1.8"');art+=line(`M76 ${y+47}H181`,'#d1ad7e',1.4,.93);}
 return art;
};
const iceWell=(id,x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${p('M-27-4L-15-12H22L29-3L18 9H-20Z',`url(#${id}-brass)`,'stroke="#9d875c" stroke-width="1.7"')}${p('M-20-3L-12-8H18L22-3L15 5H-14Z','#527d75','stroke="#42665a" stroke-width="1.4"')}${p('M-14-1L-8-8L2-5L0 4L-10 5Z',`url(#${id}-ice)`,'stroke="#8ab4bc" stroke-width="1.3"')}${p('M4-3L12-9L19-4L15 4L6 5Z',`url(#${id}-ice)`,'stroke="#8ab4bc" stroke-width="1.3"')}${line('M-10-2L-6-5M8-2L12-5','#ffffff',1.3,.96)}</g>`;
const dripTray=(id,x,y,w=67)=>`${p(`M${x} ${y}L${x+10} ${y-7}H${x+w}L${x+w+5} ${y}L${x+w-4} ${y+7}H${x+3}Z`,`url(#${id}-metal)`,'stroke="#7b927e" stroke-width="1.5"')}${line(`M${x+13} ${y-1}H${x+w-7}M${x+12} ${y+3}H${x+w-10}`,'#7a9a8b',1.3,.95)}`;
const rack=(id,y)=>`${p(`M69 142V${y+5}Q69 ${y} 75 ${y}H190V${y+8}H78V142Z`,`url(#${id}-brass)`,'stroke="#927d52" stroke-width="1.8"')}${line(`M87 ${y+7}V${y+19}Q87 ${y+23} 92 ${y+21}M150 ${y+7}V${y+19}Q150 ${y+23} 155 ${y+21}`,'#ad915e',1.8,.98)}${line(`M76 ${y+3}H180`,'#fff0bd',1.4,.94)}`;

function levelOne(){
 const id='r53-bar-one';let art=table(id,152);
 art+=shaker(id,98,153,.92)+mixingGlass(id,161,154,.93);
 art+=line('M125 154H139','#a4c1a2',1.4,.95);
 return doc(id,art,-1,-19.5);
}

function levelTwo(){
 const id='r53-bar-two';let art=table(id,151,2);
 art+=rack(id,100);
 art+=bottle(id,187,143,.80);
 art+=iceWell(id,69,148,.81)+dripTray(id,104,151,77);
 art+=shaker(id,119,151,.78)+mixingGlass(id,165,151,.72);
 art+=line('M57 177L74 179M165 179L194 176','#bd976d',1.4,.88);
 return doc(id,art,-1,-18.25);
}

function levelThree(){
 const id='r53-bar-three';let art=table(id,162,2);
 // A raised rear preparation ledge stays open, with a separate lower draining surface.
 art+=p('M58 135H202V154H186V145H76V154H60Z',`url(#${id}-wood)`,'stroke-width="2.3"');
 art+=p('M53 133L68 123H199L207 132L197 143H61Q52 141 53 133Z',`url(#${id}-green)`,'stroke-width="2.3"');
 art+=line('M64 134H192','#d7bd83',1.6,.95);
 art+=rack(id,97);
 art+=shaker(id,106,136,.79)+bottle(id,180,136,.84);
 art+=iceWell(id,69,161,.88)+dripTray(id,107,164,75);
 art+=mixingGlass(id,147,165,.79);
 // Compact empty side compartments hold equipment; no extra bottles or drinks are added.
 art+=p('M208 172L226 166L233 174V198L216 204L208 197Z',`url(#${id}-wood)`,'stroke-width="2.1"');
 art+=p('M213 174L226 170L229 175L216 179Z','#ead1a1','stroke="#a18155" stroke-width="1.4"');
 art+=line('M217 181V197L228 193M221 180V195','#8c6a45',1.4,.94);
 art+=line('M81 196H176','#d8b67e',1.4,.95);
 return doc(id,art,-6.5,-18.75);
}

export const applianceBarCandidates=[
 {id:'bar-l1',code:'EQ26-L1',name:'调饮台',familyId:'bar',deviceKind:'appliance',outputChains:[],level:1,expectedOccupancy:.78,svg:levelOne(),
  reason:'短圆角胡桃木工作台配深翠绿操作面，只有一只金属摇杯和一只透明混合量杯，开放台面与暖黄铜细边清楚表现调饮备制，区别储冰瓶柜。',
  design:{silhouette:'短圆角开放工作台、稳固短腿、金属摇杯与透明混合量杯，不做封闭酒柜',angle:'略俯视三分之四角度，可见操作面、台沿厚度与下部开放空间',material:'暖胡桃木、深翠绿耐水台面、暖黄铜细边、冷亮金属与透明玻璃，珊瑚小盖点亮',identity:'用于现有调饮配方的量取、混合与摇制备制，台面保留操作空间，不摆成品饮料',upgrade:'一级为简洁工作台和两件基础器具，不预支冰槽、工具架或错层台面',presentation:'78%主体、透明居中留白；无文字数字刻度角标、灯牌、整排酒瓶或额外装饰'}},
 {id:'bar-l2',code:'EQ26-L2',name:'调饮台',familyId:'bar',deviceKind:'appliance',outputChains:[],level:2,expectedOccupancy:.82,svg:levelTwo(),
  reason:'独立冰槽与沥水工作区分开布置，背部工具架和下承托层完善备制功能；仅一只摇杯、一只混合量杯和一只基酒瓶，少量冰蓝与珊瑚色保持活泼。',
  design:{silhouette:'开放工作台、独立冰槽、沥水盘、短黄铜工具架与下承托层',angle:'三分之四俯视，冰槽、混合区与工具架位置相互避让，三件器具均可直接取用',material:'胡桃木架、深翠绿台面、暖黄铜工具架、浅冰蓝小冰块与克制珊瑚瓶盖',identity:'用于现有调饮配方的取冰、量取和混合摇制，包含桑葚龙舌兰特调、椰青姜柠饮等现有方案',upgrade:'二级新增独立冰槽、沥水工作区与工具架，不仅换色放大',presentation:'82%主体、透明居中留白；主要器具最多三件，无字数字刻度角标或成品饮品堆'}},
 {id:'bar-l3',code:'EQ26-L3',name:'调饮台',familyId:'bar',deviceKind:'appliance',outputChains:[],level:3,expectedOccupancy:.84,svg:levelThree(),
  reason:'前后错层操作面将备料摇制和下层沥水分开，增加防滑沥水盘、紧凑侧器具收纳和稳固下承托；三件器具克制布置，维持开放调饮台身份。',
  design:{silhouette:'后高前低开放操作面、独立冰槽、防滑沥水盘、工具架与紧凑侧收纳',angle:'三分之四俯视，后层摇杯与基酒瓶、前层混合杯和沥水盘形成可用操作分区',material:'暖胡桃木、深翠绿耐水台面、黄铜细边与工具架、浅透玻璃及少量冰蓝珊瑚点色',identity:'用于现有调饮配方的取冰、量取、混合、摇制和器具沥水，各操作区保持开放可达',upgrade:'三级增加前后错层操作面、防滑沥水盘及独立侧器具收纳，区别储冰瓶柜和大型酒柜',presentation:'84%主体、透明居中留白；只一摇杯、一混合杯、一基酒瓶，无文字数字刻度角标、灯牌或瓶排'}}
];

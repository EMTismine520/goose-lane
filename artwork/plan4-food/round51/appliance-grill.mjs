// Round 51: low, open charcoal grills; structural upgrades remain hand operated.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const r=(x,y,w,h,rx,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line=(d,c,w=1.5,o=1)=>p(d,'none',`stroke="${c}" stroke-width="${w}" opacity="${o}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".1" y1="0" x2=".84" y2="1">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const defs=id=>grad(`${id}-blue`,['#78939b','#4e717e','#304f5d'])
 +grad(`${id}-edge`,['#9bb3b7','#75959e','#4a6b79'])
 +grad(`${id}-clay`,['#e8b087','#cf8b63','#a7674b'])
 +grad(`${id}-metal`,['#f4f5e8','#bdcfca','#859e9b'])
 +grad(`${id}-grip`,['#e9c99b','#d6ae7d','#b88b5f'])
 +grad(`${id}-ember`,['#ffdc85','#f6ac54','#d8773e']);
const doc=(id,art,dx,dy)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>炭烤炉 · 开放炭火与升降烤网候选</title><defs>${defs(id)}</defs><g transform="translate(${dx} ${dy})" stroke="#353b3c" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
const feet=(id,y,heavy=false)=>`${p(`M68 ${y}H83L78 ${y+20}Q72 ${y+25} 63 ${y+21}Z`,`url(#${id}-metal)`,'stroke-width="2.2"')}${p(`M174 ${y}H188L195 ${y+21}Q186 ${y+25} 180 ${y+20}Z`,`url(#${id}-metal)`,'stroke-width="2.2"')}${heavy?line(`M79 ${y+17}H180`,'#46616c',4,.98):''}${line(`M70 ${y+4}L67 ${y+17}M181 ${y+4}L185 ${y+17}`,'#eff4df',1.5,.94)}`;
const coals=(id,x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${e(0,0,67,18,'#654b42','stroke="#7a5b46" stroke-width="1.4"')}${p('M-49-4L-33-11L-19-3L-23 10L-43 11Z',`url(#${id}-ember)`,'stroke="#aa6d42" stroke-width="1.5"')}${p('M-12-10L7-13L18-3L10 10L-9 9L-17 1Z',`url(#${id}-ember)`,'stroke="#aa6d42" stroke-width="1.5"')}${p('M25-7L44-10L54 0L47 11L29 9L21 2Z',`url(#${id}-ember)`,'stroke="#aa6d42" stroke-width="1.5"')}${line('M-40-3L-32 2L-34 7M-5-6L3 0L0 6M34-3L42 2','#ffe9ad',1.4,.9)}${p('M-29-3L-24-1L-27 5L-32 3ZM7-5L12-1L8 3L3 0ZM47 1L51 5L45 8L43 5Z','#825242','stroke="none"')}</g>`;
const tub=(id,y)=>`${p(`M44 ${y}Q128 ${y+32} 213 ${y-1}L201 ${y+45}Q190 ${y+62} 128 ${y+63}Q65 ${y+60} 55 ${y+44}Z`,`url(#${id}-blue)`)}${e(128,y,84,28,`url(#${id}-clay)`,'stroke-width="2.5"')}${e(128,y+1,74,21,'#bc7956','stroke="#986448" stroke-width="1.5"')}`;
const rack=(id,y)=>`${e(128,y,84,27,`url(#${id}-edge)`,'stroke-width="2.5" fill-opacity=".18"')}${line(`M66 ${y-17}L83 ${y+21}M95 ${y-25}L106 ${y+26}M126 ${y-27}L130 ${y+27}M157 ${y-25}L153 ${y+26}M186 ${y-17}L176 ${y+21}`,'#425a62',2.5,.99)}${line(`M52 ${y-10}Q128 ${y+5} 204 ${y-10}M45 ${y+3}Q128 ${y+20} 211 ${y+3}M57 ${y+16}Q129 ${y+33} 199 ${y+16}`,'#435b62',2.35,.99)}${line(`M69 ${y-16}L73 ${y-7}M99 ${y-23}L101 ${y-14}M159 ${y-23}L158 ${y-14}M188 ${y-15}L186 ${y-7}`,'#b9ceca',1.3,.95)}`;
const handle=(id,x,y,flip=false)=>`<g transform="translate(${x} ${y}) scale(${flip?-1:1} 1)">${p('M0 0H-13Q-22 0-22 10Q-22 20-12 20H0V13H-11Q-15 13-15 10Q-15 7-11 7H0Z',`url(#${id}-metal)`,'stroke-width="1.9"')}${p('M-21 5Q-25 10-21 15H-13V5Z',`url(#${id}-grip)`,'stroke="#8e7659" stroke-width="1.6"')}</g>`;
const drawer=(id,y)=>`${p(`M91 ${y}Q129 ${y+7} 166 ${y}L163 ${y+16}Q129 ${y+23} 94 ${y+16}Z`,`url(#${id}-metal)`,'stroke="#617a7c" stroke-width="1.8"')}${r(118,y+5,21,5,2.3,`url(#${id}-grip)`,'stroke="#8c7358" stroke-width="1.35"')}${line(`M100 ${y+12}Q129 ${y+17} 156 ${y+12}`,'#e7eee0',1.3,.93)}`;

function levelOne(){
 const id='r51-grill-one';
 let art=feet(id,179);
 art+=tub(id,126)+coals(id,128,127,1)+rack(id,123);
 art+=line('M63 157Q84 172 106 173','#91aab0',1.6,.9);
 art+=line('M65 185Q128 205 194 185','#284752',1.8,.85);
 return doc(id,art,-.5,-20.75);
}

function levelTwo(){
 const id='r51-grill-two';
 let art=feet(id,187,true);
 art+=handle(id,48,132)+handle(id,209,132,true);
 art+=tub(id,127)+coals(id,128,128,1)+rack(id,124);
 // Actual air inlets are cut into the bowl below the coal bed.
 art+=r(73,165,13,5,2.5,'#253f49','stroke="#8aa2a7" stroke-width="1.3"');
 art+=r(96,170,13,5,2.5,'#253f49','stroke="#8aa2a7" stroke-width="1.3"');
 art+=r(148,170,13,5,2.5,'#253f49','stroke="#8aa2a7" stroke-width="1.3"');
 art+=r(171,165,13,5,2.5,'#253f49','stroke="#8aa2a7" stroke-width="1.3"');
 art+=drawer(id,179);
 art+=line('M62 154L71 159M187 158L196 152','#9db4b7',1.6,.92);
 return doc(id,art,-.5,-25.25);
}

function levelThree(){
 const id='r51-grill-three';
 let art=feet(id,196,true);
 // A low, open-front windshield, not an enclosing oven or a tall hood.
 art+=p('M48 146V112Q49 82 128 80Q207 82 208 111V146L196 151V114Q195 94 128 92Q62 94 61 114V151Z',`url(#${id}-blue)`,'stroke-width="2.7"');
 art+=p('M61 143V115Q63 96 128 94Q193 96 195 114V143Q129 160 61 143Z',`url(#${id}-clay)`,'stroke="#9e785e" stroke-width="1.6"');
 art+=line('M58 111Q67 89 124 88M152 88Q183 92 198 106','#a3b9bc',1.6,.94);
 art+=handle(id,48,159)+handle(id,209,159,true);
 art+=tub(id,147)+coals(id,128,148,1);
 // Two divided charcoal zones remain visible below the elevated grate.
 art+=p('M125 131H131L133 166H127Z',`url(#${id}-clay)`,'stroke="#95694e" stroke-width="1.4"');
 art+=r(55,101,8,57,3,`url(#${id}-metal)`,'stroke="#57717a" stroke-width="1.9"');
 art+=r(194,101,8,57,3,`url(#${id}-metal)`,'stroke="#57717a" stroke-width="1.9"');
 art+=rack(id,124);
 // One fixed support on each post and a compact manual crank indicate the lift mechanism.
 art+=e(59,126,4,4,`url(#${id}-grip)`,'stroke="#6d6655" stroke-width="1.5"');
 art+=e(198,126,4,4,`url(#${id}-grip)`,'stroke="#6d6655" stroke-width="1.5"');
 art+=p('M201 123H215V133H225V140H209V130H201Z',`url(#${id}-metal)`,'stroke="#5d7880" stroke-width="1.6"');
 art+=r(221,132,7,14,3,`url(#${id}-grip)`,'stroke="#8e7558" stroke-width="1.5"');
 art+=r(73,184,13,5,2.5,'#253f49','stroke="#89a2a7" stroke-width="1.3"');
 art+=r(171,184,13,5,2.5,'#253f49','stroke="#89a2a7" stroke-width="1.3"');
 art+=drawer(id,198);
 art+=line('M66 177Q83 189 98 190M167 190Q184 188 193 179','#91aab0',1.5,.92);
 return doc(id,art,-.5,-21.25);
}

export const applianceGrillCandidates=[
 {id:'charcoal-grill-l1',code:'EQ19-L1',name:'炭烤炉',familyId:'charcoal-grill',deviceKind:'appliance',outputChains:[],level:1,expectedOccupancy:.78,svg:levelOne(),
  reason:'低稳开放椭圆炭盆、清楚烤网和短脚建立真正炭烤炉身份，深海蓝金属与暖赤陶内衬衬出少量炭火橙光，不靠火舌、烟雾或肉堆表现。',
  design:{silhouette:'低矮开放椭圆炭盆、可辨交叉栅格和两只稳固短脚，无封闭上盖',angle:'略俯视三分之四角度，可见烤网下炭火及前炉体容积',material:'深海蓝金属、暖赤陶内衬、灰绿金属烤网与少量暖橙炭光，左上光',identity:'用于肉类、蔬菜、鱼排等现有炭烤料理的制作，不堆食材，保留清楚开放炭火',upgrade:'一级为开放炭盆、清楚栅格与短脚，不预支通风抽屉或升降支柱',presentation:'78%主体、透明居中留白；无文字数字刻度或等级角标，无大火舌或遮挡烟雾'}},
 {id:'charcoal-grill-l2',code:'EQ19-L2',name:'炭烤炉',familyId:'charcoal-grill',deviceKind:'appliance',outputChains:[],level:2,expectedOccupancy:.82,svg:levelTwo(),
  reason:'开放炭盆下新增实际通风孔、独立集灰抽屉、双侧防烫握把和横撑稳固支架，低矮轮廓保持，功能升级清楚且仍为炭火烤制。',
  design:{silhouette:'开放低炉体、防烫双侧把手、下集灰抽屉和带横撑短支架',angle:'三分之四俯视，烤网、侧把手、通风孔和抽屉层次可见',material:'深海蓝金属、暖赤陶炉膛、金属抽屉与暖木隔热握把，少量炭火亮色',identity:'用于现有炭烤菜的开放烤制，通风与集灰操作明确，不使用退役食材作标志',upgrade:'二级新增真实通风孔、集灰抽屉、防烫把手及稳固支架，不靠放大或换色',presentation:'82%主体、透明居中留白；无字数字刻度角标，无轮推车或封闭烤箱造型'}},
 {id:'charcoal-grill-l3',code:'EQ19-L3',name:'炭烤炉',familyId:'charcoal-grill',deviceKind:'appliance',outputChains:[],level:3,expectedOccupancy:.84,svg:levelThree(),
  reason:'低挡风罩和分区炭盒保持开放炭炉身份，两侧立柱、支点与小手摇曲柄明确托住可升降烤网，通风、集灰和防烫握把继续保留，升级来自实际功能结构。',
  design:{silhouette:'低挡风罩、分区炭盒、双立柱升降烤网、小手摇曲柄和低稳炉体',angle:'三分之四俯视，烤网明显抬高于炭盒，双侧支柱和固定点明确可见',material:'深海蓝金属、赤陶挡风内衬、冷亮金属支柱与暖木曲柄，炭光克制',identity:'用于现有炭烤料理，通过手动调整烤网与炭火距离控制烤制，仍为开放炭火设备',upgrade:'三级新增有明确立柱与固定点的升降烤网、低挡风罩和分区炭盒，保留集灰与通风',presentation:'84%主体、透明居中留白；无文字数字刻度等级标牌，无高身烤箱、煎台、推车或遮挡烟火'}}
];

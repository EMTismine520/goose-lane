// Round 50: sealed tea caddies and divided cold-drink base storage.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,c,w=1.5,o=1)=>p(d,'none',`stroke="${c}" stroke-width="${w}" opacity="${o}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0,dx=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 生产器新版候选</title><defs>${defs}</defs><g stroke="#49372d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(${dx} ${dy})">${art}</g></svg>`;

function leafBadge(k,x,y){
  let a=line('M-2 16L4-14M1 3L-8-3','#66834f',1.7,.95);
  a+=p('M1 4Q-21 3-21-15Q-3-18 1 4Z',`url(#${k}-leaf)`,'stroke="#577449" stroke-width="1.8"');
  a+=p('M3-1Q1-21 20-26Q28-8 3-1Z',`url(#${k}-leaf)`,'stroke="#577449" stroke-width="1.8"');
  a+=line('M-16-11L-3 1M7-6L18-20','#d3e6ad',1.3,.94);
  return `<g transform="translate(${x} ${y})">${a}</g>`;
}
function teaCaddy(level){
  const k='eq50-tea-'+level,defs=grad(k+'-celadon',['#d6ece1','#97c1b3','#5f998f'])+grad(k+'-copper',['#f0ce93','#d0a368','#a87944'])+grad(k+'-leaf',['#c5dda2','#91b873','#658b52'])+grad(k+'-side',['#c1d9cb','#86ad9e','#547f77']);
  let a='';
  if(level===3){
    // A hinged raised lid exposes real divided tea storage, while keeping a round caddy body.
    a+=p('M75 79L83 54Q127 28 179 58L186 83Q129 62 75 90Z',`url(#${k}-copper)`);
    a+=p('M85 74L91 58Q128 42 171 62L176 77Q130 62 85 80Z','#debd82','stroke="#ac864e" stroke-width="1.5"');
    a+=line('M92 57Q127 43 165 59','#ffe5b0',1.55,.94);
    a+=p('M115 81L137 83L137 94L115 92Z',`url(#${k}-copper)`,'stroke-width="1.8"');
    a+=p('M58 191L191 194L202 205Q135 228 54 205Z',`url(#${k}-copper)`);
    a+=e(128,193,71,17,'#d7bd84','stroke-width="2"');
    a+=line('M67 204Q129 223 190 206','#ffdfa4',1.65,.94);
  }
  const top=level===3?94:99,bottom=level===3?193:194;
  a+=p(`M74 ${top}L181 ${top+3}L179 ${bottom-14}Q176 ${bottom+2} 129 ${bottom+7}Q81 ${bottom+3} 76 ${bottom-12}Z`,`url(#${k}-celadon)`);
  a+=p(`M82 ${top+15}Q84 ${top+37} 85 ${top+58}L91 ${top+65}Q87 ${top+34} 89 ${top+16}Z`,'#eef8e4','stroke="none" opacity=".64"');
  a+=line(`M89 ${bottom-10}Q110 ${bottom+1} 131 ${bottom+1}M163 ${top+20}L164 ${top+54}`,'#d9edcf',1.7,.94);
  a+=p(`M76 ${bottom-12}Q129 ${bottom+7} 179 ${bottom-13}L178 ${bottom-4}Q128 ${bottom+16} 77 ${bottom-3}Z`,`url(#${k}-copper)`,'stroke-width="2.1"');
  a+=leafBadge(k,125,150);
  if(level===1){
    a+=p('M74 82L182 85L181 100Q128 120 75 101Z',`url(#${k}-copper)`);
    a+=e(128,82,54,17,'#afcfc0');
    a+=e(128,78,45,13,`url(#${k}-celadon)`,'stroke="#8b9e7a" stroke-width="1.5"');
    a+=e(128,73,11,5,`url(#${k}-copper)`,'stroke-width="1.8"');
    a+=line('M89 79Q108 70 119 73M84 94Q104 103 125 104','#f6f4d8',1.65,.95);
  }else if(level===2){
    // Two stepped sealing lids have a visible independent copper gasket between them.
    a+=p('M70 91L184 95L184 108Q129 128 71 109Z',`url(#${k}-copper)`);
    a+=e(127,92,57,17,'#d2b17a','stroke-width="2"');
    a+=p('M77 74L178 77L179 92Q127 110 76 91Z',`url(#${k}-celadon)`);
    a+=e(127,74,51,15,'#c2dfce');
    a+=e(127,69,11,5,`url(#${k}-copper)`,'stroke-width="1.7"');
    a+=line('M85 88Q127 104 172 91M79 104Q123 120 175 108','#ffe4ac',1.55,.95);
    // Side spoon sleeve and one little scoop, not a separate tea cup.
    a+=p('M181 134L198 131L202 183Q191 191 179 183Z',`url(#${k}-side)`,'stroke-width="2.1"');
    a+=p('M183 132L190 104L196 106L190 155L184 159Z',`url(#${k}-copper)`,'stroke-width="1.8"');
    a+=e(193,101,7,10,`url(#${k}-copper)`,'stroke-width="1.9"');
    a+=e(193,99,4,6,'#f3d9a5','stroke="#b28e56" stroke-width="1.15"');
    a+=line('M184 146L185 174','#d9ebd3',1.45,.92);
  }else{
    a+=e(128,94,56,20,`url(#${k}-copper)`);
    a+=e(128,94,48,14,'#72864e','stroke="#8e7b47" stroke-width="1.4"');
    a+=p('M83 95Q99 82 126 81L128 94L88 102Z','#a7ae6d','stroke="none"');
    a+=p('M128 94L145 81Q167 85 173 98L137 105Z','#8b9f5b','stroke="none"');
    a+=line('M128 94L85 99M128 94L144 81M128 94L169 102','#dabb7d',2.7,.98);
    a+=e(128,94,4,2.7,'#e4c98c','stroke-width="1.3"');
    a+=line('M100 91L105 88M111 97L116 94M151 93L156 95M141 101L145 99','#d9dfa4',1.4,.92);
    // A real front seal clasp and small side keeper, with no badge or level symbol.
    a+=p('M116 113L138 114L138 132L117 132Z',`url(#${k}-copper)`,'stroke-width="1.9"');
    a+=p('M122 120L132 120L132 131L122 131Z','#b18a4e','stroke-width="1.2"');
    a+=line('M123 124L130 124','#f9df9e',1.4,.95);
    a+=p('M174 113L185 111L184 130L175 132Z',`url(#${k}-copper)`,'stroke-width="1.8"');
  }
  return doc('茶叶罐',defs,a,[-7,-7,-4][level-1],level===2?-8:0);
}

function baseBottle(k,x,y,type,s=1){
  let a='';
  if(type==='water'){
    a+=p('M-6-25L6-25L7-13Q13-9 13-1L13 28Q0 34-13 28L-13-1Q-13-9-7-13Z',`url(#${k}-glass)`,'stroke="#6a8580" stroke-width="1.85" fill-opacity=".84"');
    a+=p('M-9 3L9 5L9 25Q0 29-9 24Z','#b5d9d3','stroke="none" opacity=".64"');
    a+=p('M-8-30L8-30L8-24L-8-24Z','#c9d8cc','stroke-width="1.6"');
    a+=line('M-8-8L-8 16M-3-21L-3-16','#faffee',1.55,.96);
  }else if(type==='blue'){
    a+=p('M-7-19L7-19L8-10L16-3L15 26Q0 33-15 26L-16-3L-8-10Z',`url(#${k}-blue)`,'stroke-width="1.85"');
    a+=p('M-9-24L9-24L9-18L-9-18Z','#d5e5d6','stroke-width="1.6"');
    a+=line('M-10 1L-10 18M-3-15L-3-10','#cef2e6',1.5,.94);
  }else{
    a+=p('M-13-14L13-14L14 25Q0 32-14 25Z',`url(#${k}-coral)`,'stroke-width="1.85"');
    a+=e(0,-14,13,4.5,'#e0e2ca','stroke-width="1.5"');
    a+=e(0,-14,4,1.7,'none','stroke="#8b9a8b" stroke-width="1.15"');
    a+=line('M-9-5L-9 18','#ffd5b2',1.5,.93);
  }
  return `<g transform="translate(${x} ${y}) scale(${s})">${a}</g>`;
}
function ice(k,x,y,s=1,flip=false){
  let a=p('M-15-6L-1-15L14-8L13 8L-1 16L-15 8Z',`url(#${k}-ice)`,'stroke="#739592" stroke-width="1.85" fill-opacity=".9"');
  a+=p('M-15-6L-1-15L14-8L0 1Z','#f7fff0','stroke="#8ca8a0" stroke-width="1.2"');
  a+=line('M-10-2L-10 5M5 2L4 10','#ffffff',1.5,.96);
  return `<g transform="translate(${x} ${y}) scale(${flip?-s:s} ${s})">${a}</g>`;
}
function mixerCooler(level){
  const k='eq50-mixer-'+level,defs=grad(k+'-teal',['#76b5ad','#4b8e8d','#2b6470'])+grad(k+'-dark',['#55958e','#34777c','#25545f'])+grad(k+'-coral',['#f8b795','#e3917e','#bf6d65'])+grad(k+'-metal',['#f3efcd','#d3decb','#9fbcae'])+grad(k+'-glass',['#f8fff0','#dbeae0','#accdc6'])+grad(k+'-ice',['#f8fff1','#d8eee3','#a6d0cf'])+grad(k+'-blue',['#b4e4db','#77bdca','#438baf']);
  let a='';const top=level===1?125:139;
  if(level>=2){
    // A real hinged transparent flip lid over the ice bay, separate from the bottle rack.
    a+=p('M35 129L38 82L126 69L139 115L127 137Z',`url(#${k}-glass)`,'stroke="#6b9690" stroke-width="2.35" fill-opacity=".38"');
    a+=line('M44 119L46 88L119 78M51 88L60 87','#faffee',1.75,.95);
    a+=p('M143 89L151 89L151 148L143 147Z',`url(#${k}-dark)`,'stroke-width="2.1"');
    a+=p('M208 97L216 98L216 155L208 154Z',`url(#${k}-dark)`,'stroke-width="2.1"');
    a+=p('M140 111L218 118L218 126L141 119Z',`url(#${k}-metal)`,'stroke-width="2"');
  }
  // A broad low cabinet uses a teal cold body and a narrow coral working rim.
  a+=p(`M39 ${top+61}L55 ${top+62}L54 ${top+74}L40 ${top+73}Z`,'#526c5b','stroke-width="2"');
  a+=p(`M185 ${top+68}L200 ${top+63}L200 ${top+76}L186 ${top+79}Z`,'#526c5b','stroke-width="2"');
  a+=p(`M31 ${top+6}L196 ${top+20}L196 ${top+70}L41 ${top+57}Q32 ${top+56} 31 ${top+48}Z`,`url(#${k}-teal)`);
  a+=p(`M196 ${top+20}L224 ${top+1}L220 ${top+52}L196 ${top+70}Z`,`url(#${k}-dark)`);
  a+=p(`M28 ${top}L57 ${top-17}L226 ${top-1}L198 ${top+24}L30 ${top+10}Z`,`url(#${k}-coral)`);
  // Left ice reservoir and a narrower right bottle grid have different depth and material.
  a+=p(`M40 ${top+1}L59 ${top-9}L132 ${top-2}L119 ${top+14}L41 ${top+8}Z`,'#aacfc8','stroke="#4e7e7b" stroke-width="1.5"');
  a+=p(`M140 ${top+9}L152 ${top-1}L212 ${top+4}L195 ${top+18}Z`,'#285765','stroke="#234e56" stroke-width="1.5"');
  a+=line(`M174 ${top+2}L165 ${top+14}`,'#aac8bb',2,.95);
  a+=ice(k,65,top-2,.86)+ice(k,101,top+2,.78,true);
  if(level===1){
    a+=baseBottle(k,163,104,'water',.8)+baseBottle(k,199,116,'blue',.76);
    a+=p('M140 139L209 144L208 153L140 148Z','#d9ded0','stroke-width="2"');
  }else{
    a+=baseBottle(k,158,95,'water',.78)+baseBottle(k,190,108,'blue',.76)+baseBottle(k,212,126,'can',.65);
    a+=p('M140 149L220 155L218 164L140 158Z',`url(#${k}-metal)`,'stroke-width="2"');
    a+=line('M170 118L170 152M200 130L200 155','#94b5a7',1.55,.9);
  }
  if(level===3){
    // Independent shallow ice drawer, lower supply drawer and right cold compartment.
    a+=p('M35 155L117 162L126 181L43 174Z',`url(#${k}-metal)`,'stroke-width="2"');
    a+=p('M42 158L112 165L120 176L48 169Z','#b5dad3','stroke="#83aaa0" stroke-width="1.3"');
    a+=p('M43 174L126 181L124 195L44 188Z',`url(#${k}-coral)`,'stroke-width="2.1"');
    a+=p('M71 181Q82 177 93 183L93 187Q82 183 72 186Z',`url(#${k}-metal)`,'stroke-width="1.55"');
    a+=p('M49 193L117 199L116 209L50 203Z',`url(#${k}-dark)`,'stroke-width="1.8"');
    a+=line('M78 200L91 201','#d3dfc7',2.6,.95);
    a+=p('M138 172L186 176L186 205L138 201Z','#326d76','stroke-width="1.85"');
    a+=p('M144 178L180 181L180 198L144 195Z',`url(#${k}-glass)`,'stroke="#709e94" stroke-width="1.2" fill-opacity=".38"');
    a+=line('M176 181L176 193','#e9e8ca',2.4,.95);
  }else{
    a+=p(`M44 ${top+25}L182 ${top+37}L182 ${top+56}L45 ${top+45}Z`,'#4c8a8b','stroke="#397177" stroke-width="1.35"');
    a+=line(`M94 ${top+38}L126 ${top+40}`,'#c9ded0',3,.95);
    if(level===2)a+=line(`M45 ${top+47}L180 ${top+59}`,'#8bb9a8',1.45,.9);
  }
  a+=p(`M30 ${top+8}L198 ${top+22}L198 ${top+29}L31 ${top+15}Z`,'#edab91','stroke-width="2.1"');
  a+=line(`M42 ${top+14}L187 ${top+26}`,'#ffdbb5',1.55,.95);
  a+=line(`M39 ${top+27}L40 ${top+40}M205 ${top+28}L214 ${top+20}`,'#9fcdbb',1.55,.91);
  return doc('特调基底柜',defs,a,[-23,-11,-11][level-1],-1);
}

const occupancy=[.78,.82,.84];
export const producerTeaMixerCandidates=[
  ...[1,2,3].map(level=>({id:`tea-caddy-l${level}`,code:`EQ13-L${level}`,name:'茶叶罐',familyId:'tea-caddy',level,expectedOccupancy:occupancy[level-1],svg:teaCaddy(level),reason:['小圆青瓷密封单罐以暖铜盖圈、清楚密封接缝和少量茶叶标志建立身份。','同族圆罐加入两层独立封盖与侧茶勺收纳，升级依靠实际密封结构。','半开铰接盖露出真实三分格储茶，密封扣与稳固托座完善高阶储存结构。'][level-1],design:{silhouette:['小圆青瓷密封单罐、暖铜盖圈','青瓷圆罐、双层密封盖与侧茶勺套','铰接半开盖、三分格圆形茶仓、密封扣与低稳托座'][level-1],angle:'三分之四轻俯视，圆罐口、盖圈、罐腹及密封结构同时清楚，左上光',material:'青瓷柔润釉光与暖铜圈，少量茶叶标志，三级储茶分格有真实深度',identity:'用于保存茶叶及绿茶、红茶、乌龙茶、花茶、香草绿茶所需的茶料，密封圆罐与少量茶叶标志清楚可辨',progression:'一级单罐，二级双盖密封和茶勺收纳，三级分格仓、密封扣和稳固托座，不靠单纯放大或换色',palette:'温润青瓷、暖铜和自然茶绿，清楚近黑轮廓，釉光克制',size:`含罐约占画布${Math.round(occupancy[level-1]*100)}%，透明留白，无图内文字、数字或角标`}})),
  ...[1,2,3].map(level=>({id:`mixer-base-cooler-l${level}`,code:`EQ14-L${level}`,name:'特调基底柜',familyId:'mixer-base-cooler',level,expectedOccupancy:occupancy[level-1],svg:mixerCooler(level),reason:['深青珊瑚低柜划分开放冰槽与侧瓶格，两种不同瓶形保持冰饮基底身份。','透明翻盖冷藏区与清楚分瓶架加入低柜，瓶罐总量保持三种以内。','独立冰槽抽屉、下收纳抽屉与右冷藏分区构成真实结构升级，和海鲜横冷柜、竖乳柜、甜柜区分。'][level-1],design:{silhouette:['开放低冰槽与侧瓶格的小型冰饮收纳柜','深青珊瑚低柜、透明翻盖冷藏与分瓶架','独立冰槽抽屉、下收纳抽屉与右冷藏区的紧凑低柜'][level-1],angle:'三分之四轻俯视，冰区、侧瓶架和冷藏分区有不同深度，左上光',material:'深青冷柜、珊瑚工作沿、清透冰块和少量形态不同的无字瓶罐，薄玻璃翻盖轻透',identity:'用于收纳制冰和调饮所需的水、汽水与基酒，清楚区分冰区和少量不同形状的瓶罐',progression:'一级开放冰槽和侧瓶格，二级透明翻盖与分瓶架，三级独立冰槽/抽屉/冷藏分区，不靠堆瓶升级',palette:'深青、清透冰蓝、活泼珊瑚与少量浅金金属，区别奶白乳柜和玫瑰甜柜',size:`含柜约占画布${Math.round(occupancy[level-1]*100)}%，透明留白，无文字、数字或等级角标，瓶罐不超过三种`}})),
];

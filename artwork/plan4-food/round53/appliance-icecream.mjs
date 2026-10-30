// Round 53: one freezing cylinder, one lever and one outlet at every level.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,c,w=1.5,o=1)=>p(d,'none',`stroke="${c}" stroke-width="${w}" opacity="${o}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(defs,art,dy=0,dx=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>冰淇淋机 · 料理器具新版候选</title><defs>${defs}</defs><g stroke="#49372e" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(${dx} ${dy})">${art}</g></svg>`;

function creamSpiral(){
  // One small cream-curve emblem; no cone, serving stack or written label.
  return p('M-10 5Q-9 1-3 0Q-9-2-5-7Q-2-11 4-9Q10-8 9-4Q8-1 3 0Q10 1 10 5Q8 10-1 10Q-8 10-10 5Z','#fff2d0','stroke="#c9bfa8" stroke-width="1.2"')
    +line('M-5-5Q0-8 5-5M-5 4Q0 6 5 4','#fffdf0',1.25,.96);
}
function icecreamMachine(level){
  const k='eq53-ice-'+level,defs=grad(k+'-cream',['#fff8df','#f1e3bc','#d2c49c'])+grad(k+'-side',['#e9e6ce','#cbd5c1','#9fb6a6'])+grad(k+'-berry',['#dbc5e0','#b996c2','#906caa'])+grad(k+'-berry-dark',['#b89ac5','#9577a9','#725d86'])+grad(k+'-metal',['#f2f2de','#d3dfcf','#a1baac'])+grad(k+'-glass',['#f9fff0','#e1eee2','#b8d3cd']);
  let a='';
  if(level===3){
    a+=p('M54 207L190 221L220 200L225 215L194 239L55 224Z',`url(#${k}-metal)`);
    a+=line('M65 219L185 231M198 230L215 217','#faffec',1.6,.95);
    a+=p('M65 224L79 226L78 234L64 232Z','#819880','stroke-width="1.8"');
    a+=p('M177 237L191 238L191 244L177 243Z','#819880','stroke-width="1.8"');
  }
  // A compact cream case with a real right-side thickness, not a full-height glass cupboard.
  a+=p('M65 75Q65 67 76 68L174 79Q185 81 185 94L182 204Q181 214 169 214L77 205Q65 204 64 191Z',`url(#${k}-cream)`);
  a+=p('M185 88L208 68L209 187Q206 201 182 210Z',`url(#${k}-side)`);
  a+=p('M65 72L89 56L203 68L183 89L67 79Z',`url(#${k}-cream)`);
  a+=line('M75 76L172 86M72 101L72 129','#fffdf0',1.65,.95);
  a+=p('M73 165L173 175L172 196L74 187Z','#f4e8ca','stroke="#c5b99c" stroke-width="1.35"');
  if(level>=2){
    // Independent feed-hopper lid, with a separate gasket and a small plain lifting grip.
    a+=p('M86 61L106 46L179 54L166 72L87 67Z',`url(#${k}-berry)`,'stroke-width="2.1"');
    a+=p('M93 58L108 49L171 56L160 65Z','#f5ead8','stroke="#b9a7b6" stroke-width="1.35"');
    a+=p('M126 48L127 41Q135 36 144 43L144 50Z',`url(#${k}-berry)`,'stroke-width="1.9"');
    a+=line('M132 42L139 43','#f1e1ea',1.35,.95);
    // Side cooling shell remains distinct from the front freezing cylinder.
    a+=p('M196 102Q210 94 220 105L224 165Q223 176 208 181L195 175Z',`url(#${k}-side)`,'stroke-width="2.2"');
    a+=line('M204 122L215 125M204 132L216 135M205 142L216 145','#879e90',1.45,.94);
    a+=line('M202 106L204 114','#f8fbe8',1.5,.95);
  }
  if(level===3){
    // A visibly thick insulated cooling zone; the front service area stays separate below it.
    a+=p('M73 91Q79 81 94 83L157 90Q174 93 176 109L173 156L74 146Z',`url(#${k}-berry-dark)`,'stroke-width="2.25"');
    a+=p('M79 94Q84 88 95 90L157 97Q166 99 167 111L166 148L80 140Z','#ddcee3','stroke="#b39bbf" stroke-width="1.4"');
    a+=p('M196 106L216 110L219 165L204 172L197 165Z',`url(#${k}-cream)`,'stroke-width="1.6"');
    a+=line('M204 115L212 117M205 125L213 127M206 135L214 137','#b8bda3',1.3,.88);
  }
  // Exactly one horizontal freezing cylinder, visually distinct from a blender jar or milk bottle.
  a+=p('M91 91Q118 79 145 92L155 111L151 137Q143 152 119 151Q93 149 83 134L82 109Z',`url(#${k}-berry)`);
  a+=e(118,119,35,32,`url(#${k}-berry-dark)`,'stroke-width="2.1"');
  a+=e(117,117,28,25,level===1?'#f4e7ce':`url(#${k}-glass)`,'stroke="#a3aaa0" stroke-width="1.5"');
  a+=`<g transform="translate(111 116) scale(.79)">${creamSpiral()}</g>`;
  if(level>=2){
    // Fine reflections communicate the visible cooling service window without adding controls.
    a+=line('M96 104Q101 97 110 97M99 131L105 135','#fffdef',1.65,.96);
    a+=line('M130 99Q139 105 140 116','#e9f5e6',1.4,.91);
  }else a+=line('M93 104Q103 93 115 94','#fff2dc',1.7,.95);
  // A single output valve and one diagonal pull lever, with no second spout.
  a+=p('M105 138L133 141L134 154L128 160L128 172L116 172L116 159L109 155Z',`url(#${k}-metal)`,'stroke-width="2.2"');
  a+=e(122,172,6,2.2,'#627d76','stroke-width="1.25"');
  a+=p('M120 144L137 116L142 119L127 147Z',`url(#${k}-metal)`,'stroke-width="1.9"');
  a+=p('M134 114L140 105Q145 101 150 106L151 112L143 124Z',`url(#${k}-berry)`,'stroke-width="2.15"');
  a+=line('M140 113L145 108M112 146L112 151','#fcf4e5',1.4,.95);
  // The empty drip tray is directly under the sole nozzle.
  if(level<3){
    a+=p('M76 184L156 192L166 203L84 198L75 194Z',`url(#${k}-metal)`,'stroke-width="2.1"');
    a+=p('M83 187L153 194L159 198L87 193Z','#b6c9bd','stroke="#91ab9c" stroke-width="1.3"');
    a+=line('M95 189L94 194M109 190L108 195M123 192L122 196M137 193L136 197','#7d998c',1.25,.9);
  }else{
    // Separate rails and a forward removable tray make cleaning and removal visibly possible.
    a+=p('M77 183L165 192L171 206L85 200Z',`url(#${k}-berry-dark)`,'stroke-width="1.9"');
    a+=line('M83 190L161 198M87 195L163 203','#d9c8dd',1.35,.94);
    a+=p('M69 190L157 199L167 211L78 204Z',`url(#${k}-metal)`,'stroke-width="2.2"');
    a+=p('M77 193L154 202L159 207L81 200Z','#b9cfc1','stroke="#90aa9b" stroke-width="1.3"');
    a+=line('M92 195L91 201M108 197L107 203M124 199L123 205M141 201L140 206','#819e8e',1.3,.9);
    a+=p('M109 204Q119 201 130 207L130 211Q119 207 110 210Z',`url(#${k}-cream)`,'stroke-width="1.55"');
  }
  a+=line('M77 196L77 201M192 187L200 181','#faf5df',1.5,.92);
  return doc(defs,a,[-9,-4,-13][level-1],level===1?-7:-13);
}

const occupancy=[.78,.82,.84];
export const applianceIcecreamCandidates=[1,2,3].map(level=>({
  id:`ice-cream-machine-l${level}`,code:`EQ25-L${level}`,name:'冰淇淋机',familyId:'ice-cream-machine',deviceKind:'appliance',outputChains:[],level,expectedOccupancy:occupancy[level-1],svg:icecreamMachine(level),
  reason:[
    '紧凑奶油台式机以单制冷缸、单压杆和单出料嘴配小接滴盘，轮廓清楚而不堆甜筒。',
    '独立料仓盖、可视制冷服务窗和侧散热壳构成实质升级，仍保持单缸单出料。',
    '加厚隔热制冷分区、可拆接滴区与宽稳底座完善高阶结构，不通过增加按钮或出料嘴升级。',
  ][level-1],
  design:{
    silhouette:['紧凑奶油台式单缸机、一个压杆出料嘴和小接滴盘','独立料仓盖、可视圆形制冷窗、侧散热壳与单出料嘴','厚隔热制冷区、独立可拆接滴区、宽稳底座与单出料嘴'][level-1],
    angle:'三分之四轻俯视，单圆制冷缸、压杆、出料嘴和下接滴盘的操作关系清楚，左上光',
    material:'奶油机身、柔莓紫制冷壳和浅冷金属；二三级服务窗有轻透反光，隔热层与可拆托盘有真实厚度',
    identity:'用于制作巧克力冰淇淋、黄油冰淇淋与阿芙佳朵，单制冷缸和单出料操作清楚；只保留一个小奶油旋纹标志，没有甜筒堆或文字牌',
    progression:'一级紧凑单缸，二级独立料仓盖、可视服务窗和散热壳，三级隔热分区、可拆接滴区及宽稳底座；保持单出料结构',
    palette:'奶油白、柔莓紫与浅金属绿，冷暖层次清楚，区别奶柜、磨机与搅拌杯',
    size:`含机身约占画布${Math.round(occupancy[level-1]*100)}%，原生透明留白，无图内字、数字、刻度或等级角标`,
  },
}));

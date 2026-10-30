// Round 48: divided dark-wood spice storage and soft enamel grain/bread storage.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,c,w=1.5,o=1)=>p(d,'none',`stroke="${c}" stroke-width="${w}" opacity="${o}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0,dx=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 生产器新版候选</title><defs>${defs}</defs><g stroke="#49372c" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(${dx} ${dy})">${art}</g></svg>`;

function garlic(k,x,y){
  let a=p('M-3-17L4-16L4-8Q17-4 18 9Q18 22 0 24Q-18 22-17 9Q-16-5-5-9Z',`url(#${k}-garlic)`,'stroke-width="1.95"');
  a+=line('M-2-10Q-10 8-5 20M2-10Q9 7 6 20M-12 17L-8 21M11 18L8 21','#b6a17d',1.3,.9);
  a+=line('M-9 3Q-13 8-10 12','#fffceb',1.65,.96);
  return `<g transform="translate(${x} ${y})">${a}</g>`;
}
function chilli(k,x,y){
  let a=p('M-20-2Q-8 5 6-4Q15-9 19-3Q18 8 5 15Q-8 23-23 15Q-13 15-7 11Q-15 9-20-2Z',`url(#${k}-chilli)`,'stroke-width="1.95"');
  a+=p('M13-6Q13-14 22-16L25-11Q18-10 18-3Z',`url(#${k}-green)`,'stroke-width="1.6"');
  a+=line('M-13 5Q-2 10 9 3','#ffd3a6',1.65,.96);
  return `<g transform="translate(${x} ${y}) rotate(-9)">${a}</g>`;
}
function basil(k,x,y,scale=1){
  let a=line('M0 15L0-8M0 4L-8-4M0 8L10 0','#55713b',1.8,.98);
  a+=p('M-2 2Q-22 0-21-15Q-6-20-2 2Z',`url(#${k}-green)`,'stroke-width="1.65"');
  a+=p('M3 7Q2-11 19-14Q27 1 3 7Z',`url(#${k}-green)`,'stroke-width="1.65"');
  a+=p('M0-3Q-8-17 0-25Q11-20 0-3Z',`url(#${k}-green)`,'stroke-width="1.55"');
  a+=line('M-17-12L-6-3M6 3L17-8M0-17L0-10','#c4dda1',1.3,.93);
  return `<g transform="translate(${x} ${y}) scale(${scale})">${a}</g>`;
}
function basilJar(k,x,y){
  let a=p('M-15-18Q-17-13-16-8L-16 19Q-14 26 0 27Q15 26 17 20L16-9Q16-15 12-18Z',`url(#${k}-glass)`,'stroke="#6a7860" stroke-width="1.9" fill-opacity=".7"');
  a+=basil(k,0,8,.65);
  a+=p('M-17-22L15-22L17-16Q15-10 0-10Q-15-10-17-15Z',`url(#${k}-brass)`,'stroke-width="1.8"');
  a+=line('M-10-19L10-19','#fff0c7',1.45,.95);
  a+=line('M-11-6L-11 15M-7 21L0 23','#fcfff0',1.55,.95);
  return `<g transform="translate(${x} ${y})">${a}</g>`;
}

function spiceBox(level){
  const k='eq48-spice-'+level,y=level===1?114:135;
  const defs=grad(k+'-wood',['#cba271','#a77d50','#805634'])+grad(k+'-side',['#ad8150','#8d623c','#68442d'])+grad(k+'-brass',['#f5d590','#d5b16c','#a58144'])+grad(k+'-garlic',['#fff7dc','#eeddbb','#d1ba91'])+grad(k+'-chilli',['#ffb17e','#ed7756','#c64e3e'])+grad(k+'-green',['#c2dfa0','#86b268','#547f4d'])+grad(k+'-glass',['#f6ffe9','#d5e7cc','#a4c3ac']);
  let a='';
  if(level===2){
    a+=p('M47 75L55 76L55 141L47 140Z',`url(#${k}-side)`);
    a+=p('M201 86L209 87L209 153L201 152Z',`url(#${k}-side)`);
    a+=p('M44 86L62 75L212 92L197 105L46 94Z',`url(#${k}-wood)`);
    a+=p('M46 91L197 104L197 111L46 98Z','#b78e5d','stroke-width="2.1"');
    a+=p('M45 121L62 110L211 127L197 139L46 130Z',`url(#${k}-wood)`);
    a+=line('M56 127L188 138','#e5bf85',1.5,.94);
    a+=basilJar(k,175,77);
  }
  if(level===3){
    a+=p('M32 142L36 88Q117 31 215 87L226 146L214 151L203 96Q120 51 48 98L46 145Z',`url(#${k}-side)`);
    a+=p('M46 137L49 98Q122 54 202 97L213 142Z',`url(#${k}-wood)`,'stroke="#785432" stroke-width="1.5"');
    a+=line('M48 90Q119 44 208 92M57 118Q121 77 201 113','#e7c18b',1.55,.92);
    a+=line('M60 129Q126 95 205 125','#92683d',1.35,.78);
  }
  // Three low open cells, rather than a tower of bottles or jars.
  a+=p(`M33 ${y+24}L194 ${y+42}L188 ${y+86}L42 ${y+68}Z`,`url(#${k}-wood)`);
  a+=p(`M194 ${y+42}L221 ${y+15}L215 ${y+61}L188 ${y+86}Z`,`url(#${k}-side)`);
  a+=p(`M27 ${y+6}L61 ${y-13}L225 ${y+8}L194 ${y+42}L32 ${y+24}Z`,`url(#${k}-wood)`);
  a+=p(`M42 ${y+10}L64 ${y-4}L209 ${y+13}L189 ${y+31}Z`,'#765b3b','stroke="#60482e" stroke-width="1.4"');
  a+=p(`M47 ${y+11}L65 ${y}L100 ${y+4}L85 ${y+19}Z`,'#d7c49d','stroke-width="1.25"');
  a+=p(`M95 ${y+17}L111 ${y+5}L153 ${y+9}L137 ${y+24}Z`,'#b6a481','stroke-width="1.25"');
  a+=p(`M148 ${y+23}L163 ${y+12}L203 ${y+16}L188 ${y+29}Z`,'#c8b68d','stroke-width="1.25"');
  a+=p(`M99 ${y+1}L107 ${y+2}L90 ${y+24}L82 ${y+23}Z`,'#b08854','stroke-width="1.65"');
  a+=p(`M152 ${y+7}L160 ${y+8}L144 ${y+31}L136 ${y+30}Z`,'#ad8350','stroke-width="1.65"');
  a+=garlic(k,69,y+1)+chilli(k,120,y+6);
  if(level===1)a+=basil(k,176,y+12,.78);
  if(level===3)a+=basilJar(k,179,y-1);
  a+=p(`M31 ${y+22}L194 ${y+39}L194 ${y+48}L33 ${y+31}Z`,'#be9560');
  a+=line(`M43 ${y+28}L182 ${y+43}`,'#e3c18c',1.55,.94);
  a+=p(`M48 ${y+41}L180 ${y+55}L177 ${y+72}L51 ${y+59}Z`,'#936a43','stroke="#795432" stroke-width="1.35"');
  a+=line(`M57 ${y+45}Q84 ${y+43} 110 ${y+51}M128 ${y+63}Q150 ${y+60} 169 ${y+66}`,'#ba905a',1.3,.85);
  a+=line(`M201 ${y+44}L207 ${y+38}M199 ${y+63}L208 ${y+55}`,'#ba8e56',1.35,.88);
  if(level===3){
    a+=p(`M211 ${y+35}L232 ${y+25}L243 ${y+45}L218 ${y+59}Z`,`url(#${k}-side)`);
    a+=p(`M215 ${y+37}L230 ${y+31}L236 ${y+43}L221 ${y+51}Z`,'#d4b37c','stroke="#926a3f" stroke-width="1.35"');
    a+=line(`M230 ${y+45}L234 ${y+43}`,'#efd18c',3,.98);
    a+=p(`M116 ${y+62}Q127 ${y+57} 138 ${y+64}L137 ${y+70}Q126 ${y+65} 117 ${y+69}Z`,`url(#${k}-brass)`,'stroke-width="1.7"');
    a+=line(`M121 ${y+63}L132 ${y+64}`,'#ffedb5',1.3,.96);
  }
  return doc('香料盒',defs,a,[-21.375,-10.375,-12.125][level-1],[2,2,-7][level-1]);
}

function toast(k,x,y){
  let a=p('M-23-13Q-31-26-20-34Q-8-41 1-32Q13-39 23-29Q31-20 23-12L24 31L-22 26Z',`url(#${k}-crust)`,'stroke-width="2.05"');
  a+=p('M-16-12Q-23-22-16-27Q-8-32 1-25Q12-31 18-23Q22-18 16-12L17 23L-15 20Z','#fff1bd','stroke="#c6a36b" stroke-width="1.35"');
  a+=line('M-16-20Q-13-25-8-24M-12-8L-12 7','#fff9df',1.65,.96);
  a+=e(-3,4,1.8,1.2,'#dfca91','stroke="none"');
  a+=e(8,13,1.4,1,'#dfc58a','stroke="none"');
  return `<g transform="translate(${x} ${y}) rotate(-6)">${a}</g>`;
}
function riceBag(k,x,y){
  let a=p('M-17-13L16-10Q15 1 23 14Q25 29 14 35Q-2 42-20 30Q-27 22-23 10Q-16-2-17-13Z',`url(#${k}-bag)`,'stroke-width="2"');
  a+=e(0,-13,18,7,'#dac498','stroke="#99835a" stroke-width="1.5"');
  a+=e(0,-14,14,4.7,'#fff1ce','stroke="#c8b27f" stroke-width="1.15"');
  a+=line('M-11-15L-7-13M-3-17L1-15M5-15L9-14M-6-12L-2-11M3-12L7-11','#bba16e',1.15,.9);
  a+=line('M-13 0Q-17 10-13 17M14 7Q18 19 13 26M-12 29Q-2 35 10 31','#b59b6b',1.3,.9);
  a+=line('M-15 9L-16 15','#fff8db',1.65,.96);
  return `<g transform="translate(${x} ${y}) rotate(6)">${a}</g>`;
}

function grainBox(level){
  const k='eq48-grain-'+level;
  const defs=grad(k+'-enamel',['#fff9df','#eee2bd','#c8c8a4'])+grad(k+'-shade',['#e7e4c4','#c9cfb4','#a5b79f'])+grad(k+'-wood',['#edcf99','#d2a66c','#ad7c49'])+grad(k+'-linen',['#fffbed','#f2ead2','#d8c9a5'])+grad(k+'-crust',['#f6cf87','#d6a05a','#b77d3f'])+grad(k+'-bag',['#fff1ca','#e4d1a2','#c4ac7d'])+grad(k+'-metal',['#eee8cb','#c5c8ad','#959f88']);
  let a='';
  if(level>=2){const lift=level===3?-12:0;
    a+=p(`M37 ${125+lift}L39 ${99+lift}Q43 ${70+lift} 75 ${70+lift}L179 ${82+lift}Q209 ${83+lift} 219 ${111+lift}L223 ${134+lift}L205 ${145+lift}L202 ${117+lift}Q196 ${99+lift} 176 ${98+lift}L75 ${86+lift}Q57 ${85+lift} 55 ${107+lift}L55 ${134+lift}Z`,`url(#${k}-enamel)`);
    a+=line(`M49 ${104+lift}Q52 ${80+lift} 75 ${79+lift}L180 ${91+lift}Q198 ${93+lift} 207 ${112+lift}`,'#fffced',1.8,.95);
    a+=line(`M55 ${96+lift}Q63 ${87+lift} 77 ${88+lift}L175 ${99+lift}M53 ${109+lift}Q62 ${98+lift} 76 ${100+lift}`,'#b6b99b',1.35,.85);
    a+=p('M216 151Q238 143 241 157Q246 175 224 181L217 173Q234 170 233 159Q233 154 220 160Z',`url(#${k}-metal)`,'stroke-width="2.2"');
    a+=line('M225 151Q236 149 237 159','#fff9de',1.5,.96);
  }
  // A small pale-wood base supports a low rounded enamel bread box, without crate slats.
  a+=p('M34 187L195 202L226 181L229 192L198 217L34 201Z',`url(#${k}-wood)`);
  a+=line('M43 196L189 210M201 209L219 196','#f9e3b5',1.5,.94);
  a+=p('M30 133L192 147Q203 149 201 163L197 195Q194 204 180 203L43 191Q32 190 31 169Z',`url(#${k}-enamel)`);
  a+=p('M192 147L225 132L222 174Q220 190 197 201L201 164Z',`url(#${k}-shade)`);
  a+=p('M29 128Q29 121 39 119L195 130L224 131Q230 136 222 142L197 160L38 146Q29 143 29 135Z',`url(#${k}-enamel)`);
  a+=p('M42 128L191 140L214 137L193 153L43 140Z','#c9b995','stroke="#a4a081" stroke-width="1.35"');
  // A plain soft cloth lining; only one toast slice and one little open rice sack.
  a+=p('M44 129Q55 124 67 129L185 140L207 138L193 151L106 147L102 171L86 164L74 169L58 158L51 146L43 143Z',`url(#${k}-linen)`,'stroke="#b5ab8d" stroke-width="1.4"');
  a+=line('M58 141L66 154L76 159M84 148L87 157M94 149L94 163','#c9bd9b',1.3,.88);
  a+=toast(k,96,113)+riceBag(k,163,116);
  a+=p('M32 140L197 153L196 162L35 149Z','#f4e8c6');
  a+=line('M42 145L183 156','#fffced',1.55,.95);
  a+=line('M43 163Q42 176 52 182M206 157L204 181','#fff9e5',1.7,.93);
  if(level===3){
    // A small usable front grain drawer, with a shallow open top and rounded pull.
    a+=p('M64 172L156 180L164 196L71 190Z','#baab87','stroke-width="2"');
    a+=p('M70 175L152 183L157 190L74 184Z','#f5e7bc','stroke="#c8b68a" stroke-width="1.25"');
    a+=line('M83 180L88 179M98 182L103 181M119 184L124 183','#c2ac79',1.4,.92);
    a+=p('M71 190L164 196L162 211L72 204Z',`url(#${k}-enamel)`,'stroke-width="2.2"');
    a+=p('M108 195Q116 191 125 197L125 202Q116 198 109 201Z',`url(#${k}-wood)`,'stroke-width="1.7"');
    a+=line('M113 196L120 197','#fff0c4',1.3,.95);
  }
  return doc('谷物面点箱',defs,a,[-19.375,-15.5,-9.5][level-1],level===1?-1:-7.25);
}

const occupancy=[.78,.82,.84];
export const producerDryCandidates=[
  ...[1,2,3].map(level=>({id:`spice-box-l${level}`,code:`EQ05-L${level}`,name:'香料盒',familyId:'spice-box',level,expectedOccupancy:occupancy[level-1],svg:spiceBox(level),reason:['暗暖木低盒以三个开放分格与少量蒜头、红椒、罗勒建立香料身份，不堆瓶罐。','在低分格盒后增加双层小置架与唯一一只透明罗勒罐，前格仍清楚、数量克制。','半立弧盖与侧小抽屉、小黄铜提手形成实际功能升级，保留低分格和唯一罗勒小罐。'][level-1],design:{silhouette:['暗暖木低开放三分格盒','暗木前分格、后双层小置架与单只透明罗勒罐','半立弧形盒盖、低分格、侧小抽屉与小黄铜提手'][level-1],angle:'三分之四俯视，低分格、木框厚度和右侧面可辨，左上光',material:'暗暖木、柔和衬垫、温润蒜头、鲜红椒与罗勒绿；升级后仅一只轻透小罐及少量黄铜',identity:'唯一产出fresh-spice，只画蒜头、红椒、罗勒小标志，不添加胡椒、盐、孜然或其它不存在链身份',progression:'一级低开放三分格，二级后双层置架及单罗勒罐，三级弧盖、侧抽屉和提手；不靠堆大量瓶罐升级',palette:'温暗木棕承托象牙蒜、珊瑚椒与罗勒绿，少量金属暖光不抢主形',size:`目标体量${Math.round(occupancy[level-1]*100)}%，自包含透明SVG、留白居中，无图内文字、数字或等级角标`}})),
  ...[1,2,3].map(level=>({id:`grain-box-l${level}`,code:`EQ08-L${level}`,name:'谷物面点箱',familyId:'grain-box',level,expectedOccupancy:occupancy[level-1],svg:grainBox(level),reason:['低宽奶油搪瓷圆角面点盒配浅木底座，以布衬托一片吐司和一小开口米袋。','半开弧形卷盖和侧提手构成清楚升级，保留低搪瓷盒、软布衬与两种谷物标志。','弧盖与清楚可用的前谷物小抽屉共同表现高阶收纳，不变成木条果箱或香料格架。'][level-1],design:{silhouette:['敞开低宽奶油搪瓷圆角盒与浅木底座','低搪瓷面点盒、半开弧形卷盖及侧提手','弧形卷盖、侧提手与清楚前谷物小抽屉'][level-1],angle:'三分之四轻俯视，奶油圆角盒、开放前口、布衬和侧面厚度可见，左上光',material:'温润奶油搪瓷、柔软素布、浅木底座、金吐司边和开口布米袋，细近黑轮廓清楚',identity:'唯一产出fresh-grain；只用一片吐司和一小开口米袋提示链，不画其它链水果、蔬菜、奶油或额外食物',progression:'一级开放低盒，二级半开弧形卷盖和侧提手，三级增加前谷物小抽屉；结构升级不单纯放大',palette:'奶油白、浅麦金、米袋暖布色和淡木底座，与暖木条果箱及深木香料盒区分',size:`目标体量${Math.round(occupancy[level-1]*100)}%，透明留白与视觉居中，图内无文字、数字或等级角标`}})),
];

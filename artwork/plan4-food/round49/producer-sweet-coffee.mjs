// Round 49: horizontal sweet displays and real bean-grinding mechanisms.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,c,w=1.5,o=1)=>p(d,'none',`stroke="${c}" stroke-width="${w}" opacity="${o}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0,dx=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 生产器新版候选</title><defs>${defs}</defs><g stroke="#49372e" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(${dx} ${dy})">${art}</g></svg>`;

function sugarJar(k,x,y,s=1){
  let a=p('M-16-14L15-14L17 19Q14 27 0 27Q-15 26-18 19Z',`url(#${k}-glass)`,'stroke="#8b8271" stroke-width="1.85" fill-opacity=".76"');
  a+=p('M-13 4Q-2 0 13 5L13 18Q0 23-13 18Z','#fff6db','stroke="#c9bda0" stroke-width="1.2"');
  a+=p('M-10 2L-3 0L1 5L-3 11L-11 8Z','#fffcf0','stroke="#d6c9ae" stroke-width="1.1"');
  a+=p('M1 8L8 5L13 10L10 16L3 16Z','#fffbed','stroke="#d6c9ae" stroke-width="1.1"');
  a+=p('M-18-17Q0-23 17-16L17-10Q0-4-18-10Z',`url(#${k}-rose)`,'stroke-width="1.85"');
  a+=line('M-10-15Q0-18 10-15M-13-3L-13 13','#fffaf0',1.5,.95);
  return `<g transform="translate(${x} ${y}) scale(${s})">${a}</g>`;
}
function syrupBottle(k,x,y,s=1){
  let a=p('M-6-23L6-22L7-12Q16-7 16 2L15 24Q0 31-15 24L-16 1Q-15-8-7-12Z',`url(#${k}-syrup)`,'stroke-width="1.9"');
  a+=p('M-8-28L8-27L9-21L-8-21Z','#b28b57','stroke-width="1.65"');
  a+=line('M-9 0L-9 15M-4-16L-3-12','#ffefb3',1.55,.94);
  a+=line('M-7 24Q0 27 7 24','#cc8e36',1.25,.82);
  return `<g transform="translate(${x} ${y}) scale(${s})">${a}</g>`;
}
function chocolate(k,x,y,s=1){
  let a=p('M-16-22L12-25L20-18L18 24L-12 28L-19 21Z',`url(#${k}-chocolate)`,'stroke-width="1.95"');
  a+=p('M-16-22L12-25L13 19L-16 23Z','#996442','stroke="#5c3d2d" stroke-width="1.3"');
  a+=line('M-2-23L-3 21M-15-8L12-11M-16 7L12 4','#573a2a',1.35,.95);
  a+=line('M-12-17L-7-18M2-19L7-20M-12-2L-7-3M2-5L7-6M-13 13L-8 12','#cb9462',1.3,.94);
  return `<g transform="translate(${x} ${y}) rotate(7) scale(${s})">${a}</g>`;
}
function glassShield(k,x,y,w,h){
  return p(`M${x} ${y}Q${x+2} ${y-h} ${x+w/2} ${y-h}Q${x+w-2} ${y-h} ${x+w} ${y}L${x+w-2} ${y+13}Q${x+w/2} ${y+23} ${x+2} ${y+9}Z`,`url(#${k}-glass)`,'stroke="#826f68" stroke-width="2.35" fill-opacity=".35"')
    +line(`M${x+8} ${y-2}Q${x+12} ${y-h+13} ${x+w*.37} ${y-h+7}`,'#fff9ee',1.8,.96)
    +line(`M${x+w-10} ${y-5}Q${x+w-10} ${y-h*.45} ${x+w-25} ${y-h*.67}`,'#f8fff0',1.45,.85);
}

function sweetCabinet(level){
  const k='eq49-sweet-'+level;
  const defs=grad(k+'-rose',['#f6d4cb','#dfa6ad','#bd7c90'])+grad(k+'-cream',['#fff5dc','#efdfba','#cfbf99'])+grad(k+'-side',['#ddadb2','#bf8799','#9e657b'])+grad(k+'-glass',['#fff9ec','#e8efdf','#c6dcd0'])+grad(k+'-syrup',['#ffe297','#e9b456','#be8036'])+grad(k+'-chocolate',['#be8a5b','#895839','#5d3b2c'])+grad(k+'-metal',['#f1dbad','#d2b57a','#a98a54']);
  let a='';
  if(level===3){
    // The rear raised display is independent of the low front display, not a tall door cabinet.
    a+=p('M55 87L63 87L63 144L55 143Z',`url(#${k}-side)`);
    a+=p('M190 96L199 97L199 150L190 149Z',`url(#${k}-side)`);
    a+=p('M49 91L72 78L203 92L188 107L50 100Z',`url(#${k}-cream)`);
    a+=syrupBottle(k,127,78,.72);
    a+=glassShield(k,60,79,132,33);
    a+=p('M51 99L188 110L187 118L52 107Z',`url(#${k}-rose)`,'stroke-width="2.2"');
    a+=line('M61 103L177 113','#ffe6d4',1.45,.95);
  }
  // Low rose-and-cream base, broad frontage and small feet at every level.
  const by=level===1?123:149;
  a+=p(`M42 ${by+61}L59 ${by+62}L58 ${by+75}L43 ${by+73}Z`,`url(#${k}-metal)`,'stroke-width="2"');
  a+=p(`M179 ${by+70}L195 ${by+66}L194 ${by+80}L180 ${by+82}Z`,`url(#${k}-metal)`,'stroke-width="2"');
  a+=p(`M33 ${by}L198 ${by+13}L198 ${by+69}Q196 ${by+76} 185 ${by+76}L43 ${by+63}Q34 ${by+61} 33 ${by+52}Z`,`url(#${k}-rose)`);
  a+=p(`M198 ${by+13}L222 ${by-2}L219 ${by+54}L198 ${by+69}Z`,`url(#${k}-side)`);
  if(level===1){
    a+=p('M44 134L91 138L91 180L45 176Z','#fff3dc','stroke="#ae8a7a" stroke-width="1.5"');
    a+=p('M100 139L145 143L145 185L100 181Z','#fff0d4','stroke="#ae8a7a" stroke-width="1.5"');
    a+=p('M154 144L190 147L190 190L154 186Z','#fae6cb','stroke="#ae8a7a" stroke-width="1.5"');
    a+=sugarJar(k,68,154,.74)+syrupBottle(k,122,158,.73)+chocolate(k,173,164,.69);
    a+=line('M49 178L87 181M105 184L141 187M158 189L186 192','#e4b5b2',1.45,.95);
  }else{
    a+=p('M44 164L186 176L185 199L45 187Z',`url(#${k}-cream)`,'stroke="#b48f84" stroke-width="1.6"');
    a+=p('M98 180Q110 175 122 182L122 187Q110 182 99 186Z',`url(#${k}-metal)`,'stroke-width="1.7"');
    a+=line('M50 170L176 181','#fff7df',1.45,.95);
    a+=line('M204 171L213 165M203 190L213 184','#e8bec4',1.35,.9);
  }
  a+=p(`M28 ${by-4}L53 ${by-18}L224 ${by-3}L199 ${by+16}L31 ${by+3}Z`,`url(#${k}-cream)`);
  a+=p(`M39 ${by-4}L55 ${by-11}L210 ${by+1}L196 ${by+10}Z`,'#d9c4a4','stroke="#b59d85" stroke-width="1.3"');
  if(level===2){
    a+=sugarJar(k,72,121,.76)+syrupBottle(k,126,117,.8)+chocolate(k,179,124,.75);
    a+=glassShield(k,39,128,174,53);
  }
  if(level===3){
    a+=sugarJar(k,78,132,.75)+chocolate(k,174,135,.75);
    a+=glassShield(k,39,140,174,37);
  }
  a+=p(`M31 ${by+1}L199 ${by+14}L199 ${by+21}L32 ${by+8}Z`,level===1?'#f3d2c1':'#e2b4b5','stroke-width="2.2"');
  a+=line(`M42 ${by+7}L188 ${by+18}`,'#fff3dd',1.55,.96);
  a+=line(`M41 ${by+30}L41 ${by+47}`,'#ffe5d4',1.6,.9);
  return doc('甜料柜',defs,a,[-27,-24,-10][level-1],-1);
}

function bean(k,x,y,s=1,angle=0){
  return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${s})">`+e(0,0,7,4.6,`url(#${k}-bean)`,'stroke-width="1.45"')+line('M-4-2Q1-2 2 2','#d6a271',1.2,.94)+'</g>';
}
function grinderDrawer(k,level){
  let a=p('M82 164L153 170L152 196L82 189Z','#775437','stroke-width="2"');
  a+=p('M87 169L148 174L147 190L88 185Z',`url(#${k}-wood)`,'stroke="#aa7d4b" stroke-width="1.35"');
  a+=e(118,180,10,4,`url(#${k}-brass)`,'stroke-width="1.45"');
  a+=line('M112 178L120 178','#fce1ac',1.3,.96);
  if(level===3){
    a+=p('M90 173L150 178L158 190L97 184Z','#b18c5c','stroke-width="1.65"');
    a+=p('M97 177L145 181L150 185L100 181Z','#684831','stroke-width="1.2"');
    a+=line('M108 179L112 180M123 181L127 182M136 182L140 183','#a87b4c',1.3,.95);
    a+=p('M97 184L158 190L157 202L98 196Z',`url(#${k}-wood)`,'stroke-width="2"');
    a+=e(125,193,8,3.5,`url(#${k}-brass)`,'stroke-width="1.35"');
  }
  return a;
}

function coffeeGrinder(level){
  const k='eq49-coffee-'+level;
  const defs=grad(k+'-wood',['#d1a374','#aa7b50','#785335'])+grad(k+'-side',['#b98e60','#926741','#62492f'])+grad(k+'-brass',['#f2d595','#d2af6b','#a88343'])+grad(k+'-metal',['#ecedda','#c6d7c9','#91aea1'])+grad(k+'-glass',['#f7fff0','#d7e7d7','#a7c6b8'])+grad(k+'-bean',['#bb8757','#8c5c39','#604029']);
  let a='';
  if(level>=2){
    a+=p('M59 199L174 210L203 191L209 203L176 224L60 213Z',`url(#${k}-metal)`);
    a+=line('M68 207L172 217M181 215L200 203','#faf9df',1.55,.94);
  }
  // Walnut case and a real ground-coffee drawer. No cup, water tank or brewing head.
  a+=p('M69 137L166 146L166 207L71 198Q65 196 65 187L65 144Z',`url(#${k}-wood)`);
  a+=p('M166 146L192 129L191 188L166 207Z',`url(#${k}-side)`);
  a+=p('M62 133L87 117L197 127L169 151L64 142Z',`url(#${k}-metal)`);
  a+=line('M73 137L160 145','#fff0c3',1.55,.95);
  a+=line('M73 151L73 184M174 156L183 149M175 187L183 181','#d2a874',1.4,.88);
  a+=grinderDrawer(k,level);
  // Clearly visible grinding collar joins the hopper to the drawer case.
  a+=p('M104 113L153 117L154 136Q129 147 102 133Z',`url(#${k}-brass)`);
  a+=e(128,116,26,8,'#e7c88b','stroke-width="1.65"');
  if(level>=2){
    a+=p('M99 125L106 122L111 126L117 124L123 128L129 126L136 129L142 126L149 128L156 124L160 130L156 140Q128 151 99 137Z',`url(#${k}-brass)`,'stroke-width="2"');
    a+=line('M108 132L108 138M120 135L120 142M134 136L134 143M148 133L148 140','#a17d3d',1.3,.9);
    a+=e(182,153,8,9,`url(#${k}-metal)`,'stroke-width="1.8"');
    a+=line('M178 150L185 156M178 156L185 150','#8c9b81',1.3,.9);
  }
  if(level<=2){
    // Open metal bean bowl and hand crank retain the small manual-mill identity.
    a+=p('M81 96Q88 127 126 132Q163 129 173 104L173 97Z',`url(#${k}-brass)`);
    a+=e(127,96,47,15,'#e1c18a');
    a+=e(127,96,39,10,'#8f7149','stroke="#967848" stroke-width="1.3"');
    a+=bean(k,108,96,1.05,-18)+bean(k,133,94,1.1,25)+bean(k,151,99,.9,-7);
    a+=p('M122 93L123 67L131 67L132 95Z',`url(#${k}-metal)`,'stroke-width="2"');
    a+=p('M125 66L169 69L178 60L183 65L173 77L126 75Z',`url(#${k}-brass)`,'stroke-width="2.1"');
    a+=e(184,58,10,12,`url(#${k}-wood)`,'stroke-width="2.2"');
    a+=line('M180 52Q183 48 187 51M131 69L161 72','#f8ddb0',1.5,.95);
  }else{
    // Transparent bean hopper, compact side motor and visible output chute make an electric mill.
    a+=p('M94 65L103 110Q127 125 153 113L164 69Z',`url(#${k}-glass)`,'stroke="#738b75" stroke-width="2.2" fill-opacity=".65"');
    a+=e(129,65,35,11,'#eef4df','stroke="#7f9279" stroke-width="1.6"');
    a+=p('M103 86Q130 78 155 89L151 108Q129 118 107 106Z','#b89a69','stroke="#95805a" stroke-width="1.15" fill-opacity=".48"');
    a+=bean(k,116,91,1.08,-24)+bean(k,138,93,1.03,18)+bean(k,127,104,.92,-6);
    a+=p('M92 62L107 52L153 57L168 67L162 73L96 68Z',`url(#${k}-wood)`,'stroke-width="2.1"');
    a+=e(128,55,8,4,`url(#${k}-brass)`,'stroke-width="1.6"');
    a+=line('M101 74L106 98M149 75L146 86','#faffed',1.7,.95);
    // A short folded crank remains on the grinding collar.
    a+=p('M104 119L78 117L72 105L66 108L72 126L104 128Z',`url(#${k}-brass)`,'stroke-width="2"');
    a+=e(67,101,7,9,`url(#${k}-wood)`,'stroke-width="2"');
    a+=p('M176 116Q194 105 209 119L216 153Q216 165 205 170L180 165Z',`url(#${k}-metal)`);
    a+=p('M182 120Q192 114 201 120L207 145L184 142Z','#d5e3d3','stroke="#9aa991" stroke-width="1.25"');
    a+=line('M187 147L203 150M188 154L204 157','#718b7c',1.5,.95);
    a+=p('M147 142L160 145L153 169L135 170L134 162L145 160Z',`url(#${k}-metal)`,'stroke-width="2"');
    a+=p('M146 149L154 151L149 163L139 164Z','#87704f','stroke-width="1.3"');
    a+=line('M143 163L145 168M148 164L149 169','#8e5e38',1.6,.9);
  }
  return doc('咖啡豆磨机',defs,a,[-8,-16,-14][level-1],[-2,-2,-10][level-1]);
}

const occupancy=[.78,.82,.84];
export const producerSweetCoffeeCandidates=[
  ...[1,2,3].map(level=>({id:`sweet-cabinet-l${level}`,code:`EQ09-L${level}`,name:'甜料柜',familyId:'sweet-cabinet',level,expectedOccupancy:occupancy[level-1],svg:sweetCabinet(level),reason:['玫瑰奶油低柜以开放分格展示一只糖罐、少量糖浆和巧克力，横向轻巧而非竖直高柜。','单段弧玻璃护罩保护甜料陈列，下方加入清楚抽屉，延续低柜比例。','前低后高的两层独立陈列结构将糖浆与糖罐、巧克力分开，保持宽矮家族轮廓。'][level-1],design:{silhouette:['横向玫瑰奶油低柜、三开放格和小柜脚','宽低玫瑰柜、弧玻璃护罩和前抽屉','前低后高两层独立陈列台、各自玻璃护罩与低抽屉柜'][level-1],angle:'三分之四轻俯视，柜台、陈列格、右侧厚度与小脚可见，统一左上光',material:'玫瑰奶油搪瓷、淡玻璃反光、金色糖浆和可可巧克力，细近黑轮廓清楚',identity:'唯一产出fresh-sweet，只用少量糖罐、糖浆和巧克力标志，不加入水果、蛋糕或其它链食材',progression:'一级开放格，二级弧玻璃护罩与抽屉，三级前后错层的独立陈列结构；不做竖乳品柜或靠堆罐升级',palette:'柔玫瑰、奶油、克制暖金与巧棕，鲜活而保持甜料身份',size:`目标体量${Math.round(occupancy[level-1]*100)}%，自包含透明SVG、留白居中，无图内字、数字或等级角标`}})),
  ...[1,2,3].map(level=>({id:`coffee-grinder-l${level}`,code:`EQ12-L${level}`,name:'咖啡豆磨机',familyId:'coffee-grinder',level,expectedOccupancy:occupancy[level-1],svg:coffeeGrinder(level),reason:['小手摇磨机以胡桃木出粉箱、黄铜豆碗和清楚摇柄表现真实研磨结构。','可调磨芯、调节轮与稳固金属底座构成机械升级，豆仓、摇柄和抽粉箱保持可辨。','透明豆仓与可见咖啡豆、紧凑侧电机外壳和出粉导槽形成高阶磨机，保留独立出粉抽屉。'][level-1],design:{silhouette:['小型胡桃木手摇磨机，金属豆碗、黄铜摇柄与前出粉抽屉','手摇磨机加可调磨芯、调节轮和宽稳底座','透明豆仓、折叠短摇柄、侧电机与导槽进入前出粉抽屉'][level-1],angle:'三分之四俯视，豆仓、磨芯和前抽屉的上下关系清楚，左上光',material:'温暖胡桃木、黄铜、淡冷金属与少量咖啡豆；三级玻璃仓轻透，机械体积清楚',identity:'唯一产出fresh-coffee，以咖啡豆、研磨芯和出粉抽屉说明身份；无水箱、冲煮头、饮用杯或杯托',progression:'一级手摇、二级调磨与稳固底座、三级透明豆仓及侧电机/出粉导槽；功能结构升级，不变成咖啡冲煮机',palette:'胡桃木棕、温黄铜与淡灰绿金属，咖啡豆深浅有层次，不用满黑大块',size:`目标体量${Math.round(occupancy[level-1]*100)}%，透明留白与居中，图内无文字、数字或等级角标`}})),
];

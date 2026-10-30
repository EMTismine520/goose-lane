// Round 51: one round cooking pot and one broad shallow frying surface, with real upgrades.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,c,w=1.5,o=1)=>p(d,'none',`stroke="${c}" stroke-width="${w}" opacity="${o}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0,dx=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 料理器具新版候选</title><defs>${defs}</defs><g stroke="#49372d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(${dx} ${dy})">${art}</g></svg>`;

function potLid(k,glass=false){
  let a=p('M65 108Q72 77 125 77Q178 76 191 110Q129 133 65 108Z',glass?`url(#${k}-glass)`:`url(#${k}-cream)`,glass?'fill-opacity=".72"':'');
  a+=p('M64 107Q126 126 191 109L192 115Q128 137 63 114Z',`url(#${k}-brass)`,'stroke-width="2.1"');
  a+=line('M77 101Q87 85 112 86M83 113Q104 120 123 121','#fff9e1',1.8,.96);
  a+=p('M115 78L117 70Q127 64 139 71L141 79Z',`url(#${k}-brass)`,'stroke-width="2"');
  a+=e(128,70,13,5,`url(#${k}-brass)`,'stroke-width="1.9"');
  a+=line('M121 68L130 67','#ffedb7',1.4,.95);
  if(glass){
    a+=e(159,99,7,3.4,`url(#${k}-brass)`,'stroke-width="1.5"');
    a+=e(157,99,1.25,.85,'#765a36','stroke="none"');
    a+=e(161,99,1.1,.8,'#765a36','stroke="none"');
    a+=line('M145 88Q162 91 173 102','#edf7df',1.5,.92);
  }
  return a;
}
function cookingPot(level){
  const k='eq51-pot-'+level,defs=grad(k+'-coral',['#f9bea0','#e78d76','#c56d64'])+grad(k+'-shade',['#e8a386','#c97768','#a55251'])+grad(k+'-cream',['#fff4d6','#eeddb3','#ccb98b'])+grad(k+'-brass',['#f2d69a','#d6b46b','#aa8745'])+grad(k+'-metal',['#edf1dd','#c9d7c7','#95afa1'])+grad(k+'-glass',['#f9ffed','#dcead9','#bad1c5']);
  let a='';
  if(level===3){
    // A short stable hob, with a rear lid-rest physically connected to it.
    a+=p('M53 196L194 207L218 189L220 217L195 236L54 223Z',`url(#${k}-cream)`);
    a+=p('M194 207L218 189L220 217L195 236Z',`url(#${k}-metal)`,'stroke-width="2.2"');
    a+=p('M49 194L72 182L218 190L195 211L51 202Z',`url(#${k}-metal)`);
    a+=e(129,195,54,12,'#9d9772','stroke="#7e805f" stroke-width="1.55"');
    a+=e(126,218,8,7,`url(#${k}-brass)`,'stroke-width="1.9"');
    a+=line('M126 213L127 218','#fff1be',1.45,.95);
    a+=p('M62 223L76 224L75 233L62 232Z','#7f8870','stroke-width="1.8"');
    a+=p('M179 233L192 234L192 241L179 240Z','#7f8870','stroke-width="1.8"');
    a+=p('M197 204L201 143Q201 137 208 138L214 151L211 155L207 148L206 204Z',`url(#${k}-brass)`,'stroke-width="2.1"');
    // One stored lid stands in the rear cradle, leaving the pot opening accessible.
    a+=`<g transform="translate(178 103) rotate(23)">`;
    a+=e(0,0,39,49,`url(#${k}-brass)`);
    a+=e(0,-1,33,42,`url(#${k}-glass)`,'stroke="#9cac8d" stroke-width="1.6" fill-opacity=".76"');
    a+=p('M-6-3Q2-10 9-3L10 7Q2 14-6 7Z',`url(#${k}-brass)`,'stroke-width="1.9"');
    a+=line('M-24-23Q-18-37-4-37M-27-13L-29-5','#fcffe9',1.8,.96);
    a+='</g>';
  }
  // Two real ear handles, with a visible open grip rather than solid side blocks.
  a+=p('M66 120Q45 112 36 125Q27 140 38 155Q46 163 65 157L66 146Q51 151 46 143Q41 133 49 130L65 135Z',`url(#${k}-brass)`);
  a+=p('M188 124Q207 116 218 128Q228 143 217 159Q208 167 188 160L187 149Q202 155 208 146Q214 135 204 133L188 138Z',`url(#${k}-brass)`);
  if(level>=2){
    a+=p('M36 127Q31 140 39 152L48 151Q42 140 47 131Z',`url(#${k}-cream)`,'stroke-width="1.9"');
    a+=p('M210 132Q219 139 211 154L220 155Q229 141 219 129Z',`url(#${k}-cream)`,'stroke-width="1.9"');
  }
  a+=p('M62 114L192 119Q194 153 175 176Q155 197 127 198Q94 198 75 176Q58 154 62 114Z',`url(#${k}-coral)`);
  a+=p('M70 128Q71 155 89 170Q99 178 108 179Q83 177 74 157Q67 142 70 128Z','#ffe2bc','stroke="none" opacity=".66"');
  a+=line('M82 175Q96 188 114 190M171 145Q168 163 157 173','#f8bea0',1.7,.94);
  if(level>=2){
    a+=p('M76 175Q127 205 176 174L172 187Q128 213 81 188Z',`url(#${k}-metal)`,'stroke-width="2.1"');
    a+=line('M88 188Q125 204 162 190','#f9f4d9',1.6,.95);
  }
  a+=e(127,116,66,19,`url(#${k}-brass)`,'stroke-width="2.2"');
  a+=e(127,116,58,13,'#516864','stroke="#806e4c" stroke-width="1.4"');
  if(level<=2)a+=potLid(k,level===2);
  else{
    a+=e(127,117,51,10,'#61766c','stroke="#87967e" stroke-width="1.25"');
    a+=line('M77 118Q92 129 116 130M146 129Q163 127 176 119','#fff0c2',1.65,.95);
  }
  return doc('料理锅',defs,a,[-7,-10,-18][level-1],level===3?-1:0);
}

function smallEgg(x,y){
  let a=p('M-20-4Q-24-13-14-17Q-7-22 2-17Q13-21 18-11Q28-7 22 3Q25 13 14 16Q5 23-5 17Q-18 20-21 10Q-29 4-20-4Z','#fff1ca','stroke="#b6a47b" stroke-width="1.65"');
  a+=p('M-17-3Q-19-11-11-12Q-4-17 3-13Q12-16 16-7Q23-3 18 4Q19 12 9 13Q1 18-7 13Q-17 15-16 7Z','#fffcef','stroke="none"');
  a+=e(1,-1,10,8.5,'#f4ba45','stroke="#c18e32" stroke-width="1.3"');
  a+=line('M-4-4Q0-7 5-5','#ffe49a',1.45,.96);
  return `<g transform="translate(${x} ${y}) scale(.71)">${a}</g>`;
}
function fryingStation(level){
  const k='eq51-fry-'+level,defs=grad(k+'-cream',['#fff5d3','#ead69b','#cbb579'])+grad(k+'-side',['#e6d293','#c4b076','#a18f5c'])+grad(k+'-iron',['#82938b','#596e67','#354e49'])+grad(k+'-metal',['#eef0d8','#c9d5c3','#97afa0'])+grad(k+'-brass',['#f4daa0','#d2b66f','#a58b4a']);
  let a='';
  if(level>=2){
    // A short practical splash guard, with no tall oven body or overhead chimney.
    a+=p('M65 56L223 73L222 100L65 83Z',`url(#${k}-cream)`);
    a+=p('M72 64L215 79L215 92L72 77Z','#d3d9bd','stroke="#a6ad90" stroke-width="1.35"');
    a+=line('M75 65L205 79','#fff7da',1.55,.95);
  }
  a+=p('M42 177L57 178L56 195L42 193Z','#7c8570','stroke-width="2"');
  a+=p('M178 189L193 186L193 202L178 205Z','#7c8570','stroke-width="2"');
  a+=p('M33 145L198 161L197 192L42 179Q33 178 33 169Z',`url(#${k}-cream)`);
  a+=p('M198 161L222 104L222 139L197 192Z',`url(#${k}-side)`);
  a+=p('M31 144L65 82L221 98L199 163Z',`url(#${k}-metal)`);
  if(level===3){
    // Two independent flat surfaces, not bars of a charcoal grill.
    a+=p('M42 139L69 90L139 97L115 146Z',`url(#${k}-iron)`,'stroke="#43554b" stroke-width="1.6"');
    a+=p('M121 146L145 97L212 105L194 155Z',`url(#${k}-iron)`,'stroke="#43554b" stroke-width="1.6"');
    a+=p('M139 96L145 97L121 151L115 150Z',`url(#${k}-brass)`,'stroke-width="1.35"');
    a+=line('M74 96L128 101M151 105L203 111','#9fb2a3',1.4,.66);
  }else{
    a+=p('M42 139L69 90L212 105L194 155Z',`url(#${k}-iron)`,'stroke="#43554b" stroke-width="1.7"');
    a+=line('M76 97L199 110','#9eafa1',1.5,.65);
  }
  a+=smallEgg(level===3?94:126,121);
  if(level>=2){
    a+=p('M38 145L195 159L194 166L37 152Z','#8f8c64','stroke="#6b6d4e" stroke-width="1.55"');
    a+=p('M47 148L186 160L185 162L47 151Z','#505e4c','stroke="none"');
    a+=e(level===3?114:174,level===3?155:160,3.3,1.7,'#253c35','stroke="#a8a377" stroke-width="1.1"');
  }else{
    a+=p('M31 144L199 161L199 169L32 152Z','#b7bda1','stroke-width="2.1"');
  }
  if(level===3){
    a+=p('M83 169L143 175L143 191L84 185Z',`url(#${k}-metal)`,'stroke-width="1.9"');
    a+=p('M103 178Q112 174 122 180L122 184Q112 180 104 183Z',`url(#${k}-brass)`,'stroke-width="1.5"');
    a+=e(57,177,6,5.4,`url(#${k}-brass)`,'stroke-width="1.6"');
    a+=e(173,188,6,5.4,`url(#${k}-brass)`,'stroke-width="1.6"');
    a+=line('M56 173L57 177M172 184L173 188','#fff0b8',1.25,.95);
    a+=p('M213 138L234 140Q242 142 239 148Q238 152 231 151L209 149Z','#5f7161','stroke-width="2.1"');
    a+=line('M217 141L232 143','#b6c3a7',1.45,.93);
  }else{
    a+=e(113,174,8,7,`url(#${k}-brass)`,'stroke-width="1.9"');
    a+=line('M112 169L113 174','#fff0bc',1.4,.96);
  }
  a+=line('M43 162L43 172M64 184L91 186M204 163L213 147','#fff3cc',1.5,.94);
  return doc('煎台',defs,a,[-11,0,-1][level-1],level===3?-8:0);
}

const occupancy=[.78,.82,.84];
export const appliancePotFryingCandidates=[
  ...[1,2,3].map(level=>({id:`home-cooking-pot-l${level}`,code:`EQ17-L${level}`,name:'料理锅',familyId:'home-cooking-pot',deviceKind:'appliance',outputChains:[],level,expectedOccupancy:occupancy[level-1],svg:cookingPot(level),reason:['暖珊瑚红低圆腹双耳锅配清楚圆润锅盖，黄铜盖圈与奶油高光表现温暖家常锅具。','厚底、独立防烫握柄、可视锅盖与小蒸汽口形成实质结构升级。','低灶座和真实连接的立盖收纳架让锅口可操作，锅与同一只锅盖关系清楚。'][level-1],design:{silhouette:['低圆腹双耳锅、圆润盖与小黄铜盖钮','厚底圆腹锅、防烫双耳、带蒸汽口可视盖','珊瑚圆腹锅、稳固低灶座和后侧立盖收纳'][level-1],angle:'轻俯视三分之四角度，锅盖、双耳、圆腹和厚底都有清楚体积，左上光',material:'暖珊瑚红搪瓷、奶油防烫件、黄铜盖圈与淡冷金属，三级立盖玻璃轻透',identity:'用于家常炖煮以及海鲜汤、粥、饭等料理，保持锅具主体清楚，不用大量食材或蒸汽遮住轮廓',progression:'一级低圆腹带盖锅，二级厚底、防烫握柄、蒸汽口与可视盖，三级加入低灶座和立盖收纳结构',palette:'珊瑚红、柔奶油和暖黄铜，冷金属与少量透明玻璃作功能层次',size:`含锅具约占画布${Math.round(occupancy[level-1]*100)}%，透明留白，无图内文字、数字或等级角标`}})),
  ...[1,2,3].map(level=>({id:`frying-station-l${level}`,code:`EQ18-L${level}`,name:'煎台',familyId:'frying-station',deviceKind:'appliance',outputChains:[],level,expectedOccupancy:occupancy[level-1],svg:fryingStation(level),reason:['宽浅深铸铁平煎面配奶油暖黄低底座，仅一枚小太阳蛋提示煎制用途。','沿工作面增加集油槽和简洁矮防溅板，保持平煎面空旷。','双工作区、独立收油抽屉与侧操作柄形成清楚升级，轮廓仍为宽浅煎台。'][level-1],design:{silhouette:['单块宽浅平煎面与稳固低底座','宽浅平煎面、前集油槽与矮防溅板','双独立平煎工作区、收油抽屉和侧操作柄'][level-1],angle:'三分之四俯视，大片浅煎面、薄边、低底座及功能分区清楚，左上光',material:'深铸铁、奶油暖黄搪瓷、淡冷金属与克制黄铜操作件，平面保留大块清爽空间',identity:'用于煎蛋、培根、肉丸与扇贝等煎炸料理，只放一枚小太阳蛋提示用途；没有炸篮、炭火或高身炉箱',progression:'一级单平面，二级集油槽与矮防溅板，三级双工作区、独立收油抽屉与操作柄，不靠放大换色升级',palette:'奶油暖黄与深铸铁形成清楚反差，少量金属边光和蛋黄金保持食欲',size:`含煎台约占画布${Math.round(occupancy[level-1]*100)}%，透明留白，无文字、数字或等级角标，食物不占满工作面`}})),
];

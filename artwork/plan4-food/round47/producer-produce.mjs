// Round 47: two producer families; their levels change structure, never just scale.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,c,w=1.5,o=1)=>p(d,'none',`stroke="${c}" stroke-width="${w}" opacity="${o}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0,dx=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 生产器新版候选</title><defs>${defs}</defs><g stroke="#49372c" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(${dx} ${dy})">${art}</g></svg>`;
const woodDefs=k=>grad(k+'-wood',['#f4d59b','#d9a66a','#b7804c'])+grad(k+'-side',['#d5a365','#b47d48','#916034'])+grad(k+'-mint',['#dcf1d6','#a7cfb1','#74a28c'])+grad(k+'-metal',['#f3ead2','#d0bd8c','#a58e5e']);
const foodDefs=k=>grad(k+'-tomato',['#ffb18b','#ee7b5b','#ca5343'])+grad(k+'-carrot',['#ffd180','#f5a652','#d98235'])+grad(k+'-green',['#b7dc8c','#7bb165','#4c8554'])+grad(k+'-apple',['#ffc098','#ee866b','#cc5d51'])+grad(k+'-orange',['#ffe28b','#f8bd55','#dd9439'])+grad(k+'-grape',['#d3aad6','#af79bd','#805790']);

function tomato(k,x,y){
  let a=p('M-18-14Q-8-23 0-16Q10-24 19-14Q30-3 22 12Q17 25 1 27Q-15 26-24 12Q-31-4-18-14Z',`url(#${k}-tomato)`);
  a+=p('M-11-16L-3-18L0-27L5-18L14-16L7-11L1-13L-5-9L-6-15Z',`url(#${k}-green)`,'stroke-width="1.7"');
  a+=line('M-18-5Q-22 3-17 10','#ffe3bc',2,.96)+line('M-9 18Q-2 22 6 18','#e06148',1.3,.8);
  return `<g transform="translate(${x} ${y})" stroke-width="2.2">${a}</g>`;
}
function carrot(k,x,y){
  let a=p('M-11-12Q0-21 12-11L5 21Q3 31-2 34Q-8 25-12-1Z',`url(#${k}-carrot)`);
  a+=p('M-2-15Q-13-24-8-34Q0-35 3-19Q4-34 12-32Q17-26 7-15Q18-24 22-16Q18-9 7-10Z',`url(#${k}-green)`,'stroke-width="1.8"');
  a+=line('M-7-3L0-1M3 7L8 8M-4 17L2 19','#b77a36',1.35,.9)+line('M-6-10L-7-5','#fff0b2',1.7,.96);
  return `<g transform="translate(${x} ${y}) rotate(-7)" stroke-width="2.2">${a}</g>`;
}
function broccoli(k,x,y){
  let a=p('M-8 2L8 2L13 24Q1 30-11 24Z',`url(#${k}-green)`,'stroke-width="2"');
  a+=line('M-1 20L-1 5M-1 13L-12 4M1 13L13 4','#416e43',1.65,.9);
  a+=p('M-21 3Q-29-4-23-13Q-21-20-12-19Q-8-29 1-23Q11-29 16-18Q27-19 29-9Q32 1 21 6Q17 15 7 10Q-2 18-10 10Q-18 14-21 3Z',`url(#${k}-green)`);
  a+=line('M-17-11Q-12-16-6-12M2-18Q9-21 12-14M12 3L18 1','#d3e9a7',1.6,.94);
  return `<g transform="translate(${x} ${y})" stroke-width="2.2">${a}</g>`;
}
function fruitSymbols(k,level){
  const dy=level===3?5:0;
  let a=`<g transform="translate(78 ${106+dy})" stroke-width="2.2">`;
  a+=p('M-20-12Q-14-23-3-16Q3-13 10-18Q22-22 27-7Q30 7 20 23Q13 31 4 27Q-3 31-13 24Q-26 11-24-2Z',`url(#${k}-apple)`);
  a+=line('M1-17Q-1-28 5-32','#805332',2.4);
  a+=p('M7-21Q12-33 23-28Q25-20 9-17Z',`url(#${k}-green)`,'stroke-width="1.65"');
  a+=line('M-15-8Q-21 0-16 10','#ffe6c6',1.9,.96)+'</g>';
  a+=e(132,107+dy,27,28,`url(#${k}-orange)`,'stroke-width="2.2"');
  a+=line(`M118 ${88+dy}Q110 ${94+dy} 112 ${103+dy}`,'#fff3c1',2,.96);
  a+=p(`M132 ${80+dy}Q134 ${71+dy} 139 ${69+dy}L141 ${72+dy}L137 ${81+dy}Z`,'#896137','stroke-width="1.5"');
  a+=p(`M137 ${78+dy}Q144 ${67+dy} 153 ${73+dy}Q153 ${82+dy} 137 ${82+dy}Z`,`url(#${k}-green)`,'stroke-width="1.6"');
  a+=`<g stroke-width="1.65">`;
  for(const [cx,cy,rx,ry] of [[176,106,9,10],[190,110,9,10],[168,119,9,10],[183,122,10,11],[196,125,8,9],[176,135,9,10],[188,139,8,9]])a+=e(cx,cy+dy,rx,ry,`url(#${k}-grape)`);
  a+=line(`M173 ${102+dy}L175 ${100+dy}M166 ${117+dy}L168 ${115+dy}M179 ${130+dy}L181 ${128+dy}M190 ${122+dy}L192 ${121+dy}`,'#e9c9e6',1.45,.95);
  a+=line(`M181 ${103+dy}Q182 ${94+dy} 191 ${94+dy}`,'#7b6041',2.1)+'</g>';
  return a;
}

function vegetableCart(level){
  const k='eq47-veg-'+level,y=level===1?125:135;
  let defs=woodDefs(k)+foodDefs(k),a='';
  if(level===3){
    const roof='M38 77Q52 43 88 36Q130 23 174 40Q204 49 216 79Z';
    defs+=`<clipPath id="${k}-roof"><path d="${roof}"/></clipPath>`;
    a+=p('M55 77L63 77L64 154L54 153Z',`url(#${k}-wood)`);
    a+=p('M191 79L201 79L201 159L191 159Z',`url(#${k}-side)`);
    a+=p(roof,`url(#${k}-mint)`);
    a+=`<g clip-path="url(#${k}-roof)" stroke="none">`+p('M65 25L91 25L84 83L59 83Z','#fff0c9')+p('M119 20L145 20L151 83L124 83Z','#fff5d9')+p('M173 24L195 30L211 86L185 83Z','#fff0cc')+'</g>';
    a+=p('M38 77L216 79L213 89Q204 96 194 88Q184 96 174 88Q164 96 153 88Q143 96 132 88Q122 96 111 88Q101 96 90 88Q80 96 69 88Q58 96 47 87L39 86Z','#8cb895');
    a+=line('M49 75Q128 72 204 78','#edf4d6',1.6,.95);
  }else if(level===2){
    a+=p('M54 87L63 87L64 150L54 150Z',`url(#${k}-wood)`);
    a+=p('M190 91L199 91L199 156L190 156Z',`url(#${k}-side)`);
  }
  // A visible rear shelf makes the second level structural, rather than merely bigger.
  if(level>=2){const sy=level===2?96:117;
    a+=p(`M53 ${sy}L74 ${sy-12}L199 ${sy-3}L179 ${sy+13}L54 ${sy+7}Z`,`url(#${k}-wood)`);
    a+=p(`M55 ${sy+1}L179 ${sy+7}L179 ${sy+16}L55 ${sy+9}Z`,'#e7bf86','stroke-width="2.2"');
    a+=line(`M66 ${sy+5}L168 ${sy+10}`,'#fff0bf',1.5,.95);
  }
  a+=p(`M36 ${y}L66 ${y-17}L218 ${y-5}L185 ${y+19}L40 ${y+10}Z`,`url(#${k}-wood)`);
  a+=p(`M48 ${y-1}L68 ${y-10}L202 ${y-2}L182 ${y+10}Z`,'#6d9276','stroke="#526d55" stroke-width="1.35"');
  if(level===1)a+=tomato(k,78,105)+carrot(k,125,96)+broccoli(k,172,107);
  if(level===2)a+=carrot(k,113,71)+broccoli(k,166,82)+tomato(k,82,123);
  if(level===3)a+=carrot(k,124,111)+broccoli(k,171,115)+tomato(k,81,126);
  // The same two-wheel chassis is recognizable at all levels.
  a+=p(`M204 ${y+27}L222 ${y+27}L222 ${y-3}Q222 ${y-13} 230 ${y-13}Q238 ${y-13} 238 ${y-5}L238 ${y+31}Q238 ${y+39} 228 ${y+39}L204 ${y+39}Z`,`url(#${k}-wood)`);
  a+=line(`M228 ${y-4}L228 ${y+27}`,'#fae1b0',1.5,.95);
  a+=p(`M44 ${y+12}L184 ${y+20}L182 ${y+65}L47 ${y+57}Z`,`url(#${k}-mint)`);
  a+=p(`M184 ${y+20}L215 ${y+1}L211 ${y+49}L182 ${y+65}Z`,'#81ac92');
  // An open tray lip in front seats the three ingredient emblems naturally.
  a+=p(`M39 ${y+4}L185 ${y+12}L185 ${y+22}L40 ${y+14}Z`,`url(#${k}-wood)`);
  a+=line(`M50 ${y+9}L172 ${y+16}`,'#fff0c1',1.6,.95);
  a+=p(`M51 ${y+25}L173 ${y+32}L172 ${y+54}L52 ${y+48}Z`,'#c8e1c7','stroke="#779b7e" stroke-width="1.35"');
  a+=line(`M58 ${y+29}L160 ${y+35}`,'#eaf4d9',1.6,.95);
  a+=e(60,y+39,2.1,2.1,'#d4bd83','stroke="#837047" stroke-width="1.1"');
  a+=e(163,y+44,2.1,2.1,'#d4bd83','stroke="#837047" stroke-width="1.1"');
  if(level>=2){
    a+=p(`M48 ${y+57}L182 ${y+65}L181 ${y+75}L49 ${y+68}Z`,'#647e63','stroke-width="2.2"');
    a+=p(`M55 ${y+61}L173 ${y+68}L173 ${y+71}L55 ${y+65}Z`,'#344e3e','stroke-width="1.2"');
    a+=line(`M55 ${y+68}L169 ${y+74}`,'#b5cfb2',1.45,.9);
  }
  a+=line(`M63 ${y+57}L65 ${y+74}M183 ${y+65}L184 ${y+78}`,'#65523c',5,.98);
  for(const [cx,cy] of [[67,y+81],[184,y+86]]){
    a+=e(cx,cy,14,14,'#6a604d');a+=e(cx,cy,9.5,9.5,'#d5e7d4','stroke-width="1.7"');a+=e(cx,cy,3.7,3.7,'#8fae99','stroke-width="1.25"');
    a+=line(`M${cx-7} ${cy-3}Q${cx-7} ${cy-8} ${cx-2} ${cy-9}`,'#fff8d8',1.5,.95);
  }
  return doc('蔬菜推车',defs,a,[-15,-10,-4][level-1],-9);
}

function fruitCrate(level){
  const k='eq47-fruit-'+level;const defs=woodDefs(k)+foodDefs(k);let a='';
  // Only the highest crate gains an arched transport frame: no wheels or fabric canopy.
  if(level===3){
    a+=p('M43 139L44 87Q117 27 207 87L219 145L206 147L196 96Q120 48 57 95L57 141Z',`url(#${k}-side)`);
    a+=line('M49 91Q117 40 201 92L210 137','#edc389',1.8,.95);
  }
  // Open, warm slatted wooden crate; the three fruit emblems remain the only produce.
  a+=p('M43 136L197 146L186 211L56 201Z',`url(#${k}-wood)`);
  a+=p('M197 146L221 123L211 191L186 211Z',`url(#${k}-side)`);
  a+=p('M37 127L66 108L223 121L197 148L40 138Z',`url(#${k}-wood)`);
  a+=p('M49 127L69 116L207 125L193 138Z','#a57a46','stroke="#805c35" stroke-width="1.35"');
  a+=fruitSymbols(k,level);
  a+=p('M39 132L198 142L197 152L41 143Z','#efc98f');
  a+=line('M50 137L184 146','#fff0c1',1.6,.96);
  a+=p('M46 155L194 165L192 171L48 162Z','#91633c','stroke="none"');
  a+=p('M51 180L190 189L188 195L53 187Z','#93643b','stroke="none"');
  a+=line('M55 150L61 195M172 158L166 203','#b27c46',5,.85);
  a+=line('M59 150L65 196M176 158L170 202','#f2cf96',2,.94);
  a+=line('M80 157Q94 153 107 159M84 177Q101 173 117 179M118 198Q130 194 144 199','#b98650',1.3,.85);
  a+=line('M203 150L198 193M217 136L210 174','#d3a571',1.4,.9);
  if(level>=2){
    // A real inset carry handle, protective corner hardware, and a separate lower drawer.
    a+=p('M83 151L132 154Q138 155 138 161Q138 168 131 167L84 164Q77 163 78 157Q78 152 83 151Z','#785537','stroke-width="1.65"');
    a+=line('M85 155L129 158','#efd49b',1.4,.9);
    a+=p('M52 202L187 211L185 227L54 218Z',`url(#${k}-side)`);
    a+=p('M60 205L178 214L177 220L61 213Z','#e4b57b','stroke="#a37344" stroke-width="1.35"');
    a+=p('M111 208Q115 215 123 210L123 216L111 215Z','#815a36','stroke-width="1.2"');
    a+=p('M43 143L58 144L61 161L48 161Z',`url(#${k}-metal)`,'stroke-width="1.8"');
    a+=p('M182 151L197 152L194 169L180 168Z',`url(#${k}-metal)`,'stroke-width="1.8"');
    a+=p('M54 193L66 194L68 214L55 212Z',`url(#${k}-metal)`,'stroke-width="1.8"');
    a+=p('M174 202L188 203L185 222L172 220Z',`url(#${k}-metal)`,'stroke-width="1.8"');
    for(const [x,y]of[[51,151],[189,160],[61,204],[179,212]])a+=e(x,y,1.8,1.8,'#8e7a53','stroke="none"');
  }
  if(level===3){
    a+=p('M44 123L57 124L57 145L44 144Z',`url(#${k}-side)`,'stroke-width="2.1"');
    a+=p('M204 133L217 136L219 149L205 147Z',`url(#${k}-side)`,'stroke-width="2.1"');
    a+=p('M112 173L129 174L128 193L111 192Z',`url(#${k}-metal)`,'stroke-width="1.9"');
    a+=p('M116 177L124 178L123 185L115 184Z','#8b7146','stroke-width="1.3"');
    a+=line('M116 189L122 189','#f7e4ae',1.4,.95);
  }
  return doc('鲜果木箱',defs,a,[-13,-21,-13][level-1],-1);
}

const occupancy=[.78,.82,.84];
export const producerProduceCandidates=[
  ...[1,2,3].map(level=>({id:`vegetable-cart-l${level}`,code:`EQ01-L${level}`,name:'蔬菜推车',level,familyId:'vegetable-cart',expectedOccupancy:occupancy[level-1],svg:vegetableCart(level),reason:['轻薄薄荷搪瓷与暖木沿形成清楚双轮小车，三种对应链蔬菜作为生产身份标志。','保持双轮小车家族轮廓，新增真实后部二层展示架及下收纳槽，靠结构辨别升级。','新增圆拱绿奶油条纹小遮棚，保留后部展示架和下收纳槽，三级不依靠放大或堆料。'][level-1],design:{silhouette:['双轮低搪瓷木沿小车、弯把手与开放浅托盘','双轮搪瓷小车、后部二层展示架及独立下收纳槽','圆拱绿奶油条纹小遮棚、支柱、二层展示架与双轮搪瓷小车'][level-1],angle:'轻俯视三分之四角度，车沿、右侧厚度、双轮与弯把手同时可见',material:'浅薄荷搪瓷、温暖木沿、圆润金属轮芯；左上光与克制釉光表现Q版体积',identity:'只展示番茄、胡萝卜、西兰花三种fresh-veg小标志，不改任何既定食物母稿，不混入其它产出链',structure:'同族保留双轮、搪瓷车斗和弯把手；等级以展示架、收纳槽及遮棚的真实结构变化区分',palette:'清新薄荷绿与奶油木色承托红番茄、橙胡萝卜和绿西兰花，不增加多余蔬菜或文字牌',size:`目标体量${Math.round(occupancy[level-1]*100)}%，透明留白与居中，无文字、数字或等级角标`}})),
  ...[1,2,3].map(level=>({id:`fruit-cart-l${level}`,code:`EQ02-L${level}`,name:'鲜果木箱',level,familyId:'fruit-cart',expectedOccupancy:occupancy[level-1],svg:fruitCrate(level),reason:['暖木条开放果箱保持无轮结构，苹果、甜橙与一小葡萄簇清楚提示鲜果链。','木箱增加真实提手、金属护角与独立下收纳抽槽，升级依靠可辨结构。','拱形搬运框和精致扣件强化高阶木箱身份，与带遮棚蔬菜推车明显区分。'][level-1],design:{silhouette:['无轮、无把架的暖木条开放果箱','无轮木条箱，提手、护角与独立下收纳结构','无轮暖木条箱，拱形搬运框、护角、下收纳与小扣件'][level-1],angle:'轻俯视三分之四角度，开放箱口、木条正面与右侧厚度可见',material:'暖色木条、自然少量木纹，升级后加入克制金属护角和扣件；左上光表现实体厚度',identity:'只展示苹果、甜橙和葡萄三个fresh-fruit标志，不画香蕉、芒果、椰子；不改既定水果母稿',structure:'木箱全级不加车轮，提手、护角、下收纳及搬运框逐级增加，不套用蔬菜车结构',palette:'蜂蜜暖木、奶油高光、珊瑚苹果、金橙甜橙和蓝紫葡萄，五金克制不抢主体',size:`目标体量${Math.round(occupancy[level-1]*100)}%，透明留白与视觉居中，无文字、数字或等级角标`}})),
];

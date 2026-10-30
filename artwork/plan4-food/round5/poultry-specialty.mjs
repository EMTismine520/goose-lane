// Round 5 alternatives. All four foods are independently drawn for this review.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, color, width = 1.5, opacity = 1) => p(d, 'none', `stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const linear = (id, colors, direction = 'x1=".1" y1=".05" x2=".82" y2="1"') => `<linearGradient id="${id}" ${direction}>${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const radial = (id, colors) => `<radialGradient id="${id}" cx=".3" cy=".25" r=".86">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</radialGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 禽肉分类重设计</title><defs>${defs}</defs><g stroke="#372820" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function turkeyLeg() {
  const flesh = 'M157 90C146 73 124 71 110 80C95 88 89 103 77 114C56 131 43 154 49 179C54 206 76 224 102 225C131 227 158 213 168 191C178 172 172 151 170 133C169 114 167 103 157 90Z';
  const defs = radial('tl-skin',['#fff0d1','#f3d0a6','#e1b08a','#be8869']) + linear('tl-bone',['#fff8e4','#efdbb5','#ccaf8b']) + `<clipPath id="tl-clip">${p(flesh,'white')}</clipPath>`;
  let art = p('M141 106L167 65L174 41C168 34 172 23 180 23C184 18 194 19 197 26C206 24 213 32 209 40C206 47 199 48 193 45L181 75L164 120Z','url(#tl-bone)');
  art += line('M181 34Q186 39 193 37M177 59L163 86','#c9ad8b',1.5,.8);
  art += p(flesh,'url(#tl-skin)');
  art += `<g clip-path="url(#tl-clip)" stroke="none">` + p('M146 72C162 114 166 152 148 179C132 203 103 219 79 220C112 240 160 224 179 187L183 106Z','#a87862','opacity=".16"') + p('M62 150C71 121 102 103 126 104C140 105 152 113 155 127C128 119 108 133 94 150C80 165 69 166 62 165Z','#fff2d6','opacity=".45"') + '</g>';
  art += line('M85 125Q102 105 123 109','#fff8e7',4.3,.84);
  art += line('M64 177Q80 194 101 192M104 148C119 150 130 163 133 180M138 111Q149 118 152 133','#b78369',1.5,.72);
  art += line('M70 179Q85 188 96 186M109 156Q122 164 125 175','#ffe4c1',1.9,.78);
  art += line('M123 91Q133 86 144 94','#ffe9cb',2.4,.65);
  for (const [x,y] of [[90,133],[111,122],[137,139],[76,164],[112,181],[145,168]]) art += e(x,y,1.2,.8,'#bd8b6c','stroke="none" opacity=".35"');
  return doc('火鸡腿',defs,art);
}

function duckBlood() {
  const defs = linear('db5-top',['#9b4c58','#813b4a','#652c3d']) + linear('db5-front',['#6e2e41','#532538','#3b1d2c']) + linear('db5-side',['#643047','#462035','#341a2a']);
  let art = p('M115 62L185 49L221 75L151 92Z','url(#db5-top)');
  art += p('M151 92L221 75L218 129L150 146Z','url(#db5-side)');
  art += p('M115 62L151 92L150 146L115 119Z','url(#db5-front)');
  art += line('M126 67L183 57L207 74','#c7777b',2.4,.7) + line('M164 102L205 92','#9c5365',1.45,.55);
  art += p('M37 112L104 93L146 120L77 142Z','url(#db5-top)');
  art += p('M77 142L146 120L145 178L77 201Z','url(#db5-front)');
  art += p('M37 112L77 142L77 201L37 173Z','url(#db5-side)');
  art += line('M48 115L103 102L131 120','#ca7a80',2.45,.72) + line('M86 154L130 140','#a65b6c',1.45,.57);
  art += p('M113 159L176 141L215 165L151 186Z','url(#db5-top)');
  art += p('M151 186L215 165L213 213L149 232Z','url(#db5-front)');
  art += p('M113 159L151 186L149 232L111 205Z','url(#db5-side)');
  art += line('M124 162L175 150L199 166','#c4757b',2.45,.72) + line('M160 196L198 183','#a15566',1.4,.58);
  return doc('鸭血',defs,art);
}

function pigeonSkewers() {
  const defs = linear('ps-bamboo',['#efcf96','#d5ab6e','#b18450']) + radial('ps-meat',['#f5b4aa','#dc8b87','#b96369']) + linear('ps-side',['#c87574','#ae555f','#87414f']);
  const chunks = [
    {x:83,y:73,d:'M-20-15C-9-23 9-22 20-13L25 5C21 21 5 24-12 20L-24 7Z'},
    {x:84,y:124,d:'M-25-12C-20-24-1-26 15-18L25-4L21 14C9 25-8 25-22 16L-29 1Z'},
    {x:83,y:175,d:'M-20-18C-9-24 11-19 19-8L23 10C14 22-5 27-20 15L-25-1Z'},
    {x:156,y:59,d:'M-21-12C-11-24 9-22 21-10L22 9C14 22-2 24-19 14L-26-1Z'},
    {x:158,y:111,d:'M-23-17C-6-24 13-21 23-6L24 9C9 24-10 25-24 13L-28-3Z'},
    {x:157,y:162,d:'M-19-20C-3-26 16-18 23-5L19 15C3 26-15 21-24 7L-25-7Z'},
  ];
  let art = '<g transform="rotate(-12 128 128)">';
  art += p('M80 33L85 25L88 216L82 231L80 216Z','url(#ps-bamboo)','stroke="#7c5d3d" stroke-width="2.2"');
  art += p('M153 22L158 15L162 204L157 222L155 205Z','url(#ps-bamboo)','stroke="#7c5d3d" stroke-width="2.2"');
  for(const [i,c] of chunks.entries()) {
    art += `<g transform="translate(${c.x} ${c.y}) rotate(${i%2?9:-7})">`;
    art += p(c.d,'url(#ps-side)','transform="translate(1 4)" stroke-width="2.9"');
    art += p(c.d,'url(#ps-meat)','stroke-width="3.1"');
    art += line('M-13-10Q-1-17 10-8','#ffd4bd',2.6,.77);
    art += line('M-14 6Q-1 11 11 7M-2-1L6 3','#ae5e68',1.3,.72);
    art += '</g>';
  }
  art += '</g>';
  return doc('鸽肉串',defs,art);
}

function braisedGoose() {
  const defs = radial('bg5-skin',['#cc8f48','#ad642f','#804324','#5f3022']) + linear('bg5-meat',['#b87967','#99554e','#713b3e']) + linear('bg5-fat',['#efd7af','#d4b28b','#b98c68']) + linear('bg5-side',['#a16745','#7e442f','#542d26']);
  // A roast section sits behind three curved slices; skin is a thin curved cap, not a flat bread layer.
  let art = p('M111 55C142 42 183 58 199 86C211 109 204 135 182 145L140 146L99 110Z','url(#bg5-side)');
  art += p('M111 55C142 42 183 58 199 86C203 94 205 102 204 108C172 104 136 90 108 87L99 78Z','url(#bg5-skin)');
  art += line('M121 58Q151 51 173 67','#e9b775',2.8,.75) + line('M187 81L196 94','#d39a58',1.6,.7);
  art += p('M105 85C133 82 171 99 198 110C200 124 189 136 174 141C149 143 117 130 102 112Z','url(#bg5-meat)','stroke-width="2.8"');
  art += p('M106 84C139 85 171 99 198 109L195 115C167 106 137 92 106 92Z','url(#bg5-fat)','stroke="#8f5a3d" stroke-width="1.35"');
  art += line('M119 103Q140 112 157 124M169 125L181 128','#dda28b',1.5,.68);
  const slices = [
    {x:124,y:137,a:-24,scale:1},
    {x:99,y:166,a:-6,scale:1.02},
    {x:135,y:199,a:18,scale:.97},
  ];
  const cut = 'M-51-13C-36-29-6-31 20-20C40-14 53-2 54 11C50 28 26 33 3 28C-18 26-42 18-53 4Z';
  for(const [i,s] of slices.entries()) {
    art += `<g transform="translate(${s.x} ${s.y}) rotate(${s.a}) scale(${s.scale})">`;
    art += p(cut,'url(#bg5-side)','transform="translate(0 5)" stroke-width="2.8"');
    art += p(cut,'url(#bg5-meat)','stroke-width="3.1"');
    art += p('M-51-13C-36-29-6-31 20-20C35-15 48-5 52 5C20-10-14-22-46-5Z','url(#bg5-skin)','stroke-width="2.3"');
    art += p('M-46-5C-14-22 20-10 52 5L50 10C22-3-12-16-43 0Z','url(#bg5-fat)','stroke="#986444" stroke-width="1.25"');
    art += line('M-33 7C-18 3-5 14 10 15M18 17L31 19','#d59a86',1.45,.76);
    art += line('M-11 1Q-5 6-7 12M9 8Q18 10 18 17','#69383c',1.3,.7);
    art += line('M-32-16Q-18-21-4-16','#e0a762',2.1,.72);
    art += '</g>';
  }
  return doc('卤鹅肉',defs,art);
}

export const poultrySpecialtyCandidates = [
  {id:'fresh-poultry-5',name:'火鸡腿',svg:turkeyLeg(),design:{silhouette:'竖斜放置的饱满火鸡腿，肉体由下方宽圆大腿向上方细骨自然收束',angle:'三分之四略俯视，唯一腿类以骨端朝右上形成独立方向',material:'浅金奶油禽皮、克制皮褶与柔和肉体反光，自然淡骨质',identity:'本链仅此一个带骨腿节点；长骨和厚大腿体体现火鸡腿，不再另设鸭腿重复',container:'无盛器、无动物头脸、无新增配菜'},reason:'以火鸡腿作为唯一腿类，换成骨朝上、肉体向下的全新构图，避免鸡腿与鸭腿仅换物种的重复。'},
  {id:'fresh-poultry-6',name:'鸭血',svg:duckBlood(),design:{silhouette:'三块错落紧凑的厚切凝块，平直切边与斜面层次形成清楚几何形',angle:'略俯视，顶面、正面和侧面分色呈现',material:'深紫红光滑凝块、湿润而克制的窄反光，边缘完整，无血水',identity:'平整深色凝块区别于肌肉、蛋与串制肉，增加血制品类别',container:'无盘子、无汤汁、无装饰'},reason:'用深紫红鸭血凝块替代重复肉部位，平整轮廓与湿润质感在小图中形成独立类别。'},
  {id:'fresh-poultry-7',name:'鸽肉串',svg:pigeonSkewers(),design:{silhouette:'两根错落竹签穿起不规则禽肉块，竹签两端可见，整体紧凑偏竖斜',angle:'略俯视，肉块轻微错角，肉厚可见',material:'粉红鸽肉与深玫瑰切边、短肌理线，浅竹签，保持待烤生料状态',identity:'串制结构和自然肉块轮廓与鸭血方块、火鸡腿形成明确差异',container:'仅使用料理竹签，无盘子或配菜'},reason:'引入鸽肉串与竹签结构，以不规则粉红肉块区分深紫红凝块；后续适合蜜汁烤制。'},
  {id:'fresh-poultry-8',name:'卤鹅肉',svg:braisedGoose(),design:{silhouette:'后方卤鹅肉段与前方三片错角弧形切片组成紧凑扇面',angle:'三分之四略俯视，切片正面呈现熟肉和贴边卤皮',material:'深卤棕弧形皮、窄浅脂线、红褐熟肉及少量肌理，避免浅色面包状分层',identity:'熟料卤切片区别于本链生鲜禽肉、凝块和肉串，保留可直接凉拌的料理含义',container:'无盘子、肉片自然堆放，无额外配料'},reason:'重新设计卤鹅肉的弧形切面与贴边卤皮，以红褐熟肉为主体，摆脱上轮平直夹层像面包的构图。'},
];

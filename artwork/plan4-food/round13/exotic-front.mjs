// Round 13 review alternatives: independently drawn fruit; no runtime mapping changes.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.4,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors,radial=false)=>radial
 ? `<radialGradient id="${id}" cx=".28" cy=".2" r=".9">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</radialGradient>`
 : `<linearGradient id="${id}" x1=".1" y1=".05" x2=".86" y2="1">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,prefix,defs,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 鲜果独立新稿</title><defs>${defs}</defs><g stroke="#44362f" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`.replace(/id="/g,`id="${prefix}-`).replace(/url\(#/g,`url(#${prefix}-`);

function blueberries(){
  const defs=grad('berry',['#a4b4d7','#7c8fbc','#5b6698'],true)+grad('front',['#a1b2d8','#7788b9','#53608d'],true);
  const crown=(x,y,scale,rotation)=>`<g transform="translate(${x} ${y}) rotate(${rotation}) scale(${scale})">${p('M-13-2-6-5-4-12 2-7 10-9 9-1 15 4 6 7 2 13-4 7-12 7-9 1Z','#626b98','stroke="#4d547c" stroke-width="1.4"')}${p('M-5 0 0-4 5 0 2 5-3 4Z','#49547e','stroke="none"')}${line('M-7-5-4-8M7 5 3 9','#b4bfdc',1.5,.7)}</g>`;
  let art=e(112,89,37,36,'url(#berry)')+line('M91 71Q101 61 113 63','#d8def1',3.5,.66)+crown(112,82,.74,-16);
  art+=e(174,119,35,36,'url(#berry)')+line('M155 101Q161 94 172 94','#d1dcf1',3.2,.68)+crown(176,111,.72,20);
  art+=e(79,140,35,36,'url(#berry)')+line('M59 125Q65 116 75 115','#d4dff3',3.3,.68)+crown(73,134,.77,-28);
  art+=e(132,166,40,38,'url(#front)')+line('M106 151Q114 139 128 139','#d9e1f3',3.7,.72)+crown(134,158,.88,8);
  art+=line('M145 191Q154 187 160 179','#414f7d',1.4,.36);
  return doc('蓝莓','r13-blueberry',defs,art);
}

function bananas(){
  const defs=grad('back',['#fff0a5','#f3cf5f','#e3ae38'])+grad('front',['#fff2a8','#f5d269','#e8b641'])+grad('stalk',['#bca072','#a38656','#846546']);
  const back='M61 65C54 94 58 128 71 157C83 187 104 207 129 212C155 219 179 208 194 188C208 170 215 148 215 129C203 151 185 170 165 177C143 186 123 176 109 160C88 136 79 98 80 68Z';
  const front='M77 66C75 91 84 116 99 134C114 154 132 165 153 162C174 160 192 144 203 123L210 107C211 133 199 156 181 172C160 191 135 197 113 187C88 177 72 154 65 127C59 107 61 84 64 67Z';
  let art=p(back,'url(#back)');
  art+=line('M72 83C69 120 81 156 103 180C125 202 152 203 174 186','#f9df86',2.9,.8);
  art+=p('M210 132 215 129C216 139 214 146 212 151L204 147Z','#75583e','stroke-width="1.7"');
  art+=p(front,'url(#front)');
  art+=line('M74 84C72 109 83 137 103 157C123 179 150 185 173 170','#c69837',1.5,.72);
  art+=line('M84 91C88 115 100 135 117 145','#fff6c2',3.9,.85);
  art+=line('M125 165Q151 177 174 162','#fff0a1',2.2,.7);
  art+=p('M202 121 210 107 210 122 205 132 200 129Z','#76563a','stroke-width="1.6"');
  art+=p('M61 69 58 52 74 46 81 64 77 74 65 75Z','url(#stalk)');
  art+=p('M58 52 73 47 76 54 61 59Z','#d3b485','stroke-width="1.6"');
  art+=line('M67 62 71 70','#f2d592',1.5,.8);
  return doc('香蕉','r13-banana',defs,art);
}

function lemon(){
  const whole='M-73-4C-69-7-67-15-64-24C-52-48-20-56 14-52C46-49 63-31 67-8L76 1 68 12C61 39 37 53 8 54C-25 56-53 46-64 24C-68 18-68 12-74 9C-82 5-81 0-73-4Z';
  const defs=grad('skin',['#fff1a0','#f9d85d','#e8b33b'],true)+grad('rind',['#fff0a0','#f8cf53','#deb039'])+grad('pulp',['#fff3b4','#f9de7e','#f2c658']);
  let art='<g transform="translate(118 118) rotate(-21)">'+p(whole,'url(#skin)')+line('M-52-24C-39-40-17-44 3-42','#fff8c9',4.4,.84)+line('M33 37Q47 30 54 16','#d2a132',1.5,.52)+p('M-67-1-73 2-68 7','#ebc04a','stroke="none"')+'</g>';
  art+=p('M149 178C153 161 165 151 181 151C196 153 207 165 211 181L209 188C191 196 164 192 149 184Z','url(#rind)');
  art+=p('M149 178C154 160 167 151 181 152C196 154 207 166 211 181C192 189 167 187 149 178Z','#fff3bd','stroke-width="1.5" stroke="#bc973b"');
  art+=p('M155 176C159 165 168 158 177 158L177 180Z','url(#pulp)','stroke="none"');
  art+=p('M180 158C188 159 194 163 198 169L181 181Z','url(#pulp)','stroke="none"');
  art+=p('M200 172 205 179C198 182 191 183 184 182Z','url(#pulp)','stroke="none"');
  art+=line('M179 158 179 181 157 176M179 181 197 168','#fff9db',1.5,.96);
  art+=line('M158 172Q160 166 164 164','#fffbe2',1.4,.8);
  return doc('柠檬','r13-lemon',defs,art);
}

function mango(){
  const whole='M128 46C153 47 173 66 178 91C185 119 177 149 160 174C142 202 110 214 84 202C62 192 53 174 57 153C60 133 69 121 74 102C82 73 100 44 128 46Z';
  const defs=grad('skin',['#ffe29a','#f6c45b','#e4a039'],true)+grad('blush',['#f6a276','#e98763','#d56c56'],true)+grad('cube',['#ffed9a','#ffd965','#f1b940'])+grad('side',['#f9c851','#e9a831']);
  let art=p(whole,'url(#skin)');
  art+=p('M145 52C169 60 180 84 179 108C176 130 164 139 157 127C150 117 155 104 151 88C148 73 139 66 136 57C134 53 138 50 145 52Z','url(#blush)','stroke="none" opacity=".62"');
  art+=line('M93 83C102 65 116 57 129 59','#fff0b7',4.1,.82)+line('M69 167C72 181 84 190 96 191','#ffe5a1',2.8,.7);
  art+=line('M124 47 127 42','#806247',2.3,.9);
  // Six broad cubes remain attached to a small mango cheek, with one quiet skin edge.
  art+=p('M130 179C138 166 160 152 180 153C198 154 212 168 217 185C213 199 196 208 178 209C159 210 143 203 132 193Z','#edb247');
  art+=p('M134 184C152 196 187 205 213 187L211 195C192 210 157 211 136 197Z','#df9d33','stroke="none"');
  const cubes=[
    ['M139 164 155 159 166 169 149 175Z','M149 175 166 169 166 181 150 187Z'],
    ['M159 157 175 154 185 164 169 169Z','M169 169 185 164 187 177 170 181Z'],
    ['M180 154 195 160 203 171 188 166Z','M188 166 203 171 205 182 190 179Z'],
    ['M148 181 165 176 176 187 159 193Z','M159 193 176 187 177 199 160 204Z'],
    ['M170 176 187 173 196 185 179 190Z','M179 190 196 185 197 197 181 202Z'],
    ['M192 174 207 179 213 189 200 192Z','M200 192 213 189 211 199 201 203Z'],
  ];
  for(const [top,side] of cubes){art+=p(side,'url(#side)','stroke="#b8822f" stroke-width="1.45"')+p(top,'url(#cube)','stroke="#b8822f" stroke-width="1.5"');}
  return doc('芒果','r13-mango',defs,art);
}

export const exoticFrontCandidates=[
  {id:'fresh-exotic-1',name:'蓝莓',svg:blueberries(),expectedOccupancy:.66,design:{silhouette:'四颗大小略异的饱满蓝莓紧凑相叠，呈低矮团簇而非长串葡萄',angle:'略俯视的近景，四处小冠痕随球面转向',material:'带果粉的柔和蓝紫果皮，宽软受光与极少亮边',identity:'四颗完整蓝莓与小型凹冠脐，避免葡萄串和装饰叶片',container:'裸果透明背景，无容器'},reason:'用四颗带果粉的饱满蓝莓重画紧凑果簇，小冠脐在96px仍可辨，一级食材保留约66%的适度体量。'},
  {id:'fresh-exotic-2',name:'香蕉',svg:bananas(),expectedOccupancy:.72,design:{silhouette:'两根丰润弯香蕉从短果柄自然散开，下垂轮廓错开',angle:'三分之二侧面，两根香蕉的弯曲方向与尾端高度不同',material:'奶黄至熟黄果皮与克制柔光，短褐果柄和深褐尾尖',identity:'自然渐细的果身、共有短果柄和两个清楚尾端',container:'整把裸果透明背景，无盛器'},reason:'以两根自然下垂、端点错开的熟香蕉取代僵硬等距圆弧，靠厚薄变化、黄皮和褐尖表现鲜果，二级约72%体量。'},
  {id:'fresh-exotic-3',name:'柠檬',svg:lemon(),expectedOccupancy:.68,design:{silhouette:'一枚斜放的长椭圆整柠檬，前方搭一小瓣扇形切角',angle:'整果侧面带少量俯视，切角朝前露出果肉',material:'明亮暖黄的细滑果皮、浅奶白内皮与清透淡黄果肉',identity:'两端略尖的椭圆整果与三块宽果肉扇区',container:'裸食材透明背景，无叶饰、盛器'},reason:'重画两头略尖的柠檬整果，搭配小切角和宽大清楚的果肉扇区，不以密线制造质感，三级约68%体量。'},
  {id:'fresh-exotic-4',name:'芒果',svg:mango(),expectedOccupancy:.68,design:{silhouette:'斜长且一侧饱满的金黄芒果，前方搭一小片六格翻花果颊',angle:'整果三分之二侧面，六块宽大果肉朝上',material:'金黄细滑果皮带一抹暖珊瑚红晕，鲜亮奶金色果肉',identity:'偏长芒果轮廓、弯腰肩部和两排三块翻花果颊，避免圆橙形',container:'整果与果颊裸放，透明背景，无碗'},reason:'用不对称长芒果形与局部暖红晕建立辨识，辅以小型六格翻花果颊表现可口果肉，四级约68%体量。'},
];

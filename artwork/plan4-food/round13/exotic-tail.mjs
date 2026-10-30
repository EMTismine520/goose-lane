// Review candidates only; existing selected sources and runtime art are untouched.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const l=(d,color,width=1.45,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const g=(id,colors,coords='x1=".1" y1="0" x2=".88" y2="1"')=>`<linearGradient id="${id}" ${coords}>${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 鲜果独立新稿</title><defs>${defs}</defs><g stroke="#49362f" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function peach(){
  const body='M126 84C111 68 89 66 73 79C52 93 46 116 51 140C57 169 80 194 106 208C120 216 130 218 143 212C177 197 205 168 210 139C215 111 205 87 187 77C168 65 146 70 126 84Z';
  const defs=g('ext13-peach-skin',['#fff0cc','#f6d5c0','#e8abae','#cb8295'])+g('ext13-peach-blush',['#f4d9c3','#efb5b8','#d889a0'])+g('ext13-peach-leaf',['#b6cf83','#86ad63','#5c8c4d'])+`<clipPath id="ext13-peach-clip">${p(body,'#fff')}</clipPath>`;
  let a=p(body,'url(#ext13-peach-skin)');
  a+='<g clip-path="url(#ext13-peach-clip)" stroke="none">';
  a+=p('M126 84C149 69 178 69 195 87C217 110 214 140 198 166C181 191 158 208 139 215C127 193 119 166 120 140C121 118 123 98 126 84Z','url(#ext13-peach-blush)');
  a+=p('M61 134C63 168 87 192 113 207C126 215 132 218 143 212C124 205 108 189 94 171C78 152 70 129 69 110Z','#d88f9e','opacity=".13"');
  a+=p('M72 100C65 109 62 123 64 132C65 138 70 138 72 132C73 119 78 111 82 105C88 97 78 92 72 100Z','#fff7df','opacity=".74"');
  a+='</g>';
  a+=l('M126 84C119 105 117 130 121 155C124 173 129 188 134 199','#bc7b8b',1.55,.78);
  a+=l('M131 87Q139 82 146 81','#f9dfcf',1.4,.8);
  a+=p('M128 83C125 74 124 67 128 60C130 57 134 58 133 61C130 67 131 74 133 79Z','#9c7651','stroke-width="1.5"');
  a+=p('M132 75C135 57 150 45 170 47C169 63 154 79 132 75Z','url(#ext13-peach-leaf)');
  a+=l('M137 71Q149 59 162 53','#618d4f',1.35,.8);
  return doc('水蜜桃',defs,a);
}

function coconut(){
  const whole='M79 43C112 37 142 56 155 88C169 122 166 163 145 189C126 213 94 221 67 208C39 195 25 167 27 133C28 92 46 52 79 43Z';
  const defs=g('ext13-coconut-shell',['#b58c62','#94704d','#745236'])+g('ext13-coconut-cut-shell',['#b48b5d','#906240','#6d472e'])+g('ext13-coconut-flesh',['#fff7dc','#f6ebc9','#e8d8ad'])+g('ext13-coconut-center',['#fffbed','#fff8e3','#f3e8ca']);
  let a=p(whole,'url(#ext13-coconut-shell)');
  a+=l('M73 55C48 85 42 119 47 153C50 173 58 190 70 199','#d0ac7c',1.6,.64);
  a+=l('M100 50C82 83 76 120 81 155C84 178 90 197 99 207','#6e4d34',1.6,.5);
  a+=l('M120 61C111 87 109 110 112 130M130 72Q146 105 144 132','#c5a074',1.5,.62);
  a+=l('M36 122 35 135M53 77 49 88M63 182 69 192M106 63 101 75M144 110 145 120','#745337',1.25,.48);
  a+='<g transform="rotate(-23 166 158)">';
  a+=p('M106 151C108 123 131 106 162 106C196 106 222 124 225 150C228 170 218 193 200 205C182 217 157 218 137 208C119 199 107 178 106 151Z','url(#ext13-coconut-cut-shell)');
  a+=e(166,150,60,45,'url(#ext13-coconut-flesh)');
  a+=e(166,150,45.5,33.5,'url(#ext13-coconut-center)','stroke="#c7b58a" stroke-width="1.5"');
  a+=l('M117 151C118 132 136 116 158 115','#fffbed',1.65,.86);
  a+=l('M126 188 131 195M143 203 147 207M196 195 199 191','#c4a075',1.4,.67);
  a+='</g>';
  return doc('椰子',defs,a);
}

function pear(){
  const body='M118 62C104 64 105 83 100 102C95 122 77 139 67 159C49 194 70 220 105 226C140 233 180 224 194 200C208 176 189 152 173 134C157 116 151 101 147 82C145 68 132 59 118 62Z';
  const defs=g('ext13-pear-skin',['#e1dd8e','#e3ce74','#e1b95b','#cf9b43'])+g('ext13-pear-leaf',['#bdd18a','#8bad64','#658e4b'])+`<clipPath id="ext13-pear-clip">${p(body,'#fff')}</clipPath>`;
  let a=p(body,'url(#ext13-pear-skin)');
  a+='<g clip-path="url(#ext13-pear-clip)" stroke="none">';
  a+=p('M144 72C136 107 147 139 166 162C183 183 177 212 160 223C185 214 205 199 199 174C195 150 170 131 159 110Z','#b58e3c','opacity=".14"');
  a+=p('M92 141C82 154 77 169 80 182C82 188 88 188 89 181C88 168 94 157 100 147C103 140 97 136 92 141Z','#fff2be','opacity=".8"');
  a+=p('M114 82C111 98 109 108 105 118C104 122 108 124 111 119C117 108 119 94 119 84C119 79 115 78 114 82Z','#f6efb4','opacity=".65"');
  a+='</g>';
  a+=l('M118 222Q125 217 132 222','#a2813d',1.5,.67);
  a+=p('M123 65C119 50 121 34 132 23C135 20 140 22 137 26C130 36 128 49 130 62Z','#9b7550','stroke-width="1.6"');
  a+=p('M130 54C140 39 156 39 170 48C165 61 147 68 130 54Z','url(#ext13-pear-leaf)');
  a+=l('M136 53Q151 48 164 49','#61864b',1.35,.8);
  return doc('梨',defs,`<g transform="translate(3.2 3.2) scale(.975)">${a}</g>`);
}

function mulberry(){
  const defs=g('ext13-mulberry-body',['#95669c','#71437f','#533060','#392345'])+g('ext13-mulberry-drupe',['#a174aa','#7f4f8f','#5f376e'])+g('ext13-mulberry-front',['#93649e','#6f447f','#482b59'])+g('ext13-mulberry-stem',['#b1bd70','#7e9953','#607c42']);
  const outline='M-4-67C3-72 12-70 15-63C24-64 30-57 28-49C37-44 39-36 34-29C42-22 42-14 37-8C44 1 42 9 36 15C41 23 37 33 31 37C34 47 27 55 20 56C18 65 11 71 4 69C-3 75-12 70-14 63C-23 63-29 57-27 49C-37 45-40 36-34 29C-41 23-41 13-36 7C-42-1-40-10-34-16C-39-25-35-34-29-37C-32-47-26-55-19-56C-18-65-12-70-4-67Z';
  function berry(front=false){
    let a=p(outline,`url(#${front?'ext13-mulberry-front':'ext13-mulberry-body'})`);
    const rows=[[-57,[-6,10]],[-41,[-15,2,19]],[-24,[-22,-5,13,27]],[-7,[-24,-7,11,27]],[10,[-24,-7,11,26]],[27,[-20,-3,15]],[44,[-13,4,19]],[60,[-4,11]]];
    for(const[y,xs]of rows){for(const[xi,x]of xs.entries()){const rx=8.7+(xi%2)*.35; a+=e(x,y,rx,9.3,`url(#${front?'ext13-mulberry-front':'ext13-mulberry-drupe'})`,'stroke="#573b63" stroke-width="1.25"');}}
    a+=l('M-11-56Q-8-60-4-59M-22-22Q-19-26-16-24M-23 12Q-20 8-17 10M-11 44Q-8 40-5 42','#d1b0cc',1.45,.66);
    return a;
  }
  let a=p('M61 78C57 60 51 48 41 40C38 37 39 34 43 36C56 44 64 59 68 76Z','url(#ext13-mulberry-stem)','stroke-width="1.6"');
  a+='<g transform="translate(82 138) rotate(-16) scale(.84 .98)">'+berry()+'</g>';
  a+=p('M177 90C176 72 181 54 192 42C195 39 199 41 196 45C188 59 185 74 185 92Z','url(#ext13-mulberry-stem)','stroke-width="1.6"');
  a+='<g transform="translate(156 153) rotate(21)">'+berry(true)+'</g>';
  return doc('桑葚',defs,`<g transform="translate(-6.4 -6.4) scale(1.05)" stroke-width="3">${a}</g>`);
}

export const exoticTailCandidates=[
  {id:'fresh-exotic-5',name:'水蜜桃',svg:peach(),expectedOccupancy:.68,design:{silhouette:'一枚紧凑的左右微不对称圆桃，顶部自然凹口，底部柔圆收尖',angle:'单果正面略侧，右瓣稍饱满，桃缝沿中部自然下弯',material:'奶油粉底色、柔和蜜桃粉晕染与一处浅奶色亮面',identity:'圆润双瓣、细桃缝和一片小绿叶，区别长形芒果与细颈梨',container:'透明底单果，无盘无装饰'},reason:'以全新轮廓和轻柔粉奶配色提供水蜜桃候选，保持五级小体量；保留已选原版不变，由用户决定是否换用。'},
  {id:'fresh-exotic-6',name:'椰子',svg:coconut(),expectedOccupancy:.80,design:{silhouette:'后方一枚略倾斜的棕色整椰，前方一枚斜切半椰，果肉切面清楚',angle:'三分之四视角，整果偏左后，半果向右前露出厚奶白果肉',material:'温棕纤维壳、少量顺果身弯曲的浅沟与厚奶白果肉',identity:'棕色椰壳加白肉半果，表皮使用纵向纤维沟而非木头年轮',container:'两枚椰子部分自然重叠，透明底无盛器'},reason:'独立重画整果和剖半结构，以粗壳与厚白肉辨识椰子；纤维纹理稀疏，避免木纹与写实噪点。'},
  {id:'fresh-exotic-7',name:'梨',svg:pear(),expectedOccupancy:.80,design:{silhouette:'一枚上部细长、下腹丰润的熟梨，短果柄与单片小叶',angle:'近正面微侧，细颈略向左偏，圆腹在下方展开',material:'黄金绿梨皮、温暖金黄底部与一处柔亮奶色反光',identity:'细颈、饱满下腹和短柄构成清楚梨形，区别圆桃和宽长芒果',container:'单枚完整裸梨，透明底无盘'},reason:'以独立细颈鼓腹轮廓重画成熟金绿梨，让40px小图仍能凭轮廓认出梨，不依赖切片或额外配件。'},
  {id:'fresh-exotic-8',name:'桑葚',svg:mulberry(),expectedOccupancy:.80,design:{silhouette:'两枚长条深紫桑葚错落相叠，窄果身由紧密小核果组成',angle:'后果略向左斜、前果略向右斜，短细果柄集中在顶部',material:'柔和深紫渐变，紧密小圆核果仅用细线和少量高光分隔',identity:'狭长聚合果和细小紧密核果明确区别大颗葡萄串，整体不成宽葡萄束',container:'两枚裸果透明底，无叶簇、盘或其他装饰'},reason:'彻底重画原来近似葡萄串的桑葚，以两枚长条聚合果和密集小核果建立桑葚身份，保持小图轮廓清楚。'},
];

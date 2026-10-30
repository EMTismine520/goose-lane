// Round 39: two new oven-dish identities, with recipe-specific ingredients only.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.5,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".82" y2="1">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 烤箱新菜候选</title><defs>${defs}</defs><g transform="translate(0 ${dy})" stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function baconGreenBeans(){
  const defs=grad('r39-bean-plate',['#fbfaf0','#e1e8d5','#b4c5ac'])
    +grad('r39-bean-green',['#a3cb69','#76aa45','#4e8539'])
    +grad('r39-bean-green-dark',['#8bb857','#659b3f','#477c35'])
    +grad('r39-bean-bacon',['#e49b79','#cb7959','#a9573f'])
    +grad('r39-bean-fat',['#ffe5c5','#f3cba1','#dfa978']);
  let art=e(128,161,100,32,'url(#r39-bean-plate)');
  art+=e(128,157,87,23,'#fffff0','stroke="#b0c29e" stroke-width="1.4"');
  art+=line('M45 169Q80 189 121 188M140 188Q183 185 211 167','#fdfff3',1.85,.98);

  // Rear bundle: exactly three short, smooth green-bean sections, with staggered ends.
  let rear=p('M-14-19Q-1-26 14-20L20 12Q16 25 1 26L-14 18Z','#b7674a','stroke="#7d4636" stroke-width="2.5"');
  rear+=p('M-39-17Q-45-15-44-10Q-44-5-38-5L31-6Q39-6 39-12Q39-18 32-18Z','url(#r39-bean-green)','stroke="#49663b" stroke-width="2.2"');
  rear+=p('M-43-4Q-48-1-45 4Q-44 8-38 8L36 7Q43 6 43 1Q42-5 36-5Z','url(#r39-bean-green-dark)','stroke="#49663b" stroke-width="2.2"');
  rear+=p('M-36 9Q-41 10-40 16Q-39 21-33 20L30 18Q37 17 36 12Q35 8 30 8Z','url(#r39-bean-green)','stroke="#49663b" stroke-width="2.2"');
  rear+=line('M-35-13L-20-13M20-13L31-13M-37 0L-23 0M23 0L35 0M-30 14L-18 14M20 13L29 13','#d4e6a0',1.4,.98);
  rear+=e(-40.5,-11,3.2,4.2,'#abc97a','stroke="#5c7f42" stroke-width="1.2"');
  rear+=e(-42,1.5,3.4,4.1,'#a6c774','stroke="#5c7f42" stroke-width="1.2"');
  rear+=e(-35.5,15,3.1,3.8,'#b0cf80','stroke="#5c7f42" stroke-width="1.2"');
  // One supple cooked bacon ribbon wraps around the middle, not a second food layer.
  rear+=p('M-13-21Q0-25 12-20Q13-8 18 2Q23 13 14 23Q1 29-12 21L-17 9Q-13-5-13-21Z','url(#r39-bean-bacon)','stroke="#7c4435" stroke-width="2.7"');
  rear+=p('M-7-21Q-3-23 1-21Q-2-9 4 3Q9 14 4 24L-2 24Q3 13-3 3Q-10-9-7-21Z','url(#r39-bean-fat)','stroke="none"');
  rear+=line('M8-16Q7-5 12 4Q16 14 11 20','#f5c9a1',1.45,.96);
  rear+=line('M-11 12L-8 17M10-19L11-14M13 7L15 11','#964b35',1.4,.92);
  rear+=line('M-6-19L-3-20M-2 9L0 15','#ffe8c9',1.55,.98);
  art+=`<g transform="translate(91 129) rotate(-25)">${rear}</g>`;

  // Front bundle is drawn separately: shorter, broader beans, and a different bacon fold.
  let front=p('M-13-20Q-1-25 14-17L19 11Q17 25 0 27L-14 18Z','#ad6045','stroke="#7d4636" stroke-width="2.5"');
  front+=p('M-36-18Q-42-17-41-11Q-40-6-34-6L33-7Q40-7 39-12Q39-18 32-19Z','url(#r39-bean-green-dark)','stroke="#49663b" stroke-width="2.2"');
  front+=p('M-40-3Q-45 0-42 5Q-40 9-34 9L36 7Q43 6 42 0Q41-5 35-5Z','url(#r39-bean-green)','stroke="#49663b" stroke-width="2.2"');
  front+=p('M-32 10Q-38 12-36 17Q-35 22-28 21L29 19Q35 17 34 12Q34 9 28 9Z','url(#r39-bean-green-dark)','stroke="#49663b" stroke-width="2.2"');
  front+=line('M-31-13L-18-13M20-13L31-14M-33 2L-19 2M22 1L33 0M-26 15L-17 15M20 14L27 14','#cde59a',1.4,.98);
  front+=e(35,-12.5,3.1,4,'#aacb77','stroke="#5c7f42" stroke-width="1.2"');
  front+=e(37.5,1.2,3.3,4.1,'#b4d482','stroke="#5c7f42" stroke-width="1.2"');
  front+=e(30,14.5,2.8,3.5,'#a6c774','stroke="#5c7f42" stroke-width="1.2"');
  front+=p('M-11-20Q2-24 13-16Q13-5 18 4Q23 16 10 24Q0 29-13 20L-16 10Q-13-5-11-20Z','url(#r39-bean-bacon)','stroke="#7c4435" stroke-width="2.7"');
  front+=p('M-5-20Q0-21 3-18Q0-6 6 4Q12 15 5 25L-1 25Q6 14-1 4Q-7-7-5-20Z','url(#r39-bean-fat)','stroke="none"');
  front+=line('M9-14Q8-4 13 5Q17 14 11 20','#f6cda4',1.45,.98);
  front+=line('M-11 13L-8 18M9-18L11-14M13 8L15 12','#914a35',1.4,.92);
  front+=line('M-5-17L-2-18M1 8L3 13','#ffe8c9',1.55,.98);
  art+=`<g transform="translate(160 144) rotate(14)">${front}</g>`;
  return doc('培根四季豆卷',defs,art,-10);
}

function tomatoCheesePizza(){
  const defs=grad('r39-pizza-plate',['#fffaf0','#e8e1ca','#bfc2aa'])
    +grad('r39-pizza-edge',['#e9ad60','#cf8d42','#b27434'])
    +grad('r39-pizza-crust',['#ffdc94','#efba6c','#d79549'])
    +grad('r39-pizza-cheese',['#fff3c6','#f9df91','#ebc566'])
    +grad('r39-pizza-tomato',['#ff9d77','#ed6f51','#cc4e37']);
  let art=e(128,163,100,32,'url(#r39-pizza-plate)');
  art+=e(128,159,87,23,'#fffff2','stroke="#b8c0a0" stroke-width="1.4"');
  art+=line('M45 171Q80 191 122 190M141 190Q184 187 211 168','#fffef4',1.85,.98);
  // One small round pizza: a thin front edge, not a tall bread or pie wall.
  art+=p('M48 124Q51 143 76 153Q101 166 129 166Q162 165 188 152Q207 141 208 123L200 116L57 115Z','url(#r39-pizza-edge)');
  art+=p('M49 122Q50 103 74 94Q99 82 128 84Q158 82 183 94Q206 104 207 122Q207 141 181 151Q155 161 127 159Q98 161 74 150Q48 141 49 122Z','url(#r39-pizza-crust)');
  art+=p('M59 122Q60 108 82 101Q104 91 128 93Q154 91 177 102Q197 110 197 123Q195 136 175 143Q153 152 127 150Q102 153 82 143Q60 136 59 122Z','url(#r39-pizza-cheese)','stroke="#cd9b4d" stroke-width="1.4"');
  // Connected white-gold melted cheese has loose patches and a few warm oven freckles.
  art+=p('M67 120Q74 108 88 110Q96 99 112 105Q125 96 137 104Q151 98 164 108Q181 106 190 119Q177 115 168 122Q154 116 141 124Q124 115 113 125Q99 118 87 128Q75 122 67 128Z','#fff4cd','stroke="none"');
  art+=p('M74 133Q87 126 100 133Q113 126 124 135Q139 126 152 135Q166 127 180 133Q166 145 148 145Q130 151 111 145Q88 146 74 136Z','#ffe9ad','stroke="none"');
  art+=e(100,116,6,2.4,'#dfac5c','stroke="none" opacity=".68"');
  art+=e(156,134,5.3,2.2,'#dca355','stroke="none" opacity=".65"');
  art+=p('M137 111Q143 106 147 111Q146 115 140 115Z','#e2ad5d','stroke="none" opacity=".7"');
  // Five small tomato pieces vary in cut, size, and angle; no basil, olives, or meat.
  art+=p('M80 111Q85 103 94 108L99 116Q92 123 83 118Z','url(#r39-pizza-tomato)','stroke="#a44c37" stroke-width="1.8"');
  art+=p('M84 112Q88 108 92 112L95 115Q89 119 85 116Z','#ffca95','stroke="#df8151" stroke-width="1.2"');
  art+=line('M87 112L90 115','#fff0ad',1.2,.98);
  art+=p('M124 101L134 99L142 106L136 113L125 110Z','url(#r39-pizza-tomato)','stroke="#a44c37" stroke-width="1.8"');
  art+=line('M127 103L131 102M134 107L137 107','#ffd5a6',1.3,.98);
  art+=p('M163 113Q169 106 177 113L181 122Q173 128 165 122Z','url(#r39-pizza-tomato)','stroke="#a44c37" stroke-width="1.8"');
  art+=p('M167 114Q171 110 175 115L177 120Q171 122 168 119Z','#ffca94','stroke="#df8151" stroke-width="1.2"');
  art+=line('M170 115L173 118','#fff0ad',1.2,.98);
  art+=p('M96 132L106 126L115 132L110 140L100 140Z','url(#r39-pizza-tomato)','stroke="#a44c37" stroke-width="1.8"');
  art+=line('M101 132L106 130M106 136L110 134','#ffd2a2',1.3,.98);
  art+=p('M147 140Q152 134 158 138L164 145Q158 151 150 147Z','url(#r39-pizza-tomato)','stroke="#a44c37" stroke-width="1.75"');
  art+=line('M151 140L157 143','#ffd3a1',1.3,.98);
  // One lightly cut front-right sector remains part of the round pizza; its base is thin.
  art+=line('M128 125L159 153M128 125L192 135','#ae7e42',1.55,.94);
  art+=line('M131 126L160 150M135 125L188 133','#fff6d1',1.35,.98);
  art+=p('M160 154L166 153L169 157L164 160Z','#ffedbe','stroke="#be8c47" stroke-width="1.3"');
  art+=line('M64 111Q72 102 84 99M105 90L116 89M160 95L169 98M62 137L70 141M95 155L105 157','#fff1bd',1.65,.98);
  art+=line('M78 155L84 158M122 163L131 163M180 154L187 149','#b97b35',1.3,.86);
  return doc('番茄芝士披萨',defs,art,-9);
}

export const ovenNewDishCandidates=[
  {id:'dish-fresh-ico-0158',name:'培根四季豆卷',svg:baconGreenBeans(),expectedOccupancy:.82,
    reason:'两束各三根的短粗熟四季豆略错向摆放，绿色豆段端头略错开，一圈红棕培根与奶白熟脂纹清楚包裹豆束；自然油光与熟透暖色保持食欲。',
    design:{silhouette:'两束短粗豆卷，每束三根光滑四季豆，一束斜向后、一束略向前，不堆多束',angle:'三分之四俯视，可见绿色豆段、圆润切端和培根绕束的柔软厚度',material:'鲜活熟绿四季豆、红棕熟培根、奶白脂纹和克制油亮高光',identity:'仅培根和四季豆；不画面包、生菜、芦笋、蘑菇或额外酱汁',container:'浅青白陶盘，成品含盘82%，主体紧凑，透明留白'}},
  {id:'dish-fresh-ico-0162',name:'番茄芝士披萨',svg:tomatoCheesePizza(),expectedOccupancy:.82,
    reason:'一张小圆薄底披萨，烤金外圈托起金白融芝士与少量鲜红番茄点块、小瓣；前右一角轻切露薄饼边，保持完整圆饼的大形，不拆成两块厚三角派。',
    design:{silhouette:'一张小圆薄披萨，仅前右一角轻切，宽圆轮廓和薄底边清楚',angle:'三分之四俯视，融芝士、番茄切块和薄烤饼边均可见',material:'烤金薄饼、金白融芝士、少量焦糖金烤斑和鲜红番茄',identity:'仅软面团、番茄和芝士片；不添加罗勒、肉、橄榄或其它配料',container:'浅米白小圆盘，成品含盘82%，不同于热狗和汉堡的大形，透明留白'}}
];

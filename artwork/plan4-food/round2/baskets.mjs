// Round 2 basket studies: food first, light woven support, approved fine contour weight.
const ink = '#2b211c';
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const ellipse = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const defs = `<defs>
<linearGradient id="basket" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#f8dfaf"/><stop offset=".5" stop-color="#e4bd83"/><stop offset="1" stop-color="#c7975f"/></linearGradient>
<linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffe9bf"/><stop offset="1" stop-color="#d6ab72"/></linearGradient>
<linearGradient id="cavity" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a78051"/><stop offset="1" stop-color="#d9b680"/></linearGradient>
<linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b6d67a"/><stop offset=".48" stop-color="#7dab55"/><stop offset="1" stop-color="#4c783f"/></linearGradient>
<linearGradient id="carrot" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#ffcd83"/><stop offset=".4" stop-color="#f5a05a"/><stop offset="1" stop-color="#d77440"/></linearGradient>
<radialGradient id="tomato" cx=".32" cy=".2" r=".9"><stop stop-color="#ffad7b"/><stop offset=".5" stop-color="#ef7652"/><stop offset="1" stop-color="#c84d3d"/></radialGradient>
<linearGradient id="broccoli" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#a6c97b"/><stop offset=".45" stop-color="#75a55c"/><stop offset="1" stop-color="#4e7e46"/></linearGradient>
<linearGradient id="broccoliStem" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#b7cd8a"/><stop offset="1" stop-color="#6e9955"/></linearGradient>
<radialGradient id="orange" cx=".28" cy=".25" r=".9"><stop stop-color="#ffe5a3"/><stop offset=".5" stop-color="#f7bd63"/><stop offset="1" stop-color="#dd9348"/></radialGradient>
<radialGradient id="apple" cx=".25" cy=".2" r=".88"><stop stop-color="#ffb681"/><stop offset=".45" stop-color="#ef805e"/><stop offset="1" stop-color="#cc5848"/></radialGradient>
<radialGradient id="grape" cx=".3" cy=".25" r=".85"><stop stop-color="#d9b5d9"/><stop offset=".5" stop-color="#b488bb"/><stop offset="1" stop-color="#835f92"/></radialGradient>
</defs>`;
const backBasket = `${ellipse(128,222,80,8,'#67492d','opacity=".10" stroke="none"')}
${path('M33 159Q127 129 223 159L212 186Q126 212 44 185Z','url(#basket)')}
${ellipse(128,160,94,25,'url(#cavity)','stroke-width="2"')}`;
const frontBasket = `${path('M34 165Q127 195 222 165L207 211Q129 239 49 211Z','url(#basket)')}
${path('M47 182Q128 207 211 182M53 199Q128 222 205 200','none','stroke="#b58b57" stroke-width="1.5"')}
${path('M74 181 81 218M109 188 111 224M147 188 146 224M182 181 176 219','none','stroke="#b68b57" stroke-width="1.5"')}
${path('M31 157Q127 188 225 157L222 170Q128 201 34 170Z','url(#rim)','stroke-width="2.6"')}
${path('M43 166Q127 190 212 167','none','stroke="#fff2d0" stroke-width="1.8" opacity=".8"')}`;
const carrotLeaves = `<g>
${path('M71 88Q47 70 48 45Q70 42 81 78Z','url(#leaf)')}
${path('M76 85Q63 54 76 30Q94 43 86 80Z','url(#leaf)')}
${path('M84 84Q84 54 108 47Q114 70 91 89Z','url(#leaf)')}
${path('M72 74 58 52M80 72 79 42M89 76 102 55','none','stroke="#577c42" stroke-width="1.5"')}
</g>`;
const carrot = `<g transform="rotate(-12 78 122)">
${carrotLeaves}
${path('M58 86Q74 72 93 84Q111 100 98 135L76 177Q58 157 51 125Q43 99 58 86Z','url(#carrot)')}
${path('M61 94Q54 105 58 119','none','stroke="#ffe3b1" stroke-width="3"')}
${path('M80 93 91 96M61 119 73 123M76 137 87 140M65 149 72 152','none','stroke="#bd7844" stroke-width="1.6"')}
</g>`;
const broccoli = `<g>
${path('M157 103 183 102 196 174Q169 189 145 173Z','url(#broccoliStem)')}
${path('M167 160 156 115M175 150 194 116','none','stroke="#5f8749" stroke-width="2"')}
${path('M147 122Q128 122 131 105Q118 92 132 79Q132 61 150 63Q161 42 177 59Q196 50 203 69Q225 69 222 90Q236 105 218 117Q211 134 190 124Q171 139 156 124Q150 127 147 122Z','url(#broccoli)')}
${path('M134 88Q141 74 155 80M157 66Q168 62 177 72M188 73Q202 70 208 84M200 108Q210 111 215 104M153 108Q164 100 176 108','none','stroke="#477644" stroke-width="1.65" opacity=".7"')}
${path('M138 87Q144 80 151 82M162 64Q168 62 173 67M188 79Q196 76 201 82','none','stroke="#c3d996" stroke-width="2.3"')}
</g>`;
const tomato = `<g>
${path('M125 121Q102 105 87 125Q71 151 94 172Q117 190 142 174Q162 157 153 135Q147 116 125 121Z','url(#tomato)')}
${path('M125 127 109 114 120 115 125 104 130 116 144 111 135 128 127 121Z','url(#leaf)','stroke-width="2"')}
${path('M91 138Q87 147 91 154','none','stroke="#ffd8a9" stroke-width="3.1"')}
${ellipse(99,132,5,2,'#ffe1b4','stroke="none" transform="rotate(-25 99 132)"')}
${path('M125 174Q139 170 145 159','none','stroke="#b84b3c" stroke-width="1.5"')}
</g>`;
const vegetableBody = `${backBasket}${carrot}${broccoli}${tomato}${frontBasket}`;
const handle = `${path('M68 143Q53 48 119 35Q179 25 196 138L185 142Q170 47 121 48Q68 59 80 143Z','url(#basket)','stroke-width="2.7"')}
${path('M72 98Q72 63 94 49','none','stroke="#fff0c9" stroke-width="2"')}`;
const orange = `<g>
${path('M60 93Q80 82 100 99Q117 118 106 145Q97 169 71 169Q44 166 38 143Q29 111 60 93Z','url(#orange)')}
${path('M73 95Q72 83 79 77','none','stroke="#705139" stroke-width="2.5"')}
${path('M80 88Q83 69 105 74Q102 94 82 95Z','url(#leaf)','stroke-width="2.5"')}
${path('M85 89 99 79','none','stroke="#66884b" stroke-width="1.3"')}
${path('M46 120Q47 108 56 103','none','stroke="#fff0be" stroke-width="2.5"')}
${[[53,140],[63,150],[88,145],[96,126],[58,117],[80,158],[86,113]].map(([x,y])=>ellipse(x,y,1.1,1.4,'#bd873f','stroke="none" opacity=".5"')).join('')}
</g>`;
const apple = `<g>
${path('M162 89Q180 71 198 87Q221 108 209 139Q198 168 181 166Q170 171 161 164Q142 168 129 146Q112 117 131 96Q145 80 162 89Z','url(#apple)')}
${path('M163 91Q158 75 168 62','none','stroke="#705139" stroke-width="3"')}
${path('M169 77Q174 56 195 63Q194 80 173 84Z','url(#leaf)','stroke-width="2.7"')}
${path('M175 77 188 67','none','stroke="#64874b" stroke-width="1.4"')}
${path('M134 108Q127 121 133 134','none','stroke="#ffe0b4" stroke-width="3"')}
${ellipse(141,100,4,2,'#ffdcb0','stroke="none" transform="rotate(-32 141 100)"')}
${path('M174 155Q181 157 187 153','none','stroke="#b44c40" stroke-width="1.6"')}
</g>`;
const grapes = `<g>
${path('M121 121Q125 106 139 104','none','stroke="#6c7842" stroke-width="2.5"')}
${path('M122 119Q103 101 95 115Q102 129 121 126Z','url(#leaf)','stroke-width="2.5"')}
${[[109,135,14,15],[135,132,15,16],[151,147,14,15],[95,153,13,15],[121,151,15,16],[140,167,14,15],[109,174,13,15],[123,188,12,14]].map(([x,y,rx,ry])=>`${ellipse(x,y,rx,ry,'url(#grape)','stroke-width="2.3"')}${path(`M${x-6} ${y-6}q3-4 7-3`,'none','stroke="#ebd1e7" stroke-width="1.6" opacity=".7"')}`).join('')}
</g>`;
const fruitBody = `${handle}${backBasket}${orange}${apple}${grapes}${frontBasket}`;
const wrap = (title, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${title} · 食材为主的Q版精修</title>${defs}<g stroke="${ink}" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;

export const basketCandidates = [
  {
    id: 'fresh-veg-7', name: '田园菜篮', svg: wrap('田园菜篮', vegetableBody),
    design: {
      silhouette: '浅竹篮托住大号胡萝卜、番茄和西兰花，三种自然形体组成高低错落的轮廓',
      angle: '沿用略俯视的正面菜篮，篮口呈浅椭圆，食材各自完整露出主要结构',
      material: '胡萝卜细横纹、番茄短亮光、西兰花哑光团簇、浅色竹篾分别处理；上方受光而下方轻压暗',
      identity: '长条橙色胡萝卜、圆润红番茄和深浅绿色花球形成三块明确识别色',
      container: '篮身缩浅并使用细编织线，前沿只遮挡食材底端，保留田园菜篮身份但不抢食物'
    },
    reason: '原版篮中食材偏小、篮沿占重心；扩大三种主要食材、整理遮挡，40px仍能读出菜篮内容'
  },
  {
    id: 'fresh-fruit-7', name: '缤纷果篮', svg: wrap('缤纷果篮', fruitBody),
    design: {
      silhouette: '保留拱形提手竹篮，橙子、红苹果和前置葡萄形成清楚的大中小体块',
      angle: '略俯视正面果篮，拱形提手后置，果实大形高于篮沿',
      material: '橙皮低光与稀疏果点、苹果柔和亮弧、葡萄果粉般的浅紫过渡，与浅竹篾区分',
      identity: '左橙右苹果、前方紫葡萄，三块颜色和叶片轮廓在小图中独立可读',
      container: '浅色扁篮以细纹承托，提手与编织弱于食物，轻投影稳定重心'
    },
    reason: '原版果实在篮内拥挤且体积偏小；放大主水果、分开三种色块并把提手和竹篮退到承托层'
  }
];

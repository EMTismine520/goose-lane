// Round 41: a green stir-fry and a crisp glutinous-rice snack with distinct materials.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 炒锅成品新版</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function garlicGreenBeans(){
  const defs=grad('r41-d96-plate',['#fbfff3','#e3eee0','#a9c5b2'])
    +grad('r41-d96-green',['#a9cf68','#78ad42','#4e8534'])
    +grad('r41-d96-green-deep',['#98c25c','#6ca03a','#467b30'])
    +grad('r41-d96-garlic',['#fff9de','#eee1b6','#d4bd86']);
  let art=e(128,164,101,31,'url(#r41-d96-plate)');
  art+=e(128,159,88,23,'#fffdf0','stroke="#afc4a8" stroke-width="1.45"');
  art+=line('M44 171Q76 190 117 189M143 189Q188 184 212 169','#fcfff5',1.8);
  art+=e(128,151,67,16,'#567c32','stroke="none" opacity=".12"');

  // Six hand-drawn pods have different curves, lengths, seed bulges and cut ends.
  let pod=p('M-36 1Q-34-6-26-5Q-18-7-12-5Q-4-8 3-5Q12-7 20-3Q28-2 32 2Q35 7 30 11Q19 12 12 8Q5 9-2 6Q-10 8-18 5Q-28 6-34 6Z','url(#r41-d96-green-deep)');
  pod+=line('M-28 0Q-17-2-8 0Q1-2 9 1Q18 1 26 5','#bad980',1.45);
  pod+=line('M-24 5Q-11 4-4 5M8 6L18 7','#4f7d31',1.3,.87);
  pod+=e(-34,2.5,2.8,4,'#a6c477','stroke="#5e7f3d" stroke-width="1.3"');
  art+=`<g transform="translate(103 118) rotate(-22)">${pod}</g>`;

  pod=p('M-31-7Q-20-10-12-6Q-4-8 4-4Q13-4 19 1Q26 2 31 7Q33 12 28 14Q18 12 12 8Q3 9-3 4Q-10 6-17 2Q-27 1-33-2Z','url(#r41-d96-green)');
  pod+=line('M-26-5Q-17-6-10-3Q0-3 6 1Q17 1 25 8','#d0e59a',1.5);
  pod+=line('M-19 0L-12 2M-1 3L6 5M16 8L24 10','#548638',1.3,.86);
  pod+=e(29,9.5,2.7,3.7,'#b3cf80','stroke="#60833d" stroke-width="1.3"');
  art+=`<g transform="translate(156 126) rotate(30)">${pod}</g>`;

  pod=p('M-39-2Q-35-9-25-8Q-17-11-9-7Q0-9 8-6Q17-6 24-2Q34-1 37 5Q38 9 32 12Q21 10 13 6Q5 8-2 4Q-12 6-19 2Q-31 3-38 2Z','url(#r41-d96-green)');
  pod+=line('M-30-4Q-18-6-9-3Q1-4 9-1Q21-1 30 5','#c9e18a',1.5);
  pod+=line('M-23 1L-14 1M0 4L8 4M19 6L27 8','#528132',1.3,.9);
  pod+=e(-37,0,2.5,3.9,'#b3ce83','stroke="#60833d" stroke-width="1.3"');
  art+=`<g transform="translate(94 140) rotate(7)">${pod}</g>`;

  pod=p('M-34 3Q-28-4-19-5Q-10-10-2-8Q6-12 15-9Q24-10 31-6Q36-4 33 2Q24 6 16 4Q7 8 0 5Q-9 9-17 7Q-27 11-34 8Z','url(#r41-d96-green-deep)');
  pod+=line('M-26 3Q-18-1-9-1Q1-5 9-3Q19-6 28-3','#bfdc82',1.5);
  pod+=line('M-23 7L-15 5M-5 5L2 3M15 3L23 1','#4c7d2f',1.3,.9);
  pod+=e(32,-2,2.9,4.3,'#a2c36e','stroke="#5b7d37" stroke-width="1.3"');
  art+=`<g transform="translate(142 143) rotate(-21)">${pod}</g>`;

  pod=p('M-33 1Q-27-8-17-8Q-7-10 1-6Q10-7 18-2Q26-1 31 5Q33 10 27 13Q18 13 11 9Q1 10-5 6Q-14 8-21 4Q-29 6-33 1Z','url(#r41-d96-green-deep)');
  pod+=line('M-25-1Q-16-5-7-2Q2-3 10 1Q19 2 25 7','#c3df88',1.5);
  pod+=line('M-19 4L-11 4M1 6L9 6M18 9L24 10','#4e7d30',1.3,.87);
  pod+=e(-31,0,2.7,4,'#b2cd7e','stroke="#63853b" stroke-width="1.3"');
  art+=`<g transform="translate(108 161) rotate(-11)">${pod}</g>`;

  pod=p('M-31-3Q-28-9-18-7Q-9-11 0-7Q9-9 17-4Q26-4 32 2Q35 7 29 11Q20 11 12 7Q3 9-4 5Q-14 7-21 3Q-30 4-31-3Z','url(#r41-d96-green)');
  pod+=line('M-24-3Q-14-5-6-2Q3-4 11-1Q21-1 28 5','#cce394',1.5);
  pod+=line('M-18 3L-10 3M1 5L8 5M18 7L25 8','#518333',1.3,.89);
  pod+=e(31,4.5,2.5,3.8,'#b9d388','stroke="#66883e" stroke-width="1.3"');
  art+=`<g transform="translate(163 157) rotate(12)">${pod}</g>`;

  // Three ivory garlic slices sit in the gaps; nothing red or leafy is added.
  art+=p('M127 112Q130 104 137 108Q144 113 141 120Q137 126 130 121Z','url(#r41-d96-garlic)','stroke="#88754a" stroke-width="1.7"');
  art+=line('M132 110Q136 111 138 116','#fffceb',1.4);
  art+=p('M71 145Q66 139 70 133Q75 130 80 135L83 143Q79 151 73 149Z','url(#r41-d96-garlic)','stroke="#88754a" stroke-width="1.7"');
  art+=line('M72 135Q76 136 78 142','#fffceb',1.4);
  art+=p('M126 169Q129 160 136 162Q145 166 141 172Q135 179 128 175Z','url(#r41-d96-garlic)','stroke="#88754a" stroke-width="1.7"');
  art+=line('M130 166Q135 164 138 168','#fffceb',1.4);
  return doc('清炒四季豆',defs,art);
}

function friedGlutinousDumplings(){
  const defs=grad('r41-d97-plate',['#fffdf0','#e6eee2','#abc6b8'])
    +grad('r41-d97-crust',['#ffdc84','#edaf4e','#cf8738'])
    +grad('r41-d97-edge',['#eec076','#d69b45','#b77831'])
    +grad('r41-d97-rice',['#fff5d4','#eeddb6','#d1be91'])
    +grad('r41-d97-meat',['#d7a77d','#bc855b','#95613f'])
    +grad('r41-d97-mushroom',['#a68263','#826248','#674c38']);
  let art=e(128,167,101,31,'url(#r41-d97-plate)');
  art+=e(128,162,88,23,'#fffdf0','stroke="#aec6b5" stroke-width="1.45"');
  art+=line('M44 174Q76 193 117 192M143 191Q188 187 212 171','#fcfff5',1.8);
  art+=e(128,157,69,17,'#926233','stroke="none" opacity=".13"');

  // Two uncut pieces have a taut fried shell and softly curved, pointed ends.
  let whole=p('M-42 6Q-32-10-18-18Q-7-25 6-21Q22-20 34-5L42 8Q31 25 12 29Q-9 32-26 23Q-36 18-42 6Z','url(#r41-d97-crust)');
  whole+=p('M-42 6Q-30 21-9 23Q14 27 34 12L42 8Q31 25 12 29Q-9 32-26 23Q-36 18-42 6Z','url(#r41-d97-edge)','stroke="none"');
  whole+=p('M-29 1Q-18-13-5-15Q12-17 23-5Q8-10-4-6Q-16-8-29 1Z','#ffe6a2','stroke="none" opacity=".83"');
  whole+=line('M-31 3Q-23-9-12-11M-5-14L3-14M16 23L24 20','#fff0b8',1.65,.95);
  whole+=p('M-21 8Q-18 5-16 8L-17 12L-20 12Z','#c58a3b','stroke="none" opacity=".8"');
  whole+=e(-7,4,2.4,1.7,'#f8d080','stroke="#d39a48" stroke-width="1.1"');
  whole+=e(11,10,2,1.5,'#f9d78d','stroke="#d49d4b" stroke-width="1.1"');
  whole+=e(20,-1,1.6,1.2,'#c68a3d','stroke="none"');
  whole+=e(-10,18,1.5,1.2,'#c38b40','stroke="none"');
  art+=`<g transform="translate(87 121) rotate(-18) scale(.94)">${whole}</g>`;

  let second=p('M-40 4Q-31-13-16-20Q-3-25 11-19Q28-16 40 3Q44 8 40 12Q27 29 6 29Q-15 28-31 17Z','url(#r41-d97-crust)');
  second+=p('M-40 4Q-26 20-6 22Q18 28 40 9L40 12Q27 29 6 29Q-15 28-31 17Z','url(#r41-d97-edge)','stroke="none"');
  second+=p('M-28 0Q-15-16 0-15Q14-13 24-4Q10-8 1-5Q-13-9-28 0Z','#ffe9a8','stroke="none" opacity=".82"');
  second+=line('M-29 1Q-20-10-10-12M1-15L8-13M11 23L19 22','#fff0b8',1.65);
  second+=e(-18,7,2.4,1.7,'#f6cf7e','stroke="#d39a48" stroke-width="1.1"');
  second+=e(1,2,2.1,1.5,'#f8d88e','stroke="#d49d4b" stroke-width="1.1"');
  second+=p('M19 9L22 7L24 9L22 12L20 11Z','#c48a3b','stroke="none" opacity=".85"');
  second+=e(-7,16,1.4,1.1,'#bf8437','stroke="none"');
  art+=`<g transform="translate(165 117) rotate(16) scale(.97)">${second}</g>`;

  // The front piece is lightly cut: thin fried crust outside, thick glutinous skin inside.
  art+=p('M69 158Q79 140 95 135Q110 131 125 140L148 150L155 166L145 182Q127 189 108 185Q84 183 69 162Z','url(#r41-d97-crust)');
  art+=p('M69 158Q85 176 110 178Q131 181 151 168L145 182Q127 189 108 185Q84 183 69 162Z','url(#r41-d97-edge)','stroke="none"');
  art+=p('M81 152Q92 140 105 140Q119 139 132 149Q118 145 107 148Q94 144 81 152Z','#ffe6a0','stroke="none"');
  art+=line('M82 153Q90 145 100 144M110 142L117 144M94 177L104 180','#fff0b8',1.65);
  art+=e(88,162,2.6,1.8,'#f7d17f','stroke="#d39b49" stroke-width="1.1"');
  art+=e(107,156,2.2,1.7,'#f8d68b','stroke="#d49d4b" stroke-width="1.1"');
  art+=p('M118 165L121 162L124 164L123 167L120 168Z','#c18737','stroke="none" opacity=".84"');
  art+=e(108,175,1.5,1.1,'#bd8036','stroke="none"');
  art+=p('M148 147Q162 149 168 162Q171 177 156 185Q143 183 136 171Q133 158 148 147Z','url(#r41-d97-edge)','stroke="#77522d" stroke-width="2.5"');
  art+=p('M148 151Q160 153 164 164Q165 175 155 181Q144 179 140 169Q138 160 148 151Z','url(#r41-d97-rice)','stroke="#c69f60" stroke-width="1.4"');
  art+=p('M149 157Q157 157 160 165Q161 173 154 176Q146 175 144 168Q143 162 149 157Z','#ae8057','stroke="#8e653f" stroke-width="1.3"');
  art+=p('M147 161Q150 157 154 160L157 165L153 168L147 166Z','url(#r41-d97-meat)','stroke="#95633f" stroke-width="1.2"');
  art+=p('M146 168L151 166L154 171L151 175Q146 174 145 171Z','url(#r41-d97-meat)','stroke="#95633f" stroke-width="1.2"');
  art+=p('M154 157Q159 158 160 163L156 165L153 162Z','url(#r41-d97-mushroom)','stroke="#73523a" stroke-width="1.15"');
  art+=p('M155 169Q159 166 160 170L157 174L154 173Z','url(#r41-d97-mushroom)','stroke="#73523a" stroke-width="1.15"');
  art+=line('M147 156Q144 158 143 164M142 168Q145 177 152 178','#fff8e0',1.5);
  art+=line('M148 162L151 161M147 170L150 171','#edc39b',1.2);
  return doc('咸水角',defs,art);
}

export const wokTailCandidates=[
  {id:'dish-fresh-ico-0128',code:'DS96',name:'清炒四季豆',expectedOccupancy:.82,svg:garlicGreenBeans(),
    reason:'六段短粗豆荚长短、弧度和切端各异，小堆错向摆放；饱满豆籽起伏、嫩绿切面与克制油光让熟绿鲜活，三片象牙蒜片落在留白中。',
    design:{silhouette:'仅六段不等长的微弯四季豆，错向小堆、端头交错可辨，不堆满盘',angle:'三分之四俯视，轻鼓的豆荚、自然弧线和几处浅绿切面清楚',material:'鲜活嫩熟绿至深熟绿渐层，细豆荚纵缝、轻油亮高光与象牙蒜片',identity:'仅四季豆与大蒜；没有辣椒、香葱、胡萝卜或其它蔬菜',container:'安静青白浅盘，含盘82%体量，菜堆四周留白'}},
  {id:'dish-fresh-ico-0096',code:'DS97',name:'咸水角',expectedOccupancy:.82,svg:friedGlutinousDumplings(),
    reason:'两只完整油炸糯米角与一只轻切前角，柔弧尖端包住饱满腹部；蜂蜜金黄薄脆外壳点缀少量自然小泡，切口露出厚润糯皮、暖棕肉粒与深棕蘑菇。',
    design:{silhouette:'三只金黄饱满糯米角，后两只完整且方向不同，前一只切口朝外，端尖柔弧',angle:'三分之四俯视，完整角的脆壳和切角的薄脆边、厚糯皮及肉菇馅同时可见',material:'蜂蜜金黄油炸薄脆壳、少量不规则泡点、乳白润糯内皮、暖棕熟肉与深棕菇碎',identity:'仅糯米团、五花肉与蘑菇；不画葱花、胡萝卜、芝麻或甜馅，不用白水饺皮或面包纹',container:'安静青白浅盘，含盘82%体量，克制数量与透明留白'}}
];

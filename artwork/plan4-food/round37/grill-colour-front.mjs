// Round 37: brighter cooked colours for two selected grill dishes.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 色彩精修新版</title><defs>${defs}</defs><g stroke="#49372c" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function grilledSausages(){
  const defs=grad('g37-sausage-plate',['#fff0d6','#edd3ac','#cfac81'])
    +grad('g37-sausage-skin',['#ffac68','#e76d45','#b64532'])
    +grad('g37-sausage-cut',['#f4bc8c','#e58b67','#be5c4b'])
    +grad('g37-sausage-pepper',['#ff7856','#eb4431','#b82f28']);
  let art=e(128,157,96,32,'url(#g37-sausage-plate)');
  art+=e(128,151,97,30,'#fff9e9');
  art+=e(128,151,83,22,'#f3e3bd','stroke="#d1b88b" stroke-width="1.35"');
  art+=line('M48 167Q79 184 114 183M147 183Q181 181 208 166','#fff9e9',2.1,.94);
  art+=e(130,151,67,15,'#b2603d','stroke="none" opacity=".18"');
  // Back sausage: a short curved body, rounded at the far end and diagonally cut near end.
  art+=p('M67 117Q56 110 62 98Q69 85 83 92Q107 108 137 108Q151 105 156 117Q161 129 146 134Q102 139 67 117Z','url(#g37-sausage-skin)');
  art+=p('M66 102Q69 96 77 99Q107 119 139 116Q145 114 149 119','#ffdc95','stroke="none" opacity=".72"');
  art+=p('M75 113Q102 130 140 125L148 122Q141 134 122 133Q95 131 77 121Z','#c94830','stroke="none" opacity=".25"');
  art+=line('M85 101Q81 109 83 117M108 112Q104 118 107 127M131 114Q129 123 132 130','#8e382a',2.2,.9);
  art+=line('M87 102L92 110M111 112L116 120','#ffb36e',1.4,.9);
  art+=p('M142 112Q153 107 157 118Q160 128 148 131Q141 125 142 112Z','url(#g37-sausage-cut)','stroke="#843e2c" stroke-width="2.1"');
  art+=line('M67 101L73 100M117 116L126 117','#ffe7ae',1.65,.96);
  art+=e(149,120,2.6,1.7,'#ffdab0','stroke="none"');
  // The front link bends in the opposite direction; no square end pieces or extra blocks.
  art+=p('M93 151Q80 147 83 134Q88 121 103 126Q139 141 171 125Q185 117 193 129Q200 141 185 150Q140 174 93 151Z','url(#g37-sausage-skin)');
  art+=p('M96 130Q128 146 165 133Q176 128 183 129L187 133Q176 135 167 140Q129 155 95 138Z','#ffd18b','stroke="none" opacity=".76"');
  art+=p('M101 144Q133 157 173 141L185 136Q175 154 146 160Q120 165 101 151Z','#c4412d','stroke="none" opacity=".28"');
  art+=line('M111 133Q106 141 109 150M137 141Q133 149 137 158M165 134Q163 143 168 149','#8f3729',2.2,.93);
  art+=line('M114 135L119 143M141 141L146 149M170 132L174 139','#ffae67',1.4,.9);
  art+=p('M88 132Q96 126 105 135Q108 144 99 151Q87 150 85 141Z','url(#g37-sausage-cut)','stroke="#843e2c" stroke-width="2.1"');
  art+=line('M117 139Q129 144 138 142M174 130L180 128','#ffe3a0',1.7,.94);
  art+=e(96,139,3.1,2.2,'#ffd2a3','stroke="none"');
  art+=e(98,145,1.5,1.1,'#a04736','stroke="none"');
  art+=line('M179 146L185 142','#7d3329',1.5,.83);
  art+=p('M63 141L70 135L78 140L80 149L72 155L65 151Z','url(#g37-sausage-pepper)','stroke-width="2.3"');
  art+=p('M171 161L179 155L188 159L190 166L181 172L174 168Z','url(#g37-sausage-pepper)','stroke-width="2.3"');
  art+=line('M68 140L73 142M177 160L183 161','#ffd08e',1.4,.96);
  return doc('孜然烤肉肠',defs,art);
}

function vegetableSkewers(){
  const defs=grad('g37-skewer-plate',['#fff9e6','#e7e7c7','#bbcaab'])
    +grad('g37-skewer-red',['#ff9870','#f4513c','#c7322b'])
    +grad('g37-skewer-green',['#b8d879','#78b84a','#438d3e'])
    +grad('g37-skewer-yellow',['#ffe77f','#ffc63a','#df9425'])
    +grad('g37-skewer-cap',['#efb779','#cc8550','#9a5835'])
    +grad('g37-skewer-stem',['#fff8df','#f1dcb5','#d1b382'])
    +grad('g37-skewer-aubergine',['#c58acf','#9f5eb2','#704082']);
  let art=e(128,157,98,31,'url(#g37-skewer-plate)');
  art+=e(128,151,99,30,'#fffcf0');
  art+=e(128,151,84,22,'#e6edcf','stroke="#b6c49e" stroke-width="1.35"');
  art+=line('M47 166Q78 182 113 181M148 181Q184 178 211 164','#fffef3',2.1,.95);
  // Two compact, gently slanted sticks support three recognisable vegetables each.
  art+=line('M57 137L191 103','#a77842',3.3,1);
  art+=line('M70 168L206 131','#a77842',3.3,1);
  art+=line('M59 136L187 104M72 167L202 132','#efc484',1.25,.9);
  // Back mushroom, its cap and pale stem read separately from pepper and aubergine.
  art+=p('M77 119L85 115L92 128L84 135Z','url(#g37-skewer-stem)','stroke-width="2.2"');
  art+=p('M67 119Q65 103 80 98Q96 95 104 111L101 117Q82 123 67 119Z','url(#g37-skewer-cap)','stroke-width="2.6"');
  art+=line('M73 110Q78 102 88 104','#ffe1ae',1.7,.95);
  art+=line('M71 117L80 117M91 114L98 112','#965f33',1.3,.82);
  // Back aubergine has purple skin and a warm pale seeded cut face.
  art+=p('M112 103L126 98Q133 98 139 105L138 118Q136 126 125 130L117 129Q109 125 109 118Z','url(#g37-skewer-aubergine)','stroke-width="2.6"');
  art+=p('M112 104L126 101L135 108L130 121L118 125L112 118Z','#fff0cd','stroke="#bda16c" stroke-width="1.25"');
  art+=line('M117 110L119 112M125 108L126 111M121 118L123 119','#d1b576',1.25,.92);
  // Back red pepper is a folded fleshy block with a hollow centre.
  art+=p('M150 100L167 94L180 103L176 119L160 125L147 115Z','url(#g37-skewer-red)','stroke-width="2.6"');
  art+=p('M155 103L166 100L173 105L170 115L161 118L153 112Z','#ffb073','stroke="#c65a31" stroke-width="1.25"');
  art+=line('M153 102L161 99M160 121L170 118','#ffe2a1',1.55,.95);
  // Front yellow pepper, one side curled, retains a distinct open corner.
  art+=p('M87 140L103 132L117 140L114 158L99 164L84 155Z','url(#g37-skewer-yellow)','stroke-width="2.6"');
  art+=p('M92 142L103 138L110 143L106 154L98 157L91 152Z','#ffeda3','stroke="#d7aa37" stroke-width="1.25"');
  art+=line('M88 149L91 157M107 136L113 140','#b57824',1.4,.9);
  // A small folded green pepper corner joins the front short skewer without adding a new ingredient.
  art+=p('M113 135L122 130Q130 131 132 138L128 148L119 152L111 145Z','url(#g37-skewer-green)','stroke="#486e35" stroke-width="2.4"');
  art+=p('M117 136L123 134L128 139L124 146L118 147L115 142Z','#c9df8d','stroke="#75a54a" stroke-width="1.25"');
  art+=line('M114 138L115 145M124 132L128 135','#e7efac',1.4,.93);
  // Front mushroom is wider and turned; the gills are visible beneath its cap.
  art+=p('M134 147L147 142L151 156Q145 162 137 157Z','url(#g37-skewer-stem)','stroke-width="2.2"');
  art+=p('M126 143Q129 125 145 125Q162 125 167 140Q151 152 126 148Z','url(#g37-skewer-cap)','stroke-width="2.6"');
  art+=p('M127 144Q146 151 166 140L165 146Q148 156 128 149Z','#bf8b52','stroke="#926039" stroke-width="1.25"');
  art+=line('M134 135Q141 129 151 132','#ffe1a9',1.8,.95);
  art+=line('M134 147L138 149M147 146L148 150M159 142L160 146','#956132',1.25,.88);
  // Front aubergine is cut diagonally, with a small purple folded skin edge.
  art+=p('M177 135L188 125Q194 124 200 131L205 141Q205 149 196 154L183 152Q177 148 177 135Z','url(#g37-skewer-aubergine)','stroke-width="2.6"');
  art+=p('M179 135L189 129L198 134L201 143L194 149L183 146Z','#fff1d3','stroke="#b69b6c" stroke-width="1.25"');
  art+=line('M185 136L187 138M192 135L193 138M188 143L191 144','#cdb174',1.25,.9);
  art+=line('M178 143L180 148M197 128L201 132','#754381',1.5,.86);
  return doc('风味蔬菜烤串',defs,art);
}

export const grillColourFrontCandidates=[
  {id:'dish-fresh-ico-0027',name:'孜然烤肉肠',svg:grilledSausages(),expectedOccupancy:.82,
    reason:'两条短粗烤肠改用油润栗红与珊瑚红熟色，金橙受光、少量深炭纹和奶金亮点提升焦香食欲；小红椒更鲜明，端头保持圆润斜切，没有多余方块。',
    design:{silhouette:'两条短粗烤肠自然相向弯曲，圆润斜切面和紧凑摆盘保持',angle:'三分之四俯视，能见肠衣弧面与切口',material:'油润栗红肠衣、珊瑚红熟切面、金橙受光与克制焦纹',palette:'从灰褐金棕转向饱满栗红、珊瑚红、金橙与鲜红椒，暖白盘衬托熟色',identity:'香肠和少量红椒；保留两条主体，无额外方块端头',container:'暖白陶色浅盘，整体82%体量，清楚细近黑描边与透明留白'}},
  {id:'dish-fresh-ico-0028',name:'风味蔬菜烤串',svg:vegetableSkewers(),expectedOccupancy:.82,
    reason:'两根短串以鲜红、金黄和清新绿彩椒提亮，紫亮茄皮包住奶白籽面，暖栗蘑菇保留帽柄层次；切面和受光更鲜活，三种主料清楚可辨。',
    design:{silhouette:'两根紧凑错落短串，彩椒折角、熟菇帽柄与茄子圆润切面各有形态',angle:'略俯视，可见食材切面、厚度和短签端头',material:'鲜红金黄清新绿彩椒、紫亮茄皮与奶白切面、暖栗熟菇帽和象牙菇柄',palette:'红黄绿彩椒与明亮紫色形成清楚对比，用奶白切面和暖金受光衔接，不用荧光色',identity:'彩椒、蘑菇、茄子，绿色仍为彩椒，不增加其它配方主料',container:'暖白青心浅盘，整体82%体量，轮廓与配料间保持可读间隙'}}
];

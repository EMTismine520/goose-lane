// Round 35: five independently composed, cooked frying-station dishes.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 煎炸成品新版候选</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
const scallion=(x,y,angle=0,scale=1)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">${e(0,0,5.5,3.4,'#72a64b','stroke="#47733c" stroke-width="1.4"')}${e(0,-.1,2.6,1.3,'#d7e9ab','stroke="none"')}</g>`;

function butterCarrot(){
  const defs=grad('r35-carrot-plate',['#fffdf0','#f1e7ce','#d6c3a5'])
    +grad('r35-carrot-orange',['#ffb452','#ee8734','#ca632b'])
    +grad('r35-carrot-sear',['#ffca72','#eda248','#ce7d33'])
    +grad('r35-carrot-butter',['#fff1b4','#eac477']);
  let art=e(128,160,99,33,'url(#r35-carrot-plate)');
  art+=e(128,156,86,23,'#fff9e9','stroke="#cbbb99" stroke-width="1.5"');
  art+=line('M44 167Q72 185 112 186M126 187Q185 185 212 164','#fffef4',2.1,.95);
  art+=p('M68 152Q78 139 98 145Q119 138 136 148Q151 140 174 146Q195 149 185 159Q167 168 139 165Q116 171 97 163Q74 167 68 159Z','url(#r35-carrot-butter)','stroke="none" opacity=".52"');
  // Three individually drawn oblique cuts keep their round carrot centres visible.
  art+=p('M59 124C64 108 84 99 102 105C118 109 123 125 115 140C107 155 90 162 73 154C60 149 54 136 59 124Z','url(#r35-carrot-orange)');
  art+=p('M59 122C66 108 85 102 100 107C114 112 117 123 110 135C101 148 82 152 68 144C57 138 55 131 59 122Z','url(#r35-carrot-sear)','stroke="#ad642e" stroke-width="1.6"');
  art+=p('M64 121Q75 108 92 110Q106 110 110 121Q107 134 94 140Q78 145 66 135Q61 130 64 121Z','#f8b95e','stroke="none"');
  art+=e(86,127,11.7,8.2,'#ffd28a','stroke="#d48635" stroke-width="1.4" transform="rotate(-30 86 127)"');
  art+=e(86,127,5.2,3.7,'#f4aa4c','stroke="none" transform="rotate(-30 86 127)"');
  art+=line('M66 121Q73 112 83 112M67 140L74 144','#ffd897',1.8,.96);
  art+=line('M98 112L95 117M66 130L72 130M103 137L99 133','#ba7130',1.45,.85);
  // A broader rear cut tilts the other way and has a narrow visible orange side.
  art+=p('M125 107C140 95 169 98 184 111C196 122 192 137 179 144C161 154 136 146 124 133C115 124 116 114 125 107Z','url(#r35-carrot-orange)');
  art+=p('M125 105C140 96 166 99 181 111C191 120 186 130 174 135C157 142 136 136 125 125C117 117 117 111 125 105Z','url(#r35-carrot-sear)','stroke="#ad642e" stroke-width="1.6"');
  art+=p('M129 107Q145 99 164 107Q180 112 182 121Q173 133 156 132Q140 131 128 120Q122 112 129 107Z','#f6b35a','stroke="none"');
  art+=e(153,117,13,7.5,'#ffce7f','stroke="#d18434" stroke-width="1.4" transform="rotate(18 153 117)"');
  art+=e(153,117,5.7,3.2,'#f3aa4e','stroke="none" transform="rotate(18 153 117)"');
  art+=line('M130 107Q143 102 155 106M178 136L183 132','#ffd795',1.75,.96);
  art+=line('M132 118L138 118M169 108L166 113M174 126L168 123','#b86d2e',1.4,.86);
  // The short front cut is rounder and offset rather than a cloned rear piece.
  art+=p('M102 146C111 132 132 128 150 135C168 142 173 156 165 167C154 181 130 183 112 173C100 167 96 155 102 146Z','url(#r35-carrot-orange)');
  art+=p('M103 143C114 132 133 131 150 138C164 144 168 153 161 163C150 174 130 174 114 166C102 160 98 151 103 143Z','url(#r35-carrot-sear)','stroke="#ad642e" stroke-width="1.55"');
  art+=p('M108 143Q121 134 139 139Q155 141 160 152Q156 164 141 166Q124 169 111 159Q104 153 108 143Z','#f9bb63','stroke="none"');
  art+=e(134,152,11.4,8,'#ffd48d','stroke="#d18335" stroke-width="1.35" transform="rotate(8 134 152)"');
  art+=e(134,152,4.8,3.5,'#f3aa4d','stroke="none" transform="rotate(8 134 152)"');
  art+=line('M111 143Q119 138 126 140M116 168Q125 173 134 174','#ffdb99',1.8,.96);
  art+=line('M112 152L118 151M145 140L142 145M156 159L150 157','#b86f2e',1.4,.86);
  art+=e(181,158,3.4,1.9,'#fff6cc','stroke="none"');
  art+=line('M77 162L84 165M171 173L178 170','#d7b56f',1.4,.8);
  return doc('香煎胡萝卜',defs,art);
}

function crispyTurkey(){
  const defs=grad('r35-turkey-plate',['#f9fcf2','#d7e6de','#9bbfc1'])
    +grad('r35-turkey-crisp',['#f8ca75','#e7a044','#bd7133'])
    +grad('r35-turkey-edge',['#e5a24e','#c77b34','#9e592c'])
    +grad('r35-turkey-bone',['#fff9e8','#ead8b4','#cdb28a']);
  let art=e(128,164,99,31,'url(#r35-turkey-plate)');
  art+=e(128,160,86,23,'#fffdf0','stroke="#a2bbb4" stroke-width="1.45"');
  art+=line('M45 170Q74 189 118 190M137 190Q186 188 211 168','#f7fff8',2.1,.95);
  // Short ivory bone is separate from the breaded meat, never a long thin handle.
  art+=p('M148 107L171 87Q168 81 173 77Q179 73 184 78Q190 74 195 80Q199 87 192 92Q187 94 182 92L161 116Z','url(#r35-turkey-bone)');
  art+=line('M165 102L180 88M177 80Q180 79 182 82','#fffdf1',1.8,.98);
  // Broad lower drum tapers into a short neck beside the bone rather than a round ball.
  art+=p('M64 126Q61 113 72 106Q74 97 87 95Q97 88 109 93Q122 91 132 101L146 101Q152 96 159 102L168 110Q172 117 163 124L151 130Q146 144 136 154Q126 168 111 166Q97 173 85 166Q71 168 65 156Q54 151 59 138Q55 132 64 126Z','url(#r35-turkey-edge)');
  art+=p('M69 126Q66 116 77 111Q79 103 90 102Q99 95 109 101Q120 98 129 108L143 110Q152 103 159 110Q164 115 157 119L145 124Q140 138 131 146Q122 159 109 158Q98 165 88 158Q77 161 72 150Q63 145 68 136Q62 131 69 126Z','url(#r35-turkey-crisp)','stroke="#bf7939" stroke-width="1.6"');
  art+=p('M78 116Q85 104 98 108Q108 101 119 109L132 116Q137 119 143 116L154 111Q159 112 157 116L140 124Q131 121 121 117Q111 111 101 116Q87 113 78 124Z','#ffdc8d','stroke="none" opacity=".85"');
  art+=line('M79 124L85 119M93 106L99 103M113 116L119 113M141 115L147 113M139 131L145 127M88 147L95 149M117 153L124 150','#fff0b0',2,.95);
  art+=line('M78 135L82 139M93 121L97 124M106 137L110 133M124 123L129 127M143 140L148 137M111 158L115 162','#9d5e2d',1.7,.86);
  art+=p('M83 112L87 109L90 114L86 118Z','#cc8039','stroke="none"');
  art+=p('M119 106L123 103L127 108L122 111Z','#dc9340','stroke="none"');
  art+=p('M133 145L137 141L141 145L138 149Z','#bd7432','stroke="none"');
  // Two small red-pepper accents leave the single turkey leg dominant.
  art+=p('M178 144Q185 141 190 147L187 154L177 153Z','#e66f4d','stroke="#8d4938" stroke-width="1.7"');
  art+=line('M181 145L185 145','#ffb487',1.4,.96);
  art+=p('M162 164L169 159L176 163L173 169L165 170Z','#d95c42','stroke="#8d4938" stroke-width="1.6"');
  art+=line('M166 162L170 162','#ffad7b',1.3,.96);
  return doc('酥炸火鸡腿',defs,art);
}

function wineSteak(){
  const defs=grad('r35-steak-plate',['#f7f4e5','#e5ded0','#bac3bd'])
    +grad('r35-steak-crust',['#b97a49','#96532f','#723d2b'])
    +grad('r35-steak-side',['#c78c5c','#9f5f3a','#74432d'])
    +grad('r35-steak-bone',['#fff9df','#e8d7b2','#cbb491'])
    +grad('r35-steak-wine',['#b16965','#874649','#66343d'])
    +grad('r35-steak-onion',['#e7c2cc','#bd899f','#99677e']);
  let art=e(128,161,100,35,'url(#r35-steak-plate)');
  art+=e(128,156,87,25,'#fff9e9','stroke="#aebbb1" stroke-width="1.5"');
  art+=line('M44 168Q75 187 117 189M136 189Q186 186 212 165','#fffef4',2,.94);
  art+=p('M64 146Q75 134 97 142Q118 137 139 146Q161 140 181 150Q195 155 182 164Q159 175 139 171Q118 179 99 172Q76 176 61 163Q55 153 64 146Z','url(#r35-steak-wine)','stroke="#6e3b3e" stroke-width="1.6"');
  art+=line('M69 157Q78 164 88 162M152 168Q168 169 180 161','#d29a8e',1.6,.84);
  // Thick cooked steak; the exposed side is warm brown, not raw pink.
  art+=p('M70 111Q75 94 96 92Q110 81 132 88Q153 83 167 97Q183 106 184 124L177 143Q165 159 140 161Q121 169 99 158Q79 159 69 143Q61 127 70 111Z','url(#r35-steak-side)');
  art+=p('M70 110Q80 94 99 96Q111 86 132 93Q154 88 167 103Q180 111 179 125Q172 144 149 148Q127 158 106 148Q86 151 74 137Q64 123 70 110Z','url(#r35-steak-crust)','stroke="#70442d" stroke-width="2"');
  art+=p('M79 110Q89 101 102 104Q115 96 130 101Q146 96 160 107Q170 112 171 122Q154 115 143 119Q128 115 113 121Q94 113 81 123Z','#cf985d','stroke="none" opacity=".65"');
  art+=line('M82 129L105 111M104 141L128 119M130 144L151 125','#603b2a',2,.83);
  art+=line('M80 113Q89 104 99 105M112 98Q124 96 131 102M146 101L154 104','#e6b67c',1.75,.96);
  art+=line('M78 142L87 148M105 155Q117 161 127 158M146 156L156 153','#d5a675',1.5,.86);
  // Bone runs along the steak edge and ends in a small rounded cap.
  art+=p('M156 101Q161 97 165 101L175 111Q179 113 182 110Q188 109 190 115Q193 121 186 124Q181 125 178 121L170 118L161 134Q158 139 153 136Q149 133 153 128L166 112Z','url(#r35-steak-bone)','stroke="#785d42" stroke-width="2.1"');
  art+=line('M160 104L170 114L157 132M182 114L186 115','#fffcef',1.7,.96);
  // Two distinct, short cooked onion petals; no rings or cloned long ribbons.
  art+=p('M60 141Q53 131 59 122L70 119Q80 124 83 132L75 141L66 145Z','url(#r35-steak-onion)','stroke="#755061" stroke-width="2"');
  art+=p('M60 124L69 123Q77 128 78 132L72 138Q64 135 60 128Z','#efccd2','stroke="none"');
  art+=line('M62 125Q65 133 73 137M59 133L63 140','#b48199',1.35,.98);
  art+=p('M184 143Q193 140 198 146L205 156L198 163Q187 165 181 156Q178 150 184 143Z','url(#r35-steak-onion)','stroke="#755061" stroke-width="2"');
  art+=p('M185 145Q191 144 195 149L200 156L195 159Q187 157 184 151Z','#f2d6d7','stroke="none"');
  art+=line('M184 147Q184 155 195 160','#ba88a0',1.35,.98);
  return doc('红酒酱牛排',defs,art);
}

function butterSeaBream(){
  const defs=grad('r35-fish-plate',['#f5fcf0','#d9e8d5','#a5c6b6'])
    +grad('r35-fish-white',['#fffdf1','#f5e8ca','#dec9a3'])
    +grad('r35-fish-sear',['#ecc77f','#d4a15d','#b77e42'])
    +grad('r35-fish-skin',['#a4aaa0','#7d8b86','#596b69'])
    +grad('r35-fish-butter',['#fff1b7','#e4c075']);
  let art=p('M40 135Q34 130 42 124L178 104Q192 104 204 116L223 153Q227 163 215 167L80 190Q65 192 58 181Z','url(#r35-fish-plate)');
  art+=p('M46 131L178 112Q188 111 196 121L214 151Q218 158 208 161L81 182Q70 184 64 175Z','#fbfff4','stroke="#a5bdae" stroke-width="1.5"');
  art+=line('M69 180L83 185L206 165','#f7fff3',1.9,.95);
  art+=p('M74 143Q82 132 96 137Q109 130 125 138Q141 132 159 139Q178 135 190 145Q201 155 186 161Q165 170 148 165Q124 173 103 166Q80 169 73 158Z','url(#r35-fish-butter)','stroke="none" opacity=".65"');
  // One tapered cooked fish portion: ivory flakes, honey-gold sear and a silver skin edge.
  art+=p('M65 119L142 87Q153 82 164 89L194 112Q201 119 194 133L177 153Q166 162 150 160L81 145Q66 142 62 132Z','url(#r35-fish-white)');
  art+=p('M65 119L141 88Q152 84 163 91L191 113Q194 119 187 125L167 139Q158 145 145 141L77 133Q66 133 65 125Z','url(#r35-fish-sear)','stroke="#a57743" stroke-width="1.7"');
  art+=p('M78 117L142 92Q151 89 159 94L181 112Q180 117 173 120L156 127Q145 127 137 121L120 124L104 119L88 127Z','#f9e5b9','stroke="none"');
  art+=p('M82 124L104 119L118 125L136 121L150 129L171 123Q169 130 158 134L139 135L117 131L97 132Z','#f0d296','stroke="none"');
  art+=p('M178 139L194 124L191 136L177 153Q168 161 151 159L153 149Q167 150 178 139Z','url(#r35-fish-skin)','stroke="#59645d" stroke-width="1.6"');
  art+=line('M158 153Q174 153 184 141','#b9c5b7',1.6,.95);
  art+=line('M75 136L91 140L99 137M103 143L116 146L125 143M129 149L143 152','#c9b68e',1.45,.94);
  art+=line('M92 106L101 111M115 98L125 104M141 95L147 101M169 105L175 109','#b07b3e',1.55,.8);
  art+=line('M79 117L89 114M108 105L118 102M143 92Q150 90 155 94M137 138L147 140','#fff8db',1.9,.96);
  art+=scallion(111,111,-25,.83)+scallion(150,112,18,.8)+scallion(135,129,-12,.74);
  art+=scallion(95,158,17,.74)+scallion(178,164,-27,.7);
  art+=e(72,157,3,1.5,'#fff7d2','stroke="none"');
  return doc('黄油煎鲷鱼',defs,art);
}

function radishCake(){
  const defs=grad('r35-cake-plate',['#f4fcf8','#d2e6e2','#9bbdc3'])
    +grad('r35-cake-white',['#fffdf1','#f6ecd4','#decea9'])
    +grad('r35-cake-crust',['#f3ce81','#dba153','#b77a39']);
  let art=e(128,165,99,31,'url(#r35-cake-plate)');
  art+=e(128,161,87,23,'#fcfff4','stroke="#a7beb7" stroke-width="1.5"');
  art+=line('M45 171Q75 190 120 190M140 190Q185 187 212 169','#f8fff8',2,.95);
  // Back cake: a long, lightly tilted piece, with a narrow browned base.
  art+=p('M78 111L139 91L174 109L168 132L108 153L78 136Z','url(#r35-cake-crust)');
  art+=p('M78 111L139 91L174 109L111 131Z','url(#r35-cake-white)');
  art+=p('M81 115L109 134L109 145L81 131Z','#eee1c0','stroke="#b5a37c" stroke-width="1.4"');
  art+=p('M112 134L170 113L167 126L111 146Z','#fff9e5','stroke="#c3b08c" stroke-width="1.35"');
  art+=line('M87 111L137 96M117 138L144 128','#fffef4',1.8,.96);
  art+=line('M97 127L100 136M129 141L135 139M152 133L159 130','#d1b67c',1.4,.88);
  // Front left cake is shorter and has a broad visible cut face.
  art+=p('M51 142L96 126L131 146L127 169L81 186L50 167Z','url(#r35-cake-crust)');
  art+=p('M51 142L96 126L131 146L84 163Z','url(#r35-cake-white)');
  art+=p('M53 146L82 165L81 179L53 162Z','#f2e6c9','stroke="#bdab86" stroke-width="1.4"');
  art+=p('M86 165L128 149L125 163L84 180Z','#fff9e5','stroke="#c3ad86" stroke-width="1.4"');
  art+=line('M60 143L93 132M90 170L112 162','#fffef4',1.8,.96);
  art+=line('M61 160L68 164M94 177L103 173M115 169L121 166','#d2b57b',1.35,.88);
  // Front right is a wider skewed block; no identical stacked clones.
  art+=p('M132 143L180 124L205 143L202 167L154 185L127 166Z','url(#r35-cake-crust)');
  art+=p('M132 143L180 124L205 143L155 163Z','url(#r35-cake-white)');
  art+=p('M133 148L153 165L152 178L130 162Z','#eee0c0','stroke="#b5a27f" stroke-width="1.4"');
  art+=p('M158 165L202 147L199 161L156 178Z','#fff9e7','stroke="#c3ae88" stroke-width="1.4"');
  art+=line('M139 143L178 129M161 170L186 160','#fffef4',1.8,.96);
  art+=line('M142 165L145 170M170 176L177 173M191 168L196 165','#d1b57a',1.35,.89);
  art+=scallion(111,109,-20,.78)+scallion(141,114,24,.69);
  art+=scallion(85,144,16,.83)+scallion(162,146,-30,.75);
  art+=p('M99 145L102 142L105 144L102 147Z','#7fa54c','stroke="none"');
  return doc('酥脆萝卜糕',defs,art);
}

export const fryingTailCandidates=[
  {id:'dish-fresh-ico-0071',name:'香煎胡萝卜',svg:butterCarrot(),expectedOccupancy:.82,
    reason:'三块厚薄、角度与切面不同的斜切胡萝卜，浅橙菜芯与暖橙外缘一眼可辨，局部金棕煎色和少量黄油薄光表现熟食。',
    design:{silhouette:'三块不同方向的厚切斜片，菜芯、外缘和侧面分层，避免相同圆片复制排列',angle:'三分之四俯视，前后块体的长度与截面各有差异',material:'橙色软熟表皮、金棕煎面和轻润黄油',identity:'仅胡萝卜与黄油，不添加葱叶或肉类',container:'奶油白浅盘，含盘约82%体量，透明留白'}},
  {id:'dish-fresh-ico-0097',name:'酥炸火鸡腿',svg:crispyTurkey(),expectedOccupancy:.84,
    reason:'单只紧凑饱满的炸火鸡腿，短骨柄、自然酥皮起伏与金黄焦边构成主形，配两小块红椒，不以多腿或夸长骨柄填满画面。',
    design:{silhouette:'饱满肉鼓斜向短骨柄，单只主体轮廓清楚',angle:'三分之四俯视，能看出鼓起酥壳与短骨端',material:'金黄面粉酥壳、棕金脆边与象牙骨面',identity:'火鸡腿、面粉与少量红椒，保持熟食形态',container:'青白釉浅盘，含盘约84%体量，配料退后'}},
  {id:'dish-fresh-ico-0085',name:'红酒酱牛排',svg:wineSteak(),expectedOccupancy:.84,
    reason:'一块厚实带骨熟牛排，以棕金焦面、克制煎纹、酒红薄酱和两枚不同的短洋葱瓣拉开层次；本轮为独立新稿，既定选用另行保留。',
    design:{silhouette:'单块厚牛排与贴边短骨，酱汁和洋葱让开主体',angle:'三分之四俯视，看得见焦面、厚侧面与骨边',material:'暖棕熟肉、象牙骨、深酒红酱及柔紫洋葱切面',identity:'带骨牛排、红葡萄酒和紫洋葱；无长条重复洋葱',container:'淡灰白浅盘，含盘约84%体量，盘沿干净'}},
  {id:'dish-fresh-ico-0136',name:'黄油煎鲷鱼',svg:butterSeaBream(),expectedOccupancy:.82,
    reason:'一块完整鲷鱼排，以象牙白熟鱼肉、蜜金煎面和银灰鱼皮边建立辨识，少量短葱段与黄油微光点到为止。',
    design:{silhouette:'单块收尖鱼排，白肉切侧与银灰皮边区分于肉排',angle:'三分之四俯视，看见煎面、分层白肉与鱼皮',material:'白嫩熟鱼肉、金棕煎色、银灰鱼皮和轻润黄油',identity:'仅鲷鱼、黄油、香葱，不画生橙色鱼肉或柠檬',container:'浅青白长形陶盘，含盘约82%体量，留白完整'}},
  {id:'dish-fresh-ico-0107',name:'酥脆萝卜糕',svg:radishCake(),expectedOccupancy:.82,
    reason:'三块角度、长短不同的萝卜糕，奶白切面与金黄酥底分层清楚，少量香葱点缀，紧凑摆盘且不重复堆叠。',
    design:{silhouette:'三块独立方糕错落摆放，前后遮挡和宽窄各异',angle:'三分之四俯视，兼顾白嫩顶面与酥底厚度',material:'奶白米粉糕体、金棕脆底与少量葱粒',identity:'白萝卜、米粉浆、香葱；不加入虾、肉或鸡蛋',container:'浅蓝白陶盘，含盘约82%体量，主体数量控制为三块'}}
];

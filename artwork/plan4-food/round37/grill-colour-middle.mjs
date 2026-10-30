// Round 37: warmer cooked colours and softer smoked-beef cuts.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 炭烤成品色香精修</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
const scallion=(x,y,a=0,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">${e(0,0,5.4,3.3,'#69b84a','stroke="#47733c" stroke-width="1.4"')}${e(0,-.1,2.5,1.2,'#e5f4ae','stroke="none"')}</g>`;


function scallionCrab(){
  const defs=grad('r37-crab-plate',['#fbfff5','#dceee7','#97c4c4'])
    +grad('r37-crab-shell',['#ffb35b','#f27543','#ce3f31'])
    +grad('r37-crab-claw',['#ffad54','#ec6537','#bc392e'])
    +grad('r37-crab-leg',['#f38b43','#d25130','#9f3928']);
  let art=e(128,172,101,31,'url(#r37-crab-plate)');
  art+=e(128,168,88,23,'#fffbed','stroke="#a8beb7" stroke-width="1.5"');
  art+=line('M43 178Q74 197 119 197M140 197Q191 192 214 175','#f8fff7',2,.96);
  // Three short walking-leg pairs stay broad and tucked around the shell.
  art+=p('M88 122L65 116L54 124L59 131L70 126L87 132Z','url(#r37-crab-leg)','stroke-width="2.1"');
  art+=p('M85 136L62 138L54 150L61 154L69 146L87 145Z','url(#r37-crab-leg)','stroke-width="2.1"');
  art+=p('M91 149L76 156L69 168L76 172L84 164L98 159Z','url(#r37-crab-leg)','stroke-width="2.1"');
  art+=p('M168 123L191 117L203 126L198 133L186 127L169 133Z','url(#r37-crab-leg)','stroke-width="2.1"');
  art+=p('M171 138L194 140L202 153L195 157L186 148L169 147Z','url(#r37-crab-leg)','stroke-width="2.1"');
  art+=p('M165 150L181 159L188 171L181 174L173 165L158 160Z','url(#r37-crab-leg)','stroke-width="2.1"');
  art+=line('M65 122L69 120M62 146L67 141M78 164L82 160M190 123L194 126M191 146L195 150M178 164L182 170','#ffc878',1.3,.9);
  // Broad, bent claw arms lead to two large pincers, with short open tips.
  art+=p('M90 117L76 106L66 106L60 115L73 128L87 129Z','url(#r37-crab-leg)','stroke-width="2.3"');
  art+=p('M165 118L180 107L191 109L196 118L181 130L167 129Z','url(#r37-crab-leg)','stroke-width="2.3"');
  art+=p('M66 111Q51 116 42 106Q36 98 41 87L48 80L56 92L62 79Q74 84 76 96Q77 106 66 111Z','url(#r37-crab-claw)');
  art+=p('M190 111Q206 117 215 106Q221 97 215 87L207 80L199 92L193 79Q181 85 180 97Q180 106 190 111Z','url(#r37-crab-claw)');
  art+=line('M56 92L56 101M199 92L199 102','#ae3829',1.65,.94);
  art+=line('M45 95Q46 105 56 106M187 94Q187 103 194 106','#ffe2a0',1.8,.96);
  art+=line('M64 86L68 91M209 89L213 94','#ffd087',1.5,.95);
  // Wide cooked carapace, gently domed with a thick front edge.
  art+=p('M79 120Q78 108 91 102Q104 94 116 98Q129 91 141 98Q155 94 168 104Q179 109 177 124L172 143Q165 157 147 162Q129 168 112 162Q94 161 84 147Z','url(#r37-crab-shell)');
  art+=p('M86 119Q88 106 101 106Q114 100 126 105Q139 99 151 105Q163 105 170 116Q161 118 152 116Q137 111 125 117Q110 111 98 118Z','#ffc16f','stroke="none"');
  art+=p('M86 135Q99 151 119 153Q142 158 168 138L166 148Q151 163 129 163Q103 164 89 149Z','#bc362c','stroke="none" opacity=".75"');
  art+=line('M92 115Q105 105 116 110M128 107Q142 103 154 110','#ffe5a2',2,.97);
  art+=line('M91 128L98 132M105 144Q117 150 129 149M142 148L153 143M161 126L166 122','#b53e2d',1.45,.84);
  art+=p('M93 121Q101 111 111 116Q107 121 100 123Z','#ffe2a0','stroke="none" opacity=".58"');
  art+=p('M149 119Q158 119 165 126L162 133Q157 125 149 124Z','#ffb969','stroke="none" opacity=".6"');
  art+=line('M88 141L93 147M157 155L163 151','#ffc477',1.45,.93);
  art+=e(113,100,2.5,1.9,'#704334','stroke="none"');
  art+=e(143,101,2.5,1.9,'#704334','stroke="none"');
  // A few cooked scallion rings, without covering the shell shape or turning into long legs.
  art+=scallion(118,121,-17,.78)+scallion(174,166,24,.73);
  art+=scallion(95,178,-21,.75)+scallion(163,176,15,.73);
  return doc('葱香烤青蟹',defs,art);
}

function juicyBrisket(){
  const defs=grad('r37-brisket-plate',['#fffdf0','#e2eee5','#a7c6c4'])
    +grad('r37-brisket-bark',['#a85932','#7b3d2a','#593023'])
    +grad('r37-brisket-meat',['#d79565','#bb6947','#944c37'])
    +grad('r37-brisket-fat',['#fff0c9','#edcc9e','#dcae7b'])
    +grad('r37-brisket-onion',['#efbadb','#d98dc3','#aa6095']);
  let art=e(128,167,100,32,'url(#r37-brisket-plate)');
  art+=e(128,163,87,23,'#fffbed','stroke="#a9c0b5" stroke-width="1.5"');
  art+=line('M44 173Q76 192 120 192M141 192Q188 189 212 170','#fafff6',2,.96);
  // Broad back cut has a soft shoulder and a gently drooping right end.
  art+=p('M73 111C82 100 94 97 106 102C119 98 135 105 143 113C155 113 169 124 164 136C161 146 147 147 136 142C122 147 109 139 97 139C83 140 68 129 68 120Q68 115 73 111Z','url(#r37-brisket-meat)');
  // The thin smoked top is interrupted and varies naturally in thickness.
  art+=p('M73 111C82 100 94 97 106 102C119 98 135 105 143 113C155 113 164 121 166 127L159 125Q151 118 141 119Q132 109 119 108Q111 106 105 108Q94 103 83 111L75 117Z','url(#r37-brisket-bark)','stroke="none"');
  art+=p('M77 115Q88 106 99 108L106 111Q114 107 122 112L132 116L127 120Q117 113 109 116L99 113Q88 111 81 119Z','url(#r37-brisket-fat)','stroke="none"');
  art+=p('M142 120Q150 118 157 125L159 131L153 130Q148 124 142 124Z','#edc18f','stroke="none"');
  art+=p('M81 120Q90 115 99 119Q109 115 119 122Q128 119 136 126Q144 125 151 132Q144 137 133 135Q118 139 105 132Q91 133 81 125Z','#d99466','stroke="none" opacity=".63"');
  art+=line('M81 120Q87 125 94 129M94 116Q99 122 106 126M108 118Q114 126 121 130M121 121Q126 130 133 134M137 127Q143 132 150 134','#e9b78a',1.4,.95);
  art+=line('M81 126Q88 131 96 133M100 124L106 129M115 129Q121 134 127 135M150 137L156 135','#9c573c',1.3,.9);
  art+=line('M86 107Q92 103 98 106M113 104Q124 104 132 110','#d39864',1.5,.9);
  art+=p('M88 116Q92 114 96 116L101 118L96 119Z','#ffe5b6','stroke="none" opacity=".86"');
  // Front cut is broader, softly folded and turned toward the viewer; its ends are unequal.
  art+=p('M88 145C96 135 110 132 123 136Q136 131 149 137C166 133 180 143 187 153Q196 163 185 173C177 181 165 177 154 178Q138 185 124 179C107 184 89 176 81 165Q76 154 88 145Z','url(#r37-brisket-meat)');
  art+=p('M88 145C96 135 110 132 123 136Q136 131 149 137C166 133 180 143 187 153L182 159Q171 148 158 145Q150 145 146 143Q133 139 123 143Q110 138 99 145L87 153L82 156Q83 149 88 145Z','url(#r37-brisket-bark)','stroke="none"');
  // Broken creamy fat follows a natural seam; it does not outline the whole slice.
  art+=p('M91 149Q102 141 113 143L123 146Q132 140 141 144L147 148L140 150Q131 145 124 150L113 148Q102 146 95 154Z','url(#r37-brisket-fat)','stroke="none"');
  art+=p('M154 145Q165 143 174 150L180 157L175 160Q166 150 158 152Z','#f5d4a6','stroke="none"');
  art+=p('M94 155Q105 150 116 155Q129 148 142 155Q156 151 169 158Q181 160 180 167Q168 172 157 169Q142 177 127 170Q109 175 95 166Z','#d78b61','stroke="none" opacity=".64"');
  art+=line('M94 156Q101 164 108 167M107 151Q114 161 122 165M122 154Q129 165 138 168M140 155Q147 165 155 168M158 158Q165 167 174 167','#edbc8d',1.45,.95);
  art+=line('M90 161Q94 168 101 171M112 162Q117 169 124 171M132 166Q138 171 145 171M161 172Q169 174 176 171','#9c5139',1.3,.9);
  art+=line('M100 140Q106 137 113 140M130 137Q137 136 142 140M158 140L165 142','#cf8b5c',1.5,.9);
  art+=p('M102 153Q108 151 114 154L118 157L111 157Z','#ffe1ad','stroke="none" opacity=".81"');
  art+=p('M148 159Q153 157 157 160L160 163L155 163Z','#efc38f','stroke="none" opacity=".85"');
  // Two vivid but cooked short onion petals support the warm meat palette.
  art+=p('M53 139Q48 128 56 123L66 126Q75 135 69 143L60 146Z','url(#r37-brisket-onion)','stroke="#85516f" stroke-width="1.8"');
  art+=p('M55 127L62 128Q68 134 65 139L59 140Q54 135 55 127Z','#f9d6e2','stroke="none"');
  art+=line('M56 130Q56 137 63 141','#d696bd',1.3,.98);
  art+=p('M194 152Q201 146 207 153L213 163L206 169Q196 169 191 161Z','url(#r37-brisket-onion)','stroke="#85516f" stroke-width="1.8"');
  art+=p('M196 153Q201 151 204 156L209 162L204 165Q197 162 195 158Z','#f6cddc','stroke="none"');
  art+=line('M196 155Q197 162 205 166','#d291b8',1.3,.98);
  return doc('烟熏牛胸肉',defs,art);
}

export const grillColourMiddleCandidates=[
  {id:'dish-fresh-ico-0049',name:'烟熏牛胸肉',svg:juicyBrisket(),expectedOccupancy:.84,
    reason:'两大片自然软厚牛胸肉错落摆放，轮廓有轻微下垂与肉片弧度；栗红赭色熟肉、薄焦糖烟熏边、局部奶油脂纹及弯曲纤维表现多汁熟香，避免石片硬边和长圆香肠形。',
    design:{silhouette:'两片宽厚肉片，软圆不规则边、前后弧度与厚度不同',angle:'三分之四俯视，能看见厚切断面与自然垂落的肉边',material:'栗红暖赭熟肉、局部奶油脂纹、薄焦糖烟熏壳和克制油光',identity:'仅带骨牛排与两枚不同的短紫洋葱瓣，不画生红肉或重复长条',palette:'暖熟红棕配奶油脂色、亮粉紫短洋葱，盘器清爽留白',container:'青白浅盘，含盘约84%体量，配方与整体尺寸保持'}},
  {id:'dish-fresh-ico-0061',name:'葱香烤青蟹',svg:scallionCrab(),expectedOccupancy:.84,
    reason:'宽甲熟青蟹改为鲜亮朱红与珊瑚红壳面，金橙高光、轻焦边和少量油亮反光拉开甲壳及钳尖层次；两大钳与短腿继续紧凑，少量鲜绿短葱提鲜。',
    design:{silhouette:'宽甲单蟹、两大钳与三对短步足，保留稳定紧凑主形',angle:'三分之四俯视，甲壳厚度、弯钳和短腿分层清楚',material:'熟后朱红珊瑚壳、金橙油亮高光与轻焦边',identity:'仅青蟹和香葱，不加其它配菜，不拉长成八爪造型',palette:'鲜亮朱红至珊瑚红，金橙高光配克制鲜绿葱点',container:'青白釉浅盘，含盘约84%体量，配方和透明留白保持'}}
];

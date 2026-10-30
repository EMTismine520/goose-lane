// Round 36: six separately composed cooked grill dishes, with native SVG geometry.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 炭烤成品新版候选</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
const scallion=(x,y,a=0,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">${e(0,0,5.4,3.3,'#78a84e','stroke="#47733c" stroke-width="1.4"')}${e(0,-.1,2.5,1.2,'#d9e9ae','stroke="none"')}</g>`;

function grilledBreast(){
  const defs=grad('r36-breast-plate',['#fffdf0','#eee4cb','#cdbd9f'])
    +grad('r36-breast-crust',['#e6b16d','#c98a47','#a76435'])
    +grad('r36-breast-white',['#fff9e9','#f3e1bf','#d7bd96'])
    +grad('r36-breast-basil',['#a5c977','#78aa51','#477b40']);
  let art=e(128,163,100,33,'url(#r36-breast-plate)');
  art+=e(128,159,87,24,'#fff9e9','stroke="#c7b996" stroke-width="1.5"');
  art+=line('M44 170Q75 189 118 190M139 190Q190 186 213 167','#fffef4',2.1,.96);
  // One rounded breast remains whole; only two slices fan across the front.
  art+=p('M64 122Q63 107 77 101Q86 88 103 92Q122 84 138 96Q154 100 160 116Q169 134 153 145Q138 157 119 151Q97 155 80 145Q62 139 64 122Z','url(#r36-breast-crust)');
  art+=p('M73 120Q72 110 84 106Q94 96 108 100Q125 94 137 104Q150 108 152 120Q141 118 130 122Q115 117 102 124Q88 119 73 129Z','#e9bc7c','stroke="none"');
  art+=line('M78 124L101 105M94 139L121 113M117 144L143 122','#8d592f',1.85,.86);
  art+=line('M88 108L120 133M111 100L142 124','#a66d37',1.55,.74);
  art+=line('M78 111Q90 101 102 103M115 99Q127 100 134 105M75 136L82 141','#ffddb0',1.8,.97);
  // Left cut face: ivory cooked fibres inside a thin golden outer edge.
  art+=p('M110 138Q121 124 138 126Q154 130 159 142L150 160Q143 170 131 165L112 153Q105 147 110 138Z','url(#r36-breast-crust)');
  art+=p('M111 138Q122 128 136 130Q149 133 153 143L144 157Q139 161 131 157L114 148Q108 143 111 138Z','url(#r36-breast-white)','stroke="#ba9769" stroke-width="1.5"');
  art+=line('M117 139L136 151M124 135L143 147M113 144L127 153','#d3bf9c',1.35,.91);
  art+=line('M119 134Q128 130 136 134','#fffdf0',1.7,.97);
  // The second slice is offset and turned toward the viewer rather than cloned.
  art+=p('M149 148Q158 134 174 135Q188 137 195 149L191 162Q184 175 172 171L151 160Q144 155 149 148Z','url(#r36-breast-crust)');
  art+=p('M150 147Q160 138 172 139Q184 141 190 150L184 162Q180 167 172 163L153 155Q147 152 150 147Z','url(#r36-breast-white)','stroke="#ba9769" stroke-width="1.5"');
  art+=line('M156 147L174 158M164 143L183 153M153 153L167 160','#d2bd98',1.35,.91);
  art+=line('M159 142Q168 138 176 143','#fffdf0',1.7,.97);
  // A small pair of basil leaves supports the actual recipe without hiding the meat.
  art+=p('M63 156Q52 140 67 133Q80 137 76 153L69 159Z','url(#r36-breast-basil)','stroke="#466b3c" stroke-width="1.7"');
  art+=p('M67 157Q72 142 87 147Q91 158 76 164Z','url(#r36-breast-basil)','stroke="#466b3c" stroke-width="1.7"');
  art+=line('M67 137L68 155M83 151L70 159','#d2e7a8',1.3,.92);
  return doc('炭烤鸡胸肉',defs,art);
}

function honeyHock(){
  const defs=grad('r36-hock-plate',['#eaf1e6','#c7d7cd','#8ea9a4'])
    +grad('r36-hock-skin',['#e8af59','#cb8638','#9e582c'])
    +grad('r36-hock-cut',['#f6dfb5','#d8b58b','#b58a60'])
    +grad('r36-hock-bone',['#fff9e4','#e7d6b2','#c8ae87']);
  let art=e(128,170,99,31,'url(#r36-hock-plate)');
  art+=e(128,166,85,22,'#fff9e9','stroke="#98afa3" stroke-width="1.5"');
  art+=line('M44 175Q75 194 120 195M140 194Q190 190 212 172','#f7fff3',2,.96);
  // A low, broad bone stump rises from a barrel-shaped hock, not a drumstick.
  art+=p('M117 87L118 68Q113 64 116 58Q121 52 127 57Q134 50 140 57Q145 64 139 69L138 89Z','url(#r36-hock-bone)');
  art+=line('M123 65L124 83M133 58L136 61','#fffdf0',1.7,.96);
  art+=p('M82 110Q83 94 100 89Q116 80 135 85Q155 84 168 100Q181 113 178 135L172 157Q166 176 145 181Q122 187 100 177Q83 172 79 155Q73 135 82 110Z','url(#r36-hock-skin)');
  art+=p('M90 109Q93 96 108 94Q127 86 144 95Q158 97 166 111Q171 124 165 137Q156 129 145 128Q133 132 122 123Q107 125 98 117Z','#efbd6b','stroke="none"');
  art+=p('M94 102Q104 94 116 96Q130 91 143 98Q151 100 155 107Q145 111 132 106Q117 101 106 109Q99 112 94 109Z','#ffe0a0','stroke="none" opacity=".87"');
  art+=p('M157 111Q172 127 164 147Q158 162 146 164L145 139Q155 131 157 111Z','#a75d2c','stroke="none" opacity=".65"');
  // A small lower cut reveals cooked pork grain, bounded by the crisp skin.
  art+=p('M85 142Q91 129 105 133Q123 138 130 153Q136 168 124 177Q108 180 94 168Q82 157 85 142Z','url(#r36-hock-cut)','stroke="#8f5c35" stroke-width="2"');
  art+=p('M92 141Q100 135 110 143Q122 150 124 161Q125 170 116 172Q104 171 95 162Q88 152 92 141Z','#f1d4a9','stroke="none"');
  art+=line('M96 143Q101 153 113 165M103 140Q110 148 118 153M94 154L102 163','#bf9a72',1.35,.9);
  art+=line('M87 119L100 120L104 128M115 106L116 115L124 120M137 112L132 124L142 132M159 144L151 153L151 165M127 171L137 175','#8b4f2b',1.55,.87);
  art+=line('M91 105L97 102M117 95L126 93M145 99L151 103M165 118L166 125M139 178L146 176','#ffdfa0',1.75,.96);
  art+=e(149,116,3.2,2,'#ffe4a5','stroke="none"');
  art+=e(104,121,2.4,1.4,'#ffdfa0','stroke="none"');
  return doc('黄金烤肘子',defs,art);
}

function smokedBrisket(){
  const defs=grad('r36-brisket-plate',['#f6f8f0','#dce5df','#acbec0'])
    +grad('r36-brisket-bark',['#875535','#603a29','#472d24'])
    +grad('r36-brisket-meat',['#c28e62','#a86e46','#885335'])
    +grad('r36-brisket-fat',['#f0d6a9','#d6b186'])
    +grad('r36-brisket-onion',['#e5c0cc','#bf8ca3','#996780']);
  let art=e(128,166,100,32,'url(#r36-brisket-plate)');
  art+=e(128,162,87,23,'#fffbed','stroke="#b1c0b9" stroke-width="1.5"');
  art+=line('M44 172Q76 191 120 191M141 191Q188 188 212 169','#fafff6',2,.95);
  // Back slice is a broad, irregular fan cut; dark bark sits on top rather than forming a ring.
  art+=p('M73 107L105 91Q111 88 119 92L156 102L176 126L169 138L147 148L91 137L68 122Z','url(#r36-brisket-meat)');
  art+=p('M73 107L105 91Q111 88 119 92L156 102L176 126L169 130L152 111L117 102L108 100L78 115Z','url(#r36-brisket-bark)','stroke="#57382a" stroke-width="1.6"');
  art+=p('M77 115L108 100L118 102L131 106L145 107L154 112L158 119L146 114L134 114L123 109L112 108L104 110L91 115L82 122Z','url(#r36-brisket-fat)','stroke="none"');
  art+=p('M78 121L104 111L118 111L132 116L146 116L163 129L147 140L96 131Z','#bb8356','stroke="none" opacity=".62"');
  art+=line('M87 121L100 129M102 115L118 133M118 117L131 136M136 121L147 134M151 123L157 129','#d1a579',1.4,.9);
  art+=line('M84 126L90 130M111 123L117 130M129 128L135 136M149 137L155 134','#805034',1.35,.86);
  art+=line('M87 106L104 98M121 99L134 103M148 107L154 110','#a8774d',1.5,.84);
  // Front slice is a wider, differently angled trapezoid with broken fat along one edge.
  art+=p('M87 144L123 128L174 137L195 157L179 177L117 181L78 161Z','url(#r36-brisket-meat)');
  art+=p('M87 144L123 128L174 137L195 157L187 160L169 146L126 138L94 153Z','url(#r36-brisket-bark)','stroke="#57382a" stroke-width="1.65"');
  art+=p('M91 151L124 136L136 139L147 139L159 143L171 145L181 154L176 157L165 151L153 149L143 145L132 145L125 142L111 147L100 154L94 157Z','url(#r36-brisket-fat)','stroke="none"');
  art+=p('M89 158L109 151L124 145L136 148L149 148L162 153L177 157L184 162L175 172L119 175Z','#bd8659','stroke="none" opacity=".62"');
  art+=line('M98 159L113 170M115 152L130 173M132 151L145 171M150 155L160 170M166 157L173 167','#d8ac7f',1.45,.91);
  art+=line('M93 162L103 169M119 158L126 167M141 160L148 171M166 171L173 168','#7e4e31',1.35,.87);
  art+=line('M99 143L116 136M136 135L150 139M166 140L174 146','#ad7b52',1.5,.84);
  // Two independent short onion pieces, with no curled ribbon repetition.
  art+=p('M53 139Q48 128 56 123L66 126Q75 135 69 143L60 146Z','url(#r36-brisket-onion)','stroke="#765163" stroke-width="1.8"');
  art+=p('M55 127L62 128Q68 134 65 139L59 140Q54 135 55 127Z','#f0d0d5','stroke="none"');
  art+=line('M56 130Q56 137 63 141','#bd8aa2',1.3,.96);
  art+=p('M194 152Q201 146 207 153L213 163L206 169Q196 169 191 161Z','url(#r36-brisket-onion)','stroke="#765163" stroke-width="1.8"');
  art+=p('M196 153Q201 151 204 156L209 162L204 165Q197 162 195 158Z','#efcbd2','stroke="none"');
  art+=line('M196 155Q197 162 205 166','#bb87a0',1.3,.96);
  return doc('烟熏牛胸肉',defs,art);
}

function roastTurkey(){
  const defs=grad('r36-turkey-board',['#e8c491','#cfa46b','#b57e49'])
    +grad('r36-turkey-skin',['#d69955','#b86e38','#8f452c'])
    +grad('r36-turkey-shine',['#e9b673','#ca8545'])
    +grad('r36-turkey-bone',['#fff8e4','#ead7b1','#c7ad85']);
  let art=p('M35 147L159 125L222 151L222 174L101 197L35 172Z','url(#r36-turkey-board)');
  art+=p('M35 147L159 125L222 151L101 175Z','#eccb9b');
  art+=line('M43 151L101 177L213 155M42 162L99 188M118 181L209 164','#ae7c48',1.35,.8);
  art+=line('M51 148L100 169L204 149','#f9dfb3',1.7,.94);
  // The same food family has a short pear silhouette; roasting is smooth red-brown, never breaded.
  art+=p('M150 108L172 89Q170 83 175 79Q181 75 186 80Q192 77 197 83Q200 90 193 94L183 94L162 116Z','url(#r36-turkey-bone)');
  art+=line('M166 104L182 89M180 81L184 84','#fffcef',1.7,.97);
  art+=p('M64 130Q61 114 76 105Q86 92 105 96Q119 91 133 104L148 106Q155 100 162 107L169 114Q172 121 162 127L150 132Q143 147 132 157Q117 171 102 166Q87 173 75 162Q61 159 59 145Q55 136 64 130Z','url(#r36-turkey-skin)');
  art+=p('M69 128Q69 113 83 109Q94 100 107 104Q119 101 131 113L143 116Q151 109 159 115Q162 119 155 122L143 127Q134 139 122 146Q107 155 94 150Q80 153 71 141Z','url(#r36-turkey-shine)','stroke="none"');
  art+=p('M77 123Q84 110 97 111Q108 106 120 114Q125 118 130 122Q115 119 104 124Q91 118 77 130Z','#edbd80','stroke="none" opacity=".85"');
  art+=line('M77 137L102 117M93 151L120 128M113 155L137 136','#75452c',1.8,.89);
  art+=line('M86 114L114 142M107 107L136 132','#93502e',1.55,.77);
  art+=line('M78 113Q85 105 96 107M105 101Q117 103 123 109M68 141L72 147M121 162L128 158','#f5cd95',1.75,.96);
  art+=p('M174 145Q182 141 188 148L185 156L175 155Z','#d65d42','stroke="#8f4636" stroke-width="1.7"');
  art+=line('M178 146L182 146','#ffb083',1.4,.95);
  art+=p('M158 164L166 158L173 163L169 171L160 171Z','#e07049','stroke="#8f4636" stroke-width="1.6"');
  art+=line('M162 163L166 162','#ffc089',1.35,.96);
  return doc('炭烤火鸡腿',defs,art);
}

function butterPorkBelly(){
  const defs=grad('r36-belly-plate',['#fff9e9','#e7e2cd','#bfc7bc'])
    +grad('r36-belly-top',['#c18145','#a25931','#78402a'])
    +grad('r36-belly-meat',['#ba754c','#985231','#7b422b'])
    +grad('r36-belly-fat',['#f9e6c2','#ebcea5','#d4ae82'])
    +grad('r36-belly-butter',['#fff1b3','#e7c47a']);
  let art=e(128,165,100,33,'url(#r36-belly-plate)');
  art+=e(128,161,87,24,'#fff9e8','stroke="#b3bca9" stroke-width="1.5"');
  art+=line('M44 172Q73 190 118 191M139 191Q190 187 212 169','#fffef3',2,.96);
  art+=p('M64 154Q76 143 95 149Q113 141 134 149Q154 142 181 150Q197 155 187 165Q167 175 146 170Q125 178 106 171Q83 176 65 165Z','url(#r36-belly-butter)','stroke="none" opacity=".58"');
  // Back-left piece: meat and warm ivory fat layers stay distinct from raw pink pork.
  art+=p('M65 122L105 105L137 120L133 149L95 166L65 149Z','url(#r36-belly-meat)');
  art+=p('M65 122L105 105L137 120L96 139Z','url(#r36-belly-top)');
  art+=p('M68 129L95 145L133 128L132 135L95 153L68 137Z','url(#r36-belly-fat)','stroke="#bd946e" stroke-width="1.3"');
  art+=p('M68 143L95 159L131 143L130 149L96 164L68 150Z','url(#r36-belly-fat)','stroke="none"');
  art+=line('M74 122L104 111M104 126L122 120','#e5b77f',1.7,.94);
  art+=line('M82 117L87 121M107 115L111 119','#703e28',1.45,.84);
  // A higher rear-right chunk is narrower and turns toward the other side.
  art+=p('M135 115L166 104L195 122L190 149L157 163L132 145Z','url(#r36-belly-meat)');
  art+=p('M135 115L166 104L195 122L159 136Z','url(#r36-belly-top)');
  art+=p('M137 122L158 142L192 129L191 136L157 149L135 130Z','url(#r36-belly-fat)','stroke="#bd946e" stroke-width="1.3"');
  art+=p('M135 137L157 156L190 143L189 150L157 162L134 145Z','url(#r36-belly-fat)','stroke="none"');
  art+=line('M143 116L165 109M165 127L183 121','#e4b77e',1.7,.94);
  art+=line('M155 112L160 117M177 115L181 119','#703e28',1.45,.84);
  // Front piece is low and broad with a bright, thin fat band across its cut face.
  art+=p('M98 150L137 134L169 151L165 175L125 188L96 171Z','url(#r36-belly-meat)');
  art+=p('M98 150L137 134L169 151L126 168Z','url(#r36-belly-top)');
  art+=p('M100 156L125 173L167 157L166 164L125 180L99 163Z','url(#r36-belly-fat)','stroke="#bd946e" stroke-width="1.3"');
  art+=p('M98 169L125 184L164 171L163 176L125 188L98 174Z','url(#r36-belly-fat)','stroke="none"');
  art+=line('M107 150L136 139M136 158L155 151','#e8bc85',1.75,.95);
  art+=line('M118 145L123 149M142 143L147 147','#703e28',1.45,.85);
  art+=e(183,168,3.3,1.7,'#fff7d2','stroke="none"');
  return doc('烟熏黄油五花',defs,art);
}

function scallionCrab(){
  const defs=grad('r36-crab-plate',['#f6fcf5','#d9e8e2','#9bbdc2'])
    +grad('r36-crab-shell',['#f5a56c','#df7a4e','#bb4e3c'])
    +grad('r36-crab-claw',['#ee9862','#d36b46','#ad4939'])
    +grad('r36-crab-leg',['#dc8051','#bb573c','#93432f']);
  let art=e(128,172,101,31,'url(#r36-crab-plate)');
  art+=e(128,168,88,23,'#fffbed','stroke="#a8beb7" stroke-width="1.5"');
  art+=line('M43 178Q74 197 119 197M140 197Q191 192 214 175','#f8fff7',2,.96);
  // Three short walking-leg pairs stay broad and tucked around the shell.
  art+=p('M88 122L65 116L54 124L59 131L70 126L87 132Z','url(#r36-crab-leg)','stroke-width="2.1"');
  art+=p('M85 136L62 138L54 150L61 154L69 146L87 145Z','url(#r36-crab-leg)','stroke-width="2.1"');
  art+=p('M91 149L76 156L69 168L76 172L84 164L98 159Z','url(#r36-crab-leg)','stroke-width="2.1"');
  art+=p('M168 123L191 117L203 126L198 133L186 127L169 133Z','url(#r36-crab-leg)','stroke-width="2.1"');
  art+=p('M171 138L194 140L202 153L195 157L186 148L169 147Z','url(#r36-crab-leg)','stroke-width="2.1"');
  art+=p('M165 150L181 159L188 171L181 174L173 165L158 160Z','url(#r36-crab-leg)','stroke-width="2.1"');
  art+=line('M65 122L69 120M62 146L67 141M78 164L82 160M190 123L194 126M191 146L195 150M178 164L182 170','#f2ae74',1.3,.9);
  // Broad, bent claw arms lead to two large pincers, with short open tips.
  art+=p('M90 117L76 106L66 106L60 115L73 128L87 129Z','url(#r36-crab-leg)','stroke-width="2.3"');
  art+=p('M165 118L180 107L191 109L196 118L181 130L167 129Z','url(#r36-crab-leg)','stroke-width="2.3"');
  art+=p('M66 111Q51 116 42 106Q36 98 41 87L48 80L56 92L62 79Q74 84 76 96Q77 106 66 111Z','url(#r36-crab-claw)');
  art+=p('M190 111Q206 117 215 106Q221 97 215 87L207 80L199 92L193 79Q181 85 180 97Q180 106 190 111Z','url(#r36-crab-claw)');
  art+=line('M56 92L56 101M199 92L199 102','#a94e37',1.65,.94);
  art+=line('M45 95Q46 105 56 106M187 94Q187 103 194 106','#ffd29a',1.8,.96);
  art+=line('M64 86L68 91M209 89L213 94','#f8bc82',1.5,.95);
  // Wide cooked carapace, gently domed with a thick front edge.
  art+=p('M79 120Q78 108 91 102Q104 94 116 98Q129 91 141 98Q155 94 168 104Q179 109 177 124L172 143Q165 157 147 162Q129 168 112 162Q94 161 84 147Z','url(#r36-crab-shell)');
  art+=p('M86 119Q88 106 101 106Q114 100 126 105Q139 99 151 105Q163 105 170 116Q161 118 152 116Q137 111 125 117Q110 111 98 118Z','#f8b67c','stroke="none"');
  art+=p('M86 135Q99 151 119 153Q142 158 168 138L166 148Q151 163 129 163Q103 164 89 149Z','#bc563e','stroke="none" opacity=".75"');
  art+=line('M92 115Q105 105 116 110M128 107Q142 103 154 110','#ffdaa4',2,.97);
  art+=line('M91 128L98 132M105 144Q117 150 129 149M142 148L153 143M161 126L166 122','#ac5138',1.45,.84);
  art+=line('M88 141L93 147M157 155L163 151','#f8b580',1.45,.93);
  art+=e(113,100,2.5,1.9,'#704334','stroke="none"');
  art+=e(143,101,2.5,1.9,'#704334','stroke="none"');
  // A few cooked scallion rings, without covering the shell shape or turning into long legs.
  art+=scallion(118,121,-17,.78)+scallion(174,166,24,.73);
  art+=scallion(95,178,-21,.75)+scallion(163,176,15,.73);
  return doc('葱香烤青蟹',defs,art);
}

export const grillMiddleCandidates=[
  {id:'dish-fresh-ico-0042',name:'炭烤鸡胸肉',svg:grilledBreast(),expectedOccupancy:.82,
    reason:'一块自然厚鸡胸搭两片斜切，白嫩熟肉纤维与金棕烤面同时可见，少量格纹和一对罗勒叶让主料清楚，摆盘不堆量。',
    design:{silhouette:'整块鸡胸与两片错开的熟肉切片，边缘自然收尖',angle:'三分之四俯视，白肉切面与烤面兼顾',material:'金棕薄皮、奶白熟肉纤维与小片罗勒',identity:'仅鸡胸肉和罗勒，不加入生肉色、酱汁或其它主料',container:'暖白浅盘，含盘约82%体量，保留透明留白'}},
  {id:'dish-fresh-ico-0045',name:'黄金烤肘子',svg:honeyHock(),expectedOccupancy:.84,
    reason:'一只桶形厚肘子托起短骨端，琥珀蜜光、细小裂纹焦皮和一处暖白熟肉切面表现饱满熟香，与细长腿肉拉开形状差异。',
    design:{silhouette:'宽厚桶形肘子与短骨桩，主体紧凑低重心',angle:'三分之四俯视，看见蜜烤皮、下侧熟肉与骨端',material:'琥珀蜂蜜薄光、棕金焦皮、浅暖熟肉和象牙骨',identity:'带骨肘子与蜂蜜，不添香草、蔬菜或额外配料',container:'灰青白陶盘，含盘约84%体量，主形饱满'}},
  {id:'dish-fresh-ico-0049',name:'烟熏牛胸肉',svg:smokedBrisket(),expectedOccupancy:.84,
    reason:'两片方向不同的厚牛肉，以深褐烟熏壳、暖棕熟切面和窄脂带表现肉纹，搭两枚独立短洋葱瓣，避免紫色长条与重复复制。',
    design:{silhouette:'仅两片厚牛肉，前后错向，脂带和熟肉切面清楚',angle:'三分之四俯视，厚切断面与深色烟熏外缘并存',material:'深褐烟熏壳、暖棕肉纤维、少量浅脂和柔紫洋葱',identity:'带骨牛排及紫洋葱，不借酒汁或香草添色',container:'灰蓝白浅盘，含盘约84%体量，配料退后'}},
  {id:'dish-fresh-ico-0053',name:'炭烤火鸡腿',svg:roastTurkey(),expectedOccupancy:.84,
    reason:'一只自然短梨形火鸡腿，左下宽厚、右上短颈接短骨柄；红棕熟皮与少量焦纹区别金黄炸腿，两小块红椒点缀。',
    design:{silhouette:'单只厚肉鼓向短骨端自然收窄，避免球形或细长怪形',angle:'三分之四俯视，短腿与紧凑骨柄一眼可辨',material:'平滑红棕烤皮、柔和暖亮反光与克制焦纹',identity:'火鸡腿及红椒，不画裹粉炸壳或添加其它主料',container:'暖木色烤板，含板约84%体量，短边与留白完整'}},
  {id:'dish-fresh-ico-0059',name:'烟熏黄油五花',svg:butterPorkBelly(),expectedOccupancy:.82,
    reason:'三块紧凑厚五花，熟红棕肉层、暖白脂带与深金焦壳分明，黄油仅以盘中少量融油薄光表现，数量克制。',
    design:{silhouette:'三块大小与朝向有别的厚五花，错落组合不堆成肉山',angle:'三分之四俯视，焦面与肉脂层侧面均清楚',material:'熟红棕肉、暖白脂带、深金焦边和融油微光',identity:'仅五花肉与黄油，无香葱、鸡蛋或配菜',container:'奶油白浅盘，含盘约82%体量，盘沿留白'}},
  {id:'dish-fresh-ico-0061',name:'葱香烤青蟹',svg:scallionCrab(),expectedOccupancy:.84,
    reason:'单只宽甲肥厚的熟青蟹，珊瑚红壳、两只大钳与三对短粗步足自然围绕，少量短葱点缀，避免细长八爪式轮廓。',
    design:{silhouette:'宽甲厚蟹身、两只显著大钳与环绕短步足，中心稳定',angle:'三分之四俯视，甲壳厚度、弯钳及短腿清楚分层',material:'熟后暖珊瑚红硬壳、浅金高光与少量短葱',identity:'青蟹与香葱，不画生青壳或夸长的章鱼式肢体',container:'青白釉浅盘，含盘约84%体量，壳钳完整且有透明留白'}}
];

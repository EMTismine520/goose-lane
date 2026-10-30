// Round 43: gel-set mango pudding and whipped mango mousse use different shapes and textures.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 搅拌机甜品新版</title><defs>${defs}</defs><g stroke="#49362d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 ${dy})">${art}</g></svg>`;

function mangoMilkPudding(){
  const defs=grad('b43-pudding-plate',['#eff7ed','#c9ded5','#91b7b0'])
    +grad('b43-pudding-body',['#ffd47e','#f5ad48','#df822f'])
    +grad('b43-pudding-top',['#ffe8a2','#ffc65c','#f2a33c'])
    +grad('b43-pudding-mango',['#ffdf75','#ffbd38','#e68e28']);
  let art=e(128,172,102,29,'url(#b43-pudding-plate)');
  art+=e(128,165,104,29,'#f9fced');
  art+=e(128,164,90,21,'#dce9d1','stroke="#afc1a2" stroke-width="1.35"');
  art+=line('M44 180Q78 195 116 194M149 194Q190 190 216 176','#fbfff1',2,.96);
  art+=e(124,163,65,16,'#b88d4b','stroke="none" opacity=".17"');
  // One low, supple pudding. Its shoulder, side and soft foot form a continuous gel body.
  art+=p('M62 123Q64 103 84 93Q103 84 126 85Q151 83 172 94Q189 103 191 123L188 147Q181 167 151 173Q127 180 100 172Q71 167 64 150Z','url(#b43-pudding-body)');
  art+=p('M64 122Q69 104 89 97Q106 90 127 91Q151 89 170 99Q184 106 189 121Q185 135 166 140Q145 146 123 144Q83 145 65 131Z','url(#b43-pudding-top)','stroke="#a66f2e" stroke-width="1.6"');
  art+=p('M71 116Q79 102 97 99Q113 95 123 98Q122 104 113 106Q90 107 81 119Q76 128 72 125Z','#fff5c5','stroke="none" opacity=".86"');
  art+=p('M69 137Q74 151 90 157Q107 164 127 161Q148 158 168 161Q179 157 184 148L181 157Q166 173 133 173Q97 175 78 158Z','#f9c86b','stroke="none" opacity=".53"');
  art+=p('M77 138Q82 144 82 150L79 153Q73 149 73 142Z','#fff2ba','stroke="none" opacity=".9"');
  art+=line('M82 103Q99 94 115 97M135 97L147 99','#fff8cf',1.8,.96);
  art+=line('M95 165Q112 171 128 169M157 166Q170 163 177 156','#ffd88c',1.6,.94);
  art+=line('M151 144Q166 144 178 137','#b97630',1.35,.83);
  // A pair of small mango wedges, not cream or an unrelated garnish.
  art+=p('M181 153L192 138Q197 135 200 141L207 156L204 165L188 166L180 161Z','url(#b43-pudding-mango)','stroke="#855424" stroke-width="2.35"');
  art+=p('M184 154L195 141L202 155L199 160L187 161Z','#ffdd6c','stroke="#d89935" stroke-width="1.2"');
  art+=line('M187 153L194 145','#fff2ac',1.7,.96);
  art+=p('M191 175L204 165Q208 163 212 168L216 177L209 184L196 183Z','url(#b43-pudding-mango)','stroke="#855424" stroke-width="2.25"');
  art+=p('M195 175L205 168L211 175L206 179L198 179Z','#ffda65','stroke="#d79830" stroke-width="1.2"');
  art+=line('M198 173L204 170','#ffefaa',1.6,.95);
  return doc('QQ芒果布丁',defs,art,-15);
}

function mangoMousseSlice(){
  const defs=grad('b43-mousse-plate',['#f7eef2','#ded3e3','#b6a9c7'])
    +grad('b43-mousse-face',['#ffe2b8','#f4c497','#e1a376'])
    +grad('b43-mousse-top',['#ffdfaa','#f6c185','#e7a667'])
    +grad('b43-mousse-fruit',['#ffdb74','#ffbb3e','#e59029']);
  let art=p('M28 159Q31 149 45 145L190 136Q212 137 229 156L228 177Q221 194 201 199L61 205Q41 204 30 189Z','url(#b43-mousse-plate)');
  art+=p('M31 158Q36 149 48 150L190 141Q209 143 224 156L220 170Q211 181 194 184L64 193Q45 190 36 179Z','#fffcf0');
  art+=p('M47 162Q52 155 64 156L184 148Q203 151 210 161L204 173Q187 181 171 180L74 188Q57 184 49 176Z','#ece0df','stroke="#c7b5bd" stroke-width="1.35"');
  art+=line('M43 190Q54 199 69 198L197 191','#fffdf6',2,.96);
  art+=p('M69 166Q100 157 145 154Q185 151 204 162L205 172Q187 184 152 185L89 188Q69 184 62 177Z','#b59274','stroke="none" opacity=".14"');
  // A single wide triangular mousse wedge, uniformly whipped all the way to its base.
  // The lower boundary is mousse, never a flour sponge or biscuit crust.
  art+=p('M62 140L199 127Q203 128 203 134L201 169Q200 177 190 179L77 188Q65 186 63 178Z','url(#b43-mousse-face)');
  art+=p('M62 140Q73 134 84 128L153 89Q158 86 164 90L195 112Q204 119 201 127Q183 135 160 139L82 149Q69 151 62 146Z','url(#b43-mousse-top)');
  art+=p('M69 139L154 95Q157 92 162 94L187 112Q193 116 193 120Q170 127 148 128L86 142Q75 145 69 142Z','#ffe3b5','stroke="none" opacity=".72"');
  // Soft, airy spreading marks are deliberately broken rather than shiny gel bands.
  art+=p('M85 134Q102 123 118 121Q135 118 147 108Q158 103 169 111Q157 109 149 116Q138 126 119 127Q98 130 88 138Z','#fff0ce','stroke="none" opacity=".75"');
  art+=p('M120 136Q140 130 156 133Q170 131 185 123Q185 130 173 133Q149 140 128 141Z','#eab17e','stroke="none" opacity=".65"');
  art+=line('M82 137Q95 129 108 128M124 122Q136 119 142 114M156 134L169 131','#b98a61',1.35,.8);
  art+=line('M76 141L84 138M114 128L120 127M152 101L157 99','#fff4d7',1.65,.94);
  art+=p('M68 154Q91 159 118 152Q144 146 172 147Q188 144 198 139L198 149Q183 157 164 156L112 162Q87 170 69 164Z','#ffdfb5','stroke="none" opacity=".55"');
  art+=line('M71 176Q80 181 90 180M174 173L189 171','#fce1b9',1.6,.92);
  // Tiny irregular air pockets and short folds convey whipped cream, without adding a cake layer.
  art+=e(81,162,1.7,1.1,'#c9936a','stroke="none"');
  art+=e(97,174,1.25,.9,'#c48d65','stroke="none"');
  art+=e(117,159,1.6,1.1,'#ca966e','stroke="none"');
  art+=e(139,169,1.4,1,'#c89167','stroke="none"');
  art+=e(166,157,1.5,.9,'#c9936c','stroke="none"');
  art+=e(183,164,1.2,.9,'#c38c64','stroke="none"');
  art+=line('M91 157L94 156M127 174L131 173M153 159L157 157M187 152L190 150','#fbe5c5',1.3,.95);
  // Two tiny mango pieces sit flat on the mousse, rather than forming a piled topping.
  art+=p('M163 109L170 102L180 107L180 116L170 120L163 116Z','url(#b43-mousse-fruit)','stroke="#8d5d30" stroke-width="2.2"');
  art+=p('M164 109L171 105L177 108L170 112Z','#ffe58b','stroke="#d49a41" stroke-width="1.2"');
  art+=line('M170 114L170 117','#ffdb71',1.3,.94);
  art+=p('M183 120L189 115L196 120L195 128L186 130L181 126Z','url(#b43-mousse-fruit)','stroke="#8d5d30" stroke-width="2.1"');
  art+=p('M184 120L189 118L193 121L187 124Z','#ffe190','stroke="#d39a42" stroke-width="1.15"');
  return doc('芒果慕斯',defs,art,-18.5);
}

export const blenderFrontCandidates=[
  {id:'dish-fresh-ico-0106',code:'DS105',name:'QQ芒果布丁',expectedOccupancy:.82,svg:mangoMilkPudding(),reason:'在保留此前已确认原版作独立对照的前提下，另绘一枚低圆凝润布丁，以Q弹曲面、橙金芒果色和少量果角表现真实主料。',design:'单枚低圆芒果奶布丁，肩部和底缘柔软连贯，轻透凝润亮面配克制高光；两小芒果角与清凉青瓷浅盘，不加奶油、饼底、其它水果或高塔层叠。'},
  {id:'dish-fresh-ico-0114',code:'DS106',name:'芒果慕斯',expectedOccupancy:.82,svg:mangoMousseSlice(),reason:'以矮宽三角切份取代原版圆柱堆层，和低圆QQ布丁在大形、色块与凝润/打发材质上清楚区分。',design:'乳桃橙色单份三角芒果慕斯，切面从顶到底均为轻柔打发慕斯，少量细气孔与自然抹纹；两小芒果肉块平放顶面，淡紫长盘，不画面粉饼胚、饼干底或重复塔层。'},
];

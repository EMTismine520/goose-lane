// Round 46: softly mixed grapefruit coconut water, and a distinctly cut coconut-shell cup.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 吧台特调新版</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function grapefruitCoconutFizz(){
  const defs=grad('r46-d120-glass',['#f4fff0','#e0e9df','#bbd0c3'])
    +grad('r46-d120-liquid',['#fff0e5','#f7dcd5','#e9c5c2'])
    +grad('r46-d120-pink',['#f8d0cb','#efb9b7','#e9a7a7'])
    +grad('r46-d120-fruit',['#ffc5b4','#ef918d','#d97275']);
  let art=e(128,196,70,9,'#6e8770','stroke="none" opacity=".11"');
  // Rounded corners and a broad, almost square opening distinguish this little glass.
  art+=p('M69 103L73 176Q73 190 85 194Q126 202 173 194Q183 190 183 177L187 103Z','url(#r46-d120-glass)','fill-opacity=".4"');
  art+=p('M78 116L82 175Q83 184 95 186Q129 191 163 186Q174 184 175 175L179 116Z','url(#r46-d120-liquid)','stroke="#c2aaa0" stroke-width="1.35" fill-opacity=".86"');
  // Soft translucent colour flows through the drink, without hard stacked layers.
  art+=p('M80 132Q99 125 116 138Q136 149 151 137Q163 130 178 132L175 175Q174 184 163 186Q129 191 95 186Q83 184 82 175Z','url(#r46-d120-pink)','stroke="none" opacity=".46"');
  art+=p('M81 144Q100 153 117 147Q134 139 151 150Q163 158 177 149L176 160Q160 170 145 160Q128 151 111 159Q96 164 82 157Z','#fff2e6','stroke="none" opacity=".3"');
  art+=p('M84 173Q98 168 111 175Q131 184 150 175Q164 169 175 174L174 179Q169 186 155 186Q128 190 98 185Q88 184 84 180Z','#f5eee0','stroke="none" opacity=".16"');
  art+=p('M84 111L168 110Q178 111 179 117Q179 123 168 126L89 125Q80 123 80 118Q79 113 84 111Z','#fff1e5','stroke="#c8b2a5" stroke-width="1.35"');
  art+=p('M87 115Q102 111 116 116Q131 122 145 116Q160 111 173 117Q163 122 149 123Q132 127 117 122Q101 117 87 121Z','#f1beb7','stroke="none" opacity=".57"');
  // Two small pieces of pale ice keep the drink light, without a mound above the cup.
  let ice=p('M-10-5L4-8L11-1L9 9L-4 10L-11 3Z','#f9fff0','fill-opacity=".74" stroke="#b3bba5" stroke-width="1.4"');
  ice+=p('M-10-5L-1-1L11-1L9 9L-4 10Z','#d7e4d5','fill-opacity=".35" stroke="none"');
  ice+=line('M-9-5L-1-1L9-1M-1-1L-3 8','#fffff6',1.4,.98);
  art+=`<g transform="translate(101 115) rotate(-14)">${ice}</g>`;
  ice=p('M-9-5L5-7L11 0L8 9L-5 10L-11 3Z','#fffdec','fill-opacity=".73" stroke="#b9b9a1" stroke-width="1.4"');
  ice+=p('M5-7L11 0L8 9L-5 10L-1 1Z','#d5e2d1','fill-opacity=".33" stroke="none"');
  ice+=line('M-9-4L-1 1L9 0M-1 1L-4 8','#fffff5',1.35,.98);
  art+=`<g transform="translate(146 116) rotate(15)">${ice}</g>`;
  // A low rounded-square lip is drawn after the ice, with four clear curved corners.
  art+=p('M82 95Q70 95 69 103L70 113Q71 121 83 123L171 124Q184 123 187 114L188 104Q187 95 175 94Z','none');
  art+=line('M78 102Q80 99 91 99L168 99M77 117Q80 120 91 120L165 121Q178 120 181 113','#fffff4',1.65,.96);
  art+=p('M75 124L79 125L83 173Q84 179 81 181L78 175Z','#fffef4','stroke="none" opacity=".66"');
  art+=line('M79 131L81 153M82 160L84 172M178 130L176 158','#fffff4',1.55,.92);
  art+=line('M87 190Q125 198 169 190','#faffef',1.65,.98);
  // A few tiny bubble rings, rather than soda foam, show the gentle sparkle.
  art+=e(107,143,1.6,1.7,'none','stroke="#ceb8aa" stroke-width="1.2"');
  art+=e(151,162,1.3,1.5,'none','stroke="#c9aaa2" stroke-width="1.2"');
  art+=e(128,174,1.1,1.25,'#fff4e6','stroke="none"');
  // One small grapefruit wedge: pink flesh, a thin pale pith, and a soft peel edge.
  let fruit=p('M-14 10Q-19-2-9-12Q3-20 16-7Q19-1 14 7L2 17Z','#ffefcc','stroke="#907455" stroke-width="2.2"');
  fruit+=p('M-14 10Q-19-2-9-12Q3-20 16-7L18-2Q8-13-1-11Q-12-8-11 3L-7 12Z','#f3b48e','stroke="none"');
  fruit+=p('M-9 7Q-13-1-6-8Q3-13 12-5L11 3L2 12Z','url(#r46-d120-fruit)','stroke="#d7847e" stroke-width="1.25"');
  fruit+=line('M-6-7L2 9M3-10L3 9M11-5L4 8','#ffe5ce',1.3,.98);
  fruit+=line('M-15-1Q-13-9-6-12','#ffe6b7',1.3,.96);
  art+=`<g transform="translate(179 97) rotate(-17)">${fruit}</g>`;
  return doc('西柚椰青气泡',defs,art);
}

function coconutPaloma(){
  const defs=grad('r46-d121-shell',['#b48658','#8e603e','#65462f'])
    +grad('r46-d121-flesh',['#fffbea','#f3e8cc','#d9c9a5'])
    +grad('r46-d121-liquid',['#fffbee','#efe9d5','#d8dbc2']);
  let art=e(128,195,73,10,'#6f7958','stroke="none" opacity=".12"');
  // The broad open cut and low half-shell body establish a bowl, not a whole coconut.
  art+=p('M49 115Q54 149 80 173Q101 190 128 191Q155 191 176 173Q201 151 207 115Z','url(#r46-d121-shell)');
  art+=p('M57 128Q68 160 93 176Q110 186 132 186Q159 184 177 170Q157 192 128 191Q101 190 80 173Q62 157 57 128Z','#62472f','stroke="none" opacity=".31"');
  // Interrupted fibres bend with the husk; they are neither a smooth bowl nor painted stripes.
  art+=line('M60 132Q68 155 90 169M74 130Q83 149 97 157M102 165L114 175','#d4aa74',1.6,.88);
  art+=line('M94 133Q99 153 112 167M123 137Q120 154 129 178M146 135Q145 152 137 173','#ba8a58',1.5,.94);
  art+=line('M169 130Q164 153 151 169M191 132Q182 153 167 164','#d0a16b',1.55,.91);
  art+=line('M68 145Q80 166 101 176M86 135Q88 147 94 153M116 149Q117 168 123 179','#69462e',1.4,.94);
  art+=line('M141 147Q143 162 134 179M161 142Q157 162 146 175M180 142L174 152','#6b472e',1.4,.94);
  art+=line('M87 163Q100 173 111 174M118 181L126 183M151 176L160 170','#d2a36c',1.35,.83);
  art+=line('M61 139L65 146M75 158L80 163M104 142L106 150M155 136L153 143M181 156L177 160','#edc28b',1.3,.71);
  // A narrow white flesh rim surrounds a flat, translucent pale coconut drink.
  art+=e(128,114,79,22,'#9a7148');
  art+=e(128,111,74,20,'url(#r46-d121-flesh)','stroke="#b79f79" stroke-width="1.4"');
  art+=e(128,111,64,13,'url(#r46-d121-liquid)','stroke="#c4c2a7" stroke-width="1.35" fill-opacity=".9"');
  art+=p('M73 110Q91 104 106 109Q122 116 140 108Q161 102 182 110Q165 107 149 114Q129 121 111 113Q92 109 73 114Z','#fffdef','stroke="none" opacity=".64"');
  art+=line('M59 111Q60 102 80 99M92 95Q112 91 131 94M150 96Q171 97 183 104','#fffdf1',1.6,.95);
  // Two modest ice cubes sit inside the opening, leaving most of the drink surface visible.
  let ice=p('M-10-5L4-8L11-1L8 9L-5 10L-11 2Z','#fbfff0','fill-opacity=".76" stroke="#aebca5" stroke-width="1.4"');
  ice+=p('M-10-5L-1-1L11-1L8 9L-5 10Z','#d4e2d2','fill-opacity=".36" stroke="none"');
  ice+=line('M-9-5L-1-1L9-1M-1-1L-4 8','#fffff5',1.35,.98);
  art+=`<g transform="translate(100 107) rotate(-13)">${ice}</g>`;
  ice=p('M-10-5L4-7L11 0L8 9L-5 10L-11 3Z','#fffef0','fill-opacity=".77" stroke="#b0bba2" stroke-width="1.4"');
  ice+=p('M4-7L11 0L8 9L-5 10L-1 1Z','#d6e3d1','fill-opacity=".33" stroke="none"');
  ice+=line('M-9-4L-1 1L9 0M-1 1L-4 8','#fffff5',1.35,.98);
  art+=`<g transform="translate(152 109) rotate(14)">${ice}</g>`;
  // Sparse small bubbles are in the liquid, with no citrus, mint, straws or thick cream.
  art+=e(124,112,1.7,1.3,'none','stroke="#b5b69a" stroke-width="1.2"');
  art+=e(137,116,1.2,1,'none','stroke="#b9b79c" stroke-width="1.2"');
  art+=e(176,110,1.4,1.1,'none','stroke="#b5b69a" stroke-width="1.2"');
  art+=line('M74 121Q95 131 123 130M138 130Q164 128 180 121','#fff7df',1.6,.95);
  return doc('椰香帕洛玛',defs,art);
}

export const barMiddleCandidates=[
  {id:'dish-fresh-ico-0135',code:'DS120',name:'西柚椰青气泡',expectedOccupancy:.84,svg:grapefruitCoconutFizz(),
    reason:'矮宽圆角方形无柄玻璃杯盛淡椰白与浅珊瑚粉自然相融的清透气泡饮，两块小透冰和一枚小西柚楔保持轻盈，四个柔和杯角形成清楚方杯大形。',
    design:{silhouette:'一只矮宽圆角方形小玻璃杯，四角柔和而清楚，无柄无杯梗，区别低桶与高窄桃粉杯',angle:'三分之四俯视，低圆角方口、轻透杯壁、两小透冰和小西柚楔可见',material:'半透明淡椰白与浅珊瑚粉柔混、窄白玻璃反光、少量细气泡和西柚粉嫩果肉',identity:'仅椰青水与西柚气泡水，以小西柚楔提示风味；不加柠檬、薄荷、其它水果或浓奶油',container:'矮宽无柄圆角方玻璃杯，两小透冰与一个小西柚楔，含杯84%体量、透明留白与视觉居中'}},
  {id:'dish-fresh-ico-0142',code:'DS121',name:'椰香帕洛玛',expectedOccupancy:.84,svg:coconutPaloma(),
    reason:'一颗明确剖开的矮小椰壳作盛器，棕褐纤维弧纹随壳面弯曲，薄白椰肉边围住清透浅奶色气泡液；两枚小透冰保留大面积平静饮面，清爽而不过厚。',
    design:{silhouette:'低而宽的剖开半椰壳、清楚椭圆开口与薄白椰肉边，不画整颗椰子或杯装冰淇淋',angle:'三分之四俯视，能看见平饮面、两小透冰、薄椰肉边与矮半壳前腹',material:'棕褐自然椰壳纤维弧纹、温白椰肉薄边、清透浅奶色气泡液与淡色小冰块',identity:'仅龙舌兰、椰子与苏打水；不加西柚、柠檬、薄荷、奶油山、其它水果或吸管',container:'剖开半椰壳自身作盛器，纤维纹理自然克制，含壳84%体量、透明留白与视觉居中'}}
];

// Round 41: three wok dishes, each drawn independently for its real ingredients.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 炒锅成品新版</title><defs>${defs}</defs><g stroke="#49342b" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -14)">${art}</g></svg>`;

function garlicSauteedShrimp(){
  const defs=grad('w41-shrimp-plate',['#edf9f6','#b7d8d9','#7dabb8'])
    +grad('w41-shrimp-shell',['#ffbd87','#f88b63','#d95c49'])
    +grad('w41-shrimp-flesh',['#ffe8cb','#ffc3a3','#ef9b83'])
    +grad('w41-shrimp-garlic',['#fff7d9','#f5dfaa','#dbbb78']);
  let art=e(128,168,103,29,'url(#w41-shrimp-plate)');
  art+=e(128,161,104,29,'#f1faf3');
  art+=e(128,160,90,21,'#d8e9de','stroke="#9ebcb4" stroke-width="1.35"');
  art+=line('M42 174Q77 190 116 190M149 190Q185 187 216 173','#f5fffa',2,.95);
  art+=e(128,160,73,15,'#c99154','stroke="none" opacity=".12"');
  // Back-left shrimp: an open crescent with individual, broad cooked shell segments.
  art+=p('M110 99Q91 78 71 91Q53 101 56 123Q58 143 79 150Q93 155 107 146L101 133Q87 141 76 129Q66 118 76 107Q85 98 98 108Z','url(#w41-shrimp-shell)');
  art+=p('M101 103L110 90Q115 85 121 90L118 100L131 101L130 113L115 114L106 109Z','#ee7057');
  art+=p('M118 100L125 105L130 103M111 95L111 103','#ffa67b','stroke="#ad4a3e" stroke-width="1.35"');
  art+=p('M98 108Q85 101 76 111Q68 120 78 130Q86 139 98 133L103 141Q89 148 76 139Q62 130 65 116Q66 104 78 99Q91 94 103 103Z','url(#w41-shrimp-flesh)','stroke="#bc6751" stroke-width="1.4"');
  art+=line('M77 94L81 102M64 105L72 110M58 119L67 119M61 132L70 129M72 144L77 136M87 150L88 141','#b85643',1.5,.94);
  art+=line('M71 100Q82 90 94 98M61 111L60 117M72 126Q75 132 80 133','#fff0ce',2,.94);
  // A smaller, tighter curl at the back right has a differently angled tail fan.
  art+=p('M180 105Q166 88 148 97Q133 105 135 123Q136 140 153 146Q168 151 179 140L171 130Q161 138 152 129Q144 121 151 112Q158 104 168 113Z','url(#w41-shrimp-shell)');
  art+=p('M168 111L178 100L190 99L189 110L199 117L192 126L181 119L175 122Z','#f07a58');
  art+=line('M181 108L184 116M190 117L185 117','#aa493b',1.35,.94);
  art+=p('M167 113Q158 108 151 116Q146 124 154 131Q161 138 170 132L175 139Q161 147 149 138Q138 131 142 118Q146 105 158 104Q166 104 172 109Z','url(#w41-shrimp-flesh)','stroke="#ba6550" stroke-width="1.35"');
  art+=line('M151 99L154 107M140 109L147 114M136 124L144 123M142 136L149 131M155 145L157 138','#b55442',1.45,.94);
  art+=line('M146 104Q155 95 163 101M140 116L140 121M152 126L156 131','#fff0cf',1.8,.94);
  // Front shrimp is broader, lower, and leans the other way; no cloned row of curls.
  art+=p('M108 147Q124 129 145 137Q166 144 166 163Q164 182 143 186Q124 190 111 177L120 166Q130 177 142 170Q153 164 146 155Q138 145 126 153Z','url(#w41-shrimp-shell)');
  art+=p('M124 151L112 143L105 135L96 140L99 149L87 151L92 163L108 160L116 160Z','#e96d53');
  art+=line('M103 141L107 151M95 154L104 154','#ac4a3c',1.35,.96);
  art+=p('M126 153Q138 148 145 157Q151 166 141 171Q130 177 121 168L115 175Q126 188 143 179Q157 173 157 162Q157 151 145 145Q134 139 123 147Z','url(#w41-shrimp-flesh)','stroke="#b8624e" stroke-width="1.4"');
  art+=line('M130 138L132 146M145 139L143 147M158 149L150 153M166 162L157 162M160 176L152 171M145 185L142 178M127 184L130 177','#b55541',1.5,.95);
  art+=line('M129 143Q138 139 147 145M160 153L161 158M124 174Q130 179 137 176','#fff0cf',1.9,.96);
  // A few toasted ivory garlic pieces, all short and separately shaped.
  art+=p('M68 157Q71 152 78 154L82 160L79 166L70 165Z','url(#w41-shrimp-garlic)','stroke="#8e6f45" stroke-width="1.45"');
  art+=line('M71 157L77 157','#fffbe7',1.6);
  art+=p('M184 145L191 143L197 149L194 156L186 157L181 152Z','url(#w41-shrimp-garlic)','stroke="#917047" stroke-width="1.4"');
  art+=line('M187 147L192 148','#fffbe7',1.5);
  art+=p('M174 170Q179 165 184 169L186 176L179 179L173 175Z','url(#w41-shrimp-garlic)','stroke="#8e6b42" stroke-width="1.4"');
  art+=p('M116 111L122 108L127 112L125 118L118 118Z','url(#w41-shrimp-garlic)','stroke="#96764b" stroke-width="1.3"');
  return doc('蒜香炒虾',defs,art);
}

function pepperPotatoJulienne(){
  const defs=grad('w41-potato-plate',['#fff8e1','#efdcad','#d0b780'])
    +grad('w41-potato-stick',['#fff1b5','#f5d27c','#d8aa50'])
    +grad('w41-potato-red',['#ffab68','#ef7251','#c8493e'])
    +grad('w41-potato-green',['#bbe075','#80b749','#568b38'])
    +grad('w41-potato-yellow',['#ffe687','#f5bd49','#d68e2c']);
  let art=e(128,165,102,31,'url(#w41-potato-plate)');
  art+=e(128,158,104,29,'#fffdf0');
  art+=e(128,158,91,22,'#e0e8c9','stroke="#a4b68a" stroke-width="1.4"');
  art+=e(128,158,82,17,'#f9f3d3','stroke="#c8c7a1" stroke-width="1.2"');
  art+=line('M43 174Q80 191 119 190M150 190Q188 186 216 171','#fffdee',2,.95);
  // Ten flat, pale-gold potato matchsticks. Their lengths, bends, and tips differ.
  const stick=(d)=>p(d,'url(#w41-potato-stick)','stroke="#765f36" stroke-width="1.8"');
  art+=stick('M62 119Q111 103 161 108L165 112Q115 109 67 125L61 124Z');
  art+=line('M69 120Q115 112 158 111','#fff9d0',1.45,.95);
  art+=stick('M77 108Q124 105 181 127L184 132Q128 113 79 114L75 112Z');
  art+=line('M83 111Q130 114 176 127','#fff9ce',1.35,.95);
  art+=stick('M94 100L99 99Q116 131 142 156L141 161L136 158Q108 131 93 105Z');
  art+=line('M99 106Q117 131 137 155','#fff6c6',1.4,.93);
  art+=stick('M56 139Q107 120 163 121L167 124L164 127Q108 125 61 145L55 143Z');
  art+=line('M65 139Q112 127 157 125','#fff8cc',1.45,.96);
  art+=stick('M69 150Q122 134 184 137L188 140L185 143Q127 139 74 156L68 155Z');
  art+=line('M77 151Q130 141 179 141','#fff8cf',1.45,.96);
  art+=stick('M107 116L112 115Q145 127 183 156L186 161L182 164Q143 134 109 123L105 119Z');
  art+=line('M114 121Q145 137 178 158','#fff6c4',1.4,.94);
  art+=stick('M63 132L68 132Q89 154 126 170L128 175L123 177Q86 160 61 138Z');
  art+=line('M70 137Q94 155 121 171','#fff8c9',1.4,.96);
  art+=stick('M94 165Q146 147 191 149L197 152L194 156Q148 153 100 171L94 170Z');
  art+=line('M102 166Q151 155 189 154','#fff8cc',1.5,.95);
  art+=stick('M75 161Q119 162 172 173L176 176L173 179Q118 168 77 168L73 166Z');
  art+=line('M81 165L168 175','#fff7c6',1.4,.95);
  art+=stick('M105 152Q127 136 155 132L160 134L159 139Q133 142 110 159L105 158Z');
  art+=line('M112 153Q135 141 153 138','#fff8cd',1.45,.95);
  // Four short pepper sections, not leaves or long repeating strips.
  art+=p('M69 111Q73 102 81 104L96 111L92 118L80 114L77 120L69 117Z','url(#w41-potato-red)','stroke="#733d2c" stroke-width="2.2"');
  art+=line('M76 108L87 111','#ffd49a',1.5,.94);
  art+=p('M163 114L180 119Q186 123 183 130L179 134L172 131L175 127L161 123Z','url(#w41-potato-yellow)','stroke="#85602c" stroke-width="2.2"');
  art+=line('M168 118L177 121','#fff0b1',1.45,.94);
  art+=p('M178 145Q183 141 189 146L198 154L197 163L191 165L189 157L179 152Z','url(#w41-potato-red)','stroke="#773c2d" stroke-width="2.2"');
  art+=line('M185 148L193 155','#ffc89a',1.5,.94);
  art+=p('M77 149Q83 145 89 147L101 153L99 161L88 156L81 157L75 155Z','url(#w41-potato-green)','stroke="#4c6a2f" stroke-width="2.2"');
  art+=line('M82 150L94 154','#d9eda1',1.45,.95);
  return doc('彩椒土豆丝',defs,`<g transform="translate(0 -5.75)">${art}</g>`);
}

function redWineBraisedRibs(){
  const defs=grad('w41-rib-plate',['#edf4ed','#c4d8d0','#87aaa8'])
    +grad('w41-rib-meat',['#ed9d6f','#ca6550','#9c413e'])
    +grad('w41-rib-glaze',['#da7b56','#bd5146','#853638'])
    +grad('w41-rib-bone',['#fff5d9','#e9d3ae','#c3a47d'])
    +grad('w41-rib-onion',['#e8b8cf','#c77eaa','#955581']);
  let art=p('M25 145Q29 131 46 126L198 123Q222 124 232 143L230 167Q225 187 203 194L57 198Q36 195 27 178Z','url(#w41-rib-plate)');
  art+=p('M27 143Q34 132 49 131L197 128Q218 130 227 143L223 157Q216 173 198 177L61 184Q43 180 33 168Z','#f9fbef');
  art+=p('M47 147Q52 137 66 136L191 135Q207 138 213 149L208 161Q197 170 182 170L73 177Q57 174 48 165Z','#d7e4cf','stroke="#acbda6" stroke-width="1.35"');
  art+=line('M40 180Q50 190 65 191L198 185','#f8fff4',2,.95);
  // A translucent wine reduction stays beneath the meat instead of becoming a dark soup.
  art+=p('M63 148Q75 135 102 138Q120 132 145 137Q176 132 194 145L198 159Q181 174 157 170Q126 179 102 173Q77 178 60 165Z','#b36a5b','stroke="none" opacity=".3"');
  // Back-left short rib: a little bone end exits the thick meat sideways.
  art+=p('M73 105L61 105Q55 106 56 111Q52 115 57 118L75 117L81 112Z','url(#w41-rib-bone)','stroke="#674d37" stroke-width="2.4"');
  art+=p('M68 96L79 89Q85 86 92 90L107 91L120 98Q130 103 127 114L124 127L113 135Q107 139 97 135L75 130L65 121Q60 111 65 104Z','url(#w41-rib-glaze)');
  art+=p('M69 100Q76 92 89 94L116 100Q126 104 121 115Q112 121 99 118L74 113Q68 110 69 100Z','url(#w41-rib-meat)','stroke="#8f493a" stroke-width="1.5"');
  art+=p('M75 100Q85 94 96 99L111 103Q112 108 105 108L87 104L76 107Z','#ffc08b','stroke="none" opacity=".72"');
  art+=line('M72 116Q81 119 88 118M96 122L111 126M118 118L116 128','#733831',1.4,.9);
  art+=line('M77 97L83 96M72 110L78 112','#ffe1ad',1.8,.94);
  // Second rib lies at an opposing angle, with one natural rounded bone cross-section.
  art+=p('M179 138L194 139Q199 142 196 147Q200 151 195 153L181 148Z','url(#w41-rib-bone)','stroke="#654b36" stroke-width="2.4"');
  art+=p('M142 99Q153 95 163 101L173 111L185 119Q193 125 191 135L185 145Q181 154 170 153L157 148L142 139Q130 133 131 122L133 110Z','url(#w41-rib-glaze)');
  art+=p('M143 104Q154 101 164 109L181 125Q188 132 181 138Q173 144 162 138L141 126Q134 120 138 111Z','url(#w41-rib-meat)','stroke="#914737" stroke-width="1.5"');
  art+=p('M145 108Q153 106 159 112L173 124L171 129Q164 128 157 121L144 115Z','#fbb27c','stroke="none" opacity=".7"');
  art+=line('M138 125Q148 129 152 135M159 141L169 147M181 137L179 146','#793831',1.4,.92);
  art+=line('M142 110L146 107M177 129L181 132','#ffe3b2',1.8,.95);
  art+=p('M184 132Q190 131 191 136Q191 142 185 142L181 139Q179 135 184 132Z','url(#w41-rib-bone)','stroke="#714936" stroke-width="1.45"');
  art+=p('M185 135Q188 135 188 138L185 140L183 138Z','#c9ab81','stroke="none"');
  // Foreground rib is broader and shorter; the bone stays low and partly embedded.
  art+=p('M80 151L69 151Q62 152 64 158Q60 163 65 166L83 165L89 158Z','url(#w41-rib-bone)','stroke="#654a35" stroke-width="2.4"');
  art+=p('M87 137Q97 132 107 136L124 135L148 141Q162 144 165 155L163 166L154 177Q145 185 134 181L111 180L95 175Q81 174 79 160Q77 146 87 137Z','url(#w41-rib-glaze)');
  art+=p('M88 142Q98 137 112 141L146 146Q157 150 157 160Q150 171 136 169L100 165Q87 162 85 154Q84 147 88 142Z','url(#w41-rib-meat)','stroke="#8b4437" stroke-width="1.5"');
  art+=p('M94 144Q103 141 116 145L140 149Q148 152 143 156Q133 157 122 152L102 150L93 151Z','#ffc28b','stroke="none" opacity=".68"');
  art+=line('M87 161L98 167M107 170Q119 168 126 173M138 174L151 171M156 159L153 169','#75362f',1.4,.92);
  art+=line('M92 143L99 142M89 153L94 157M141 149L147 152','#ffe2b1',1.8,.95);
  art+=p('M87 151Q93 148 97 153Q99 158 94 162Q88 164 85 159Q83 154 87 151Z','url(#w41-rib-bone)','stroke="#714b37" stroke-width="1.45"');
  art+=p('M89 154Q93 152 94 156L91 159L88 157Z','#c5a37a','stroke="none"');
  // Three short cooked purple-onion petals, each with its own uneven outline.
  art+=p('M65 133Q53 131 49 143Q52 154 64 152L74 145Z','url(#w41-rib-onion)','stroke="#6d4260" stroke-width="2.2"');
  art+=p('M64 137Q56 137 54 144Q58 148 64 146L69 143Z','#f4d8df','stroke="#a46a8f" stroke-width="1.2"');
  art+=p('M194 156Q207 151 211 159L209 170Q199 175 189 166Z','url(#w41-rib-onion)','stroke="#71425e" stroke-width="2.2"');
  art+=p('M196 159Q204 156 206 161L204 167L195 166Z','#f5d3da','stroke="#a56d91" stroke-width="1.2"');
  art+=p('M174 170Q180 164 186 169L193 176Q184 185 174 181L169 177Z','url(#w41-rib-onion)','stroke="#6e3e58" stroke-width="2.2"');
  art+=p('M176 173Q181 169 185 174L188 177Q181 180 176 177Z','#edc9d9','stroke="#aa6a8f" stroke-width="1.2"');
  return doc('红酒烧排骨',defs,art);
}

export const wokFrontCandidates=[
  {id:'dish-fresh-ico-0086',code:'DS91',name:'蒜香炒虾',expectedOccupancy:.82,svg:garlicSauteedShrimp(),reason:'原版两只巨虾与整蒜占据焦点，重新以三只自然弯曲熟虾和少量切蒜建立一眼可辨的蒜香炒虾。',design:'三只大小、弯向和尾扇各异的珊瑚橙红熟虾；奶桃虾肉、细分节与少量象牙蒜粒；清亮青蓝浅盘，不加绿叶。'},
  {id:'dish-fresh-ico-0099',code:'DS92',name:'彩椒土豆丝',expectedOccupancy:.82,svg:pepperPotatoJulienne(),reason:'原版粗整条不足以表现土豆丝，改为数量可数、曲度自然的淡金细丝与短彩椒片。',design:'十根独立轮廓的淡金土豆丝，四块短红、金黄和绿色彩椒；长短与叠压错落、清爽薄油光，奶白浅盘配淡绿盘心，不添香草。'},
  {id:'dish-fresh-ico-0101',code:'DS93',name:'红酒烧排骨',expectedOccupancy:.84,svg:redWineBraisedRibs(),reason:'原版高举骨柄和整齐重复肉块改为三块自然带骨短排，突出红葡萄酒薄酱与真实肉骨关系。',design:'三块宽厚短排以不同角度叠放，骨端局部侧露；明亮红棕与酒红薄釉、柔亮肉面，三枚各不相同的短紫洋葱瓣，青瓷长盘与少量酒汁，不添绿叶。'},
];

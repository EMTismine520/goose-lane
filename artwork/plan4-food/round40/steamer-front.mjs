// Round 40: four steaming dishes with separate silhouettes and restrained portions.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 蒸笼成品新版</title><defs>${defs}</defs><g stroke="#49372c" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function crystalShrimpDumplings(){
  const defs=grad('s40-dumpling-bamboo',['#f4d99b','#dfb56e','#bd8e4c'])
    +grad('s40-dumpling-skin',['#fffef4','#e9f1e6','#c8d9cf'])
    +grad('s40-dumpling-shrimp',['#ffc59d','#f29c7d','#d67b64']);
  let art=p('M35 145Q39 174 73 188Q127 207 182 189Q215 179 221 145Z','url(#s40-dumpling-bamboo)');
  art+=e(128,145,94,30,'#f8e4b5');
  art+=e(128,143,82,22,'#fff5da','stroke="#c3a06a" stroke-width="1.35"');
  art+=line('M42 158Q78 186 127 187Q177 187 214 159','#b8894e',1.4,.85);
  art+=line('M46 169Q80 192 126 193Q177 194 209 170','#fce5b5',1.8,.95);
  art+=line('M64 173L64 183M91 182L91 192M164 183L164 192M190 174L190 185','#ac8147',1.3,.8);
  // Three separately drawn crescent wrappers reveal a soft coral shrimp curl through the skin.
  art+=p('M62 120Q62 107 75 99Q90 90 105 98Q119 102 123 115L122 125Q108 139 89 139Q70 136 62 126Z','url(#s40-dumpling-skin)');
  art+=p('M75 119Q75 107 86 103Q99 99 109 111L111 120Q104 130 93 129Q84 129 80 123L86 119Q92 126 100 119Q99 111 92 111Q85 111 85 118Z','url(#s40-dumpling-shrimp)','stroke="#bf846d" stroke-width="1.3" opacity=".86"');
  art+=p('M65 117Q71 101 85 99Q104 93 117 110Q108 103 100 106Q86 101 76 116Q71 129 82 133Q68 132 65 124Z','#ffffff','stroke="none" opacity=".34"');
  art+=line('M69 111Q74 112 78 121M78 102Q84 106 85 115M90 98Q95 102 96 109M103 100Q108 104 108 111','#a2bbb1',1.35,.88);
  art+=line('M67 125Q86 143 113 128M77 106L81 104','#fffef7',1.9,.96);
  art+=line('M91 106L95 109M102 113L106 115M85 122L90 125','#ffdab5',1.2,.82);
  art+=p('M131 114Q130 100 144 94Q161 85 175 97Q184 105 182 118Q174 134 156 135Q140 133 132 123Z','url(#s40-dumpling-skin)');
  art+=p('M141 115Q140 103 152 99Q163 96 172 108L173 118Q165 128 154 125Q146 125 143 119L150 114Q155 121 163 116Q163 107 157 107Q149 107 149 114Z','url(#s40-dumpling-shrimp)','stroke="#bf846d" stroke-width="1.3" opacity=".86"');
  art+=p('M135 110Q139 96 154 94Q169 90 178 105Q168 100 162 102Q151 98 144 112Q138 124 148 130Q136 127 135 120Z','#ffffff','stroke="none" opacity=".34"');
  art+=line('M138 104Q144 105 146 114M148 95Q153 101 154 108M160 93Q166 97 167 104M172 98L176 108','#a2bbb1',1.35,.88);
  art+=line('M137 123Q153 140 174 124M146 101L150 99','#fffef7',1.9,.96);
  art+=line('M153 101L157 105M165 108L169 111M149 119L153 122','#ffdab7',1.2,.82);
  art+=p('M92 148Q92 132 106 122Q122 112 140 120Q157 125 163 139L160 151Q148 168 128 170Q106 168 95 158Z','url(#s40-dumpling-skin)');
  art+=p('M106 146Q104 133 117 128Q132 123 145 136L149 146Q140 160 126 158Q114 158 109 151L115 145Q122 154 133 148Q134 139 125 137Q115 137 115 144Z','url(#s40-dumpling-shrimp)','stroke="#bc816b" stroke-width="1.3" opacity=".9"');
  art+=p('M96 141Q101 128 117 121Q137 115 154 133Q143 128 136 130Q121 125 110 142Q103 156 116 164Q102 163 97 154Z','#ffffff','stroke="none" opacity=".33"');
  art+=line('M101 134Q108 134 111 145M112 124Q120 128 122 138M127 120Q134 125 135 133M143 123Q149 127 150 136','#9db6ac',1.4,.88);
  art+=line('M98 153Q122 178 153 154M108 130L113 127','#fffef7',2,.96);
  art+=line('M120 131L124 134M135 137L140 140M117 152L123 155','#ffdcba',1.2,.85);
  return doc('晶莹鲜虾饺',defs,art);
}

function beefRiceNoodleRolls(){
  const defs=grad('s40-roll-plate',['#eef7f1','#c9dfda','#93b9b5'])
    +grad('s40-roll-skin',['#fffef2','#f4edd8','#d8ccad'])
    +grad('s40-roll-beef',['#d89573','#b86d52','#864330']);
  let art=p('M34 148Q38 136 55 132L187 123Q207 123 219 140L218 161Q212 179 191 187L77 195Q54 194 42 178Z','url(#s40-roll-plate)');
  art+=p('M36 148Q44 138 58 137L187 129Q204 130 214 142L211 154Q202 168 186 173L79 183Q60 183 48 171Z','#fbfcf0');
  art+=p('M55 151L185 140Q197 141 203 149L200 156Q189 166 176 168L80 176Q66 174 58 166Z','#dce8d4','stroke="#abc0ab" stroke-width="1.35"');
  art+=line('M54 180Q67 188 82 187L185 177','#fffef4',2,.95);
  // Low, broad and slightly floppy rice sheets; the openings are not rigid pasta cylinders.
  art+=p('M65 117Q63 105 76 100L129 91Q139 90 144 100L147 116Q141 128 129 128L82 139Q69 140 65 130Z','url(#s40-roll-skin)');
  art+=p('M69 114Q67 105 78 103Q91 101 96 111L94 123Q86 134 76 130Q68 126 69 118Z','#fdf6e4','stroke="#9f906e" stroke-width="1.4"');
  art+=p('M74 115Q74 108 81 108Q90 108 91 116Q91 124 82 127Q76 126 74 121Z','url(#s40-roll-beef)','stroke="#8d563d" stroke-width="1.3"');
  art+=line('M77 112L81 114M80 121L85 122','#e9b38d',1.25,.92);
  art+=p('M91 105L130 97Q136 96 139 103L140 110Q128 108 111 114L94 118Z','#ffffff','stroke="none" opacity=".72"');
  art+=line('M99 124Q118 118 139 118M101 107L110 105','#fffef5',1.8,.94);
  art+=p('M122 135Q117 123 131 116L174 109Q187 108 192 118L195 133Q187 147 175 145L141 154Q126 157 122 145Z','url(#s40-roll-skin)');
  art+=p('M126 132Q124 123 135 120Q147 119 151 130L148 141Q139 151 130 145Q125 141 126 132Z','#fff8e7','stroke="#a29472" stroke-width="1.4"');
  art+=p('M131 133Q131 125 139 126Q146 127 146 134Q145 142 138 144Q132 142 131 137Z','url(#s40-roll-beef)','stroke="#8b533a" stroke-width="1.3"');
  art+=line('M135 129L139 132M135 138L140 140','#ebb692',1.25,.92);
  art+=p('M146 121L175 115Q184 115 187 122L188 128Q174 125 152 136Z','#ffffff','stroke="none" opacity=".75"');
  art+=line('M153 143Q169 138 186 138M155 124L166 122','#fffef4',1.8,.95);
  art+=p('M77 163Q73 150 86 144L145 132Q157 131 163 142L166 155Q160 168 147 169L96 182Q82 184 78 173Z','url(#s40-roll-skin)');
  art+=p('M82 160Q80 150 91 148Q105 146 110 157L108 168Q100 178 89 175Q82 170 82 163Z','#fff8e8','stroke="#9e906e" stroke-width="1.4"');
  art+=p('M87 160Q88 152 96 153Q105 154 105 162Q103 170 95 172Q88 170 87 165Z','url(#s40-roll-beef)','stroke="#895038" stroke-width="1.3"');
  art+=line('M92 157L97 159M91 166L97 168','#ebb28a',1.25,.93);
  art+=p('M104 150L145 139Q153 138 157 146L158 152Q139 149 111 164Z','#ffffff','stroke="none" opacity=".76"');
  art+=line('M113 173Q132 166 155 161M116 154L128 150','#fffef4',1.8,.95);
  // Small chopped scallion rings are the only green accents.
  art+=e(116,109,4.1,2.5,'#7eb553','stroke="#537d36" stroke-width="1.15"');
  art+=e(116,109,1.8,1,'#d7e7a2','stroke="none"');
  art+=e(171,126,4.3,2.7,'#78ad4c','stroke="#537d36" stroke-width="1.15"');
  art+=e(171,126,1.9,1.1,'#d6e5a0','stroke="none"');
  art+=e(133,154,4.2,2.5,'#7cb351','stroke="#537d36" stroke-width="1.15"');
  art+=e(133,154,1.8,1,'#d7e7a2','stroke="none"');
  art+=line('M153 148L158 146','#75a94c',2,.95);
  return doc('牛肉肠粉',defs,art);
}

function porkStuffedMushrooms(){
  const defs=grad('s40-stuffed-plate',['#fff4dc','#ead8b2','#c8ae81'])
    +grad('s40-stuffed-cap',['#b98557','#885536','#593726'])
    +grad('s40-stuffed-pork',['#efc8aa','#dda98c','#bc816b']);
  let art=e(128,164,97,30,'url(#s40-stuffed-plate)');
  art+=e(128,158,98,28,'#fff9e7');
  art+=e(128,158,84,20,'#e4d6b1','stroke="#c2ae83" stroke-width="1.35"');
  art+=line('M48 174Q80 188 114 187M148 187Q182 184 209 172','#fffef1',2.1,.94);
  // Three real mushroom caps, with natural dark curved sides and a soft cooked mince mound.
  art+=p('M60 118Q59 103 74 96Q91 89 106 100Q119 106 120 120L116 133Q108 146 91 146Q72 145 63 133Z','url(#s40-stuffed-cap)');
  art+=p('M63 114Q67 101 81 99Q99 96 111 107Q117 114 112 124Q102 136 85 132Q68 132 63 122Z','#6f482f','stroke="#523824" stroke-width="1.35"');
  art+=p('M68 113Q66 105 76 103Q78 96 88 99Q96 94 103 101Q113 102 113 112Q118 117 109 123Q99 131 86 127Q75 129 69 120Z','url(#s40-stuffed-pork)','stroke="#9f6d55" stroke-width="1.4"');
  art+=line('M74 108Q79 104 84 108M90 104Q97 100 102 106M76 118L81 121','#ffe0bd',1.7,.94);
  art+=line('M89 118L94 120M102 111L106 113','#be896a',1.3,.9);
  art+=line('M71 130L75 134M83 134L84 140M102 132L105 137','#38271e',1.25,.82);
  art+=line('M66 125Q69 137 79 139','#d3a16b',1.6,.9);
  art+=p('M132 108Q132 95 146 90Q164 84 177 96Q190 103 189 116L185 130Q175 143 158 141Q142 140 134 128Z','url(#s40-stuffed-cap)');
  art+=p('M136 105Q141 94 155 94Q171 92 182 104Q189 112 181 123Q169 134 153 128Q140 129 136 117Z','#70492f','stroke="#503724" stroke-width="1.35"');
  art+=p('M141 105Q140 98 149 98Q154 91 161 96Q169 92 176 100Q184 100 183 110Q190 116 180 121Q169 129 157 125Q145 127 141 117Z','url(#s40-stuffed-pork)','stroke="#a06e56" stroke-width="1.4"');
  art+=line('M147 103Q152 98 157 102M165 100Q171 98 177 104M148 115L154 119','#ffe0bd',1.7,.94);
  art+=line('M161 115L166 117M175 108L179 111','#bc8668',1.3,.9);
  art+=line('M145 128L149 132M158 132L158 137M174 127L177 132','#38271d',1.25,.82);
  art+=line('M135 121Q140 133 149 135','#c89764',1.6,.9);
  art+=p('M91 150Q90 135 105 126Q123 118 140 129Q154 137 154 152L150 166Q140 181 121 181Q102 180 94 167Z','url(#s40-stuffed-cap)');
  art+=p('M95 146Q100 132 117 130Q135 127 146 140Q153 149 145 160Q133 171 116 166Q101 167 95 156Z','#71492e','stroke="#513823" stroke-width="1.35"');
  art+=p('M101 145Q99 136 110 135Q114 127 124 131Q132 126 138 135Q149 135 148 145Q155 152 145 158Q133 167 120 161Q108 165 101 155Z','url(#s40-stuffed-pork)','stroke="#9e6a53" stroke-width="1.4"');
  art+=line('M107 142Q113 135 119 140M127 137Q134 134 141 141M108 154L114 158','#ffe0bc',1.8,.95);
  art+=line('M121 151L127 154M136 146L141 148','#be8869',1.3,.91);
  art+=line('M104 165L108 171M119 170L120 177M136 169L139 174','#38271d',1.25,.82);
  art+=line('M96 159Q101 173 111 175','#ce9d65',1.6,.91);
  // Finely cut scallion, never an unidentified leafy garnish.
  art+=line('M82 110L87 108M100 118L104 116M152 107L157 105M170 117L174 115M114 145L119 143M132 155L137 153','#6f9f45',2,.97);
  art+=line('M84 110L87 109M154 107L157 106M116 145L119 144','#c6df91',1.15,.96);
  return doc('香菇酿肉',defs,art);
}

function coconutMilkBalls(){
  const defs=grad('s40-coconut-bowl',['#d3e9e5','#a4ced0','#71a5af'])
    +grad('s40-coconut-ball',['#fffef5','#f7efdf','#dfceb5']);
  let art=p('M48 135Q55 179 92 193Q128 208 164 193Q201 180 208 135Z','url(#s40-coconut-bowl)');
  art+=p('M75 174Q81 188 96 192Q104 192 99 186L84 172Z','#e9f7ec','stroke="none" opacity=".85"');
  art+=e(128,135,81,27,'#f7fbef');
  art+=e(128,135,69,19,'#fff2d4','stroke="#b0c5b8" stroke-width="1.35"');
  art+=line('M52 143Q77 163 127 163Q176 164 204 143','#e9f5ed',2,.95);
  art+=line('M91 191Q127 205 165 190','#60929d',1.3,.8);
  // Three small round dumplings, with a few delicate coconut shreds and condensed-milk sheen.
  art+=p('M70 111Q67 96 80 87Q94 78 107 89Q118 98 114 113Q110 127 95 131Q79 130 72 119Z','url(#s40-coconut-ball)','stroke="#594736" stroke-width="2.6"');
  art+=p('M77 101Q81 90 91 90Q100 90 104 97Q95 94 89 101Q82 109 77 101Z','#ffffff','stroke="none" opacity=".8"');
  art+=line('M80 112L84 110M90 117L94 118M101 107L105 106','#dcccad',1.3,.87);
  art+=line('M82 100L85 102M95 95L98 97M104 116L107 114','#fffef6',1.6,.95);
  art+=p('M128 104Q127 88 142 81Q158 74 171 88Q180 99 175 113Q169 129 153 128Q137 128 130 116Z','url(#s40-coconut-ball)','stroke="#594736" stroke-width="2.6"');
  art+=p('M135 95Q140 84 151 85Q161 85 165 93Q155 89 149 96Q141 104 135 95Z','#ffffff','stroke="none" opacity=".8"');
  art+=line('M138 109L142 107M149 116L153 117M163 104L167 102','#daccad',1.3,.87);
  art+=line('M141 92L145 94M156 89L159 91M168 114L171 111','#fffef7',1.6,.95);
  art+=p('M101 145Q97 128 111 118Q126 106 142 118Q155 127 153 143Q150 161 132 166Q113 165 103 153Z','url(#s40-coconut-ball)','stroke="#594736" stroke-width="2.6"');
  art+=p('M109 133Q114 120 125 121Q136 120 141 129Q130 125 123 133Q115 141 109 133Z','#ffffff','stroke="none" opacity=".85"');
  art+=line('M111 144L115 142M123 151L128 152M138 139L142 137','#d8c9a9',1.3,.88);
  art+=line('M116 130L120 132M130 124L133 127M143 151L147 148','#fffef7',1.65,.95);
  // Small warm glossy arcs are condensed milk, not fruit or a pile of extra pieces.
  art+=line('M79 122Q86 128 94 127M141 119Q149 126 159 123M111 156Q123 167 139 158','#fff3d8',2,.94);
  return doc('椰汁奶白小丸',defs,art);
}

export const steamerFrontCandidates=[
  {id:'dish-fresh-ico-0065',code:'DS79',name:'晶莹鲜虾饺',expectedOccupancy:.82,svg:crystalShrimpDumplings(),
    reason:'三只不同朝向的弯月虾饺，薄褶皮透出珊瑚虾仁，清亮边缘与温润高光表现晶莹柔软；浅竹蒸盘承托，数量克制。',
    design:{silhouette:'三只饱满弯月饺皮，褶线、大小和朝向分别绘制',angle:'三分之四俯视，能看见透明褶皮和内部弯曲虾仁',material:'浅透米白饺皮、珊瑚熟虾和少量清亮蒸汽般高光',identity:'鲜虾与软面团，不加不明绿叶或其它馅料',container:'浅竹色蒸盘，无绿色叶垫，含盘约82%体量，细描边与透明留白'}},
  {id:'dish-fresh-ico-0070',code:'DS80',name:'牛肉肠粉',expectedOccupancy:.82,svg:beefRiceNoodleRolls(),
    reason:'三小段宽薄滑粉卷以不同长短和柔软褶边错落摆放，奶白粉皮、红褐熟牛肉切口和少量绿葱清楚区分，避免规整圆筒复制。',
    design:{silhouette:'三段低矮宽薄的滑粉卷，卷口和自然垂边各有变化',angle:'三分之四俯视，左侧开口露熟牛肉，顶部粉皮有柔软薄褶',material:'奶白湿润米粉皮、红褐熟牛肉、细小鲜绿葱圈和克制滑润高光',identity:'带骨牛排、米粉浆、香葱；牛肉为熟馅，不额外添加其它主料',container:'青白浅长盘，含盘约82%体量，粉卷与盘沿留有层次'}},
  {id:'dish-fresh-ico-0072',code:'DS81',name:'香菇酿肉',expectedOccupancy:.82,svg:porkStuffedMushrooms(),
    reason:'三枚独立深棕菇盖盛柔润浅粉棕熟肉馅，弯曲菇边、少量菌褶与细葱点保持真实香菇身份，形态和肠粉明确区分。',
    design:{silhouette:'三枚宽窄、角度不同的深棕香菇盖，熟肉馅略鼓起而不堆高',angle:'三分之四俯视，可见肉馅、自然菇盖侧壁与少量菌褶',material:'暖栗深棕熟菇、柔粉棕熟五花肉馅、细葱点与少量熟香高光',identity:'蘑菇、五花肉、香葱；按新香菇酿肉绘制，不延续旧香菇肠粉',container:'暖白浅圆盘，含盘约82%体量，三个主体错落且边界清楚'}},
  {id:'dish-fresh-ico-0073',code:'DS82',name:'椰汁奶白小丸',expectedOccupancy:.80,svg:coconutMilkBalls(),
    reason:'三枚圆润奶白小丸覆少量细椰丝，淡暖炼乳光与柔和珠白表面表现软糯；浅蓝绿甜品碗安静衬托，不堆成大量甜品或沙拉。',
    design:{silhouette:'仅三枚小圆丸，一前两后，完整圆润轮廓与饺子褶皮分开',angle:'三分之四俯视，丸子体积、椰丝与浅碗边清楚可见',material:'奶白软糯圆丸、少量细椰丝、温润炼乳薄光与轻柔阴影',identity:'椰子、糯米团、炼乳，不加水果、叶片或其它装饰主料',container:'浅蓝绿小甜品碗，含碗约80%体量，数量和高光均克制'}}
];

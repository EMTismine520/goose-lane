// Round 46: three different cold-drink silhouettes, each based on its current recipe.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0,dx=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 吧台新版候选</title><defs>${defs}</defs><g stroke="#49362f" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(${dx} ${dy})">${art}</g></svg>`;

function mulberryTequila(){
  const defs=grad('br46-berry-glass',['#f6f7ed','#d5e0da','#a7c1bd'])
    +grad('br46-berry-drink',['#f4b7cd','#da6caa','#a84083'])
    +grad('br46-berry-surface',['#f3bfd2','#dc7fae','#bd518f'])
    +grad('br46-berry-fruit',['#d67aaa','#a44d90','#783568'])
    +grad('br46-berry-ice',['#fff6fa','#e9e5ef','#c9d4df']);
  // A short stem and a full tulip bowl; this cannot read as the former orange highball.
  let art=p('M120 171L136 171L135 192Q144 198 157 199L157 205L99 205L99 199Q113 198 121 192Z','url(#br46-berry-glass)','fill-opacity=".75"');
  art+=e(128,205,41,9,'#dce7dd','fill-opacity=".83"');
  art+=e(128,202,39,7,'#f6faed','stroke="#8ca79b" stroke-width="1.35" fill-opacity=".9"');
  art+=line('M123 177L123 191M106 202Q122 206 140 203','#ffffff',1.7,.94);
  art+=p('M78 72Q59 101 63 127Q65 153 88 168Q107 182 128 182Q151 182 172 166Q192 151 194 127Q197 101 178 72Z','url(#br46-berry-glass)','fill-opacity=".5"');
  art+=e(128,72,50,15,'#fbf7ec','fill-opacity=".84"');
  art+=p('M76 94Q67 111 72 132Q76 152 96 163Q111 172 128 173Q148 173 166 160Q183 147 185 129Q188 109 179 94Z','url(#br46-berry-drink)','stroke="#9c5a83" stroke-width="1.5" fill-opacity=".9"');
  art+=e(128,94,51,15,'url(#br46-berry-surface)','stroke="#a1658a" stroke-width="1.35"');
  art+=p('M78 127Q94 136 112 132Q136 124 152 132Q167 136 182 127L177 141Q163 152 145 145Q126 137 107 146Q91 147 81 139Z','#f4b0c9','stroke="none" opacity=".39"');
  art+=line('M96 159Q111 169 125 168M154 162Q166 157 173 148','#f5b6ce',1.5,.9);
  // Two small translucent ice pieces, with separate irregular angles.
  art+=p('M89 91L103 82L118 88L115 105L100 112L89 103Z','url(#br46-berry-ice)','stroke="#87778f" stroke-width="1.95" fill-opacity=".88"');
  art+=p('M89 91L103 82L118 88L102 98Z','#fff8f5','stroke="#a293a3" stroke-width="1.2" fill-opacity=".84"');
  art+=line('M94 95L95 102M106 98L105 106','#ffffff',1.5,.94);
  art+=p('M139 96L152 89L166 97L163 111L150 116L139 108Z','url(#br46-berry-ice)','stroke="#87778f" stroke-width="1.9" fill-opacity=".85"');
  art+=p('M139 96L152 89L166 97L152 103Z','#fff8f7','stroke="#a194a4" stroke-width="1.2" fill-opacity=".83"');
  art+=line('M144 100L144 106M156 105L155 111','#ffffff',1.5,.94);
  // A small gathered pair of whole mulberries, with natural elongated drupelet outlines.
  art+=p('M168 72Q164 68 168 64Q168 58 173 58Q176 52 181 55Q186 53 189 59Q196 60 194 66Q199 71 194 76Q194 83 188 83Q186 90 181 86Q175 90 172 83Q165 82 168 77Z','url(#br46-berry-fruit)','stroke="#5e345f" stroke-width="2.1"');
  art+=line('M173 64Q177 60 180 64M182 59L185 62M173 73Q178 69 181 73M185 69Q190 68 191 72M179 81L183 79','#ec9dc5',1.4,.94);
  art+=line('M178 67L181 69M186 77L188 79','#843e7b',1.3,.9);
  art+=p('M187 87Q184 82 189 79Q193 74 197 78Q204 76 205 82Q211 85 207 91Q208 97 202 99Q200 105 194 102Q187 103 187 96Q181 92 187 87Z','url(#br46-berry-fruit)','stroke="#62345e" stroke-width="2"');
  art+=line('M191 84L195 82M197 89Q201 85 203 90M191 94L195 96','#e895bd',1.4,.92);
  // One little lemon-peel arc, without a large fruit wheel or leaves.
  art+=p('M81 79Q64 69 75 57Q84 49 95 58L93 64Q85 58 80 63Q74 69 85 73Z','#f7dc79','stroke="#907344" stroke-width="1.9"');
  art+=line('M77 61Q81 56 87 58','#fff2b7',1.3,.96);
  art+=p('M72 101L78 105Q73 125 84 142L80 147Q66 128 72 101Z','#fff6f1','stroke="none" opacity=".7"');
  art+=line('M80 151Q86 162 97 167M180 106Q186 121 180 138','#fff7f0',1.8,.94);
  art+=line('M83 74Q100 84 126 84Q151 84 169 76','#fff9f2',1.6,.94);
  return doc('桑葚龙舌兰特调',defs,art,-5.25,-5.75);
}

function grapefruitGinFizz(){
  const defs=grad('br46-grapefruit-glass',['#f8fff0','#dce8d9','#adc7bd'])
    +grad('br46-grapefruit-liquid',['#fff0d5','#f6d5c4','#eaaeb7'])
    +grad('br46-grapefruit-ice',['#fffdf2','#e8eae3','#c5d5cf'])
    +grad('br46-grapefruit-fruit',['#ffcfbd','#f3a3a3','#dc7e91']);
  // Tall, narrow and very slightly flared; no waist, handle, short barrel or stem.
  let art=p('M88 54L98 214Q99 228 128 232Q155 230 158 215L168 54Z','url(#br46-grapefruit-glass)','fill-opacity=".55"');
  art+=e(128,54,40,12,'#faffed','fill-opacity=".86"');
  art+=p('M96 72L106 210Q108 219 128 221Q148 219 150 211L160 72Z','url(#br46-grapefruit-liquid)','stroke="#b79c8b" stroke-width="1.35" fill-opacity=".83"');
  art+=e(128,72,32,10,'#fbe2cb','stroke="#c0aa92" stroke-width="1.2"');
  // Two long clear ice pieces with asymmetrical ends and fine inner reflections.
  art+=p('M104 72L115 64L127 70L129 125L118 133L107 126Z','url(#br46-grapefruit-ice)','stroke="#7e9385" stroke-width="1.9" fill-opacity=".86"');
  art+=p('M104 72L115 64L127 70L116 78Z','#fffef3','stroke="#93a493" stroke-width="1.2" fill-opacity=".9"');
  art+=line('M110 81L112 118M121 82L123 122','#ffffff',1.6,.93);
  art+=p('M135 86L146 78L157 84L154 143L143 149L133 141Z','url(#br46-grapefruit-ice)','stroke="#7c9184" stroke-width="1.85" fill-opacity=".83"');
  art+=p('M135 86L146 78L157 84L145 92Z','#fffff4','stroke="#96a795" stroke-width="1.2" fill-opacity=".86"');
  art+=line('M139 96L138 133M150 98L147 139','#ffffff',1.55,.92);
  art+=e(117,156,2.1,2.7,'#fff7df','stroke="#c09e91" stroke-width="1.1" fill-opacity=".3"');
  art+=e(136,175,2.45,2.95,'#fff6dc','stroke="#bf9d93" stroke-width="1.1" fill-opacity=".3"');
  art+=e(121,191,1.55,1.9,'#fff7e3','stroke="none" opacity=".85"');
  art+=e(145,161,1.4,1.8,'#fff9e7','stroke="none" opacity=".9"');
  // One small pink grapefruit half-wheel at the rim, not an orange or lemon garnish.
  art+=p('M151 49Q157 31 175 34Q192 37 193 56L151 49Z','#fff0cc','stroke="#957049" stroke-width="2.2"');
  art+=p('M156 47Q162 36 174 39Q185 41 188 52Z','url(#br46-grapefruit-fruit)','stroke="#d49587" stroke-width="1.25"');
  art+=line('M173 49L172 40M173 49L162 42M173 49L183 44','#ffe7d4',1.4,.96);
  art+=p('M94 81L99 83L108 204Q109 211 117 213L114 217Q103 214 102 206Z','#fffdf0','stroke="none" opacity=".57"');
  art+=line('M163 84L158 145M108 221Q126 228 145 222','#fbfff0',1.7,.94);
  art+=p('M99 213Q104 225 128 227Q150 225 157 214L156 224Q148 233 128 234Q106 232 100 225Z','url(#br46-grapefruit-glass)','stroke="#8fa999" stroke-width="1.35" fill-opacity=".85"');
  art+=line('M101 224Q123 235 149 226','#fcfff1',1.7,.96);
  art+=line('M91 55Q105 65 128 65Q149 65 163 57','#fffef1',1.7,.95);
  return doc('西柚金酒气泡',defs,art,-5,-12.5);
}

function honeyOrangeLemon(){
  const defs=grad('br46-honey-glass',['#f5ffed','#cfe3d5','#96b8ad'])
    +grad('br46-honey-liquid',['#ffdf8a','#efb455','#d98937'])
    +grad('br46-honey-flow',['#fff2a7','#f4ce63','#dca83b'])
    +grad('br46-honey-ice',['#fffef0','#e9f0d8','#c4d7c7']);
  // The open handle is transparent, and sits behind a low, wide round-bellied glass mug.
  let art=p('M176 116Q207 105 223 122Q239 142 226 164Q215 184 189 182L181 169Q202 173 213 157Q223 141 211 132Q202 125 183 133Z','url(#br46-honey-glass)','fill-opacity=".7"');
  art+=line('M196 117Q219 117 225 136M199 173Q214 172 220 159','#f9fff0',1.75,.95);
  art+=p('M43 106Q39 135 47 166Q53 191 80 201Q112 214 145 203Q172 195 180 169Q189 138 184 106Z','url(#br46-honey-glass)','fill-opacity=".53"');
  art+=e(113,106,71,23,'#f4f9e8','fill-opacity=".83"');
  art+=p('M53 116Q50 138 57 163Q64 184 86 192Q113 201 139 193Q162 186 170 163Q178 138 175 116Z','url(#br46-honey-liquid)','stroke="#ae884c" stroke-width="1.4" fill-opacity=".94"');
  art+=e(114,116,61,18,'#ffdc8a','stroke="#c49a53" stroke-width="1.25"');
  // A narrow golden honey arc is mixed through the orange slush, not a cream topping.
  art+=p('M67 139Q84 128 103 138Q116 146 130 146Q147 146 162 137L165 142Q149 154 131 153Q113 153 99 145Q82 135 70 145Z','url(#br46-honey-flow)','stroke="#d2a44e" stroke-width="1.2"');
  art+=line('M73 139Q86 134 99 141Q115 150 129 149M144 148L154 144','#fff3b5',1.5,.96);
  art+=p('M73 164L79 160L85 164L81 170L74 169Z','#ffe7a3','stroke="#d5a14b" stroke-width="1.15"');
  art+=p('M136 175L142 170L148 175L145 181L139 181Z','#ffdf8d','stroke="#d59b44" stroke-width="1.15"');
  // Low, restrained crushed ice; a few unequal pieces retain a clear cold-drink crown.
  art+=p('M65 111L69 99L82 98L88 109L81 118L70 118Z','url(#br46-honey-ice)','stroke="#7e9276" stroke-width="1.8"');
  art+=line('M71 104L79 103L83 109','#fffff4',1.5,.96);
  art+=p('M93 106L101 95L114 99L117 111L106 118L95 115Z','url(#br46-honey-ice)','stroke="#7d9174" stroke-width="1.8"');
  art+=line('M103 100L110 103L111 109','#fffef1',1.5,.96);
  art+=p('M123 113L130 103L142 105L148 115L140 123L128 122Z','url(#br46-honey-ice)','stroke="#7e9173" stroke-width="1.75"');
  art+=line('M132 108L139 110L142 115','#fffff4',1.5,.96);
  art+=p('M86 123L91 115L101 115L105 123L98 130L89 129Z','url(#br46-honey-ice)','stroke="#7e9276" stroke-width="1.7"');
  // A small lemon wedge identifies the real lemon ingredient without an extra fruit pile.
  art+=p('M158 99Q165 92 173 96L183 111L175 121L156 111Z','#f2d16a','stroke="#967041" stroke-width="2"');
  art+=p('M160 101Q166 97 171 100L177 110L173 116L160 109Z','#fff0ac','stroke="#cdaf62" stroke-width="1.2"');
  art+=line('M163 104L172 109M172 101L172 109L174 113','#d5ba76',1.2,.94);
  art+=p('M49 121L56 125Q54 154 67 174L63 179Q47 159 49 121Z','#fffdec','stroke="none" opacity=".64"');
  art+=line('M70 184Q82 193 98 195M174 128Q176 143 170 157','#fff7dc',1.8,.94);
  art+=p('M51 175Q58 196 83 204Q112 216 145 205Q165 198 175 180L173 190Q164 205 145 211Q113 223 81 211Q59 204 53 191Z','url(#br46-honey-glass)','stroke="#7e9c87" stroke-width="1.4" fill-opacity=".77"');
  art+=line('M69 201Q110 222 153 205','#faffec',1.8,.96);
  art+=line('M46 108Q59 121 78 124M149 124Q173 120 181 110','#fcfff0',1.65,.95);
  return doc('蜂蜜橙柠冰饮',defs,art,-21,-8.5);
}

export const barRefinementFrontCandidates=[
  {id:'dish-fresh-ico-0118',code:'DS117',name:'桑葚龙舌兰特调',expectedOccupancy:.84,svg:mulberryTequila(),reason:'将与橙冰苏打过近的橙色高杯更换为短脚丰满莓杯，并按当前桑葚、龙舌兰和柠檬新配方重绘，扩大杯形与色彩差异。',design:{silhouette:'低短脚丰满郁金香杯，圆润杯腹与收拢杯口，两小透冰和一小聚拢桑葚；不再使用橙色高杯',angle:'轻俯视液面、冰面与短脚杯底，完整圆腹和矮脚均清楚',material:'透亮莓紫红液与轻淡粉反光，薄透冰、清澈杯缘与少量果粒；桑葚有自然细小聚合果轮廓',palette:'活泼莓紫红、淡粉透光与小片柠檬黄，不用满黑紫或大面积橙色',ingredients:'仅龙舌兰、桑葚、柠檬；两小冰块、聚拢桑葚和一小柠檬皮弧，无薄荷或樱桃',container:'低短脚丰满郁金香杯，与高窄气泡杯、低桶杯和圆肚有柄杯区分',size:'成品84%目标体量，自包含透明SVG，留白居中、40px轮廓清楚'}},
  {id:'dish-fresh-ico-0122',code:'DS118',name:'西柚金酒气泡',expectedOccupancy:.84,svg:grapefruitGinFizz(),reason:'以无梗、微喇叭的高窄直饮杯和浅桃粉透液取代原版高脚杯，保持西柚与金酒清爽气泡辨识。',design:{silhouette:'高窄微喇叭直饮杯，无收腰、无把柄、无短梗；两块长冰与一小西柚半轮',angle:'轻俯视窄杯口，完整高杯及长冰纵向关系可辨',material:'浅桃粉清透饮料、两块长透冰、少量细泡与薄玻璃边缘反光',palette:'通透浅桃粉、微暖淡金、乳白透冰及西柚粉红果肉，不用莓紫或浓橙',ingredients:'金酒、西柚气泡水，以同身份小西柚半轮提示风味；不加薄荷、樱桃或其它水果',container:'高窄微喇叭无梗玻璃杯，区别DS117短脚莓杯、DS116低桶和DS113收腰高杯',size:'整体84%目标体量，留白与居中，40px保留窄高比例与长冰'}},
  {id:'dish-fresh-ico-0131',code:'DS119',name:'蜂蜜橙柠冰饮',expectedOccupancy:.84,svg:honeyOrangeLemon(),reason:'将蜂蜜橙柠表现为有透明把柄的矮宽圆肚冷饮杯，用温暖琥珀橙、薄金蜜流与低碎冰区分橙冰苏打高杯。',design:{silhouette:'矮宽圆肚有柄玻璃杯，开放透明把柄与低碎冰冠，不画高收腰或窄直壁杯',angle:'轻俯视宽液面与圆腹，玻璃把柄的负形和低矮杯底可见',material:'蜂蜜琥珀橙冰沙、细薄金色蜜弧流、少量碎冰和透明杯壁；小柠檬楔仅作身份提示',palette:'暖蜂蜜琥珀橙、薄金蜜流和清凉透冰，玻璃保持轻透而非奶白陶杯',ingredients:'橙子冰沙、蜂蜜、柠檬，克制碎冰与小柠檬楔，不额外加入奶油、薄荷、樱桃',container:'矮宽圆肚有柄玻璃杯，与DS113高弧杯、DS114奶白陶杯及DS116低桶杯区分',size:'整体84%目标体量、透明留白与视觉居中，40px保持矮圆肚和清楚把柄'}},
];

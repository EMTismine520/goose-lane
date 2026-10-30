// Round 38: five distinct oven dishes, native editable SVG and transparent backgrounds.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 烤箱成品新版候选</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function salmonBagel(){
  const defs=grad('r38-bagel-plate',['#fffdf0','#eae3cf','#c5bd9e'])
    +grad('r38-bagel-bread',['#f4c375','#df9e48','#b96e31'])
    +grad('r38-bagel-crumb',['#fff1c5','#efd397','#d8ac68'])
    +grad('r38-bagel-fish',['#ffa37b','#ee805a','#d35e43'])
    +grad('r38-bagel-cheese',['#fffceb','#f6e6bc','#dfc38b']);
  let art=e(128,172,99,30,'url(#r38-bagel-plate)');
  art+=e(128,168,86,22,'#fffbed','stroke="#bdbb9e" stroke-width="1.45"');
  art+=line('M45 178Q75 196 119 196M139 196Q189 191 211 175','#fffef4',2,.95);
  // Bottom ring is compact and rounded, with a visible pale bread cut.
  art+=p('M62 144Q72 124 101 120Q132 116 163 128Q183 136 191 151L187 165Q174 181 144 184Q105 189 78 173Q63 166 62 153Z','url(#r38-bagel-bread)');
  art+=p('M66 144Q83 130 106 129Q141 127 170 141Q184 148 184 155Q172 170 143 172Q107 177 81 164Q67 158 66 150Z','url(#r38-bagel-crumb)','stroke="#bf914e" stroke-width="1.5"');
  art+=line('M76 164Q109 183 151 177M164 173L176 168','#ffe2a4',1.7,.94);
  // Cheese stays creamy white; two thin folded salmon pieces form a coral middle layer.
  art+=p('M69 141Q86 130 109 133L127 129L149 139L174 137L185 149L174 158Q157 153 145 160L120 154L101 160L78 153Z','url(#r38-bagel-cheese)','stroke="#bdac7d" stroke-width="1.45"');
  art+=p('M72 138Q84 122 100 127L119 140Q130 132 141 135L147 147L132 155Q118 147 108 151Q98 146 88 146L77 152Z','url(#r38-bagel-fish)','stroke="#a6523e" stroke-width="1.75"');
  art+=p('M127 136Q140 122 154 128Q164 137 178 133L186 145L175 154Q162 147 150 155L135 148Z','url(#r38-bagel-fish)','stroke="#a6523e" stroke-width="1.7"');
  art+=line('M80 136Q87 130 94 134L110 144M141 135Q150 130 157 136L174 142','#ffd0a6',1.6,.97);
  art+=line('M91 141L96 136M154 146L161 140','#e66b4d',1.3,.94);
  // The top is a slanted bagel ring with a readable recessed hole, not a solid bun.
  art+=p('M59 117C61 99 81 87 105 86C132 82 157 94 167 112L164 127Q148 141 120 142Q87 143 67 131Q58 126 59 117Z','url(#r38-bagel-bread)');
  art+=p('M62 113C70 97 88 91 108 91C130 88 151 98 160 113Q153 127 128 131Q94 137 72 124Q62 120 62 113Z','#efb65f','stroke="#c8893c" stroke-width="1.5"');
  art+=e(113,112,17.5,10.7,'#a96b34','stroke="#88542c" stroke-width="1.6" transform="rotate(8 113 112)"');
  art+=p('M98 112Q112 104 128 114Q124 121 112 122Q101 121 98 117Z','#c28a48','stroke="none"');
  art+=line('M98 109Q112 102 126 111','#f7d296',1.55,.96);
  art+=line('M74 108Q83 99 95 98M130 97Q143 100 149 108M77 126L85 129','#ffdda0',2,.95);
  art+=line('M83 111L87 109M137 116L141 117M106 131L112 132','#bc7b35',1.3,.85);
  return doc('三文鱼贝果',defs,art);
}

function cheeseHotdog(){
  const defs=grad('r38-cheesedog-plate',['#f5fcf5','#d7e9e4','#9bbfc5'])
    +grad('r38-cheesedog-bread',['#f5c775','#e1a24e','#bb7436'])
    +grad('r38-cheesedog-crumb',['#fff1c3','#f2d69b','#dab36d'])
    +grad('r38-cheesedog-sausage',['#dd895e','#bd5e40','#98412f'])
    +grad('r38-cheesedog-cheese',['#ffe992','#ffc94a','#e4a72e']);
  let art=e(128,169,100,32,'url(#r38-cheesedog-plate)');
  art+=e(128,165,87,23,'#fffbed','stroke="#a6bfb5" stroke-width="1.45"');
  art+=line('M44 175Q75 193 119 194M140 193Q189 189 212 172','#fafff5',2,.95);
  art+=p('M54 137Q53 118 72 113Q86 108 102 113L181 132Q199 137 201 152Q203 170 184 177Q170 182 151 176L74 157Q56 153 54 137Z','url(#r38-cheesedog-bread)');
  art+=p('M63 135Q63 121 79 120L178 142Q192 145 193 156Q188 166 174 165L77 145Q64 143 63 135Z','url(#r38-cheesedog-crumb)','stroke="#c4934b" stroke-width="1.45"');
  art+=p('M64 126Q67 115 80 117L186 140Q202 144 197 156Q194 165 181 160L77 138Q62 136 64 126Z','url(#r38-cheesedog-sausage)');
  art+=line('M76 123Q80 121 88 124L177 143','#f3b082',1.8,.94);
  art+=line('M96 127L102 134M132 135L138 143M168 144L173 151','#8e3e2f',1.55,.9);
  // Front bun exposes its crumb and keeps the hotdog open, short and comfortably plump.
  art+=p('M57 141Q62 137 73 142L178 165Q190 168 195 160Q197 173 182 180Q170 184 154 180L74 162Q56 158 57 141Z','url(#r38-cheesedog-bread)');
  art+=p('M64 144L177 170Q185 171 190 167L186 173Q179 178 165 174L77 155Q68 153 64 149Z','url(#r38-cheesedog-crumb)','stroke="none"');
  // One narrow melted cheese ribbon has two small soft drips, rather than a yellow blanket.
  art+=p('M85 125L103 134L118 130L139 143L154 139L177 150L175 156L157 147L145 150L145 157Q142 162 139 156L136 150L118 138L104 141L84 132Z','url(#r38-cheesedog-cheese)','stroke="#bc852e" stroke-width="1.45"');
  art+=line('M89 127L103 136L118 133M142 145L154 142L170 151','#fff1b7',1.55,.98);
  art+=line('M72 116L79 116M80 165L89 167M159 179L168 180','#ffe0a2',1.65,.95);
  return doc('芝士热狗',defs,art);
}

function honeyCharSiu(){
  const defs=grad('r38-charsiu-plate',['#fffdf1','#e0ece2','#a6c5b5'])
    +grad('r38-charsiu-meat',['#d59a6b','#b8754f','#96503b'])
    +grad('r38-charsiu-glaze',['#cb6640','#a63f2e','#7d2d28'])
    +grad('r38-charsiu-fat',['#fff0ca','#edc99a','#d9a875']);
  let art=e(128,166,100,33,'url(#r38-charsiu-plate)');
  art+=e(128,162,87,24,'#fffbed','stroke="#a9bfae" stroke-width="1.5"');
  art+=line('M44 173Q75 192 119 192M140 192Q189 188 212 170','#fafff4',2,.96);
  // Three soft, individually cut pieces carry a thin date-red honey glaze.
  art+=p('M60 117Q64 108 76 108L100 104Q109 105 116 114L123 126Q122 135 112 138L86 137Q70 138 63 130Z','url(#r38-charsiu-meat)');
  art+=p('M60 117Q64 108 76 108L100 104Q109 105 116 114L123 126L117 129Q109 118 99 117L79 118L65 124Z','url(#r38-charsiu-glaze)','stroke="none"');
  art+=p('M70 120Q81 114 91 117L99 120L95 124Q83 118 74 126Z','url(#r38-charsiu-fat)','stroke="none"');
  art+=line('M73 124Q79 131 85 134M87 123L96 134M99 125L108 132','#e7b183',1.4,.95);
  art+=line('M71 110Q78 106 85 109M96 109L103 114','#f5bd86',1.65,.96);
  art+=p('M126 115Q129 103 142 104L166 107Q180 111 186 123L184 135Q178 143 166 141L145 137Q132 136 125 127Z','url(#r38-charsiu-meat)');
  art+=p('M126 115Q129 103 142 104L166 107Q180 111 186 123L181 128Q174 116 163 116L143 113Q134 113 130 121Z','url(#r38-charsiu-glaze)','stroke="none"');
  art+=p('M134 120Q145 112 155 116L162 121L157 125Q145 118 139 126Z','url(#r38-charsiu-fat)','stroke="none"');
  art+=line('M137 128L145 136M150 125Q155 134 162 138M166 128L175 135','#e7b084',1.4,.95);
  art+=line('M137 109Q145 104 153 108M165 109L173 114','#fac18a',1.7,.96);
  art+=p('M98 150Q105 140 118 141Q132 137 144 143L162 146Q174 150 178 160L174 170Q164 179 151 175L133 178Q116 176 105 168Q96 163 98 150Z','url(#r38-charsiu-meat)');
  art+=p('M98 150Q105 140 118 141Q132 137 144 143L162 146Q174 150 178 160L171 163Q162 152 150 153Q134 146 122 150Q108 146 102 157L98 160Z','url(#r38-charsiu-glaze)','stroke="none"');
  art+=p('M102 158Q114 149 126 153L134 157L129 161Q116 155 106 164Z','url(#r38-charsiu-fat)','stroke="none"');
  art+=p('M148 156Q156 152 165 158L170 162L165 165Q157 159 150 161Z','#f1c99a','stroke="none"');
  art+=line('M106 165L113 171M120 162Q125 170 132 173M137 161L146 171M151 167L158 173','#e9b58a',1.4,.95);
  art+=line('M108 144L115 143M132 141L139 145M159 149L166 152','#f6b37b',1.7,.96);
  art+=p('M58 150L65 145L72 150L69 158L60 158Z','#e57145','stroke="#934733" stroke-width="1.65"');
  art+=line('M61 149L65 148','#ffbd7c',1.3,.95);
  art+=p('M186 147Q194 143 198 151L195 158L185 157Z','#dd603e','stroke="#934733" stroke-width="1.65"');
  art+=line('M188 148L192 147','#ffc188',1.3,.95);
  return doc('蜜汁叉烧',defs,art);
}

function bakedHotdog(){
  const defs=grad('r38-bakedog-board',['#ead0a2','#d4ad76','#b78750'])
    +grad('r38-bakedog-bread',['#f6ce83','#e5ad58','#c88439'])
    +grad('r38-bakedog-crumb',['#fff1c4','#f3d79a','#dbb16a'])
    +grad('r38-bakedog-sausage',['#de9161','#bf6541','#9a4630']);
  let art=p('M40 160Q36 153 45 149L170 126Q181 125 190 132L220 155L220 173L91 198Q82 199 75 194L40 175Z','url(#r38-bakedog-board)');
  art+=p('M40 160Q36 153 45 149L170 126Q181 125 190 132L220 155L91 181Q82 183 75 178Z','#efd4a8');
  art+=line('M49 160L85 180L207 157M89 187L212 163','#bb905c',1.35,.82);
  art+=line('M58 152L85 170M153 133L174 130','#ffe7bc',1.7,.94);
  // A diagonal, mostly closed soft bun differs from the horizontal open cheese hotdog.
  art+=p('M78 155C74 142 82 128 96 121L147 96Q164 87 177 100Q188 111 180 125L127 166Q109 181 92 174Q79 169 78 155Z','url(#r38-bakedog-bread)');
  art+=p('M87 150Q88 137 101 131L151 106Q164 99 171 109Q174 116 166 122L119 158Q106 168 95 161Z','url(#r38-bakedog-crumb)','stroke="#c69347" stroke-width="1.5"');
  art+=p('M89 145Q91 137 101 132L154 103Q167 96 173 107Q177 115 166 121L113 154Q99 162 92 154Z','url(#r38-bakedog-sausage)');
  art+=line('M101 137L155 107Q162 103 166 107','#f6b486',1.7,.95);
  art+=line('M117 129L124 133M146 113L152 117','#91412f',1.55,.89);
  // The rounded front lip shows more golden bread than sausage, with no cheese or sauce.
  art+=p('M84 151Q89 144 99 152Q106 159 118 153L165 124Q174 118 178 121Q176 132 165 141L124 173Q112 182 99 176Q86 172 84 161Z','url(#r38-bakedog-bread)');
  art+=p('M92 155Q104 169 119 160L164 132Q168 130 171 127Q167 139 152 148L122 170Q108 178 97 169Z','url(#r38-bakedog-crumb)','stroke="none"');
  art+=line('M96 161Q105 171 114 166M133 156L140 151M155 144L162 138','#ffdfa0',1.7,.95);
  art+=line('M93 126L99 122M150 97L157 95M85 147L86 140','#ffdfa3',1.65,.95);
  return doc('烤热狗面包',defs,art);
}

function applePie(){
  const top='M61 143L155 98Q185 105 196 129Q194 145 179 160Z';
  const defs=grad('r38-applepie-plate',['#fffaf0','#eaded2','#c7b8ad'])
    +grad('r38-applepie-crust',['#f8cc79','#e5a64f','#be7734'])
    +grad('r38-applepie-apple',['#ffebba','#f2d18d','#dcad5d'])
    +grad('r38-applepie-caramel',['#e4a34b','#c47a30','#a95d29'])
    +`<clipPath id="r38-applepie-top"><path d="${top}" stroke="none"/></clipPath>`;
  let art=e(128,177,100,29,'url(#r38-applepie-plate)');
  art+=e(128,173,87,21,'#fff9ed','stroke="#c2b5a7" stroke-width="1.4"');
  art+=line('M44 183Q76 201 120 201M141 201Q190 195 212 180','#fffef5',2,.95);
  // One fan-shaped pie portion, with a curved back and one generous apple-filled cut face.
  art+=p('M61 143L155 98Q185 105 196 129L192 153Q190 167 179 181L65 165Z','url(#r38-applepie-crust)');
  art+=p('M65 147L178 163L178 176L66 161Z','url(#r38-applepie-apple)','stroke="#b68a4c" stroke-width="1.5"');
  art+=p('M70 151L84 151L91 157L87 163L73 159Z','#fff0c7','stroke="#d4b070" stroke-width="1.2"');
  art+=p('M95 153L110 155L114 163L109 167L95 163Z','#fbe4ad','stroke="#d4b070" stroke-width="1.2"');
  art+=p('M121 157L137 159L141 167L136 172L121 169Z','#ffedbd','stroke="#d4b070" stroke-width="1.2"');
  art+=p('M148 161L164 163L171 169L166 174L151 172Z','#f9dda0','stroke="#d4b070" stroke-width="1.2"');
  art+=line('M71 164L175 179','#f5c67b',1.6,.94);
  art+=p(top,'url(#r38-applepie-caramel)');
  art+=`<g clip-path="url(#r38-applepie-top)" stroke="none">`;
  art+=p('M63 129L71 124L183 153L180 162Z','url(#r38-applepie-crust)');
  art+=p('M98 109L107 105L197 128L198 138Z','url(#r38-applepie-crust)');
  art+=p('M105 154L97 150L137 99L149 97Z','url(#r38-applepie-crust)');
  art+=p('M153 162L144 159L181 111L189 116Z','url(#r38-applepie-crust)');
  art+=line('M73 127L176 153M109 108L189 129M101 149L140 101M149 157L183 115','#ffe3a3',1.7,.95);
  art+='</g>';
  // Crimped curved edge is light and airy, not a wall of solid pastry.
  art+=p('M155 98Q185 105 196 129Q194 145 179 160L175 155Q188 142 189 130Q181 112 155 105Z','url(#r38-applepie-crust)','stroke="#a16a32" stroke-width="1.8"');
  art+=line('M162 104L161 109M173 109L170 114M183 116L179 120M190 126L185 128M190 136L185 136M185 147L181 145','#bf7a33',1.45,.89);
  art+=line('M158 101Q177 106 185 118M191 131L190 136','#ffe8ad',1.8,.96);
  art+=line('M79 143L91 145M120 149L128 151M152 154L161 155','#ffe0a0',1.4,.9);
  return doc('甜苹果派',defs,art);
}

export const ovenMiddleCandidates=[
  {id:'dish-fresh-ico-0100',name:'三文鱼贝果',svg:salmonBagel(),expectedOccupancy:.82,
    reason:'一个紧凑错盖贝果，暖金环孔清楚，珊瑚橙熏鱼薄折片与奶白奶酪分层可辨；仅表现真实三种主料，不靠绿叶添色。',
    design:{silhouette:'圆润底环与向后错开的上盖，孔、鱼片和奶酪层一眼可辨',angle:'三分之四俯视，顶环与夹层同时可见',material:'烤金软面包、珊瑚橙熏鱼薄片和奶白奶酪',identity:'仅面包胚、烟熏三文鱼、奶酪，不添加生菜或番茄',container:'暖白浅盘，含盘约82%体量，夹层紧凑留白'}},
  {id:'dish-fresh-ico-0102',name:'芝士热狗',svg:cheeseHotdog(),expectedOccupancy:.82,
    reason:'一只短胖开口热狗，熟红烤肠与金黄融芝士带清楚分层；芝士仅留两处小垂边，金软面包保持充分露出。',
    design:{silhouette:'横斜短胖面包夹一根熟肠，开口宽窄自然',angle:'三分之四俯视，烤肠与少量融芝士带明显',material:'烤金软面包、红棕熟肠与明亮金黄融芝士',identity:'仅面包胚、香肠、芝士片，不画番茄、绿叶或酱瓶',container:'青白釉浅盘，含盘约82%体量，整体紧凑'}},
  {id:'dish-fresh-ico-0112',name:'蜜汁叉烧',svg:honeyCharSiu(),expectedOccupancy:.84,
    reason:'三块形态和厚薄不同的自然熟叉烧片，枣红蜜亮薄壳包裹暖赭断面，少量奶油脂带与小红椒提亮，避免硬木板与长圆香肠轮廓。',
    design:{silhouette:'三片自然软厚叉烧，前后错落且各自轮廓不同',angle:'三分之四俯视，薄蜜壳与熟切面纤维清楚',material:'深枣红蜜亮壳、暖赭熟肉和少量奶油脂带',identity:'五花肉、蜂蜜、少量红椒，不加香葱或其它配菜',container:'青白暖底浅盘，含盘约84%体量，数量控制为三片'}},
  {id:'dish-fresh-ico-0129',name:'烤热狗面包',svg:bakedHotdog(),expectedOccupancy:.82,
    reason:'单个圆润短面包沿斜向夹一根熟烤肠，较多金软面包与窄开口形成独立造型，靠切口和轻油光表现烤香，不添加芝士或酱料。',
    design:{silhouette:'向右上倾斜的短圆面包，包覆更充分，区别横向芝士热狗',angle:'三分之四俯视，面包体积与窄开口可辨',material:'烤金软面包、浅暖内瓤、红棕熟肠与克制油亮',identity:'仅面包胚、香肠，无芝士、番茄、酱料或香葱',container:'小木色烤板，含板约82%体量，构图斜向紧凑'}},
  {id:'dish-fresh-ico-0132',name:'甜苹果派',svg:applePie(),expectedOccupancy:.84,
    reason:'一份小巧扇形苹果派，金黄层酥、留有呼吸的交错酥条和暖浅苹果块切面清楚；焦糖薄光点到为止，不堆成整盘大派。',
    design:{silhouette:'单块饱满扇形派，弧形后缘与一面苹果夹心切口',angle:'三分之四俯视，格纹顶面与苹果块切面并存',material:'金黄层酥、浅暖熟苹果块与焦糖薄光',identity:'仅苹果、酥皮、焦糖，不加入额外水果或多块派',container:'淡奶白浅盘，含盘约84%体量，单份成品留白'}},
];

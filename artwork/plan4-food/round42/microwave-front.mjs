// Round 42: banana mash, eight popcorn kernels, and a compact coated-berry group.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 微波成品新版</title><defs>${defs}</defs><g stroke="#49362d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 ${dy})">${art}</g></svg>`;

function bananaMash(){
  const defs=grad('m42-banana-bowl',['#e8f4ed','#bedbd7','#7faeaf'])
    +grad('m42-banana-mash',['#fff0b4','#f3d57c','#d9ad51'])
    +grad('m42-banana-slice',['#fff6cc','#f7e5a1','#e8ca76']);
  let art=p('M27 130Q35 180 71 196Q125 219 180 196Q219 180 229 130Z','url(#m42-banana-bowl)');
  art+=p('M42 150Q58 186 91 193L108 198Q66 195 50 176Z','#eaf8eb','stroke="none" opacity=".7"');
  art+=line('M55 178Q71 191 92 195M152 200Q187 190 205 173','#659498',1.5,.8);
  art+=e(128,130,101,30,'#f2faf0');
  art+=e(128,129,88,23,'#d0c49a','stroke="#8b8262" stroke-width="1.4"');
  // A broad, spoon-smoothed surface, with no upright spiral or piped peak.
  art+=p('M42 126Q43 116 58 112Q66 99 84 101Q98 93 114 97Q133 93 149 100Q169 95 183 106Q204 109 213 125Q219 138 202 145Q174 158 131 158Q82 158 55 145Q40 138 42 126Z','url(#m42-banana-mash)');
  art+=p('M51 125Q57 112 76 112Q92 106 106 109Q128 104 147 109Q173 104 191 117Q176 115 162 119Q139 125 114 121Q91 116 73 122Q60 127 51 131Z','#fff2bc','stroke="none" opacity=".82"');
  art+=p('M63 136Q88 142 115 137Q141 132 167 135Q183 138 200 130Q191 144 168 147Q141 151 118 146Q89 151 69 143Z','#edc56b','stroke="none" opacity=".7"');
  art+=line('M56 132Q76 121 100 125Q123 131 145 124Q157 120 170 122','#b99953',1.65,.84);
  art+=line('M74 143Q99 145 119 139Q138 134 156 138M174 140Q190 139 199 133','#c5a35c',1.5,.84);
  art+=line('M58 125Q72 117 87 117M106 111Q122 108 134 112M97 148L110 146','#fff9d4',1.8,.96);
  // Two thin banana coins lie flat, with soft radial flesh and a restrained centre.
  art+=p('M146 106Q147 96 158 94Q173 94 180 105L179 112Q175 121 162 119Q151 117 146 112Z','url(#m42-banana-slice)','stroke="#8f7747" stroke-width="2.2"');
  art+=p('M148 105Q151 98 159 98Q171 99 175 106Q175 113 165 114Q154 112 148 109Z','#fff6cd','stroke="#cfb877" stroke-width="1.2"');
  art+=line('M162 101L163 106L157 108M163 106L169 108M164 107L164 111','#c6a861',1.2,.9);
  art+=e(163,106,1.3,1,'#a88a4e','stroke="none"');
  art+=p('M180 116Q182 108 193 108Q205 109 208 118L206 124Q198 131 187 125Q181 122 180 116Z','url(#m42-banana-slice)','stroke="#8e7445" stroke-width="2.1"');
  art+=p('M183 116Q188 110 195 113Q203 115 203 119Q199 125 191 121Z','#fff5cb','stroke="#cfb573" stroke-width="1.2"');
  art+=line('M194 114L193 118L189 119M193 118L198 121','#c8aa61',1.2,.9);
  art+=e(194,118,1.15,.9,'#a4894e','stroke="none"');
  // Front rim remains visible below the mash, making a generous shallow serving.
  art+=p('M29 131Q48 150 81 155Q127 164 174 154Q211 147 227 132L225 141Q209 158 175 165Q128 175 79 164Q45 157 31 141Z','#d7e8db');
  art+=line('M44 145Q79 164 126 165Q175 165 211 147','#f7fff2',2,.96);
  return doc('香蕉泥',defs,art,-24);
}

function butterPopcorn(){
  const defs=grad('m42-popcorn-cup',['#f6a17b','#e8765d','#c64f48'])
    +grad('m42-popcorn-kernel',['#fffbed','#fff0c9','#e7cc8e'])
    +grad('m42-popcorn-butter',['#ffe8a1','#ecc56a','#c49a4f']);
  // A small tapered paper cup, not a large overflowing bucket.
  let art=p('M61 126L195 126L179 205Q173 219 129 220Q84 219 77 205Z','url(#m42-popcorn-cup)');
  art+=p('M76 132L93 134L101 211Q91 208 86 203Z','#fff4db','stroke="none"');
  art+=p('M110 136L129 137L130 216Q119 216 112 214Z','#fff2d5','stroke="none"');
  art+=p('M148 136L166 134L158 213Q149 216 141 215Z','#fff4dd','stroke="none"');
  art+=p('M182 132L192 130L177 204Q172 209 168 209Z','#ffeace','stroke="none"');
  art+=line('M82 204Q102 214 128 214Q158 214 176 202','#ad4d43',1.4,.74);
  art+=e(128,126,67,19,'#f9dca1');
  art+=e(128,126,58,13,'#c4934f','stroke="#8b6038" stroke-width="1.3"');
  // Eight separately designed blossoms, with different asymmetry and kernel folds.
  art+=p('M74 98Q64 97 64 87Q65 79 75 79Q76 68 87 69Q97 68 99 79Q111 78 114 88Q116 98 105 103Q107 114 95 116Q85 119 81 108Q72 108 74 98Z','url(#m42-popcorn-kernel)');
  art+=p('M80 86Q87 83 92 89L91 97L84 99L80 94Z','#f3dba6','stroke="none"');
  art+=line('M76 83Q80 86 83 88M92 88L99 86M88 99L90 106','#b99457',1.4,.9);
  art+=line('M80 75L86 74M70 89L72 93','#fffef6',1.8,.95);
  art+=p('M109 77Q100 70 104 61Q110 52 119 58Q124 48 135 53Q143 55 141 66Q153 69 150 80Q147 91 136 89Q132 100 122 94Q112 93 114 83Z','url(#m42-popcorn-kernel)');
  art+=p('M118 69L126 65L133 73L129 82L121 80Z','#f2d69b','stroke="none"');
  art+=line('M119 66L124 71M132 72L138 73M124 80L121 85','#b99355',1.4,.92);
  art+=line('M114 61L118 62M130 57L134 58','#fffef5',1.75,.94);
  art+=p('M149 88Q141 81 147 72Q154 66 162 72Q168 63 178 69Q186 76 181 84Q194 85 194 96Q193 108 180 108Q177 117 167 114Q157 115 157 105Q146 104 149 94Z','url(#m42-popcorn-kernel)');
  art+=p('M162 83Q170 79 175 87L173 95L165 98L160 92Z','#eed09a','stroke="none"');
  art+=line('M157 79L163 85M175 88L182 89M169 96L171 103','#ba9456',1.4,.92);
  art+=line('M169 72L175 73M184 95L188 96','#fffef4',1.8,.96);
  art+=p('M64 115Q54 112 55 103Q56 94 67 95Q71 86 80 90Q90 94 86 105Q97 108 92 119Q89 128 79 126Q74 136 65 130Q58 126 64 115Z','url(#m42-popcorn-kernel)');
  art+=p('M68 103L76 103L80 111L72 118L66 113Z','#f5dca2','stroke="none"');
  art+=line('M65 101L70 107M77 110L82 113M69 116L68 123','#b38f55',1.4,.9);
  art+=p('M95 118Q88 109 96 102Q101 95 109 102Q116 92 126 98Q136 104 130 115Q141 119 134 129Q129 137 119 132Q111 143 101 135Q95 132 98 124Z','url(#m42-popcorn-kernel)');
  art+=p('M108 110Q115 106 121 112L120 121L112 124L105 118Z','url(#m42-popcorn-butter)','stroke="none" opacity=".83"');
  art+=line('M103 107L109 113M121 112L126 113M112 123L110 129','#ae874c',1.4,.94);
  art+=line('M111 102L116 101M99 117L100 121','#fffef4',1.75,.94);
  art+=p('M140 119Q133 111 139 104Q145 97 153 103Q160 94 169 101Q177 108 170 116Q182 120 177 129Q172 139 162 134Q154 144 146 137Q138 136 140 126Z','url(#m42-popcorn-kernel)');
  art+=p('M149 112L158 109L164 117L159 125L151 122Z','#f2d69a','stroke="none"');
  art+=line('M146 108L151 114M162 116L168 119M155 123L152 130','#b48c50',1.4,.92);
  art+=line('M154 104L159 102M172 125L171 129','#fffef5',1.75,.96);
  art+=p('M178 119Q172 111 178 104Q184 96 193 103Q201 100 206 107Q213 117 202 122Q209 132 201 137Q192 144 185 135Q174 136 174 127Z','url(#m42-popcorn-kernel)');
  art+=p('M184 114L191 110L198 117L193 125L185 123Z','url(#m42-popcorn-butter)','stroke="none" opacity=".72"');
  art+=line('M181 111L186 116M197 118L201 117M189 124L189 130','#b18c50',1.4,.92);
  art+=p('M111 145Q100 142 103 132Q105 122 116 124Q121 114 131 119Q140 117 146 126Q155 128 154 138Q152 148 141 148Q137 159 126 154Q116 160 112 151Z','url(#m42-popcorn-kernel)');
  art+=p('M118 134Q125 128 132 132L137 139L130 146L121 143Z','url(#m42-popcorn-butter)','stroke="none" opacity=".77"');
  art+=line('M116 129L121 135M134 134L141 132M129 144L126 149','#b28a4d',1.4,.94);
  art+=line('M121 125L126 123M108 136L111 139M144 142L148 139','#fffef7',1.8,.96);
  return doc('爆米花',defs,`<g transform="translate(-3.875 0)">${art}</g>`,-7.75);
}

function chocolateBlueberries(){
  const defs=grad('m42-berry-plate',['#fff7df','#ead8b3','#c9ae86'])
    +grad('m42-berry-chocolate',['#b87947','#7b442c','#472820'])
    +grad('m42-berry-cut',['#d0b2e3','#9e8bc5','#625a97']);
  let art=e(128,173,102,29,'url(#m42-berry-plate)');
  art+=e(128,166,104,29,'#fffced');
  art+=e(128,165,90,22,'#e8e1c9','stroke="#b9ad8e" stroke-width="1.35"');
  art+=line('M44 180Q77 196 116 195M150 195Q188 191 216 177','#fffef0',2,.96);
  art+=e(128,165,69,13,'#73583e','stroke="none" opacity=".13"');
  // Three whole berries: thin chocolate coats follow a soft, slightly uneven berry shape.
  art+=p('M122 85Q136 77 150 86Q163 95 158 111Q157 124 141 130Q124 135 113 122Q102 111 108 98Q112 88 122 85Z','url(#m42-berry-chocolate)');
  art+=p('M115 98Q122 87 135 88Q143 88 146 93Q139 99 130 98Q122 98 117 104Z','#e1a36a','stroke="none" opacity=".86"');
  art+=line('M119 94L125 91M113 107L114 113','#ffddb1',1.9,.94);
  art+=line('M143 120Q151 116 153 108','#351e1b',1.4,.84);
  // The small natural five-point calyx remains visible through the light coating.
  art+=p('M144 83L147 87L152 87L150 91L152 95L146 95L142 98L141 92L137 90L141 87Z','#51425c','stroke="#382c3a" stroke-width="1.35"');
  art+=e(145,91,2.3,1.6,'#8e7a9e','stroke="none"');
  art+=p('M73 119Q85 110 100 118Q115 126 113 143Q110 158 94 162Q78 166 66 154Q56 141 62 130Q65 123 73 119Z','url(#m42-berry-chocolate)');
  art+=p('M66 132Q70 121 83 121Q92 121 94 126Q89 132 78 132L69 138Z','#e5ac73','stroke="none" opacity=".8"');
  art+=line('M71 126L77 124M64 140L66 145','#ffdfb6',1.9,.95);
  art+=line('M93 153Q103 149 105 141','#321e1a',1.4,.82);
  art+=p('M62 132L67 131L68 126L72 130L76 131L73 135L74 140L68 138L64 141L64 136Z','#4b3b54','stroke="#342a39" stroke-width="1.3"');
  art+=e(68,134,1.8,1.5,'#8c769d','stroke="none"');
  art+=p('M166 117Q182 111 194 122Q204 133 199 148Q195 164 179 166Q163 168 153 155Q144 143 150 130Q155 122 166 117Z','url(#m42-berry-chocolate)');
  art+=p('M155 133Q163 120 176 122Q185 123 186 128Q178 134 168 133L157 140Z','#dba06b','stroke="none" opacity=".82"');
  art+=line('M160 127L166 125M151 142L153 148','#ffe0b6',1.85,.94);
  art+=line('M181 157Q191 153 193 145','#321e1b',1.4,.86);
  art+=p('M193 136L198 137L201 133L202 139L206 142L201 145L200 150L196 146L191 146L193 141Z','#51405a','stroke="#352a39" stroke-width="1.3"');
  art+=e(198,141,1.8,1.6,'#927d9e','stroke="none"');
  // A single lightly cut berry reveals a blue-purple centre and a crisp, narrow shell edge.
  art+=p('M106 153Q118 142 134 146Q150 145 157 158L155 173Q148 185 131 186Q113 186 103 175Q98 162 106 153Z','url(#m42-berry-chocolate)');
  art+=p('M108 153Q117 145 132 149Q147 147 153 158Q154 168 144 173Q129 179 115 172Q103 168 105 159Z','#5a342b','stroke="#402b26" stroke-width="1.5"');
  art+=p('M112 155Q122 150 133 153Q144 151 149 159Q149 167 139 171Q126 175 115 168Q108 165 109 160Z','url(#m42-berry-cut)','stroke="#50446e" stroke-width="1.4"');
  art+=p('M121 156Q130 153 140 158L140 163L130 167L119 164Z','#c4b2da','stroke="none" opacity=".7"');
  art+=line('M119 156L126 160L122 167M126 160L135 159L141 164M126 160L132 169','#7770a8',1.2,.9);
  art+=e(125,160,1.4,1.1,'#efe0ee','stroke="none"');
  art+=e(134,163,1.25,1,'#e9d8eb','stroke="none"');
  art+=e(120,164,1.1,.9,'#ded0e7','stroke="none"');
  art+=line('M108 155L112 153M145 151L148 153M108 174L113 177','#e4b078',1.5,.94);
  return doc('巧克力脆皮蓝莓',defs,art,-13);
}

export const microwaveFrontCandidates=[
  {id:'dish-fresh-ico-0014',code:'DS98',name:'香蕉泥',expectedOccupancy:.80,svg:bananaMash(),reason:'以低而宽的柔润刮拌面替代原版竖起尖峰，让香蕉泥像真实一份甜品，并与螺旋奶油或冰淇淋区分。',design:'清凉青瓷小甜品碗盛淡金香蕉泥，少量自然刮拌纹和两片薄香蕉片；表面低平蓬润，不堆三层螺旋，不添奶油、果酱或其它配料。'},
  {id:'dish-fresh-ico-0015',code:'DS99',name:'爆米花',expectedOccupancy:.82,svg:butterPopcorn(),reason:'将爆米花明确控制为八枚独立绽开的白金玉米花，强化小纸杯轮廓与轻黄油质感，避免无数颗粒堆成团。',design:'八枚各自绘制、瓣形和折痕不重复的白金爆米花，少量浅金黄油光；小号珊瑚红与奶白条纹纸杯，数量克制、展开自然，不画整齐圆球。'},
  {id:'dish-fresh-ico-0019',code:'DS100',name:'巧克力脆皮蓝莓',expectedOccupancy:.80,svg:chocolateBlueberries(),reason:'原版棕色圆球难以辨识蓝莓，改为三整一切的紧凑小组，用轻薄巧克力壳、细小莓冠和蓝紫切面共同说明主料。',design:'三颗自然略不规则的亮润深巧克力裹莓加一颗轻切莓，蓝紫果肉与薄脆壳边清楚、完整颗保留微小莓冠；奶白浅盘安静托起主体，不加其它配料。'},
];

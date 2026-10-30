// Round 40: four steamed dishes, with soft cooked materials and restrained portions.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.5,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 蒸制成品新版候选</title><defs>${defs}</defs><g transform="translate(0 ${dy})" stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function custardBuns(){
  const defs=grad('r40-custard-plate',['#fbfcf2','#ddebe0','#aec9be'])
    +grad('r40-custard-dough',['#fff6d5','#f7e6b4','#dfc691'])
    +grad('r40-custard-cut',['#fffbe7','#f9edc8','#e9d5a6'])
    +grad('r40-custard-lava',['#ffe7a0','#f3c348','#df9c26']);
  let art=e(128,160,99,31,'url(#r40-custard-plate)');
  art+=e(128,156,86,23,'#fdfff3','stroke="#abc2ae" stroke-width="1.4"');
  art+=line('M46 168Q79 188 121 187M140 187Q183 184 210 165','#fcfff5',1.85,.98);
  // One intact, softly steamed bun. Its surface is pale, not a fried brown shell.
  art+=p('M55 119C54 100 67 82 85 79C106 73 124 86 130 105Q138 127 121 141Q108 152 86 149Q67 149 59 136Z','url(#r40-custard-dough)');
  art+=p('M64 110Q66 91 83 87Q100 81 113 95Q101 90 91 96Q77 94 68 112Z','#fffbe0','stroke="none" opacity=".86"');
  art+=line('M67 102Q71 91 82 88M94 83Q104 84 111 91','#fffdef',1.75,.98);
  art+=line('M66 134Q72 143 83 144M100 145Q113 144 119 136','#c9b285',1.4,.86);
  // A single split bun sits in front: jagged soft crumb embraces the flowing yellow centre.
  art+=p('M111 124Q114 107 133 101Q151 94 169 104Q188 110 194 127Q201 146 186 158Q172 171 150 171Q128 171 115 157Q105 144 111 124Z','url(#r40-custard-dough)');
  art+=p('M120 124L128 116L134 119L141 112L149 116L156 111L163 118L173 116L180 125L187 130L184 144L176 157L164 161L154 158L143 162L131 156L122 146L116 136Z','url(#r40-custard-cut)','stroke="#c0a77b" stroke-width="1.65"');
  art+=p('M128 126L134 121L140 125L147 119L155 123L162 119L168 125L176 124L181 132Q186 140 177 149L171 153L163 150Q160 153 161 159Q158 165 152 163Q146 161 147 154L138 153L130 146L123 137Z','url(#r40-custard-lava)','stroke="#c18c2c" stroke-width="1.5"');
  art+=p('M130 128L137 126L143 130L149 124L157 128L162 124L169 130L176 129Q181 134 176 139Q165 134 156 139Q143 134 131 139L126 136Z','#ffe7a0','stroke="none" opacity=".85"');
  art+=line('M131 129L136 128M147 125L152 127M164 126L169 129M153 155L154 159','#fff5c3',1.6,.98);
  art+=line('M122 127L126 123M133 118L138 121M171 119L175 124M124 145L129 150M176 156L180 151','#fffdf0',1.55,.98);
  art+=line('M118 155Q125 165 138 167M176 165L183 161','#d4bd91',1.35,.9);
  return doc('流沙奶黄包',defs,art,-7);
}

function caramelSponge(){
  const defs=grad('r40-sponge-plate',['#fcfaf0','#e7e3ce','#bcc1aa'])
    +grad('r40-sponge-top',['#efc38a','#dbab70','#bc8850'])
    +grad('r40-sponge-front',['#e7bb80','#cda06a','#ad7b47'])
    +grad('r40-sponge-side',['#d6a46c','#b4824d','#94683d'])
    +grad('r40-sponge-glow',['#f5c779','#dba15a']);
  let art=e(128,165,99,30,'url(#r40-sponge-plate)');
  art+=e(128,161,86,22,'#fffff1','stroke="#b4bfa0" stroke-width="1.4"');
  art+=line('M46 173Q82 191 121 190M141 190Q185 187 210 170','#fffef4',1.8,.98);
  // Taller rear block: domed steamed top and porous cut sides, without toast crust borders.
  art+=p('M85 111Q83 106 90 102L133 88Q140 84 147 89L178 103Q184 106 181 114L176 141Q174 147 166 150L132 165Q128 168 122 164L90 149Q83 147 85 139Z','url(#r40-sponge-side)');
  art+=p('M85 110Q89 102 98 103L132 89Q140 84 147 89L177 102Q185 107 178 112L131 134Z','url(#r40-sponge-top)');
  art+=p('M87 115L128 136L128 159L88 141Z','url(#r40-sponge-front)','stroke="#ac7e4c" stroke-width="1.5"');
  art+=p('M132 136L179 114L174 141L132 159Z','#d6ac76','stroke="#ab8051" stroke-width="1.5"');
  art+=p('M99 107L132 94Q141 90 148 95L170 105Q154 108 144 114Q129 112 117 119L101 113Z','url(#r40-sponge-glow)','stroke="none" opacity=".43"');
  art+=line('M99 106L132 93M142 93L151 97M137 118L154 111','#f9deaa',1.7,.97);
  art+=e(99,126,2.3,1.6,'#a67946','stroke="none" transform="rotate(20 99 126)"');
  art+=e(113,137,2.1,1.7,'#a67946','stroke="none"');
  art+=e(104,139,1.4,1.1,'#ad814d','stroke="none"');
  art+=e(119,147,1.7,1.4,'#9f7443','stroke="none"');
  art+=e(145,140,2.1,1.5,'#a27a49','stroke="none" transform="rotate(-22 145 140)"');
  art+=e(163,127,2,1.4,'#a27a49','stroke="none"');
  art+=e(158,140,1.3,1,'#aa8050','stroke="none"');
  art+=p('M107 125Q109 122 112 125L111 128L108 128Z','#a77945','stroke="none"');
  art+=p('M151 129Q154 126 157 128L156 131L152 132Z','#a17a49','stroke="none"');
  art+=p('M163 135Q166 133 168 135L167 138L164 138Z','#aa8050','stroke="none"');
  art+=line('M95 130L97 128M111 141L113 139M143 144L145 143M160 132L162 131','#f0d3a0',1.2,.92);
  // Shorter front piece has a rounder, uneven edge and a lower top plane.
  art+=p('M53 143Q53 138 60 135L91 124Q97 123 103 128L126 142L123 166Q111 179 90 181L57 164Z','url(#r40-sponge-side)');
  art+=p('M54 140Q58 134 66 136L91 126Q97 124 104 130L123 141Q127 146 121 149L89 162L58 149Z','url(#r40-sponge-top)');
  art+=p('M57 150L87 164L88 176L59 161Z','url(#r40-sponge-front)','stroke="#aa7d49" stroke-width="1.5"');
  art+=p('M92 163L123 151L120 163Q109 175 92 176Z','#dcb17a','stroke="#aa7d49" stroke-width="1.5"');
  art+=p('M65 140L91 131Q96 130 101 134L113 142L90 151Q78 146 65 146Z','url(#r40-sponge-glow)','stroke="none" opacity=".42"');
  art+=line('M65 140L89 131M97 132L104 136M98 153L109 148','#fbe0ac',1.65,.98);
  art+=e(67,157,1.9,1.4,'#a77a45','stroke="none"');
  art+=e(79,164,1.45,1.1,'#ac7e49','stroke="none"');
  art+=e(101,166,2,1.45,'#a77d48','stroke="none"');
  art+=e(113,159,1.3,1,'#ad814c','stroke="none"');
  art+=line('M64 159L66 157M98 169L100 167','#efd19c',1.2,.92);
  return doc('焦糖马拉糕',defs,art,-9);
}

function turkeyStickyRice(){
  const defs=grad('r40-sticky-bowl',['#f4fbf0','#d2e7de','#8fbab5'])
    +grad('r40-sticky-rice',['#fffbe9','#f7ebc9','#e5cea0'])
    +grad('r40-sticky-meat',['#db9c73','#bc7452','#944c38'])
    +grad('r40-sticky-meat-side',['#c3835c','#a55c41','#804331'])
    +grad('r40-sticky-mushroom',['#b48152','#91623e','#6d492f']);
  let art=p('M33 142Q38 174 69 188Q127 209 187 186Q216 172 223 140Z','url(#r40-sticky-bowl)');
  art+=e(128,140,95,33,'#eaf3df');
  art+=e(128,139,84,25,'#c7d9bc','stroke="#98b29e" stroke-width="1.4"');
  // Rice remains the largest food mass; the turkey is three small cooked pieces.
  art+=p('M52 139Q52 127 65 123Q65 112 79 110Q82 101 95 104Q105 93 119 100Q134 91 147 101Q160 97 170 109Q186 107 190 120Q203 123 203 137Q193 157 163 164Q130 174 94 163Q65 158 52 146Z','url(#r40-sticky-rice)');
  art+=p('M59 140Q72 130 86 136Q99 126 113 136Q129 126 143 135Q158 127 173 137Q188 130 198 141Q178 160 147 161Q111 167 79 155Z','#fffbed','stroke="none" opacity=".7"');
  const grain=(d)=>p(d,'#fff8e1','stroke="#c3b18b" stroke-width="1.3"');
  art+=grain('M65 137Q69 133 73 136Q75 138 71 140Q67 140 65 137Z');
  art+=grain('M84 148Q87 143 92 145Q95 147 91 150Q87 151 84 148Z');
  art+=grain('M105 156Q109 152 113 155Q116 158 111 159Q107 159 105 156Z');
  art+=grain('M134 160Q138 156 142 158Q144 161 140 163Q136 163 134 160Z');
  art+=grain('M175 148Q179 144 183 146Q185 149 181 151Q178 151 175 148Z');
  art+=grain('M187 132Q191 128 195 131Q197 134 192 136Q189 136 187 132Z');
  art+=grain('M107 110Q110 105 115 108Q117 111 113 113Q109 114 107 110Z');
  art+=grain('M143 110Q147 105 151 108Q153 111 149 113Q145 113 143 110Z');
  art+=grain('M61 146Q65 142 69 144Q72 147 68 149Q64 150 61 146Z');
  art+=grain('M72 154Q76 150 81 152Q83 155 79 157Q75 158 72 154Z');
  art+=grain('M113 148Q116 143 121 146Q124 149 120 151Q116 152 113 148Z');
  art+=grain('M130 145Q134 141 138 144Q141 147 136 149Q133 149 130 145Z');
  art+=grain('M158 159Q162 155 166 158Q168 161 164 163Q160 163 158 159Z');
  art+=line('M67 126L72 124M80 113L85 111M101 101L105 102M160 104L165 108M93 160L98 162M153 163L159 161','#cfbf98',1.3,.9);
  // Small natural turkey chunks have warm cooked red-brown glaze and soft cut sides.
  art+=p('M73 119Q78 111 87 114L99 121L101 132L92 140L77 136L70 128Z','url(#r40-sticky-meat-side)','stroke="#704333" stroke-width="2.5"');
  art+=p('M75 118Q80 114 87 118L96 123L94 131L82 131L74 126Z','url(#r40-sticky-meat)','stroke="#995a40" stroke-width="1.4"');
  art+=line('M79 118L83 117M86 123L92 124M79 133L85 136','#f2bc8b',1.45,.98);
  art+=p('M119 103Q125 94 134 99L147 105L149 117L140 124L124 120L116 112Z','url(#r40-sticky-meat-side)','stroke="#704333" stroke-width="2.5"');
  art+=p('M122 102Q127 99 134 103L144 108L141 116L130 115L121 109Z','url(#r40-sticky-meat)','stroke="#995a40" stroke-width="1.4"');
  art+=line('M125 103L130 102M133 108L139 110M126 118L132 120','#f3bd8b',1.45,.98);
  art+=p('M146 132Q151 123 161 126L177 133L179 144L169 151L153 148L143 141Z','url(#r40-sticky-meat-side)','stroke="#704333" stroke-width="2.5"');
  art+=p('M149 131Q154 127 162 131L174 136L170 144L157 141L148 137Z','url(#r40-sticky-meat)','stroke="#995a40" stroke-width="1.4"');
  art+=line('M154 131L159 130M163 136L170 138M153 145L160 148','#f3bd8b',1.45,.98);
  // Two mushroom slices expose cream interiors; no extra garnish obscures the rice.
  art+=p('M101 132Q100 121 111 120Q122 119 126 131L122 138L116 135L116 143L108 143L109 135L103 138Z','url(#r40-sticky-mushroom)','stroke="#654a34" stroke-width="2.1"');
  art+=p('M105 131Q106 124 112 124Q119 124 122 132L116 130L113 133L113 140L110 140L112 132L108 130Z','#f3dfb9','stroke="#b59a70" stroke-width="1.2"');
  art+=p('M166 115Q164 106 174 103Q185 101 190 112L187 119L180 117L180 125L173 126L174 117L169 120Z','url(#r40-sticky-mushroom)','stroke="#654a34" stroke-width="2.1"');
  art+=p('M169 114Q169 108 176 107Q183 106 186 113L180 112L177 115L177 122L175 122L177 114L173 113Z','#f3dfb9','stroke="#b59a70" stroke-width="1.2"');
  art+=line('M49 165Q77 191 119 193M141 193Q182 189 206 164','#f9fff5',1.8,.96);
  art+=line('M91 184Q126 196 163 184','#a5c5b8',1.4,.88);
  return doc('火鸡糯米饭',defs,art,-19);
}

function pumpkinRibs(){
  const defs=grad('r40-rib-bowl',['#fff7e9','#e7dec5','#c1b896'])
    +grad('r40-rib-pumpkin',['#ffd38b','#f2ae56','#d98b36'])
    +grad('r40-rib-rind',['#e0a14c','#c57e31','#a85f27'])
    +grad('r40-rib-meat',['#d8a17c','#bd7c59','#96553d'])
    +grad('r40-rib-side',['#c48b65','#a5694b','#824a36'])
    +grad('r40-rib-bone',['#fff5d9','#e8d6b4','#c5ac86']);
  let art=p('M33 145Q40 174 72 186Q128 203 185 184Q215 173 223 143Z','url(#r40-rib-bowl)');
  art+=e(128,142,95,30,'#fff9e9');
  art+=e(128,141,83,22,'#e9e6c9','stroke="#b9b998" stroke-width="1.4"');
  art+=line('M49 164Q80 189 121 190M141 190Q184 186 206 162','#fffdf0',1.8,.98);
  // Three warm-orange pumpkin chunks have soft wedge faces and curved rind edges.
  art+=p('M67 126L85 113Q97 117 106 130L101 148L89 159Q73 156 63 144Z','url(#r40-rib-rind)','stroke="#81502c" stroke-width="2.6"');
  art+=p('M69 126L85 117Q95 121 101 131L96 144L87 151Q75 147 67 139Z','url(#r40-rib-pumpkin)','stroke="#d18a38" stroke-width="1.4"');
  art+=line('M72 127L82 121M73 138L81 143','#ffe2a5',1.6,.98);
  art+=p('M145 106L163 98Q177 107 181 121L173 135L153 136L141 122Z','url(#r40-rib-rind)','stroke="#81502c" stroke-width="2.6"');
  art+=p('M147 107L162 102Q171 108 176 121L170 130L156 131L146 121Z','url(#r40-rib-pumpkin)','stroke="#d18a38" stroke-width="1.4"');
  art+=line('M150 110L159 106M160 128L168 127','#ffe2a5',1.6,.98);
  art+=p('M171 151L184 136Q196 139 201 150L194 164L180 167L169 160Z','url(#r40-rib-rind)','stroke="#81502c" stroke-width="2.6"');
  art+=p('M174 151L185 141Q192 143 197 151L191 160L182 162L173 157Z','url(#r40-rib-pumpkin)','stroke="#d18a38" stroke-width="1.4"');
  art+=line('M177 151L183 145M181 159L187 159','#ffe4a9',1.6,.98);
  // Two compact bone-in ribs: short bones stay within the naturally rounded meat.
  art+=p('M91 113Q98 104 110 108L129 117Q138 122 134 133L125 144Q113 148 103 141L89 131Q84 122 91 113Z','url(#r40-rib-side)','stroke="#694434" stroke-width="2.7"');
  art+=p('M94 113Q100 109 110 113L127 122Q132 126 127 132L119 137Q108 136 101 129L92 124Z','url(#r40-rib-meat)','stroke="#985e44" stroke-width="1.5"');
  art+=p('M98 117Q103 113 109 118L117 123L114 128Q107 125 103 125Z','#e6b992','stroke="none" opacity=".8"');
  art+=e(99,130,5.9,7.3,'url(#r40-rib-bone)','stroke="#a88662" stroke-width="1.4" transform="rotate(-30 99 130)"');
  art+=e(99,130,2.3,3.2,'#cfb28a','stroke="none" transform="rotate(-30 99 130)"');
  art+=line('M102 114L107 115M113 133L119 136M126 124L128 127','#f4d0aa',1.45,.98);
  art+=p('M128 141Q135 131 147 134L166 142Q175 147 170 159L160 168Q148 172 138 166L125 155Q121 148 128 141Z','url(#r40-rib-side)','stroke="#694434" stroke-width="2.7"');
  art+=p('M131 141Q138 136 147 139L163 147Q169 151 163 157L155 161Q145 160 138 153L129 149Z','url(#r40-rib-meat)','stroke="#985e44" stroke-width="1.5"');
  art+=p('M137 142Q143 138 149 143L156 149L152 153Q146 150 142 150Z','#e7b993','stroke="none" opacity=".8"');
  art+=e(160,155,6.2,7.2,'url(#r40-rib-bone)','stroke="#a88662" stroke-width="1.4" transform="rotate(20 160 155)"');
  art+=e(160,155,2.3,3,'#ceb18a','stroke="none" transform="rotate(20 160 155)"');
  art+=line('M136 141L141 142M143 159L148 163M163 146L166 149','#f5d1ab',1.45,.98);
  art+=line('M109 157Q115 161 121 157M183 171L188 169','#efce8b',1.45,.87);
  return doc('南瓜蒸排骨',defs,art,-12);
}

export const steamerMiddleCandidates=[
  {id:'dish-fresh-ico-0077',code:'DS83',name:'流沙奶黄包',expectedOccupancy:.82,svg:custardBuns(),
    reason:'一个完整软包与一个小裂口包前后错落，奶白淡金面皮包住鲜亮金黄流沙馅；柔润面皮、浅色断面与少量黏稠流心区分油炸或烤面包。',
    design:{silhouette:'一个完整圆润软包加一个裂开小包，裂口和金黄内馅清楚，份量克制',angle:'三分之四俯视，前后软包和裂口厚度可辨',material:'淡金软面皮、奶白松软断面、金黄流沙馅与温柔油润光',identity:'软面团、鸡蛋、黄油；不添加芝麻、绿叶或其它馅料，不画油炸焦壳',container:'浅青白小盘，成品含盘82%，透明留白与视觉居中'}},
  {id:'dish-fresh-ico-0083',code:'DS84',name:'焦糖马拉糕',expectedOccupancy:.82,svg:caramelSponge(),
    reason:'两块大小与高度不同的棕金蒸糕，松软微孔切面和柔圆顶部保留蓬松感，薄薄半透明焦糖光点亮熟色，不画成带硬壳的面包片。',
    design:{silhouette:'两块不等大蒸糕，一块较高、一块矮而宽，切面各自完整',angle:'三分之四俯视，可见蒸糕顶面与松软多孔侧面',material:'棕金蒸糕、蓬松细孔、浅焦糖色内部与半透明焦糖润光',identity:'面粉、鸡蛋、焦糖；不加奶油、莓果或面包硬边',container:'暖白浅盘，成品含盘82%，两块错落且留白清楚'}},
  {id:'dish-fresh-ico-0088',code:'DS85',name:'火鸡糯米饭',expectedOccupancy:.84,svg:turkeyStickyRice(),
    reason:'一小碗糯米饭保留清楚温润米粒，顶面三块少量熟棕红火鸡肉与两片切开的蘑菇错落分布，米饭占主要体量，不用巨大整腿淹没米粒。',
    design:{silhouette:'小碗糯米饭，三块小火鸡肉和两菇片，米饭为主、配料紧凑',angle:'三分之四俯视，同时可见糯米粒、熟肉切面、菇片与小碗厚度',material:'奶白温润糯米、熟棕红火鸡肉、暖栗菇帽与奶白菇片内层',identity:'糯米团、火鸡腿、蘑菇；不画整只大鸡腿，不加青豆、葱或其它主料',container:'浅青瓷小碗，成品含碗84%，透明留白与视觉居中'}},
  {id:'dish-fresh-ico-0115',code:'DS86',name:'南瓜蒸排骨',expectedOccupancy:.82,svg:pumpkinRibs(),
    reason:'两块自然带骨小排与三块暖橙南瓜错落蒸熟，短骨断面包在柔嫩熟肉中，南瓜厚切面与圆弧皮边清楚，少量自然汁光保持鲜活食欲。',
    design:{silhouette:'两块带骨小排和三块大小朝向不同的南瓜块，数量克制、骨肉自然',angle:'三分之四俯视，熟肉厚度、短骨断面和橙色南瓜切面分层',material:'柔嫩棕金熟排骨、象牙短骨、暖橙软南瓜与少量自然汁光',identity:'仅南瓜和排骨，不画肠粉，不加葱叶、辣椒或额外主料',container:'浅暖白小蒸碗，成品含碗82%，完整透明边缘'}}
];

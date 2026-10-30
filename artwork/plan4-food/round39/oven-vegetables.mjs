// Round 39: three oven vegetables with deliberately different silhouettes.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 烤箱蔬食新版</title><defs>${defs}</defs><g stroke="#49372c" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function butterPotatoWedges(){
  const defs=grad('v39-potato-plate',['#f0f8ef','#cddfd5','#99bbae'])
    +grad('v39-potato-flesh',['#ffefaa','#f4cc6d','#dfa640'])
    +grad('v39-potato-skin',['#c7985a','#a46e36','#7f4f2c']);
  let art=e(128,163,97,30,'url(#v39-potato-plate)');
  art+=e(128,157,98,29,'#fbfcef');
  art+=e(128,157,84,21,'#dce8ce','stroke="#acbea0" stroke-width="1.35"');
  art+=line('M48 173Q80 188 114 187M148 187Q182 184 209 170','#fffef0',2.1,.94);
  art+=e(126,158,64,15,'#b58e4c','stroke="none" opacity=".14"');
  // Back-left wedge: a blunt triangular tip and a rough, curved peel base.
  art+=p('M61 131C60 115 75 96 88 87Q93 83 98 89L116 120Q122 128 117 135L110 142L98 147L83 146L74 144L68 140Z','url(#v39-potato-flesh)');
  art+=p('M61 131C61 116 74 99 87 89L85 99Q71 116 70 129Q77 137 87 138L99 140L111 135L120 127L117 135L110 142L98 147L83 146L74 144L68 140Z','url(#v39-potato-skin)','stroke="none"');
  art+=p('M72 128Q75 113 89 97Q93 92 96 99L109 120Q113 128 106 132Q91 138 78 132Z','#ffeaa0','stroke="none"');
  art+=line('M72 125L88 99M77 132L85 134','#fff5c2',1.8,.94);
  art+=line('M83 122Q89 120 93 124M99 112L103 116','#e3bd68',1.3,.8);
  art+=p('M73 138L78 139L80 142L75 142Z','#6e4528','stroke="none"');
  art+=p('M68 116L71 112L73 113L71 118Z','#6e4528','stroke="none"');
  art+=p('M102 141L108 138L110 140L106 143Z','#764a29','stroke="none"');
  // Back-right wedge: longer, tilted outward, with an uneven skin edge and one potato eye.
  art+=p('M123 116Q142 103 167 92Q174 88 178 96C188 110 196 127 195 137Q195 144 188 148L179 152L165 150L157 146L140 132L125 124Z','url(#v39-potato-flesh)');
  art+=p('M176 98Q190 115 194 133L195 139L190 146L180 152L165 150L157 146L142 134L151 138L166 143L179 143L184 138Q186 126 176 106Z','url(#v39-potato-skin)','stroke="none"');
  art+=p('M130 116L167 98Q171 96 174 102L184 130Q187 136 179 139L168 139L151 130Z','#ffeaa1','stroke="none"');
  art+=line('M139 115L166 103M169 137L177 138','#fff6c3',1.8,.94);
  art+=line('M155 116L160 119M169 123L173 128','#e2ba63',1.3,.8);
  art+=p('M184 140L188 137L191 139L188 143Z','#714627','stroke="none"');
  art+=p('M185 119L187 116L190 120L188 123Z','#714627','stroke="none"');
  art+=line('M173 146L178 147','#e3b36c',1.2,.87);
  // Broad front wedge, with its soft golden cut face fully visible.
  art+=p('M86 158L137 130Q144 126 150 133L169 160Q175 168 166 175L156 180L137 186L122 184L108 179L96 173L88 167Z','url(#v39-potato-flesh)');
  art+=p('M87 160Q98 168 110 171L123 175L137 177L152 173L170 163Q175 169 166 175L156 180L138 186L122 184L108 179L96 173L88 167Z','url(#v39-potato-skin)','stroke="none"');
  art+=p('M94 157L138 137Q143 134 147 140L159 158Q162 164 153 167L138 172Q123 173 109 166Z','#ffeb9f','stroke="none"');
  art+=line('M104 155L137 141M113 166L125 169','#fff6c4',1.9,.95);
  art+=line('M129 154L135 157M145 158L148 161','#e3bb65',1.3,.8);
  art+=p('M104 176L108 174L112 176L110 179L106 178Z','#73492a','stroke="none"');
  art+=p('M148 179L153 177L156 179L152 182Z','#79502c','stroke="none"');
  // Restrained butter sheen, with no bread holes or herb garnish.
  art+=p('M88 110Q93 106 97 111L96 115L90 115Z','#fff2af','stroke="none" opacity=".84"');
  art+=p('M157 109L164 107L169 111L165 114L159 113Z','#fff0a5','stroke="none" opacity=".82"');
  art+=p('M127 148Q134 143 141 148L139 153L131 153Z','#fff2ab','stroke="none" opacity=".82"');
  return doc('黄油烤薯角',defs,art);
}

function cheesyBroccoli(){
  const defs=grad('v39-broccoli-dish',['#fff5de','#e9d8b4','#c9ad81'])
    +grad('v39-broccoli-crown',['#b0d975','#6faf43','#347a37'])
    +grad('v39-broccoli-stem',['#d4e99b','#a2cd6e','#71a64c'])
    +grad('v39-broccoli-cheese',['#fff0a2','#ffce55','#e9a632']);
  // A shallow rounded baking dish has small handles and a readable cream rim.
  let art=p('M40 149Q30 142 24 148Q20 155 26 162L40 165Z','url(#v39-broccoli-dish)','stroke-width="2.6"');
  art+=p('M215 147Q227 141 232 148Q236 155 230 161L216 165Z','url(#v39-broccoli-dish)','stroke-width="2.6"');
  art+=p('M36 146Q40 134 56 132L195 131Q213 131 221 145L216 173Q210 192 188 196L73 197Q48 195 41 177Z','url(#v39-broccoli-dish)');
  art+=e(128,146,92,28,'#fff9e8');
  art+=e(128,146,80,20,'#e7d5ab','stroke="#c6ad7b" stroke-width="1.35"');
  art+=line('M48 172Q59 187 82 190M164 190Q198 186 209 171','#fffce9',2.1,.94);
  // Three short, branched stems remain visible beneath the green crowns.
  art+=p('M77 122L90 118L98 139L110 151Q103 160 88 159L81 153L83 141L75 131Z','url(#v39-broccoli-stem)','stroke-width="2.6"');
  art+=line('M88 153L89 135L81 125M89 139L98 131','#719d44',1.5,.88);
  art+=p('M147 112L162 110L163 134L175 149Q168 158 153 156L146 148L151 135Z','url(#v39-broccoli-stem)','stroke-width="2.6"');
  art+=line('M158 150L157 131L151 117M157 132L166 123','#6f9b44',1.5,.89);
  // Left crown is wide, with irregular florets and a bright but cooked green surface.
  art+=p('M56 117Q49 111 54 102Q58 94 66 95Q65 85 75 82Q84 78 91 85Q98 78 107 84Q116 87 114 96Q127 98 126 108Q126 117 116 120Q114 131 103 132Q94 137 87 131Q78 138 69 132Q59 131 60 123Z','url(#v39-broccoli-crown)');
  art+=p('M58 116Q69 120 76 118Q85 124 93 119Q105 122 120 112Q116 129 103 132Q94 137 87 131Q77 137 69 132Q60 131 60 123Z','#3c7e38','stroke="none" opacity=".25"');
  art+=line('M61 101Q65 95 72 97M75 88Q82 84 88 90M99 89Q105 87 110 94','#d0e79a',1.8,.94);
  art+=line('M69 110Q75 104 81 108M94 102Q100 97 107 102M90 119L96 117','#8fc45c',1.5,.93);
  // Right crown is taller and slightly tilted; its lobes do not repeat the first silhouette.
  art+=p('M135 106Q128 98 134 90Q137 83 146 85Q148 74 160 76Q169 74 175 82Q185 79 192 89Q198 98 191 104Q200 112 193 120Q188 126 180 124Q174 134 163 130Q153 135 145 126Q134 125 135 116Z','url(#v39-broccoli-crown)');
  art+=p('M137 111Q146 119 155 116Q164 122 172 117Q183 120 194 110Q199 119 188 124L180 124Q174 134 163 130Q153 135 145 126Q135 124 135 116Z','#387c36','stroke="none" opacity=".25"');
  art+=line('M141 93Q146 87 152 92M156 82Q164 78 169 85M177 88Q184 85 188 94','#d1e89d',1.8,.95);
  art+=line('M146 105Q153 99 160 105M170 100Q178 94 184 102M163 119L170 117','#92c660',1.5,.92);
  // Front crown is lower and broader, with a short flared stem below it.
  art+=p('M119 156L135 151L140 167L151 175Q144 187 127 186L116 180L121 170Z','url(#v39-broccoli-stem)','stroke-width="2.6"');
  art+=line('M129 180L129 166L122 158M130 168L139 161','#729f46',1.5,.9);
  art+=p('M93 152Q84 144 89 134Q92 126 103 127Q103 117 113 114Q123 111 129 119Q139 112 148 119Q158 120 157 130Q169 133 168 143Q167 152 158 155Q154 165 143 163Q134 171 124 164Q113 172 104 163Q94 164 94 156Z','url(#v39-broccoli-crown)');
  art+=p('M92 148Q103 154 113 151Q122 158 132 152Q144 156 165 143Q167 154 158 155Q154 165 143 163Q134 171 124 164Q113 172 104 163Q95 163 94 156Z','#3b7f37','stroke="none" opacity=".25"');
  art+=line('M97 137Q103 132 109 136M113 121Q120 117 126 124M140 125Q147 120 152 129','#d1e99c',1.8,.95);
  art+=line('M111 146Q118 140 124 145M137 137Q145 133 150 140M127 157L134 155','#94c862',1.5,.93);
  // Small cheese ribbons leave most of each crown visible, with only a few toasted spots.
  art+=p('M68 99Q74 92 82 98Q90 92 96 99L103 99Q109 103 104 109L99 111L98 119Q91 122 88 113L82 114L78 108L72 111Q65 108 68 103Z','url(#v39-broccoli-cheese)','stroke="#c28e35" stroke-width="1.4"');
  art+=p('M151 94Q157 87 165 94Q173 89 180 96L181 102L174 106L173 113Q167 118 162 109L156 110L153 103Q147 101 151 94Z','url(#v39-broccoli-cheese)','stroke="#c28e35" stroke-width="1.4"');
  art+=p('M109 134Q115 127 123 134Q132 128 139 135L146 135Q152 140 147 146L141 147L139 155Q132 158 129 149L122 150L118 144L112 146Q106 142 109 134Z','url(#v39-broccoli-cheese)','stroke="#c28e35" stroke-width="1.4"');
  art+=line('M74 101L81 100M157 96L164 97M115 137L122 136','#fff4be',1.7,.96);
  art+=line('M86 106L89 107M168 101L171 102M132 141L135 142','#a56c2b',1.4,.85);
  return doc('芝士焗西兰花',defs,art);
}

function onionButterAubergines(){
  const defs=grad('v39-aubergine-plate',['#fff5e4','#ead9b9','#c9af8a'])
    +grad('v39-aubergine-skin',['#b17ac8','#8251a2','#4f326d'])
    +grad('v39-aubergine-flesh',['#fff0bc','#eacc81','#c69c49'])
    +grad('v39-aubergine-stem',['#a8cd6c','#74a94b','#477b38'])
    +grad('v39-aubergine-onion',['#e7b4c6','#c88daa','#965c84']);
  let art=e(128,164,98,31,'url(#v39-aubergine-plate)');
  art+=e(128,158,99,29,'#fff9eb');
  art+=e(128,158,85,21,'#e3d7b5','stroke="#c3b28b" stroke-width="1.35"');
  art+=line('M47 175Q79 189 114 188M148 188Q183 185 210 172','#fffdf1',2.1,.94);
  // Back half is a long diagonal boat, its glossy purple skin framing a tender pale cut surface.
  art+=p('M67 119C82 113 108 125 138 145C152 152 156 165 145 174C133 182 116 169 100 159L71 137Q62 131 67 119Z','url(#v39-aubergine-skin)');
  art+=p('M73 123C91 122 114 138 136 152Q146 159 139 166C131 173 115 158 104 151L77 135Q70 130 73 123Z','url(#v39-aubergine-flesh)','stroke="#aa8145" stroke-width="1.4"');
  art+=p('M77 125Q90 125 104 136L131 153Q137 157 135 162Q124 158 115 151L83 131Z','#ffedab','stroke="none" opacity=".78"');
  art+=line('M82 129L89 134M91 137L96 128M100 141L108 133M109 148L117 139M120 155L127 147','#bd8e43',1.4,.83);
  art+=line('M74 136Q87 149 102 156M125 172L134 175','#bd88d0',1.7,.9);
  // The green calyx is part of the aubergine, not an added garnish.
  art+=p('M68 120Q63 109 53 110L57 119L53 124L64 128L71 124Z','url(#v39-aubergine-stem)','stroke-width="2.4"');
  art+=line('M59 115L66 123','#d3e59c',1.4,.95);
  // Front half turns upward and is longer and narrower, with a natural tapered neck.
  art+=p('M143 94C157 97 171 118 183 141C194 162 189 176 175 180C161 181 153 165 148 150C139 128 135 111 143 94Z','url(#v39-aubergine-skin)');
  art+=p('M145 103C154 110 165 128 174 147Q183 163 175 172C167 173 160 155 155 144Q144 121 145 103Z','url(#v39-aubergine-flesh)','stroke="#aa8145" stroke-width="1.4"');
  art+=p('M148 108Q157 117 165 137L173 155Q176 162 172 166Q163 153 159 140L149 118Z','#ffedac','stroke="none" opacity=".8"');
  art+=line('M148 117L155 120M153 130L160 123M157 140L166 133M162 151L171 143M167 161L176 154','#bc8e43',1.4,.84);
  art+=line('M148 148Q154 167 166 175M184 151L187 158','#bc86ce',1.7,.92);
  art+=p('M144 95Q137 85 146 79L151 89L160 93L154 99L150 103Z','url(#v39-aubergine-stem)','stroke-width="2.4"');
  art+=line('M146 84L150 96','#d2e59a',1.4,.95);
  // Four separately drawn short cooked onion petals, varied in shape and orientation.
  art+=p('M84 133L91 128Q99 130 101 137L95 143L87 140Z','url(#v39-aubergine-onion)','stroke="#74513e" stroke-width="2.1"');
  art+=p('M87 133L92 131L98 136L94 140L89 137Z','#f3d2d9','stroke="#b684a0" stroke-width="1.2"');
  art+=line('M89 134L94 138','#fff0e4',1.3,.94);
  art+=p('M118 153Q124 147 131 152L138 159L134 166L124 164L117 159Z','url(#v39-aubergine-onion)','stroke="#74513e" stroke-width="2.1"');
  art+=p('M121 154Q125 151 130 155L134 159L131 163L125 161Z','#f2cfd8','stroke="#b27e9b" stroke-width="1.2"');
  art+=line('M123 154L130 159','#fff0e3',1.3,.94);
  art+=p('M150 119Q154 114 160 118L164 126L159 132L152 128Z','url(#v39-aubergine-onion)','stroke="#74513e" stroke-width="2.1"');
  art+=p('M153 120L157 118L161 125L158 129L154 125Z','#f3d2da','stroke="#b4819f" stroke-width="1.2"');
  art+=line('M154 120L158 126','#fff0e5',1.3,.94);
  art+=p('M166 149L172 145Q178 148 178 153L174 160L167 157L164 153Z','url(#v39-aubergine-onion)','stroke="#74513e" stroke-width="2.1"');
  art+=p('M168 150L172 148L175 152L172 157L168 154Z','#f2cfd7','stroke="#b17e9b" stroke-width="1.2"');
  art+=line('M169 150L172 154','#fff0e4',1.3,.94);
  // A little butter gloss integrates with the warm flesh, without cheese or extra toppings.
  art+=line('M102 144L110 149M131 162L136 164M160 136L163 143M171 166L174 169','#fff0b4',1.7,.86);
  return doc('黄油洋葱烤茄子',defs,art);
}

export const ovenVegetableCandidates=[
  {id:'dish-fresh-ico-0052',name:'黄油烤薯角',svg:butterPotatoWedges(),expectedOccupancy:.82,
    reason:'三枚自然厚三角楔形薯角以不同大小和朝向错落摆盘，金黄松软切面、带皮粗边与少量土豆眼清楚可辨；只有克制黄油光，不再呈椭圆饼或面包形。',
    design:{silhouette:'三枚厚楔形薯角，钝尖、斜切面与弧形带皮底边各有差异',angle:'三分之四俯视，金黄切面与厚皮边同时可见',material:'松软浅金土豆芯、局部棕皮粗边与小土豆眼、少量黄油光泽',identity:'土豆和黄油，不画气孔、吐司或椭圆饼，不加香葱香草',container:'清爽青白浅圆盘，含盘约82%体量，三枚主体克制清楚'}},
  {id:'dish-fresh-ico-0129',name:'芝士焗西兰花',svg:cheesyBroccoli(),expectedOccupancy:.82,
    reason:'三簇熟绿西兰花保留颗粒花冠、分叉短茎与独立轮廓，少量金黄融芝士沿花冠自然垂落，轻焦点增香；奶白浅烤皿清楚承托。',
    design:{silhouette:'三簇大小和形态不同的西兰花，绿色花冠与短茎清楚分层',angle:'三分之四俯视，同时可见花冠颗粒、分叉短茎与浅烤皿',material:'鲜活熟绿花冠、浅绿短茎、金黄融芝士与少量棕金轻焦点',identity:'西兰花和芝士片，不包成面包球，不添加肉类或番茄',container:'奶白圆角浅烤皿带小侧柄，含皿约82%体量，绿色主料占主导'}},
  {id:'dish-fresh-ico-0134',name:'黄油洋葱烤茄子',svg:onionButterAubergines(),expectedOccupancy:.82,
    reason:'两半长紫茄一横一竖错落，紫亮皮包住浅金软嫩熟肉切面，少量交错烤纹与黄油光表现热烤质地；四枚短熟洋葱瓣分别绘制造型，避免长条与复制。',
    design:{silhouette:'两半长茄具有不同长宽和朝向，茄蒂、紫皮与狭长熟肉切面一眼分明',angle:'三分之四俯视，两片切面展开，保留自然弧度和厚度',material:'亮紫熟茄皮、浅金软嫩茄肉、少量交错焦纹、粉紫短洋葱与温润黄油光',identity:'茄子、紫洋葱、黄油；绿色仅茄蒂本体，不加芝士或番茄',container:'暖白浅圆盘，含盘约82%体量，四枚各异短洋葱瓣保持主次'}}
];

// Round 35: five individually composed dishes, drawn from the current recipe inputs.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".16" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 煎炸成品新版</title><defs>${defs}</defs><g stroke="#49372c" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function foieGras(){
  const defs=grad('f35-foie-plate',['#faf9e9','#e2e6d1','#b2c7b4'])
    +grad('f35-foie-sear',['#e6b875','#c68a48','#946039'])
    +grad('f35-foie-cut',['#f6dfb4','#e1be89','#c29159'])
    +grad('f35-foie-red',['#f68258','#de5437','#a9362a']);
  let art=p('M33 135Q35 126 49 121L184 110Q205 110 219 126L221 145Q218 161 199 171L74 191Q51 191 40 175Z','url(#f35-foie-plate)');
  art+=p('M34 135Q39 128 53 125L185 115Q204 115 216 128L216 141Q210 152 193 158L75 179Q54 181 43 166Z','#fbfbeb');
  art+=p('M51 137L184 125Q198 124 206 133L204 141Q198 147 187 150L77 168Q62 170 54 160Z','#e1dfbf','stroke="#b7be9d" stroke-width="1.35"');
  art+=line('M53 174Q63 180 77 178L181 162','#fffff2',2.1,.93);
  art+=e(128,150,64,13,'#b89462','stroke="none" opacity=".21"');
  // The back lobe has a broad curved body and a small natural notch, not a wing shape.
  art+=p('M62 124L66 111Q72 96 94 91Q107 85 122 91L130 98Q142 96 150 108L146 124Q135 141 110 145Q85 148 69 139Z','url(#f35-foie-cut)');
  art+=p('M63 113Q68 99 91 92Q107 87 121 93L128 100Q141 98 148 109Q145 119 130 124Q113 133 91 134Q70 135 63 125Z','url(#f35-foie-sear)');
  art+=p('M68 114Q77 103 94 100Q109 95 118 100L123 105Q105 102 88 111Q77 118 68 120Z','#f3cf90','stroke="none" opacity=".78"');
  art+=line('M77 122Q85 113 99 111M112 104L121 107M127 115L137 110','#98603a',1.5,.85);
  art+=line('M76 133Q92 142 112 137M119 135L130 131','#eec88f',1.7,.9);
  art+=p('M69 123Q78 130 89 130L84 134L73 131Z','#865334','stroke="none" opacity=".65"');
  // The front slice shows a tender, pale cut side beneath its golden surface.
  art+=p('M108 146L112 127Q120 113 141 110Q160 106 176 116Q187 122 187 134L183 151Q172 166 153 169Q132 171 116 161Z','url(#f35-foie-cut)');
  art+=p('M111 129Q118 116 139 112Q158 108 175 118Q186 125 185 135Q178 146 160 150Q139 155 122 147Q111 143 111 129Z','url(#f35-foie-sear)');
  art+=p('M119 128Q128 119 142 118Q157 116 167 121Q154 119 140 126Q128 132 119 133Z','#f8d99b','stroke="none" opacity=".85"');
  art+=line('M122 137Q132 128 145 128M155 121L164 126M169 137L179 132','#955d34',1.6,.82);
  art+=line('M123 153Q139 163 155 160M164 157L175 152','#f4d7a5',1.8,.93);
  art+=p('M172 147Q181 143 185 136L182 149L175 156L169 157Z','#9d6b3d','stroke="none" opacity=".48"');
  // Red pepper is a small warm accent, without an unlisted garnish.
  art+=p('M73 148Q81 144 88 149L92 157L84 162L75 158Z','url(#f35-foie-red)','stroke-width="2.3"');
  art+=p('M180 108L188 104L195 110L193 117L184 117Z','url(#f35-foie-red)','stroke-width="2.2"');
  art+=line('M78 149L85 151M186 108L190 110','#ffbd8b',1.3,.93);
  return doc('香煎鹅肝',defs,art);
}

function friedBacon(){
  const defs=grad('f35-bacon-plate',['#fff6df','#f0dfbc','#d4bc90'])
    +grad('f35-bacon-meat',['#d77b52','#b9583b','#8d3d2c'])
    +grad('f35-bacon-fat',['#fff1d1','#f3c79d','#d99a72'])
    +grad('f35-bacon-onion',['#efd0d5','#c795b0','#966583']);
  let art=p('M39 137Q43 124 60 121L181 116Q204 118 216 134L214 156Q208 174 188 182L77 188Q54 186 44 169Z','url(#f35-bacon-plate)');
  art+=p('M40 137Q48 126 63 125L180 121Q202 122 211 136L209 148Q201 161 183 167L78 175Q58 173 48 160Z','#fff9e9');
  art+=p('M58 140Q61 134 73 132L177 130Q190 130 198 140L195 147Q187 154 175 157L80 165Q66 163 59 155Z','#ead7b5','stroke="#ccb88f" stroke-width="1.35"');
  art+=line('M59 173Q68 179 80 179L181 171','#fffdf0',2.1,.94);
  art+=e(128,153,60,11,'#a96c3e','stroke="none" opacity=".17"');
  // Three short slices have different folds, ends and fat bands.
  art+=p('M64 121Q72 113 80 118L91 120L104 111L119 108L130 113L145 106Q154 107 156 117L149 130Q140 135 131 132L119 136L104 133L92 140L78 137L67 138Q60 134 64 121Z','url(#f35-bacon-meat)');
  art+=p('M67 123Q76 121 84 126L95 126L108 118L121 117L131 122L146 115L150 119L144 125L131 128L120 126L108 127L96 134L83 132L69 133Z','url(#f35-bacon-fat)','stroke="#b87956" stroke-width="1.3"');
  art+=line('M72 120L80 122M108 113L118 112M134 112L142 110','#f2b083',1.6,.92);
  art+=p('M95 139Q103 130 114 133L125 128L138 132L150 124L164 125L175 120Q187 121 187 132L180 145L167 147L156 153L141 149L129 155L114 150L102 153Z','url(#f35-bacon-meat)');
  art+=p('M101 139L113 138L125 136L139 140L151 132L165 133L178 127L181 132L176 138L166 141L154 146L140 144L128 149L114 144L105 147Z','url(#f35-bacon-fat)','stroke="#b77854" stroke-width="1.35"');
  art+=line('M113 134L121 132M143 134L150 129M169 128L176 125','#efb17c',1.7,.9);
  art+=p('M72 148Q79 140 88 145L100 146L112 140L123 145L136 142L149 151L156 151L161 158L156 169Q147 173 138 166L127 162L116 165L104 160L94 163L81 157L74 159Q69 155 72 148Z','url(#f35-bacon-meat)');
  art+=p('M77 148L88 151L101 152L112 146L122 151L136 149L146 157L154 157L154 163L146 166L136 160L126 157L116 160L104 155L95 158L84 153L78 154Z','url(#f35-bacon-fat)','stroke="#b77a57" stroke-width="1.3"');
  art+=line('M79 145L88 148M115 144L122 147M139 147L146 151','#f9bb83',1.6,.92);
  art+=line('M77 156L84 158M106 158L113 161M145 166L151 168','#783c29',1.4,.85);
  // Two compact onion petals, individually drawn and visibly different.
  art+=p('M166 151Q173 145 182 148L190 157Q187 167 177 168L168 163Z','url(#f35-bacon-onion)','stroke-width="2.4"');
  art+=line('M171 153Q173 162 180 164L186 159M175 151Q176 157 182 159','#f7e1df',1.5,.96);
  art+=p('M66 137L72 129Q81 129 84 136L80 145L71 147Z','url(#f35-bacon-onion)','stroke-width="2.3"');
  art+=line('M70 136Q75 135 79 138L76 142','#f5dedf',1.45,.97);
  return doc('煎炸培根',defs,art);
}

function sunnyEgg(){
  const defs=grad('f35-egg-plate',['#e8f2ed','#c0d6d1','#8eb3b9'])
    +grad('f35-egg-crisp',['#edbd65','#cf8b36','#aa642b'])
    +grad('f35-egg-white',['#fffef1','#fff6dc','#eddcb3'])
    +grad('f35-egg-yolk',['#ffd667','#ffb12e','#e8881f']);
  let art=e(128,155,95,33,'url(#f35-egg-plate)');
  art+=e(128,149,96,31,'#f7fbef');
  art+=e(128,149,82,23,'#dbe5cf','stroke="#9fb9ac" stroke-width="1.35"');
  art+=line('M49 164Q79 182 114 182M148 182Q183 179 207 164','#fafff0',2.2,.94);
  // A single crisp irregular white surrounds one domed orange yolk.
  art+=p('M60 132Q54 122 66 116Q64 105 78 102Q80 91 96 94Q106 84 120 90Q134 82 145 91Q160 88 169 99Q184 97 188 110Q201 114 196 126Q207 136 197 146Q196 159 181 161Q172 173 158 167Q144 178 131 170Q116 178 103 170Q89 173 80 163Q66 164 64 151Q52 145 60 132Z','url(#f35-egg-crisp)');
  art+=p('M65 131Q60 123 72 118Q70 108 83 107Q85 98 98 101Q109 91 121 98Q135 90 145 98Q158 94 165 106Q180 102 182 115Q195 117 190 128Q200 137 190 143Q192 155 179 155Q170 166 158 160Q145 170 132 163Q117 172 105 164Q92 168 84 156Q71 158 70 147Q59 142 65 131Z','url(#f35-egg-white)','stroke="#a58554" stroke-width="1.5"');
  art+=p('M75 121Q79 111 91 113Q97 104 111 107Q121 100 128 104Q115 110 112 120Q94 117 84 128Z','#ffffff','stroke="none" opacity=".76"');
  art+=line('M78 145Q80 154 93 154M151 154Q163 160 173 151M171 119Q182 121 184 131','#fffef5',2.2,.96);
  art+=e(133,129,31,25,'url(#f35-egg-yolk)','stroke="#a56124" stroke-width="2.2"');
  art+=p('M109 134Q122 151 148 142Q156 137 161 126Q164 143 148 151Q123 160 110 142Z','#ef8e1b','stroke="none" opacity=".38"');
  art+=p('M115 120Q122 107 136 111Q144 113 142 119Q136 117 131 120Q121 124 115 120Z','#ffed9b','stroke="none" opacity=".92"');
  art+=e(147,131,3.5,2.4,'#ffce57','stroke="none" opacity=".72"');
  art+=e(83,132,3.1,2.2,'#fffdf2','stroke="#d9c9a0" stroke-width="1.2"');
  art+=e(169,138,3.2,2.2,'#fffdf2','stroke="#d9c9a0" stroke-width="1.2"');
  art+=e(99,151,2.2,1.5,'#fffdf2','stroke="#dbc79a" stroke-width="1.1"');
  art+=line('M66 124L70 121M78 159L83 161M111 171L117 171M177 162L182 159M191 116L194 120','#8e5429',1.4,.8);
  return doc('油炸太阳蛋',defs,art);
}

function searedMeatballs(){
  const defs=grad('f35-balls-plate',['#fdf2db','#e9d2ad','#c79d73'])
    +grad('f35-balls-back',['#d5a064','#b57b43','#89522f'])
    +grad('f35-balls-front',['#e4b170','#c3894a','#935c33'])
    +grad('f35-balls-basil',['#a6ce6b','#6ba549','#417537']);
  let art=p('M35 143Q42 177 82 188Q128 203 176 188Q214 177 222 143Z','url(#f35-balls-plate)');
  art+=e(128,143,94,30,'#fff5dc');
  art+=e(128,143,81,22,'#e8d0a7','stroke="#c49570" stroke-width="1.4"');
  art+=line('M44 155Q76 184 117 187M148 187Q185 181 210 157','#fff9e6',2.2,.94);
  art+=line('M49 153Q80 170 112 172M149 172Q181 168 207 153','#b47753',1.4,.7);
  art+=e(128,151,65,17,'#9b693d','stroke="none" opacity=".18"');
  // Each ball has its own contour and searing marks.
  art+=p('M69 116C66 99 76 83 91 80C108 77 124 87 126 104C128 121 116 137 99 139C82 141 70 131 69 116Z','url(#f35-balls-back)');
  art+=p('M72 116Q81 133 100 131Q115 130 123 116C120 132 110 139 98 139Q77 140 72 124Z','#78482e','stroke="none" opacity=".29"');
  art+=line('M79 97Q84 86 96 86M103 86L109 89','#f3ce93',2.1,.91);
  art+=line('M81 116L87 120M108 104L113 103M99 128L104 127','#85502d',1.8,.95);
  art+=e(94,104,2.1,1.4,'#9b6136','stroke="none"');
  art+=p('M128 108C127 91 140 77 155 78C174 77 187 91 186 108C187 125 173 139 156 138C139 138 128 126 128 108Z','url(#f35-balls-back)');
  art+=p('M133 113Q147 133 167 128Q178 124 184 113C180 132 170 138 156 138Q139 138 133 123Z','#7c4a2e','stroke="none" opacity=".3"');
  art+=line('M140 94Q145 84 157 84M164 86L170 90','#efc68c',2.1,.92);
  art+=line('M142 113L147 117M164 101L171 102M168 124L174 119','#86502e',1.7,.93);
  art+=e(156,111,2.3,1.5,'#9a6033','stroke="none"');
  art+=p('M95 143C92 125 103 111 122 110C142 106 158 120 160 138C163 157 148 173 129 175C110 176 96 162 95 143Z','url(#f35-balls-front)');
  art+=p('M99 147Q108 166 130 166Q148 166 157 149C153 166 142 175 129 175Q107 176 100 160Z','#8c5730','stroke="none" opacity=".3"');
  art+=line('M106 130Q111 118 125 117M133 117L140 120','#f8d59b',2.3,.93);
  art+=line('M110 149L115 154M131 135L139 133M143 155L148 151','#925b2e',1.8,.92);
  art+=e(120,139,2.1,1.4,'#a86a34','stroke="none"');
  // Only two basil leaves; broad veins retain their identity at small scale.
  art+=p('M163 153Q164 137 183 133Q191 147 178 155Q169 158 163 153Z','url(#f35-balls-basil)','stroke="#405e32" stroke-width="2.3"');
  art+=line('M166 151L181 136M173 144L173 139M173 144L181 145','#c0db89',1.35,.95);
  art+=p('M159 154Q148 146 153 133Q169 132 173 146Q170 153 159 154Z','url(#f35-balls-basil)','stroke="#405e32" stroke-width="2.2"');
  art+=line('M159 151L157 136M159 143L164 140','#cae396',1.3,.95);
  return doc('香煎肉丸',defs,art);
}

function friedScallops(){
  const defs=grad('f35-scallops-plate',['#e9f3eb','#b8d8ce','#83b5ac'])
    +grad('f35-scallops-crust',['#efc77e','#dba050','#af7034'])
    +grad('f35-scallops-ivory',['#fffbe9','#f4e7c9','#d8c299'])
    +grad('f35-scallops-lemon',['#ffe77b','#f2c544','#ce9730']);
  let art=e(128,159,97,31,'url(#f35-scallops-plate)');
  art+=e(128,153,98,31,'#f5fbef');
  art+=e(128,153,84,23,'#d8e7cd','stroke="#96b6a1" stroke-width="1.35"');
  art+=line('M48 169Q76 184 114 184M148 184Q181 181 209 167','#fafff0',2.2,.94);
  art+=e(126,157,62,13,'#a48043','stroke="none" opacity=".18"');
  // Back scallop: ivory round top and a short, fluted golden side.
  art+=p('M74 105L127 104L127 126Q120 139 100 140Q79 138 74 126Z','url(#f35-scallops-crust)');
  art+=line('M81 116L82 129M90 120L91 134M103 121L103 135M116 117L115 131','#ad773e',1.3,.83);
  art+=p('M74 105Q75 95 87 91Q99 86 111 91Q124 94 128 104Q127 116 114 119Q100 124 85 118Q74 115 74 105Z','url(#f35-scallops-crust)');
  art+=e(101,104,22,13,'url(#f35-scallops-ivory)','stroke="#b98b52" stroke-width="1.35"');
  art+=line('M85 101Q93 93 104 96M113 107L117 105','#fffdf2',1.7,.96);
  art+=line('M85 113L88 115M112 115L116 113','#c5924e',1.45,.9);
  // Right scallop is taller and slightly tilted, with a differently browned edge.
  art+=p('M131 114L182 109L184 134Q178 148 160 149Q141 149 133 138Z','url(#f35-scallops-crust)');
  art+=line('M139 124L141 139M150 128L151 144M163 126L164 143M175 120L176 136','#b17b3d',1.3,.86);
  art+=p('M130 114Q131 103 142 99Q155 94 168 99Q180 100 184 111Q184 122 172 127Q157 133 141 126Q131 123 130 114Z','url(#f35-scallops-crust)');
  art+=e(157,112,22,14,'url(#f35-scallops-ivory)','stroke="#b98c53" stroke-width="1.35"');
  art+=line('M140 110Q145 101 156 102M163 122L171 118','#fffdf2',1.7,.95);
  art+=line('M137 118L141 121M170 102L175 105','#bc8740',1.45,.9);
  // Front scallop has a wide, softly irregular face with fine muscle lines.
  art+=p('M99 143L151 142L152 161Q148 176 128 178Q107 179 99 166Z','url(#f35-scallops-crust)');
  art+=line('M106 154L108 168M117 158L118 173M130 158L130 174M141 152L142 169','#b48243',1.3,.86);
  art+=p('M98 143Q98 132 111 127Q123 122 137 127Q149 129 153 140Q154 152 141 157Q128 163 112 157Q98 154 98 143Z','url(#f35-scallops-crust)');
  art+=e(126,142,22,14,'url(#f35-scallops-ivory)','stroke="#ba8f54" stroke-width="1.35"');
  art+=line('M109 140Q115 131 127 132M135 150L141 146','#fffef3',1.8,.97);
  art+=line('M109 150L114 153M137 132L143 135','#c08b44',1.5,.88);
  // One small lemon wedge, its rind and pale pulp distinct from the scallop faces.
  art+=p('M174 151L191 128Q206 140 207 154Q194 166 178 164Z','url(#f35-scallops-lemon)','stroke-width="2.4"');
  art+=p('M179 150L192 134Q202 142 202 152Q192 160 181 159Z','#fff0b0','stroke="#d4aa43" stroke-width="1.3"');
  art+=line('M192 138L184 154L198 149M185 145L190 147','#f5cd65',1.35,.95);
  art+=line('M177 158Q190 168 203 157','#ffe98a',1.7,.94);
  return doc('酥炸扇贝',defs,art);
}

export const fryingFrontCandidates=[
  {id:'dish-fresh-ico-0029',name:'香煎鹅肝',svg:foieGras(),expectedOccupancy:.82,
    reason:'两块厚切鹅肝呈自然宽瓣轮廓，金棕煎面下露出柔润浅暖切面；红椒只作少量点色，清爽浅绿长盘留出呼吸感。',
    design:{silhouette:'两块宽厚鹅肝一前一后，保留鹅肝自然弧形与不规则小凹口',angle:'三分之四俯视，前片可见厚度和嫩切面',material:'金棕细焦面、浅暖奶油色内部与克制油润高光',identity:'鹅肝、面粉与红椒，不画鸡翅、骨头或肉肠',container:'浅绿白色长盘，整体82%体量，摆盘留白清楚'}},
  {id:'dish-fresh-ico-0048',name:'煎炸培根',svg:friedBacon(),expectedOccupancy:.82,
    reason:'三片短培根紧凑错落，每片褶皱与脂纹不同，红棕熟色和奶白脂肪带清楚相间；两块独立紫洋葱短瓣保持主次。',
    design:{silhouette:'三片短而宽的波折培根叠成紧凑斜向构图，切口与卷边各异',angle:'略俯视，可见熟培根薄度、卷边及脂纹',material:'红棕焦边、金暖油光、奶白熟脂肪与柔紫洋葱',identity:'只呈培根与少量紫洋葱，洋葱为不同形态短块瓣',container:'暖白浅角盘，整体82%体量，食物不溢出盘沿'}},
  {id:'dish-fresh-ico-0050',name:'油炸太阳蛋',svg:sunnyEgg(),expectedOccupancy:.8,
    reason:'单枚太阳蛋以圆润橙金蛋黄作视觉中心，奶白蛋清外缘带自然焦脆波边和少量鼓泡；浅蓝绿白盘衬出饱满暖色。',
    design:{silhouette:'单个饱满蛋黄被自然不规则的焦边蛋清包围',angle:'俯视略带侧面，蛋黄有清楚隆起与圆润高光',material:'橙金蛋黄、奶白蛋清、少量棕金脆边和细小鼓泡',identity:'只有鸡蛋，不添加培根、香草或蔬菜点缀',container:'浅蓝绿白色圆盘，整体80%体量，保留清爽盘沿'}},
  {id:'dish-fresh-ico-0057',name:'香煎肉丸',svg:searedMeatballs(),expectedOccupancy:.82,
    reason:'三颗棕金熟肉丸以一前两后形成饱满三角构图，轮廓、焦斑与受光各有变化；两片罗勒带来清楚鲜绿对比。',
    design:{silhouette:'三颗圆润肉丸错落成团，前球略大，保留独立边界',angle:'三分之四俯视，圆球立体量与盘沿同时可见',material:'深浅棕金熟肉表面、局部焦斑与温润高光',identity:'肉丸与两片罗勒，克制数量，主料一眼可辨',container:'暖陶色圆盘，整体82%体量，盘沿与食物留出层次'}},
  {id:'dish-fresh-ico-0068',name:'酥炸扇贝',svg:friedScallops(),expectedOccupancy:.82,
    reason:'三枚短圆柱扇贝露出象牙色圆润肉面，金黄酥边与细竖纹表现厚度；一角柠檬点亮侧边，和鱼排、蛤蜊明确区分。',
    design:{silhouette:'三枚略有差异的短圆柱扇贝，圆肉面与金黄短侧壁分开可读',angle:'三分之四俯视，象牙顶面、细竖肌纹与酥边均可见',material:'象牙熟贝肉、金黄薄酥壳、柠檬浅黄果肉与亮黄果皮',identity:'扇贝、面粉、柠檬，不使用鱼块或带壳蛤蜊造型',container:'青绿白浅圆盘，整体82%体量，三枚贝肉与一角柠檬清楚分组'}}
];

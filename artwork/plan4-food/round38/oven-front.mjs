// Round 38: five oven dishes, individually drawn from their current recipe inputs.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 烤箱成品新版</title><defs>${defs}</defs><g stroke="#49372c" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function foilStuffedPeppers(){
  const defs=grad('o38-pepper-plate',['#fbf9e8','#e4e6ce','#bdcbb3'])
    +grad('o38-pepper-foil',['#fbfffc','#dce8e5','#9aafad'])
    +grad('o38-pepper-red',['#ff9770','#ef5a3c','#bd352a'])
    +grad('o38-pepper-yellow',['#ffe57b','#f8bd3a','#d98a22'])
    +grad('o38-pepper-meat',['#d79b64','#b97b47','#8c5333'])
    +grad('o38-pepper-cheese',['#fff1aa','#ffdb69','#edb23e']);
  let art=e(128,167,97,29,'url(#o38-pepper-plate)');
  art+=e(128,161,98,28,'#fffcef');
  art+=e(128,161,84,20,'#e4e7cc','stroke="#b8c2a0" stroke-width="1.35"');
  art+=line('M48 176Q78 190 113 189M148 189Q182 186 208 173','#fffff2',2.1,.94);
  // Crumpled silver foil hugs the peppers locally, without hiding the red and gold skins.
  art+=p('M46 134L54 120L68 125L76 114L97 121L118 114L138 125L158 120L177 129L196 121L210 137L204 157L215 168L193 177L174 172L152 183L130 176L111 185L91 175L69 179L62 165L46 159L52 146Z','url(#o38-pepper-foil)','stroke="#61736b" stroke-width="2.4"');
  art+=p('M48 137L66 141L58 157L48 156ZM67 170L88 163L91 175L71 175ZM154 175L178 165L184 174L155 180ZM201 138L207 140L202 155L191 154Z','#f8fffb','stroke="none"');
  art+=p('M55 129L66 141L54 146ZM69 160L88 163L69 169ZM135 170L151 178L139 179ZM190 157L207 166L194 172Z','#a2b5af','stroke="none" opacity=".78"');
  art+=line('M53 135L64 140L59 151M72 173L87 166M164 176L179 168M197 138L202 145L197 153','#7d9690',1.25,.85);
  // Red half pepper: a lobed boat and a shallow visible filling, not a generic bowl.
  art+=p('M61 119Q60 103 74 97Q89 87 104 94Q119 93 125 109L122 137Q113 153 94 154Q77 155 65 140Z','url(#o38-pepper-red)');
  art+=p('M64 117Q66 104 80 101Q94 94 107 101Q119 103 121 115Q120 129 107 134Q87 143 72 132Z','#f58d4f','stroke="#bb4b2d" stroke-width="1.45"');
  art+=p('M69 116Q71 108 81 107Q94 101 104 107Q114 107 117 116L111 127Q99 135 84 132L73 126Z','url(#o38-pepper-meat)','stroke="#825134" stroke-width="1.4"');
  art+=p('M73 113Q81 106 87 111Q94 104 101 111Q111 107 115 117L109 122L109 129Q102 134 97 125Q90 127 85 121L79 127Q72 127 73 121Z','url(#o38-pepper-cheese)','stroke="#c4913d" stroke-width="1.35"');
  art+=p('M79 112Q85 110 89 115M95 112Q102 110 108 115','none','stroke="#fff4bb" stroke-width="2.1"');
  art+=line('M69 134Q74 145 86 148M115 132L111 140','#ffae77',1.8,.93);
  art+=line('M79 124L83 125M101 126L104 127M108 113L111 115','#9e622f',1.4,.85);
  // Gold half is broader, tipped towards the viewer, and has its own filling silhouette.
  art+=p('M119 137Q118 121 132 115Q145 105 160 112Q176 107 189 120L194 139Q190 158 176 167Q159 176 143 167Q127 165 121 152Z','url(#o38-pepper-yellow)');
  art+=p('M124 135Q125 124 138 121Q151 114 162 120Q177 116 187 128L187 141Q180 153 165 156Q147 161 134 151Z','#ffda75','stroke="#c78d31" stroke-width="1.45"');
  art+=p('M131 135Q130 127 142 126Q153 120 163 126Q177 122 183 132L180 142Q170 150 156 150Q140 151 132 143Z','url(#o38-pepper-meat)','stroke="#865337" stroke-width="1.4"');
  art+=p('M135 132Q139 126 146 130Q153 125 160 131Q169 126 174 132L180 131Q185 137 178 141L173 141L171 148Q163 152 160 143L153 145Q148 140 142 144Q133 143 135 137Z','url(#o38-pepper-cheese)','stroke="#c58f38" stroke-width="1.35"');
  art+=line('M141 132Q147 130 152 134M164 133L170 134','#fff4ba',2.1,.95);
  art+=line('M130 150Q135 162 147 165M181 153L176 160','#fff0a3',1.8,.93);
  art+=line('M139 140L143 141M161 137L164 138M176 139L179 140','#9b5d2d',1.4,.82);
  return doc('锡纸彩椒酿',defs,art);
}

function breakfastSandwich(){
  const defs=grad('o38-sandwich-plate',['#eef7ed','#c7dfd3','#91b7af'])
    +grad('o38-sandwich-crust',['#e4aa5e','#c7853e','#9b5b2f'])
    +grad('o38-sandwich-crumb',['#fff0bc','#edcc88','#dba653'])
    +grad('o38-sandwich-bacon',['#ed9b6e','#ca6847','#a14533'])
    +grad('o38-sandwich-yolk',['#ffd866','#ffb438','#e78a22']);
  let art=e(128,176,96,28,'url(#o38-sandwich-plate)');
  art+=e(128,170,97,27,'#fbfcf0');
  art+=e(128,170,82,19,'#dbe8d2','stroke="#a7beaa" stroke-width="1.35"');
  art+=line('M48 184Q80 197 114 196M149 196Q184 193 208 181','#fffff4',2.1,.94);
  // Back triangle: one cut half with a clear diagonal egg-and-bacon cross section.
  art+=p('M67 137L146 106L145 135L75 167L67 159Z','url(#o38-sandwich-crust)');
  art+=p('M70 139L144 111L143 122L75 153L70 150Z','#fff7df','stroke="#c1a878" stroke-width="1.3"');
  art+=p('M72 151L83 143L94 142L105 133L117 132L129 123L143 120L143 129L131 133L119 141L107 142L95 150L83 152L76 158Z','url(#o38-sandwich-bacon)','stroke="#984a32" stroke-width="1.35"');
  art+=p('M74 157L143 129L142 135L77 163Z','#f1ce8b','stroke="#b98545" stroke-width="1.25"');
  art+=p('M97 136Q101 126 109 125Q118 123 121 128L113 136L104 140Z','url(#o38-sandwich-yolk)','stroke="#c58b2e" stroke-width="1.3"');
  art+=p('M66 137L76 88Q78 83 84 86L147 106L76 143Z','url(#o38-sandwich-crust)');
  art+=p('M73 133L81 94L136 108L79 135Z','url(#o38-sandwich-crumb)','stroke="#c99a58" stroke-width="1.35"');
  art+=line('M82 100L79 119M89 96L104 102','#fff1ba',2,.94);
  art+=e(99,109,2.2,1.4,'#d8af6d','stroke="none"');
  art+=e(89,122,1.6,1.2,'#d1a365','stroke="none"');
  // The second cut half turns forward; its cut face reveals white, orange yolk and red bacon.
  art+=p('M115 166L195 140L194 169L125 198L116 189Z','url(#o38-sandwich-crust)');
  art+=p('M118 167L192 143L192 156L125 182L119 179Z','#fff9e7','stroke="#c3ad7d" stroke-width="1.3"');
  art+=p('M137 167Q140 156 151 155Q160 151 165 157L164 164L150 171L141 174Z','url(#o38-sandwich-yolk)','stroke="#c78b2e" stroke-width="1.3"');
  art+=p('M121 180L133 174L146 176L158 168L169 167L181 158L193 156L192 164L182 169L170 174L159 175L147 182L135 183L125 189Z','url(#o38-sandwich-bacon)','stroke="#944730" stroke-width="1.35"');
  art+=line('M128 180L135 178L143 180M163 171L171 170L178 165','#ffd5aa',1.4,.95);
  art+=p('M124 189L192 163L191 169L127 195Z','#f0cb83','stroke="#bd8a48" stroke-width="1.25"');
  art+=p('M114 167L124 118Q125 113 131 116L196 140L125 174Z','url(#o38-sandwich-crust)');
  art+=p('M121 162L129 123L185 141L128 166Z','url(#o38-sandwich-crumb)','stroke="#c99753" stroke-width="1.35"');
  art+=line('M132 127L147 132M126 139L124 152','#fff2bc',2,.94);
  art+=e(150,144,2.2,1.5,'#d8ad65','stroke="none"');
  art+=e(136,154,1.7,1.2,'#d1a15e','stroke="none"');
  return doc('早餐三明治',defs,art);
}

function roastedPotatoSlices(){
  const defs=grad('o38-potato-plate',['#f4faf0','#d5e4d7','#a5c1b5'])
    +grad('o38-potato-edge',['#efbd65','#d6973d','#aa682b'])
    +grad('o38-potato-cut',['#fff0b2','#f4d17d','#dfab47']);
  let art=e(128,159,97,31,'url(#o38-potato-plate)');
  art+=e(128,153,98,29,'#fbfcf0');
  art+=e(128,153,84,21,'#e2e8cc','stroke="#b5c1a0" stroke-width="1.35"');
  art+=line('M48 170Q80 184 115 183M147 183Q183 181 209 166','#fffef0',2.1,.94);
  // Four baked slices, with different cuts and angles rather than a pile of thin chips.
  art+=p('M61 119Q61 105 75 98Q89 91 102 98Q113 106 108 120L105 127Q96 138 81 137Q66 135 61 126Z','url(#o38-potato-edge)');
  art+=p('M64 116Q64 105 77 101Q91 96 101 102Q108 108 103 118Q95 129 81 129Q69 127 64 121Z','url(#o38-potato-cut)','stroke="#b8873d" stroke-width="1.35"');
  art+=line('M72 108Q79 101 88 104M71 121L77 124','#fff4bd',1.8,.95);
  art+=line('M96 126L101 122M66 122L69 126','#9c622b',1.4,.82);
  art+=p('M127 105Q134 92 152 91Q169 90 178 102L179 113Q173 127 157 132Q139 136 129 124Z','url(#o38-potato-edge)');
  art+=p('M130 104Q137 96 151 96Q165 94 173 104Q175 112 165 120Q151 127 138 122L131 115Z','url(#o38-potato-cut)','stroke="#b88a3e" stroke-width="1.35"');
  art+=line('M138 103Q149 97 158 101M142 119L149 120','#fff4bf',1.8,.95);
  art+=line('M165 126L173 120M131 120L135 125','#9d642c',1.4,.82);
  art+=p('M76 150Q73 135 86 128Q102 121 117 130Q128 139 124 153L120 161Q109 174 92 170Q80 166 76 158Z','url(#o38-potato-edge)');
  art+=p('M79 146Q79 136 90 132Q102 127 113 134Q121 139 119 149Q114 161 101 163Q87 164 81 155Z','url(#o38-potato-cut)','stroke="#b8893b" stroke-width="1.35"');
  art+=line('M86 142Q94 133 105 137M87 155L95 158','#fff5c0',1.9,.95);
  art+=line('M111 166L117 162M78 155L82 161','#a1682d',1.4,.85);
  art+=p('M142 146Q148 132 165 131Q183 129 192 141Q201 153 191 166Q182 178 165 176Q149 174 143 162Z','url(#o38-potato-edge)');
  art+=p('M146 145Q153 136 166 136Q182 134 188 145Q193 153 184 162Q174 171 160 167Q149 164 146 155Z','url(#o38-potato-cut)','stroke="#b6883a" stroke-width="1.35"');
  art+=line('M155 144Q164 138 174 141M157 160L165 163','#fff5bf',1.9,.95);
  art+=line('M181 171L188 166M145 158L149 166','#9d642a',1.4,.85);
  // Small translucent butter glints sit on the slices; no herbs or extra garnish.
  art+=p('M88 113Q92 110 97 112L95 116L90 117Z','#fff1a8','stroke="none" opacity=".85"');
  art+=p('M149 110L156 108L160 111L157 115L150 114Z','#ffec9a','stroke="none" opacity=".85"');
  art+=p('M97 147L105 144L111 147L108 152L100 152Z','#fff0a8','stroke="none" opacity=".82"');
  art+=p('M170 151L177 148L182 151L178 156L171 155Z','#ffec9e','stroke="none" opacity=".82"');
  return doc('烤土豆片',defs,art);
}

function garlicBread(){
  const defs=grad('o38-bread-plate',['#eef6e9','#cfdfca','#9fbaa5'])
    +grad('o38-bread-crust',['#e9b26b','#c98540','#9d5d30'])
    +grad('o38-bread-crumb',['#fff0bd','#f5d690','#ddb260'])
    +grad('o38-bread-garlic',['#fff8dc','#f2dca2','#d7b775']);
  let art=e(128,166,97,29,'url(#o38-bread-plate)');
  art+=e(128,160,98,27,'#fcfcef');
  art+=e(128,160,83,19,'#dfe8cc','stroke="#b2c0a0" stroke-width="1.35"');
  art+=line('M48 176Q80 190 115 188M148 188Q182 186 209 173','#fffff2',2.1,.94);
  // Back slice is a short rustic baguette section, its face open and porous.
  art+=p('M127 95Q142 85 157 91Q172 92 180 107L190 135Q184 151 168 157Q150 159 139 146L123 117Q119 105 127 95Z','url(#o38-bread-crust)');
  art+=p('M128 96Q142 88 154 95Q167 96 173 108L181 128Q177 142 164 147Q150 148 141 138L129 115Q124 104 128 96Z','url(#o38-bread-crumb)','stroke="#a7763d" stroke-width="1.4"');
  art+=p('M132 102Q144 94 155 103Q169 109 171 123Q161 121 157 132Q143 132 136 121Z','#ffdd74','stroke="none" opacity=".72"');
  art+=p('M136 105Q140 99 145 103L150 107L145 113Q140 113 138 109Z','#c4934d','stroke="none"');
  art+=p('M156 115Q160 109 166 113L169 118L165 123Q159 123 156 119Z','#bf8c45','stroke="none"');
  art+=e(146,125,3.4,2.4,'#c99d55','stroke="none"');
  art+=e(159,137,2.4,1.7,'#c69a50','stroke="none"');
  art+=line('M133 105L136 101M143 136L149 141','#fff4c5',1.7,.94);
  art+=p('M150 103L154 100L159 103L157 107L152 108Z','url(#o38-bread-garlic)','stroke="#c3a15f" stroke-width="1.2"');
  art+=p('M149 120L154 117L158 120L156 125L151 125Z','url(#o38-bread-garlic)','stroke="#c3a15f" stroke-width="1.2"');
  // Front slice has a wider face, uneven crust and different holes and garlic placement.
  art+=p('M63 128Q64 112 79 106Q96 98 110 109Q123 115 128 134L131 150Q128 169 110 178Q90 185 75 172L63 150Z','url(#o38-bread-crust)');
  art+=p('M69 126Q70 116 82 112Q95 105 106 114Q118 120 121 136L124 149Q121 163 107 170Q93 176 81 166L70 148Z','url(#o38-bread-crumb)','stroke="#a5753d" stroke-width="1.4"');
  art+=p('M76 124Q90 113 103 122Q116 129 115 144Q105 140 102 152Q91 159 80 148Z','#ffdd73','stroke="none" opacity=".75"');
  art+=p('M77 127Q80 120 85 123L90 126L87 133Q81 135 78 131Z','#c3944e','stroke="none"');
  art+=p('M99 132Q103 127 108 130L112 135L107 141Q101 142 99 137Z','#bd8943','stroke="none"');
  art+=p('M87 148Q92 143 98 146L99 150L94 155Q88 155 86 151Z','#c99b51','stroke="none"');
  art+=p('M106 157L109 155L113 157L111 160L107 160Z','#c79a50','stroke="none"');
  art+=line('M74 128L77 121M81 161L88 166','#fff4c7',1.8,.95);
  art+=p('M92 119L97 115L102 119L100 124L94 124Z','url(#o38-bread-garlic)','stroke="#c09d5e" stroke-width="1.2"');
  art+=p('M81 139L86 136L91 140L89 145L83 144Z','url(#o38-bread-garlic)','stroke="#c09d5e" stroke-width="1.2"');
  art+=line('M84 136Q90 132 96 136M97 160L104 157M145 119L151 116','#ffeab1',1.35,.95);
  art+=line('M95 129L101 128M91 158L98 160M143 115L148 114','#ffeeb2',1.6,.95);
  return doc('蒜香面包',defs,art);
}

function honeyPigeonSkewers(){
  const defs=grad('o38-pigeon-plate',['#f1f8ef','#c9e0dc','#91bcb8'])
    +grad('o38-pigeon-roast',['#ef9d63','#c9623d','#943e2e'])
    +grad('o38-pigeon-honey',['#ffd27a','#efab44','#cb7c2b']);
  let art=e(128,161,98,31,'url(#o38-pigeon-plate)');
  art+=e(128,155,99,30,'#fbfcf0');
  art+=e(128,155,84,22,'#dce8d1','stroke="#a7bfa8" stroke-width="1.35"');
  art+=line('M47 171Q78 186 114 185M147 185Q183 182 210 168','#fffff3',2.1,.94);
  art+=p('M72 150Q106 139 150 148Q179 147 190 155Q178 163 148 160Q112 169 79 159Z','#efc175','stroke="none" opacity=".28"');
  art+=line('M56 138L191 101M70 172L206 132','#a57a45',3.1,1);
  art+=line('M59 137L188 102M73 171L203 133','#e9bd7b',1.2,.95);
  // Six irregular cooked morsels share two short sticks, without poultry silhouettes or extra garnish.
  art+=p('M66 111Q71 100 84 102L99 113L96 127Q86 135 74 129L65 121Z','url(#o38-pigeon-roast)');
  art+=p('M70 112Q74 106 81 109Q88 111 92 115Q87 120 82 117Q76 114 72 115Z','url(#o38-pigeon-honey)','stroke="none" opacity=".9"');
  art+=line('M71 112L77 108M74 124L79 127','#ffdc91',1.6,.93);
  art+=line('M86 124L92 122','#853c29',1.4,.85);
  art+=p('M105 103Q114 93 126 98L137 109L133 124Q122 131 111 123L103 115Z','url(#o38-pigeon-roast)');
  art+=p('M110 105Q116 99 122 103Q129 105 131 110Q124 113 119 109Q114 107 111 109Z','url(#o38-pigeon-honey)','stroke="none" opacity=".9"');
  art+=line('M111 105L117 101M113 120L119 124','#ffda8b',1.6,.94);
  art+=line('M126 121L131 117','#843a28',1.4,.85);
  art+=p('M145 94Q154 88 164 95L176 106L174 118Q164 125 153 119L143 108Z','url(#o38-pigeon-roast)');
  art+=p('M149 98Q156 93 161 99Q168 101 170 107Q164 110 160 105Q154 100 151 102Z','url(#o38-pigeon-honey)','stroke="none" opacity=".92"');
  art+=line('M149 98L154 95M154 116L160 119','#ffda88',1.6,.94);
  art+=line('M166 116L171 112','#843b29',1.4,.85);
  art+=p('M81 145Q87 135 100 138L112 149L108 164Q98 172 87 165L79 156Z','url(#o38-pigeon-roast)');
  art+=p('M85 147Q91 140 97 144Q104 146 106 151Q103 155 98 152Q92 148 88 151Z','url(#o38-pigeon-honey)','stroke="none" opacity=".92"');
  art+=line('M86 146L92 142M87 161L93 165','#ffdc90',1.6,.94);
  art+=line('M101 162L106 158','#843c29',1.4,.85);
  art+=p('M120 136Q129 126 142 132L153 142L149 158Q138 166 126 159L118 149Z','url(#o38-pigeon-roast)');
  art+=p('M125 138Q132 132 138 136Q145 138 148 144Q141 147 136 143Q131 139 127 142Z','url(#o38-pigeon-honey)','stroke="none" opacity=".9"');
  art+=line('M126 137L132 133M127 155L134 159','#ffdc8e',1.6,.94);
  art+=line('M142 156L148 151','#843a28',1.4,.85);
  art+=p('M162 128Q170 121 181 127L192 137L191 151Q183 162 170 156L160 144Z','url(#o38-pigeon-roast)');
  art+=p('M166 131Q172 125 178 131Q185 134 187 139Q183 142 178 139Q172 134 168 135Z','url(#o38-pigeon-honey)','stroke="none" opacity=".92"');
  art+=line('M167 130L173 126M169 152L176 156','#ffdc8f',1.6,.94);
  art+=line('M182 152L187 148','#843b28',1.4,.85);
  return doc('蜜汁烤鸽串',defs,art);
}

export const ovenFrontCandidates=[
  {id:'dish-fresh-ico-0034',name:'锡纸彩椒酿',svg:foilStuffedPeppers(),expectedOccupancy:.82,
    reason:'鲜红与金黄两半彩椒盛少量熟肉馅和融芝士，椒皮、肉馅与金色芝士各自可辨；银亮锡纸只在底边局部包裹，紧凑而精致。',
    design:{silhouette:'两半不同形态的彩椒盅前后错落，肉馅与芝士不盖住椒皮轮廓',angle:'三分之四俯视，可见椒盅开口、厚肉馅与局部锡纸折边',material:'鲜红金黄熟椒皮、棕金熟肉馅、柔软融芝士和冷银锡纸折光',identity:'彩椒、肉丸和芝士片，只保留两半主体，不堆放多盅',container:'暖白浅盘衬局部银亮锡纸，含盘约82%体量，透明留白'}},
  {id:'dish-fresh-ico-0063',name:'早餐三明治',svg:breakfastSandwich(),expectedOccupancy:.82,
    reason:'一份斜切为两半的紧凑三明治，以金色烤吐司衬出奶白蛋清、橙黄蛋黄与红棕培根的层次；两个截面方向不同，主料清楚。',
    design:{silhouette:'一份斜切三明治的两半前后靠拢，保留三角切口与厚实夹层',angle:'三分之四俯视，两半各露出切面，能同时辨认吐司、鸡蛋和培根',material:'金黄吐司孔隙、奶白熟蛋、橙金蛋黄和红棕培根脂纹',identity:'吐司、培根、鸡蛋，不加入生菜、番茄或芝士',container:'青白浅盘，含盘约82%体量，三角面包与夹层留有清楚边界'}},
  {id:'dish-fresh-ico-0052',name:'烤土豆片',svg:roastedPotatoSlices(),expectedOccupancy:.82,
    reason:'四片各有厚薄与朝向的金黄烤土豆错落成组，浅色蓬松切芯、轻焦边和少量黄油亮点表现热烤香气，不堆满薄片。',
    design:{silhouette:'四片厚烤土豆轮廓各异，前后两组保留独立边界',angle:'三分之四俯视，切面与烤边厚度同时可见',material:'金黄烤面、浅奶油土豆芯、棕金轻焦边与克制黄油光泽',identity:'土豆和黄油，固定四片主体，不加香葱或香草',container:'青白浅圆盘，含盘约82%体量，盘沿与土豆之间留白清楚'}},
  {id:'dish-fresh-ico-0080',name:'蒜香面包',svg:garlicBread(),expectedOccupancy:.82,
    reason:'两片厚短乡村法棍露出开放气孔，金色蒜蓉黄油铺在松软面上，烤壳与少量蒜粒构成香脆层次；不加绿叶或芝士。',
    design:{silhouette:'两片厚短面包一前一后，切面宽窄、倾角与气孔各不相同',angle:'三分之四俯视，开放孔隙、厚度和烤壳边清楚可见',material:'金棕烤壳、浅金松软面芯、融化蒜蓉黄油和少量奶白蒜粒',identity:'面包胚、大蒜、黄油；此前437原版选择由主评审保持，本轮另供新版选择',container:'青白浅圆盘，含盘约82%体量，两片主体与配料数量克制'}},
  {id:'dish-fresh-ico-0092',name:'蜜汁烤鸽串',svg:honeyPigeonSkewers(),expectedOccupancy:.82,
    reason:'两根短签各串三块不规则熟鸽肉，栗红肉色与金橙蜜汁光泽交错，肉块紧凑饱满；没有整鸡、鸡腿或额外蔬菜。',
    design:{silhouette:'两根短签错落，六块厚实鸽肉各有切角与收缩边，避免规则方块复制',angle:'略俯视，可见熟肉厚度、蜜汁亮面和短签端头',material:'栗红暖棕熟肉、金橙蜜汁、轻焦边与少量油润反光',identity:'鸽肉串与蜂蜜，不画整鸡或鸡腿，不加配方外蔬菜',container:'青白釉浅盘，含盘约82%体量，肉块成组且盘沿清楚'}}
];

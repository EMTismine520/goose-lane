// Round 38: six independently composed oven dishes, matched to their actual recipes.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.5,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".15" y1="0" x2=".82" y2="1">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 烤箱成品新版候选</title><defs>${defs}</defs><g transform="translate(0 ${dy})" stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function onionBagel(){
  const defs=grad('r38-bagel-plate',['#f9fbef','#dce7d5','#afc6b6'])
    +grad('r38-bagel-gold',['#f6cf88','#e4ad5e','#bc7c3b'])
    +grad('r38-bagel-side',['#e5af65','#c58a46','#9e652f'])
    +grad('r38-bagel-onion',['#ebc3d1','#cd92ae','#a96789'])
    +grad('r38-bagel-onion-light',['#f5d7d8','#dda9bd','#bc7e9d']);
  let art=e(128,158,98,31,'url(#r38-bagel-plate)');
  art+=e(128,154,85,23,'#fffff2','stroke="#b0c1a5" stroke-width="1.4"');
  art+=line('M46 167Q80 187 119 186M139 186Q185 183 211 164','#fcfff1',1.9,.98);
  // A broad toasted ring has an open, shaded centre and a visible chewy front side.
  art+=p('M63 119Q65 100 85 91Q105 79 129 82Q158 79 180 97Q195 109 194 128L189 145Q174 163 146 168L110 168Q79 164 67 146Z','url(#r38-bagel-side)');
  art+=p('M63 117Q68 99 87 94Q107 81 129 86Q153 81 175 97Q190 106 192 120Q190 136 169 144Q146 154 120 151Q92 153 76 140Q62 132 63 117Z','url(#r38-bagel-gold)','stroke="#966832" stroke-width="1.8"');
  art+=p('M75 113Q85 97 106 96Q124 88 143 95Q168 94 180 111Q171 108 163 112Q153 103 141 106Q126 98 112 105Q93 101 82 118Z','#ffdfa0','stroke="none" opacity=".78"');
  art+=e(128,116,23,13,'#b37b3b','stroke="#845c32" stroke-width="1.6"');
  art+=p('M109 118Q110 108 127 108Q144 108 148 117Q138 127 123 125Q113 125 109 118Z','#fff8dd','stroke="#d5b77d" stroke-width="1.3"');
  art+=line('M76 139Q87 149 107 151M137 156Q159 154 174 146','#f1ca86',1.6,.96);
  art+=line('M79 155L87 159M115 163L122 163M159 160L167 156','#a66d32',1.3,.82);
  // Four individually shaped short onion petals, never cloned rings or long ribbons.
  art+=p('M83 104Q90 98 101 102L108 110Q108 118 99 121L87 116L80 110Z','#bd894f','stroke="#6d4b39" stroke-width="2.2"');
  art+=p('M85 104Q92 102 99 106L104 111L99 117Q91 116 84 110Z','url(#r38-bagel-onion)','stroke="#97627b" stroke-width="1.3"');
  art+=line('M86 105Q90 113 99 117M91 105L98 110','#f8dde1',1.4,.98);
  art+=p('M143 95Q153 88 163 97L168 106Q165 113 156 111L145 105Z','#c18a4b','stroke="#6d4b39" stroke-width="2.2"');
  art+=p('M146 96Q154 93 160 100L164 106L157 108L148 103Z','url(#r38-bagel-onion-light)','stroke="#97627b" stroke-width="1.3"');
  art+=line('M148 96Q151 103 159 107','#ffebdf',1.5,.98);
  art+=p('M159 129L169 120Q177 121 181 128L176 139L166 141L158 136Z','#bd8448','stroke="#6d4b39" stroke-width="2.2"');
  art+=p('M161 130L169 124Q176 125 177 129L173 136L166 137Z','url(#r38-bagel-onion)','stroke="#97627b" stroke-width="1.3"');
  art+=line('M164 128Q165 133 173 136M169 125L174 129','#f5d5dc',1.4,.98);
  art+=p('M103 135Q108 129 114 132L124 140L121 147L111 146L103 142Z','#b98549','stroke="#6d4b39" stroke-width="2.1"');
  art+=p('M106 135Q109 132 113 135L120 141L117 144L111 142Z','url(#r38-bagel-onion-light)','stroke="#97627b" stroke-width="1.3"');
  art+=line('M107 135Q107 141 116 144','#fae0df',1.4,.98);
  art+=line('M78 124L83 121M136 136L144 135M165 112L169 115','#fff0ba',1.7,.94);
  return doc('焦香洋葱贝果',defs,art,-8);
}

function meatBurger(){
  const defs=grad('r38-meat-bun',['#f7d38c','#e7ad5f','#c9873e'])
    +grad('r38-meat-bun-side',['#e6ad60','#c98a43','#a86a32'])
    +grad('r38-meat-patty',['#ab7348','#885331','#623c29'])
    +grad('r38-meat-green',['#a9cd66','#79af49','#4e873a'])
    +grad('r38-meat-plate',['#fffaf0','#e9e2cb','#c5c5ad']);
  let art=e(128,174,99,28,'url(#r38-meat-plate)');
  art+=e(128,170,85,20,'#fffdf2','stroke="#b9bd9e" stroke-width="1.4"');
  art+=line('M47 181Q82 199 123 198M142 198Q184 194 211 178','#fffff4',1.8,.96);
  // The lower bun is short; a thick, visibly cooked pressed meatball patty sits above it.
  art+=p('M65 149Q126 159 191 147L190 165Q184 181 155 187Q125 194 93 183Q70 178 65 164Z','url(#r38-meat-bun-side)');
  art+=p('M68 149Q126 139 190 147Q194 156 181 163Q158 172 125 169Q89 170 71 159Z','url(#r38-meat-bun)','stroke="#a87339" stroke-width="1.6"');
  art+=line('M77 171Q94 182 115 183M137 184Q162 182 178 174','#f8d89b',1.6,.97);
  art+=p('M65 128Q71 119 82 122Q90 116 101 121Q113 116 125 121Q138 115 150 120Q162 115 175 121Q186 119 192 129L191 145Q187 155 174 154Q161 160 148 154Q133 160 121 155Q109 159 96 153Q81 156 70 148Q62 143 65 128Z','url(#r38-meat-patty)');
  art+=p('M72 128Q86 122 96 128Q108 122 120 129Q134 122 146 128Q161 121 173 127L185 133Q177 140 164 137Q151 143 138 137Q124 143 110 137Q95 141 82 135Z','#bb8855','stroke="none" opacity=".65"');
  art+=line('M78 143L84 145M100 132L106 129M119 147L127 148M147 132L152 129M169 145L177 143','#513524',1.6,.92);
  // One lively lettuce layer drapes over the patty without adding tomato or cheese.
  art+=p('M64 119Q72 112 80 117Q87 107 97 114Q106 106 117 113Q129 107 141 114Q153 106 165 114Q178 108 184 118Q196 116 195 126L186 133L173 127L164 136L150 129L138 135L124 128L110 134L99 126L86 132L77 124L67 128Z','url(#r38-meat-green)','stroke="#496a36" stroke-width="2.2"');
  art+=line('M77 119L84 122L91 118M106 116L114 122M132 116L139 123M157 117L164 124M177 120L183 125','#d6e7a0',1.35,.96);
  // The upper dome is taller and narrower than the bacon burger's low, broad cap.
  art+=p('M65 109C67 84 86 63 112 59C142 52 167 67 181 86Q192 101 190 112Q175 122 129 122Q83 122 65 113Z','url(#r38-meat-bun)');
  art+=p('M76 99Q85 76 107 72Q128 63 149 74Q167 82 175 96Q158 88 144 91Q123 82 105 92Q88 87 76 104Z','#ffdda0','stroke="none" opacity=".66"');
  art+=line('M82 88Q91 77 105 75M118 68Q129 65 140 70M161 82L167 89','#fff0bd',1.85,.98);
  art+=line('M79 111Q104 117 128 116Q158 117 180 110','#bb7d39',1.45,.85);
  return doc('汉堡包',defs,art,-2);
}

function butterKingCrab(){
  const defs=grad('r38-crab-plate',['#f9fcf4','#d8e9e3','#a0c2c1'])
    +grad('r38-crab-shell',['#f8a468','#ee7b4b','#cd5338'])
    +grad('r38-crab-side',['#e67e4c','#cb5739','#a54130'])
    +grad('r38-crab-flesh',['#fff5df','#f0dfbc','#d2b48c'])
    +grad('r38-crab-butter',['#fff0a4','#e3be66']);
  let art=e(128,164,100,31,'url(#r38-crab-plate)');
  art+=e(128,160,87,23,'#fdfff3','stroke="#a6beb2" stroke-width="1.4"');
  art+=line('M45 172Q81 191 121 191M141 191Q185 187 211 170','#fafff7',1.9,.96);
  art+=p('M70 160Q82 152 99 156Q115 149 133 155Q151 149 171 154Q188 151 194 161Q188 173 166 173Q145 179 125 173Q104 178 84 170Z','url(#r38-crab-butter)','stroke="none" opacity=".42"');
  // Two long, coarse leg portions have roughly 2–3:1 local proportions and clear joints.
  art+=p('M54 134Q52 126 60 123L78 116L84 110L91 114L108 109Q117 107 121 116L123 124Q120 132 112 134L93 140L86 145L78 142L64 149Q57 150 54 143Z','url(#r38-crab-side)');
  art+=p('M61 128L79 122L85 117L92 121L109 115Q115 113 117 120L117 125L93 133L86 139L79 136L64 142Z','url(#r38-crab-shell)','stroke="#b74f34" stroke-width="1.5"');
  art+=line('M80 119Q88 125 88 136','#a94731',1.6,.96);
  art+=line('M85 117Q94 123 94 132M66 128L76 124M100 119L108 117','#ffcb91',1.6,.98);
  // The near broken end is an oval of white cooked meat inside a red shell rim.
  art+=e(62,136,9,11.5,'#df774b','stroke="#964d35" stroke-width="2" transform="rotate(-20 62 136)"');
  art+=e(61.5,135.5,6.3,8.4,'url(#r38-crab-flesh)','stroke="#bb8c65" stroke-width="1.3" transform="rotate(-20 61.5 135.5)"');
  art+=line('M59 130L62 137M62 130L65 136','#fffcef',1.35,.98);
  art+=p('M160 124L171 107L176 96L179 90L181 82L186 83L190 77L197 82Q204 87 201 95L191 108L187 117L177 132L167 136Z','url(#r38-crab-side)');
  art+=p('M166 124L178 108L181 99L185 91L186 85L191 83L197 87L196 93L186 106L182 115L174 127L168 130Z','url(#r38-crab-shell)','stroke="#b64c33" stroke-width="1.5"');
  art+=line('M174 103L185 111','#a64430',1.6,.96);
  art+=line('M178 101L189 107M186 91L190 86M170 121L175 114','#ffce94',1.6,.98);
  // One small, broad section of crab body; not a whole creature with many thin legs.
  art+=p('M101 124L105 111L114 110L118 100L130 104L140 99L149 107L160 105L165 116L172 121L169 141Q159 155 137 157Q114 156 102 143Z','url(#r38-crab-side)');
  art+=p('M105 123L111 115L119 115L123 108L131 112L141 107L150 115L157 112L161 123L166 127Q157 143 137 145Q117 146 107 136Z','url(#r38-crab-shell)','stroke="#b74b33" stroke-width="1.7"');
  art+=p('M112 124Q122 113 132 119Q142 113 153 122L158 129Q145 125 139 132Q126 126 116 134Z','#ffc28a','stroke="none" opacity=".78"');
  art+=line('M116 124L121 120M139 117L143 115M155 129L159 127','#ffe1aa',1.7,.98);
  art+=line('M113 139L120 142M132 150L140 151M153 143L158 139','#aa442e',1.4,.86);
  // Garlic petals and butter shine stay small beside the red-orange shell.
  art+=p('M184 150Q190 142 196 151L199 160Q190 164 183 158Z','url(#r38-crab-flesh)','stroke="#9b815b" stroke-width="1.65"');
  art+=line('M187 150L190 158','#fffae8',1.3,.98);
  art+=p('M168 171Q170 161 178 163Q185 167 180 173L173 176Z','#f3dfb4','stroke="#9b815b" stroke-width="1.6"');
  art+=line('M173 165L176 170','#fffae5',1.3,.98);
  art+=line('M129 138Q136 141 142 138M177 162L181 160','#fff1b6',1.6,.95);
  return doc('蒜香黄油帝王蟹',defs,art,-9);
}

function baconBurger(){
  const defs=grad('r38-bacon-bun',['#f9d48c','#e9ac5d','#c5843f'])
    +grad('r38-bacon-side',['#e3aa61','#c88a45','#a56b35'])
    +grad('r38-bacon-meat',['#e49c78','#cf795c','#a95742'])
    +grad('r38-bacon-green',['#aad06b','#7bb34f','#4c893b'])
    +grad('r38-bacon-plate',['#fff9ed','#e7ddc5','#c0b399']);
  let art=e(128,167,99,29,'url(#r38-bacon-plate)');
  art+=e(128,163,86,21,'#fffdf0','stroke="#bbb697" stroke-width="1.4"');
  art+=line('M46 175Q81 193 123 192M142 192Q187 189 211 172','#fffdf0',1.8,.97);
  art+=p('M54 147Q123 157 203 143L201 161Q191 176 160 182Q125 188 88 176Q59 169 54 157Z','url(#r38-bacon-side)');
  art+=p('M57 145Q124 138 201 143Q206 151 190 159Q161 169 127 166Q86 167 62 156Z','url(#r38-bacon-bun)','stroke="#aa773d" stroke-width="1.6"');
  art+=line('M67 166Q89 178 117 179M140 180Q165 177 184 170','#f8d89a',1.6,.96);
  art+=p('M54 140Q64 131 75 137Q84 127 95 134Q106 128 117 135Q130 127 141 134Q155 127 165 134Q179 128 189 136Q200 131 207 140L203 149L191 147L182 156L169 149L156 155L143 148L130 155L117 148L104 154L91 146L78 152L67 145L58 148Z','url(#r38-bacon-green)','stroke="#4d713a" stroke-width="2.2"');
  art+=line('M69 139L77 143M93 137L101 142M123 137L129 144M154 137L160 144M182 139L190 144','#d7e8a0',1.3,.96);
  // Two broad bacon pieces with uneven folds; no meat patty or cheese layer.
  art+=p('M64 123Q74 113 86 119L111 130Q122 135 135 127Q145 120 158 125L188 132L190 142Q177 146 164 140L151 135Q138 135 127 142Q115 148 101 140L82 132L69 134Z','url(#r38-bacon-meat)','stroke="#7e4436" stroke-width="2.4"');
  art+=line('M69 123Q78 118 87 123L108 134Q122 141 136 131Q145 125 155 129L181 136','#f8d9b5',2.4,.98);
  art+=p('M83 132Q92 126 102 132L120 142Q131 146 143 139Q153 133 163 139L182 144L181 151Q170 156 160 149Q150 144 140 148Q128 155 116 149L99 141L87 144Z','url(#r38-bacon-meat)','stroke="#7e4436" stroke-width="2.3"');
  art+=line('M89 135Q95 132 102 136L120 146Q130 150 141 143Q151 138 161 144L175 148','#ffe0ba',2.2,.98);
  // A lower, wider golden dome clearly distinguishes this bun from DS74.
  art+=p('M54 118C58 98 81 84 108 84C141 79 170 85 190 101Q204 112 202 123Q185 133 131 132Q77 133 54 125Z','url(#r38-bacon-bun)');
  art+=p('M68 113Q80 96 106 95Q131 87 155 96Q176 98 190 114Q173 107 158 110Q136 102 115 109Q89 103 68 118Z','#ffdda0','stroke="none" opacity=".69"');
  art+=line('M75 105Q87 96 104 96M123 90Q135 88 147 92M174 104L182 109','#fff0be',1.8,.98);
  art+=line('M69 123Q95 129 122 126M144 127Q169 129 190 121','#bd7d38',1.45,.88);
  return doc('培根汉堡',defs,art,-11);
}

function blueberryPie(){
  const defs=grad('r38-blue-pie-plate',['#faf5e9','#e7dcc3','#bfb498'])
    +grad('r38-blue-pie-crust',['#f9d18a','#e3a956','#ba7838'])
    +grad('r38-blue-pie-side',['#e5ac5d','#c78b43','#a36732'])
    +grad('r38-blue-pie-fill',['#8589d0','#6867b5','#4b458f'])
    +grad('r38-blue-berry',['#a5abe9','#747ac7','#5456a0']);
  let art=e(128,165,99,30,'url(#r38-blue-pie-plate)');
  art+=e(128,161,86,22,'#fffcef','stroke="#bbb69a" stroke-width="1.4"');
  art+=line('M46 174Q80 191 123 190M142 190Q183 188 211 171','#fffef2',1.85,.97);
  art+=p('M60 120Q65 143 74 158Q94 173 126 175Q161 176 184 158L194 122Z','url(#r38-blue-pie-side)');
  art+=line('M77 148L81 159M96 156L99 166M121 160L122 170M146 160L145 169M170 151L166 161','#a86e32',1.4,.87);
  art+=p('M61 118Q58 109 69 105Q72 96 84 97Q92 88 103 92Q114 86 125 91Q137 85 148 92Q162 88 172 98Q185 97 189 108Q200 113 193 123Q193 135 180 140Q172 149 158 146Q146 153 133 148Q120 154 108 148Q94 151 83 143Q70 143 67 133Q57 128 61 118Z','url(#r38-blue-pie-crust)');
  art+=e(128,119,55,23,'url(#r38-blue-pie-fill)','stroke="#7a633f" stroke-width="1.7"');
  art+=p('M82 118Q89 108 100 113Q109 102 120 109Q133 101 143 110Q155 105 164 114Q174 110 180 121Q169 133 151 133Q137 141 122 135Q108 140 96 132Q85 133 82 125Z','#6965b3','stroke="none"');
  // Five berries form one clustered mound inside the opening, not a scattered garnish pile.
  art+=e(117,110,11.5,10.3,'url(#r38-blue-berry)','stroke="#4e4b7d" stroke-width="1.8"');
  art+=e(138,105,12.5,10.8,'url(#r38-blue-berry)','stroke="#4e4b7d" stroke-width="1.8"');
  art+=e(154,117,11,10,'#767ac4','stroke="#4e4b7d" stroke-width="1.8"');
  art+=e(125,124,12.5,10.2,'#888cd7','stroke="#4e4b7d" stroke-width="1.8"');
  art+=e(143,128,10.5,8.7,'url(#r38-blue-berry)','stroke="#4e4b7d" stroke-width="1.7"');
  art+=p('M114 107L117 105L120 108L119 111L115 111Z','#53548e','stroke="none"');
  art+=p('M136 102L139 100L142 103L140 106L136 105Z','#53548e','stroke="none"');
  art+=p('M151 114L154 112L157 115L155 118L151 117Z','#53548e','stroke="none"');
  art+=line('M110 108L113 106M132 102L135 100M120 121L123 119M139 125L142 123','#d2d5ff',1.5,.98);
  // Three restrained pastry ribbons leave the purple fruit opening mostly visible.
  art+=p('M79 117L85 110Q109 127 133 139L124 142Q99 129 79 117Z','url(#r38-blue-pie-crust)','stroke="#a6773c" stroke-width="1.4"');
  art+=p('M144 97L152 98Q161 108 181 118L179 126Q158 115 144 97Z','url(#r38-blue-pie-crust)','stroke="#a6773c" stroke-width="1.4"');
  art+=p('M95 139Q111 120 134 96L143 96Q121 121 105 141Z','url(#r38-blue-pie-crust)','stroke="#a6773c" stroke-width="1.4"');
  art+=line('M84 115L105 128M150 101L164 113M104 133L117 117','#ffe7af',1.5,.98);
  art+=line('M71 110L75 107M90 98L96 97M161 98L167 101M180 130L183 125M111 146L118 147','#fff1c7',1.65,.96);
  art+=e(91,109,1.15,.9,'#fff4d8','stroke="none"')+e(169,130,1.25,.9,'#fff4d8','stroke="none"');
  return doc('蓝莓果派',defs,art,-9);
}

function tomatoHotDog(){
  const defs=grad('r38-red-dog-plate',['#fff9ec','#e7ddc7','#bebba0'])
    +grad('r38-red-dog-bread',['#f9d58f','#e8af62','#c48741'])
    +grad('r38-red-dog-crumb',['#ffe8b6','#f4ce8a','#dea256'])
    +grad('r38-red-dog-sausage',['#f8aa86','#e77b60','#c85e49'])
    +grad('r38-red-dog-tomato',['#ff8d6d','#ed6049','#cd4735']);
  let art=e(128,163,99,31,'url(#r38-red-dog-plate)');
  art+=e(128,159,86,23,'#fffdf1','stroke="#b8bc9f" stroke-width="1.4"');
  art+=line('M45 171Q80 191 122 190M141 190Q184 187 211 168','#fffef3',1.85,.98);
  // A gently diagonal, open bun with soft uneven ends instead of a perfect capsule.
  art+=p('M57 132Q56 116 74 110L151 86Q170 80 185 90Q199 99 195 111Q193 121 179 127L88 157Q73 160 62 149Z','url(#r38-red-dog-bread)');
  art+=p('M66 129Q67 120 80 117L152 94Q167 89 180 96Q188 100 187 109L169 117L86 144Q72 147 66 137Z','url(#r38-red-dog-crumb)','stroke="#b8803d" stroke-width="1.5"');
  art+=line('M74 118L89 114M152 90Q166 86 176 92','#fff0be',1.75,.98);
  // One glossy coral sausage, with three small roast slits rather than a sauce zigzag.
  art+=p('M76 127L163 100Q176 96 186 104Q195 111 190 120Q188 127 176 131L94 158Q82 161 75 153Q68 145 71 136Q72 130 76 127Z','url(#r38-red-dog-sausage)','stroke="#8c493a" stroke-width="2.6"');
  art+=line('M81 130L98 125M119 118L134 114M164 104Q176 100 183 108','#ffd0ab',1.9,.98);
  art+=line('M104 126L109 134M131 117L136 125M158 108L163 116','#b95c43',1.5,.92);
  // The front half of the bun shows the crumb and keeps the sausage visibly cradled.
  art+=p('M61 146Q70 137 82 143Q93 150 105 145L178 122Q190 118 197 128Q205 142 189 151L111 179Q91 185 74 174Q59 166 61 146Z','url(#r38-red-dog-bread)');
  art+=p('M67 147Q74 143 82 148Q93 156 109 151L179 129Q188 125 192 132Q191 139 179 143L108 169Q91 175 78 165Q66 159 67 147Z','url(#r38-red-dog-crumb)','stroke="#bd8b48" stroke-width="1.5"');
  art+=line('M76 151Q83 158 92 158M115 154L131 149M155 141L170 136M77 171L88 175','#fff2c5',1.7,.98);
  art+=line('M102 176L114 173M162 157L173 153','#ad7134',1.35,.86);
  // Fresh red tomato wedges sit along the two side seams, away from the sausage ends.
  art+=p('M103 146Q106 135 117 138Q123 140 128 151Q118 162 107 155Z','url(#r38-red-dog-tomato)','stroke="#9e4938" stroke-width="1.8"');
  art+=p('M107 146Q110 140 116 142L123 150Q116 156 110 151Z','#ffba82','stroke="#d96c48" stroke-width="1.25"');
  art+=p('M109 145Q112 142 115 145L116 149Q112 150 109 148Z','#db563d','stroke="none"');
  art+=p('M117 147L120 149L117 152L115 150Z','#dc593e','stroke="none"');
  art+=e(112,146,1.5,.85,'#fff0a1','stroke="none" transform="rotate(20 112 146)"');
  art+=e(117.5,149.5,1.35,.8,'#fff0a1','stroke="none" transform="rotate(-32 117.5 149.5)"');
  art+=line('M106 145Q108 140 112 140','#ffb798',1.3,.98);
  art+=p('M143 118Q146 108 156 111Q166 115 163 125L154 132Q145 127 143 118Z','url(#r38-red-dog-tomato)','stroke="#9e4938" stroke-width="1.8"');
  art+=p('M147 118Q149 113 155 115L160 121L154 127Q149 124 147 118Z','#ffbe88','stroke="#d96c48" stroke-width="1.25"');
  art+=p('M149 117Q152 114 155 117L154 121Q150 122 149 117Z','#d9543b','stroke="none"');
  art+=p('M155 122L158 121L157 124L154 125Z','#dc593e','stroke="none"');
  art+=e(152,118,1.45,.85,'#fff2a7','stroke="none" transform="rotate(-18 152 118)"');
  art+=e(155.5,123,1.25,.75,'#fff2a7','stroke="none" transform="rotate(-42 155.5 123)"');
  art+=line('M146 116Q148 112 152 112','#ffb99a',1.3,.98);
  return doc('烤肠热狗',defs,art,-8);
}

export const ovenTailCandidates=[
  {id:'dish-fresh-ico-0134',name:'焦香洋葱贝果',svg:onionBagel(),expectedOccupancy:.82,
    reason:'一只烤金环形贝果保留清楚的开孔和前侧厚度，四枚形态、大小和朝向不同的熟紫洋葱短瓣带金焦边，少量黄油薄光使面包温润诱人。',
    design:{silhouette:'一只自然饱满环形贝果，开孔可读，四枚短洋葱瓣不规则分布',angle:'三分之四俯视，面包孔洞、焦香表层和前侧厚度清楚',material:'烤金面包、鲜活熟紫洋葱、局部棕金焦边与轻黄油光',identity:'面包胚、紫洋葱、黄油，不画奶酪、长洋葱条或重复整圈',container:'浅青白陶盘，含盘82%体量，保留透明留白'}},
  {id:'dish-fresh-ico-0143',name:'汉堡包',svg:meatBurger(),expectedOccupancy:.84,
    reason:'一个紧凑饱满小汉堡，较高烤金上包、鲜绿生菜和一块肉丸压制的厚熟棕肉饼分层清楚，下包短而柔软，不添加芝士或番茄。',
    design:{silhouette:'较高圆润上包、厚肉饼与短下包叠成紧凑有层次的单个汉堡',angle:'略俯视的正侧面，面包拱面、绿叶卷边和熟肉厚度均可见',material:'金黄烤包、暖棕熟肉饼与鲜绿柔折生菜',identity:'面包胚、肉丸、生菜；肉丸压制为一块肉饼，不加番茄、芝士或培根',container:'浅暖白小圆盘，含盘84%体量，主体居中'}},
  {id:'dish-fresh-ico-0157',name:'蒜香黄油帝王蟹',svg:butterKingCrab(),expectedOccupancy:.84,
    reason:'一小段宽厚蟹身搭配两段长宽约2至3比1的粗壮帝王蟹腿，腿节、关节和小壳刺清楚，近侧断口露白嫩熟肉，少量蒜片与融油光承托烤红橙蟹壳。',
    design:{silhouette:'一小段宽厚蟹身与两段有长度的粗蟹腿，方向不同且关节明显，不堆小碎段',angle:'三分之四俯视，宽壳、关节、较长粗腿和一处白嫩熟肉断口分层',material:'红橙熟蟹壳、奶白蟹肉、浅蒜色与温润黄油光',identity:'帝王蟹、大蒜、黄油，两段腿局部长宽约2至3比1，不画整只八爪或细腿，不添加葱叶或柠檬',container:'浅青白椭圆盘，含盘84%体量，完整透明边缘'}},
  {id:'dish-fresh-ico-0158',name:'培根汉堡',svg:baconBurger(),expectedOccupancy:.84,
    reason:'一个低矮宽圆的烤金汉堡夹两片紧凑红棕培根，奶白脂纹沿自然卷折延伸，鲜绿生菜承托；宽低上包与DS74高包厚肉饼构成明确区别。',
    design:{silhouette:'低矮宽圆上包、两片短宽培根与卷边生菜，单个紧凑汉堡',angle:'略俯视正侧面，能看清两片培根和鲜绿叶边',material:'烤金柔包、红棕培根、奶白熟脂纹与鲜绿生菜',identity:'面包胚、培根、生菜，不画肉饼、芝士或番茄',container:'浅米白小圆盘，含盘84%体量，与DS74高低和结构不同'}},
  {id:'dish-fresh-ico-0161',name:'蓝莓果派',svg:blueberryPie(),expectedOccupancy:.84,
    reason:'一只金酥小圆派，开口内蓝紫果馅与五颗聚拢蓝莓清亮饱满，三条克制酥皮格带保留果馅面积，少量糖光衬出酥脆而不堆装饰。',
    design:{silhouette:'单个小圆派，金酥卷边与宽阔果馅开口，几颗蓝莓紧密聚拢',angle:'三分之四俯视，酥皮厚侧、开口和少量格带有层次',material:'金黄酥皮、活泼蓝紫莓果馅、淡蓝果霜与轻糖光',identity:'蓝莓、酥皮、砂糖，不添加柠檬、薄荷或大堆装饰',container:'浅暖白圆盘，含盘84%体量，果馅与金酥皮对比清楚'}},
  {id:'dish-fresh-ico-0162',name:'烤肠热狗',svg:tomatoHotDog(),expectedOccupancy:.82,
    reason:'一个略斜、长短适中的开口烤金面包托起单根油润珊瑚红烤肠，两枚鲜红半圆番茄楔形分置侧缝，露出籽腔和淡黄籽，不像肠端切面。',
    design:{silhouette:'一只略斜的自然开口面包，一根短长适中烤肠，两枚番茄楔形沿两侧缝分布',angle:'三分之四俯视，前侧面包内芯、烤肠和番茄籽腔清楚',material:'金烤包与暖黄内芯、油亮珊瑚红肠、鲜红番茄肉和淡黄籽',identity:'面包胚、香肠、番茄；番茄避开烤肠两端，不添加芝士、绿叶或鸡蛋，与纯热狗区分',container:'浅米白椭圆盘，含盘82%体量，透明留白与斜向动势'}}
];

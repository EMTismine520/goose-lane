// Round 36: one scallop refinement and five individually composed grill dishes.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 成品新版</title><defs>${defs}</defs><g stroke="#49372c" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function naturalScallops(){
  const defs=grad('g36-scallop-plate',['#f6fbef','#d5e6d7','#9fc6b9'])
    +grad('g36-scallop-meat',['#fffbe8','#f6e7c9','#ddc49a'])
    +grad('g36-scallop-crust',['#e8bd72','#ce9448','#ac7039'])
    +grad('g36-scallop-lemon',['#ffe780','#f0c344','#d29930']);
  let art=e(128,160,97,30,'url(#g36-scallop-plate)');
  art+=e(128,154,98,29,'#fbfcf0');
  art+=e(128,154,84,21,'#dce9d2','stroke="#a8bea4" stroke-width="1.35"');
  art+=line('M48 169Q75 183 114 184M148 184Q181 182 209 167','#fffef0',2.1,.95);
  art+=e(127,153,65,15,'#b7955c','stroke="none" opacity=".14"');
  // Rounded cooked muscle, with broken seared patches rather than a complete crust ring.
  art+=p('M67 114Q65 100 77 94Q87 87 100 91Q114 87 122 100L124 115Q122 129 109 134Q92 140 78 130Q68 128 67 114Z','url(#g36-scallop-meat)');
  art+=p('M68 116Q71 123 79 126L85 131L81 133Q71 130 68 121ZM109 131Q119 125 122 116L121 125L115 131Z','url(#g36-scallop-crust)','stroke="none"');
  art+=p('M72 111Q71 102 81 98Q91 93 101 97Q113 94 118 104Q117 116 105 121Q90 127 78 120Z','#fff9e5','stroke="none"');
  art+=line('M77 105Q84 98 94 100M99 101Q109 101 112 107','#fffef3',2,.97);
  art+=line('M77 117L81 120M89 126L95 128M108 127L112 123','#ad7c44',1.3,.82);
  art+=line('M86 109Q88 115 94 117M100 107Q101 113 104 115','#dfd0ae',1.3,.85);
  // A softer asymmetrical piece at the back right, with a folded edge and pale fibres.
  art+=p('M132 109Q130 96 142 92Q155 84 169 93Q182 94 184 108L181 123Q176 138 161 139Q145 140 135 129Z','url(#g36-scallop-meat)');
  art+=p('M135 121L141 129L147 131L146 135Q136 132 135 125ZM167 135Q175 131 179 124L178 131L172 136Z','url(#g36-scallop-crust)','stroke="none"');
  art+=p('M136 109Q134 101 146 98Q157 90 167 97Q179 99 178 109Q175 121 162 124Q147 127 138 119Z','#fff9e8','stroke="none"');
  art+=line('M142 105Q150 97 160 100M167 103L172 106','#fffef5',2,.96);
  art+=line('M147 112Q150 116 155 118M162 110L165 116','#e1d1ac',1.3,.86);
  art+=p('M177 116L182 111L181 118L178 122L175 121Z','#d7a15b','stroke="none" opacity=".8"');
  // The front scallop is broad and slightly torn at one corner, never straight sided.
  art+=p('M93 146Q89 133 100 126Q111 118 124 122Q137 116 149 127Q158 133 156 146L151 159Q141 171 124 172Q107 172 97 161L98 155Z','url(#g36-scallop-meat)');
  art+=p('M96 150Q100 158 108 161L112 168L107 166Q98 164 96 155ZM138 168Q149 162 154 151L153 160L147 166L142 170Z','url(#g36-scallop-crust)','stroke="none"');
  art+=p('M98 140Q98 131 108 129Q119 123 128 128Q140 124 148 134Q152 143 143 150Q132 157 117 153Q104 153 98 146Z','#fff9e7','stroke="none"');
  art+=line('M105 138Q113 130 123 133M132 133Q140 132 144 139','#fffef3',2.1,.96);
  art+=line('M109 143Q112 148 117 149M124 138Q128 144 134 146','#e1d0a8',1.3,.86);
  art+=line('M103 159L107 162M145 163L148 159','#b88950',1.35,.72);
  // One restrained lemon wedge is the sole added ingredient.
  art+=p('M175 151L190 132Q203 140 206 154Q194 167 178 163Z','url(#g36-scallop-lemon)','stroke-width="2.4"');
  art+=p('M180 151L191 138Q200 144 200 153Q191 160 182 159Z','#fff0b4','stroke="#d1aa49" stroke-width="1.3"');
  art+=line('M191 141L185 155L197 150','#e8c25e',1.35,.94);
  return doc('酥炸扇贝',defs,art);
}

function grilledSausages(){
  const defs=grad('g36-sausage-plate',['#f8e9ce','#e0bc92','#ba8e67'])
    +grad('g36-sausage-skin',['#edb174','#cd7c42','#9b4c2d'])
    +grad('g36-sausage-cut',['#e8ac85','#cc8669','#ac604d'])
    +grad('g36-sausage-pepper',['#fa8d62','#e15c3e','#b63d2c']);
  let art=e(128,157,96,32,'url(#g36-sausage-plate)');
  art+=e(128,151,97,30,'#fff7e6');
  art+=e(128,151,83,22,'#e7d4b6','stroke="#c7a784" stroke-width="1.35"');
  art+=line('M48 167Q79 184 114 183M147 183Q181 181 208 166','#fff9e9',2.1,.94);
  art+=e(130,151,67,15,'#a56c41','stroke="none" opacity=".18"');
  // Back sausage: a short curved body, rounded at the far end and diagonally cut near end.
  art+=p('M67 117Q56 110 62 98Q69 85 83 92Q107 108 137 108Q151 105 156 117Q161 129 146 134Q102 139 67 117Z','url(#g36-sausage-skin)');
  art+=p('M66 102Q69 96 77 99Q107 119 139 116Q145 114 149 119','#f4cc8e','stroke="none" opacity=".72"');
  art+=line('M85 101Q81 109 83 117M108 112Q104 118 107 127M131 114Q129 123 132 130','#87482d',2.2,.9);
  art+=line('M87 102L92 110M111 112L116 120','#e5a262',1.4,.9);
  art+=p('M142 112Q153 107 157 118Q160 128 148 131Q141 125 142 112Z','url(#g36-sausage-cut)','stroke="#7a452f" stroke-width="2.1"');
  art+=e(149,120,2.6,1.7,'#f2c5a1','stroke="none"');
  // The front link bends in the opposite direction; no square end pieces or extra blocks.
  art+=p('M93 151Q80 147 83 134Q88 121 103 126Q139 141 171 125Q185 117 193 129Q200 141 185 150Q140 174 93 151Z','url(#g36-sausage-skin)');
  art+=p('M96 130Q128 146 165 133Q176 128 183 129L187 133Q176 135 167 140Q129 155 95 138Z','#f4c38a','stroke="none" opacity=".76"');
  art+=line('M111 133Q106 141 109 150M137 141Q133 149 137 158M165 134Q163 143 168 149','#87472b',2.2,.93);
  art+=line('M114 135L119 143M141 141L146 149M170 132L174 139','#e4a165',1.4,.9);
  art+=p('M88 132Q96 126 105 135Q108 144 99 151Q87 150 85 141Z','url(#g36-sausage-cut)','stroke="#7a452f" stroke-width="2.1"');
  art+=e(96,139,3.1,2.2,'#efbd98','stroke="none"');
  art+=e(98,145,1.5,1.1,'#8f4f3c','stroke="none"');
  art+=line('M179 146L185 142','#6e3b29',1.5,.83);
  art+=p('M63 141L70 135L78 140L80 149L72 155L65 151Z','url(#g36-sausage-pepper)','stroke-width="2.3"');
  art+=p('M171 161L179 155L188 159L190 166L181 172L174 168Z','url(#g36-sausage-pepper)','stroke-width="2.3"');
  art+=line('M68 140L73 142M177 160L183 161','#ffbc89',1.4,.96);
  return doc('孜然烤肉肠',defs,art);
}

function vegetableSkewers(){
  const defs=grad('g36-skewer-plate',['#f8f7e5','#e2e2c8','#b9c5ab'])
    +grad('g36-skewer-red',['#fb9b68','#e57048','#bc4530'])
    +grad('g36-skewer-yellow',['#fbe28a','#edbf59','#c68b38'])
    +grad('g36-skewer-cap',['#e4c598','#c49a68','#987043'])
    +grad('g36-skewer-stem',['#fff2d5','#e9d4b0','#c4aa80'])
    +grad('g36-skewer-aubergine',['#b291b2','#876781','#624a65']);
  let art=e(128,157,98,31,'url(#g36-skewer-plate)');
  art+=e(128,151,99,30,'#fcfbed');
  art+=e(128,151,84,22,'#e3e7cc','stroke="#b2be9d" stroke-width="1.35"');
  art+=line('M47 166Q78 182 113 181M148 181Q184 178 211 164','#fffef3',2.1,.95);
  // Two compact, gently slanted sticks support three recognisable vegetables each.
  art+=line('M57 137L191 103','#a3784c',3.3,1);
  art+=line('M70 168L206 131','#a3784c',3.3,1);
  art+=line('M59 136L187 104M72 167L202 132','#e2bc81',1.25,.9);
  // Back mushroom, its cap and pale stem read separately from pepper and aubergine.
  art+=p('M77 119L85 115L92 128L84 135Z','url(#g36-skewer-stem)','stroke-width="2.2"');
  art+=p('M67 119Q65 103 80 98Q96 95 104 111L101 117Q82 123 67 119Z','url(#g36-skewer-cap)','stroke-width="2.6"');
  art+=line('M73 110Q78 102 88 104','#f6dcad',1.7,.95);
  art+=line('M71 117L80 117M91 114L98 112','#8b653e',1.3,.82);
  // Back aubergine has purple skin and a warm pale seeded cut face.
  art+=p('M111 103L127 97L141 105L137 125L120 131L108 121Z','url(#g36-skewer-aubergine)','stroke-width="2.6"');
  art+=p('M112 104L126 101L135 108L130 121L118 125L112 118Z','#eadbb4','stroke="#a0926c" stroke-width="1.25"');
  art+=line('M117 110L119 112M125 108L126 111M121 118L123 119','#bda46c',1.25,.92);
  // Back red pepper is a folded fleshy block with a hollow centre.
  art+=p('M150 100L167 94L180 103L176 119L160 125L147 115Z','url(#g36-skewer-red)','stroke-width="2.6"');
  art+=p('M155 103L166 100L173 105L170 115L161 118L153 112Z','#e8a16a','stroke="#ae5736" stroke-width="1.25"');
  art+=line('M153 102L161 99M160 121L170 118','#ffd09a',1.55,.95);
  // Front yellow pepper, one side curled, retains a distinct open corner.
  art+=p('M87 140L103 132L117 140L114 158L99 164L84 155Z','url(#g36-skewer-yellow)','stroke-width="2.6"');
  art+=p('M92 142L103 138L110 143L106 154L98 157L91 152Z','#ffeaa0','stroke="#c89c45" stroke-width="1.25"');
  art+=line('M88 149L91 157M107 136L113 140','#b68037',1.4,.9);
  // Front mushroom is wider and turned; the gills are visible beneath its cap.
  art+=p('M134 147L147 142L151 156Q145 162 137 157Z','url(#g36-skewer-stem)','stroke-width="2.2"');
  art+=p('M126 143Q129 125 145 125Q162 125 167 140Q151 152 126 148Z','url(#g36-skewer-cap)','stroke-width="2.6"');
  art+=p('M127 144Q146 151 166 140L165 146Q148 156 128 149Z','#b68b5a','stroke="#8b663d" stroke-width="1.25"');
  art+=line('M134 135Q141 129 151 132','#f6d9a7',1.8,.95);
  art+=line('M134 147L138 149M147 146L148 150M159 142L160 146','#8e673b',1.25,.88);
  // Front aubergine is cut diagonally, with a small purple folded skin edge.
  art+=p('M176 135L188 124L201 130L206 144L195 155L180 151Z','url(#g36-skewer-aubergine)','stroke-width="2.6"');
  art+=p('M179 135L189 129L198 134L201 143L194 149L183 146Z','#eee1b7','stroke="#9c8c67" stroke-width="1.25"');
  art+=line('M185 136L187 138M192 135L193 138M188 143L191 144','#bda46b',1.25,.9);
  art+=line('M178 143L180 148M197 128L201 132','#674854',1.5,.86);
  return doc('风味蔬菜烤串',defs,art);
}

function pepperRibs(){
  const defs=grad('g36-ribs-board',['#e9c58e','#cda167','#ac7849'])
    +grad('g36-ribs-meat',['#dda072','#ba6a42','#8d432d'])
    +grad('g36-ribs-edge',['#edb680','#ce8153','#a75536'])
    +grad('g36-ribs-bone',['#fff2d8','#ebd4b2','#c6a27c'])
    +grad('g36-ribs-pepper',['#f5875a','#dd5838','#ad3629']);
  let art=p('M35 140L181 115L222 140L219 166L76 198L36 178Z','url(#g36-ribs-board)');
  art+=p('M35 140L180 117L222 140L77 174Z','#edca93');
  art+=line('M77 174L76 198','#8e613c',1.7,.8);
  art+=line('M55 145L99 138M130 132L171 126M91 164L136 155M155 151L201 141','#c7955e',1.4,.65);
  art+=e(129,150,65,15,'#94542e','stroke="none" opacity=".14"');
  // Three short ribs, individually shaped, with only small bone tips exposed.
  art+=p('M68 121L61 115Q57 110 62 106L66 104Q72 104 72 110L78 116Z','url(#g36-ribs-bone)','stroke-width="2.3"');
  art+=p('M66 119L87 109Q94 107 100 113L112 125L107 145Q104 151 96 153L77 159L63 145Q59 139 62 130Z','url(#g36-ribs-meat)');
  art+=p('M65 120L88 112Q94 111 99 116L108 125L89 136Q82 140 76 134L63 126Z','url(#g36-ribs-edge)','stroke="#a7613b" stroke-width="1.35"');
  art+=line('M70 121L83 116M94 115L102 122','#f3c38d',1.6,.93);
  art+=line('M69 139L77 147M88 150L101 145','#713c2a',1.8,.85);
  art+=line('M77 136L86 140L103 132','#e4ad7e',1.35,.86);
  art+=p('M133 112L133 99Q132 94 138 93L142 95Q147 98 142 102L144 112Z','url(#g36-ribs-bone)','stroke-width="2.3"');
  art+=p('M117 115L139 105Q146 103 151 109L165 121L162 140Q159 146 151 149L132 157L116 142Q112 137 115 127Z','url(#g36-ribs-meat)');
  art+=p('M118 116L140 109Q145 107 150 112L160 121L141 133Q136 136 130 132L116 123Z','url(#g36-ribs-edge)','stroke="#a7613b" stroke-width="1.35"');
  art+=line('M125 116L137 112M148 111L155 118','#f4c38d',1.6,.94);
  art+=line('M122 136L131 145M143 149L156 142','#713b29',1.8,.86);
  art+=line('M130 133L138 137L157 128','#e6b181',1.35,.87);
  art+=p('M175 144L181 133Q183 128 188 132L191 132Q196 137 189 140L185 149Z','url(#g36-ribs-bone)','stroke-width="2.3"');
  art+=p('M146 148L166 135Q172 132 179 138L193 151L192 168Q187 174 180 177L163 185L146 171Q141 166 143 157Z','url(#g36-ribs-meat)');
  art+=p('M147 148L168 138Q173 136 178 141L188 151L169 164Q162 167 157 161L145 155Z','url(#g36-ribs-edge)','stroke="#a7613b" stroke-width="1.35"');
  art+=line('M154 148L166 142M177 141L184 148','#f4c48c',1.6,.94);
  art+=line('M150 167L160 177M173 178L186 171','#713b29',1.8,.85);
  art+=line('M158 162L166 167L186 157','#e5af7d',1.35,.86);
  art+=p('M104 159L111 152L121 157L124 164L115 172L107 168Z','url(#g36-ribs-pepper)','stroke-width="2.3"');
  art+=p('M183 117L190 111L198 116L198 124L190 127L184 123Z','url(#g36-ribs-pepper)','stroke-width="2.2"');
  art+=line('M110 158L117 160M188 116L193 118','#ffbf8b',1.3,.94);
  return doc('孜然椒盐排骨',defs,art);
}

function smokedPork(){
  const defs=grad('g36-pork-plate',['#d4dfd9','#9eb8b1','#718f8b'])
    +grad('g36-pork-meat',['#d8a078','#bd7854','#92503c'])
    +grad('g36-pork-fat',['#fff0d4','#eccfa7','#cda37b'])
    +grad('g36-pork-skin',['#c68448','#9f5c34','#73412c'])
    +grad('g36-pork-leaf',['#a9c17d','#7a9f5a','#517440']);
  let art=p('M35 141Q39 131 53 127L181 115Q207 114 220 131L220 153Q215 172 193 180L77 191Q52 191 41 174Z','url(#g36-pork-plate)');
  art+=p('M37 140Q44 133 57 132L182 120Q204 120 215 133L212 146Q206 157 188 164L78 178Q58 178 47 166Z','#edf2e8');
  art+=p('M57 142L181 130Q195 129 203 138L200 145Q194 151 182 154L80 167Q66 167 59 158Z','#c6d3c4','stroke="#8da79a" stroke-width="1.35"');
  art+=line('M52 174Q65 183 82 181L186 169','#edf8eb',2.1,.94);
  // Two thick cooked belly slices show distinct fat and meat, with a dark roasted skin edge.
  art+=p('M69 104L126 91L155 111L151 140L94 153L69 137Z','url(#g36-pork-meat)');
  art+=p('M70 106L94 122L152 110L151 119L93 132L70 116Z','url(#g36-pork-fat)','stroke="#b28661" stroke-width="1.3"');
  art+=p('M70 126L94 140L151 128L151 136L94 149L70 135Z','url(#g36-pork-fat)','stroke="#ae805d" stroke-width="1.3"');
  art+=p('M69 104L126 91L155 111L95 125Z','url(#g36-pork-skin)');
  art+=p('M78 105L125 96L142 108L96 117Z','#dcaa6f','stroke="none" opacity=".74"');
  art+=line('M89 103L97 114M110 98L119 109M131 102L139 109','#6d3c29',1.9,.87);
  art+=line('M73 118L87 127M97 133L143 123','#f5ddbb',1.45,.95);
  art+=p('M109 137L164 123L192 144L190 172L134 186L109 169Z','url(#g36-pork-meat)');
  art+=p('M110 139L134 155L191 143L190 152L134 166L110 150Z','url(#g36-pork-fat)','stroke="#b0845f" stroke-width="1.3"');
  art+=p('M110 159L134 174L190 162L190 169L134 183L110 167Z','url(#g36-pork-fat)','stroke="#ab7d59" stroke-width="1.3"');
  art+=p('M109 137L164 123L192 144L134 158Z','url(#g36-pork-skin)');
  art+=p('M118 137L164 128L179 141L135 150Z','#dba56d','stroke="none" opacity=".74"');
  art+=line('M128 135L136 148M149 129L158 142M171 134L178 141','#6e3c2a',1.9,.89);
  art+=line('M115 150L128 159M138 168L182 157','#f7dfbc',1.45,.95);
  // Two small aromatic leaves, kept to the side rather than covering the meat bands.
  art+=p('M72 157Q78 146 94 151Q94 166 80 168Q73 166 72 157Z','url(#g36-pork-leaf)','stroke="#4a6738" stroke-width="2.2"');
  art+=line('M76 163L91 153M82 159L83 154','#cee0a0',1.3,.94);
  art+=p('M77 152Q70 143 74 133Q88 136 87 148Q84 153 77 152Z','url(#g36-pork-leaf)','stroke="#4a6738" stroke-width="2.1"');
  art+=line('M79 150L76 137','#d1e1a1',1.3,.94);
  return doc('炭烧熏肉',defs,art);
}

function grilledMushrooms(){
  const defs=grad('g36-mushroom-plate',['#fff8e6','#edddbc','#c9b18b'])
    +grad('g36-mushroom-cap',['#ddb786','#bd8c5a','#92643e'])
    +grad('g36-mushroom-gills',['#d7bd91','#b7976a','#8e6d48'])
    +grad('g36-mushroom-stem',['#fff0cf','#e8d0a7','#c5a57b'])
    +grad('g36-mushroom-basil',['#a9cf71','#72a64b','#477a36']);
  let art=e(128,157,97,31,'url(#g36-mushroom-plate)');
  art+=e(128,151,98,29,'#fff9e9');
  art+=e(128,151,83,21,'#e3d6b1','stroke="#c2b28d" stroke-width="1.35"');
  art+=line('M48 168Q79 183 114 182M147 182Q182 180 209 165','#fffdf0',2.1,.94);
  // Back left: a smaller upright mushroom with its stem visible.
  art+=p('M78 116L93 112L102 139Q96 148 85 141Z','url(#g36-mushroom-stem)','stroke-width="2.6"');
  art+=p('M62 116Q60 93 81 85Q104 79 119 101L120 111Q91 127 62 116Z','url(#g36-mushroom-cap)');
  art+=p('M63 113Q88 123 119 108L120 114Q93 129 63 119Z','url(#g36-mushroom-gills)','stroke="#8d663f" stroke-width="1.4"');
  art+=line('M72 102Q79 89 91 91M101 95L107 101','#f0d2a2',1.9,.95);
  art+=line('M71 117L77 120M84 119L88 123M99 116L102 120M111 112L114 116','#795633',1.25,.9);
  art+=line('M84 126L87 137','#f7e6c3',1.5,.94);
  // Back right: a broad tilted cap exposes a fan of gills and a short bent stem.
  art+=p('M154 120L167 116L171 141Q165 150 154 144L150 137Z','url(#g36-mushroom-stem)','stroke-width="2.6"');
  art+=p('M127 119Q128 95 149 89Q174 81 193 102L199 116Q165 136 127 119Z','url(#g36-mushroom-cap)');
  art+=p('M128 117Q158 126 196 113L198 120Q164 140 128 124Z','url(#g36-mushroom-gills)','stroke="#8d653d" stroke-width="1.4"');
  art+=line('M140 104Q147 94 161 95M172 97L181 102','#f1d5a6',1.9,.95);
  art+=line('M139 123L145 129M153 123L157 132M169 121L170 130M183 118L185 124','#7f5935',1.25,.92);
  art+=line('M156 130L159 140','#f4dfb9',1.5,.94);
  // Front mushroom lies on its side: curved cap, pale cut stem and a different silhouette.
  art+=p('M102 149Q94 133 108 122Q121 112 138 121Q153 129 156 145Q146 165 125 169Q109 168 102 157Z','url(#g36-mushroom-cap)');
  art+=p('M104 147Q116 133 132 139Q145 143 151 151Q142 165 125 166Q111 165 105 156Z','url(#g36-mushroom-gills)','stroke="#87603b" stroke-width="1.4"');
  art+=line('M108 136Q112 124 124 125M134 126L141 131','#f3d5a4',1.8,.94);
  art+=line('M111 148L117 153M119 143L124 152M131 143L132 153M141 148L140 157','#7c5836',1.3,.92);
  art+=p('M120 153L139 146Q151 148 158 159L154 170Q146 175 138 171L122 165Z','url(#g36-mushroom-stem)','stroke-width="2.6"');
  art+=p('M144 155Q152 152 156 159L153 166Q147 169 141 164Z','#f9e8c4','stroke="#bda074" stroke-width="1.25"');
  art+=line('M124 157L136 160','#fff0ce',1.5,.96);
  // Two small basil leaves are the only green accent.
  art+=p('M175 153Q180 139 196 141Q198 156 185 160Q177 160 175 153Z','url(#g36-mushroom-basil)','stroke="#456934" stroke-width="2.2"');
  art+=line('M179 155L192 144M185 149L185 144','#cae596',1.3,.95);
  art+=p('M172 155Q162 147 168 136Q183 137 183 148Q180 154 172 155Z','url(#g36-mushroom-basil)','stroke="#456934" stroke-width="2.2"');
  art+=line('M174 152L171 140','#cee69b',1.3,.95);
  return doc('炭烧鲜菇',defs,art);
}

export const grillFrontCandidates=[
  {id:'dish-fresh-ico-0068',name:'酥炸扇贝',svg:naturalScallops(),expectedOccupancy:.82,
    reason:'三块自然不齐的厚扇贝肉露出暖白熟切面，柔和肌理与断续金黄酥边表现鲜嫩；外形短厚圆润，避免整齐直筒与重复包圈纹。',
    design:{silhouette:'三块独立不规则厚贝肉，宽窄、轮廓与边角均不同',angle:'三分之四俯视，能看见圆润切面与柔和厚度',material:'暖白熟贝肉、浅奶油纤维、局部金黄酥边，只有少量焦色',identity:'只呈扇贝、面粉与一角小柠檬，贝肉不画成规整圆柱或甜点',container:'青绿白精致浅盘，整体82%体量，盛器与贝肉留白清楚'}},
  {id:'dish-fresh-ico-0027',name:'孜然烤肉肠',svg:grilledSausages(),expectedOccupancy:.82,
    reason:'两条短粗烤肠自然弯曲，斜切口、饱满棕金肠衣与少量深炭纹拉开层次；端头保持圆润，小红椒作克制点缀。',
    design:{silhouette:'两条弯向不同的短粗烤肠，切口为连续圆润斜面，没有额外方块',angle:'三分之四俯视，前肠可见斜切面，后肠有自然弯曲',material:'棕金肠衣、暖红熟切面、轻油润高光和清楚炭纹',identity:'香肠与红椒，两个主体紧凑摆放',container:'暖陶色白心浅圆盘，整体82%体量，主料不溢出盘沿'}},
  {id:'dish-fresh-ico-0028',name:'风味蔬菜烤串',svg:vegetableSkewers(),expectedOccupancy:.82,
    reason:'两根短签紧凑错落，每根保留彩椒、蘑菇与茄子：彩椒有折角与空心，蘑菇有帽和短柄，茄子露浅色籽面与紫皮。',
    design:{silhouette:'两根略斜短签，每根三块可辨主料，避免长串与重复方块堆叠',angle:'俯视略带侧面，蔬菜切面与短签端头清楚可见',material:'红黄彩椒果肉、褐金熟菇帽、奶白菇柄、茄子紫皮与暖白籽面',identity:'彩椒、蘑菇、茄子都有独立形态，不以换色块替代食材',container:'青白浅盘，整体82%体量，两串保持间隙和自然重叠'}},
  {id:'dish-fresh-ico-0035',name:'孜然椒盐排骨',svg:pepperRibs(),expectedOccupancy:.82,
    reason:'三块短排各有形态，棕红烤色、轻焦边和少量露出的骨端清楚分层；小红椒点亮木板一侧，摆盘克制饱满。',
    design:{silhouette:'三块错落短排，骨端短小自然，每块轮廓不同',angle:'三分之四俯视，可见厚肉、短骨端与木板侧边',material:'棕红熟肉、金暖煎面、轻焦边与象牙骨端',identity:'排骨与少量红椒，固定三块主体，不堆放大量骨头',container:'暖木色小料理板，整体82%体量，简洁木纹衬托肉色'}},
  {id:'dish-fresh-ico-0036',name:'炭烧熏肉',svg:smokedPork(),expectedOccupancy:.82,
    reason:'两片厚切熟五花错落前后，奶白脂肪带、暖棕肉层与深棕炭边清楚相间；两片小香叶只在侧边点缀。',
    design:{silhouette:'两片厚切五花前后交叠，保持可读切面与整齐肉脂层次',angle:'三分之四俯视，同时呈现炭烤表面和厚肉切面',material:'熟五花肉脂带、深棕烤皮、金暖炭纹与轻润高光',identity:'只呈五花肉与混合香叶，两片肉为视觉主体',container:'青灰白色长盘，整体82%体量，冷暖对比衬出五花肉'}},
  {id:'dish-fresh-ico-0039',name:'炭烧鲜菇',svg:grilledMushrooms(),expectedOccupancy:.82,
    reason:'三朵蘑菇分别直立、侧转与横放，帽面、菌褶和短柄一眼分明；金棕熟色与轻焦边配两片小罗勒，避免蘑菇复制排队。',
    design:{silhouette:'三朵不同轮廓与朝向的熟蘑菇，前方横菇露出切柄',angle:'三分之四俯视，帽面、菌褶与菌柄分层可见',material:'金棕熟菇帽、浅褐菌褶、暖白菌柄和克制焦纹',identity:'蘑菇与两片小罗勒，无其它配料，三朵各有形态',container:'奶白暖色浅圆盘，整体82%体量，盘沿清楚且主次自然'}}
];

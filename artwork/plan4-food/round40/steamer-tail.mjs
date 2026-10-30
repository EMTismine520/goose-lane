// Round 40: four steam dishes, each with its own ingredient-specific silhouette.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".15" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 蒸锅成品新版</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
const scallion=(x,y,a=0)=>`<g transform="translate(${x} ${y}) rotate(${a})">${e(0,0,3.7,2.4,'#74b845','stroke="#4b7939" stroke-width="1.3"')}${e(0,0,1.8,1,'#e5f2ac','stroke="none"')}</g>`;

function shrimpPorkDumplings(){
  const defs=grad('r40-d87-plate',['#fafff3','#e4efe6','#a8c8c4'])
    +grad('r40-d87-skin',['#fffdf0','#f4e8cb','#d8c5a0'])
    +grad('r40-d87-fold',['#fffef4','#ede1c5','#d4bd98'])
    +grad('r40-d87-shrimp',['#ffbe96','#ed987b','#d77d66'])
    +grad('r40-d87-pork',['#d5b493','#bd9172','#a4775e']);
  let art=e(128,167,101,31,'url(#r40-d87-plate)');
  art+=e(128,162,88,23,'#fffdf0','stroke="#afc7ba" stroke-width="1.45"');
  art+=line('M44 174Q76 193 117 192M143 191Q187 188 212 171','#fbfff7',1.8);
  art+=e(126,159,70,18,'#827249','stroke="none" opacity=".12"');

  // Small rear crescent: opaque, softly swollen dough, with three loose pleats.
  let rear=p('M-39 4Q-36-13-22-22Q-16-27-11-22Q-3-28 5-23Q14-25 20-17Q31-14 38-1Q42 8 30 18Q13 27-8 23Q-31 22-39 10Z','url(#r40-d87-skin)');
  rear+=p('M-36 5Q-28-9-19-12Q-12-20-5-16Q4-22 10-14Q20-17 27-8L36 1Q23-4 17 0Q7-7-1-1Q-12-7-20 1Q-29-1-36 8Z','url(#r40-d87-fold)','stroke="none"');
  rear+=line('M-24-13Q-20-4-20 2M-10-20Q-9-10-4-3M7-20Q7-10 14-5','#b9a586',1.5);
  rear+=line('M-27 7Q-16 16-2 17M7 18L17 17M-31 1Q-29-5-24-8','#fffdf0',1.6,.96);
  art+=`<g transform="translate(87 122) rotate(-20) scale(.94)">${rear}</g>`;

  // A broader second crescent leans to the other side; its edge is not repeated.
  let right=p('M-38 6Q-33-8-24-15Q-15-26-7-21Q3-29 11-20Q19-22 26-11Q37-7 39 7Q40 17 23 23Q6 28-14 23Q-32 21-38 11Z','url(#r40-d87-skin)');
  right+=p('M-34 3Q-23-10-15-12Q-7-23 0-16Q8-24 16-13Q25-13 32-4L37 6Q27 1 20 4Q12-4 4 2Q-6-4-15 2Q-25-1-34 8Z','url(#r40-d87-fold)','stroke="none"');
  right+=line('M-18-17Q-16-7-12-2M-3-21Q-1-10 5-5M14-18Q15-9 22-4','#bda789',1.5);
  right+=line('M-26 9Q-9 20 9 19M17 18L25 15M-25-5L-19-10','#fffef1',1.65,.98);
  art+=`<g transform="translate(165 119) rotate(14)">${right}</g>`;

  // The third dumpling is cut once: a thick ivory lip surrounds distinct shrimp and pork.
  art+=p('M71 157Q72 143 85 134Q91 126 100 130Q108 122 119 130Q129 128 139 139L157 153L153 173Q136 186 111 183Q86 184 73 171Z','url(#r40-d87-skin)');
  art+=p('M75 154Q84 141 94 140Q103 131 112 138Q119 133 129 141L141 151Q127 146 118 153Q107 146 98 153Q87 150 76 160Z','url(#r40-d87-fold)','stroke="none"');
  art+=line('M92 134Q93 143 98 147M108 130Q108 140 115 145M123 135Q124 143 131 148','#bda789',1.45);
  art+=line('M83 164Q96 176 112 176M120 177L129 175','#fffef2',1.7);
  art+=p('M151 148Q166 150 171 163Q170 179 155 183Q143 179 139 165Q140 154 151 148Z','#fff5df','stroke="#6e5a45" stroke-width="2.5"');
  art+=p('M151 153Q161 154 166 164Q165 174 156 178Q147 175 144 165Q145 157 151 153Z','#c6a07f','stroke="#9b775d" stroke-width="1.3"');
  art+=p('M148 158Q153 151 160 158L163 163Q158 169 151 166Z','url(#r40-d87-shrimp)','stroke="#bd765f" stroke-width="1.3"');
  art+=p('M149 166Q155 163 159 169L158 176Q151 176 148 172Z','url(#r40-d87-pork)','stroke="#90664d" stroke-width="1.25"');
  art+=p('M160 167Q165 163 166 170L162 175L158 173Z','url(#r40-d87-shrimp)','stroke="#bd765f" stroke-width="1.2"');
  art+=line('M151 158L155 157M153 171L155 172','#ffe1bc',1.3);
  art+=line('M142 163Q144 154 151 151','#fffdf1',1.65);
  return doc('三鲜虾肉饺子',defs,art);
}

function soupDumplings(){
  const defs=grad('r40-d88-bamboo',['#e9c98d','#cc9f60','#b18449'])
    +grad('r40-d88-bamboo-top',['#f7dfa8','#e3c184','#c69d60'])
    +grad('r40-d88-skin',['#fffdf2','#f4e6c8','#d8c19b'])
    +grad('r40-d88-fold',['#fffcf0','#eaddbd','#cbb28c'])
    +grad('r40-d88-meat',['#d2a883','#b98560','#996745'])
    +grad('r40-d88-soup',['#f6d38b','#d7a660','#bd8a49']);
  let art=p('M27 153L29 174Q33 191 77 199Q127 207 176 198Q223 190 228 173L229 153Z','url(#r40-d88-bamboo)');
  art+=e(128,153,101,30,'url(#r40-d88-bamboo-top)');
  art+=e(128,151,87,23,'#f7edd0','stroke="#aa834e" stroke-width="1.5"');
  art+=line('M43 171Q78 190 118 190M140 190Q185 185 214 169','#f9dfaa',1.65);
  art+=line('M40 180L41 186M64 189L64 194M91 196L91 200M160 195L160 200M192 187L191 193M216 179L214 184','#956a3c',1.3,.85);
  art+=line('M51 148L90 159M87 136L139 166M133 134L177 158M168 139L199 149','#d7c498',1.3,.72);

  // One small left bun, rounded with a sagging base and a naturally gathered neck.
  let left=p('M-31 15Q-34 1-27-9Q-20-20-10-25L-7-33Q-3-38 3-34L10-30L11-23Q24-18 30-6Q36 9 26 20Q15 30-3 29Q-23 28-31 15Z','url(#r40-d88-skin)');
  left+=p('M-6-28Q0-32 7-28L11-23Q4-19-4-23Z','url(#r40-d88-fold)','stroke="#b49b76" stroke-width="1.4"');
  left+=line('M-5-24Q-16-16-20 1M-2-23Q-7-8-8 9M3-22Q8-9 10 8M9-22Q19-11 23 1','#bea783',1.45);
  left+=line('M-22 11Q-13 21 0 22M9 21Q18 20 23 14M-16-12Q-12-17-7-19','#fffef3',1.65);
  left+=e(1,-27,3,1.2,'#c7ad84','stroke="none"');
  art+=`<g transform="translate(81 123) rotate(-9) scale(.97)">${left}</g>`;

  // Right bun is taller, with a slightly different six-fold gathering.
  let right=p('M-32 12Q-34-2-26-13Q-19-23-9-28L-5-36Q0-39 5-35L10-30L10-25Q26-17 31-3Q36 13 25 23Q13 32-4 29Q-24 29-32 12Z','url(#r40-d88-skin)');
  right+=p('M-6-31Q0-34 7-29L10-25Q2-20-5-25Z','url(#r40-d88-fold)','stroke="#b49b76" stroke-width="1.4"');
  right+=line('M-6-25Q-19-16-22 1M-2-23Q-10-8-10 8M2-23Q1-10 4 4M7-23Q15-12 18 3M10-21Q24-11 27 4','#bca380',1.45);
  right+=line('M-23 13Q-10 24 4 22M12 21L20 17M-18-14Q-12-20-7-22','#fffef4',1.65);
  right+=e(.5,-28,2.9,1.3,'#c7ad84','stroke="none"');
  art+=`<g transform="translate(164 120) rotate(10) scale(.96)">${right}</g>`;

  // Front bun opens gently at one side; broth glows below a cooked meat centre.
  art+=p('M90 176Q82 164 87 150Q92 137 106 130L110 121Q116 116 123 122L127 128Q144 130 155 142Q167 154 162 170Q160 185 141 190Q125 194 109 187Q97 186 90 176Z','url(#r40-d88-skin)');
  art+=p('M109 125Q116 120 123 127L128 130Q120 135 111 130Z','url(#r40-d88-fold)','stroke="#b49b76" stroke-width="1.45"');
  art+=line('M110 131Q99 140 96 151M115 132Q108 143 109 151M123 132Q132 139 136 146M127 133Q142 139 148 150','#bda582',1.5);
  art+=line('M95 171Q102 181 114 182M124 185L134 185','#fffdf1',1.7);
  art+=p('M124 153Q134 145 147 152Q158 158 155 173Q145 184 131 178Q121 168 124 153Z','#e9c184','stroke="#957046" stroke-width="1.6"');
  art+=p('M127 162Q138 155 150 163L152 173Q143 182 132 176Z','url(#r40-d88-soup)','stroke="none"');
  art+=p('M129 155Q133 148 142 151Q150 151 151 161L145 167L134 165L128 161Z','url(#r40-d88-meat)','stroke="#976949" stroke-width="1.3"');
  art+=line('M132 157L136 155M140 158L145 160','#edc5a0',1.3);
  art+=p('M133 158L136 157L137 160L134 161Z','#89aa5a','stroke="none"');
  art+=p('M143 154L146 155L145 158L142 157Z','#78994f','stroke="none"');
  art+=line('M130 171Q138 178 147 172','#fff2bd',1.9,.98);
  art+=p('M121 151Q126 144 133 145L142 150Q130 148 127 157L127 164L122 160Z','#fff7e3','stroke="#c4ac86" stroke-width="1.4"');
  art+=e(118,126,2.7,1.2,'#c7ad84','stroke="none"');
  return doc('爆汁灌汤小笼包',defs,art);
}

function garlicSquid(){
  const defs=grad('r40-d89-plate',['#f9fcee','#e4efdc','#acc7b2'])
    +grad('r40-d89-mantle',['#fff9e9','#f2e6db','#dac4cf'])
    +grad('r40-d89-purple',['#dcb7c9','#bc89a6','#9e6b88'])
    +grad('r40-d89-inside',['#f5e6df','#d9bfc7','#b68ba2'])
    +grad('r40-d89-garlic',['#ffecb2','#e6c580','#caa15d']);
  let art=e(128,168,101,31,'url(#r40-d89-plate)');
  art+=e(128,163,88,23,'#fffdf0','stroke="#b3c5a4" stroke-width="1.45"');
  art+=line('M43 175Q76 194 117 193M143 192Q190 187 212 172','#fcfff4',1.8);
  art+=e(130,158,64,16,'#8c7377','stroke="none" opacity=".12"');
  // Short, tucked arms belong to one squid; no ring pile and no radial octopus fan.
  art+=p('M98 147Q87 151 79 165Q75 172 68 168Q64 164 68 160L73 157L69 153Q60 158 61 168Q64 181 77 178Q88 175 94 166L108 159Z','url(#r40-d89-purple)','stroke-width="2.5"');
  art+=p('M108 151Q103 163 107 175Q111 184 121 181Q128 177 125 170L120 168Q120 175 116 175Q110 173 115 159Z','url(#r40-d89-mantle)','stroke-width="2.5"');
  art+=p('M118 150Q128 158 136 168Q142 176 150 170Q156 166 152 160L147 158Q150 165 146 165Q143 164 138 157L128 145Z','url(#r40-d89-purple)','stroke-width="2.5"');
  art+=line('M75 167Q84 165 89 159M111 164L112 170M135 160L141 166','#f7dfdc',1.5,.95);
  // Two short fins sit near the tapered rear of the mantle, not at every edge.
  art+=p('M119 96Q127 78 149 73Q159 74 161 87L153 105Z','url(#r40-d89-purple)','stroke-width="2.6"');
  art+=p('M156 88Q179 84 191 100Q192 105 187 111L169 121L155 110Z','url(#r40-d89-purple)','stroke-width="2.6"');
  art+=line('M137 84Q147 80 151 85M173 96Q181 98 183 103','#f1d4d8',1.5,.94);
  // A single broad ivory tube lies diagonally; the front lip curls back naturally.
  art+=p('M92 121Q98 100 118 90Q132 83 148 89Q164 91 174 105Q177 116 165 130L139 151Q128 165 111 166Q94 165 85 153Q80 143 86 131Z','url(#r40-d89-mantle)');
  art+=p('M148 89Q164 91 174 105Q177 116 165 130L139 151Q128 165 111 166L107 162Q126 159 137 145L159 124Q171 111 166 104Q160 95 148 94Z','#b98aa8','stroke="none" opacity=".8"');
  art+=p('M95 120Q103 105 119 98Q132 91 145 96Q158 97 166 108Q166 117 157 126L135 145Q123 155 110 154Q96 154 91 145Q87 135 95 120Z','#fff9ec','stroke="none"');
  // Three loose crossing cuts catch warm highlights, rather than a repeated grid.
  art+=line('M111 106Q122 113 131 123M100 119Q110 127 119 139M132 97Q144 104 154 115','#c8b1b7',1.4,.95);
  art+=line('M105 134Q119 120 137 108M119 146Q134 130 153 120M95 123L114 108','#c8b1b7',1.4,.95);
  art+=line('M113 105Q124 113 132 122M101 118L110 126M134 96L143 103M106 133L119 121M122 143L135 130','#fffef4',1.55,.98);
  art+=p('M91 139Q101 132 113 136Q127 139 133 150Q127 160 113 163Q98 163 89 153Q85 145 91 139Z','url(#r40-d89-inside)','stroke="#8d697c" stroke-width="2.3"');
  art+=p('M94 142Q103 137 113 142Q121 143 127 150Q121 155 112 157Q101 158 94 151Z','#b991a9','stroke="#9c778f" stroke-width="1.4"');
  art+=p('M91 138Q101 133 113 137Q126 141 133 150L128 153Q120 144 111 143Q100 139 93 145L90 151L87 147Z','#fff5e8','stroke="#bfa7ae" stroke-width="1.5"');
  // A few soft-gold garlic bits follow the tube's scored surface.
  const garlic=[['M116 108L121 106L124 110L120 114L116 112Z'],['M143 106L147 105L150 109L147 112L143 110Z'],['M132 122L136 120L140 123L138 127L133 126Z'],['M105 124L109 122L112 126L108 129L104 127Z'],['M150 123L154 121L157 125L153 129L150 127Z'],['M122 137L126 134L129 138L126 141L122 140Z']];
  for(const [d] of garlic)art+=p(d,'url(#r40-d89-garlic)','stroke="#aa8755" stroke-width="1.2"');
  art+=line('M117 108L120 108M144 107L146 107M133 123L136 123M123 137L125 137','#fff6ce',1.2);
  return doc('蒜蓉蒸鱿鱼',defs,art);
}

function steamedLobster(){
  const defs=grad('r40-d90-plate',['#f9fff1','#e1efdf','#9dc2b2'])
    +grad('r40-d90-shell',['#ffb264','#f27a4b','#ce4e39'])
    +grad('r40-d90-claw',['#ffae5b','#f07443','#c84934'])
    +grad('r40-d90-leg',['#ed8b51','#d8653f','#ad4633'])
    +grad('r40-d90-meat',['#ffffef','#f5e7c6','#dcc799']);
  let art=e(128,171,102,31,'url(#r40-d90-plate)');
  art+=e(128,167,88,23,'#fffdf0','stroke="#acc5ae" stroke-width="1.45"');
  art+=line('M43 178Q76 196 118 196M143 195Q190 190 214 175','#fcfff5',1.8);
  art+=e(130,157,63,23,'#8b6140','stroke="none" opacity=".12"');
  const plateEnd=art.length;
  // Three short walking-leg pairs tuck against a single long body.
  art+=p('M109 120L91 126L82 138L88 141L98 133L114 130Z','url(#r40-d90-leg)','stroke-width="2.2"');
  art+=p('M111 133L96 144L92 156L99 157L103 148L118 141Z','url(#r40-d90-leg)','stroke-width="2.2"');
  art+=p('M118 145L107 157L106 168L112 168L115 160L124 153Z','url(#r40-d90-leg)','stroke-width="2.2"');
  art+=p('M151 117L170 121L180 131L175 137L165 130L149 127Z','url(#r40-d90-leg)','stroke-width="2.2"');
  art+=p('M152 131L169 139L177 152L171 156L162 147L148 141Z','url(#r40-d90-leg)','stroke-width="2.2"');
  art+=p('M148 145L162 156L166 168L159 170L154 162L142 154Z','url(#r40-d90-leg)','stroke-width="2.2"');
  art+=line('M93 129L87 137M99 147L97 152M110 161L110 165M170 128L175 132M166 145L172 151M158 161L161 166','#ffc58a',1.3,.94);
  // Bent forearms connect two broad unequal claws; short open pincers stay readable.
  art+=p('M110 108L93 103L79 114L74 127L84 136L97 128L105 122Z','url(#r40-d90-leg)','stroke-width="2.5"');
  art+=p('M146 106L162 96L178 100L189 112L181 124L166 120L153 121Z','url(#r40-d90-leg)','stroke-width="2.5"');
  art+=p('M74 127Q60 137 47 128Q36 120 40 105L45 94L53 100L58 111L60 99L69 90Q82 100 82 114Q82 121 74 127Z','url(#r40-d90-claw)');
  art+=line('M58 111L61 118','#a84831',1.65);
  art+=line('M45 111Q43 122 54 126M69 99L74 107','#ffe0a1',1.7,.98);
  art+=p('M183 117Q198 126 211 114Q222 102 216 89L209 80L201 87L197 99L194 87L186 82Q175 92 176 104Q177 112 183 117Z','url(#r40-d90-claw)');
  art+=line('M197 99L193 107','#a84831',1.65);
  art+=line('M211 96Q216 105 207 113M185 91L182 99','#ffe0a1',1.7,.98);
  // Short antennae are shell-coloured and anchored by the head rather than a wire halo.
  art+=line('M120 94Q109 78 94 76','#a94d37',2.35);
  art+=line('M138 92Q149 73 165 71','#a94d37',2.35);
  art+=line('M120 93Q111 79 97 78M138 91Q150 76 162 74','#ffbe7c',1.15);
  // Curved tail shell and a three-lobed fan establish lobster, rather than crab, anatomy.
  art+=p('M115 136Q130 129 145 136L151 150L150 164L143 180L127 180L116 166L111 151Z','url(#r40-d90-shell)');
  art+=p('M128 174Q115 175 112 185Q121 193 132 190L141 195Q154 194 162 183Q157 174 145 174Z','url(#r40-d90-claw)','stroke-width="2.6"');
  art+=line('M133 179L132 189M143 179L144 190M151 178L157 183','#ad4934',1.5);
  art+=line('M118 183L126 186M146 189L152 185','#ffc68b',1.5);
  art+=p('M111 146Q130 153 151 146L151 153Q130 159 113 154Z','#ee794b','stroke="#b44e35" stroke-width="1.5"');
  art+=p('M115 158Q132 165 149 157L147 165Q131 171 119 166Z','#f28e54','stroke="#b44e35" stroke-width="1.5"');
  art+=p('M120 168Q132 173 145 166L142 176Q135 181 127 177Z','#f69c61','stroke="#b44e35" stroke-width="1.45"');
  art+=line('M115 145Q129 150 145 146M119 157Q132 163 145 158M124 168L132 170','#ffd49b',1.5);
  // The carapace is opened along the back, revealing one plump ivory meat ribbon.
  art+=p('M105 112Q104 98 117 91L125 84L132 88Q145 85 153 98Q160 113 153 132Q147 147 132 149Q116 146 108 133Z','url(#r40-d90-shell)');
  art+=p('M110 110Q111 100 120 96L127 91L132 95Q143 94 148 105Q145 101 138 103L129 100Q121 105 116 116Z','#ffbf76','stroke="none"');
  art+=p('M124 104Q132 99 138 106Q140 118 137 131L139 149L137 166Q131 171 126 165L126 150Q117 137 118 125Q117 112 124 104Z','url(#r40-d90-meat)','stroke="#965d42" stroke-width="1.75"');
  art+=p('M125 108Q131 104 135 109L134 124L129 132L124 125Z','#fffdf0','stroke="none"');
  art+=p('M126 139Q131 143 135 137L135 149L132 156L128 153Z','#fff9e2','stroke="none"');
  art+=line('M123 118Q129 122 135 117M123 129Q128 134 136 129M127 143L134 144M129 158L135 159','#d7bd92',1.35);
  art+=line('M113 115L116 121M146 113L148 119M113 132L117 138M144 136L142 141','#b64b33',1.4,.94);
  art+=e(116,98,2.5,2.2,'#4c392e','stroke="none"');
  art+=e(143,96,2.5,2.2,'#4c392e','stroke="none"');
  art+=e(115.2,97.3,.8,.7,'#fff1c6','stroke="none"');
  art+=e(142.2,95.3,.8,.7,'#fff1c6','stroke="none"');
  art+=scallion(128,115,-15)+scallion(150,168,18);
  // A slight diagonal lets the whole animal rest on its side rather than stand upright.
  art=art.slice(0,plateEnd)+`<g transform="rotate(-16 128 143)">${art.slice(plateEnd)}</g>`;
  art+=scallion(89,178,-24);
  return doc('蒸龙虾',defs,art);
}

export const steamerTailCandidates=[
  {id:'dish-fresh-ico-0116',code:'DS87',name:'三鲜虾肉饺子',expectedOccupancy:.82,svg:shrimpPorkDumplings(),
    reason:'三只大小、方向和褶线不同的圆肚月牙饺，以温润乳白不透明面皮建立与水晶虾饺的差异；前饺单次切开，清晰露出珊瑚熟虾与淡棕熟肉。',
    design:{silhouette:'三只饱满不等月牙饺，后两只轻错向、前一只切口朝外，不堆满盘',angle:'三分之四俯视，看得到饺腹、自然三褶和一处厚薄适中的面皮切口',material:'温润乳白不透明软皮、奶油色褶面、珊瑚熟虾肉和淡棕猪肉馅',identity:'仅鲜虾、五花肉与软面团；无玻璃透明皮、绿色葱点或额外配菜',container:'清爽青白浅盘，成品含盘82%，保留透明留白'}},
  {id:'dish-fresh-ico-0123',code:'DS88',name:'爆汁灌汤小笼包',expectedOccupancy:.82,svg:soupDumplings(),
    reason:'三只自然提褶、圆鼓垂坠的小笼包在浅竹屉中错落摆放；前包轻开一角，熟肉心与一线金色肉汤相映，强调薄软包皮和饱满汤汁。',
    design:{silhouette:'三只小笼包，提褶结口清楚，前包大、后包略小，低竹屉托起圆鼓大形',angle:'三分之四俯视，结口褶线自然汇聚、底腹有柔软下垂，前包轻开露馅',material:'暖乳白薄包皮、淡棕熟肉、克制金色肉汤反光、浅金竹屉',identity:'五花肉、软面团与香葱的灌汤包；葱不铺满包皮，不加其它馅料或酱汁',container:'浅金竹屉，仅一层低侧壁和克制竹节，不抢包子主体；含屉82%'}},
  {id:'dish-fresh-ico-0144',code:'DS89',name:'蒜蓉蒸鱿鱼',expectedOccupancy:.82,svg:garlicSquid(),
    reason:'一枚斜放的剞刀鱿鱼筒自然微张，奶白肉面与暖紫薄皮、卷回的前口相接；仅三条短触腕及少量浅金蒜粒，保持整鱿鱼的清楚主形。',
    design:{silhouette:'一枚宽鱿鱼筒，后端短鳍、前端自然开口，三条短触腕收在一侧，不画重复圈',angle:'三分之四俯视，肉面剞刀与前口厚度可见，斜向躺在浅盘中',material:'熟鱿鱼奶白肉面、柔暖粉紫薄皮、轻蒸汽水光和浅金蒜粒',identity:'仅鱿鱼与大蒜；不加香葱、辣椒、酱油色汤汁或其它海鲜',container:'浅青白盘，前口、短鳍和少量触腕均有留白，含盘82%'}},
  {id:'dish-fresh-ico-0145',code:'DS90',name:'蒸龙虾',expectedOccupancy:.84,svg:steamedLobster(),
    reason:'一只熟珊瑚橙红龙虾，两枚不等大短开螯、细长分节尾和扇尾明确分层；沿背轻剖显出一带雪白嫩肉，鲜绿短葱点到为止。',
    design:{silhouette:'一只自然纵向微弯龙虾，两大开螯、三对收拢短足与分节扇尾清楚，触须短而自然',angle:'三分之四俯视，能看见完整单虾、剖背嫩肉和螯壳体积',material:'鲜活熟珊瑚橙红壳、金橙光面、雪白蒸肉和几粒熟绿葱环',identity:'仅龙虾与香葱；不加蒜蓉、芝士、柠檬或额外海鲜',container:'清浅青白盘，含盘84%，身体和螯足有间隙，不用粗描边挤满画面'}}
];

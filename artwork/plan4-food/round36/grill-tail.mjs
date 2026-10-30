// Round 36: six individually composed grilled and smoked dishes.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.5,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".82" y2="1">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 炭烤成品新版候选</title><defs>${defs}</defs><g transform="translate(0 ${dy})" stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
const lemon=(x,y,angle=0,scale=1)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">${p('M-16 5Q-6-10 9-8L17 5Q3 17-16 5Z','#edc64a','stroke="#8e7537" stroke-width="2"')}${p('M-12 4Q-3-6 8-5L12 4Q1 12-12 4Z','#fff0a1','stroke="#d4b653" stroke-width="1.25"')}${line('M-10 4L10 4M-3-2L1 6M6-4L4 6','#fffbd7',1.3)}</g>`;
const herb=(x,y,angle=0,scale=1)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">${p('M-9 3Q-9-6 1-8Q10-8 12-9Q13 4 3 7Q-4 10-9 3Z','#6c9c50','stroke="#466441" stroke-width="1.8"')}${line('M-8 5Q1 1 10-7M0 1L-1-4M4-2L8-1','#bad18a',1.2)}</g>`;

function charredTuna(){
  const defs=grad('r36-tuna-plate',['#fbfaf1','#dde3dd','#a9b9bb'])
    +grad('r36-tuna-crust',['#caa77f','#ad8967','#86674f'])
    +grad('r36-tuna-flesh',['#f3e1c6','#dec5a2','#c2a17e'])
    +grad('r36-tuna-edge',['#b79c7c','#967a5e','#765d4b']);
  let art=e(128,156,100,33,'url(#r36-tuna-plate)');
  art+=e(128,152,87,24,'#fffcef','stroke="#b7c0b2" stroke-width="1.45"');
  art+=line('M45 164Q76 183 115 184M134 184Q180 182 211 161','#fffff6',2,.95);
  // One organic loin: a gently tapered end, a broad shoulder, and a thick cooked face.
  art+=p('M61 113Q72 99 94 96L144 82Q160 77 176 90L191 111Q199 125 188 140L164 158Q154 165 139 161L82 147Q64 143 59 129Z','url(#r36-tuna-edge)');
  art+=p('M62 113Q75 102 94 101L145 87Q159 83 172 94L187 112Q192 119 183 126L158 143Q150 148 137 144L80 132Q65 130 62 120Z','url(#r36-tuna-crust)','stroke="#76624c" stroke-width="1.8"');
  art+=p('M80 134L136 146Q150 151 159 146L185 129L182 140L161 155Q153 162 140 157L83 144Q73 142 69 133Z','url(#r36-tuna-flesh)','stroke="#9a7e60" stroke-width="1.6"');
  art+=p('M76 111Q89 107 100 108L147 93Q157 90 166 98L179 113Q168 110 160 116Q143 113 133 120L112 119L93 124L77 121Z','#dbc19b','stroke="none" opacity=".64"');
  art+=line('M83 113L99 106M109 123L129 111M139 129L160 116','#725a45',2,.9);
  art+=line('M91 139L108 142L115 140M121 148L136 151L142 149M153 152L165 144M170 143L179 136','#b39a77',1.45,.98);
  art+=line('M79 107L89 105M142 90Q154 86 161 92M173 101L178 107','#f2dfb9',1.8,.96);
  art+=line('M96 127L101 128M167 126L171 122','#8b6c4e',1.35,.7);
  art+=lemon(193,153,-12,.88);
  return doc('炭烧金枪鱼排',defs,art,-4);
}

function orangeSalmon(){
  const defs=grad('r36-orange-plate',['#fff9e9','#ece0c9','#c7b38e'])
    +grad('r36-orange-salmon',['#f6b181','#e99065','#cc7350'])
    +grad('r36-orange-side',['#ffd2a1','#efb484','#d8956a'])
    +grad('r36-orange-sear',['#f3c481','#dba45f','#bd7e42'])
    +grad('r36-orange-skin',['#b1b7ad','#89978e','#647b75']);
  let art=p('M30 154C35 176 73 191 126 191C179 191 216 174 226 151L219 142L39 140Z','url(#r36-orange-plate)');
  art+=e(128,144,98,32,'#fff9e9');
  art+=e(128,143,85,23,'#f5edd6','stroke="#c7ba96" stroke-width="1.4"');
  art+=line('M46 166Q80 188 119 187M139 187Q184 184 210 163','#fffef4',1.9,.94);
  // Cooked salmon is a single sloping portion, not a row of geometric slices.
  art+=p('M70 119Q74 108 92 104L148 84Q159 80 172 90L193 111Q201 120 193 134L181 149Q170 163 153 160L87 145Q71 142 67 132Z','url(#r36-orange-side)');
  art+=p('M70 118Q79 108 94 109L150 88Q158 85 169 94L189 113Q194 120 186 128L168 141Q160 146 146 141L86 132Q73 131 70 125Z','url(#r36-orange-salmon)','stroke="#9b634c" stroke-width="1.7"');
  art+=p('M74 117Q86 109 98 113L148 94Q158 91 166 99L179 111L165 115L153 111L136 119L120 117L104 126L88 123L75 127Z','url(#r36-orange-sear)','stroke="none" opacity=".72"');
  art+=p('M169 143L191 125L188 139L179 150Q169 161 153 158L152 151Q160 153 169 143Z','url(#r36-orange-skin)','stroke="#69766c" stroke-width="1.4"');
  art+=line('M157 154Q171 154 183 140','#c8cdb7',1.6,.95);
  // Soft, unequal fat seams follow the flesh rather than becoming evenly spaced stripes.
  art+=line('M91 115Q99 122 114 124Q122 124 130 132','#ffdfb5',2,.96);
  art+=line('M116 105Q124 115 139 117Q149 119 157 131','#ffe5bf',1.85,.98);
  art+=line('M143 97Q149 106 162 111Q168 113 172 119','#ffe1b5',1.7,.98);
  art+=line('M89 137L105 141M115 145L129 148M139 151L148 153','#ffe7c9',1.6,.96);
  art+=line('M79 114L84 111M136 99L142 98M178 117L182 120','#a8723f',1.5,.8);
  // A single small orange segment makes this distinct from the lemon and smoked dishes.
  art+=p('M53 155Q65 144 80 149L90 158Q76 173 57 167Z','#e99e3a','stroke="#976c38" stroke-width="1.9"');
  art+=p('M58 155Q69 149 78 152L85 158Q74 167 60 163Z','#ffd17c','stroke="#d69c49" stroke-width="1.25"');
  art+=line('M62 155L79 159M67 153L72 162M77 154L74 162','#fff0bb',1.3,.98);
  return doc('橙香三文鱼',defs,art,-8);
}

function roastedConch(){
  const defs=grad('r36-conch-plate',['#f4fcf4','#d6e7de','#a0c3be'])
    +grad('r36-conch-shell',['#ebca8d','#cba266','#9d743f'])
    +grad('r36-conch-lip',['#fff3d2','#ead8af','#cfb18a'])
    +grad('r36-conch-meat',['#fff6db','#ead7b1','#c9ac82']);
  let art=e(128,159,98,32,'url(#r36-conch-plate)');
  art+=e(128,155,85,23,'#fafff3','stroke="#a6beb1" stroke-width="1.45"');
  art+=line('M46 168Q83 188 122 188M142 187Q183 185 211 165','#fafff5',1.9,.96);
  // A single tapered sea-conch shell: offset spire, shoulder whorls, and an open lip.
  art+=p('M89 108Q98 92 117 92L127 83Q139 83 147 75L157 62Q163 71 162 81L174 84Q179 93 174 101Q191 111 187 130Q185 143 169 152L134 161Q110 161 93 148Q73 132 89 108Z','url(#r36-conch-shell)');
  art+=p('M96 110Q106 99 123 101Q135 99 145 104Q132 106 125 117Q114 125 111 139Q97 143 91 132Q87 121 96 110Z','#e8c994','stroke="none"');
  art+=p('M119 96Q133 88 145 91L155 82L166 87Q168 94 162 100Q144 96 133 107Z','#dcb77a','stroke="#a9834f" stroke-width="1.45"');
  art+=line('M129 87Q138 94 149 94M149 77L155 83M102 101Q118 98 125 110Q132 121 121 131M91 115Q110 110 116 124','#a57d48',1.5,.96);
  art+=line('M98 105Q107 99 116 103M135 91L145 90M154 69L156 74','#fff0c5',1.8,.98);
  // The shell mouth supports warm cooked meat, with no eye-like dark spiral centre.
  art+=p('M141 106Q157 97 174 107Q188 119 181 133Q176 148 158 154L126 159Q112 155 113 143Q117 126 128 116Z','url(#r36-conch-lip)','stroke="#8e7049" stroke-width="2.2"');
  art+=p('M140 116Q154 106 168 113Q179 121 172 132Q165 143 150 148L127 151Q121 147 125 137Q131 123 140 116Z','#91744e','stroke="#aa8c60" stroke-width="1.3"');
  art+=p('M132 123Q141 112 154 115Q166 115 168 125Q171 136 157 140L141 141Q133 143 127 152Q121 161 108 163Q94 165 85 157Q78 151 83 142Q87 134 97 133Q107 132 112 139Q115 145 109 149L102 147Q112 154 119 144Q124 130 132 123Z','url(#r36-conch-meat)','stroke="#725a40" stroke-width="2.7"');
  art+=p('M130 127Q141 117 152 120Q161 120 161 126Q161 131 151 131L137 133Q128 138 124 148Q120 157 109 159Q99 161 92 156Q105 159 115 148Q120 135 130 127Z','#fff4d7','stroke="none"');
  art+=line('M135 124Q145 117 154 121M126 139L122 148M89 141Q95 138 101 142','#fffbea',1.7,.98);
  art+=line('M137 135L143 137M153 135L159 132M93 147Q99 151 105 149M111 160L118 156','#ab8251',1.5,.96);
  // Two small garlic petals sit apart from the shell and soft meat.
  art+=p('M184 148Q190 142 193 151L195 160Q185 165 181 158Z','#f6e7c6','stroke="#9b825d" stroke-width="1.65"');
  art+=line('M187 149L186 157','#fffced',1.3,.98);
  art+=p('M167 166Q173 159 179 165Q184 169 177 173L167 173Z','#ead6ac','stroke="#9b825d" stroke-width="1.6"');
  art+=line('M170 166L177 167','#fff4d8',1.3,.98);
  return doc('炭烤海螺',defs,art,0);
}

function grilledSteak(){
  const defs=grad('r36-char-steak-plate',['#f8edda','#e7d1b3','#bd9c7c'])
    +grad('r36-char-steak-side',['#bf8552','#965d38','#71422d'])
    +grad('r36-char-steak-face',['#a46b40','#7f4d2e','#603b2b'])
    +grad('r36-char-steak-bone',['#fff8dc','#ead7b1','#c8ac86']);
  let art=e(128,158,100,34,'url(#r36-char-steak-plate)');
  art+=e(128,154,87,24,'#fff5df','stroke="#baa486" stroke-width="1.45"');
  art+=line('M45 168Q76 188 119 188M138 188Q184 185 211 165','#fff8e7',1.9,.96);
  // One substantial cooked steak, with the ivory bone kept beside the meat.
  art+=p('M65 116Q65 101 86 97Q99 86 118 90Q138 81 155 90Q177 92 186 109Q195 125 184 141Q173 158 150 163Q132 171 112 162Q91 166 76 152Q60 139 65 116Z','url(#r36-char-steak-side)');
  art+=p('M68 114Q72 101 89 102Q101 92 119 96Q138 87 154 96Q174 98 180 113Q188 125 176 137Q163 151 145 152Q127 161 110 153Q91 156 79 143Q67 132 68 114Z','url(#r36-char-steak-face)','stroke="#513b2c" stroke-width="1.9"');
  art+=p('M80 112Q92 104 103 106Q115 99 129 103Q144 96 156 104Q171 105 175 116Q160 112 146 119Q128 114 114 122Q94 115 80 125Z','#bd8a54','stroke="none" opacity=".58"');
  art+=line('M84 129L111 108M110 143L139 118M141 142L162 125','#49352a',2.1,.92);
  art+=line('M91 113L117 135M118 106L145 128','#4e372a',1.7,.88);
  art+=line('M79 112Q86 105 95 106M137 96Q146 94 153 100M82 146L90 150M110 158L120 161','#d4a56d',1.65,.96);
  art+=line('M150 158L160 155M170 148L177 143','#ba8a58',1.4,.96);
  art+=p('M165 100Q169 97 173 101L181 111Q185 113 188 110Q194 109 196 115Q198 122 191 124Q185 126 181 121L175 118L166 135Q163 140 158 136Q155 133 159 128L171 112Z','url(#r36-char-steak-bone)','stroke="#70593e" stroke-width="2.1"');
  art+=line('M169 103L175 113L162 133M187 114L192 116','#fffdf0',1.6,.98);
  art+=herb(185,158,-16,.92)+herb(170,169,37,.81);
  return doc('炭烤牛排',defs,art,-10);
}

function smokedSalmon(){
  const defs=grad('r36-smoke-plate',['#f7fbf1','#dde6d6','#a9c0b4'])
    +grad('r36-smoke-fish',['#ffb38b','#f28d70','#d66a56'])
    +grad('r36-smoke-fold',['#f29476','#d57059','#b75146']);
  let art=p('M29 157Q34 176 71 185Q128 202 187 183Q219 173 227 152L218 145L40 144Z','url(#r36-smoke-plate)');
  art+=e(128,147,99,30,'#fbfff3');
  art+=e(128,145,86,22,'#eaf1db','stroke="#adc0a5" stroke-width="1.4"');
  art+=line('M45 167Q78 187 120 187M140 186Q186 182 212 163','#fcfff4',1.85,.98);
  // Three loose, unequal slices: broad folds, not rosettes or an uncooked steak.
  art+=p('M102 113Q109 100 125 101Q137 95 150 104L177 114Q184 119 176 125Q165 132 151 125L131 118Q119 113 110 123L104 126Q99 122 102 113Z','url(#r36-smoke-fish)');
  art+=p('M110 121Q120 113 131 118L151 126Q165 134 176 125L173 130Q162 137 149 130L129 122Q119 117 111 126Z','url(#r36-smoke-fold)','stroke="#b56852" stroke-width="1.3"');
  art+=line('M116 105Q125 103 135 109L148 114M143 101Q150 109 164 113','#ffe0b8',1.8,.98);
  art+=p('M63 136Q70 124 81 126Q91 120 103 129L125 140Q134 144 129 152Q122 160 109 151L91 141Q80 135 69 147L65 150Q59 146 63 136Z','url(#r36-smoke-fish)');
  art+=p('M70 146Q79 135 91 142L108 152Q121 160 129 152L125 158Q118 164 107 157L92 148Q80 141 74 152Z','url(#r36-smoke-fold)','stroke="#ba6b54" stroke-width="1.35"');
  art+=line('M77 130Q85 127 94 135L107 142M84 144L95 150M108 133Q114 139 122 142','#ffe2bc',1.85,.98);
  art+=p('M135 140Q141 131 150 135L171 143Q183 150 193 144Q200 147 195 154Q183 164 168 156L153 149Q145 143 138 153L134 155Q130 149 135 140Z','url(#r36-smoke-fish)');
  art+=p('M138 151Q146 143 155 150L170 158Q183 164 195 154L191 160Q180 169 166 162L151 154Q144 150 141 157Z','url(#r36-smoke-fold)','stroke="#b86a54" stroke-width="1.3"');
  art+=line('M147 137Q152 142 165 146M146 149L155 154M171 151Q180 155 185 152','#ffe4be',1.75,.98);
  art+=line('M71 151L78 154M116 160L122 159M177 163L184 161','#db8261',1.3,.9);
  art+=lemon(198,126,14,.79);
  return doc('烟熏三文鱼',defs,art,-13);
}

function roastedLamb(){
  const defs=grad('r36-lamb-plate',['#faf2e4','#e3d5bd','#b9ae92'])
    +grad('r36-lamb-crust',['#c08a53','#9a663c','#75492f'])
    +grad('r36-lamb-side',['#d4a26b','#af7a48','#865535'])
    +grad('r36-lamb-bone',['#fff8df','#e8d5af','#c6ac82']);
  let art=p('M29 148Q37 177 81 187L170 189Q209 179 226 151L218 136L45 134Z','url(#r36-lamb-plate)');
  art+=e(128,142,98,31,'#fff8e6');
  art+=e(128,141,85,23,'#ece8cf','stroke="#b8b994" stroke-width="1.4"');
  art+=line('M48 165Q83 187 120 186M140 186Q184 183 210 162','#fff9e7',1.9,.96);
  // Rear chop: shorter, angled to the upper right, with a compact ivory bone.
  art+=p('M160 112L180 87Q177 82 182 78Q187 74 191 79Q197 76 200 82Q204 88 198 91Q193 93 189 89L172 119Z','url(#r36-lamb-bone)','stroke="#7e6647" stroke-width="2.4"');
  art+=line('M170 111L188 85M184 81L188 82','#fffbeb',1.6,.98);
  art+=p('M137 116Q134 106 145 99Q156 92 169 98Q180 99 183 110L188 124Q191 136 178 145Q166 154 151 146Q139 145 134 135Q130 125 137 116Z','url(#r36-lamb-side)');
  art+=p('M139 115Q139 106 148 104Q157 98 167 104Q176 104 178 114L182 124Q184 133 175 138Q164 145 153 138Q142 140 138 130Q135 122 139 115Z','url(#r36-lamb-crust)','stroke="#765437" stroke-width="1.75"');
  art+=p('M145 111Q152 104 161 109Q170 107 173 116Q165 114 159 119Q149 115 143 122Z','#dbab70','stroke="none" opacity=".67"');
  art+=line('M145 125L157 113M159 132L173 121','#6e482f',1.7,.9);
  art+=line('M145 111L149 107M167 104L172 108M156 143L163 145','#edc58c',1.6,.98);
  // Front chop: broader, tilted left, and partly overlapping rather than a copied pair.
  art+=p('M99 122L86 97Q79 98 77 92Q75 86 81 83Q86 80 90 86Q96 83 99 89Q102 96 95 98L112 119Z','url(#r36-lamb-bone)','stroke="#7e6647" stroke-width="2.5"');
  art+=line('M102 119L88 91M81 87L85 88','#fffbeb',1.7,.98);
  art+=p('M80 138Q74 127 84 118Q94 108 108 114Q123 110 133 121Q144 126 144 141Q146 153 135 160Q121 171 105 165Q88 168 80 155Q74 147 80 138Z','url(#r36-lamb-side)');
  art+=p('M83 136Q80 126 89 122Q98 115 109 120Q122 115 130 126Q140 129 139 141Q140 150 130 154Q119 162 107 157Q92 161 86 149Q80 144 83 136Z','url(#r36-lamb-crust)','stroke="#755134" stroke-width="1.8"');
  art+=p('M89 129Q97 120 108 126Q116 121 124 128Q133 130 134 138Q121 133 113 140Q100 133 89 139Z','#d3a065','stroke="none" opacity=".73"');
  art+=line('M91 142L107 128M111 150L127 135','#70492f',1.9,.92);
  art+=line('M91 126L97 124M119 122L126 126M92 155L99 159M120 162L129 158','#efc68c',1.6,.98);
  art+=herb(171,162,-8,.8)+herb(187,153,27,.68);
  art+=p('M59 153Q58 144 66 140Q73 140 77 143Q73 152 65 157Z','#929f62','stroke="#626d45" stroke-width="1.7"');
  art+=line('M62 153L72 144','#c7ce92',1.2,.98);
  return doc('热烤大羊排',defs,art,-3);
}

export const grillTailCandidates=[
  {id:'dish-fresh-ico-0079',name:'炭烧金枪鱼排',svg:charredTuna(),expectedOccupancy:.82,
    reason:'一块自然收尖的厚金枪鱼排，灰棕熟表层与暖浅米色鱼肉切侧分层，三笔克制炭纹和一小角柠檬保留主料辨识。',
    design:{silhouette:'单块厚实自然鱼排，前侧较宽、后端收尖，切面有完整厚度',angle:'三分之四俯视，兼见熟表层与暖浅鱼肉侧面',material:'灰棕熟鱼外层、浅米色熟肉、少量焦纹和鲜黄柠檬',identity:'金枪鱼和一小角柠檬，鱼排保持熟肉色，不添加香叶或肉汁',container:'冷灰青白椭圆浅盘，含盘82%体量，透明留白'}},
  {id:'dish-fresh-ico-0081',name:'橙香三文鱼',svg:orangeSalmon(),expectedOccupancy:.82,
    reason:'单块橙粉熟三文鱼斜向自然收尖，柔白脂纹贴合鱼肉，金色煎面和银灰鱼皮边表现熟制质地，一小瓣甜橙与烟熏鱼片区分。',
    design:{silhouette:'一块自然厚鱼排，主料完整而非规则切片拼排',angle:'三分之四俯视，橙粉肉面与银皮侧边均可辨',material:'橙粉熟肉、轻柔白脂纹、局部金煎面、银灰鱼皮',identity:'三文鱼与一小瓣甜橙，单块熟鱼区别于烟熏卷折薄片',container:'暖奶油椭圆浅盘，含盘82%体量，盘沿完整'}},
  {id:'dish-fresh-ico-0082',name:'炭烤海螺',svg:roastedConch(),expectedOccupancy:.82,
    reason:'一枚斜向尖顶海螺壳承托轻卷的暖白熟螺肉，壳口、壳肩与软肉分层，局部焦边及两小蒜片带出炭烤质感。',
    design:{silhouette:'单枚偏尖海螺壳，宽口向前，熟螺肉轻卷伸出且不拟人',angle:'三分之四俯视，可见斜尖壳顶、壳口和熟肉厚度',material:'暖金褐螺壳、奶白厚壳口、温润熟肉与少量焦边',identity:'海螺和两小蒜片，不画眼睛触角或堆叠多个壳',container:'浅青白圆盘，含盘82%体量，主体完整居中'}},
  {id:'dish-fresh-ico-0095',name:'炭烤牛排',svg:grilledSteak(),expectedOccupancy:.84,
    reason:'一块厚实熟牛排带短象牙骨边，深棕炭面保留少量交错炭纹，暖棕熟侧和两片罗勒清楚分层，独立于红酒酱牛排。',
    design:{silhouette:'单块宽厚自然牛排，短骨贴肉边，肉面占主要画幅',angle:'三分之四俯视，熟肉厚侧与焦面可同时辨认',material:'深棕熟炭面、棕金肉侧、象牙骨与柔绿罗勒',identity:'带骨牛排和少量罗勒，不添加红酒酱或洋葱',container:'暖陶米色浅盘，含盘84%体量，少量配料退后'}},
  {id:'dish-fresh-ico-0109',name:'烟熏三文鱼',svg:smokedSalmon(),expectedOccupancy:.82,
    reason:'三片大小和折向不同的烟熏三文鱼紧凑错落，珊瑚橙肉色与奶白脂纹轻盈清楚，宽松卷折呈薄片质地，辅以一小角柠檬。',
    design:{silhouette:'三片宽薄熏鱼自然卷折、局部叠压，不卷成玫瑰',angle:'略俯视，可读薄片卷边、轻柔折面及松紧变化',material:'明亮珊瑚橙、奶白柔脂纹、较深熏色边与温润高光',identity:'三文鱼和一小角柠檬，薄片折叠区别于橙香熟鱼排',container:'清浅青白长圆盘，含盘82%体量，片数和留白克制'}},
  {id:'dish-fresh-ico-0133',name:'热烤大羊排',svg:roastedLamb(),expectedOccupancy:.84,
    reason:'两支大小、角度和切面有别的短骨羊排前后错落，棕金熟肉与象牙骨保持完整轮廓，小量香叶与局部炭纹突出热烤成品。',
    design:{silhouette:'两支独立短骨羊排，一宽一窄、骨柄方向不同，紧凑自然叠压',angle:'三分之四俯视，熟肉面、厚侧和短骨端均清楚',material:'棕金焦面、暖棕熟肉侧、象牙短骨和柔绿混合香叶',identity:'羊排与少量混合香叶，骨柄短，不画整齐重复骨排',container:'浅暖白陶盘，含盘84%体量，盘器形态与牛排区分'}}
];

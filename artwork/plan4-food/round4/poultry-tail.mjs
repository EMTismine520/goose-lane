// Individually authored candidates only. Adoption and content renaming await user review.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (x, y, rx, ry, fill, extra = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, color, width = 1.5, extra = '') => p(d, 'none', `stroke="${color}" stroke-width="${width}" ${extra}`);
const grad = (id, colors, extra = 'x1=".1" y1="0" x2=".8" y2="1"') => `<linearGradient id="${id}" ${extra}>${colors.map((c, i) => `<stop offset="${i / (colors.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const radial = (id, colors) => `<radialGradient id="${id}" cx=".32" cy=".22" r=".85">${colors.map((c, i) => `<stop offset="${i / (colors.length - 1)}" stop-color="${c}"/>`).join('')}</radialGradient>`;
const doc = (name, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 肉禽全新版候选</title><defs>${defs}</defs><g stroke="#392a23" stroke-width="3.25" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;

function chickenLeg() {
  const body = 'M149 65C128 38 93 35 68 47C37 61 27 91 35 119C43 145 66 166 90 174C113 181 129 170 143 157C152 149 163 154 178 164L190 150C175 137 174 125 172 110C171 93 162 78 149 65Z';
  const defs = radial('cl-skin', ['#fff2d9', '#f9d9b6', '#eeb892', '#cf9375']) + grad('cl-bone', ['#fffbea', '#f7e8cc', '#d4b995']) + grad('cl-crease', ['#edbc99', '#cc9478']) + `<clipPath id="cl-clip">${p(body, '#fff')}</clipPath>`;
  let art = p('M165 145L195 173C202 170 210 173 211 180C222 177 229 183 226 191C224 198 215 200 210 197C209 208 198 213 192 206C188 202 189 195 192 190L159 162Z', 'url(#cl-bone)', 'stroke-width="3.1"');
  art += line('M190 179L200 189M209 183Q205 187 205 194', '#d1b99b', 1.45);
  art += p(body, 'url(#cl-skin)');
  art += `<g clip-path="url(#cl-clip)" stroke="none">`;
  art += p('M129 43C160 75 166 113 149 140C138 158 118 175 100 179C133 189 163 178 182 164L197 144L181 60Z', '#cb9379', 'opacity=".15"');
  art += p('M43 101C50 72 79 56 111 59C126 60 143 68 151 81C124 73 99 81 83 95C67 109 56 117 45 117Z', '#fff1d2', 'opacity=".48"');
  art += '</g>';
  art += line('M58 75C71 58 91 53 111 58', '#fff8e6', 4.6, 'opacity=".84"');
  art += line('M51 125C66 139 84 145 102 141M113 107C129 115 139 130 143 145M142 151Q155 147 170 157', '#bc8a72', 1.6, 'opacity=".65"');
  art += line('M59 131C76 141 86 140 97 138M114 119Q128 128 131 139', '#ffe5c5', 2.2, 'opacity=".8"');
  for (const [x, y, rx] of [[74, 83, 1.4], [93, 74, 1.3], [121, 82, 1.2], [140, 95, 1.2], [81, 108, 1.3], [99, 119, 1.1], [65, 118, 1.1], [118, 146, 1.1]]) art += e(x, y, rx, rx * .7, '#c58f73', 'stroke="none" opacity=".29"');
  return doc('鸡腿', defs, art);
}

function duckBreast() {
  const skin = 'M41 113C44 91 67 70 95 61C123 51 161 57 185 74C201 85 215 102 218 119C195 134 173 147 143 149C104 151 69 141 41 126Z';
  const defs = radial('db-skin', ['#fff2d6', '#efd9b2', '#ddbc90', '#c69f79']) + grad('db-red', ['#c97670', '#ad5355', '#853c46']) + grad('db-fat', ['#fff2d4', '#ecd6b4', '#d4b38d']) + `<clipPath id="db-top">${p(skin, '#fff')}</clipPath>`;
  let art = p('M42 115C80 109 168 117 218 118L216 152C207 172 172 193 137 195C98 199 61 180 42 162Z', 'url(#db-red)');
  art += p('M42 122C82 143 115 151 147 147C179 143 203 130 218 118L218 125C199 142 173 154 147 157C108 163 69 148 42 132Z', 'url(#db-fat)', 'stroke="#956c57" stroke-width="1.5"');
  art += line('M54 155C87 174 110 178 134 178M153 180C175 178 193 170 203 159', '#d49088', 1.6, 'opacity=".8"');
  art += line('M64 164L79 170M95 179L109 181M165 182L178 179', '#efb4a3', 1.5, 'opacity=".6"');
  art += p(skin, 'url(#db-skin)');
  art += `<g clip-path="url(#db-top)" stroke="none">${p('M149 58C175 83 181 115 166 146L219 131L231 105L188 57Z', '#b79777', 'opacity=".13"')}${p('M59 100C76 78 101 68 125 70C137 71 149 78 154 85C121 80 92 92 75 107Z', '#fff4d9', 'opacity=".47"')}</g>`;
  art += line('M68 86C83 73 102 67 120 68', '#fff8e5', 3.8, 'opacity=".8"');
  art += line('M80 103L123 136M105 84L153 139M132 76L180 126M157 80L198 111', '#b28e6c', 1.5, 'opacity=".7"');
  art += line('M83 101L124 133M108 83L155 136M135 76L182 123', '#fff1d2', 1.4, 'opacity=".6"');
  return doc('鸭胸肉', defs, art);
}

function duckLeg() {
  const body = 'M189 54C173 39 145 39 124 54C104 68 102 91 92 107C85 120 72 133 69 150C66 164 78 174 91 177C103 179 111 171 123 172C147 175 178 161 195 140C216 116 218 78 189 54Z';
  const defs = radial('dl-skin', ['#f2dfbf', '#e2c5a0', '#cda482', '#b8886b']) + grad('dl-bone', ['#fff7e1', '#ebd8b5', '#c4a483']) + grad('dl-edge', ['#b8796b', '#92564f', '#784344']) + `<clipPath id="dl-body">${p(body, '#fff')}</clipPath>`;
  let art = p('M82 149L59 186C50 183 42 188 43 196C32 195 27 201 31 209C35 217 44 214 49 212C52 222 61 223 66 216C70 210 68 204 63 200L101 167Z', 'url(#dl-bone)', 'stroke-width="3.1"');
  art += line('M44 202L53 207M56 192L77 165', '#c6a88b', 1.5);
  art += p('M90 156C114 167 137 162 154 153C177 141 195 122 206 99C211 122 198 151 181 167C158 185 120 191 97 178Z', 'url(#dl-edge)', 'stroke-width="2.8"');
  art += p(body, 'url(#dl-skin)');
  art += `<g clip-path="url(#dl-body)" stroke="none">${p('M184 44C198 79 193 113 171 136C150 155 119 166 96 172L122 181L183 164L218 112L212 64Z', '#a77d65', 'opacity=".17"')}${p('M115 87C126 62 151 51 172 59C185 64 194 73 196 83C167 73 145 83 129 99Z', '#fff0d0', 'opacity=".42"')}</g>`;
  art += line('M128 66C140 55 156 53 169 57', '#fff0d3', 4.0, 'opacity=".81"');
  art += line('M105 109C121 119 132 135 133 151M154 97C165 105 171 119 171 131M80 144C90 143 99 150 105 160', '#9b755e', 1.6, 'opacity=".68"');
  art += line('M112 115C123 124 128 132 129 141M81 150Q94 151 98 159', '#f2d7b2', 1.9, 'opacity=".8"');
  for (const [x, y, r] of [[136, 80, 1.2], [158, 73, 1.3], [182, 92, 1.2], [159, 114, 1.1], [142, 132, 1.1], [105, 138, 1.1]]) art += e(x, y, r, r * .7, '#a07960', 'stroke="none" opacity=".3"');
  return doc('鸭腿', defs, art);
}

function braisedGoose() {
  const defs = radial('bg-skin', ['#dca362', '#bb773e', '#94522f', '#713c29']) + grad('bg-meat', ['#c88c7c', '#ab685e', '#8b4d49']) + grad('bg-fat', ['#f5ddba', '#dfbb91', '#c69a73']) + grad('bg-side', ['#af7252', '#895039', '#62382d']);
  let art = p('M99 49C132 44 168 55 193 74L220 106Q225 116 212 130L184 149L88 117L65 84Z', 'url(#bg-side)');
  art += p('M99 49C132 44 168 55 193 74L220 106C190 119 153 112 125 103L65 84Z', 'url(#bg-skin)');
  art += line('M101 56C126 52 153 60 170 68M183 76L204 97', '#edbf7d', 2.4, 'opacity=".68"');
  art += p('M65 84C107 91 163 124 212 118L211 133C165 144 111 117 72 105Z', 'url(#bg-fat)', 'stroke="#8f6045" stroke-width="1.45"');
  art += p('M73 105C111 111 163 141 211 133L203 155C164 167 116 140 81 130Z', 'url(#bg-meat)', 'stroke-width="2.6"');
  art += line('M91 113C113 122 138 136 157 140M174 145L192 146', '#edb8a1', 1.55, 'opacity=".75"');
  art += line('M132 137Q146 137 151 149M173 144Q187 141 191 148', '#78423d', 1.4, 'opacity=".55"');
  // Each cut is drawn as its own shape; the slanted stack stays compact at icon size.
  art += p('M67 112Q100 102 128 116L175 139L162 155C129 156 102 142 63 135L48 124Z', 'url(#bg-skin)');
  art += p('M49 124C80 126 115 151 162 148L161 157C121 164 84 142 54 139Z', 'url(#bg-fat)', 'stroke="#936047" stroke-width="1.4"');
  art += p('M54 139C87 143 124 166 161 157L155 177C121 187 83 165 59 158Z', 'url(#bg-meat)', 'stroke-width="2.6"');
  art += line('M70 147C91 153 111 166 130 168', '#e3aa94', 1.6, 'opacity=".85"');
  art += line('M88 152Q100 151 107 162M124 163Q139 160 145 169', '#77423c', 1.4, 'opacity=".55"');
  art += line('M71 118Q91 115 109 122', '#edb779', 2.8, 'opacity=".75"');
  art += p('M56 148C81 142 109 153 141 171L140 186C110 189 77 175 46 170L35 160Z', 'url(#bg-skin)');
  art += p('M36 160C65 162 104 184 141 180L139 189C104 195 67 176 42 176Z', 'url(#bg-fat)', 'stroke="#936047" stroke-width="1.4"');
  art += p('M42 176C69 178 104 195 139 189L135 211C102 218 70 201 47 195Z', 'url(#bg-meat)', 'stroke-width="2.6"');
  art += line('M54 184C79 190 99 201 119 202', '#e5ac96', 1.6, 'opacity=".82"');
  art += line('M65 187Q79 184 85 197M104 197Q119 193 125 202', '#75413c', 1.4, 'opacity=".55"');
  art += line('M55 154Q75 151 93 158', '#edb779', 2.7, 'opacity=".75"');
  art += line('M68 187L74 197M88 194L92 203M117 199L116 208', '#a97564', 1.25, 'opacity=".45"');
  return doc('卤鹅肉', defs, art);
}

export const poultryTailCandidates = [
  {id:'fresh-poultry-5',name:'鸡腿',svg:chickenLeg(),design:{silhouette:'圆润上腿肉自然收束至短骨端，斜向放置，皮肉与骨头连成完整主体',angle:'三分之四略俯视，肉厚一侧朝向左上',material:'奶油浅皮色、温暖肉色反光、少量皮褶与自然骨端，保持生食材状态',identity:'饱满短粗鸡腿与短双瓣骨端，区别于长骨鸭腿',container:'无盛器、无额外食物'},reason:'为鸡腿提供全新独立构图，保留奶油浅皮色，用连续腿形和短骨端交代完整结构。'},
  {id:'fresh-poultry-6',name:'鸭胸肉',svg:duckBreast(),design:{silhouette:'宽扁鸭胸的弧形皮面与厚红肉侧切面，上下层紧密相接',angle:'三分之四俯视，前缘显露皮脂与肉层厚度',material:'浅鸭皮、薄奶白脂层和深红鸭胸肉分开表现，皮面少量浅刀纹',identity:'宽扁胸肉、深红切面与完整浅皮，区别于浅色鸡胸和带骨腿肉',container:'无盛器、无配菜'},reason:'以宽扁带皮鸭胸替代原来难辨的鸡全翅，拓展鸡、鸭、鹅的食材差异；名称和配方接入均待确认。'},
  {id:'fresh-poultry-7',name:'鸭腿',svg:duckLeg(),design:{silhouette:'厚阔鸭腿肉与偏长骨端形成清楚斜向轮廓，避开整只禽体的怪异剪影',angle:'偏俯视，肉部朝右上，骨端朝左下',material:'浅灰褐鸭皮、克制皮褶、边缘深红鸭肉和自然骨质，各层有明确厚度',identity:'比鸡腿更长的骨柄、阔腿肉与略深皮色共同区分',container:'无盛器、无新增装饰'},reason:'以结构清楚的鸭腿替代原整鸡，不再用难读的整禽身体；采用后相关烤鸡菜谱可同步改为烤鸭腿。'},
  {id:'fresh-poultry-8',name:'卤鹅肉',svg:braisedGoose(),design:{silhouette:'卤鹅肉块与紧凑斜切片组成前低后高的扇形堆叠',angle:'三分之四略俯视，正面清楚展示皮、脂和肉的切层',material:'卤棕皮面、薄浅脂层与嫩红褐熟肉分开表现，以宽高光和少量肉纹体现卤香',identity:'现成卤鹅切肉的熟制色泽与厚皮肉切面，区别于本链生鸡鸭肉和蛋品',container:'无盘子，肉块自行紧凑堆叠'},reason:'用可直接凉拌的熟制卤鹅肉替代皮蛋，形成鸡、鸭到鹅的种类变化；采用后原凉拌菜可同步改为凉拌卤鹅肉。'},
];

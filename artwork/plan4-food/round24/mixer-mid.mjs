// Round 24: four independently drawn mixer candidates with transparent vector masters.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const rect = (x, y, w, h, rx, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad = (id, colours) => `<linearGradient id="${id}" x1=".12" y1="0" x2=".88" y2="1">${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 特调基底独立新版候选</title><defs>${defs}</defs><g stroke="#49382e" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function tonic() {
  const body = 'M109 55L109 82C109 91 102 97 97 103C92 109 91 118 91 130L91 206C91 218 103 223 128 223C153 223 165 218 165 206L165 130C165 118 164 109 159 103C154 97 147 91 147 82L147 55Z';
  const defs = grad('m24-tonic-glass', ['#f4f2ff', '#d5d9ee', '#a8b9d4'])
    + grad('m24-tonic-water', ['#f2f5ff', '#d7e3ec', '#b4cddd'])
    + grad('m24-tonic-label', ['#d6c9ed', '#b5a1d5', '#8e7bb5'])
    + grad('m24-tonic-cap', ['#c5b4de', '#9985bc', '#78659a'])
    + `<clipPath id="m24-tonic-clip">${p(body, '#fff')}</clipPath>`;
  let art = p(body, 'url(#m24-tonic-glass)');
  art += '<g clip-path="url(#m24-tonic-clip)">';
  art += p('M98 122L98 205C99 212 108 216 128 216C148 216 157 212 158 205L158 122Z', 'url(#m24-tonic-water)', 'stroke="none"');
  art += e(128, 122, 30, 7, '#eff5f7', 'stroke="#a7bed0" stroke-width="1.25"');
  art += p('M147 103Q158 114 158 133L158 204Q156 210 146 213L147 132Z', '#91aac7', 'stroke="none" opacity=".24"');
  art += e(114, 196, 4.4, 4.4, '#faffff', 'stroke="#9eacc5" stroke-width="1.2"');
  art += e(138, 188, 3.3, 3.3, '#faffff', 'stroke="#a3b0c8" stroke-width="1.1"');
  art += '</g>';
  art += p('M92 142Q128 149 164 142L164 177Q128 184 92 177Z', 'url(#m24-tonic-label)', 'stroke-width="1.6"');
  art += e(127, 160, 15, 14, '#f6f1ff', 'stroke="#715d91" stroke-width="1.5"');
  art += e(123, 162, 4.6, 4.6, '#bda9dd', 'stroke="#7f6d9b" stroke-width="1.2"');
  art += e(131, 154, 3.1, 3.1, '#cebfe8', 'stroke="#7f6d9b" stroke-width="1.1"');
  art += line('M101 119L101 133M101 188L101 202Q102 209 114 211', '#fffdf8', 3, .95);
  art += line('M115 65L115 82Q115 92 107 102', '#fffefd', 2.2, .9);
  art += rect(105, 41, 46, 20, 5, 'url(#m24-tonic-cap)');
  art += e(128, 42, 23, 5, '#d8cae9', 'stroke-width="1.65"');
  art += line('M112 49L112 56M120 50L120 57M137 50L137 57M145 49L145 56', '#7b699a', 1.15, .9);
  art += line('M108 217Q129 225 150 217', '#e9f0fb', 1.6, .8);
  return doc('汤力水', defs, art);
}

function cola() {
  const body = 'M82 66Q75 81 78 108L82 151Q82 178 77 197Q77 212 128 216Q179 212 179 197Q174 177 174 151L178 108Q181 81 174 66Z';
  const defs = grad('m24-cola-red', ['#f87e65', '#df4c42', '#b63233'])
    + grad('m24-cola-metal', ['#f1f1df', '#b9c9c8', '#7f9c9c'])
    + grad('m24-cola-cream', ['#fff4d7', '#f5dda8', '#e8bf80'])
    + `<clipPath id="m24-cola-clip">${p(body, '#fff')}</clipPath>`;
  let art = p(body, 'url(#m24-cola-red)');
  art += '<g clip-path="url(#m24-cola-clip)">';
  art += p('M155 76Q175 111 164 151Q160 183 171 205L183 213L184 66Z', '#9d2b2e', 'stroke="none" opacity=".24"');
  art += p('M72 155C108 127 141 146 184 116L184 146C145 174 110 155 72 180Z', 'url(#m24-cola-cream)', 'stroke="none"');
  art += p('M76 158C110 135 148 148 177 125', 'none', 'stroke="#fff9df" stroke-width="2.1"');
  art += line('M89 84Q85 101 89 122M91 185L90 197', '#ffb09a', 3, .83);
  art += '</g>';
  art += e(128, 65, 46, 13, 'url(#m24-cola-metal)');
  art += e(128, 65, 36, 8, '#d7dfd6', 'stroke="#8faaa8" stroke-width="1.25"');
  art += e(143, 65, 11, 4.9, '#516867', 'stroke="#4f6562" stroke-width="1.2"');
  art += p('M114 59Q120 55 128 60L133 65Q128 70 120 68L114 65Z', '#f3f1d9', 'stroke="#728b86" stroke-width="1.3"');
  art += e(124, 62, 5, 2.2, '#a9bdb5', 'stroke="none"');
  art += line('M88 65Q96 58 111 57', '#fff9e7', 1.6, .92);
  art += line('M80 198Q128 215 177 199', '#f4b0a0', 1.4, .8);
  art += p('M80 202Q127 220 177 203L177 209Q128 226 80 209Z', 'url(#m24-cola-metal)', 'stroke-width="1.7"');
  art += line('M95 212Q128 221 159 213', '#e6eee2', 1.3, .9);
  return doc('可乐', defs, art);
}

function energySoda() {
  const body = 'M96 47C90 58 90 66 90 80L90 208Q91 220 128 222Q165 220 166 208L166 80C166 66 166 58 160 47Z';
  const defs = grad('m24-energy-navy', ['#597b9d', '#304f79', '#23364f'])
    + grad('m24-energy-orange', ['#ffd46c', '#f9a63f', '#e77a32'])
    + grad('m24-energy-metal', ['#f2f1df', '#bbcbd0', '#839da9'])
    + `<clipPath id="m24-energy-clip">${p(body, '#fff')}</clipPath>`;
  let art = p(body, 'url(#m24-energy-navy)');
  art += '<g clip-path="url(#m24-energy-clip)">';
  art += p('M149 57C159 89 156 151 156 209L168 216L169 47Z', '#172b47', 'stroke="none" opacity=".4"');
  art += p('M90 181L166 155L166 168L90 194Z', '#ed8840', 'stroke="none"');
  art += p('M136 83L108 133L129 131L117 174L152 119L132 122L149 83Z', 'url(#m24-energy-orange)', 'stroke="#d6a159" stroke-width="1.2"');
  art += line('M131 96L117 125L133 124', '#ffe7a0', 1.6, .9);
  art += line('M99 72L99 118M99 163L99 175M99 197L99 207', '#8fa8bb', 2.5, .75);
  art += '</g>';
  art += e(128, 47, 32, 10, 'url(#m24-energy-metal)');
  art += e(128, 47, 24.5, 6.2, '#d3e0df', 'stroke="#7691a1" stroke-width="1.2"');
  art += e(138, 48, 7.4, 3.4, '#516578', 'stroke-width="1.1"');
  art += p('M116 42Q121 39 126 43L131 47L126 51L119 49L115 46Z', '#f6f0dc', 'stroke="#79949c" stroke-width="1.1"');
  art += line('M102 47Q109 41 119 41', '#fcfff0', 1.5, .9);
  art += p('M91 210Q127 222 165 210L164 217Q127 230 92 217Z', 'url(#m24-energy-metal)', 'stroke-width="1.7"');
  art += line('M101 219Q128 226 154 219', '#e7ece1', 1.25, .9);
  return doc('能量汽水', defs, art);
}

function rum() {
  const body = 'M109 61L109 85C109 92 102 96 90 100C66 108 59 123 59 145L61 190C62 210 84 222 128 222C172 222 194 210 195 190L197 145C197 123 190 108 166 100C154 96 147 92 147 85L147 61Z';
  const defs = grad('m24-rum-glass', ['#fce2a5', '#d9a34e', '#a97332'])
    + grad('m24-rum-liquid', ['#eeb95e', '#c78132', '#9b5228'])
    + grad('m24-rum-cork', ['#e5bc83', '#bf8a54', '#93643d'])
    + grad('m24-rum-label', ['#fff1c7', '#ebd29c', '#c8a875'])
    + `<clipPath id="m24-rum-clip">${p(body, '#fff')}</clipPath>`;
  let art = p(body, 'url(#m24-rum-glass)');
  art += '<g clip-path="url(#m24-rum-clip)">';
  art += p('M67 129Q128 120 189 129L187 189C186 204 167 214 128 214C89 214 70 204 69 189Z', 'url(#m24-rum-liquid)', 'stroke="none"');
  art += e(128, 128, 60.5, 9, '#efbd69', 'stroke="#b4783d" stroke-width="1.2"');
  art += p('M176 117C185 139 180 184 176 202Q184 199 187 189L189 132Z', '#814b29', 'stroke="none" opacity=".2"');
  art += '</g>';
  art += p('M88 143Q128 137 168 143L168 186Q128 197 88 186Z', 'url(#m24-rum-label)', 'stroke-width="1.65"');
  art += e(128, 164, 19, 19, '#9d6335', 'stroke="#79512d" stroke-width="1.3"');
  art += p('M119 173L128 151L137 173L128 169Z', '#f4d697', 'stroke="#f2d18c" stroke-width=".8"');
  art += line('M99 151L106 151M150 151L157 151M99 179L106 180M150 180L157 179', '#b79a61', 1.2, .9);
  art += line('M76 121Q69 132 71 149M73 192Q76 204 96 208', '#ffdfa0', 3.2, .9);
  art += line('M115 70L115 83Q115 94 104 99', '#fff0bc', 2.2, .88);
  art += rect(104, 48, 48, 20, 5, 'url(#m24-rum-cork)');
  art += e(128, 48, 24, 6.5, '#e9c38b', 'stroke-width="1.7"');
  art += line('M111 55L113 62M124 55L123 63M141 54L139 62', '#926239', 1.2, .9);
  art += p('M108 68L108 79Q127 84 148 79L148 68Z', '#8b4e2b', 'stroke-width="1.7"');
  art += line('M114 73Q128 77 141 73', '#e9b86b', 1.3, .9);
  art += line('M102 215Q128 221 154 215', '#edc37c', 1.45, .8);
  return doc('朗姆酒', defs, art);
}

export const mixerMidCandidates = [
  { id: 'fresh-mixer-5', name: '汤力水', svg: tonic(), expectedOccupancy: .70,
    design: { silhouette: '窄肩长颈玻璃瓶，淡紫金属盖与略鼓的直身，五级保持小巧', angle: '正面略俯视，瓶盖和水线保留浅椭圆', material: '清透冷蓝玻璃、淡紫标签与少量大气泡，克制明暗', identity: '紫色圆形气泡徽标与修长玻璃瓶，区别矿泉水塑料瓶和苏打易拉罐', container: '单只封口玻璃瓶，透明底，无外置装饰' },
    reason: '以淡紫冷调长颈玻璃瓶和清亮气泡建立汤力水身份，区别蓝盖矿泉瓶与青蓝苏打罐；五级体量约70%。' },
  { id: 'fresh-mixer-6', name: '可乐', svg: cola(), expectedOccupancy: .80,
    design: { silhouette: '红色矮胖弧身易拉罐，罐腰轻收、上下圆润', angle: '正面略俯视，可见浅椭圆金属顶与拉环', material: '饱满暖红罐身、奶油色大弧带和浅冷金属边', identity: '红色矮胖罐与一条宽奶油波带，区别瘦高能量罐和蓝绿苏打罐', container: '单只易拉罐，无文字商标、吸管或配饰' },
    reason: '用红色矮胖曲线罐和宽奶油波带建立可乐身份，保留清晰细描边，棋盘小图以完整色块辨识。' },
  { id: 'fresh-mixer-7', name: '能量汽水', svg: energySoda(), expectedOccupancy: .80,
    design: { silhouette: '窄而高的直身易拉罐，收肩金属顶和细底沿', angle: '正面略俯视，纵向轮廓完整', material: '深蓝罐身、明亮橙黄闪电和克制金属边', identity: '大闪电与瘦高深蓝罐形成高对比，明显区别矮胖红色可乐', container: '单只瘦高易拉罐，无商标文字与外部装饰' },
    reason: '以深蓝瘦高罐和一枚大橙黄闪电表现能量汽水，形体比例与可乐、苏打水拉开，40px仍保留清楚身份。' },
  { id: 'fresh-mixer-8', name: '朗姆酒', svg: rum(), expectedOccupancy: .80,
    design: { silhouette: '宽肩圆腹、短颈软木塞酒瓶，下腹饱满而非方瓶', angle: '正面略俯视，可见软木塞顶和琥珀液面', material: '金琥珀酒液、温暖棕玻璃和奶油纸签，柔和整块明暗', identity: '圆润宽肩短颈与棕金徽标，区别方形威士忌和修长透明伏特加', container: '单只软木塞圆腹酒瓶，不添杯子或零碎配件' },
    reason: '重新绘制宽肩圆腹朗姆酒瓶，以金琥珀酒液、软木塞和简洁棕金标记表现醇厚，独立轮廓区别后段其它基酒。' },
];

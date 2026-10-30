// Round 21: three independent editable coffee candidates, 256px masters.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours) => `<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 咖啡独立候选</title><defs>${defs}</defs><g stroke="#52392e" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function coffeeBeans() {
  const defs = gradient('c21-bean-back', ['#c28a5a', '#9b613e', '#74472e'])
    + gradient('c21-bean-left', ['#ba7d4e', '#945332', '#6d3c29'])
    + gradient('c21-bean-front', ['#c08a5b', '#925333', '#673b2a']);
  const shape = 'M0-44C22-46 36-25 35-1C34 23 21 43 2 45C-20 47-35 29-35 3C-35-22-22-42 0-44Z';
  const bean = (x, y, angle, fill) => `<g transform="translate(${x} ${y}) rotate(${angle})">`
    + p(shape, fill)
    + p('M-16-28C-26-17-27 1-23 13C-22 17-18 17-18 12C-21-3-18-16-11-25C-8-29-12-32-16-28Z', '#dfae7e', 'stroke="none" opacity=".58"')
    + p('M0-35C-10-22 7-14 3-1C-1 12-9 20 2 36C-4 25 6 16 8 3C11-11-3-21 4-34Z', '#4f2e23', 'stroke="#4d2c22" stroke-width="1.25"')
    + line('M4-31C1-23 10-15 10-6M3 15C0 23 0 28 4 33', '#d9a26d', 1.35, .66)
    + '</g>';
  let art = bean(128, 87, 28, 'url(#c21-bean-back)');
  art += bean(83, 148, -34, 'url(#c21-bean-left)');
  art += bean(160, 150, 39, 'url(#c21-bean-front)');
  return doc('咖啡豆', defs, art);
}

function espresso() {
  const defs = gradient('c21-espresso-porcelain', ['#fffdf1', '#f4f0df', '#d9ddce'])
    + gradient('c21-espresso-saucer', ['#fcfae9', '#e5e7d9', '#c7d0c5'])
    + gradient('c21-espresso-coffee', ['#9d6338', '#754024', '#4f2b1e']);
  let art = e(127, 174, 78, 20, 'url(#c21-espresso-saucer)');
  art += e(127, 171, 58, 12, '#faf8e7', 'stroke="#b8bba9" stroke-width="1.35"');
  art += line('M63 174C77 186 110 190 136 188M153 186Q177 183 188 175', '#fdfced', 1.8, .88);
  art += p('M164 112C183 105 201 115 201 129C200 145 187 155 173 151L168 139C179 145 190 137 190 129C190 121 179 120 170 126Z', 'url(#c21-espresso-porcelain)');
  art += line('M183 116C192 119 196 126 192 134', '#fffdf0', 1.8, .9);
  art += p('M73 111L169 111L165 142C163 160 146 173 122 174C98 174 81 163 78 145Z', 'url(#c21-espresso-porcelain)');
  art += p('M146 119L162 116L159 144C156 156 147 164 135 168C147 164 151 146 150 133Z', '#c9d1c4', 'stroke="none" opacity=".65"');
  art += p('M83 122C82 133 85 146 90 152C93 155 96 153 94 149C90 142 89 133 90 126C91 120 85 117 83 122Z', '#fffdf4', 'stroke="none" opacity=".94"');
  art += e(121, 111, 48, 18, '#f9f6e5');
  art += e(121, 111, 41, 12.6, '#c98c4b', 'stroke="#987044" stroke-width="1.35"');
  art += e(120, 112, 34.5, 8.6, 'url(#c21-espresso-coffee)', 'stroke="none"');
  art += line('M87 108C94 103 106 101 117 102', '#f5cf83', 2.1, .94);
  art += e(147, 109, 2.5, 1.4, '#eed09a', 'stroke="none"');
  art += e(153, 113, 1.4, .9, '#e2b46c', 'stroke="none"');
  art += line('M91 158C99 165 109 168 120 168', '#c4cabd', 1.35, .7);
  return doc('浓缩咖啡', defs, art);
}

function originalCoffee() {
  const defs = gradient('c21-original-ceramic', ['#fff5d9', '#f1dfb9', '#d8c39a'])
    + gradient('c21-original-rim', ['#fff9e4', '#ecdfbd'])
    + gradient('c21-original-coffee', ['#976441', '#70452d', '#4d3023']);
  let art = p('M164 108C185 100 204 110 204 133C204 157 186 176 167 169L167 154C179 161 191 148 192 135C194 122 185 117 171 123Z', 'url(#c21-original-ceramic)');
  art += line('M184 111C198 117 200 132 194 145', '#fff4d3', 1.9, .9);
  art += p('M67 90L169 90L169 172C169 195 149 209 119 209C89 209 67 196 67 173Z', 'url(#c21-original-ceramic)');
  art += p('M150 102L167 97L167 172C166 187 154 198 137 202C149 189 150 170 149 148Z', '#bca67f', 'stroke="none" opacity=".28"');
  art += p('M78 110C76 131 77 162 79 173C80 179 86 179 85 172L86 116C86 108 79 104 78 110Z', '#fff8e1', 'stroke="none" opacity=".94"');
  art += e(118, 90, 51, 19, 'url(#c21-original-rim)');
  art += e(118, 91, 44, 13.2, 'url(#c21-original-coffee)', 'stroke="#836243" stroke-width="1.4"');
  art += line('M82 90C90 84 103 82 114 83', '#bc8a57', 1.65, .9);
  art += line('M86 190C93 198 107 202 119 202M128 202Q146 200 155 192', '#c7b48f', 1.35, .74);
  art += line('M79 105Q97 112 116 113', '#fff9e2', 1.6, .7);
  return doc('原味咖啡', defs, `<g transform="rotate(-4 128 140)">${art}</g>`);
}

export const coffeeFrontCandidates = [
  { id: 'fresh-coffee-1', name: '咖啡豆', svg: coffeeBeans(), expectedOccupancy: .66, design: { silhouette: '三枚肥椭圆烘焙咖啡豆紧凑相叠，各自一道自然弯曲中缝', angle: '俯视，三枚豆粒轻微转向形成稳定三角构图', material: '暖烘棕与可可棕豆面，克制浅棕弧光与深中缝', identity: '完整椭圆豆身和清楚的弯曲豆缝，区别彩色糖豆与圆黑珍珠', container: '裸咖啡豆组合，透明底，无容器和配饰' }, reason: '以三枚圆厚咖啡豆和自然中缝建立一级身份，减少零碎数量和纹理，暖烘棕色在40px下仍清楚可辨。' },
  { id: 'fresh-coffee-2', name: '浓缩咖啡', svg: espresso(), expectedOccupancy: .68, design: { silhouette: '矮小白陶浓缩杯、单侧小把手与轻薄椭圆小碟，整体短宽', angle: '略俯视，清楚看见小杯深色咖啡与金棕crema边', material: '温润白陶、浓深咖啡和薄金棕油脂圈，少量柔亮面', identity: '极小短杯与薄小碟，以及清楚crema圈，区别较高的日常马克杯', container: '一套简洁白陶小杯碟，无长勺与高蒸汽' }, reason: '独立绘制矮小浓缩杯与薄碟，用浓深咖啡和金棕油脂圈表现醇厚；二级保持短宽小巧，与原味马克杯拉开轮廓。' },
  { id: 'fresh-coffee-3', name: '原味咖啡', svg: originalCoffee(), expectedOccupancy: .70, design: { silhouette: '暖奶油色直身陶瓷马克杯，单枚自然圆把，杯身比浓缩杯明显更高', angle: '三分之四俯视，略向左倾，可见纯咖啡液面', material: '暖奶油陶瓷和深棕咖啡，大块柔和明暗、无奶油和拉花', identity: '完整较高马克杯与纯黑咖啡面，区别短矮浓缩杯和便携带盖杯', container: '单只中等陶瓷马克杯，无碟、长勺或高蒸汽' }, reason: '以暖奶油直身马克杯重新设计原味咖啡，杯高、把手和纯咖啡液面构成清楚身份，三级体量控制在约70%。' },
];

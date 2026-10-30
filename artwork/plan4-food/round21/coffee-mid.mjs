// Round 21: portable, iced and dark-roast coffee use distinct silhouettes.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours, coordinates = 'x1=".1" y1="0" x2=".9" y2="1"') => `<linearGradient id="${id}" ${coordinates}>${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 咖啡独立候选</title><defs>${defs}</defs><g stroke="#5c4335" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function portableCoffee() {
  const cup = 'M78 81L178 81L165 198C164 207 153 213 129 213C105 213 94 208 93 199Z';
  const defs = gradient('c21-portable-paper', ['#f1d5a2', '#dfb57b', '#c89458'])
    + gradient('c21-portable-lid', ['#8e6046', '#714b37', '#573b2c'])
    + gradient('c21-portable-band', ['#fff4d8', '#f2ddb1', '#dfc28e'])
    + `<clipPath id="c21-portable-clip">${p(cup, '#fff')}</clipPath>`;
  let art = p(cup, 'url(#c21-portable-paper)');
  art += '<g clip-path="url(#c21-portable-clip)">';
  art += p('M81 124C104 131 151 133 174 123L169 165C145 177 108 174 88 167Z', 'url(#c21-portable-band)', 'stroke-width="1.5"');
  art += p('M88 89L98 190C100 199 109 202 116 203L110 87Z', '#fff0c8', 'stroke="none" opacity=".36"');
  art += p('M163 88L152 204C158 202 161 199 161 194L174 87Z', '#a36c3d', 'stroke="none" opacity=".13"');
  art += '</g>';
  art += line('M93 133C111 138 150 140 168 133M96 161C117 168 145 169 165 162', '#fff9e7', 1.7, .8);
  art += line('M101 193Q128 204 155 194', '#b7844c', 1.35, .7);
  art += p('M76 68C80 60 99 56 127 56C155 56 174 60 180 68L183 79C184 87 164 93 129 93C95 93 74 87 74 80Z', 'url(#c21-portable-lid)');
  art += e(128, 67, 52, 12, '#916548', 'stroke-width="1.7"');
  art += p('M84 65C101 57 152 56 171 65C162 62 149 63 135 64C116 65 100 68 84 65Z', '#b1845b', 'stroke="none" opacity=".78"');
  art += p('M139 54C139 51 144 49 153 49C162 49 167 51 167 54L167 62C158 65 147 65 139 62Z', '#6b4833', 'stroke-width="1.6"');
  art += e(153, 53, 14, 4, '#a07550', 'stroke-width="1.35"');
  art += line('M79 79C98 88 157 90 178 79', '#b08a62', 1.55, .8);
  return doc('便携咖啡', defs, `<g transform="rotate(-7 128 128)">${art}</g>`);
}

function icedCoffee() {
  const glass = 'M68 89C68 80 95 72 128 72C161 72 188 80 188 89L181 191C180 204 159 213 128 213C97 213 76 204 75 191Z';
  const defs = gradient('c21-iced-glass', ['#edf7e9', '#cfddd0', '#a9c8be'])
    + gradient('c21-iced-coffee', ['#d5a15d', '#aa6b35', '#704326'])
    + gradient('c21-iced-ice', ['#fff9de', '#f0e9c4', '#cbd9c5'])
    + `<clipPath id="c21-iced-clip">${p(glass, '#fff')}</clipPath>`;
  let art = p(glass, 'url(#c21-iced-glass)');
  art += '<g clip-path="url(#c21-iced-clip)">';
  art += p('M70 110C91 121 165 122 186 111L181 189C178 199 155 206 128 206C100 206 79 198 76 189Z', 'url(#c21-iced-coffee)', 'stroke="none"');
  art += e(128, 112, 57, 18, '#b98647', 'stroke="#8c6538" stroke-width="1.4"');
  art += p('M82 105L105 91L127 103L125 129L103 140L83 127Z', 'url(#c21-iced-ice)', 'stroke="#aab9a0" stroke-width="1.5" opacity=".94"');
  art += p('M132 94L155 89L174 104L169 126L147 133L129 118Z', 'url(#c21-iced-ice)', 'stroke="#aab9a0" stroke-width="1.5" opacity=".9"');
  art += p('M111 137L136 123L158 136L154 161L130 170L109 155Z', 'url(#c21-iced-ice)', 'stroke="#aab9a0" stroke-width="1.5" opacity=".86"');
  art += line('M87 107L104 99L120 107M137 98L153 95L167 106M117 139L135 130L151 139', '#fffdf0', 2, .9);
  art += line('M104 113L103 132M148 107L146 125M131 146L130 163', '#b6c6af', 1.3, .7);
  art += p('M80 113C79 135 81 165 84 184C86 190 92 189 91 182L87 116C87 110 81 108 80 113Z', '#fff9d9', 'stroke="none" opacity=".7"');
  art += p('M173 119L168 189C162 195 155 196 150 197C165 199 176 193 176 187L181 115Z', '#4f3b29', 'stroke="none" opacity=".14"');
  art += '</g>';
  art += e(128, 89, 60, 17, 'none', 'stroke="#728d81" stroke-width="1.7"');
  art += line('M77 87C96 75 157 75 180 87M83 198C100 208 152 211 173 198', '#f9f8dc', 2.1, .95);
  art += line('M76 96L81 188M180 97L175 187', '#c4d7c4', 1.35, .8);
  return doc('冰咖啡', defs, art);
}

function darkRoast() {
  const defs = gradient('c21-dark-cup', ['#7da8a3', '#527c79', '#315b5b'])
    + gradient('c21-dark-handle', ['#729b96', '#426d6b'])
    + gradient('c21-dark-rim', ['#bfd4be', '#88b1a3', '#5a8b82'])
    + gradient('c21-dark-coffee', ['#5a3828', '#3e281e', '#2c211c'])
    + gradient('c21-dark-bean', ['#a66b42', '#7a452b', '#59351f']);
  let art = p('M179 112C192 106 207 111 210 124C213 143 200 161 180 161L178 147C190 149 199 139 198 129C198 123 190 121 182 125Z', 'url(#c21-dark-handle)');
  art += line('M195 115C204 119 206 133 200 142', '#b4cdb8', 1.5, .7);
  art += p('M62 111C63 156 76 181 107 190C120 194 142 194 156 188C181 179 190 154 190 111Z', 'url(#c21-dark-cup)');
  art += p('M73 132C77 155 86 170 103 177C107 179 109 175 105 173C91 165 86 149 82 132C80 126 72 126 73 132Z', '#b9d1ba', 'stroke="none" opacity=".56"');
  art += p('M164 130C163 155 153 176 138 186C160 183 176 165 180 136Z', '#24494a', 'stroke="none" opacity=".22"');
  art += e(126, 111, 64, 25, 'url(#c21-dark-rim)');
  art += e(126, 111, 56, 19, 'url(#c21-dark-coffee)', 'stroke="#3b3a2b" stroke-width="1.7"');
  art += p('M75 107C83 94 104 91 125 92C147 92 166 98 176 108C163 101 148 99 127 99C103 98 87 101 75 107Z', '#bc854a', 'stroke="none"');
  art += line('M84 104C94 99 106 98 116 98M158 112Q168 114 173 112', '#d6aa69', 1.55, .85);
  art += line('M73 113C82 128 110 133 130 133M92 181C107 188 139 190 156 180', '#c4dac2', 1.8, .75);
  art += '<g transform="rotate(-28 57 183)">';
  art += e(57, 183, 11, 7.2, 'url(#c21-dark-bean)', 'stroke-width="1.9"');
  art += line('M49 183C54 179 59 186 65 182', '#4f2e20', 1.35);
  art += line('M49 180Q53 177 57 178', '#c28f5b', 1.3, .72);
  art += '</g><g transform="rotate(23 77 196)">';
  art += e(77, 196, 10, 7.3, 'url(#c21-dark-bean)', 'stroke-width="1.9"');
  art += line('M70 196C75 193 79 199 84 195', '#4f2e20', 1.3);
  art += line('M70 193Q74 190 78 191', '#c28f5b', 1.3, .72);
  art += '</g>';
  return doc('深烘咖啡', defs, art);
}

export const coffeeMidCandidates = [
  { id: 'fresh-coffee-4', name: '便携咖啡', svg: portableCoffee(), expectedOccupancy: .70, design: { silhouette: '小巧牛皮纸锥杯、深棕扣盖与奶油色窄杯带，整体微微倾斜', angle: '三分之四侧俯视，露出扣盖椭圆与自然杯口层次', material: '温暖牛皮纸、细腻奶油杯带、深可可色扣盖，少量柔和反光', identity: '完整便携扣盖、纸质锥杯和简洁杯带，区别陶瓷杯与高白大杯', container: '小牛皮纸外带杯，无字无品牌，无长吸管或勺' }, reason: '独立绘制紧凑纸锥杯与深棕扣盖，用纸质暖色和窄杯带建立便携咖啡身份，四级继续保持小巧。' },
  { id: 'fresh-coffee-5', name: '冰咖啡', svg: icedCoffee(), expectedOccupancy: .70, design: { silhouette: '低矮透明直玻璃杯，三块大冰在琥珀咖啡中错位相接', angle: '略俯视，可见开放的椭圆杯口、冰块顶面与杯底', material: '暖琥珀到深棕咖啡、浅冷绿透明玻璃和奶冰色晶面，光泽克制', identity: '无盖敞口玻璃杯与三枚清楚冰块，区别热陶杯和外带纸杯', container: '简单矮玻璃杯，无盖无吸管，主体视觉居中' }, reason: '用敞口矮玻璃杯和三块大冰表现清爽冰咖啡，减少零碎冰粒与细节，五级保持约70%体量。' },
  { id: 'fresh-coffee-6', name: '深烘咖啡', svg: darkRoast(), expectedOccupancy: .8, design: { silhouette: '宽口矮胖深蓝绿陶杯与小圆把，杯前两枚极小烘豆平衡构图', angle: '三分之四俯视，宽椭圆杯口清楚展示深烘液面', material: '深蓝绿釉陶、极深可可咖啡与一圈克制金棕油脂，少量暖豆色', identity: '宽矮杯形、近黑咖啡和小烘豆，区别白色短浓缩杯与原味高马克杯', container: '深蓝绿矮陶杯，短小把手，无长勺与蒸汽配件' }, reason: '以宽矮深蓝绿陶杯和深可可液面表现深烘的浓厚，少量暖金crema和两颗小烘豆增强身份，保持清楚大形。' },
];

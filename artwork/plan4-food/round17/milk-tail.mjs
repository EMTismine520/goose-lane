// Independent milk-chain review artwork. Runtime items and selected originals stay intact.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.45, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours) => `<linearGradient id="${id}" x1=".1" y1="0" x2=".8" y2="1">${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 乳品新版候选</title><defs>${defs}</defs><g stroke="#574137" stroke-width="3.1" stroke-linejoin="round" stroke-linecap="round">${art}</g></svg>`;

function cream() {
  const defs = gradient('m17-cream-bowl', ['#e4f0ed', '#c5dbd8', '#a0c2c0'])
    + gradient('m17-cream', ['#fffbed', '#fff0d5', '#e7d2ad'])
    + gradient('m17-cream-side', ['#fff4da', '#e8ceaa']);
  let art = p('M52 136C61 145 90 152 128 152C166 152 194 145 204 136L192 170C184 190 161 201 129 201C96 201 72 189 64 170Z', 'url(#m17-cream-bowl)');
  art += e(128, 136, 76, 24, '#eaf3eb');
  art += p('M64 137C66 125 79 118 93 118C87 104 100 92 114 91C110 79 119 69 131 65C131 75 141 77 145 83C152 91 150 96 146 101C162 99 175 109 173 120C187 122 195 129 192 138C175 151 84 153 64 137Z', 'url(#m17-cream)');
  art += p('M76 134C91 144 117 148 145 146C164 145 180 141 190 136C188 147 162 155 130 154C100 154 77 147 76 134Z', 'url(#m17-cream-side)', 'stroke="none"');
  art += line('M87 120C99 130 122 131 140 125C151 121 158 115 158 109M112 93C118 101 130 104 143 100', '#bfaa86', 1.5, .8);
  art += line('M92 136C104 141 118 142 128 141M102 112C110 115 120 116 127 114M124 83Q128 87 133 88', '#fffdf2', 2.4, .94);
  art += line('M65 152C69 166 76 178 89 183M107 195C124 199 145 197 158 193', '#f5fbef', 2.2, .92);
  art += line('M174 183Q181 177 185 167', '#82a6a4', 1.4, .65);
  return doc('奶油', defs, art);
}

function yogurt() {
  const defs = gradient('m17-yogurt-cup', ['#fff5de', '#eee0c6', '#cfbda5'])
    + gradient('m17-yogurt-label', ['#b9cfdf', '#91b4cf', '#759ab9'])
    + gradient('m17-yogurt-foil', ['#f7f5e9', '#d9dfdb', '#acbdc1'])
    + gradient('m17-yogurt-white', ['#fffdf0', '#fff4dc', '#e8d5b5']);
  let art = p('M66 109L77 183C80 199 171 201 176 184L188 110Z', 'url(#m17-yogurt-cup)');
  art += p('M70 135C98 147 156 149 184 135L178 169C150 181 105 180 75 168Z', 'url(#m17-yogurt-label)', 'stroke-width="1.6"');
  art += p('M76 139L80 163C86 166 91 168 95 168L91 144Z', '#dce8e6', 'stroke="none" opacity=".78"');
  art += e(127, 110, 62, 24, '#d8dbd0', 'stroke-width="2.3"');
  art += e(127, 111, 54, 18, 'url(#m17-yogurt-white)', 'stroke="#ae9b82" stroke-width="1.45"');
  art += p('M92 108C102 99 117 98 128 104C136 107 146 110 162 108C156 119 130 125 110 120C99 118 93 114 92 108Z', '#fffcee', 'stroke="none"');
  art += line('M100 112C113 117 130 116 137 112', '#d5c0a0', 1.35, .66);
  art += p('M66 103C72 86 87 64 101 57C125 62 145 76 155 90C130 83 98 89 78 107Z', 'url(#m17-yogurt-foil)');
  art += p('M101 57C115 68 128 83 133 88C119 86 100 91 87 98C88 84 94 68 101 57Z', '#eef2e7', 'stroke="none"');
  art += line('M75 96C81 82 89 72 96 68M105 64C118 73 128 82 134 87', '#fffef4', 1.9, .9);
  art += line('M87 185C106 192 146 194 166 187', '#fff7e3', 2, .9);
  return doc('酸奶', defs, art);
}

function cheeseWheel() {
  const defs = gradient('m17-cheese-rind', ['#f9c25d', '#eaa03e', '#cd7b30'])
    + gradient('m17-cheese-top', ['#ffe8a0', '#ffd478', '#efb44e'])
    + gradient('m17-cheese-cut', ['#ffeeb0', '#ffdc81', '#f1ba56'])
    + gradient('m17-cheese-wedge', ['#ffe9a1', '#ffd171', '#eda943']);
  let art = p('M35 107C35 85 70 67 112 67C155 67 190 85 190 107L190 145L114 145L155 178C143 185 128 189 112 189C70 189 35 171 35 149Z', 'url(#m17-cheese-rind)');
  art += p('M114 107L190 107L190 145L114 145Z', 'url(#m17-cheese-cut)', 'stroke-width="1.6"');
  art += p('M114 107L155 141L155 178L114 145Z', '#f8cf74', 'stroke-width="1.6"');
  art += p('M35 107C35 85 70 67 112 67C155 67 190 85 190 107L114 107L155 141C143 147 128 150 112 150C70 150 35 131 35 107Z', 'url(#m17-cheese-top)');
  art += line('M48 104C51 87 80 77 107 77M49 142C61 155 84 162 107 163', '#fff0b5', 2.4, .88);
  art += e(82, 102, 10, 6, '#d89338', 'stroke="#b97a32" stroke-width="1.3"');
  art += e(129, 85, 7.5, 4.3, '#dea044', 'stroke="#be8139" stroke-width="1.25"');
  art += e(100, 129, 6, 4, '#df9c40', 'stroke="#bd8038" stroke-width="1.25"');
  art += p('M147 156L204 139L227 181L174 206L143 188Z', 'url(#m17-cheese-rind)');
  art += p('M147 156L204 139L227 164L174 187Z', 'url(#m17-cheese-wedge)');
  art += p('M174 187L227 164L227 181L174 206Z', 'url(#m17-cheese-cut)');
  art += line('M155 159L201 146L218 164M180 199L220 181', '#fff0b7', 1.8, .84);
  art += e(184, 162, 6.7, 4, '#d99a3f', 'stroke="#bb7c32" stroke-width="1.25"');
  art += e(207, 181, 5, 4, '#e0a248', 'stroke="#bc8039" stroke-width="1.25"');
  return doc('奶酪', defs, `<g transform="rotate(-7 128 128)">${art}</g>`);
}

function condensedMilk() {
  const defs = gradient('m17-condensed-can', ['#dce9e8', '#a9c5cc', '#83a7b4'])
    + gradient('m17-condensed-metal', ['#f2f1de', '#c2d3d1', '#8bafb7'])
    + gradient('m17-condensed-milk', ['#fff5c9', '#f4d999', '#dbb86e'])
    + gradient('m17-condensed-spoon', ['#eff4eb', '#bbd0d0', '#86aab1']);
  let art = p('M57 112L57 181C58 199 164 203 169 183L169 112Z', 'url(#m17-condensed-can)');
  art += p('M60 135C87 145 141 147 167 136L167 166C138 176 89 175 59 165Z', '#fff0ce', 'stroke-width="1.5"');
  art += p('M110 144C106 151 100 154 100 160C100 168 113 172 119 166C126 160 118 152 110 144Z', 'url(#m17-condensed-milk)', 'stroke="#b39564" stroke-width="1.4"');
  art += line('M65 173L65 181C66 189 92 193 107 193M120 196Q142 196 157 189', '#e5efdf', 2.1, .9);
  art += e(113, 112, 56, 22, 'url(#m17-condensed-metal)');
  art += e(113, 113, 48, 15, 'url(#m17-condensed-milk)', 'stroke="#a89873" stroke-width="1.5"');
  art += line('M72 109C84 100 103 98 118 100', '#fff5d3', 2, .9);
  art += p('M130 98C146 88 158 81 166 74L196 45C200 41 207 44 206 49C206 52 202 56 199 59L174 83C170 88 169 95 163 101C152 111 138 112 130 106C127 103 127 100 130 98Z', 'url(#m17-condensed-spoon)');
  art += p('M133 98C142 91 158 89 165 93C170 97 163 103 156 106C147 110 136 109 132 105C129 102 131 100 133 98Z', 'url(#m17-condensed-milk)', 'stroke="#a58c5d" stroke-width="1.4"');
  art += p('M146 104C146 113 148 119 146 126C145 130 139 130 138 126C136 121 139 115 138 108Z', 'url(#m17-condensed-milk)', 'stroke="#ac935f" stroke-width="1.45"');
  art += line('M174 79L197 54M136 99Q144 95 151 96', '#fffcee', 1.7, .9);
  return doc('炼乳', defs, art);
}

export const milkTailCandidates = [
  { id: 'fresh-milk-4', name: '奶油', svg: cream(), expectedOccupancy: .70, design: { silhouette: '低矮浅蓝陶碗中一团圆润螺旋奶油，奶油上缘柔软起伏', angle: '略俯视，可见奶油的弧面和碗口', material: '奶白、淡杏色厚奶油配一处柔亮面，极浅蓝陶碗', identity: '圆润奶油团和短螺旋折面，区别盒装黄油和带盖酸奶', container: '低矮小陶碗承托，容器颜色轻、体量克制' }, reason: '重画小碗与圆润奶油团，以少量弧面表现绵密质感，避免高耸冰淇淋造型，四级保持小体量。' },
  { id: 'fresh-milk-5', name: '酸奶', svg: yogurt(), expectedOccupancy: .68, design: { silhouette: '短胖酸奶小杯、微揭银色封盖和清楚的浓白奶面', angle: '三分之四俯视，封盖向左后方轻揭', material: '奶白厚酸奶、淡蓝杯身色带与浅银封盖，柔和光泽', identity: '可揭封盖与开口白酸奶表面，区别玻璃牛奶瓶和炼乳金属罐', container: '低矮轻巧小杯，无文字和品牌装饰' }, reason: '独立设计微揭封盖的矮酸奶杯，白色奶面清楚可见，蓝色杯带辅助辨识，五级控制体量。' },
  { id: 'fresh-milk-6', name: '奶酪', svg: cheeseWheel(), expectedOccupancy: .8, design: { silhouette: '切去一角的厚圆奶酪轮，前方一枚独立扇形奶酪角', angle: '三分之四俯视，圆轮与前方切角交错形成厚实层次', material: '暖金黄奶酪外皮与奶油黄切面，少量稀疏圆孔', identity: '完整圆轮、明确缺角和厚切楔块，区别低阶薄芝士片', container: '裸奶酪组合，透明底，无盘无配料' }, reason: '用厚圆奶酪轮和一枚切下的小角建立高阶体量，保留少量清楚圆孔，轮廓与芝士片完全区分。' },
  { id: 'fresh-milk-7', name: '炼乳', svg: condensedMilk(), expectedOccupancy: .8, design: { silhouette: '矮圆开口金属罐，上方一把斜匙带一小条浓稠炼乳', angle: '三分之四俯视，可见罐口奶金乳面与匙上浓乳', material: '奶金色浓稠炼乳、淡蓝银金属罐和少量明亮金属边', identity: '开口乳面、带乳斜匙与短浓稠乳线，区别空罐或饮料瓶', container: '简洁小金属罐，奶白标签仅一枚乳滴，无文字品牌' }, reason: '重新绘制开罐炼乳与带乳小匙，奶金乳面和一条短乳线强调浓稠食材质感，避免只像一只空罐。' },
];

// Round 25: independent replacement drink candidates, transparent 256px vector masters.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad = (id, colours) => `<linearGradient id="${id}" x1=".12" y1="0" x2=".86" y2="1">${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 特调基底替换候选</title><defs>${defs}</defs><g stroke="#49382e" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function grapefruitSoda() {
  const body = 'M64 101L79 196C81 208 101 216 128 216C155 216 175 208 177 196L192 101Z';
  const defs = grad('m25-grapefruit-glass', ['#fff5e6', '#f4e4cf', '#d8cdc0'])
    + grad('m25-grapefruit-juice', ['#ffc3ac', '#f78f8d', '#e76e79'])
    + grad('m25-grapefruit-peel', ['#ffd491', '#f4b66c', '#dc8b5a'])
    + `<clipPath id="m25-grapefruit-clip">${p(body, '#fff')}</clipPath>`;
  let art = '<g transform="rotate(14 172 78)">';
  art += e(172, 77, 29, 31, 'url(#m25-grapefruit-peel)', 'stroke-width="2.6"');
  art += e(172, 77, 24, 26, '#fff2c8', 'stroke="none"');
  art += e(172, 77, 20, 22, '#f18386', 'stroke="none"');
  art += line('M172 57L172 97M154 68L190 86M155 87L189 67', '#ffe8c2', 2.3, .98);
  art += e(172, 77, 2, 2, '#ffe9c7', 'stroke="none"');
  art += '</g>';
  art += p(body, 'url(#m25-grapefruit-glass)');
  art += '<g clip-path="url(#m25-grapefruit-clip)">';
  art += p('M69 118L83 194C86 204 103 209 128 209C153 209 170 204 173 194L187 118Z', 'url(#m25-grapefruit-juice)', 'stroke="none"');
  art += e(128, 118, 58, 13, '#ffbba4', 'stroke="#d8867e" stroke-width="1.35"');
  art += p('M171 125L158 198Q166 196 170 190L181 123Z', '#c95f75', 'stroke="none" opacity=".25"');
  art += e(111, 173, 6, 6, '#fff0d4', 'stroke="#d77b80" stroke-width="1.25"');
  art += e(143, 190, 4.7, 4.7, '#ffe7d0', 'stroke="#cf7580" stroke-width="1.15"');
  art += e(150, 151, 3.6, 3.6, '#ffead3', 'stroke="#d78286" stroke-width="1.1"');
  art += line('M78 132L87 184Q89 196 99 199', '#fff9e6', 3.1, .94);
  art += '</g>';
  art += e(128, 101, 64, 16, '#fff4d9');
  art += e(128, 102, 56, 10.5, '#ffc4ae', 'stroke="#dba18e" stroke-width="1.35"');
  art += e(113, 102, 5, 2.5, '#fff0d2', 'stroke="none"');
  art += e(141, 99, 3.7, 2, '#fff1d5', 'stroke="none"');
  art += line('M76 98Q95 88 118 89', '#fffaf0', 2, .94);
  art += line('M92 204Q127 217 164 204', '#ffeddf', 1.5, .86);
  return doc('西柚气泡水', defs, art);
}

function blueCuracaoFizz() {
  const body = 'M88 69C89 91 96 106 105 120C114 134 106 147 95 158C83 170 82 186 91 197C98 206 111 210 128 210C145 210 158 206 165 197C174 186 173 170 161 158C150 147 142 134 151 120C160 106 167 91 168 69Z';
  const defs = grad('m25-blue-glass', ['#ecf8e7', '#d1edeb', '#9dcbd2'])
    + grad('m25-blue-juice', ['#6ed7e8', '#31afd5', '#2b86bd'])
    + grad('m25-blue-lime', ['#d4e990', '#94bf65', '#6d9c56'])
    + `<clipPath id="m25-blue-clip">${p(body, '#fff')}</clipPath>`;
  let art = e(128, 231, 31, 7, '#cde5de', 'stroke-width="2.5"');
  art += p('M121 207L121 224Q128 228 135 224L135 207Z', '#dcefe6', 'stroke-width="2.4"');
  art += line('M126 212L126 222', '#fffced', 2.2, .96);
  art += p(body, 'url(#m25-blue-glass)');
  art += '<g clip-path="url(#m25-blue-clip)">';
  art += p('M92 92L164 92C160 109 146 123 145 135C144 148 162 165 164 175C170 193 157 204 128 204C99 204 86 193 92 175C94 165 112 148 111 135C110 123 96 109 92 92Z', 'url(#m25-blue-juice)', 'stroke="none"');
  art += e(128, 92, 35, 10, '#76dce8', 'stroke="#4aa9bc" stroke-width="1.3"');
  art += p('M152 101Q144 118 140 131C136 145 154 165 155 178Q158 193 146 201Q159 198 164 190Q172 177 157 160C145 147 139 135 147 120Z', '#247aaf', 'stroke="none" opacity=".28"');
  art += p('M106 84L122 80L132 92L116 99L104 91Z', '#ddf6ec', 'stroke="#61a9bc" stroke-width="1.35"');
  art += p('M135 84L151 86L154 100L140 104L133 94Z', '#cdf0ec', 'stroke="#5fa9bb" stroke-width="1.35"');
  art += line('M108 86L117 90L127 85M138 87L143 93L151 90', '#fbffea', 1.3, .98);
  art += e(117, 176, 4.5, 4.5, '#c1f1ed', 'stroke="#4ca4bb" stroke-width="1.2"');
  art += e(140, 190, 3, 3, '#b7ebeb', 'stroke="#489eb7" stroke-width="1.1"');
  art += line('M99 103Q105 118 111 127M101 168Q93 180 99 190', '#effff0', 3.1, .9);
  art += '</g>';
  art += e(128, 69, 40, 11, '#e7f5dd');
  art += e(128, 70, 33, 6.8, '#9bddd9', 'stroke="#6baeb5" stroke-width="1.3"');
  art += line('M94 67Q108 60 121 61', '#fcfff0', 1.8, .95);
  art += '<g transform="rotate(-24 94 59)">';
  art += p('M66 59A28 28 0 0 1 122 59Z', 'url(#m25-blue-lime)', 'stroke-width="2.4"');
  art += p('M71 56A23 23 0 0 1 117 56Z', '#ecf0af', 'stroke="none"');
  art += p('M76 54A18 18 0 0 1 112 54Z', '#c0d97b', 'stroke="none"');
  art += line('M94 52L94 36M89 52L81 41M99 52L107 41', '#eef4bd', 1.8, .98);
  art += '</g>';
  art += line('M101 231Q116 235 129 234', '#f5f6df', 1.5, .94);
  return doc('蓝柑气泡饮', defs, art);
}

export const citrusBlueCandidates = [
  {
    id: 'fresh-mixer-5', name: '西柚气泡水', previousName: '汤力水', expectedOccupancy: .70,
    svg: grapefruitSoda(),
    design: { silhouette: '外撇口、下收身的短透明杯，右上方一片圆西柚形成不对称识别点', angle: '三分之四俯视，可见清楚椭圆杯口与清亮液面', material: '透明玻璃、珊瑚粉西柚汁，少量大气泡和温暖果皮', identity: '粉色茶汤大色块与放射瓣西柚切片，区别姜汁杯、苏打罐和蓝柑高脚杯', container: '一只小巧短玻璃杯，无吸管与多余枝叶', size: '第五级主体最长边70%，通过矮宽构图控制视觉分量' },
    reason: '用珊瑚粉西柚气泡水替换相似瓶装汤力水，短杯、外撇杯口与完整西柚切片建立独立身份；第五级保持小巧，细深描边保留棋盘辨识。',
  },
  {
    id: 'fresh-mixer-8', name: '蓝柑气泡饮', previousName: '朗姆酒', expectedOccupancy: .80,
    svg: blueCuracaoFizz(),
    design: { silhouette: '上口略宽、中段收腰、下腹圆润的飓风高脚杯，短杯梗与小底足完整可辨', angle: '三分之四俯视，杯口、冰块和高脚曲线清楚', material: '清亮蓝柑汁、冰蓝玻璃与两枚透明冰块，少量柔和反光', identity: '鲜明蓝色纵向曲线杯与左沿半片青柠，区别原朗姆矮圆瓶和另外三项替换饮品', container: '单只飓风杯，一片青柠，不堆叠吸管与花饰', size: '高阶主体最长边80%，轮廓视觉居中，杯脚短而稳定' },
    reason: '用亮蓝柑气泡饮替换琥珀朗姆瓶，改用收腰圆腹高脚杯；蓝色液体和独立曲线轮廓共同建立辨识，不依赖标签或文字。',
  },
];

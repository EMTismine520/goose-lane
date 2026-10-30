// Round 23: independently drawn, editable tea artwork candidates.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours) => `<linearGradient id="${id}" x1=".12" y1="0" x2=".88" y2="1">${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 茶饮独立候选</title><defs>${defs}</defs><g stroke="#3e3b2d" stroke-width="3.15" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function teaLeaves() {
  const defs = gradient('t23-leaf-back', ['#addb76', '#6eaf4c', '#3a7c3c'])
    + gradient('t23-leaf-left', ['#a6d57b', '#71ad4d', '#3e7b3d'])
    + gradient('t23-leaf-right', ['#a7d679', '#66a448', '#39773a'])
    + gradient('t23-leaf-bud', ['#d5e9a0', '#9bc760', '#669e42']);
  let art = p('M129 164C100 136 98 98 135 57C160 87 159 126 129 164Z', 'url(#t23-leaf-back)');
  art += p('M130 143C114 116 120 87 136 66C127 92 128 114 137 133Z', '#dbedaa', 'stroke="none" opacity=".48"');
  art += line('M130 159Q129 117 135 75', '#456b32', 1.6);
  art += p('M129 178C90 184 60 162 53 111C95 111 124 129 129 178Z', 'url(#t23-leaf-left)');
  art += p('M64 119C89 122 107 139 118 159C94 143 81 137 64 119Z', '#c7e397', 'stroke="none" opacity=".6"');
  art += line('M126 174Q96 143 64 121', '#416a32', 1.65);
  art += line('M91 145L91 131M105 157L89 157', '#537e39', 1.1, .76);
  art += p('M129 178C135 139 163 118 202 121C195 161 164 186 129 178Z', 'url(#t23-leaf-right)');
  art += p('M145 164C157 143 177 133 192 130C178 145 161 157 145 164Z', '#c5e38e', 'stroke="none" opacity=".58"');
  art += line('M133 176Q161 151 191 132', '#426e33', 1.65);
  art += line('M160 152L163 138M177 141L182 151', '#527d39', 1.1, .76);
  art += p('M129 178C112 158 114 138 126 122C139 140 141 157 129 178Z', 'url(#t23-leaf-bud)');
  art += line('M129 175L127 134', '#547c38', 1.35);
  art += line('M129 178Q129 187 126 196', '#61783c', 3.3);
  return doc('茶叶', defs, art);
}

function greenTea() {
  const defs = gradient('t23-celadon', ['#ecf5d9', '#b8d5ad', '#78a98b'])
    + gradient('t23-celadon-foot', ['#c0d6b0', '#7aab8c'])
    + gradient('t23-green-tea', ['#dceaaa', '#b9cf6c', '#8daf4e']);
  let art = p('M105 169L149 169L149 180C138 186 116 186 105 180Z', 'url(#t23-celadon-foot)');
  art += p('M46 111C51 149 82 177 128 178C174 178 204 149 210 111Z', 'url(#t23-celadon)');
  art += p('M184 121L204 114C195 146 174 166 146 172C166 158 177 142 184 121Z', '#719f7e', 'stroke="none" opacity=".49"');
  art += p('M62 125C68 143 82 156 97 162C101 163 103 159 99 156C86 148 77 138 73 126C71 120 61 118 62 125Z', '#f2f9dc', 'stroke="none" opacity=".83"');
  art += e(128, 111, 82, 25, '#e5efd1');
  art += e(128, 112, 72, 18, 'url(#t23-green-tea)', 'stroke="#6e8e50" stroke-width="1.65"');
  art += line('M65 110C77 102 96 99 115 100', '#f4f5bf', 2.6, .95);
  art += p('M121 114Q129 106 139 112Q133 119 121 114Z', '#61954a', 'stroke="#4d7437" stroke-width="1.1"');
  art += p('M132 116Q139 112 146 118Q138 122 132 116Z', '#86ad4e', 'stroke="#577b39" stroke-width="1"');
  art += line('M75 146Q84 158 98 162', '#a4c299', 1.3, .8);
  art += line('M108 177Q126 183 145 177', '#dbeaca', 1.45, .9);
  return doc('绿茶', defs, art);
}

function blackTea() {
  const defs = gradient('t23-black-tea-glass', ['#fff4dd', '#f6dfb4', '#dcb779'])
    + gradient('t23-black-tea-body', ['#f9c56f', '#d98837', '#a85022'])
    + gradient('t23-black-tea-top', ['#f4bc57', '#da8a2f', '#bd6327'])
    + gradient('t23-black-tea-base', ['#f3e1bd', '#cfac7b']);
  let art = p('M163 106C191 98 208 110 207 130C206 152 190 166 172 160L171 146C182 150 193 141 194 130C195 120 183 115 168 121Z', 'url(#t23-black-tea-glass)');
  art += line('M185 110C199 113 203 127 198 139', '#fff9df', 2, .92);
  art += e(117, 184, 54, 10, 'url(#t23-black-tea-base)', 'stroke-width="2.7"');
  art += p('M59 88L174 88L167 165C165 181 145 189 116 189C88 189 68 181 66 165Z', 'url(#t23-black-tea-glass)');
  art += p('M67 116C94 123 143 123 166 116L161 161C160 174 142 181 116 181C91 181 74 174 73 161Z', 'url(#t23-black-tea-body)', 'stroke="#9b5b2b" stroke-width="1.4"');
  art += e(117, 116, 49.5, 16, 'url(#t23-black-tea-top)', 'stroke="#a6682d" stroke-width="1.45"');
  art += p('M146 123L163 118L159 161C158 170 149 176 138 178C149 162 149 142 146 123Z', '#a95023', 'stroke="none" opacity=".32"');
  art += e(116.5, 88, 57.5, 20, '#fff7df', 'fill-opacity=".6"');
  art += e(116.5, 89, 50, 14, '#fcebc8', 'fill-opacity=".43" stroke="#bda16d" stroke-width="1.35"');
  art += line('M74 86C84 81 97 79 111 79', '#fffced', 2.8, .98);
  art += p('M76 102C73 117 77 150 80 159C82 163 87 161 86 156L84 108C84 101 78 98 76 102Z', '#fff8d9', 'stroke="none" opacity=".74"');
  art += line('M91 177Q114 185 140 179', '#f9d79e', 1.6, .85);
  art += line('M151 92L159 135L177 143', '#6e6449', 1.5);
  art += p('M169 141L185 143L182 162L166 159Z', '#faf0cf', 'stroke="#66553b" stroke-width="1.6"');
  art += line('M171 148L179 149M170 153L177 154', '#b69d6d', 1.1, .8);
  return doc('红茶', defs, art);
}

export const teaFrontCandidates = [
  { id: 'fresh-tea-1', name: '茶叶', svg: teaLeaves(), expectedOccupancy: .66, design: { silhouette: '一芽三叶的紧凑茶尖，中央细长嫩叶与两侧舒展茶叶构成自然三角', angle: '略俯视，叶片轻微交叠，叶尖向三个方向展开', material: '鲜活黄绿嫩芽与深浅茶绿叶面，克制明暗和清楚主脉', identity: '窄尖茶叶与中央嫩芽，区别圆叶香草和零碎蔬菜', container: '裸茶叶，无底板、茶罐或多余配饰' }, reason: '以一芽三叶形成紧凑鲜活的茶尖，保留完整叶形和细深描边，一级体量约66%，40px仍能看清嫩芽与茶叶身份。' },
  { id: 'fresh-tea-2', name: '绿茶', svg: greenTea(), expectedOccupancy: .68, design: { silhouette: '宽口浅腹的青瓷小茶盏，短圈足、无把无盖，整体矮宽', angle: '三分之四俯视，敞口椭圆茶面清楚可见', material: '浅青瓷与清亮嫩绿茶汤，少量柔和亮面', identity: '矮宽敞口茶盏和两片浮茶尖，区别朱砂带盖乌龙盖碗', container: '一只小青瓷茶盏，无碟无装饰叶枝' }, reason: '绿茶以清爽浅青瓷、敞口小茶盏和嫩绿茶面重设计，矮宽轮廓与红茶玻璃杯、乌龙盖碗明显区分，二级主体约68%。' },
  { id: 'fresh-tea-3', name: '红茶', svg: blackTea(), expectedOccupancy: .70, design: { silhouette: '短直身微收底的透明小茶杯，右侧圆把手与小茶包签形成清楚轮廓', angle: '略俯视，能看到椭圆杯口、暖红琥珀茶面和透明上缘', material: '明亮琥珀红茶与暖透明玻璃，细杯沿、少量宽亮面', identity: '琥珀红茶汤、单侧小把手与米色茶包签，区别矮茶盏及粉色花茶杯', container: '单只透明带把小杯，无碟和高蒸汽' }, reason: '以温暖红琥珀茶汤、小玻璃杯和一枚简洁茶包签建立红茶身份，杯沿与玻璃反光保持克制，三级主体约70%。' },
];

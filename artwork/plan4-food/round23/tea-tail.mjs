// Round 23: individually drawn tea candidates; transparent editable vector masters.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours) => `<linearGradient id="${id}" x1=".12" y1="0" x2=".86" y2="1">${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 茶饮独立新版候选</title><defs>${defs}</defs><g stroke="#49382e" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function oolongGaiwan() {
  const defs = gradient('t23-oolong-red', ['#ed9a73', '#cd624a', '#a93e35'])
    + gradient('t23-oolong-lid', ['#f4ab83', '#dc7855', '#bd4c3b'])
    + gradient('t23-oolong-ivory', ['#fff7dd', '#efdfb9', '#cbb68b'])
    + gradient('t23-oolong-tea', ['#f3c666', '#d59334', '#b86a2c']);
  let art = e(128, 191, 57, 12, 'url(#t23-oolong-red)');
  art += e(128, 188, 49, 8, 'url(#t23-oolong-ivory)', 'stroke-width="1.7"');
  art += p('M110 173L110 188C117 194 138 195 147 188L147 173Z', 'url(#t23-oolong-red)');
  art += line('M118 189Q130 192 139 188', '#f6bd84', 1.5, .85);
  art += p('M56 117C65 148 82 169 106 180C120 186 137 187 152 181C176 171 193 149 201 117Z', 'url(#t23-oolong-red)');
  art += p('M179 127C172 153 154 173 132 179C151 181 175 162 188 137L193 123Z', '#8e352e', 'stroke="none" opacity=".25"');
  art += p('M70 129C75 144 83 153 89 157C93 160 96 157 93 153C86 144 82 137 79 128Z', '#ffd0a0', 'stroke="none" opacity=".84"');
  art += line('M97 173Q121 188 146 180', '#ea9a6b', 1.6, .86);
  art += e(128.5, 116, 73, 22, 'url(#t23-oolong-ivory)');
  art += e(129, 116, 64, 15.5, 'url(#t23-oolong-tea)', 'stroke="#91603b" stroke-width="1.45"');
  art += line('M157 107Q175 108 184 114', '#f9e19b', 2, .88);
  art += p('M160 118C164 112 173 112 178 115C173 120 165 122 160 118Z', '#816233', 'stroke="#6b4f2e" stroke-width="1.1"');
  art += '<g transform="rotate(-13 110 91)">';
  art += p('M54 101C63 77 83 67 108 67C133 67 155 77 164 101C134 116 84 117 54 101Z', 'url(#t23-oolong-lid)');
  art += p('M62 99C90 109 130 109 156 99L164 102C137 119 82 119 54 102Z', 'url(#t23-oolong-ivory)', 'stroke-width="1.65"');
  art += e(109, 70, 12, 5.2, '#c76848', 'stroke-width="1.8"');
  art += p('M100 68L103 57C106 53 114 53 117 57L119 68C115 73 104 73 100 68Z', 'url(#t23-oolong-red)', 'stroke-width="2.4"');
  art += e(110, 56, 7, 3, '#f7b987', 'stroke-width="1.5"');
  art += line('M70 90C78 80 91 76 99 76', '#ffcca0', 2.2, .9);
  art += line('M70 103Q109 114 149 103', '#fff3d2', 1.3, .85);
  art += '</g>';
  return doc('乌龙茶', defs, art);
}

function flower(x, y, size, rotation = 0) {
  const petals = Array.from({ length: 5 }, (_, i) => `<g transform="rotate(${i * 72})">${p('M0 1C-10-2-14-13-6-18C2-24 10-15 8-8C7-3 3 0 0 1Z', 'url(#t23-flower-petal)', 'stroke="#a65368" stroke-width="1.25"')}</g>`).join('');
  return `<g transform="translate(${x} ${y}) rotate(${rotation}) scale(${size})">${petals}${e(0, 0, 4.2, 4.2, '#f2bc52', 'stroke="#9a6635" stroke-width="1.15"')}${e(-1.1, -1.1, 1.4, 1.2, '#ffe4a2', 'stroke="none"')}</g>`;
}

function flowerTea() {
  const bowl = 'M57 106C55 144 63 169 85 184C105 198 137 201 159 189C185 176 197 151 193 106Z';
  const defs = gradient('t23-flower-glass', ['#fcfff1', '#e0eee2', '#adc7b9'])
    + gradient('t23-flower-liquid', ['#ffe7bd', '#f2c58d', '#dda86e'])
    + gradient('t23-flower-surface', ['#fff0cc', '#edc28b'])
    + gradient('t23-flower-petal', ['#ffd6d9', '#f5a5b9', '#d87595'])
    + `<clipPath id="t23-flower-clip">${p(bowl, '#fff')}</clipPath>`;
  let art = p('M190 116C204 108 220 114 220 132C220 151 204 165 188 159L191 146C200 150 210 142 210 133C210 124 201 123 193 128Z', 'url(#t23-flower-glass)');
  art += line('M205 118C215 123 216 133 209 143', '#fbfff2', 2.1, .95);
  art += e(124, 202, 30, 7, 'url(#t23-flower-glass)', 'stroke-width="2.5"');
  art += p(bowl, 'url(#t23-flower-glass)');
  art += '<g clip-path="url(#t23-flower-clip)">';
  art += p('M64 117C63 145 70 165 88 178C107 192 136 193 156 181C176 168 187 144 186 117Z', 'url(#t23-flower-liquid)', 'stroke="none"');
  art += p('M156 124C174 132 174 166 151 184C174 173 183 148 185 123Z', '#c98e5e', 'stroke="none" opacity=".18"');
  art += p('M104 166C107 153 122 147 133 152C128 165 115 172 104 166Z', '#8cac66', 'stroke="#6d8650" stroke-width="1.25" opacity=".75"');
  art += line('M108 165L127 155', '#d0dc9d', 1.1, .8);
  art += p('M147 160C146 153 153 148 159 151C160 158 153 163 147 160Z', '#eb9bad', 'stroke="none" opacity=".86"');
  art += '</g>';
  art += e(125, 106, 68, 21, '#f1f6e6');
  art += e(125, 107, 60.5, 15, 'url(#t23-flower-surface)', 'stroke="#9f9770" stroke-width="1.35"');
  art += flower(109, 103, .92, 8);
  art += flower(151, 110, .63, -12);
  art += p('M148 94C144 85 150 77 158 78C160 88 156 94 148 94Z', '#84aa62', 'stroke="#587447" stroke-width="1.45"');
  art += line('M151 91L156 82', '#d7df9c', 1.1, .85);
  art += line('M68 126C68 145 74 162 84 170M89 181Q97 187 106 188', '#fffceb', 2.8, .94);
  art += line('M177 133C175 151 168 168 160 175', '#99b5a7', 1.45, .87);
  art += line('M87 115C95 120 107 122 116 122', '#fff8dc', 1.6, .9);
  art += line('M109 200Q124 205 140 201', '#fffdf0', 1.45, .86);
  return doc('花茶', defs, art);
}

function vanillaGreenTea() {
  const body = 'M76 77L84 202C85 215 101 222 128 222C155 222 171 215 172 202L180 77Z';
  const defs = gradient('t23-herb-glass', ['#f4fff1', '#d5ece2', '#9fc9bb'])
    + gradient('t23-herb-tea', ['#e6e9a1', '#b9d671', '#77ae54'])
    + gradient('t23-herb-surface', ['#e9edb8', '#c4dc86'])
    + gradient('t23-herb-ice', ['#fffef0', '#dbeecb', '#b4d6b5'])
    + gradient('t23-herb-leaf', ['#b6d977', '#78b15b', '#46854a'])
    + `<clipPath id="t23-herb-clip">${p(body, '#fff')}</clipPath>`;
  let art = p(body, 'url(#t23-herb-glass)');
  art += '<g clip-path="url(#t23-herb-clip)">';
  art += p('M83 101L91 199C92 207 105 213 128 213C151 213 164 207 165 199L172 101Z', 'url(#t23-herb-tea)', 'stroke="none"');
  art += p('M154 108L148 207Q160 205 164 199L170 108Z', '#609b50', 'stroke="none" opacity=".18"');
  art += p('M102 123L125 119L134 140L112 148L98 140Z', 'url(#t23-herb-ice)', 'stroke="#719f73" stroke-width="1.35" opacity=".9"');
  art += line('M103 125L111 138L128 137', '#fffdec', 1.9, .93);
  art += p('M137 149L158 143L164 164L145 174L132 165Z', 'url(#t23-herb-ice)', 'stroke="#719f73" stroke-width="1.3" opacity=".8"');
  art += line('M139 152L145 165L159 162', '#f8ffe7', 1.9, .9);
  art += p('M105 177C110 164 122 163 130 169C126 182 113 185 105 177Z', '#77ab56', 'stroke="#568345" stroke-width="1.2" opacity=".76"');
  art += line('M109 177L124 170', '#c8db89', 1.1, .8);
  art += '</g>';
  art += e(128, 77, 52, 16, '#e5f0db');
  art += e(128, 78, 45, 10.7, 'url(#t23-herb-surface)', 'stroke="#90a771" stroke-width="1.3"');
  art += p('M100 76L120 70L131 80L114 89L101 85Z', 'url(#t23-herb-ice)', 'stroke="#7c9b72" stroke-width="1.3"');
  art += line('M105 76L115 83L126 79', '#ffffed', 1.9, .9);
  art += p('M137 77L153 72L163 81L151 88L138 85Z', 'url(#t23-herb-ice)', 'stroke="#7c9b72" stroke-width="1.25"');
  art += line('M142 77L151 81L159 79', '#ffffee', 1.6, .92);
  art += line('M83 94L90 194C90 202 96 205 104 207M111 216Q132 221 151 214', '#fbfff0', 2.7, .94);
  art += line('M169 113L164 190', '#81b3a0', 1.45, .88);
  art += line('M139 96C145 79 155 63 173 45', '#476f41', 2.6, 1);
  art += p('M154 69C135 68 129 57 134 46C150 44 162 55 154 69Z', 'url(#t23-herb-leaf)', 'stroke-width="2.3"');
  art += line('M151 64L139 51', '#d4e59f', 1.3, .88);
  art += p('M159 62C158 45 170 32 184 34C190 49 177 62 159 62Z', 'url(#t23-herb-leaf)', 'stroke-width="2.3"');
  art += line('M163 58L179 39', '#d8e9a4', 1.4, .9);
  art += p('M150 82C165 66 183 67 191 78C183 92 165 94 150 82Z', 'url(#t23-herb-leaf)', 'stroke-width="2.3"');
  art += line('M155 82L184 79', '#c8e39a', 1.35, .9);
  return doc('香草绿茶', defs, art);
}

export const teaTailCandidates = [
  { id: 'fresh-tea-4', name: '乌龙茶', svg: oolongGaiwan(), expectedOccupancy: .70, design: { silhouette: '朱砂红短宽盖碗，斜置圆盖、细足与薄托，留出一弯琥珀茶汤', angle: '略俯视，偏盖与碗口产生真实前后遮挡，保留完整碗腹', material: '温润红釉、奶油白瓷沿、金琥珀茶汤，明暗集中于大形', identity: '斜圆盖、盖钮和敞口红盖碗，区别青瓷绿茶盏及带把玻璃杯', container: '单套小盖碗，无壶嘴、把手或悬浮配件', size: '四级主体最长边约70%，短宽而紧凑' }, reason: '以朱砂红盖碗建立传统乌龙茶身份，微偏盖露出金色茶汤；细深描边和简洁大轮廓在40px仍可辨。' },
  { id: 'fresh-tea-5', name: '花茶', svg: flowerTea(), expectedOccupancy: .70, design: { silhouette: '短而圆润的透明花茶杯，单侧小圆把，底部仅小巧玻璃足', angle: '三分之四俯视，两朵粉花一大一小浮在清亮茶面', material: '淡花蜜色茶汤、粉玫瑰花瓣和浅青玻璃，柔亮高光克制', identity: '宽圆透明杯腹与清楚粉花组合，不依赖茶壶、复杂托盘或散落花瓣', container: '单只圆腹玻璃杯，小把手与薄杯沿保持干净', size: '五级主体最长边约70%，不以花朵和杯把扩张体量' }, reason: '把花茶从原版茶壶改为圆腹透明花杯，清亮花蜜茶汤衬托两朵可辨粉花，建立轻盈、活泼的五级色彩。' },
  { id: 'fresh-tea-6', name: '香草绿茶', svg: vanillaGreenTea(), expectedOccupancy: .80, design: { silhouette: '高直身透明玻璃杯、清楚冰块与杯沿一簇三片鲜香草叶', angle: '略俯视，高杯口与露出的冰面清晰，叶簇偏右形成有节制的变化', material: '清亮黄绿至嫩绿茶汤、淡青透明杯壁、浅亮冰块与鲜绿香草', identity: '高玻璃冷饮轮廓和三片自然叶簇，区别矮绿茶盏与粉花圆杯', container: '单只无把高玻璃杯，无吸管、厚底托或额外装饰', size: '六级主体最长边约80%，体量递增但留足透明边距' }, reason: '以高直玻璃杯和可辨冰块表现清爽香草绿茶，鲜嫩叶簇集中在杯沿；绿色层次活泼且轮廓与前五级明显区分。' },
];

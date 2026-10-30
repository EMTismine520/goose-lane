// Round 24: five distinct spirit/wine bottles, transparent editable vector masters.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const r = (x, y, width, height, rx, fill, extra = '') => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line = (d, fill, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${fill}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours) => `<linearGradient id="${id}" x1=".08" y1="0" x2=".9" y2="1">${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 特调基底独立新版候选</title><defs>${defs}</defs><g stroke="#49392e" stroke-width="3.1" stroke-linejoin="round" stroke-linecap="round">${art}</g></svg>`;

function whisky() {
  const body = 'M108 67L108 86L78 103Q70 108 70 120L70 207Q70 219 83 220L173 220Q186 219 186 207L186 120Q186 109 178 103L148 86L148 67Z';
  const defs = gradient('m24-whisky-glass', ['#fff4ca', '#e8c785', '#b98547'])
    + gradient('m24-whisky-liquid', ['#edbc50', '#d18b2d', '#af601e'])
    + gradient('m24-whisky-paper', ['#fff5d4', '#f1d89a'])
    + gradient('m24-whisky-cork', ['#b88b57', '#88603e'])
    + `<clipPath id="m24-whisky-clip">${p(body, '#fff')}</clipPath>`;
  let art = p(body, 'url(#m24-whisky-glass)');
  art += '<g clip-path="url(#m24-whisky-clip)">';
  art += p('M78 125Q128 132 178 125L178 207Q178 212 170 213L86 213Q78 212 78 207Z', 'url(#m24-whisky-liquid)', 'stroke="none"');
  art += p('M164 113L178 121L178 204Q178 211 171 212L163 212Z', '#a96c2b', 'stroke="none" opacity=".24"');
  art += '</g>';
  art += line('M82 124Q128 132 174 124', '#b5853c', 1.3, .8);
  art += r(91, 140, 74, 52, 7, 'url(#m24-whisky-paper)', 'stroke="#87643c" stroke-width="1.5"');
  art += p('M118 150C111 159 111 173 118 183L138 183C145 173 145 159 138 150Z', '#b77938', 'stroke="#7d4f2d" stroke-width="1.5"');
  art += line('M117 158L139 158M117 176L139 176', '#e7bd72', 1.6);
  art += line('M124 152Q120 166 124 181M132 152Q136 166 132 181', '#774728', 1.1, .9);
  art += line('M81 131L81 198Q81 206 89 207M91 211L119 211', '#fff7da', 2.8, .94);
  art += line('M171 132L171 196M143 210L165 210', '#9a5f29', 1.35, .7);
  art += p('M105 48Q128 43 151 48L151 69Q128 74 105 69Z', 'url(#m24-whisky-cork)');
  art += e(128, 48, 23, 6, '#c39b65', 'stroke-width="2.6"');
  art += line('M112 54L112 64M119 56L119 66M143 54L143 64', '#e3bd84', 1.3, .85);
  art += line('M114 77L114 86L86 105M145 90L168 104', '#fff5d2', 2.1, .92);
  return doc('威士忌', defs, art);
}

function vodka() {
  const body = 'M113 46L113 79Q113 91 102 104Q94 114 96 134L101 211Q102 223 128 224Q154 223 155 211L160 134Q162 114 154 104Q143 91 143 79L143 46Z';
  const defs = gradient('m24-vodka-glass', ['#f3fffc', '#c4e4e9', '#84b5c8'])
    + gradient('m24-vodka-cap', ['#6faccb', '#417eac', '#345d89'])
    + gradient('m24-vodka-paper', ['#f3ffff', '#d7ecef']);
  let art = p(body, 'url(#m24-vodka-glass)');
  art += p('M148 113Q154 122 152 142L147 210Q144 215 134 216L142 117Z', '#77acc4', 'stroke="none" opacity=".37"');
  art += p('M105 116Q101 125 105 156L109 200Q111 207 115 205L112 126Q111 116 105 116Z', '#fafff5', 'stroke="none" opacity=".9"');
  art += p('M104 142Q128 147 152 142L149 187Q128 193 107 187Z', 'url(#m24-vodka-paper)', 'stroke="#608b9d" stroke-width="1.45"');
  art += p('M128 151L140 166L128 183L116 166Z', '#6ca6cb', 'stroke="#41698c" stroke-width="1.4"');
  art += p('M128 151L128 167L116 166Z', '#d7f4f6', 'stroke="none"');
  art += p('M128 167L140 166L128 183Z', '#568caf', 'stroke="none"');
  art += line('M118 166L128 168L138 166M128 155L128 179', '#e3f9f6', 1.25, .9);
  art += line('M109 210Q128 218 147 210', '#f1fff8', 2.1, .94);
  art += line('M146 199L145 206M120 80L120 94', '#f8fff7', 1.8, .9);
  art += r(109, 29, 38, 27, 5, 'url(#m24-vodka-cap)');
  art += e(128, 29, 18, 4, '#96c8da', 'stroke-width="2.3"');
  art += line('M115 35L115 47M121 36L121 49M140 35L140 47', '#b2dfe4', 1.2, .75);
  art += line('M115 57L141 57', '#77afc3', 1.4);
  return doc('伏特加', defs, art);
}

function tequila() {
  const body = 'M109 67L109 88L82 99L62 122L62 195L81 215L175 215L194 195L194 122L174 99L147 88L147 67Z';
  const defs = gradient('m24-tequila-glass', ['#fff9d7', '#e9d7a1', '#b7aa76'])
    + gradient('m24-tequila-liquid', ['#f6df91', '#dcc16a', '#b18e46'])
    + gradient('m24-tequila-cork', ['#ceaa72', '#9b7547'])
    + gradient('m24-tequila-label', ['#fcf3d3', '#eaddae']);
  let art = p(body, 'url(#m24-tequila-glass)');
  art += p('M70 136L83 126L173 126L186 136L186 192L172 207L84 207L70 192Z', 'url(#m24-tequila-liquid)', 'stroke="#a9955d" stroke-width="1.35"');
  art += p('M173 106L186 124L186 191L173 205Z', '#af9d66', 'stroke="none" opacity=".25"');
  art += line('M82 106L70 124L70 188M82 203L100 204', '#fffbe1', 2.8, .95);
  art += line('M81 128L81 191M176 130L176 190', '#c7b477', 1.3, .68);
  art += p('M98 144L158 144L166 169L155 193L101 193L90 169Z', 'url(#m24-tequila-label)', 'stroke="#9a8757" stroke-width="1.45"');
  art += p('M128 183C116 171 111 160 112 153C123 161 126 170 128 183Z', '#6d9565', 'stroke="#4d6e4c" stroke-width="1.3"');
  art += p('M128 183C127 167 126 153 130 147C135 159 134 173 128 183Z', '#92ac6c', 'stroke="#4d6e4c" stroke-width="1.3"');
  art += p('M128 183C132 168 140 156 146 153C146 165 138 177 128 183Z', '#6c9665', 'stroke="#4d6e4c" stroke-width="1.3"');
  art += line('M114 80L114 87L89 99', '#fffce5', 2.2, .95);
  art += p('M103 49L153 49L153 70Q128 78 103 70Z', 'url(#m24-tequila-cork)');
  art += e(128, 49, 25, 6, '#ddbd85', 'stroke-width="2.6"');
  art += line('M110 56L110 65M118 57L118 68M145 56L145 65', '#f1d9a9', 1.4, .84);
  return doc('龙舌兰', defs, art);
}

function gin() {
  const body = 'M110 56L110 82C110 94 89 98 78 112C62 130 64 157 70 182C77 211 96 222 128 222C160 222 179 211 186 182C192 157 194 130 178 112C167 98 146 94 146 82L146 56Z';
  const defs = gradient('m24-gin-glass', ['#b8d39c', '#6f9b74', '#3f6e57'])
    + gradient('m24-gin-paper', ['#fff9dd', '#ebdfad'])
    + gradient('m24-gin-cap', ['#6b7660', '#414f43']);
  let art = p(body, 'url(#m24-gin-glass)');
  art += p('M173 121C188 147 177 194 156 208C174 189 176 154 166 131Z', '#294d3d', 'stroke="none" opacity=".35"');
  art += p('M82 125C75 142 77 160 82 170C85 176 89 174 87 168C83 153 83 140 88 129C91 122 85 119 82 125Z', '#d5e3ab', 'stroke="none" opacity=".83"');
  art += e(128, 163, 42, 43, 'url(#m24-gin-paper)', 'stroke="#7f895e" stroke-width="1.5"');
  art += p('M127 168C121 153 111 146 105 146C106 160 115 167 127 168Z', '#78a065', 'stroke="#507349" stroke-width="1.4"');
  art += p('M129 159C136 147 147 144 153 147C147 158 139 162 129 159Z', '#91ad70', 'stroke="#507349" stroke-width="1.4"');
  art += line('M117 178L137 153', '#54794d', 1.7);
  art += e(123, 174, 8.2, 8.2, '#657296', 'stroke="#464e67" stroke-width="1.4"');
  art += e(136, 174, 8.2, 8.2, '#555d82', 'stroke="#464e67" stroke-width="1.4"');
  art += e(129, 185, 8.5, 8.5, '#757a9c', 'stroke="#464e67" stroke-width="1.4"');
  art += e(120.5, 171.5, 2.1, 2, '#b4bbcf', 'stroke="none"');
  art += e(126.5, 182.5, 2.1, 2, '#c5c8dc', 'stroke="none"');
  art += line('M90 202Q105 213 123 214', '#bfce99', 1.8, .83);
  art += line('M117 65L117 83', '#d3e2ad', 2.6, .86);
  art += r(105, 37, 46, 28, 5, 'url(#m24-gin-cap)');
  art += e(128, 37, 22, 5, '#8f9677', 'stroke-width="2.6"');
  art += line('M112 43L112 57M120 44L120 58M144 43L144 57', '#b7bba0', 1.3, .74);
  return doc('金酒', defs, art);
}

function redWine() {
  const body = 'M114 43L114 95C114 110 95 113 90 135C86 152 88 188 89 210Q90 223 128 224Q166 223 167 210C168 188 170 152 166 135C161 113 142 110 142 95L142 43Z';
  const defs = gradient('m24-wine-glass', ['#a9626a', '#733d51', '#492c3f'])
    + gradient('m24-wine-cap', ['#d67970', '#a9474c', '#843344'])
    + gradient('m24-wine-paper', ['#fff5d7', '#e8d7ac']);
  let art = p(body, 'url(#m24-wine-glass)');
  art += p('M153 132C166 155 160 194 160 210Q150 219 136 219C149 205 150 173 149 147Z', '#3d2638', 'stroke="none" opacity=".36"');
  art += p('M99 137C94 151 96 177 97 184C98 189 103 187 102 182L104 144C105 136 101 132 99 137Z', '#d99792', 'stroke="none" opacity=".8"');
  art += p('M97 151Q128 147 159 151L158 195Q128 201 98 195Z', 'url(#m24-wine-paper)', 'stroke="#8d6955" stroke-width="1.5"');
  art += p('M128 163C132 155 143 154 146 158C141 165 134 168 128 163Z', '#83a265', 'stroke="#5a744d" stroke-width="1.3"');
  art += line('M128 165L128 158L122 155', '#6b6743', 1.5);
  art += e(121, 170, 6.1, 6.1, '#9c638d', 'stroke="#694562" stroke-width="1.3"');
  art += e(134, 170, 6.1, 6.1, '#8a537d', 'stroke="#694562" stroke-width="1.3"');
  art += e(127.5, 181, 6.8, 6.8, '#b27d9e', 'stroke="#694562" stroke-width="1.3"');
  art += line('M103 211Q120 217 140 215', '#bc7d7d', 1.7, .75);
  art += r(110, 28, 36, 47, 4, 'url(#m24-wine-cap)');
  art += e(128, 28, 17, 4, '#df9784', 'stroke-width="2.5"');
  art += line('M116 35L116 65', '#f1b09a', 2.1, .84);
  art += line('M112 68L144 68', '#843743', 1.4);
  art += line('M120 80L120 95Q120 106 107 117', '#c58a84', 2.4, .83);
  return doc('红葡萄酒', defs, art);
}

export const mixerTailCandidates = [
  { id: 'fresh-mixer-9', name: '威士忌', svg: whisky(), expectedOccupancy: .80, design: { silhouette: '厚底方身、斜肩和短颈的扁方威士忌瓶，木塞宽而紧凑', angle: '正面微俯视，木塞顶面与金色液线可见', material: '蜂蜜金至暖琥珀酒液、浅金玻璃边和奶油纸签，少量宽高光', identity: '方瓶大形与纸签上的酒桶徽标，区别圆肩朗姆及细长酒瓶', container: '独立方身短颈玻璃瓶，不搭酒杯或散落配饰' }, reason: '以短颈方瓶、蜂蜜金酒液和酒桶徽标建立威士忌身份，宽阔大形在40px下保持清楚，与朗姆圆瓶明显区分。' },
  { id: 'fresh-mixer-10', name: '伏特加', svg: vodka(), expectedOccupancy: .80, design: { silhouette: '高直窄身、圆肩略收腰的冰蓝磨砂瓶，冷蓝旋盖', angle: '正面微俯视，窄肩与完整高瓶身保持干净', material: '冰蓝磨砂玻璃、浅青白纸签和大块冷色高光', identity: '瘦长冰蓝瓶与蓝色冰晶菱形徽标，区别暖色厚酒瓶及深红葡萄酒', container: '单只细长磨砂瓶，无冰块配件或背景板' }, reason: '伏特加改用修长冰蓝磨砂瓶和简洁冰晶标记，建立清凉而纯净的色块；曲肩窄身使其不与红葡萄酒长颈瓶混同。' },
  { id: 'fresh-mixer-11', name: '龙舌兰', svg: tequila(), expectedOccupancy: .80, design: { silhouette: '低重心六边切肩、宽腹短颈瓶，方切面和大木塞清楚', angle: '正面微俯视，瓶肩与底部斜切面呈现简洁厚度', material: '暖米金酒液、浅金玻璃和自然木塞，绿叶标签作为集中色彩', identity: '宽矮六边瓶与三片龙舌兰叶徽标，区别方形威士忌和圆腹金酒', container: '单只低矮切面瓶，无盐、柠檬或杯具' }, reason: '龙舌兰以宽矮六边肩瓶和清楚的三叶徽标重新建立身份，暖米金大色块简洁，轮廓无需文字即可与其它烈酒区分。' },
  { id: 'fresh-mixer-12', name: '金酒', svg: gin(), expectedOccupancy: .80, design: { silhouette: '圆腹矮肩、短颈的绿玻璃药剂瓶，圆形大纸签集中在瓶腹', angle: '正面微俯视，圆肩与宽腹圆弧完整可见', material: '柔和草绿至深绿玻璃、奶油纸签与灰蓝杜松果，内部大色块明暗', identity: '绿色圆腹瓶和三枚杜松果徽标，与朗姆琥珀圆瓶通过肩部及标签拉开区别', container: '单只圆腹药剂瓶，不加散落植物或酒杯' }, reason: '以绿色圆腹药剂瓶和杜松果徽标表达金酒的植物气息，清楚的圆腹轮廓和集中冷暖色块在棋盘小图中易辨。' },
  { id: 'fresh-mixer-13', name: '红葡萄酒', svg: redWine(), expectedOccupancy: .80, design: { silhouette: '细长颈、柔圆肩和直立宽胴的深红葡萄酒瓶，红色封帽', angle: '正面微俯视，长封帽与肩部过渡清楚', material: '酒红至深莓红玻璃、奶油纸签及柔暖反光，色彩饱满而不压黑', identity: '深酒红长颈瓶与三颗葡萄标记，轮廓和配色均区别冰蓝伏特加', container: '单瓶葡萄酒，无额外酒杯或散落葡萄' }, reason: '红葡萄酒使用修长颈、宽圆肩和饱满深酒红瓶身，奶油纸签上的葡萄标记保持清楚，终级造型精致而不堆叠配饰。' },
];

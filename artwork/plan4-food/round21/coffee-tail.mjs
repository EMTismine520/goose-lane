// Independent high-level coffee candidates. Existing artwork stays unchanged.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours) => `<linearGradient id="${id}" x1=".1" y1="0" x2=".85" y2="1">${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 咖啡新版候选</title><defs>${defs}</defs><g stroke="#543c30" stroke-width="3.1" stroke-linejoin="round" stroke-linecap="round">${art}</g></svg>`;

function americano() {
  const body = 'M66 78L71 183C72 201 91 210 121 210C151 210 171 201 172 183L177 78Z';
  const defs = gradient('c21-americano-glass', ['#f3f7e9', '#deebe2', '#b7d1cc'])
    + gradient('c21-americano-liquid', ['#875132', '#653d29', '#422c23'])
    + gradient('c21-americano-surface', ['#623a26', '#34251e'])
    + `<clipPath id="c21-americano-clip">${p(body, '#fff')}</clipPath>`;
  let art = p('M175 99C190 92 206 100 207 117C208 137 192 154 174 153L174 140C184 140 194 131 194 120C194 111 185 109 176 113Z', 'url(#c21-americano-glass)');
  art += line('M188 103C198 102 202 110 201 119C200 132 190 143 180 146', '#f6faee', 2.1, .96);
  art += p(body, 'url(#c21-americano-glass)');
  art += '<g clip-path="url(#c21-americano-clip)">';
  art += p('M74 100L79 180C80 194 96 201 121 201C146 201 163 194 164 180L169 100Z', 'url(#c21-americano-liquid)', 'stroke="none"');
  art += p('M78 109L81 177C82 185 87 190 93 193L88 110Z', '#b98451', 'stroke="none" opacity=".24"');
  art += '</g>';
  art += e(121.5, 79, 55.5, 17, '#edf4e8');
  art += e(121.5, 81, 48, 11.5, 'url(#c21-americano-surface)', 'stroke="#776448" stroke-width="1.4"');
  art += line('M86 79C97 72 118 71 132 75', '#b6814d', 1.6, .74);
  art += line('M74 96L78 176C78 184 84 190 91 193M86 204Q104 211 126 209', '#f7faef', 2.3, .92);
  art += line('M163 118L160 174M142 202Q155 198 160 190', '#8facaa', 1.35, .84);
  art += line('M88 87Q120 95 153 86', '#eee8c8', 1.25, .7);
  return doc('美式咖啡', defs, art);
}

function largeAmericano() {
  const body = 'M61 77L78 205C79 216 98 222 128 222C158 222 177 216 178 205L195 77Z';
  const defs = gradient('c21-large-cup', ['#fffdf0', '#f6ecd8', '#e0d2b8'])
    + gradient('c21-large-band', ['#b7d6d2', '#83b7b8', '#649caa'])
    + gradient('c21-large-lid', ['#8a624c', '#654735', '#46332a'])
    + `<clipPath id="c21-large-clip">${p(body, '#fff')}</clipPath>`;
  let art = p(body, 'url(#c21-large-cup)');
  art += '<g clip-path="url(#c21-large-clip)">';
  art += p('M62 126C96 135 157 135 193 126L186 179C151 191 106 191 70 180Z', 'url(#c21-large-band)', 'stroke="none"');
  art += line('M72 132C108 141 151 140 184 132M78 177C108 185 149 185 177 178', '#d6e7da', 1.45, .8);
  art += p('M73 134L79 177C81 181 86 182 90 183L84 137Z', '#d4e7dd', 'stroke="none" opacity=".5"');
  art += '</g>';
  art += line('M71 92L84 201C85 206 93 210 101 211M111 217Q140 221 159 215', '#fffef2', 2.5, .93);
  art += line('M183 102L171 201', '#c7b89d', 1.35, .8);
  art += p('M54 60L202 60L210 77C211 82 207 87 200 88C151 96 103 96 56 88C49 87 45 83 47 78Z', 'url(#c21-large-lid)');
  art += p('M65 51C102 45 153 45 191 51L202 62C154 71 102 71 54 62Z', '#936e52');
  art += e(128, 53, 63, 8.7, '#9b795a', 'stroke-width="1.6"');
  art += p('M145 49C154 47 166 48 174 50L173 54C163 55 153 54 145 53Z', '#3c2b23', 'stroke-width="1.3"');
  art += line('M65 74C104 81 154 81 196 74', '#c29a70', 1.45, .8);
  art += line('M77 52Q99 48 121 49', '#c6a47a', 1.6, .84);
  art += line('M66 91L69 118', '#fffaf0', 1.8, .88);
  return doc('大杯美式', defs, art);
}

function mocha() {
  const bowl = 'M62 119L73 171C77 193 96 204 124 204C152 204 172 193 176 171L187 119Z';
  const defs = gradient('c21-mocha-glass', ['#f3f4e2', '#d6e6db', '#a6c7c0'])
    + gradient('c21-mocha-cocoa', ['#936448', '#70442e', '#4f3025'])
    + gradient('c21-mocha-milk', ['#f3d8af', '#d7b288'])
    + gradient('c21-mocha-cream', ['#fff8e4', '#f8e5c2', '#dfc69f'])
    + `<clipPath id="c21-mocha-clip">${p(bowl, '#fff')}</clipPath>`;
  let art = p('M180 128C197 122 212 131 210 147C208 163 194 172 178 169L180 157C189 158 198 151 198 144C198 137 190 136 184 140Z', 'url(#c21-mocha-glass)');
  art += line('M192 131Q204 132 204 144Q203 157 190 163', '#f7f8e8', 2, .92);
  art += p('M113 195L113 211L96 218C91 220 95 226 103 227C118 231 142 230 155 226C161 224 160 220 154 218L136 211L136 196Z', 'url(#c21-mocha-glass)');
  art += line('M105 223Q126 228 148 222', '#fbfae7', 1.8, .9);
  art += p(bowl, 'url(#c21-mocha-glass)');
  art += '<g clip-path="url(#c21-mocha-clip)">';
  art += p('M69 123L77 168C82 187 98 197 124 197C150 197 168 185 172 168L180 123Z', 'url(#c21-mocha-cocoa)', 'stroke="none"');
  art += p('M72 138C101 148 147 148 177 138L173 158C143 170 104 169 76 158Z', 'url(#c21-mocha-milk)', 'stroke="none"');
  art += line('M80 160C107 170 143 170 167 160', '#f3d6aa', 1.35, .64);
  art += '</g>';
  art += e(124.5, 120, 62.5, 19.5, '#d0b28a');
  art += e(124.5, 120, 55.5, 13.5, '#8d5a3a', 'stroke="#9b7954" stroke-width="1.4"');
  art += p('M71 120C70 109 80 102 93 102C88 93 98 83 110 84C111 77 118 73 126 71C124 78 132 81 137 85C144 91 143 96 140 100C155 96 170 103 171 113C179 114 184 119 180 125C156 139 94 138 72 125Z', 'url(#c21-mocha-cream)');
  art += line('M91 105C106 115 133 116 150 107M109 88C119 96 130 98 140 96', '#b9966b', 1.45, .8);
  art += line('M84 120C108 132 145 131 164 120M104 101Q113 106 122 105', '#fffced', 2, .94);
  art += p('M153 92L168 86L176 107L163 112Z', '#74402e', 'stroke="#573a2b" stroke-width="1.4"');
  art += line('M159 92L166 90L171 104', '#b57c51', 1.4, .8);
  art += line('M90 116C109 122 128 122 145 117', '#7d4b33', 2.1, .95);
  art += line('M69 134L78 171C81 184 92 192 104 195M146 197Q162 192 168 181', '#f7f8e5', 2.1, .91);
  art += line('M174 144L168 168', '#8daea6', 1.35, .8);
  return doc('摩卡咖啡', defs, art);
}

export const coffeeTailCandidates = [
  { id: 'fresh-coffee-7', name: '美式咖啡', svg: americano(), expectedOccupancy: .8, design: { silhouette: '直身厚玻璃杯、贴近杯身的小圆把和清楚平静咖啡液面', angle: '三分之四俯视，可见杯口与深咖啡表面', material: '通透浅青玻璃边、深棕咖啡和少量暖棕透光，无奶泡或奶油', identity: '带把透明直杯与纯黑咖啡，区别奶油陶马克杯和无把冰咖啡', container: '厚玻璃杯与简短圆把，主体视觉居中，无长勺或高蒸汽' }, reason: '用厚玻璃杯和平静深咖啡液面重画美式，少量暖棕透光表现纯咖啡，清楚杯把与透明边缘建立独立轮廓。' },
  { id: 'fresh-coffee-8', name: '大杯美式', svg: largeAmericano(), expectedOccupancy: .8, design: { silhouette: '高大宽肩白色外带杯、宽平深棕杯盖与淡青蓝宽腰带', angle: '轻俯视正面，杯盖与杯身的厚度清楚', material: '奶白纸杯、柔青蓝杯带和深烘棕杯盖，柔光克制', identity: '高大直杯身和宽杯盖，区别四级小牛皮纸锥杯，体量饱满而稳定', container: '高白纸杯，主体完全居中，无文字、品牌或长配件' }, reason: '以高大白杯、宽肩杯盖和青蓝腰带建立大杯美式身份，通过杯身比例和形状区别便携小杯，保留简洁细深色轮廓。' },
  { id: 'fresh-coffee-9', name: '摩卡咖啡', svg: mocha(), expectedOccupancy: .8, design: { silhouette: '有小脚与圆把的短玻璃杯，顶部一团短厚奶油与小巧克力片', angle: '三分之四俯视，杯内可见可可与奶色层次', material: '深可可咖啡、奶金中层、奶白厚奶油和一笔可可酱，玻璃轻透', identity: '短脚杯、低矮奶油和可可巧克力装饰共同表现摩卡，避免高奶油塔', container: '短脚透明杯和贴身小把，无吸管或长勺，主体视觉分量居中' }, reason: '以短脚玻璃杯、深可可与奶色层次设计摩卡，短厚奶油、一笔可可酱和小巧克力片增加食欲，保持40px清楚大形。' },
];

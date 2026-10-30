// Round 26: early recipe outputs, independent editable 256-unit masters.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad = (id, colours) => `<linearGradient id="${id}" x1=".12" y1="0" x2=".88" y2="1">${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 开局鲜食独立候选</title><defs>${defs}</defs><g stroke="#493a31" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function strawberryCup() {
  const defs = grad('s26-berry-glass', ['#f3fcf2', '#d4e9e3', '#a3cac5'])
    + grad('s26-berry-red', ['#ff9c85', '#ef5f61', '#cf3e50'])
    + grad('s26-berry-slice', ['#ffd7b1', '#ff9a8d', '#ef5965'])
    + grad('s26-berry-leaf', ['#add780', '#6ca754', '#477b44'])
    + grad('s26-berry-juice', ['#f39b91', '#df6470', '#ba455d']);
  let art = e(128, 216, 36, 8, '#d9e9df', 'stroke-width="2.5"');
  art += p('M117 194L117 211Q128 216 139 211L139 194Z', 'url(#s26-berry-glass)', 'stroke-width="2.5"');
  art += p('M63 111L72 172C77 194 98 205 128 205C158 205 179 194 184 172L193 111Z', 'url(#s26-berry-glass)');
  art += p('M75 136L81 171C87 189 102 197 128 197C154 197 169 189 175 171L181 136Z', 'url(#s26-berry-juice)', 'stroke="none"');
  const slice = (x,y,angle,scale=1) => `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">`
    + p('M0-21C-19-31-31-13-23 5C-19 17-7 27 0 32C9 26 22 15 26 1C31-17 18-30 0-21Z', 'url(#s26-berry-red)', 'stroke-width="2.3"')
    + p('M0-15C-12-23-22-11-16 3C-12 13-5 20 0 24C7 19 16 11 20 0C23-13 13-23 0-15Z', 'url(#s26-berry-slice)', 'stroke="none"')
    + p('M0-13C-6-5-5 11 0 20C5 11 6-5 0-13Z', '#ffe3c3', 'stroke="none" opacity=".82"')
    + e(-13,-4,1.9,2.7,'#ffe3a1','stroke="none"') + e(14,-4,1.9,2.7,'#ffe3a1','stroke="none"')
    + e(-8,10,1.6,2.3,'#ffe3a1','stroke="none"') + e(9,10,1.6,2.3,'#ffe3a1','stroke="none"')
    + '</g>';
  art += slice(96, 160, -25, .83) + slice(145, 165, 25, .91);
  art += e(128, 110, 65, 21, '#e8f2e3');
  art += e(128, 111, 56, 15, '#ec7d7d', 'stroke="#b75d63" stroke-width="1.4"');
  art += slice(91, 111, -24, .89) + slice(140, 115, 20, 1.0);
  art += '<g transform="translate(157 79) rotate(18)">';
  art += p('M0-15C-22-25-29-8-21 9C-17 19-5 29 0 32C9 26 23 12 25-1C28-19 14-26 0-15Z', 'url(#s26-berry-red)', 'stroke-width="2.5"');
  art += p('M-3-16L-17-25L-5-23L0-36L6-23L18-27L11-14L2-20Z', 'url(#s26-berry-leaf)', 'stroke-width="1.8"');
  for(const [x,y]of [[-13,-5],[6,-5],[-7,9],[11,9],[0,22]])art += e(x,y,1.8,2.4,'#ffe4a6','stroke="none"');
  art += line('M-14-12Q-20-7-17 1','#ffd2ad',2,.88) + '</g>';
  art += line('M68 118L77 165Q80 180 91 187', '#fbfff0', 3.1, .95);
  art += line('M181 127L175 169Q172 182 163 187', '#edfaf0', 1.7, .7);
  art += line('M99 195Q128 206 157 195', '#f5fbed', 1.8, .85);
  return doc('草莓甜心杯', defs, art);
}

function freshOrangeJuice() {
  const defs = grad('s26-orange-glass', ['#fbf8e3', '#e0ece2', '#bad7ce'])
    + grad('s26-orange-juice', ['#ffd677', '#ffb84c', '#e98a2e'])
    + grad('s26-orange-peel', ['#ffcc6c', '#f4a53c', '#db7f28']);
  const body = 'M86 69L91 202C92 216 107 224 128 224C149 224 164 216 165 202L170 69Z';
  let art = p(body, 'url(#s26-orange-glass)');
  art += p('M93 91L98 199C99 210 110 216 128 216C146 216 157 210 158 199L163 91Z', 'url(#s26-orange-juice)', 'stroke="none"');
  art += e(128, 91, 35, 10, '#ffd274', 'stroke="#dca34f" stroke-width="1.35"');
  art += p('M149 99L147 198Q146 209 138 213Q153 211 157 202L160 98Z', '#dc802a', 'stroke="none" opacity=".24"');
  art += line('M100 103L105 191Q105 202 113 205', '#fff1bd', 3.8, .92);
  art += line('M122 122Q130 127 136 122M117 156Q124 160 131 157M137 185L142 183', '#efaa4b', 1.8, .7);
  art += e(128, 69, 42, 12, '#fcf6df');
  art += e(128, 70, 35, 7.5, '#ffc865', 'stroke="#dfb264" stroke-width="1.35"');
  art += line('M93 67Q107 60 121 61', '#fffef0', 2.1, .98);
  art += '<g transform="translate(89 72) rotate(-22)">';
  art += p('M-30 0A30 30 0 0 1 30 0Z', 'url(#s26-orange-peel)', 'stroke-width="2.6"');
  art += p('M-25-3A25 25 0 0 1 25-3Z', '#fff0bf', 'stroke="none"');
  art += p('M-20-5A20 20 0 0 1 20-5Z', '#ffb647', 'stroke="none"');
  art += line('M0-6L0-24M-6-6L-14-19M6-6L14-19', '#fff0b6', 2.1, .98);
  art += '</g>';
  art += line('M105 216Q128 225 150 215', '#f6f5dd', 1.7, .9);
  return doc('阳光鲜橙汁', defs, art);
}

function grapeSharingPlate() {
  const defs = grad('s26-grape-plate', ['#fffdf0', '#f4e5cb', '#d9c4a4'])
    + grad('s26-grape-berry', ['#c49bd3', '#9c6fba', '#72509b'])
    + grad('s26-grape-berry-dark', ['#b38ec9', '#8b62ad', '#604589'])
    + grad('s26-grape-cut', ['#e0e8b3', '#c8ce92', '#a6b879'])
    + grad('s26-grape-leaf', ['#c0da88', '#8bb561', '#5e8b48']);
  let art = p('M39 142C28 135 27 125 38 119C32 107 43 98 57 98C58 85 74 81 87 87C98 76 114 77 126 84C138 75 156 79 165 87C180 81 195 88 197 100C212 101 222 110 215 122C227 128 226 140 214 146C218 159 206 169 193 168C188 182 173 184 162 177C151 188 136 186 126 179C114 187 98 186 89 176C75 183 60 176 58 165C44 166 34 155 39 142Z', 'url(#s26-grape-plate)');
  art += e(128, 133, 76, 35, '#fffaea', 'stroke="#d5c7a9" stroke-width="1.5"');
  art += line('M48 129Q52 111 74 105M169 169Q192 164 203 151', '#fffef4', 2.4, .88);
  const berry = (x,y,angle,dark=false) => `<g transform="translate(${x} ${y}) rotate(${angle})">`
    + e(0,0,13,16,dark?'url(#s26-grape-berry-dark)':'url(#s26-grape-berry)','stroke-width="2.3"')
    + line('M-7-8Q-10-4-9 0','#ead3ea',2.1,.84) + '</g>';
  const cut = (x,y,angle) => `<g transform="translate(${x} ${y}) rotate(${angle})">`
    + e(0,0,14,16,'#9466b0','stroke-width="2.3"')
    + e(0,-1,11,12.5,'url(#s26-grape-cut)','stroke="#eee8bc" stroke-width="1.1"')
    + p('M-4-3Q-7 0-3 4Q0 1-4-3Z','#90724b','stroke="none"')
    + p('M3-3Q0 1 4 4Q7 0 3-3Z','#90724b','stroke="none"') + '</g>';
  art += berry(128,96,-4) + berry(156,103,26,true) + berry(176,123,18);
  art += berry(176,145,-12,true) + cut(153,159,24) + berry(124,163,5,true);
  art += cut(95,155,-28) + berry(77,137,14) + berry(80,114,-18,true) + berry(103,100,-22);
  art += line('M101 89Q92 79 81 80M96 86L93 77', '#7d7245', 2.1);
  art += p('M93 83C79 87 68 79 69 65C83 64 94 70 93 83Z', 'url(#s26-grape-leaf)', 'stroke-width="2.1"');
  art += line('M91 81L75 70','#5b8243',1.25,.9);
  return doc('缤纷水果盘', defs, art);
}

export const starterSweetCandidates = [
  {
    id: 'dish-fresh-berry-cup', name: '草莓甜心杯', expectedOccupancy: .72, svg: strawberryCup(),
    design: { silhouette: '矮圆透明小杯和短底足，红草莓切片层层可见，顶端一枚完整草莓收拢构图', angle: '略俯视，杯口与切草莓的浅色果芯可见', material: '清透玻璃、鲜红切草莓与少量草莓汁，克制玻璃高光', identity: '切草莓内芯与完整草莓绿萼表达主料，按现有鲜切草莓描述制作，不增加奶油或酸奶层', container: '圆润矮玻璃杯，区别鲜橙汁高直杯及盘装鲜果', size: '开局低阶成品主体约72%，不以夸张配饰拉高轮廓' },
    reason: '按现有“鲜切草莓层层堆起”的描述重设计，透明矮杯直接展示草莓切层与少量果汁，主料清楚，不加入奶油或酸奶。',
  },
  {
    id: 'dish-fresh-orange-juice', name: '阳光鲜橙汁', expectedOccupancy: .72, svg: freshOrangeJuice(),
    design: { silhouette: '高直透明玻璃杯，左沿单枚橙半片形成清楚身份点', angle: '三分之四略俯视，可见现榨橙汁平静液面', material: '清亮鲜橙汁与薄玻璃，大块橙黄渐变和克制果肉色层', identity: '现榨甜橙汁，不加入气泡、冰块、奶层或冰沙小丘，与特调橙子冰沙宽杯区分', container: '单只高直玻璃杯，不加吸管或托碟', size: '开局低阶成品主体约72%，细长而小巧' },
    reason: '以高直清透杯和单枚橙半片呈现现榨甜橙汁，平静橙黄液面区别气泡饮与宽杯冰沙，主料和做法一眼可读。',
  },
  {
    id: 'dish-fresh-fruit-platter', name: '缤纷水果盘', expectedOccupancy: .76, svg: grapeSharingPlate(),
    design: { silhouette: '轻微花瓣边的浅奶油分享盘，紫葡萄沿盘面围成一圈，中心留白', angle: '适度俯视，环形摆盘和两枚葡萄半切面清楚可见', material: '温润奶油陶盘、紫葡萄果皮和浅绿葡萄果肉，少量柔和亮面', identity: '按现有“把紫葡萄排成一圈”的描述，用完整葡萄与半切面呈现分享摆盘，不擅加其它水果主料', container: '浅圆花瓣边盘，区别番茄椭圆盘、胡萝卜长盘和丰收碗', size: '开局成品主体约76%，盘缘轻薄、食物集中' },
    reason: '保留现有菜名，按“把紫葡萄排成一圈”的描述改为葡萄分享摆盘；完整果与半切面增加食欲和变化，不加入菜谱未列的其它主料。',
  },
];

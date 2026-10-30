// Round 20: independently drawn sweet ingredients, editable 256px masters.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours) => `<linearGradient id="${id}" x1=".12" y1="0" x2=".82" y2="1">${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 糖果甜料独立候选</title><defs>${defs}</defs><g stroke="#594438" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function sugar() {
  const defs = gradient('s20-sugar-paper', ['#f3f6e8', '#e0e8dd', '#bfcec5'])
    + gradient('s20-sugar-fold', ['#e2eade', '#c2d2c9'])
    + gradient('s20-sugar-white', ['#fffef2', '#f5efdd', '#e0d7bd']);
  let art = p('M55 75L107 58L136 74L152 170L88 194L61 176Z', 'url(#s20-sugar-paper)');
  art += p('M107 58L136 74L152 170L130 163L116 83Z', 'url(#s20-sugar-fold)', 'stroke-width="1.6"');
  art += p('M55 75L81 90L136 74L111 88L86 102L62 90Z', '#f8f7e6', 'stroke-width="1.6"');
  art += p('M64 75L106 64L127 75L86 91Z', '#aebfb3', 'stroke-width="1.5"');
  art += p('M68 75C77 68 89 66 99 67C108 61 119 66 121 73L85 84Z', 'url(#s20-sugar-white)', 'stroke="#a89a7d" stroke-width="1.35"');
  art += p('M62 88L85 102L101 177L87 187L69 174Z', '#f9f8e8', 'stroke="none" opacity=".72"');
  art += line('M70 109L77 163M98 176L125 166', '#9cac9f', 1.4, .7);
  art += p('M105 194C110 187 115 183 125 182C131 169 141 163 154 165C163 155 178 159 184 171C195 172 203 179 205 188C212 191 219 195 218 201C198 213 137 217 107 206C101 204 100 198 105 194Z', 'url(#s20-sugar-white)');
  art += p('M119 192C129 178 143 172 154 176C167 169 181 175 184 181C169 176 162 184 153 184C138 180 132 190 126 195Z', '#fffef7', 'stroke="none" opacity=".85"');
  for (const [x,y,s,a] of [[134,191,4,-8],[157,180,4.1,12],[173,194,4.2,-10],[146,203,3.6,15],[195,199,3.5,5]]) {
    art += p(`M${x-s} ${y}L${x} ${y-s}L${x+s} ${y}L${x} ${y+s}Z`, '#fffdf0', `stroke="#b7aa8b" stroke-width="1.25" transform="rotate(${a} ${x} ${y})"`);
  }
  art += p('M113 218L119 213L124 219L118 223Z', '#f8f2de', 'stroke="#ad9f7f" stroke-width="1.3"');
  return doc('砂糖', defs, `<g transform="rotate(-5 128 128)">${art}</g>`);
}

function rockSugar() {
  const defs = gradient('s20-rock-main', ['#fff7d5', '#f4e0a7', '#dfc184'])
    + gradient('s20-rock-light', ['#fffbe3', '#f6e9bf', '#e9d49f'])
    + gradient('s20-rock-edge', ['#ead39b', '#cdae73']);
  let art = p('M102 74L128 53L163 67L176 100L156 127L120 128L99 104Z', 'url(#s20-rock-main)');
  art += p('M102 74L128 53L139 84L121 106L99 104Z', '#fff9dc', 'stroke="#bda274" stroke-width="1.35"');
  art += p('M139 84L163 67L176 100L156 127L151 99Z', 'url(#s20-rock-edge)', 'stroke="#bda274" stroke-width="1.35"');
  art += p('M121 106L139 84L151 99L156 127L120 128Z', '#f7e7b5', 'stroke="#c8af7e" stroke-width="1.35"');
  art += p('M116 75L128 65L133 80L122 92Z', '#fffef0', 'stroke="none" opacity=".85"');
  art += p('M59 132L89 110L120 125L130 158L105 184L72 181L52 156Z', 'url(#s20-rock-light)');
  art += p('M59 132L89 110L93 141L75 159L52 156Z', '#fff9dd', 'stroke="#bda274" stroke-width="1.35"');
  art += p('M93 141L120 125L130 158L105 184L104 158Z', '#e8ce94', 'stroke="#bda274" stroke-width="1.35"');
  art += p('M75 159L93 141L104 158L105 184L72 181Z', '#f8e8b9', 'stroke="#c5ac7c" stroke-width="1.35"');
  art += p('M65 138L82 123L83 138L71 149Z', '#fffef0', 'stroke="none" opacity=".8"');
  art += p('M160 132L185 114L211 131L216 160L197 184L169 181L153 157Z', 'url(#s20-rock-main)');
  art += p('M160 132L185 114L189 143L170 158L153 157Z', '#fff5cf', 'stroke="#bda274" stroke-width="1.35"');
  art += p('M189 143L211 131L216 160L197 184L194 161Z', '#d9bd83', 'stroke="#bda274" stroke-width="1.35"');
  art += p('M170 158L189 143L194 161L197 184L169 181Z', '#f3dfa9', 'stroke="#c2a876" stroke-width="1.35"');
  art += p('M111 176L136 156L162 172L167 199L148 218L119 213L103 192Z', 'url(#s20-rock-light)');
  art += p('M111 176L136 156L140 184L120 196L103 192Z', '#fff9dc', 'stroke="#bda274" stroke-width="1.35"');
  art += p('M140 184L162 172L167 199L148 218L145 198Z', '#e7cd94', 'stroke="#bda274" stroke-width="1.35"');
  art += p('M120 196L140 184L145 198L148 218L119 213Z', '#f9e9ba', 'stroke="#c5ac7c" stroke-width="1.35"');
  art += line('M120 178L132 168M167 136L181 125', '#fffef0', 2.2, .9);
  return doc('冰糖', defs, `<g transform="rotate(-6 128 128)">${art}</g>`);
}

function syrup() {
  const body = 'M101 72L149 72L150 92C152 105 166 115 168 131L175 194C176 214 159 225 133 225C106 225 88 216 88 198L91 132C92 116 99 106 101 95L81 78C76 74 73 68 78 67C85 72 92 75 101 72Z';
  const defs = gradient('s20-syrup-glass', ['#f5f3db', '#e6e6cb', '#bdcbb6'])
    + gradient('s20-syrup-liquid', ['#f7d992', '#e9bc67', '#cd944b'])
    + gradient('s20-syrup-handle', ['#f3f1d9', '#d9dfc9', '#aebfab'])
    + `<clipPath id="s20-syrup-body-clip">${p(body, '#fff')}</clipPath>`;
  let art = p('M158 105C177 98 194 104 201 118C208 133 203 153 191 168C183 178 171 183 160 178L160 161C169 165 179 156 184 145C190 132 187 120 177 120C171 120 166 123 163 128Z', 'url(#s20-syrup-handle)');
  art += line('M174 110C191 110 198 125 192 142', '#fffbed', 2, .9);
  art += p(body, 'url(#s20-syrup-glass)');
  art += '<g clip-path="url(#s20-syrup-body-clip)" stroke="none">';
  art += p('M91 130C112 137 144 137 169 127L181 198L164 225L125 233L89 215Z', 'url(#s20-syrup-liquid)');
  art += e(130,130,39,10,'#f8df9e');
  art += p('M154 139C159 154 165 186 161 201C158 212 146 217 137 219C152 219 168 214 171 203L168 170L165 138Z', '#b77e3b', 'opacity=".25"');
  art += p('M102 144C98 158 97 184 99 195C100 200 105 200 105 194C104 178 106 160 108 149C109 143 104 139 102 144Z', '#fff6ca', 'opacity=".88"');
  art += '</g>';
  art += e(125,72,24,9,'#d3d6ba','stroke-width="1.6"');
  art += e(125,71,17,5.5,'#f8e3ac','stroke="#a89c73" stroke-width="1.3"');
  art += line('M104 83C107 95 103 107 99 115M111 216C124 221 148 220 159 214', '#fff8df', 2.2, .85);
  art += line('M94 137C112 143 149 144 166 136', '#c2924e', 1.35, .55);
  return doc('糖浆', defs, `<g transform="rotate(-5 128 128)">${art}</g>`);
}

export const sweetFrontCandidates = [
  { id: 'fresh-sweet-1', name: '砂糖', svg: sugar(), expectedOccupancy: .66, design: { silhouette: '一小包淡青白折纸砂糖，前方少量白色糖粒成小丘', angle: '微斜的三分之四俯视，纸包开口和糖粒同时可见', material: '干爽细白砂糖、浅青白折纸与少量晶粒切面', identity: '小折纸包加稀疏菱形糖粒，区别粉袋和细长米粒', container: '小巧折纸承托，透明背景，无文字品牌' }, reason: '用小折纸包与清楚的细白晶粒堆重新设计砂糖，折面和颗粒区别面粉与大米，一级体量控制在约66%。' },
  { id: 'fresh-sweet-2', name: '冰糖', svg: rockSugar(), expectedOccupancy: .68, design: { silhouette: '四块互相依托的不规则大颗晶糖，转角与切面清楚', angle: '三分之四俯视，大晶块错位前后叠放，整体紧凑', material: '浅蜜金半透晶体、奶白亮面与少量稀疏切面线', identity: '不规则晶体轮廓和淡蜜金色，区别蓝色冰块及整齐方糖', container: '裸晶糖透明背景，无盘和额外碎粒' }, reason: '独立绘制四颗浅蜜金晶糖，以大块不规则切面表现通透晶体，保留细深描边，在40px仍能读出糖晶身份。' },
  { id: 'fresh-sweet-3', name: '糖浆', svg: syrup(), expectedOccupancy: .70, design: { silhouette: '窄高玻璃糖浆壶，短尖倒嘴与单侧弧形小把手', angle: '微斜的三分之四俯视，可见壶口和透明浅琥珀液面', material: '清透浅琥珀糖浆、淡暖玻璃与少量纵向亮面', identity: '高窄带嘴壶、清楚糖浆液面和把手，区别矮蜂蜜罐与固体焦糖', container: '简洁玻璃壶，无文字、品牌和装饰标签' }, reason: '重新设计高窄带嘴糖浆壶，用浅琥珀液体和单侧把手拉开轮廓，少量玻璃高光表现清澈黏度，三级保持约70%体量。' },
];

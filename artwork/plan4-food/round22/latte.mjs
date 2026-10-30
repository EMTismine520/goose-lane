// CF07 replacement proposal: a round rose ceramic latte cup with simple milk art.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours, xy = 'x1=".12" y1="0" x2=".85" y2="1"') => `<linearGradient id="${id}" ${xy}>${colours.map((colour, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${colour}"/>`).join('')}</linearGradient>`;

function latte() {
  const body = 'M47 96C47 137 58 174 83 187C104 199 137 199 159 187C183 174 194 137 193 96Z';
  const defs = gradient('c22-latte-ceramic', ['#edb7a7', '#d98f84', '#bc6d66'])
    + gradient('c22-latte-handle', ['#efc1b0', '#d28b80'])
    + gradient('c22-latte-rim', ['#f9dec8', '#e9b7a5'])
    + gradient('c22-latte-coffee', ['#dfb67d', '#c99054', '#b87943'])
    + `<clipPath id="c22-latte-body-clip">${p(body, '#fff')}</clipPath>`;

  // The close, rounded handle stays behind the bowl and does not pull the composition.
  let art = p('M188 97C198 89 213 91 217 101C223 117 209 136 190 137L189 125C200 125 208 116 207 107C207 101 199 100 192 105Z', 'url(#c22-latte-handle)');
  art += line('M199 96C210 95 216 102 214 111C212 121 205 128 197 130', '#f8d8c1', 1.8, .88);
  art += p(body, 'url(#c22-latte-ceramic)');
  art += '<g clip-path="url(#c22-latte-body-clip)" stroke="none">';
  art += p('M53 132C68 151 94 162 125 163C154 163 176 154 190 137L191 184L160 203L85 205L56 180Z', '#a85d59', 'opacity=".13"');
  art += p('M59 119C58 144 64 162 73 171C77 175 81 171 79 167C72 153 69 139 69 122C68 117 62 115 59 119Z', '#f9d8be', 'opacity=".68"');
  art += p('M179 123C179 150 171 171 158 180C153 183 154 187 159 185C176 177 187 153 186 127Z', '#a75453', 'opacity=".17"');
  art += '</g>';
  art += line('M85 185C102 193 137 194 156 183', '#edb5a0', 1.5, .7);

  // A broad elliptical opening makes the latte surface the main visual cue.
  art += e(120, 96, 73, 31, 'url(#c22-latte-rim)');
  art += e(120, 96, 64, 23, 'url(#c22-latte-coffee)', 'stroke="#946440" stroke-width="1.45"');
  art += line('M62 94C71 80 106 75 134 80', '#f8d59c', 1.8, .86);
  art += line('M77 112C100 121 143 121 166 108', '#f1ca8b', 1.35, .74);

  // One soft milk heart reads at small scale; no dense rosetta or ornament.
  art += p('M120 112C111 107 96 100 94 91C92 83 100 78 108 80C113 81 117 85 120 88C123 82 129 79 135 80C143 80 148 87 144 94C140 102 128 108 120 112Z', '#fff2d7', 'stroke="#f2dcba" stroke-width="1.1"');
  art += p('M103 84C100 85 98 88 100 91C102 94 107 95 111 95C107 92 104 88 103 84Z', '#fffaf0', 'stroke="none" opacity=".75"');
  art += line('M61 103C72 116 100 123 122 123', '#fbe2c3', 1.55, .8);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>拿铁咖啡 · 玫瑰陶杯与心形奶泡候选</title><defs>${defs}</defs><g stroke="#5b4034" stroke-width="3.1" stroke-linejoin="round" stroke-linecap="round">${art}</g></svg>`;
}

export const latteRedesign = {
  id: 'fresh-coffee-7',
  name: '拿铁咖啡',
  previousName: '美式咖啡',
  svg: latte(),
  expectedOccupancy: .8,
  design: {
    silhouette: '宽圆矮陶杯，圆鼓杯肚、紧贴杯身的小把手与宽椭圆杯口形成完整大形',
    angle: '三分之四偏俯视，奶咖液面占主要观察面，杯底圆润收拢',
    material: '柔玫瑰陶粉釉面、暖浅奶咖与奶白泡沫，少量柔亮面而不堆叠纹理',
    identity: '浅奶咖液面上一枚简洁心形奶泡，区别深烘黑咖啡、透明冰咖啡和奶油摩卡',
    container: '单只宽圆玫瑰陶杯，无碟、长勺、吸管或高蒸汽，主体视觉集中'
  },
  reason: '将美式咖啡位置提出拿铁候选，重新绘制宽圆杯肚与更俯视的奶咖液面，以玫瑰陶杯和一枚心形奶泡拉开咖啡链的口感与轮廓差异。'
};

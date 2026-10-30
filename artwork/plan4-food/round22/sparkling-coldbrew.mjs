// CF08 replacement: a tall sparkling cold brew with a compact citrus garnish.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours, coordinates = 'x1="0" y1="0" x2=".7" y2="1"') => `<linearGradient id="${id}" ${coordinates}>${colours.map((colour, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${colour}"/>`).join('')}</linearGradient>`;

function sparklingColdbrew() {
  const glass = 'M79 61C79 51 99 44 125 44C151 44 171 51 171 61L165 202C164 213 148 220 125 220C102 220 86 213 85 202Z';
  const liquid = 'M87 91C108 85 143 85 163 91L157 199C156 206 143 211 125 211C107 211 94 206 93 199Z';
  const defs = gradient('c22-spark-glass', ['#f8f7e8', '#e9eee1', '#cbded5'])
    + gradient('c22-spark-liquid', ['#f7d58c', '#d6a458', '#a87942'], 'x1="0" y1="0" x2="0" y2="1"')
    + gradient('c22-spark-coffee', ['#8b5936', '#69412c', '#513124'], 'x1="0" y1="0" x2="0" y2="1"')
    + gradient('c22-spark-ice', ['#fff6d8', '#e8edda', '#cadbd1'])
    + gradient('c22-spark-peel', ['#ffd174', '#f4b44e', '#e19a3a'])
    + gradient('c22-spark-orange', ['#ffdd8e', '#ffc15c', '#efa541'])
    + `<clipPath id="c22-spark-interior">${p(liquid, '#fff')}</clipPath>`;

  let art = p(glass, 'url(#c22-spark-glass)');
  art += p(liquid, 'url(#c22-spark-liquid)', 'stroke="none"');
  art += '<g clip-path="url(#c22-spark-interior)">';
  art += p('M86 160C109 153 141 165 163 157L159 204L143 216L104 216L90 201Z', 'url(#c22-spark-coffee)', 'stroke="none"');
  art += p('M89 151C109 143 140 157 163 149L163 159C141 168 108 154 89 163Z', '#b58247', 'stroke="none" opacity=".56"');
  art += e(104, 131, 3.5, 3.5, '#ffe9b1', 'stroke="#d19e55" stroke-width="1.25"');
  art += e(145, 143, 4, 4, '#ffe9b1', 'stroke="#c89550" stroke-width="1.25"');
  art += e(118, 154, 2.8, 2.8, '#ffe6ab', 'stroke="#c6934b" stroke-width="1.2"');
  art += e(153, 122, 2.7, 2.7, '#fff0c1', 'stroke="#c99a54" stroke-width="1.2"');
  art += '</g>';

  // Two large irregular ice pieces remain legible without turning into a grid.
  art += p('M91 83L113 75L132 88L128 108L106 115L91 101Z', 'url(#c22-spark-ice)', 'stroke="#9e9f7a" stroke-width="1.5"');
  art += p('M91 83L110 91L132 88L113 75Z', '#fff8e2', 'stroke="#b8b79a" stroke-width="1.25"');
  art += line('M110 91L106 115M94 87L94 99', '#c0c9ac', 1.25, .85);
  art += p('M134 98L153 92L165 106L159 125L140 130L130 115Z', 'url(#c22-spark-ice)', 'stroke="#a5a381" stroke-width="1.45"');
  art += p('M134 98L145 109L165 106L153 92Z', '#fff7df', 'stroke="#b9b598" stroke-width="1.2"');
  art += line('M145 109L140 130', '#c4ccb0', 1.25, .8);

  art += line('M82 61C91 71 151 75 168 63', '#839f92', 1.45, .85);
  art += line('M90 70L96 191C96 200 102 204 111 206', '#fffdf0', 3, .92);
  art += line('M163 84L158 188', '#f3f7e6', 1.8, .82);
  art += line('M96 208C110 216 143 217 156 208', '#f7fae9', 2.1, .9);

  // The small citrus wheel touches the rim, keeping the garnish close to the cup.
  art += '<g transform="rotate(-17 160 66)">';
  art += e(160, 66, 20, 22, 'url(#c22-spark-peel)');
  art += e(160, 66, 16, 18, '#fff0bd', 'stroke="none"');
  art += e(160, 66, 13.8, 15.8, 'url(#c22-spark-orange)', 'stroke="none"');
  art += line('M160 51L160 81M147 59L173 73M148 74L172 58', '#fff1bd', 2.05, .96);
  art += e(160, 66, 2.4, 2.6, '#fff2c3', 'stroke="none"');
  art += line('M149 51C154 46 163 46 169 50', '#ffe6a8', 1.6, .9);
  art += '</g>';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>气泡冷萃 · CF08替换候选</title><defs>${defs}</defs><g stroke="#5c4335" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const sparklingColdbrewRedesign = {
  id: 'fresh-coffee-8',
  name: '气泡冷萃',
  previousName: '大杯美式',
  svg: sparklingColdbrew(),
  expectedOccupancy: .8,
  design: {
    silhouette: '修长直身高球玻璃，两枚大冰块与紧贴杯口的小柑橘圆片',
    angle: '轻俯视直立杯身，杯口可见，短小柑橘片靠右上杯沿',
    material: '深咖啡底层、浅琥珀气泡上层，冰块透亮，橙金果肉与浅玻璃边',
    identity: '高球杯、咖啡琥珀色层、几枚清楚气泡和柑橘圆片，区别矮玻璃冰咖啡',
    container: '无盖透明高球玻璃，配件紧贴杯身，不使用吸管和长装饰'
  },
  reason: '将重复的大杯美式提出为气泡冷萃，以修长高球杯、深浅咖啡色层、少量气泡和橙金柑橘片建立鲜明新身份；保持细深色描边和稳居中的杯体。'
};

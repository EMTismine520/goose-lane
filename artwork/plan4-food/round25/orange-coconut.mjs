// Round 25: two distinct drink replacements, editable transparent vector masters.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours) => `<linearGradient id="${id}" x1=".1" y1="0" x2=".85" y2="1">${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 特调饮品替换候选</title><defs>${defs}</defs><g stroke="#49392e" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function orangeSlush() {
  const body = 'M57 124L199 124L187 195Q183 215 128 216Q73 215 69 195Z';
  const defs = gradient('m25-orange-glass', ['#fff6d6', '#ead9ad', '#cebd92'])
    + gradient('m25-orange-juice', ['#ffca50', '#f9a532', '#e68027'])
    + gradient('m25-orange-ice', ['#ffdc65', '#ffb43c', '#f18a24'])
    + gradient('m25-orange-rind', ['#ffc543', '#f79924'])
    + `<clipPath id="m25-orange-cup-clip">${p(body, '#fff')}</clipPath>`;
  // Short straw and one recognisable half-orange sit behind the slush.
  let art = p('M161 112L174 64Q175 60 180 61L187 63Q190 64 189 68L176 116Z', '#78bda7');
  art += line('M179 67L168 108', '#d5f0cc', 1.65, .88);
  art += `<g transform="rotate(-17 83 103)">`;
  art += p('M48 101A35 35 0 0 1 118 101Z', 'url(#m25-orange-rind)', 'stroke-width="2.5"');
  art += p('M54 100A29 29 0 0 1 112 100Z', '#fff0b5', 'stroke="#dc9c3a" stroke-width="1.3"');
  art += p('M59 98A24 24 0 0 1 107 98Z', '#ffae38', 'stroke="none"');
  art += line('M83 98L83 75M83 98L64 83M83 98L102 83', '#ffedab', 2.1);
  art += '</g>';
  art += p(body, 'url(#m25-orange-glass)');
  art += '<g clip-path="url(#m25-orange-cup-clip)">';
  art += p('M63 130L193 130L182 194Q177 207 128 208Q79 207 74 194Z', 'url(#m25-orange-juice)', 'stroke="none"');
  art += p('M174 131L192 130L181 194Q176 203 160 205L165 176Z', '#d77727', 'stroke="none" opacity=".32"');
  art += p('M83 143L108 137L121 153L103 174L82 164Z', '#ffe490', 'stroke="none" opacity=".55"');
  art += p('M126 168L151 154L169 169L156 194L135 194Z', '#ffcf65', 'stroke="none" opacity=".6"');
  art += '</g>';
  art += line('M91 143L96 194M128 144L128 201M166 143L160 193', '#b89f73', 1.3, .57);
  art += p('M57 123Q60 107 75 104Q79 90 94 93Q109 77 124 88Q141 78 151 93Q168 87 177 102Q193 105 199 124Q166 139 128 138Q89 138 57 123Z', 'url(#m25-orange-ice)', 'stroke-width="2.5"');
  art += p('M78 111L93 102L108 111L99 123L82 123Z', '#ffdf7a', 'stroke="none"');
  art += p('M119 98L132 91L147 103L134 117L116 112Z', '#ffe48c', 'stroke="none" opacity=".8"');
  art += p('M151 118L167 109L181 119L164 129Z', '#ed8c27', 'stroke="none" opacity=".7"');
  art += line('M77 124Q128 143 179 125', '#ffdf8d', 1.55, .85);
  art += line('M62 129L73 192Q76 200 88 202', '#fffbe1', 3.2, .96);
  art += line('M191 141L182 189', '#fff4c7', 1.7, .82);
  art += line('M93 210Q128 217 163 210', '#fff6d7', 2, .95);
  return doc('橙子冰沙', defs, art);
}

function greenCoconutWater() {
  const body = 'M73 84C59 103 50 130 54 159C58 194 80 220 128 223C176 220 198 194 202 159C206 130 197 103 183 84Z';
  const defs = gradient('m25-coconut-shell', ['#c8df79', '#97c45e', '#5b934e'])
    + gradient('m25-coconut-ivory', ['#fff8dc', '#f0e8be', '#d6d5a2'])
    + gradient('m25-coconut-water', ['#f1f8d4', '#b5daca', '#8ebdaf'])
    + gradient('m25-coconut-straw', ['#ed9c87', '#d67c72']);
  let art = p(body, 'url(#m25-coconut-shell)');
  art += p('M182 94C201 122 199 159 186 183C176 203 157 215 139 219C159 204 172 177 173 150C174 128 174 111 182 94Z', '#4d8647', 'stroke="none" opacity=".37"');
  art += p('M74 107C64 125 61 151 69 171C72 179 79 177 77 169C71 148 76 129 82 115C86 107 79 101 74 107Z', '#e0eba0', 'stroke="none" opacity=".83"');
  art += p('M88 208C79 183 84 137 103 108L113 109C99 144 95 176 100 212Z', '#c4d878', 'stroke="none" opacity=".48"');
  art += line('M119 115C111 141 113 179 119 205', '#699a4b', 1.45, .55);
  art += line('M154 114C167 140 163 180 153 205', '#b9d374', 1.55, .65);
  art += line('M97 213Q127 224 157 213', '#bdd377', 1.65, .85);
  // A broad shaved rim and an open water well read as a fresh drink.
  art += p('M73 84L91 67L165 67L183 84L176 101Q128 126 80 101Z', 'url(#m25-coconut-ivory)', 'stroke-width="2.65"');
  art += e(128, 84, 55, 22, '#fff9df', 'stroke="#75824c" stroke-width="2.1"');
  art += e(128, 85, 39, 13.5, 'url(#m25-coconut-water)', 'stroke="#a8b98b" stroke-width="1.45"');
  art += line('M96 83Q112 75 130 77', '#ffffeb', 1.8, .95);
  art += line('M145 91Q154 89 159 85', '#d9edcc', 1.55, .9);
  // Short coral bend-straw, with no decorative parasol or loose fruit.
  art += p('M133 86L145 45Q146 42 150 43L175 51L172 60L153 54L144 88Z', 'url(#m25-coconut-straw)', 'stroke-width="2.6"');
  art += line('M150 48L171 55M147 57L140 80', '#ffd3b6', 1.45, .95);
  art += line('M144 88L133 86', '#9c6755', 1.3, .9);
  return doc('椰青水', defs, art);
}

export const orangeCoconutCandidates = [
  {
    id: 'fresh-mixer-9', name: '橙子冰沙', previousName: '威士忌', svg: orangeSlush(), expectedOccupancy: .80,
    design: { silhouette: '宽口矮身切面杯、低矮饱满的冰沙小丘，短吸管与半片橙子集中在杯口', angle: '略俯视，可见橙色冰沙表面与厚玻璃杯底', material: '鲜亮橙黄冰沙、清亮暖色玻璃和少量宽切面高光，保持大色块', identity: '横向宽矮轮廓与橙子半片，区别蓝柑高脚曲线杯、西柚杯及所有瓶罐', container: '独立低矮透明饮料杯，不加奶油、散落碎冰或托盘' },
    reason: '用宽矮橙色冰沙杯替换威士忌方瓶，明亮橙黄和低矮冰沙表面形成清楚身份；半片橙子与短吸管足够表达饮品，不堆叠配饰。'
  },
  {
    id: 'fresh-mixer-10', name: '椰青水', previousName: '伏特加', svg: greenCoconutWater(), expectedOccupancy: .80,
    design: { silhouette: '完整圆润青椰壳、削平的小肩和宽白色开口，短珊瑚色折弯吸管', angle: '三分之四微俯视，白色椰瓤环与清亮椰水同时可见', material: '鲜绿至草绿椰壳、奶油白切口和浅青椰水，用简洁分面表现天然纤维', identity: '圆润天然容器与白瓤开口，区别冰蓝伏特加瓶、绿金酒瓶及棕椰半边食材', container: '整颗开口青椰直接盛饮品，无额外玻璃杯、叶片或装饰伞' },
    reason: '以完整开口椰青替换伏特加高瓶，天然圆壳、清楚白瓤与短吸管带来独立材质和轮廓；鲜绿大色块在40px仍与瓶、罐、玻璃杯明显区分。'
  }
];

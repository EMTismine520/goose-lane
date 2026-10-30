// Round 20: independent honey, soft caramel and bright jelly-bean candidates.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours, coordinates = 'x1=".12" y1="0" x2=".82" y2="1"') => `<linearGradient id="${id}" ${coordinates}>${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 糖果甜料独立候选</title><defs>${defs}</defs><g stroke="#654735" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function honey() {
  const jar = 'M88 96L151 96L172 115L172 178L153 197L86 197L66 178L66 116Z';
  const liquid = 'M69 122Q118 137 169 122L169 176L152 193L87 193L69 177Z';
  const defs = gradient('s20-honey-glass', ['#eff2cf', '#d5ddbf', '#b4c5ab'])
    + gradient('s20-honey-gold', ['#ffe49b', '#f4ba53', '#d99632'])
    + gradient('s20-honey-neck', ['#fff0bc', '#f3cc7d', '#d5a24f'])
    + gradient('s20-honey-wood', ['#eec78d', '#d6a062', '#b97b43'])
    + `<clipPath id="s20-honey-clip">${p(jar, '#fff')}</clipPath>`;
  let art = p('M141 114L170 68C172 65 176 65 178 68C181 70 179 73 177 76L149 119Z', 'url(#s20-honey-wood)', 'stroke-width="2"');
  art += '<g transform="rotate(33 174 66)">';
  art += p('M159 55C159 50 165 47 174 47C183 47 189 50 189 55L189 78C189 83 183 86 174 86C165 86 159 83 159 78Z', 'url(#s20-honey-wood)');
  art += e(174, 55, 15, 7, '#f1ce97', 'stroke-width="1.5"');
  art += line('M161 63Q174 69 187 63M161 71Q174 77 187 71M161 79Q174 85 187 79', '#a97845', 1.4);
  art += '</g>';
  art += p('M174 82C170 93 172 97 169 102C166 107 160 107 159 101C159 96 166 91 165 86Z', '#f0bd56', 'stroke="#b18b43" stroke-width="1.4"');
  art += p(jar, 'url(#s20-honey-glass)');
  art += '<g clip-path="url(#s20-honey-clip)" stroke="none">';
  art += p(liquid, 'url(#s20-honey-gold)');
  art += p('M150 127L168 123L168 177L152 192L146 192Z', '#bb8031', 'opacity=".28"');
  art += p('M72 126L86 131L91 190L85 191L71 177Z', '#fff1bc', 'opacity=".40"');
  art += '</g>';
  art += line('M86 121L86 178L96 190M151 121L151 177L143 191', '#d0a54e', 1.4, .68);
  art += p('M77 133C76 146 77 160 79 166C80 171 85 171 85 165L83 136C82 130 78 129 77 133Z', '#fff8d5', 'stroke="none" opacity=".88"');
  art += line('M99 182Q116 188 135 183', '#ffe9a8', 2, .9);
  art += p('M88 91L88 105C101 115 140 115 152 104L152 91Z', 'url(#s20-honey-neck)', 'stroke-width="2.1"');
  art += e(120, 91, 32, 11, '#f0d38e', 'stroke-width="2"');
  art += e(120, 91, 25, 6, '#dca045', 'stroke="#ae8546" stroke-width="1.4"');
  art += line('M99 87Q118 82 138 88M96 105Q116 112 141 106', '#fff2c1', 1.8, .9);
  return doc('蜂蜜', defs, art);
}

function caramel() {
  const defs = gradient('s20-caramel-top', ['#f4c387', '#e9a960', '#d88a40'])
    + gradient('s20-caramel-face', ['#dfa052', '#c47b32', '#ab642b'])
    + gradient('s20-caramel-side', ['#d58d40', '#b76c2c', '#9e5928'])
    + gradient('s20-caramel-front', ['#efb26c', '#d38c42', '#bc7331']);
  let art = p('M82 81L126 62Q132 59 138 63L168 82L167 122Q165 129 158 132L114 150L81 127Z', 'url(#s20-caramel-face)');
  art += p('M84 78L128 60Q134 58 139 61L166 77Q171 80 166 84L124 103Q119 105 114 102L85 86Q80 82 84 78Z', 'url(#s20-caramel-top)');
  art += p('M124 103L168 82L167 121Q165 128 158 131L124 145Z', 'url(#s20-caramel-side)', 'stroke-width="1.5"');
  art += line('M93 80L132 65L152 76', '#ffdfaa', 2.1, .9);
  art += p('M44 123L84 104Q91 101 97 105L129 123L128 167Q127 175 119 178L77 197Q71 199 66 195L43 177Q38 173 39 167L39 132Q39 126 44 123Z', 'url(#s20-caramel-front)');
  art += p('M45 123L85 105Q91 102 97 106L125 122Q131 126 126 130L82 150Q76 152 71 149L43 133Q37 128 45 123Z', 'url(#s20-caramel-top)');
  art += p('M82 150L128 128L128 166Q127 174 119 178L79 197L79 157Z', 'url(#s20-caramel-side)', 'stroke-width="1.5"');
  art += p('M46 140L52 145L52 167Q52 173 47 170Z', '#f8d49a', 'stroke="none" opacity=".68"');
  art += line('M51 126L89 111L111 123M49 176L68 190', '#ffe0aa', 1.9, .87);
  art += p('M134 125L173 108Q180 105 185 109L214 128Q219 131 218 137L216 175Q216 182 209 186L168 205Q161 208 156 203L130 183Q125 180 126 173L127 136Q126 129 134 125Z', 'url(#s20-caramel-front)');
  art += p('M134 125L174 108Q180 106 186 110L213 127Q219 131 212 135L171 154Q164 157 159 153L132 136Q125 131 134 125Z', 'url(#s20-caramel-top)');
  art += p('M170 155L216 133L216 175Q216 182 209 186L169 205Z', 'url(#s20-caramel-side)', 'stroke-width="1.5"');
  art += p('M140 130L173 116Q180 113 187 117L195 122C199 125 196 128 191 127L177 122L146 135C139 138 135 133 140 130Z', '#ffe4b2', 'stroke="none" opacity=".86"');
  art += line('M136 147L136 169Q136 176 144 181M179 195L207 182', '#f1c489', 1.7, .85);
  return doc('焦糖', defs, `<g transform="rotate(-5 128 128)">${art}</g>`);
}

function jellyBeans() {
  const bean = 'M7 -45C-14 -49 -34 -33 -34 -12C-36 13 -20 40 1 45C18 50 33 36 30 19C27 7 15 6 13 -5C10 -16 23 -26 22 -35C22 -42 15 -46 7 -45Z';
  const defs = gradient('s20-bean-yellow', ['#fff0a5', '#f1c94e', '#d9aa32'])
    + gradient('s20-bean-blue', ['#b6e0e9', '#71b8d3', '#4d94ba'])
    + gradient('s20-bean-green', ['#b8e38e', '#7bbd69', '#4e9254'])
    + gradient('s20-bean-pink', ['#f6aac3', '#df719c', '#be4c7d']);
  const makeBean = (fill, transform) => `<g transform="${transform}">${p(bean, fill)}${p('M-14 -32C-26 -25 -28 -11 -25 1C-24 7 -18 6 -18 0C-20 -12 -16 -23 -8 -28C-2 -32 -8 -36 -14 -32Z', '#fff8e6', 'stroke="none" opacity=".84"')}${line('M9 36Q20 38 24 31', '#fff9ea', 1.9, .58)}</g>`;
  let art = makeBean('url(#s20-bean-yellow)', 'translate(100 88) rotate(55)');
  art += makeBean('url(#s20-bean-blue)', 'translate(156 92) rotate(-40)');
  art += makeBean('url(#s20-bean-green)', 'translate(155 153) rotate(50)');
  art += makeBean('url(#s20-bean-pink)', 'translate(95 150) rotate(-48)');
  return doc('糖豆', defs, art);
}

export const sweetMidCandidates = [
  { id: 'fresh-sweet-4', name: '蜂蜜', svg: honey(), expectedOccupancy: .68, design: { silhouette: '矮胖六角蜜罐与一根短木蜜棒，罐口和奶金蜜面清楚', angle: '三分之四俯视，短蜜棒向右上轻斜', material: '饱满蜜金色浓蜜、浅绿金玻璃边和温暖木棒，少量厚亮面', identity: '六角矮蜜罐、带槽木蜜棒与一滴浓蜜，区别高窄糖浆壶', container: '矮六角玻璃罐，容器简洁无标签文字，四级体量克制' }, reason: '用矮六角罐与短蜜棒建立蜂蜜身份，浓蜜以饱满金色和一滴稠蜜表现；四级保持小巧，避免瓶罐抢过食材。' },
  { id: 'fresh-sweet-5', name: '焦糖', svg: caramel(), expectedOccupancy: .70, design: { silhouette: '三枚边角微软的厚焦糖小方块，前后二层紧凑聚拢', angle: '三分之四俯视，浅色顶面和暖棕侧面形成软块厚度', material: '不透明暖琥珀棕焦糖，克制浓糖光泽与奶金色亮边', identity: '圆软方角、厚实不透明糖体和黏润亮面，区别透明冰糖晶块与肉丸', container: '裸焦糖三块，无包装、盘或复杂配料' }, reason: '重新绘制三枚紧聚软焦糖，用温暖琥珀棕、柔角厚方形与少量糖光泽表现浓郁口感，五级仍保持清楚小体量。' },
  { id: 'fresh-sweet-6', name: '糖豆', svg: jellyBeans(), expectedOccupancy: .8, design: { silhouette: '莓粉、青绿、奶黄和柔蓝四枚弯豆形糖果，紧凑错位相依', angle: '略俯视，每枚弯豆方向不同但聚拢为完整大形', material: '鲜亮柔和的糖壳色块，每颗仅一块大留白高光', identity: '明显弯曲的豆形与四色糖壳，区别裸坚果、糖球和谷粒', container: '透明底裸糖豆组合，无盘无包装' }, reason: '以四枚饱满弯豆和活泼四色拉开糖豆身份，减少零碎数量与纹理，让40px仍能读出清楚的豆形和糖壳光泽。' },
];

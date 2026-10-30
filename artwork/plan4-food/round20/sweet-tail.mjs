// Independent chocolate, marshmallow and brown-sugar pearl candidates.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours) => `<linearGradient id="${id}" x1=".12" y1="0" x2=".8" y2="1">${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 糖果甜料新版候选</title><defs>${defs}</defs><g stroke="#513b30" stroke-width="3.1" stroke-linejoin="round" stroke-linecap="round">${art}</g></svg>`;

function chocolate() {
  const defs = gradient('s20-cocoa-side', ['#754431', '#4f3028'])
    + gradient('s20-cocoa-top', ['#a36b48', '#7d4934', '#653c2d'])
    + gradient('s20-cocoa-block', ['#a76c49', '#8a5038', '#75412f']);
  let art = p('M47 80L200 80L204 91L204 177Q204 184 195 184L53 184Q46 184 46 176Z', 'url(#s20-cocoa-side)');
  art += p('M47 70Q47 62 56 62L182 62L182 72L201 72L201 163Q201 171 193 171L54 171Q47 171 47 163Z', 'url(#s20-cocoa-top)');
  const blocks = [[54, 70], [102, 70], [150, 80], [54, 119], [102, 119], [150, 119]];
  for (const [i, [x, y]] of blocks.entries()) {
    const h = i === 2 ? 31 : 40;
    art += p(`M${x + 5} ${y}H${x + 36}Q${x + 41} ${y} ${x + 41} ${y + 5}V${y + h - 5}Q${x + 41} ${y + h} ${x + 36} ${y + h}H${x + 5}Q${x} ${y + h} ${x} ${y + h - 5}V${y + 5}Q${x} ${y} ${x + 5} ${y}Z`, 'url(#s20-cocoa-block)', 'stroke="#5c382b" stroke-width="1.5"');
    art += p(`M${x + 5} ${y + 3}H${x + 35}L${x + 30} ${y + 8}H${x + 10}L${x + 6} ${y + 13}Z`, '#c58b5d', 'stroke="none" opacity=".69"');
    art += line(`M${x + 35} ${y + 12}V${y + h - 7}H${x + 12}`, '#603829', 1.35, .7);
  }
  art += p('M182 62L182 72L201 72L194 67L194 63L188 65Z', '#c18a61', 'stroke="#60412e" stroke-width="1.4"');
  art += line('M56 177H187M48 167L48 175', '#9d6445', 1.5, .8);
  art += line('M60 76L75 76M108 76L119 76M60 125L75 125', '#dfac77', 1.4, .6);
  return doc('巧克力', defs, `<g transform="rotate(-15 128 128)">${art}</g>`);
}

function marshmallows() {
  const defs = gradient('s20-mallow-pink', ['#ffe8df', '#efb9bd', '#d99caa'])
    + gradient('s20-mallow-white', ['#fffdf0', '#faeddd', '#e6d5c8'])
    + gradient('s20-mallow-front', ['#fff4ed', '#f4d7d2', '#e6b9bd']);
  let art = '<g transform="rotate(-17 89 100)">';
  art += p('M56 74C56 61 71 54 89 54C108 54 123 62 123 74L123 122C123 135 108 142 89 142C71 142 56 134 56 122Z', 'url(#s20-mallow-pink)');
  art += e(89, 74, 32, 18, '#ffece2', 'stroke="none"');
  art += line('M65 84Q88 96 113 84', '#d9a3ae', 1.2, .48);
  art += line('M62 84L62 116Q64 128 77 132M75 63Q88 59 101 65', '#fff5e9', 2.1, .86);
  art += line('M115 85V117', '#d99da9', 1.35, .7);
  art += '</g><g transform="rotate(20 161 106)">';
  art += p('M128 82C128 70 143 62 161 62C179 62 194 70 194 82L194 132C194 145 179 153 161 153C143 153 128 145 128 132Z', 'url(#s20-mallow-white)');
  art += e(161, 82, 32, 18, '#fffdf2', 'stroke="none"');
  art += line('M137 92Q161 103 184 91', '#ddcdbb', 1.2, .5);
  art += line('M135 92V126Q135 137 146 141M145 73Q156 68 166 72', '#fffef5', 2, .9);
  art += line('M187 95V128', '#ddc9b9', 1.35, .75);
  art += '</g>';
  art += '<g transform="rotate(-8 122 164)">';
  art += p('M82 151C82 137 100 129 122 129C144 129 162 137 162 151L162 190C162 204 144 212 122 212C100 212 82 204 82 190Z', 'url(#s20-mallow-front)');
  art += e(122, 151, 39, 21, '#fff5eb', 'stroke="none"');
  art += line('M91 164Q122 180 152 163', '#dfb7b8', 1.25, .5);
  art += p('M91 152C94 142 107 137 119 137C128 137 130 142 123 144C111 144 102 148 99 154C96 159 89 157 91 152Z', '#fffdf1', 'stroke="none" opacity=".9"');
  art += line('M90 165L90 186Q92 198 109 202', '#fff7eb', 2.2, .92);
  art += line('M151 167V188Q150 198 139 202', '#dbaeb1', 1.4, .68);
  art += '</g>';
  return doc('棉花软糖', defs, art);
}

function brownSugarPearls() {
  const defs = gradient('s20-pearl-bowl', ['#fff6df', '#efdfbf', '#d8bf99'])
    + gradient('s20-pearl-syrup', ['#835334', '#5e3828'])
    + gradient('s20-pearl-ball', ['#785038', '#4c3028', '#352521']);
  let art = p('M39 126L49 175C58 199 89 211 129 211C169 211 200 199 211 175L221 126Z', 'url(#s20-pearl-bowl)');
  art += e(130, 127, 91, 38, '#fff1d3', 'stroke="#8c7052" stroke-width="2"');
  art += e(130, 128, 82, 30, 'url(#s20-pearl-syrup)', 'stroke="#775139" stroke-width="1.4"');
  const pearls = [[76, 113, 20], [115, 99, 21], [156, 107, 21], [189, 129, 19], [98, 139, 23], [140, 135, 23], [173, 160, 21], [67, 157, 19], [119, 169, 22]];
  for (const [cx, cy, radius] of pearls) {
    art += e(cx, cy, radius, radius * .96, 'url(#s20-pearl-ball)', 'stroke="#4b3026" stroke-width="1.6"');
    art += e(cx - radius * .25, cy - radius * .37, radius * .32, radius * .14, '#bc9063', 'stroke="none" opacity=".85" transform="rotate(-23 '+cx+' '+cy+')"');
    art += e(cx + radius * .27, cy + radius * .44, radius * .21, radius * .09, '#8a5a3e', 'stroke="none" opacity=".55"');
  }
  art += p('M42 147C61 168 93 180 129 180C166 180 199 168 218 146L211 175C200 199 168 211 129 211C89 211 59 199 49 175Z', 'url(#s20-pearl-bowl)', 'stroke="#8c7052" stroke-width="2"');
  art += line('M45 147C64 169 96 181 129 181C165 181 199 169 216 148', '#fffaf0', 2.8, .92);
  art += line('M59 177C68 192 86 201 106 203M122 206Q151 207 175 195', '#fff8e5', 2.2, .83);
  art += line('M197 181Q202 177 205 171', '#c1a982', 1.4, .65);
  return doc('黑糖珍珠', defs, art);
}

export const sweetTailCandidates = [
  { id: 'fresh-sweet-7', name: '巧克力', svg: chocolate(), expectedOccupancy: .8, design: { silhouette: '轻斜摆放的厚可可巧克力排，六块饱满分块与一处小断角', angle: '微俯视，可见顶部六格与下侧厚边', material: '深可可棕、暖棕亮面和克制的大块倒角光泽', identity: '六格巧克力分块、深棕断面与厚边，区别浅黄奶酪或木板', container: '裸巧克力，透明底，无品牌字与多余包装' }, reason: '以厚巧克力排和六个清楚分块建立身份，一处小断角增加食材感，深可可色与暖亮面在40px仍有明确层次。' },
  { id: 'fresh-sweet-8', name: '棉花软糖', svg: marshmallows(), expectedOccupancy: .8, design: { silhouette: '三枚白与柔粉短圆柱软糖，错位紧聚，圆弧侧壁与椭圆顶面清楚', angle: '略俯视，两枚后方轻倾、一枚前方横宽，形态蓬松柔软', material: '奶白和淡玫粉软糖，柔亮面与浅暖色阴影，表面干净不噪点', identity: '短圆柱、椭圆顶面与柔软圆角，区别圆形糯米团和棒状棉花糖', container: '裸软糖组合，透明底，无盘无棍' }, reason: '用三枚短圆柱的自然错位表现棉花软糖，白与柔粉拉开层次；保留宽圆侧面和简单顶面，小图也能感到蓬松。' },
  { id: 'fresh-sweet-9', name: '黑糖珍珠', svg: brownSugarPearls(), expectedOccupancy: .8, design: { silhouette: '浅奶油色低碟中九枚大颗深棕珍珠，颗粒紧凑相依、上缘圆润起伏', angle: '三分之四俯视，可见黑糖浆面、完整大颗粒和低碟前缘', material: '深黑糖棕圆珠、稀疏暖琥珀亮面与少量浓糖浆，浅色低碟承托', identity: '深棕饱满圆珠和糖浆光泽，区别紫蓝莓、咖啡豆及细碎糖粒', container: '轻简浅奶油色低陶碟，低边不抢主体' }, reason: '以九枚大圆珍珠和少量黑糖浆表现糯弹食材，浅色低碟托起深棕颗粒，让40px下仍有清楚圆形颗粒和浓糖光泽。' },
];

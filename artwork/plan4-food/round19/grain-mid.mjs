// Round 19: three independent grain and bread silhouettes for staged review.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.45, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours, coordinates = 'x1=".12" y1="0" x2=".8" y2="1"') => `<linearGradient id="${id}" ${coordinates}>${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 谷物面点独立候选</title><defs>${defs}</defs><g stroke="#604738" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function softDough() {
  const defs = gradient('g19-dough-body', ['#fff8e5', '#f5e7c8', '#ddc7a4'])
    + gradient('g19-dough-fold', ['#faedce', '#e2cda9']);
  let art = p('M49 145C48 126 55 105 71 89C86 73 105 68 128 71C145 64 169 72 183 87C201 104 211 128 208 149C207 170 192 184 169 190C145 198 111 197 87 191C64 186 50 171 49 145Z', 'url(#g19-dough-body)');
  art += p('M55 152C62 169 81 178 105 181C128 185 151 180 167 174C174 171 179 172 178 176C174 186 154 192 132 194C98 197 69 189 57 173C53 167 52 159 55 152Z', '#d8bd98', 'stroke="none" opacity=".38"');
  art += p('M71 114C82 94 103 84 124 85C134 85 135 91 125 93C105 95 89 103 79 119C73 128 67 123 71 114Z', '#fffdf0', 'stroke="none" opacity=".88"');
  art += p('M158 150C170 145 186 144 194 151C197 157 191 166 180 171C170 176 158 174 154 167C150 160 152 154 158 150Z', 'url(#g19-dough-fold)', 'stroke="#bba07c" stroke-width="1.45"');
  art += line('M161 151C168 155 173 157 176 163C179 157 183 154 190 153', '#c1a782', 1.4, .8);
  art += line('M183 165Q177 169 169 169M60 147Q60 159 67 166', '#ead7b5', 1.5, .92);
  return doc('软面团', defs, `<g transform="rotate(-6 128 128)">${art}</g>`);
}

function toast() {
  const outline = 'M72 104C61 96 58 83 64 69C70 54 87 49 103 54C113 44 133 43 146 51C160 46 179 52 184 67C191 82 185 95 175 104L175 185C175 194 169 199 159 199L88 199C78 199 72 194 72 185Z';
  const crumb = 'M84 102C74 94 70 85 75 75C81 64 94 62 106 68C116 57 132 56 143 65C156 59 170 64 175 74C179 84 175 94 163 102L163 181C163 185 160 187 155 187L93 187C87 187 84 184 84 179Z';
  const defs = gradient('g19-toast-crust', ['#e6ac57', '#c9883d', '#ad6d32'])
    + gradient('g19-toast-crumb', ['#fff8df', '#f8e9c3', '#efd9ac'])
    + gradient('g19-toast-under', ['#f3d391', '#d6a458']);
  let art = '<g transform="translate(22 -6) rotate(11 128 128)">';
  art += p(outline, 'url(#g19-toast-under)');
  art += p(crumb, '#fbebc5', 'stroke="#d9b47a" stroke-width="1.4"');
  art += '</g><g transform="rotate(-8 128 128)">';
  art += p('M79 107L183 101L183 189C183 197 176 204 165 206L93 207C82 207 77 202 77 194Z', '#ba813e', 'stroke-width="2.2"');
  art += p(outline, 'url(#g19-toast-crust)');
  art += p(crumb, 'url(#g19-toast-crumb)', 'stroke="#b8874e" stroke-width="1.5"');
  art += p('M84 99C77 91 77 81 82 76C87 70 95 69 101 71C105 73 104 77 100 77C92 76 85 82 87 89C88 94 89 97 87 99Z', '#fffbed', 'stroke="none" opacity=".87"');
  art += line('M94 176Q122 182 151 178', '#fff3d2', 1.7, .9);
  art += e(108, 107, 2.6, 3.5, '#d7bc88', 'stroke="none" opacity=".6"');
  art += e(139, 148, 3, 2.2, '#d7bc88', 'stroke="none" opacity=".55"');
  art += e(103, 157, 1.8, 2.1, '#dac08d', 'stroke="none" opacity=".62"');
  art += '</g>';
  return doc('吐司', defs, art);
}

function breadBlank() {
  const dome = 'M42 135C41 104 57 80 83 66C104 55 137 52 163 61C192 69 211 91 217 120C224 144 208 160 184 168C155 178 111 177 78 168C55 162 42 151 42 135Z';
  const defs = gradient('g19-bun-dome', ['#fbd895', '#edb66d', '#d98e47'])
    + gradient('g19-bun-base', ['#f5d59b', '#e4b873', '#c98b49']);
  let art = p('M43 136C49 154 77 164 110 167C154 172 199 165 216 145L215 159C212 176 177 189 137 191C96 194 52 181 46 164Z', 'url(#g19-bun-base)');
  art += p(dome, 'url(#g19-bun-dome)');
  art += p('M59 117C66 90 91 72 116 69C130 68 133 74 121 76C98 81 80 97 73 117C69 128 56 127 59 117Z', '#ffe8af', 'stroke="none" opacity=".76"');
  art += p('M81 100C97 91 114 83 132 78C136 77 140 79 137 83C122 93 107 101 91 108C85 111 78 106 81 100Z', '#b97c42', 'stroke="none" opacity=".72"');
  art += p('M90 100C106 92 119 85 132 81C120 90 107 97 96 103Z', '#fff0c2', 'stroke="none"');
  art += p('M126 119C143 107 159 97 173 91C179 89 182 93 178 98C165 110 151 120 137 127C131 129 123 125 126 119Z', '#b97c42', 'stroke="none" opacity=".69"');
  art += p('M135 119C151 108 164 100 175 95C162 107 150 115 140 122Z', '#ffe8b2', 'stroke="none"');
  art += line('M55 158C76 173 106 180 135 178M155 179Q184 177 202 165', '#f9dc9e', 1.6, .86);
  art += e(174, 131, 5, 1.7, '#fff0bd', 'stroke="#c99655" stroke-width="1.1" transform="rotate(-20 174 131)"');
  art += e(157, 143, 4.5, 1.6, '#ffedb5', 'stroke="#c99655" stroke-width="1.1" transform="rotate(17 157 143)"');
  return doc('面包胚', defs, `<g transform="rotate(-7 128 128)">${art}</g>`);
}

export const grainMidCandidates = [
  { id: 'fresh-grain-4', name: '软面团', svg: softDough(), expectedOccupancy: .70, design: { silhouette: '奶白圆润揉圆面团，底侧一处柔软收口折痕，轮廓略不规则', angle: '三分之四俯视，柔软面团略侧斜', material: '奶白与浅麦色面团，大块温柔高光和克制底部暖影', identity: '未烤的浅色软团与自然揉面收口，区别金黄面包和方形吐司', container: '裸面团透明底，无盛器或装饰' }, reason: '独立重画软面团，以柔和不规则圆形、浅奶白表面和一处揉面收口表现弹软质地；四级体量保持小巧。' },
  { id: 'fresh-grain-5', name: '吐司', svg: toast(), expectedOccupancy: .70, design: { silhouette: '前后一厚一薄两片双圆顶方底吐司，前片微斜，后片轻轻露出', angle: '近侧俯视，前片切面正对观察者，后片错位', material: '奶白蓬松切面与暖金褐烤边，少量稀疏气孔', identity: '双圆顶、方底、薄烤边和完整软切面，避免饼干状厚硬轮廓', container: '两片裸吐司紧凑相叠，透明底无盘' }, reason: '重新绘制两片自然错位的吐司，以双圆顶和清楚奶白切面建立身份，五级控制体量并保留细深色描边。' },
  { id: 'fresh-grain-6', name: '面包胚', svg: breadBlank(), expectedOccupancy: .8, design: { silhouette: '饱满椭圆圆顶面包胚，下缘厚软，两条短斜割口与两枚芝麻', angle: '低角度三分之四俯视，面包长轴略斜', material: '浅烘金黄表皮、淡奶麦色下缘与柔和曲面高光', identity: '完整金黄圆顶和自然割口，区别未烤奶白面团与吐司切片', container: '裸面包胚透明底，无馅料与盛器' }, reason: '用浅烘金色椭圆圆顶和两道自然割口表现面包胚的蓬松厚度，少量芝麻辅助辨识，完整轮廓饱满而简洁。' },
];

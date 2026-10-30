// GF07–GF09: independent, editable grain-chain candidates.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.45, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours) => `<linearGradient id="${id}" x1=".18" y1="0" x2=".75" y2="1">${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 谷物面点新版候选</title><defs>${defs}</defs><g stroke="#594235" stroke-width="3.1" stroke-linejoin="round" stroke-linecap="round">${art}</g></svg>`;

function riceBatter() {
  const defs = gradient('g19-batter-bowl', ['#dcebea', '#b5d3d3', '#8eb7bd'])
    + gradient('g19-batter-mix', ['#fffbed', '#f5edd5', '#e5d6b6'])
    + gradient('g19-batter-wood', ['#d9b780', '#ad8050']);
  let art = p('M45 126L57 167C64 188 90 201 125 201C159 201 184 190 193 169L208 124Z', 'url(#g19-batter-bowl)');
  art += p('M45 124C45 108 79 96 122 96C153 96 178 102 192 112L216 108L206 128C190 143 160 152 124 152C81 152 45 140 45 124Z', '#d9e8e3');
  art += p('M55 124C56 112 85 104 121 104C153 104 178 110 188 119L207 116L198 127C185 138 156 144 125 144C89 144 60 136 55 124Z', 'url(#g19-batter-mix)', 'stroke="#aa987a" stroke-width="1.4"');
  art += p('M83 117C87 107 101 94 117 81L154 47C159 42 166 43 168 48C170 54 165 58 161 61L127 91C112 105 101 119 94 123C87 127 80 123 83 117Z', 'url(#g19-batter-wood)');
  art += p('M84 115C91 109 104 107 109 111C114 115 107 121 99 125C92 129 82 128 80 124C77 120 80 117 84 115Z', '#f8edd2', 'stroke="#a18a62" stroke-width="1.4"');
  art += p('M197 126C199 131 197 143 194 148C191 153 186 151 187 146L190 135C187 138 184 137 184 134C185 130 190 128 197 126Z', '#f7edd4', 'stroke="#ae9b7a" stroke-width="1.35"');
  art += line('M113 128C128 121 151 122 164 129M117 134C129 130 146 131 153 134', '#c8b995', 1.4, .75);
  art += line('M71 120C76 115 86 112 94 111M128 111C144 110 162 113 172 117', '#fffdf2', 2.2, .95);
  art += line('M60 148C66 169 79 181 99 187M119 196Q143 198 163 188', '#eff7e8', 2.2, .87);
  art += line('M131 83L158 58', '#f1d6a4', 1.65, .9);
  return doc('米粉浆', defs, art);
}

function glutinousDough() {
  const defs = gradient('g19-mochi-whole', ['#fffbee', '#f7eadb', '#e7cfc3'])
    + gradient('g19-mochi-skin', ['#fff7e8', '#f4e3d5', '#dec3b8'])
    + gradient('g19-mochi-cut', ['#fffdf0', '#f5e9d5'])
    + gradient('g19-mochi-bean', ['#b96f6e', '#985355', '#82454c']);
  let art = p('M48 117C46 86 67 60 97 58C128 55 152 77 155 107C159 140 137 163 105 167C73 171 50 150 48 117Z', 'url(#g19-mochi-whole)');
  art += p('M62 98C67 78 82 69 98 68C108 68 112 73 107 76C87 77 75 87 70 103C68 109 61 105 62 98Z', '#fffef3', 'stroke="none" opacity=".88"');
  art += p('M53 125C62 145 78 153 99 153C116 153 130 147 141 136C131 156 110 167 89 163C72 161 58 147 53 125Z', '#d9bbaf', 'stroke="none" opacity=".26"');
  art += line('M67 135C73 143 84 147 94 148', '#fff6e7', 2.2, .75);
  art += p('M99 162C99 135 122 117 152 116C183 113 206 130 211 155L211 170C207 193 185 207 155 207C124 207 103 193 99 173Z', 'url(#g19-mochi-skin)');
  art += p('M99 158C101 134 124 119 152 118C180 116 204 131 210 155C205 175 185 188 156 188C126 188 104 177 99 158Z', 'url(#g19-mochi-cut)');
  art += p('M120 153C122 141 137 134 152 134C169 133 184 140 189 152C186 166 174 175 155 175C137 175 124 167 120 153Z', 'url(#g19-mochi-bean)', 'stroke="#7c4d4d" stroke-width="1.5"');
  art += p('M128 147C134 140 144 138 154 139C160 140 160 143 154 144C144 144 137 147 133 151C130 154 126 152 128 147Z', '#d2998b', 'stroke="none" opacity=".8"');
  art += line('M143 157Q153 152 166 156M157 166Q166 165 172 161', '#b57470', 1.4, .8);
  art += line('M111 155C114 139 131 129 145 127M119 181Q137 193 158 194', '#fffdf1', 2.1, .9);
  return doc('糯米团', defs, `<g transform="rotate(-8 128 128)">${art}</g>`);
}

function puffPastry() {
  const defs = gradient('g19-puff-sheet', ['#fff0c6', '#f8dfaa', '#e9c78d'])
    + gradient('g19-puff-under', ['#f4d79c', '#dbb979'])
    + gradient('g19-puff-curl', ['#fff4d2', '#f0d39a']);
  let art = p('M43 118L144 80L213 130L116 175L45 135Z', 'url(#g19-puff-under)');
  art += p('M43 110L144 72L213 122L116 167L44 127Z', '#fae1ac');
  art += p('M43 101L144 63L213 113L116 158L44 119Z', 'url(#g19-puff-under)');
  art += p('M43 93L144 55L213 105C211 111 210 116 204 119L123 157C119 159 114 157 111 155L44 112Z', 'url(#g19-puff-sheet)');
  art += p('M43 93L144 55L213 105L117 147Z', 'url(#g19-puff-sheet)');
  // The leading corner rolls back to show a supple unbaked laminated sheet.
  art += p('M117 147C108 138 105 126 113 118C120 111 132 114 140 120L153 130L123 157C118 161 113 156 117 147Z', 'url(#g19-puff-curl)', 'stroke-width="2.2"');
  art += p('M113 118C117 125 123 131 133 134L123 143C114 139 108 132 108 126C108 122 110 119 113 118Z', '#dfb67b', 'stroke-width="1.4"');
  art += line('M51 111L102 141M52 127L111 161M130 161L199 131M132 151L203 120', '#b38e59', 1.3, .67);
  art += line('M59 94L141 63L189 98M56 119L102 147', '#fff5d4', 2.15, .9);
  art += line('M150 66L194 98', '#e1be82', 1.4, .5);
  return doc('酥皮', defs, `<g transform="rotate(-5 128 128)">${art}</g>`);
}

export const grainTailCandidates = [
  { id: 'fresh-grain-7', name: '米粉浆', svg: riceBatter(), expectedOccupancy: .8, design: { silhouette: '带短倒口的宽浅调浆碗，米白浓浆与一柄小木勺', angle: '三分之四俯视，平滑浆面与碗口倒嘴都可见', material: '温润米白浓浆、低饱和浅蓝陶碗和浅木色搅拌勺，少量柔和流痕', identity: '调浆碗、搅拌勺、短倒口与厚浆流线，区别奶瓶和奶油团', container: '低矮带嘴调浆碗承托，开口浆面为主要色块' }, reason: '独立绘制带嘴调浆碗和米白稠浆，以搅拌勺、平滑浆面与短流线表现米粉浆，减少空碗或牛奶的歧义。' },
  { id: 'fresh-grain-8', name: '糯米团', svg: glutinousDough(), expectedOccupancy: .8, design: { silhouette: '一枚圆软整糯团与一枚厚皮半切糯团紧凑错叠，切面露出少量豆沙', angle: '略俯视，整团在后，前方切面朝向观察者', material: '奶白与极淡米粉色软糯表皮，浅红褐豆沙断面，柔润但克制的高光', identity: '圆软糯皮与厚白切边包裹的豆沙，区别生面团与奶酪圆轮', container: '透明底裸糯米团，无盘无竹签无配菜' }, reason: '以整团和半切面的紧凑双团构图表现软糯质感，厚白皮与浅红豆沙给出清楚内部层次，让高阶圆团有独立身份。' },
  { id: 'fresh-grain-9', name: '酥皮', svg: puffPastry(), expectedOccupancy: .8, design: { silhouette: '少量薄方酥皮交错叠放，前角轻卷露出柔软薄层', angle: '三分之四俯视，斜向方片与前沿层边清楚可见', material: '淡麦金、奶油黄的未烤酥皮，薄边略深，少量柔和大亮面', identity: '薄方片、轻卷角和稀疏层边，避免画成厚蛋糕或烤饼', container: '透明底裸酥皮片，无盘无果酱装饰' }, reason: '重新绘制柔软薄方酥皮与轻卷前角，用少量层边表现酥皮的薄与柔，淡麦金色保持食材感，并与圆形糯团拉开轮廓。' },
];

// Independent review candidates. Existing selected artwork and runtime files remain intact.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const l = (d, colour, width = 1.5, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const g = (id, colours, coords = 'x1=".15" y1="0" x2=".8" y2="1"') => `<linearGradient id="${id}" ${coords}>${colours.map((colour, index) => `<stop offset="${index / (colours.length - 1)}" stop-color="${colour}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 独立新稿</title><defs>${defs}</defs><g stroke="#49362f" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function salmon() {
  const flesh = 'M35 147C53 121 79 96 105 78C135 57 163 45 189 50C208 53 220 65 222 83C220 113 200 145 172 165C143 187 108 204 81 211C60 196 43 174 35 147Z';
  const defs = g('s15-salmon-skin', ['#9daca1', '#6d837f', '#526567'])
    + g('s15-salmon-side', ['#eaa17c', '#d67e61', '#c56b56'])
    + g('s15-salmon-flesh', ['#ffc08e', '#f89b70', '#e88160'])
    + g('s15-salmon-fat', ['#fff3cf', '#ffe5bd'])
    + `<clipPath id="s15-salmon-clip">${p(flesh, '#fff')}</clipPath>`;
  let a = p('M35 145C44 169 62 194 81 209C112 200 145 185 172 165C197 147 215 119 221 88L218 112C212 141 195 164 173 180C143 201 110 216 81 224C57 210 38 184 31 160Z', 'url(#s15-salmon-skin)');
  a += p('M35 145C44 169 62 194 81 209C112 200 145 185 172 165C194 149 212 125 219 102L216 117C204 145 187 163 168 177C143 194 108 211 82 217C60 203 43 180 35 158Z', 'url(#s15-salmon-side)', 'stroke-width="1.4"');
  a += p(flesh, 'url(#s15-salmon-flesh)');
  a += '<g clip-path="url(#s15-salmon-clip)" stroke="none">';
  a += p('M74 99C84 112 102 120 120 129C137 137 145 149 144 166C143 181 149 188 161 191L172 182C156 181 153 173 155 161C157 141 147 126 128 117C109 108 94 100 87 89Z', 'url(#s15-salmon-fat)');
  a += p('M108 72C117 85 132 92 150 100C169 108 179 120 178 137C177 150 181 157 189 161L198 151C188 148 188 139 188 133C188 113 176 101 158 92C140 84 128 77 122 66Z', 'url(#s15-salmon-fat)');
  a += p('M148 49C151 61 162 69 179 77C194 84 205 93 208 106L218 98C212 84 201 76 187 69C173 62 164 55 162 46Z', 'url(#s15-salmon-fat)');
  a += p('M47 133C59 147 76 154 91 163C108 173 111 185 106 202L116 198C121 179 115 167 100 157C82 145 65 140 56 123Z', 'url(#s15-salmon-fat)');
  a += p('M105 81C135 61 165 50 185 56C191 58 190 62 184 62C161 58 132 70 109 86C103 90 99 86 105 81Z', '#fff0c9', 'opacity=".57"');
  a += p('M42 152C55 177 69 195 82 204C113 197 145 181 171 162C143 178 109 191 85 196C69 185 54 167 42 152Z', '#cf6d55', 'opacity=".14"');
  a += '</g>';
  a += l('M89 217C111 210 137 198 154 188M170 181Q193 165 204 147', '#bbd0bc', 1.3, .7);
  return doc('三文鱼', defs, a);
}

function oyster() {
  const outer = 'M33 170C22 164 23 151 29 144C19 134 23 122 33 117C26 105 33 93 45 90C44 76 55 69 67 71C72 57 83 54 96 59C106 47 119 47 128 55C140 44 153 49 159 58C172 50 185 58 187 69C201 67 213 77 211 89C225 94 229 107 220 117C231 129 225 144 214 150C218 166 206 177 192 177C188 193 174 198 163 192C153 207 139 211 125 205C114 218 100 216 91 208C77 216 63 211 60 199C45 201 35 191 39 181C34 179 31 175 33 170Z';
  const inner = 'M45 147C44 119 62 94 89 79C121 60 154 60 178 75C200 87 209 106 202 128C194 153 170 175 142 189C113 203 86 203 65 188C52 178 44 165 45 147Z';
  const defs = g('s15-oyster-shell', ['#d4d2b3', '#9fae9a', '#758e83'])
    + g('s15-oyster-inner', ['#fbefd0', '#ece6c7', '#c9d3bc'])
    + g('s15-oyster-flesh', ['#fff2d0', '#ead2a5', '#d3b480'])
    + g('s15-oyster-lobe', ['#f5e1b8', '#d4b07b'])
    + `<clipPath id="s15-oyster-clip">${p(inner, '#fff')}</clipPath>`;
  let a = p(outer, 'url(#s15-oyster-shell)');
  a += l('M36 135Q40 109 61 91M64 79Q80 69 93 70M138 60Q162 57 178 73M202 84Q213 99 211 111M211 139Q196 167 177 178M151 196Q131 203 111 200M67 198Q49 183 45 169', '#c5d0b9', 1.65, .8);
  a += l('M31 150 43 147M38 122 49 123M49 99 58 108M76 73 80 90M114 59 115 77M151 60 147 77M184 72 173 89M209 102 193 106M212 135 194 131M188 177 178 164M159 194 151 179M122 208 122 192M84 204 89 189M48 183 62 173', '#6f877b', 1.35, .65);
  a += p(inner, 'url(#s15-oyster-inner)', 'stroke="#7b8d7c" stroke-width="1.5"');
  a += '<g clip-path="url(#s15-oyster-clip)" stroke="none">';
  a += p('M54 158C49 137 60 108 83 91C111 71 149 67 176 81C143 68 111 84 88 106C64 128 64 157 76 182C66 177 57 168 54 158Z', '#fff7dc', 'opacity=".8"');
  a += p('M65 177C86 194 114 196 142 182C172 167 192 144 202 120C197 154 173 180 142 193C108 207 82 199 65 177Z', '#94ae9e', 'opacity=".25"');
  a += '</g>';
  a += p('M72 143C71 126 81 111 94 106C95 92 109 84 122 89C136 80 149 85 154 96C174 95 187 108 185 123C194 138 182 152 169 154C159 174 137 184 116 180C102 184 89 174 88 163C78 162 71 154 72 143Z', 'url(#s15-oyster-flesh)', 'stroke="#a88b62" stroke-width="1.7"');
  a += p('M94 108C104 102 120 104 133 110C143 114 154 111 164 106C165 120 153 128 139 129C123 131 110 124 104 131C97 140 107 153 124 155C144 160 164 148 178 137C171 157 150 172 129 172C111 172 98 162 96 149C86 138 85 123 94 108Z', 'url(#s15-oyster-lobe)', 'stroke="none"');
  a += l('M92 113C88 127 93 139 104 143M105 159C121 172 146 165 160 153M141 104Q151 106 160 101', '#bd996b', 1.45, .83);
  a += p('M100 100C106 94 115 94 120 97C124 100 121 103 117 103C111 101 107 104 104 107C100 111 96 105 100 100Z', '#fff9e3', 'stroke="none" opacity=".87"');
  a += l('M80 137Q78 145 83 150M131 176Q144 176 154 170M66 125Q62 135 63 144', '#fff9e5', 1.65, .8);
  return doc('生蚝', defs, a);
}

function conch() {
  const shell = 'M38 151C31 124 43 103 64 91C77 82 93 79 108 81C108 63 122 53 137 55C141 39 154 37 166 44C177 35 190 34 202 29C205 47 213 63 206 81C221 95 226 111 221 132C217 164 193 193 163 208C137 223 105 222 80 212C55 202 42 179 38 151Z';
  const aperture = 'M157 111C175 100 194 107 201 122C209 141 195 169 177 186C164 200 147 207 140 198C134 192 140 180 145 168C154 148 146 126 157 111Z';
  const defs = g('s15-conch-shell', ['#f6dba0', '#e9b676', '#ca8d64'])
    + g('s15-conch-whorl', ['#f5d79c', '#e5b47c', '#d79b6b'])
    + g('s15-conch-rim', ['#ffe4bd', '#edb69a', '#d4937d'])
    + g('s15-conch-mouth', ['#f5c3b0', '#df9a91', '#bd737d'])
    + `<clipPath id="s15-conch-clip">${p(shell, '#fff')}</clipPath>`;
  let a = p(shell, 'url(#s15-conch-shell)');
  a += '<g clip-path="url(#s15-conch-clip)" stroke="none">';
  a += p('M194 31C196 56 187 71 168 83C153 93 134 94 118 91C99 88 83 93 69 107C96 96 119 103 135 122C149 139 150 164 143 187C154 173 165 151 162 133C160 111 173 99 191 99C207 99 215 115 217 132C226 110 216 91 206 81C213 65 205 48 202 29Z', '#f9d8b1', 'opacity=".52"');
  a += p('M44 156C55 188 82 208 113 210C136 211 153 205 169 197C153 216 129 224 103 217C70 212 50 191 44 156Z', '#b97859', 'opacity=".18"');
  a += '</g>';
  a += l('M145 53C155 64 172 68 185 59M124 66C136 82 163 87 181 75M111 83C121 98 143 106 160 103', '#b9835e', 1.6, .75);
  a += l('M172 46Q182 53 193 47M130 65Q140 73 151 74', '#fff0c7', 1.6, .76);
  a += p('M143 129C132 105 107 95 83 103C61 110 52 128 57 148C62 172 85 187 107 182C127 178 137 160 131 144C126 129 111 121 97 126C85 130 81 141 86 150C90 158 101 161 109 156', 'none', 'stroke="#b57c54" stroke-width="2"');
  a += l('M139 121C124 102 100 99 81 110C65 119 62 137 68 151', '#fff0c6', 1.65, .83);
  a += l('M60 170Q67 184 83 192M81 201Q95 207 111 205M53 137Q51 149 56 159', '#be855d', 1.45, .57);
  a += p('M156 105C178 92 202 102 209 122C217 144 203 174 183 193C168 208 146 215 135 204C126 196 134 179 139 165C146 147 143 120 156 105Z', 'url(#s15-conch-rim)', 'stroke-width="2.2"');
  a += p(aperture, 'url(#s15-conch-mouth)', 'stroke="#a66f67" stroke-width="1.6"');
  a += p('M157 118C151 132 159 146 153 166C149 178 143 190 145 195C150 194 160 188 169 178C180 163 186 147 184 131C182 116 170 111 157 118Z', '#b87b81', 'stroke="none" opacity=".34"');
  a += l('M166 108C184 103 197 115 200 128M140 193Q138 204 149 204Q168 202 185 183', '#ffe7c6', 1.7, .9);
  a += l('M184 124C190 138 184 157 175 169', '#edb2a3', 1.5, .7);
  return doc('海螺', defs, a);
}

function mulberry() {
  const defs = g('s15-mulberry-rose', ['#ed9dc4', '#ca5d9e', '#984278'])
    + g('s15-mulberry-rose-face', ['#e98bb9', '#bf4c92', '#803a72'])
    + g('s15-mulberry-purple', ['#cca1dc', '#ae70c3', '#87509e'])
    + g('s15-mulberry-purple-face', ['#bf83d0', '#a969bd', '#9150ab'])
    + g('s15-mulberry-leaf', ['#c4d78a', '#92b564', '#71944d'])
    + g('s15-mulberry-stem', ['#bdc47a', '#839b53']);
  const outline = 'M-9-62C-2-70 9-67 13-61C23-64 31-57 30-47C39-43 40-33 35-26C43-18 42-8 36-2C42 6 40 17 33 22C37 31 32 41 24 44C25 55 18 61 10 62C4 71-8 70-13 63C-24 65-31 57-29 48C-39 43-40 32-34 25C-42 17-41 7-35 1C-42-8-40-18-34-24C-40-33-35-44-27-47C-28-57-19-64-9-62Z';
  const rows = [
    [-53, [-9, 9]],
    [-34, [-18, 2, 21]],
    [-13, [-22, -1, 21]],
    [9, [-22, -1, 20]],
    [30, [-18, 3, 20]],
    [49, [-9, 10]],
  ];
  const berry = (rose) => {
    const base = rose ? 'rose' : 'purple';
    let a = p(outline, `url(#s15-mulberry-${base})`);
    for (const [y, xs] of rows) {
      for (const [index, x] of xs.entries()) {
        a += e(x, y, 10.6 + (index % 2) * .5, 11.6, `url(#s15-mulberry-${base}-face)`, `stroke="${rose ? '#995179' : '#80558f'}" stroke-width="1.3"`);
      }
    }
    a += l('M-14-57Q-10-61-6-59M-24-17Q-21-22-16-21M-23 6Q-20 2-16 4M-12 45Q-9 41-5 43', rose ? '#ffd6df' : '#ead2ee', 1.6, .79);
    a += p('M-10-57Q-8-61-5-59Q-3-56-6-54Q-10-52-10-57Z', rose ? '#ffdde4' : '#f2deef', 'stroke="none" opacity=".6"');
    return a;
  };
  let a = p('M113 62C117 48 123 39 134 33C137 32 139 35 136 38C127 45 123 53 122 66Z', 'url(#s15-mulberry-stem)', 'stroke-width="1.5"');
  a += '<g transform="translate(95 114) rotate(31) scale(.9 .99)">' + berry(false) + '</g>';
  a += p('M188 107C193 94 199 84 209 79C212 77 214 80 211 83C202 90 199 100 196 112Z', 'url(#s15-mulberry-stem)', 'stroke-width="1.5"');
  a += p('M196 96C193 78 179 68 163 72C165 89 178 102 196 96Z', 'url(#s15-mulberry-leaf)', 'stroke-width="2.2"');
  a += l('M190 92Q179 80 168 77', '#71934c', 1.3, .8);
  a += '<g transform="translate(148 162) rotate(51) scale(.96 1.04)">' + berry(true) + '</g>';
  return doc('桑葚', defs, a);
}

export const seaMidCandidates = [
  { id: 'fresh-sea-6', name: '三文鱼', svg: salmon(), expectedOccupancy: .80, design: { silhouette: '一块顺肌肉方向渐收尖的厚鲜三文鱼柳，斜向宽肩与自然弧边形成完整切块', angle: '三分之四俯视，橙色大切面朝上，近侧露出一线厚肉与灰绿鱼皮', material: '活泼蜜橙鱼肉、四道宽奶油脂纹与薄灰绿鱼皮，反光柔软克制', identity: '宽弧形脂纹顺着橙色鱼柳弯折，避开圆鱼排与金枪鱼三角块轮廓', container: '透明底裸鱼柳，无盘、香草或冰块' }, reason: '独立绘制长弧形厚鱼柳，用几条清楚的奶油脂纹与薄皮侧面表现鲜嫩三文鱼；小图保留宽肩、收尖和厚度。' },
  { id: 'fresh-sea-7', name: '生蚝', svg: oyster(), expectedOccupancy: .80, design: { silhouette: '一枚向右上略收拢的不规则长卵形半蚝壳，外缘有宽缓错落褶口', angle: '斜向俯视单枚敞开半壳，蚝肉居中、下侧壳沿略厚', material: '灰绿石色外壳、奶白内壁与湿润浅金蚝肉，少量柔亮水润反光', identity: '不对称壳缘、深浅两层壳壁与自然起伏的软蚝肉，保持单半壳结构', container: '蚝肉置于自身一枚半壳内，透明底无盘和额外配件' }, reason: '独立重画不规则生蚝半壳，用灰绿褶口和奶油软肉建立身份；减少沟纹，使40px仍可读出壳壁与中央蚝肉。' },
  { id: 'fresh-sea-8', name: '海螺', svg: conch(), expectedOccupancy: .80, design: { silhouette: '饱满螺腹向右上旋起细长锥尖，右前方露出弯曲长椭圆螺口', angle: '三分之四侧视，左侧圆螺腹与右侧粉色螺口同时可见', material: '温金、杏粉与玫瑰贝壳渐变，少量浅螺肋，奶油色口沿包住柔粉内壁', identity: '平滑渐尖螺塔、绕壳螺旋与清楚粉色开口组成完整海螺特征', container: '透明底单枚完整螺壳，不加盘、沙或其他装饰' }, reason: '以独立螺腹、螺塔和粉色口部构图呈现温暖清楚的海螺；浅肋稀疏，螺塔轮廓连续收尖，避免尖刺与过密纹路。' },
];

export const mulberryCandidates = [{
  id: 'fresh-exotic-8', name: '桑葚', svg: mulberry(), expectedOccupancy: .80,
  design: { silhouette: '两枚侧斜细长桑葚错位相叠，等宽圆润果身由较大紧凑小核果组成', angle: '后方明紫果向右上斜，前方玫红果更低更横，两枚果子形成紧凑阶梯构图', material: '玫瑰红紫与明亮葡萄紫相映，圆润汁感核果配少量奶油粉亮面，一片鲜绿小叶', identity: '两根完整细长聚合果，每根果身维持窄长轮廓与紧凑小核果，区别散开的大葡萄串', container: '透明底两枚裸果，短绿柄与小叶收在上侧，无盘和装饰' },
  reason: '从轮廓、核果形状、果子角度和构图重新绘制桑葚，以活泼玫红与明紫代替深暗果团；每果仅保留十六枚较大圆润核果，40px下仍见细长聚合果身份与明亮色层。',
}];

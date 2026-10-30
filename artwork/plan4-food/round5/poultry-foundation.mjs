// Round 5 alternatives only; adoption, runtime names and original masters stay separate.
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const ellipse = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const stroke = (d, color, width = 1.5, opacity = 1) => path(d, 'none', `stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const linear = (id, colors) => `<linearGradient id="${id}" x1=".12" y1=".08" x2=".88" y2="1">${colors.map((color, i) => `<stop offset="${i / (colors.length - 1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const radial = (id, colors) => `<radialGradient id="${id}" cx=".28" cy=".2" r=".9">${colors.map((color, i) => `<stop offset="${i / (colors.length - 1)}" stop-color="${color}"/>`).join('')}</radialGradient>`;
const svg = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 禽类食材重设计</title><defs>${defs}</defs><g stroke="#3a2a23" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function quailEggs() {
  const shell = 'M0-45C-14-45-31-20-31 4C-32 27-19 40 0 40C20 40 33 26 31 4C29-20 14-45 0-45Z';
  const defs = radial('qe-shell', ['#fff8db', '#f4e9bf', '#dcc994']) + radial('qe-front', ['#fff7d6', '#f2e4b7', '#d4bd87']);
  const patterns = [
    [[-12,-26,5,3],[10,-13,5.5,4],[-16,4,5.3,3.9],[6,18,6.3,4.5],[17,5,2.9,2.3]],
    [[-11,-22,5,3.5],[13,-4,5.7,4.1],[-13,15,4,5],[7,28,5.7,3],[0,1,2.7,2]],
    [[-7,-28,5.5,3.4],[14,-11,4.1,5],[-15,1,6,4.5],[8,17,5.9,4.2],[-8,29,3,2.5]],
    [[-12,-20,5.4,4],[12,-7,6.4,4],[-15,14,4.3,4.1],[7,28,5.2,3.4],[0,8,3,2.2]],
  ];
  const transforms = ['translate(93 82) rotate(-16)', 'translate(157 85) rotate(23)', 'translate(77 157) rotate(-32)', 'translate(158 169) rotate(30)'];
  let art = '';
  for (const [i, transform] of transforms.entries()) {
    art += `<g transform="${transform}">` + path(shell, i > 1 ? 'url(#qe-front)' : 'url(#qe-shell)');
    for (const [j, [x, y, rx, ry]] of patterns[i].entries()) {
      const d = `M${x-rx} ${y}q${rx*.2} ${-ry*1.3} ${rx*1.05} ${-ry}q${rx*1.15} ${ry*.12} ${rx*.92} ${ry*1.14}q${-rx*.2} ${ry*1.1} ${-rx*1.3} ${ry*.72}q${-rx*.9} ${-ry*.04} ${-rx*.67} ${-ry*.86}Z`;
      art += path(d, j % 2 ? '#866344' : '#715037', 'stroke="none" opacity=".91"');
      if (j < 2) art += ellipse(x + rx + 3, y - 2, 1.1, 1.25, '#8d6e4a', 'stroke="none" opacity=".74"');
    }
    art += stroke('M-14-29C-23-19-26-9-25 0', '#fffdf0', 3.7, .82) + '</g>';
  }
  return svg('鹌鹑蛋', defs, art);
}

function gizzard() {
  const whole = 'M42 119C25 103 34 77 59 67C78 55 103 60 117 77C130 60 158 57 181 70C208 84 215 113 195 134C179 153 158 160 141 156C123 160 103 156 88 151C67 148 52 139 42 119Z';
  const cut = 'M95 163L144 143C166 137 194 148 205 163L211 183C198 204 174 214 151 207L110 198Z';
  const face = 'M100 161L145 145C165 140 189 149 202 164C191 181 172 191 153 187L110 177Z';
  const defs = radial('gz-muscle', ['#b47777', '#8e555c', '#653c48']) + linear('gz-side', ['#aa6667', '#7f454f', '#5f3542']) + linear('gz-face', ['#e3aaa0', '#ca8a86', '#ad6972']);
  let art = path(whole, 'url(#gz-muscle)');
  art += stroke('M113 80C107 101 111 128 132 150', '#633b47', 1.7, .88);
  art += path('M112 76C107 88 107 96 110 105C113 99 118 92 125 89C122 83 119 78 112 76Z', '#e5b6a8', 'stroke="#ab7c79" stroke-width="1.3"');
  art += stroke('M49 88C61 73 82 70 96 81M143 80C158 73 175 78 184 90', '#dab0a0', 3.6, .68);
  art += stroke('M51 116Q62 132 79 136M166 125Q185 115 186 104', '#b47d77', 1.45, .7);
  art += path(cut, 'url(#gz-side)') + path(face, 'url(#gz-face)', 'stroke="#965e64" stroke-width="1.55"');
  art += stroke('M121 158L137 171M139 152L155 181M155 151L174 177M173 155L186 170', '#b77779', 1.35, .84);
  art += stroke('M117 158L127 165M144 150L158 154M166 152L176 159', '#f4c9b4', 1.55, .78);
  art += stroke('M119 184C139 197 164 204 185 194', '#b77679', 1.5, .64);
  return svg('鸡胗', defs, art);
}

function foieGras() {
  const large = 'M35 146C30 132 37 117 50 103C67 85 91 68 116 66C138 64 156 74 167 90C174 101 175 113 184 122C190 128 201 132 205 140C214 155 204 171 187 177C166 187 144 179 126 176C103 183 80 181 62 172C49 166 40 156 35 146Z';
  const small = 'M127 169C142 155 162 146 181 149C200 151 218 165 225 176C225 189 212 199 195 204C175 211 153 204 138 194C128 187 123 177 127 169Z';
  const defs = radial('fg-large', ['#fff1be', '#f6dda4', '#e6bd80', '#ca9868']) + radial('fg-small', ['#ffedbd', '#f1cf96', '#d7a36f']) + linear('fg-edge', ['#e0b07a', '#bf8d61']);
  let art = path(large, 'url(#fg-edge)', 'transform="translate(0 5)" stroke-width="3"') + path(large, 'url(#fg-large)');
  art += path('M143 87C157 102 160 118 153 132C145 148 145 163 151 174', 'none', 'stroke="#b78b5d" stroke-width="1.55" opacity=".78"');
  art += stroke('M57 112C75 91 98 80 117 80', '#fff7d8', 3.7, .8);
  art += stroke('M48 146C62 164 81 170 99 168M173 126C183 133 188 139 190 146', '#eec88d', 1.5, .78);
  art += path(small, 'url(#fg-small)');
  art += stroke('M141 169C161 156 186 158 205 174', '#fff2c8', 3.2, .74);
  art += stroke('M145 190C163 202 188 203 208 190', '#c39365', 1.4, .64);
  return svg('鹅肝', defs, art);
}

function chickenBreast() {
  const main = 'M35 148C34 125 53 105 79 87C98 73 115 59 136 57C158 54 177 64 188 83C197 99 197 111 207 127C216 142 232 155 227 171C222 190 199 199 177 198C152 198 138 187 117 184C93 182 67 190 49 177C39 170 34 159 35 148Z';
  const defs = radial('cb-flesh', ['#ffebd6', '#f7cfb5', '#e5aa91', '#cf8e7a']) + linear('cb-side', ['#e6b39b', '#c68c79']) + `<clipPath id="cb-cut">${path(main, '#fff')}</clipPath>`;
  let art = path(main, 'url(#cb-side)', 'transform="translate(0 7)" stroke-width="3"') + path(main, 'url(#cb-flesh)');
  art += `<g clip-path="url(#cb-cut)" stroke="none">`;
  art += path('M168 61C179 96 170 125 175 151C178 170 191 185 214 190L239 156L195 56Z', '#c58a77', 'opacity=".14"');
  art += path('M57 132C84 112 109 103 126 85C133 79 139 71 139 63C159 68 169 80 172 94C148 110 128 123 102 137C85 145 72 154 58 165Z', '#ffe5cc', 'opacity=".52"');
  art += '</g>';
  art += stroke('M78 105C102 90 119 68 139 68', '#fff4df', 4.2, .84);
  art += stroke('M56 147C79 132 99 128 121 119C143 110 163 99 173 86M51 160C80 146 104 144 133 135C157 128 174 116 185 103M69 174C94 161 119 161 144 154C170 147 190 134 196 120', '#c98f7b', 1.45, .72);
  art += stroke('M68 148C86 139 105 138 119 132M104 158C127 154 148 146 162 140M164 164Q187 156 202 142', '#fff0d8', 1.55, .75);
  art += stroke('M167 183C182 191 202 189 211 180', '#dfaa92', 1.65, .8);
  return svg('鸡胸肉', defs, art);
}

export const poultryFoundationCandidates = [
  {id:'fresh-poultry-1', name:'鹌鹑蛋', svg:quailEggs(), reason:'以紧凑错落的四枚斑点鹌鹑蛋建立蛋品节点；区别此前大号双鸡蛋，用蛋形与壳斑同时识别。', design:{silhouette:'四枚小巧尖钝分明的鹌鹑蛋紧凑成簇，前后错落',angle:'略俯视，后排立放、前排斜放',material:'奶油浅黄蛋壳与不规则深褐壳斑，柔和漫反射',identity:'小号成簇蛋形与深褐斑点，区别纯色鸡蛋',container:'无盛器、无五官'}},
  {id:'fresh-poultry-2', name:'鸡胗', svg:gizzard(), reason:'重做整块双瓣与侧前薄切肌肉片，去掉上一稿金色圆芯；用紧实酒红肌肉和顺向切纹表达鸡胗。', design:{silhouette:'后方整块双瓣鸡胗，前方一处薄斜切面，轮廓紧凑不呈圆芯果形',angle:'三分之四略俯视，双瓣折缝与切面都可见',material:'酒红褐紧实肌肉、浅粉红切面和细薄结缔纹',identity:'双瓣中央折缝、厚肌肉边与浅切纹，不画金色圆芯',container:'无盛器或配菜'}},
  {id:'fresh-poultry-3', name:'鹅肝', svg:foieGras(), reason:'以浅金黄柔软大小肝叶建立新的内脏食材，裂隙与分叶表现顺软体积，避免像鸡胸肉或普通粉色肉片。', design:{silhouette:'横向大肝叶与右前小肝叶自然连接错叠，外形柔软不规则',angle:'三分之四略俯视，清楚看到大小肝叶与自然裂隙',material:'浅金奶油色肝面、柔和明暗和薄边厚度，反光克制',identity:'金黄色、大小分叶与自然肝叶裂，不以肌肉纤维表现',container:'裸食材，不加盘子'}},
  {id:'fresh-poultry-4', name:'鸡胸肉', svg:chickenBreast(), reason:'以横向宽三角胸肉全新构图重画，浅粉肉色与顺向长纤维构成肌肉特征；区别鹅肝的金黄色分叶。', design:{silhouette:'横向展开的宽三角胸肉，左下厚肩、上方圆肩与右端自然收边',angle:'三分之四略俯视，前下薄侧面交代厚度',material:'浅粉奶油肌肉、长向弧形纤维和小面积湿润高光',identity:'宽三角肌肉面与顺向长纤维，区别短内脏和金黄肝叶',container:'单块食材，无盘子和附加装饰'}},
];

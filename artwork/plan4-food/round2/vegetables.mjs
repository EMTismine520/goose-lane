// Round 2 candidates: original identities, hand-authored vector food shapes.
// The accepted 24-item sample masters are not inputs to this drawing module.
const ink = '#2b211c';
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (d, color, width = 1.5, opacity = 1) => path(d, 'none', `stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"`);
const ellipse = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const radial = (id, stops, cx = '.3', cy = '.2', r = '.85') => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`).join('')}</radialGradient>`;
const linear = (id, stops, x2 = '1', y2 = '1') => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 第二轮果蔬精修候选</title><defs>${defs}</defs>${body}</svg>`;

function bellPepper() {
  const shape = 'M120 77C104 57 78 62 65 79 49 101 54 139 58 169 61 197 65 219 87 222 98 224 102 220 107 218 118 231 137 229 149 217 163 225 180 214 187 196 200 162 202 124 195 99 190 77 173 65 158 69 151 70 146 73 143 77 137 67 128 67 120 77Z';
  const defs = radial('r2-pepper-skin', [['0', '#fff0a7'], ['.34', '#ffdb6e'], ['.7', '#f2bd42'], ['1', '#d99122']])
    + radial('r2-pepper-center', [['0', '#ffe991'], ['.4', '#ffd368'], ['.78', '#efb539'], ['1', '#d98b20']], '.24', '.17', '.95')
    + linear('r2-pepper-side', [['0', '#f8d163'], ['.5', '#eeb33e'], ['1', '#cf8422']])
    + linear('r2-pepper-stem', [['0', '#9cb763'], ['.45', '#71964f'], ['1', '#42633b']])
    + `<clipPath id="r2-pepper-clip">${path(shape, '#fff')}</clipPath>`;
  let body = ellipse(127, 226, 61, 5.2, '#715338', 'opacity=".065"');
  body += path(shape, 'url(#r2-pepper-skin)', `stroke="${ink}" stroke-width="3.1" stroke-linejoin="round"`);
  body += '<g clip-path="url(#r2-pepper-clip)">';
  body += path('M143 77C160 95 165 130 160 162 159 188 154 208 149 217 164 228 182 213 189 192 201 156 204 120 194 96 184 72 161 63 143 77Z', 'url(#r2-pepper-side)');
  body += path('M120 77C108 91 103 124 105 156 106 178 106 204 107 218 116 230 137 231 149 217 156 196 158 164 155 131 154 105 150 87 143 77 134 70 126 70 120 77Z', 'url(#r2-pepper-center)');
  body += path('M60 139C61 183 63 211 84 218 93 220 101 215 106 212L107 219C87 239 60 217 56 187Z', '#c17c23', 'opacity=".15"');
  body += line('M120 78C105 106 103 145 106 177 107 194 107 207 107 216', '#aa7229', 1.55, .75);
  body += line('M143 78C157 107 160 149 156 177 155 195 152 208 149 216', '#a36525', 1.55, .76);
  body += path('M73 95C76 82 85 79 91 83 84 96 82 111 82 126 78 135 70 130 70 122 69 112 70 104 73 95Z', '#fff5c8', 'opacity=".76"');
  body += line('M72 139Q71 154 75 166', '#fff1b5', 2.2, .77);
  body += path('M120 91C116 103 114 122 115 133 115 138 120 141 122 136 124 120 126 109 130 101 132 94 126 88 120 91Z', '#fff2b5', 'opacity=".45"');
  body += line('M167 91Q179 102 182 119', '#ffdf7a', 2.2, .55);
  body += line('M68 184Q73 208 88 212', '#ffe39a', 1.5, .58);
  body += '</g>';
  // The small green calyx follows the pepper shoulder; the curved stalk is its key silhouette.
  body += path('M119 73Q109 70 105 77L116 85 126 82Q137 88 146 80L139 73Q130 69 119 73Z', 'url(#r2-pepper-stem)', `stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"`);
  body += path('M123 79C123 66 116 56 119 44 121 33 128 26 135 25 141 25 146 30 144 34 132 38 130 46 133 56L137 76Q132 83 123 79Z', 'url(#r2-pepper-stem)', `stroke="${ink}" stroke-width="3" stroke-linejoin="round"`);
  body += line('M127 69C126 57 123 49 128 40', '#bdd08a', 1.5, .8);
  body += line('M125 75Q129 78 133 75', '#486a3f', 1.25, .65);
  return doc('彩椒', defs, body);
}

function pumpkin() {
  const shape = 'M125 94C114 84 100 84 88 92 69 84 45 92 37 109 20 119 17 143 25 160 24 182 44 201 66 208 86 219 110 223 132 220 157 223 178 215 195 207 219 199 234 180 232 159 240 137 229 117 213 109 204 91 181 85 161 93 147 85 135 86 125 94Z';
  const defs = radial('r2-pumpkin-skin', [['0', '#ffdf92'], ['.34', '#f8bf61'], ['.72', '#e99e3e'], ['1', '#bc6c2c']], '.28', '.2', '.9')
    + radial('r2-pumpkin-front', [['0', '#ffd682'], ['.4', '#f8b74f'], ['.8', '#e99b35'], ['1', '#cd782b']], '.25', '.22', '.95')
    + linear('r2-pumpkin-right', [['0', '#f7be5b'], ['.45', '#e5a046'], ['1', '#bb6b2b']])
    + linear('r2-pumpkin-left', [['0', '#ffe09a'], ['.45', '#f6bf65'], ['1', '#dc8e37']])
    + linear('r2-pumpkin-stalk', [['0', '#bdb076'], ['.4', '#8a8753'], ['1', '#666240']])
    + `<clipPath id="r2-pumpkin-clip">${path(shape, '#fff')}</clipPath>`;
  let body = ellipse(128, 224, 82, 5.3, '#705033', 'opacity=".065"');
  body += path(shape, 'url(#r2-pumpkin-skin)', `stroke="${ink}" stroke-width="3.1" stroke-linejoin="round"`);
  body += '<g clip-path="url(#r2-pumpkin-clip)">';
  body += path('M88 92C61 104 52 134 58 165 61 190 69 203 87 215 64 216 35 197 26 175 13 141 26 113 47 100 63 89 77 87 88 92Z', 'url(#r2-pumpkin-left)');
  body += path('M161 93C185 105 194 133 188 164 185 191 173 208 158 219 185 218 211 205 224 184 241 158 235 129 217 112 199 94 182 88 161 93Z', 'url(#r2-pumpkin-right)');
  body += path('M125 94C107 107 99 137 102 166 104 189 112 211 123 220 136 224 148 220 158 216 172 201 178 172 176 150 175 124 166 104 151 96 141 88 134 89 125 94Z', 'url(#r2-pumpkin-front)');
  body += path('M87 94C73 119 70 150 77 176 83 199 94 212 109 220L91 219C68 211 57 188 57 163 54 132 67 104 87 94Z', '#9f5b27', 'opacity=".09"');
  body += path('M126 99C111 128 110 161 115 187 119 204 124 216 129 222L116 221C103 205 98 181 98 160 97 132 105 106 126 99Z', '#ad6328', 'opacity=".13"');
  body += path('M157 98C173 125 175 161 166 187 161 203 154 215 147 222L160 220C176 208 187 180 186 154 186 129 175 107 157 98Z', '#a65c29', 'opacity=".14"');
  body += line('M88 94C64 120 62 151 72 179 78 196 88 209 100 215', '#ac6b2b', 1.5, .75);
  body += line('M124 99C105 127 106 165 113 190 116 201 120 211 126 216', '#ad6728', 1.55, .7);
  body += line('M154 98C179 127 179 164 167 191 163 202 157 211 150 217', '#a86229', 1.55, .72);
  body += line('M179 101C211 125 216 157 203 182 198 192 190 201 180 206', '#aa662b', 1.4, .65);
  body += path('M47 120C54 106 63 100 70 102 60 116 57 134 57 146 56 151 50 153 48 147 46 137 45 128 47 120Z', '#fff0bb', 'opacity=".76"');
  body += line('M47 160Q50 177 60 187', '#ffe6a6', 2.2, .75);
  body += path('M94 106C83 124 81 144 84 158 86 163 90 162 91 157 90 138 95 122 101 111 103 105 97 102 94 106Z', '#ffebad', 'opacity=".53"');
  body += line('M132 111C125 129 123 146 125 160', '#ffdb88', 2.6, .65);
  body += line('M148 196Q145 206 139 211', '#fdcb70', 1.8, .65);
  body += '</g>';
  body += ellipse(132, 97, 26, 8, '#80552b', 'opacity=".16"');
  body += path('M119 99C121 84 125 71 121 58L125 49 142 51 148 60C142 71 139 84 144 98Q133 106 119 99Z', 'url(#r2-pumpkin-stalk)', `stroke="${ink}" stroke-width="3" stroke-linejoin="round"`);
  body += path('M121 58 125 49 142 51 148 60 138 64Z', '#d0bc86', `stroke="${ink}" stroke-width="1.5" stroke-linejoin="round"`);
  body += line('M128 66Q130 82 126 96', '#d6c28b', 1.4, .8);
  body += line('M139 68Q135 83 139 96', '#565e3e', 1.5, .65);
  body += line('M129 55 139 57', '#9b8857', 1.2, .85);
  return doc('南瓜', defs, body);
}

export const vegetableCandidates = [
  {
    id: 'fresh-veg-3', name: '彩椒', svg: bellPepper(),
    reason: '原版与南瓜同为黄橙色竖瓣圆体；明确椒肩、弯曲鲜绿果柄、三瓣椒底，让40px剪影更易区分。',
    design: { silhouette: '立起的三瓣黄彩椒、收紧椒底与弯曲绿柄', angle: '三分之四近正面，略露椒肩', material: '饱满薄亮黄椒皮、柔和瓣面明暗与绿色纤维果柄', identity: '黄彩椒保持黄绿色身份，修清椒肩和三瓣结构，与扁宽木柄南瓜区别', container: '无' },
  },
  {
    id: 'fresh-veg-6', name: '南瓜', svg: pumpkin(),
    reason: '原版与彩椒的颜色和竖瓣轮廓接近；改为扁宽瓜体、粗短木质柄，以曲面瓜棱建立明确南瓜大形。',
    design: { silhouette: '扁宽饱满瓜体，粗短木质柄和五瓣曲面瓜棱', angle: '三分之四偏俯视，露出柄根', material: '哑光暖橙瓜皮、瓜棱柔和体积、木质切口与柄纹', identity: '保留整只橙黄南瓜，扁宽轮廓和木柄明确区别黄彩椒', container: '无' },
  },
];

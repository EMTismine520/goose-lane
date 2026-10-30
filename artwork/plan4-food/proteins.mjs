// Plan 4 food-art studies. Each silhouette and material is authored independently.
// Standalone editable SVGs; no production mappings are changed by this module.
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const ellipse = (x, y, rx, ry, fill, extra = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const stroke = (d, color, width = 1.4, extra = '') => path(d, 'none', `stroke="${color}" stroke-width="${width}" ${extra}`);
const linear = (id, colors, coords = 'x1="0" y1="0" x2=".8" y2="1"') => `<linearGradient id="${id}" ${coords}>${colors.map((color, i) => `<stop offset="${i / (colors.length - 1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const radial = (id, colors, coords = 'cx=".32" cy=".22" r=".86"') => `<radialGradient id="${id}" ${coords}>${colors.map((color, i) => `<stop offset="${i / (colors.length - 1)}" stop-color="${color}"/>`).join('')}</radialGradient>`;
const shadow = (x, y, rx, ry) => ellipse(x, y, rx, ry, '#6c402a', 'opacity=".035" stroke="none"') + ellipse(x, y - 1, rx * .84, ry * .70, '#6c402a', 'opacity=".055" stroke="none"') + ellipse(x, y - 2, rx * .64, ry * .43, '#6c402a', 'opacity=".055" stroke="none"');
const document = (name, prefix, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 食物美术样板</title><defs>${defs}</defs><g stroke="#79523e" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`.replace(/id="/g, `id="${prefix}-`).replace(/url\(#/g, `url(#${prefix}-`);

function porkBelly() {
  const defs = linear('skin', ['#fff2d8', '#f3c29b', '#d9957b']) + linear('cut', ['#ffe9d1', '#f7d6bc', '#e8b294']) + linear('lean', ['#f6aca0', '#e98d84', '#cb6a64']) + linear('side', ['#e3a28c', '#ca7e6d', '#a65950']) + radial('fat', ['#fff9e8', '#ffe9d2', '#edbda4']);
  let body = shadow(132, 211, 89, 12);
  body += path('M37 93 166 51 221 84v83L88 207 37 176Z', 'url(#side)');
  body += path('M88 124 221 84v83L88 207Z', 'url(#cut)');
  body += path('M88 137q30-8 53-18 22-5 42-9l38-13v17l-38 12q-25 9-48 11l-47 16Z', 'url(#lean)', 'stroke="none"');
  body += path('M88 165q25-8 50-14 24-10 42-12l41-13v21l-43 12q-22 4-41 12l-49 15Z', 'url(#lean)', 'stroke="none"');
  body += path('M88 190q26-7 50-16 26-6 43-12l40-12v17L88 207Z', '#dc8b7a', 'stroke="none"');
  body += stroke('m94 134 24-7m10-4 28-9m12-2 25-8m-99 58 25-8m15-3 31-11m15-2 25-8', '#ffe2cf', 2.5, 'opacity=".8"');
  body += stroke('m108 143 9-1m20-9 11-1m16-6 11-1m-76 49 11-1m17-9 9-1m17-4 10-4m19-6 14-3', '#bd605b', 1.15, 'opacity=".4"');
  body += path('M37 93 88 124v83l-51-31Z', 'url(#fat)');
  body += path('m37 108 20 11q15 8 31 19v17q-15-11-31-18l-20-12Z', 'url(#lean)', 'stroke="none"');
  body += path('m37 139 18 11q17 8 33 17v21q-17-10-34-18l-17-12Z', 'url(#lean)', 'stroke="none"');
  body += path('m37 167 18 10 33 14v16l-51-31Z', '#d78173', 'stroke="none"');
  body += stroke('m44 115 13 6m13 9 10 6m-36 17 9 5m16 8 12 5', '#ffdbc7', 2.3);
  body += path('M37 93q29-13 62-23l67-19q26 10 55 33L88 124Z', 'url(#skin)');
  body += path('M49 91q55-18 113-32l39 23-113 33Z', '#ffe6c7', 'opacity=".5" stroke="none"');
  body += stroke('M54 87q47-16 97-28', '#fff7df', 4.2, 'opacity=".9"');
  body += stroke('m93 124 123-36', '#be7b62', 1.3, 'opacity=".5"');
  body += stroke('M89 128v71', '#fff4de', 1.6, 'opacity=".9"');
  for (const [x, y, r] of [[83,83,1.1],[110,75,.9],[134,70,.9],[152,81,1.1],[171,73,.9],[185,83,.8],[112,96,.7],[137,88,.8],[71,94,.7],[94,100,.65]]) body += ellipse(x, y, r, r * .65, '#c99276', 'opacity=".45" stroke="none"');
  return document('五花肉', 'pork', defs, body);
}

function ribSteak() {
  const defs = radial('meat', ['#f7a09a', '#e97875', '#c54b51', '#963a40']) + linear('depth', ['#c76462', '#a23e45', '#7c3038']) + linear('fat', ['#fff7df', '#ffe3c7', '#e4b39a']) + radial('marble', ['#fff1d6', '#f2d2b6', '#c99478']);
  let body = shadow(130, 210, 88, 12);
  body += path('M57 76q13-21 43-20 23-18 50-5 13-4 31 12 22 23 19 49-1 24-21 42-6 31-44 43-34 13-65-6-26-10-30-38-17-28-4-51Z', 'url(#depth)', 'transform="translate(0 7)"');
  body += path('M57 69q13-21 43-20 23-18 50-5 13-4 31 12 22 23 19 49-1 24-21 42-6 31-44 43-34 13-65-6-26-10-30-38-17-28-4-51Z', 'url(#fat)');
  body += path('M65 72q16-17 40-15 22-16 43-4 18-1 33 19 16 22 9 46-3 20-23 34-7 23-36 32-29 9-55-8-23-11-25-35-13-24-3-45Z', 'url(#meat)', 'stroke="#b65a55" stroke-width="1.3"');
  body += path('M82 75q12-13 35-9 22 4 25 24 4 22-16 36-18 11-39 2-23-14-18-32Z', '#f29b92', 'opacity=".62" stroke="#efc1a9" stroke-width="2.1"');
  body += path('M85 82q22-13 40 5 11 13-2 27-15 12-32 1-14-13-6-33Z', '#d9696a', 'stroke="none" opacity=".5"');
  body += stroke('M65 133q24-10 43 6 20 16 41-8 13-14 27-10m-77 16q-5 21-24 22m65-16q10 16 1 31M73 83q-9 24-15 25m75-46q8 16 25 20 18 2 25 19', '#ffe1c7', 3.0, 'opacity=".83"');
  body += stroke('m82 91 9 10-3 14m24-36 3 13 11 7m-45 41 8 5-1 11m27-14 3 17m29-55 12-8 5 6m-43 73 8-9 10 1m-70-11-7 4', '#fff0d8', 1.5, 'opacity=".83"');
  body += stroke('M157 69q-2 19 7 39 11 21 8 38', '#b8494e', 1.8, 'opacity=".55"');
  body += path('M166 126q-2-7 4-13 8-5 13 3l7 23 16 24q4-10 12-7 8 5 1 13 10-1 11 6 0 11-14 10l-18-12-18-26Z', 'url(#fat)', 'stroke="#b38b6e" stroke-width="1.6"');
  body += path('M172 121q4 0 6 7l11 26 19 18', 'none', 'stroke="#fff9e6" stroke-width="4" opacity=".9"');
  body += stroke('m207 168 8 7m-38-42 8 16', '#cda588', 1.8, 'opacity=".7"');
  body += stroke('M63 76q13-17 35-17', '#fff2d7', 3.5, 'opacity=".75"');
  body += stroke('M48 139q3 24 22 35', '#ecb28f', 1.6, 'opacity=".55"');
  return document('带骨牛排', 'steak', defs, body);
}

function chickenBreast() {
  const defs = radial('back', ['#fff1d9', '#f5d1b0', '#e7ad90', '#cb8a75']) + radial('front', ['#fff0d9', '#f9d7ba', '#eeb89d', '#d38f7e']) + linear('edge', ['#edbea3', '#d49880', '#b87865']);
  let body = shadow(128, 211, 89, 12);
  body += path('M62 99q-7-35 23-49 27-14 51 0 13 10 23 14 22 9 35 38 5 16-9 25-24 18-61 9l-43-8q-23-6-19-29Z', 'url(#back)');
  body += path('M75 107q7-30 32-36 30-7 51 16 14 16 23 23', 'none', 'stroke="#fff4de" stroke-width="4" opacity=".68"');
  body += stroke('M91 58q12 10 18 29m8-29q8 11 12 25m12-16 14 24m-74 2q16 1 24 11m47-6 21 16', '#c88d79', 1.1, 'opacity=".4"');
  body += path('M37 157q4-26 31-39 25-26 53-17 34 3 62 31 21 14 35 37 9 15-7 26-20 13-43 9-33-2-61 4-29 3-48-15-24-13-22-36Z', 'url(#edge)', 'transform="translate(0 3)"');
  body += path('M37 151q4-26 31-39 25-26 53-17 34 3 62 31 21 14 35 37 9 15-7 26-20 13-43 9-33-2-61 4-29 3-48-15-24-13-22-36Z', 'url(#front)');
  body += path('M55 147q18-24 45-27 29-3 54 18 14 13 24 17-29-10-57-5-32 7-66-3Z', '#ffe9cc', 'opacity=".6" stroke="none"');
  body += stroke('M69 130q16-24 40-24', '#fff6e2', 4.2, 'opacity=".77"');
  body += stroke('M57 150q29-8 61-5 41 3 74 29m-143-7q27-12 67-7 39 5 71 22m-120-2q38-10 76 4m-58-68q7 7 17 10m13-2 19 14m-54-31 14 10m-52 28 18 4', '#d49984', 1.1, 'opacity=".52"');
  body += stroke('M78 148q17-6 37-3m18 9 14 5m-45 13 18-1m36 12 19 5', '#fff2dc', 1.4, 'opacity=".7"');
  body += path('M40 163q17 29 47 31 27 2 45-1 41-1 64-6', 'none', 'stroke="#c48a76" stroke-width="1.5" opacity=".5"');
  return document('鸡胸肉', 'breast', defs, body);
}

function chickenLeg() {
  const defs = radial('skin', ['#fff1d7', '#f9dbb6', '#eeba92', '#d19472']) + radial('muscle', ['#f7cba6', '#e8ac88', '#cc886a']) + linear('bone', ['#fff9e8', '#f2dfbd', '#ccad8c']);
  let body = shadow(128, 213, 85, 12);
  body += path('m78 161-26 27q-10-4-16 2-6 6 0 11-8 2-5 10 6 10 19 3 4 8 13 4 10-4 8-15l29-24Z', 'url(#bone)', 'stroke="#af8b6a" stroke-width="1.6"');
  body += stroke('M42 200q8 0 10 8m12-11 24-27', '#fffcec', 3.5, 'opacity=".9"');
  body += path('M78 170q-13-11-8-28 7-22 17-34-5-29 14-49 19-24 50-20 33 0 52 28 21 30 6 60-13 29-44 36-29 6-51 24-21 12-36-17Z', 'url(#muscle)', 'transform="translate(0 3)"');
  body += path('M78 164q-13-11-8-28 7-22 17-34-5-29 14-49 19-24 50-20 33 0 52 28 21 30 6 60-13 29-44 36-29 6-51 24-21 12-36-17Z', 'url(#skin)');
  body += path('M94 118q5-23 18-39 22-24 49-20 25 4 34 22-22-10-44 2-32 13-57 35Z', '#ffecd0', 'opacity=".65" stroke="none"');
  body += path('M82 136q26 5 42-5 20-12 45-11 27-2 39-18-6 30-36 42-38 10-60 31-18 14-30-11-8-17 0-28Z', '#dfa17e', 'opacity=".3" stroke="none"');
  body += stroke('M102 66q13-19 37-20', '#fff7e2', 4.4, 'opacity=".88"');
  body += stroke('M83 142q18 8 32 2m9-23q27 0 46-15m-22 41q15-5 25-17', '#be8669', 1.4, 'opacity=".56"');
  body += stroke('M104 158q14-18 32-21', '#fff1d6', 2.8, 'opacity=".65"');
  for (const [x, y, r] of [[126,69,.9],[147,60,1.1],[169,65,.8],[185,78,.9],[193,96,.9],[178,109,.8],[157,99,1],[140,85,.9],[119,97,1],[106,112,.8],[99,132,.8],[95,151,.9],[119,133,.8],[148,121,.8],[177,87,.8],[163,80,.7]]) {
    body += ellipse(x,y,r * 1.7,r,'#bd8d70','opacity=".28" stroke="none"');
    body += ellipse(x-.3,y-.65,r,.5,'#fff3d9','opacity=".7" stroke="none"');
  }
  return document('鸡腿', 'leg', defs, body);
}

function shrimp() {
  // Keep the original icon's left-upper head, right-upper fan and open C silhouette.
  // The shell is softly translucent rather than the previous study's hard coral armour.
  const defs = radial('shell', ['#fff2df', '#f1d2b5', '#e0b496', '#c38f77'], 'cx=".3" cy=".2" r=".87"')
    + linear('belly', ['#fff3df', '#f5dec3', '#d6b295'])
    + radial('head', ['#ffe9cf', '#e7c1a0', '#bf947d'])
    + linear('fan', ['#f8d8bd', '#e9b09a', '#c88778'])
    + linear('rim', ['#fbecd9', '#d3b3a0', '#b28d7d']);
  let body = shadow(130, 223, 79, 9);
  body += stroke('M73 82C46 56 23 55 20 68M72 89C46 70 21 71 20 85', '#b69b84', 1.45);
  body += stroke('M76 79C57 53 42 43 29 48', '#ccb39a', 1.1, 'opacity=".85"');
  body += path('M174 62C137 38 93 45 66 78 35 117 52 164 86 191 112 214 148 216 172 202L150 170C124 180 99 160 96 139 85 112 109 92 133 92L160 108Z', 'url(#shell)', 'stroke="#9c7b65" stroke-width="1.65"');
  body += path('M72 86C50 116 61 154 85 178 107 200 135 207 160 197L150 179C124 186 99 167 91 145 83 124 87 105 101 91Z', 'url(#belly)', 'stroke="none" opacity=".83"');
  body += path('M87 67C101 57 119 52 137 57 120 63 109 72 103 88 98 101 99 111 102 120 86 113 73 99 72 84Z', 'url(#head)', 'stroke="none" opacity=".72"');
  body += path('M153 57C142 53 134 52 124 54 112 59 102 66 97 77 111 65 127 64 145 70Z', '#fff4df', 'stroke="none" opacity=".47"');
  body += path('M60 109C53 137 65 163 86 181 109 200 134 205 160 197L165 203C138 217 110 209 87 195 58 175 43 140 54 113Z', '#bca497', 'stroke="none" opacity=".17"');
  body += path('M161 66C173 57 185 44 192 41 201 40 209 46 213 53 208 61 202 69 193 76 204 82 213 89 218 96 212 107 205 111 201 112 185 105 169 99 156 94Z', 'url(#fan)', 'stroke="#aa8877" stroke-width="1.4"');
  body += path('M165 70C180 62 190 49 193 47 199 47 204 49 207 53 198 63 187 73 175 79Z', '#ffe9d3', 'stroke="none" opacity=".56"');
  body += path('M175 82C188 83 204 91 211 97 207 102 204 105 200 106L162 92Z', '#efd0b9', 'stroke="none" opacity=".55"');
  body += stroke('M170 81C181 74 191 63 201 53M169 87C185 91 196 96 206 100', '#ba8d7c', 1.35, 'opacity=".65"');
  body += stroke('M57 116C67 116 81 123 93 127M58 146C71 145 85 144 97 148M72 175C85 170 98 165 109 165M96 196C104 184 111 178 122 177M129 210C129 196 133 187 141 180', '#af9582', 1.75, 'opacity=".7"');
  body += stroke('M59 120C70 121 81 126 91 129M61 150C73 149 86 148 96 152M77 178C88 173 99 169 108 169M102 197C108 186 114 182 121 181M135 207C135 197 138 190 144 184', '#fff5df', 2, 'opacity=".74"');
  body += stroke('M149 62C115 48 82 64 66 96 53 125 66 157 88 178', '#fff7e6', 3.2, 'opacity=".78"');
  body += stroke('M67 141Q68 157 80 167M104 196Q120 205 134 202', '#fff4df', 1.7, 'opacity=".66"');
  body += path('M64 80 50 73 63 91 73 97Z', 'url(#rim)', 'stroke="#ae9280" stroke-width="1.1"');
  body += stroke('M73 103Q81 108 89 108M83 179l-8 8m23 2-5 10m16-4-1 9', '#b49883', 1.25, 'opacity=".6"');
  for (const [x,y] of [[104,61],[125,60],[145,66],[71,101],[65,134],[79,160],[95,184],[116,196],[149,194]]) body += ellipse(x,y,.85,.6,'#ad9283','stroke="none" opacity=".26"');
  body += ellipse(77,81,2.5,2.8,'#68564a','stroke="none"') + ellipse(76.4,80.2,.8,.9,'#fff7e4','stroke="none"');
  return document('鲜虾', 'shrimp', defs, body);
}

function salmon() {
  const defs = linear('cut', ['#ffbd8b', '#f68c68', '#e56452', '#c64d47']) + radial('top', ['#ffd1a1', '#ffae7d', '#f47d5b', '#d95747']) + linear('skin', ['#acc6be', '#759e9a', '#446e72', '#344d5a']) + linear('edge', ['#f6c5a1', '#e79a78', '#cf6f5a']);
  let body = shadow(127, 210, 91, 12);
  body += path('M32 112q39-27 91-48 46-19 70 4l28 29-4 69q-18 16-42 22l-86 29-57-37Z', 'url(#edge)');
  body += path('M89 155 221 97l-4 69q-18 16-42 22l-86 29Z', 'url(#cut)');
  body += path('m89 197 87-30q28-9 42-22l-1 21q-18 16-42 22l-86 29Z', 'url(#skin)', 'stroke="#527777" stroke-width="1.3"');
  body += path('M32 112q39-27 91-48 46-19 70 4l28 29q-32 31-77 45l-55 20Z', 'url(#top)');
  body += path('M32 112 89 155v62l-57-37Z', 'url(#cut)');
  body += stroke('M52 101q11 29 51 44m-31-56q13 27 55 45m-32-57q14 26 54 45m-29-57q18 24 51 44m-26-52q17 19 46 40', '#ffe7c6', 5.2, 'opacity=".92"');
  body += stroke('M53 102q17 29 45 39m-24-50q15 26 49 40m-26-52q18 26 49 40m-24-52q16 24 46 40m-20-46 27 28', '#fff4d8', 1.5, 'opacity=".78"');
  body += stroke('m98 163 23-10m-23 23 30-12m8-20 27-13m-27 28 31-13m8-19 28-17m-28 31 29-16', '#ffe0ba', 3.3, 'opacity=".86"');
  body += stroke('m42 129 37 27m-37-13 37 27m-37-11 37 25m-37-10 37 24', '#ffd8b8', 3.5, 'opacity=".88"');
  body += stroke('m96 202 99-35', '#e3dfc4', 2.3, 'opacity=".75"');
  body += stroke('m103 206 3-3m12-2 3-4m12-2 3-4m12-2 3-4m12-2 3-4m12-2 3-4m12-3 3-4', '#a5bdb0', 1.3, 'opacity=".85"');
  body += stroke('M58 100q40-24 73-34', '#ffe8c4', 3.5, 'opacity=".62"');
  return document('三文鱼', 'salmon', defs, body);
}

function egg() {
  const defs = radial('shell', ['#fffdf0', '#fff1d9', '#f6dbb9', '#e5ba92', '#c9916f'], 'cx=".29" cy=".24" r=".86"') + radial('glow', ['#fffef4', '#fff7e5', '#f6ddbd']);
  let body = shadow(129, 219, 65, 10);
  body += path('M127 30c-25 0-46 30-62 61-15 30-27 66-10 95 14 25 45 33 74 32 34-1 62-14 73-42 11-30-3-64-20-94-16-29-33-52-55-52Z', 'url(#shell)', 'stroke="#b78b68" stroke-width="1.6"');
  body += path('M82 77q14-28 34-29 12 1 8 12-22 18-34 49-9 18-17 14-8-7 9-46Z', 'url(#glow)', 'opacity=".85" stroke="none"');
  body += path('M67 174q13 26 44 32 36 7 65-15', 'none', 'stroke="#e2b58e" stroke-width="2.2" opacity=".45"');
  const pores = [[121,73,1.1],[151,66,.8],[168,91,.7],[104,116,.8],[138,102,.6],[158,128,.8],[83,142,.7],[113,151,.75],[170,154,.6],[147,173,.7],[96,185,.65],[124,195,.75],[185,135,.75],[76,166,.6],[138,132,.6],[109,91,.55],[154,190,.55],[183,171,.5],[102,169,.55],[150,151,.55]];
  for (const [x, y, r] of pores) {
    body += ellipse(x,y,r * 1.3,r,'#c49a77','opacity=".32" stroke="none"');
    body += ellipse(x-.3,y-.8,r * .7,r * .5,'#fff9e7','opacity=".75" stroke="none"');
  }
  body += stroke('M89 72q9-14 16-18', '#fffdf0', 3.3, 'opacity=".7"');
  return document('鸡蛋', 'egg', defs, body);
}

function cheeseSlices() {
  const defs = linear('lower', ['#eab347', '#cd882f', '#ac6928']) + linear('middle', ['#ffdf73', '#efbd4c', '#da982f']) + radial('top', ['#fff0a5', '#ffde71', '#f4bf49', '#dc9430']) + linear('fold', ['#fff2b3', '#f0bf51', '#d89732']) + radial('hole', ['#d9952c', '#eeb34a', '#ffe18b']);
  let body = shadow(130, 210, 95, 12);
  body += path('m29 127 136-46 67 63-12 26-127 43-63-60Z', 'url(#lower)');
  body += path('m29 121 137-47 66 63-12 25-127 43-64-60Z', 'url(#middle)', 'stroke="#b98436" stroke-width="1.5"');
  body += path('m36 111 132-46 58 62-12 25-123 45-55-59Z', 'url(#middle)', 'stroke="#b98436" stroke-width="1.5"');
  body += path('m29 94 132-42 69 59q5 6-2 11l-119 51q-12 5-21-3L30 113q-9-10-1-19Z', 'url(#top)', 'stroke="#bf8a38" stroke-width="1.5"');
  body += path('m33 96 123-38 24 19q-33-4-71 11-36 13-56 27l-20-12Z', '#fff2ba', 'opacity=".45" stroke="none"');
  body += path('m187 97 43 14q5 6-2 11l-35 15q4-18-6-40Z', 'url(#fold)', 'stroke="#cb963e" stroke-width="1.3"');
  body += path('m191 102 24 15-20 13q2-14-4-28Z', '#ffe9a1', 'opacity=".75" stroke="none"');
  body += stroke('m42 97 92-30', '#fff5c1', 4.2, 'opacity=".85"');
  body += stroke('m47 132 46 39q6 5 11 3l68-28', '#fff0ab', 2.4, 'opacity=".72"');
  for (const [x,y,rx,ry,angle] of [[83,101,8.5,5.3,-21],[132,83,5.3,3.6,-21],[154,114,10,6,-21],[111,135,6.3,4.1,-21],[179,89,3.8,2.5,-21],[64,116,3.4,2.2,-21],[128,110,3,2,-21],[164,136,4,2.5,-21]]) {
    body += ellipse(x,y,rx,ry,'url(#hole)', `transform="rotate(${angle} ${x} ${y})" stroke="#e7b34d" stroke-width=".9"`);
    body += path(`M${x-rx*.7} ${y+ry*.4}q${rx*.8} ${ry*.8} ${rx*1.5} ${-ry*.4}`, 'none', 'stroke="#fff0a7" stroke-width="1.2" opacity=".8"');
  }
  body += stroke('m38 153 54 48 116-40m-113 27 116-43', '#c78b32', 1.2, 'opacity=".7"');
  return document('芝士片', 'cheese', defs, body);
}

function toast() {
  const defs = radial('crumb', ['#fff7df', '#ffe9b9', '#f3ce8e', '#dfac66']) + linear('crust', ['#ecbc74', '#cb8a43', '#a35e30', '#874827']) + linear('side', ['#d99d55', '#b97739', '#96502d']) + radial('pore', ['#c99a5d', '#dfb478', '#f5d69b']);
  let body = shadow(129, 214, 84, 11);
  body += path('M59 93q-23-13-9-35 10-18 35-13 17-18 42-7 21-15 45 0 30-5 35 21 10 22-10 38v105q-59 26-130 3Z', 'url(#side)');
  body += path('M49 89q-23-13-9-35 10-18 35-13 17-18 42-7 21-15 45 0 30-5 35 21 10 22-10 38v105q-59 26-130 3Z', 'url(#crust)');
  body += path('M60 86Q39 74 51 58q8-11 25-7 18-17 40-7 20-12 43 0 21-4 26 13 7 16-10 28v102q-55 20-115 2Z', 'url(#crumb)', 'stroke="#bb853e" stroke-width="1.2"');
  body += path('M61 84q-15-16-4-23 13-8 25-1 13-17 33-7 23-12 40 0 17-4 24 10-15-8-26-1-24-10-37 1-24-11-35 1-14-2-20 20Z', '#fff3d0', 'stroke="none" opacity=".65"');
  body += stroke('M51 59q9-15 27-9m7-7q16-12 30-2m13-1q18-8 32 4', '#ffe5a7', 3.6, 'opacity=".65"');
  const pores = [[79,81,4,2.7,-15],[114,70,3,2,17],[153,78,5,3.5,-20],[66,108,3,2,20],[96,106,5.5,3.9,-18],[131,98,3.8,2.7,20],[160,111,3.3,2.2,-15],[79,131,4.4,3,12],[117,127,6.6,4.4,-20],[150,141,4.5,3.2,15],[94,155,3.3,2.3,-25],[69,167,3.5,2.1,10],[129,163,4.2,2.8,-20],[162,174,3.4,2.1,5],[109,185,3,1.9,-10],[80,186,3.7,2.2,20],[140,187,3.2,2,-10]];
  for(const [x,y,rx,ry,angle] of pores) body += ellipse(x,y,rx,ry,'url(#pore)', `stroke="none" transform="rotate(${angle} ${x} ${y})"`) + stroke(`M${x-rx*.8} ${y+ry*.3}q${rx*.8} ${ry*.9} ${rx*1.5} 0`, '#fff0c7', .9, 'opacity=".8"');
  body += stroke('m69 94 3-2m38-12 2 1m35 8 3-2m-57 48 2 1m37 12 3-1m-52 22 2 1m44-1 2 1m30-15 2 1', '#d4ad73', 1.2, 'opacity=".7"');
  body += stroke('M61 193q55 16 108-1', '#ffe7b6', 2.1, 'opacity=".75"');
  body += stroke('M190 97v100', '#f5c77e', 1.5, 'opacity=".65"');
  return document('吐司', 'toast', defs, body);
}

export const proteinSamples = [
  { name: '五花肉', group: '肉禽', design: { silhouette: '有厚度的长方肉块，三分之四斜切面', angle: '偏俯视三分之四，长切面朝右', material: '乳白脂肪与粉红肌肉分层、细孔皮面', identity: '连续肥瘦条带跨越两个切面，明显区别禽肉', container: '无' }, svg: porkBelly() },
  { name: '带骨牛排', group: '肉禽', design: { silhouette: '不规则厚实肋眼与外伸骨节', angle: '偏俯视三分之四', material: '红肉肌理、细脂肪纹、厚脂边与哑光骨', identity: '深红肉面、乳白大理石纹和右下骨柄', container: '无' }, svg: ribSteak() },
  { name: '鸡胸肉', group: '肉禽', design: { silhouette: '前后错叠的柔软去骨胸肉', angle: '偏俯视三分之四', material: '浅粉肉质、顺肌肉走向的细纤维与柔和反光', identity: '无骨、无皮、浅色肉质和收尖胸肉结构', container: '无' }, svg: chickenBreast() },
  { name: '鸡腿', group: '肉禽', design: { silhouette: '丰满腿肉与斜向外伸的细骨柄', angle: '偏俯视三分之四，骨柄朝左下', material: '浅桃色禽皮、细皮孔、骨节与肌肉柔软过渡', identity: '团状腿肉与短骨头，区别深红带骨牛排', container: '无' }, svg: chickenLeg() },
  { name: '鲜虾', group: '海鲜', design: { silhouette: '沿原版的开放C形，左上头须、右上展开尾扇', angle: '偏俯视三分之四，保留原版头尾方向', material: '温润浅桃色半透明生虾壳、柔软腹肉与细腻壳节反光', identity: '原版弯曲负形与尾扇比例，柔和体积而非硬甲片', container: '无' }, svg: shrimp() },
  { name: '三文鱼', group: '海鲜', design: { silhouette: '厚切斜面鱼柳，底缘保留银蓝鱼皮', angle: '偏俯视三分之四，横切面朝前', material: '鲜橙鱼肉、宽细变化的脂肪纹与银蓝鱼皮', identity: '橙肉乳白V形肌间纹与深蓝皮缘', container: '无' }, svg: salmon() },
  { name: '鸡蛋', group: '乳品谷物', design: { silhouette: '上窄下宽的完整不对称蛋形', angle: '微俯视，正面完整展示', material: '奶油色哑光蛋壳、柔和体积光与细微孔点', identity: '不增加切开或煮熟含义，完整蛋壳保持原物品身份', container: '无' }, svg: egg() },
  { name: '芝士片', group: '乳品谷物', design: { silhouette: '错叠薄方片与轻折卷角', angle: '偏俯视三分之四', material: '金黄柔软奶酪、柔亮片面、浅凹气孔与薄切边', identity: '强调薄片和柔性折角，区别整块奶酪', container: '无' }, svg: cheeseSlices() },
  { name: '吐司', group: '乳品谷物', design: { silhouette: '有厚度的圆顶切片与四周烘焙外壳', angle: '微俯视三分之四，切面朝前', material: '蓬松乳白面包组织、不规则气孔和金棕外壳', identity: '烘焙圆顶、完整切面与较厚软芯', container: '无' }, svg: toast() },
];

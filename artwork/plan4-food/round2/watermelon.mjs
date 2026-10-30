// F06 refinement only. The original single curved slice and its identity stay intact.
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (d, color, width = 1.4, extra = '') => path(d, 'none', `stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}`);
const ink = '#332a23';
const skin = 'M26 80Q121 62 231 75C219 151 180 196 127 209 76 222 41 169 26 80Z';
const pith = 'M39 80Q126 67 218 77C207 144 172 183 126 195 82 205 53 159 39 80Z';
const flesh = 'M51 82Q130 72 206 79C195 135 164 169 124 180 89 190 65 151 51 82Z';
const seed = (x,y,angle=0,scale=1) => `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">${path('M0-6C3.7-1 4.2 3.3 1.2 6.2-1.1 8.3-4.4 5-3.8 1.6-3.3-1.9-1.3-4.7 0-6Z','#50392f')}${line('M-.9-2.4Q-2.1 1.1-1.1 3','#bc8c6c',.8,'opacity=".7"')}</g>`;

function watermelon() {
  const defs = `<linearGradient id="w3-skin" x1=".16" y1=".1" x2=".83" y2="1"><stop stop-color="#a6c976"/><stop offset=".43" stop-color="#719f55"/><stop offset="1" stop-color="#3f7146"/></linearGradient>
<linearGradient id="w3-pith" x1=".18" y1="0" x2=".73" y2="1"><stop stop-color="#fff5d5"/><stop offset=".58" stop-color="#f5eac7"/><stop offset="1" stop-color="#cbd49a"/></linearGradient>
<radialGradient id="w3-flesh" cx=".3" cy=".18" r=".98"><stop stop-color="#ffb39b"/><stop offset=".29" stop-color="#f88d7a"/><stop offset=".71" stop-color="#e66b60"/><stop offset="1" stop-color="#c2514d"/></radialGradient>
<linearGradient id="w3-moisture" x1=".1" y1="0" x2=".82" y2="1"><stop stop-color="#ffd4b4" stop-opacity=".26"/><stop offset="1" stop-color="#ffd4b4" stop-opacity="0"/></linearGradient>
<clipPath id="w3-flesh-clip">${path(flesh,'#fff')}</clipPath><clipPath id="w3-rind-clip">${path(skin,'#fff')}</clipPath>`;
  let body = '';
  body += path(skin,'url(#w3-skin)',`stroke="${ink}" stroke-width="3.1" stroke-linejoin="round"`);
  body += `<g clip-path="url(#w3-rind-clip)">`;
  body += path('M43 135C57 177 83 204 113 207 157 211 198 174 219 132L237 155 182 221 102 229 52 197Z','#38643f','opacity=".2"');
  body += line('M51 151C70 194 98 214 130 204 170 194 194 170 208 141','#a4c37a',2.3,'opacity=".63"');
  body += '</g>';
  body += path(pith,'url(#w3-pith)','stroke="#67764d" stroke-width="1.5" stroke-linejoin="round"');
  body += path(flesh,'url(#w3-flesh)','stroke="#9b594a" stroke-width="1.4" stroke-linejoin="round"');
  body += `<g clip-path="url(#w3-flesh-clip)">`;
  // Broad facets and a small edge highlight keep the wet flesh readable at board scale.
  body += path('M61 89Q118 78 180 83C156 88 125 93 98 109 85 115 75 115 66 108Z','url(#w3-moisture)');
  body += path('M180 85C169 133 145 165 115 181 158 184 191 155 210 110L211 80Z','#b84e49','opacity=".065"');
  body += line('M61 91Q80 86 93 86','#ffe2c5',2.7,'opacity=".66"');
  body += line('M70 133Q76 150 87 158','#ffc6aa',1.65,'opacity=".48"');
  body += seed(82,105,-21,.91) + seed(119,94,-5,.91) + seed(157,105,16,.91) + seed(107,143,-13,.93) + seed(143,147,16,.92);
  body += '</g>';
  // A single light seam conveys the rind's thickness without a second dark contour.
  body += line('M64 158C79 184 99 195 122 190','#fffae4',1.8,'opacity=".7"');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>西瓜 · F06精修候选</title><defs>${defs}</defs>${body}</svg>`;
}

export const watermelonCandidates = [{
  id:'fresh-fruit-6',
  name:'西瓜',
  svg:watermelon(),
  reason:'保留原版单块弧形瓜片；整理红瓤、浅白瓜皮与绿色外皮的层次，补充柔和曲面和五颗清楚瓜籽，小图保持干净轮廓。',
  design:{
    silhouette:'保留原版宽弧顶边、圆弧瓜底与单块瓜片构图，主体完整、重心稳定',
    angle:'沿原版近正面略俯视，红瓤切面朝前，显露青白瓜皮与绿色外皮',
    material:'暖红多汁果肉以大块柔和光影表现；青白瓜皮略透亮，外皮深绿，瓜籽以少量深色水滴形呈现',
    identity:'红瓤、浅白皮、绿壳三层清楚分开，五颗瓜籽，保持西瓜片的一眼辨识',
    container:'无盛器，无新增整瓜、第二片或装饰'
  }
}];

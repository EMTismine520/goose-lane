// Round 2 candidate only: the accepted art and runtime mapping are untouched.
const ink = '#403328';
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const stroke = (d, fill, width = 1.5, extra = '') => path(d, 'none', `stroke="${fill}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}`);
const gradient = (id, stops, radial = false) => radial
  ? `<radialGradient id="${id}" cx=".28" cy=".19" r=".94">${stops.map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`).join('')}</radialGradient>`
  : `<linearGradient id="${id}" x1=".12" y1="0" x2=".82" y2="1">${stops.map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`).join('')}</linearGradient>`;

function pineapple() {
  const fruit = 'M92 110C110 102 146 102 163 112 181 124 187 147 186 174 185 199 173 218 151 226 129 234 102 230 85 217 70 205 65 184 68 160 70 137 76 120 92 110Z';
  const defs = gradient('p2-gold', [['0','#fff0aa'],['.27','#f6d46d'],['.65','#eabb50'],['1','#bb8739']], true)
    + gradient('p2-leaf', [['0','#b7ce7a'],['.43','#80a45c'],['1','#477747']])
    + gradient('p2-leaf-back', [['0','#9fbd6c'],['.52','#6d9753'],['1','#3f6a43']])
    + gradient('p2-eye', [['0','#f8dc81'],['.42','#edc365'],['1','#d5a34a']])
    + `<clipPath id="p2-fruit-clip">${path(fruit,'#fff')}</clipPath>`;
  let body = '<ellipse cx="129" cy="232" rx="56" ry="6" fill="#766345" opacity=".09"/>';
  const leaves = [
    ['M119 118C94 109 72 86 62 61 83 71 106 88 126 111Z', 'p2-leaf-back', 'M75 75Q97 91 119 114'],
    ['M126 117C107 91 99 53 106 28 121 46 133 79 137 115Z', 'p2-leaf-back', 'M110 43Q117 77 130 109'],
    ['M134 118C130 80 138 46 155 29 158 55 150 93 144 121Z', 'p2-leaf', 'M150 43Q139 79 139 112'],
    ['M141 119C157 93 179 74 200 64 190 91 174 111 151 125Z', 'p2-leaf-back', 'M186 77Q164 99 148 118'],
    ['M141 124C159 109 179 104 194 105 183 120 162 132 142 134Z', 'p2-leaf', 'M180 111Q159 122 146 127'],
  ];
  for (const [d, fill, vein] of leaves) body += path(d,`url(#${fill})`,`stroke="${ink}" stroke-width="3.05" stroke-linejoin="round"`) + stroke(vein,'#c0d184',1.3,'opacity=".72"');
  body += path(fruit,'url(#p2-gold)',`stroke="${ink}" stroke-width="3.15" stroke-linejoin="round"`);
  body += '<g clip-path="url(#p2-fruit-clip)">';
  body += path('M162 111C180 137 179 180 167 202 158 219 143 226 123 232 165 240 190 215 196 184L191 125Z','#bd8d3c','opacity=".2"');
  body += path('M83 138C85 124 97 116 111 114 99 126 94 144 92 165 90 178 78 174 79 161Z','#fff5bf','opacity=".43"');
  // Large rounded scales give the fruit volume without a dense crosshatch at 40px.
  const rows = [
    [126, [99,127,155], 11.5, 12],
    [147, [85,113,141,168], 12.2, 13.1],
    [170, [83,112,141,170], 12.5, 13.7],
    [193, [91,120,149,175], 12.2, 13],
    [214, [105,133,159], 11.6, 11.3],
  ];
  for (let row=0; row<rows.length; row++) {
    const [cy, xs, rx, ry] = rows[row];
    for (let column=0; column<xs.length; column++) {
      const cx=xs[column], side=(cx-128)/65, bend=side*2.1, x=(cx+side*1.1).toFixed(2);
      const d=`M${x} ${cy-ry}Q${cx+rx*.71} ${cy-ry*.42} ${cx+rx} ${cy+bend}Q${cx+rx*.54} ${cy+ry*.7} ${x} ${cy+ry}Q${cx-rx*.68} ${cy+ry*.46} ${cx-rx} ${cy+bend}Q${cx-rx*.53} ${cy-ry*.7} ${x} ${cy-ry}Z`;
      body += path(d,'url(#p2-eye)','stroke="#c79a46" stroke-width="1.35" opacity=".82"');
      body += stroke(`M${cx-rx*.64} ${cy-1}Q${cx-rx*.38} ${cy-ry*.6} ${cx-1} ${cy-ry*.75}`,'#fff0ab',1.5,'opacity=".8"');
      body += path(`M${cx-3.9} ${cy+1}Q${cx} ${cy-3.1} ${cx+4} ${cy+1}L${cx+.5} ${cy+5}Z`,'#b4873d','opacity=".78"');
      body += stroke(`M${cx-2} ${cy+1}Q${cx} ${cy-.2} ${cx+2} ${cy+1}`,'#7f673b',1.3,'opacity=".68"');
      body += path(`M${cx-1.5} ${cy+4.1}L${cx+.4} ${cy+3} ${cx+2} ${cy+4.1}Z`,'#ffe5a0','opacity=".83"');
    }
  }
  body += stroke('M74 185Q77 206 94 217','#f8dc88',2.1,'opacity=".64"') + '</g>';
  // The crown's front leaves sit over the fruit shoulder, with fewer dark seams.
  const front = [
    ['M127 124C108 124 88 113 78 95 97 99 114 108 132 121Z','p2-leaf','M89 103Q107 114 124 120'],
    ['M134 125C139 101 151 81 167 69 165 93 157 115 143 129Z','p2-leaf','M159 83Q148 107 139 122'],
    ['M124 124C117 107 117 86 125 65 136 83 140 108 137 129Z','p2-leaf','M126 80Q126 103 131 121'],
  ];
  for (const [d, fill, vein] of front) body += path(d,`url(#${fill})`,`stroke="${ink}" stroke-width="3.05" stroke-linejoin="round"`) + stroke(vein,'#cadb92',1.4,'opacity=".72"');
  body += stroke('M102 112Q113 108 121 109','#fff0ae',1.4,'opacity=".68"');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>菠萝 · Plan 4 第二轮候选</title><defs>${defs}</defs>${body}</svg>`;
}

export const pineappleCandidates = [{
  id:'fresh-fruit-5', name:'菠萝', svg:pineapple(),
  reason:'原版果身与叶冠较平直；保留金黄果身、绿冠单体，整理叶片前后层叠，增加果身曲面与疏密有序的果眼。',
  design:{
    silhouette:'圆润略收腰的金黄果体，舒展层叠绿冠，保留单体菠萝大形',
    angle:'三分之四近正面，略见冠根，前后叶片互相遮挡',
    material:'温暖金黄色果皮、低密度圆角鳞片与凹陷果眼；绿叶以折面和柔和反光表现',
    identity:'金黄菱格果体与尖长绿冠，食材不加五官',
    container:'无',
  },
}];

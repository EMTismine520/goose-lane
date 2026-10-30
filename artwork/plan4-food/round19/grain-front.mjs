// Round 19: three independently drawn grain candidates, editable 256px masters.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour = '#a88762', width = 1.4, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours) => `<linearGradient id="${id}" x1=".12" y1="0" x2=".82" y2="1">${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 谷物独立候选</title><defs>${defs}</defs><g stroke="#594438" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function rice() {
  const defs = gradient('g19-rice-wood', ['#e5bf84', '#cca16b', '#b28352'])
    + gradient('g19-rice-rim', ['#f2d5a5', '#dfb778'])
    + gradient('g19-rice-grain', ['#fffdf1', '#f1ead4', '#ddd4b8']);
  let art = p('M48 125C52 153 69 179 100 186C117 190 144 190 161 185C190 177 204 153 207 125Z', 'url(#g19-rice-wood)');
  art += e(128, 123, 80, 28, 'url(#g19-rice-rim)');
  art += e(128, 120, 68, 20, '#e4d6b4', 'stroke-width="1.4"');
  art += p('M63 119C72 108 82 98 99 94C111 84 130 84 142 90C160 91 174 101 181 110C188 111 194 116 194 122C165 138 94 141 63 119Z', '#eee8d2', 'stroke="#ab9d7a" stroke-width="1.4"');
  const grains = [
    [83,112,11,4.5,-31],[102,101,12,4.3,19],[125,96,11.5,4.3,-8],[149,102,12,4.3,30],[171,115,11.5,4.2,31],
    [74,124,10.5,4.1,16],[99,120,12.5,4.5,-22],[123,112,12,4.4,35],[147,120,12.5,4.5,-15],[175,127,10,4,10],
    [113,130,11.5,4.2,8],[138,132,11,4.2,-32],[160,131,10,4,-12],
  ];
  for (const [x,y,rx,ry,angle] of grains) {
    art += e(x,y,rx,ry,'url(#g19-rice-grain)',`stroke="#ad9f7e" stroke-width="1.35" transform="rotate(${angle} ${x} ${y})"`);
  }
  art += line('M60 145C67 162 81 174 97 178', '#f7dfb0', 2.3, .9);
  art += line('M111 179C129 181 146 180 159 176', '#926c45', 1.35, .55);
  art += line('M70 155L76 164M189 149L185 158', '#9d744b', 1.4, .55);
  return doc('大米', defs, `<g transform="rotate(-5 128 128)">${art}</g>`);
}

function oats() {
  const defs = gradient('g19-oat-flake', ['#f8e2ad', '#e8c47f', '#cda264'])
    + gradient('g19-oat-back', ['#e4be78', '#c59652'])
    + gradient('g19-oat-ear', ['#f5d996', '#d5ad65']);
  const flake = (x,y,angle,s=1,back=false) => `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${s})">${p('M-21-2C-17-12-6-17 6-14C17-13 25-6 24 2C23 10 11 16-1 15C-13 15-24 9-21-2Z', `url(#${back?'g19-oat-back':'g19-oat-flake'})`, 'stroke-width="2.2"')}${line('M-12 3C-3-2 6-4 15-2','#b68e52',1.3,.8)}${line('M-11-5C-5-10 3-11 8-8','#fff0c2',1.8,.8)}</g>`;
  let art = line('M154 159C165 134 176 100 180 66', '#987643', 2.3);
  art += line('M173 105L198 83M168 123L192 105M161 141L182 129', '#b49455', 1.45);
  const ears = [[177,77,-21],[191,85,28],[172,98,-25],[187,106,30],[165,119,-27],[178,130,32]];
  for(const [x,y,a]of ears) {
    art += p('M0-11C8-8 12 1 8 11C0 12-8 6-8-1C-8-7-3-10 0-11Z','url(#g19-oat-ear)',`stroke-width="1.8" transform="translate(${x} ${y}) rotate(${a})"`);
  }
  art += flake(84,145,-27,1.08,true);
  art += flake(121,137,14,1.13,true);
  art += flake(152,156,-30,.95,true);
  art += flake(70,167,18,1.05);
  art += flake(108,168,-14,1.18);
  art += flake(143,181,18,1.08);
  art += flake(93,192,-22,.99);
  art += flake(130,153,44,.86);
  return doc('燕麦', defs, `<g transform="rotate(-6 128 128)">${art}</g>`);
}

function flour() {
  const defs = gradient('g19-flour-bag', ['#efd4ac', '#e0bd8b', '#cda171'])
    + gradient('g19-flour-side', ['#dbb184', '#bd8c5e'])
    + gradient('g19-flour-white', ['#fffdf0', '#f3ebd8', '#ded2b8']);
  let art = p('M70 83L62 69L74 58C98 66 128 64 151 55L164 68L154 85C165 114 177 152 170 182C149 198 98 203 65 187C58 164 61 117 70 83Z', 'url(#g19-flour-bag)');
  art += p('M149 81L161 72C157 93 172 132 172 161L169 181C161 188 151 191 140 194C147 170 151 147 145 122Z', 'url(#g19-flour-side)', 'stroke="none"');
  art += e(112,77,43,16,'#b4946d','stroke-width="1.7"');
  art += p('M76 74C81 62 94 60 104 61C115 53 129 55 137 63C146 63 152 69 153 77C133 87 100 89 76 74Z', 'url(#g19-flour-white)', 'stroke="#a69274" stroke-width="1.6"');
  art += p('M66 75C87 87 132 92 158 76L154 91C133 102 89 98 70 87Z', '#f3dbb3', 'stroke-width="1.6"');
  art += line('M75 103C68 126 68 158 73 175', '#fae8c9', 2.4, .92);
  art += line('M142 107C149 130 151 158 145 177', '#b68a60', 1.4, .58);
  art += line('M88 182C100 186 119 187 131 184', '#b68a60', 1.35, .55);
  art += p('M135 195C142 189 145 177 154 175C161 163 176 160 185 171C195 171 201 179 204 185C213 186 219 190 219 196C200 206 159 208 135 200C132 199 132 197 135 195Z', 'url(#g19-flour-white)', 'stroke-width="2.5"');
  art += p('M150 190C157 177 167 173 178 176C184 177 183 181 177 181C167 179 159 185 156 191C153 195 148 194 150 190Z', '#fffef5', 'stroke="none"');
  art += line('M190 190C195 191 200 193 202 196', '#c8bca0', 1.3, .65);
  return doc('面粉', defs, `<g transform="rotate(-4 128 128)">${art}</g>`);
}

export const grainFrontCandidates = [
  {id:'fresh-grain-1',name:'大米',svg:rice(),expectedOccupancy:.66,design:{silhouette:'低矮浅木量碗中一小堆细长白色生米，碗身圆润而不高耸',angle:'轻微俯视，横宽碗口露出疏朗细长米粒',material:'温暖浅木色与乳白生米，米粒略带象牙色边缘，清楚细描边',identity:'长而窄的独立生米粒，不画熟饭蓬松团、蒸汽或高耸饭堆',container:'小浅木量碗承托，留白充足，一级体量克制'},reason:'独立绘制低矮木量碗与清楚的细长生米，避免熟米饭造型；白米与木色形成温暖分层，一级保持约66%体量。'},
  {id:'fresh-grain-2',name:'燕麦',svg:oats(),expectedOccupancy:.70,design:{silhouette:'八枚厚薄自然的金褐燕麦片紧凑成堆，后方一小枝短燕麦穗',angle:'微俯视，燕麦片交错轻叠，短穗从右后方斜起',material:'浅金黄至烘麦褐的扁圆片，少量自然折线与柔亮面',identity:'宽扁麦片和少量垂落长穗，区别细白生米与粉末',container:'裸麦片组合，无碗无盘，二级控制小体量'},reason:'用扁圆金褐麦片与一小穗建立燕麦身份，简化谷粒数量与内部纹理，透明底紧凑构图在40px仍有明确轮廓。'},
  {id:'fresh-grain-3',name:'面粉',svg:flour(),expectedOccupancy:.68,design:{silhouette:'柔软开口纸袋里露出白面粉，右前方一小堆细粉形成低矮前景',angle:'三分之四俯视，袋口可见，粉堆与袋身轻叠',material:'暖麦色纸袋、奶油白细粉，以大块柔和色阶表现粉质',identity:'自然折口纸袋和无颗粒粉堆，区别木量碗生米与裸燕麦片',container:'无文字的柔软纸袋，纸折与侧边克制，三级保持小巧'},reason:'重新绘制软折口纸袋和一小堆奶白面粉，利用袋形与粉末大面区分米粒、麦片，减少装饰并保持约68%体量。'},
];

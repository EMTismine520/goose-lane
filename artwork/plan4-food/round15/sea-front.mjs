// Independent review candidates only. No selected art or runtime mapping is changed.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, color, width = 1.45, opacity = 1) => p(d, 'none', `stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colors, coords = 'x1=".15" y1="0" x2=".8" y2="1"') => `<linearGradient id="${id}" ${coords}>${colors.map((c, i) => `<stop offset="${i / (colors.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 海鲜独立候选</title><defs>${defs}</defs><g stroke="#57443d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function shrimp() {
  const body = 'M165 79C161 65 148 59 132 60C104 60 80 75 66 99C50 126 56 156 78 177C100 199 133 204 163 192L154 170C134 179 112 175 99 160C86 145 86 125 97 109C107 94 127 91 144 100L160 92Z';
  const defs = gradient('s15-shrimp-shell', ['#fff0d3', '#f7c69f', '#e89479'])
    + gradient('s15-shrimp-tail', ['#facaa9', '#ea9b82', '#d47f70'])
    + `<clipPath id="s15-shrimp-clip">${p(body, '#fff')}</clipPath>`;
  let art = p('M154 172C170 168 183 176 188 187C197 184 205 188 208 194L191 210C177 208 166 202 159 193Z', 'url(#s15-shrimp-tail)');
  art += line('M162 181Q177 187 191 202M176 181Q183 187 186 192', '#b87965', 1.4, .8);
  art += p(body, 'url(#s15-shrimp-shell)');
  art += '<g clip-path="url(#s15-shrimp-clip)" stroke="none">';
  art += p('M61 127C64 152 82 171 102 180C122 189 143 189 160 181L166 198L133 212L83 194L50 158Z', '#d98f76', 'opacity=".22"');
  art += p('M83 98C93 84 107 76 118 74C124 73 126 78 120 80C108 84 96 92 89 102C85 108 79 105 83 98Z', '#fff5e1', 'opacity=".78"');
  art += '</g>';
  art += line('M113 63C111 73 114 85 122 94M88 76C86 86 90 99 100 106M69 96C69 108 76 120 88 125M58 124C66 134 76 139 88 138M64 153C76 156 88 154 96 149M84 182C96 179 104 171 108 167M113 196C123 189 127 182 128 177', '#b78069', 1.55, .85);
  art += p('M144 65C154 65 165 67 174 72L162 81C157 91 150 97 144 100C148 88 148 77 144 65Z', '#f4c29f', 'stroke-width="1.6"');
  art += e(158, 75.5, 2.55, 2.6, '#554239', 'stroke="none"');
  art += line('M169 71C181 53 195 48 210 49M169 77C185 64 200 63 218 68', '#9d7861', 1.5);
  art += line('M160 90Q166 95 166 102', '#bb866e', 1.35);
  return doc('鲜虾', defs, `<g transform="translate(-3.84 -3.84) scale(1.03)">${art}</g>`);
}

function squid() {
  const mantle = 'M128 39C114 51 102 71 99 93C95 113 100 132 112 145C120 153 139 153 147 145C160 132 165 113 161 93C157 71 143 50 128 39Z';
  const defs = gradient('s15-squid-mantle', ['#fff3dc', '#f5d3c7', '#dda5aa'])
    + gradient('s15-squid-fin', ['#f6d9cb', '#e8b4b5'])
    + gradient('s15-squid-arms', ['#f5d1c4', '#dca1a6']);
  let art = p('M101 76C89 85 81 100 77 116C85 115 94 112 101 107Z', 'url(#s15-squid-fin)');
  art += p('M157 75C171 86 179 101 181 116C172 115 164 112 158 107Z', 'url(#s15-squid-fin)');
  art += p('M114 143C106 159 91 171 84 184C79 195 83 204 90 205C98 204 100 195 104 187L123 160L119 150Z', 'url(#s15-squid-arms)');
  art += p('M120 149C113 168 111 187 118 200C123 207 130 207 134 200C137 194 134 190 130 190C125 190 126 180 129 166L132 151Z', 'url(#s15-squid-arms)');
  art += p('M134 151C135 168 143 185 153 194C159 199 168 197 169 190C169 185 163 183 159 180C151 172 148 161 147 149Z', 'url(#s15-squid-arms)');
  art += p('M140 149C151 156 164 168 172 181C178 192 178 203 171 209C166 214 160 210 161 205C163 199 162 195 159 190C151 177 142 171 134 163Z', 'url(#s15-squid-arms)');
  art += p('M112 138C116 135 141 135 148 139L148 150C139 157 121 156 112 149Z', '#f1c5bd', 'stroke-width="1.6"');
  art += p(mantle, 'url(#s15-squid-mantle)');
  art += p('M116 68C107 83 104 99 107 112C108 117 112 117 113 112C112 98 115 83 121 72C123 67 119 64 116 68Z', '#fff7e7', 'stroke="none" opacity=".78"');
  art += line('M150 90C154 107 151 124 143 136', '#c58d98', 1.4, .55);
  art += line('M118 145Q129 149 141 145', '#bd8792', 1.35, .7);
  return doc('鱿鱼', defs, `<g transform="translate(-3.2 -3.2) scale(1.025)"><g transform="rotate(15 128 128)">${art}</g></g>`);
}

function cod() {
  const top = 'M46 125C62 112 84 104 100 91C110 83 115 74 127 73C143 71 153 79 165 88C182 101 200 102 213 108C220 111 220 116 214 121C196 134 176 146 158 160C138 176 114 182 90 178C68 175 51 164 46 148C43 140 41 131 46 125Z';
  const defs = gradient('s15-cod-flesh', ['#fffbed', '#f9f1dc', '#e6dfca'])
    + gradient('s15-cod-skin', ['#b6c8c8', '#8babad', '#749093']);
  let art = p('M45 138C49 155 73 166 95 166C135 169 180 144 216 114L214 131C195 148 176 163 156 177C136 191 111 195 88 191C66 187 49 175 45 158C43 150 42 143 45 138Z', 'url(#s15-cod-skin)');
  art += line('M61 177C82 188 110 191 136 181', '#d3dfd9', 1.5, .68);
  art += p(top, 'url(#s15-cod-flesh)');
  art += p('M55 128C74 116 91 108 107 96C112 92 116 95 111 100C97 113 76 121 61 132C56 136 51 132 55 128Z', '#fffdf3', 'stroke="none" opacity=".88"');
  art += line('M80 113C91 120 100 132 102 145M110 91C120 100 132 116 136 134M142 81C152 92 159 106 161 121', '#c4bba5', 1.45, .73);
  art += line('M84 127Q92 136 93 143M116 107Q125 120 127 129M148 95Q154 106 155 113', '#fffdf2', 1.6, .9);
  art += line('M67 158C88 169 115 167 139 158', '#d5cbb5', 1.35, .66);
  return doc('鳕鱼', defs, `<g transform="translate(3.2 3.2) scale(.975)">${art}</g>`);
}

function catfish() {
  const body = 'M73 113C94 94 122 86 151 88C177 88 198 101 205 119C213 138 204 157 188 167C169 180 144 177 121 168C102 161 86 152 73 145Z';
  const defs = gradient('s15-catfish-back', ['#a6b4ae', '#80928e', '#697d7c'])
    + gradient('s15-catfish-fin', ['#b8aa8e', '#8f907f'])
    + gradient('s15-catfish-belly', ['#ece0bd', '#d3c7a4'])
    + `<clipPath id="s15-catfish-clip">${p(body, '#fff')}</clipPath>`;
  let art = p('M80 117C66 116 51 105 41 96C42 110 46 121 49 130C44 141 40 153 39 166C54 158 68 149 81 143Z', 'url(#s15-catfish-fin)');
  art += line('M48 108Q58 120 66 126M47 154Q57 145 66 139', '#707d71', 1.35, .7);
  art += p('M105 99C113 87 126 78 138 77C142 85 150 90 159 93Z', 'url(#s15-catfish-fin)');
  art += p(body, 'url(#s15-catfish-back)');
  art += '<g clip-path="url(#s15-catfish-clip)" stroke="none">';
  art += p('M79 139C105 145 134 156 160 155C179 155 195 145 207 132L212 159L178 185L126 180Z', 'url(#s15-catfish-belly)');
  art += p('M95 110C118 96 140 95 154 98C160 99 160 104 153 104C131 102 115 107 101 115C95 118 90 114 95 110Z', '#c9d1ba', 'opacity=".59"');
  art += '</g>';
  art += p('M137 146C130 153 129 164 135 170C146 167 154 159 155 151Z', 'url(#s15-catfish-fin)', 'stroke-width="1.6"');
  art += line('M141 152Q138 161 137 165', '#87917e', 1.25, .6);
  art += line('M177 113C171 126 173 139 180 147', '#596f6c', 1.55, .72);
  art += e(190, 117, 2.65, 2.75, '#3f4944', 'stroke="none"');
  art += e(189.3, 116.3, .7, .75, '#e8e5cb', 'stroke="none"');
  art += line('M200 140Q205 142 208 140', '#5c6456', 1.45);
  art += line('M206 141C214 144 218 151 217 159M201 146C209 153 209 165 205 172', '#776e58', 1.5);
  return doc('鲶鱼', defs, art);
}

function tuna() {
  const face = 'M58 125C72 118 91 119 106 126C113 134 119 141 124 151C131 165 125 180 112 186L80 191C63 190 48 178 45 162C43 151 49 134 58 125Z';
  const defs = gradient('s15-tuna-loin', ['#d87174', '#b74356', '#943548'])
    + gradient('s15-tuna-face', ['#ea8d88', '#d26172', '#b3415a'])
    + `<clipPath id="s15-tuna-face-clip">${p(face, '#fff')}</clipPath>`;
  let art = p('M58 125C88 107 119 86 151 76C167 71 181 74 194 84C203 91 209 99 217 107C220 111 219 115 214 119L112 186L108 133Z', 'url(#s15-tuna-loin)');
  art += p('M86 122C110 104 138 87 160 82C173 79 187 85 194 92C177 86 164 90 146 97L105 135Z', '#ed9a8f', 'stroke="none" opacity=".29"');
  art += line('M126 137C147 122 169 107 191 100M132 150C155 134 175 120 199 109', '#7f2f46', 1.4, .45);
  art += p(face, 'url(#s15-tuna-face)');
  art += '<g clip-path="url(#s15-tuna-face-clip)" stroke="none">';
  art += p('M53 147C58 135 72 128 86 130C93 131 93 136 87 136C73 134 63 142 59 152C57 158 50 153 53 147Z', '#f2b3a3', 'opacity=".66"');
  art += p('M58 173C75 182 95 183 115 174L130 176L107 197L72 195Z', '#9c3753', 'opacity=".22"');
  art += '</g>';
  art += line('M67 140C75 145 82 152 85 162M60 154C68 157 73 164 75 170M88 137C98 146 105 155 107 164', '#efb6a7', 1.5, .8);
  art += line('M91 174Q97 171 100 166', '#efb6a7', 1.25, .75);
  return doc('金枪鱼', defs, art);
}

export const seaFrontCandidates = [
  { id: 'fresh-sea-1', name: '鲜虾', svg: shrimp(), expectedOccupancy: .66, design: { silhouette: '一只饱满的弯 C 形鲜虾，弧形虾身与短扇尾形成完整大形', angle: '侧面微俯视，虾头朝右上，尾扇向右下舒展', material: '浅珊瑚、奶杏与暖琥珀的柔和虾壳，少量清楚分节与一处奶色亮面', identity: 'C 形虾身、短扇尾、单枚自然小眼和两条短须；没有密脚或虫状细节', container: '透明底单只裸虾，保持一级小体量，无盘无装饰' }, reason: '独立重画肥厚 C 形虾身和短扇尾，以柔和奶杏珊瑚色与稀疏分节提高小图辨识度；此前已选鲜虾仍原样保留。' },
  { id: 'fresh-sea-2', name: '鱿鱼', svg: squid(), expectedOccupancy: .72, design: { silhouette: '尖顶饱满的奶粉色胴体，两枚小三角侧鳍与四条短粗弯腕', angle: '整只略向右倾，胴体在上，短腕在下自然分开', material: '奶油白到柔粉的平滑湿润肉感，浅粉鳍和克制亮面', identity: '完整圆锥胴体、三角侧鳍及少量短腕，避免细长面条状触手', container: '透明底单只裸鱿鱼，二级体量克制，无盘无装饰' }, reason: '用全新奶粉胴体和短粗腕形建立鱿鱼身份，减少杂乱细触手，让 40px 仍能看见完整主体与侧鳍。' },
  { id: 'fresh-sea-3', name: '鳕鱼', svg: cod(), expectedOccupancy: .68, design: { silhouette: '自然渐收的厚白鱼柳，弧边柔软不规则，底侧露窄灰蓝鱼皮', angle: '三分之四俯视，一端略厚宽，另一端自然收尖', material: '奶白细嫩鱼肉，浅蓝灰皮边，三道稀疏肉瓣细沟', identity: '厚实白鱼肉加灰蓝皮边，避免硬几何方块与粉橙鱼肉', container: '透明底单块裸鱼柳，三级小体量，无盘无配料' }, reason: '全新自然鱼柳轮廓代替盒状切块，使用厚奶白肉层和窄灰蓝皮边，借少量弯曲肉瓣沟表现鳕鱼。' },
  { id: 'fresh-sea-4', name: '鲶鱼', svg: catfish(), expectedOccupancy: .70, design: { silhouette: '短胖完整鱼身、宽钝鱼头、低背鳍与展开短尾，一对细短触须', angle: '单侧横向微俯视，头朝右，尾朝左', material: '柔蓝灰与暖灰褐鱼背、奶油色鱼腹，表皮平滑少纹', identity: '宽扁头、单枚自然小眼和一对鱼须，保持真实鱼体结构，无人脸表情', container: '透明底单条整鱼，四级小体量，无盘无装饰' }, reason: '独立绘制短胖整条鲶鱼，以宽头、双短须和奶油腹部建立种类特征，避免拟人面孔和浓密须线。' },
  { id: 'fresh-sea-5', name: '金枪鱼', svg: tuna(), expectedOccupancy: .70, design: { silhouette: '一块自然渐收的红色鱼柳，前方只有一个清楚圆润切面', angle: '三分之四侧俯视，切面朝左前，鱼柳向右后延伸', material: '深红与柔莓红鱼肉，切面稍亮，几笔细小浅色肉纹', identity: '红色鱼肉和单个切面，区别三文鱼橙色条纹及鳕鱼白肉', container: '透明底单块裸鱼柳，五级小体量，无盘无装饰' }, reason: '全新圆润红鱼柳与单切面构图，保留金枪鱼的红肉身份，以少量细浅肌理让小图仍清楚饱满。' },
];

// Round 17 independent dairy candidates. Selected artwork and runtime data stay separate.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.45, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient = (id, colours, coordinates = 'x1=".15" y1="0" x2=".85" y2="1"') => `<linearGradient id="${id}" ${coordinates}>${colours.map((c, i) => `<stop offset="${i / (colours.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc = (name, defs, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 乳品独立候选</title><defs>${defs}</defs><g stroke="#59463c" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function milkBottle() {
  const bottle = 'M108 59L149 59L149 82C151 91 166 98 171 110C176 123 174 148 175 171L175 197C175 210 165 217 152 219C134 222 107 220 94 216C84 213 79 205 79 195L79 130C79 112 83 104 94 95C102 89 108 85 108 77Z';
  const defs = gradient('m17-milk-glass', ['#f5fff9', '#deeddf', '#b5cfcb'])
    + gradient('m17-milk-white', ['#fffdf0', '#f9f4dd', '#e9e4ce'])
    + gradient('m17-milk-cap', ['#abd4df', '#78b3c8', '#5390ae'])
    + `<clipPath id="m17-milk-clip">${p(bottle, '#fff')}</clipPath>`;
  let art = p(bottle, 'url(#m17-milk-glass)');
  art += '<g clip-path="url(#m17-milk-clip)" stroke="none">';
  art += p('M83 112C106 116 142 114 170 112L180 132L181 211L157 225L98 225L73 210L73 134Z', 'url(#m17-milk-white)');
  art += p('M157 116C164 139 164 178 158 203C155 213 160 214 171 207L181 188L179 120Z', '#d7dfce', 'opacity=".6"');
  art += p('M94 115C92 132 91 164 92 184C92 190 98 191 99 184L100 122C100 116 97 113 94 115Z', '#fffef5', 'opacity=".94"');
  art += '</g>';
  art += line('M87 112C107 116 145 116 166 111', '#b5c6b8', 1.5, .86);
  art += line('M87 197C88 207 98 210 108 211M144 214Q160 214 165 205', '#a1bbb2', 1.4, .72);
  art += p('M115 70L116 82C117 88 113 91 108 94C104 96 106 100 111 98C123 93 124 85 123 71Z', '#ffffff', 'stroke="none" opacity=".74"');
  art += p('M103 47C103 42 109 39 115 39L145 39C152 39 157 42 157 47L157 65C150 70 111 70 103 65Z', 'url(#m17-milk-cap)');
  art += e(130, 46, 27, 7, '#bbdce3', 'stroke-width="1.6"');
  art += line('M109 53L109 63M119 55L119 65M129 56L129 65M140 55L140 65M151 52L151 62', '#548c9f', 1.35, .8);
  art += line('M112 44Q125 40 141 43', '#e8f8ed', 2.1, .9);
  return doc('纯牛奶', defs, `<g transform="rotate(8 128 128)">${art}</g>`);
}

function butter() {
  const defs = gradient('m17-butter-top', ['#fff3ad', '#ffdf7c', '#eac561'])
    + gradient('m17-butter-front', ['#f6d578', '#ebbd58', '#d7a54a'])
    + gradient('m17-butter-side', ['#f8dc8a', '#e7bb59'])
    + gradient('m17-butter-slice', ['#fff2ad', '#f5d57f', '#e5b95c'])
    + gradient('m17-butter-paper', ['#fffbed', '#eee1c7', '#d7c7a8']);
  let art = p('M53 141L81 131L172 119L205 143L204 162L178 179L87 188L48 172Z', 'url(#m17-butter-paper)');
  art += p('M53 141L78 153L81 178L48 172L40 153Z', '#fbf2da', 'stroke-width="1.6"');
  art += p('M178 145L207 139L219 159L204 178L180 174Z', '#f8ebce', 'stroke-width="1.6"');
  art += line('M49 151L65 160L66 172M208 148L199 162L188 165M94 180L160 171', '#bbae91', 1.35, .72);
  art += p('M70 101L111 79C115 77 120 77 126 78L184 88C190 89 194 93 194 99L194 143C194 148 190 151 185 152L118 164L69 146Z', 'url(#m17-butter-front)');
  art += p('M123 107L190 93C193 94 194 98 194 102L194 142C194 147 191 150 185 152L121 164Z', 'url(#m17-butter-side)', 'stroke-width="1.6"');
  art += p('M70 100C69 95 74 92 79 90L110 77C116 75 121 76 128 77L185 87C191 88 194 92 190 95L126 114C120 115 114 114 109 112L76 106C73 105 71 103 70 100Z', 'url(#m17-butter-top)');
  art += p('M83 95L113 82C119 80 123 81 130 82L169 89C175 90 173 94 167 94L124 89C119 88 117 88 113 90L89 100C84 102 79 98 83 95Z', '#fff7c9', 'stroke="none" opacity=".85"');
  art += line('M129 122L181 108M132 151L179 141', '#fce6a0', 1.6, .67);
  art += p('M67 139L102 128C106 126 110 127 112 131L126 158C128 162 125 166 121 168L87 181C82 183 78 181 76 177L63 149C61 145 63 141 67 139Z', 'url(#m17-butter-slice)');
  art += p('M67 141L74 141L90 175L87 181C82 183 78 181 76 177L63 149C61 145 63 142 67 141Z', '#deb15b', 'stroke-width="1.4"');
  art += line('M78 143L100 136M91 172L116 162', '#fff8c9', 1.7, .95);
  return doc('黄油', defs, art);
}

function cheeseSlices() {
  const defs = gradient('m17-cheese-under', ['#f4ca64', '#e7b353', '#d99a42'])
    + gradient('m17-cheese-top', ['#ffeb9b', '#f9d477', '#edb856'])
    + gradient('m17-cheese-fold', ['#fff2b1', '#e6b859']);
  let art = p('M54 103L153 80C159 79 163 81 166 86L203 154C206 160 203 164 198 166L101 192C95 193 91 191 89 187L51 113C49 109 50 105 54 103Z', 'url(#m17-cheese-under)');
  art += line('M61 115L97 183L190 158', '#ffe292', 1.5, .76);
  art += p('M64 75L163 61C170 60 175 64 177 70L197 139C199 145 196 149 190 151L92 174C86 175 81 172 79 166L59 86C58 81 59 77 64 75Z', 'url(#m17-cheese-top)');
  art += p('M68 81L160 68C167 67 171 71 172 77L174 83C147 78 111 88 79 91C72 92 68 88 68 81Z', '#fff4bc', 'stroke="none" opacity=".79"');
  art += e(104, 104, 12, 8.5, '#d6a44b', 'transform="rotate(-12 104 104)" stroke="#a67836" stroke-width="1.45"');
  art += p('M94 101C100 97 108 96 114 100C110 100 105 101 101 104C97 107 93 105 94 101Z', '#bd8c41', 'stroke="none" opacity=".68"');
  art += e(154, 113, 9.5, 7, '#d4a04b', 'transform="rotate(-12 154 113)" stroke="#a67836" stroke-width="1.45"');
  art += e(120, 144, 8.5, 6.2, '#d6a44b', 'transform="rotate(-12 120 144)" stroke="#a67836" stroke-width="1.45"');
  art += line('M96 112Q102 116 110 111M148 120Q153 122 158 119M115 150L123 150', '#fff0a4', 1.4, .88);
  art += p('M175 120C178 126 183 130 191 132L197 139C199 145 196 149 190 151L168 156C177 146 179 135 175 120Z', 'url(#m17-cheese-fold)', 'stroke-width="1.6"');
  art += line('M184 136Q183 145 176 151', '#c7994a', 1.35, .8);
  art += line('M75 111L86 154M95 162L105 160', '#fff1b2', 1.6, .83);
  return doc('芝士片', defs, `<g transform="rotate(-5 128 128)">${art}</g>`);
}

export const milkFrontCandidates = [
  {
    id: 'fresh-milk-1', name: '纯牛奶', svg: milkBottle(), expectedOccupancy: .66,
    design: { silhouette: '短颈圆肩玻璃奶瓶，蓝盖、平滑白奶与圆润瓶底形成完整纵向轮廓', angle: '略向右倾的正面微俯视，可见蓝盖椭圆顶和瓶底厚度', material: '奶油白牛奶、浅青玻璃边与柔蓝瓶盖，少量细长柔亮面', identity: '小奶瓶装满不透明乳白牛奶，明显区别清水瓶；不借文字标签识别', container: '单只短颈奶瓶，无盘、无文字品牌、透明背景' },
    reason: '独立绘制蓝盖玻璃奶瓶，以圆肩瓶形和不透明乳白奶建立一级身份，保持小巧轻盈。',
  },
  {
    id: 'fresh-milk-2', name: '黄油', svg: butter(), expectedOccupancy: .70,
    design: { silhouette: '一块柔角奶黄黄油配前侧单片切片，纸托折角收在底部', angle: '三分之四俯视，可见完整黄油顶面和前侧厚度，切片斜靠前方', material: '奶黄到金黄的柔滑乳脂，极简奶油色折纸托，块面与切面各有少量亮面', identity: '实心无孔黄油块与一道自然切片，区别多孔薄芝士片和奶酪楔', container: '只保留包黄油的极简折纸托，无盘、无标签装饰' },
    reason: '新画柔角黄油块与单片切面，用低矮纸托支撑而不抢主体，二级仍以小巧的奶黄块面为主。',
  },
  {
    id: 'fresh-milk-3', name: '芝士片', svg: cheeseSlices(), expectedOccupancy: .68,
    design: { silhouette: '两片错位的薄方芝士，顶片一角轻卷，三个疏朗小孔建立薄片身份', angle: '微斜俯视，前片较轻盈、后片露出薄边，避免硬立方体', material: '温暖金黄薄芝士、柔软浅亮边缘和轻微孔洞深度，细深棕轮廓', identity: '薄方片、柔卷角与少量孔洞，区别黄油实心厚块和高阶整块奶酪', container: '两片裸芝士轻叠，透明背景，无盘无装饰' },
    reason: '重新绘制两片软薄芝士，保留少量大孔与自然卷角；三级体量收敛，小图仍能读出薄片层次。',
  },
];

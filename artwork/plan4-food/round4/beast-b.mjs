// Round 4: five individually composed, editable review candidates.
const ink = '#39271f';
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line = (d, color, width = 1.5, extra = '') => p(d, 'none', `stroke="${color}" stroke-width="${width}" ${extra}`);
const gradient = (id, colors, xy = 'x1=".16" y1="0" x2=".8" y2="1"') => `<linearGradient id="${id}" ${xy}>${colors.map((color, i) => `<stop offset="${i / (colors.length - 1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const svg = (name, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 全新设计候选</title><defs>${defs}</defs><g stroke="${ink}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;

function porkChop() {
  const meat = 'M51 101C55 77 83 59 113 62C138 48 162 59 174 78C188 98 191 126 177 147C168 159 158 166 144 169C133 192 105 207 77 198C51 192 34 172 35 148C28 131 33 113 51 101Z';
  const defs = gradient('pc4-flesh', ['#ffc5ad','#ed9c89','#ce756b']) + gradient('pc4-depth', ['#db8c7c','#ba605a']) + gradient('pc4-fat',['#fff5df','#f0d8ba','#dcad8c']) + gradient('pc4-bone',['#fff9e8','#f3e3c7','#d5ba95']) + `<clipPath id="pc4-meat">${p(meat,'#fff')}</clipPath>`;
  let body = p('M161 97C181 93 187 75 189 56L188 40C183 35 183 29 189 27C194 25 199 31 199 34C201 28 208 28 212 33C216 39 211 46 205 47L203 67C203 94 189 115 174 119Z','url(#pc4-bone)');
  body += line('M195 48C196 72 192 91 180 101','#fffaf0',3,'opacity=".82"');
  body += p(meat,'url(#pc4-depth)','transform="translate(1 8)"');
  body += p(meat,'url(#pc4-flesh)');
  body += `<g clip-path="url(#pc4-meat)" stroke="none">` + p('M162 68C157 98 168 122 151 148C140 161 137 180 116 202L166 202L202 148L191 81Z','#bb6761','opacity=".15"') + p('M48 135C71 120 93 127 111 143C125 153 132 170 128 185C102 199 74 192 58 176Z','#f1a695','opacity=".55"') + '</g>';
  body += p('M51 104C41 121 35 147 44 164C52 183 69 194 83 193C87 193 90 189 85 185C69 181 58 170 55 155C50 138 54 123 62 109C65 102 57 97 51 104Z','url(#pc4-fat)','stroke="#a77b64" stroke-width="1.5"');
  body += line('M115 72C128 86 131 105 119 120C109 134 114 152 129 163M59 126C83 120 97 126 111 138','#b86f65',1.5,'opacity=".59"');
  body += line('M92 78C110 76 122 87 121 100M68 156C83 151 99 157 107 169','#ffe5ce',2.1,'opacity=".8"');
  body += line('M85 83C71 86 63 94 60 101','#fff0dc',3.8,'opacity=".82"');
  body += line('M145 90L154 101M147 115L159 125M86 135L92 143','#f7c4aa',1.4,'opacity=".75"');
  return svg('猪排',defs,body);
}

function hock() {
  const bodyShape = 'M90 84C108 63 141 58 166 70C192 79 207 100 198 123L169 179C156 202 120 214 92 199C65 189 57 165 65 142Z';
  const face = 'M71 139C82 123 112 119 134 131C158 143 169 164 157 184C146 204 116 210 91 198C64 187 56 162 71 139Z';
  const defs = gradient('hk4-skin',['#f6b293','#df8b75','#b76355']) + gradient('hk4-side',['#ce7c67','#a7534c']) + gradient('hk4-cut',['#ffd2b1','#eaaa94','#cf7c72']) + gradient('hk4-fat',['#fff3dc','#edc6a5']) + gradient('hk4-bone',['#fffbea','#efdec2','#d1b28d']) + `<clipPath id="hk4-clip">${p(bodyShape,'#fff')}</clipPath>`;
  let body = p('M143 83L166 49C163 42 164 36 170 35C176 32 180 39 180 42C183 36 189 36 194 42C199 49 192 55 187 54L167 94Z','url(#hk4-bone)');
  body += line('M177 56L162 81','#fff9e9',3,'opacity=".9"');
  body += p(bodyShape,'url(#hk4-skin)');
  body += `<g clip-path="url(#hk4-clip)" stroke="none">`+p('M180 79C176 112 159 140 154 162C152 181 136 200 118 208L159 213L207 136L205 92Z','url(#hk4-side)','opacity=".52"')+p('M97 86C114 73 141 70 154 79L113 129L78 139Z','#ffd4b0','opacity=".39"')+'</g>';
  body += line('M104 83C121 76 137 75 149 79','#ffe4c3',4,'opacity=".85"');
  body += line('M173 89C167 111 152 127 147 144M182 102C177 118 165 130 161 141','#9f5d50',1.6,'opacity=".44"');
  body += line('M105 107L136 119M112 95L146 108','#b96e5a',1.4,'opacity=".42"');
  body += p(face,'url(#hk4-fat)');
  body += p('M80 143C92 131 112 133 131 142C149 152 154 169 145 181C135 194 114 197 96 190C75 181 69 159 80 143Z','url(#hk4-cut)','stroke="#b67363" stroke-width="1.5"');
  body += p('M104 151C113 145 124 151 125 160C128 170 119 177 111 174C101 173 96 159 104 151Z','url(#hk4-bone)','stroke="#a68469" stroke-width="1.7"');
  body += e(113,162,3.7,4.7,'#d3b091','stroke="none"');
  body += line('M85 150Q92 145 100 148M130 165Q138 171 134 180M96 180L102 184','#ffe1c4',1.6);
  return svg('带骨肘子',defs,body);
}

function tBone() {
  const edge = 'M46 87C56 67 77 55 102 59C125 47 149 54 165 65C191 65 211 86 212 111C222 134 207 160 193 179C181 197 162 205 139 197C115 209 86 203 65 188C44 178 34 152 40 131C29 114 33 98 46 87Z';
  const defs = gradient('tb4-meat',['#f8a39e','#df6e74','#af3c4d']) + gradient('tb4-cut',['#f3a79c','#d86870','#b34858']) + gradient('tb4-depth',['#a73d4a','#762d3e']) + gradient('tb4-fat',['#fff0d8','#f1d1b0','#d7a785']) + `<clipPath id="tb4-clip">${p(edge,'#fff')}</clipPath>`;
  let body = p(edge,'url(#tb4-depth)','transform="translate(0 9)"');
  body += p(edge,'url(#tb4-fat)');
  body += p('M53 90C64 74 80 65 104 69C125 59 145 63 159 75C184 74 200 93 201 115C207 133 195 156 183 173C173 187 157 193 138 186C115 198 90 192 73 179C55 170 46 151 50 133C41 116 43 104 53 90Z','url(#tb4-meat)','stroke="#ad5854" stroke-width="1.6"');
  body += p('M146 79C166 77 187 91 191 107C196 127 181 152 168 164C155 176 142 177 135 171L133 109Z','url(#tb4-cut)','stroke="none"');
  body += p('M79 91L167 87L173 102L132 110L154 174L140 181L117 114L81 117Z','url(#tb4-fat)','stroke="#a8735b" stroke-width="1.5"');
  body += line('M88 103L163 98M125 108L146 174','#fff6e3',2.8,'opacity=".88"');
  body += line('M59 107C75 90 87 92 99 103L108 108M58 148C72 137 85 144 91 157L98 176M151 82Q147 96 154 105M163 131C179 128 185 113 194 119M162 177L176 161','#ffe0c5',2.2,'opacity=".9"');
  body += line('M69 103L73 115L86 121M80 148L74 160M104 159L113 170M171 117L177 105M180 144L190 140','#ffe8ce',1.45,'opacity=".85"');
  body += line('M61 86Q75 72 93 74','#fff2d9',3.4,'opacity=".72"');
  return svg('带骨牛排',defs,body);
}

function lambRack() {
  const defs = gradient('lr4-bone',['#fff9e5','#f2dfbd','#ceb18c']) + gradient('lr4-fat',['#fff1d9','#edc6a9','#cba086']) + gradient('lr4-meat',['#efafa2','#cb7c7b','#a65061']) + gradient('lr4-edge',['#ae5d63','#80444e']);
  let body = '';
  // Three long ribs form one compact fan, with the meat cuts overlapping naturally.
  const chops = [
    {x:74,y:157,a:-21,bone:'M-5-25L-12-91Q-12-100-6-101Q0-101 2-93L8-28Z',shape:'M-30-18C-24-37 0-43 19-29C38-18 38 11 24 26C6 45-19 36-32 18C-41 4-39-9-30-18Z'},
    {x:128,y:171,a:1,bone:'M-6-28L-4-109Q-3-118 3-117Q9-116 9-108L8-28Z',shape:'M-31-17C-28-37-8-45 12-36C35-29 45-4 34 17C23 39-3 43-23 29C-42 18-42-3-31-17Z'},
    {x:178,y:159,a:20,bone:'M-6-28L0-91Q1-100 7-99Q14-98 13-90L9-27Z',shape:'M-28-17C-21-36 1-40 19-28C39-17 40 6 26 23C12 40-12 39-28 24C-42 9-40-4-28-17Z'},
  ];
  for (const c of chops) body += `<g transform="translate(${c.x} ${c.y}) rotate(${c.a})">`+p(c.bone,'url(#lr4-bone)','stroke-width="2.7"')+line('M0-83L1-38','#fff9ea',2.5,'opacity=".8"')+p(c.shape,'url(#lr4-edge)','transform="translate(0 4)"')+p(c.shape,'url(#lr4-fat)')+p('M-22-12C-17-26 1-29 15-19C30-10 28 9 17 19C5 29-12 24-21 14C-29 5-29-5-22-12Z','url(#lr4-meat)','stroke="#ab7168" stroke-width="1.6"')+line('M-16-10Q-3-19 9-10M5 15L13 9','#ffe0c6',1.6,'opacity=".7"')+'</g>';
  return svg('羊排',defs,body);
}

function ham() {
  const skin = 'M68 99C86 80 123 71 152 82L194 112L211 111L216 129L194 142C181 177 150 199 112 200C79 200 55 181 53 154C47 132 53 113 68 99Z';
  const face = 'M46 132C49 105 74 88 97 96C120 102 135 128 130 154C129 181 105 204 81 199C56 197 39 167 46 132Z';
  const defs = gradient('hm4-skin',['#eb947e','#c76f60','#974c48'])+gradient('hm4-face',['#f9b5a7','#e99189','#c96d74'])+gradient('hm4-fat',['#fff2d8','#f3d7b8','#d5ac8e'])+gradient('hm4-bone',['#fff8e5','#ecd5b6','#c9a684'])+`<clipPath id="hm4-clip">${p(skin,'#fff')}</clipPath>`;
  let body = p('M189 115L216 99C216 91 220 88 225 91C230 92 230 99 227 102C233 101 238 105 235 112C232 118 226 116 222 114L205 133Z','url(#hm4-bone)','stroke-width="2.8"');
  body += p(skin,'url(#hm4-skin)');
  body += `<g clip-path="url(#hm4-clip)" stroke="none">`+p('M119 83C126 112 120 149 133 175C146 193 162 182 187 153L205 132L186 109Z','#a85550','opacity=".17"')+p('M84 94C110 82 140 86 159 99L179 116C145 105 124 117 107 134Z','#ffd0ac','opacity=".23"')+'</g>';
  body += line('M119 99L174 139M139 91L187 126M120 135L150 101M139 156L169 119','#9c574f',1.5,'opacity=".57"');
  body += line('M120 90Q143 87 163 104','#ffd9b7',3.6,'opacity=".8"');
  body += p(face,'url(#hm4-fat)');
  body += p('M55 133C58 113 75 101 92 106C110 110 122 130 119 151C117 173 101 191 84 188C64 188 50 165 55 133Z','url(#hm4-face)','stroke="#b66b67" stroke-width="1.6"');
  body += p('M81 135C89 129 100 135 100 144C101 153 92 161 84 156C77 152 75 142 81 135Z','url(#hm4-bone)','stroke="#a47b66" stroke-width="1.5"');
  body += e(88,144,3.2,4.1,'#cfac8d','stroke="none"');
  body += line('M66 132L72 141M67 160L74 168M100 166L104 157M93 117L99 123','#ffe8d0',2.2,'opacity=".9"');
  body += line('M70 116Q78 111 87 113','#fff1db',3,'opacity=".84"');
  body += line('M139 184Q167 173 181 153','#e1a188',1.8,'opacity=".65"');
  return svg('火腿',defs,body);
}

export const beastBCandidates = [
  {id:'fresh-beast-6',name:'猪排',svg:porkChop(),design:{silhouette:'肾形厚肉排与向右上伸展的弯肋骨，区别于圆肉饼',angle:'三分之四俯视，切面与下缘厚度同时可见',material:'粉珊瑚肌肉、乳白局部脂边、浅骨色肋骨分别处理，肉面用两三块柔和明暗',identity:'一整块带长肋骨猪排，保留生猪肉色，不用中央白色闭环',container:'无盘、无配菜'},reason:'上一张候选未采用；本次重新组织厚切肉排与外露肋骨，脂边随轮廓局部分布。'},
  {id:'fresh-beast-7',name:'带骨肘子',svg:hock(),design:{silhouette:'上窄下厚的短肘身、向上露出的骨端与前下方椭圆切面',angle:'侧前方略俯视，展示圆柱体积与切口',material:'外皮、肌肉、脂肪圈和中央骨芯分别有色块与软硬变化',identity:'短而厚的肘子形体，前切面中骨芯清楚，避免与长火腿混淆',container:'无盘、无配菜'},reason:'全新设计，以肘身厚度、自然皮褶和骨芯切面建立识别。'},
  {id:'fresh-beast-8',name:'带骨牛排',svg:tBone(),design:{silhouette:'宽厚不规则双肉眼切面，中间浅色T形骨清楚分割',angle:'三分之四俯视，露出深红侧厚',material:'深浅红牛肉、少量分叉大理石纹与奶油色脂边，避免满面碎纹',identity:'T骨与两块肉眼共同区分其他肉排，保持生牛排身份',container:'无盘、无配菜'},reason:'另绘全新T骨构图供选择；旧确认稿保留，不直接复用旧源。'},
  {id:'fresh-beast-9',name:'羊排',svg:lambRack(),design:{silhouette:'三根细长肋骨组成紧凑扇形，下部三块小肉眼相互叠压',angle:'略俯视的扇形摆放，肋骨向上舒展',material:'粉红羊肉、薄脂边与奶白细骨，色彩和体量区别于牛排',identity:'小肉眼配长肋骨，避免大骨头棒或三只圆圈的旧形体',container:'无盘、无配菜'},reason:'全新扇形羊排，肋骨长度和小块肉眼形成清楚的大形差异。'},
  {id:'fresh-beast-10',name:'火腿',svg:ham(),design:{silhouette:'横向梨形整腿、前左大切面与右上短骨端',angle:'侧前方略俯视，切面朝左前',material:'暖红腌肉外皮、粉红切面、乳白脂边与小骨芯；侧皮少量菱形刀纹',identity:'整腿长体与大切面突出火腿身份，区别短厚肘子',container:'无盘、无配菜'},reason:'全新整腿火腿构图，侧皮、切面和骨芯各有主次，不用小肉卷表现。'},
];

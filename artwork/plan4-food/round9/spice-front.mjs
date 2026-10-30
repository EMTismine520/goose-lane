// Round 9 alternatives. Native editable SVGs, separate from selected runtime artwork.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.4,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const ellipse=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const grad=(id,colors,radial=false)=>radial
  ? `<radialGradient id="${id}" cx=".27" cy=".21" r=".9">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</radialGradient>`
  : `<linearGradient id="${id}" x1=".12" y1=".05" x2=".82" y2="1">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 第9轮香料新稿</title><defs>${defs}</defs><g stroke="#3d2e24" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;

function pepper(){
  const skin='M159 65C183 65 195 91 186 116C176 147 155 170 128 186C104 200 77 209 52 207C74 196 87 180 98 162C113 139 115 121 121 103C128 79 140 66 159 65Z';
  const defs=grad('s9p-skin',['#ffbe80','#ef7350','#d44f3e','#a53532'],true)+grad('s9p-stem',['#b1cb78','#6e9650','#3e673d'])+`<clipPath id="s9p-clip">${p(skin,'#fff')}</clipPath>`;
  let body=p(skin,'url(#s9p-skin)');
  body+='<g clip-path="url(#s9p-clip)" stroke="none">';
  body+=p('M170 77C178 110 159 147 133 170C111 189 91 198 67 205C102 213 156 186 179 151C199 120 202 85 170 77Z','#8d2f2e','opacity=".18"');
  body+=p('M143 82C129 96 129 115 122 131C117 142 108 139 112 126C117 105 121 86 138 78C145 75 149 77 143 82Z','#ffe0b2','opacity=".7"');
  body+=p('M148 84C146 95 140 111 135 122C133 127 130 125 132 120L142 88Z','#fff5d4','opacity=".62"');
  body+='</g>';
  body+=line('M110 166C96 184 81 195 64 201','#ffac78',1.8,.65);
  body+=p('M144 70C144 60 140 52 143 43C146 36 154 36 157 41C153 48 155 55 160 60L168 68C163 75 152 77 144 70Z','url(#s9p-stem)');
  body+=p('M145 65C137 66 132 72 131 78C139 76 145 78 150 82C153 76 160 73 166 73C160 65 152 63 145 65Z','url(#s9p-stem)','stroke-width="2.6"');
  body+=line('M147 45Q146 54 152 61','#c8dc94',1.8,.8);
  return doc('红椒',defs,body);
}

function scallion(){
  const defs=grad('s9s-green',['#b4d880','#77ac52','#3e753e'])+grad('s9s-deep',['#88b866','#5e9549','#34643a'])+grad('s9s-white',['#fffce8','#e8ebc4','#b7ca8b'])+grad('s9s-tie',['#ddbd83','#bc925c']);
  let body='';
  // Four curved tubular leaves form a loose gathered fan, with soft white bases below.
  body+=p('M116 164C108 123 92 85 89 51C89 44 93 41 97 47C111 76 124 123 128 163Z','url(#s9s-deep)');
  body+=p('M132 165C132 125 138 76 151 44C154 36 160 39 158 48C152 84 146 129 144 168Z','url(#s9s-deep)');
  body+=p('M109 168C103 135 86 116 72 86C68 78 72 74 77 80C96 102 116 134 122 168Z','url(#s9s-green)');
  body+=p('M139 170C143 137 162 102 183 79C190 71 194 76 189 84C174 112 156 143 151 174Z','url(#s9s-green)');
  body+=p('M123 170C120 134 120 97 116 65C115 56 121 54 124 63C134 96 138 134 137 171Z','url(#s9s-green)');
  body+=line('M95 55C99 80 110 119 117 147M154 48C148 83 143 120 141 151M120 69C126 100 129 133 130 153','#d3e6a2',1.7,.65);
  body+=p('M109 161L124 160C126 173 129 189 127 200C126 207 120 209 116 201C111 187 110 174 109 161Z','url(#s9s-white)','stroke-width="2.7"');
  body+=p('M124 162L139 164C138 178 139 194 135 207C132 214 126 213 124 205C121 189 123 175 124 162Z','url(#s9s-white)','stroke-width="2.7"');
  body+=p('M139 164L153 169C149 183 146 198 139 207C134 213 129 210 132 203C135 190 137 176 139 164Z','url(#s9s-white)','stroke-width="2.7"');
  body+=line('M119 171Q119 184 122 194M131 174L130 199M144 176L137 200','#faffdf',1.7,.8);
  body+=p('M109 158Q128 164 151 161L150 171Q127 175 112 168Z','url(#s9s-tie)','stroke-width="2.1"');
  body+=line('M118 207L113 215M122 209L121 218M132 212L131 220M138 209L142 217','#aa9066',1.45,.85);
  return doc('香葱',defs,body);
}

function onion(){
  const bulb='M116 62C102 73 84 73 68 89C49 108 46 142 59 165C72 189 98 197 125 191C151 185 166 165 165 139C165 108 146 86 129 68L128 55Z';
  const defs=grad('s9o-skin',['#e7bfd6','#c888b5','#9b558c','#763e6d'],true)+grad('s9o-petal',['#cf99c0','#ab6a9d','#7f4877'])+grad('s9o-cut',['#fff3dc','#f2d6de','#d5a9c8'])+grad('s9o-rind',['#b875a5','#87507f'])+grad('s9o-dry',['#d8b88a','#aa855b'])+`<clipPath id="s9o-clip">${p(bulb,'#fff')}</clipPath>`;
  let body=p(bulb,'url(#s9o-skin)');
  body+='<g clip-path="url(#s9o-clip)" stroke="none">';
  body+=p('M126 68C149 111 155 156 125 191C164 187 184 129 151 91Z','#713f6a','opacity=".17"');
  body+=p('M99 79C81 94 71 119 74 146C75 157 81 160 82 149C78 123 87 97 103 85C108 81 105 76 99 79Z','#f8d9e5','opacity=".5"');
  body+='</g>';
  body+=line('M113 74C92 104 90 151 108 179M124 76C143 106 147 141 133 169','#ecc9d9',1.8,.78);
  body+=line('M88 86C68 113 67 146 81 164','#bc7caa',1.4,.58);
  body+=p('M116 65L109 48Q116 50 121 54L128 45L132 66Z','url(#s9o-dry)','stroke-width="2.5"');
  body+=line('M99 190L94 196M106 192L105 199','#997355',1.3,.75);
  // A thick quarter wedge exposes a few broad purple-white concentric layers.
  body+=p('M138 136C161 133 190 150 199 178C181 197 158 206 133 197L126 178Z','url(#s9o-rind)');
  body+=p('M138 136C157 141 177 155 189 176C175 188 155 194 136 189L126 178Z','url(#s9o-cut)','stroke-width="2.7"');
  body+=line('M139 144C155 149 169 160 178 175C168 182 154 186 140 184M139 153C150 158 160 165 167 174C161 178 152 180 144 178M140 162Q149 166 155 173','#aa6b9a',2.0,.9);
  body+=line('M142 139Q167 146 184 170','#fff8e4',2,.8);
  return doc('紫洋葱',defs,body);
}

function vanilla(){
  const defs=grad('s9v-brown',['#aa7656','#704d38','#49372b'])+grad('s9v-open',['#986548','#5e412f','#3b2d25'])+grad('s9v-seed',['#b17b53','#835438','#523929']);
  let body='';
  body+=p('M78 201C92 168 94 124 105 84C111 61 119 43 125 43C132 43 130 52 126 64C114 102 110 150 96 181C90 195 84 203 78 201Z','url(#s9v-brown)');
  body+=line('M90 182C104 151 107 96 120 62','#c09971',1.45,.67);
  body+=p('M94 205C123 181 144 148 164 104C173 83 183 64 190 64C197 65 193 75 189 84C173 126 150 166 126 190C112 203 101 209 94 205Z','url(#s9v-brown)');
  body+=line('M111 195C139 171 164 126 182 83','#be9367',1.6,.61);
  // An opened foreground pod is broad enough to read at board scale.
  body+=p('M67 197C88 179 104 154 124 117C137 94 146 70 157 57C162 51 168 54 165 62C156 87 141 122 122 152C102 181 81 198 67 197Z','url(#s9v-open)');
  body+=p('M77 190C97 172 111 149 129 116C140 95 149 77 158 65C152 84 144 106 132 126C114 157 94 181 77 190Z','url(#s9v-seed)','stroke="#c3986c" stroke-width="1.25"');
  body+=line('M83 185C103 165 120 137 137 104','#d2aa7b',1.45,.72);
  for(const [x,y]of [[93,177],[100,166],[110,153],[117,141],[124,130],[131,117],[139,101],[145,89],[151,77]])body+=ellipse(x,y,1.5,2.1,'#34271f','stroke="none"');
  return doc('香草荚',defs,body);
}

function garlic(){
  const bulb='M113 70C100 82 80 82 68 101C55 121 56 148 69 164C83 181 103 184 121 181C140 185 163 180 173 163C185 144 178 120 165 103C151 86 136 83 128 71L127 53L115 52Z';
  const defs=grad('s9g-skin',['#fffbed','#f2e5cb','#d3bfa2'],true)+grad('s9g-lobe',['#fffef0','#efdfc2','#ceb99b'])+grad('s9g-clove',['#fff8e2','#efdcba','#cbb18e'],true)+grad('s9g-dry',['#dfc7a1','#b59a73'])+`<clipPath id="s9g-clip">${p(bulb,'#fff')}</clipPath>`;
  let body=p(bulb,'url(#s9g-skin)');
  body+='<g clip-path="url(#s9g-clip)" stroke="none">';
  body+=p('M128 76C150 113 152 154 128 183C153 185 182 171 181 146C181 118 159 87 128 76Z','#bda17f','opacity=".16"');
  body+=p('M108 79C84 100 79 126 85 157C94 169 101 177 120 181C105 150 103 113 118 79Z','url(#s9g-lobe)');
  body+=p('M124 77C112 108 112 155 122 181C141 176 148 159 147 140C146 112 137 88 124 77Z','#fff7df','opacity=".4"');
  body+='</g>';
  body+=line('M110 80C88 104 84 141 98 171M124 78C111 112 111 149 121 177M134 83C155 109 160 138 151 163','#b49b7d',1.6,.72);
  body+=line('M77 113Q69 134 78 148M103 95Q97 106 96 118','#fffef0',2.5,.85);
  body+=p('M114 69L110 51L116 47L127 50L129 71','url(#s9g-dry)','stroke-width="2.7"');
  body+=line('M120 52L121 64','#f4e5c3',1.45,.75);
  body+=p('M101 179Q115 185 131 181L131 186Q116 193 103 186Z','url(#s9g-dry)','stroke-width="1.8"');
  body+=line('M109 188L106 195M118 188L118 196M126 187L130 193','#a98c66',1.3,.8);
  // One loose peeled clove makes the ingredient read as garlic rather than a pale pumpkin.
  body+=p('M166 145C177 145 179 139 181 134C186 145 193 151 193 163C193 176 184 186 171 187C156 187 147 180 151 167C153 158 158 151 166 145Z','url(#s9g-clove)','stroke-width="2.8"');
  body+=line('M179 142C176 152 163 161 162 175','#fff9e8',2.4,.9);
  body+=line('M168 183Q181 181 187 172','#b89e79',1.35,.65);
  return doc('大蒜',defs,body);
}

export const spiceFrontCandidates=[
  {id:'fresh-spice-1',name:'红椒',svg:pepper(),expectedOccupancy:.70,design:{silhouette:'一根饱满红椒由厚肩向长弯尖自然收束，绿色短梗与弯曲大形清楚分开',angle:'三分之四略俯视，椒肩在右上，尖端向左下回弯',material:'温暖红橙椒皮，宽软反光与轻微背光暗面',identity:'单根弯红椒、短绿萼和细尖端；不加入成菜配料',container:'裸食材透明底，无盘无装饰'},reason:'用饱满椒肩、自然弯尖和一处克制反光重画红椒，保持小图鲜亮易辨。'},
  {id:'fresh-spice-2',name:'香葱',svg:scallion(),expectedOccupancy:.72,design:{silhouette:'五条长短错落的弯葱叶自然聚拢，三枚短白葱根和少量细根形成清楚上下层次',angle:'略斜的小把香葱，叶子松散成扇形，根部收紧',material:'嫩绿色中空葱叶与乳白根段，叶脊反光轻而连续',identity:'绿叶、白葱根与短根须同时保留，避免旧版硬直三叉形',container:'食材用细草绳收束，无盛器'},reason:'改用松弛弯叶与短白葱根，重画自然小束香葱，减少几何三叉感。'},
  {id:'fresh-spice-3',name:'紫洋葱',svg:onion(),expectedOccupancy:.68,design:{silhouette:'一颗圆润紫葱为主，前方一枚厚切瓣露出少量宽层纹',angle:'整颗在左后，斜切瓣置于右前形成交叠',material:'紫红纸皮、浅紫白切面与干燥短颈，反光柔和',identity:'紫色球茎和弧形层纹共同辨识，切瓣不用密集同心线',container:'无盘裸食材透明背景'},reason:'以整颗加厚切瓣展示洋葱特有紫白层次，保持一级主次和克制占格。'},
  {id:'fresh-spice-4',name:'香草荚',svg:vanilla(),expectedOccupancy:.70,design:{silhouette:'三根深褐弯荚交叠，一根较宽开荚在前，线形细长而非硬直棍束',angle:'从左下斜向右上，自然张开小扇面',material:'柔润黑棕荚皮、暖棕开荚面和少量深色香草籽',identity:'弯曲细荚与开荚籽沟区别竹签、肉桂及枝条',container:'无绳无碗，透明底裸荚'},reason:'重画弯荚与一条开荚籽沟，保留深褐香料身份，避免原版像硬杆。'},
  {id:'fresh-spice-5',name:'大蒜',svg:garlic(),expectedOccupancy:.68,design:{silhouette:'一颗蒜头呈柔软分瓣球形，旁边一枚尖头蒜瓣强化辨识',angle:'蒜球在左后，剥皮蒜瓣在右前，略俯视',material:'暖乳白纸衣、柔和瓣沟和浅米色蒜瓣，干根处轻微褐色',identity:'短干颈、分瓣蒜球与一枚水滴蒜瓣，避免南瓜大球感',container:'无盘无配叶，透明底'},reason:'以完整蒜球加单瓣建立清楚身份，细描边和浅色瓣沟使小图干净轻巧。'},
];

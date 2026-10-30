// Plan 4 review masters. Each food is authored individually; production mappings are unchanged.
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const ellipse = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const stroke = (d, color, width = 1.5, opacity = 1) => path(d, 'none', `stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"`);
const radial = (id, stops, cx = '.32', cy = '.22', radius = '.82') => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${radius}">${stops.map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`).join('')}</radialGradient>`;
const linear = (id, colors, x2 = '1', y2 = '1') => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${colors.map((color, i) => `<stop offset="${i / (colors.length - 1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const document = (name, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 食物美术样板</title><defs>${defs}</defs>${body}</svg>`;
const shadow = (cx = 128, cy = 222, rx = 78, ry = 12) => ellipse(cx, cy, rx, ry, '#65402b', 'opacity=".09"') + ellipse(cx, cy - 1, rx * .65, ry * .48, '#70402a', 'opacity=".08"');
const leaf = (d, vein, fill) => path(d, fill, 'stroke="#426d32" stroke-width="1.15" stroke-linejoin="round"') + stroke(vein, '#d0df85', 1.2, .72);

function tomato() {
  const skin = 'M126 65C102 47 72 56 51 80 30 104 28 143 41 175 56 209 85 226 123 229 165 233 202 212 217 180 233 145 225 104 206 81 185 54 151 52 126 65Z';
  const defs = radial('t-skin', [['0','#ffd39b'],['.22','#ff9b67'],['.53','#f36b43'],['.78','#d83e32'],['1','#9e302b']]) + radial('t-cheek', [['0','#ffb06c'],['.62','#f65b40'],['1','#cd3d31']]) + linear('t-leaf',['#bdd26b','#6f993c','#35673a']) + linear('t-stem',['#bdbe76','#6a8841','#456439']) + `<clipPath id="t-clip">${path(skin,'white')}</clipPath>`;
  let body = shadow(127,226,78,11) + path(skin,'url(#t-skin)','stroke="#b84931" stroke-width="1.4"');
  body += `<g clip-path="url(#t-clip)">` + ellipse(98,136,59,77,'url(#t-cheek)','opacity=".55"') + path('M131 69C164 85 184 137 167 201 160 221 149 234 141 240H235V55Z','#a92e2b','opacity=".13"') + stroke('M65 174C79 209 118 218 148 212','#ffb174',3,.48) + path('M59 104C66 82 86 72 103 78 91 84 83 95 78 113 73 127 57 127 59 104Z','#fff1d1','opacity=".57"') + ellipse(59,135,4,8,'#ffe1a6','opacity=".45"') + ellipse(178,193,15,4,'#ffad72','opacity=".21"') + stroke('M130 80C140 98 144 112 143 130','#ef6440',2,.22);
  for(let i=0;i<26;i++){ const a=i*2.39996,r=12+(i%7)*9; body+=ellipse(130+Math.cos(a)*r,154+Math.sin(a)*r*.83,.65,.65,'#ffce8a','opacity=".18"'); }
  body += '</g>';
  body += ellipse(125,77,34,10,'#792e28','opacity=".17"');
  body += leaf('M125 76C106 68 85 61 76 70 91 71 99 80 112 84 100 87 88 96 88 105 100 99 119 98 128 87 137 99 155 106 168 103 162 92 149 87 142 82 158 82 179 78 183 67 166 70 151 67 137 73 136 56 130 48 119 48 124 60 119 66 125 76Z','M91 72 124 80 96 99M125 80 158 99M127 79 171 72','url(#t-leaf)');
  body += path('M122 76C118 63 118 49 129 35 132 32 139 35 138 39 128 50 126 61 130 74Z','url(#t-stem)','stroke="#55713a" stroke-width="1.25"') + stroke('M125 64C124 53 128 44 132 39','#d5d68f',1.5,.8);
  body += ellipse(81,142,3.7,5.1,'#fff7df','opacity=".56" transform="rotate(23 81 142)"') + ellipse(80,140,1.3,1.4,'#ffffff','opacity=".74"');
  return document('番茄',defs,body);
}

function cucumber() {
  const defs = linear('c-rind',['#95b05a','#5e8743','#365e37']) + linear('c-side',['#8caa53','#527b3f','#345b35']) + radial('c-flesh',[['0','#f3f2cb'],['.42','#e2e8b3'],['.78','#bed18b'],['1','#9eb975']]) + linear('c-core',['#f9f3d4','#e9e9b8','#ccdb9e']) + radial('c-seed',[['0','#fffbe2'],['.62','#eeecc6'],['1','#bacb91']]);
  let body = ellipse(130,203,73,7,'#6d6540','opacity=".055"');
  body += '<g transform="translate(126 126) rotate(-37)">';
  body += path('M-107-10C-106-33-62-49-6-50 51-51 101-38 108-15L109 2C105 30 59 49 0 51-54 51-98 35-107 12Z','url(#c-side)','stroke="#526d3c" stroke-width="1.55"');
  body += path('M-103 5C-82 29-24 38 27 32 65 29 95 15 107-4L106 10C88 38 43 50-8 50-57 48-93 33-103 15Z','#345d36','opacity=".34"');
  body += stroke('M-90 22C-48 41 34 43 83 22','#a2ba6b',1.9,.57);
  for(let i=0;i<13;i++){const x=-82+i*13,y=34-Math.pow(x/90,2)*9;body+=ellipse(x,y,1,1.35,'#c6d393','opacity=".3"');}
  body += ellipse(0,-10,107,40,'url(#c-rind)','stroke="#4d6b3d" stroke-width="1.35"');
  body += ellipse(0,-12,100,34,'url(#c-flesh)','stroke="#d4e0a6" stroke-width="1.4"');
  body += path('M-91-12C-69-30-28-30 3-23 32-30 71-26 92-12 70 4 33 9 1 2-35 10-73 4-91-12Z','url(#c-core)','opacity=".78"');
  body += stroke('M-91-18C-67-37-17-39 23-33','#f9f7da',2.4,.72);
  body += stroke('M-80 9C-41 23 21 25 66 10','#c0d18f',1.2,.56);
  for(let row=0;row<2;row++)for(let i=0;i<8;i++){
    const x=-72+i*20+(row?6:0),y=-13+(row?9:-7)+Math.sin(i*.5)*1.5,a=row?-25:24;
    body += '<g transform="translate('+x+' '+y+') rotate('+a+')">';
    body += ellipse(.4,.9,3.4,5.7,'#98b37a','opacity=".24"');
    body += path('M0-5C3-2 4 2 1 5-1 7-4 2-2-1Z','url(#c-seed)','stroke="#becd99" stroke-width=".55"');
    body += stroke('M-.7-2Q-1.6 1-.5 3','#fffde7',.8,.85)+'</g>';
  }
  body += stroke('M-71-11C-43-15-15-9 4-11 33-14 59-9 81-12','#fffbe4',1.05,.44);
  body += ellipse(-49,-23,8,2,'#fffbe5','opacity=".4"') + ellipse(49,-5,3.3,1.1,'#fffbe5','opacity=".5"') + '</g>';
  return document('黄瓜',defs,body);
}

function broccoli() {
  const defs=linear('b-stem',['#e2df9b','#aacb75','#6c9c50'])+radial('b-crown',[['0','#b8d36c'],['.3','#77ac50'],['.63','#438744'],['1','#245b38']])+radial('b-front',[['0','#b0cf66'],['.35','#6ba449'],['.75','#347540'],['1','#204e35']])+linear('b-leaf',['#9cbd62','#528e43','#316b3e']);
  let body=shadow(131,224,73,10)+path('M100 139 147 137 159 217Q135 231 100 218L105 180 83 153Z','url(#b-stem)','stroke="#6b8d4b" stroke-width="1.4"')+path('M114 180C103 163 75 149 64 138L79 125Q109 143 121 160L125 122H143L136 180Z','url(#b-stem)','stroke="#70944b" stroke-width="1.1"')+stroke('M119 154 122 210','#e9e8ad',4,.72)+stroke('M143 169 149 214','#4f8646',2.4,.45);
  body+=leaf('M104 192C77 191 63 176 63 159 81 161 96 171 107 184Z','M69 166 105 188M87 174 84 164','url(#b-leaf)')+leaf('M143 189C155 168 175 159 194 163 187 184 170 194 148 196Z','M185 168 148 191M169 181 178 182','url(#b-leaf)');
  const clusters=[[78,99,34],[112,69,34],[150,79,36],[183,111,33],[56,130,29],[104,126,37],[148,128,38],[184,144,28]];
  for(let n=0;n<clusters.length;n++){const [cx,cy,r]=clusters[n];let s='';
    const edge=Array.from({length:72},(_,i)=>{const a=i*Math.PI/36,rr=r*(.97+.065*Math.cos(a*9));return `${i?'L':'M'}${(cx+Math.cos(a)*rr).toFixed(2)} ${(cy+Math.sin(a)*rr*.84).toFixed(2)}`;}).join(' ')+'Z';
    s+=path(edge,n>4?'url(#b-front)':'url(#b-crown)','stroke="#326d3d" stroke-width="1.1"');
    for(let i=0;i<47;i++){const a=i*2.39996,rr=Math.sqrt(i/48)*r*.88,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.73,k=2.2+(i%4)*.5;
      s+=ellipse(x,y,k,k*.8,i%4?'#8cba5c':'#265f38',`opacity="${i%4?'.53':'.4'}"`)+ellipse(x-k*.25,y-k*.4,k*.47,k*.3,'#d2df86','opacity=".42"');
    }
    body+=s;
  }
  return document('西兰花',defs,body);
}

function strawberry() {
  const shape='M128 71C95 49 55 67 48 105 40 144 67 190 108 224 120 235 133 234 145 224 190 188 217 145 208 105 200 69 161 50 128 71Z';
  const defs=radial('s-skin',[['0','#ffc4a3'],['.22','#ff8d77'],['.49','#ef4c4d'],['.79','#c82c42'],['1','#8e203a']])+linear('s-leaf',['#c4d47b','#709c45','#3f713c'])+radial('s-dimple',[['0','#8f2636'],['1','#e75855']])+linear('s-seed',['#fff2b5','#e7bc5c','#a46d35'])+`<clipPath id="s-clip">${path(shape,'white')}</clipPath>`;
  let body=shadow(127,230,61,9)+path(shape,'url(#s-skin)','stroke="#ad3440" stroke-width="1.35"');
  body+=`<g clip-path="url(#s-clip)">`+path('M67 92C72 73 93 68 106 77 88 89 81 104 82 122 79 137 60 133 61 119Z','#fff0d4','opacity=".34"')+path('M167 78C186 99 187 140 170 171 159 192 145 215 130 231 171 226 221 171 218 102Z','#961c38','opacity=".18"');
  const rows=[[99,[79,107,137,165]],[125,[67,94,123,153,183]],[153,[73,102,132,160,185]],[178,[88,115,143,168]],[201,[108,135,153]],[219,[126]]];
  for(const [y,xs]of rows)for(let i=0;i<xs.length;i++){const x=xs[i],a=(x-128)*.34;body+=`<g transform="translate(${x} ${y}) rotate(${a})">`+ellipse(0,1,3.8,6,'url(#s-dimple)','opacity=".82"')+path('M0-4C3-1 3 2 1 5-1 7-3 3-2 0Z','url(#s-seed)','stroke="#d8a35a" stroke-width=".45"')+stroke('M-.5-2-.8 1','#fff8d2',.8,.9)+'</g>';}
  body+='</g>'+ellipse(127,77,29,9,'#711f31','opacity=".16"');
  body+=leaf('M126 74C112 57 97 48 88 52 95 64 101 73 113 78 96 77 82 81 76 91 92 94 111 89 124 84 123 101 130 113 139 114 144 101 140 91 137 82 151 93 169 95 181 89 171 78 155 74 143 76 158 64 164 50 160 43 146 48 136 61 130 73Z','M96 56 127 80 82 88M127 80 138 105M129 80 171 87M133 78 157 51','url(#s-leaf)');
  body+=path('M124 77C121 63 123 45 135 32 138 29 143 32 141 36 132 48 132 62 132 76Z','#739546','stroke="#547438" stroke-width="1.1"')+stroke('M128 64Q128 47 136 37','#cbd788',1.2,.8);
  return document('草莓',defs,body);
}

function orange() {
  const defs=radial('o-skin',[['0','#ffe2a1'],['.26','#ffc567'],['.63','#f59b39'],['1','#d66b27']])+radial('o-pulp',[['0','#ffe3a0'],['.4','#ffc55e'],['1','#ef942d']])+linear('o-cut',['#fff2bb','#ffda7c','#f8b44a'])+linear('o-leaf',['#a8ca6a','#659b45','#3f7438']);
  let body=shadow(129,225,84,10)+ellipse(95,134,73,80,'url(#o-skin)','stroke="#c88038" stroke-width="1.3"')+ellipse(86,65,16,4,'#c5903e','opacity=".3"')+path('M85 64Q79 49 89 43L95 47 93 63Z','#8c8a40','stroke="#6e7333" stroke-width="1.1"');
  body+=leaf('M93 52C105 28 132 27 146 36 134 56 112 61 93 52Z','M99 51 137 36M112 46 115 35M120 43 134 46','url(#o-leaf)');
  body+=path('M41 108C43 88 58 77 71 76 59 87 55 100 56 119 51 134 39 125 41 108Z','#fff0c5','opacity=".45"');
  for(let i=0;i<100;i++){const a=i*2.39996,r=Math.sqrt(i/100)*64,x=94+Math.cos(a)*r,y=138+Math.sin(a)*r*1.06;body+=ellipse(x,y,.65+(i%3)*.22,.65+(i%3)*.18,i%3?'#fff2b2':'#d9882d',`opacity="${i%3?'.24':'.34'}"`);}
  body+=ellipse(174,166,62,64,'#e6872d','stroke="#c47d30" stroke-width="1.3"')+ellipse(171,160,62,63,'url(#o-cut)','stroke="#f8dca0" stroke-width="2"')+ellipse(171,160,53,54,'url(#o-pulp)','stroke="#fff2c6" stroke-width="3"');
  for(let i=0;i<10;i++){
    const a=i*Math.PI/5,b=a+Math.PI/5,c=(a+b)/2,point=(r,q)=>[171+Math.cos(q)*r,160+Math.sin(q)*r*1.015];const p1=point(47,a+.04),p2=point(47,b-.04),p3=point(9,c);
    body+=path(`M${p3}L${p1}A47 48 0 0 1 ${p2}Z`,i%2?'#ffce70':'#ffd982','stroke="#ffeaba" stroke-width="1.35"');
    for(let j=0;j<5;j++){const rr=19+j*5,q=a+.12+(j%3)*.13,[x,y]=point(rr,q);body+=ellipse(x,y,1.5,3.4,'#fff2bd',`opacity=".4" transform="rotate(${q*180/Math.PI-90} ${x} ${y})"`);}
    const [x,y]=point(16,c);body+=stroke(`M171 160 ${x} ${y}`,'#fff3cf',1.4,.8);
  }
  body+=path('M166 152Q174 150 179 159L174 169 165 164Z','#fff1c3','stroke="#f1d096" stroke-width=".8"')+ellipse(171,159,2,3,'#f9d89a')+stroke('M124 155C124 132 140 113 162 110','#fff8d6',2.7,.75);
  return document('甜橙',defs,body);
}

function peach() {
  const whole='M102 62C77 46 42 59 31 92 15 135 39 190 78 211 94 221 104 211 114 202 147 184 165 147 157 109 150 77 128 57 102 62Z';
  const cut='M175 103C153 86 124 103 110 128 89 166 106 208 143 222 169 234 210 216 227 183 246 147 222 106 198 101 189 99 183 105 175 103Z';
  const defs=radial('p-skin',[['0','#fff3ce'],['.26','#ffe2b5'],['.54','#f6b0a0'],['.8','#e87e8b'],['1','#be5d79']])+radial('p-flesh',[['0','#fff6d2'],['.36','#ffeac2'],['.7','#f8c799'],['1','#ed9f88']])+linear('p-rind',['#ffd4b5','#ed8f91','#bc5f7a'])+radial('p-pit',[['0','#d78d5b'],['.4','#ad573e'],['1','#733734']])+linear('p-leaf',['#bdd57f','#79a251','#446f3e'])+`<clipPath id="p-whole">${path(whole,'white')}</clipPath><clipPath id="p-face">${path(cut,'white')}</clipPath>`;
  let body=shadow(133,228,85,10)+path(whole,'url(#p-skin)','stroke="#c8797d" stroke-width="1.25"');
  body+=`<g clip-path="url(#p-whole)">`+path('M103 66C117 96 106 125 111 156 116 183 99 207 92 216 112 211 150 179 161 139L169 76Z','#ca6b7c','opacity=".18"')+stroke('M101 74C110 103 96 133 103 163 108 184 101 198 93 207','#cc7f86',2.1,.63)+stroke('M46 100Q54 77 77 75','#fff6dd',5,.54);
  for(let i=0;i<90;i++){const a=i*2.39996,r=Math.sqrt(i/90)*62,x=93+Math.cos(a)*r,y=137+Math.sin(a)*r*1.13;body+=ellipse(x,y,.72,.55,'#fff4d4','opacity=".24"');}
  body+='</g>'+path('M102 67Q103 44 117 38L123 42Q110 50 111 66Z','#947046','stroke="#7c5f3e" stroke-width="1"')+leaf('M117 47C128 25 153 27 169 34 155 50 137 56 117 47Z','M124 46 161 35M140 41 146 32','url(#p-leaf)');
  body+=path(cut,'url(#p-rind)','stroke="#b76772" stroke-width="1.35"')+`<g transform="translate(6 7) scale(.965 .95)">`+path(cut,'url(#p-flesh)','stroke="#ffe7b6" stroke-width="3"')+'</g>';
  body+=path('M165 127C145 127 131 147 133 170 134 191 151 207 170 200 191 191 204 169 198 150 194 135 179 122 165 127Z','#e9977c','opacity=".45"')+path('M166 137C148 137 139 151 143 170 147 190 158 201 171 190 185 178 192 161 183 147 179 140 172 137 166 137Z','url(#p-pit)','stroke="#92513d" stroke-width="1.3"');
  body+=stroke('M166 142C156 153 168 167 155 183M173 144C164 158 181 161 169 180M151 150C149 163 159 167 151 174M181 154Q172 165 178 172','#f0ba7c',1.55,.78)+stroke('M160 145Q153 150 156 160M169 159Q159 166 162 177M178 147 177 153','#713f34',1.2,.8);
  for(let i=0;i<13;i++){const a=i*2.4,r=36+(i%4)*3;body+=stroke(`M${167+Math.cos(a)*r} ${164+Math.sin(a)*r*.93}l${Math.cos(a)*5} ${Math.sin(a)*5}`,'#fff5d3',1.1,.5);}
  body+=stroke('M115 154C119 132 133 115 149 112','#fff9dc',2.7,.8)+ellipse(210,174,2.2,5,'#fff2d1','opacity=".55" transform="rotate(18 210 174)"');
  return document('水蜜桃',defs,body);
}

export const produceSamples = [
  {name:'番茄',group:'蔬菜',design:{silhouette:'扁圆多瓣果体与放射萼片',angle:'三分之四偏俯视，显露蒂部',material:'薄亮果皮、柔和次表面反光与少量水珠',identity:'成熟红果与绿色蒂冠，主体不加五官',container:'无'},svg:tomato()},
  {name:'黄瓜',group:'蔬菜',design:{silhouette:'沿原版保留斜向长椭圆半切造型，单主体完整呈现',angle:'三分之四偏俯视，切面朝上，斜向右上',material:'薄深绿瓜皮、柔和侧面体积、湿润浅绿果肉与两列乳白瓜籽',identity:'保留原版长椭圆瓜身，精修皮肉厚度与籽瓤，避免新增散落切片',container:'无'},svg:cucumber()},
  {name:'西兰花',group:'蔬菜',design:{silhouette:'伞形花冠与分叉粗茎',angle:'偏俯视，花冠遮挡与茎部关系明确',material:'密实颗粒花蕾、浅色纤维茎与薄叶',identity:'不同大小花冠聚成树形，保留茎部',container:'无'},svg:broccoli()},
  {name:'草莓',group:'鲜果',design:{silhouette:'圆肩尖底果体与舒展萼叶',angle:'三分之四近正面，略露顶部',material:'红润果肉、内凹籽窝与金色种籽',identity:'独立凹陷籽点、绿色蒂冠及锥形轮廓',container:'无'},svg:strawberry()},
  {name:'甜橙',group:'鲜果',design:{silhouette:'完整圆果与前置半切橙',angle:'前切面与后果体形成深度',material:'颗粒果皮、厚白膜与分瓣多汁果肉',identity:'橙瓣放射结构和果皮厚度',container:'无'},svg:orange()},
  {name:'水蜜桃',group:'鲜果',design:{silhouette:'柔软桃形整果与不规则半切面',angle:'三分之四偏俯视',material:'绒感粉白渐层、湿润果肉与沟纹桃核',identity:'果沟、粉白表皮、深色桃核',container:'无'},svg:peach()},
];

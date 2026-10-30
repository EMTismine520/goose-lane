// New review alternatives. Previously selected art and game content remain independently stored.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.4,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".12" y1=".1" x2=".86" y2="1">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const radial=(id,colors)=>`<radialGradient id="${id}" cx=".3" cy=".22" r=".87">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</radialGradient>`;
const doc=(name,prefix,defs,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 肉禽整链新设计</title><defs>${defs}</defs><g stroke="#342720" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`.replace(/id="/g,`id="${prefix}-`).replace(/url\(#/g,`url(#${prefix}-`);

function eggs(){
  const egg='M-2-75C-24-71-51-28-52 5C-55 44-31 66 0 66C35 66 55 43 51 8C48-28 22-71-2-75Z';
  const defs=radial('back',['#fff8df','#f7e6be','#dcb991'])+radial('front',['#fffbed','#fceacf','#e6c19d']);
  let body='<g transform="translate(94 117) rotate(-19)">'+p(egg,'url(#back)')+line('M-24-47C-37-30-42-12-39 3','#fffbed',5,.86)+line('M20 39Q33 27 34 9','#caa382',1.5,.5)+'</g>';
  body+='<g transform="translate(160 156) rotate(25)">'+p(egg,'url(#front)')+line('M-26-41C-38-24-41-11-38 1','#fffdf0',5,.9)+line('M-31 28C-23 44-7 49 11 45','#e1b996',1.5,.65)+e(-31,-13,2.3,4.6,'#fffdf3','stroke="none" opacity=".75"')+'</g>';
  return doc('鸡蛋','r4-eggs',defs,body);
}

function gizzards(){
  const back='M60 53C39 55 28 72 34 92C34 117 55 132 82 126C104 122 117 101 110 80C105 60 82 47 60 53Z';
  const body='M93 103C113 83 150 88 176 105C207 120 220 146 208 171C194 201 160 214 127 202C101 194 81 170 81 146C81 129 84 113 93 103Z';
  const face='M121 118C146 108 179 119 191 140C200 155 187 176 165 183C140 189 112 174 106 156C101 140 108 126 121 118Z';
  const defs=radial('whole',['#c58d87','#a06464','#683e46'])+grad('cutside',['#b47a72','#8a4f53','#633a43'])+radial('face',['#f7d7ac','#ddb089','#b67b65'])+radial('lining',['#f8ebbe','#dec58f','#b59765']);
  let art=p(back,'url(#whole)')+line('M49 73C59 61 77 61 87 71','#edb7a2',4,.65)+line('M48 100Q65 113 82 104','#663944',1.5,.66);
  art+=p(body,'url(#cutside)')+p(face,'url(#face)','stroke="#814e49" stroke-width="1.7"');
  art+=p('M123 132C139 121 167 129 175 145C182 157 171 170 157 171C140 173 122 161 121 149C120 143 119 137 123 132Z','url(#lining)','stroke="#ad8b60" stroke-width="1.4"');
  art+=line('M132 137C143 139 149 147 147 159M142 133C154 139 159 148 158 163M151 135C162 142 168 150 165 157','#bca074',1.3,.8)+line('M113 129Q123 117 137 120','#ffe5be',2.8,.7);
  art+=line('M97 163Q103 182 123 188','#ba8673',2,.65);
  return doc('鸡胗','r4-gizzard',defs,art);
}

function tenderloins(){
  const defs=radial('back',['#ffedd8','#f6cdb3','#d9a089'])+radial('front',['#fff0dd','#fbd8bf','#e7ae95'])+grad('side',['#e9bca2','#c9917d']);
  const top='M-82-17C-67-33-34-33-8-24C17-19 44-20 66-8C83-1 94 10 90 20C85 30 64 33 41 30C13 29-6 25-34 24C-57 24-86 10-88-3C-90-8-87-14-82-17Z';
  let art='<g transform="translate(130 82) rotate(-22)">'+p(top,'url(#back)')+line('M-64-12C-37-19-11-6 10-4','#fff2de',3.6,.75)+line('M-42 9Q8 11 45 18','#d49a85',1.3,.65)+'</g>';
  art+='<g transform="translate(123 131) rotate(-11)">'+p(top,'url(#side)','transform="translate(0 5)" stroke-width="2.7"')+p(top,'url(#front)')+line('M-67-12C-34-20-4-8 22-3','#fff5e3',4,.8)+line('M-50 8C-10 4 19 15 48 20','#d5a28b',1.3,.75)+'</g>';
  art+='<g transform="translate(123 177) rotate(7)">'+p(top,'url(#side)','transform="translate(0 4)" stroke-width="2.8"')+p(top,'url(#front)')+line('M-66-11C-43-17-18-10 3-5','#fff4df',3.9,.84)+line('M-42 5C-20 7 1 11 23 12M32 17 55 19','#d7a38a',1.3,.7)+'</g>';
  return doc('鸡里脊','r4-tenderloin',defs,art);
}

function breast(){
  const main='M66 69C86 44 121 39 150 54C173 63 183 89 196 109C214 134 229 164 211 185C194 205 158 206 130 202C98 201 73 210 52 193C29 176 32 151 41 126C49 105 52 85 66 69Z';
  const defs=radial('meat',['#fff0d8','#f9d7b8','#e9b296','#d08b77'])+grad('depth',['#edbca2','#d1957e','#b67b6b'])+`<clipPath id="clip">${p(main,'#fff')}</clipPath>`;
  let art=p(main,'url(#depth)','transform="translate(0 6)" stroke-width="3"')+p(main,'url(#meat)');
  art+='<g clip-path="url(#clip)" stroke="none">'+p('M135 53C144 83 141 104 153 127C163 148 181 171 195 192C222 178 219 154 200 123C183 94 179 69 153 56Z','#cb8b77','opacity=".17"')+p('M57 115C78 94 98 83 119 86C137 90 143 101 147 115C116 103 89 115 57 141Z','#ffe9ce','opacity=".63"')+'</g>';
  art+=line('M73 81Q94 58 121 59','#fff6e3',4.4,.86);
  art+=line('M60 138C84 116 107 119 130 128C155 139 177 155 194 172M53 155C74 139 98 142 123 150C147 156 162 172 177 184M62 174C83 161 108 168 127 176M112 78C124 95 132 106 146 117','#ca927e',1.3,.68);
  art+=line('M66 142C84 130 106 134 125 140M76 164Q95 158 114 169M135 144Q153 150 165 163','#fff0d7',1.55,.78)+line('M70 185Q92 197 120 191','#e4b39a',1.7,.8);
  return doc('鸡胸肉','r4-breast',defs,art);
}

export const poultryFrontCandidates=[
  {id:'fresh-poultry-1',name:'鸡蛋',svg:eggs(),reason:'整链全部提供新版：两枚错落摆放的鸡蛋，用暖白壳色、薄描边和柔和体积建立基础蛋品节点。',design:{silhouette:'两枚不同方向的椭圆鸡蛋前后错落，前后关系清楚',angle:'略俯视的斜放双蛋构图',material:'温暖奶油白蛋壳、柔和漫反射与克制亮斑',identity:'鸡蛋的尖钝两端及完整蛋壳，不增加表情',container:'无盛器，裸食材透明背景'}},
  {id:'fresh-poultry-2',name:'鸡胗',svg:gizzards(),reason:'重新组织整块与切面：酒红肌肉、浅金内壁分开，让鸡胗具有自己的结构与材质。',design:{silhouette:'后方完整鸡胗与前方斜切面形成紧凑双主体',angle:'三分之四略俯视，前块显露厚切面',material:'深酒红肌肉、浅褐切面和淡金内壁层次',identity:'紧实肌肉外层与浅金内壁，区别鸡肉与肉丸',container:'无盛器，无附加调料'}},
  {id:'fresh-poultry-3',name:'鸡里脊',svg:tenderloins(),reason:'替换造型难辨的鸡翅中，以三条柔软细长的鸡里脊建立自然肉形；采用后对应脆皮翅根拟同步为脆皮鸡柳。',design:{silhouette:'三条细长、不规则尖尾的里脊紧凑叠放',angle:'略俯视，三条肉自然错角而不平行排队',material:'奶油粉鸡肉、薄侧面与少量纤维方向',identity:'狭长里脊条与宽厚鸡胸形成明确剪影差异',container:'无盛器，作为生鲜原料'}},
  {id:'fresh-poultry-4',name:'鸡胸肉',svg:breast(),reason:'完整新画一块饱满厚鸡胸，以三角肩部、自然收边和顺向肌理区别里脊与腿肉。',design:{silhouette:'上窄下宽的不规则厚鸡胸，完整圆润边缘',angle:'三分之四略俯视，少量侧面显示厚度',material:'浅粉奶油肉色、顺向肌理与柔和湿润反光',identity:'宽厚胸肉大形，区别细长里脊与带骨腿肉',container:'无盛器、无装饰配菜'}}
];

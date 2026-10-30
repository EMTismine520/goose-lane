// Review proposal only. A trimmed whole gizzard and one oblique half, kept compact.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.4,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const gradient=(id,colors,radial=false)=>radial
  ? `<radialGradient id="${id}" cx=".29" cy=".18" r=".92">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</radialGradient>`
  : `<linearGradient id="${id}" x1=".15" y1="0" x2=".83" y2="1">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

const whole='M65 54C47 56 35 70 37 89C27 107 31 126 43 140C58 157 82 158 97 148C109 140 114 130 116 120C133 123 145 112 148 97C153 78 143 61 129 55C116 49 103 53 95 61C85 55 74 52 65 54Z';
const halfSide='M123 145C138 133 162 133 180 141C198 149 210 163 207 178C205 190 188 201 166 202C147 202 126 190 119 177C112 164 113 153 123 145Z';
const halfFace='M125 140C139 129 159 128 178 136C195 142 209 155 207 167C206 181 185 189 166 188C145 188 124 177 118 164C114 154 116 147 125 140Z';
const defs=gradient('gz9-muscle',['#d79c95','#bf7c78','#9b5858','#783f46'],true)
  +gradient('gz9-back',['#cf8b84','#a85f5c','#80434a'])
  +gradient('gz9-side',['#a96763','#8d4b4d','#68343e'])
  +gradient('gz9-cut',['#e8b3a5','#cf8b7e','#b26d69'],true)
  +gradient('gz9-tendon',['#fff0d9','#ead3bd','#d6b39e'])
  +`<clipPath id="gz9-whole">${p(whole,'#fff')}</clipPath>`
  +`<clipPath id="gz9-cutclip">${p(halfFace,'#fff')}</clipPath>`;

let art=p(whole,'url(#gz9-back)','transform="translate(0 3)" stroke-width="2.8"');
art+=p(whole,'url(#gz9-muscle)');
art+='<g clip-path="url(#gz9-whole)" stroke="none">';
art+=p('M84 51C109 77 104 108 93 133C83 151 63 160 39 146L35 171L118 175L162 83L142 45Z','#673a43','opacity=".15"');
art+=p('M41 92C39 72 53 61 67 61C80 61 82 67 77 70C62 73 54 83 51 95C48 102 41 100 41 92Z','#f5c7b3','opacity=".42"');
art+=p('M104 62C112 57 128 60 136 69C142 75 140 80 136 80C128 70 116 67 107 70C100 71 99 66 104 62Z','#edb6a6','opacity=".32"');
art+='</g>';
// A short oblique pale connective seam makes the two muscle lobes read as one gizzard.
art+=p('M82 66C87 74 91 81 97 86C104 93 112 95 122 95C124 99 122 103 118 104C104 103 94 98 87 91C80 84 76 77 75 70C77 67 79 66 82 66Z','url(#gz9-tendon)','stroke="none"');
art+=line('M80 71Q88 91 110 98','#fff4df',1.3,.72);
art+=line('M47 110C52 127 62 135 77 139M51 107C59 122 69 129 83 132M113 72Q129 79 134 88','#713e47',1.4,.33);
art+=line('M44 107C48 122 57 131 68 135M108 69Q121 72 128 79','#f0b4a2',1.3,.58);
art+=line('M59 147Q75 151 87 141','#e0a092',1.7,.5);
art+=p(halfSide,'url(#gz9-side)');
art+=p(halfFace,'url(#gz9-cut)');
art+='<g clip-path="url(#gz9-cutclip)" stroke="none">';
art+=p('M126 148C143 135 167 138 187 151C196 158 202 167 204 175L216 155L174 121L126 124Z','#f1c5af','opacity=".32"');
art+=p('M130 152C144 144 163 145 178 152C189 157 194 164 192 169C181 171 166 167 155 164C143 160 137 156 130 152Z','#aa6664','opacity=".45"');
art+='</g>';
art+=line('M127 144C140 136 159 136 176 143','#ffdbc0',2.4,.85);
art+=line('M129 150Q146 142 164 150M128 157Q147 150 173 160M133 165Q151 160 180 170M144 174Q163 170 184 176','#f1bb9f',1.45,.65);
art+=line('M145 145Q154 150 160 160M158 145Q170 151 176 164M171 149Q181 154 185 163','#9b595a',1.2,.32);
art+=line('M123 174Q135 191 159 195','#c98679',1.6,.54);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>鸡胗 · 去膜整胗与斜切肌肉面</title><defs>${defs}</defs><g stroke="#3e2b27" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

export const gizzardCandidates=[{
  id:'fresh-poultry-2',name:'鸡胗',svg,
  design:{
    silhouette:'后方一枚有轻微凹腰的完整双肌瓣鸡胗，前方一块横向斜切胗肉，紧凑错角摆放而非两颗等大圆块',
    angle:'三分之四俯视，整胗显露肌瓣与短筋膜，切块以斜切面显露厚度',
    material:'温润玫瑰褐肌肉、少量暖白筋膜和偏浅红棕切面，肌纤维以克制弧线表现',
    identity:'完整胗的连体肌瓣、斜向短筋膜与前方厚切片共同表达鸡胗，区别鹅肝、鸡胸与圆形肉丸',
    container:'无器具、无配菜、透明背景；低阶小体量，与整链已确认尺寸一致',
  },
  reason:'保留鸡胗食材，重新设计整胗加斜切块的组合，用肌瓣、短筋膜和厚实切面替代旧版两颗紫褐圆块；外轮廓仍保持原有清晰细深描边。',
}];

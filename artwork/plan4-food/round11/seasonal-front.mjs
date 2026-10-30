// Round 11 review alternatives only. Original/runtime artwork is never overwritten.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const l=(d,color,width=1.45,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const g=(id,colors,radial=false)=>radial
  ? `<radialGradient id="${id}" cx=".26" cy=".18" r=".95">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</radialGradient>`
  : `<linearGradient id="${id}" x1=".08" y1=".02" x2=".86" y2="1">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 时蔬新稿</title><defs>${defs}</defs><g stroke="#3c2e25" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function mushroom(){
  const cap='M38 121C40 96 51 75 72 65C92 54 117 57 136 68C154 79 168 97 169 117C137 133 82 139 38 121Z';
  const defs=g('sm11-cap',['#f7d49c','#dbab6f','#b57e47'],true)+g('sm11-stem',['#fff9e5','#eddfc4','#cbb799'])+g('sm11-under',['#e4c49a','#bd9468'])+`<clipPath id="sm11-cap-clip">${p(cap,'#fff')}</clipPath>`;
  const one=(small=false)=>{
    let a=p('M88 126C89 145 84 170 88 188C100 198 120 196 128 185C125 165 124 144 126 126Z','url(#sm11-stem)');
    a+=p('M116 128C111 150 111 176 120 190C126 186 130 184 127 176L126 126Z','#bfa989','opacity=".2" stroke="none"');
    a+=l('M97 142C97 159 94 172 99 182','#fffaf0',3,.8);
    a+=p('M40 119C78 101 126 103 168 115C158 135 75 147 40 124Z','url(#sm11-under)');
    a+=l('M65 126Q89 136 109 133M113 132Q137 128 150 122','#ac8059',1.35,.65);
    a+=p(cap,'url(#sm11-cap)');
    a+='<g clip-path="url(#sm11-cap-clip)" stroke="none">';
    a+=p('M133 66C151 91 144 112 138 129L180 121L171 82Z','#8e603b','opacity=".12"');
    a+=p('M57 102C59 85 80 72 99 71C105 72 103 76 98 78C82 79 70 87 66 103C63 110 57 109 57 102Z','#fff0cc','opacity=".7"');
    a+='</g>';
    a+=l('M53 119Q102 134 157 117','#f5d6ab',1.6,.78);
    return a;
  };
  const art='<g transform="translate(157 119) rotate(17) scale(.65) translate(-105 -128)">'+one(true)+'</g>'
    +'<g transform="translate(-7 10) rotate(-9 105 132)">'+one()+'</g>';
  return doc('蘑菇',defs,art);
}

function corn(){
  const cob='M102 63C113 48 136 47 148 62C160 76 158 110 154 140C150 165 141 186 127 194C111 187 102 164 98 140C93 111 92 78 102 63Z';
  const defs=g('sc11-cob',['#ffe9a7','#f1c65e','#d7a33f'])+g('sc11-kernel',['#fff0b5','#f9d87b','#e5b14c'])+g('sc11-leaf',['#bfda81','#87b65a','#4e8243'])+g('sc11-fold',['#96bf66','#619748','#3d6d3c'])+`<clipPath id="sc11-cob-clip">${p(cob,'#fff')}</clipPath>`;
  let art=p(cob,'url(#sc11-cob)');
  art+='<g clip-path="url(#sc11-cob-clip)" stroke="#c49a45" stroke-width="1.05">';
  for(let row=0;row<8;row++)for(let col=0;col<4;col++){
    const x=104+col*13.8,y=68+row*14.5+(col%2?1.8:0);
    art+=e(x,y,6.1,6.5,'url(#sc11-kernel)');
    if(col<2)art+=l(`M${x-2.8} ${y-1.3}Q${x-1} ${y-4.5} ${x+1.5} ${y-3.5}`,'#fff7cb',1.1,.8);
  }
  art+='</g>';
  art+=p('M125 198C97 187 78 166 69 140C63 124 62 113 58 103C89 115 110 140 120 170Z','url(#sc11-fold)');
  art+=p('M128 197C129 169 142 141 162 124C176 112 185 104 192 91C195 120 187 146 168 168C157 183 144 194 128 197Z','url(#sc11-leaf)');
  art+=p('M125 197C105 183 99 158 93 141C86 124 77 111 69 103C98 111 121 139 130 169C134 182 131 193 125 197Z','url(#sc11-leaf)');
  art+=l('M77 116C96 133 109 162 122 188','#d6e8a4',1.6,.8);
  art+=l('M137 187C157 158 174 143 184 112','#d4e6a3',1.7,.83);
  art+=p('M121 193L135 191L137 209Q128 216 120 208Z','#d0c181','stroke-width="2.8"');
  art+=l('M125 198L125 207','#f2e4a7',1.45,.9);
  return doc('玉米',defs,'<g transform="rotate(-12 128 130)">'+art+'</g>');
}

function cabbage(){
  const ball='M112 56C134 52 149 59 160 71C182 72 191 88 191 105C205 123 201 144 187 157C184 180 161 192 139 190C118 201 93 191 83 180C60 177 52 157 56 138C47 118 53 96 68 85C72 64 91 56 112 56Z';
  const defs=g('sg11-purple',['#d3a0c9','#af78a9','#845782'],true)+g('sg11-leaf',['#b88bb8','#956794','#6c4b75'])+g('sg11-pale',['#f4dfec','#e1bed8','#c794bb'])+g('sg11-edge',['#9b6595','#714772'])+`<clipPath id="sg11-ball-clip">${p(ball,'#fff')}</clipPath>`;
  let art=p(ball,'url(#sg11-purple)');
  art+='<g clip-path="url(#sg11-ball-clip)">';
  art+=p('M67 92C91 87 107 99 112 122C111 148 126 172 146 195C115 201 72 180 58 156Z','url(#sg11-leaf)','stroke="none" opacity=".7"');
  art+=p('M161 67C139 82 133 109 143 134C151 153 173 171 195 176L210 89Z','#6c4775','opacity=".14" stroke="none"');
  art+=l('M120 69C105 91 105 112 115 133C122 150 129 163 127 183','#efd7e9',2.2,.82);
  art+=l('M113 128C98 119 83 114 67 117M115 132C96 143 89 156 86 169M135 83C150 91 160 107 164 124M155 155C169 150 183 143 192 132','#e2bfdb',1.7,.72);
  art+=l('M74 80C86 71 98 68 111 68','#f1d4e6',2.6,.55);
  art+='</g>';
  // A short thick wedge exposes folded broad leaf layers, rather than onion-like rings.
  art+=p('M137 145L180 123C199 131 214 151 215 171C201 186 179 198 163 198L130 176Z','url(#sg11-edge)');
  art+=p('M137 145L180 123C198 132 209 148 211 164C197 180 178 187 160 185Z','url(#sg11-pale)');
  art+=l('M146 147L179 132C191 141 200 152 202 163C190 173 177 179 163 176M155 149L177 142C184 147 190 153 192 160C183 166 175 170 166 168','#9a6796',1.65,.9);
  art+=l('M145 151L151 159L159 156L165 163L174 159M157 146L163 152L169 149L174 154M182 166L180 160L185 156','#ba8bb0',1.25,.8);
  art+=l('M136 177L163 193Q190 190 211 171','#c695ba',1.5,.7);
  return doc('紫甘蓝',defs,art);
}

function potato(){
  const whole='M79 73C101 61 132 61 154 73C180 74 199 93 199 115C204 139 188 160 165 173C145 187 119 188 98 180C74 182 52 169 46 149C35 128 44 104 60 89C65 81 71 77 79 73Z';
  const defs=g('st11-skin',['#f4d39c','#deb77d','#bd915c'],true)+g('st11-cut',['#fff0ae','#f4d77f','#d9b65a'])+g('st11-edge',['#d7a66c','#b7844f'])+`<clipPath id="st11-whole-clip">${p(whole,'#fff')}</clipPath>`;
  let art=p(whole,'url(#st11-skin)');
  art+='<g clip-path="url(#st11-whole-clip)" stroke="none">';
  art+=p('M158 73C173 111 149 159 120 187L164 192L199 143L188 88Z','#9b723f','opacity=".13"');
  art+=p('M70 103C75 83 92 74 111 73C118 74 118 78 111 80C94 81 84 89 79 106C76 112 69 110 70 103Z','#ffebbd','opacity=".68"');
  art+='</g>';
  art+=l('M82 128Q88 124 91 129M126 87Q131 84 135 89M103 166Q108 162 112 166M160 115Q164 113 168 116','#ad804d',1.8,.7);
  art+=l('M83 130L86 132M128 90L131 92M103 168L106 170','#f1ce92',1.3,.8);
  // One broad yellow-fleshed cut piece overlaps the whole potato.
  art+=p('M151 140C169 133 190 142 201 158L195 184C178 194 159 190 147 174Z','url(#st11-edge)');
  art+=p('M151 140C168 132 189 141 201 158C190 177 169 182 147 168C141 158 143 147 151 140Z','url(#st11-cut)');
  art+=l('M153 148C163 142 179 146 186 151','#fff4bf',2.6,.7);
  art+=l('M153 174Q174 184 193 173','#e8bf7b',1.4,.65);
  return doc('土豆',defs,art);
}

export const seasonalFrontCandidates=[
  {id:'fresh-seasonal-1',name:'蘑菇',svg:mushroom(),expectedOccupancy:.68,design:{silhouette:'一大一小两朵错落蘑菇，厚圆菌盖与短乳白菌柄形成清楚的上下层次',angle:'略俯视，主菇向左轻倾，小菇在右后半遮挡',material:'暖褐菌盖、奶白菌柄、少量菌褶和宽软反光',identity:'宽菌盖、浅菌褶和短柄，不加斑点或繁密写实纹理',container:'裸食材透明背景，无盛器'},reason:'重新绘制主次错落的双菇，用厚菌盖和短奶白柄表现鲜嫩，保持低阶小体量和清楚细描边。'},
  {id:'fresh-seasonal-2',name:'玉米',svg:corn(),expectedOccupancy:.72,design:{silhouette:'一根短饱满金黄玉米穗，两片剥开的青绿苞叶托住下半段',angle:'整穗向左轻斜，正面可见稀疏整齐的玉米粒',material:'嫩黄饱满籽粒与柔润绿色苞叶，叶脊与高光有节制',identity:'金黄颗粒穗与半剥苞叶同时辨识，避免颗粒过密发黑',container:'无盘无绳，透明底'},reason:'用自然剥叶、短饱满穗形和克制颗粒重画玉米，小图保持金黄与绿色两块鲜明大形。'},
  {id:'fresh-seasonal-3',name:'紫甘蓝',svg:cabbage(),expectedOccupancy:.68,design:{silhouette:'一颗无长颈的圆润紫色叶球，前方一小厚切瓣露出紫白折叠层次',angle:'整球在左后，厚切瓣斜放于右前形成主次',material:'柔润紫叶、少量宽叶脉和浅紫白切面，保持清晰而不过密',identity:'宽叶包心与折叠层纹区别紫洋葱，不使用同心密环',container:'无盘无额外配菜，透明背景'},reason:'用宽叶包心与小块厚切面重做紫甘蓝，保持菜球身份，减轻密纹和大块面的低阶压迫感。'},
  {id:'fresh-seasonal-4',name:'土豆',svg:potato(),expectedOccupancy:.68,design:{silhouette:'一枚形体不规则的圆厚主土豆，前方一块小切面展示柔黄薯肉',angle:'主薯略俯视，切块在右前低位交叠',material:'干净暖土黄薯皮、少量浅眼孔与柔黄切面，宽软反光',identity:'不规则薯形、少量眼孔和黄肉切块，不发芽、不做泥点噪声',container:'无盘无装饰，透明背景'},reason:'以自然薯形、少量清楚眼孔和一块黄肉切面重画土豆，让低阶小图干净、有体积而不显笨重。'},
];

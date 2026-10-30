// Review alternative only: processed duck feet, with one broad webbed palm in front.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.4,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const gradient=(id,colors,radial=false)=>radial
  ? `<radialGradient id="${id}" cx=".32" cy=".2" r=".87">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</radialGradient>`
  : `<linearGradient id="${id}" x1=".1" y1=".1" x2=".86" y2="1">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

// Three rounded toe ends are joined by the broad web. The short heel has no exposed bone.
const palm='M118 171C114 153 108 143 92 135C75 125 59 112 50 95C45 85 50 78 58 76C69 75 79 82 88 82C91 70 94 59 104 57C115 55 121 68 127 79C140 76 156 59 168 64C180 70 168 88 162 102C158 115 154 128 147 137C139 149 136 160 141 172C135 181 125 181 118 171Z';
const defs=gradient('df7-skin',['#fff0cd','#f3d5a4','#dfb27b','#c7955f'],true)
  +gradient('df7-back',['#f7ddb0','#e5bd87','#c89660'],true)
  +gradient('df7-depth',['#dbad74','#be8653'])
  +`<clipPath id="df7-palm">${p(palm,'#fff')}</clipPath>`;

function foot(back=false){
  let art=p(palm,'url(#df7-depth)','transform="translate(0 3)" stroke-width="2.8"');
  art+=p(palm,`url(#${back?'df7-back':'df7-skin'})`);
  art+='<g clip-path="url(#df7-palm)" stroke="none">';
  art+=p('M140 74C145 105 130 129 132 149C131 169 138 187 145 198L158 169L176 99Z','#ba8856','opacity=".12"');
  art+=p('M58 91C74 92 90 108 103 112C115 113 124 100 125 85C128 116 122 134 111 136C89 132 68 113 58 91Z','#fff0cb','opacity=".28"');
  art+=p('M102 65C98 76 100 90 103 101C107 110 112 109 114 103C111 89 110 76 109 69C107 62 104 61 102 65Z','#fff9df','opacity=".12"');
  art+='</g>';
  art+=line('M126 166C120 147 108 129 82 106','#b98856',1.45,.61);
  art+=line('M129 153C136 136 145 118 153 99','#b78957',1.4,.58);
  art+=line('M125 141C119 126 112 111 110 94','#c19260',1.35,.5);
  art+=line('M88 115C99 126 111 133 119 135M134 132Q142 122 147 111','#ffe8ba',1.7,.8);
  art+=line('M57 85Q63 81 72 87M101 63Q107 59 112 69M150 78Q160 66 166 71','#fff8dd',2.6,.6);
  art+=line('M117 163Q127 168 136 165M120 173Q127 177 137 172','#bd8c57',1.3,.56);
  return art;
}

const art='<g transform="translate(159 105) rotate(29) scale(.7) translate(-128 -128)">'+foot(true)+'</g>'
  +'<g transform="translate(104 154) rotate(-22) translate(-128 -128)">'+foot(false)+'</g>';
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>鸭掌 · 去骨扇形蹼掌</title><defs>${defs}</defs><g stroke="#3b2b21" stroke-width="3.15" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

export const duckFeetCandidates=[{
  id:'fresh-poultry-3',name:'鸭掌',svg,
  design:{
    silhouette:'一块主掌与后方半遮挡小掌紧凑错角摆放，三枚圆润趾端连接成宽扇形蹼掌，掌根短宽',
    angle:'三分之四略俯视，两掌错向而不平行排列，前掌完整显露扇形大面',
    material:'淡蜜金与暖杏色的柔嫩去骨鸭掌，薄蹼面、轻微折痕和克制湿润反光',
    identity:'三趾扇形蹼掌与短掌根，不用五指、尖爪或外露长骨，区别蛋、内脏、肉串和腿肉',
    container:'无盛器、无配菜，裸食材透明背景',
  },
  reason:'以鸭掌替代鸭血：用三趾宽扇形和薄蹼面引入新的食材大形，与链内其余七项形成更清楚的结构差异。',
}];

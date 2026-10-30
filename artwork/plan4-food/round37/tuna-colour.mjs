// Round 37: warm seared tuna, with a readable cooked cut face and natural flakes.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.5,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".13" y1="0" x2=".8" y2="1">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;

function warmTuna(){
  const defs=grad('r37-tuna-plate',['#fbfcf0','#e0ece1','#abc6bd'])
    +grad('r37-tuna-sear',['#d49b77','#be7b58','#995c42'])
    +grad('r37-tuna-edge',['#bd7b52','#a26141','#824c36'])
    +grad('r37-tuna-cut',['#ffe5c9','#f3ccaa','#dca77f'])
    +grad('r37-tuna-gold',['#f1c77f','#dfa561','#bd7945']);
  let art=e(128,156,100,33,'url(#r37-tuna-plate)');
  art+=e(128,152,87,24,'#fffdf0','stroke="#adc3b1" stroke-width="1.4"');
  art+=line('M45 165Q78 185 117 185M137 184Q184 182 211 162','#fcfff6',1.9,.98);

  // One thick portion: a soft broad cut end and a naturally narrowing rear shoulder.
  art+=p('M66 115C68 103 80 97 93 95C106 86 119 86 131 89C146 84 158 91 168 100L183 110C195 118 191 131 180 142C171 154 157 160 141 157L94 152C80 152 66 145 62 133C58 125 60 119 66 115Z','url(#r37-tuna-edge)');
  // The seared top rolls gently into the peach-ivory cut face rather than a hard box.
  art+=p('M67 114C72 103 83 101 95 100C107 91 119 93 131 96C145 90 155 98 164 106L180 115Q186 121 179 129C169 140 156 146 144 144L99 136Q80 137 69 127Q64 121 67 114Z','url(#r37-tuna-sear)','stroke="#7a5038" stroke-width="1.7"');
  art+=p('M73 110Q84 103 95 106Q106 97 119 101L130 103Q143 96 153 104L166 114Q155 110 146 118Q132 114 121 121Q108 115 96 120Q82 115 73 121Z','url(#r37-tuna-gold)','stroke="none" opacity=".89"');
  art+=p('M91 108Q99 101 108 104Q113 107 116 111Q104 109 98 116L90 116Z','#efbf85','stroke="none" opacity=".9"');
  art+=p('M142 108Q149 102 155 108L169 120L164 128Q155 122 148 123Q149 115 142 108Z','#d89256','stroke="none"');
  // Wide, warm cooked flesh is visible at the front, with a thin caramelised rim.
  art+=p('M67 117Q76 113 87 120L112 132Q128 136 131 144L126 151Q114 157 101 152L79 146Q66 141 63 132Q60 123 67 117Z','url(#r37-tuna-cut)','stroke="#9a6549" stroke-width="1.6"');
  art+=p('M69 120Q76 118 84 123L96 129Q101 133 102 141L94 144L78 138Q68 134 66 127Z','#ffebd1','stroke="none"');
  art+=p('M99 130L111 136Q120 139 124 144L119 149L107 146Q107 137 99 130Z','#f9dfbc','stroke="none"');
  // Unequal muscle flakes bend into the cut; these are short fibres, not salmon fat bands.
  art+=line('M73 124Q82 126 88 133Q92 138 92 142M86 123Q95 128 99 136L100 143','#c49170',1.4,.95);
  art+=line('M104 136Q113 139 118 146M77 137L85 141M103 147L112 150','#cf9b76',1.35,.96);
  art+=line('M71 121Q77 120 82 123M93 129L97 134M110 136L117 140M81 144L90 147','#fff4df',1.6,.98);
  // Two gently opening flake seams and three small char accents keep the surface edible.
  art+=line('M103 111Q112 115 113 123L118 128M128 108Q135 114 139 121L146 124','#985f41',1.45,.9);
  art+=line('M102 109Q109 112 111 118M128 106Q134 109 136 114','#f5d49c',1.55,.98);
  art+=line('M87 111L92 108M122 127L127 124M160 132L165 127','#784b33',1.7,.94);
  art+=line('M79 106Q85 103 91 104M142 96Q150 96 155 101M174 115L178 119','#ffe2ae',1.8,.98);
  art+=line('M142 151L151 152Q163 151 171 144','#d6a172',1.5,.94);
  art+=p('M156 110Q159 108 162 110Q161 113 158 114Z','#ffe2ae','stroke="none" opacity=".85"');

  // One clear lemon wedge; its yellow peel supplies a fresh accent without extra toppings.
  art+=p('M177 153Q188 136 203 142L214 153Q199 168 181 162Z','#efc930','stroke="#8e7537" stroke-width="2"');
  art+=p('M181 153Q190 142 201 145L209 153Q198 162 184 159Z','#fff0a0','stroke="#d1b14a" stroke-width="1.3"');
  art+=line('M184 153L206 153M191 146L195 156M200 147L198 157','#fffbe0',1.35,.98);
  art+=line('M183 162Q198 167 210 157','#ffe45e',1.45,.96);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>炭烧金枪鱼排 · 暖玫瑰棕熟鱼排重绘</title><defs>${defs}</defs><g transform="translate(0 -8)" stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const tunaColourCandidate={
  id:'dish-fresh-ico-0079',
  name:'炭烧金枪鱼排',
  svg:warmTuna(),
  expectedOccupancy:.82,
  reason:'一块自然厚切、后肩收尖的金枪鱼排，以暖玫瑰棕和焦糖金薄焦壳代替单调灰褐；宽阔浅桃米色熟切面呈现短纤维与自然分瓣，克制油亮高光和一小角清亮鲜黄柠檬增加食欲。',
  design:{
    silhouette:'单块厚实自然鱼排，宽切端柔软分瓣，后肩自然收尖，避开规则硬盒轮廓',
    angle:'三分之四俯视，薄焦壳与前侧熟鱼切面都有清楚厚度',
    material:'暖玫瑰棕至焦糖金熟表层、浅暖桃米色鱼肉、短纤维分瓣与少量油润高光',
    identity:'只有金枪鱼和一小角柠檬；熟鱼肉不呈寿司深红，不使用橙粉白脂纹的三文鱼质感',
    container:'浅青白陶盘，含盘主体82%，清楚细近黑描边，透明留白和视觉居中'
  }
};

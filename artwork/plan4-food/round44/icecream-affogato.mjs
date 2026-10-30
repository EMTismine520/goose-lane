// Round 44: one pale ice-cream scoop, half immersed in espresso, in a low clear glass.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.5,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;

function affogato(){
  const defs=grad('r44-affogato-glass',['#eaf5ef','#cfdfd6','#afc7bd'])
    +grad('r44-affogato-coffee',['#ab763e','#81502f','#503326'])
    +grad('r44-affogato-surface',['#b18047','#936333','#6d452a'])
    +grad('r44-affogato-scoop',['#fffef1','#fff3da','#e8d6b6'])
    +grad('r44-affogato-melt',['#fff0ca','#e8c485','#cda15e']);
  // The transparent, handleless glass is squat and wide; there is no cup stem or saucer.
  let art=p('M30 118C33 159 62 183 128 200C194 200 223 161 226 118Z','url(#r44-affogato-glass)','stroke="none" fill-opacity=".22"');
  art+=line('M30 118C33 159 62 193 128 200C194 200 223 161 226 118','#49382d',3.1);
  art+=p('M42 132Q48 165 77 183Q128 203 179 183Q208 163 214 132Z','url(#r44-affogato-coffee)','stroke="#6d4b31" stroke-width="1.5"');
  art+=e(128,128,86,25,'url(#r44-affogato-surface)','stroke="#76502f" stroke-width="1.6"');
  art+=line('M54 123Q66 112 89 111M170 113Q190 117 199 126','#d5a766',1.6,.92);
  // The back rim is drawn before the scoop so the glass never cuts through the ice cream.
  art+=line('M30 118C30 102 74 90 128 90C182 90 226 102 226 118','#748b80',1.7,.98);
  art+=line('M38 113Q53 98 78 98M182 99Q204 102 216 114','#f7fff4',1.8,.94);
  // One softly irregular round scoop, with its lower half subsequently covered by coffee.
  art+=p('M87 120C85 103 97 85 114 80C132 74 151 84 162 100Q173 115 166 132Q159 149 139 155Q118 161 101 146Q89 137 87 120Z','url(#r44-affogato-scoop)','stroke="#78684f" stroke-width="2.4"');
  art+=p('M95 113Q98 94 114 89Q131 83 144 94Q129 88 119 96Q105 95 98 115Z','#fffef2','stroke="none" opacity=".9"');
  art+=line('M103 95Q114 84 128 88M137 91Q148 96 151 104','#fffef7',1.8,.98);
  art+=line('M97 116Q101 105 109 104M120 99Q134 97 143 108M152 116Q157 122 153 128','#dfceae',1.35,.9);
  art+=line('M107 125Q116 131 126 127','#eadabc',1.4,.86);
  // A curved coffee boundary submerges about half the scoop; it is not a milk-foam layer.
  art+=p('M42 130Q65 139 87 128Q104 118 124 123Q147 118 168 129Q191 139 214 130L207 157Q190 187 128 191Q65 189 49 157Z','url(#r44-affogato-coffee)','stroke="none"');
  art+=p('M56 133Q73 140 90 132Q109 123 126 129Q147 123 165 133Q185 141 201 133Q182 149 161 151Q129 159 99 151Q73 149 56 140Z','url(#r44-affogato-surface)','stroke="none" opacity=".88"');
  // Melting ice cream makes a single light-gold swirl that visibly mixes into the dark coffee.
  art+=p('M98 125Q106 123 116 127Q127 125 137 131Q152 132 158 140Q163 149 149 153Q132 158 119 147Q132 152 145 149Q153 147 151 142Q149 137 137 137Q124 134 114 131Q105 131 98 128Z','url(#r44-affogato-melt)','stroke="none"');
  art+=line('M102 126Q110 125 116 129M125 130Q134 130 140 134M148 139Q158 144 149 148','#fff3d3',1.55,.98);
  art+=line('M122 147Q130 152 140 151','#e4bd7b',1.4,.98);
  art+=line('M66 137Q76 142 85 138M177 141L186 137M87 155Q92 157 98 157','#d0a15e',1.4,.8);
  // Clear front lip and restrained reflections preserve the transparent glass identity.
  art+=line('M30 118C31 154 225 154 226 118','#748b80',1.8,.98);
  art+=line('M37 122Q46 139 66 143M187 143Q210 137 220 122','#f8fff4',1.9,.95);
  art+=line('M43 144Q48 166 64 177M212 144Q207 166 193 178','#f7fff7',2,.93);
  art+=line('M55 147L59 157M200 157L204 146','#c6ddd0',1.4,.84);
  art+=line('M79 190Q125 206 178 188','#f5fff4',1.9,.97);
  art+=line('M91 196Q129 205 165 195','#b6cec0',1.4,.82);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>阿芙佳朵 · 透明矮杯单球咖啡甜品</title><defs>${defs}</defs><g transform="translate(0 -12)" stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const icecreamAffogatoCandidates=[
  {id:'dish-fresh-ico-0126',code:'DS111',name:'阿芙佳朵',expectedOccupancy:.84,svg:affogato(),
    reason:'矮宽无柄透明玻璃杯内，一颗奶白黄油冰淇淋球半浸深琥珀浓缩咖啡，融化浅金涡纹混入咖啡，清楚玻璃杯沿与克制反光保留甜品层次。',
    design:{silhouette:'一只矮宽无柄透明玻璃杯与单个圆润奶白冰淇淋球，咖啡约淹没半球',angle:'三分之四俯视，透明杯沿、深咖啡面、半露球体和低矮玻璃壁分层',material:'奶白柔润冰淇淋、深琥珀棕浓缩咖啡、浅金融化涡纹和透明玻璃反光',identity:'仅黄油冰淇淋与浓缩咖啡，不加饼干、巧克力片、水果、薄荷、咖啡壶或手',container:'矮宽无柄透明玻璃甜品杯，含杯84%，区别于DS109双巧球蓝绿瓷杯及DS110浅黄单quenelle低碟，透明留白'}}
];

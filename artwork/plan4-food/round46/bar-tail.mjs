// Round 46: a compact energy can and a low double-wall coconut espresso glass.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.5,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 吧台新版候选</title><defs>${defs}</defs><g transform="translate(0 ${dy})" stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function coconutEnergy(){
  const defs=grad('r46-energy-white',['#fffef3','#edf4e7','#d6e2d1'])
    +grad('r46-energy-green',['#95d282','#6abd6d','#439b58'])
    +grad('r46-energy-yellow',['#fff0a2','#f0d85e','#d7b942'])
    +grad('r46-energy-metal',['#f2f5ea','#d7e1d3','#aebfab']);
  // Short, rounded aluminium can: broad shoulders and rolled metal edges, never a bottle.
  let art=p('M48 51L49 211Q128 242 207 211L208 51Z','url(#r46-energy-white)');
  art+=p('M51 99Q89 116 125 103Q168 88 205 92L205 203Q170 216 128 218Q82 215 51 203Z','url(#r46-energy-green)','stroke="none"');
  art+=p('M126 61Q165 70 204 61L205 98Q181 110 155 115L128 102Z','url(#r46-energy-yellow)','stroke="none"');
  art+=p('M51 156Q85 170 121 159Q165 145 205 158L205 180Q164 170 124 182Q83 193 51 177Z','#d6efbf','stroke="none" opacity=".78"');
  art+=line('M63 77L64 190M195 78L196 189','#fffef7',1.9,.82);
  // One small energy bolt is a simple printed symbol, with no text or oversized branding.
  art+=p('M132 115L115 139L127 136L121 153L142 129L130 132Z','#ffe371','stroke="#5d7c42" stroke-width="1.7"');
  art+=line('M130 120L120 135M129 138L126 144','#fff2b2',1.3,.98);
  // A quiet lower metal roll keeps the material distinct from frosted glass.
  art+=p('M50 205Q128 233 206 205L205 214Q128 244 51 214Z','url(#r46-energy-metal)','stroke="#73866f" stroke-width="1.6"');
  art+=line('M63 214Q128 235 193 214','#f9fff3',1.85,.95);
  art+=line('M75 221Q128 235 182 220','#bdcdb7',1.35,.9);
  // The sealed top and its pull-ring are visible in the slightly raised viewpoint.
  art+=e(128,51,80,19,'url(#r46-energy-metal)');
  art+=e(128,51,68,12,'#d3dfce','stroke="#8d9e87" stroke-width="1.4"');
  art+=e(128,44,14,5.4,'#9eaf99','stroke="#7d9077" stroke-width="1.3" transform="rotate(7 128 44)"');
  art+=p('M115 49Q112 43 119 42L134 44Q145 47 142 56Q137 63 126 59L117 55Z','url(#r46-energy-metal)','stroke="#71856c" stroke-width="1.5"');
  art+=e(128.5,50,6.3,3.1,'#91a38b','stroke="#7b9072" stroke-width="1.2" transform="rotate(9 128.5 50)"');
  art+=line('M118 46L121 45M135 47L138 50','#fbfff4',1.35,.98);
  art+=line('M65 44Q85 35 108 36M153 36Q177 37 193 45','#fafff1',1.65,.96);
  // Only a few condensation drops; the big white, green and yellow areas remain readable.
  art+=e(76,117,1.8,2.5,'#f9fff4','stroke="#acc8a3" stroke-width="1.2"');
  art+=e(177,144,1.8,2.7,'#f9fff4','stroke="#94ba8c" stroke-width="1.2"');
  art+=e(87,184,1.5,2,'#f9fff4','stroke="#b7d0ac" stroke-width="1.2"');
  return doc('椰青能量饮',defs,art,-2);
}

function coconutEspresso(){
  const defs=grad('r46-espresso-glass',['#edf7ec','#d5e6d8','#b0c9b9'])
    +grad('r46-espresso-water',['#fff9df','#f4e7bd','#dfc98e'])
    +grad('r46-espresso-coffee',['#ad7a47','#835331','#513627'])
    +grad('r46-espresso-top',['#ac7b46','#8e5e34','#71492d'])
    +grad('r46-espresso-syrup',['#f5cf7b','#d8a34a','#b87c2e']);
  // A clear handle and an air gap between the two walls identify a small hot-drink glass.
  let art=p('M192 120Q222 111 234 134Q247 158 227 177Q211 192 191 177L197 165Q211 176 223 161Q234 148 224 136Q214 126 198 135Z','url(#r46-espresso-glass)','fill-opacity=".28" stroke-width="2.7"');
  art+=line('M204 123Q222 122 229 138M226 165Q218 179 205 176','#f8fff2',1.7,.94);
  art+=p('M37 105Q39 172 68 191Q117 216 166 191Q195 172 197 105Z','url(#r46-espresso-glass)','stroke="none" fill-opacity=".22"');
  art+=line('M37 105Q39 172 68 191Q117 216 166 191Q195 172 197 105','#49382d',3.1);
  art+=line('M37 105C37 90 73 82 117 82C161 82 197 90 197 105','#78927e',1.7,.98);
  art+=p('M48 120Q51 162 73 179Q117 200 161 179Q183 162 186 120Z','url(#r46-espresso-water)','stroke="#bcbd98" stroke-width="1.4" fill-opacity=".84"');
  art+=p('M56 151Q81 163 113 158Q141 166 178 151L170 172Q118 194 65 171Z','#fff4d1','stroke="none" opacity=".28"');
  // The dark espresso is a real upper layer over clear coconut-gold water, with no milk foam.
  art+=p('M48 121Q80 114 117 118Q154 114 186 121L181 141Q154 155 117 153Q81 154 54 141Z','url(#r46-espresso-coffee)','stroke="#725030" stroke-width="1.5"');
  art+=e(117,121,69,19,'url(#r46-espresso-top)','stroke="#8a6337" stroke-width="1.4"');
  // One amber syrup thread dissolves at the interface; crema stays thin and natural.
  art+=p('M64 143Q84 151 103 147Q119 143 136 149Q154 152 173 144L172 148Q152 156 136 153Q118 148 103 151Q82 156 64 148Z','url(#r46-espresso-syrup)','stroke="none" opacity=".83"');
  art+=p('M123 151Q133 153 135 160Q136 166 145 168Q137 169 132 162Q130 157 123 155Z','#c69a52','stroke="none" opacity=".45"');
  art+=line('M79 117Q87 112 96 115M105 125Q118 130 133 123M148 118L158 120','#dbaf6b',1.4,.85);
  art+=line('M74 145Q89 151 101 147M139 151L151 152','#f6d68f',1.35,.97);
  // Inner profile, outer wall and separate front rim make the double glass wall easy to read.
  art+=line('M45 115Q48 170 74 185Q117 205 159 185Q187 170 189 115','#c0d7c6',1.5,.94);
  art+=line('M50 129Q54 164 70 177M185 129Q181 164 167 177','#f9fff1',1.9,.95);
  art+=line('M37 105C38 136 196 136 197 105','#78927e',1.7,.98);
  art+=line('M45 107Q55 121 76 124M161 124Q185 118 190 107','#fbfff1',1.8,.96);
  art+=line('M79 190Q117 208 157 190','#f8fff1',1.85,.96);
  art+=line('M91 199Q118 208 145 198','#b9d1bf',1.35,.88);
  return doc('椰青浓缩咖啡',defs,art,-12);
}

export const barTailCandidates=[
  {id:'dish-fresh-ico-0159',code:'DS122',name:'椰青能量饮',expectedOccupancy:.84,svg:coconutEnergy(),
    reason:'单只圆润短胖铝罐以奶白、活泼青绿和暖柠黄大色块组织，顶部清楚拉环、中央小闪电及少量冷凝小点保持清爽能量饮料身份，不做玻璃杯或瓶。',
    design:{silhouette:'单只短胖圆润铝罐，清楚金属罐顶、拉环与低矮卷边底',angle:'略俯视，能看见拉环和宽罐顶，罐身保持紧凑',material:'奶白铝罐、青绿与暖柠黄色块、金属冷光和少量冷凝小点',identity:'椰青水、能量汽水；仅简洁小能量闪电，无文字或巨大商标，不画杯瓶或额外食材',container:'短胖铝罐，含罐84%，细近黑描边、透明留白与视觉居中'}},
  {id:'dish-fresh-ico-0160',code:'DS123',name:'椰青浓缩咖啡',expectedOccupancy:.84,svg:coconutEspresso(),
    reason:'低圆透明双壁有柄小杯，下层透亮椰白金水与上层深咖啡棕清楚分层，一线琥珀糖浆在交界轻融，少量自然crema纹保留浓缩咖啡身份。',
    design:{silhouette:'低而略圆的有柄双壁小玻璃杯，杯柄、内外壁与两层液体清楚',angle:'三分之四俯视，深咖啡面、椰白金水、双壁空气层和小杯柄可辨',material:'清透椰白金水、深浓缩咖啡棕、薄琥珀糖浆线、少量crema与透明玻璃',identity:'仅椰青水、浓缩咖啡、糖浆，不画奶油、椰肉、咖啡豆或额外配料',container:'低圆透明双壁有柄小杯，含杯84%，非马提尼酒杯，透明留白与视觉居中'}}
];

// Round 43: a quiet porcelain bowl supports warm oats, four berries, and a little honey.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.5,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;

function berryHoneyOats(){
  const defs=grad('r43-oat-bowl',['#e9f3ea','#ccdfd4','#a2c0b4'])
    +grad('r43-oat-porridge',['#f7e9ca','#ead5ae','#cfb68a'])
    +grad('r43-oat-flake',['#f9e6be','#e2c698','#c5a575'])
    +grad('r43-oat-berry',['#9aa5dd','#717dbc','#535b9b'])
    +grad('r43-oat-honey',['#f9d77d','#e9b84b','#ca902a']);
  // A low, calm blue-green bowl leaves most of the visual emphasis on the food.
  let art=p('M33 142Q37 174 69 189Q126 211 188 187Q218 174 223 141Z','url(#r43-oat-bowl)');
  art+=e(128,140,95,32,'#f7faec');
  art+=e(128,139,83.5,24,'#d4dfc2','stroke="#a5b79c" stroke-width="1.4"');
  // Soft oats form a shallow, continuous mound rather than balls or whipped cream peaks.
  art+=p('M52 139Q51 127 64 122Q67 111 83 110Q99 99 116 104Q133 97 150 106Q170 102 181 115Q197 117 202 132Q207 142 193 152Q173 167 143 169Q110 172 81 160Q60 156 52 145Z','url(#r43-oat-porridge)');
  art+=p('M60 138Q74 124 91 131Q106 118 123 126Q141 115 158 127Q177 122 195 136Q185 152 160 156Q134 167 106 157Q78 159 62 147Z','#f9edcf','stroke="none" opacity=".7"');
  art+=p('M63 148Q82 145 100 150Q122 145 140 151Q163 145 184 147Q173 159 149 163Q118 169 88 157Z','#e7c99b','stroke="none" opacity=".45"');
  // A few flattened, gently folded oat flakes identify the grain without a granular heap.
  art+=p('M65 133Q70 128 77 131Q80 134 75 137Q68 139 65 133Z','url(#r43-oat-flake)','stroke="#c0a273" stroke-width="1.3"');
  art+=line('M69 132L74 134','#fdf2d6',1.3,.98);
  art+=p('M83 149Q88 144 95 148Q98 151 92 154Q86 155 83 149Z','url(#r43-oat-flake)','stroke="#c0a273" stroke-width="1.3"');
  art+=line('M87 149L92 151','#fff2d5',1.3,.98);
  art+=p('M105 158Q110 152 116 156Q119 160 112 162Q107 163 105 158Z','url(#r43-oat-flake)','stroke="#c0a273" stroke-width="1.3"');
  art+=p('M138 158Q144 153 150 156Q153 160 146 163Q140 164 138 158Z','url(#r43-oat-flake)','stroke="#c0a273" stroke-width="1.3"');
  art+=line('M142 157L147 159','#fcf0d0',1.3,.98);
  art+=p('M166 143Q170 137 177 141Q180 144 175 147Q168 149 166 143Z','url(#r43-oat-flake)','stroke="#c0a273" stroke-width="1.3"');
  art+=line('M170 142L175 144','#fff2d6',1.3,.98);
  art+=p('M180 129Q185 124 190 128Q193 131 187 134Q182 134 180 129Z','url(#r43-oat-flake)','stroke="#c0a273" stroke-width="1.3"');
  art+=p('M153 111Q158 107 163 111Q164 115 158 117Q154 116 153 111Z','url(#r43-oat-flake)','stroke="#c0a273" stroke-width="1.3"');
  art+=p('M86 115Q90 111 96 113Q99 117 93 119Q88 120 86 115Z','url(#r43-oat-flake)','stroke="#c0a273" stroke-width="1.3"');
  art+=line('M91 114L94 116','#fdf0d0',1.3,.98);
  // One restrained honey stream curls around the berry cluster and shines on the oats.
  art+=p('M157 117Q168 120 160 126Q155 131 144 132Q139 133 144 137L157 142Q167 146 158 151Q153 153 148 151Q157 150 157 147L141 141Q131 136 137 131Q141 128 151 128Q161 126 160 122L155 120Z','url(#r43-oat-honey)','stroke="none"');
  art+=line('M159 120Q166 123 158 126M144 132Q138 134 145 137M151 142L157 145','#ffeaa3',1.4,.98);
  art+=e(172,153,3.7,1.6,'#edbe55','stroke="none" opacity=".82"');
  art+=line('M170 152L173 152','#fff0b5',1.3,.98);
  // Four blueberries form one compact, unequal cluster; their small calyces face differently.
  art+=e(109,115,11.5,10.2,'url(#r43-oat-berry)','stroke="#474c79" stroke-width="1.9" transform="rotate(-15 109 115)"');
  art+=p('M106 112L109 109L111 112L114 113L112 116L109 115L106 117L105 114Z','#51588c','stroke="#737db3" stroke-width="1.2"');
  art+=line('M101 111Q104 107 108 109','#c4cbef',1.6,.98);
  art+=e(131,108,13.1,11.2,'url(#r43-oat-berry)','stroke="#474c79" stroke-width="1.9" transform="rotate(18 131 108)"');
  art+=p('M130 102L133 102L134 105L137 107L134 109L132 108L129 110L128 106Z','#51588c','stroke="#737db3" stroke-width="1.2"');
  art+=line('M122 105Q125 100 129 102','#c8cff1',1.65,.98);
  art+=e(150,123,10.5,9.5,'#7782bd','stroke="#474c79" stroke-width="1.9" transform="rotate(-23 150 123)"');
  art+=p('M151 119L154 120L154 123L156 125L152 126L150 124L147 124L148 121Z','#50588d','stroke="#737db3" stroke-width="1.2"');
  art+=line('M143 120Q145 116 149 117','#c3cbed',1.5,.98);
  art+=e(123,132,13.5,10.8,'url(#r43-oat-berry)','stroke="#474c79" stroke-width="1.9" transform="rotate(-9 123 132)"');
  art+=p('M124 128L127 126L129 129L132 131L130 134L126 133L124 135L122 131Z','#51588c','stroke="#737db3" stroke-width="1.2"');
  art+=line('M113 129Q116 124 121 126','#c7cef0',1.65,.98);
  art+=line('M116 139L121 141M143 130L146 131','#a0a9d4',1.35,.91);
  // Glazed ceramic has only a quiet highlight and one low side line.
  art+=line('M49 165Q77 190 119 194M141 194Q184 189 207 164','#f7fff4',1.8,.97);
  art+=line('M91 185Q128 197 165 184','#abc9bb',1.4,.88);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>浆果蜂蜜燕麦碗 · 甜品新版候选</title><defs>${defs}</defs><g transform="translate(0 -17)" stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const blenderMiddleCandidates=[
  {id:'dish-fresh-ico-0125',code:'DS107',name:'浆果蜂蜜燕麦碗',expectedOccupancy:.84,svg:berryHoneyOats(),
    reason:'一小碗温润燕麦占主要体量，四颗大小、方向不同的蓝紫莓聚拢在顶面，克制金色蜂蜜细流与少量扁平燕麦片使主料清楚，低蓝绿瓷碗安静承托。',
    design:{silhouette:'一小碗浅低燕麦，顶面四颗聚拢蓝莓与一股克制蜂蜜，不堆大量颗粒',angle:'三分之四俯视，温润燕麦面、莓果冠口、少量燕麦片和碗沿层次清楚',material:'暖米金燕麦、扁平燕麦片、深蓝紫莓、暖金蜂蜜与低饱和蓝绿瓷壁',identity:'仅蓝莓、燕麦、蜂蜜，不添加草莓、酸奶、坚果或绿叶；燕麦不画成肉丸或满碗奶油',container:'低蓝绿瓷碗，成品含碗84%，细近黑描边、透明留白与视觉居中'}}
];

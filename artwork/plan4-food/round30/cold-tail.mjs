// Round 30: garden leaves and amber century-egg wedges, editable vector masters.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".88" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 冷食新版候选</title><defs>${defs}</defs><g stroke="#493a2e" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function gardenSalad(){
  const defs=gradient('c30-salad-bowl',['#fffbea','#e9e6c9','#bac8a7'])
    +gradient('c30-salad-leaf',['#cbdf80','#98c45d','#63a14d'])
    +gradient('c30-salad-fold',['#a6d477','#72ae55','#478744'])
    +gradient('c30-salad-tomato',['#ffbc77','#ef7950','#ce4d39']);
  let art=p('M35 142Q38 133 48 133H208Q219 133 221 142L210 179Q204 196 183 201Q128 214 73 201Q52 195 46 179Z','url(#c30-salad-bowl)');
  art+=e(128,141,93,34,'#fff7df');
  art+=e(128,143,81,25,'#dce4bc','stroke="#a7b68e" stroke-width="1.4"');

  // Three broad lettuce folds make a readable, airy pile rather than tiny strips.
  art+=p('M63 143Q46 134 53 120Q43 109 57 100Q55 85 70 84Q76 70 91 81Q108 72 117 87Q130 88 126 103Q138 116 124 129L107 151Z','url(#c30-salad-fold)');
  art+=line('M73 95Q74 119 103 145M61 113L79 120M88 89L91 131M110 100L100 121','#dae8ad',1.6,.92);
  art+=p('M110 141Q99 127 108 113Q99 99 113 92Q108 76 125 73Q136 57 148 70Q164 61 172 76Q187 75 188 90Q202 101 192 113Q198 129 180 136L154 153Z','url(#c30-salad-leaf)');
  art+=line('M145 83Q143 109 145 145M121 92L141 114M172 90L145 121M180 112L149 134','#ecedb9',1.65,.95);
  art+=line('M118 105Q113 115 122 125M168 78Q176 80 177 87','#70a452',1.4,.8);
  art+=p('M83 156Q70 146 79 132Q70 118 84 113Q87 99 101 109Q113 102 122 113Q135 109 140 121Q155 125 146 139Q150 150 134 160L111 171Z','url(#c30-salad-leaf)');
  art+=line('M94 120Q104 140 120 158M85 136L108 143M122 120L113 145','#ebecb4',1.6,.92);

  const tomato=(x,y,a,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-27 10Q-21-17 1-26Q23-18 31 9Q5 25-27 10Z','url(#c30-salad-tomato)','stroke="#88452f" stroke-width="2.7"')
    +p('M-20 7Q-13-10 1-19Q16-12 23 6Q3 16-20 7Z','#ffce8c','stroke="none"')
    +p('M-11 5Q-7-6-1-11L1 5ZM6 6L5-12Q13-7 17 3Z','#f28a57','stroke="none"')
    +e(-7,1,2.3,1.5,'#ffedb6','stroke="none"')+e(11,1,2.3,1.5,'#ffedb6','stroke="none"')
    +'</g>';
  art+=tomato(78,151,-21,.86);
  art+=tomato(180,139,28,.86);
  art+=tomato(139,165,-6,.91);

  const herb=(x,y,a,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-13 6Q-19-11 0-18Q15-12 12 0Q7 10-13 6Z','#5e9c4a','stroke="#3e7138" stroke-width="1.65"')
    +line('M-9 4Q1-3 2-13','#afcb79',1.25,.95)+'</g>';
  art+=herb(118,140,-35,.7);art+=herb(160,115,35,.67);
  art+=line('M62 183Q80 197 106 197M150 199Q181 197 196 182','#fffdef',2.2,.88);
  return doc('田园沙拉',defs,art);
}

function centuryEggSalad(){
  const defs=gradient('c30-egg-plate',['#fff9e7','#e9dfc7','#c6c2ab'])
    +gradient('c30-egg-jelly',['#c38742','#965b2c','#6b3f28'])
    +gradient('c30-egg-cut',['#e2b05d','#ba813c','#90602e'])
    +gradient('c30-egg-yolk',['#899575','#5c6f5d','#465447']);
  let art=p('M43 130Q40 123 49 118Q128 93 207 118Q216 122 213 131L204 169Q202 178 190 183Q128 204 66 183Q54 179 52 170Z','url(#c30-egg-plate)');
  art+=p('M44 128Q128 99 212 128Q208 157 190 165Q128 185 66 165Q48 156 44 128Z','#fff8e8');
  art+=p('M59 131Q127 110 197 131Q193 150 179 154Q128 170 78 154Q65 150 59 131Z','#eae4cd','stroke="#babba0" stroke-width="1.35"');
  art+=line('M64 174Q96 189 129 188M143 187Q170 185 192 175','#fffbed',2.1,.95);

  // Each wedge has a long rounded egg cut, amber jelly edge and an offset grey-green yolk.
  const wedge=(x,y,a,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-25 15C-37-2-29-33-9-47C7-58 26-43 31-24C38-1 26 22 7 29Z','url(#c30-egg-jelly)')
    +p('M-22 12C-30-5-23-31-6-43C8-52 23-37 26-21C31-3 22 17 6 23Z','url(#c30-egg-cut)','stroke="#946331" stroke-width="1.4"')
    +p('M-10-23C1-33 16-24 19-11C23 2 16 14 6 14C-7 13-17-10-10-23Z','url(#c30-egg-yolk)','stroke="#58604a" stroke-width="1.6"')
    +p('M-4-18C4-24 12-17 13-9C15-1 10 6 5 5C-2 4-9-10-4-18Z','#b2b087','stroke="none"')
    +line('M-18-28Q-27-9-21 2','#edc477',1.6,.9)
    +line('M15-38Q23-31 25-22','#e7ad54',1.5,.8)
    +line('M-17 11L-7 16','#c58c46',1.35,.85)
    +'</g>';
  art+=wedge(92,116,-27,.87);
  art+=wedge(162,115,31,.86);
  art+=wedge(127,147,5,.9);

  // Only one open onion curl and two short pepper cuts accompany the three wedges.
  art+='<g transform="translate(176 157) rotate(19)">';
  art+=p('M-12 4C-20-4-11-20 3-18C16-17 20-4 12 7L7 3C12-4 9-12 2-12C-6-13-12-5-7 0Z','#bf86a3','stroke="#7b526b" stroke-width="1.65"');
  art+=line('M-11-1Q-10-14 2-15Q12-13 13-5','#efd5dc',1.35,.9);art+='</g>';
  art+=p('M68 149Q73 139 82 142L81 147Q76 146 73 153Z','#e7764d','stroke="#964631" stroke-width="1.65"');
  art+=p('M147 166L158 162L162 168L151 172Z','#d96743','stroke="#964631" stroke-width="1.65"');
  return doc('凉拌皮蛋',defs,art);
}

export const coldTailCandidates=[
  {id:'dish-fresh-ico-0141',name:'田园沙拉',svg:gardenSalad(),expectedOccupancy:.82,
    reason:'三组舒展生菜托住三块鲜亮番茄，少量香叶点出清香；用大叶褶面和可读切面取代散碎堆料，短陶碗盛得轻盈饱满。',
    design:{silhouette:'三组大生菜叶片与三块番茄自然交错，短圆碗承托鲜蔬',angle:'略俯视，可见叶面折叠与番茄籽室',material:'清脆嫩绿叶片、橙红番茄与温润浅陶碗，克制柔光',identity:'生菜、番茄和少量混合香叶均来自现有配方，不添加其它主料',container:'奶油浅陶短碗，料理占上部，含碗主体约82%',mainTomatoPieceCount:3}},
  {id:'dish-fresh-ico-0146',name:'凉拌皮蛋',svg:centuryEggSalad(),expectedOccupancy:.82,
    reason:'三枚圆润长楔露出琥珀色蛋白与灰绿蛋心，弧面和偏心切面明确皮蛋身份；只配一弯紫洋葱、两段红椒，温白浅盘保留清楚留白。',
    design:{silhouette:'三枚大皮蛋楔前后舒展摆放，圆润蛋形与琥珀凝胶边清楚可辨',angle:'略俯视偏侧，看清蛋白厚度、弧面与灰绿蛋心',material:'透亮琥珀蛋白、哑光墨灰绿蛋心、柔紫洋葱和朱红椒',identity:'皮蛋、紫洋葱、红椒直接对应既定三种主料，避免巧克力或贝肉造型',container:'温白圆角长浅盘，含盘主体约82%，细深描边保持统一',mainEggWedgeCount:3}}
];

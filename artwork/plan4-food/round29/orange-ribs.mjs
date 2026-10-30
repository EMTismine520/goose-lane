// Round 29: three orange-glazed short ribs, editable transparent vector master.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function orangeRibs(){
  const defs=grad('r29-plate',['#9ebbae','#6d958b','#456d67'])
    +grad('r29-glaze',['#f5a14d','#e27934','#b24d27'])
    +grad('r29-meat-side',['#c16a35','#9a4628','#793b27'])
    +grad('r29-orange',['#ffd674','#ffb13a','#e79524']);
  let art=e(128,158,99,34,'url(#r29-plate)');
  art+=e(128,153,87,24,'#bed0b7','stroke="#50766b" stroke-width="1.5"');
  art+=line('M43 165Q124 201 214 163','#d0dfc7',2,.8);
  art+=line('M53 151Q75 133 103 135','#e1ead4',1.8,.75);

  // One orange wedge supports the flavour, with ample space between the meats.
  art+='<g transform="translate(66 133) rotate(-25)">';
  art+=p('M-20 4C-21-12-8-24 7-21C19-19 25-8 23 5Z','url(#r29-orange)','stroke="#91602d" stroke-width="2.5"');
  art+=p('M-16 1C-15-12-5-21 7-17C15-15 20-6 19 1Z','#ffe6a6','stroke="none"');
  art+=p('M-12 0Q-10-11-4-14L0 0ZM5 0L2-15Q12-15 16-5L10 0Z','#ffb443','stroke="none"');
  art+=line('M0 0L-5-15M5 0L7-16M10 1L17-5','#fff3c8',1.35,.95);
  art+='</g>';

  const rib=(x,y,angle,scale=1)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">`
    // A small pale cut end reads as a short rib rather than a sausage.
    +p('M-26-2L-34-3Q-39-2-37 3Q-39 8-33 9L-24 7Z','#efd9ac','stroke="#8d7653" stroke-width="1.6"')
    +line('M-35 1L-31 3','#fff0ca',1.5,.9)
    +p('M-28-11Q-25-20-15-18L17-15Q27-13 31-6L30 8Q28 19 16 20L-17 14Q-29 12-30 4Z','url(#r29-meat-side)')
    +p('M-27-11Q-24-18-14-16L17-13Q27-11 28-5Q27 2 22 7L12 11L-19 7Q-29 5-27-11Z','url(#r29-glaze)')
    +p('M-21-10Q-14-14-5-11L15-9Q22-8 22-4Q21-1 15-2L-7-6Q-17-5-21-7Z','#ffce80','stroke="none" opacity=".93"')
    +line('M-18 9Q-4 14 9 15M18 15L23 12','#733723',1.4,.8)
    +line('M-18-1Q-7 3 3 2','#ec9b4b',1.55,.86)
    +line('M12 1L18 2','#b65d2c',1.4,.7)
    +'</g>';
  art+=rib(104,115,-19,.98);
  art+=rib(163,127,17,.94);
  art+=rib(128,157,-7,1.04);

  // A single red pepper curl keeps the recipe identity without extra clutter.
  art+=p('M177 156Q186 142 198 147L196 153Q188 152 183 161Z','#ed7045','stroke="#9e402b" stroke-width="1.8"');
  art+=line('M182 154Q188 148 194 150','#ffb07b',1.4,.9);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>橙香小排 · 三块精致摆盘新版候选</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const orangeRibsCandidate={
  id:'dish-fresh-home-orange-ribs',
  name:'橙香小排',
  svg:orangeRibs(),
  expectedOccupancy:.84,
  reason:'小排从六块减为三块，以两后、一前的低矮错落摆盘，露出短骨端、橙亮酱面和焦香肉侧；仅留一瓣甜橙与一段红椒，形状更清楚，盘内有呼吸感。',
  design:{
    silhouette:'三块厚薄明确的短切熟排，两后、一前紧凑错落，保留盘沿留白',
    angle:'略俯视，可见短骨端、橙汁酱面与焦棕切侧',
    material:'橙金柔亮酱汁、暖棕焦边、奶金骨端和深青低矮陶盘',
    identity:'三块短排、一瓣甜橙、一段红椒，对应排骨、甜橙和红椒三种主料',
    container:'沿用深青椭圆浅盘，含盘主体约84%，细深描边与既定风格一致',
    mainPieceCount:3,
    garnishCount:{orangeWedge:1,redPepper:1}
  }
};

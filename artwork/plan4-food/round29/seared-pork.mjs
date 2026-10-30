// Round 29: two generous seared pork slices, with restrained onion garnish.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function searedPork(){
  const defs=grad('h29-pork-plate',['#f9f5e8','#e9e5d6','#c8cdc3'])
    +grad('h29-pork-crust',['#d58a4c','#b86638','#91492e'])
    +grad('h29-pork-meat',['#dc9a61','#c67a45','#ad5e35'])
    +grad('h29-pork-fat',['#ffe2ae','#efc38a','#dfac6c']);
  let art=e(128,157,99,34,'url(#h29-pork-plate)');
  art+=e(128,153,87,25,'#faf5e7','stroke="#b9c2b7" stroke-width="1.5"');
  art+=line('M47 164C70 180 106 186 139 183M153 181Q186 179 210 163','#fffdf1',2,.92);

  // Two open onion crescents sit at the edge; no extra ingredients scatter around the meat.
  art+=`<g transform="translate(187 146) rotate(19)">`;
  art+=p('M-15 4C-18-12-1-23 13-14C23-7 22 7 12 15L7 9C14 3 14-5 9-8C1-13-8-6-8 3Z','#c489a4','stroke="#754c64" stroke-width="1.65"');
  art+=line('M-12 1C-12-10 0-17 10-10Q18-5 15 5','#f2d0da',1.5,.95);
  art+='</g>';
  art+=`<g transform="translate(64 151) rotate(-23) scale(.72)">`;
  art+=p('M-12 10C-22-1-16-19-2-21C9-23 19-14 18-3L11-2C12-10 5-16-2-14C-11-12-14-2-7 5Z','#c68ca8','stroke="#754c64" stroke-width="1.65"');
  art+=line('M-13 3C-17-5-11-16-2-17Q8-18 13-10','#efc7d6',1.5,.9);
  art+='</g>';

  const slice=(x,y,a,s)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-45-12Q-42-20-32-19L-17-16Q-4-20 10-16L31-12Q43-12 47-5L46 6Q39 17 26 17L8 14Q-6 18-19 14L-35 13Q-48 10-48 0Z','url(#h29-pork-crust)')
    +p('M-42-11Q-36-16-26-12L-17-10Q-3-15 10-11L30-7Q40-7 41-2L36 5Q25 8 14 4Q0 0-13 4L-29 1Q-39 1-42-5Z','url(#h29-pork-meat)','stroke="none"')
    +p('M-40-5C-27-8-25 1-11-2C1-6 12-1 21 1Q31 4 39-1L36 6Q26 10 15 7C3 3-3 3-13 7C-26 10-32 3-40 4Z','url(#h29-pork-fat)','stroke="#b17d46" stroke-width="1.35"')
    +line('M-36-4C-25-5-23 3-11 0C2-3 13 2 23 3Q30 6 36 2','#ffe9bd',1.65,.95)
    +line('M-31-12L-23-10M-4-13L4-11M24-6L31-4','#98512e',1.8,.78)
    +line('M-32 9L-23 11M0 12Q13 11 20 13M32 11L37 8','#733a29',1.75,.72)
    +line('M-17-10L-9-11M8-8L15-6','#efb376',1.4,.72)
    +'</g>';

  art+=slice(112,120,-17,1.04);
  art+=slice(143,148,12,1.06);
  art+=line('M91 173Q113 180 135 177','#c3c7b9',1.45,.7);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>香煎肉片 · 两片精致摆盘</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const searedPorkCandidate={
  id:'dish-fresh-home-seared-pork',name:'香煎肉片',svg:searedPork(),expectedOccupancy:.82,
  reason:'肉片从四片减少为两片，斜向相叠形成清楚主次。焦香熟肉、连贯金黄脂肪带与两弯紫洋葱直接表达现有配方，浅盘保留舒展留白。',
  design:{silhouette:'两片舒展的熟五花肉前后错叠，长条薄片边缘自然起伏',angle:'三分之四俯视，薄片、煎边与脂肪带清楚可见',material:'焦糖棕熟肉、奶金脂肪与柔紫洋葱，细深轮廓配克制油亮',identity:'只保留两片主肉与少量紫洋葱，对应五花肉和紫洋葱既定配方',container:'温润浅圆陶盘，摆盘紧凑而有留白，含盘主体约82%',primaryPieceCount:2}
};

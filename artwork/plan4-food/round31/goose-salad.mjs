// Round 31: the cold dish follows the confirmed braised-goose ingredient.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".1" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function gooseSalad(){
  const defs=grad('g31-plate',['#f5f8e9','#e2ead7','#bdcdbd'])
    +grad('g31-skin',['#daa367','#b97742','#874c31'])
    +grad('g31-fat',['#f5e2bd','#e1c19a','#c9a27d'])
    +grad('g31-meat',['#c38e77','#ac7562','#8a5649']);
  let art=e(128,157,98,32,'url(#g31-plate)');
  art+=e(128,151,86,23,'#fbf8eb','stroke="#a2b6a0" stroke-width="1.5"');
  art+=line('M47 166Q73 180 105 181M147 181Q188 178 209 164','#fffdf1',2,.9);

  // Two purple-onion arcs and two short red-pepper strips stay secondary.
  art+='<g transform="translate(181 144) rotate(18)">';
  art+=p('M-14 6C-22-5-13-21 1-21C15-20 22-8 17 4L11 3C15-6 10-14 1-14C-8-14-13-5-8 2Z','#c18aa5','stroke="#78546c" stroke-width="1.65"');
  art+=line('M-12 1C-16-7-9-17 1-17Q13-16 15-6','#f0d1df',1.5,.95);
  art+='</g>';
  art+='<g transform="translate(72 149) rotate(-25) scale(.78)">';
  art+=p('M-13 8C-20-6-9-22 7-20C17-18 22-9 19 1L12 0C15-8 9-14 3-14C-6-14-12-5-7 4Z','#bc84a2','stroke="#78546c" stroke-width="1.65"');
  art+=line('M-11 0C-14-10-4-19 6-16','#efd0df',1.5,.95);
  art+='</g>';

  // Each slice has one broad skin cap, one thin fat layer and a cooked meat face.
  const slice=(x,y,a,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-34-8Q-34-14-26-17Q-3-20 22-13L36-3L32 20Q7 27-26 17L-33 6Z','url(#g31-meat)')
    +p('M-34-8Q-8-7 36-3L34 5Q10 12-31 0Z','url(#g31-fat)','stroke="#91674d" stroke-width="1.4"')
    +p('M-34-8L-22-23Q1-28 23-17L36-3Q7 5-34-8Z','url(#g31-skin)')
    +line('M-21-18Q-3-21 14-15','#f1c58a',2,.85)
    +line('M-25 7Q-5 14 17 15','#e3b49b',1.55,.85)
    +line('M-18 8Q-10 9-8 14M8 14Q15 11 22 16','#875449',1.35,.65)
    +line('M-27 16L-21 19M25 19L28 15','#754b40',1.35,.6)
    +'</g>';
  art+=slice(112,116,-13,1.02);
  art+=slice(158,140,15,.94);
  art+=slice(111,156,-8,1.03);

  art+=p('M169 163Q179 155 190 157L189 163Q181 162 175 168Z','#e7774e','stroke="#a54a35" stroke-width="1.7"');
  art+=line('M176 162Q181 159 186 160','#ffc28f',1.35,.9);
  art+=p('M70 132L83 127L86 133L74 138Z','#df7651','stroke="#a54a35" stroke-width="1.6"');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>凉拌卤鹅肉 · 卤鹅肉与紫洋葱红椒</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const gooseSaladCandidate={
  id:'dish-fresh-ico-0146',
  name:'凉拌卤鹅肉',
  svg:gooseSalad(),
  expectedOccupancy:.82,
  reason:'按已确认的卤鹅肉基础食材重做成品：三片卤鹅清楚露出棕亮皮面、薄脂层与熟肉切面，少量紫洋葱和红椒拌成一盘清爽凉菜，主体紧凑而有留白。',
  design:{
    silhouette:'三片厚薄清楚的卤鹅前后错落，宽皮帽与短切面区别于煎五花薄片',
    angle:'三分之四略俯视，卤皮、薄脂和熟肉切面同时可读',
    material:'卤棕皮面、奶金薄脂与柔暖熟肉，宽柔光配清晰细深轮廓',
    identity:'卤鹅肉、紫洋葱与红椒，完全对应修正后的现有食材；不再出现皮蛋元素',
    container:'浅青温白低矮陶盘，含盘主体约82%，与无盘基础卤鹅图分开表现',
    mainPieceCount:3
  }
};

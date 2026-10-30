// Round 30: three cold dishes, drawn from the current chopping-board recipes.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".86" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 砧板冷食新版</title><defs>${defs}</defs><g stroke="#49392f" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
const basil=(x,y,angle=0,scale=1)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">`
  +p('M0 10C-21 6-23-9-15-18C-4-20 12-11 13-2Q12 8 0 10Z','#78a85b','stroke="#43653c" stroke-width="1.65"')
  +line('M-14-14L1 7M-8-8L-14-6M-2-2L3-8','#c5db92',1.25,.9)+'</g>';

function chickenRoll(){
  const defs=grad('c30-roll-plate',['#fafff0','#e0eadb','#b5ccbd'])
    +grad('c30-chicken',['#fff8df','#f1ddba','#d5b78c'])
    +grad('c30-cut',['#fffbe9','#f7e9cc','#ead3ab'])
    +grad('c30-cucumber',['#c4dc86','#8eb95e','#548944']);
  let art=e(128,165,98,29,'url(#c30-roll-plate)');
  art+=e(128,161,86,21,'#f8faeb','stroke="#a5beae" stroke-width="1.4"');
  art+=line('M50 172Q95 195 156 185M177 182L207 171','#fcfff0',1.9,.95);
  art+=basil(69,144,-47,.9);
  art+=basil(183,142,43,.88);

  const roll=(x,y,angle,scale=1)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">`
    // The outer sheet is cooked chicken with a little seared colour; no egg or flour wrapper.
    +p('M-27-28Q-37-34-47-27Q-57-17-48-3L-8 32Q5 42 18 33L30 20Q39 7 28-7L-12-31Q-20-35-27-28Z','url(#c30-chicken)')
    +p('M-43-25Q-46-18-40-12L-7 15Q2 20 6 16L-30-22Q-35-27-43-25Z','#e1c291','stroke="none" opacity=".75"')
    +line('M-32-24L-26-18M-24-16L-18-10M-17-9L-11-3','#ad8259',1.6,.8)
    +line('M-41-19Q-39-22-35-20M-22-27L-16-24','#fffbe6',1.6,.9)
    +e(11,16,23,26,'url(#c30-cut)','transform="rotate(-32 11 16)"')
    +p('M1-2Q13-10 25 3Q36 17 24 30Q11 40-1 23Q-11 10 1-2Z','#f6edcd','stroke="#b8aa7e" stroke-width="1.45"')
    +p('M6 5Q17-1 23 11Q29 23 18 27Q8 30 3 18Q-2 10 6 5Z','url(#c30-cucumber)','stroke="#527644" stroke-width="1.65"')
    +p('M10 8Q18 5 21 14Q24 22 17 23Q10 24 8 17Z','#d7e6a4','stroke="none"')
    +line('M11 13L14 17M17 14L19 18','#f7edc3',1.4,.95)
    +p('M2 3Q-3 8 2 14Q7 11 10 8Z','#5d8e4d','stroke="#496c40" stroke-width="1.2"')
    +line('M1 29Q7 36 15 35','#c9b38b',1.4,.65)+'</g>';
  art+=roll(111,123,-16,.96);
  art+=roll(153,145,13,1.05);
  art+=line('M91 178Q111 181 126 178','#bdcbb5',1.4,.7);
  return doc('凉拌鸡肉卷',defs,art);
}

function tornCabbage(){
  const defs=grad('c30-cabbage-plate',['#fff7e8','#eee0ca','#cfbfa5'])
    +grad('c30-cabbage-dark',['#bf76b1','#a15c9e','#774987'])
    +grad('c30-cabbage-bright',['#e2a0cb','#cc80ba','#a65b9d'])
    +grad('c30-cabbage-pale',['#edc1dc','#d797c1','#bb73ad']);
  let art=e(128,163,96,30,'url(#c30-cabbage-plate)');
  art+=e(128,158,83,22,'#fff7e6','stroke="#d0c0a4" stroke-width="1.4"');
  art+=line('M49 169Q76 186 105 185M153 185Q181 182 204 169','#fffdf1',1.9,.93);

  const leaf=(x,y,a,s,fill)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-31 2L-35-7L-27-13L-28-23L-15-23L-9-30L2-24L13-28L20-17L31-13L26-3L33 6L21 13L17 23L4 21L-4 27L-16 19L-27 20L-29 10L-35 7Z',fill,'stroke="#63415f" stroke-width="2.5"')
    +p('M-27-7Q-10-13 2-6Q14 1 24-5Q15 8 2 8Q-13 8-27 14Z','#e8b4d2','stroke="none" opacity=".54"')
    +line('M-23 14Q-8 3 8-14M-5 0L-17-13M2-7L12-17M-13 9L-19 1M1-4L18 5','#f4d9e8',1.6,.94)
    +line('M-25-17L-17-19M14 15L20 9','#914d8d',1.3,.75)+'</g>';
  art+=leaf(99,125,-32,1.03,'url(#c30-cabbage-dark)');
  art+=leaf(150,121,24,1.02,'url(#c30-cabbage-bright)');
  art+=leaf(77,150,-20,.8,'url(#c30-cabbage-pale)');
  art+=leaf(172,151,30,.77,'url(#c30-cabbage-dark)');
  art+=leaf(124,152,7,1.12,'url(#c30-cabbage-bright)');
  // Three garlic slices keep the seasoning visible without covering the large torn leaves.
  art+=p('M95 138Q92 127 99 124Q109 126 111 134Q108 142 101 143Z','#f9ebc9','stroke="#a18d67" stroke-width="1.45"');
  art+=p('M145 155Q145 145 152 145Q162 149 160 157Q154 164 148 162Z','#fff0cc','stroke="#a18d67" stroke-width="1.45"');
  art+=p('M165 125Q166 117 172 119Q179 123 176 130Q170 134 165 129Z','#f5e4bd','stroke="#a18d67" stroke-width="1.4"');
  return doc('手撕紫甘蓝',defs,art);
}

function freshOysters(){
  const defs=grad('c30-oyster-plate',['#a9c7bd','#7daba5','#527b7b'])
    +grad('c30-oyster-shell',['#b4bab0','#949f99','#738880'])
    +grad('c30-oyster-nacre',['#fffbeb','#e6e7d1','#c2d2bf'])
    +grad('c30-oyster-flesh',['#fff3d1','#e7d3ac','#c8b48d'])
    +grad('c30-oyster-body',['#c5c6a7','#a5b397','#849b88'])
    +grad('c30-lemon',['#ffe7a0','#f8ce57','#deaa35']);
  let art=e(128,166,98,29,'url(#c30-oyster-plate)');
  art+=e(128,160,85,21,'#bdd0c1','stroke="#5b807b" stroke-width="1.4"');
  art+=line('M49 174Q114 196 194 179','#d0e0cf',1.9,.9);
  const oyster=(x,y,a,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    // Long irregular shell, pearly folded mantle and a distinct fleshy body.
    +p('M-11-43L1-48L10-42L22-41L25-31L34-24L30-12L35-2L28 9L27 23L16 30L9 40L-3 38L-14 44L-23 35L-31 28L-28 15L-35 3L-31-7L-34-20L-25-28L-23-38Z','url(#c30-oyster-shell)')
    +p('M-11-35Q5-42 19-28Q27-20 23-5Q29 10 18 22Q12 37-4 31Q-19 36-24 19Q-31 9-24-4Q-29-17-19-28Q-20-33-11-35Z','url(#c30-oyster-nacre)','stroke="#6f8176" stroke-width="1.8"')
    +p('M-7-28Q11-33 16-18Q20-9 13-3Q24 10 10 23Q0 29-12 20Q-24 17-18 2Q-25-11-13-19Q-15-25-7-28Z','url(#c30-oyster-flesh)','stroke="#aa9c78" stroke-width="1.7"')
    +p('M-4-15Q8-22 12-10Q11-3 5 2Q15 9 7 16Q-3 23-10 11Q-17 2-10-4Q-13-11-4-15Z','url(#c30-oyster-body)','stroke="#86957b" stroke-width="1.35"')
    +line('M-13-15Q-21-6-15 2M0-23Q8-26 11-18M-10 18Q-2 25 7 19','#fff9db',1.7,.95)
    +line('M-26-24L-20-20M-29-3L-23 0M-24 29L-18 25M17 29L20 23M26-24L20-19','#cad5c5',1.4,.85)
    +line('M-1-9Q4-13 7-7','#e0dfbd',1.4,.85)+'</g>';
  art+=oyster(101,122,-32,.83);
  art+=oyster(150,139,28,.92);

  // A single bright lemon wedge marks the existing lemon pairing.
  art+='<g transform="translate(74 164) rotate(-25)">';
  art+=p('M-20 3Q-22-18-3-21Q17-23 22-2L21 7Z','url(#c30-lemon)','stroke="#9d7b35" stroke-width="2.2"');
  art+=p('M-15 1Q-14-14-2-16Q11-18 16-2L15 2Z','#fff0b9','stroke="none"');
  art+=p('M-11 0Q-10-10-4-11L-1 1ZM4 2L1-12Q10-11 12-3L10 3Z','#f6d26c','stroke="none"');
  art+=line('M-1 1L-4-14M4 2L3-14M8 2L13-5','#fff8d4',1.3,.95);
  art+='</g>';
  return doc('新鲜生蚝',defs,art);
}

export const coldFrontCandidates=[
  {id:'dish-fresh-ico-0030',name:'凉拌鸡肉卷',svg:chickenRoll(),expectedOccupancy:.82,reason:'只用两段熟鸡肉卷错落摆盘，奶白鸡肉保留少量炭烤焦色，切面清楚露出黄瓜与罗勒；冷绿浅盘与香煎蛋皮鸡卷拉开区别。',design:{silhouette:'两段带完整切面的鸡肉卷前后错落，圆润卷形与绿芯易辨',angle:'略俯视偏侧，熟肉外层、黄瓜芯与罗勒切面同时可见',material:'奶白熟鸡肉、淡焦褐烤痕、浅绿黄瓜与清亮罗勒，柔光克制',identity:'炭烤鸡胸肉、黄瓜和罗勒，不加入蛋皮或面饼',container:'清冷绿白浅椭圆盘，含盘主体约82%',mainPieceCount:2}},
  {id:'dish-fresh-ico-0058',name:'手撕紫甘蓝',svg:tornCabbage(),expectedOccupancy:.80,reason:'把原先整团造型改为五片舒展的大撕叶，用不规则缺口、紫红层次与浅色叶脉呈现手撕感，三片蒜片点明配方而不堆碎屑。',design:{silhouette:'五片大紫甘蓝撕叶前后交叠，叶缘缺口清楚且整体紧凑',angle:'轻俯视，看见叶片折面、断边和盘内留白',material:'鲜活紫红与浅粉紫叶面、奶白蒜片和温润米白陶盘',identity:'紫甘蓝与大蒜两种既定主料，手撕叶片区别整颗原料',container:'低矮米白浅圆盘，含盘主体约80%',mainPieceCount:5}},
  {id:'dish-fresh-ico-0074',name:'新鲜生蚝',svg:freshOysters(),expectedOccupancy:.82,reason:'两枚长短错落的开壳生蚝突出不规则壳缘、珍珠内壁与饱满蚝肉，一瓣柠檬放在盘内前缘；清楚大形和细深描边让小图也能读出生蚝。',design:{silhouette:'两枚不规则长壳生蚝错落相叠，一瓣柠檬贴近前沿',angle:'略俯视，壳壁、蚝肉褶面与柠檬切面可见',material:'灰青粗壳、浅奶珠光内壁、米金蚝肉和清黄柠檬',identity:'开壳生蚝加柠檬，仅两枚主料，不添加其它配菜',container:'冷青低矮椭圆盘，含盘主体约82%',mainPieceCount:2}}
];

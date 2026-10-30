// Round 26: three independent starter dishes, made from their catalog ingredients.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".88" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 开局鲜食新版</title><defs>${defs}</defs><g stroke="#49392e" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function tomatoSalad(){
  const defs=gradient('s26-tomato-plate',['#fffef2','#f2ead7','#d7cfb9'])
    +gradient('s26-tomato-skin',['#ff8567','#ec5543','#cf3d36'])
    +gradient('s26-tomato-cut',['#ffbb81','#f88f64','#e96a4e'])
    +gradient('s26-tomato-leaf',['#a5cc64','#6b9d48','#3f763d']);
  let art=e(128,160,90,33,'url(#s26-tomato-plate)');
  art+=e(128,154,91,32,'#fffef3');
  art+=e(128,153,78,23,'#f4efd9','stroke="#c5c4a7" stroke-width="1.4"');
  art+=line('M57 163Q79 180 111 181M145 182Q179 178 199 166','#fffdf3',2.3,.9);
  const wedge=(x,y,angle,scale=1)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">`
    +p('M-31 2C-29-24-6-37 17-26C31-19 37-6 32 5L0 28Z','url(#s26-tomato-skin)')
    +p('M-25 1C-23-19-6-29 12-22C23-18 29-7 26 1L0 21Z','url(#s26-tomato-cut)','stroke="#9e4a32" stroke-width="1.35"')
    +p('M0 20L-6-18C-1-19 2-18 6-16L9 14Z','#ffd09a','stroke="none"')
    +p('M-18-4Q-11-14-8-8L-5 10Q-13 4-18-4Z','#e65a45','stroke="none"')
    +p('M10-14Q22-8 19-1L10 10Z','#dc533f','stroke="none"')
    +e(-13,-3,2.3,1.4,'#ffe2a7','stroke="none" transform="rotate(35 -13 -3)"')
    +e(-9,3,2.1,1.3,'#ffe2a7','stroke="none" transform="rotate(35 -9 3)"')
    +e(15,-3,2.1,1.3,'#ffe0a0','stroke="none" transform="rotate(-35 15 -3)"')
    +line('M-21-12Q-13-24-1-25','#ffd6a5',1.8,.82)
    +'</g>';
  art+=wedge(97,119,-40,.84);
  art+=wedge(154,116,25,.86);
  art+=wedge(70,144,-65,.8);
  art+=wedge(178,145,54,.8);
  art+=wedge(122,153,4,.94);
  art+=`<g transform="translate(137 113) rotate(15)">${p('M0 9C-19 8-28-4-22-21C-4-22 7-9 0 9Z','url(#s26-tomato-leaf)')}${p('M0 9C-2-10 10-21 25-19C28-1 17 10 0 9Z','url(#s26-tomato-leaf)')}${line('M-1 8L-16-14M0 8L19-12','#52783a',1.2)}</g>`;
  art+=line('M81 163Q94 167 104 165M150 163Q160 158 166 154','#809853',1.5,.75);
  return doc('番茄小沙拉',defs,art);
}

function carrotGarden(){
  const defs=gradient('s26-carrot-dish',['#eff6d9','#c8dfbd','#9ebf9c'])
    +gradient('s26-carrot-flower',['#ffc75c','#ffa536','#ee7e27'])
    +gradient('s26-carrot-ribbon',['#ffb548','#ed8b2a','#cf6422']);
  const flowerPath='M0-25C8-32 23-23 18-12C32-11 34 6 21 11C29 23 14 32 4 24C-4 36-21 28-19 15C-34 14-33-4-20-9C-24-23-8-31 0-25Z';
  let art=p('M47 106H206C217 106 223 113 220 124L209 161C206 172 199 178 186 178H69C56 178 49 172 46 161L35 124C32 113 37 106 47 106Z','url(#s26-carrot-dish)');
  art+=p('M47 99H206C217 99 223 106 220 117L210 151C207 161 199 167 187 167H68C56 167 48 161 45 151L35 117C32 106 37 99 47 99Z','#f3f7df');
  art+=p('M54 107H198C207 107 212 112 209 121L201 146C199 153 191 158 181 158H74C64 158 56 153 54 146L45 121C42 112 46 107 54 107Z','#dbe9c8','stroke="#9eb795" stroke-width="1.35"');
  art+=line('M60 164Q70 173 90 173H157','#eff7df',2.2,.9);
  art+=p('M71 117C73 97 95 88 111 93C124 97 126 109 117 116L111 112C115 105 108 101 100 101C90 100 82 108 81 120Z','url(#s26-carrot-ribbon)','stroke-width="2.5"');
  const flower=(x,y,angle,scale)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">`
    +`<g transform="translate(0 4)">${p(flowerPath,'#d97527','stroke-width="2.5"')}</g>`
    +p(flowerPath,'url(#s26-carrot-flower)')
    +e(0,0,10,9,'#f9a234','stroke="#d47a25" stroke-width="1.2"')
    +e(-2,-2,5,4.5,'#ffc96a','stroke="none" opacity=".86"')
    +line('M-15-15Q-7-23-2-22','#ffe09a',1.65,.85)
    +line('M-5 9L-8 16M8 4L15 7M3-10L5-17','#d97c25',1.2,.7)
    +'</g>';
  art+=flower(80,131,-12,.86);
  art+=flower(177,125,18,.88);
  art+=flower(130,139,-5,.98);
  for(const [x,y,a]of [[77,128,35],[132,136,-25],[169,124,-10],[143,149,35],[102,148,-25]])art+=e(x,y,2.8,1.2,'#765333',`stroke="none" transform="rotate(${a} ${x} ${y})"`);
  return doc('胡萝卜花园',defs,art);
}

function gardenBowl(){
  const defs=gradient('s26-garden-bowl',['#d8eee7','#a5d0c8','#74aaa9'])
    +gradient('s26-garden-stem',['#bdd883','#89b766','#65954f'])
    +gradient('s26-garden-broccoli',['#96c659','#63a544','#397c3e'])
    +gradient('s26-garden-orange',['#ffc95a','#ffad38','#f18b2a']);
  let art=p('M44 131C49 171 76 199 128 199C180 199 207 171 212 131Z','url(#s26-garden-bowl)');
  art+=p('M188 144L208 135C200 167 175 190 145 195C167 183 182 167 188 144Z','#659b9d','stroke="none" opacity=".4"');
  art+=e(128,131,84,28,'#e8f4df');
  art+=e(128,132,74,20,'#bacd98','stroke="#7f9f7b" stroke-width="1.35"');
  const orange=(x,y,angle,scale)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">`
    +p('M-30-9A31 31 0 0 0 30-9Z','#ffbc43')
    +p('M-25-7A26 26 0 0 0 25-7Z','url(#s26-garden-orange)','stroke="#ffe5a1" stroke-width="3"')
    +line('M0-6L-20 4M0-6L-10 15M0-6L9 15M0-6L20 4','#ffe9b1',1.65,.95)
    +e(0,-6,3,1.8,'#fff0c4','stroke="none"')
    +'</g>';
  const broccoli=(x,y,angle,scale)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">`
    +p('M-9 5H10L14 32Q0 39-14 32Z','url(#s26-garden-stem)')
    +line('M0 28L-17 9M2 23L20 7','#7eaa58',3)
    +p('M-29 6C-38-2-33-16-22-18C-24-32-6-39 3-29C15-38 30-27 27-16C40-14 40 3 30 9C27 20 13 23 4 15C-9 25-24 19-29 6Z','url(#s26-garden-broccoli)')
    +line('M-23-13Q-16-24-5-20M8-25Q18-28 22-19M10 5Q18 1 25 6','#b6da78',2,.88)
    +line('M-22 2Q-12-4-4 2','#acd371',1.7,.8)
    +'</g>';
  art+=orange(131,108,25,.96);
  art+=broccoli(86,102,-17,.83);
  art+=broccoli(166,107,15,.84);
  art+=orange(68,138,-28,.88);
  art+=orange(183,140,25,.9);
  art+=broccoli(126,143,-3,.77);
  art+=line('M46 138C68 160 185 161 210 138','#4a766f',2.2,.9);
  art+=p('M60 157Q69 178 89 185C94 186 96 182 91 180Q76 170 70 155Z','#ecf8e9','stroke="none" opacity=".85"');
  art+=line('M104 190Q127 196 149 190','#6a9e9b',1.35,.75);
  return doc('田园丰收碗',defs,art);
}

export const starterSavoryCandidates=[
  {id:'dish-fresh-tomato-salad',name:'番茄小沙拉',svg:tomatoSalad(),expectedOccupancy:.72,reason:'把番茄切瓣摆成紧凑扇形小沙拉，保留清楚的红皮、籽芯和香草汁；浅白椭圆盘衬托主料，72%体量在小图中仍清楚。',design:{silhouette:'浅白椭圆盘承托五片红番茄切瓣，中央两片小香草叶，完整盘形低而宽',angle:'略俯视，看清切面与前侧薄盘沿',material:'鲜红果皮、暖橙红湿润切面与温白瓷盘，克制柔光',identity:'大红番茄切瓣及清楚籽芯，区别整颗番茄和高碗装沙拉',container:'浅白椭圆小盘，不加餐具、背景或大叶垫底'}},
  {id:'dish-fresh-carrot-salad',name:'胡萝卜花园',svg:carrotGarden(),expectedOccupancy:.70,reason:'按既有菜谱将胡萝卜切成三朵大花片，配一条胡萝卜丝带与少量芝麻；青瓷长盘和亮橙切片形成独立、轻巧的料理轮廓。',design:{silhouette:'三朵紧凑橙色花形胡萝卜切片，放在浅青瓷圆角长盘上',angle:'略俯视，花片切法与盘前沿同时可见',material:'明亮橙黄色胡萝卜切面、淡青瓷盘及几粒深棕芝麻',identity:'花形切法和胡萝卜丝带表达既有做法，不画完整生胡萝卜',container:'低矮圆角青瓷长盘，不加刀叉或外部装饰'}},
  {id:'dish-fresh-garden-bowl',name:'田园丰收碗',svg:gardenBowl(),expectedOccupancy:.74,reason:'按既有两种主料组织三朵西兰花和三瓣甜橙，青蓝短圆碗承托；绿橙大色块在40px中清楚，不加入米饭、番茄或其它主料。',design:{silhouette:'短圆青蓝陶碗中，西兰花大朵与甜橙半瓣交错组成饱满碗装料理',angle:'三分之四略俯视，碗沿内侧与两种主料均可读',material:'鲜绿花球、明亮橙瓣和清爽青蓝陶瓷，简洁大块明暗',identity:'仅西兰花与甜橙两种既有主料，配色与容器区别番茄盘、胡萝卜盘',container:'短圆陶碗，无米饭打底、餐具、背景投影或外部配菜'}},
];

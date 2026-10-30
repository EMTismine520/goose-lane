// Round 49: open sage-and-wood seasonal racks, upgraded with real shelves and braces.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const r=(x,y,w,h,rx,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function seasonalRack(level){
  const prefix=`r49-seasonal-l${level}-`,g=id=>`url(#${prefix+id})`;
  const defs=grad(prefix+'wood',['#ead2a4','#d3af75','#ac8654'])
    +grad(prefix+'sage',['#bdd0a0','#96b181','#6c9066'])
    +grad(prefix+'mushroom',['#dabb95','#b38d68','#8c6b4e'])
    +grad(prefix+'corn',['#ffe796','#f1c85c','#d7a544'])
    +grad(prefix+'purple',['#b590cf','#926ab2','#704b8c']);
  const top=[92,68,47][level-1];
  let art=e(134,210,91,10,'#697954','stroke="none" opacity=".12"');
  // Open rear legs and spread feet show a stationary A-frame, without wheels or a cart body.
  art+=p(`M178 ${top+6}L187 ${top+9}L225 198Q224 204 216 204Z`,g('wood'));
  art+=p(`M103 ${top+7}L110 ${top+9}L86 202L78 202Z`,g('wood'));
  art+=line(`M185 ${top+19}L218 195`, '#f5dfb6',1.55,.93);
  if(level>=2){
    art+=p(`M80 201L181 ${top+24}L187 ${top+29}L88 203Z`,g('sage'),'stroke="#657b53" stroke-width="2.3"');
    art+=line(`M89 192L173 ${top+37}`,'#d4e2b6',1.4,.93);
  }
  if(level===3){
    art+=p('M190 202L91 80L85 85L181 203Z',g('wood'),'stroke="#93774c" stroke-width="2.2"');
    art+=line('M184 191L100 89','#f3ddb3',1.4,.9);
  }
  // The front frame leans inward at the top and stays visibly open between the shelves.
  art+=p(`M50 203L82 ${top+6}Q84 ${top+1}90 ${top+3}L96 ${top+7}L62 204Q55 208 50 203Z`,g('wood'));
  art+=p(`M162 ${top+4}L171 ${top+5}L206 202Q202 208 194 204Z`,g('wood'));
  art+=line(`M86 ${top+15}L57 195`, '#f7e6bd',1.6,.96);
  art+=line(`M167 ${top+15}L198 194`, '#e8ca93',1.5,.94);
  art+=r(85,top+3,88,10,4,g('wood'),'stroke="#886d49" stroke-width="2.5"');
  art+=line(`M92 ${top+6}L157 ${top+6}`,'#f9e7c0',1.45,.96);
  if(level===1){
    art+=p('M68 188L190 188L192 195L66 195Z',g('sage'),'stroke="#60794e" stroke-width="2.2"');
  }else if(level===2){
    // A central open grip is added above the crossbar, not a signboard.
    art+=p('M112 73L112 63Q112 58 119 58L143 58Q150 58 150 64L150 73L144 73L144 65L118 65L118 73Z',g('sage'),'stroke="#60774f" stroke-width="2.3"');
    art+=line('M119 61L140 61','#deebc4',1.35);
  }else{
    // Two side carry loops and the crossed rear brace make the third rack sturdier to move.
    art+=p('M76 91L66 89Q60 89 59 96Q58 104 66 106L71 106L73 100L67 99L66 96L74 98Z',g('sage'),'stroke="#5c764f" stroke-width="2.3"');
    art+=p('M190 88L204 85Q211 85 212 92Q214 101 206 104L199 106L197 100L205 98L205 92L193 95Z',g('sage'),'stroke="#5c764f" stroke-width="2.3"');
    art+=line('M62 95L63 100M202 89L207 89','#dce8bd',1.35);
  }

  function mushroom(x,y,scale=1){
    let food=p('M-5-2Q-7 8-9 16Q0 22 9 16L5-2Z','#f7e8ca','stroke="#9a8464" stroke-width="1.8"');
    food+=p('M-22 0Q-20-17 0-18Q20-17 22 0Q18 7 0 7Q-18 7-22 0Z',g('mushroom'),'stroke="#725b43" stroke-width="2.3"');
    food+=e(0,3.3,16.6,3.6,'#f1ddba','stroke="#b69a72" stroke-width="1.3"');
    food+=line('M-14-7Q-9-13-2-12M4-12L10-9','#f7ddba',1.45,.97);
    food+=line('M-3 9L-3 15','#fff8df',1.35,.97);
    return `<g transform="translate(${x} ${y}) scale(${scale})">${food}</g>`;
  }
  function corn(x,y,angle=0){
    let food=p('M-8 9L-8-10Q-7-21 0-21Q8-21 9-11L9 10Q6 18 0 18Q-7 17-8 9Z',g('corn'),'stroke="#9a7e3c" stroke-width="2.1"');
    food+=line('M-3-17L-3 11M3-17L3 11M-7-10L7-10M-7-3L8-3M-7 4L8 4M-6 11L6 11','#d2a34b',1.25,.92);
    food+=line('M-4-16L-1-16M3-9L5-9M-4-2L-1-2M3 5L5 5','#fff0b1',1.3,.98);
    food+=p('M-9-2Q-18 8-13 19Q-7 25 0 21L-1 13Z',g('sage'),'stroke="#607b45" stroke-width="1.8"');
    food+=p('M9 1Q18 9 12 20L2 21L3 12Z',g('sage'),'stroke="#607b45" stroke-width="1.8"');
    food+=line('M-11 8Q-10 16-4 19M11 9L7 17','#c8dda2',1.3,.96);
    return `<g transform="translate(${x} ${y}) rotate(${angle})">${food}</g>`;
  }
  function eggplant(x,y,angle=0){
    let food=p('M-6-15Q6-21 12-9Q16 3 7 17Q-3 27-13 17Q-21 10-13-2Z',g('purple'),'stroke="#65466c" stroke-width="2.2"');
    food+=p('M-10-15L-4-19L0-24L4-21L5-15L11-11L2-11L-4-7L-7-12L-15-9Z',g('sage'),'stroke="#5d7645" stroke-width="1.6"');
    food+=line('M0-22Q-2-28 2-30','#647e46',2.1);
    food+=line('M-8-4Q-13 5-8 12M-5 15L-2 17','#d0afe1',1.45,.96);
    return `<g transform="translate(${x} ${y}) rotate(${angle})">${food}</g>`;
  }
  function shelf(y,left,right,food){
    let tray=p(`M${left+14} ${y-12}L${right+14} ${y-12}L${right} ${y}L${left} ${y}Z`,g('wood'),'stroke="#92774f" stroke-width="2.2"');
    tray+=line(`M${left+34} ${y-9}L${left+28} ${y-3}M${right-33} ${y-9}L${right-39} ${y-3}`,'#b48e59',1.3,.93);
    tray+=food;
    tray+=p(`M${left} ${y-1}L${right} ${y-1}L${right-1} ${y+8}Q${(left+right)/2} ${y+13} ${left+1} ${y+8}Z`,g('sage'),'stroke="#536b43" stroke-width="2.5"');
    tray+=line(`M${left+7} ${y+2}Q${(left+right)/2} ${y+8} ${right-7} ${y+2}`,'#dae7bc',1.45,.96);
    return tray;
  }
  if(level===1){
    art+=shelf(168,62,197,mushroom(104,143)+corn(159,143,11));
  }else if(level===2){
    art+=shelf(127,77,185,eggplant(138,102,15));
    art+=shelf(176,58,200,mushroom(99,158)+corn(161,155,12));
  }else{
    art+=shelf(98,86,177,mushroom(128,80,.92));
    art+=shelf(139,72,189,corn(141,117,-11));
    art+=shelf(182,56,202,eggplant(126,157,24));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>时蔬菜架 · 开放层架器材新版</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const producerSeasonalCandidates=[1,2,3].map(level=>({
  id:`seasonal-produce-rack-l${level}`,code:`EQ10-L${level}`,name:'时蔬菜架',familyId:'seasonal-produce-rack',level,
  expectedOccupancy:[.78,.82,.84][level-1],svg:seasonalRack(level),
  reason:[
    '苔绿与原木开放A架，低矮宽层盘只摆一枚大蘑菇和一根带浅绿苞叶的玉米，斜撑腿与落地横撑清楚，没有轮子、棚或封闭车箱。',
    '增加第二层开放展示盘、后部斜支撑和上部提拿握口，新增一枚鲜紫茄子；上下食材体量清楚，层架升级具有实际展示与搬动功能。',
    '三层鼠尾草绿展示盘错高展开，一层只摆一件清楚时蔬；交叉后撑与双侧提拿环让结构更稳，原木A腿与开放留白始终可辨。'
  ][level-1],
  design:{
    silhouette:['低矮开放A架，一层宽展示盘、上木横梁与落地撑，无轮无棚','双层梯形开放架，后斜撑与中央提拿握口','三层梯形开放架、交叉后撑与双侧提拿环'][level-1],
    angle:'三分之四俯视，展示盘木台面、低绿前沿、斜向A腿和后支撑均可见，左上光',
    material:'暖原木、苔绿至鼠尾草绿层盘、奶棕蘑菇、金黄玉米与鲜紫茄子，近黑细描边与柔和体积',
    identity:'唯一对应fresh-seasonal实际链：蘑菇、玉米、紫甘蓝、土豆、生菜、四季豆、茄子、白萝卜；只用蘑菇、玉米和茄子作大而清楚的标志，不塞碎食材',
    progression:'一层低架、二层加斜撑与提手、三层加交叉撑与双侧握环；以真实层架和搬动结构升级，不靠纯换色或放大',
    container:'开放落地原木A架，不用轮子、帐篷、文字数字或等级角标；低级克制体量、自然浅投影与透明居中留白'
  }
}));

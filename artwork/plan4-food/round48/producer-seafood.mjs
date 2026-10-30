// Round 48: three low, fixed-foot seafood ice cabinets; no wheels or market roofs.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const r=(x,y,w,h,rx,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function seafoodFridge(level){
  const prefix=`r48-sea-l${level}-`,g=id=>`url(#${prefix+id})`;
  const defs=grad(prefix+'blue',['#c3e3e4','#8dc4ce','#5b9eae'])
    +grad(prefix+'rim',['#fffef0','#e6ebdd','#c5d3c6'])
    +grad(prefix+'metal',['#f0f5e9','#cad8cf','#91ada8'])
    +grad(prefix+'glass',['#f8fff0','#d6ece5','#adcfd0'])
    +grad(prefix+'shrimp',['#ffc497','#efa082','#cf7868'])
    +grad(prefix+'shell',['#fff2d2','#f0d8b1','#d6b487']);
  let art=e(136,209,96,10,'#5c7b70','stroke="none" opacity=".12"');
  if(level===2){
    // A low rear safety screen is a new useful structure, not an enlarged first cabinet.
    art+=p('M72 102L74 84Q75 78 84 78L209 78Q216 78 217 85L219 104Z',g('glass'),'fill-opacity=".38"');
    art+=line('M82 84L113 83M124 83L205 83M79 91L79 98','#fffff2',1.65,.96);
    art+=line('M81 101L211 101','#9bbec0',1.4,.95);
  }
  if(level===3){
    // Two curved sliding glass covers meet at a real central metal rail.
    art+=p('M62 124L68 103C75 79 101 71 126 79Q140 83 143 91L138 125Z',g('glass'),'fill-opacity=".39"');
    art+=p('M138 125L143 91C157 76 189 72 209 85Q218 94 213 124Z',g('glass'),'fill-opacity=".39"');
    art+=line('M77 99Q86 82 112 81M151 89Q173 77 196 84','#fffff1',1.8,.96);
    art+=line('M142 91L138 123','#799fa3',2.1,.98);
    art+=r(99,96,15,4,2,g('metal'),'stroke="#648b8c" stroke-width="1.4"');
    art+=r(169,94,15,4,2,g('metal'),'stroke="#648b8c" stroke-width="1.4"');
  }

  // Two short stationary feet have broad flat bottoms, without any round wheels.
  art+=p('M62 187L75 187L76 203Q69 207 62 203Z',g('metal'),'stroke="#667e76" stroke-width="2.5"');
  art+=p('M191 187L204 184L206 201Q201 206 193 204Z',g('metal'),'stroke="#667e76" stroke-width="2.5"');
  art+=line('M65 191L66 200M196 190L197 201','#f4f8ea',1.4);
  // A low insulated body is wide and horizontal, with a small silver side wall.
  art+=p('M205 139L225 119L227 174Q228 186 208 194L202 182Z',g('metal'));
  art+=line('M219 139L222 168M217 180L211 185','#faffee',1.5,.96);
  art+=p('M45 138L207 138L210 180Q210 192 196 195L60 195Q46 193 44 183Z',g('blue'));
  art+=p('M48 179Q128 187 208 179L209 183Q208 192 196 195L60 195Q49 193 46 186Z','#5897a7','stroke="none" opacity=".38"');
  art+=line('M52 185Q127 194 201 185','#c0e1de',1.65,.96);
  if(level===1){
    art+=r(56,150,139,28,7,'#b8d9dc','stroke="#6b9faa" stroke-width="1.45"');
    art+=line('M64 155L109 155M63 174L130 174','#e6f4e8',1.5,.96);
    art+=line('M166 158L185 158M166 164L185 164M166 170L185 170','#6a9da6',1.4);
  }else{
    art+=r(55,149,68,32,6,'#bddde0','stroke="#6f9fa8" stroke-width="1.45"');
    art+=r(128,149,70,32,6,'#a9d0d5','stroke="#63949f" stroke-width="1.45"');
    art+=line('M126 147L126 182','#5d8e99',1.45);
    art+=r(102,155,14,4,2,g('metal'),'stroke="#5c7f7d" stroke-width="1.45"');
    art+=r(136,155,14,4,2,g('metal'),'stroke="#5c7f7d" stroke-width="1.45"');
    art+=line('M63 153L92 153M158 153L187 153M62 175L103 175','#e4f3e8',1.5,.96);
  }

  // The slanted transparent ice display sits in a silver-white insulated frame.
  art+=p('M74 102L215 102Q221 103 222 109L207 142L45 142L68 108Q70 103 74 102Z',g('rim'));
  art+=p('M78 109L213 109L201 134L59 134Z',g('glass'),'fill-opacity=".55" stroke="#739da0" stroke-width="1.6"');
  art+=p('M74 123L207 123L201 134L61 134Z','#d6e9e1','stroke="#91b1ad" stroke-width="1.3"');
  art+=line('M66 131L198 131','#ffffef',1.45,.98);

  // One curled shrimp is enough to identify the actual fresh-sea chain.
  let shrimp=p('M10 12C-5 15-21 7-24-5Q-24-19-11-22Q1-28 12-18Q16-12 11-7Q6-5 1-10Q-1-17-8-14Q-17-10-13-4Q-7 4 5 3L13 5Z',g('shrimp'),'stroke="#9b6456" stroke-width="2.1"');
  shrimp+=p('M10 5L18 7L21 14L13 14L10 19L5 17L5 11Z',g('shrimp'),'stroke="#9b6456" stroke-width="1.8"');
  shrimp+=line('M-18-13L-12-8M-20-4L-13-3M-13 6L-8 0M-4 11L-1 4M5 12L7 6','#bf7865',1.3,.95);
  shrimp+=line('M-15-18Q-7-23 0-18M-18-6Q-20-12-14-15','#ffe4bb',1.45,.98);
  shrimp+=e(6,-17,1.3,1.2,'#62473b','stroke="none"');
  art+=`<g transform="translate(99 121) rotate(-14) scale(.8)">${shrimp}</g>`;

  // One scallop has a fan-shaped shell and a small soft ivory adductor, not a pile of fish.
  let scallop=p('M-17 5Q-24-4-16-13Q-8-21 0-20Q8-22 16-14Q24-5 17 5L7 13L-7 13Z',g('shell'),'stroke="#92765b" stroke-width="2"');
  scallop+=p('M-14 1Q-16-8-9-12Q0-18 9-12Q17-7 14 1L6 9L-6 9Z','#fff4d4','stroke="none"');
  scallop+=line('M0-16L0 2M-9-12L-4 3M9-12L4 3M-16-5L-8 5M16-5L8 5','#c5a678',1.3,.96);
  scallop+=e(0,4,7,5,'#fff8df','stroke="#cebd95" stroke-width="1.2"');
  scallop+=line('M-4 2Q0 0 4 2','#fffff0',1.3,.98);
  art+=`<g transform="translate(161 120) rotate(12) scale(.79)">${scallop}</g>`;

  // Two small transparent ice pieces leave generous space around the seafood.
  let ice=p('M-8-4L3-6L8 0L6 7L-4 8L-9 2Z','#f5fff0','fill-opacity=".72" stroke="#96b4ae" stroke-width="1.3"');
  ice+=line('M-7-4L-1 0L7 0M-1 0L-3 6','#fffff5',1.3,.98);
  art+=`<g transform="translate(130 126) rotate(-8)">${ice}</g>`;
  art+=`<g transform="translate(188 124) rotate(18) scale(.85)">${ice}</g>`;
  art+=p('M79 111L85 111L70 130L64 130Z','#fffff0','stroke="none" opacity=".74"');
  art+=line('M94 110L112 110M207 113L201 125','#fffff2',1.55,.98);

  if(level===3){
    // The thicker insulated lip and side cooling module are actual third-level functions.
    art+=p('M47 137Q128 144 210 137L208 145Q129 151 46 145Z',g('rim'),'stroke="#829d97" stroke-width="1.8"');
    art+=line('M55 140Q129 147 201 140','#fffef1',1.55,.98);
    art+=p('M222 144L234 139L238 145L237 172L224 179L220 173Z',g('metal'),'stroke="#5a7c78" stroke-width="2.4"');
    art+=e(229,157,5.3,7,'#c3d9cf','stroke="#6e9690" stroke-width="1.45"');
    art+=line('M225 157L233 157M229 152L229 162M225 168L233 165','#6d918b',1.3);
    art+=line('M225 146L231 143M235 148L234 170','#f5ffef',1.35,.97);
  }else{
    art+=r(120,137,16,4,2,g('metal'),'stroke="#6a8f88" stroke-width="1.4"');
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>海鲜冰箱 · 冰鲜柜器材新版</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const producerSeafoodCandidates=[1,2,3].map(level=>({
  id:`seafood-fridge-l${level}`,code:`EQ06-L${level}`,name:'海鲜冰箱',familyId:'seafood-fridge',level,
  expectedOccupancy:[.78,.82,.84][level-1],svg:seafoodFridge(level),
  reason:[
    '海蓝银白低宽冰鲜柜，以圆角保温体、斜透明玻璃盖和两只固定短脚形成安稳横向轮廓；一只鲜虾、一枚扇贝和两小透冰清楚展示海鲜来源。',
    '冰鲜柜后部增加低透明挡板，下面改为双收纳门和独立横向金属把手；保持低宽固定柜体及少量海鲜展示，以结构升级区分等级。',
    '双段弧形玻璃保鲜盖通过中央滑轨分开，厚银白保温沿与侧金属散热模块形成完整冷藏结构；一虾一扇贝仍清楚可见，不用雨棚或堆鱼表现升级。'
  ][level-1],
  design:{
    silhouette:['低宽横向冰柜，斜玻璃盖、圆角海蓝保温体和固定短脚','低宽冰柜加后透明挡板、下双收纳门及独立把手','双段弧形玻璃保鲜盖、厚保温沿、下双门和侧金属散热模块'][level-1],
    angle:'三分之四俯视，看见银白保温沿、斜玻璃面、少量冰鲜海产与金属侧面，左上光',
    material:'海蓝搪瓷保温体、银白金属、轻透冷玻璃、柔珊瑚鲜虾和奶金扇贝，近黑细描边清楚',
    identity:'仅对应fresh-sea当前链：鲜虾、鱿鱼、扇贝、鲷鱼、金枪鱼、三文鱼、生蚝、海螺、青蟹、龙虾、帝王蟹；展示一虾一扇贝，不使用旧鳕鱼、鲶鱼或肥蟹身份',
    progression:'L1斜盖矮柜；L2增加后挡板和下双门；L3增加双弧保鲜盖、厚保温沿和侧散热结构，不靠纯换色或放大区分',
    container:'两只固定短脚、无轮、无集市棚，无文字数字或等级标牌；少量冰块与海产，透明留白和视觉居中'
  }
}));

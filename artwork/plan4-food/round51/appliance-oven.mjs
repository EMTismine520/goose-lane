// Round 51: compact baking ovens with visible racks, heating and real structural upgrades.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const r=(x,y,w,h,rx,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function oven(level){
  const prefix=`r51-oven-l${level}-`,g=id=>`url(#${prefix+id})`;
  const defs=grad(prefix+'cream',['#fff7dc','#eee2bb','#d2be91'])
    +grad(prefix+'mint',['#d4e5cf','#a9c8b4','#7bada0'])
    +grad(prefix+'metal',['#f8f5df','#d4dcc8','#a1b8ac'])
    +grad(prefix+'glass',['#768477','#52665e','#3c514b'])
    +grad(prefix+'heat',['#969174','#8a7e5b','#b98a50'])
    +grad(prefix+'bread',['#ffe1a0','#e8bd73','#c89552']);
  let art=e(133,213,88,10,'#697c63','stroke="none" opacity=".12"');
  if(level===3){
    art+=p('M44 198L207 198L224 188L225 199L210 212L46 212Q40 208 44 198Z',g('mint'));
    art+=line('M50 207L202 207M212 204L220 198','#edf3d9',1.55,.96);
    art+=r(58,210,20,8,3,'#65776b','stroke="#536457" stroke-width="2"');
    art+=r(177,210,20,8,3,'#65776b','stroke="#536457" stroke-width="2"');
  }else{
    art+=r(59,195,18,10,3,'#6c7b6a','stroke="#526251" stroke-width="2"');
    art+=r(176,195,18,10,3,'#6c7b6a','stroke="#526251" stroke-width="2"');
  }
  // A softly rounded front and a small mint side keep the oven compact, rather than a tall fridge.
  art+=p('M202 64L220 76Q223 80 223 88L225 178Q226 191 205 199L200 186Z',g('mint'));
  art+=line('M215 89L218 173M216 184L209 190','#e4f1d8',1.6,.96);
  art+=r(42,53,164,level===3?152:145,16,g('cream'));
  art+=line('M52 78L52 67Q52 61 61 61L187 61M52 89L52 109','#fffde8',1.8,.96);
  art+=p('M194 79Q201 87 201 101L201 180Q199 192 184 193L76 193Q68 192 63 189Q142 191 180 188Q194 186 194 174Z','#c9ba91','stroke="none" opacity=".28"');

  if(level===3){
    // A separately framed thermostat area is paired with real convection and rack upgrades.
    art+=r(59,64,130,19,6,'#f8e9bf','stroke="#baad82" stroke-width="1.45"');
    art+=e(85,73.5,6.2,6.1,g('mint'),'stroke="#667e68" stroke-width="1.6"');
    art+=e(130,73.5,6.2,6.1,g('mint'),'stroke="#667e68" stroke-width="1.6"');
    art+=line('M85 70L85 74M130 70L130 74','#f9ffe5',1.4);
    art+=e(169,73.5,2.6,2.5,'#edc282','stroke="#aa8759" stroke-width="1.3"');
  }else{
    art+=e(171,74,6.3,6.2,g('mint'),'stroke="#6c8067" stroke-width="1.6"');
    art+=line('M171 70L171 74','#ffffe9',1.4);
    art+=e(73,74,2.7,2.6,'#e5bc78','stroke="#b39360" stroke-width="1.3"');
    art+=line('M90 73L136 73','#d6c89e',1.4,.88);
  }

  // The full independent glass door has a horizontal pull, not a side microwave handle.
  art+=r(55,88,138,94,12,level===1?g('mint'):g('metal'));
  if(level>=2)art+=r(60,93,128,84,9,'#8eaa95','stroke="#627c69" stroke-width="1.45"');
  art+=r(65,101,118,72,7,g('glass'),'stroke="#40534a" stroke-width="1.8"');
  art+=r(70,106,108,62,5,g('heat'),'stroke="none" opacity=".65"');
  if(level===3){
    // The back-wall fan and short side ducts show hot-air baking, not a turntable.
    art+=e(128,123,18,17,'#6e7864','stroke="#b7b895" stroke-width="1.4"');
    art+=e(128,123,13.5,12.5,'#586b5e','stroke="#899b7a" stroke-width="1.3"');
    art+=p('M127 121Q117 110 124 111Q132 110 131 120L129 122Q141 115 140 122Q140 130 130 126L128 125Q128 139 122 134Q116 130 125 124Z','#acb69a','stroke="#6f826a" stroke-width="1.25"');
    art+=e(128,123,2.6,2.4,'#d0d7b8','stroke="#7a8e71" stroke-width="1.2"');
    art+=line('M74 110L74 119M74 128L74 144M175 111L175 122M175 132L175 145','#b7bb97',1.5,.8);
  }

  function rack(y){
    let rack=p(`M77 ${y-7}L173 ${y-7}L181 ${y}L70 ${y}Z`,'none','stroke="#bdc8b3" stroke-width="1.45"');
    rack+=line(`M86 ${y-6}L80 ${y-1}M107 ${y-6}L103 ${y-1}M128 ${y-6}L127 ${y-1}M150 ${y-6}L152 ${y-1}M168 ${y-6}L173 ${y-1}`,'#9db6a4',1.3,.95);
    rack+=line(`M72 ${y+1}L178 ${y+1}`,'#e0e1bd',1.55,.98);
    return rack;
  }
  if(level===1)art+=rack(151);
  if(level===2)art+=rack(121)+rack(151);
  if(level===3)art+=rack(114)+rack(136)+rack(161);

  // Exactly one small tray of round bread is a restrained baking cue in every oven.
  const trayY=level===3?157:147;
  art+=p(`M98 ${trayY-5}L148 ${trayY-5}L154 ${trayY}L92 ${trayY}Z`,g('metal'),'stroke="#7f9c8b" stroke-width="1.3"');
  art+=p(`M104 ${trayY-5}Q103 ${trayY-21} 119 ${trayY-23}Q137 ${trayY-24} 144 ${trayY-10}L145 ${trayY-5}Z`,g('bread'),'stroke="#9f7f4d" stroke-width="1.7"');
  art+=line(`M113 ${trayY-17}L118 ${trayY-13}M124 ${trayY-19}L129 ${trayY-14}`,'#fff1c5',1.35,.98);
  art+=line(`M106 ${trayY-6}L141 ${trayY-6}`,'#edcd91',1.3,.95);
  // A visible lower heating element reinforces the oven's baking identity.
  const heatY=level===3?167:164;
  art+=line(`M77 ${heatY}L94 ${heatY}Q98 ${heatY} 98 ${heatY+3}L98 ${heatY+4}L118 ${heatY+4}Q122 ${heatY+4} 122 ${heatY+1}L122 ${heatY}L142 ${heatY}Q146 ${heatY} 146 ${heatY+3}L146 ${heatY+4}L171 ${heatY+4}`,'#dfaa70',1.6,.97);
  // Door reflections stay narrow, so racks and trays are still readable through the glass.
  art+=p('M69 106L73 106L80 159L76 162Z','#f4f5d5','stroke="none" opacity=".14"');
  art+=line('M71 108L74 126M77 149L78 158M175 109L176 118','#e6efcf',1.4,.52);
  art+=r(77,92,4,10,2,g('metal'),'stroke="#748e79" stroke-width="1.4"');
  art+=r(169,92,4,10,2,g('metal'),'stroke="#748e79" stroke-width="1.4"');
  art+=r(71,90,108,7,3.5,g('metal'),'stroke="#607b67" stroke-width="2.1"');
  art+=line('M78 92L170 92','#ffffea',1.35,.98);
  art+=line('M65 183L183 183','#f9efd0',1.5,.96);

  if(level>=2){
    // A separate ventilated side housing appears only after the first oven.
    art+=p('M206 107L223 113L224 159L207 153Z',g('metal'),'stroke="#6c8d7c" stroke-width="2.2"');
    art+=line('M211 118L219 121M211 127L219 130M211 136L219 139M211 145L219 148','#799989',1.4,.96);
    art+=line('M209 111L220 115M221 119L222 153','#edf5db',1.35,.96);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>烤箱 · 烘焙器材新版</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const applianceOvenCandidates=[1,2,3].map(level=>({
  id:`oven-l${level}`,code:`EQ20-L${level}`,name:'烤箱',familyId:'oven',level,
  expectedOccupancy:[.78,.82,.84][level-1],svg:oven(level),
  reason:[
    '圆角奶油薄荷小箱体，独立深玻璃门与明确横向把手包住一层金属烤架；一小盘圆面包与下部发热结构清楚表达烘焙用途，低级小巧。',
    '隔热门框和侧通风壳形成真实冷触防护结构，玻璃门后改为清楚双层烤架；食物仍只有一小盘面包，升级不靠塞食物或多加按钮。',
    '稳固低底座、独立温控区、三层烤架及后壁热风结构一起升级，烘烤层次在深玻璃窗后清楚分开；保持紧凑正面烤箱轮廓。'
  ][level-1],
  design:{
    silhouette:['圆角小烤箱、独立玻璃门、横把手和单层烤架','隔热门框、双层烤架和侧通风壳','稳固低底座、独立温控区、多层烤架与后壁热风结构'][level-1],
    angle:'略有俯视的紧凑正面，横把手、烤架层次和薄荷色金属侧面可见，左上光',
    material:'奶油色搪瓷、柔薄荷金属、浅金烤物、深色耐热玻璃和克制暖发热色，近黑细描边',
    identity:'烤箱属于烹饪器材，没有食材产出链；以烤架、托盘与发热结构表示既有烘焙用途，和圆锅、平煎台、开放炭炉或微波炉区分',
    progression:'基础小箱体与单层烤架；增加双层架、隔热门框和侧通风壳；最后增加稳固底座、独立温控区和多层热风烘烤结构',
    container:'每级透窗最多一小盘圆面包色标；无文字、数字、刻度、角标或食物堆，低级小巧、透明留白和视觉居中'
  }
}));

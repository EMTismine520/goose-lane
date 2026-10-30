// Round 50: the chopping-board appliance, not an ingredient producer or a stove.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const r=(x,y,w,h,rx,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function choppingBoard(level){
  const prefix=`r50-chop-l${level}-`,g=id=>`url(#${prefix+id})`;
  const defs=grad(prefix+'maple',['#f4dca8','#dfbd83','#c49a60'])
    +grad(prefix+'edge',['#e4c28b','#c89d65','#ac8050'])
    +grad(prefix+'cream',['#fffdf0','#f0e8d2','#d7ccb0'])
    +grad(prefix+'metal',['#f7fff0','#d5dfd6','#a6b8b0'])
    +grad(prefix+'tomato',['#f6ac89','#e47d69','#bd5e53'])
    +grad(prefix+'green',['#b8cf83','#87aa62','#5f874a']);
  let art=e(135,level===3?198:187,96,10,'#7c7958','stroke="none" opacity=".12"');
  if(level===3){
    // Two visible broad non-slip feet reinforce the board, without turning it into a table.
    art+=p('M65 177L86 175L87 193Q78 199 67 194Z',g('cream'),'stroke="#8b8266" stroke-width="2.4"');
    art+=p('M188 166L209 164L211 181Q202 187 190 183Z',g('cream'),'stroke="#8b8266" stroke-width="2.4"');
    art+=line('M69 191L82 191M193 180L206 178','#98a18a',2.2,.96);
  }
  // The entire main object is one low, thick, softly rounded maple cutting board.
  art+=p('M35 123L51 165Q57 176 70 172L217 158Q227 155 225 145L225 158Q228 167 217 171L70 186Q56 190 50 180L35 137Z',g('edge'));
  art+=p('M64 92L195 92Q204 92 208 100L225 143Q229 153 217 158L70 172Q57 176 51 165L35 123Q31 112 42 105Z',g('maple'));
  art+=line('M43 116Q44 111 53 108L69 100L188 99M60 166Q64 171 74 169L209 156','#fff0c5',1.7,.96);
  art+=line('M59 179L75 182M90 181L114 178M187 172L207 168','#e7c18a',1.4,.92);
  // A few long, gentle grain curves describe maple; there are no letter-like markings.
  art+=line('M62 132Q93 121 125 126M72 145Q98 135 121 138M143 153Q169 145 192 148','#c39b62',1.35,.6);
  art+=line('M58 136Q86 127 109 130M155 104Q173 102 189 106','#f8e2b2',1.35,.77);

  if(level>=2){
    // The recessed groove follows the perimeter and leaves a broad working centre.
    art+=p('M66 105L188 105Q196 105 200 114L212 143Q215 150 205 152L75 166Q65 168 61 160L48 126Q45 119 55 114Z','none','stroke="#ae8756" stroke-width="1.5"');
    art+=line('M55 125L66 155Q69 162 77 161L201 149','#fce7b9',1.35,.94);
    // Front and rear preparation zones remain part of the same wooden board.
    art+=line('M58 141Q129 144 205 133','#b08b58',1.5,.86);
    art+=line('M60 138Q128 141 202 130','#f9e2b1',1.3,.91);
  }

  function tomato(x,y,scale=1){
    let food=p('M-17 2Q-17-12-5-14Q0-18 6-13Q18-12 18 1Q18 15 2 18Q-15 17-17 2Z',g('tomato'),'stroke="#965c48" stroke-width="2.2"');
    food+=p('M-7-13L-2-19L2-15L9-18L8-12L15-10L7-6L1-9L-5-5L-7-10L-14-10Z',g('green'),'stroke="#628048" stroke-width="1.5"');
    food+=line('M-9-2Q-12 2-9 6M-6-4L-4-5','#ffd8b5',1.45,.97);
    return `<g transform="translate(${x} ${y}) scale(${scale})">${food}</g>`;
  }
  function cucumber(x,y,angle=0,scale=1){
    let food=p('M-28-6Q-34 0-27 6L23 8Q34 4 29-6Z',g('green'),'stroke="#5a7841" stroke-width="2.1"');
    food+=p('M-25-4Q-30 0-24 4L22 5Q28 2 25-4Z','#dce7ac','stroke="#9ab66c" stroke-width="1.3"');
    food+=e(-12,.1,2.6,1.3,'#fff3ca','stroke="none"');
    food+=e(0,.4,2.6,1.3,'#fff3ca','stroke="none"');
    food+=e(13,.6,2.6,1.3,'#fff3ca','stroke="none"');
    food+=line('M-21-3L19-2','#f4f7ce',1.3,.98);
    return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">${food}</g>`;
  }
  art+=tomato(89,125,level===1?1:.96);
  if(level===3){
    // One removable shallow preparation dish is small enough to leave the board dominant.
    art+=p('M154 113Q159 107 184 107Q208 107 214 114L213 121Q207 130 184 131Q160 131 155 122Z',g('cream'),'stroke="#a29c80" stroke-width="2"');
    art+=e(184,113,30,10,'#fffbea','stroke="#b5b195" stroke-width="1.45"');
    art+=e(184,113,24,6.5,'#e5e8cf','stroke="#c4c6a7" stroke-width="1.3"');
    art+=cucumber(184,111,4,.78);
    // A removable low divider separates the clear front work area from the prepared food.
    art+=p('M125 110L131 108L150 151L144 155Z',g('cream'),'stroke="#9d8057" stroke-width="2.1"');
    art+=line('M129 113L146 148','#fff6d8',1.4,.98);
  }else{
    art+=cucumber(146,level===1?127:122,-13,.9);
  }

  if(level===1){
    // Exactly one short-handled chef knife lies flat along the clear front edge.
    let knife=p('M-28-6L-3-6L7 1Q7 7 1 8L-28 8Q-33 5-28-6Z',g('metal'),'stroke="#758e85" stroke-width="1.8"');
    knife+=line('M-25 5L0 5','#fffff5',1.35,.98);
    knife+=p('M4-6L24-6Q29-5 29 0L29 4Q27 8 23 7L4 6Z','#a7885b','stroke="#6c6044" stroke-width="2.1"');
    knife+=e(12,.1,1.1,1.1,'#efe3bd','stroke="none"');
    knife+=e(21,.1,1.1,1.1,'#efe3bd','stroke="none"');
    art+=`<g transform="translate(172 154) rotate(-16)">${knife}</g>`;
  }else{
    // The same single knife is now safely stored in a side-mounted cream sheath.
    let sheath=p('M-6-11L6-11L8 23Q7 29 1 30Q-5 29-6 24Z',g('cream'),'stroke="#967b56" stroke-width="2.1"');
    sheath+=line('M-2-6L0 22','#fff8df',1.4,.97);
    sheath+=r(-4,-27,8,18,3,'#a98a60','stroke="#6d6046" stroke-width="2"');
    sheath+=e(0,-20,1.1,1.1,'#eee0b7','stroke="none"');
    sheath+=r(-8,-12,16,4,2,'#c8c6a9','stroke="#8d947b" stroke-width="1.4"');
    art+=`<g transform="translate(226 150) rotate(-8)">${sheath}</g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>小鹅砧板 · 冷食备料器材新版</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const applianceChoppingCandidates=[1,2,3].map(level=>({
  id:`chopping-board-l${level}`,code:`EQ15-L${level}`,name:'小鹅砧板',familyId:'chopping-board',level,
  expectedOccupancy:[.78,.82,.84][level-1],svg:choppingBoard(level),
  reason:[
    '低厚圆角枫木砧板，保留温润木纹和完整宽工作面；一把短柄小厨刀平放在清空的前沿，番茄与一段大黄瓜提示冷食备料用途。',
    '增加边缘集汁沟和清楚的前后备料分区，唯一厨刀收入侧挂刀鞘，刀柄短而稳定；砧板仍是主体，不堆刀具或碎切丁。',
    '低矮加固防滑脚座托住厚砧板，配一枚可取浅备料盘和独立小隔板，番茄与大黄瓜分开准备；凝练的木质主体与侧刀鞘保持清楚。'
  ][level-1],
  design:{
    silhouette:['低厚圆角砧板与一把短柄平放小厨刀','圆角砧板、边缘集汁沟、前后分区和侧挂刀鞘','加固低脚座、砧板集汁沟、可取浅备料盘与独立隔板'][level-1],
    angle:'三分之四俯视，枫木宽工作面、低厚前边与侧面细节可见，左上光与柔和Q版体积',
    material:'温润枫木、奶油色小配件、克制银灰刀面、清楚红番茄与浅绿黄瓜，近黑细描边',
    identity:'用于冷食切配和备料，可制作番茄小沙拉、田园丰收碗、田园沙拉与凉拌卤鹅肉等现有配方；番茄和黄瓜标志清楚可辨',
    progression:'基础低厚砧板与单刀；再加集汁沟、分区和刀鞘；最后加防滑脚座、可取小盘和独立隔板，不做炉灶或果汁机',
    container:'只用番茄和黄瓜两种大食材标志，无碎切丁、刀具堆、文字数字或等级角标，透明留白、低级简洁与视觉居中'
  }
}));

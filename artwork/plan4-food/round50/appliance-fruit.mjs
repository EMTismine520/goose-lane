// Round 50: manually operated fruit preparation, not an electric blender or a producer.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const r=(x,y,w,h,rx,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line=(d,c,w=1.5,o=1)=>p(d,'none',`stroke="${c}" stroke-width="${w}" opacity="${o}"`);
const grad=(id,cs)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".87" y2="1">${cs.map((c,i)=>`<stop offset="${i/(cs.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const defs=id=>grad(`${id}-cream`,['#fff9df','#f3e7be','#d6c690'])
 +grad(`${id}-coral`,['#fac1a7','#e99a80','#c97966'])
 +grad(`${id}-green`,['#e2edba','#b8cf8d','#87a86d'])
 +grad(`${id}-metal`,['#f7faeb','#cfddd0','#93ac9b'])
 +grad(`${id}-glass`,['#f7fff3','#dfefe6','#b2d0bd'])
 +grad(`${id}-fruit`,['#fff1ad','#f6d66e','#e4b644'])
 +grad(`${id}-juice`,['#fff5bd','#f8df8c','#edc66a']);
const doc=(id,art,dx,dy)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>鲜果料理台 · 手动压榨与收汁备制候选</title><defs>${defs(id)}</defs><g transform="translate(${dx} ${dy})" stroke="#45382f" stroke-width="3.1" stroke-linejoin="round" stroke-linecap="round">${art}</g></svg>`;
const base=(id,x,y,w,h)=>`${p(`M${x+6} ${y+7}L${x+w-8} ${y+7}V${y+h}Q${x+w-8} ${y+h+5} ${x+w-15} ${y+h+5}H${x+15}Q${x+8} ${y+h+5} ${x+8} ${y+h}Z`,`url(#${id}-coral)`)}${p(`M${x} ${y+5}L${x+15} ${y-3}H${x+w-6}Q${x+w+3} ${y-2} ${x+w} ${y+5}L${x+w-11} ${y+12}H${x+7}Q${x} ${y+11} ${x} ${y+5}Z`,`url(#${id}-cream)`,'stroke-width="2.4"')}${line(`M${x+15} ${y+2}H${x+w-16}`,'#fffef0',1.8,.96)}${line(`M${x+23} ${y+h-1}H${x+w-23}`,'#fbd0ae',1.4,.9)}`;
const pitcher=(id,x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${p('M18 7Q42 2 39 23Q38 40 20 39L20 31Q30 32 31 22Q33 12 19 15Z',`url(#${id}-glass)`,'stroke="#729580" stroke-width="1.7" fill-opacity=".8"')}${p('M-23 0L-14 8L-16 43Q-15 50-5 52H9Q19 51 20 44L23 1Z',`url(#${id}-glass)`,'stroke="#6e947d" stroke-width="1.8" fill-opacity=".72"')}${p('M-13 27Q2 31 16 26L15 43Q14 47 7 48H-4Q-12 47-13 43Z',`url(#${id}-juice)`,'stroke="#c5bb77" stroke-width="1.35" fill-opacity=".8"')}${p('M-23 0Q-4-8 22-1Q26 1 19 5Q1 10-14 5L-24-4L-31-4Z','#edf6e8','stroke="#789a83" stroke-width="1.6" fill-opacity=".7"')}${line('M-13 10L-12 23M-11 33V40M-11 1Q0-3 11 0','#ffffff',1.6,.97)}${line('M9 16H15M9 23H15','#9cbaa5',1.3,.9)}</g>`;
const citrus=(id,x,y,s=1,angle=0)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${s})">${p('M-25-1Q-23-21-1-23Q23-24 26-3Q24 14 1 16Q-22 17-25-1Z',`url(#${id}-fruit)`,'stroke="#ac883e" stroke-width="1.7"')}${e(0,-5,21,14,'#fff4c3','stroke="#e1bf68" stroke-width="1.5"')}${p('M-16-8Q-9-17-1-16L-1-7ZM4-16Q14-15 17-7L5-6ZM18-2Q11 6 3 6L3-2ZM-3 6Q-13 5-17-2L-5-4Z','#f6d677','stroke="#fdf0bd" stroke-width="1.3"')}${e(0,-5,3,2.5,'#fffbe0','stroke="none"')}${line('M-17-13Q-8-20 3-19','#fff8d3',1.4,.96)}</g>`;
const reamer=(id,x,y,s=1,filter=false)=>`<g transform="translate(${x} ${y}) scale(${s})">${p('M-27 9L-18 35Q0 44 19 35L28 8Z',`url(#${id}-green)`,'stroke-width="2.1"')}${e(0,6,36,12,`url(#${id}-metal)`,'stroke="#6b8873" stroke-width="1.8"')}${p('M-13 4Q-8-18 0-23Q10-18 15 4Q1 12-13 4Z',`url(#${id}-cream)`,'stroke="#8c9571" stroke-width="1.7"')}${line('M-7 4L0-19L8 4','#b9bc8d',1.4,.95)}${filter?line('M-26 5L-20 7M-19 1L-15 2M19 1L24 3M20 8L27 6','#7d9d84',1.5,.97):''}${p('M31 8L46 13L42 19L24 15Z',`url(#${id}-metal)`,'stroke="#7c927b" stroke-width="1.5"')}${line('M-27 10Q-2 21 23 11','#f7ffe9',1.6,.95)}</g>`;
const pressHead=(id,x,y)=>`${p(`M${x-25} ${y+10}Q${x-23} ${y-10} ${x} ${y-13}Q${x+23} ${y-10} ${x+25} ${y+10}Z`,`url(#${id}-metal)`,'stroke-width="2"')}${line(`M${x-16} ${y-1}Q${x} ${y-13} ${x+16} ${y-1}`,'#fbfff1',1.6,.97)}${p(`M${x-3} ${y-13}V${y-29}H${x+4}V${y-13}Z`,`url(#${id}-metal)`,'stroke="#6f8974" stroke-width="1.6"')}`;

function levelOne(){
 const id='r50-fruit-one';
 let art=base(id,37,183,181,21);
 art+=p('M77 159H112L117 183Q97 191 74 183Z',`url(#${id}-coral)`,'stroke-width="2.2"');
 art+=pitcher(id,171,137,.93);
 art+=reamer(id,96,132,1);
 // One cut citrus half rests on the rear rim; the reamer remains plainly hand operated.
 art+=citrus(id,93,111,.70,-15);
 art+=line('M52 186H64M128 187H144','#e1d6a8',1.4,.9);
 return doc(id,art,.25,-24.25);
}

function levelTwo(){
 const id='r50-fruit-two';
 let art=base(id,36,190,183,20);
 art+=p('M53 185V87Q53 72 67 72H101V83H72Q65 83 65 92V185Z',`url(#${id}-coral)`,'stroke-width="2.5"');
 art+=p('M65 85L78 80H114V92H79L66 98Z',`url(#${id}-cream)`,'stroke-width="2.2"');
 // The lever pivots on the frame and drives a vertical pressure link above the strainer.
 art+=p('M101 87L137 52Q142 47 147 52L151 57L111 98Z',`url(#${id}-green)`,'stroke-width="2.2"');
 art+=e(109,88,5,5,`url(#${id}-metal)`,'stroke="#6f8b77" stroke-width="1.5"');
 art+=pressHead(id,98,111);
 art+=pitcher(id,171,145,.86);
 art+=p('M78 163H114L121 190Q100 197 73 190Z',`url(#${id}-coral)`,'stroke-width="2.1"');
 art+=reamer(id,97,140,.98,true);
 art+=citrus(id,96,135,.62,-7);
 art+=p('M145 193Q170 201 196 193L200 198Q172 208 142 199Z',`url(#${id}-green)`,'stroke="#809968" stroke-width="1.4"');
 art+=line('M59 94V168M79 77H98','#f9d0b2',1.6,.96);
 return doc(id,art,.25,-4.5);
}

function levelThree(){
 const id='r50-fruit-three';
 let art=base(id,30,197,201,20);
 // A braced manual head and a separate cold-drink preparation station share one sturdy base.
 art+=p('M46 191V60Q46 46 61 45H121V57H64Q59 57 59 65V191Z',`url(#${id}-coral)`,'stroke-width="2.6"');
 art+=p('M59 63L73 56H128V70H76L59 79Z',`url(#${id}-cream)`,'stroke-width="2.3"');
 art+=p('M104 75L151 29Q157 23 162 29L167 35L115 86Z',`url(#${id}-green)`,'stroke-width="2.3"');
 art+=e(113,75,5.5,5.5,`url(#${id}-metal)`,'stroke="#6f8c76" stroke-width="1.5"');
 art+=r(93,68,7,19,1.8,`url(#${id}-metal)`,'stroke="#6f8974" stroke-width="1.6"');
 art+=pressHead(id,96,112);
 art+=pitcher(id,153,150,.79);
 art+=p('M77 165H111L119 197Q96 203 72 197Z',`url(#${id}-coral)`,'stroke-width="2.1"');
 art+=reamer(id,95,141,.94,true)+citrus(id,95,136,.60,-8);
 // This closed metal shaker is equipment, without another drink, garnish or ingredient.
 art+=p('M188 154Q203 160 218 153L214 187Q213 195 201 195Q190 194 189 188Z',`url(#${id}-metal)`,'stroke="#6c8974" stroke-width="1.9"');
 art+=p('M188 154L193 142Q202 137 212 142L218 153Q205 161 188 154Z',`url(#${id}-cream)`,'stroke="#809578" stroke-width="1.8"');
 art+=p('M196 140V133Q202 128 209 133V140Z',`url(#${id}-metal)`,'stroke="#6c8974" stroke-width="1.5"');
 art+=line('M194 159L195 182M197 147L198 144','#f9fff1',1.5,.98);
 art+=p('M128 199Q151 207 178 199L180 204Q151 213 125 204Z',`url(#${id}-green)`,'stroke="#839d6a" stroke-width="1.4"');
 art+=p('M185 199Q202 205 221 198L224 203Q205 213 183 204Z',`url(#${id}-green)`,'stroke="#839d6a" stroke-width="1.4"');
 art+=line('M183 193V201M52 69V174M74 51H117','#f9d3b3',1.6,.95);
 art+=p('M43 193L52 182H65L69 197Z',`url(#${id}-cream)`,'stroke="#9c9a72" stroke-width="1.6"');
 return doc(id,art,-2.75,3.75);
}

export const applianceFruitCandidates=[
 {id:'fruit-press-l1',code:'EQ16-L1',name:'鲜果料理台',familyId:'fruit-press',deviceKind:'appliance',level:1,expectedOccupancy:.78,svg:levelOne(),
  reason:'奶油珊瑚小料理底座承托手压柑橘榨汁座和带嘴透明量壶，榨汁口朝向收汁壶，半颗柑橘清楚标识果饮备制，低矮手工结构区别电动搅拌机。',
  design:{silhouette:'低矮圆角料理底座、手压柑橘榨汁碗、带嘴透明收汁量壶，无电动主机',angle:'略俯视三分之四角度，榨汁座导流口与量壶开口的操作关系清楚',material:'奶油搪瓷、柔珊瑚底座、柑橘绿榨汁座、冷透玻璃与左上光',identity:'用于鲜果料理、果饮与奶茶等配方制作；只用半颗柑橘和一只透明收汁壶标识鲜果备制',upgrade:'一级为手压榨汁座和小备料台面，不预支压杆、稳定框架或摇制区',presentation:'78%主体、透明居中留白；无文字数字等级标牌，无饮品杯堆或额外食品'}},
 {id:'fruit-press-l2',code:'EQ16-L2',name:'鲜果料理台',familyId:'fruit-press',deviceKind:'appliance',level:2,expectedOccupancy:.82,svg:levelTwo(),
  reason:'增加与立柱连接的稳定手动压杆、垂直压头和滤网，透明量壶放在独立收汁托区，压榨、过滤与收汁路径明确，保持果饮奶茶备制身份。',
  design:{silhouette:'珊瑚稳压立柱、斜手动压杆、压头、滤网及独立收汁托区',angle:'三分之四俯视，可见压杆枢轴、垂直压头与导流收汁关系',material:'奶油珊瑚搪瓷、柑橘绿杆柄、轻金属滤碗与浅透玻璃，细近黑描边',identity:'用于果饮与奶茶的手动压榨、过滤和收汁备制；保留半颗柑橘与一只透明收汁壶，不堆大杯饮品',upgrade:'二级新增稳定压杆、滤网与独立收汁区，结构变化而非单纯放大',presentation:'82%主体、透明居中留白；无文字数字等级角标，无电机和咖啡磨仓'}},
 {id:'fruit-press-l3',code:'EQ16-L3',name:'鲜果料理台',familyId:'fruit-press',deviceKind:'appliance',level:3,expectedOccupancy:.84,svg:levelThree(),
  reason:'手动压头与加固立柱组成压榨区，收汁壶和封闭金属摇制筒各有独立托区，宽稳料理底座使压榨、收汁与冷饮摇制三个功能分区明确。',
  design:{silhouette:'加固手动压榨框架、透明收汁壶、独立封闭摇制筒与宽稳分区料理底座',angle:'三分之四俯视，压杆带动垂直压头，导流口对应壶口，右侧摇制区独立',material:'奶油珊瑚搪瓷、柑橘绿功能件、浅透玻璃与克制金属摇制筒，左上柔光',identity:'用于鲜果料理、果饮与奶茶等配方制作；食材标志仅半颗柑橘与一只收汁壶，封闭摇制筒用于冷饮备制',upgrade:'三级新增加固操作底座和独立冷饮摇制区，保持手动压榨，区别电动搅拌机、咖啡磨机及茶叶柜',presentation:'84%主体、透明居中留白；无文字数字等级角标，无饮品堆与配方外装饰'}}
];

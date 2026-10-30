// Round 48: a fixed-foot dairy cooler family, with structural upgrades at each level.
const path=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const rect=(x,y,w,h,r,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
const ellipse=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.5,opacity=1)=>path(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const gradient=(id,colors)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".87" y2="1">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const definitions=id=>gradient(`${id}-shell`,['#fffdf0','#f4f3dc','#d2e3cf'])
 +gradient(`${id}-mint`,['#e1f3e5','#b9dbca','#8fb7a7'])
 +gradient(`${id}-side`,['#c7e5d3','#a2c7b4','#7b9f90'])
 +gradient(`${id}-glass`,['#f3fff6','#daeee3','#afd2c3'])
 +gradient(`${id}-milk`,['#fffef5','#f8f3db','#e6dfc1'])
 +gradient(`${id}-metal`,['#eff6e9','#c5d9cd','#8fa99a'])
 +gradient(`${id}-cheese`,['#ffe99c','#f8cc68','#dfaa42']);
const document=(id,art,dx=0,dy=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>乳品冷柜 · 奶白薄荷玻璃保鲜柜候选</title><defs>${definitions(id)}</defs><g transform="translate(${dx} ${dy})" stroke="#3e3933" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
const foot=(id,x,y,w=12)=>path(`M${x} ${y}H${x+w}L${x+w-1} ${y+10}Q${x+w-2} ${y+12} ${x+2} ${y+12}L${x} ${y+10}Z`,`url(#${id}-metal)`,'stroke-width="2.2"');
const bottle=(id,x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${path('M-9-24H8V-15Q8-11 13-6Q16-2 16 5V30Q16 35 11 35H-12Q-17 35-17 30V4Q-17-3-13-7Q-9-12-9-15Z',`url(#${id}-milk)`,'stroke="#6e8c7b" stroke-width="1.7"')}${path('M-9-24V-15Q-1-12 8-15V-24Z','#d8ebe0','stroke="#87ac98" stroke-width="1.35"')}${rect(-11,-28,21,7,2,`url(#${id}-mint)`,'stroke="#648875" stroke-width="1.5"')}${path('M-12 3Q0 6 11 2V26Q10 30 6 30H-8Q-12 30-12 26Z','#fffdf0','stroke="none" opacity=".78"')}${line('M-9-8Q-14-2-13 6V24M-6-18H4','#fffef6',1.6,.98)}${line('M-10 33H9','#cfccb1',1.3,.8)}</g>`;
const cheese=(id,x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${path('M-21 0L8-13L22-1L20 17L-16 22L-21 14Z',`url(#${id}-cheese)`,'stroke="#96713b" stroke-width="1.7"')}${path('M-21 0L8-13L22-1L-13 7Z','#ffeaa5','stroke="#bd914d" stroke-width="1.4"')}${path('M-13 7L22-1L20 17L-16 22Z','#f6ce70','stroke="#bc914c" stroke-width="1.4"')}${ellipse(-5,13,3,2.5,'#d7a34e','stroke="none"')}${ellipse(11,8,3.3,2.4,'#e3ae50','stroke="none"')}${ellipse(12,-4,2.1,1.2,'#efc46b','stroke="none"')}${line('M-15 1L7-8M-11 9L-12 17','#fff0b5',1.3,.9)}</g>`;
const shelf=(id,x,y,w)=>`${path(`M${x} ${y}L${x+7} ${y-5}H${x+w}L${x+w-5} ${y+2}H${x}Z`,`url(#${id}-metal)`,'stroke="#83a692" stroke-width="1.4"')}${line(`M${x+4} ${y-1}H${x+w-9}`,'#f8fff1',1.3,.95)}`;
const pull=(id,x,y,h=30)=>`${rect(x,y,5.8,h,2.8,`url(#${id}-metal)`,'stroke="#6e8e7b" stroke-width="1.5"')}${line(`M${x+1.6} ${y+4}V${y+h-5}`,'#fbfff3',1.3,.94)}`;

function levelOne(){
 const id='r48-dairy-one';
 let art=foot(id,83,202,13)+foot(id,151,202,13);
 // Compact upright, with an integrated rounded side rather than a canopy.
 art+=path('M151 60L168 53Q182 52 183 67V187Q183 198 168 204L154 201Z',`url(#${id}-side)`,'stroke-width="2.7"');
 art+=rect(69,60,98,145,15,`url(#${id}-shell)`);
 art+=path('M79 65Q92 60 113 61H151Q158 61 163 68L149 71H84Z','#fffff1','stroke="none" opacity=".8"');
 art+=rect(79,75,78,111,10,`url(#${id}-mint)`,'stroke="#709c86" stroke-width="1.8"');
 art+=rect(85,81,66,99,7,`url(#${id}-glass)`,'stroke="#a3c5b2" stroke-width="1.4"');
 art+=line('M91 88V114M91 122V132M121 87L139 94','#fbfff5',1.7,.97);
 art+=bottle(id,106,127,.76)+cheese(id,134,158,.61);
 art+=shelf(id,87,176,63);
 art+=pull(id,151,111,31);
 art+=line('M81 193H151','#fffdf0',1.8,.98);
 art+=line('M173 77V177','#c8e5d4',1.5,.94);
 return document(id,art,2.25,-5.5);
}

function levelTwo(){
 const id='r48-dairy-two';
 let art=foot(id,77,207,13)+foot(id,154,207,13);
 art+=path('M153 37L172 30Q185 31 186 46V193Q186 205 169 211L156 206Z',`url(#${id}-side)`,'stroke-width="2.7"');
 art+=rect(64,37,107,175,16,`url(#${id}-shell)`);
 art+=path('M76 42Q94 37 115 38H154Q161 39 166 45L150 49H80Z','#fffff2','stroke="none" opacity=".83"');
 // Two visible levels: the bottle and the cheese occupy separate shelves.
 art+=rect(74,54,87,134,11,`url(#${id}-mint)`,'stroke="#6e9b85" stroke-width="1.8"');
 art+=rect(81,61,73,120,7,`url(#${id}-glass)`,'stroke="#a2c4b0" stroke-width="1.4"');
 art+=line('M87 69V88M116 66L141 76','#fbfff6',1.7,.97);
 art+=bottle(id,104,103,.79);
 art+=shelf(id,83,135,69);
 art+=cheese(id,121,161,.81);
 art+=shelf(id,83,179,69);
 art+=pull(id,156,100,34);
 art+=rect(76,192,83,14,4,'#edf0d8','stroke="#a7b69b" stroke-width="1.5"');
 art+=rect(108,196,22,4.2,2,`url(#${id}-metal)`,'stroke="#7a9984" stroke-width="1.3"');
 // A structural side grip, not a vending button or dispensing slot.
 art+=path('M182 83L192 79Q197 78 197 84V116Q197 121 192 123L182 127V120L189 117V88L182 91Z',`url(#${id}-metal)`,'stroke="#668574" stroke-width="1.8"');
 art+=line('M177 51V72M177 142V191','#d2ead9',1.5,.95);
 return document(id,art,-2,3.5);
}

function levelThree(){
 const id='r48-dairy-three';
 let art=foot(id,72,214,14)+foot(id,159,214,14);
 art+=path('M160 24L181 18Q195 20 196 35V202Q196 216 176 221L161 215Z',`url(#${id}-side)`,'stroke-width="2.7"');
 art+=rect(56,25,124,195,17,`url(#${id}-shell)`);
 art+=path('M69 30Q84 25 111 26H160Q168 26 174 34L157 38H73Z','#fffff1','stroke="none" opacity=".85"');
 // A small refrigeration grille is integrated into the top shell.
 art+=rect(72,38,91,17,5,`url(#${id}-mint)`,'stroke="#8bae98" stroke-width="1.5"');
 art+=line('M82 43H152M82 48H152','#729482',1.4,.9);
 // Two separate tall rounded glass doors, never a dispenser frontage.
 art+=rect(66,64,49,134,9,`url(#${id}-mint)`,'stroke="#6e9983" stroke-width="1.8"');
 art+=rect(120,64,50,134,9,`url(#${id}-mint)`,'stroke="#6e9983" stroke-width="1.8"');
 art+=rect(72,70,37,122,5,`url(#${id}-glass)`,'stroke="#a0c4af" stroke-width="1.3"');
 art+=rect(126,70,38,122,5,`url(#${id}-glass)`,'stroke="#a0c4af" stroke-width="1.3"');
 art+=line('M78 79V106M134 78L157 89','#fbfff6',1.7,.98);
 art+=bottle(id,90,141,.83);
 art+=shelf(id,74,185,33);
 art+=shelf(id,128,125,34);
 art+=cheese(id,145,162,.72);
 art+=shelf(id,128,185,34);
 art+=pull(id,108,107,31)+pull(id,121,107,31);
 art+=rect(69,203,99,10,3,'#d9e6cf','stroke="#a6b79c" stroke-width="1.4"');
 art+=line('M77 208H158','#f7ffed',1.4,.95);
 art+=line('M185 43V183','#c7e4d2',1.6,.92);
 art+=path('M184 191L189 189V202L184 204Z','#98b8a5','stroke="#799e88" stroke-width="1.3"');
 return document(id,art,2.25,6);
}

export const producerDairyCandidates=[
 {id:'dairy-fridge-l1',code:'EQ07-L1',name:'乳品冷柜',familyId:'dairy-fridge',level:1,expectedOccupancy:.78,svg:levelOne(),
  reason:'奶白薄荷绿矮瘦立柜以单玻璃门和两只固定短脚建立乳品身份，柜内仅小牛奶瓶与奶酪角，清爽冷藏材质与禽肉推车、横向海鲜柜明确区分。',
  design:{silhouette:'紧凑竖向圆角保鲜体、单玻璃门、固定短脚，无轮无雨棚',angle:'三分之四角度，侧面冷柜厚度与玻璃门边清楚',material:'奶白搪瓷、薄荷细边、清浅冷玻璃与轻金属门把，左上光',identity:'仅fresh-milk链，以一小牛奶瓶和一枚奶酪角标识，不放其它食品',upgrade:'一级矮瘦单门冷藏体，不预支双层抽屉或双门结构',presentation:'78%主体、透明留白；无文字数字等级标牌、投币口或出货口'}},
 {id:'dairy-fridge-l2',code:'EQ07-L2',name:'乳品冷柜',familyId:'dairy-fridge',level:2,expectedOccupancy:.82,svg:levelTwo(),
  reason:'立柜升高后用两层可见置架分别安放小牛奶瓶与奶酪角，新增下冷藏抽屉和侧把手，升级来自功能结构而非单纯缩放。',
  design:{silhouette:'升高单门立柜、两层可见置架、独立下冷藏抽屉、右侧把手与固定短脚',angle:'三分之四角度，侧握把和下抽屉具有真实厚度',material:'奶白搪瓷与薄荷门框统一，冷玻璃低饱和透亮，轻金属把手',identity:'仍只一小牛奶瓶与一枚奶酪角，明确fresh-milk单链',upgrade:'二级增加柜高、双层可见置架、下冷藏抽屉与侧把手，保持单玻璃门',presentation:'82%主体、透明居中留白；无文字数字等级标牌、投币或售卖装置'}},
 {id:'dairy-fridge-l3',code:'EQ07-L3',name:'乳品冷柜',familyId:'dairy-fridge',level:3,expectedOccupancy:.84,svg:levelThree(),
  reason:'最高级改为分隔双玻璃门，顶部集成小制冷格栅并加厚功能壳体，牛奶瓶与奶酪角分室展示；固定短脚和圆角奶白薄荷外观维持专业冷藏身份。',
  design:{silhouette:'竖向双门圆角冷柜、顶部小制冷格栅、加厚侧壳与固定短脚',angle:'三分之四角度，双门中缝、独立把手、上制冷腔和侧壳清楚',material:'奶白搪瓷、薄荷细框、双段冷玻璃、克制金属把手和左上柔光',identity:'一小牛奶瓶与一枚奶酪角分室放置，不增食品种类或数量',upgrade:'三级由单门升级为分隔双门和顶部制冷功能壳体，不靠换色放大或等级装饰',presentation:'84%主体、透明居中留白；无文字数字等级标牌、雨棚、轮子或售卖结构'}}
];

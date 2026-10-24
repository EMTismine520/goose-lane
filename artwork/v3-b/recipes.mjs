import {C,p,e,r,line,light,t,leaf,plate,deepBowl,lemonSlice,tomatoWedge,onionRing,grillMarks,riceMarks,crab,milkTea,bagel} from './primitives.mjs';
import {smallBowl,cup,bean,iceCube,pearls} from './materials.mjs';

const small=(body,x=48,y=48,s=.6,a=0)=>t(body,`translate(${x} ${y}) rotate(${a}) scale(${s}) translate(-48 -48)`);
const greens=()=>leaf(24,50,.7,-50)+leaf(67,49,.65,50)+leaf(45,41,.55,20);
const herbs=()=>line('m30 61 4-2m21 7 4-2m8-20 4 1','#82a15c',2.8)+e(42,47,2.2,1.5,'#acc17b','stroke="none"');
const rice=()=>p('M20 59q0-28 29-29 28 1 28 29 0 15-29 16T20 59Z','url(#rice)')+riceMarks();
const cut=(color='url(#roast)',x=48,y=49,s=1,a=0)=>t(p('M-25-9q9-14 26-8l22 11q11 7 2 18-9 9-22 5l-26-10q-12-6-2-16Z',color)+light('m-17-7 8-2',2.5),`translate(${x} ${y}) rotate(${a}) scale(${s})`);
const bowlMeal=body=>deepBowl()+body;
const plated=body=>plate()+body;
const cubes=(color='url(#glaze)',count=5)=>Array.from({length:count},(_,i)=>{const x=23+i%3*22,y=39+Math.floor(i/3)*22;return p(`M${x} ${y}l14-5 10 10-2 15-16 4-8-10Z`,color,'stroke-width="1.8"')+light(`m${x+4} ${y+2} 8-2`,2);}).join('');
const popcorn=(color='url(#garlic)')=>[[27,37],[47,27],[65,39],[35,55],[58,57]].map(([x,y])=>t(p('M-7-4q-5-8 2-11 6-4 9 3 9-2 11 5 2 7-6 8-2 10-10 6-8 1-6-7Z',color,'stroke-width="1.7"')+line('m-1-5 3 2','#d9bb86',1.3),`translate(${x} ${y})`)).join('');
const meatball=(x,y,s=1)=>t(p('M-11-11q10-9 21-1 9 10 1 21-11 9-23 0-8-9 1-20Z','url(#roast)')+light('m-7-5 5-3',2.6)+line('m3 4 4 1','#9f6847',1.5),`translate(${x} ${y}) scale(${s})`);
const toast=(x=48,y=48,s=1)=>t(p('M-23-18q-6-11 7-15 7-7 15-1 17-4 18 10 9 4 5 13v28h-44v-28q-8-1-1-7Z','url(#roast)')+p('M-17-13q-5-8 4-11 6-5 12-1 12-3 12 8 8 4 4 10v21h-32V-7q-6 0 0-6Z','url(#garlic)','stroke-width="1.5"'),`translate(${x} ${y}) scale(${s})`);
const cheese=()=>p('M19 51 46 39l33 13-24 15-36-9Z','url(#egg)','stroke-width="1.6"');
const burger=({bacon=false}={})=>plated(p('M16 56h65l-3 15q-29 18-59 0Z','url(#wood)')+p('M18 55q8-5 16 0 7-6 14 0 8-6 14 0 9-7 17 0l-1 8q-8-4-15 2-7-5-14 0-8-5-15 0-8-5-15-1Z','url(#green)')+p('M18 48q28-14 61 0l-2 11q-27 13-58 0Z','url(#roast)')+(bacon?p('M16 48q10-11 21-2 10-10 20-1 12-9 23 0l-2 6q-10-8-22 1-10-8-19 1-13-8-19 2Z','url(#red)'):'')+cheese()+p('M15 44q1-26 32-28 32-1 35 28 0 14-34 14-31 0-33-14Z','url(#wood)')+line('m29 34 3 1m11-10 3 1m12 1 3 1m8 11 3 1','#fff0c8',2.2)+light('M26 34q7-9 16-9',3)+(bacon?p('M16 58q10-9 20-2 10-9 20-2 12-7 25 0l-3 8q-11-7-22 1-10-7-20 1-11-8-18 0Z','url(#red)','stroke-width="1.8"')+line('M22 60q7-5 14-1 9-6 19-2 11-5 18 0','#f3d4b0',2.4):''));
const hotdog=({cheesy=false,tomato=false,wrapped=false}={})=>plated(p('M17 43q-1-13 12-15l46 17q15 11 6 23-7 10-20 6L19 57q-10-5-2-14Z','url(#wood)')+p('M22 41q2-9 11-5l40 14q8 6 5 12-5 6-13 2L24 51q-7-4-2-10Z','url(#garlic)')+p('M24 34q4-8 13-3l39 15q8 4 6 11-4 8-12 4L29 45q-11-4-5-11Z','url(#red)')+(cheesy?p('m28 35 10 7 6-1 9 8 8-1 9 7-3 4-9-5-8 1-8-7-8 1-10-8Z','url(#egg)','stroke-width="1.4"'):line('m29 35 7 6 8-1 8 7 8-1 8 7','#ffe2a4',2.6))+(tomato?tomatoWedge(30,56,.4)+tomatoWedge(58,66,.4):'')+(wrapped?p('M20 40 30 31l5 15 8 5 9-7 4 17 9 3 9-8 6 13-12 5-48-17Z','url(#wood)','stroke-width="1.7"'):'')+light('M21 45q-2 5 5 9',2.5));
const pie=(berry=false)=>plated(p('M18 44 56 25l25 27-4 23-35 7-26-18Z','url(#wood)')+p('M20 51 44 66l34-13-3 16-32 9-25-17Z',berry?'url(#berry)':'url(#glaze)','stroke-width="1.5"')+p('M18 44 56 25l25 27-37 14Z',berry?'url(#berry)':'url(#egg)')+line('m29 41 34 17m-22-24 33 17m-39 5 28-22m-17 30 27-22','#eed4a2',5)+line('M18 44 56 25l25 27-37 14Z','#a87c50',2.2)+light('m25 43 11-6',2.6));
const dimSum=(style='shrimp')=>plated([[29,49],[61,47],[47,66]].map(([x,y],i)=>t(p(style==='soup'?'M-17 5q2-17 13-20 10-4 20 14 5 12-15 16-18 0-18-10Z':'M-18 0q8-22 25-11 15 11 7 21-18 11-32-1Z','url(#garlic)')+line(style==='soup'?'M-3-13-9 3m6-16 3 15m-1-15 8 15':'M-12-5-8 4m4-13 3 13m6-10 1 12','#c7b68e',1.5)+(style==='shrimp'?p('M-9 3q2-9 10-6 9 5 2 11-10 4-12-5Z','url(#chicken)','stroke-width="1.1"'):'')+light('m-10 1 2-4',2),`translate(${x} ${y}) rotate(${i===0?-15:15}) scale(.88)`)).join(''));
const cheungFun=(filling='pork')=>plated([0,1,2].map(i=>t(p('M-26-10q10-7 19-2l29 12q9 7 2 14-8 9-18 3L-27 4q-9-7 1-14Z','url(#garlic)')+e(-16,-2,11,8,'url(#bowl)','transform="rotate(20 -16 -2)" stroke-width="1.5"')+e(-16,-2,7,5,filling==='mushroom'?'url(#wood)':filling==='beef'?'url(#roast)':'url(#pork)','stroke-width="1.3"')+light('m-3-4 15 7',2.3),`translate(${42+i*5} ${37+i*17}) rotate(-8) scale(.8)`)).join('')+herbs());
const creamyMold=(color='url(#garlic)')=>plated(p('M28 27h39l8 40q-26 18-55 0Z',color)+e(48,27,19,7,color)+line('M34 34 29 65m17-30v38m13-39 7 31','#d5bc8e',1.6)+light('M33 32 29 48',2.6));
const iceCream=(chocolate=false)=>smallBowl('url(#bowl)')+[[33,39],[61,39],[48,21]].map(([x,y])=>e(x,y,18,16,chocolate?'url(#coffee)':'url(#egg)')+light(`M${x-9} ${y-5}q3-4 7-4`,2.6)).join('')+(chocolate?line('m34 31 3 2m19-16 3 2m5 22 3 2','#e0b38c',2.1):'');

export function recipe(name,raw){
 const cooked=(food,x=48,y=45,s=.64,a=0)=>small(raw(food).replace(/url\(#(?:pork|red|chicken|gizzard|meat)\)/g,'url(#roast)'),x,y,s,a);
 const ingredient=(food,x=48,y=45,s=.6,a=0)=>small(raw(food),x,y,s,a);
 const grill=(food,extra='')=>plated(cooked(food,48,47,.62)+grillMarks(48,51,.7)+herbs()+extra);
 if(name==='凉拌鸡肉卷')return plated(greens()+[0,1].map(i=>t(p('M23 30h24l24 25q11 11-3 20-10 7-20-3L20 48q-7-11 3-18Z','url(#garlic)')+e(58,63,16,12,'#e4d8b3','transform="rotate(30 58 63)"')+e(58,63,11,8,'url(#green)','transform="rotate(30 58 63)" stroke-width="1.5"')+e(58,63,7,5,'url(#chicken)','transform="rotate(30 58 63)" stroke-width="1.3"'),`translate(${i*17-7} ${i*9-5}) scale(.8)`)).join(''));
 if(name==='手撕紫甘蓝')return plated(greens()+p('M20 48q10-19 26-10 17-11 30 4 13 22-9 29-27 12-48-6Z','url(#onion)')+line('M25 46q15 9 25-3m-28 11q22 12 40-3m-30 13q24 10 39-6m-26-20q11 10 25 5','#eac8df',2.5)+herbs());
 if(name==='新鲜生蚝')return plated(ingredient('生蚝',43,47,.7)+lemonSlice(76,66,.7));
 if(name==='田园沙拉')return bowlMeal(greens()+tomatoWedge(36,45,.7,-20)+tomatoWedge(60,54,.65,25)+leaf(43,62,.6,30)+herbs());
 if(name==='凉拌皮蛋')return plated([0,1,2].map(i=>t(p('M-12-6q4-17 20-10l9 19-24 9Z','url(#coffee)')+e(2,0,10,7,'#9faa75','stroke-width="1.5"')+e(2,0,6,4,'#c6c68e','stroke-width="1.1"'),`translate(${30+i*17} ${45+i%2*15}) rotate(${i*25-25})`)).join('')+onionRing(59,66,.65)+herbs());
 // Beverages have distinct glass silhouettes, foam, pearls and fruit garnish.
 const fruitDrinks={
 '葡萄果肉饮':{color:'url(#onion)',grape:true},'热带芒果汁':{color:'url(#mango)',fruit:'芒果'},'鹅鹅手打柠檬茶':{color:'url(#tea)',garnishType:'lemon'},'冰镇水蜜桃露':{color:'url(#pink)',fruit:'水蜜桃'},
 '珍珠奶茶':{pearls:true},'清新奶绿':{color:'url(#enamel)',garnishType:'leaf'},'香草慕斯奶绿':{color:'url(#enamel)',foam:true,garnishType:'leaf'},'厚顶鸳鸯奶茶':{color:'url(#coffee)',foam:true},'优酪乳':{color:'url(#garlic)',straw:false,fruit:'梨'},'益生菌饮品':{color:'url(#garlic)',straw:false,honey:true}
 };
 if(fruitDrinks[name]){const v=fruitDrinks[name];return milkTea(v)+(v.grape?e(42,60,5,4,'url(#berry)','stroke-width="1.2"')+e(55,68,4,3.5,'url(#berry)','stroke-width="1.2"'):'')+(v.fruit?ingredient(v.fruit,73,70,.32):'')+(v.honey?line('M33 43q13 5 29 0','#d1ae6e',2.5):'');}
 if(name==='什锦海鲜汤')return deepBowl('url(#tea)')+ingredient('鲜虾',36,41,.36,-20)+ingredient('鱿鱼',61,46,.3,30)+ingredient('海螺',52,60,.25)+herbs();
 if(name==='特色白粥')return deepBowl('url(#rice)')+riceMarks()+line('m43 41 4-2m7 7 4-1','#96ad70',2.6);
 if(name==='焦香洋葱饭')return plated(rice()+onionRing(35,46,.65)+onionRing(59,54,.7)+cut('url(#egg)',57,39,.3)+herbs());
 if(name==='黄油拌饭')return plated(rice()+p('m37 37 19-6 10 9-1 14-19 6-10-9Z','url(#egg)','stroke-width="1.7"')+light('m41 38 13-3',2.2)+herbs());
 if(name==='脆皮翅根')return plated(cooked('鸡翅中',46,47,.67)+line('m31 38 2 1m16-4 2 1m-12 17 2 1m22-4 2 1','#e8bd7b',2.4)+herbs());
 if(name==='煎炸培根')return plated([0,1,2].map(i=>t(p('M-28-6q10-9 19-1 8 6 16-1 10-7 21 2l-2 11q-8-6-18 1-10 6-20-2-6-4-16 1Z','url(#red)')+line('M-23-2q8-4 15 2 10 4 17-2 10-3 14 1','#f5d0a8',3),`translate(48 ${37+i*16}) rotate(-12) scale(.85)`)).join('')+onionRing(72,67,.45));
 if(name==='油炸太阳蛋')return plated(p('M18 43q1-16 17-12 9-14 21-3 16-8 24 6 13 5 5 19 4 16-13 18-12 13-24 2-15 8-23-7-17-3-7-23Z','url(#garlic)')+e(48,47,17,15,'url(#egg)')+light('M40 42q4-5 9-3',3));
 if(name==='香煎肉丸')return plated(meatball(30,49,.9)+meatball(56,39,.9)+meatball(59,63,.9)+herbs());
 if(name==='酥香鳕鱼')return plated(cut('url(#egg)',39,44,.9,-20)+cut('url(#egg)',62,62,.7,-20)+line('m26 43 3 1m14-10 3 1m-5 20 3 1m19 7 3 1','#c6a06a',2.2)+lemonSlice(74,48,.7));
 if(name==='香煎胡萝卜')return plated([[28,46],[49,36],[66,48],[39,63],[61,66]].map(([x,y])=>e(x,y,12,9,'url(#tomato)','transform="rotate(-20 '+x+' '+y+')"')+e(x,y,4,3,'#f3bb7d','stroke-width="1.2"')).join('')+herbs());
 if(name==='酥炸大鸡腿')return plated(cooked('鸡腿',47,44,.69)+line('m29 46 2 1m12-7 2 1m-5 22 2 1m14-13 2 1','#e9bd82',2.8)+herbs());
 if(name==='红酒酱牛排')return plated(e(48,56,29,14,'#ba7b73','stroke-width="1.5"')+cooked('带骨牛排',47,43,.64)+grillMarks(48,49,.55)+onionRing(72,64,.45));
 if(name==='醇香鲶鱼块')return plated(cubes('url(#roast)',5)+herbs());
 if(name==='酥脆萝卜糕')return plated([0,1,2].map(i=>t(p('M-18-12 10-16 21-4 19 13-29 4-11-10Z','url(#garlic)')+p('m-18-12 9 11 30-3-2 10-29 4-11-10Z','url(#wood)','stroke-width="1.5"')+light('m-12-10 16-3',2),`translate(${30+i*16} ${40+i%2*20}) rotate(-10)`)).join('')+herbs());
 if(name==='孜然烤肉肠')return plated(cooked('香肠',37,44,.65,-20)+cooked('香肠',60,55,.57,-20)+herbs());
 if(name==='风味蔬菜烤串')return plated([0,1].map(i=>t(line('M19 71 75 18','#a97d50',2.8)+[0,1,2,3].map(k=>p(`M${26+k*11} ${59-k*11}l4-12 11 3 1 10-10 4Z`,[C.tomato,C.green,C.wood,C.yellow][k],'stroke-width="1.8"')).join(''),`translate(${i*10-5} ${i*10-4})`)).join(''));
 if(name==='孜然椒盐排骨')return grill('排骨');
 if(name==='炭烧熏肉')return grill('五花肉',leaf(76,69,.45,55));
 if(name==='炭烧鲜菇')return plated(cooked('蘑菇',34,47,.48,-15)+cooked('蘑菇',61,54,.45,20)+grillMarks(45,44,.5)+herbs());
 if(name==='炭烤鸡胸肉')return grill('鸡胸肉');
 if(name==='黄金烤肘子')return grill('带骨肘子',line('m31 40 7 3m13 16 9 1','#efc581',3));
 if(name==='烟熏牛胸肉')return plated(cut('url(#coffee)',40,42,.8,-15)+cut('url(#roast)',53,58,.9,-15)+line('m28 42 22 10m-10 3 22 10','#e5b188',2.5)+herbs());
 if(name==='炭烤琵琶腿')return grill('鸡腿');
 if(name==='烟熏黄油五花')return grill('五花肉',cut('url(#egg)',68,62,.3));
 if(name==='熟烤肥蟹')return plated(small(crab(false,true),48,43,.76)+herbs());
 if(name==='炭烧金枪鱼排')return plated(p('M22 40 63 28q19 8 15 26L51 72 21 60Z','url(#roast)')+p('m25 43 30-9 18 15-23 17-26-9Z','#dda98a','stroke-width="1.7"')+grillMarks(47,50,.65)+lemonSlice(74,67,.6));
 if(name==='威士忌三文鱼')return plated(cooked('三文鱼',44,45,.62)+grillMarks(43,49,.6)+p('M69 44h15l-2 20q-6 5-11 0Z','url(#tea)','stroke-width="1.4"')+herbs());
 if(name==='炭烤海螺')return grill('海螺');
 if(name==='炭烤牛排')return grill('带骨牛排');
 if(name==='烟熏三文鱼')return plated([0,1,2].map(i=>t(p('M-24-8q8-8 18-1 8-8 17-2l15 11q5 9-6 12L-22 6q-9-3-2-14Z','url(#red)')+line('m-15-6 12 13m0-13 13 12','#f8c7a7',2.4),`translate(${44+i*5} ${35+i*15}) scale(.82)`)).join('')+lemonSlice(75,63,.65));
 if(name==='热烤大羊排')return grill('羊排');
 if(name==='锡纸彩椒酿')return plated(p('M15 44 23 32l16 6 13-11 13 13 16-3 6 22-16 14-23-2-19 6-13-16Z','#cbd0b6')+tomatoWedge(38,48,1,-10)+tomatoWedge(62,55,.85,20)+cut('url(#roast)',44,43,.45)+cheese()+herbs());
 if(name==='早餐三明治')return plated(p('M18 55 48 25l30 40-38 14Z','url(#roast)')+p('M21 51 48 29l28 32-36 12Z','url(#garlic)')+p('m23 52 9-9 34 13 7 7-33 9Z','url(#green)')+p('m25 45 22-13 22 24-28 10Z','url(#egg)')+p('M20 43 47 19l29 37-37 13Z','url(#wood)')+light('m28 42 18-16',2.6));
 if(name==='烤土豆片')return plated([[28,45],[49,34],[69,48],[38,63],[61,66]].map(([x,y])=>e(x,y,12,9,'url(#wood)','transform="rotate(-20 '+x+' '+y+')"')+line(`m${x-6} ${y-3} 11 3`,'#b08250',1.6)).join('')+herbs());
 if(name==='蒜香面包')return plated([0,1,2].map(i=>t(p('M-15-18q15-7 25 6l3 25-27 8-10-21Z','url(#roast)')+p('M-11-13q12-5 18 5l2 18-20 6-7-18Z','url(#garlic)','stroke-width="1.4"')+line('m-9-4 11 5m-11 5 11 3','#d3bc86',1.3)+leaf(0,6,.32,45),`translate(${29+i*19} ${43+i%2*17}) rotate(-20)`)).join(''));
 if(name==='蜜汁烤鸡')return plated(cooked('整鸡',48,44,.7)+line('M37 36q-5 10-3 16m17-16 9 7','#efc48c',2.8)+herbs());
 if(name==='三文鱼贝果')return bagel({salmon:true});
 if(name==='芝士热狗')return hotdog({cheesy:true});
 if(name==='蜜汁叉烧')return plated(cut('url(#red)',40,39,.8,-10)+cut('url(#glaze)',48,56,.8,-10)+cut('url(#red)',58,69,.7,-10)+grillMarks(46,48,.5)+herbs());
 if(name==='烤热狗面包')return hotdog({wrapped:true});
 if(name==='甜苹果派')return pie(false)+ingredient('苹果',75,67,.28);
 if(name==='焦香洋葱贝果')return bagel({onion:true});
 if(name==='汉堡包')return burger();
 if(name==='蒜香黄油帝王蟹')return plated(small(crab(true,true),45,43,.73)+cut('url(#egg)',73,64,.32)+herbs());
 if(name==='培根汉堡')return burger({bacon:true});
 if(name==='蓝莓果派')return pie(true)+ingredient('蓝莓',77,68,.3);
 if(name==='烤肠热狗')return hotdog({tomato:true});
 if(name==='晶莹鲜虾饺')return dimSum('shrimp');
 if(name==='牛肉肠粉')return cheungFun('beef');
 if(name==='香菇肠粉')return cheungFun('mushroom');
 if(name==='椰汁奶白小丸')return smallBowl('url(#bowl)')+[[31,38],[58,31],[51,53]].map(([x,y])=>e(x,y,15,12,'url(#garlic)')+light(`M${x-7} ${y-4}q3-4 6-3`,2.5)).join('')+line('m26 45 37 11','#e9cc94',2.4);
 if(name==='流沙奶黄包')return plated(p('M19 58q1-31 28-33 30 0 32 31 0 21-31 21T19 58Z','url(#garlic)')+p('M48 26 38 46l11 13-8 17q30 1 35-15 4-26-28-35Z','url(#egg)')+p('m48 31 5 20-8 8 6 11-8 10-6-6 7-17-7-11Z','#ffdda0','stroke-width="1.5"')+light('M28 49q4-12 12-13',2.8));
 if(name==='焦糖马拉糕')return plated(cubes('url(#glaze)',4)+line('m26 46 2 1m18-6 2 1m15 14 2 1m-26 14 2 1','#e8bd87',2.4));
 if(name==='古法糯米鸡')return plated(p('M18 37 53 23l28 23-6 25-37 10-22-20Z','url(#darkGreen)')+p('m18 37 24 22 39-13-6 25-37 10-22-20Z','url(#green)')+p('M28 36q21-12 39 4L58 65 28 57Z','url(#rice)')+meatball(46,43,.6)+ingredient('蘑菇',57,52,.27)+herbs());
 if(name==='鲜肉肠粉')return cheungFun('pork');
 if(name==='三鲜虾肉饺子')return dimSum('shrimp')+herbs();
 if(name==='爆汁灌汤小笼包')return dimSum('soup');
 if(name==='蒜蓉蒸鱿鱼')return plated(ingredient('鱿鱼',48,43,.7)+ingredient('大蒜',75,65,.27)+herbs());
 if(name==='蒸龙虾')return plated(ingredient('龙虾',48,45,.7)+herbs());
 if(name==='蒜香炒虾')return plated(ingredient('鲜虾',35,43,.5)+ingredient('鲜虾',61,57,.45,40)+ingredient('大蒜',72,44,.28)+herbs());
 if(name==='彩椒土豆丝')return plated(line('m23 45 48 12m-44-2 41 12m-41-27 39 13m-44-5 36 12m-26-23 39 13','#dfba78',6)+line('m28 49 34 10m-29-1 31 10','#f8dfa4',2.5)+tomatoWedge(28,41,.55)+tomatoWedge(68,64,.5)+herbs());
 if(name==='红酒烧排骨')return plated(e(48,57,31,13,'#b5837d','stroke-width="1.5"')+cooked('排骨',47,43,.65)+onionRing(71,68,.45)+herbs());
 if(name==='爆炒西兰花')return plated(ingredient('西兰花',43,43,.6)+tomatoWedge(65,57,.65)+herbs());
 if(name==='脆皮炸鲜奶')return plated(cubes('url(#wood)',4)+p('m48 47 15-5 9 10-1 12-17 5-8-10Z','url(#garlic)','stroke-width="1.8"')+light('m52 49 9-2',2.2));
 if(name==='清炒四季豆')return plated(ingredient('四季豆',46,44,.65)+ingredient('大蒜',73,65,.3)+herbs());
 if(name==='咸水角')return plated(p('M18 53q4-22 20-21 20 1 23 27-18 20-39 7Z','url(#wood)')+p('M54 43q18-4 28 18-3 19-23 18L45 59Z','url(#wood)')+e(64,66,12,10,'url(#garlic)','stroke-width="1.6"')+e(64,66,7,6,'url(#roast)','stroke-width="1.3"')+herbs());
 if(name==='香蕉泥')return smallBowl('url(#bowl)')+p('M26 41q-3-12 13-13-1-14 16-12 1 10 10 11 15 5 5 15-22 12-44-1Z','url(#egg)')+line('M34 36q12 6 25-3','#d4ae70',1.7)+e(70,51,10,7,'url(#egg)','stroke-width="1.6"');
 if(name==='爆米花')return smallBowl('url(#wood)')+popcorn();
 if(name==='巧克力脆皮蓝莓')return plated([[29,45],[52,34],[69,48],[41,65],[64,68]].map(([x,y],i)=>e(x,y,12,10,i===4?'url(#berry)':'url(#coffee)')+light(`m${x-6} ${y-4} 3-2`,2.5)).join(''));
 if(name==='玉米花')return smallBowl('url(#bowl)')+popcorn('url(#glaze)');
 if(name==='酸甜芒果丁')return plated(cubes('url(#mango)',5)+lemonSlice(73,48,.7));
 if(name==='热可可'||name==='棉花软糖热巧克力')return cup({color:'url(#coffee)',shell:'url(#pink)',handle:true})+(name==='棉花软糖热巧克力'?[[32,27],[49,22],[63,29]].map(([x,y],i)=>r(x-6,y-6,13,13,4,i===1?'url(#pink)':'url(#garlic)','stroke-width="1.5"')).join(''):line('M37 18q-3-5 1-10m20 10q-3-5 1-10','#c9b58f',1.8));
 if(name==='QQ芒果布丁')return creamyMold('url(#mango)')+cut('url(#egg)',50,25,.28)+leaf(59,27,.35,45);
 if(name==='芒果慕斯')return plated(p('M25 36h47v36q-22 16-47 0Z','url(#garlic)')+e(48,36,24,10,'url(#mango)')+p('M25 52q21 12 47 0v13q-23 12-47 0Z','url(#mango)','stroke-width="1.4"')+p('m39 30 9-8 10 8-7 8Z','url(#egg)','stroke-width="1.5"')+leaf(61,35,.4,55));
 if(name==='浆果蜂蜜燕麦碗')return deepBowl('url(#wood)')+ingredient('燕麦',46,43,.5)+ingredient('蓝莓',38,37,.4)+line('m37 41 27 12','#edcb87',2.8)+leaf(69,44,.45,55);
 if(name==='肉桂苹果奶冻')return creamyMold()+ingredient('苹果',72,63,.35)+line('m35 31 25 8m-29 16 28 8','#b58a61',2.2)+ingredient('肉桂',31,70,.28);
 if(name==='巧克力冰淇淋')return iceCream(true);
 if(name==='黄油冰淇淋')return iceCream(false);
 if(name==='阿芙佳朵')return smallBowl('url(#bowl)')+e(48,42,26,8,'url(#coffee)','stroke-width="1.5"')+e(44,30,21,18,'url(#egg)')+light('M33 24q4-5 9-4',2.9)+p('M66 19q17-10 20 3l-6 14-14-7Z','url(#bowl)','stroke-width="1.8"')+line('M69 28q-12 8-12 13','#8e6747',3.5);
 const bars={
 '朗姆可乐':{color:'url(#coffee)',glass:'tall',lemon:true},'威士忌苏打':{color:'url(#tea)',glass:'short',ice:true},'甜蛋酒':{color:'url(#garlic)',glass:'mug',cinnamon:true},'威士忌酸酒':{color:'url(#tea)',glass:'short',lemon:true,cherry:true},
 '莫斯科之骡':{color:'url(#tea)',glass:'copper',lemon:true},'龙舌兰螺丝刀':{color:'url(#mango)',glass:'tall',orange:true},'金汤力':{color:'url(#glass)',glass:'stem',lemon:true,berries:true},'热托迪':{color:'url(#tea)',glass:'mug',lemon:true,cinnamon:true},
 '伏特加汤力':{color:'url(#glass)',glass:'tall',lemon:true},'椰香帕洛玛':{color:'url(#pink)',glass:'stem',coconut:true},'能量伏特加':{color:'url(#egg)',glass:'tall',ice:true},'浓缩马提尼':{color:'url(#coffee)',glass:'martini',beans:true}
 };
 if(bars[name]){const v=bars[name];let b='';if(v.glass==='tall')b=milkTea({color:v.color,straw:false});else if(v.glass==='short')b=t(milkTea({color:v.color,straw:false}),'translate(-5 26) scale(1.1 .65)');else if(v.glass==='mug'||v.glass==='copper')b=cup({color:v.color,shell:v.glass==='copper'?'url(#glaze)':'url(#glass)',handle:true});else if(v.glass==='martini')b=e(48,83,21,5,'url(#glass)')+r(45,49,6,32,2,'url(#glass)','stroke-width="1.6"')+p('M15 23h66L52 53h-8Z','url(#glass)')+p('M22 29h52L50 49h-4Z',v.color,'stroke-width="1.5"');else b=e(48,84,20,5,'url(#glass)')+r(45,53,6,30,2,'url(#glass)','stroke-width="1.6"')+p('M23 20h50q5 36-25 38T23 20Z','url(#glass)')+p('M26 31h44q-1 23-22 23T26 31Z',v.color,'stroke-width="1.5"');if(v.ice)b+=iceCube(41,46,.42)+iceCube(56,54,.4);if(v.lemon)b+=lemonSlice(67,29,.65);if(v.orange)b+=lemonSlice(68,30,.7);if(v.cherry)b+=e(62,39,4,4,'url(#red)','stroke-width="1.2"')+line('M62 35q0-6 5-7','#6e914f',1.3);if(v.cinnamon)b+=line('m58 31 11-20','#a77a52',3.3);if(v.beans)b+=bean(39,31,.45,20)+bean(52,34,.45,-20);if(v.berries)b+=e(43,43,3,3,'url(#berry)','stroke-width="1"')+e(54,45,2.5,2.5,'url(#berry)','stroke-width="1"');if(v.coconut)b+=ingredient('椰子',74,65,.28);return b;}
 throw new Error(`Missing native recipe artwork: ${name}`);
}

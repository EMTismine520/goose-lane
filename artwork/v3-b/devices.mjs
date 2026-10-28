// V4 equipment: category is carried by the silhouette; tiers add functional structure.
import {C,p,e,r,line,light,t,leaf} from './primitives.mjs';
import {bean,iceCube} from './materials.mjs';

const U = name => 'url(#'+name+')';
const food = (raw,name,x,y,s=.34,a=0) => t(raw(name),'translate('+x+' '+y+') rotate('+a+') scale('+s+') translate(-48 -48)');
const wheel = (x,y=82) => e(x,y,6,6,U('metal'))+e(x,y,2,2,C.cream,'stroke-width="1.2"');
const knob = (x,y,s=1) => t(e(0,0,3.7,3.7,U('metal'))+line('M0-2v3',C.cream,1.5),'translate('+x+' '+y+') scale('+s+')');
const feet = (x1=22,x2=73,y=80) => r(x1,y,7,7,2,U('wood'))+r(x2,y,7,7,2,U('wood'));
const rivets = (xs,y) => xs.map(x=>e(x,y,1.3,1.3,C.cream,'stroke-width=".8"')).join('');
const top = (x,y,w,depth=9,color='wood') => p('M'+x+' '+y+'l8-'+depth+'h'+(w-8)+'l-8 '+depth+'Z',U(color));
const base = (color='enamel') => feet()+p('M15 61h66v19H15Z',U(color))+p('M11 56h74v8H11Z',U('wood'))+line('M22 68h49',C.cream,1.5);
const metalRail = (y=71) => r(19,y,59,5,2,U('metal'),'stroke-width="1.5"');
const jar = (x,y,color='egg',s=1) => t(r(-10,-14,20,29,6,U('glass'))+r(-7,-8,14,19,4,U(color),'stroke-width="1.2"')+r(-10,-18,20,7,2,U('wood'),'stroke-width="1.5"')+light('M-5-6v10',1.6),'translate('+x+' '+y+') scale('+s+')');
const bottle = (x,y,color='tea',h=32) => t(p('M-4-'+h+'h8v9l5 7v'+(h-16)+'q-9 5-18 0v-'+(h-16)+'l5-7Z',U(color),'stroke-width="1.5"')+r(-5,-h-3,10,5,1,U('metal'),'stroke-width="1.2"')+light('M-4-15v10',1.5),'translate('+x+' '+y+')');

function vegetables(l,raw){
  let b=p('M12 51h65v24H12Z',U('enamel'))+top(12,51,65)+r(8,47,73,7,3,U('wood'))+wheel(23)+wheel(65)+line('M79 64h9V48',C.darkWood,3.5);
  b+=food(raw,'番茄',31,39,.4)+food(raw,'胡萝卜',55,34,.42,-14)+food(raw,'西兰花',66,44,.3);
  b+=r(24,58,38,11,4,U('bowl'),'stroke-width="1.4"')+leaf(44,67,.35,35);
  if(l>=2)b+=r(10,72,68,6,2,U('metal'),'stroke-width="1.5"')+p('M17 47V28m55 19V29','none','stroke-width="3"')+r(14,27,62,5,2,U('wood'))+food(raw,'彩椒',32,24,.25);
  if(l===3)b+=p('M14 14h64l4 12H10Z',U('enamel'))+p('M23 14h10l-2 12H21Zm31 0h10l2 12H54Z',U('bowl'),'stroke="none"')+line('M18 14v-4m57 4v-4',C.darkWood,2.2);
  return b;
}
function seasonal(l,raw){
  let b=p('M18 84 33 14h30l16 70h-9L57 25H39L27 84Z',U('wood'))+p('M11 52h73v10H11Z',U('enamel'))+p('M20 29h57v9H20Z',U('wood'));
  b+=food(raw,'蘑菇',35,25,.31)+food(raw,'玉米',63,24,.34,12)+food(raw,'茄子',31,49,.32,-25)+food(raw,'生菜',61,48,.33);
  if(l>=2)b+=p('M17 73h63v8H17Z',U('wood'))+food(raw,'白萝卜',48,72,.33,65)+metalRail(57);
  if(l===3)b+=r(26,9,45,7,3,U('enamel'))+p('M30 10q18-15 36 0','none','stroke-width="3"')+rivets([25,73],78);
  return b;
}
function fruitCrate(l,raw){
  let b=p('M12 48 24 38h51l10 10-7 31H19Z',U('wood'))+p('M12 48h73l-2 8H15Z',U('grain'))+line('M18 67h61m-54-11 2 21m22-21v21m23-21-2 21',C.darkWood,2);
  b=food(raw,'苹果',28,35,.38,-10)+food(raw,'甜橙',58,32,.42)+food(raw,'葡萄',73,44,.31)+b;
  b+=r(35,59,26,11,3,U('bowl'),'stroke-width="1.4"')+p('m43 64 4-3 5 3-5 3Z',U('tomato'),'stroke-width="1"');
  if(l>=2)b+=p('M15 76h66v8H15Z',U('metal'))+rivets([22,73],80)+p('M17 45V26m62 19V26','none','stroke-width="3"');
  if(l===3)b+=p('M17 26q31-25 62 0','none','stroke-width="6"')+food(raw,'草莓',42,24,.27);
  return b;
}
function exotic(l,raw){
  let b=p('M21 43q-2-32 27-33 29 1 28 33','none','stroke-width="'+(l===3?7:5)+'"');
  b+=p('M9 47q38 15 78 0L76 76q-27 19-57 0Z',U('grain'))+e(48,49,39,9,U('wood'))+line('M18 60q30 14 60 0M21 70q27 13 54 0m-42-14 4 25m17-23-1 24m15-27-6 25',C.darkWood,1.5);
  b+=food(raw,'香蕉',31,28,.58,-18)+food(raw,'椰子',64,31,.5)+food(raw,'芒果',48,39,.42)+line('M10 50q38 15 76 0',C.darkWood,2.5);
  if(l>=2)b+=p('M10 48q39 12 77 0','none','stroke-width="5"')+r(42,62,13,13,3,U('bowl'),'stroke-width="1.4"')+leaf(47,72,.32,25);
  if(l===3)b+=p('M14 81q33 14 69-1','none','stroke-width="5"')+p('M22 30 13 17l13-3 10 14-8 8Z',U('tomato'))+leaf(74,34,.6,55);
  return b;
}
function butcher(l,raw){
  let b=feet(16,72)+p('M9 41h78v36H9Z',U('metal'))+p('M9 41 23 25h56l8 16Z',U('glass'))+p('M17 39 28 29h46l5 10Z',U('bowl'),'stroke-width="1.4"');
  b+=food(raw,'带骨牛排',45,34,.46,-15)+r(15,47,66,20,4,U('glass'),'stroke-width="1.7"')+food(raw,'五花肉',33,56,.3)+food(raw,'排骨',63,55,.32);
  b+=r(8,72,80,7,2,U('red'),'stroke-width="1.6"')+line('M17 48v14m6-16 10 0',C.white,2.2);
  if(l>=2)b+=p('M15 27V16h66v11','none','stroke-width="3.5"')+r(12,13,72,6,2,U('red'))+food(raw,'香肠',64,25,.25);
  if(l===3)b+=p('M11 13 20 5h58l9 8Z',U('metal'))+p('M12 76H5V51h9m73 25h5V49h-6','none','stroke-width="3"')+knob(75,73,.65)+rivets([16,26,37],75);
  return b;
}
function poultry(l,raw){
  let b=p('M21 67V31q0-24 27-24t27 24v36Z',U('egg'))+p('M29 46V30q0-16 19-16t19 16v16Z',U('bowl'))+line('M35 20q13-8 25 0','#fff8df',2.5);
  b+=food(raw,'鸡腿',48,38,.55,-15)+p('M13 59h69l-8 23H22Z',U('grain'))+e(48,60,35,8,U('wood'))+food(raw,'鸡蛋',30,58,.31,-15)+food(raw,'鸡蛋',49,57,.33,4)+food(raw,'鸡蛋',65,60,.28,20);
  b+=line('M23 70q25 8 49 0m-40-5 3 13m16-13v15m14-14-2 12',C.darkWood,1.4);
  if(l>=2)b+=r(18,80,61,6,2,U('metal'))+p('M21 49h-7v24m61-24h8v25','none','stroke-width="3"')+r(36,69,24,10,4,U('bowl'),'stroke-width="1.2"');
  if(l===3)b+=p('M29 10q19-12 38 0','none','stroke-width="5"')+p('M29 12 20 5l-8 7 9 8Z',U('tomato'))+wheel(25,86)+wheel(72,86);
  return b;
}
function spices(l,raw){
  let b=p('M14 36h29V22h37v54H14Z',U('wood'))+p('M11 72h73v10H11Z',U('grain'))+r(20,45,23,23,3,U('enamel'))+r(51,32,23,36,3,U('bowl'));
  b+=food(raw,'红椒',30,36,.32,45)+food(raw,'大蒜',63,25,.35)+food(raw,'罗勒',64,57,.4)+line('M25 60h11m22-1h9',C.darkWood,2);
  if(l>=2)b+=jar(29,58,'pepper',.7)+p('M15 35V14h26v21','none','stroke-width="2.5"')+food(raw,'肉桂',30,24,.27);
  if(l===3)b+=r(9,79,78,7,2,U('metal'))+p('M52 23V10h29v13','none','stroke-width="2.5"')+jar(64,8,'green',.55);
  return b;
}
function sea(l,raw){
  let b=feet()+p('M10 42 25 24h57l6 18-8 36H18Z',U('blue'))+p('M10 42 27 29h49l12 13-16 15H26Z',U('metal'))+p('M20 42 33 34h37l7 8-10 7H30Z',U('glass'));
  b+=iceCube(32,41,.23)+iceCube(65,41,.25)+food(raw,'鲶鱼',48,38,.55,-12)+r(24,61,49,8,3,U('bowl'),'stroke-width="1.3"')+p('m41 65 9-3 8 3-8 3Z',U('blue'),'stroke-width="1"');
  if(l>=2)b+=p('M25 25V11h56v17','none','stroke-width="3"')+p('M27 11h53l-2 10H25Z',U('glass'))+light('M34 13h28',2);
  if(l===3)b+=p('M9 77H4V49h7m72 28h9V48h-7','none','stroke-width="3"')+food(raw,'鲜虾',75,37,.3,25)+rivets([27,36,45],75);
  return b;
}
function dairy(l,raw){
  let b=feet(25,65)+r(23,8,51,76,10,U('enamel'))+r(30,17,36,51,6,U('glass'))+r(69,37,4,19,2,U('metal'),'stroke-width="1.3"')+food(raw,'纯牛奶',48,42,.51)+line('M31 63h34',C.white,2.5);
  b+=r(32,72,32,5,2,U('metal'),'stroke-width="1"');
  if(l>=2)b+=p('M23 28h-8v45h8Z',U('metal'))+line('M17 37v22',C.cream,2)+knob(63,74,.65);
  if(l===3)b+=p('M22 10 28 3h40l7 7Z',U('wood'))+r(35,7,27,11,4,U('bowl'))+p('M48 8q-9 9 0 9 9 0 0-9Z',U('blue'),'stroke-width="1.2"')+food(raw,'黄油',47,65,.25);
  return b;
}
function grain(l,raw){
  let b=p('M13 61h72v19H13Z',U('wood'))+top(13,61,72,12,'grain')+p('M21 32h30l-4 10 7 27q-17 9-35 0l7-27Z',U('grain'))+e(36,33,15,6,U('bowl'))+food(raw,'大米',35,29,.29)+p('M51 39h27l-4 8 8 24q-15 8-32-1l5-23Z',U('bowl'))+food(raw,'燕麦',65,38,.3);
  b+=p('M32 49h10v16H32Z',U('bowl'),'stroke-width="1.4"')+line('M36 62V51m0 3-3-2m3 7 4-3',C.darkWood,1.4);
  if(l>=2)b+=r(11,77,76,8,2,U('metal'))+line('M17 64v9m62-9v9',C.cream,2)+food(raw,'吐司',74,21,.3,-8);
  if(l===3)b+=p('M14 60V16h8v44m55 0V15h8v45',U('wood'))+r(12,13,75,7,2,U('wood'))+food(raw,'面包胚',49,14,.32);
  return b;
}
function sweets(l,raw){
  let b=feet(23,70)+p('M21 76V35q0-27 27-27t27 27v41Z',U('glass'))+e(48,72,27,8,U('pink'))+food(raw,'糖豆',45,53,.5)+food(raw,'巧克力',62,54,.38,-12)+r(18,73,61,10,4,U('pink'))+r(36,80,24,5,2,U('metal'),'stroke-width="1.5"');
  b+=e(48,9,6,5,U('wood'))+light('M28 27q2-10 10-12',2.8);
  if(l>=2)b+=jar(18,64,'gold',.6)+jar(80,64,'pepper',.6)+metalRail(75);
  if(l===3)b+=p('M19 36q0-33 29-33t29 33','none','stroke-width="4"')+p('M37 12h21l-5 10H42Z',U('bowl'))+food(raw,'棉花软糖',45,46,.3);
  return b;
}
function coffee(l){
  let b=p('M23 55h46v27q-24 12-46 0Z',U('wood'))+p('M19 51h54v10H19Z',U('metal'))+r(31,63,29,15,3,U('coffee'))+e(46,68,6,3,U('wood'),'stroke-width="1.4"')+p('M28 13h37l-6 30H34Z',U('glass'))+e(46.5,13,19,6,U('metal'));
  b+=bean(39,24,.45,-15)+bean(54,23,.45,30)+bean(48,34,.42)+p('M36 41h21v12H36Z',U('copper'))+line('M57 46h23V32',C.darkBrown,4)+r(75,24,12,13,5,U('wood'))+light('M33 18v13',2.5);
  if(l>=2)b+=feet(24,63,84)+r(22,77,48,7,2,U('metal'))+knob(64,66,.8)+p('M29 59V45h6v14Z',U('copper'),'stroke-width="1.4"');
  if(l===3)b+=p('M21 52V37h7v15m38 0V38h7v14',U('copper'))+p('M25 12 30 5h34l6 7Z',U('copper'))+e(47,5,5,3,U('wood'))+r(18,84,60,5,2,U('copper'),'stroke-width="1.6"');
  return b;
}
function tea(l){
  let b=e(43,77,28,8,U('wood'))+p('M15 35q28-12 56 0v37q-27 17-56 0Z',U('enamel'))+e(43,35,28,9,U('teaGreen'))+e(43,35,21,5,U('darkGreen'),'stroke-width="1.2"')+t(e(0,0,28,8,U('enamel'))+e(0,-2,9,3,U('wood')),'translate(62 20) rotate(24)')+r(24,45,37,22,5,U('bowl'),'stroke-width="1.5"')+leaf(41,62,.65,30)+leaf(52,57,.4,55);
  b+=p('M69 72 83 43l5 2-13 29Z',U('wood'),'stroke-width="1.6"')+leaf(78,46,.44,35)+light('M20 43v21',2.6);
  if(l>=2)b+=p('M17 71q25 12 51 0v7q-25 13-51 0Z',U('metal'),'stroke-width="1.5"')+line('M28 40h28',C.cream,1.7);
  if(l===3)b+=p('M8 77h71l-5 10H14Z',U('wood'))+r(31,46,23,20,5,U('gold'),'stroke-width="1.2"')+leaf(41,61,.5,25)+p('M19 30q21-12 41-3','none','stroke-width="3"');
  return b;
}
function mixerBase(l){
  let b=feet(16,74)+p('M9 48h79v31H9Z',U('blue'))+e(48,49,39,14,U('metal'))+e(48,48,31,9,U('glass'),'stroke-width="1.5"')+bottle(29,46,'tea',30)+bottle(51,44,'glass',40)+bottle(72,46,'darkGreen',32)+iceCube(25,51,.27)+iceCube(64,52,.3)+r(30,64,35,10,3,U('bowl'),'stroke-width="1.4"');
  if(l>=2)b+=p('M13 47V22h7v25m60 0V20h7v27',U('metal'),'stroke-width="1.7"')+r(13,18,74,5,2,U('metal'))+line('M37 65h20',C.blue,2);
  if(l===3)b+=r(8,76,81,7,2,U('wood'))+p('M15 20q33-17 70 0','none','stroke-width="5"')+iceCube(47,49,.35)+knob(80,67,.75);
  return b;
}
function chopping(l,raw){
  let b=p('M12 38 70 25l15 40-57 19L12 70Z',U('wood'))+p('M12 38 70 25l15 33-57 19Z',U('grain'))+e(27,39,3,3,U('coffee'),'stroke-width="1.5"')+food(raw,'黄瓜',43,58,.37,-18)+p('M56 24 72 7l10 7-16 19-14 12-7-6Z',U('metal'))+p('M56 24 72 7l10 7-16 19Z',U('wood'))+line('M19 58 26 71m4-21 4 10',C.darkWood,1.2);
  if(l>=2)b+=p('M14 36 21 34l4 10-7 2Zm60-9 6 9-6 3-5-10Z',U('metal'),'stroke-width="1.4"')+food(raw,'大蒜',71,64,.27);
  if(l===3)b+=p('M13 71 29 82l55-18v9L29 90 13 78Z',U('enamel'))+p('m18 53 4 13m54-27 4 13','none','stroke="'+3+'"')+leaf(65,47,.5,60);
  return b;
}
function fruitPress(l){
  let b=p('M15 78h68l-5 9H18Z',U('enamel'))+p('M17 77V17q0-9 11-9h42v9H31v60Z',U('metal'))+p('M27 17h40v8H27Z',U('enamel'))+line('M57 24v22',C.darkBrown,5)+p('M40 45q16-17 33 0v5H40Z',U('metal'))+e(56,51,14,7,U('egg'))+p('M42 55h29l-3 17H46Z',U('glass'))+e(56,56,14,4,U('mango'),'stroke-width="1.3"')+p('M53 36 75 10l8 5-24 27Z',U('wood'))+light('M23 27v32',2);
  if(l>=2)b+=r(10,74,77,7,3,U('wood'))+knob(28,79,.8)+p('M68 55h8l-5 5','none','stroke-width="2"');
  if(l===3)b+=p('M12 78V27q0-10 8-10','none','stroke-width="4"')+r(32,81,46,5,2,U('copper'),'stroke-width="1.3"')+p('M37 51h38v5H37Z',U('enamel'),'stroke-width="1.5"');
  return b;
}
function cookingPot(l){
  let b=p('M13 43q-11-10-11 3 0 11 13 10m68-13q11-10 11 3 0 11-13 10',U('metal'),'stroke-width="3"')+p('M13 37h70l-4 23q-4 24-31 24T17 60Z',U('enamel'))+e(48,38,36,12,U('metal'))+p('M15 36q5-24 33-24t33 24Z',U('enamel'))+e(48,15,10,5,U('wood'))+light('M26 30q6-9 17-10M22 50q0 14 11 20',3);
  if(l>=2)b+=p('M19 80h59l-4 8H22Z',U('metal'))+p('M25 41q24 8 47 0','none','stroke-width="3"')+knob(48,82,.8);
  if(l===3)b+=p('M10 34q38-14 76 0','none','stroke-width="4"')+r(37,9,23,7,3,U('copper'))+p('M21 78q27 16 55 0','none','stroke-width="3"');
  return b;
}
function griddle(l){
  let b=base('metal')+p('M10 54 22 30h58l7 24Z',U('inkPot'))+p('M12 53 25 36h50l6 17Z',U('steel'),'stroke-width="1.5"')+p('M21 31V22h62v10',U('metal'))+knob(29,71)+knob(65,71)+p('M57 44 73 21l6 4-13 24Z',U('wood'),'stroke-width="1.5"')+p('M49 48 58 36l14 7-9 12Z',U('metal'));
  if(l>=2)b+=line('M47 34v19',C.darkBrown,2)+r(11,75,74,5,2,U('copper'),'stroke-width="1.3"');
  if(l===3)b+=p('M15 30V14h65v16','none','stroke-width="3"')+r(13,11,69,5,2,U('metal'))+p('M22 17h11v12H22Z',U('wood'),'stroke-width="1.3"')+knob(48,71);
  return b;
}
function grill(l){
  let b=p('M19 63 14 87h8l10-24m32 0 10 24h8l-6-24Z',U('metal'))+p('M11 40h74v23q-36 16-74 0Z',U('red'))+p('M11 40 27 24h53l5 16Z',U('inkPot'))+p('M19 40 29 29h45l3 11Z',U('glaze'));
  b+=line('M24 30 19 42m18-13-5 14m18-14-4 14m18-14-4 14m16-14-4 13M22 35h54',C.metal??'#52616a',2.4)+p('m30 48 5-5 6 8 8-7 8 6 7-5 5 9-39 2Z',U('tomato'),'stroke-width="1.3"')+line('M79 39 91 17',C.darkWood,3)+r(83,9,9,15,3,U('wood'));
  if(l>=2)b+=r(21,70,51,6,2,U('metal'))+p('M8 47H2v10h9m74-10h9v10h-9',U('wood'),'stroke-width="1.6"');
  if(l===3)b+=p('M15 28V11h62v17','none','stroke-width="3"')+p('M9 11 21 3h54l10 8Z',U('red'))+p('M24 64h49v9H24Z',U('metal'))+knob(48,65,.8);
  return b;
}
function oven(l){
  let b=feet(25,66)+r(20,10,59,74,9,U('copper'))+p('M29 63V39q0-18 21-18t21 18v24Z',U('inkPot'))+p('M35 58V39q0-13 15-13t15 13v19Z',U('glass'),'stroke-width="1.5"')+line('M35 49h30',C.darkWood,2)+p('M39 49q1-13 11-13t11 13Z',U('wood'),'stroke-width="1.4"')+r(30,64,41,5,2,U('metal'))+knob(36,76,.75)+knob(62,76,.75)+light('M25 23v28',2.4);
  if(l>=2)b+=p('M20 12h59V6H20Z',U('metal'),'stroke-width="1.5"')+line('M37 53h27',C.cream,1.4)+r(27,71,44,3,1,U('metal'),'stroke-width="1"');
  if(l===3)b+=p('M15 19h6v56h-6Zm64 0h6v56h-6Z',U('metal'),'stroke-width="1.5"')+r(39,2,23,7,2,U('wood'),'stroke-width="1.3"')+p('M24 84h52v6H24Z',U('metal'));
  return b;
}
function steamer(l){
  let b='',n=l,y0=70;
  for(let i=0;i<n;i++){let y=y0-i*15;b+=p('M19 '+(y-9)+'h60v15q-29 15-60 0Z',U('grain'))+e(49,y-9,30,10,U('wood'))+line('M22 '+(y+1)+'q26 11 54 0',C.darkWood,1.6)+[27,39,51,63,74].map(x=>line('M'+x+' '+(y-3)+'v10',C.darkWood,1.1)).join('');}
  let y=y0-(n-1)*15-11;
  return b+p('M16 '+y+'q4-20 33-21 28 0 33 21Z',U('grain'))+e(49,y,33,9,U('wood'))+p('M39 '+(y-20)+'q10-10 20 0v4H39Z',U('wood'))+line('M24 '+(y-4)+'q25-23 50 0M31 '+(y-4)+'q18-20 36 0',C.darkWood,1.3)+light('M25 '+(y+1)+'q15 4 29 3',2.5);
}
function wok(l){
  let b=base('red')+p('M15 42q29 16 58-1-1 27-28 28T15 42Z',U('inkPot'))+e(44,42,29,11,U('metal'))+e(44,42,23,7,U('inkPot'),'stroke-width="1.4"')+p('M65 39 87 15l7 5-24 27Z',U('wood'))+p('M16 44q-13-11-12 1 0 10 13 9','none','stroke-width="4"')+knob(43,75);
  if(l>=2)b+=p('M21 58q22 17 46 0','none','stroke="#c89662" stroke-width="3"')+p('M31 62 37 55l7 7 7-7 7 7',U('tomato'),'stroke-width="1.2"');
  if(l===3)b+=r(10,78,76,8,2,U('metal'))+p('M17 59V30m57 26V25','none','stroke-width="3"')+r(14,25,12,5,2,U('wood'),'stroke-width="1.3"');
  return b;
}
function microwave(l){
  let b=feet(17,72,75)+r(9,28,78,49,8,U('pink'))+r(17,35,48,31,5,U('inkPot'))+r(23,40,36,20,2,U('glass'),'stroke-width="1.5"')+line('M25 56h32',C.white,2)+r(62,39,4,23,2,U('metal'),'stroke-width="1.3"')+knob(76,43,1.15)+r(71,56,11,5,2,U('bowl'),'stroke-width="1.2"')+light('M17 31h44',2.8);
  if(l>=2)b+=p('M16 28 24 20h55l7 8Z',U('metal'))+knob(77,66,.65)+r(17,68,44,3,1,U('metal'),'stroke-width="1"');
  if(l===3)b+=p('M8 36H3v34h7m77-34h6v34h-7',U('metal'),'stroke-width="1.5"')+r(28,19,40,5,2,U('wood'),'stroke-width="1.2"')+p('M13 77h69v6H13Z',U('wood'));
  return b;
}
function blender(l){
  let b=p('M31 63h36l9 19q-27 12-54 0Z',U('enamel'))+p('M24 20h47l-5 43q-17 12-35 0Z',U('glass'))+p('M31 34h33l-4 24q-12 8-24 0Z',U('mango'),'stroke-width="1.3"')+p('M69 29q19-5 15 10l-15 12','none','stroke-width="5"')+r(20,14,54,9,4,U('metal'))+r(40,8,18,6,3,U('wood'),'stroke-width="1.4"')+knob(48,75,1.3)+line('M38 42q16-12 18 1 0 11-13 8-8-5 2-6',C.cream,2)+light('M29 26 33 50',2.4);
  if(l>=2)b+=r(26,79,44,7,3,U('metal'))+line('M61 30h5m-6 8h5m-6 8h4',C.darkWood,1.5);
  if(l===3)b+=p('M19 82h60v7H19Z',U('copper'))+r(29,65,8,5,2,U('wood'),'stroke-width="1"')+r(58,65,8,5,2,U('wood'),'stroke-width="1"')+p('M23 16 29 8h38l8 8Z',U('metal'));
  return b;
}
function iceCream(l){
  let b=feet(24,67)+r(22,9,54,75,8,U('bowl'))+r(28,18,42,26,5,U('pink'))+p('M32 40h34v12H32Z',U('metal'))+line('M39 36v21m18-21v21',C.darkWood,4)+r(34,49,10,8,2,U('metal'),'stroke-width="1.3"')+r(52,49,10,8,2,U('metal'),'stroke-width="1.3"')+p('M33 65h24L45 83Z',U('wood'),'stroke-width="1.4"')+p('M32 64q-2-7 5-8-1-7 8-9 1 7 8 9 7 2 6 8Z',U('garlic'))+r(27,82,44,4,2,U('metal'),'stroke-width="1.2"');
  if(l>=2)b+=r(17,18,5,54,2,U('metal'),'stroke-width="1.3"')+r(76,18,5,54,2,U('metal'),'stroke-width="1.3"')+knob(65,64,.8);
  if(l===3)b+=p('M25 12V4h21v8m7 0V4h21v8',U('glass'),'stroke-width="1.5"')+e(36,5,10,3,U('egg'),'stroke-width="1"')+e(63,5,10,3,U('coffee'),'stroke-width="1"')+r(20,84,59,5,2,U('wood'),'stroke-width="1.5"');
  return b;
}
function bar(l){
  let b=p('M10 49h74v34H10Z',U('wood'))+p('M10 49V35h14v14h62v8H10Z',U('metal'))+r(19,61,55,15,3,U('enamel'),'stroke-width="1.5"')+p('M34 14h21l4 31q-13 7-28 0Z',U('metal'))+p('M35 14 38 7h14l3 7Z',U('steel'),'stroke-width="1.5"')+line('M68 46 79 8',C.darkWood,3)+e(79,8,3,6,U('metal'),'transform="rotate(18 79 8)" stroke-width="1.4"')+p('M62 44 60 29h15l-3 15Z',U('glass'),'stroke-width="1.5"')+light('M38 20v17',2.4);
  if(l>=2)b+=p('M13 36V14h11v22Z',U('wood'))+bottle(18,34,'tea',22)+r(10,78,74,7,2,U('metal'))+line('M25 64v10m39-10v10',C.cream,2);
  if(l===3)b+=p('M9 38V3h18v6H15v29Z',U('metal'))+p('M79 58h11v25H79Z',U('wood'))+r(82,61,5,16,1,U('glass'),'stroke-width="1"')+knob(46,67,.75);
  return b;
}
const drawers = {
 'vegetable-cart':vegetables,'seasonal-produce-rack':seasonal,'fruit-cart':fruitCrate,'exotic-fruit-basket':exotic,
 'beast-meat-cart':butcher,'poultry-cart':poultry,'spice-box':spices,'seafood-fridge':sea,'dairy-fridge':dairy,
 'grain-box':grain,'sweet-cabinet':sweets,'coffee-grinder':coffee,'tea-caddy':tea,'mixer-base-cooler':mixerBase,
 'chopping-board':chopping,'fruit-press':fruitPress,'home-cooking-pot':cookingPot,'frying-station':griddle,
 'charcoal-grill':grill,'oven':oven,'steamer':steamer,'wok':wok,'microwave':microwave,'blender':blender,
 'ice-cream-machine':iceCream,'bar':bar
};
export function device(family,level,raw){
  if(!drawers[family]||![1,2,3].includes(level))throw new Error('Missing V4 equipment artwork: '+family+' L'+level);
  return drawers[family](level,raw);
}

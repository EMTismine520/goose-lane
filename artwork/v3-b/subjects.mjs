// Large, legible subjects for V4. Geometry is shared by food, producer displays and recipes.
import {C,p,e,r,line,light,t,leaf,plate,deepBowl,lemonSlice,onionRing,tomatoWedge} from './primitives.mjs';
const u=n=>'url(#'+n+')';
const at=(body,x,y,s=1,a=0)=>t(body,'translate('+x+' '+y+') rotate('+a+') scale('+s+')');
const mini=(body,x,y,s=.35,a=0)=>at(t(body,'translate(-48 -48)'),x,y,s,a);
const freckles=(pts,color='#b88050')=>pts.map(([x,y])=>e(x,y,1.2,1,color,'stroke="none"')).join('');
const bone=()=>p('M-6 4V-7q-10-9-3-15 6-4 10 2 6-6 11-1 5 7-5 14V4Z',u('bone'),'stroke-width="1.8"');
const meaty=(fill='pork')=>p('M16 45q2-24 31-27 31-3 36 19 7 26-18 40-23 14-42-3-14-10-7-29Z',u(fill))+light('M27 36q8-9 19-9',3.2);
const berry=(x,y,s=1)=>at(e(0,0,12,11,u('berry'))+p('m-5-4 3-3 3 2 4-1-1 4-4 2-2-2-3 1Z','#534c73','stroke-width="1.1"')+light('m-6 1 2-3',1.8),x,y,s);
const egg=(x,y,s=1,a=0)=>at(p('M-20 5q-1-19 20-36Q21-13 20 6q-1 22-20 22T-20 5Z',u('bone'))+light('M-12-5q2-11 8-16',3),x,y,s,a);
const stem=()=>line('M48 29q-3-14 6-21',C.darkWood,3);
const leafCrown=()=>p('M47 32 30 19l15 2 4-14 5 15 14-4-10 15-6-6Z',u('darkGreen'),'stroke-width="1.8"');

export function subject(name,h){
 const draw=n=>subject(n,h);
 if(name==='番茄')return p('M47 29q-23-16-33 5-12 27 12 43 23 17 45 0 20-14 12-39-8-24-36-9Z',u('tomato'))+p('M51 76q18-3 25-18','none','stroke="#c44c38" stroke-width="2"')+leafCrown()+light('M23 42q-4 9-1 16',4)+e(30,35,4,2,'#ffe1af','stroke="none"');
 if(name==='黄瓜')return at(p('M-30 11q17-29 47-36 11-3 14 9-3 26-47 45-20 5-14-18Z',u('darkGreen'))+p('M-24 15q28-5 48-29','none','stroke="#bdd78a" stroke-width="3"')+freckles([[-17,12],[-6,8],[5,-1],[17,-10]],'#3f7041')+light('M-23 9q15-21 36-25',2.8),48,48,1.05);
 if(name==='彩椒')return p('M25 29q-3-10 10-13 11-3 17 6 11-9 21-1 15 11 8 39-4 22-18 21-11 7-20 0-18 7-22-11-10-26 4-41Z',u('egg'))+p('M43 26q-11 20 0 52m14-51q14 22 6 52','none','stroke="#d3993a" stroke-width="2.2"')+p('M42 26q0-12 8-17l8 5-8 15Z',u('darkGreen'))+light('M28 36q-5 17 1 25',3);
 if(name==='胡萝卜')return at(p('M-17-17q15-12 31 0 9 23-12 58-29-27-19-58Z',u('tomato'))+line('m-12-3 12 2m-9 13 10 1m-3 12 5 1','#b86838',1.8)+leaf(-8,-16,.75,-40)+leaf(1,-20,.9,0)+leaf(12,-17,.7,45)+light('M-9-12q-5 9-1 17',3.1),46,42,1,20);
 if(name==='西兰花')return p('M37 54h22l8 29q-17 8-34 0Z',u('green'))+line('M46 76 26 49m28 20 19-26','#4f8246',6)+p('M17 50Q3 38 17 27q-2-17 16-17 11-10 22 3 18-10 25 7 18 4 12 22-4 15-20 13-12 13-25 1-18 13-30-6Z',u('darkGreen'))+p('M22 32q10-11 22-2m13-8q13-3 16 10m-9 14 10-2','none','stroke="#a9cc70" stroke-width="4"')+light('M20 26q6-8 13-6',3);
 if(name==='南瓜')return p('M19 35q-5-17 15-19 8-7 15-1 14-9 23 4 16 4 14 23 6 35-35 40Q7 82 12 51q-6-9 7-16Z',u('mango'))+p('M35 24q-16 29-4 51m20-53q-9 33-1 57m15-54q17 26 6 49','none','stroke="#c48837" stroke-width="2.2"')+p('M42 21 45 8h12l-4 15Z',u('wood'))+light('M20 43q-4 12 0 20',3);
 if(name==='田园菜篮'||name==='缤纷果篮'){
  const fruit=name==='缤纷果篮';
  let b=fruit?p('M25 46q-2-36 23-36t24 36','none','stroke-width="5"'):'';
  b+=mini(draw(fruit?'甜橙':'胡萝卜'),32,39,.46,-15)+mini(draw(fruit?'苹果':'西兰花'),60,39,.46)+mini(draw(fruit?'葡萄':'番茄'),49,47,.36);
  return b+p('M10 49q38 13 77 0L78 77q-29 17-60 0Z',u('grain'))+line('M17 60q31 12 62 0m-58 11q27 10 53 0m-42-15 3 24m20-24-2 24',C.darkWood,1.6)+p('M8 47q40 13 80 0v8q-39 12-80 0Z',u('wood'));
 }
 if(name==='草莓')return p('M46 29Q18 9 13 38q-3 26 35 47 35-23 35-48-5-26-37-8Z',u('red'))+leafCrown()+[25,42,60,73,33,51,67,45,58].map((x,i)=>e(x,[43,42,41,46,57,58,58,70,70][i],1.9,2.7,'#ffe5a0','stroke="none"')).join('')+light('M23 36q-5 9-1 15',3.4);
 if(name==='甜橙')return e(43,46,32,33,u('mango'))+stem()+leaf(59,23,.65,60)+at(e(0,0,23,23,u('egg'))+e(0,0,18,18,'#f6a442','stroke="#fff0c2" stroke-width="2.5"')+line('M0-17V17m-15-9 30 16m-30 1 30-18','#ffe9ae',2.2)+e(0,0,3,3,'#ffe9ae','stroke="none"'),68,66,.83)+light('M22 38q2-12 11-15',3.7);
 if(name==='苹果')return p('M46 29q-20-18-31 0-16 24 3 46 15 17 30 7 17 10 29-7 18-25 0-45-12-17-31-1Z',u('tomato'))+stem()+leaf(64,23,.75,60)+p('M41 74q7 3 14-1','none','stroke="#bb4437" stroke-width="2"')+light('M24 39q-6 12 0 23',4);
 if(name==='葡萄'){
  const points=[[30,32],[49,26],[67,34],[23,49],[43,45],[62,50],[35,64],[56,67],[47,80]];
  return points.map(([x,y])=>e(x,y,12,12,u('onion'))+light('m'+(x-5)+' '+(y-4)+' 3-2',2)).join('')+line('M47 19q4-12 13-13',C.darkWood,3)+leaf(33,22,.7,-55);
 }
 if(name==='菠萝')return p('M23 39q25-17 50 0l7 30q-29 29-59 0Z',u('egg'))+p('m27 39 43 33m-48-16 34 27m-14-46 36 25m-51 9 44-33m-34 43 39-31','none','stroke="#c29748" stroke-width="1.6"')+p('M48 40 24 19l17 5-3-20 15 18L66 7l-4 22 17-10-14 24Z',u('darkGreen'))+light('M28 45 26 62',2.8);
 if(name==='西瓜')return p('M10 38q35-8 77-2-7 40-38 48T10 38Z',u('darkGreen'))+p('M16 38q36-6 65-1-7 34-33 40T16 38Z',u('bone'),'stroke-width="1.6"')+p('M22 38q29-4 52 0-7 28-26 32T22 38Z',u('red'),'stroke-width="1.5"')+[[33,47],[47,43],[61,48],[45,59],[57,61]].map(([x,y])=>e(x,y,1.5,2.8,'#624737','transform="rotate(-12 '+x+' '+y+')" stroke="none"')).join('')+light('M23 70q11 12 24 11',2);
 if(name==='香肠')return p('m20 38-9-6-4 10 11 4m54 13 11 2 3-12-11-2',u('fat'),'stroke-width="1.6"')+p('M20 30q14 0 20 16 9 22 34 15l6 12Q34 96 15 51q-8-20 5-21Z',u('red'))+line('M22 43q3 13 13 23m4 1 5 5m8-2 6 3','#b45140',1.7)+light('M23 36q7 5 9 14',3.5);
 if(name==='培根')return [0,1].map(i=>at(p('M-33-9q11-10 21-1 10 8 20 0 12-9 25-1l-3 20q-12-7-23 0-10 8-20 0-10-8-21 1Z',u('red'))+p('M-30-3q11-8 20 0 12 8 22-1 10-5 19-1l-1 5q-10-4-20 2-10 8-21 0-9-8-20-1Z',u('fat'),'stroke="none"')+light('M-24-9q6-3 11 0',2),47,33+i*29,1,-13+i*8)).join('');
 if(name==='肉丸')return [[33,37,1],[65,46,.98],[38,69,1.05]].map(([x,y,s])=>at(p('M-17-8q2-12 16-13 13 0 19 13 8 18-8 25-19 10-28-5-7-10 1-20Z',u('roast'))+light('M-10-6q3-7 9-7',3)+freckles([[-9,6],[3,-6],[8,8]],'#955a3a'),x,y,s)).join('');
 if(name==='五花肉')return p('M15 31 65 19l20 18-6 36-47 13-20-20Z',u('pork'))+p('m15 31 20 17 50-11-20-18Z',u('fat'))+p('m14 43 19 17 49-13-2 9-47 15-21-19Z',u('fat'),'stroke-width="1.4"')+p('m13 58 20 17 47-15-1 8-47 16-20-19Z',u('fat'),'stroke-width="1.4"')+line('M35 49 33 83','#bb6a59',1.6)+light('M24 32 61 24',2.5);
 if(name==='排骨')return [0,1,2,3].map(i=>at(p('M-7 13V-9q-8-9-1-13 6-2 8 4 5-6 10-2 5 5-4 13v20Z',u('bone'),'stroke-width="1.5"')+p('M-11 0q9-10 21 0l3 19q-12 11-26 0Z',u('pork'),'stroke-width="1.7"')+light('M-6 3v9',2),25+i*16,44+i*4,.94,-10)).join('')+p('M14 68q34 14 67 4l-1 9q-34 11-65-5Z',u('red'),'stroke-width="1.6"');
 if(name==='猪排')return meaty('pork')+p('M30 35q16-14 33 0l8 17q-8 20-28 16-26-5-13-33Z',u('fat'),'stroke-width="1.6"')+p('M35 39q13-9 24 0l6 14q-9 12-23 8-17-4-7-22Z',u('pork'),'stroke-width="1.5"')+at(bone(),70,66,.7,135);
 if(name==='带骨肘子')return at(bone(),59,28,1.3,25)+p('M22 40q18-23 40-5 21 20 6 40-27 22-49-2-14-17 3-33Z',u('pork'))+p('M25 45q15-17 29-6 18 17 5 31-17 13-32-2Z',u('fat'),'stroke-width="1.7"')+light('M30 44q6-7 15-4',3);
 if(name==='带骨牛排')return meaty('red')+p('M47 25q8 2 7 12l-2 10 20 15-5 7-22-15-15 11-5-7 17-14 2-14Z',u('bone'),'stroke-width="1.8"')+line('M23 49q1 13 11 19m28-39 8 9','#f5ba9c',2.4);
 if(name==='羊排')return [0,1,2].map(i=>at(p('M-5 4V-24q-8-7-1-11 5-2 8 3 6-4 9 1 3 4-5 9V5Z',u('bone'),'stroke-width="1.5"')+p('M-15 3q10-12 23-3 15 15-1 26-17 10-25-6-3-9 3-17Z',u('red'),'stroke-width="1.8"')+p('M-10 8q8-8 15-1 7 9-2 14-11 6-14-5Z',u('fat'),'stroke-width="1.2"'),27+i*21,53+i%2*7,.9,-25+i*18)).join('');
 if(name==='火腿')return at(bone(),74,29,.9,55)+p('M24 24q22-16 42 5l7 34q-7 24-34 23Q7 86 10 62q0-19 14-38Z',u('red'))+e(30,65,21,21,u('fat'),'transform="rotate(-20 30 65)"')+e(30,65,15,15,u('pork'),'stroke-width="1.5"')+e(30,65,5,5,u('bone'),'stroke-width="1.3"')+line('M47 29 59 54m-20-8 23-4','#9d4f40',1.6)+light('M30 30q8-5 14 1',3);
 if(name==='鸡蛋')return egg(47,50,1.13,-8);
 if(name==='鸡胗')return [0,1].map(i=>at(p('M-18-6q0-17 17-16Q18-23 20-8q4 23-18 27-24-2-20-25Z',u('gizzard'))+p('M-11-7q7-11 15-8 9 5 8 13','none','stroke="#e8b9a2" stroke-width="3"')+line('M-7 5 8 0','#744a43',2),32+i*30,39+i*24,1.05,-12+i*45)).join('');
 if(name==='鸡翅中')return at(p('M-28-13q5-14 19-7l28 10q18 4 17 18-3 18-21 14l-29-8q-23 1-23-15 0-9 9-12Z',u('chicken'))+line('M-14-5 21 7m-35-1 30 9','#cf9068',2.2)+light('M-21-10q7-8 14-3',3.2),48,49,1.05,-30);
 if(name==='鸡胸肉')return p('M13 57q1-29 31-41 7-3 9 8l-1 50q-20 18-37 3-9-8-2-20Z',u('chicken'))+p('M54 25q24-6 30 22 8 25-10 34-13 9-27-5Z',u('chicken'))+line('M27 38q-9 13-6 27m42-28q12 13 10 26','#e7ac82',1.8)+light('M26 34q7-7 13-9',3.8);
 if(name==='鸡腿')return at(bone(),73,25,.95,55)+p('M58 26q18 9 4 24-3 21-20 31-22 13-34-5Q-6 53 17 40q21-5 41-14Z',u('chicken'))+light('M20 47q10-6 17-5',3.5)+line('M50 39q10 1 10 8','#cf926c',1.7);
 if(name==='鸡全翅')return p('M12 67q4-23 24-22l15 5 14-33q7-14 17-5 9 8-2 20L66 69q-7 18-23 8l-13-8-10 10-10-4Z',u('chicken'))+line('M34 53 53 65l19-36','#d5946b',2.4)+light('M20 57q5-6 12-4M67 26l5-9',2.8);
 if(name==='整鸡')return p('M24 36q2-20 25-20 27 1 30 29l-4 23q-28 24-53 0Z',u('chicken'))+p('M29 50q-21-11-24 4 0 14 21 20m43-24q21-11 24 4 0 14-21 20',u('chicken'))+p('M27 70q-9 5-9 14m48-13q10 5 11 13','none','stroke-width="5"')+line('M49 24q-7 18 0 40','#d79973',2)+light('M30 33q6-9 14-8',3.5);
 if(name==='红椒')return p('M70 19q23 34-8 56-20 14-48 9 32-6 34-24 2-24 22-41Z',u('pepper'))+p('M65 28q-7-13 2-21l7 5-3 12 8 5-14 5Z',u('darkGreen'))+light('M68 38q6 17-13 28',3);
 if(name==='香葱')return [0,1,2].map(i=>at(p('M-5 28 0-30q4-10 7 0L4 29Z',u('darkGreen'),'stroke-width="1.7"')+p('M-5 17h10L3 37l-6 1Z',u('garlic'),'stroke-width="1.4"')+line('M-2 37-7 44m7-6 1 7m3-7 4 6',C.darkWood,1.2),32+i*15,42,1,-20+i*20)).join('')+r(31,52,30,8,3,u('wood'),'transform="rotate(-3 46 56)" stroke-width="1.3"');
 if(name==='紫洋葱')return p('M46 20q18 4 28 20 22 33-12 43-39 13-49-18-8-22 18-35Z',u('onion'))+p('M43 24 40 9l9 8 5-11 1 18Z',u('wood'),'stroke-width="1.6"')+line('M34 34q-16 28 1 42m10-47q-7 31 4 51m8-48q14 23 5 43','#e9bdd8',2.1)+onionRing(69,70,.9);
 if(name==='香草荚')return [0,1,2].map(i=>at(p('M-27 27q20-18 37-49 6-11 10-4-2 30-43 57Z',u('vanilla'),'stroke-width="2"')+light('M-20 22 12-20',1.6),40+i*11,45,1,-25+i*18)).join('');
 if(name==='大蒜')return p('M44 25 45 9h10l-2 17q29 9 30 34 1 22-34 26Q10 83 13 59q2-24 31-34Z',u('garlic'))+line('M46 29Q24 54 34 79m15-49q-9 31 0 52m5-52q20 26 12 49','#c8b296',1.8)+light('M25 49q4-8 10-10',3)+p('M41 85 39 90m8-6v7m7-7 2 7',u('wood'),'stroke-width="1.2"');
 if(name==='罗勒')return line('M47 82 46 27',C.darkGreen,4)+leaf(40,69,1,-55)+leaf(55,61,1.05,50)+leaf(39,48,.95,-60)+leaf(55,37,.9,50)+leaf(46,25,.9,0);
 if(name==='肉桂')return [0,1].map(i=>at(p('M-29-6 21-16q14 2 12 12l-5 13-49 15Z',u('cinnamon'))+e(-23,13,9,10,u('wood'),'transform="rotate(20 -23 13)"')+p('M-27 10q9-8 11 3-3 7-7 1','none','stroke="#96603c" stroke-width="1.8"')+line('M-13 1 25-9','#e4b67c',2),43+i*10,39+i*25,.95,-15+i*5)).join('');
 if(name==='蓝莓')return berry(33,34,1.15)+berry(66,43,1.1)+berry(43,69,1.25)+leaf(65,23,.6,50);
 if(name==='桑葚')return [[32,43,-30],[65,61,20]].map(([x,y,a])=>at([[0,-19],[-7,-13],[7,-12],[-9,-3],[4,-3],[11,1],[-8,8],[4,8],[0,18]].map(([xx,yy])=>e(xx,yy,6,6,u('purple'),'stroke-width="1.2"')).join('')+line('M0-23 3-34',C.darkWood,2)+light('m-4-14 2-2',1.5),x,y,1.2,a)).join('')+leaf(57,31,.5,50);
 if(name==='四季豆')return [0,1].map(i=>at(p('M-31-13q32 4 62-10 1 26-31 40-22 10-32-30Z',u('green'))+line('M-24-7q30 3 47-10','#d2df94',2.1)+[-15,0,14].map(x=>e(x,-4-x/3,4,3.8,'#a6c66e','stroke="none"')).join(''),47,38+i*31,1,-9+i*7)).join('');
 if(name==='鳕鱼')return p('M14 35 69 20l17 23-11 33-49 9-15-22Z',u('steel'))+p('M14 35 69 20l17 17-52 19Z',u('garlic'))+p('M14 35 34 56l-8 24-15-17Z',u('bone'),'stroke-width="1.5"')+line('m27 35 45-10m-38 17 42-12m-35 20 40-12','#d8c8b0',1.7)+light('M23 33 65 23',2.5);
 if(name==='金枪鱼')return p('M13 61 39 17l45 31-12 29-59 7Z',u('red'))+p('M13 61 39 17l45 31-55 23Z',u('pork'))+line('M39 25 23 60m25-30-16 31m25-25-16 29m24-24-15 26','#f7bba3',2)+p('M13 61 29 71l55-23-12 29-59 7Z',u('red'),'stroke-width="1.6"')+light('M38 25 74 48',2.6);
 if(name==='纯牛奶')return p('M27 31 37 11h28l10 20v50H27Z',u('paper'))+p('M27 31h48l-10-20H37Z',u('blue'))+p('M61 31h14v50H61Z',u('blue'),'stroke-width="1.5"')+r(34,43,25,25,5,u('enamel'),'stroke-width="1.4"')+p('M46 46q-13 13 0 17 13-3 0-17Z',u('bone'),'stroke-width="1.2"')+line('M38 12v11h23',C.white,2)+light('M31 37v32',2.8);
 if(name==='酸奶')return p('M20 35h49l-6 43q-18 11-36 0Z',u('paper'))+e(45,35,25,7,u('glass'))+e(45,34,19,4,u('garlic'),'stroke-width="1.2"')+p('M20 33 34 16l30 8-18 13Z',u('blue'),'stroke-width="1.6"')+r(30,50,28,17,5,u('pink'),'stroke-width="1.3"')+leaf(44,62,.4,25)+p('M71 74 78 23h5l-6 52Z',u('metal'),'stroke-width="1.3"')+e(81,21,6,10,u('metal'),'transform="rotate(10 81 21)" stroke-width="1.5"');
 if(name==='炼乳')return r(20,29,51,51,6,u('metal'))+e(45,30,25,9,u('bowl'))+e(45,31,19,5,u('glaze'),'stroke-width="1.4"')+r(22,44,47,25,2,u('blue'),'stroke-width="1.4"')+p('M39 48q-12 14 0 17 12-3 0-17Z',u('bone'),'stroke-width="1.2"')+p('M50 28q-4-12 7-10l21-9 5 8-20 10q-7 12-10 29-5-9-3-28Z',u('garlic'),'stroke-width="1.5"')+light('M27 35v7',2);
 if(name==='大米')return p('M17 54 27 26h44l11 29-5 23q-28 14-56 0Z',u('grain'))+e(49,32,25,11,u('bowl'))+p('M25 30q4-10 23-10 21 0 24 10Z',u('rice'),'stroke-width="1.3"')+Array.from({length:12},(_,i)=>e(32+i%4*11,27+Math.floor(i/4)*6,4,1.7,'#fffbed','stroke="#d0b985" stroke-width=".7"')).join('')+r(33,49,29,20,4,u('bowl'),'stroke-width="1.3"')+p('M41 63V54m1 5 5-5m-5 10 7-5',u('green'),'stroke-width="2"')+light('M23 49 25 68',2.8);
 if(name==='燕麦')return h.smallBowl(u('wood'))+Array.from({length:14},(_,i)=>e(25+i%5*11,31+Math.floor(i/5)*9,5,3.5,u('grain'),'stroke-width=".9" transform="rotate(-20 '+(25+i%5*11)+' '+(31+Math.floor(i/5)*9)+')"')).join('')+line('M67 59 86 18',C.darkWood,2)+[0,1,2].map(i=>at(e(-3,0,6,3.5,u('egg'),'stroke-width="1"')+e(6,-4,6,3.5,u('egg'),'stroke-width="1"'),77+i*3,39-i*10,1,-35)).join('');
 if(name==='面粉')return p('M24 32 20 18q25 8 47-2l-2 17 9 42q-25 16-53 0Z',u('grain'))+e(44,27,22,10,u('wood'))+p('M24 26q4-13 20-12 18 0 23 11Z',u('garlic'),'stroke-width="1.5"')+r(30,43,28,23,4,u('bowl'),'stroke-width="1.3"')+line('M43 60V48m0 7-7-4m7 9 8-6',C.darkWood,1.5)+p('M53 80q11-24 30-3l7 8H48Z',u('garlic'),'stroke-width="1.6"')+light('M26 39 25 62',2.5);
 if(name==='砂糖')return p('M16 36 20 20h39l6 16-4 38H20Z',u('paper'))+p('M20 20h39l-6 12H15Z',u('pink'))+r(24,43,28,18,3,u('pink'),'stroke-width="1.3"')+p('M46 79q13-31 37-7l9 13H38Z',u('garlic'),'stroke-width="1.5"')+freckles([[57,71],[67,64],[75,74],[52,78],[67,80]],'#c5ae8c')+light('M23 36v27',2.5);
 if(name==='冰糖')return [[31,31,1.1],[63,49,1.1],[32,72,.85]].map(([x,y,s])=>at(p('M-15-9 1-19 17-4 10 15-11 17-20 1Z',u('gold'))+p('M-15-9 0-2 17-4 1-19Z',u('bone'),'stroke-width="1.4"')+line('M0-2 10 15m-10-17-11 19','#d7b168',1.4)+light('m-12-7 9-5',2),x,y,s)).join('');
 const coffeeNames=['咖啡豆','浓缩咖啡','原味咖啡','便携咖啡','冰咖啡','深烘咖啡','美式咖啡','大杯美式','摩卡咖啡'];
 if(name==='咖啡豆')return [[25,35,1.15,-25],[59,24,1.1,30],[73,58,1.1,-30],[41,61,1.25,20],[23,78,.8,-10]].map(a=>h.bean(...a)).join('');
 if(coffeeNames.includes(name)){
  if(name==='浓缩咖啡')return e(46,79,31,8,u('bowl'))+at(h.cup({color:u('coffee'),handle:true,shell:u('bowl')}),6,24,.8)+h.bean(72,77,.62);
  if(name==='原味咖啡')return h.cup({color:u('coffee'),shell:u('tomato'),handle:false})+r(33,48,29,12,3,u('paper'),'stroke-width="1.3"');
  if(name==='便携咖啡')return h.cup({color:u('coffee'),paper:true,shell:u('paper'),handle:false,lid:true})+p('M31 49h34l-2 17H33Z',u('wood'),'stroke-width="1.2"')+h.bean(48,57,.5,20);
  if(name==='冰咖啡')return p('M24 20h46l-5 58q-18 13-36 0Z',u('glass'))+p('M30 39h34l-4 36q-13 8-25 0Z',u('coffee'),'stroke-width="1.3"')+e(47,39,17,5,u('coffee'),'stroke-width="1.2"')+h.iceCube(39,33,.42)+h.iceCube(56,42,.43)+h.iceCube(43,59,.36)+light('M30 28 35 68',2.6);
  if(name==='深烘咖啡')return h.cup({color:u('coffee'),shell:u('coffee'),handle:true,beans:true})+p('M30 44q17 6 34 0','none','stroke="#d9a86f" stroke-width="2"');
  if(name==='美式咖啡')return p('M65 32q25-6 24 14-1 16-23 13',u('bowl'))+p('M22 20h47v52q-23 16-47 0Z',u('bowl'))+e(45,20,24,8,u('coffee'))+light('M29 33v27',3)+line('M36 11q-6-6-1-11','#bc9d7a',1.8);
  if(name==='大杯美式')return h.cup({color:u('coffee'),paper:true,large:true,shell:u('enamel'),handle:false,lid:true})+p('M28 46h41l-2 21H30Z',u('wood'),'stroke-width="1.4"');
  return h.cup({color:u('coffee'),shell:u('glass'),cream:true})+line('m35 25 28 6m-21-16 16 7','#8e5737',2.5)+h.bean(74,77,.6,-20);
 }
 if(name==='茶叶')return leaf(35,68,1.7,-45)+leaf(62,65,1.6,45)+leaf(48,45,1.35,0)+p('M25 77 72 73','none','stroke="#936840" stroke-width="3"');
 if(name==='绿茶')return e(48,81,33,7,u('bowl'))+p('M18 43h59q-4 32-30 32T18 43Z',u('enamel'))+e(47,43,29,9,u('teaGreen'))+p('M23 35q24-26 49 0Z',u('enamel'))+r(40,19,14,6,3,u('wood'),'stroke-width="1.4"')+light('M28 36q5-5 11-6',2.5);
 if(name==='红茶')return p('M65 39q22-5 20 13-1 14-20 12',u('glass'))+p('M23 20h46v54q-23 15-46 0Z',u('glass'))+p('M28 39h35v31q-17 10-35 0Z',u('tea'),'stroke-width="1.3"')+e(46,39,18,6,u('tea'),'stroke-width="1.2"')+line('M61 26v26l6 8',C.darkWood,1.2)+r(62,56,10,12,2,u('paper'),'stroke-width="1"')+light('M29 28v35',2.4);
 if(name==='乌龙茶'||name==='花茶'){
  const floral=name==='花茶',color=floral?'glass':'cinnamon';
  let b=p('M68 42q27-11 21 13-3 11-17 11',u(color),'stroke-width="2.5"')+p('M25 41 9 32l5 26 17 5Z',u(color))+p('M23 45q0-20 25-21 27 2 28 24v16q-26 24-51 0Z',u(color))+p('M28 33q22-19 42 0Z',u(color))+e(49,22,7,4,u('wood'));
  if(floral)b+=e(48,54,19,12,u('tea'),'stroke-width="1.2"')+leaf(43,62,.45,30)+[0,1,2,3,4].map(i=>e(48+Math.cos(i*1.25)*7,50+Math.sin(i*1.25)*6,4,3,u('pink'),'stroke-width=".9"')).join('')+e(48,50,2.5,2.5,u('egg'),'stroke-width=".8"');
  else b+=p('M29 59q20 14 40 0','none','stroke="#b7865d" stroke-width="2"');
  return b+light('M29 43v12',2.5);
 }
 if(name==='香草绿茶')return h.cup({color:u('teaGreen'),shell:u('bowl'),handle:true})+line('M60 40 73 8',C.darkGreen,3)+leaf(65,28,.65,50)+leaf(71,17,.6,-40)+leaf(51,45,.45,45);
 if(name==='苏打水')return p('M38 12h19v17l12 14v37q-20 12-40 0V43l9-14Z',u('glass'))+r(35,8,25,9,2,u('metal'),'stroke-width="1.4"')+p('M32 48h34v28q-17 10-34 0Z',u('blue'),'stroke-width="1.3"')+[[40,58,3],[55,64,3.5],[45,73,2],[52,49,2]].map(([x,y,s])=>e(x,y,s,s,u('glass'),'stroke="#79a9b1" stroke-width="1"')).join('')+light('M37 45v25',2.5);
 if(name==='矿泉水')return p('M33 24h28v10l9 12v33q-20 12-40 0V46l3-12Z',u('glass'))+r(31,14,32,12,3,u('blue'),'stroke-width="1.5"')+r(32,49,36,19,2,u('blue'),'stroke-width="1.3"')+p('M49 51q-13 14 0 14 13 0 0-14Z',u('bone'),'stroke-width="1"')+light('M35 35v10',2);
 if(name==='汤力水')return h.bottle(u('glass'),{shape:'square',cap:C.blue})+r(26,51,42,21,3,u('bowl'),'stroke-width="1.3"')+p('m38 61 10-6 10 6-10 6Z',u('blue'),'stroke-width="1.1"');
 return null;
}

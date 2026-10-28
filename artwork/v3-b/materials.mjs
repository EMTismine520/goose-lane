import {subject} from './subjects.mjs';
import {C,p,e,r,line,light,t,leaf,deepBowl,lemonSlice,crab,milkTea,ink} from './primitives.mjs';

export const bean=(x=48,y=48,s=1,a=0)=>t(e(0,0,10,6,'url(#coffee)')+line('M-5-3q7 1 6 6','#76533f',1.5),`translate(${x} ${y}) rotate(${a}) scale(${s})`);
export const smallBowl=(color='url(#bowl)')=>p('M17 43h62q-2 35-31 35T17 43Z',color)+e(48,43,31,12,'url(#garlic)')+light('M25 55q3 9 10 12',2.7);
export const bottle=(color='url(#tea)',{shape='round',cap=C.wood,label=false,angle=0}={})=>t(
 (shape==='square'?p('M36 15h24v15l12 8q4 3 4 8v33q0 6-7 6H27q-7 0-7-6V46q0-5 4-8l12-8Z',color):shape==='slim'?p('M40 14h16v27q15 4 15 17v24q0 5-23 5T25 82V58q0-13 15-17Z',color):p('M37 15h22v19q19 8 19 24v19q0 10-30 10T18 77V58q0-16 19-24Z',color))+
 r(shape==='slim'?38:35,9,shape==='slim'?20:26,10,2,cap,'stroke-width="1.8"')+
 (label?r(29,51,38,20,3,'#f9edca','stroke-width="1.5"'):'')+light(shape==='slim'?'M33 57v17':'M28 49q-3 9-1 19',3),`rotate(${angle} 48 48)`);
export function cup({color='url(#tea)',shell='url(#bowl)',handle=true,saucer=false,large=false,lid=false,cream=false,paper=false,beans=false}={}){
 let body=saucer?e(48,77,32,9,'url(#bowl)'):'';
 if(handle)body+=p('M69 38q21-7 20 11-1 16-19 12','url(#bowl)');
 body+=paper?p(large?'M23 23h50l-6 56q-20 12-38 0Z':'M27 33h42l-5 45q-15 12-32 0Z',shell):p('M22 32h52l-3 30q-2 19-24 19T25 62Z',shell);
 body+=e(48,paper?(large?23:33):32,paper?(large?25:21):26,8,color,'stroke-width="1.8"');
 if(lid)body+=r(large?21:25,large?19:28,large?54:46,8,4,'#6e6553')+e(48,large?19:28,large?25:21,5,'#8d806a','stroke-width="1.5"')+line('m40 17h11','#b9a17b',1.5);
 if(cream)body+=p('M25 33q-3-9 8-10-2-9 11-8 0-9 11-8-1 7 8 12 11 5 8 14Z','url(#garlic)')+line('M35 23q11 5 24 0','#d8c59f',1.5);
 body+=light(paper?'M34 44 36 66':'M30 43q0 15 6 21',2.7);
 if(beans)body+=bean(68,79,.65,20)+bean(77,73,.6,-30);
 return body;
}
export const iceCube=(x=48,y=48,s=1)=>t(p('M-13-12 4-18 17-9 14 11-5 17-17 7Z','url(#blue)')+p('M-13-12 1-3 17-9 4-18Z','#e9f2db','stroke-width="1.6"')+line('M1-3-5 17m6-20 13 14','#aac7c2',1.5)+light('m-10-9 7 4m-9 1-1 9',2),`translate(${x} ${y}) scale(${s})`);
export const pearls=(count=7,baseY=45)=>Array.from({length:count},(_,i)=>{const x=26+(i%4)*14,y=baseY+Math.floor(i/4)*12;return e(x,y,6,5.5,'url(#coffee)','stroke-width="1.4"')+e(x-1.5,y-1.5,1.7,1.2,'#d6b181','stroke="none"');}).join('');

function vegetable(name){
 if(name==='蘑菇')return p('M33 42h22l5 34q-12 13-25 1Z','url(#garlic)')+p('M12 43q1-30 34-31 34 0 37 31-31 15-71 0Z','url(#wood)')+line('M23 42q25 8 48 0','#b78d5b',1.7)+light('M23 29q7-8 17-9',3)+t(p('M35 49h15l4 28q-9 9-19 0Z','url(#garlic)')+p('M19 49q2-20 26-21 25 0 27 21-26 12-53 0Z','url(#wood)'), 'translate(27 11) scale(.65)');
 if(name==='玉米'){let seeds='';for(let row=0;row<6;row++)for(let col=0;col<3;col++)seeds+=e(39+col*9,23+row*8,4,4,'url(#egg)','stroke="#c9a05b" stroke-width="1"');return p('M31 72q-17-24-17-45 17 10 26 35Z','url(#green)')+p('M36 13q12-7 24 0 12 13 8 51-10 22-29 17-19-9-3-68Z','url(#egg)')+seeds+p('M44 81Q13 72 11 42q17 3 33 39ZM48 82Q83 62 85 26q-23 10-37 56Z','url(#green)')+line('M49 78q16-18 25-34','#618a48',1.6);}
 if(name==='紫甘蓝')return p('M28 20q18-14 36 2 20 3 20 28 0 28-29 34-27 4-41-18-9-23 14-46Z','url(#onion)')+line('M34 27q-18 21-5 42m16-44q-17 28 7 51m8-49q18 27 1 47m-38-25 17 11m21-23-17 13','#e6c5dc',2.5)+p('M48 42 84 65q-8 22-36 21Z','#f2dce6')+line('m53 50 26 17m-26-9 21 15m-23-7 15 12','#b482a7',2.2);
 if(name==='土豆')return p('M15 51q3-28 33-31 24-7 33 14 12 19-3 34-14 20-40 15-28-3-23-32Z','url(#wood)')+light('M26 39q9-9 21-9',3.5)+e(62,62,17,15,'url(#egg)','stroke="#bb945b" stroke-width="1.7"')+line('m32 57 3 1m19-15 3 1m-12 28 3 1m20-13 2 1','#b18a58',2);
 if(name==='生菜')return p('M19 30q-6-12 7-16 11-5 18 6 10-15 20-4 14-4 15 9 13 5 6 16 9 12-3 19 2 16-14 17-9 14-24 6-20 10-28-7-16-5-8-20-9-15 11-26Z','url(#green)')+p('M43 78q-15-27-8-42 9-12 19-2 15 3 13 17-4 19-16 31Z','#c9d99a','stroke-width="1.7"')+line('M48 77 48 35m-1 25-11-9m14 13 11-12m-15-7-7-7','#87a762',1.6)+light('M26 25q5-3 8 1m29-3 5 3',2.5);
 if(name==='四季豆')return [0,1,2,3].map(i=>t(p('M12 23q31 10 64-7 3 18-26 28Q24 56 12 23Z','url(#green)')+line('M22 29q25 10 45-5','#c3d78f',2)+e(34,34,4,3,'#b9cd83','stroke="none"')+e(49,30,4,3,'#b9cd83','stroke="none"'),`translate(${i%2*6-2} ${i*14-1}) rotate(${i%2?10:-10} 45 35) scale(.85)`)).join('');
 if(name==='茄子')return p('M49 24q24 8 22 29-2 25-28 31-24 3-27-15-5-17 11-27l15-13Z','url(#onion)')+p('M40 29 34 20l12 2 4-12 6 13 13 3-13 7-6 9-4-9Z','url(#green)')+line('M51 21q-2-9 4-13','#66864b',3)+light('M28 53q-7 13 2 18',3.8);
 if(name==='白萝卜')return p('M34 28q-12 14-8 30 4 19 24 29 2-18 15-30 9-15-2-27Z','url(#garlic)')+leaf(40,30,.9,-30)+leaf(52,29,1.1,10)+leaf(62,30,.75,45)+line('m35 47 8 2m-5 12 8 2m7-20 6-1','#d3c29c',1.8)+light('M32 39q-4 9-2 17',2.9);
 return null;
}
function fruit(name){
 if(name==='蓝莓'||name==='桑葚'){const color=name==='蓝莓'?'url(#berry)':'#84637f';return [[34,35],[56,29],[70,47],[47,54],[27,62],[60,71]].map(([x,y])=>e(x,y,name==='蓝莓'?13:12,name==='蓝莓'?12:14,color)+p(`m${x-4} ${y-6} 4-3 4 3-2 4h-4Z`,'#6f5c80','stroke-width="1"')+light(`m${x-6} ${y-3} 3-2`,2)).join('')+leaf(49,22,.5,30);}
 if(name==='香蕉')return p('M20 22q6 37 37 39 18 1 25-13-1 29-26 34-38 2-42-55Z','url(#egg)')+p('M28 17q3 32 31 36 14 0 22-12-3 26-27 29-32-1-34-48Z','url(#egg)')+p('m19 14 12-4 4 10-14 5Z','url(#wood)')+line('M24 33q7 27 33 29','#d5ab64',1.7)+light('M24 30q3 11 8 17',3);
 if(name==='柠檬')return p('M20 29q17-17 37-7 16 7 17 28-3 22-26 30-26 6-31-16-14-14 3-35Z','url(#egg)')+lemonSlice(63,66,1.05)+light('M25 35q7-8 15-9',3.2)+leaf(55,24,.6,65);
 if(name==='芒果')return p('M28 22q24-18 43 1 20 20 5 44-14 23-42 16-27-5-23-30 0-17 17-31Z','url(#mango)')+p('M42 51q18-7 33 9l-7 20q-24 12-40-6Z','url(#egg)')+line('m43 55 20 23m-12-27 20 20m-35-4 32-1m-23 9 25-2','#d6a15b',1.7)+leaf(53,22,.5,65)+light('M25 33q6-7 13-7',3);
 if(name==='水蜜桃')return p('M48 28q-10-17-28-4-21 18 1 45 15 18 27 15 12 3 27-15 22-27 1-45-18-13-28 4Z','url(#pink)')+line('M47 29q-10 27 0 49','#bc899b',1.8)+light('M24 36q-7 9-3 17',3)+leaf(55,27,.7,70);
 if(name==='椰子')return e(45,49,32,32,'url(#coconut)')+line('M27 25q-10 24 0 50m11-56q-10 29-4 60m19-60q10 29 4 60','#b18b64',1.8)+e(59,62,25,22,'url(#garlic)','transform="rotate(-20 59 62)"')+e(59,62,17,14,'#fcf6de','stroke="#d7c6a2" stroke-width="1.5" transform="rotate(-20 59 62)"');
 if(name==='梨')return p('M43 18q14-3 13 14-1 8 11 20 20 25-3 32-30 10-46-9-12-18 7-34 11-11 13-23Z','url(#egg)')+line('M47 21q-3-11 4-15','#8d704c',3)+leaf(57,24,.65,70)+light('M28 53q-7 13 3 19',3.5)+line('m42 66 1 1m12-10 1 1m-14-8 1 1','#cca369',1.5);
 return null;
}
function seafood(name){
 if(name==='鲜虾')return p('M66 24q-26-17-44 6-15 23 8 43 16 14 35 4L55 64q-17 4-23-12-4-17 13-21l15 7Z','url(#chicken)')+p('m61 27 13-12 10 5-9 8 10 9-7 8-18-10Z','url(#red)')+line('M30 29 45 38m-24 7 16 6m-10 13 16-2m2 12 6-14','#d69270',2)+line('M25 31q-20-17-20-7m21 9Q4 24 4 34','#b48162',1.7)+e(30,33,2,2,C.darkBrown,'stroke="none"')+light('M26 42q-5 13 8 21',3);
 if(name==='鱿鱼')return p('M32 19 48 8 65 19q8 20-4 40H35q-13-20-3-40Z','url(#pink)')+p('m33 24-17 19 17-7m31-12 17 19-17-7','url(#pink)')+line('M37 57q-23 21-15 28 10 3 18-24m8-2q-8 26 1 27 9 0 8-24m1-4q25 16 17 24-9 3-15-20m-18 0q-1 22-10 21','#b5818f',4.5)+e(41,50,2,2,ink,'stroke="none"')+e(55,50,2,2,ink,'stroke="none"')+light('M38 22q-5 8-3 17',3);
 if(name==='鳕鱼'||name==='鲶鱼'||name==='金枪鱼'){const cat=name==='鲶鱼',tuna=name==='金枪鱼',color=cat?'url(#coffee)':tuna?'url(#blue)':'url(#glass)';return p('M23 46 8 29 11 62 25 56Z',color)+p(cat?'M21 43q18-24 48-12 18 8 11 24-18 21-53 6Z':'M23 45q19-27 43-18 20 8 16 23-9 24-37 20Z',color)+p(tuna?'m39 31 17-17 6 17m-17 34 20 13-7-17':'m39 34 10-13 11 13m-20 32 14 9 8-12',color)+e(71,42,3,3,C.cream,'stroke-width="1.5"')+e(71,42,1.3,1.6,ink,'stroke="none"')+line('M61 38q-5 12 1 19','#7b8a7b',1.5)+light('M33 42q9-7 20-5',2.8)+(cat?line('M76 52q18 5 16 14m-16-12q14 9 10 17','#8b7156',1.7):line('M36 56q9 5 18 1','#dce4c7',2));}
 if(name==='三文鱼')return p('M20 28q24-17 49-3 17 11 13 30-1 21-27 28-28 8-41-11-9-14 6-44Z','url(#red)')+p('M23 34q21-15 43-4 16 9 11 26-4 17-24 21-23 4-32-10-9-10 2-33Z','url(#chicken)')+line('M29 37q12 3 16 19 4 16 15 16M40 31q11 7 13 19 3 12 18 14M25 49q10 3 10 16m22-31 10 10','#fff0ce',3.2)+light('M28 37q8-4 14-3',2.7);
 if(name==='生蚝')return p('M29 26q-10-1-10 9-14 6-8 18-6 14 8 18 1 13 17 13 9 7 20-2 16 0 19-14 14-8 6-20 7-13-7-20-4-14-19-10-17-5-26 8Z','#b8b8a4')+p('M31 33q-12 6-13 22 4 20 25 22 24 1 32-22 3-19-19-26-14-1-25 4Z','url(#garlic)')+p('M39 40q16-12 25 2 6 10-4 19-14 13-25 1-8-11 4-22Z','#d8c69b')+light('M24 46q2-8 8-10m9 10 8-2',2.8)+line('m13 53 7-1m0 20 6-5m49-37-5 6','#8f947f',1.8);
 if(name==='海螺')return p('M17 52 12 29l17 5 1-21 17 11 12-12 6 19 17 5-7 18 7 15-20 6q-28 15-43-2Z','url(#wood)')+p('M40 34q20-12 32 6 13 22-9 36-26 15-40-9-6-16 8-25 15-10 26 4 9 12-2 20-15 8-19-5-2-9 6-11 9-1 8 7','none','stroke="#a6784e" stroke-width="4"')+light('M27 29 31 37m17-11 6 7',2.5);
 if(name==='肥蟹')return crab(false);if(name==='帝王蟹')return crab(true);
 if(name==='龙虾')return p('M40 35q8-6 16 0l8 26-7 18H39l-7-18Z','url(#red)')+p('m39 73-12 10 8 7 13-5 13 5 8-7-12-10Z','url(#red)')+line('M36 49h24m-22 9h21m-19 9h17','#b56853',1.8)+p('m37 41-13-8-6 11-9-7 2-13 8-5 12 9 10 7Z','url(#red)')+p('m59 41 13-8 6 11 9-7-2-13-8-5-12 9-10 7Z','url(#red)')+line('M42 35 29 12m25 23 13-23','#b37a58',1.8)+e(42,38,2,2,ink,'stroke="none"')+e(54,38,2,2,ink,'stroke="none"')+light('M42 45v14',2.5);
 return null;
}
function dairy(name){
 if(name==='纯牛奶')return p('M67 30q23-5 21 14-1 20-19 18','url(#glass)')+p('M23 19h42l6 56q0 12-25 12T21 75Z','url(#glass)')+p('M26 36h36l5 37q0 8-21 8T25 73Z','url(#garlic)','stroke-width="1.5"')+e(44,20,21,7,'#edf0d7')+e(44,36,18,5,'#fff9df','stroke="#d7d4b4" stroke-width="1.3"')+p('m23 19-10-6 8 15Z','url(#glass)')+light('M30 42v24',3);
 if(name==='黄油')return p('M12 55 61 40l24 14-2 19-49 14-22-16Z','url(#wood)')+p('M23 33 61 22l19 14-1 31-38 13-18-16Z','url(#egg)')+p('m23 33 18 14 39-11-19-14Z','#ffe7ad')+line('M41 47v33','#d9b26b',1.8)+light('m29 33 31-8',2.4);
 if(name==='芝士片')return [0,1,2].map(i=>t(p('M17 26 61 16l19 30-41 17L13 48Z','url(#egg)')+e(35,35,5,3,'#dcb169','stroke-width="1.2"')+e(56,31,4,3,'#dcb169','stroke-width="1.2"')+e(53,47,5,3,'#dcb169','stroke-width="1.2"'),`translate(${i*1.5} ${i*10+3})`)).join('');
 if(name==='奶油')return smallBowl('url(#glass)')+p('M23 41q-2-11 12-13-3-10 12-12 7-1 10-8 7 12 10 15 13 4 7 13 9 8-1 14-24 14-49 0-8-4-1-9Z','url(#garlic)')+line('M34 30q14 8 29-2M28 42q20 10 42-2','#ddccac',1.7);
 if(name==='酸奶')return r(25,27,46,57,8,'url(#glass)')+p('M29 40h38v33q0 7-19 7t-19-7Z','url(#garlic)','stroke-width="1.4"')+e(48,29,23,8,'#fff6dd')+r(27,17,42,10,3,'url(#wood)','stroke-width="1.8"')+leaf(62,31,.45,65)+light('M33 47v20',2.7);
 if(name==='奶酪')return p('M16 36 47 18l34 20v37l-35 12-30-17Z','url(#egg)')+p('m16 36 31-18 34 20-35 13Z','#ffe7ad')+p('M46 51v36L16 70V36Z','#f3d487')+e(34,54,5,6,'#d2a763','stroke-width="1.3"')+e(63,62,6,5,'#d2a763','stroke-width="1.3"')+e(58,37,4,2.6,'#d2a763','stroke-width="1.3"')+light('m21 37 21 10',2.6);
 if(name==='炼乳')return r(21,28,54,52,4,'url(#blue)')+e(48,28,27,9,'#e8e4c6')+e(48,29,22,5,'url(#garlic)','stroke-width="1.5"')+r(28,46,40,20,2,'#f8ecd0','stroke-width="1.3"')+p('M47 16q10-7 16 1 2 6-9 11l-7 18-5-2 7-18q-8-5-2-10Z','url(#wood)','stroke-width="1.6"')+light('M28 37v22',2.6);
 return null;
}
function grain(name){
 if(name==='大米'||name==='燕麦')return smallBowl(name==='大米'?'url(#bowl)':'url(#wood)')+Array.from({length:17},(_,i)=>e(25+i%5*11,35+Math.floor(i/5)*8,4.4,name==='大米'?2:3.5,name==='大米'?'#fff2cf':'#e7c997',`stroke="#cfb584" stroke-width="1.1" transform="rotate(${i%3*30-30} ${25+i%5*11} ${35+Math.floor(i/5)*8})"`)).join('');
 if(name==='面粉')return p('M24 23h47l-5 14 10 38q-1 11-27 11T20 75l10-38Z','url(#wood)')+p('M24 23 31 13h34l6 10Z','#f5dfaf')+r(31,44,32,25,3,'url(#garlic)','stroke-width="1.6"')+p('M37 61q1-9 10-10 10-1 13 10Z','#fdf4d6','stroke-width="1.4"')+light('M28 45 25 63',2.5);
 if(name==='软面团')return p('M14 60q2-28 31-35 28-5 38 23 10 29-18 36-36 9-49-9Z','url(#rice)')+line('M33 44q10-8 21-6m-30 22q3-7 8-9','#d6bc8c',1.7)+light('M24 45q8-11 19-11',3.7);
 if(name==='吐司')return p('M23 36q-10-21 15-25 7-9 17-2 24-4 24 16 13 6 7 21v38H24V47q-11-5-1-11Z','url(#roast)')+p('M31 37q-9-17 12-19 8-7 14 0 18-2 14 16 10 3 7 10v32H32V44q-7-2-1-7Z','url(#garlic)')+light('M37 32q0-7 8-8',2.8);
 if(name==='面包胚')return p('M13 54q1-29 36-32 33 2 35 31v18q-34 21-71 0Z','url(#wood)')+e(48,56,35,14,'url(#wood)')+line('M16 63q34 14 65 0','#b88b58',1.8)+light('M26 39q10-9 23-8',3.2)+line('m37 39 3-1m16-3 3 1m5 10 3 1m-37 2 3-1','#fff0c8',2.2);
 if(name==='米粉浆')return smallBowl('url(#bowl)')+e(48,43,26,7,'#fff3d6','stroke="#d8c39c" stroke-width="1.2"')+p('m66 27 16-20 5 3-18 22Z','url(#wood)','stroke-width="1.5"')+e(63,34,10,5,'url(#garlic)','transform="rotate(-30 63 34)" stroke-width="1.5"');
 if(name==='糯米团')return [[30,56],[66,56],[48,32]].map(([x,y])=>e(x,y,19,18,'url(#garlic)')+light(`M${x-9} ${y-5}q3-6 8-5`,2.8)).join('');
 if(name==='酥皮')return [2,1,0].map(i=>t(p('M14 34 55 19l29 25-39 18Z','url(#wood)')+p('m14 34 31 21 39-11v9L44 72 14 48Z','url(#egg)')+line('m19 43 26 18 34-12','#c99d60',1.4),`translate(0 ${i*8})`)).join('')+light('m25 35 25-9',2.5);
 return null;
}
function sweet(name){
 if(name==='砂糖')return smallBowl('url(#wood)')+p('M20 40q10-21 29-20 21 1 28 22-26 17-57-2Z','url(#garlic)')+line('m33 32 1 1m12-5 1 1m9 8 1 1m-17 8 1 1m22-6 1 1','#d3bc95',1.5);
 if(name==='冰糖')return [[34,29,1],[62,36,.8],[32,62,.9],[65,67,1]].map(([x,y,s])=>t(p('M-12-11 5-16 15-5 12 12-5 16-16 4Z','url(#garlic)')+line('M-12-11 0-3 15-5M0-3-5 16','#d4c4a6',1.5),`translate(${x} ${y}) scale(${s})`)).join('');
 if(name==='糖浆')return bottle('url(#tea)',{shape:'slim'})+p('M40 14h19l8 8-5 4-11-8H40Z','url(#wood)','stroke-width="1.5"');
 if(name==='蜂蜜')return bottle('url(#gold)',{shape:'round'})+p('m59 20 17-11 6 10-17 9Z','url(#wood)','stroke-width="1.6"')+line('m72 12 6 9m-10-6 6 9m-10-5 6 9','#b58a53',1.5);
 if(name==='焦糖')return r(24,31,48,48,9,'url(#glaze)')+e(48,31,24,8,'#a47147')+p('M25 36q6-7 12 0 6 10 11 0 7-7 13 0 4 9 9 2v9q-8 9-13 0-5-8-10 0-9 8-15-2-3-6-7-1Z','#e9ba7f','stroke-width="1.4"')+r(27,23,42,8,3,'url(#wood)')+light('M31 49v16',2.7);
 if(name==='糖豆')return smallBowl('url(#bowl)')+[[28,36,C.red],[45,29,C.yellow],[65,36,C.green],[37,47,C.purple],[58,49,C.orange]].map(([x,y,color],i)=>t(r(-8,-4,16,9,4,color,'stroke-width="1.5"')+light('m-4-1h4',1.5),`translate(${x} ${y}) rotate(${i%2?-25:20})`)).join('');
 if(name==='巧克力')return p('M14 30 65 17l18 19-8 40-52 12-14-16Z','url(#coffee)')+p('m14 30 18 17 51-11-18-19Z','#ac8056')+line('m32 47-9 41m18-46-6 40m22-44-8 40m-39-12 51-12m-48 25 51-12','#6b4d39',2)+light('m20 30 41-11',2.4);
 if(name==='棉花软糖')return [[29,37,-15],[61,32,10],[46,65,7]].map(([x,y,a],i)=>t(r(-17,-16,34,32,8,i===1?'url(#pink)':'url(#garlic)')+e(0,-13,15,5,i===1?'#f0d5d3':'#fff4da','stroke-width="1.6"')+light('M-11-5v12',2.8),`translate(${x} ${y}) rotate(${a})`)).join('');
 if(name==='黑糖珍珠')return smallBowl('url(#bowl)')+pearls(8,35);
 return null;
}
export function material(name){
 const upgraded=subject(name,{smallBowl,cup,bean,iceCube,bottle});if(upgraded)return upgraded;
 let body=vegetable(name)||fruit(name)||seafood(name)||dairy(name)||grain(name)||sweet(name);if(body)return body;
 if(name==='皮蛋')return e(38,43,23,29,'url(#coffee)')+light('M24 34q2-11 10-14',3.2)+e(61,64,24,18,'#97764f','transform="rotate(-20 61 64)"')+e(61,64,16,12,'#8c9b68','stroke="#6f7b52" stroke-width="1.7" transform="rotate(-20 61 64)"')+e(62,63,9,7,'#b5ba80','stroke-width="1.2"');
 if(name==='香草籽')return smallBowl('url(#bowl)')+Array.from({length:18},(_,i)=>e(25+i%6*9,34+Math.floor(i/6)*8,2.3,1.6,'#7f6147','stroke-width=".9"'))+p('M17 74q20-14 61-14-29 13-61 14Z','url(#vanilla)');
 if(name==='香草精')return bottle('url(#coffee)',{shape:'square',label:true})+p('M39 58q8-11 16-8-1 11-14 12Z','url(#vanilla)','stroke-width="1.4"');
 if(name==='混合香叶')return leaf(40,66,1.8,-40)+leaf(58,68,1.7,30)+leaf(46,64,1.5,4)+leaf(63,63,1.1,60)+r(35,67,27,8,2,'url(#wood)','transform="rotate(-10 48 70)" stroke-width="1.7"');
 if(name==='咖啡豆')return [[30,35,1,30],[62,32,1.1,-25],[49,55,1,15],[29,70,.85,-15],[72,67,.9,40]].map(a=>bean(...a)).join('');
 if(name==='浓缩咖啡')return t(cup({color:'url(#coffee)',paper:true,shell:'url(#bowl)',handle:false,beans:true}),'translate(5 8) scale(.88)');
 if(name==='原味咖啡')return cup({color:'url(#coffee)',paper:true,shell:'url(#tomato)',handle:false});
 if(name==='便携咖啡')return cup({paper:true,shell:'url(#pink)',handle:false,lid:true});
 if(name==='冰咖啡')return milkTea({color:'url(#coffee)'})+iceCube(40,40,.45)+iceCube(56,49,.4)+iceCube(44,59,.35);
 if(name==='深烘咖啡')return cup({color:'url(#coffee)',shell:'url(#coffee)',handle:true,beans:true});
 if(name==='美式咖啡')return cup({color:'url(#coffee)',shell:'url(#bowl)',handle:true,saucer:true});
 if(name==='大杯美式')return cup({color:'url(#coffee)',shell:'url(#enamel)',paper:true,large:true,handle:false,lid:true});
 if(name==='摩卡咖啡')return cup({color:'url(#coffee)',shell:'url(#glass)',handle:true,cream:true})+line('m38 23 3 1m11-7 3 1m5 8 3 1','#97704e',1.8);
 if(name==='茶叶')return p('M18 62q3-15 22-19l27-26 8 5-28 29q-6 23-29 25Z','url(#wood)')+leaf(34,56,.65,-40)+leaf(44,58,.55,20)+leaf(28,65,.5,70)+leaf(48,49,.55,80);
 if(name==='绿茶')return cup({color:'url(#green)',shell:'url(#enamel)',saucer:true,handle:false});
 if(name==='红茶')return cup({color:'url(#tea)',shell:'url(#glass)',saucer:true,handle:true});
 if(name==='乌龙茶')return cup({color:'url(#tea)',shell:'url(#wood)',handle:false});
 if(name==='花茶')return milkTea({color:'url(#glass)',straw:false})+e(43,50,6,4,'#e5b3bd','stroke-width="1.3"')+e(55,62,6,4,'#e5b3bd','stroke-width="1.3"')+leaf(50,56,.4,70);
 if(name==='香草绿茶')return milkTea({color:'url(#green)',foam:true,straw:false,garnishType:'leaf'})+p('m59 26 16-20 4 4-16 19Z','url(#vanilla)','stroke-width="1.5"');
 if(name==='冰块')return iceCube(34,61,.9)+iceCube(64,58,.9)+iceCube(49,30,.95);
 if(name==='矿泉水')return bottle('url(#blue)',{shape:'slim',cap:C.blue})+line('M29 56h38m-38 8h38m-38 8h38','#d7e8d8',1.7);
 if(name==='苏打水')return milkTea({color:'url(#glass)',straw:false})+[[41,48,2],[55,60,2.5],[45,69,1.5],[56,45,1.4]].map(([x,y,rr])=>e(x,y,rr,rr,'#e9eedc','stroke="#95b3ad" stroke-width="1"')).join('');
 if(name==='姜汁水')return milkTea({color:'url(#tea)',straw:false})+p('M61 69q-2-10 5-13 6-2 8 5 8-4 11 3 3 7-5 9 4 8-3 10-7 1-8-6-11 5-12-2Z','url(#wood)','stroke-width="1.7"');
 if(name==='汤力水')return bottle('url(#glass)',{shape:'slim',cap:C.wood});
 if(name==='可乐')return bottle('url(#coffee)',{shape:'slim',cap:C.red})+r(28,51,39,19,3,'url(#red)','stroke-width="1.4"');
 if(name==='能量汽水')return r(27,12,43,74,7,'url(#green)')+e(48.5,16,21.5,6,'#e2dcc0')+e(48,16,8,2.5,'#9eaa87','stroke-width="1.3"')+p('m50 31-14 23h13l-3 17 17-25H50Z','url(#egg)','stroke-width="1.5"')+light('M34 30v29',2.6);
 if(name==='朗姆酒')return bottle('url(#tea)',{shape:'round',cap:C.wood,label:true});
 if(name==='威士忌')return bottle('url(#tea)',{shape:'square',cap:C.gold})+r(39,5,18,10,3,'url(#gold)','stroke-width="1.6"');
 if(name==='伏特加')return bottle('url(#blue)',{shape:'slim',cap:'#c9ccb4'});
 if(name==='龙舌兰')return p('M40 11h16v24q18 8 20 24 2 19-13 27H33q-15-8-13-27 2-16 20-24Z','url(#enamel)')+r(38,8,20,8,2,'url(#wood)','stroke-width="1.7"')+line('M32 49q1 17 8 29m8-39v43m16-33q-1 17-8 29','#e1e5c0',2.5);
 if(name==='金酒')return bottle('url(#darkGreen)',{shape:'square',cap:C.wood})+line('M27 45v28m42-28v28m-34-34v38m26-38v38','#a8c38c',1.7);
 if(name==='红葡萄酒')return bottle('url(#onion)',{shape:'slim',cap:C.red})+r(30,54,35,18,2,'url(#bowl)','stroke-width="1.3"');
 throw new Error(`Missing native material artwork: ${name}`);
}

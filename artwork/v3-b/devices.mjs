import {C,p,e,r,line,light,t,leaf,mixer,steamer,fridge,defs} from './primitives.mjs';
import {bean} from './materials.mjs';

const mini=(body,x,y,s=.25)=>t(body,`translate(${x} ${y}) scale(${s}) translate(-48 -48)`);
const wheel=x=>e(x,81,7,7,'#9f8261')+e(x,81,2.5,2.5,'#f6e8be','stroke-width="1.4"');
const knob=(x,y)=>e(x,y,3.3,3.3,'url(#wood)','stroke-width="1.4"')+line(`m${x} ${y-1.5}v3`,'#fff0ca',1.2);
const bottle=(x,y,color=C.green)=>r(x+3,y,5,5,1,'url(#wood)','stroke-width="1"')+p(`M${x+3} ${y+5}h5v6l3 3v13H${x}V${y+14}l3-3Z`,color,'stroke-width="1.2"')+light(`M${x+3} ${y+15}v8`,1.2);
const jar=(x,y,color=C.pink)=>r(x,y+6,15,20,3,color,'stroke-width="1.4"')+r(x+1,y,13,7,2,'url(#wood)','stroke-width="1.3"')+light(`M${x+4} ${y+12}v8`,1.4);
const counter=(color='url(#wood)')=>p('M12 48h72v28H12Z',color)+p('M9 43h78v9H9Z','url(#wood)')+r(18,58,25,13,2,'url(#bowl)','stroke-width="1.5"')+r(52,58,25,13,2,'url(#bowl)','stroke-width="1.5"')+line('m28 63h6m28 0h6','#a78154',1.5)+p('m16 76-2 10h8l3-10m46 0 3 10h8l-2-10Z','url(#wood)');

function cart(level,kind,raw){
 const veg=kind==='vegetable-cart',fruit=kind==='fruit-cart',beast=kind==='beast-meat-cart',poultry=kind==='poultry-cart';
 const goods=veg?['番茄','胡萝卜','西兰花']:fruit?['苹果','葡萄','甜橙']:beast?['香肠','五花肉','排骨']:['鸡蛋','鸡胸肉','鸡腿'];
 let b=p('M13 49h65v27H13Z',veg?'url(#enamel)':'url(#wood)')+p('M10 44h72v9H10Z','url(#wood)')+r(19,57,54,14,2,'url(#bowl)','stroke-width="1.6"')+wheel(25)+wheel(65)+line('M80 53h8v-9',C.darkWood,3.2);
 for(let i=0;i<3;i++)b+=mini(raw(goods[i]),27+i*21,39,.26);
 if(level>=2){b=p('M18 35V17h55v18','none','stroke-width="3"')+r(16,16,61,7,2,'url(#wood)')+b+mini(raw(goods[0]),31,25,.2)+mini(raw(goods[1]),58,25,.2)+line('M47 23v18',C.darkWood,1.7);}
 if(level===3){b=t(b,'translate(2 7) scale(.92)')+p('M12 16q31-8 66 0l7 14q-8 5-15 0-8 6-15 0-8 6-15 0-8 6-15 0-8 5-14 0Z','url(#bowl)')+p('m25 12 14-1 1 19q-8 6-15 0Zm30-1 13 1 2 18q-8 6-15 0Z',beast?'url(#red)':'url(#enamel)','stroke="none"')+line('M12 30q6 5 13 0 7 6 15 0 7 6 15 0 7 6 15 0 7 5 15 0',C.darkWood,2.1)+r(51,56,21,15,2,'url(#glass)','stroke-width="1.6"');}
 return b;
}
function crate(level,kind,raw){
 const fruit=kind==='fruit-cart',grain=kind==='grain-box',spice=kind==='spice-box';
 const goods=fruit?['苹果','葡萄','甜橙']:grain?['大米','面粉','燕麦']:['红椒','大蒜','罗勒'];
 let b=p('M12 45 26 35h52l9 10-7 34H19Z','url(#wood)')+r(20,48,58,24,2,'url(#bowl)','stroke-width="1.7"')+line('M40 49v23m18-23v23',C.darkWood,1.5)+line('M17 76h62',C.darkWood,2.2);
 goods.forEach((g,i)=>b+=mini(raw(g),28+i*21,41,.28));
 if(level>=2){b=t(b,'translate(0 7) scale(1 .9)')+r(20,13,59,29,4,'url(#wood)')+r(25,18,48,18,2,'url(#bowl)','stroke-width="1.4"')+mini(raw(goods[0]),37,27,.23)+mini(raw(goods[2]),63,27,.23);}
 if(level===3)b=t(b,'translate(0 7) scale(1 .9)')+r(12,8,72,9,3,'url(#wood)')+p('M13 16v57m70-57v57','none','stroke-width="3"')+r(31,73,34,12,2,'url(#wood)')+r(44,77,8,3,1,C.cream,'stroke-width="1.2"');
 return b;
}
function seafoodFridge(level,raw){
 let b=p('M12 38 28 27h51l8 12-9 42H19Z','url(#blue)')+p('M12 38 28 27h51l8 12-20 13H29Z','url(#glass)')+p('M22 39 33 32h39l6 7-13 8H32Z','#e9edd8','stroke-width="1.4"')+mini(raw('鳕鱼'),48,37,.45)+r(21,58,56,13,2,'url(#glass)','stroke-width="1.6"')+r(19,78,9,9,2,C.darkWood)+r(68,78,9,9,2,C.darkWood);
 if(level>=2)b=p('M19 29 24 11h54l6 18Z','url(#blue)')+p('M27 23 30 15h40l5 8Z','#d6e4d0','stroke-width="1.5"')+b+mini(raw('鲜虾'),66,40,.24);
 if(level===3)b=t(b,'translate(-3 4) scale(.96)')+p('M75 34h12v45H72Z','url(#wood)')+r(73,48,13,17,2,'url(#bowl)','stroke-width="1.5"')+mini(raw('海螺'),79,38,.2)+r(18,8,61,6,2,'url(#wood)','stroke-width="1.7"');
 return b;
}
function sweets(level){
 let b=counter('url(#pink)')+jar(23,20,'url(#red)')+jar(48,20,'url(#egg)')+line('M32 33h2m25 0h2',C.cream,3);
 if(level>=2)b=p('M19 46V13h58v33','none','stroke-width="3"')+r(17,11,63,6,2,'url(#wood)')+b+jar(25,7,'url(#onion)')+jar(52,7,'url(#green)');
 if(level===3)b=t(b,'translate(2 5) scale(.94)')+p('M11 12 20 5h57l8 7v8H11Z','url(#pink)')+line('M16 20h64',C.cream,2.2)+r(29,57,39,14,2,'url(#glass)','stroke-width="1.6"');
 return b;
}
function cutting(level,raw){
 let b=r(14,28,67,47,6,'url(#wood)')+e(22,36,3,3,'url(#bowl)','stroke-width="1.5"')+p('m61 23 10-12 9 6-8 13-14 13-11-7Z','url(#glass)')+p('m61 23 10-12 9 6-8 13Z','url(#wood)')+mini(raw('黄瓜'),38,55,.34)+leaf(57,61,.5,75)+line('m34 67 7-2',C.darkWood,1.4);
 if(level>=2)b=t(b,'translate(-3 -4) scale(.96)')+e(69,68,17,8,'url(#bowl)')+mini(raw('大蒜'),69,65,.2)+r(22,77,52,8,2,'url(#wood)');
 if(level===3)b=counter('url(#enamel)')+t(b,'translate(10 -5) scale(.8)')+p('M17 32V13h62v19','none','stroke-width="3"')+mini(raw('罗勒'),65,26,.25);
 return b;
}
function press(level,raw){
 let b=counter('url(#enamel)')+p('M23 38 28 25h23l5 13Z','url(#wood)')+r(25,36,28,7,2,'url(#wood)')+p('M29 25q11-22 19 0Z','url(#egg)')+line('M37 11v13',C.darkWood,1.3)+mini(raw('甜橙'),68,39,.28);
 if(level>=2)b=p('M20 41V18h40v23','none','stroke-width="3"')+r(18,15,45,8,3,'url(#enamel)')+b+r(60,28,14,16,2,'url(#glass)','stroke-width="1.6"')+e(67,29,7,2.5,'url(#egg)','stroke-width="1"');
 if(level===3)b=t(b,'translate(-1 5) scale(.94)')+p('M67 32 72 19h9l5 13Z','url(#wood)')+p('M72 20q5-15 9 0Z','url(#egg)')+r(15,8,69,8,3,'url(#wood)')+leaf(76,15,.35,50);
 return b;
}
function pot(level,raw){
 let b=mini(raw('device:home-cooking-pot'),48,43,.85)+p('M16 74h65l-5 11H22Z','url(#wood)')+line('M27 78h40',C.darkWood,1.6);
 if(level>=2)b=t(b,'translate(-3 -3) scale(.98)')+r(26,75,43,11,3,'url(#enamel)')+knob(37,81)+knob(57,81)+p('m29 72 5-6 5 6m14 0 5-6 5 6','url(#egg)','stroke-width="1.4"');
 if(level===3)b=t(b,'translate(-7 4) scale(.9)')+mini(raw('device:home-cooking-pot'),75,57,.38)+p('M13 71h74v15H13Z','url(#wood)')+knob(32,79)+knob(65,79);
 return b;
}
const pan=(x=48,y=40,s=1,wok=false)=>t((wok?p('M-26-7h52q-1 27-26 28T-26-7Z','url(#darkGreen)'):p('M-28-5q27-17 56 0l-1 10q-26 16-53 0Z','url(#enamel)'))+e(0,-6,wok?26:28,wok?8:12,wok?'#a4b780':'#839a6e')+p('m22-10 24-20 5 6-26 22Z','url(#wood)','stroke-width="1.8"')+light('M-20 2q5 8 12 9',2.2),`translate(${x} ${y}) scale(${s})`);
function stove(level,wok=false){
 let b=p('M17 49h62v28H17Z',wok?'url(#red)':'url(#enamel)')+p('M14 43h69v10H14Z','url(#wood)')+knob(32,65)+knob(65,65)+r(19,77,7,9,2,C.darkWood)+r(69,77,7,9,2,C.darkWood)+pan(47,38,.95,wok);
 if(level>=2)b=p('M11 48h74v30H11Z',wok?'url(#red)':'url(#enamel)')+p('M8 42h80v10H8Z','url(#wood)')+pan(31,37,.65,wok)+pan(65,36,.65,wok)+knob(29,64)+knob(66,64)+r(15,78,8,9,2,C.darkWood)+r(74,78,8,9,2,C.darkWood);
 if(level===3)b=p('M13 42V13h70v29','none','stroke-width="3"')+r(11,10,75,7,2,'url(#wood)')+b+line('M25 19v15m12-15v15m-16 0h8m4 0h8',C.darkWood,2.2)+bottle(52,18,'url(#egg)')+bottle(69,18,'url(#red)');
 return b;
}
function grill(level){
 let b=p('M15 41h67v30H15Z','url(#red)')+r(11,31,75,17,4,'url(#coffee)')+e(48,36,31,5,'#5f5848','stroke-width="1.5"')+line('M24 32v8m10-10v12m10-12v13m10-13v13m10-12v11m10-9v8','#b7b4a0',1.8)+p('m20 71-4 15h10l7-15m33 0 5 15h10l-5-15Z','url(#wood)')+line('M17 55h64m-64 9h64M32 48v7m22 0v9m12-16v7','#b56851',1.6);
 if(level>=2)b=t(b,'translate(-3 0) scale(.94 1)')+r(75,45,14,7,2,'url(#wood)','stroke-width="1.8"')+line('M82 53v28',C.darkWood,2.7)+r(17,73,54,8,2,'url(#wood)');
 if(level===3)b=p('M15 32V18h67v14','none','stroke-width="3"')+p('M16 21 29 9h41l13 12Z','url(#red)')+r(56,5,13,10,2,'url(#coffee)','stroke-width="1.6"')+b+line('M27 22v10m11-10v10m-14 1h6m5 0h6',C.darkWood,1.8);
 return b;
}
function oven(level,microwave=false){
 const shell=microwave?'url(#pink)':'url(#purple)';let b=r(12,23,74,56,7,shell)+r(18,31,48,37,4,'#706c59','stroke-width="1.8"')+r(23,36,38,27,2,'url(#glass)','stroke-width="1.5"')+r(21,44,42,4,1,'url(#wood)','stroke-width="1.4"')+knob(76,38)+knob(76,58)+r(18,79,9,7,2,C.darkWood)+r(71,79,9,7,2,C.darkWood)+light('M17 28h43',2.7);
 b+=p('M30 55q0-10 10-10 10 0 11 10Z','url(#wood)','stroke-width="1.4"');
 if(level>=2)b=t(b,'translate(0 7) scale(1 .9)')+r(18,12,60,12,3,shell)+r(24,15,34,5,2,'url(#glass)','stroke-width="1.3"')+knob(68,18)+r(22,50,40,3,1,C.darkWood,'stroke-width="1"');
 if(level===3)b=t(b,'translate(2 3) scale(.94)')+p('M13 20V7h69v13','none','stroke-width="2.8"')+r(11,6,74,7,2,'url(#wood)')+jar(21,1,'url(#egg)')+jar(57,1,'url(#green)');
 return b;
}
function iceMachine(level){
 let b=r(24,15,49,64,7,'url(#pink)')+r(31,22,35,25,3,'url(#bowl)','stroke-width="1.7"')+e(48,34,8,8,'url(#garlic)','stroke-width="1.6"')+p('M45 44h7v14h-7Z','url(#wood)','stroke-width="1.6"')+p('M37 57h23l-12 27Z','url(#wood)','stroke-width="1.7"')+p('M36 57q-4-8 4-11-2-6 7-8 4-1 4-5 4 6 10 12 7 6 0 12Z','url(#garlic)','stroke-width="1.7"')+r(19,79,60,7,2,'url(#wood)');
 if(level>=2)b=t(b,'translate(-5 0) scale(.94)')+r(68,20,14,53,3,'url(#bowl)')+knob(75,32)+p('M73 44h5v13h-5Z','url(#wood)','stroke-width="1.5"')+p('M70 58h12l-6 17Z','url(#wood)','stroke-width="1.5"');
 if(level===3)b=t(b,'translate(0 5) scale(.96)')+r(16,7,68,12,3,'url(#wood)')+e(31,7,10,5,'url(#garlic)','stroke-width="1.5"')+e(51,7,10,5,'url(#pink)','stroke-width="1.5"')+e(72,7,10,5,'url(#coffee)','stroke-width="1.5"');
 return b;
}
function bar(level){
 let b=counter('url(#enamel)')+p('M28 23h14l4 20H25Z','url(#glass)','stroke-width="1.7"')+e(35,23,7,3,'#e7ead0','stroke-width="1.3"')+p('M54 23h12l4 20H51Z','url(#wood)','stroke-width="1.7"')+r(56,17,8,7,2,'url(#wood)','stroke-width="1.5"')+p('M72 27h12l-5 8v8h-3v-8Z','url(#glass)','stroke-width="1.5"')+leaf(25,27,.35,-30);
 if(level>=2)b=p('M15 43V15h69v28','none','stroke-width="3"')+r(13,12,74,7,2,'url(#wood)')+b+bottle(19,18,'url(#onion)')+bottle(68,18,'url(#tea)')+line('M44 20v9m-5-9q5 9 10 0',C.darkWood,1.7);
 if(level===3)b=t(b,'translate(-2 7) scale(.96)')+p('M70 39h18v42H70Z','url(#wood)')+r(73,48,12,20,2,'url(#glass)','stroke-width="1.3"')+bottle(73,19,'url(#darkGreen)')+r(18,6,65,8,2,'url(#wood)')+line('m25 10h51','#ffebc1',1.6);
 return b;
}
export function device(family,level,raw){
 if(family==='vegetable-cart'||family==='beast-meat-cart'||family==='poultry-cart')return cart(level,family,raw);
 if(family==='fruit-cart'||family==='grain-box'||family==='spice-box')return crate(level,family,raw);
 if(family==='seafood-fridge')return seafoodFridge(level,raw);
 if(family==='dairy-fridge')return fridge(level,'dairy');
 if(family==='sweet-cabinet')return sweets(level);
 if(family==='drink-fridge')return fridge(level);
 if(family==='chopping-board')return cutting(level,raw);
 if(family==='fruit-press')return press(level,raw);
 if(family==='home-cooking-pot')return pot(level,raw);
 if(family==='frying-station')return stove(level,false);
 if(family==='charcoal-grill')return grill(level);
 if(family==='oven')return oven(level,false);
 if(family==='steamer')return steamer(level);
 if(family==='wok')return stove(level,true);
 if(family==='microwave')return oven(level,true);
 if(family==='blender')return mixer(level);
 if(family==='ice-cream-machine')return iceMachine(level);
 if(family==='bar')return bar(level);
 throw new Error(`Missing native device artwork: ${family} L${level}`);
}

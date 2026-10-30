// Opening dishes receive the same V4 food geometry and serving language as the full catalog.
import {C,p,e,r,line,light,t,leaf,plate,deepBowl,onionRing,tomatoWedge,lemonSlice,riceMarks} from './primitives.mjs';
const u=n=>'url(#'+n+')';
const mini=(body,x,y,s=.45,a=0)=>t(body,'translate('+x+' '+y+') rotate('+a+') scale('+s+') translate(-48 -48)');
const rice=()=>p('M20 61q0-29 29-29 29 0 29 29-29 25-58 0Z',u('rice'))+riceMarks();
const herbs=()=>leaf(71,65,.5,55)+line('m29 60 4-2m17 8 4-2',C.darkGreen,2.4);
const strips=()=>[0,1,2].map(i=>t(p('M-25-6q10-8 20-2l25 8q10 8 0 15-8 6-17 0L-25 5q-8-5 0-11Z',u('glaze'))+light('m-18-4 10 1',2),'translate('+(40+i*7)+' '+(35+i*17)+') rotate(-12)')).join('');
export function openingRecipe(name,raw){
 const food=(n,x=48,y=48,s=.5,a=0)=>mini(raw(n),x,y,s,a);
 if(name==='番茄小沙拉')return deepBowl(u('green'))+tomatoWedge(34,40,.95,-15)+tomatoWedge(63,47,.85,25)+leaf(43,57,.6,-30)+onionRing(59,58,.45);
 if(name==='胡萝卜花园')return plate()+[[29,47],[47,32],[68,48],[43,65]].map(([x,y])=>e(x,y,12,9,u('tomato'))+e(x,y,4,3,u('mango'),'stroke-width="1.3"')).join('')+leaf(64,35,.7,35)+herbs();
 if(name==='田园丰收碗')return deepBowl(u('bowl'))+food('西兰花',36,37,.52)+food('彩椒',63,47,.45);
 if(name==='草莓甜心杯')return p('M22 32h54l-8 40q-18 15-39 0Z',u('glass'))+p('M27 48h43l-4 20q-17 11-34 0Z',u('pink'),'stroke-width="1.4"')+p('M25 35q-4-11 8-10 1-9 12-5 10-7 18 1 14-2 12 12Z',u('garlic'))+food('草莓',36,26,.37,-15)+food('草莓',62,31,.34,15)+line('M33 51 36 64',C.white,3);
 if(name==='阳光鲜橙汁')return p('M23 19h46l-5 57q-18 15-36 0Z',u('glass'))+p('M29 35h34l-4 38q-12 9-25 0Z',u('mango'),'stroke-width="1.3"')+e(46,35,17,6,u('egg'),'stroke-width="1.3"')+p('m56 46 12-37 5 2-12 37Z',u('enamel'),'stroke-width="1.3"')+lemonSlice(69,26,.8)+light('M31 44 34 65',2.7);
 if(name==='缤纷水果盘')return plate()+food('西瓜',35,42,.58,-15)+food('葡萄',66,51,.43)+food('甜橙',47,63,.37)+food('草莓',24,66,.3,20);
 if(name==='凉拌紫洋葱')return plate()+[0,1,2].map(i=>onionRing(31+i*17,41+i%2*19,.88)).join('')+food('黄瓜',47,52,.55,-20)+herbs();
 if(name==='番茄炒蛋')return plate()+p('M15 48q5-10 14-3 1-13 15-8 14-12 24 0 17-7 18 9 10 10-6 16-10 13-27 7-13 12-21-2-17 4-17-19Z',u('egg'))+tomatoWedge(31,42,.85,-15)+tomatoWedge(60,59,.85,15)+herbs();
 if(name==='肉丸蔬菜汤')return deepBowl(u('tea'))+food('肉丸',39,37,.46)+tomatoWedge(65,48,.65)+leaf(50,54,.6,45)+line('M17 42q0-6 8-7',C.white,2);
 if(name==='蒜香西兰花')return plate()+food('西兰花',40,39,.63)+food('大蒜',69,61,.31)+leaf(30,69,.4,-25);
 if(name==='彩蔬拌饭')return deepBowl(u('rice'))+riceMarks()+p('m28 39 9-8 8 7-8 8Zm22 11 10-5 7 8-9 6Z',u('tomato'),'stroke-width="1.4"')+p('m47 31 9 3-4 9-10-3Z',u('egg'),'stroke-width="1.4"')+herbs();
 if(name==='葱香蛋饭')return plate()+rice()+p('M23 46q-3-14 12-13 9-10 19 0 16-6 22 8 8 19-17 18-14 9-23-1-17 4-13-12Z',u('garlic'))+e(49,42,13,12,u('egg'))+herbs();
 if(name==='香煎肉片')return plate()+strips()+onionRing(72,61,.66)+herbs();
 if(name==='蒜香黄瓜')return deepBowl(u('green'))+[0,1,2,3].map(i=>t(p('M-14-9 7-15 18 3 0 12-16 3Z',u('green'))+p('m-9-8 14-4 9 13-13 6-11-5Z',u('teaGreen'),'stroke-width="1.3"'),'translate('+(29+i%2*32)+' '+(35+Math.floor(i/2)*22)+') rotate('+(-15+i*10)+')')).join('')+food('大蒜',75,63,.25);
 if(name==='香煎鸡肉卷')return plate()+[0,1].map(i=>t(p('M-24-20 2-25 24 11q9 16-9 23L-15 5q-18-12-9-25Z',u('glaze'))+e(16,19,15,11,u('garlic'),'transform="rotate(30 16 19)"')+e(16,19,10,6,u('green'),'transform="rotate(30 16 19)" stroke-width="1.4"')+e(16,19,6,3,u('chicken'),'stroke-width="1.2"')+light('M-15-15 3 8',2.7),'translate('+(33+i*30)+' '+(40+i*12)+') rotate(-10) scale(.86)')).join('')+herbs();
 if(name==='橙香小排')return plate()+food('排骨',43,41,.71,-12)+lemonSlice(76,65,.8)+p('M21 70q20 10 38 4','none','stroke="#c48b4e" stroke-width="3"')+herbs();
 return null;
}

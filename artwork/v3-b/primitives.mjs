// Native B-style geometry. Palette, 2.4-unit warm outlines and simple highlights
// follow artwork/b/draw-new-masters.mjs; no raster imagery is embedded.
export const ink='#795438';
export const C={cream:'#fff0ce',bone:'#fff9e4',wood:'#d8b27a',darkWood:'#b58c5e',green:'#89ad58',darkGreen:'#628c47',lightGreen:'#b3cc74',red:'#d77c69',tomato:'#e98159',yellow:'#f3cd72',orange:'#e7a36a',blue:'#91b8c1',paleBlue:'#d6e6dc',pink:'#d3a7b3',purple:'#b980a7',brown:'#a6754d',darkBrown:'#76533f',white:'#fff9df'};
export const gradients={
 wood:['#e9ca93','#d8b27a','#c59b65'],green:['#b3cc74','#89ad58','#628c47'],darkGreen:['#8eb96a','#6e9955','#557e44'],enamel:['#c4d3a1','#a7bd88','#819d6d'],
 bowl:['#fff8de','#f4e8c5','#d9c49a'],bone:['#fff9e4','#f1dfbb','#e3caa3'],fat:['#fff6dc','#f6e4c3','#eed5b1'],
 tomato:['#f7aa77','#e98159','#cf654a'],red:['#ed9d85','#d77c69','#bd5f53'],pork:['#f7baa2','#eb987e','#d77b68'],chicken:['#ffdfba','#f3bb94','#df9c77'],
 roast:['#e7b583','#cb905f','#ae704b'],glaze:['#e7ab70','#c4854f','#a96841'],egg:['#ffeaae','#f3cd72','#dfab52'],rice:['#fff9db','#f6e6b1','#e5cd94'],
 onion:['#d1a7c3','#b980a7','#946184'],garlic:['#fff9df','#f5e5bd','#dbc99f'],cinnamon:['#d9a66f','#bc8855','#a56e45'],vanilla:['#b4875d','#926744','#795138'],
 meat:['#f2a583','#e48b6a','#ca7054'],gizzard:['#d99783','#ba7767','#9b5b51'],
 shell:['#fff5d9','#f4d6af','#d6a17b'],pepper:['#ed9b75','#dc785a','#c65f4b'],
 blue:['#d5e5da','#a8c9c8','#82abae'],glass:['#f5f5dc','#dce9cf','#aec7ba'],pink:['#f2d0c2','#dcaeaf','#bd8c9c'],purple:['#d6ccda','#b8a6c6','#9280ac'],
 gold:['#ffe5a6','#edc479','#cca05d'],coffee:['#c2986b','#99704c','#76533f'],tea:['#e7bc78','#c69958','#a57a42'],milkTea:['#ead0a3','#d2af7e','#b58b61'],
 berry:['#b1a9cf','#8b7eb1','#6f6397'],mango:['#ffe5a1','#efc373','#d9a15b'],coconut:['#b99570','#98724e','#795438']
};
export const defs=()=>Object.entries(gradients).map(([id,colors])=>`<linearGradient id="${id}" x1=".1" y1="0" x2=".85" y2="1"><stop stop-color="${colors[0]}"/><stop offset=".55" stop-color="${colors[1]}"/><stop offset="1" stop-color="${colors[2]}"/></linearGradient>`).join('')+'<linearGradient id="shine" x2=".7" y2="1"><stop stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="1" flood-color="#715739" flood-opacity=".2"/></filter>';
export const p=(d,fill='none',rest='')=>`<path d="${d}" fill="${fill}"${rest?' '+rest:''}/>`;
export const e=(cx,cy,rx,ry,fill,rest='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${rest?' '+rest:''}/>`;
export const r=(x,y,w,h,rx,fill,rest='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${rest?' '+rest:''}/>`;
export const line=(d,color=ink,width=1.7)=>p(d,'none',`stroke="${color}" stroke-width="${width}"`);
export const light=(d,width=3)=>line(d,'#ffe7bd',width);
export const t=(body,transform)=>`<g transform="${transform}">${body}</g>`;
export const leaf=(x,y,scale=1,angle=0)=>t(p('M0 4q-12-17 6-25 17 10-1 27Z','url(#green)')+line('M2 1 5-15','#628c47',1.5),`translate(${x} ${y}) rotate(${angle}) scale(${scale})`);
export const dot=(x,y,rad=2,color=C.darkGreen)=>e(x,y,rad,rad,color,'stroke="none"');
export const garnish=(variant=0)=>[leaf(76,61,.45,60),line('m27 61 4-2m24 6 4-2m-5-27 4 1','#82a15c',2.5),dot(32,48,1.5,C.green),dot(64,55,1.4,C.yellow)].slice(variant%2).join('');
export const plate=()=>e(48,64,39,20,'#dfc7a1')+e(48,59,39,22,'url(#bowl)')+e(48,57,32,16,'#f5e7c1','stroke="#d9bd92" stroke-width="1.5"')+line('M18 55q2-7 10-10','#fffcef',2.6);
export const deepBowl=(filling='url(#rice)')=>p('M13 43c1 25 14 40 35 40s34-15 35-40Z','url(#bowl)')+e(48,43,35,20,'#fff6d8')+e(48,43,29,14,filling,'stroke="#c4a476" stroke-width="1.5"')+light('M23 62q5 10 14 12',2.7);
export const lemonSlice=(x=74,y=65,s=.6)=>t(p('M-15 0a15 15 0 1 1 30 0Z','url(#egg)')+p('M-10 0a10 10 0 1 1 20 0Z','#f4cd83','stroke="#d6ac65" stroke-width="1.4"')+line('M0-10V0m-7-7 7 7m7-7-7 7','#fff1bd',1.4),`translate(${x} ${y}) rotate(20) scale(${s})`);
export const tomatoWedge=(x=40,y=50,s=.65,angle=0)=>t(p('M-15 3q2-22 22-17l8 20q-15 13-30-3Z','url(#tomato)')+p('M-9 2q2-13 12-12l5 13q-9 6-17-1Z','#f8ba82','stroke="none"')+line('m-4-2 2 1m5 0 2 1','#ffe2ac',2),`translate(${x} ${y}) rotate(${angle}) scale(${s})`);
export const onionRing=(x=46,y=48,s=1)=>t(e(0,0,15,8,'url(#onion)')+e(0,0,10,4.5,'#f5e4d5','stroke="#a46f91" stroke-width="1.5"'),`translate(${x} ${y}) rotate(-20) scale(${s})`);
export const grillMarks=(x=48,y=53,s=1)=>t(line('m-16-9 11 15m0-20 11 15m0-20 11 15','#91603f',2),`translate(${x} ${y}) rotate(-12) scale(${s})`);
export const riceMarks=()=>line('m29 47 4-2m8-6 4-1m13 0 4 1m7 9 4 2m-39 7 4 2m11-8 4 1m6 10 4-1m-18 3 4 1','#d2b786',1.7);

export function crab(king=false,cooked=false){
 const color=cooked?'url(#glaze)':'url(#red)';let legs='';
 for(const flip of [false,true]){let side='';for(let i=0;i<3;i++)side+=p(`M${31-i} ${48+i*6} ${15-i*3} ${42+i*9} ${8+i*2} ${54+i*10} ${11+i*2} ${58+i*10} ${20-i*1} ${48+i*8} ${31-i} ${55+i*4}Z`,color);
 side+=p('M30 43 23 30 12 29 8 18 15 11 21 17 20 23 28 23 36 37Z',color)+p('m11 13 6 6 3-7 6 8-6 9-8-1Z',color);
 legs+=flip?t(side,'translate(96 0) scale(-1 1)'):side;}
 let shell=p('M25 46q0-15 23-17 23 2 23 17l-4 21q-18 16-38 0Z',color)+e(48,45,18,10,cooked?'#d49b67':'#e69a81','stroke="none"')+light('M34 40q10-5 20-2',3)+line('m37 58 4 2m12-2 4 2','#b16350',1.6)+dot(38,30,2.5,C.darkBrown)+dot(58,30,2.5,C.darkBrown);
 if(king)shell+=p('m32 37 3-8 5 6 8-10 7 10 5-6 3 9','url(#red)','stroke-width="1.8"')+p('m28 51-6 2 6 4m40-6 6 2-6 4',color,'stroke-width="1.7"');
 return t(legs+shell,king?'translate(0 0)':'translate(7 7) scale(.85)');
}
export function milkTea({color='url(#milkTea)',pearls=false,foam=false,straw=true,garnishType=''}={}){
 let body=straw?p('m57 11 6 1-9 52-6-1Z','#e4b38c','stroke-width="1.7"'):'';
 body+=p('M24 28h48l-5 48q-1 10-19 10T29 76Z','url(#glass)')+p('M29 38h38l-4 36q-1 7-15 7t-15-7Z',color,'stroke-width="1.5"')+e(48,38,19,6,color,'stroke-width="1.5"');
 if(pearls)for(const [x,y,rr]of[[39,73,3.2],[48,76,3.2],[57,72,3.2],[43,66,2.8],[54,65,2.8]])body+=e(x,y,rr,rr,'#73533f','stroke-width="1.3"');
 if(foam)body+=p('M27 34q-2-7 5-9 2-7 10-3 7-5 12 1 10-2 14 5 6 3 2 10l-42 1Z','url(#garlic)')+light('m34 27 5-2m12 1 5 1',2);
 body+=light('M33 43 36 64',2.8)+line('M26 30q21 8 44 0','#c5d4b9',1.5);
 if(garnishType==='leaf')body+=leaf(66,29,.55,55);if(garnishType==='lemon')body+=lemonSlice(68,31,.7);
 return body;
}
export function bagel({salmon=false,onion=false}={}){
 const filling=salmon?'url(#red)':'url(#roast)';
 let body=p('M14 53q31-23 67-3l-4 19q-29 20-60 2Z','url(#roast)')+p('M15 51q30-20 65 1l-4 10q-28 16-58 0Z','url(#garlic)')+p('M18 51q12-10 21-3 9-8 16-1 11-7 23 5l-5 9q-13-6-21 0-11-6-18 0-10-5-16-4Z',filling)+p('M16 50q-2-23 30-26 31 0 35 23-1 16-33 17-29 0-32-14Z','url(#wood)')+e(48,43,12,6,'#a4764d')+e(48,46,9,4,filling,'stroke-width="1.7"');
 for(const [x,y] of [[27,42],[35,32],[46,30],[59,34],[70,43],[29,51],[65,52]])body+=line(`m${x} ${y} 3 1`,'#fff0c2',1.8);
 if(onion)body+=onionRing(34,58,.55)+onionRing(64,58,.5);if(salmon)body+=p('M18 55q10-8 19-1 9-9 18-2 11-8 23 0l-3 10q-10-6-20 0-9-6-18 1-10-6-18 0Z','url(#red)','stroke-width="1.8"')+p('M18 64q14 7 27 3 15 4 29-3l-1 5q-27 12-54 0Z','url(#garlic)','stroke-width="1.4"')+line('m25 58 11 3m21-2 11-2','#f8c2a4',2)+leaf(74,59,.4,80);
 return plate()+body;
}
export function mixer(level=1){
 let body=p('M20 66h56l4 16H17Z','url(#enamel)')+r(36,56,23,15,3,'url(#wood)')+p('M19 33h55q-2 31-27 31T19 33Z','url(#glass)')+e(47,33,28,9,'#e3e9d0')+e(47,33,22,5,'#f5ecd0','stroke="#aec2aa" stroke-width="1.5"')+p('m59 18 5 2-15 29-5-2Z','url(#wood)','stroke-width="1.7"')+line('M49 39q-10-6-10 3 0 7 8 10 10-2 11-9 0-7-9-4m-4 1 2 10m6-10-4 10','#94a99a',1.5)+light('M25 41q3 10 11 14',2.6)+e(47,75,4,3,'#f4dbad','stroke-width="1.6"');
 if(level>=2)body=r(20,14,52,10,5,'url(#enamel)')+r(60,18,12,47,3,'url(#enamel)')+body+e(66,52,3,3,'url(#wood)','stroke-width="1.4"');
 if(level===3)body=p('M11 65h75v19H11Z','url(#wood)')+t(body,'translate(6 -1) scale(.87)')+p('M15 47h20q-1 14-10 14T15 47Z','url(#glass)')+e(25,47,10,3.5,'url(#garlic)','stroke-width="1.4"')+r(40,75,19,5,2,C.cream,'stroke-width="1.4"');
 return body;
}
export function steamer(level=1){
 let body='';for(let n=0;n<level;n++){const y=70-n*17;body+=p(`M17 ${y-10}h62v15q-30 15-62 0Z`,'url(#wood)')+e(48,y-10,31,10,'#f2d8a0')+line(`M20 ${y+1}q28 10 56 0`,'#b88f5b',1.6);for(let x=25;x<78;x+=10)body+=line(`M${x} ${y-3}v10`,'#bd965f',1.2);}
 const top=60-(level-1)*17;body+=e(48,top,24,6,'#eed7a6','stroke="#b88f5b" stroke-width="1.3"');
 body+=t(e(0,0,29,10,'url(#wood)')+e(0,0,23,6,'#e6c68b','stroke="#bb935e" stroke-width="1.4"')+line('M-19-3 19-3m-21 4 40 0m-32-6 0 9m9-10v10m9-10v10','#bd965f',1.3)+r(-6,-7,12,6,3,'url(#wood)','stroke-width="1.6"'),`translate(50 ${top-10}) rotate(-25)`);
 return body;
}
const bottleMini=(x,y,color=C.red)=>r(x+3,y,5,4,1,C.cream,'stroke-width="1"')+p(`M${x+3} ${y+4}h5v5l3 4v14H${x}V${y+13}l3-4Z`,color,'stroke-width="1.1"')+line(`m${x+3} ${y+14}v8`,'#ffefd0',1.1);
export function fridge(level=1,variant='drink'){
 const dairy=variant==='dairy',blue=dairy?'url(#enamel)':'url(#blue)';
 let body=r(18,10,60,77,7,blue)+r(25,17,43,59,3,'#e7ead4','stroke-width="1.8"')+r(29,22,35,49,2,'#bdd1c3','stroke-width="1.2"')+line('M29 46h35m-35 25h35','#91ada8',2.1)+r(69,37,4,17,2,C.cream,'stroke-width="1.4"')+r(25,81,7,8,2,C.darkWood)+r(64,81,7,8,2,C.darkWood);
 body+=bottleMini(33,27,dairy?'#fff5d9':'#dcb784')+bottleMini(49,27,dairy?'#e5ddbd':'#cba7b9')+t(bottleMini(33,27,dairy?'#eee3bf':'#a6bf8e'),'translate(0 25)')+t(bottleMini(49,27,dairy?'#d8cca3':'#e3a080'),'translate(0 25)')+light('M23 17v28',2.6);
 if(level>=2)body=t(body,'translate(-3 0) scale(.96)')+r(73,16,11,65,3,blue)+line('M77 28h4m-4 8h4m-4 8h4m-4 8h4','#e8ecd4',1.8);
 if(level===3)body=t(body,'translate(-1 7) scale(.92)')+p('M18 7h62l4 12H14Z','url(#wood)')+r(31,6,37,9,3,'url(#enamel)')+line('M38 10h23','#f5efd5',2);
 return body;
}

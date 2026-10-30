// Round 52: glass mixing jugs with visible blade couplings and progressively steadier motors.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const r=(x,y,w,h,rx,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line=(d,c,w=1.5,o=1)=>p(d,'none',`stroke="${c}" stroke-width="${w}" opacity="${o}"`);
const grad=(id,cs)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".86" y2="1">${cs.map((c,i)=>`<stop offset="${i/(cs.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const defs=id=>grad(`${id}-blue`,['#e1f0f2','#b6d4d9','#83afb9'])
 +grad(`${id}-side`,['#bbd7db','#93bbc5','#6898a6'])
 +grad(`${id}-cream`,['#fff9df','#f5e8c4','#d9c99c'])
 +grad(`${id}-coral`,['#ffd1b9','#f0b194','#d58c75'])
 +grad(`${id}-glass`,['#f7fff7','#deefea','#accfd1'])
 +grad(`${id}-metal`,['#f2f6e9','#c0d0ca','#879fa1'])
 +grad(`${id}-pulp`,['#ffe79a','#f6cc6b','#e9ad45']);
const doc=(id,art,dx,dy)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>搅拌机 · 雾蓝奶油透明杯备制设备候选</title><defs>${defs(id)}</defs><g transform="translate(${dx} ${dy})" stroke="#3b3b36" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
const cup=(id,x,y,w,h,locked=false,detachable=false)=>{
 const a=w/2;
 let art=`<g transform="translate(${x} ${y})">`;
 // The hollow glass handle attaches to the vessel at two real points.
 art+=p(`M${a-1} 16Q${a+31} 8 ${a+32} 30Q${a+32} 55 ${a-5} 61L${a-5} 51Q${a+21} 47 ${a+21} 31Q${a+21} 22 ${a-1} 26Z`,`url(#${id}-glass)`,'stroke="#739da0" stroke-width="1.8" fill-opacity=".84"');
 art+=p(`M${-a} 0H${a}L${a-7} ${h-11}Q${a-8} ${h-3} ${a-18} ${h}H${-a+18}Q${-a+8} ${h-3} ${-a+7} ${h-11}Z`,`url(#${id}-glass)`,'stroke="#668e90" stroke-width="2" fill-opacity=".73"');
 // A single restrained mango-coloured mixing area; no fruit pile or finished drink decoration.
 art+=p(`M${-a+10} ${h*.51}Q-2 ${h*.6} ${a-10} ${h*.5}L${a-14} ${h-14}Q0 ${h-4} ${-a+14} ${h-14}Z`,`url(#${id}-pulp)`,'stroke="#cba95b" stroke-width="1.4" fill-opacity=".9"');
 art+=line(`M${-a+16} ${h*.65}Q2 ${h*.49} ${a-17} ${h*.64}Q11 ${h*.77} -4 ${h*.76}Q-10 ${h*.75} -4 ${h*.69}`,'#fff2bd',1.7,.97);
 // Short blades and central shaft sit inside the lower cup above the coupled collar.
 art+=p(`M-2 ${h-13}L-15 ${h-19}L-12 ${h-23}L1 ${h-17}L14 ${h-22}L17 ${h-18}L4 ${h-12}Z`,`url(#${id}-metal)`,'stroke="#859796" stroke-width="1.35"');
 art+=r(-3,h-20,7,12,2,`url(#${id}-metal)`,'stroke="#7c9290" stroke-width="1.4"');
 art+=line(`M${-a+7} 9L${-a+11} ${h*.43}M${-a+13} ${h*.65}L${-a+14} ${h*.78}M${a-8} 8L${a-10} 25`,'#ffffff',1.7,.97);
 art+=p(`M${-a+11} ${h-2}Q0 ${h+6} ${a-11} ${h-2}V${h+8}Q0 ${h+17} ${-a+11} ${h+8}Z`,`url(#${id}-metal)`,'stroke="#66848a" stroke-width="1.7"');
 art+=p(`M${-a-3} -6Q0-14 ${a+3}-6L${a+2} 3Q0 11 ${-a-2} 3Z`,`url(#${id}-cream)`,'stroke="#849b93" stroke-width="1.8"');
 art+=r(-12,-17,24,9,4,`url(#${id}-coral)`,'stroke="#a9856f" stroke-width="1.5"');
 art+=line(`M${-a+7}-5Q-2-11 ${a-9}-5`,'#fffdf0',1.6,.97);
 if(locked){art+=r(-a-1,-1,6,13,2,`url(#${id}-metal)`,'stroke="#74918e" stroke-width="1.4"');art+=r(a-5,-1,6,13,2,`url(#${id}-metal)`,'stroke="#74918e" stroke-width="1.4"');}
 if(detachable){art+=p(`M${-a+9} ${h+5}L${-a+17} ${h+6}V${h+14}L${-a+9} ${h+12}ZM${a-17} ${h+6}L${a-9} ${h+5}V${h+12}L${a-17} ${h+14}Z`,`url(#${id}-coral)`,'stroke="#9d8270" stroke-width="1.4"');art+=line(`M${-a+18} ${h+11}Q0 ${h+17} ${a-18} ${h+11}`,'#e8f1e6',1.4,.98);}
 return art+'</g>';
};
const control=(id,x,y)=>`${e(x,y,9,9,`url(#${id}-coral)`,'stroke="#9a806e" stroke-width="1.6"')}${line(`M${x-4} ${y-4}Q${x} ${y-7} ${x+3} ${y-3}`,'#fff1d6',1.4,.95)}`;

function levelOne(){
 const id='r52-blender-one';
 let art=p('M77 166Q77 155 90 154H144Q159 154 162 169L168 197Q169 210 156 212H83Q70 210 73 197Z',`url(#${id}-blue)`);
 art+=p('M144 155L158 151Q170 153 173 168L179 194Q181 206 165 211L164 197Z',`url(#${id}-side)`,'stroke-width="2.4"');
 art+=p('M79 168Q116 177 160 168L157 180Q118 187 77 179Z',`url(#${id}-cream)`,'stroke="#b5b99e" stroke-width="1.5"');
 art+=cup(id,116,79,70,76);
 art+=control(id,118,195);
 art+=line('M80 190L78 199M148 208H91','#edf9ed',1.6,.94);
 return doc(id,art,.75,-9.5);
}

function levelTwo(){
 const id='r52-blender-two';
 let art=r(64,210,120,12,5,'#8caeb3','stroke="#607f85" stroke-width="2"');
 art+=p('M70 170Q70 157 85 156H150Q165 158 168 173L178 202Q181 214 165 216H78Q63 214 66 202Z',`url(#${id}-blue)`);
 art+=p('M150 157L165 152Q178 153 181 168L188 200Q188 211 174 215L169 199Z',`url(#${id}-side)`,'stroke-width="2.4"');
 art+=p('M75 170Q116 181 165 170L162 182Q119 194 71 182Z',`url(#${id}-cream)`,'stroke="#afb9a2" stroke-width="1.5"');
 art+=cup(id,115,66,79,92,true);
 // Visible bayonet tabs engage the motor seat below the coupled glass vessel.
 art+=p('M82 166H91V174H82ZM144 166H153V174H144Z',`url(#${id}-coral)`,'stroke="#9c8570" stroke-width="1.5"');
 art+=control(id,119,199);
 art+=line('M77 189L73 200M94 212H151','#effaf0',1.6,.95);
 return doc(id,art,1.75,-7.5);
}

function levelThree(){
 const id='r52-blender-three';
 let art=r(57,214,138,12,5,'#87aab1','stroke="#5c7c84" stroke-width="2"');
 // The curved right motor shield vents the motor without enclosing the glass jug.
 art+=p('M158 154L176 145Q191 145 196 162L203 196Q207 213 190 219L174 214Z',`url(#${id}-side)`,'stroke-width="2.5"');
 art+=p('M65 174Q66 160 82 158H151Q168 160 172 176L183 204Q185 218 167 220H72Q55 218 58 204Z',`url(#${id}-blue)`);
 art+=p('M70 173Q116 184 167 173L164 186Q119 199 64 186Z',`url(#${id}-cream)`,'stroke="#adb8a1" stroke-width="1.5"');
 art+=cup(id,115,56,84,103,true,true);
 art+=p('M79 171H89V181H79ZM145 171H155V181H145Z',`url(#${id}-coral)`,'stroke="#9c8270" stroke-width="1.5"');
 art+=control(id,115,204);
 art+=line('M177 165L186 162M180 175L189 172M183 185L192 182','#547e89',2,.98);
 art+=line('M183 157Q190 158 192 166M69 192L65 204M86 216H155','#e9f6eb',1.6,.94);
 return doc(id,art,-2.75,-4.5);
}

export const applianceBlenderCandidates=[
 {id:'blender-l1',code:'EQ24-L1',name:'搅拌机',familyId:'blender',deviceKind:'appliance',outputChains:[],level:1,expectedOccupancy:.78,svg:levelOne(),
  reason:'透明短搅拌杯、玻璃把手、清楚杯盖与底部刀座连接圆角小电机座，一处金黄芒果浆和轻旋涡提示搅拌用途，区别手压鲜果台与咖啡豆磨机。',
  design:{silhouette:'有柄透明短杯、奶油杯盖、清楚刀座联轴环与雾蓝圆角小电机座',angle:'三分之四俯视，杯体、玻璃把手和刀座与电机的连接关系可见',material:'浅雾蓝搪瓷、奶油连接沿、桃珊瑚控制旋钮、浅透玻璃和金属刀座，左上光',identity:'用于QQ芒果布丁、芒果慕斯、浆果蜂蜜燕麦碗、肉桂苹果奶冻等现有搅拌料理制作',upgrade:'一级为透明短杯与稳固圆角电机座，杯体仍为主体',presentation:'78%主体、透明居中留白；只一处金黄浆色，不堆水果，无文字数字刻度角标或成品杯装饰'}},
 {id:'blender-l2',code:'EQ24-L2',name:'搅拌机',familyId:'blender',deviceKind:'appliance',outputChains:[],level:2,expectedOccupancy:.82,svg:levelTwo(),
  reason:'升级锁紧杯盖、可见杯座卡口与完整减振底垫，使搅拌杯牢固连接电机底座；保留透明把手、底部刀座和克制金黄浆色，不变成饮品成品。',
  design:{silhouette:'更清楚锁紧杯盖、透明搅拌杯、杯座卡口与减振宽底垫',angle:'三分之四俯视，盖夹、玻璃把手、卡口和电机座层次清楚',material:'雾蓝奶油外壳、桃珊瑚卡口与旋钮、浅透玻璃及轻金属连接环',identity:'用于现有搅拌料理的浆料混合与打匀，杯盖锁紧、杯座卡接和减振结构对应实际操作',upgrade:'二级增加锁紧杯盖、减振底座和杯座卡口，区别一级简单短杯机座',presentation:'82%主体、透明居中留白；仅一处浆色，无数字刻度文字等级角标，无豆仓或出粉抽屉'}},
 {id:'blender-l3',code:'EQ24-L3',name:'搅拌机',familyId:'blender',deviceKind:'appliance',outputChains:[],level:3,expectedOccupancy:.84,svg:levelThree(),
  reason:'宽稳减振底座、独立侧散热罩与可拆刀座锁环构成最高级功能升级，透明杯和玻璃把手保持视觉主体，杯盖到刀座再到电机的连接完整。',
  design:{silhouette:'透明主杯、双侧锁盖、可拆刀座锁环、宽稳电机底座与弧形侧散热罩',angle:'三分之四俯视，刀座拆装环和卡口清楚，侧散热罩贴合电机而不包住杯体',material:'雾蓝奶油搪瓷、桃珊瑚锁件与旋钮、清浅玻璃、金属刀座与柔亮浆色，左上光',identity:'用于现有搅拌料理的稳定混合，杯盖锁紧、可拆刀座与侧散热结构便于操作和维护',upgrade:'三级增加加强宽底座、侧散热罩与明确可拆刀座结构，杯仍主体，不变多杯设备',presentation:'84%主体、透明居中留白；只一处金黄浆色，无文字数字刻度角标、果堆、豆仓或出粉抽屉'}}
];

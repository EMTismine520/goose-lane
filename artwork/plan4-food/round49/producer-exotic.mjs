// Round 49: rounded woven fruit baskets, distinct from the squared timber fruit crate.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,c,w=1.5,o=1)=>p(d,'none',`stroke="${c}" stroke-width="${w}" opacity="${o}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".1" y1="0" x2=".84" y2="1">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const defs=id=>grad(`${id}-cane`,['#f5dbab','#dfb77d','#bd8c51'])
 +grad(`${id}-rim`,['#f8e1b5','#e3bb7e','#c49252'])
 +grad(`${id}-inside`,['#cda976','#b08a59','#8e6946'])
 +grad(`${id}-cloth`,['#fff8dc','#f1e5ba','#d9c997'])
 +grad(`${id}-banana`,['#fff2a3','#f5cf5f','#dcaa36'])
 +grad(`${id}-mango`,['#ffdc7e','#f5b34d','#e68a38'])
 +grad(`${id}-coconut`,['#c6a070','#9e774b','#795737'])
 +grad(`${id}-flesh`,['#fffef1','#fbf3d9','#e9ddbc']);
const doc=(id,art,dx,dy)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>风味果筐 · 暖藤编分格果篮候选</title><defs>${defs(id)}</defs><g transform="translate(${dx} ${dy})" stroke="#45382e" stroke-width="3.1" stroke-linejoin="round" stroke-linecap="round">${art}</g></svg>`;
const bananas=(id,x,y,s,angle=0)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${s})">${p('M-22-29Q-23-4-5 11Q12 26 29 8Q24 37 1 31Q-30 23-31-23Z',`url(#${id}-banana)`,'stroke="#977036" stroke-width="1.8"')}${p('M-12-34Q-15-9 1 3Q14 14 29-1Q24 24 6 22Q-20 15-21-28Z',`url(#${id}-banana)`,'stroke="#987135" stroke-width="1.7"')}${p('M-30-29L-15-37L-10-29L-25-23Z','#a8874b','stroke="#6d5736" stroke-width="1.5"')}${line('M-23-13Q-19 9 0 19M-14-13Q-7 8 10 11','#dcaf4b',1.4,.95)}${line('M-22-17Q-22-7-18 0M-12-22Q-13-13-9-7','#fff5b0',1.5,.98)}${p('M27 5L30 7L28 12L25 11Z','#8d6638','stroke="none"')}</g>`;
const mango=(id,x,y,s,angle=0)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${s})">${p('M-8-25Q12-31 23-14Q36 7 18 25Q4 39-14 25Q-31 11-25-7Q-20-20-8-25Z',`url(#${id}-mango)`,'stroke="#a36f35" stroke-width="1.8"')}${p('M9-24Q21-18 24-8Q13-18 0-17Q-14-15-21-4Q-19-18-8-23Z','#ffe296','stroke="none" opacity=".65"')}${line('M-15-11Q-20-3-19 3','#fff0b5',1.7,.9)}${line('M5-25L8-32','#68894c',2,.98)}${p('M8-31Q15-37 20-32Q13-26 8-29Z','#92ad61','stroke="#6e8b4f" stroke-width="1.3"')}</g>`;
const coconut=(id,x,y,s,angle=0)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${s})">${p('M-29-5Q-31-29-7-34Q17-39 28-15Q39 10 17 27Q-8 43-26 22Q-34 12-29-5Z',`url(#${id}-coconut)`,'stroke="#725438" stroke-width="1.8"')}${line('M-19-20Q-27-2-19 17M-9-29Q-17-11-11 0M3-30Q-2-21-3-14','#d3ae79',1.3,.9)}${e(6,5,25,21,`url(#${id}-flesh)`,'stroke="#76583b" stroke-width="2" transform="rotate(-16 6 5)"')}${e(6,5,18,14.5,'#fffdf0','stroke="#d4c9aa" stroke-width="1.4" transform="rotate(-16 6 5)"')}${line('M-6-5Q6-13 17-6','#ffffff',1.5,.95)}</g>`;
const weave=(top,width=1)=>`${line(`M${60-width*2} ${top}Q128 ${top+24} ${196+width*2} ${top-1}M${65-width*2} ${top+13}Q129 ${top+35} ${191+width*2} ${top+12}`,'#bd935e',1.4,.95)}${line(`M79 ${top-8}Q80 ${top+8} 85 ${top+24}M110 ${top-4}L112 ${top+30}M146 ${top-4}L145 ${top+30}M177 ${top-8}Q176 ${top+8} 170 ${top+24}`,'#bd935e',1.35,.85)}${line(`M88 ${top+4}L104 ${top+7}M149 ${top+7}L165 ${top+4}`,'#fae4b6',1.5,.97)}`;

function levelOne(){
 const id='r49-exotic-one';
 let art=p('M39 132Q128 161 217 131L202 179Q194 198 129 201Q66 198 55 181Z',`url(#${id}-cane)`);
 art+=e(128,132,89,22,`url(#${id}-inside)`,'stroke-width="2.4"');
 art+=bananas(id,84,105,.75,-11)+coconut(id,172,118,.73,8)+mango(id,129,126,.88,-12);
 art+=p('M39 132Q128 162 217 131L215 141Q130 173 42 142Z',`url(#${id}-rim)`,'stroke="#8c673d" stroke-width="2.1"');
 art+=line('M47 136Q128 162 207 136','#f9e5ba',1.7,.95);
 art+=weave(162);
 art+=line('M65 185Q126 205 191 185','#f7dcaa',1.6,.9);
 return doc(id,art,0,-13);
}

function levelTwo(){
 const id='r49-exotic-two';
 // The side grips are functional open loops woven into a substantial rolled rim.
 let art=p('M51 131Q23 117 23 139Q24 161 54 159L58 151Q34 153 33 139Q33 133 49 140Z',`url(#${id}-rim)`,'stroke-width="2.5"');
 art+=p('M205 131Q233 117 233 139Q232 161 202 159L198 151Q222 153 223 139Q223 133 207 140Z',`url(#${id}-rim)`,'stroke-width="2.5"');
 art+=p('M42 132Q128 164 214 132L202 185Q193 205 130 208Q64 206 54 187Z',`url(#${id}-cane)`);
 art+=e(128,132,87,24,`url(#${id}-inside)`,'stroke-width="2.4"');
 art+=p('M52 128Q85 108 114 118Q145 108 177 119L204 130Q158 158 98 150Z',`url(#${id}-cloth)`,'stroke="#b5a575" stroke-width="1.6"');
 art+=line('M114 119L111 145M161 118L165 143','#b9aa7e',1.7,.98);
 art+=bananas(id,82,104,.76,-8)+mango(id,134,110,.87,6)+coconut(id,175,129,.71,10);
 art+=p('M42 132Q128 163 214 132L214 144Q128 177 42 144Z',`url(#${id}-rim)`,'stroke="#8c673e" stroke-width="2.3"');
 art+=p('M72 149Q86 154 105 156L102 171Q89 168 75 163Z',`url(#${id}-cloth)`,'stroke="#bfae7d" stroke-width="1.4"');
 art+=line('M48 137Q129 166 207 137','#fbe8c0',1.7,.96);
 art+=weave(170);
 art+=line('M62 191Q127 213 195 191','#f4d7a2',1.6,.9);
 return doc(id,art,0,-15.5);
}

function levelThree(){
 const id='r49-exotic-three';
 // A full arched carrying beam is attached behind the basket, with a clear open centre.
 let art=p('M63 137V105Q63 40 128 38Q194 40 194 105V137L183 140V106Q183 52 128 51Q74 52 74 106V140Z',`url(#${id}-rim)`,'stroke-width="2.8"');
 art+=line('M69 113V105Q69 46 128 45Q188 46 188 105V114','#f8e2b6',1.7,.98);
 art+=p('M46 134Q129 165 212 133L204 190Q196 207 130 211Q65 208 55 191Z',`url(#${id}-cane)`);
 art+=e(129,135,84,24,`url(#${id}-inside)`,'stroke-width="2.4"');
 art+=p('M55 130Q89 113 114 122Q141 114 167 122Q185 120 201 131L190 150Q129 163 65 150Z',`url(#${id}-cloth)`,'stroke="#b9a97b" stroke-width="1.5"');
 // Three softly curved compartments, not rectangular wooden crate slots.
 art+=p('M104 120L110 119L118 154L111 156Z',`url(#${id}-rim)`,'stroke="#a4824f" stroke-width="1.5"');
 art+=p('M157 121L164 123L158 155L151 153Z',`url(#${id}-rim)`,'stroke="#a4824f" stroke-width="1.5"');
 art+=bananas(id,83,119,.70,-10)+mango(id,132,121,.85,2)+coconut(id,177,134,.69,14);
 art+=p('M46 134Q128 164 212 133L213 146Q130 179 45 147Z',`url(#${id}-rim)`,'stroke="#8a653c" stroke-width="2.3"');
 art+=line('M52 139Q130 167 206 139','#fbe7bc',1.7,.98);
 art+=weave(172);
 // A bound, reinforced oval base supports the handle and divided load.
 art+=p('M58 194Q130 218 201 194L202 202Q196 216 130 220Q65 217 57 203Z',`url(#${id}-rim)`,'stroke="#8c693e" stroke-width="2.1"');
 art+=line('M65 201Q129 222 193 201','#f6dbab',1.6,.95);
 art+=p('M63 135L75 138L77 155L65 152Z',`url(#${id}-cane)`,'stroke="#997345" stroke-width="1.5"');
 art+=p('M183 139L195 135L193 152L182 156Z',`url(#${id}-cane)`,'stroke="#997345" stroke-width="1.5"');
 return doc(id,art,-1,-1);
}

export const producerExoticCandidates=[
 {id:'exotic-fruit-basket-l1',code:'EQ11-L1',name:'风味果筐',familyId:'exotic-fruit-basket',level:1,expectedOccupancy:.78,svg:levelOne(),
  reason:'低开放暖藤篮以柔圆椭圆轮廓和克制编织纹理托住香蕉、芒果与椰子三种链内标志，区别有直木板、护角和方形结构的鲜果木箱。',
  design:{silhouette:'低矮开放圆藤篮，浅椭圆开口、柔弧篮腹和细卷边，无提梁无轮',angle:'略俯视三分之四角度，水果露出篮沿，前腹有自然容积',material:'暖藤编渐变、清楚而克制的两行编织纹，左上柔光与近黑细轮廓',identity:'仅实际fresh-exotic链的香蕉、芒果、椰子三类标志，不画苹果、橘子或葡萄',upgrade:'一级为低开放篮，不预支侧提柄、内衬分格和拱形提梁',presentation:'78%主体，透明居中留白；图内无文字数字等级角标'}},
 {id:'exotic-fruit-basket-l2',code:'EQ11-L2',name:'风味果筐',familyId:'exotic-fruit-basket',level:2,expectedOccupancy:.82,svg:levelTwo(),
  reason:'藤篮加深并增加结实卷边、两侧可穿握的提柄和奶油色内衬分隔，仍只展示三类风味果，升级功能在小图轮廓和开口层次中清楚可辨。',
  design:{silhouette:'加深圆藤篮、结实卷边、开放侧提柄、内衬与分隔，无直木板箱结构',angle:'略俯视能看清奶油衬布与开口分区，左右提柄连入篮沿',material:'暖藤编、浅奶油布衬和柔亮成熟果皮，编织纹保持少量低对比',identity:'只用香蕉、芒果和椰子，属于实际fresh-exotic产出链',upgrade:'二级增加坚实卷边、两侧提柄与内衬分隔，不仅换色或放大',presentation:'82%主体，透明居中留白；无文字数字等级标牌或额外食品'}},
 {id:'exotic-fruit-basket-l3',code:'EQ11-L3',name:'风味果筐',familyId:'exotic-fruit-basket',level:3,expectedOccupancy:.84,svg:levelThree(),
  reason:'高拱藤编提梁、绑束加固的椭圆底座和三处独立软圆分格建立最高级承重结构；香蕉、芒果与椰子各占一格，保持清楚而克制的家族身份。',
  design:{silhouette:'完整拱形提梁、深椭圆篮、加固底座与独立内分格，提梁中央留出清楚负形',angle:'三分之四俯视，前后篮沿、三个软圆分格和提梁连接处明确',material:'暖藤编卷束、奶油内衬、加固底边和左上光，不使用木箱板纹',identity:'香蕉、芒果和椰子各一处标志，不加入实际链外水果',upgrade:'三级增加拱形承重提梁、独立分格和加固底座，以结构区别二级侧提柄篮',presentation:'84%主体，透明居中留白；无文字数字等级角标，无轮子和额外装饰'}}
];

// Round 28: five home-cooking dishes, each drawn from its current recipe.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".88" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 家常料理新版</title><defs>${defs}</defs><g stroke="#49392e" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
const scallion=(x,y,a=0,scale=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${scale})">${e(0,0,5.4,3.1,'#6eaa4c','stroke="#426b34" stroke-width="1.2"')}${e(.2,-.1,2.5,1.3,'#d1df9d','stroke="none"')}</g>`;

function onionSalad(){
  const defs=gradient('h28-onion-plate',['#f9fcf0','#dce7d9','#b6cdbf'])
    +gradient('h28-onion-rind',['#bd79a2','#945c88','#794a74'])
    +gradient('h28-onion-cut',['#f4d8e8','#e9b8d6','#c88eaf'])
    +gradient('h28-cucumber',['#acd47d','#76ad52','#4f873f']);
  let art=p('M38 139Q47 125 69 123H188Q209 125 218 139L208 166Q196 184 173 185H82Q57 184 46 166Z','url(#h28-onion-plate)');
  art+=e(128,139,91,30,'#f5f9eb');
  art+=e(128,139,78,22,'#dcead1','stroke="#9bb69d" stroke-width="1.35"');
  art+=line('M58 164Q76 177 101 178M149 179Q180 177 197 164','#fffdf0',2.1,.9);
  const cucumber=(x,y,a,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-9-39L9-39L12 34Q1 43-11 34Z','url(#h28-cucumber)')
    +p('M-5-34H5L7 31Q1 35-6 31Z','#d3e6a1','stroke="#83a762" stroke-width="1.2"')
    +line('M-2-28L-2 23','#eff0bc',1.5,.88)
    +e(2,-16,1.4,3.2,'#f6efbe','stroke="none"')+e(2,1,1.3,3,'#f6efbe','stroke="none"')+e(2,17,1.3,3,'#f6efbe','stroke="none"')
    +'</g>';
  art+=cucumber(85,130,-51,.84);
  art+=cucumber(160,130,53,.9);
  art+=cucumber(130,132,-21,.9);
  const ribbon=(x,y,a,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-34 6C-31-16-9-29 13-21C32-14 34 5 18 17L12 8C22 0 21-10 10-13C-7-19-22-8-24 9Z','url(#h28-onion-rind)')
    +p('M-29 6C-26-11-9-22 10-17C24-13 28 2 15 12','none','stroke="#f4d6e8" stroke-width="4.5"')
    +line('M-25 7C-24-6-9-16 6-14','#b37c9f',1.15,.85)
    +'</g>';
  art+=ribbon(83,112,-20,.83);
  art+=ribbon(141,111,21,.96);
  art+=ribbon(178,141,50,.72);
  art+=ribbon(115,145,-15,.99);
  art+=p('M62 147C69 135 87 133 96 141C103 149 96 158 84 157L84 150C91 151 94 147 90 144C84 140 73 142 69 150Z','url(#h28-onion-cut)','stroke-width="2.4"');
  art+=line('M117 157Q131 160 144 154M169 157L177 153','#7b9653',1.4,.75);
  return doc('凉拌紫洋葱',defs,art);
}

function tomatoEggs(){
  const defs=gradient('h28-eggs-plate',['#fffdf1','#eee8d6','#d4c9ad'])
    +gradient('h28-tomato-red',['#ff8666','#ef5d45','#d64133'])
    +gradient('h28-tomato-cut',['#ffb376','#ff8859','#e65b3e'])
    +gradient('h28-eggs',['#ffeaa0','#ffd15d','#efa534']);
  let art=e(128,158,91,31,'url(#h28-eggs-plate)');
  art+=e(128,152,92,30,'#fffdf0');
  art+=e(128,152,79,22,'#efc99a','stroke="#d9c49c" stroke-width="1.25"');
  art+=e(128,153,69,16,'#f6b06f','stroke="none" opacity=".8"');
  const tomato=(x,y,a,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-26-5C-20-26 6-31 23-12C29-3 26 11 14 19L-11 17Z','url(#h28-tomato-red)')
    +p('M-20-4C-15-20 4-23 17-10C22-4 18 7 11 12L-8 11Z','url(#h28-tomato-cut)','stroke="#bd5032" stroke-width="1.3"')
    +p('M-8 10L-3-17L5-15L8 11Z','#ffd098','stroke="none"')
    +e(-11,-2,2,1.3,'#ffe2a2','stroke="none"')+e(12,-3,1.9,1.3,'#ffe0a0','stroke="none"')
    +line('M-16-12Q-7-22 3-21','#ffc08b',1.6,.9)
    +'</g>';
  art+=tomato(81,126,-32,.94);
  art+=tomato(165,121,30,.98);
  art+=p('M102 103C113 92 126 99 130 105C143 95 157 105 153 117C167 124 160 137 147 140C145 152 128 155 121 146C108 155 91 146 96 134C81 129 85 111 99 113Z','url(#h28-eggs)');
  art+=line('M104 111C115 103 123 110 123 118M133 110Q142 104 148 112','#fff1b8',3.1,.92);
  art+=p('M65 143C67 127 82 128 90 134C99 126 112 136 108 145C121 146 124 158 112 164C102 175 86 168 84 161C71 166 57 154 65 143Z','url(#h28-eggs)');
  art+=line('M72 141Q82 135 89 145M91 157Q99 151 106 156','#ffefac',2.6,.95);
  art+=tomato(144,153,9,.94);
  art+=p('M166 140C175 130 189 134 189 143C202 143 207 156 196 164C186 173 171 167 172 158C158 161 154 146 166 140Z','url(#h28-eggs)');
  art+=line('M171 144Q181 138 186 147M180 160Q189 163 195 156','#fff0af',2.4,.9);
  for(const [x,y,a,s]of [[105,109,-25,.85],[148,130,30,.82],[90,157,-20,.8],[177,154,18,.86],[129,163,40,.7]])art+=scallion(x,y,a,s);
  art+=line('M57 166Q81 180 113 180M145 180Q178 176 198 166','#fffdf4',2.2,.9);
  return doc('番茄炒蛋',defs,art);
}

function meatballSoup(){
  const defs=gradient('h28-soup-bowl',['#e2eff3','#b7d6df','#82aebf'])
    +gradient('h28-soup',['#f9e7ad','#ebcf83','#d6b970'])
    +gradient('h28-meatball',['#d6a76c','#b77f4c','#8f5e3c'])
    +gradient('h28-soup-tomato',['#ff9b70','#f06b4d','#ce4737']);
  let art=p('M105 187H151V199C139 207 118 207 105 199Z','url(#h28-soup-bowl)','stroke-width="2.6"');
  art+=p('M42 128C49 173 76 198 128 198C180 198 207 173 214 128Z','url(#h28-soup-bowl)');
  art+=p('M191 142L210 132C202 164 176 187 146 193C166 181 182 162 191 142Z','#719cac','stroke="none" opacity=".38"');
  art+=e(128,128,86,29,'#f5f7e9');
  art+=e(128,128,76,22,'url(#h28-soup)','stroke="#a8ad7d" stroke-width="1.3"');
  const ball=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">`
    +p('M-23 2C-24-14-14-27 2-27C19-26 28-13 25 3C22 19 10 26-3 24C-16 23-24 15-23 2Z','url(#h28-meatball)')
    +p('M-19 5C-12 16 9 20 22 5C17 21 6 26-7 22C-15 20-20 14-19 5Z','#8d5c3a','stroke="none" opacity=".3"')
    +line('M-14-11Q-9-21 3-20','#f4d09b',2.5,.88)
    +e(11,-9,1.9,1.3,'#96683f','stroke="none"')+e(-3,6,2.1,1.3,'#98663f','stroke="none"')
    +'</g>';
  art+=ball(91,108,.87);art+=ball(144,105,.89);
  art+=p('M170 117C180 107 195 112 198 121L184 138L167 132Z','url(#h28-soup-tomato)','stroke-width="2.5"');
  art+=p('M176 119L190 119L182 130Z','#ffbd83','stroke="none"');
  art+=ball(123,135,.92);
  art+=p('M61 130C70 119 84 123 89 132L78 146L61 141Z','url(#h28-soup-tomato)','stroke-width="2.5"');
  art+=p('M66 131L80 130L75 140Z','#ffbd83','stroke="none"');
  for(const [x,y,a,s]of [[164,129,-15,.85],[96,145,25,.8],[148,145,30,.84],[71,111,-30,.75]])art+=scallion(x,y,a,s);
  art+=line('M62 128Q70 120 79 121M151 118Q157 117 164 120M165 142Q177 144 187 137','#fff3c6',1.9,.9);
  art+=p('M43 132C66 154 190 154 213 132L209 141C185 163 71 163 47 141Z','#ddeaf0','stroke-width="2.3"');
  art+=line('M51 139C78 156 176 156 205 139','#fffef3',2.5,.9);
  art+=p('M61 157Q69 178 87 184C92 185 94 181 90 179Q76 169 71 155Z','#eff9f4','stroke="none" opacity=".92"');
  art+=line('M90 183Q128 197 166 183','#6f9ead',1.4,.72);
  return doc('肉丸蔬菜汤',defs,art);
}

function garlicBroccoli(){
  const defs=gradient('h28-broccoli-plate',['#fffdf0','#eee9d5','#ccc8ad'])
    +gradient('h28-broccoli-flower',['#a4d363','#6fad45','#3c7d3d'])
    +gradient('h28-broccoli-stem',['#d6e7a3','#a8ce78','#7eac5b'])
    +gradient('h28-garlic',['#fff0bb','#eed38a','#d5a85c']);
  let art=e(128,158,96,28,'url(#h28-broccoli-plate)');
  art+=e(128,152,97,28,'#fffdf1');
  art+=e(128,152,83,20,'#e4e6c1','stroke="#bfc4a2" stroke-width="1.3"');
  const floret=(x,y,a,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-8 0L-13 26Q-1 35 13 26L9 0Z','url(#h28-broccoli-stem)')
    +line('M-1 24L-13 7M3 19L16 3','#7da858',2.1,.9)
    +p('M-27 1C-35-7-31-20-21-22C-21-33-6-38 2-29C13-38 28-28 25-17C38-13 35 2 25 6C23 17 11 22 3 15C-8 24-22 17-23 8C-29 9-32 5-27 1Z','url(#h28-broccoli-flower)')
    +p('M-21 7C-12 10-4 8 1 13C9 7 19 9 25 3C23 14 12 21 3 15C-7 24-20 17-23 8Z','#387a38','stroke="none" opacity=".34"')
    +line('M-21-16Q-14-26-5-22M8-27Q16-28 20-20','#d0e99a',2.1,.92)
    +line('M-13-6Q-7-12-1-8M9-10L15-9','#b6dc7a',1.7,.86)
    +'</g>';
  art+=floret(78,125,-33,.84);art+=floret(128,112,-4,.91);art+=floret(180,128,35,.83);art+=floret(127,151,-17,.81);
  const chip=(x,y,a,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-7-5Q2-12 8-4Q12 2 4 8Q-5 11-9 3Z','url(#h28-garlic)','stroke="#9c7b49" stroke-width="1.4"')
    +line('M-4-3L2-4','#fff6ce',1.4,.9)+'</g>';
  for(const [x,y,a,s]of [[81,137,-20,.8],[156,125,20,.8],[108,111,24,.72],[176,148,30,.82],[100,156,-28,.74],[145,158,12,.66]])art+=chip(x,y,a,s);
  art+=line('M60 160Q74 168 88 166M165 167L181 162','#8da855',1.5,.74);
  art+=line('M49 166Q80 181 112 180M150 180Q183 178 208 165','#fffef4',2.1,.92);
  return doc('蒜香西兰花',defs,art);
}

function vegetableRice(){
  const defs=gradient('h28-rice-bowl',['#c6e4df','#93c2b7','#679f9d'])
    +gradient('h28-rice',['#fffdf0','#f1e6bb','#d9c68f'])
    +gradient('h28-rice-pepper',['#ff8d61','#ec5b40','#ce402f'])
    +gradient('h28-rice-carrot',['#ffbf56','#f99d37','#e87925']);
  let art=p('M102 177H154V188Q129 199 102 188Z','url(#h28-rice-bowl)','stroke-width="2.6"');
  art+=p('M42 134C50 168 78 190 128 190C178 190 206 168 214 134Z','url(#h28-rice-bowl)');
  art+=p('M191 146L210 138C198 166 174 182 148 186C167 177 182 162 191 146Z','#568f8f','stroke="none" opacity=".4"');
  art+=e(128,134,86,28,'#e7f0dc');
  art+=e(128,134,76,21,'#b7c49d','stroke="#81a695" stroke-width="1.3"');
  art+=p('M56 137C51 127 61 115 72 114C70 104 83 96 94 99C99 87 115 88 124 95C136 85 151 91 156 101C169 95 185 103 183 114C197 115 206 129 198 141C188 154 74 155 56 137Z','url(#h28-rice)');
  art+=line('M70 124Q77 116 86 119M93 106Q102 99 109 104M133 104Q140 98 148 105M165 119Q174 112 181 120','#fffef5',2.4,.95);
  const diced=(x,y,a,colour,w=10)=>`<g transform="translate(${x} ${y}) rotate(${a})">`
    +p(`M${-w/2} -5L${w/2} -7L${w/2+2} 3L${-w/2+1} 6Z`,colour,'stroke-width="1.5"')
    +line(`M${-w/2+2}-3L${w/2-1}-4`,'#ffdf98',1.3,.83)+'</g>';
  for(const [x,y,a,w]of [[80,123,-8,12],[117,107,15,10],[150,129,-15,11],[184,130,14,10],[107,141,-17,9]])art+=diced(x,y,a,'url(#h28-rice-pepper)',w);
  for(const [x,y,a,w]of [[103,122,18,10],[145,109,-15,10],[169,119,10,9],[130,140,21,10],[66,135,18,9]])art+=diced(x,y,a,'url(#h28-rice-carrot)',w);
  for(const [x,y,a,s]of [[91,111,-20,.8],[127,120,25,.88],[160,142,10,.78],[182,143,-25,.7],[89,144,-20,.72]])art+=scallion(x,y,a,s);
  for(const d of ['M69 130L74 132','M87 134L92 133','M112 130L117 128','M135 111L139 114','M151 119L154 121','M167 133L172 132','M115 147L119 146','M143 147L148 146'])art+=line(d,'#c5b477',1.3,.72);
  art+=p('M43 138C65 157 191 157 213 138L209 147C185 166 71 166 47 147Z','#c7e0d4','stroke-width="2.3"');
  art+=line('M52 144C79 159 177 159 204 144','#edf5df',2.4,.94);
  art+=p('M62 159Q73 177 89 181C94 182 96 178 92 176Q79 169 72 156Z','#e9f5e7','stroke="none" opacity=".9"');
  art+=line('M105 185Q128 190 150 185','#568d89',1.4,.7);
  return doc('彩蔬拌饭',defs,art);
}

export const homeFrontCandidates=[
  {id:'dish-fresh-home-onion-salad',name:'凉拌紫洋葱',svg:onionSalad(),expectedOccupancy:.80,reason:'紫洋葱切成清楚弧丝，与脆黄瓜条轻拌成低矮冷盘；紫与嫩绿的大形交错，长浅瓷盘托住清爽层次。',design:{silhouette:'弧形紫洋葱丝和带皮黄瓜长条，自然交错在浅长盘里',angle:'略俯视，看清洋葱层次、黄瓜籽芯与薄盘沿',material:'紫红洋葱外层、浅粉切面、嫩绿黄瓜和清凉浅瓷',identity:'切丝冷拌的细长形体，主料为黄瓜与紫洋葱',container:'低矮长浅瓷盘，主体80%，摆盘清爽而饱满'}},
  {id:'dish-fresh-home-tomato-eggs',name:'番茄炒蛋',svg:tomatoEggs(),expectedOccupancy:.82,reason:'把软嫩蛋块与熟番茄瓣自然翻拌，蛋香金黄和番茄红汁共同成为主角；白浅盘衬出柔软热炒的食欲。',design:{silhouette:'嫩黄蛋块、红番茄瓣和少量葱圈在圆浅盘中组成完整热炒轮廓',angle:'略俯视，能看清蛋块的软褶与番茄湿润切面',material:'金黄嫩蛋、亮红番茄汁、清楚葱圈与温白瓷盘',identity:'番茄、鸡蛋、香葱三种现有主料，表现软嫩炒制',container:'温白圆浅盘，主体82%，食物自然铺叠'}},
  {id:'dish-fresh-home-meatball-soup',name:'肉丸蔬菜汤',svg:meatballSoup(),expectedOccupancy:.82,reason:'三颗圆润熟肉丸浸在清亮汤面，番茄块与葱圈围绕其间；浅蓝深碗和可见汤面建立温暖汤菜身份。',design:{silhouette:'浅蓝深圆碗承托三颗熟肉丸，番茄块和葱圈落在清汤里',angle:'三分之四俯视，汤面、丸子体积与前碗沿都可读',material:'温褐肉丸、淡金清汤、红番茄和温润蓝瓷',identity:'肉丸、番茄、香葱对应真实配方，圆丸与汤面保持明显层次',container:'浅蓝深圆汤碗，主体82%，前碗沿让食物落稳'}},
  {id:'dish-fresh-home-garlic-broccoli',name:'蒜香西兰花',svg:garlicBroccoli(),expectedOccupancy:.80,reason:'西兰花短切成四簇适口花朵，几片浅金蒜粒分布在花球之间；椭圆浅盘突出一盘翠绿与蒜香炒制感。',design:{silhouette:'四簇短切西兰花自然铺在椭圆浅盘，蒜粒集中而清楚',angle:'略俯视，花球切形与短梗可见',material:'翠绿花球、浅绿短梗、淡金蒜粒与温白瓷',identity:'西兰花和大蒜两主料，短切炒制形体区别整颗原料',container:'薄椭圆白瓷盘，主体80%，保留饱满横向构图'}},
  {id:'dish-fresh-home-vegetable-rice',name:'彩蔬拌饭',svg:vegetableRice(),expectedOccupancy:.82,reason:'米饭保留完整的白米底，红黄彩椒、橙色胡萝卜丁与葱圈均匀拌入；青蓝短碗衬出家常米饭的鲜活色彩。',design:{silhouette:'饱满白米饭与彩蔬丁在青蓝短碗中形成低矮小丘',angle:'略俯视，白米底与红橙绿配料同时清楚',material:'温白米饭、润亮椒丁与胡萝卜、清楚葱圈和青蓝陶瓷',identity:'现有描述中的米饭配彩椒、胡萝卜、香葱，表现拌饭而非整块菜拼摆',container:'青蓝短圆饭碗，主体82%，米饭和盛器体量协调'}},
];

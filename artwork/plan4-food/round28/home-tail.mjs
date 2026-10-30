// Round 28: five separately composed home-cooking dishes, editable transparent SVG.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 家常料理新版候选</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
const scallion=(x,y,angle=0,scale=1)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">${e(0,0,6.5,3.9,'#79ad4d','stroke="#47733c" stroke-width="1.5"')}${e(0,-.2,3.1,1.6,'#d9e8a2','stroke="none"')}</g>`;

function scallionEggRice(){
  const defs=grad('h28-egg-bowl',['#fff9e9','#eee1bf','#cdbd98'])
    +grad('h28-egg-bowl-rim',['#fffdf2','#eee8ce'])
    +grad('h28-egg-main',['#ffe995','#ffd15c','#efac35'])
    +grad('h28-egg-fold',['#fff0a5','#ffd968','#f0b33f']);
  let art=p('M108 181H148L151 191Q130 200 106 190Z','url(#h28-egg-bowl)','stroke-width="2.7"');
  art+=p('M47 126C53 165 83 190 129 190C175 190 204 165 210 126Z','url(#h28-egg-bowl)');
  art+=p('M188 139L206 130C198 160 176 180 146 186C168 174 183 158 188 139Z','#c2b18c','stroke="none" opacity=".36"');
  art+=e(128,126,82,29,'url(#h28-egg-bowl-rim)');
  art+=e(128,123,73,24,'#fff9e7','stroke="#cbbd94" stroke-width="1.4"');
  art+=p('M59 125C61 112 72 108 83 107C88 95 101 93 114 98C126 87 146 94 154 99C170 97 191 112 196 125C182 143 76 150 59 125Z','#fff9e5','stroke="#bba985" stroke-width="1.6"');
  art+=p('M62 122C70 115 82 118 89 112C96 105 105 111 114 107C125 97 141 102 148 106C161 101 175 110 182 117C191 119 195 126 190 133C174 146 79 147 63 131Z','url(#h28-egg-main)');
  art+=p('M69 120C84 115 91 126 105 120C119 111 134 115 142 122C149 127 160 124 171 120C180 117 186 123 187 129C180 139 167 141 153 138C137 143 128 132 113 135C94 142 77 135 69 129Z','url(#h28-egg-fold)','stroke="#b88731" stroke-width="1.6"');
  art+=line('M77 122C90 117 95 129 108 122M121 116Q133 113 144 124M149 132Q169 136 179 126','#fff2ae',2.7,.9);
  art+=line('M92 133Q104 137 114 131M128 129Q139 126 147 134','#d59d35',1.5,.78);
  art+=line('M65 135L73 139M81 141L91 143M164 144L173 140M182 137L188 133','#d7c9a2',1.8,.9);
  art+=line('M75 109L80 106M158 106L165 110M116 99L122 96','#dfd3b1',1.6,.9);
  art+=scallion(93,117,-19,.9)+scallion(133,110,24,.85)+scallion(165,127,-27,.9)+scallion(119,133,15,.78);
  art+=p('M49 128C70 146 98 153 128 153C160 153 189 145 207 128L206 135C185 153 159 160 128 160C97 160 71 152 51 135Z','url(#h28-egg-bowl-rim)','stroke-width="2.4"');
  art+=line('M59 139Q128 169 198 139','#fffbed',2.3,.95);
  art+=line('M76 164Q102 181 129 182M140 182Q164 181 180 170','#b7ad8d',1.45,.76);
  return doc('葱香蛋饭',defs,art);
}

function searedPork(){
  const defs=grad('h28-pork-plate',['#f7f4e7','#e7e4d5','#c6cbc2'])
    +grad('h28-pork-crust',['#d88b4b','#bd6638','#97502f'])
    +grad('h28-pork-meat',['#dca06c','#c47b4c','#aa5d39']);
  let art=e(128,159,99,35,'url(#h28-pork-plate)');
  art+=e(128,155,87,26,'#f8f4e7','stroke="#b9c2b7" stroke-width="1.5"');
  art+=line('M48 165C69 182 105 188 139 185M151 184Q187 181 210 164','#fffcef',2,.9);
  const onion=(x,y,a,s)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-20 2C-16-20 15-20 20 0C18 16-7 23-20 9L-14 3C-5 14 12 9 13 0C10-11-10-11-12 3Z','#c68aa6','stroke="#7b4a65" stroke-width="1.7"')
    +line('M-15 1C-11-13 10-15 16-2','#f0c8d5',1.5,.9)+'</g>';
  art+=onion(69,148,-32,.95)+onion(190,151,19,.87)+onion(169,166,-24,.7);
  const slice=(x,y,a,s)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-35-13C-25-22-11-16 0-18C15-21 31-13 36-5C41 6 25 19 10 18C-5 21-17 13-29 14C-42 13-47-3-35-13Z','url(#h28-pork-crust)')
    +p('M-31-11C-16-10-13-3 0-4C14-6 24-3 30 3C21 9 13 10 4 8C-12 5-18 1-32 3C-38 1-37-7-31-11Z','#edc493','stroke="#a87545" stroke-width="1.4"')
    +p('M-29-12C-16-13-10-5 2-7C15-10 25-6 31-2L28 3C20-3 9-2 1 0C-12 1-18-7-30-6Z','url(#h28-pork-meat)','stroke="none"')
    +line('M-31-9C-19-11-12-3 0-4M10-5Q24-5 29 0','#ffe0ab',1.6,.92)
    +line('M-25 10L-17 13M4 13Q14 17 24 10','#713d2a',1.8,.7)+'</g>';
  art+=slice(104,112,-20,.87);
  art+=slice(153,117,12,.88);
  art+=slice(100,146,-10,.91);
  art+=slice(151,151,17,.9);
  art+=line('M84 174Q111 182 140 178','#c3c5b7',1.5,.72);
  return doc('香煎肉片',defs,art);
}

function garlicCucumber(){
  const defs=grad('h28-cucumber-plate',['#edf8e9','#cce5da','#97bdbe'])
    +grad('h28-cucumber-skin',['#72b855','#43914b','#2c6f41'])
    +grad('h28-cucumber-flesh',['#f0f4c2','#d5e6a2','#afd07e'])
    +grad('h28-garlic-gold',['#fff1c4','#e7cd86']);
  let art=e(128,158,99,32,'url(#h28-cucumber-plate)');
  art+=e(128,154,87,24,'#f6fae8','stroke="#91b7aa" stroke-width="1.5"');
  art+=line('M45 162C63 179 103 184 135 183M148 182Q185 180 211 161','#f5fff1',2,.88);
  const chunk=(x,y,a,s)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-24-8Q-23-18-11-19L17-14Q27-10 25 1L17 15Q2 21-13 17L-25 7Z','url(#h28-cucumber-skin)')
    +p('M-20-8Q-8-17 13-10L20 0L13 11Q-3 17-19 7Z','url(#h28-cucumber-flesh)','stroke="#67934b" stroke-width="1.4"')
    +p('M-14-1Q-3-12 10-4Q17 4 4 10Q-6 10-14 4Z','#f4f6cf','stroke="none"')
    +e(-7,-1,2,3.6,'#a5c47a','stroke="none" transform="rotate(-48 -7 -1)"')
    +e(1,1,2,3.6,'#a5c47a','stroke="none" transform="rotate(-48 1 1)"')
    +e(8,3,1.8,3.2,'#a5c47a','stroke="none" transform="rotate(-48 8 3)"')
    +line('M-17-5L-7-10M16 3L11 10','#faffdc',1.7,.9)
    +line('M-17 12L-9 16','#265b35',1.35,.7)+'</g>';
  art+=chunk(83,119,-20,.94)+chunk(128,108,13,.92)+chunk(174,129,30,.92);
  art+=chunk(78,153,12,.91)+chunk(126,144,-17,1.02)+chunk(171,157,-17,.86);
  const garlic=(x,y,a)=>`<g transform="translate(${x} ${y}) rotate(${a})">${p('M-5-4Q1-8 6-1L4 6Q-3 8-7 2Z','url(#h28-garlic-gold)','stroke="#a78e58" stroke-width="1.25"')}${line('M-3-2L1 3','#fff8dd',1.3,.9)}</g>`;
  art+=garlic(105,124,-18)+garlic(151,126,25)+garlic(145,165,12)+garlic(64,140,-27);
  return doc('蒜香黄瓜',defs,art);
}

function chickenRoll(){
  const defs=grad('h28-roll-plate',['#fff8e8','#eae4cf','#cbd1c2'])
    +grad('h28-roll-egg',['#ffda6c','#e8b347','#c68b36'])
    +grad('h28-roll-cut',['#fff1ba','#f1c665'])
    +grad('h28-roll-chicken',['#fff6dc','#e7d7b5','#cdbb94']);
  let art=p('M43 141Q39 129 55 124L193 121Q210 122 215 135L218 161Q214 176 196 180L61 184Q44 183 41 171Z','url(#h28-roll-plate)');
  art+=p('M52 141Q51 135 63 133L189 130Q203 131 205 139L209 157Q206 166 194 169L66 174Q54 173 52 165Z','#faf6e6','stroke="#b7c0b1" stroke-width="1.45"');
  art+=line('M54 176L89 179M154 175L192 174Q206 171 211 164','#fffbee',2,.86);
  art+=`<g transform="translate(143 110) rotate(13)">`;
  art+=p('M-48-15C-52-3-48 11-38 15L34 15C47 11 50-6 40-16L-37-20Z','url(#h28-roll-egg)');
  art+=e(-39,-1,14,19,'url(#h28-roll-cut)');
  art+=e(-39,-1,9.1,12.4,'url(#h28-roll-chicken)','stroke="#b58c48" stroke-width="1.5"');
  art+=line('M-23-13C-9-17 16-12 29-12','#ffe99c',2.3,.9);
  art+=line('M-17 9C-3 12 14 10 30 10','#a46d2b',1.8,.7);
  art+=p('M-28-7L-17-10M0-9L11-8M24-5L34-4','none','stroke="#b67b2d" stroke-width="2" opacity=".55"');
  art+='</g>';
  const cut=(x,y,a,s)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-24-2C-25-18-10-27 5-25C23-24 34-11 31 5L25 16C13 31-16 27-24 12Z','url(#h28-roll-egg)')
    +e(1,-1,25,22,'url(#h28-roll-cut)')
    +p('M-14-11C-9-19 5-18 13-12C23-4 21 7 12 13C3 21-13 14-17 5C-21-1-19-7-14-11Z','url(#h28-roll-chicken)','stroke="#a9854b" stroke-width="1.5"')
    +line('M-10-8C-6-12 0-12 4-9M7-4Q15 1 10 8M-10 2L-5 8','#fffbee',1.7,.9)
    +scallion(-3,-2,20,.66)+scallion(9,8,-18,.52)
    +line('M-17-14Q-7-24 6-20','#fff0ac',2,.9)
    +line('M-13 21Q3 29 19 17','#ad792e',1.6,.76)+'</g>';
  art+=cut(76,145,-15,.87)+cut(121,148,8,.93)+cut(169,151,19,.89);
  return doc('香煎鸡肉卷',defs,art);
}

function orangeRibs(){
  const defs=grad('h28-ribs-plate',['#9bb8aa','#6b9389','#466d69'])
    +grad('h28-ribs-glaze',['#f6a353','#d76d34','#ad4929'])
    +grad('h28-ribs-side',['#c66a35','#9a4328','#793923'])
    +grad('h28-ribs-orange',['#ffd77a','#ffb541','#e98b22']);
  let art=e(128,160,99,34,'url(#h28-ribs-plate)');
  art+=e(128,155,87,25,'#bdcfb5','stroke="#50766c" stroke-width="1.6"');
  art+=e(129,156,76,18,'#9db79c','stroke="none"');
  art+=line('M42 166Q124 202 214 164','#c8dbbf',2,.77);
  art+=`<g transform="translate(66 119) rotate(-24)">`;
  art+=p('M-25 4C-25-17-9-30 8-25C21-22 28-8 25 5Z','url(#h28-ribs-orange)','stroke="#a5692d" stroke-width="2.5"');
  art+=p('M-20 1C-19-15-7-25 6-21C16-18 22-9 21 1Z','#ffe4a1','stroke="none"');
  art+=p('M-16 0Q-14-12-7-16L-2 0ZM3 0L1-18Q12-18 16-7L8 0Z','#ffb53f','stroke="none"');
  art+=line('M-4 0L-8-18M2 0L5-19M7 1L17-9','#fff2c1',1.4,.93);
  art+='</g>';
  const rib=(x,y,a,s)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-22-3L-30-5Q-36-5-35 1Q-37 7-30 8L-20 6Z','#ead5a6','stroke="#8d7756" stroke-width="1.7"')
    +p('M-23-10Q-20-18-8-16L19-13Q29-10 28 2L25 13Q20 20 9 17L-19 12Q-27 8-23-10Z','url(#h28-ribs-side)')
    +p('M-21-10Q-19-16-8-14L18-11Q26-8 24 0L20 8Q16 12 6 10L-17 6Q-25 3-21-10Z','url(#h28-ribs-glaze)')
    +p('M-16-10C-4-14 10-9 17-8C22-7 21-3 16-3L-10-6C-15-5-20-7-16-10Z','#ffce82','stroke="none" opacity=".88"')
    +line('M-17 10Q0 18 16 13','#6e3022',1.4,.65)
    +line('M-11 1Q-2 4 6 3','#ef9b52',1.5,.75)+'</g>';
  art+=rib(104,112,-20,.9)+rib(151,117,13,.94)+rib(187,141,28,.83);
  art+=rib(77,149,-17,.86)+rib(122,150,8,.98)+rib(163,165,12,.88);
  art+=p('M91 132Q99 119 111 123L109 129Q101 127 97 137Z','#ec6544','stroke="#a5402d" stroke-width="1.6"');
  art+=p('M139 140Q148 128 158 133L155 139Q148 137 144 145Z','#f37d46','stroke="#a5402d" stroke-width="1.6"');
  art+=p('M175 118Q185 111 191 122L186 126Q181 119 177 124Z','#e35a3a','stroke="#a5402d" stroke-width="1.6"');
  return doc('橙香小排',defs,art);
}

export const homeTailCandidates=[
  {id:'dish-fresh-home-scallion-egg-rice',name:'葱香蛋饭',svg:scallionEggRice(),expectedOccupancy:.82,reason:'用蓬松白米、大片嫩蛋和清楚葱花表现葱香蛋饭，暖白短碗盛得饱满，区别彩蔬拌饭的彩丁混合形态。',design:{silhouette:'圆润暖白饭碗，白米边缘围住大片柔软嫩蛋',angle:'略俯视，可见米饭、蛋褶与碗内沿',material:'奶白米饭、嫩黄熟蛋和清亮葱花，大块柔光',identity:'嫩蛋盖饭与葱花身份清楚，避免以整枚煎蛋代替蓬松蛋饭',container:'温暖白陶短碗，含碗主体约82%'}},
  {id:'dish-fresh-home-seared-pork',name:'香煎肉片',svg:searedPork(),expectedOccupancy:.82,reason:'四片焦香五花肉露出熟肉与脂肪波带，紫洋葱弧丝衬托暖棕煎色，浅圆盘让薄片与橙香短排的切法明显区分。',design:{silhouette:'四片扁厚适中的熟五花肉错落相叠，外缘自然起伏',angle:'三分之四俯视，能读出薄片、焦边和脂肪带',material:'焦糖棕煎面、奶金脂肪与柔紫洋葱，克制油亮',identity:'煎熟肉片配紫洋葱，保持既定两种主料',container:'冷暖中性的浅圆陶盘，含盘主体约82%'}},
  {id:'dish-fresh-home-garlic-cucumber',name:'蒜香黄瓜',svg:garlicCucumber(),expectedOccupancy:.80,reason:'拍裂黄瓜块露出清亮籽芯与深绿外皮，少量金蒜粒点明蒜香；低矮椭圆盘与紫洋葱冷拌长条菜形成区别。',design:{silhouette:'六块不规则拍裂黄瓜围成紧凑一盘，大小与转向有节奏',angle:'俯视略带侧面，能看清籽芯和黄瓜皮厚度',material:'清脆绿皮、浅黄绿果肉与温金蒜粒，少量亮面',identity:'切块黄瓜加蒜末，直接对应现有配方',container:'浅蓝青瓷椭圆盘，含盘主体约80%'}},
  {id:'dish-fresh-home-chicken-roll',name:'香煎鸡肉卷',svg:chickenRoll(),expectedOccupancy:.82,reason:'金黄蛋皮包住熟白鸡肉与葱花，三片切卷露出真实层次，后方短卷建立卷形，摆盘紧凑而有食欲。',design:{silhouette:'三枚圆润切卷与一段完整短卷自然相叠，金黄蛋皮包裹轮廓明确',angle:'略俯视偏侧，清楚看切面与整卷外皮',material:'煎金蛋皮、熟白鸡肉纤维和翠绿葱花，避免生肉色',identity:'鸡肉裹入蛋皮的金黄切卷，对应鸡胸肉、鸡蛋与香葱',container:'温润圆角长瓷盘，含盘主体约82%'}},
  {id:'dish-fresh-home-orange-ribs',name:'橙香小排',svg:orangeRibs(),expectedOccupancy:.84,reason:'六块橙红酱小排自然铺叠，小骨端、半片甜橙和红椒切段共同表达橙香；短排切法与香煎肉片保持明显区别。',design:{silhouette:'低矮铺叠的六块短排，骨端短小，半片橙子靠盘内沿',angle:'略俯视，清楚看到短排切块、酱面与小骨端',material:'红金橙汁酱光、焦棕排肉、奶金小骨端和深青陶瓷',identity:'排骨、甜橙与红椒三种既定主料直接可读',container:'深青低矮椭圆盘，含盘主体约84%'}}
];

// Round 47: a cream-yellow fresh-poultry cart family, with visible functional upgrades.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.5,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".13" y1="0" x2=".84" y2="1">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const defs=id=>grad(`${id}-shell`,['#fff5cc','#f4dfa4','#dcbf79'])
  +grad(`${id}-side`,['#f0dda6','#d9bd7c','#b99e61'])
  +grad(`${id}-mint`,['#e8f5e9','#c5e2cf','#94bfa9'])
  +grad(`${id}-glass`,['#f8fff3','#e0f1e5','#bcddcc'])
  +grad(`${id}-metal`,['#f2f6ec','#cfddd2','#9db5a7'])
  +grad(`${id}-egg`,['#fffdf0','#fff1ce','#e9d5a2'])
  +grad(`${id}-breast`,['#ffe1ca','#f0c3a7','#d89e86']);
const doc=(id,art,dx=0,dy=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>禽肉推车 · 保鲜设备新版候选</title><defs>${defs(id)}</defs><g transform="translate(${dx} ${dy})" stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
const wheel=(id,x,y,r)=>`${p(`M${x-4} ${y-r-8}L${x+5} ${y-r-8}L${x+5} ${y-r+1}L${x-4} ${y-r+1}Z`,`url(#${id}-metal)`,'stroke="#768e7c" stroke-width="1.7"')}${e(x,y,r,r,`url(#${id}-metal)`,'stroke="#5b5a49" stroke-width="2.4"')}${e(x,y,r*.38,r*.38,'#bedbcc','stroke="#799783" stroke-width="1.35"')}${line(`M${x-r*.53} ${y-r*.25}Q${x-r*.4} ${y-r*.65} ${x-r*.03} ${y-r*.65}`,'#fcfff5',1.5,.98)}`;
const food=(id,x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})">${p('M-39 5C-44-2-39-14-33-16C-25-13-24-2-27 5Q-32 11-39 5Z',`url(#${id}-egg)`,'stroke="#9e8a63" stroke-width="1.6"')}${p('M-20 5C-25-2-20-13-14-15C-7-12-5-1-9 6Q-14 11-20 5Z',`url(#${id}-egg)`,'stroke="#9e8a63" stroke-width="1.6"')}${line('M-36-8Q-39-2-35 2M-17-8Q-20-2-16 2','#fffef4',1.35,.98)}${p('M8 5Q3-2 11-9Q13-18 25-15Q39-16 43-6Q49 3 40 10L22 12Q12 12 8 5Z',`url(#${id}-breast)`,'stroke="#ae806b" stroke-width="1.7"')}${p('M13-5Q18-13 27-10Q37-11 40-5Q28-6 22 2L13 4Z','#ffe7d3','stroke="none" opacity=".75"')}${line('M17-7Q22-3 27-1M26-9Q31-6 35-3M16 6L22 9','#cf9e86',1.3,.92)}</g>`;
const handle=(id,x,y)=>p(`M${x} ${y}H${x+18}Q${x+25} ${y} ${x+25} ${y+7}V${y+20}Q${x+25} ${y+25} ${x+19} ${y+25}H${x+8}V${y+17}H${x+17}V${y+8}H${x}Z`,`url(#${id}-metal)`,'stroke="#678776" stroke-width="2"');

function levelOne(){
  const id='r47-poultry-one';
  let art=line('M58 193H187','#829b8a',3,.95);
  art+=wheel(id,74,202,10.5)+wheel(id,176,202,10.5);
  // Low, clean cabinet and a shallow open service deck, not a wicker crate.
  art+=p('M48 144H184V183Q184 191 174 191H59Q49 191 48 183Z',`url(#${id}-shell)`);
  art+=p('M184 144L210 132V176L184 191Z',`url(#${id}-side)`,'stroke-width="2.6"');
  art+=p('M43 141L65 130H210L185 149H49Q44 149 43 145Z',`url(#${id}-mint)`,'stroke="#6f9e89" stroke-width="2"');
  art+=p('M51 141L69 135H200L183 143H51Z','#f9fff1','stroke="none"');
  // A broad half arch has an open front and no cage-like vertical bars.
  art+=p('M68 135V111C68 93 89 84 125 84C161 84 181 95 181 112V135Z',`url(#${id}-shell)`);
  art+=p('M78 135V112C78 100 94 94 125 94C155 94 171 101 171 113V135Z',`url(#${id}-glass)`,'stroke="#8cb7a2" stroke-width="1.5" fill-opacity=".85"');
  art+=line('M74 132V112Q75 90 125 90Q174 91 175 113V132','#91c1aa',1.8,.98);
  art+=line('M84 103Q94 96 111 96','#fffdf0',1.65,.98);
  art+=food(id,123,128,.97);
  art+=p('M71 137Q122 145 177 137L176 144Q123 152 72 144Z',`url(#${id}-mint)`,'stroke="#7fa58d" stroke-width="1.5"');
  art+=line('M60 157H172M59 181Q110 192 171 183','#fff7d9',1.75,.97);
  art+=line('M191 151L204 145M191 175L202 169','#e8d7a6',1.3,.9);
  return doc(id,art,1.5,-20);
}

function levelTwo(){
  const id='r47-poultry-two';
  let art=line('M56 198H191','#809c8a',3,.95);
  art+=wheel(id,74,208,11)+wheel(id,179,208,11);
  art+=handle(id,207,111);
  art+=p('M47 143H186V189Q186 198 176 198H59Q48 198 47 189Z',`url(#${id}-shell)`);
  art+=p('M186 143L211 130V183L186 198Z',`url(#${id}-side)`,'stroke-width="2.6"');
  art+=p('M42 140L64 128H211L187 149H48Q43 148 42 144Z',`url(#${id}-mint)`,'stroke="#6f9e89" stroke-width="2"');
  art+=p('M51 140L69 133H201L184 142H51Z','#fafff1','stroke="none"');
  // The back arch is visibly taller, leaving a larger pale, cool display chamber.
  art+=p('M64 135V101C64 77 85 63 124 63C162 63 184 78 184 102V135Z',`url(#${id}-shell)`);
  art+=p('M75 135V102C75 85 92 74 124 74C155 74 173 86 173 103V135Z',`url(#${id}-glass)`,'stroke="#8bb7a1" stroke-width="1.5" fill-opacity=".84"');
  art+=line('M70 132V102Q71 69 124 69Q178 70 178 103V132','#91c1aa',1.9,.98);
  art+=line('M85 90Q96 79 112 79M151 83L160 90','#fffdf1',1.7,.98);
  art+=food(id,123,128,1.04);
  art+=p('M69 137Q122 146 180 137L179 144Q123 153 70 144Z',`url(#${id}-mint)`,'stroke="#7fa58d" stroke-width="1.5"');
  // One substantial storage drawer is readable even at board-icon size.
  art+=p('M58 160H174V188Q172 192 166 192H66Q59 192 58 187Z','#fff2c4','stroke="#b39b62" stroke-width="1.5"');
  art+=p('M104 166H128Q132 166 132 169Q132 172 128 172H104Q101 172 101 169Q101 166 104 166Z',`url(#${id}-metal)`,'stroke="#76917d" stroke-width="1.4"');
  art+=line('M64 181H167M60 154H173','#fffae0',1.7,.97);
  art+=line('M193 151L204 145M193 177L204 170','#e8d7a6',1.3,.9);
  return doc(id,art,-9,-13);
}

function levelThree(){
  const id='r47-poultry-three';
  let art=line('M54 202H194','#809d89',3,.95);
  art+=wheel(id,73,213,11.7)+wheel(id,182,213,11.7);
  art+=handle(id,211,109);
  art+=p('M44 144H188V194Q188 203 177 203H57Q45 203 44 194Z',`url(#${id}-shell)`);
  art+=p('M188 144L216 130V188L188 203Z',`url(#${id}-side)`,'stroke-width="2.6"');
  art+=p('M40 141L64 127H216L189 150H46Q41 149 40 145Z',`url(#${id}-mint)`,'stroke="#6f9e89" stroke-width="2"');
  art+=p('M50 140L68 132H205L186 142H50Z','#fafff1','stroke="none"');
  // Rear shield: a higher rounded cover, with only broad panes and no cage bars.
  art+=p('M59 136V96C59 68 82 52 123 52C164 52 190 69 190 97V136Z',`url(#${id}-shell)`);
  art+=p('M70 135V98C70 77 89 64 123 64C157 64 179 78 179 99V135Z',`url(#${id}-glass)`,'stroke="#84b69f" stroke-width="1.5" fill-opacity=".82"');
  art+=line('M65 132V97Q66 58 123 58Q184 60 184 98V132','#8ebfa8',1.9,.98);
  art+=line('M82 85Q94 72 111 71M151 73Q164 77 169 85','#fffdf1',1.7,.98);
  art+=food(id,119,130,1.08);
  // A small empty preservation compartment sits beside the ingredients.
  art+=p('M169 114L185 111L192 118L191 135L174 138L168 131Z',`url(#${id}-mint)`,'stroke="#759e88" stroke-width="1.5"');
  art+=p('M172 117L184 115L188 119L176 122Z','#f9fff0','stroke="#aac8b4" stroke-width="1.3"');
  art+=line('M176 125V133L187 131','#bedac7',1.3,.98);
  // Front shield forms a second low curved cover. The horizontal arc keeps the food visible.
  art+=p('M67 139Q68 111 123 110Q179 111 185 139L182 146Q124 157 70 146Z',`url(#${id}-glass)`,'stroke="#7dab96" stroke-width="1.8" fill-opacity=".2"');
  art+=line('M73 135Q78 117 114 116M146 117Q171 122 177 134','#fbfff5',1.65,.97);
  art+=p('M66 141Q124 153 185 141L184 148Q124 161 67 148Z',`url(#${id}-mint)`,'stroke="#769f89" stroke-width="1.6"');
  // Deeper lower storage keeps the upgraded hood grounded in a practical cold cart.
  art+=p('M56 163H177V194Q176 198 168 198H64Q57 198 56 193Z','#fff2c4','stroke="#b19a61" stroke-width="1.5"');
  art+=p('M102 169H131Q135 169 135 172Q135 175 131 175H102Q99 175 99 172Q99 169 102 169Z',`url(#${id}-metal)`,'stroke="#76917d" stroke-width="1.4"');
  art+=line('M63 185H170M58 157H175','#fffae0',1.7,.97);
  art+=line('M196 155L209 149M196 182L209 175','#e6d5a3',1.3,.9);
  return doc(id,art,-10,-10.5);
}

export const producerPoultryCandidates=[
  {id:'poultry-cart-l1',code:'EQ04-L1',name:'禽肉推车',familyId:'poultry-cart',level:1,expectedOccupancy:.78,svg:levelOne(),
    reason:'奶油黄低台柜配浅半拱敞开保鲜舱、薄荷细边与两只轻金属轮，舱内只以两颗蛋和一份简洁鸡胸肉标识鲜禽链，保持低矮轻便。',
    design:{silhouette:'低台柜、宽浅半拱保鲜开口及两只小轮，前舱敞开且没有笼条',angle:'略俯视三分之四角度，台面、柜前脸与侧面厚度清楚',material:'奶油黄保鲜柜、薄荷青细边、浅冷玻璃后板、轻金属双轮与左上柔光',identity:'仅fresh-poultry链，两颗小鸡蛋与简洁鸡胸肉，不画整鸡、鸭腿、皮蛋或烤炉',upgrade:'一级为低台敞开保鲜小车，不加下抽屉、侧把手或双段护罩',presentation:'主体78%，透明留白；无文字、数字、等级角标或额外标志'}},
  {id:'poultry-cart-l2',code:'EQ04-L2',name:'禽肉推车',familyId:'poultry-cart',level:2,expectedOccupancy:.82,svg:levelTwo(),
    reason:'同家族奶油黄推车升高后拱形成更清楚的冷鲜展示空间，新增大收纳抽屉与侧把手，保留两颗蛋、简洁鸡胸肉和轻金属双轮。',
    design:{silhouette:'升高圆拱、宽保鲜台、大下抽屉和侧把手，两只轮保持轻巧',angle:'三分之四俯视，可见升高后舱与新增抽屉、把手的功能结构',material:'奶油黄与薄荷细边统一，玻璃后舱轻透，抽屉与双轮为轻金属材质',identity:'仅fresh-poultry链，只显示两颗小鸡蛋与一份简洁鸡胸肉',upgrade:'二级增加升高后拱、清楚下收纳抽屉与右侧把手，不靠装饰或角标升级',presentation:'主体82%，透明留白；无文字、数字、等级角标或额外食材'}},
  {id:'poultry-cart-l3',code:'EQ04-L3',name:'禽肉推车',familyId:'poultry-cart',level:3,expectedOccupancy:.84,svg:levelThree(),
    reason:'高拱推车以高后护罩加低前护罩形成双段保鲜结构，新增小隔层并深化收纳柜，两颗蛋与鸡胸肉仍清楚可见，奶油黄与薄荷细边保持鲜禽家族辨识。',
    design:{silhouette:'更高圆拱、双段透明保鲜护罩、小隔层、深收纳抽屉与轻金属双轮',angle:'三分之四俯视，前后护罩以曲面和横向接缝区分，不用笼状竖条',material:'奶油黄柜体、薄荷青细边、分段浅透玻璃与金属把手双轮，左上光柔和',identity:'仅fresh-poultry链，两颗小鸡蛋与简洁鸡胸肉，隔层保持空置，不引入退役禽肉身份',upgrade:'三级通过双段保鲜护罩、空小隔层及深收纳结构升级，区别红兽肉冷柜、绿菜棚车与木果箱',presentation:'主体84%，透明留白；无文字、数字、等级角标或额外标志'}}
];

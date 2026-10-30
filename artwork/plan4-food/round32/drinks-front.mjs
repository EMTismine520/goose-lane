// Round 32: five distinct fruit and tea drinks, editable transparent vector masters.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".86" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 鲜果料理台独立新版</title><defs>${defs}</defs><g stroke="#49382e" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
const ice=(x,y,a=0,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">${p('M-12-10L6-14L15-2L10 13L-8 12L-15 1Z','#eefaf2','stroke="#8bb9b0" stroke-width="1.35" opacity=".83"')}${line('M-10-8L5-10L11-2','#ffffff',1.8,.94)}${line('M-10-5L-10 2','#ffffff',1.6,.8)}</g>`;

function grapeDrink(){
  const body='M74 70L89 207Q128 226 167 207L182 70Z';
  const defs=grad('d32g-glass',['#f8fff0','#e7f3e4','#b8d5c3'])
    +grad('d32g-juice',['#c3a8d8','#a382bb','#7b5999'])
    +grad('d32g-grape',['#c799cf','#a875b9','#865098'])
    +grad('d32g-mulberry',['#b26fa5','#905a93','#6e477d'])
    +`<clipPath id="d32g-body">${p(body,'#fff')}</clipPath>`;
  let art=p('M143 92L154 30L165 32L154 96Z','#d7c5a5','stroke-width="2.6"');
  art+=line('M157 36L150 77','#f9ead2',1.7,.9);
  art+=p(body,'url(#d32g-glass)');
  art+='<g clip-path="url(#d32g-body)" stroke="none">';
  art+=p('M79 101Q127 118 178 100L166 207Q127 225 89 207Z','url(#d32g-juice)');
  art+=p('M85 158Q115 174 173 152L166 207Q128 222 90 206Z','#6f4e8b','opacity=".18"');
  art+=p('M88 119Q87 160 99 196Q104 202 105 195L99 124Q96 115 88 119Z','#e4d9ee','opacity=".54"');
  art+='</g>';
  art+=e(128,100,49,13,'#b89bcc','stroke="#805b99" stroke-width="1.5"');
  art+=p('M104 104L116 92L129 99L125 112L110 117Z','#dfc9e9','stroke="#a984bb" stroke-width="1.25"');
  art+=p('M144 101L153 93L162 101L157 112L145 111Z','#dac1e5','stroke="#a984bb" stroke-width="1.25"');
  art+=line('M108 103L116 97M147 101L153 97','#f4e6f6',1.4,.85);
  // Two large fruit pieces, rather than milk-tea-like rows of dark pearls.
  art+=e(113,160,13,12,'url(#d32g-grape)','stroke="#80548e" stroke-width="1.5"');
  art+=line('M106 155Q111 149 116 152','#e1bde5',1.7,.82);
  art+=`<g transform="translate(144 185) rotate(19)">`;
  art+=p('M-8-13Q-1-18 5-13Q13-14 14-7Q19-2 13 5Q14 13 6 13Q0 20-6 14Q-15 14-14 6Q-20 0-13-6Q-15-13-8-13Z','url(#d32g-mulberry)','stroke="#6e477c" stroke-width="1.4"');
  art+=line('M-6-7L-1-10M3-3L8-5M-7 4L-2 3M2 10L7 7','#cfa0c8',1.7,.8);
  art+='</g>';
  art+=e(128,70,54,15,'url(#d32g-glass)');
  art+=e(128,70,46,9,'#e9e9eb','stroke="#a5c1b4" stroke-width="1.35"');
  art+=line('M83 77L94 184M103 210Q128 218 153 211','#fbfff4',2.4,.92);
  art+=line('M170 119L164 185','#dcebdc',1.6,.8);
  // A compact grape pair and one leaf make the flavour legible at the rim.
  art+=`<g transform="translate(82 73) rotate(-15)">`;
  art+=e(-1,-6,13,12,'url(#d32g-grape)','stroke="#71467c" stroke-width="1.8"');
  art+=e(13,7,12,12,'url(#d32g-grape)','stroke="#71467c" stroke-width="1.8"');
  art+=line('M-7-10Q-3-15 2-13M7 3Q11-1 15 1','#e8c8e8',1.6,.9);
  art+=p('M0-15Q-8-23-17-16Q-15-3-3-6Z','#8bb258','stroke="#5d7f3d" stroke-width="1.6"');
  art+=line('M-3-10L-12-15','#d1df9e',1.2,.85);
  art+='</g>';
  return doc('葡萄果肉饮',defs,art);
}

function mangoCoconut(){
  const body='M86 76Q89 112 76 149Q62 188 88 204Q128 225 168 204Q194 188 180 149Q167 112 170 76Z';
  const defs=grad('d32m-glass',['#fff9df','#f8eed4','#c5d4bd'])
    +grad('d32m-juice',['#ffe0a0','#f8bd57','#e79b38'])
    +grad('d32m-mango',['#ffdc7b','#ffc252','#ed9f30'])
    +grad('d32m-coconut',['#c69a6b','#a87d55','#885f3c'])
    +`<clipPath id="d32m-body">${p(body,'#fff')}</clipPath>`;
  let art=p(body,'url(#d32m-glass)');
  art+='<g clip-path="url(#d32m-body)" stroke="none">';
  art+=p('M83 103Q129 116 173 104L183 161Q191 190 164 204Q128 220 90 204Q65 190 73 161Z','url(#d32m-juice)');
  art+=p('M86 104Q107 109 123 105Q143 97 173 106L173 122Q151 116 134 122Q111 129 85 120Z','#fff1ca');
  art+=p('M90 128Q80 166 86 184Q90 192 95 192Q100 190 97 182Q93 163 100 136Q100 129 90 128Z','#fff1c6','opacity=".74"');
  art+=p('M174 151Q182 185 160 198Q164 191 167 183L168 148Z','#bd7e30','opacity=".15"');
  art+='</g>';
  art+=e(128,77,42,11,'url(#d32m-glass)');
  art+=e(128,77,34,6.4,'#fff1c9','stroke="#cbbf95" stroke-width="1.2"');
  art+=line('M93 204Q126 219 159 205','#fff9df',2.4,.92);
  art+=line('M83 151Q77 174 83 186','#fdf9df',2.3,.85);
  // Mango flesh on the rim has a cut grid and an orange skin edge, never a citrus wheel.
  art+=`<g transform="translate(155 66) rotate(24)">`;
  art+=p('M-23-16Q0-29 23-13L16 18Q-5 25-26 10Z','url(#d32m-mango)','stroke="#a76c2b" stroke-width="2.3"');
  art+=p('M-22 7Q-5 19 16 14L16 19Q-6 26-26 10Z','#e39a32','stroke="none"');
  art+=line('M-17-10L-20 4M-4-15L-7 13M10-14L6 15M-20-1L14 5','#d29235',1.4,.9);
  art+=line('M-17-13Q-3-19 10-14','#fff0b4',1.6,.92);
  art+='</g>';
  // One small coconut crescent ties the pale coconut layer to the actual recipe.
  art+=`<g transform="translate(81 198) rotate(-17)">`;
  art+=p('M-23-4Q-20 20 0 22Q21 20 24-4Q2 3-23-4Z','url(#d32m-coconut)','stroke-width="2.3"');
  art+=p('M-17-2Q-14 14 0 16Q15 14 18-2Q1 3-17-2Z','#fff8df','stroke="#ddccaa" stroke-width="1.3"');
  art+=line('M-18 8L-15 13M-9 17L-5 19M13 14L17 10','#795336',1.25,.85);
  art+='</g>';
  return doc('热带芒果汁',defs,art);
}

function lemonTea(){
  const body='M70 77L85 211Q128 231 171 211L186 77Z';
  const defs=grad('d32l-glass',['#faffed','#e6eed7','#afcbb9'])
    +grad('d32l-tea',['#edc578','#d8a055','#bc793a'])
    +grad('d32l-lemon',['#ffe881','#f7cf55','#e4b23a'])
    +`<clipPath id="d32l-body">${p(body,'#fff')}</clipPath>`;
  let art=p('M142 89L157 28L170 31L155 92Z','#8fa391','stroke="#526d58" stroke-width="2.6"');
  art+=line('M161 35L150 81','#dfe9c7',1.8,.9);
  art+=p(body,'url(#d32l-glass)');
  art+='<g clip-path="url(#d32l-body)" stroke="none">';
  art+=p('M74 102Q128 116 182 103L170 211Q128 231 85 210Z','url(#d32l-tea)');
  art+=p('M79 169Q130 183 176 169L170 213Q128 229 85 211Z','#9b5f32','opacity=".13"');
  art+='</g>';
  art+=e(128,103,53,12,'#e8bc69','stroke="#ad783b" stroke-width="1.4"');
  art+=ice(107,113,-13,.75)+ice(148,112,18,.68)+ice(137,139,-5,.65);
  const lemon=(x,y,a,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +e(0,0,27,22,'url(#d32l-lemon)','stroke="#b18a33" stroke-width="1.7"')
    +e(0,0,22,17.5,'#fff4bd','stroke="none"')
    +p('M-18-3Q-11-15-2-14L-2-2ZM3-14Q15-11 18-3L4-2ZM-18 3L-3 2L-2 14Q-14 13-18 3ZM3 3L18 3Q14 13 3 14Z','#f0cc67','stroke="none"')
    +e(.4,.3,2.3,2.1,'#fff8d8','stroke="none"')
    +line('M-18-3L-3-1M3-13L3-2M3 3L15 10','#fff9d4',1.05,.8)
    +'</g>';
  art+=lemon(108,168,-31,.92);
  art+=lemon(153,189,31,.87);
  art+=line('M81 113L90 193M100 213Q128 223 156 214','#fcffdf',2.3,.88);
  art+=line('M178 130L171 188','#e2e9c7',1.6,.74);
  // A flat sealed rim keeps the large lemon tea recognisably a hand-muddled takeout drink.
  art+=p('M67 70Q128 51 189 70L188 81Q128 99 68 81Z','#d5e3d0','stroke-width="2.6"');
  art+=e(128,70,61,14,'#f7f9e5','stroke-width="2.6"');
  art+=e(128,70,52,8,'#e6e7cc','stroke="#aebfa4" stroke-width="1.2"');
  art+=p('M147 75L157 29L170 32L159 78Z','#91a993','stroke="#526d58" stroke-width="2.6"');
  art+=line('M160 36L152 69','#dfe9c7',1.6,.9);
  art+=line('M80 68Q113 60 137 63','#fffef0',2,.9);
  return doc('鹅鹅手打柠檬茶',defs,art);
}

function peachWater(){
  const body='M66 96Q66 160 83 191Q96 216 128 217Q160 216 173 191Q190 160 190 96Z';
  const defs=grad('d32p-glass',['#f9fff0','#e4efdf','#afcbc0'])
    +grad('d32p-water',['#f8e3cf','#f0c8be','#dca4af'])
    +grad('d32p-peach',['#ffe6ba','#f6cba8','#e99e99'])
    +grad('d32p-skin',['#f1b0a0','#e29191','#c87184'])
    +`<clipPath id="d32p-body">${p(body,'#fff')}</clipPath>`;
  let art=p(body,'url(#d32p-glass)');
  art+='<g clip-path="url(#d32p-body)" stroke="none">';
  art+=p('M68 124Q128 142 188 124Q185 176 168 199Q151 219 128 219Q104 218 88 199Q71 176 68 124Z','url(#d32p-water)');
  art+=p('M74 136Q80 170 93 188Q98 194 100 189Q99 185 96 180Q86 159 86 137Z','#fff6e0','opacity=".6"');
  art+=p('M164 145Q164 180 150 196L165 192Q178 177 182 147Z','#c58e9c','opacity=".1"');
  art+='</g>';
  art+=e(128,125,59,14,'#f7d9cb','stroke="#cfaead" stroke-width="1.3"');
  art+=ice(108,125,-18,.8)+ice(150,134,18,.81);
  // A pale peach wedge floats in the water: soft flesh and blush skin, without cream or tea.
  art+=`<g transform="translate(135 177) rotate(-12)">`;
  art+=p('M-27-2Q-17-21 4-19Q23-18 29 4Q9 24-14 17Z','url(#d32p-skin)','stroke="#b77983" stroke-width="1.65"');
  art+=p('M-22-1Q-12-17 4-15Q19-15 24 2Q6 18-12 12Z','url(#d32p-peach)','stroke="none"');
  art+=line('M-8-10Q-5-4 1 0Q7 2 13 0','#e3aa9a',1.6,.88);
  art+=line('M-17 1Q-7-10 4-10','#fff0d1',1.7,.88);
  art+='</g>';
  art+=e(128,96,62,15,'url(#d32p-glass)');
  art+=e(128,96,53,9,'#f1f5e4','stroke="#afc8b9" stroke-width="1.2"');
  art+=line('M77 112Q80 171 97 193M109 210Q133 218 154 205','#fbfff0',2.4,.92);
  art+=line('M179 122Q175 162 164 183','#dce8d8',1.6,.9);
  // One large fresh peach slice sits over the rim, making the flavour readable without a label.
  art+=`<g transform="translate(85 89) rotate(-18)">`;
  art+=p('M-24-19Q-7-34 11-25Q29-14 25 8Q9 18-7 13Q-21 7-24-19Z','url(#d32p-skin)','stroke="#a76a74" stroke-width="2.3"');
  art+=p('M-19-17Q-5-29 8-21Q23-12 20 5Q7 12-5 8Q-17 3-19-17Z','url(#d32p-peach)','stroke="none"');
  art+=line('M-5-19Q-1-12 2-8Q8-5 12-4','#e3ab99',1.6,.85);
  art+=line('M-15-14Q-5-23 5-18','#fff0ce',1.8,.95);
  art+='</g>';
  return doc('冰镇水蜜桃露',defs,art);
}

function pearlMilkTea(){
  const body='M73 83L85 206Q128 227 171 206L183 83Z';
  const defs=grad('d32b-glass',['#f9fff0','#e8f1dc','#b9d1bf'])
    +grad('d32b-tea',['#e9d0a8','#d3ad7d','#b88a5e'])
    +grad('d32b-pearl',['#886045','#64432f','#483227'])
    +`<clipPath id="d32b-body">${p(body,'#fff')}</clipPath>`;
  let art=p('M130 92L146 31L162 35L147 96Z','#94714f','stroke="#59422f" stroke-width="2.7"');
  art+=line('M150 39L140 81','#d6b485',2,.85);
  art+=p(body,'url(#d32b-glass)');
  art+='<g clip-path="url(#d32b-body)" stroke="none">';
  art+=p('M76 111Q128 127 181 111L171 206Q128 227 85 206Z','url(#d32b-tea)');
  art+=p('M79 113Q103 119 124 115Q148 108 180 114L179 130Q151 124 130 132Q108 137 80 130Z','#f2dfbf');
  art+=p('M84 182Q130 196 175 181L171 208Q128 225 85 208Z','#8c6144','opacity=".17"');
  art+='</g>';
  art+=e(128,112,51,11,'#e8cea4','stroke="#ac865d" stroke-width="1.3"');
  // Seven substantial pearls stay grouped at the bottom rather than scattering up the tea.
  for(const [x,y,rx,ry]of [[105,175,8.7,8.2],[129,170,8.8,8.6],[152,177,8.4,8.2],[96,194,8.7,8.2],[118,197,9.1,8.6],[143,196,8.8,8.5],[162,193,7.7,7.6]]){
    art+=e(x,y,rx,ry,'url(#d32b-pearl)','stroke="#50372a" stroke-width="1.45"');
    art+=e(x-2.4,y-2.7,2.3,1.4,'#b68a61','stroke="none" opacity=".7"');
  }
  art+=line('M84 122L92 174M102 211Q129 222 156 212','#fff3d7',2.5,.86);
  art+=line('M176 130L170 174','#e8ddbc',1.6,.85);
  // A low domed plastic lid keeps the milk tea distinct from the flat-sealed lemon cup.
  art+=p('M70 78Q77 48 105 45Q137 41 161 55Q178 63 186 79Z','url(#d32b-glass)','stroke-width="2.6"');
  art+=line('M83 65Q96 51 113 52','#ffffff',2.2,.85);
  art+=p('M69 77Q128 91 188 77L187 86Q128 104 70 86Z','#d3e1cd','stroke-width="2.6"');
  art+=e(128,77,59,12,'#f1f5dd','stroke-width="2.6"');
  art+=e(128,77,50,6.5,'#dde7cf','stroke="#a8bf9f" stroke-width="1.2"');
  art+=p('M134 82L146 31L162 35L150 84Z','#92704f','stroke="#59422f" stroke-width="2.7"');
  art+=line('M150 40L142 73','#d6b485',1.8,.85);
  return doc('珍珠奶茶',defs,art);
}

export const drinksFrontCandidates=[
  {id:'dish-fresh-ico-0031',name:'葡萄果肉饮',svg:grapeDrink(),expectedOccupancy:.82,reason:'透紫色果汁配两种大果肉，杯沿一对葡萄、杯内一枚可辨桑葚；果肉与奶茶珍珠分开表达，高直杯留出清楚透光。',design:{silhouette:'高直透明杯略收底，斜插细吸管与杯沿葡萄形成活泼轮廓',angle:'略俯视，能看杯口、果肉及液面',material:'清透紫果汁、淡亮果肉、柔紫葡萄与深莓桑葚，克制玻璃反光',identity:'葡萄与桑葚各有大形，避免整杯画成黑珍珠奶茶',container:'无柄高杯，含杯主体约82%'}},
  {id:'dish-fresh-ico-0047',name:'热带芒果汁',svg:mangoCoconut(),expectedOccupancy:.82,reason:'金黄芒果浓汁与椰白层放入收腰圆腹杯，切格芒果和一小瓣椰肉直接说明主料；不使用容易与柠檬混淆的圆片。',design:{silhouette:'圆腹收腰热带果汁杯，杯沿切格芒果与底侧椰肉形成高低节奏',angle:'略俯视，果汁厚度、芒果切格和椰肉截面清楚',material:'浓金芒果汁、柔白椰汁与白椰肉，轻透玻璃承托厚实果汁',identity:'芒果切块与椰肉两项配方身份明确，避免柑橘外观',container:'圆腹无柄果汁杯，含主料主体约82%'}},
  {id:'dish-fresh-ico-0091',name:'鹅鹅手打柠檬茶',svg:lemonTea(),expectedOccupancy:.84,reason:'琥珀红茶中两片大柠檬和三块小冰清楚可读，扁平封口与斜吸管强调手打外带杯；透光与酸甜颜色鲜活而不拥挤。',design:{silhouette:'大口收底外带杯，扁平封口和斜吸管识别清楚',angle:'略俯视，可读封口、茶液、冰块与柠檬切面',material:'琥珀红茶、嫩黄柠檬、清亮冰块和柔绿塑料反光，细深轮廓',identity:'两片柠檬落在茶液中，实际对应柠檬、红茶与糖浆',container:'无柄封口透明杯，含吸管最长边约84%'}},
  {id:'dish-fresh-ico-0164',name:'冰镇水蜜桃露',svg:peachWater(),expectedOccupancy:.82,reason:'圆润无柄玻璃杯盛淡桃粉清水，两块冰与两片桃肉保留通透，杯沿桃瓣建立鲜果身份；不加奶油，也不画成奶茶。',design:{silhouette:'宽口圆腹玻璃杯，杯沿桃瓣打破规整边缘，轻盈舒展',angle:'略俯视，杯口、清水液面和桃肉截面可见',material:'淡桃粉清水、柔桃果肉与珊瑚粉薄皮，反光克制不做乳状',identity:'水蜜桃与矿泉水冷饮，少量冰块辅助冰镇感',container:'圆腹无柄清饮杯，含桃瓣主体约82%'}},
  {id:'dish-fresh-ico-0009',name:'珍珠奶茶',svg:pearlMilkTea(),expectedOccupancy:.82,reason:'温润奶茶色与底部七颗黑糖珍珠建立主次，宽吸管、低圆顶盖和奶色涟漪共同表现奶茶，区别透紫果肉饮与琥珀柠檬茶。',design:{silhouette:'圆润收底奶茶杯，低圆顶盖与宽吸管组成完整外带轮廓',angle:'略俯视，可见封盖、奶茶液面与底部珍珠',material:'乳茶琥珀色、深棕黑糖珍珠、柔亮塑料盖，清晰细深描边',identity:'红茶、牛奶与七颗聚拢黑糖珍珠，不加无关水果或奶油顶',container:'透明低圆顶奶茶杯，含吸管主体约82%'}}
];

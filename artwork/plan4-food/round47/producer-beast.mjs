// Round 47: three structural upgrades of the dedicated beast-meat cold display cart.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const r=(x,y,w,h,rx,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function meatCart(level){
  const prefix=`r47-beast-l${level}-`,g=id=>`url(#${prefix+id})`;
  const defs=grad(prefix+'cream',['#fffdf0','#f0ead6','#d9cfb3'])
    +grad(prefix+'red',['#efaa8a','#db7968','#bc5b51'])
    +grad(prefix+'glass',['#f6fff0','#d8e9df','#b4d2c8'])
    +grad(prefix+'metal',['#eef1df','#c4d0c6','#8eaaa3'])
    +grad(prefix+'steak',['#edaaa1','#d7827c','#b8605e'])
    +grad(prefix+'sausage',['#eaa184','#d47d66','#ac5c4e']);
  let art=e(134,215,92,11,'#62735a','stroke="none" opacity=".13"');

  if(level===3){
    // Thin metal supports are behind the cabinet and keep the small roof structurally grounded.
    art+=r(80,56,5,53,2,g('metal'),'stroke="#66786e" stroke-width="2"');
    art+=r(205,58,5,57,2,g('metal'),'stroke="#66786e" stroke-width="2"');
  }
  if(level>=2){
    // A real transparent rear guard rises in an arc, with a lower edge above the food tray.
    art+=p('M83 100C83 74 104 59 139 58C176 55 203 72 211 100L205 109L89 109Z',g('glass'),'fill-opacity=".36"');
    art+=line('M91 89C96 71 113 65 137 65Q172 62 193 83','#fffff2',1.8,.96);
    art+=line('M87 100Q144 109 205 101','#a2bdb1',1.5,.96);
  }

  // Exactly two wheels, with softly rounded rubber and small warm metal hubs.
  art+=e(77,205,11,14,'#62665c');
  art+=e(188,205,11,14,'#62665c');
  art+=e(77,205,5.2,7,'#dfd8b8','stroke="#969b83" stroke-width="1.4"');
  art+=e(188,205,5.2,7,'#dfd8b8','stroke="#969b83" stroke-width="1.4"');
  art+=line('M72 199Q73 195 77 195M183 199Q184 195 188 195','#9da58a',1.4);

  // A compact metal side gives depth to the low refrigerated cabinet.
  art+=p('M200 137L218 118L220 177Q220 187 204 196L198 185Z',g('metal'));
  art+=line('M211 140L214 170M210 180L205 185','#eff6e8',1.55,.98);
  art+=p('M54 137L201 137L204 183Q204 194 192 197L66 197Q53 196 52 185Z',g('cream'));
  // A red bumper is enamel on the cart, not a label or a badge.
  art+=p('M54 184Q125 190 203 184L204 189Q204 196 193 198L65 198Q54 197 53 191Z',g('red'));
  art+=line('M62 187Q127 193 194 187','#ffd7ba',1.55,.96);

  if(level===1){
    art+=r(64,148,126,31,8,'#f7f1dd','stroke="#c5bda1" stroke-width="1.45"');
    art+=line('M71 153L111 153M72 174L123 174','#fffdf0',1.55);
    art+=line('M166 157L180 157M166 163L180 163M166 169L180 169','#b7b59d',1.45,.94);
  }else{
    // Upgrade two is a useful double-door cold cabinet, with two independent handles.
    art+=r(63,148,62,34,6,'#f7f2e0','stroke="#c1baa0" stroke-width="1.45"');
    art+=r(130,148,62,34,6,'#eae7d3','stroke="#b6b49b" stroke-width="1.45"');
    art+=line('M128 146L128 183','#a7a58e',1.45);
    art+=r(115,157,4,13,2,g('metal'),'stroke="#6b7e72" stroke-width="1.5"');
    art+=r(136,157,4,13,2,g('metal'),'stroke="#6b7e72" stroke-width="1.5"');
    art+=line('M70 153L101 153M145 153L182 153','#fffdf0',1.55,.96);
  }

  // The tilted upper display is continuous glass over one clean metal food tray.
  art+=p('M83 96L209 96Q214 96 216 103L202 139L57 139L77 101Q79 97 83 96Z',g('red'));
  art+=p('M86 103L207 103L196 131L69 131Z',g('glass'),'fill-opacity=".52" stroke="#6f8a7c" stroke-width="1.7"');
  art+=p('M85 117L197 117L193 130L72 130Z','#f4f1dc','stroke="#a9b6a2" stroke-width="1.4"');
  art+=line('M75 128L190 128','#fffff2',1.45);

  // One small fat-edged beast-meat steak, with no poultry bones or seafood imagery.
  let steak=p('M-26 1Q-22-13-8-15Q5-17 17-8Q28-7 28 5Q24 19 9 21Q-11 19-26 10Z','#fff0cf','stroke="#8c6553" stroke-width="2.2"');
  steak+=p('M-20 1Q-17-8-7-10Q5-12 14-4Q22-3 22 5Q18 14 7 15Q-7 13-20 7Z',g('steak'),'stroke="#b16e65" stroke-width="1.35"');
  steak+=line('M-13-3Q-8-7-2-5M4 1Q10 1 14 7M-7 5L0 9','#f8d3b6',1.4);
  steak+=line('M-21 8Q-10 16 4 17','#fff8e3',1.4);
  art+=`<g transform="translate(105 116) rotate(-9) scale(.76)">${steak}</g>`;
  // Two short sausages have different bends and end ties; the tray is never piled with meat.
  art+=p('M145 113Q159 108 176 112Q181 114 179 118Q177 123 171 121Q158 118 148 121Q142 122 141 118Q140 115 145 113Z',g('sausage'),'stroke="#855448" stroke-width="2.1"');
  art+=p('M153 123Q167 119 183 124Q188 127 185 131Q183 134 178 132Q165 128 156 131Q151 132 150 128Q149 125 153 123Z',g('sausage'),'stroke="#855448" stroke-width="2.1"');
  art+=line('M148 115Q158 112 168 115M156 125Q166 123 176 127','#ffd4b2',1.4,.96);
  art+=line('M142 115L139 114M179 116L182 116M150 126L147 125M185 129L188 130','#88584a',1.3);
  // Glass highlights remain at the edges so the three food pieces stay visible.
  art+=p('M86 106L93 106L80 126L74 126Z','#fffef1','stroke="none" opacity=".74"');
  art+=line('M104 104L123 104M196 110L191 123','#fffff3',1.65,.95);
  art+=line('M63 135L195 135','#ffd3b5',1.55,.92);

  // A small pushing grip is part of the equipment, not a food sign.
  art+=line('M216 123L229 122Q233 122 233 127L232 138','#66796d',3.1);
  art+=line('M220 123L228 123','#e3ebd9',1.35);

  if(level===3){
    // A compact side refrigeration unit adds a functional shape below the short canopy.
    art+=p('M216 148L229 143L233 149L232 173L219 179L215 173Z',g('metal'),'stroke="#5f746a" stroke-width="2.5"');
    art+=line('M220 154L228 151M220 160L228 157M220 166L228 163','#718d80',1.45);
    art+=line('M218 149L226 146M230 151L229 169','#f8fff0',1.4);
    // A low red-and-cream striped awning is a real third-level structure, with no text.
    art+=p('M81 39L193 39Q199 39 202 45L219 62L61 62L75 45Q78 40 81 39Z',g('cream'));
    art+=p('M82 40L101 40L94 62L65 62L78 45Z',g('red'),'stroke="none"');
    art+=p('M124 40L144 40L149 62L118 62Z',g('red'),'stroke="none"');
    art+=p('M168 40L190 40L215 62L180 62Z',g('red'),'stroke="none"');
    art+=p('M61 62L219 62L218 70Q210 79 199 71Q187 79 176 71Q164 79 152 71Q140 79 129 71Q117 79 105 71Q94 79 82 71Q70 78 62 70Z',g('cream'));
    art+=p('M62 63L86 63L83 71Q70 78 62 70Z',g('red'),'stroke="none"');
    art+=p('M112 63L136 63L129 71Q117 79 105 71Z',g('red'),'stroke="none"');
    art+=p('M161 63L185 63L176 71Q164 79 152 71Z',g('red'),'stroke="none"');
    art+=p('M207 63L219 63L218 70Q210 79 199 71Z',g('red'),'stroke="none"');
    art+=line('M80 44L96 44M128 44L139 44M173 44L188 44','#fff7d9',1.4,.96);
    art+=line('M67 63L212 63','#ffe8c8',1.5,.95);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>兽肉推车 · 冷藏展示器材新版</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const producerBeastCandidates=[1,2,3].map(level=>({
  id:`beast-meat-cart-l${level}`,code:`EQ03-L${level}`,name:'兽肉推车',familyId:'beast-meat-cart',level,
  expectedOccupancy:[.78,.82,.84][level-1],svg:meatCart(level),
  reason:[
    '圆角奶白红边冷藏小车，以斜透明展示柜面、银白食材托盘与两只圆轮构成轻快轮廓；仅展示一片脂肪边肉排和两根短香肠，清楚标识兽肉来源。',
    '在同一家族冷藏小车上增加后部透明防护弧罩，下面改为双门冷柜和两枚独立金属把手；食材与斜玻璃展示仍清楚可见，等级靠结构升级。',
    '保留透明防护罩与双门冷柜，增加短红奶油条纹棚及侧面紧凑金属制冷模块；棚、柜、轮与食材分层清楚，不靠堆肉或单纯放大表现升级。'
  ][level-1],
  design:{
    silhouette:['矮圆角冷藏展示小车，斜玻璃面和恰好两只轮子','斜玻璃小车加后弧形透明防护罩及下双门冷柜','短红奶油条棚、后弧形防护罩、下双门冷柜和侧面小制冷模块'][level-1],
    angle:'三分之四俯视，能看见食材托盘、斜柜面、奶白柜体和浅金属侧面，左上光',
    material:'奶白搪瓷、柔暖珊瑚红包边、轻透玻璃、灰绿银色金属、圆润深灰胶轮，细近黑清楚描边',
    identity:'唯一产出链为fresh-beast；食材仅一片脂肪边兽肉肉排与两根短香肠，无禽类、禽骨、海鲜或蔬果',
    progression:'L1斜玻璃双轮小车，L2后弧罩与下双门把手，L3短条棚与侧制冷结构；三级共用同家族配色，靠结构变化区分',
    container:'不使用底盘地板、文字、数字、等级角标或徽章；自然浅投影、透明留白与视觉居中'
  }
}));

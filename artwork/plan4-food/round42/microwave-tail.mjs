// Round 42: two warm drinks, with deliberately different vessels and silhouettes.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 微波炉热饮新版</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function hotCocoa(){
  const defs=grad('r42-d103-saucer',['#f8fff0','#deebd9','#a6c3ad'])
    +grad('r42-d103-cup',['#9bcdc0','#70b4a9','#4c928a'])
    +grad('r42-d103-handle',['#90c7b9','#62aaa0','#43867f'])
    +grad('r42-d103-chocolate',['#a97550','#825438','#603a2b']);
  let art=e(128,182,88,23,'url(#r42-d103-saucer)');
  art+=e(128,178,75,17,'#fbfff1','stroke="#b0c5a9" stroke-width="1.4"');
  art+=line('M57 189Q84 201 120 201M145 200Q183 196 201 185','#fafff4',1.7);
  art+=e(124,177,47,11,'#6c8b6a','stroke="none" opacity=".14"');
  // One open loop handle attaches to the squat ceramic body, with clear negative space.
  art+=p('M171 120C190 112 209 121 210 139C213 159 194 173 174 168L173 156C187 160 198 151 198 140C197 130 186 125 176 132Z','url(#r42-d103-handle)');
  art+=line('M185 122Q203 122 204 138M202 150Q198 157 191 160','#c5e7d6',1.6);
  // A wide, low cup has a rounded belly, without a tall cylinder or extra foot.
  art+=p('M65 115Q64 143 73 162Q81 180 118 182Q155 183 169 166Q179 151 178 115Z','url(#r42-d103-cup)');
  art+=p('M72 126Q78 132 80 148Q82 165 100 171Q88 171 81 164Q72 152 72 126Z','#c9e8d6','stroke="none" opacity=".77"');
  art+=p('M155 128Q164 126 171 121Q171 151 162 162Q151 175 128 175L116 173Q145 172 153 157Q157 146 155 128Z','#3e8982','stroke="none" opacity=".36"');
  art+=line('M85 169Q101 177 119 177M132 177Q146 176 155 171','#b5dfca',1.65,.98);
  art+=line('M73 132L75 142','#edf7df',1.7,.96);
  art+=e(121.5,115,56.5,17,'#d1e8d4');
  art+=e(121.5,113.5,49,11.5,'url(#r42-d103-chocolate)','stroke="#6c4c37" stroke-width="1.5"');
  // Milk is a loose ripple within the cocoa, never a mound of cream or marshmallows.
  art+=p('M88 112Q102 104 121 109Q136 112 133 117Q128 121 113 119Q100 118 99 114Q100 111 109 111Q118 111 121 114Q120 116 114 115','none','stroke="#f5ddb1" stroke-width="1.8"');
  art+=line('M138 109Q151 110 156 113','#bd9164',1.35,.95);
  art+=e(145,117.5,1.9,.9,'#edcf9e','stroke="none"');
  art+=e(151,115.5,1.2,.7,'#e6c38f','stroke="none"');
  art+=e(94,115,1.3,.7,'#efd3a4','stroke="none"');
  art+=line('M76 114Q79 122 97 125M108 128Q136 131 157 122','#f1fae7',1.5,.96);
  // Two fine, unequal steam curls rise directly from the warm drink.
  art+=line('M105 94C95 85 109 78 107 68Q106 63 103 60','#b9a388',1.8,.76);
  art+=line('M136 92C146 83 132 78 137 68Q139 65 139 61','#b9a388',1.8,.7);
  return doc('热可可',defs,art);
}

function cinnamonHotMilk(){
  const defs=grad('r42-d104-glass',['#eef9f0','#d1e5df','#adc9c2'])
    +grad('r42-d104-milk',['#fffced','#f6ebcc','#e4d3a7'])
    +grad('r42-d104-cinnamon',['#dca16a','#b87a48','#8f5634']);
  let art=e(128,201,48,9,'#587969','stroke="none" opacity=".12"');
  // A tall, handle-free heatproof glass tapers gently toward its thick, rounded base.
  art+=p('M87 96L94 182Q95 198 128 200Q161 199 164 183L169 96Z','url(#r42-d104-glass)','fill-opacity=".38"');
  art+=p('M94 111L100 180Q102 191 128 193Q155 192 158 181L162 111Z','url(#r42-d104-milk)','stroke="#bba87f" stroke-width="1.4"');
  art+=p('M101 124L105 176Q109 185 128 187Q145 187 155 180Q152 192 128 193Q102 191 100 180L96 122Z','#d9c693','stroke="none" opacity=".37"');
  art+=e(128,112,34,9,'#fff9e7','stroke="#c2b08b" stroke-width="1.4"');
  art+=p('M105 112Q114 106 127 109Q141 115 151 110Q143 117 130 116Q118 111 105 115Z','#f4e2bb','stroke="none"');
  art+=line('M108 111Q119 107 128 111M135 115L144 113','#fffef1',1.45,.98);
  // Sparse cinnamon dust remains a few warm brown flecks, with no cocoa or toppings.
  art+=e(118,110.5,1.7,.8,'#b58250','stroke="none"');
  art+=e(135.5,113.5,1.3,.75,'#ba8754','stroke="none"');
  art+=e(128,108.5,1,.6,'#ae7849','stroke="none"');
  art+=e(141,110,1.05,.65,'#bd8e5d','stroke="none"');
  art+=e(122,115,1,.65,'#bc8853','stroke="none"');
  art+=e(128,96,41,12,'url(#r42-d104-glass)','fill-opacity=".38"');
  art+=e(128,96,34.5,7.8,'none','stroke="#b3c7bb" stroke-width="1.35"');
  art+=line('M94 96Q94 91 104 89M111 86Q127 83 142 87','#fffff4',1.7,.94);
  // Long narrow reflections describe transparent glass without concealing the milk.
  art+=p('M93 107L97 108L102 169Q102 175 101 178L97 173Z','#fffef0','stroke="none" opacity=".64"');
  art+=line('M98 116L100 145M101 154L103 170','#fffff4',1.6,.94);
  art+=line('M161 121L158 157M158 166L157 176','#faffee',1.45,.72);
  art+=line('M102 188Q111 196 128 196Q142 196 153 189','#f9fff1',1.65,.96);
  // Exactly one cinnamon quill leans against the right side of the glass.
  let stick=p('M-6-39Q0-44 6-38L7 37Q1 44-6 38Z','url(#r42-d104-cinnamon)','stroke="#795033" stroke-width="2.3"');
  stick+=p('M-4-36L-1-37L2 35L-1 39L-4 36Z','#edbb80','stroke="none" opacity=".82"');
  stick+=line('M2-34Q-1-10 2 12L3 34','#815032',1.4,.95);
  stick+=line('M-1-27L0-7M0 8L1 24','#ffe0a3',1.25,.78);
  stick+=e(0,-38.5,6,3.2,'#c58b57','stroke="#795033" stroke-width="1.5"');
  stick+=p('M-3-39Q2-41 3-38Q2-36-1-37Q-3-38-1-39','none','stroke="#7f4b2f" stroke-width="1.25"');
  stick+=line('M-2 39L2 40','#e7b47a',1.3);
  art+=`<g transform="translate(170 150) rotate(-13)">${stick}</g>`;
  // Light asymmetrical steam keeps the tall silhouette airy and warm.
  art+=line('M113 81C105 72 119 65 114 56Q113 53 112 51','#bfa98b',1.8,.72);
  art+=line('M141 81C150 73 139 67 143 59Q145 56 144 52','#bfa98b',1.8,.66);
  return doc('肉桂热牛奶',defs,art);
}

export const microwaveTailCandidates=[
  {id:'dish-fresh-ico-0105',code:'DS103',name:'热可可',expectedOccupancy:.82,svg:hotCocoa(),
    reason:'矮圆蓝绿陶瓷杯以单侧开环杯柄和饱满杯腹建立温暖厚实的大形；巧克力棕饮面只有一圈松散牛奶涟漪和细小奶泡，两缕轻蒸汽自然升起。',
    design:{silhouette:'矮圆陶杯、单侧开环柄与安静小碟，宽而低的杯腹明显区别于高玻璃杯',angle:'三分之四俯视，椭圆巧克力饮面、陶瓷圆口和杯柄内孔均清楚',material:'柔亮蓝绿釉陶、温暖巧克力棕饮面、克制奶色涟漪和两条细蒸汽弧',identity:'仅纯牛奶与巧克力；无棉花糖、奶油高塔、肉桂或配方外装饰',container:'低矮单柄蓝绿陶杯，浅青白小碟安静承托，含碟82%体量和透明留白'}},
  {id:'dish-fresh-ico-0163',code:'DS104',name:'肉桂热牛奶',expectedOccupancy:.82,svg:cinnamonHotMilk(),
    reason:'较高的无柄耐热玻璃杯透出柔暖象牙奶色，窄长反光与厚圆杯底描出通透材质；杯侧仅一支细肉桂棒，饮面几粒浅棕肉桂粉衬托温热奶纹。',
    design:{silhouette:'高而修长的无柄玻璃杯，略收窄圆底，一支斜靠肉桂棒与轻蒸汽，不复用低陶杯模板',angle:'三分之四俯视，薄玻璃口、奶面、纵向杯壁和圆厚杯底清楚',material:'通透浅青玻璃、象牙暖奶、浅棕肉桂粉、红棕卷筒肉桂棒与细窄白色高光',identity:'仅纯牛奶与肉桂；不加巧克力、棉花糖、咖啡、额外奶油或其它装饰',container:'高无柄耐热玻璃杯，单棒轻靠杯侧，仅自然浅投影，含蒸汽82%体量和透明留白'}}
];

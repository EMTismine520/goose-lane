// Round 42: two sweet corn segments and four soft mango pieces, with clear ingredient shapes.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.5,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 微波料理新版候选</title><defs>${defs}</defs><g transform="translate(0 ${dy})" stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
const kernel=(x,y,w,h,fill,angle=0)=>`<g transform="translate(${x} ${y}) rotate(${angle})">${p(`M${-w/2} ${-h/2+2}Q${-w/2+1} ${-h/2-1} 0 ${-h/2}Q${w/2} ${-h/2-1} ${w/2} ${-h/2+3}L${w/2-.5} ${h/2-2}Q${w/2-2} ${h/2+1} 0 ${h/2}Q${-w/2} ${h/2+1} ${-w/2} ${h/2-2}Z`,fill,'stroke="#c58e2e" stroke-width="1.3"')}${line(`M${-w/2+3} ${-h/2+2}L${w/2-3} ${-h/2+2}`,'#ffeaa2',1.3,.94)}</g>`;

function caramelCorn(){
  const defs=grad('r42-corn-plate',['#f9fcf1','#dcebe1','#a6c8bd'])
    +grad('r42-corn-body',['#ffdb75','#efbb42','#d49a2d'])
    +grad('r42-corn-grain',['#ffe38a','#f8ca58','#e7ac35'])
    +grad('r42-corn-kernel',['#ffdc71','#f0b93d','#d99b29'])
    +grad('r42-corn-core',['#fff2cc','#eddbab','#d0b777']);
  let art=e(128,161,100,32,'url(#r42-corn-plate)');
  art+=e(128,157,87,23,'#fefff2','stroke="#afc3aa" stroke-width="1.4"');
  art+=line('M45 169Q80 189 122 188M140 188Q184 185 211 166','#fcfff5',1.85,.98);
  // A longer rear segment, its cylinder and yellow kernel rows ending at a cream cob core.
  let first=p('M-31-22Q1-25 33-19Q43-17 44-5Q47 9 37 20Q4 27-31 23Z','url(#r42-corn-body)');
  first+=kernel(-17,-14,13,11,'url(#r42-corn-grain)',-3);
  first+=kernel(-3,-14.8,13.5,11,'url(#r42-corn-grain)',1);
  first+=kernel(11,-14,13,11,'url(#r42-corn-kernel)',-2);
  first+=kernel(24,-12.7,12,10,'url(#r42-corn-grain)',4);
  first+=kernel(-17,-2,14,12,'url(#r42-corn-kernel)',1);
  first+=kernel(-2,-2.3,13.5,12,'url(#r42-corn-grain)',-1);
  first+=kernel(12,-1.5,13.5,12,'url(#r42-corn-grain)',2);
  first+=kernel(25,-1,12,11,'url(#r42-corn-kernel)',3);
  first+=kernel(-17,11,14,12,'url(#r42-corn-grain)',-2);
  first+=kernel(-2,11,13,12,'url(#r42-corn-kernel)',2);
  first+=kernel(12,11,13,11.5,'url(#r42-corn-grain)',0);
  first+=kernel(25,10,11.5,10.5,'url(#r42-corn-kernel)',4);
  // A transparent amber glaze follows a few kernels, instead of becoming popcorn lumps.
  first+=p('M-23-8Q-6-11 9-6Q22-10 33-5L31 1Q17-3 7 2Q-7-2-23 2Z','#c58b25','stroke="none" opacity=".19"');
  first+=line('M-17-17L-12-17M-2-17L3-17M13-5L17-4M23 8L27 8','#fff1b5',1.5,.97);
  first+=e(-31,0,14,22,'#edba42','stroke="#8c692f" stroke-width="2.3"');
  first+=p('M-35-20Q-30-23-26-18L-27-13L-34-14Z','#ffda69','stroke="#c08d2f" stroke-width="1.2"');
  first+=p('M-41-12L-37-18L-34-13L-36-6L-42-5Z','#f7cd57','stroke="#c08d2f" stroke-width="1.2"');
  first+=p('M-44-2L-38-4L-36 4L-40 9L-44 6Z','#ffda6d','stroke="#c08d2f" stroke-width="1.2"');
  first+=p('M-40 11L-35 7L-31 13L-31 20Q-37 21-40 15Z','#f6c34c','stroke="#c08d2f" stroke-width="1.2"');
  first+=p('M-27 13L-23 8L-20 12Q-21 19-27 21Z','#ffdc6f','stroke="#c08d2f" stroke-width="1.2"');
  first+=e(-30.5,0,7.8,13.2,'url(#r42-corn-core)','stroke="#c3a263" stroke-width="1.4"');
  first+=e(-30.5,0,3.6,6.8,'#fff1ce','stroke="#dbc38b" stroke-width="1.3"');
  first+=line('M-34-8Q-37-2-33 4M-29 7L-27 5','#fff7de',1.4,.98);
  art+=`<g transform="translate(97 124) rotate(-24)">${first}</g>`;

  // The second, shorter segment tilts the other way, with an oblique cut facing right.
  let second=p('M-25-18Q-3-24 23-19Q35-15 37-2Q38 11 28 20Q0 26-25 19Q-33 10-32-2Q-31-12-25-18Z','url(#r42-corn-body)');
  second+=kernel(-18,-13,12,10.5,'url(#r42-corn-grain)',-4);
  second+=kernel(-4,-14,13,11,'url(#r42-corn-grain)',2);
  second+=kernel(10,-13,12,10.5,'url(#r42-corn-kernel)',3);
  second+=kernel(-20,-1,12,12,'url(#r42-corn-kernel)',-2);
  second+=kernel(-5,-1.5,13.5,12,'url(#r42-corn-grain)',2);
  second+=kernel(10,-1,12.5,12,'url(#r42-corn-grain)',-2);
  second+=kernel(-18,11.5,12,11,'url(#r42-corn-grain)',1);
  second+=kernel(-4,12,13,11,'url(#r42-corn-kernel)',-2);
  second+=kernel(10,11,11.5,10.5,'url(#r42-corn-grain)',3);
  second+=p('M-24 4Q-10 1 2 6Q12 3 19 7L17 12Q9 9 1 13Q-10 8-24 10Z','#bd8123','stroke="none" opacity=".18"');
  second+=line('M-19-16L-15-16M-5-17L0-17M-18 9L-13 8M9-4L12-4','#fff0b0',1.5,.97);
  second+=e(24,0,12.8,20.8,'#f3c54e','stroke="#8c692f" stroke-width="2.3"');
  second+=p('M20-19L26-20L30-15L26-12L20-13Z','#ffdc72','stroke="#c08d2f" stroke-width="1.2"');
  second+=p('M33-12L36-5L32-1L28-6L29-12Z','#f7cf60','stroke="#c08d2f" stroke-width="1.2"');
  second+=p('M35 4L33 12L28 13L27 6L31 1Z','#ffdd74','stroke="#c08d2f" stroke-width="1.2"');
  second+=p('M26 14L26 20L20 19L17 13L20 10Z','#f4bf46','stroke="#c08d2f" stroke-width="1.2"');
  second+=e(23.5,0,7.2,12.8,'url(#r42-corn-core)','stroke="#c3a263" stroke-width="1.4"');
  second+=e(23.5,0,3.3,6.3,'#fff1ce','stroke="#dbc38b" stroke-width="1.3"');
  second+=line('M20-8Q18-3 21 1M25 5L26 8','#fff8df',1.4,.98);
  art+=`<g transform="translate(162 146) rotate(17)">${second}</g>`;
  return doc('焦糖玉米段',defs,art,-9);
}

function mangoCubes(){
  const defs=grad('r42-mango-plate',['#fffaf0','#e8e2ca','#c0c3a7'])
    +grad('r42-mango-top',['#ffd28c','#ffbb67','#f0a04b'])
    +grad('r42-mango-gold',['#ffc071','#f2a34a','#d88b32'])
    +grad('r42-mango-orange',['#ffb66a','#f19a43','#d88230']);
  let art=e(128,160,100,32,'url(#r42-mango-plate)');
  art+=e(128,156,87,23,'#fffdf0','stroke="#b8c0a0" stroke-width="1.4"');
  art+=line('M45 169Q80 189 122 188M141 188Q183 185 211 166','#fffef5',1.85,.98);
  art+=p('M62 152Q76 142 94 148Q113 141 133 148Q153 141 172 150Q181 158 166 164Q145 169 125 166Q102 171 81 165Q65 166 62 158Z','#efc66a','stroke="none" opacity=".24"');
  // Four individually drawn soft pieces vary in width, height, direction, and bevels.
  art+=p('M73 111Q71 105 80 102L94 96Q102 93 109 101L114 109Q119 117 112 129Q103 141 91 139L80 135Q70 133 72 124Z','url(#r42-mango-orange)');
  art+=p('M76 109Q84 103 95 100Q101 98 105 104L109 111Q109 117 98 122L91 124Q81 122 76 117Z','url(#r42-mango-top)','stroke="none"');
  art+=p('M77 120L93 127L107 116L104 129Q97 136 88 133L77 126Z','#f7b760','stroke="none"');
  art+=line('M82 108Q88 104 94 104M78 117L82 119M97 132L101 129','#ffe7b1',1.7,.97);
  art+=p('M128 110Q130 102 139 101Q146 98 154 104L168 112Q178 118 171 128Q163 136 153 142Q145 146 136 139L128 132Q121 124 128 110Z','url(#r42-mango-gold)');
  art+=p('M131 109Q139 103 147 106L163 115Q169 119 165 124Q157 130 150 131Q138 127 129 119Z','url(#r42-mango-top)','stroke="none"');
  art+=p('M132 123L150 135L165 127L158 136Q151 142 145 137L133 131Z','#f4b05a','stroke="none"');
  art+=line('M136 108Q141 105 147 108M155 114L161 117M153 138L158 135','#ffe7b0',1.7,.98);
  art+=p('M63 145Q67 138 77 141L96 147Q107 151 102 160Q97 168 87 172Q78 176 71 168L64 161Q58 153 63 145Z','url(#r42-mango-gold)');
  art+=p('M66 145Q72 142 78 146L95 151Q101 154 96 158Q89 163 83 162Q72 159 64 152Z','url(#r42-mango-top)','stroke="none"');
  art+=p('M67 155L82 166L96 161L89 168Q80 174 73 165Z','#f2ad54','stroke="none"');
  art+=line('M70 145L78 147M86 151L94 153M73 166L78 169','#ffe8b6',1.7,.98);
  art+=p('M112 147Q115 139 125 138Q134 136 141 144L153 153Q160 160 153 168L141 178Q133 183 125 177L114 169Q104 162 112 147Z','url(#r42-mango-orange)');
  art+=p('M115 147Q121 142 129 143Q134 142 139 148L148 155Q154 160 148 164Q140 169 133 169Q119 164 111 157Z','url(#r42-mango-top)','stroke="none"');
  art+=p('M114 160L133 173L146 166L139 175Q133 179 127 174L115 165Z','#f7b15b','stroke="none"');
  art+=line('M119 147Q124 144 129 146M137 150L145 156M123 174L128 177','#ffe7b0',1.7,.98);
  // A single small, thin lemon wedge stays yellow beside the distinctly orange mango.
  art+=p('M179 148Q186 136 197 140L207 150Q198 161 183 156Z','#edc936','stroke="#8f7435" stroke-width="1.9"');
  art+=p('M184 148Q190 141 196 144L202 150Q195 156 186 153Z','#fff0a1','stroke="#d0b147" stroke-width="1.3"');
  art+=line('M186 149L199 150M192 144L192 153M197 146L195 153','#fffbe0',1.3,.98);
  return doc('酸甜芒果丁',defs,art,-10);
}

export const microwaveMiddleCandidates=[
  {id:'dish-fresh-ico-0054',code:'DS101',name:'焦糖玉米段',expectedOccupancy:.82,svg:caramelCorn(),
    reason:'两段完整厚甜玉米错向摆放，一长一短的桶形与斜切面清楚，饱满金黄粒面围绕浅奶色玉米芯，薄琥珀焦糖釉与少量焦亮点保持鲜活食欲，不画爆米花。',
    design:{silhouette:'两段短粗完整玉米，一段斜向展开、一段反向切口，玉米粒与芯的关系自然',angle:'三分之四俯视，可见饱满粒面、斜切断面和中心玉米芯',material:'鲜金黄玉米粒、浅奶色玉米芯、薄琥珀焦糖釉与克制高光',identity:'只有玉米与焦糖，不画爆米花，不添加叶子、黄油块或其它配料',container:'浅青白小圆盘，成品含盘82%，粒纹清楚但不过碎，透明留白'}},
  {id:'dish-fresh-ico-0069',code:'DS102',name:'酸甜芒果丁',expectedOccupancy:.82,svg:mangoCubes(),
    reason:'四块大小、方向与切面不等的暖橙金芒果肉柔润自然，果汁薄光与圆软边缘增加食欲，一小薄柠檬角保持鲜黄色，和偏橙芒果清楚区分。',
    design:{silhouette:'四块独立软润芒果丁，一高一宽、前后大小不等，避免重复标准方块',angle:'三分之四俯视，各块上切面、软侧面与小柠檬角均可辨',material:'暖橙金果肉、柔润果汁高光、薄鲜黄柠檬角，不使用黄瓜绿或相同黄块',identity:'仅芒果与柠檬，不加薄荷、叶子、奶油或其它水果',container:'浅米白小圆盘，成品含盘82%，四块果肉聚拢但不堆多，透明留白'}}
];

// Round 45: two distinct bar drinks, drawn only from their current ingredient identities.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.5,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".15" y1="0" x2=".83" y2="1">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 吧台新版候选</title><defs>${defs}</defs><g transform="translate(0 ${dy})" stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function coconutGingerLemon(){
  const defs=grad('r45-coconut-glass',['#eff8f0','#dfead7','#bfd0b6'])
    +grad('r45-coconut-water',['#fffdf0','#f6edcf','#e9d9a5'])
    +grad('r45-coconut-ice',['#fbfff4','#dfede0','#c2d7c6'])
    +grad('r45-coconut-ginger',['#fff0ce','#e6cc9c','#c9aa73']);
  // A low, broad frosted tumbler, with no handle and no copper or alcohol cues.
  let art=p('M34 97L42 187Q128 211 214 187L222 97Z','url(#r45-coconut-glass)','fill-opacity=".52"');
  art+=p('M43 111L50 181Q128 200 206 181L213 111Z','url(#r45-coconut-water)','stroke="#bdb99b" stroke-width="1.4" fill-opacity=".86"');
  art+=e(128,111,85,20,'#fbf7df','stroke="#b9c5ad" stroke-width="1.4" fill-opacity=".87"');
  art+=p('M50 129Q78 139 104 133Q134 141 158 134Q185 139 208 129L204 175Q127 192 53 175Z','#fffbed','stroke="none" opacity=".27"');
  // Exactly two thin ice pieces have shallow cut faces and quiet cool reflections.
  art+=p('M73 103L96 91L117 101L115 109L95 120L75 111Z','url(#r45-coconut-ice)','stroke="#8ca795" stroke-width="1.55" fill-opacity=".78"');
  art+=p('M73 103L96 91L117 101L95 113Z','#fcfff6','stroke="#aac0ad" stroke-width="1.3" fill-opacity=".88"');
  art+=line('M95 113L95 119M79 103L95 96','#ffffff',1.5,.92);
  art+=p('M135 103L155 93L177 108L175 115L158 125L137 112Z','url(#r45-coconut-ice)','stroke="#8ca795" stroke-width="1.55" fill-opacity=".76"');
  art+=p('M135 103L155 93L177 108L159 119Z','#fcfff6','stroke="#aac0ad" stroke-width="1.3" fill-opacity=".86"');
  art+=line('M159 119L158 124M141 103L154 98','#ffffff',1.5,.92);
  art+=e(128,97,94,24,'none','stroke="#78917f" stroke-width="1.7"');
  art+=line('M43 93Q55 79 82 78M173 79Q202 82 213 94','#fbfff1',1.8,.95);
  // Soft frosted wall reflections avoid the hard facet pattern of the cola glass.
  art+=line('M48 124L54 170M207 124L201 169','#fffef2',2,.9);
  art+=line('M64 185Q128 203 194 184','#f9fff0',1.9,.94);
  art+=line('M75 195Q128 208 183 193','#c9d9bd',1.4,.86);
  art+=e(65,146,1.6,2.2,'#fbfff4','stroke="none" opacity=".8"');
  art+=e(190,157,1.5,2.1,'#fbfff4','stroke="none" opacity=".75"');
  // One small ginger slice sits beside the base, with a thin skin and three soft fibres.
  art+=p('M44 181Q45 174 53 174Q58 169 64 174L72 178Q77 184 70 190L63 195Q54 196 49 190Q42 190 44 181Z','url(#r45-coconut-ginger)','stroke="#9e835d" stroke-width="1.9"');
  art+=p('M49 181Q51 176 56 178Q62 173 66 179L71 182Q70 187 63 190Q56 192 52 187Q47 187 49 181Z','#f6e2b8','stroke="#d6ba85" stroke-width="1.2"');
  art+=line('M53 180L59 186M59 178L64 184M64 180L67 182','#cdb182',1.3,.92);
  // A single small yellow lemon wedge rests at the right rim: never a green lime.
  art+=p('M193 106Q201 91 214 98L225 109Q214 122 198 116Z','#edca35','stroke="#8f7738" stroke-width="1.9"');
  art+=p('M198 106Q205 97 213 101L220 109Q212 117 201 112Z','#fff1a5','stroke="#cfb34b" stroke-width="1.3"');
  art+=line('M201 107L217 109M207 101L207 112M214 104L211 113','#fffbe1',1.3,.98);
  return doc('椰青姜柠饮',defs,art,-13);
}

function tequilaScrewdriver(){
  const defs=grad('r45-screwdriver-glass',['#edf8ed','#d1e2d2','#afc9b5'])
    +grad('r45-screwdriver-juice',['#ffd68d','#f6b75b','#e29a3d'])
    +grad('r45-screwdriver-ice',['#fff9e3','#eee7cc','#d6d6b9'])
    +grad('r45-screwdriver-orange',['#ffc875','#f7ac44','#dc882f']);
  // A narrow, straight-wall highball with a visibly thick, clear base.
  let art=p('M81 45L81 208Q128 234 175 208L175 45Z','url(#r45-screwdriver-glass)','fill-opacity=".3"');
  art+=p('M87 65L87 199Q128 218 169 199L169 65Z','url(#r45-screwdriver-juice)','stroke="#c09a56" stroke-width="1.3" fill-opacity=".92"');
  art+=e(128,65,41,11,'#ffd991','stroke="#d6b770" stroke-width="1.3" fill-opacity=".88"');
  art+=p('M91 80L91 195Q98 202 104 202L102 78Z','#ffe8b1','stroke="none" opacity=".25"');
  // Two geometric ice cubes are kept whole, not a mound of soda crushed ice.
  art+=p('M99 70L119 60L137 77L133 97L111 99L97 86Z','url(#r45-screwdriver-ice)','stroke="#9fa88c" stroke-width="1.5" fill-opacity=".8"');
  art+=p('M99 70L119 60L137 77L116 84Z','#fffce9','stroke="#b8bea0" stroke-width="1.3" fill-opacity=".9"');
  art+=line('M116 84L111 99M103 71L117 65','#fffef1',1.5,.94);
  art+=p('M132 105L151 99L165 115L160 133L140 136L128 120Z','url(#r45-screwdriver-ice)','stroke="#9fa88c" stroke-width="1.5" fill-opacity=".76"');
  art+=p('M132 105L151 99L165 115L145 121Z','#fff9df','stroke="#b8bea0" stroke-width="1.3" fill-opacity=".88"');
  art+=line('M145 121L140 136M136 106L149 103','#fffdec',1.5,.93);
  // Long quiet planes distinguish the cut glass from the curved soda cup and short stem glass.
  art+=p('M91 55L99 58L101 201L93 205Z','#fcfff1','stroke="none" opacity=".25"');
  art+=p('M156 57L165 54L164 202L156 207Z','#f7ffe8','stroke="none" opacity=".2"');
  art+=line('M94 58L94 199M112 60L112 205M146 60L146 205M162 58L162 199','#f8ffeb',1.5,.7);
  art+=line('M101 61L102 198M155 61L155 201','#c8b36d',1.3,.55);
  art+=p('M82 200Q128 219 174 200L174 209Q128 234 82 209Z','url(#r45-screwdriver-glass)','stroke="#91aa96" stroke-width="1.5" fill-opacity=".48"');
  art+=line('M89 206Q128 224 168 206','#fbfff1',1.9,.95);
  art+=line('M101 210L104 220M152 210L149 220','#c5d8c4',1.3,.8);
  art+=e(128,45,47,14,'none','stroke="#78927e" stroke-width="1.7"');
  art+=line('M86 42Q96 34 111 34M145 34Q162 35 170 43','#fbfff0',1.8,.95);
  // One sweet-orange half wheel, with its small white pith and orange flesh.
  art+=p('M174 62C191 48 214 73 201 94Z','url(#r45-screwdriver-orange)','stroke="#9f6e34" stroke-width="1.9"');
  art+=p('M178 63C191 55 208 74 200 89Z','#fff0bd','stroke="#e8ad54" stroke-width="1.2"');
  art+=p('M181 65C192 60 204 75 199 85Z','#ffbd62','stroke="#e79b3e" stroke-width="1.2"');
  art+=line('M187 77L191 64M187 77L201 72M187 77L201 83','#fff2cb',1.3,.98);
  return doc('龙舌兰螺丝刀',defs,art,-1);
}

export const barTailCandidates=[
  {id:'dish-fresh-ico-0111',code:'DS116',name:'椰青姜柠饮',expectedOccupancy:.84,svg:coconutGingerLemon(),
    reason:'低宽无柄磨砂玻璃杯里，淡椰白到柔嫩金色的清爽液体托起两块薄冰，一小姜片与鲜黄柠檬楔明确当前原料，保持透感与轻盈光泽。',
    design:{silhouette:'低宽桶状无柄杯、两块薄冰，一小姜片在杯侧，一小柠檬楔在杯沿',angle:'三分之四俯视，可见宽杯口、薄冰面和低矮磨砂杯壁',material:'淡椰白至柔嫩金色清爽液体、轻磨砂玻璃、薄冰、浅姜片与鲜黄柠檬',identity:'仅椰青水、姜汁水、柠檬；不用旧莫斯科之骡酒基，不加薄荷、青柠或椰肉',container:'低宽磨砂无柄桶状玻璃杯，含杯84%，细近黑描边与透明留白'}},
  {id:'dish-fresh-ico-0118',code:'DS117',name:'龙舌兰螺丝刀',expectedOccupancy:.84,svg:tequilaScrewdriver(),
    reason:'窄长直壁竖切高杯与厚玻璃底承托清亮橙汁自然渐变，两枚完整几何冰块和一小甜橙半轮保持主料辨识，区别高弧碎冰苏打杯及宽口短梗杯。',
    design:{silhouette:'窄长直壁高杯，清楚竖切面和厚底，两枚几何冰块与一小甜橙半轮',angle:'略俯视直壁高杯，可见杯口、冰块切面、竖切玻璃壁与厚底',material:'自然深浅过渡的清亮橙汁、透明冰块、竖切玻璃与鲜橙果肉',identity:'仅龙舌兰、甜橙，不加红糖浆、樱桃、柠檬或配方外装饰',container:'窄长直壁竖切厚底高杯，含杯84%，与DS113高弧苏打杯及DS115宽口短梗杯区分，透明留白'}}
];

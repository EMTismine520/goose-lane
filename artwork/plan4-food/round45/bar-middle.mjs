// Round 45: egg milk in a small ceramic cup, and orange-lemon ice in a wide coupe.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 吧台饮品新版</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function sweetEggMilk(){
  const defs=grad('r45-d114-saucer',['#fbfff0','#e4ebda','#bdceb6'])
    +grad('r45-d114-ceramic',['#fffdf0','#f3ecd8','#d8cfb4'])
    +grad('r45-d114-milk',['#ffeab5','#e9c77f','#cda058']);
  let art=e(125,181,87,22,'url(#r45-d114-saucer)');
  art+=e(125,177,74,16,'#fffef2','stroke="#b8c6a8" stroke-width="1.4"');
  art+=line('M55 188Q84 200 118 199M143 199Q180 195 198 184','#fffff6',1.7);
  art+=e(123,177,42,9,'#94805c','stroke="none" opacity=".13"');
  // The single handle is on the left; its small open loop remains clear at board size.
  art+=p('M81 120C64 109 49 122 49 137C47 152 61 166 79 160L79 150C68 155 60 147 60 138C60 129 68 125 78 131Z','url(#r45-d114-ceramic)');
  art+=line('M67 119Q53 122 54 135M55 146Q58 153 65 155','#fffff4',1.6);
  // A slightly narrowed mouth opens into a softly rounded, low ceramic belly.
  art+=p('M79 111Q70 134 79 158Q87 179 120 181Q153 182 164 161Q174 140 164 111Z','url(#r45-d114-ceramic)');
  art+=p('M83 124Q79 140 86 155Q91 167 105 171Q92 169 86 161Q77 149 80 136Z','#fffef4','stroke="none" opacity=".88"');
  art+=p('M153 124Q165 129 165 142Q166 161 150 171Q137 179 117 175Q143 175 151 160Q157 145 153 124Z','#cbbfa0','stroke="none" opacity=".3"');
  art+=line('M90 166Q104 176 122 176M132 176Q145 174 152 168','#fffdf1',1.65,.96);
  art+=e(121.5,111,42.5,13,'#fff9e7');
  art+=e(121.5,110,35.5,8.5,'url(#r45-d114-milk)','stroke="#b18d52" stroke-width="1.4"');
  // Fine milk ribbons and tiny bubbles are part of the silky egg milk, not toppings.
  art+=p('M96 109Q108 103 120 107Q134 112 146 107Q141 114 128 113Q115 107 104 111','none','stroke="#fff2cd" stroke-width="1.8"');
  art+=line('M103 114Q115 119 129 115M132 107L140 107','#edce8e',1.3,.94);
  art+=e(144,112.5,1.6,.8,'#f7e4b4','stroke="#d9b675" stroke-width="1.1"');
  art+=e(98.5,112,1.2,.65,'#f7e4b4','stroke="none"');
  art+=e(136.5,114.5,1.1,.6,'#f8e8bf','stroke="none"');
  art+=line('M85 113Q90 121 106 123M116 124Q140 126 155 115','#fffff4',1.5,.98);
  // A quiet amber reflection, entirely within the drink, gives the syrup warmth.
  art+=line('M144 108Q151 109 153 111','#d7a35a',1.35,.85);
  return doc('香甜蛋奶饮',defs,art);
}

function orangeLemonIcedDrink(){
  const defs=grad('r45-d115-glass',['#f8fff1','#deebe0','#b6cdc1'])
    +grad('r45-d115-liquid',['#ffdc75','#f4c34f','#dfa73a'])
    +grad('r45-d115-lemon',['#fff2a5','#f7de73','#dbba4d']);
  let art=e(128,194,42,8,'#6d856b','stroke="none" opacity=".11"');
  // A short stem and a low oval foot support a genuinely wide, shallow drinking bowl.
  art+=e(128,188,34,9,'url(#r45-d115-glass)','fill-opacity=".55" stroke="#69715a" stroke-width="2.5"');
  art+=p('M122 155L121 173Q121 181 113 184Q126 189 143 184Q135 181 135 173L134 155Z','url(#r45-d115-glass)','fill-opacity=".68" stroke="#69715a" stroke-width="2.5"');
  art+=line('M125 164L125 176M120 185Q128 187 137 185','#fffff4',1.6,.98);
  art+=p('M54 104Q64 132 89 149Q109 163 128 163Q148 163 168 149Q192 132 202 104Z','url(#r45-d115-glass)','fill-opacity=".36"');
  art+=p('M63 110Q76 134 99 146Q127 160 156 146Q179 133 193 110Z','url(#r45-d115-liquid)','stroke="#c29c48" stroke-width="1.4" fill-opacity=".9"');
  art+=p('M73 117Q85 135 104 141Q125 151 144 145Q164 139 180 123Q170 143 155 149Q129 162 101 148Q83 138 73 117Z','#e9b547','stroke="none" opacity=".63"');
  art+=e(128,108,64.5,13,'#ffdf80','stroke="#caa652" stroke-width="1.4"');
  art+=p('M73 108Q88 99 106 104Q127 109 147 103Q171 100 186 109Q166 105 150 110Q127 117 105 109Q87 104 73 112Z','#fff0ae','stroke="none" opacity=".68"');
  // Three simple, slightly irregular ice pieces have pale transparent faces.
  let ice=p('M-11-6L3-9L12-3L11 8L-3 10L-12 3Z','#faffed','fill-opacity=".7" stroke="#aebba1" stroke-width="1.4"');
  ice+=p('M-11-6L2-2L12-3L11 8L-3 10L-2-1Z','#c8dfce','fill-opacity=".36" stroke="none"');
  ice+=line('M-10-6L2-2L11-3M2-2L-2 8','#fffff4',1.4,.98);
  art+=`<g transform="translate(91 105) rotate(-16)">${ice}</g>`;
  ice=p('M-11-5L3-8L12-1L9 10L-5 11L-12 3Z','#fffdec','fill-opacity=".7" stroke="#b0b99c" stroke-width="1.4"');
  ice+=p('M3-8L12-1L9 10L-5 11L-2 1Z','#c9e1d0','fill-opacity=".32" stroke="none"');
  ice+=line('M-10-4L-2 1L10-1M-2 1L-5 9','#fffff3',1.4,.98);
  art+=`<g transform="translate(132 104) rotate(13)">${ice}</g>`;
  ice=p('M-9-5L5-7L11 0L8 9L-4 10L-10 3Z','#fffdec','fill-opacity=".69" stroke="#b0b99c" stroke-width="1.4"');
  ice+=p('M-9-5L-1 0L11 0L8 9L-4 10Z','#d7e7d1','fill-opacity=".32" stroke="none"');
  ice+=line('M-8-5L-1 0L9 0M-1 0L-3 8','#fffff3',1.35,.98);
  art+=`<g transform="translate(161 115) rotate(-11)">${ice}</g>`;
  // The clear front lip and two soft slush ribbons keep the drink light and icy.
  art+=e(128,103.5,74,17.5,'none');
  art+=line('M60 104Q65 115 86 118M98 121Q133 127 164 119M176 116L188 111','#fffff4',1.65,.97);
  art+=line('M83 126Q94 137 108 140M117 146Q132 150 146 144M155 139L163 135','#fff0aa',1.5,.9);
  art+=line('M91 134Q100 141 111 141M135 149L142 147','#f8d779',1.35,.86);
  art+=line('M68 120Q75 137 90 146M174 143L180 136','#fffef0',1.55,.86);
  // One small, thin lemon wheel rests on the rim, never a bottle label or a giant garnish.
  let lemon=e(0,1.6,15.5,14.5,'#d3ad42','stroke="#82743c" stroke-width="2.3"');
  lemon+=e(0,-1,15,14,'url(#r45-d115-lemon)','stroke="#8b783e" stroke-width="2.2"');
  lemon+=e(0,-1,11.4,10.5,'#fff4b9','stroke="#d2b65d" stroke-width="1.3"');
  lemon+=p('M0-2L-7-9Q-1-12 4-9Z','#f5d66e','stroke="none"');
  lemon+=p('M2-1L7-9Q12-4 10 1Z','#f8df81','stroke="none"');
  lemon+=p('M1 1L10 3Q7 9 1 9Z','#f4d36c','stroke="none"');
  lemon+=p('M-1 1L-1 9Q-8 7-10 1Z','#f7dd7c','stroke="none"');
  lemon+=p('M-2-1L-10-1Q-11-6-7-8Z','#f9e28e','stroke="none"');
  lemon+=e(0,-1,1.4,1.2,'#ffface','stroke="none"');
  lemon+=line('M-7-11Q-1-15 6-10','#fff5c2',1.3,.98);
  art+=`<g transform="translate(181 85) rotate(-18)">${lemon}</g>`;
  return doc('橙柠酸甜冰饮',defs,art);
}

export const barMiddleCandidates=[
  {id:'dish-fresh-ico-0090',code:'DS114',name:'香甜蛋奶饮',expectedOccupancy:.82,svg:sweetEggMilk(),
    reason:'矮而微收口的奶白小陶杯，左侧仅一枚开环杯柄；柔金蛋奶表面有细腻奶纹和几粒小泡，糖浆的琥珀暖光融在饮面中，整体圆润温柔。',
    design:{silhouette:'一只矮而收口的小陶杯，微鼓圆腹、左侧单柄与安静浅碟，区别本轮高杯与短梗杯',angle:'三分之四俯视，可见柔金饮面、收口杯沿、圆润杯腹和杯柄内孔',material:'奶白釉陶、丝滑柔金蛋奶、克制浅奶纹和琥珀糖浆暖光，不画堆高泡沫',identity:'仅鸡蛋、糖浆与纯牛奶；不画生蛋黄、蛋壳、奶油山、肉桂、可可或酒标',container:'奶白有柄小陶杯，青白浅碟安静承托，含碟82%体量与透明留白'}},
  {id:'dish-fresh-ico-0098',code:'DS115',name:'橙柠酸甜冰饮',expectedOccupancy:.84,svg:orangeLemonIcedDrink(),
    reason:'宽口浅碗短梗杯盛清亮橙柠金色冰饮，三枚简洁透冰随饮面错落，少量冰沙弧纹与酸甜高光保持清爽；杯缘仅一枚小薄柠檬轮。',
    design:{silhouette:'宽而浅的弧形饮碗、短梗和低椭圆杯足，区别可乐多棱杯、苏打高杯、桶杯及直壁橙汁杯',angle:'三分之四俯视，宽椭圆饮面、浅碗弧壁、三枚透冰和小薄柠檬轮清楚',material:'清透玻璃、清亮橙柠金色冰饮、少量冰沙纹和克制酸甜反光，冰块浅色通透',identity:'仅橙子冰沙、柠檬与糖浆；不画酒瓶酒标，不添加薄荷、其它水果、奶油或吸管',container:'宽口浅碗短梗杯，三枚透冰与一枚小柠檬轮，含杯84%体量和透明留白'}}
];

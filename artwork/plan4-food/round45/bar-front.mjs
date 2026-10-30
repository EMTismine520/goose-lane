// Round 45: a low faceted cola tumbler and a tall curved orange-slush soda glass.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 吧台饮品新版</title><defs>${defs}</defs><g stroke="#49382f" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 ${dy})">${art}</g></svg>`;

function blueCitrusCola(){
  const defs=grad('bar45-cola-glass',['#edf6ea','#bfd8d3','#8aafa9'])
    +grad('bar45-cola-liquid',['#c39154','#9a5c32','#673c2c'])
    +grad('bar45-cola-surface',['#dbab69','#b17b43','#8d502c'])
    +grad('bar45-cola-blue',['#9de1df','#56adc7','#257e9e'])
    +grad('bar45-cola-ice',['#fffdf0','#dcece0','#a9cbc9']);
  // Low, wide, handleless tumbler with a visibly thick base and individual cut-glass facets.
  let art=p('M35 96L45 184Q47 200 68 208Q128 226 189 208Q209 201 211 185L221 96Z','url(#bar45-cola-glass)','fill-opacity=".58"');
  art+=e(128,96,93,25,'#f1f7e8','fill-opacity=".9"');
  art+=p('M47 108L55 181Q58 194 76 198Q128 213 181 198Q198 193 201 180L209 108Z','url(#bar45-cola-liquid)','stroke="#71513b" stroke-width="1.6"');
  art+=e(128,108,81,20,'url(#bar45-cola-surface)','stroke="#795034" stroke-width="1.5"');
  // Blue-citrus light is restrained to the lower edge; caramel cola remains the main colour.
  art+=p('M55 176Q81 185 105 180Q127 172 149 181Q173 187 201 176L200 182Q195 194 179 198Q128 212 76 198Q59 194 55 182Z','url(#bar45-cola-blue)','stroke="none" opacity=".86"');
  art+=p('M64 187Q87 195 106 190Q121 185 132 189Q148 197 170 193Q185 191 194 186L191 192Q174 200 151 201Q100 204 74 195Z','#a1dfdc','stroke="none" opacity=".46"');
  art+=line('M67 190Q87 196 104 193M148 198Q174 199 188 191','#d1f1e2',1.45,.88);
  // Exactly two large clear ice pieces, with different angles and proportions.
  art+=p('M65 91L90 77L116 88L113 116L89 131L64 117Z','url(#bar45-cola-ice)','stroke="#587676" stroke-width="2.25" fill-opacity=".9"');
  art+=p('M65 91L90 77L116 88L90 103Z','#f9fff0','stroke="#617f7a" stroke-width="1.4" fill-opacity=".92"');
  art+=p('M90 103L116 88L113 116L89 131Z','#b1d4cf','stroke="#617f7a" stroke-width="1.4" fill-opacity=".74"');
  art+=line('M69 96L70 110M95 107L94 121M76 88L87 82','#ffffff',1.8,.91);
  art+=p('M132 106L158 90L185 102L180 127L156 138L131 124Z','url(#bar45-cola-ice)','stroke="#597776" stroke-width="2.2" fill-opacity=".88"');
  art+=p('M132 106L158 90L185 102L158 116Z','#f8fff1','stroke="#66857e" stroke-width="1.4" fill-opacity=".9"');
  art+=p('M158 116L185 102L180 127L156 138Z','#b1d1ca','stroke="#65817b" stroke-width="1.4" fill-opacity=".7"');
  art+=line('M137 110L138 120M164 118L162 129M145 101L154 96','#ffffff',1.7,.92);
  // Sparse cola fizz, kept visible against the warm liquid.
  art+=e(186,148,2.8,3.3,'#e2b979','stroke="#e9cca0" stroke-width="1.15" fill-opacity=".24"');
  art+=e(177,161,1.85,2.1,'#e9c98d','stroke="none" opacity=".65"');
  art+=e(75,150,2.15,2.6,'#e9c17e','stroke="#f1d6a2" stroke-width="1.1" fill-opacity=".24"');
  art+=e(82,164,1.5,1.8,'#e7c48c','stroke="none" opacity=".65"');
  // Vertical facets are drawn through the outer glass, without becoming opaque black bars.
  art+=p('M44 111L58 118L67 199L56 193Z','#ffffff','stroke="none" opacity=".22"');
  art+=p('M87 126L99 128L103 208L93 206Z','#fffceb','stroke="none" opacity=".11"');
  art+=p('M188 120L201 113L191 195L181 201Z','#effff2','stroke="none" opacity=".17"');
  art+=line('M58 118L67 197M88 126L93 204M168 126L162 207M200 113L191 195','#638c89',1.3,.68);
  art+=p('M48 186Q53 200 76 205Q128 219 181 205Q202 200 207 186L205 197Q193 212 168 216Q128 225 88 216Q60 211 51 199Z','url(#bar45-cola-glass)','stroke="#577571" stroke-width="1.5" fill-opacity=".78"');
  art+=line('M59 200Q92 216 128 216Q165 216 194 203','#f6fff0',2,.94);
  art+=line('M38 99Q44 114 64 118M193 116Q211 111 218 99','#faffed',1.8,.96);
  return doc('蓝柑可乐',defs,art,-18.5);
}

function orangeSlushSoda(){
  const defs=grad('bar45-orange-glass',['#f6fff0','#d4e5d5','#9cbeb7'])
    +grad('bar45-orange-soda',['#fff6c9','#f9dfa0','#efc17a'])
    +grad('bar45-orange-slush',['#ffdb75','#ffb748','#ed8b2c'])
    +grad('bar45-orange-ice',['#fffef2','#e8f2df','#c1d9ce']);
  // Tall curved soda glass, narrowing softly at the waist, with no handle or stem.
  let art=p('M75 69Q77 101 85 130Q92 157 84 198Q82 212 98 219Q128 231 159 220Q176 213 173 200Q165 159 171 131Q180 101 181 69Z','url(#bar45-orange-glass)','fill-opacity=".56"');
  art+=e(128,69,53,16,'#f8fce9','fill-opacity=".87"');
  art+=p('M83 80Q85 108 93 133Q99 159 92 198Q91 207 103 212Q128 221 153 213Q165 209 165 199Q157 160 163 132Q172 105 173 80Z','url(#bar45-orange-soda)','stroke="#a58c56" stroke-width="1.45"');
  art+=e(128,80,45,12,'#fff0b2','stroke="#c8af74" stroke-width="1.3"');
  // Orange slush folds into clear pale-gold soda, not a straight juice column.
  art+=p('M91 117Q96 108 105 111Q114 103 124 109Q132 104 142 112Q153 107 166 117L163 132Q157 160 165 199Q164 209 153 213Q128 222 103 212Q91 207 92 198Q99 159 93 133Z','url(#bar45-orange-slush)','stroke="#d89435" stroke-width="1.35"');
  art+=p('M97 125Q109 117 120 123Q133 115 143 124Q152 120 161 123L158 141Q149 138 140 141Q128 136 118 143Q106 138 97 141Z','#ffdb79','stroke="none" opacity=".64"');
  art+=p('M99 164Q111 157 120 163Q131 157 143 164Q153 159 160 166L162 190Q150 185 139 192Q127 186 116 193Q103 188 94 192Z','#f7a83e','stroke="none" opacity=".48"');
  // A few angular ice-slush grains express cold texture at actual small sizes.
  art+=p('M103 129L108 125L113 129L111 135L105 135Z','#ffedb2','stroke="#d4a449" stroke-width="1.15"');
  art+=p('M140 136L145 132L151 135L149 141L143 142Z','#ffe69c','stroke="#d89f3d" stroke-width="1.15"');
  art+=p('M118 153L124 148L130 152L127 159L121 159Z','#ffe89e','stroke="#d89e3a" stroke-width="1.15"');
  art+=p('M104 178L109 174L114 179L111 184L105 184Z','#ffdb80','stroke="#d99736" stroke-width="1.1"');
  art+=p('M142 189L147 184L153 189L150 195L144 195Z','#ffdf87','stroke="#d99836" stroke-width="1.1"');
  art+=line('M101 145L104 143M140 159L144 157M118 191L122 188','#ffeab1',1.4,.95);
  // A low crown of irregular crushed ice stays inside the upper glass silhouette.
  art+=p('M86 71L92 59L104 60L111 71L104 82L92 81Z','url(#bar45-orange-ice)','stroke="#6e8a78" stroke-width="1.85" fill-opacity=".9"');
  art+=line('M92 64L101 64L105 71M91 75L96 78','#ffffff',1.6,.95);
  art+=p('M108 64L116 52L130 56L136 68L124 78L112 75Z','url(#bar45-orange-ice)','stroke="#6e8977" stroke-width="1.9" fill-opacity=".92"');
  art+=line('M117 57L126 59L130 65M115 70L121 73','#ffffff',1.65,.96);
  art+=p('M137 66L147 57L161 62L163 73L151 81L139 77Z','url(#bar45-orange-ice)','stroke="#6d8977" stroke-width="1.85" fill-opacity=".9"');
  art+=line('M147 62L155 65L157 71','#ffffff',1.6,.95);
  art+=p('M113 82L119 72L132 70L140 81L133 90L121 90Z','url(#bar45-orange-ice)','stroke="#6b8877" stroke-width="1.8" fill-opacity=".88"');
  art+=line('M121 76L129 75L134 81','#ffffff',1.6,.95);
  art+=p('M155 82L165 72L174 77L171 88L161 91Z','url(#bar45-orange-ice)','stroke="#6d8876" stroke-width="1.8" fill-opacity=".87"');
  art+=line('M165 77L169 79','#ffffff',1.5,.95);
  // Sparse soda bubbles in the pale-gold upper liquid, rather than a cream head.
  art+=e(105,95,2.4,2.8,'#fff9d9','stroke="#bfaa72" stroke-width="1.15" fill-opacity=".36"');
  art+=e(147,99,2.8,3.2,'#fff9db','stroke="#bda770" stroke-width="1.15" fill-opacity=".35"');
  art+=e(137,87,1.6,1.8,'#fffdeb','stroke="none" opacity=".9"');
  art+=e(119,104,1.6,1.9,'#fffbe3','stroke="none" opacity=".8"');
  // Clear edge lighting follows the waist, preserving the tall glass profile.
  art+=p('M81 87L87 89Q89 113 95 133Q101 152 96 173L91 174Q95 153 89 133Q83 110 81 87Z','#fffdf0','stroke="none" opacity=".67"');
  art+=line('M97 182L95 197Q94 204 105 208M170 91Q166 112 162 121','#f7fff0',1.8,.92);
  art+=p('M86 200Q91 214 110 217Q128 223 151 217Q165 214 172 202L170 213Q160 225 129 226Q100 226 88 215Z','url(#bar45-orange-glass)','stroke="#739486" stroke-width="1.45" fill-opacity=".85"');
  art+=line('M98 216Q128 228 158 217','#f9fff0',1.8,.95);
  art+=line('M78 72Q92 84 111 85M146 84Q166 82 177 73','#faffef',1.7,.96);
  return doc('橙冰苏打',defs,art,-11);
}

export const barFrontCandidates=[
  {id:'dish-fresh-ico-0067',code:'DS112',name:'蓝柑可乐',expectedOccupancy:.84,svg:blueCitrusCola(),reason:'以矮宽厚底多棱杯、两块大冰与焦糖可乐建立冷饮身份，蓝柑只在下缘呈现克制亮蓝流光，与咖啡或酒瓶形态区分。',design:{silhouette:'矮宽、无柄、多棱厚底杯，两块大小与角度不同的透明冰块，不画酒瓶、高杯或相同冰球堆叠',angle:'轻俯视，杯口、冰块顶面、侧面棱线和厚底同时可辨',material:'清透切面玻璃、厚底折光与少量汽泡；焦糖可乐明亮有层次，下缘仅一股薄蓝柑流光',palette:'深焦糖、琥珀棕为主，克制亮青蓝薄层与象牙透冰点亮，不使用纯黑饮料',ingredients:'仅蓝柑气泡饮、可乐与冷饮冰块；不加柠檬、水果、薄荷或其它主料',container:'矮宽厚底多棱无柄杯，与其它陶杯、梗杯及高杯拉开',size:'整体84%目标体量，透明留白与视觉居中，40px保留矮杯和两大冰辨识'}},
  {id:'dish-fresh-ico-0075',code:'DS113',name:'橙冰苏打',expectedOccupancy:.84,svg:orangeSlushSoda(),reason:'以略收腰的弧线高杯和低矮碎冰冠区别矮可乐杯及直壁橙汁杯，亮橙冰沙与清透浅金苏打共同表现冷爽质地。',design:{silhouette:'高而略收腰的弧线苏打杯，低矮不规则碎冰冠，杯身连续收放，无柄无短梗',angle:'轻俯视杯口，完整展示高杯比例、低碎冰和杯底，不把杯形裁成直桶',material:'清透浅金苏打、亮橙细颗粒冰沙、少量气泡与碎冰棱面，清爽杯缘高光沿腰线变化',palette:'明亮橙金、浅金透液与奶白薄透冰，暖色饱满而保持轻盈',ingredients:'只表现橙子冰沙、苏打水与碎冰，不添加完整水果、奶油或配方外装饰',container:'高而略收腰的弧线玻璃杯，和其它短陶杯、宽口梗杯、矮桶杯及直壁橙汁杯区分',size:'整体84%目标体量，透明留白、居中，40px以弧线高杯和橙金液面建立辨识'}},
];

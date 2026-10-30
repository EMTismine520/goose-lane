// Round 32: five finished milk-tea and cultured-yogurt drinks.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".86" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 第32轮独立成品新稿</title><defs>${defs}</defs><g stroke="#44382e" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function freshMilkGreen(){
  const defs=grad('d32-green-glass',['#f6fff1','#e0ece0','#bdd4c5'])
    +grad('d32-green-milk',['#d9e9a7','#b7d58e','#8fb46c'])
    +grad('d32-green-surface',['#e8efc2','#c4da9d','#a8c480']);
  let art=p('M66 81L74 190Q77 211 127 213Q178 211 181 190L190 81Z','url(#d32-green-glass)');
  art+=p('M73 102L80 186Q82 204 127 205Q172 204 175 186L182 102Z','url(#d32-green-milk)','stroke="#7e9e62" stroke-width="1.6"');
  art+=p('M163 112L158 187Q155 199 139 204Q172 204 175 186L182 103Z','#7da15d','stroke="none" opacity=".16"');
  art+=e(128,81,62,19,'url(#d32-green-glass)');
  art+=e(128,83,53,13,'url(#d32-green-surface)','stroke="#87a56c" stroke-width="1.45"');
  art+=p('M88 78C104 68 132 71 146 78C157 84 151 89 134 89C119 88 104 84 94 86C111 90 138 96 155 87C170 77 143 72 132 75C148 77 153 82 142 83C122 84 102 75 88 78Z','#f4f2d9','stroke="none" opacity=".93"');
  art+=p('M136 76C139 67 151 65 156 70C151 77 143 80 136 76Z','#83ad61','stroke="#5c7d42" stroke-width="1.35"');
  art+=line('M140 74L152 70','#cfe4a6',1.2,.9);
  art+=line('M82 110L85 149','#fffef0',4.2,.84);
  art+=line('M86 160L87 174','#fffef0',3.2,.73);
  art+=line('M91 197Q124 208 160 197','#f8fff0',2,.82);
  art+=line('M78 85Q94 96 111 97','#fffff1',2.2,.88);
  return doc('清新奶绿',defs,art);
}

function vanillaMousseGreen(){
  const defs=grad('d32-mousse-glass',['#ecf5e7','#cde2d1','#91b7a5'])
    +grad('d32-mousse-tea',['#cce399','#9ecb7b','#77a65c'])
    +grad('d32-mousse-cream',['#fff8df','#f7e8c5','#dfc9a3']);
  let art=e(127,215,38,8,'url(#d32-mousse-glass)');
  art+=p('M120 176L118 207Q127 213 136 207L134 176Z','url(#d32-mousse-glass)','stroke-width="2.2"');
  art+=line('M124 184L123 204','#f4fff0',2.5,.95);
  art+=p('M70 101C72 143 87 170 112 180Q127 186 143 179C168 167 180 139 183 101Z','url(#d32-mousse-glass)');
  art+=p('M77 108C81 143 92 163 114 172Q128 178 141 171C163 161 174 141 176 108Z','url(#d32-mousse-tea)','stroke="#709753" stroke-width="1.55"');
  art+=p('M146 118Q168 118 177 108C174 145 159 167 141 173L136 174C147 157 150 138 146 118Z','#62914f','stroke="none" opacity=".16"');
  art+=e(127,101,57,18,'url(#d32-mousse-glass)');
  art+=e(127,103,48,12,'#d4e3ac','stroke="#91b27b" stroke-width="1.4"');
  // A low, folded mousse cap: soft whipped cream, without an ice-cream cone silhouette.
  art+=p('M75 102C67 90 76 78 91 78C88 68 101 61 114 64C120 54 132 49 145 52C148 61 156 64 164 68C175 73 178 81 172 86C188 89 190 100 179 108C151 123 97 121 75 108Z','url(#d32-mousse-cream)');
  art+=p('M84 96C111 108 152 112 180 99C181 105 174 111 163 114C134 121 102 117 83 109Z','#d5bf99','stroke="none" opacity=".33"');
  art+=line('M92 77C108 86 143 90 163 79','#cbb48e',1.65,.94);
  art+=line('M114 65C125 74 146 77 162 70','#d1bb95',1.5,.9);
  art+=line('M87 94Q110 103 135 101','#fffdee',2.4,.9);
  art+=line('M126 59Q136 57 143 61','#fffdf0',2,.9);
  art+=line('M91 122C92 139 97 151 103 157','#f5ffe8',3.3,.8);
  art+=line('M100 209Q121 218 145 212','#fffef0',1.7,.8);
  return doc('香草慕斯奶绿',defs,art);
}

function thickYuanyangTea(){
  const defs=grad('d32-yuan-glass',['#eef4e6','#d4e6d8','#a0c3b2'])
    +grad('d32-yuan-coffee',['#bd8550','#a36c3f','#7b4a31'])
    +grad('d32-yuan-tea',['#e3b67a','#c8945d','#ae7848'])
    +grad('d32-yuan-cream',['#fff8e0','#f3e2bd','#dcc199']);
  // Wide angular handled mug, deliberately different from the stemmed mousse glass.
  let art=p('M173 105C195 99 217 109 218 132C219 156 200 174 178 169L174 157C191 163 205 150 204 134C204 120 191 115 175 121Z','url(#d32-yuan-glass)');
  art+=line('M188 111Q209 115 209 132','#fcfff2',2,.92);
  art+=p('M58 91L63 188Q65 207 121 210Q175 208 179 187L184 91Z','url(#d32-yuan-glass)');
  art+=p('M65 105L69 185Q71 201 121 203Q169 201 172 184L176 105Z','url(#d32-yuan-coffee)','stroke="#81573a" stroke-width="1.6"');
  art+=p('M67 110C89 116 111 111 127 118C143 126 160 127 175 120L172 162C143 173 112 158 91 164Q79 168 70 166Z','url(#d32-yuan-tea)','stroke="none"');
  art+=line('M71 163C94 154 115 168 139 166Q158 169 172 162','#94603b',1.35,.55);
  art+=e(121,91,63,19,'url(#d32-yuan-glass)');
  art+=e(121,93,54,13,'#b48253','stroke="#88613f" stroke-width="1.4"');
  art+=p('M63 90C56 79 64 66 79 66C77 51 95 46 107 52C116 39 132 43 139 52C155 44 169 54 168 64C187 65 194 81 183 93C157 111 84 112 63 97Z','url(#d32-yuan-cream)');
  art+=p('M68 87C93 98 139 99 182 86C184 92 176 100 164 103C135 113 91 108 72 99Z','#d6bd95','stroke="none" opacity=".35"');
  art+=line('M79 69C99 76 126 77 145 68','#d1b78c',1.65,.92);
  art+=line('M112 55Q128 60 137 56','#e0c79e',1.45,.9);
  art+=p('M84 102Q91 106 89 118Q86 129 81 120L79 105Z','#f5e6c4','stroke="#c5ac83" stroke-width="1.35"');
  art+=line('M78 121L80 161','#fff7e2',4,.82);
  art+=line('M82 174L83 185','#fff7e2',2.8,.72);
  art+=line('M87 198Q124 210 157 197','#f9f9e8',1.9,.86);
  return doc('厚顶鸳鸯奶茶',defs,art);
}

function pearYogurt(){
  const defs=grad('d32-pear-glass',['#f5fff2','#dcece2','#aac9c1'])
    +grad('d32-pear-yogurt',['#fffdf0','#f2f0dc','#dcdcc0'])
    +grad('d32-pear-flesh',['#fff2c8','#f2e5ac','#dbd294']);
  let art=p('M48 123L58 187C62 207 189 213 197 187L208 123Z','url(#d32-pear-glass)');
  art+=p('M55 135L64 183C68 200 185 202 191 182L201 135Z','url(#d32-pear-yogurt)','stroke="#b5c5ae" stroke-width="1.55"');
  art+=p('M177 145L173 186Q161 198 139 200C164 202 188 195 191 182L201 135Z','#b9c5b0','stroke="none" opacity=".16"');
  art+=e(128,123,80,22,'url(#d32-pear-glass)');
  art+=e(128,123,71,15,'url(#d32-pear-yogurt)','stroke="#bac5aa" stroke-width="1.45"');
  art+=p('M73 124C91 112 108 117 124 125C142 134 166 136 185 124C173 142 144 143 121 132C102 122 86 122 73 128Z','#fffff5','stroke="none"');
  art+=line('M87 121Q104 118 117 124','#dddcc2',1.4,.8);
  art+=line('M128 133Q151 144 174 135','#d2d3b6',1.5,.75);
  // Two pear slices expose pale flesh, a green peel and the small seed core.
  art+='<g transform="translate(146 95) rotate(18)">';
  art+=p('M-19 20C-26 5-16-15-4-27C9-18 27 3 26 17Q3 30-19 20Z','#a7bb69','stroke="#71834d" stroke-width="2.4"');
  art+=p('M-15 16C-19 4-11-11-3-21C7-13 20 4 20 15Q3 24-15 16Z','url(#d32-pear-flesh)','stroke="#cfca8f" stroke-width="1.35"');
  art+=p('M-4-8C-9 2-8 13-3 17C3 10 2 2-4-8Z','#efdda4','stroke="none"');
  art+=p('M-3 3Q2 7-1 11Q-7 9-3 3Z','#9b7749','stroke="none"');
  art+=line('M-12 8Q-10-4-4-13','#fff8d9',2.1,.92);
  art+='</g>';
  art+='<g transform="translate(106 100) rotate(-17) scale(.83)">';
  art+=p('M-18 18Q-19-2-1-25C13-13 28 3 25 18Q4 28-18 18Z','#97b45c','stroke="#71834d" stroke-width="2.4"');
  art+=p('M-13 15Q-14-1-1-19C11-8 21 4 20 15Q3 23-13 15Z','url(#d32-pear-flesh)','stroke="#cfca8f" stroke-width="1.35"');
  art+=p('M0 1Q5 5 2 10Q-3 8 0 1Z','#957348','stroke="none"');
  art+='</g>';
  art+=line('M66 148L72 175','#fffef6',3.8,.9);
  art+=line('M81 194Q130 207 177 194','#f6fff0',2,.92);
  return doc('优酪乳',defs,art);
}

function honeyCulture(){
  const defs=grad('d32-culture-white',['#fffcec','#f1e7ca','#d7c6a4'])
    +grad('d32-culture-honey',['#ffe299','#e9b75f','#c58b36'])
    +grad('d32-culture-label',['#e4edcf','#cfddb2','#acbf8c']);
  let art=p('M97 58L97 83C96 94 80 99 79 112L86 139L79 190Q78 209 127 214Q176 211 176 192L170 140L177 112C175 99 160 95 159 83L159 58Z','url(#d32-culture-white)');
  art+=p('M151 83C152 101 165 105 166 118L160 141L166 190Q168 202 149 210Q176 206 176 192L170 140L177 112C175 99 160 95 159 83Z','#b8ab8b','stroke="none" opacity=".18"');
  art+=p('M82 116Q126 128 174 116L170 140L174 170Q127 183 82 170L86 139Z','url(#d32-culture-label)','stroke="#94aa79" stroke-width="1.55"');
  art+=p('M87 154C102 148 113 153 125 149C141 143 154 151 172 144L174 170Q127 183 82 170Z','#f6e9bb','stroke="none"');
  art+=p('M127 127C121 138 111 143 113 153C115 165 136 167 141 156C146 145 132 137 127 127Z','url(#d32-culture-honey)','stroke="#a87c35" stroke-width="1.75"');
  art+=line('M122 142Q116 148 119 153','#fff0b6',2.1,.92);
  art+=p('M88 49L94 67Q127 74 162 67L168 49Z','url(#d32-culture-honey)');
  art+=e(128,48,40,9,'#fbe3a6','stroke-width="2.35"');
  art+=e(128,48,31,5.1,'#efc975','stroke="#d1a24f" stroke-width="1.35"');
  art+=line('M98 56L100 63M109 59L110 66M148 59L147 65M159 56L157 63','#b18234',1.3,.8);
  art+=line('M105 80L104 88','#fffdf0',3.1,.95);
  art+=line('M94 103Q90 109 91 115','#fffdf1',3,.8);
  art+=line('M93 183L92 193','#fffdf0',3,.9);
  art+=line('M103 202Q129 210 153 201','#fff9e7',2,.9);
  return doc('益生菌饮品',defs,art);
}

export const drinksTailCandidates=[
  {id:'dish-fresh-ico-0020',name:'清新奶绿',svg:freshMilkGreen(),expectedOccupancy:.80,reason:'宽口短玻璃杯盛均匀浅玉绿乳茶，柔白旋纹表现奶与绿茶融合，一片小茶叶点明清香；不加珍珠和厚奶油，保持轻盈清爽。',design:{silhouette:'宽口微收底短玻璃杯，无杯柄与高奶油帽',angle:'略俯视，可见乳绿表面与杯壁厚度',material:'浅玉绿均匀乳茶、淡奶纹与克制玻璃亮边',identity:'绿茶与纯牛奶的融合色，区别慕斯奶绿的奶油帽',container:'轻巧通透短杯，主体约80%'}},
  {id:'dish-fresh-ico-0055',name:'香草慕斯奶绿',svg:vanillaMousseGreen(),expectedOccupancy:.84,reason:'足杯托住鲜绿奶茶底，顶层以宽软奶油褶面表现香草慕斯，低缓旋折代替尖塔冰淇淋感；不加入整根香草荚或额外水果。',design:{silhouette:'短脚圆腹足杯与宽软慕斯帽，轮廓上下有节奏',angle:'略俯视，清楚看到奶油折面、绿茶底与短杯脚',material:'嫩绿茶液、奶油暖白褶面、淡青玻璃与柔光',identity:'绿茶、奶油和香草精的柔软奶香成品，奶油帽独立可读',container:'轻盈短足玻璃杯，主体约84%'}},
  {id:'dish-fresh-ico-0087',name:'厚顶鸳鸯奶茶',svg:thickYuanyangTea(),expectedOccupancy:.84,reason:'宽柄厚杯盛茶与咖啡自然相融的暖棕液体，厚软奶油顶轻垂一滴，体现浓郁鸳鸯口感；宽杯柄与低圆奶油帽区别足杯慕斯。',design:{silhouette:'宽体有柄玻璃杯，低圆厚奶油帽与清楚大杯柄',angle:'三分之四略俯视，杯内暖棕层次和厚奶油可辨',material:'琥珀红茶、咖啡暖棕融合与柔白奶油，玻璃高光克制',identity:'红茶、原味咖啡与奶油，未添加珍珠、水果或额外主料',container:'宽体厚柄杯，主体约84%'}},
  {id:'dish-fresh-ico-0093',name:'优酪乳',svg:pearYogurt(),expectedOccupancy:.80,reason:'短宽玻璃杯盛稠白酸奶，两片清楚露出绿皮、淡果肉与籽芯的梨片落在杯口，白色浓稠褶面与水果切面共同表达优酪乳身份。',design:{silhouette:'短宽酸奶玻璃杯，两片梨切面形成轻巧上缘',angle:'略俯视，能看见稠白酸奶表面和梨片厚度',material:'稠润暖白酸奶、淡金梨肉与青绿果皮，柔软光泽',identity:'仅酸奶与梨，不使用椰子、柠檬或芒果装饰',container:'低矮宽口玻璃杯，主体约80%'}},
  {id:'dish-fresh-ico-0121',name:'益生菌饮品',svg:honeyCulture(),expectedOccupancy:.80,reason:'收腰小瓶与暖金封口建立益生菌饮品轮廓，奶白瓶身配淡青标签和清楚蜂蜜滴，蜂蜜色点明酸奶与蜂蜜组合，区别纯牛奶纸盒及梨味短杯。',design:{silhouette:'圆肩收腰乳饮小瓶、宽金色封口与圆润底部',angle:'正面略俯视，可见瓶盖与瓶身弧面',material:'奶白浓润饮品、温金蜂蜜色和淡青纸标，克制亮边',identity:'酸奶与蜂蜜，金色滴形明确蜂蜜身份，不增加其它水果',container:'便携收腰小瓶，主体约80%'}}
];

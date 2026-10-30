// Round 44: two unequal cocoa scoops in a low blue-green porcelain cup.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function chocolateIceCream(){
  const defs=grad('ic44-chocolate-cup',['#c8e7de','#79b5b2','#44868f'])
    +grad('ic44-chocolate-main',['#ca9a7a','#a47460','#79514a'])
    +grad('ic44-chocolate-small',['#d1a386','#ad806a','#85594e'])
    +grad('ic44-chocolate-curl',['#c18a60','#84513c','#59372e']);
  let art=p('M28 146Q35 181 62 197Q91 214 128 214Q167 214 194 198Q222 182 228 146Z','url(#ic44-chocolate-cup)');
  art+=p('M43 165Q52 188 80 198L102 204Q68 202 53 186Z','#d9eee1','stroke="none" opacity=".68"');
  art+=line('M52 181Q70 199 96 204M160 206Q188 199 207 180','#386e79',1.45,.78);
  art+=e(128,146,100,29,'#e7f3e6');
  art+=e(128,145,88,22,'#7baca7','stroke="#4e7879" stroke-width="1.4"');
  art+=e(127,146,76,17,'#654a40','stroke="none" opacity=".22"');
  // Back scoop is smaller and slightly taller, with its own cut edge and soft fold pattern.
  art+=p('M145 83Q156 70 172 74Q189 75 198 89Q210 99 205 114Q207 125 197 135L189 138L182 145L173 141L164 145L157 139L148 139L144 132Q131 127 132 114Q128 101 137 91Z','url(#ic44-chocolate-small)');
  art+=p('M143 97Q150 83 164 82Q176 80 187 91Q175 86 165 92Q155 94 148 105Q143 111 139 108Z','#e9c3a2','stroke="none" opacity=".82"');
  art+=p('M144 114Q152 102 165 105Q178 108 188 103Q192 103 195 106Q182 116 168 113Q154 110 147 121Z','#c99d7d','stroke="none" opacity=".62"');
  art+=line('M144 94Q152 84 164 85M177 85L183 89','#f7d8b9',1.8,.94);
  art+=line('M150 104Q158 96 170 98M178 118Q190 116 196 109M155 128Q163 134 173 132','#775346',1.4,.84);
  art+=line('M140 115L141 121M182 130L189 125M161 137L166 139','#dab08c',1.6,.92);
  // Front scoop has a broad, low crown and a scalloped spoon-cut foot, not a perfect sphere.
  art+=p('M64 100Q66 87 81 82Q94 73 109 80Q125 77 138 91Q153 100 154 116Q164 132 154 145Q156 155 145 161L134 161L126 167L116 164L106 169L96 165L85 168L77 162L67 162L63 154Q51 149 53 137Q46 124 54 112Q54 105 64 100Z','url(#ic44-chocolate-main)');
  art+=p('M62 111Q65 94 81 91Q94 82 109 89Q121 87 131 97Q115 92 105 99Q95 104 84 101Q71 101 66 114Z','#e2b493','stroke="none" opacity=".83"');
  art+=p('M58 128Q70 112 86 116Q103 122 116 113Q125 108 136 111Q123 113 118 122Q103 135 85 128Q70 124 61 137Z','#cba184','stroke="none" opacity=".74"');
  art+=p('M70 145Q82 136 94 141Q108 147 120 138Q132 132 143 136Q135 146 122 150Q109 159 94 152Q81 147 74 154Z','#9b6a57','stroke="none" opacity=".64"');
  art+=line('M66 102Q72 92 84 92M98 87Q108 86 114 91','#f1d0ae',1.8,.96);
  art+=line('M62 119Q70 111 79 113M88 119Q101 124 111 117M120 108Q131 102 140 110','#765043',1.45,.86);
  art+=line('M67 138Q75 132 84 135M95 139Q104 142 112 136M127 144Q139 141 145 134','#745043',1.4,.86);
  art+=line('M58 134L60 141M71 152L77 155M91 160L97 158M111 160L117 157M136 154L140 150','#d9ae8b',1.65,.94);
  art+=line('M74 107L81 104M94 112L100 111M119 98L124 100','#e7c5a4',1.45,.94);
  // One short thin chocolate curl uses the same recipe ingredient, with a visibly folded edge.
  art+=p('M164 117Q173 111 184 117Q190 122 187 130Q183 139 173 139L165 134Q173 137 178 131Q182 125 176 122L166 124Z','url(#ic44-chocolate-curl)','stroke="#52372b" stroke-width="2.2"');
  art+=p('M166 118Q175 114 182 120Q185 124 182 128Q182 122 174 121L167 123Z','#b9855a','stroke="#704632" stroke-width="1.3"');
  art+=line('M168 117L173 116M180 132L176 135','#e1b184',1.4,.92);
  // A low glazed front lip seats the ice cream inside the cup rather than on a pedestal.
  art+=p('M30 148Q47 164 78 171Q128 182 177 170Q210 163 226 148L224 157Q208 173 177 180Q127 192 77 179Q44 171 32 158Z','#94c7bf');
  art+=line('M43 162Q76 180 126 182Q177 181 214 163','#e0f1df',2,.95);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>巧克力冰淇淋 · 冰淇淋机新版候选</title><defs>${defs}</defs><g stroke="#49362d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -15)">${art}</g></svg>`;
}

export const icecreamChocolateCandidates=[{
  id:'dish-fresh-ico-0120',code:'DS109',name:'巧克力冰淇淋',expectedOccupancy:.84,
  svg:chocolateIceCream(),
  reason:'以一大一小两枚交叠可可冰淇淋替代原版三个相同圆球，突出柔软挖勺纹和冷巧棕层次，并用矮口蓝绿瓷杯与其它奶球、黄油甜品拉开区别。',
  design:{
    silhouette:'两枚不等大的可可冰淇淋，前大后小、低矮交叠；自然挖勺边与柔软皱褶，不堆三球或高旋软冰。',
    angle:'轻俯视，清楚看到挖勺顶面、柔软侧面和杯口，前景大勺保留完整轮廓。',
    material:'细腻半哑光冷冻奶油，曲折挖勺纹配暖奶边光；一枚短薄巧克力卷有可辨折边，不用强镜面黑巧块。',
    palette:'冷可可棕、柔暖奶棕与少量米金受光，蓝绿瓷杯形成清爽互补；暗部保持棕色层次。',
    container:'矮口小蓝绿瓷杯，浅口沿与克制釉光，不加高脚、托盘或配料堆叠。',
    ingredients:'只表现巧克力与奶油；薄卷同属巧克力，无饼干、薄荷、水果或坚果。',
    size:'成品含杯目标最长边84%，透明留白、整体居中，40px保持两勺和低杯的清楚轮廓。',
  },
}];

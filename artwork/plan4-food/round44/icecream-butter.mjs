// Round 44: one hand-shaped butter ice-cream quenelle, not a cubed dessert or a cup.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function butterIceCream(){
  const defs=grad('r44-d110-plate',['#f8f5f1','#e3dce7','#bdb2c6'])
    +grad('r44-d110-ice',['#fff2bc','#f7df99','#e2c27d'])
    +grad('r44-d110-fold',['#ffedb1','#f2d58e','#d9b775'])
    +grad('r44-d110-butter',['#ffe6a0','#f5cf73','#deaf55']);
  let art=e(128,168,101,30,'url(#r44-d110-plate)');
  art+=e(128,163,88,22,'#fffcf1','stroke="#b8abb7" stroke-width="1.45"');
  art+=line('M44 175Q76 192 117 191M143 191Q188 186 212 172','#fffdf7',1.8);
  art+=e(127,160,65,13,'#9c8c68','stroke="none" opacity=".11"');

  // A narrow milk-gold softened edge stays tucked beneath the cold scoop.
  art+=p('M77 158Q94 152 111 156Q132 152 150 158Q164 156 175 163Q168 169 152 169Q136 174 119 169Q101 173 88 166Q77 167 73 163Z','#f6e2ac','stroke="#c9b785" stroke-width="1.3"');
  // One continuous low oval: unequal spoon-shaped ends and a softly lifted back crest.
  art+=p('M59 140C65 122 95 109 122 106C149 101 178 111 193 128Q201 135 197 142C185 158 151 170 119 170C91 169 69 157 59 143Z','url(#r44-d110-ice)');
  // The broad upper facet rolls into a long curved fold instead of forming a hard plane.
  art+=p('M66 138C80 122 102 115 124 114Q161 107 189 132C172 124 151 126 132 133C111 143 90 148 69 142Z','#fff3c1','stroke="none"');
  art+=p('M61 141C83 153 106 155 128 147C153 136 179 133 196 140C183 156 152 168 119 168C92 167 72 155 61 144Z','url(#r44-d110-fold)','stroke="none"');
  art+=p('M67 142Q81 148 94 148Q110 149 126 143Q147 134 166 134Q177 133 188 136Q172 134 151 143Q131 155 113 157Q87 158 72 149Z','#ffeab0','stroke="none" opacity=".89"');
  // One supple scoop ridge, with a short tuck at each end, describes the quenelle turn.
  art+=line('M71 144C91 154 109 154 130 146C151 136 176 133 190 139','#c5a469',1.5,.92);
  art+=line('M75 141C95 150 111 149 130 142C151 132 171 130 183 134','#fff9d9',1.65,.98);
  art+=line('M63 139Q67 146 73 148M187 139Q194 137 197 137','#d4b171',1.45,.9);
  // Creamy, very low contrast scoop marks keep the frozen surface velvety, not glassy.
  art+=p('M84 126Q101 116 120 116Q134 114 145 117Q125 118 113 121Q98 119 84 129Z','#fff8d6','stroke="none" opacity=".82"');
  art+=line('M87 123Q100 117 112 118M120 114Q129 112 137 114','#fffbe3',1.55,.94);
  art+=line('M150 119Q163 119 173 125M82 155Q94 160 107 161M124 164Q137 164 148 159','#fce9b2',1.4,.91);
  art+=line('M104 129Q111 127 117 128M133 122L140 122M158 148L165 145','#e7ca8b',1.3,.69);
  art+=line('M110 132Q117 129 123 130M151 151L157 148','#fff4cd',1.3,.88);

  // A single very small, thin butter shaving is a flavour cue, never a second main block.
  let butter=p('M-10-3L5-5Q9-5 10-2L10 3Q8 6 4 6L-10 3Z','url(#r44-d110-butter)','stroke="#9b793e" stroke-width="1.7"');
  butter+=p('M-10-3L5-5Q9-5 10-2L4 1L-10 0Z','#ffe9aa','stroke="#b69250" stroke-width="1.3"');
  butter+=line('M-7-2L3-3','#fff5cf',1.3);
  art+=`<g transform="translate(181 174) rotate(13)">${butter}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>黄油冰淇淋 · 奶油机甜品新版</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const icecreamButterCandidates=[
  {id:'dish-fresh-ico-0130',code:'DS110',name:'黄油冰淇淋',expectedOccupancy:.82,svg:butterIceCream(),
    reason:'一份低而宽的柔黄挖勺形冰淇淋，长弧面沿勺形自然卷起，细腻折痕与克制奶金化边表现冷甜品的绵密柔软；侧边仅一枚很小的薄黄油片提示风味。',
    design:{silhouette:'一份连续椭圆挖勺形quenelle，两端自然不等、低宽轮廓和长弧面卷痕，不画圆球、方块或高玻璃杯',angle:'三分之四俯视，柔软上弧面、连续卷勺折痕与低矮前腹清楚，摆放略有自然弧度',material:'柔黄奶油冰淇淋、细腻哑润挖勺纹、克制浅奶金化边，一枚很小薄黄油片',identity:'仅黄油与奶油；不加蛋、饼干、香草、水果、坚果、焦糖或其它未列主料',container:'浅紫灰细边椭圆低碟安静承托，含碟82%体量，透明留白和视觉居中'}}
];

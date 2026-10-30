// Round 33: two separately composed, ingredient-faithful rice dishes.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".86" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 料理锅新版候选</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;

function onionRice(){
  const defs=grad('r33-onion-plate',['#edf1df','#cad8c7','#a2bdb6'])
    +grad('r33-onion-rice',['#fffdef','#f6eacb','#dfcda0'])
    +grad('r33-onion-edge',['#ae805f','#895940','#69452f'])
    +grad('r33-onion-soft',['#c38a9e','#a66d87','#8e5b73']);
  let art=p('M32 146C37 173 74 190 129 190C184 190 219 172 224 146Z','url(#r33-onion-plate)');
  art+=e(128,145,96,34,'#f6f6e9');
  art+=e(128,143,84,26,'#e3e7cf','stroke="#a6b9a6" stroke-width="1.4"');
  art+=line('M44 159Q128 196 213 158','#faffef',2.1,.95);

  // A low, dry-rice mound leaves the plate rim and individual onion pieces visible.
  art+=p('M55 144C57 134 65 125 75 122C77 111 87 106 99 107C107 96 124 94 136 101C150 95 164 102 169 111C185 110 195 122 197 134Q207 143 197 151C179 169 79 171 58 154Z','url(#r33-onion-rice)');
  art+=p('M62 146C73 138 82 145 93 138C104 129 116 139 128 132C143 124 154 136 167 132C179 126 192 133 196 144C183 157 79 164 62 151Z','#fff9e5','stroke="none" opacity=".78"');
  art+=p('M69 145Q87 135 107 141Q125 151 145 143Q166 134 187 142Q176 153 156 154Q125 163 94 155Z','#edcc7e','stroke="none" opacity=".24"');
  const grain=(d,colour='#cbbb92')=>line(d,colour,1.55,.92);
  art+=grain('M75 126Q79 123 83 124M105 110Q109 107 113 109M143 107Q147 106 150 109M179 124L184 127');
  art+=grain('M68 147L74 150M91 157Q95 159 99 157M122 151L128 153M156 157L162 155M185 145L190 142');
  art+=line('M83 117Q90 113 96 114M119 103L125 102','#fffef5',2.2,.95);

  const onion=(x,y,a,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-29-4C-18 5 3 7 22-2Q28-5 30-1C24 11 1 18-17 11Q-28 8-31 0Z','url(#r33-onion-edge)','stroke="#674833" stroke-width="1.65"')
    +p('M-25-3C-11 5 7 6 25-1C19 7 2 12-13 8Q-23 6-25-3Z','url(#r33-onion-soft)','stroke="#855b65" stroke-width="1.35"')
    +line('M-20 1C-7 7 8 7 19 3','#deb0b7',1.6,.92)
    +line('M-16 10Q-2 15 12 10','#6f432f',1.4,.8)
    +'</g>';
  art+=onion(100,117,-21,.93);
  art+=onion(153,116,20,.92);
  art+=onion(97,143,13,.94);
  art+=onion(156,144,-14,.94);
  art+=line('M68 160Q100 173 135 169M153 169Q180 165 190 157','#fffdf0',1.9,.9);
  return doc('焦香洋葱饭',defs,art);
}

function butterRice(){
  const defs=grad('r33-butter-bowl',['#fff5df','#ead5ad','#c9af83'])
    +grad('r33-butter-rice',['#fffef2','#f8edce','#e3d2a8'])
    +grad('r33-butter-main',['#fff0a1','#f7d266','#e6b347'])
    +grad('r33-butter-side',['#e7b94b','#cf9434']);
  let art=p('M109 183L108 194Q128 204 149 194L147 183Z','url(#r33-butter-bowl)','stroke-width="2.7"');
  art+=p('M49 132C54 164 82 191 128 191C173 191 201 165 207 132Z','url(#r33-butter-bowl)');
  art+=p('M181 146Q190 143 201 137C192 164 174 180 148 187C164 174 175 161 181 146Z','#b9a074','stroke="none" opacity=".26"');
  art+=e(128,132,79,28,'#fff9e9');
  art+=e(128,130,69,21,'#e9dec0','stroke="#c5b58d" stroke-width="1.4"');

  // Distinct scalloped rice grains and a domed top keep this separate from white congee.
  art+=p('M59 132C58 123 66 117 73 116C72 106 83 99 94 101C101 88 113 88 124 92C136 84 152 91 157 99C171 96 183 106 183 115C193 116 199 125 195 134C183 151 76 158 61 140Z','url(#r33-butter-rice)');
  art+=p('M66 128Q71 118 83 122Q89 111 101 115Q112 106 125 113Q141 105 150 114Q166 109 174 121Q185 117 190 129C171 143 83 148 66 135Z','#fffdf1','stroke="none" opacity=".74"');
  art+=line('M76 112L82 109M104 99Q109 96 114 99M155 107L160 110M180 123L185 126','#cfbf96',1.55,.94);
  art+=line('M74 134L80 137M94 141L101 142M116 133Q121 135 125 133M148 143L155 141M171 135L176 132','#c5b58c',1.55,.9);
  art+=line('M86 122Q90 119 95 121M118 100L123 98','#fffef9',2.1,.96);

  // A small piece of butter melts onto the rice, rather than covering the whole mound.
  art+=p('M114 116C119 110 130 113 135 109C141 106 153 113 157 115C165 114 168 120 161 123C151 127 141 123 132 126C121 128 106 122 114 116Z','#f2d479','stroke="#d3b76d" stroke-width="1.3" opacity=".8"');
  art+=p('M121 99L142 94L157 102L156 118L136 124L121 116Z','url(#r33-butter-side)','stroke="#8a642f" stroke-width="2.2"');
  art+=p('M121 99L142 94L157 102L136 109Z','url(#r33-butter-main)','stroke="#a27636" stroke-width="1.5"');
  art+=p('M121 99L136 109L136 124L121 116Z','#f6d16e','stroke="#b38a40" stroke-width="1.35"');
  art+=line('M126 100L141 97L151 102','#fff6b9',1.9,.95);
  art+=line('M140 112L151 108','#f7d77d',1.4,.8);
  art+=p('M156 116Q160 122 154 126Q149 127 150 124L151 118Z','#edc562','stroke="#be9444" stroke-width="1.2"');
  art+=p('M51 134C69 151 96 159 129 159C160 159 186 151 205 135L203 143C182 158 157 165 129 165C98 165 73 158 54 143Z','#f6e6c5','stroke-width="2.3"');
  art+=line('M61 146Q127 176 195 147','#fffcef',2.1,.93);
  art+=line('M78 166Q98 183 122 183M144 182Q164 179 177 169','#bdab82',1.45,.75);
  return doc('黄油拌饭',defs,art);
}

export const potRiceCandidates=[
  {id:'dish-fresh-ico-0139',name:'焦香洋葱饭',svg:onionRice(),expectedOccupancy:.82,
    reason:'四弯煎软的紫洋葱带棕焦边与柔紫层次，散落在奶白熟米饭上；微金黄油薄光与低浅青瓷盘承托焦香，主料清楚而不堆生洋葱环。',
    design:{silhouette:'低矮松软米饭与四弯煎软洋葱，浅盘横向舒展',angle:'三分之四俯视，清楚看见熟米粒、洋葱弧面和盘沿',material:'奶白熟米、棕紫煎软洋葱与淡金黄油亮面，克制高光',identity:'只表现大米、紫洋葱与黄油，不加入鸡蛋或葱叶',container:'浅青白陶盘，含盘最长边约82%，保留轻盈留白',onionPieces:4}},
  {id:'dish-fresh-ico-0140',name:'黄油拌饭',svg:butterRice(),expectedOccupancy:.82,
    reason:'温润小饭碗盛出饱满熟米饭，一小块金黄黄油正在融化；有限米粒与乳白起伏表现松软米饭，黄油薄池点出油润，避免大黄油盖住米饭。',
    design:{silhouette:'饱满圆润米饭与一小块融化黄油，暖白短足饭碗稳稳承托',angle:'略俯视，可见黄油顶面、薄融池和熟米饭颗粒',material:'暖白米饭、奶金黄油与温润浅陶，细深轮廓配柔和油亮',identity:'仅大米与黄油两种既定原料，不加葱、蛋或火腿',container:'小巧暖白深饭碗，与洋葱饭浅盘拉开形态，含碗最长边约82%',butterPieces:1}}
];

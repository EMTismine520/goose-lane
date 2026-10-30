// Round 34: sautéed onion petals have four individually drawn, short silhouettes.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".18" y1="0" x2=".78" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function onionRice(){
  const defs=grad('r34-onion-plate',['#f5f4df','#d8e2ce','#a9c2b8'])
    +grad('r34-onion-rice',['#fffdf0','#f8eccf','#e3cca1'])
    +grad('r34-onion-caramel',['#c39a6b','#a9764c','#825034'])
    +grad('r34-onion-violet',['#d6a9b8','#bb879e','#98637d'])
    +grad('r34-onion-light',['#f2d9d8','#dfb5bf','#b97f97']);

  let art=p('M30 146C36 174 73 192 129 192C185 192 220 174 226 146Z','url(#r34-onion-plate)');
  art+=e(128,145,98,35,'#f8f7e9');
  art+=e(128,143,85,27,'#e1e8d2','stroke="#a8bca7" stroke-width="1.4"');
  art+=line('M42 161Q128 198 214 161','#fbfff0',2.1,.96);

  // Broad, loose rice leaves visible gaps around the onions and a clean ceramic rim.
  art+=p('M53 144C53 134 61 127 71 124C72 113 82 106 93 107C100 95 112 95 124 99C138 91 152 99 158 107C173 102 187 113 187 123C199 125 205 138 199 148C189 163 165 168 130 170C97 170 68 164 57 155Z','url(#r34-onion-rice)');
  art+=p('M60 141Q67 132 79 136Q86 125 99 132Q109 122 121 129Q135 119 146 129Q160 121 172 133Q187 128 197 141C186 156 162 161 131 163C99 164 75 159 61 151Z','#fffbed','stroke="none" opacity=".78"');
  art+=p('M69 145Q92 138 111 144Q130 137 146 143Q168 135 190 143Q179 156 153 157Q123 165 91 156Z','#efca73','stroke="none" opacity=".2"');
  art+=line('M68 129L73 126M86 116Q90 113 94 115M111 105L116 103M136 102L141 104M172 115L177 118','#cdbd96',1.5,.9);
  art+=line('M63 144L69 147M80 153L85 155M104 163L110 162M139 162L146 160M183 154L188 151M193 136L197 139','#c6b58e',1.55,.94);
  art+=line('M96 125L101 123M123 137L128 136M148 151L153 150M162 126L166 128','#c9b995',1.4,.84);
  art+=line('M77 139L82 137M113 114L118 112M136 121L141 122M171 161L175 158','#fffef7',2,.95);

  // Back left: a tilted, pointed petal with a folded, caramelised lower corner.
  art+=p('M82 115Q86 108 96 105L111 116Q115 123 108 133Q97 138 86 130L79 122Q78 118 82 115Z','url(#r34-onion-caramel)','stroke="#604436" stroke-width="2.5"');
  art+=p('M82 116Q88 110 96 108L108 117Q112 123 106 129Q95 131 87 124Z','url(#r34-onion-violet)','stroke="#8b6270" stroke-width="1.35"');
  art+=p('M86 115L96 111L105 119Q109 124 103 127Q99 122 94 120Z','#edcbd0','stroke="none"');
  art+=line('M86 116L96 113L104 120Q107 123 103 126','#f8e3de',1.6,.98);
  art+=line('M88 121L94 119Q101 121 102 125','#b57d95',1.35,.95);
  art+=line('M85 128Q94 136 103 132','#d19757',1.4,.93);
  art+=p('M80 121L85 125L88 130L84 128Z','#7e492c','stroke="none"');

  // Back right: a broad, compressed wedge; its cut layers turn towards the viewer.
  art+=p('M139 109Q151 105 164 112L176 121Q178 127 171 134L154 139Q144 136 137 129Q132 120 139 109Z','url(#r34-onion-caramel)','stroke="#604436" stroke-width="2.6"');
  art+=p('M140 111Q151 108 162 114L172 122L167 130Q157 135 149 131L139 125Q136 119 140 111Z','url(#r34-onion-light)','stroke="#936775" stroke-width="1.4"');
  art+=p('M141 113Q149 113 155 119L168 125Q161 131 152 126Q144 121 141 113Z','#f6e0da','stroke="none"');
  art+=line('M143 112Q150 120 157 123Q163 126 170 123','#fff0e4',1.7,.98);
  art+=line('M140 116Q145 125 155 128Q162 131 168 127','#b17c97',1.4,.98);
  art+=line('M143 121Q148 130 158 132','#e8bbc8',1.3,.98);
  art+=line('M141 129Q148 136 154 136L167 133','#d39756',1.45,.95);
  art+=p('M170 127L173 123Q176 128 169 133L166 133Z','#805036','stroke="none"');

  // Front left: a compact quarter-cut chunk, with an offset tip and two onion layers.
  art+=p('M94 140L110 131Q118 136 124 143L126 154Q122 160 114 163L102 157L93 149Q91 143 94 140Z','url(#r34-onion-caramel)','stroke="#604436" stroke-width="2.6"');
  art+=p('M96 140L109 134Q117 138 121 145L122 153L114 158L104 153L96 146Z','url(#r34-onion-violet)','stroke="#8d6073" stroke-width="1.4"');
  art+=p('M100 140L109 136Q117 142 118 151L113 155Q106 148 100 140Z','#f0d6d6','stroke="none"');
  art+=line('M99 139Q102 148 113 156L119 152','#fae8e0',1.7,.98);
  art+=line('M96 142Q99 151 112 159','#c18ba4',1.4,.98);
  art+=line('M107 138Q113 143 115 149','#b47b96',1.35,.96);
  art+=p('M93 147L102 156L113 162L116 159L104 153L96 146Z','#9a693e','stroke="none"');
  art+=line('M100 155L107 159','#d4a16a',1.3,.94);

  // Small front right: an uneven, curled short petal, drawn independently of the others.
  art+=p('M164 139Q170 136 175 141L183 151Q182 157 176 160L166 156L158 149Q157 145 164 139Z','url(#r34-onion-caramel)','stroke="#604436" stroke-width="2.4"');
  art+=p('M164 141Q170 139 173 143L179 150L175 156L167 152L161 148Z','url(#r34-onion-light)','stroke="#926473" stroke-width="1.3"');
  art+=p('M165 142Q169 141 171 145L176 150L173 153L167 149Z','#f7e2dc','stroke="none"');
  art+=line('M164 142Q162 147 168 151L174 154','#c28ba1',1.4,.98);
  art+=line('M161 150L167 155L175 158','#d49b67',1.35,.94);

  // A few visible grains and restrained butter shine bring the topping into the rice.
  art+=p('M129 148Q132 145 135 147Q138 150 135 152Q132 153 129 150Z','#fffae8','stroke="#d1c09a" stroke-width="1.2"');
  art+=p('M148 138Q151 135 154 137Q156 140 153 142Q150 142 148 140Z','#fff8e5','stroke="#d1c09a" stroke-width="1.2"');
  art+=line('M71 159Q79 164 89 165M137 168Q150 168 159 165M188 159L193 155','#fffcef',1.85,.96);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>焦香洋葱饭 · 四块短瓣重绘</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const onionRiceCandidate={
  id:'dish-fresh-ico-0139',
  name:'焦香洋葱饭',
  svg:onionRice(),
  expectedOccupancy:.82,
  reason:'四块独立绘制的煎软紫洋葱短瓣，分别呈斜尖瓣、宽切块、偏尖四分瓣和小卷瓣；柔紫熟色、少量层纹与棕金焦边区分材质。奶白松软米饭保留米粒、淡金黄油薄光与清爽盘沿，没有条状排布或复制洋葱。',
  design:{
    silhouette:'浅青白盘托起低矮蓬松米饭，四块长宽接近的异形短洋葱瓣错落分布',
    angle:'三分之四俯视，可见洋葱切面和米饭颗粒，前后块体大小与朝向均不同',
    material:'熟紫与奶粉紫层面、棕金煎焦边、奶白熟米及微暖黄油光',
    identity:'仅大米、紫洋葱与黄油，不加入葱叶、鸡蛋、肉或完整洋葱环',
    container:'浅青白陶盘，成品含盘最长边约82%，保留可读盘沿与透明留白'
  }
};

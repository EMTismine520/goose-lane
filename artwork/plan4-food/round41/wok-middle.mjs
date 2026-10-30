// Round 41: a clean broccoli stir-fry and three pieces of crisp fried milk.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.5,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".83" y2="1">${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${color}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 炒锅成品新版候选</title><defs>${defs}</defs><g transform="translate(0 ${dy})" stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function broccoliStirFry(){
  const defs=grad('r41-broccoli-plate',['#f9fcf0','#d9e9df','#a0c3bc'])
    +grad('r41-broccoli-green',['#a2cb69','#76ad49','#4c853b'])
    +grad('r41-broccoli-deep',['#8fbd58','#659a3e','#467834'])
    +grad('r41-broccoli-stem',['#d2e6a2','#aed071','#83ac52'])
    +grad('r41-broccoli-pepper',['#ff9c73','#ef7453','#ca513b']);
  let art=e(128,160,100,32,'url(#r41-broccoli-plate)');
  art+=e(128,156,87,23,'#fdfff2','stroke="#abc2ab" stroke-width="1.4"');
  art+=line('M45 169Q80 189 121 188M140 188Q184 185 211 166','#fbfff5',1.85,.98);
  // Rear left floret: broad crown and a short, branching tender stem.
  art+=p('M81 115L92 112L99 126L110 116L117 122L105 136L105 149L91 150L88 135L76 125Z','url(#r41-broccoli-stem)','stroke="#527443" stroke-width="2.2"');
  art+=line('M94 122L98 135L98 145M104 132L111 124','#e5f1bd',1.5,.98);
  art+=p('M61 108Q56 99 65 94Q65 85 76 84Q81 75 91 80Q102 73 109 83Q122 81 124 93Q135 97 128 108Q129 119 117 122Q111 130 101 125Q91 133 83 125Q69 127 67 117Q60 116 61 108Z','url(#r41-broccoli-green)');
  art+=p('M68 101Q67 91 79 91Q83 83 91 88Q101 82 108 91Q118 90 120 99Q108 94 103 101Q92 94 85 103Q75 97 68 107Z','#b2d67b','stroke="none" opacity=".7"');
  art+=line('M71 98Q73 91 80 93M88 87Q94 83 99 90M108 91Q115 91 116 97M78 113Q84 109 89 114M101 111Q107 106 112 111','#d4e7a0',1.5,.96);
  art+=line('M65 107L69 109M91 119L95 122M120 104L122 107','#527f36',1.35,.88);
  // Rear right is narrower and tilted; it is not a scaled clone of the first crown.
  art+=p('M155 121L165 117L171 134L182 131L186 140L172 147L168 158L155 155L159 142L149 132Z','url(#r41-broccoli-stem)','stroke="#527443" stroke-width="2.2"');
  art+=line('M162 128L165 142L162 151M168 141L179 137','#e5f1bd',1.5,.98);
  art+=p('M141 111Q137 102 145 97Q145 87 156 87Q165 80 172 90Q184 88 188 99Q199 101 195 112Q199 124 187 128Q181 137 171 131Q160 137 152 129Q139 128 141 117Z','url(#r41-broccoli-deep)');
  art+=p('M148 105Q148 96 158 97Q166 89 172 98Q184 94 188 105Q176 102 170 109Q157 102 148 112Z','#a4ce6b','stroke="none" opacity=".76"');
  art+=line('M151 101Q154 96 160 100M168 96Q176 94 178 101M183 113Q189 109 191 115M157 118Q162 115 166 121','#c8e18e',1.5,.97);
  art+=line('M145 115L148 117M176 125L181 126','#4c7b34',1.35,.88);
  // The front floret opens towards the viewer, with a visibly cut pale-green stem.
  art+=p('M113 142L125 136L132 145L143 135L151 141L138 153L139 166L126 171L119 160L106 154Z','url(#r41-broccoli-stem)','stroke="#527443" stroke-width="2.2"');
  art+=p('M124 157L135 155L137 165L128 168Z','#d8eaaa','stroke="#91ad61" stroke-width="1.3"');
  art+=line('M124 145L129 156M132 151L144 142','#edf5c8',1.5,.98);
  art+=p('M98 137Q94 127 103 122Q106 112 118 116Q125 108 135 116Q148 111 154 123Q165 124 162 135Q167 146 155 151Q149 160 138 154Q128 162 119 155Q105 158 103 149Q95 147 98 137Z','url(#r41-broccoli-green)');
  art+=p('M105 130Q107 122 117 124Q125 116 133 124Q146 120 151 131Q140 127 134 134Q121 127 113 136L104 137Z','#aed376','stroke="none" opacity=".78"');
  art+=line('M109 129Q112 123 118 128M125 122Q132 119 135 127M143 128Q150 127 152 134M111 143Q116 138 120 144M135 143Q142 138 147 144','#d4e79e',1.5,.97);
  // Three small red-pepper pieces provide a clean stir-fry accent, with no creamy topping.
  art+=p('M58 146Q60 137 68 139L78 147L73 155L63 155Z','url(#r41-broccoli-pepper)','stroke="#994d37" stroke-width="1.8"');
  art+=line('M63 144L68 142L74 148','#ffbd8d',1.4,.98);
  art+=p('M174 152L183 144Q191 144 194 152L188 160L178 160Z','url(#r41-broccoli-pepper)','stroke="#994d37" stroke-width="1.8"');
  art+=line('M179 153L185 148L189 151','#ffbd8d',1.4,.98);
  art+=p('M130 105L137 100L143 105L141 113L134 114Z','url(#r41-broccoli-pepper)','stroke="#994d37" stroke-width="1.75"');
  art+=line('M134 105L138 103L140 107','#ffbd8d',1.3,.98);
  return doc('爆炒西兰花',defs,art,-9);
}

function friedMilk(){
  const defs=grad('r41-milk-plate',['#fdf9ef','#e4e5d7','#b7c4b4'])
    +grad('r41-milk-crisp',['#ffda89','#efb858','#ce8a35'])
    +grad('r41-milk-side',['#e9b05a','#cf903b','#aa6e2e'])
    +grad('r41-milk-white',['#fffdf0','#fff5df','#f2e3c4']);
  let art=e(128,163,100,31,'url(#r41-milk-plate)');
  art+=e(128,159,87,23,'#fffdf0','stroke="#b1beaa" stroke-width="1.4"');
  art+=line('M45 171Q80 191 122 190M141 190Q183 187 211 168','#fffff4',1.85,.98);
  // First whole bar: a slender golden crust and a softly uneven battered outline.
  art+=p('M103 102Q104 96 111 96L180 112Q187 111 191 118L191 126L185 137Q182 141 175 137L107 122Q101 122 100 116Z','url(#r41-milk-side)');
  art+=p('M105 100Q109 96 115 99L179 114Q186 114 188 120L181 127L111 111L103 108Z','url(#r41-milk-crisp)','stroke="#b77c32" stroke-width="1.5"');
  art+=p('M112 101L176 117L181 122Q167 117 156 119L137 112L116 110Z','#ffe39c','stroke="none" opacity=".75"');
  art+=line('M112 101L125 104M151 111L161 114M180 124L184 121','#fff3bd',1.7,.98);
  art+=line('M119 115L123 118M143 120L147 123M171 128L175 130','#b87c30',1.35,.86);
  art+=p('M133 107L136 105L139 108L136 111Z','#e0a13f','stroke="none"');
  art+=p('M168 119L172 117L174 121L171 123Z','#d99b3b','stroke="none"');
  // Second whole bar slants the other way; fine crust texture has no bread-like pores.
  art+=p('M57 135Q56 128 64 125L129 104Q138 101 142 109L148 121Q149 127 141 131L74 154Q65 158 59 148Z','url(#r41-milk-side)');
  art+=p('M60 132Q61 128 67 128L130 107Q136 105 138 111L141 119L72 143Q64 145 60 139Z','url(#r41-milk-crisp)','stroke="#b77c32" stroke-width="1.5"');
  art+=p('M67 130L127 111L133 113Q119 119 107 120L88 129L70 136Z','#ffe39a','stroke="none" opacity=".75"');
  art+=line('M68 130L82 126M106 117L116 114M65 140L68 141','#fff2b9',1.7,.98);
  art+=line('M80 144L85 142M107 136L111 133M131 127L136 125','#b97c30',1.35,.88);
  art+=p('M92 124L96 121L99 124L96 127Z','#dfa03f','stroke="none"');
  art+=p('M119 121L123 118L125 122L122 125Z','#e0a241','stroke="none"');
  // One shorter cut portion exposes smooth milk-white filling behind a thin crisp rim.
  art+=p('M132 147Q133 142 140 140L171 130Q177 128 182 133L196 144Q200 149 195 156L181 166L150 177Q143 178 137 172L128 161Q125 154 132 147Z','url(#r41-milk-side)');
  art+=p('M134 146L172 133Q177 131 181 136L191 145Q194 148 190 151L151 164L132 153Z','url(#r41-milk-crisp)','stroke="#b77c32" stroke-width="1.5"');
  art+=p('M134 150Q131 150 130 156L135 165Q141 174 148 173L153 166Q155 160 149 156L139 150Z','url(#r41-milk-crisp)','stroke="#9b6a32" stroke-width="1.7"');
  art+=p('M136 154Q134 154 134 158L139 165Q143 169 147 168L149 164Q150 162 145 159L140 155Z','url(#r41-milk-white)','stroke="#d5bf96" stroke-width="1.3"');
  art+=p('M137 155Q138 154 141 157L147 161L146 164Q140 163 137 159Z','#fffef5','stroke="none"');
  art+=line('M143 145L154 141M169 136L175 135M180 155L185 153','#fff2b9',1.7,.98);
  art+=line('M159 167L164 165M182 159L187 157M135 169L139 173','#b77a2e',1.35,.9);
  art+=p('M160 147L163 144L167 146L164 150Z','#dda03e','stroke="none"');
  art+=p('M180 142L183 140L186 143L183 145Z','#e0a240','stroke="none"');
  return doc('脆皮炸鲜奶',defs,art,-9);
}

export const wokMiddleCandidates=[
  {id:'dish-fresh-ico-0113',code:'DS94',name:'爆炒西兰花',expectedOccupancy:.82,svg:broccoliStirFry(),
    reason:'三簇大小、角度和花冠形状不同的熟绿西兰花保留短枝与嫩绿切茎，三片少量鲜红椒添活力，克制油亮呈清爽炒盘，不带融芝士或奶油。',
    design:{silhouette:'三簇独立熟绿花冠与短枝，前后大小错落，三小红椒片不抢主体',angle:'三分之四俯视，花冠颗粒、分叉短枝及嫩绿切茎可辨',material:'鲜活熟绿花冠、浅嫩绿茎、鲜红椒片和少量自然油光',identity:'仅西兰花和红椒，不添加芝士、奶油或不明配菜',container:'无柄浅青白炒盘，成品含盘82%，与DS71带柄芝士焗皿区分'}},
  {id:'dish-fresh-ico-0117',code:'DS95',name:'脆皮炸鲜奶',expectedOccupancy:.82,svg:friedMilk(),
    reason:'两整条与一较短切口段错向摆放，金黄细脆薄壳衬奶白柔润内馅，边缘轻微不规则与少量清亮高光表现刚炸好的酥鲜，不像面包片或油腻肉块。',
    design:{silhouette:'两条细长完整鲜奶条和一段较短切口，总三段，切口处奶白内馅清楚',angle:'三分之四俯视，薄酥壳、条形厚度与短段奶白截面分层',material:'细脆金黄外壳、奶白柔润内馅、克制油亮与细小脆屑纹理',identity:'仅纯牛奶、面粉、砂糖，不添加蘸酱、水果、肉类或培根',container:'浅米白圆盘，成品含盘82%，透明留白与视觉居中'}}
];

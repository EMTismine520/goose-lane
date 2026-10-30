// Round 43: solid milk jelly with apple and cinnamon, not a drink or round pudding.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 搅拌机甜品新版</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function cinnamonAppleMilkJelly(){
  const defs=grad('r43-d108-plate',['#fbfff2','#e4eee0','#a8c5b3'])
    +grad('r43-d108-jelly',['#fffcE9','#f7edcf','#dfd0ac'])
    +grad('r43-d108-top',['#fffdf0','#fbf4dc','#ecdfbb'])
    +grad('r43-d108-cut',['#fffbea','#f2e8cd','#e0d2b0'])
    +grad('r43-d108-apple',['#ffe8a9','#f8d18a','#e4b26b'])
    +grad('r43-d108-skin',['#f28c70','#da6255','#b74640'])
    +grad('r43-d108-cinnamon',['#d7a16b','#b67d4c','#8e5837']);
  let art=e(128,169,101,31,'url(#r43-d108-plate)');
  art+=e(128,164,88,23,'#fffdf0','stroke="#aec5ad" stroke-width="1.45"');
  art+=line('M44 176Q76 195 117 194M143 193Q188 189 212 173','#fcfff5',1.8);
  art+=e(126,159,66,16,'#8b7955','stroke="none" opacity=".11"');

  // Two different apple slices sit behind the jelly; their red skin follows a curved peel edge.
  art+=p('M125 116Q128 100 140 93Q154 86 166 96Q173 104 168 117Q153 127 137 123Z','url(#r43-d108-apple)');
  art+=p('M140 93Q154 86 166 96Q173 104 168 117L162 121Q167 109 160 102Q151 94 139 100L130 110Q132 100 140 93Z','url(#r43-d108-skin)','stroke="none"');
  art+=p('M132 115Q136 102 146 100Q156 98 162 106Q155 116 142 119Z','#ffe9af','stroke="none"');
  art+=line('M136 111Q140 103 148 103M152 102L157 105','#fff4cb',1.55);
  art+=line('M164 100Q168 107 165 113','#ffc2a0',1.4);

  art+=p('M164 121Q168 107 180 104Q194 101 203 114Q209 124 200 133Q185 137 172 131Z','url(#r43-d108-apple)');
  art+=p('M180 104Q194 101 203 114Q209 124 200 133L193 135Q201 125 196 118Q188 109 177 112L168 121Q170 109 180 104Z','url(#r43-d108-skin)','stroke="none"');
  art+=p('M171 123Q175 114 184 113Q192 113 197 122Q189 129 177 128Z','#ffe9ad','stroke="none"');
  art+=line('M175 121Q180 115 186 116M199 116L201 120','#fff3c5',1.5);

  // The first jelly has a softly sagging square footprint and gently bowed sides.
  art+=p('M59 125Q59 114 70 110Q88 104 105 111L124 119Q132 123 132 136L129 151Q126 160 111 164Q89 166 71 158Q61 154 60 144Z','url(#r43-d108-jelly)');
  art+=p('M60 124Q59 115 70 111Q88 105 105 112L123 120Q132 124 129 132Q121 141 104 142Q86 143 68 134Q61 131 60 124Z','url(#r43-d108-top)','stroke="#c1b393" stroke-width="1.45"');
  art+=p('M63 128Q68 137 73 141L73 151Q88 160 109 160Q121 158 128 152Q126 160 111 164Q89 166 71 158Q63 154 62 144Z','#d3c6a7','stroke="none" opacity=".41"');
  art+=p('M68 120Q76 111 92 114Q106 115 115 122Q100 118 90 121Q78 117 68 124Z','#fffff5','stroke="none" opacity=".87"');
  art+=line('M67 133Q68 141 70 145M77 154Q87 159 98 160M107 160L115 158','#fffdf0',1.65,.96);
  art+=line('M80 113Q87 111 94 114','#fffef5',1.65);

  // A third, smaller apple wedge is left visible beside the front piece.
  art+=p('M54 156Q60 143 71 141Q82 141 89 151Q91 157 84 163Q69 169 57 164Z','url(#r43-d108-apple)');
  art+=p('M54 156Q61 162 72 161Q82 160 88 152Q91 157 84 163Q69 169 57 164Z','url(#r43-d108-skin)','stroke="none"');
  art+=p('M59 155Q64 146 72 147Q79 146 83 153Q73 160 61 158Z','#ffebae','stroke="none"');
  art+=line('M62 152Q68 147 75 150M62 163L68 164','#fff3ca',1.45);

  // The front jelly is a second rounded square, not a repeated mould or a rigid cube.
  art+=p('M105 146Q108 134 125 134Q143 133 160 141Q177 145 181 156L179 171Q174 184 156 186Q135 189 115 181Q104 176 103 163Z','url(#r43-d108-jelly)');
  art+=p('M106 146Q108 136 125 135Q143 134 159 142Q173 145 177 154Q174 163 159 168Q139 171 120 163Q109 160 106 152Z','url(#r43-d108-top)','stroke="#bfb192" stroke-width="1.45"');
  art+=p('M107 156Q112 165 123 168Q143 178 161 174Q172 173 179 167L179 171Q174 184 156 186Q135 189 115 181Q107 177 105 169Z','#d1c1a0','stroke="none" opacity=".38"');
  art+=p('M115 144Q127 137 140 142Q153 143 161 149Q145 146 136 149Q124 145 115 149Z','#fffff6','stroke="none" opacity=".88"');
  art+=line('M111 155L113 166M120 178Q137 185 153 182M160 181L167 178','#fffdf0',1.65,.98);
  art+=line('M121 139Q128 138 136 140','#fffff5',1.65);
  // One small curved cut at the front-right exposes the smooth, moist set interior.
  art+=p('M165 150Q176 151 180 158L179 170Q174 178 165 180Q168 171 164 164L159 160Z','url(#r43-d108-cut)','stroke="#a99b7e" stroke-width="1.5"');
  art+=p('M166 152Q173 153 177 158L176 168Q173 172 169 173Q170 165 165 161L162 159Z','#fffbee','stroke="none" opacity=".92"');
  art+=line('M169 155Q174 156 175 161M169 175L174 172','#fffff6',1.45);

  // Exactly one short cinnamon quill rests on the plate; no syrup or cream is added.
  let stick=p('M-22-3Q-20-6-16-5L20-4Q25-2 22 3L-17 5Q-23 5-22-3Z','url(#r43-d108-cinnamon)','stroke="#805638" stroke-width="2.2"');
  stick+=p('M-19-2L18-2L19 0L-18 1Z','#efc18b','stroke="none" opacity=".83"');
  stick+=line('M-16 3L17 2','#845337',1.3,.93);
  stick+=e(21,-.5,2.6,4,'#c58c57','stroke="#805638" stroke-width="1.35"');
  stick+=p('M21-3Q24-1 22 1Q20 2 20 0Q20-1 21-1','none','stroke="#825032" stroke-width="1.2"');
  art+=`<g transform="translate(95 181) rotate(-12)">${stick}</g>`;
  return doc('肉桂苹果奶冻',defs,art);
}

export const blenderTailCandidates=[
  {id:'dish-fresh-ico-0127',code:'DS108',name:'肉桂苹果奶冻',expectedOccupancy:.82,svg:cinnamonAppleMilkJelly(),
    reason:'两小块自然圆软方形象牙奶冻前后错落，微弯侧面、轻透凝润边和一处轻切口显示柔软固体质感；三片不等红皮暖金苹果与一支短肉桂棒让原料清楚可辨。',
    design:{silhouette:'两块大小与轮廓略异的圆软方形奶冻，一处小切口朝外，区别高玻璃热奶与圆模布丁',angle:'三分之四俯视，可见柔润顶部、微弯厚侧面和一处光滑凝润切面',material:'温暖象牙奶冻、克制水润反光与轻透底缘；苹果红皮薄而清楚，果肉柔暖金黄',identity:'仅苹果、纯牛奶与肉桂；不加蜂蜜、焦糖、奶油、香草或其它未列主料',container:'青白浅盘安静承托，三片苹果和一支短肉桂棒，含盘82%体量与透明留白'}}
];

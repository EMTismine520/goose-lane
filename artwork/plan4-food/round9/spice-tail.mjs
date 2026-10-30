// Review alternatives only. The selected production artwork is left untouched.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const l=(d,color,width=1.45,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const g=(id,colors,coords='x1=".1" y1="0" x2=".82" y2="1"')=>`<linearGradient id="${id}" ${coords}>${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 香料新稿</title><defs>${defs}</defs><g stroke="#3d3027" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function basil(){
  const defs=g('bs9-fresh',['#d0df8a','#8fba5c','#5d8f42'])+g('bs9-deep',['#a3c874','#6d9f51','#437d43'])+g('bs9-fold',['#98bd65','#5b9448','#3a713c'])+g('bs9-stem',['#b8ca79','#71964b']);
  // Unequal, slightly cupped leaves overlap a short stem instead of a geometric tree.
  let a=p('M116 210C121 183 129 165 133 144M125 186 96 157M130 170 166 142M126 182 146 183','none','stroke="url(#bs9-stem)" stroke-width="5.8"');
  a+=p('M126 150C101 151 92 130 103 109C112 92 115 81 115 69C137 72 155 91 151 112C149 132 139 145 126 150Z','url(#bs9-deep)');
  a+=l('M126 142C129 119 126 94 120 79','#d9e8ab',1.6,.8);
  a+=p('M115 161C93 175 67 159 61 137C56 120 58 103 49 89C75 86 100 98 110 118C120 134 122 150 115 161Z','url(#bs9-fresh)');
  a+=p('M59 103C72 107 94 124 110 151C91 143 70 133 59 103Z','#e1e9b0','opacity=".18" stroke="none"');
  a+=l('M110 157C94 138 79 117 61 103','#557e3e',1.65,.7);
  a+=l('M93 137 73 133M83 122 79 111M103 149 87 148','#d3e3a1',1.25,.65);
  a+=p('M137 159C130 133 142 111 161 99C176 90 192 90 205 80C213 106 205 131 184 148C170 160 151 168 137 159Z','url(#bs9-deep)');
  a+=l('M143 155C162 136 180 114 198 92','#d2e2a0',1.65,.85);
  a+=l('M159 138 162 116M173 122 194 117M149 149 173 148','#527e40',1.3,.6);
  a+=p('M124 191C98 199 76 188 70 168C67 158 68 148 62 137C90 134 117 146 126 163C133 175 132 183 124 191Z','url(#bs9-fold)');
  a+=l('M121 185C108 170 91 155 74 147','#c0d895',1.6,.8);
  a+=p('M132 188C134 170 150 158 172 160C186 161 198 169 210 170C201 192 181 205 159 202C144 200 135 197 132 188Z','url(#bs9-fresh)');
  a+=l('M139 188C161 183 183 180 200 176','#638543',1.5,.72);
  a+=l('M160 184 168 170M173 182 186 190','#d8e6a9',1.3,.8);
  a+=p('M124 181C107 172 103 150 115 131C121 120 135 114 144 105C158 124 160 148 147 166C139 177 131 182 124 181Z','url(#bs9-fresh)');
  a+=l('M126 174C132 156 137 137 141 118','#618640',1.6,.75);
  a+=l('M132 154 120 141M136 139 148 134','#dce6ad',1.3,.72);
  return doc('罗勒',defs,a);
}

function cinnamon(){
  const defs=g('cn9-bark',['#dfac6f','#b77844','#8f5334'])+g('cn9-light',['#efc38c','#d59a60','#ad6b3e'])+g('cn9-inner',['#f3d1a1','#d99c65','#ac683e']);
  function roll(short=false){
    const end=short?84:142;
    // A generous quill diameter survives 40px; two shallow splits keep the far lip bark-like.
    let a=p(`M0 -25C${end*.23} -31 ${end*.48} -22 ${end*.7} -27L${end-8} -24Q${end+2} -24 ${end+4} -13L${end+3} -5L${end-1} -2L${end+3} 5L${end+1} 14L${end-3} 13L${end-2} 22Q${end-6} 26 ${end-12} 25C${end*.64} 28 ${end*.42} 20 ${end*.18} 28L0 27Z`,'url(#cn9-bark)');
    a+=p(`M5 -21C${end*.28} -25 ${end*.55} -18 ${end-8} -22L${end-4} -8C${end*.65} -7 ${end*.32} -12 6 -5Z`,'url(#cn9-light)','stroke="none"');
    a+=p(`M9 12C${end*.3} 6 ${end*.64} 13 ${end-3} 3L${end-6} 18C${end*.72} 27 ${end*.4} 19 11 26Z`,'#76442c','stroke="none" opacity=".16"');
    a+=l(`M12 -15C${end*.34} -19 ${end*.6} -10 ${end-10} -17`,'#f1c28b',2.0,.68);
    a+=l(`M12 12C${end*.3} 7 ${end*.6} 16 ${end-9} 9`,'#75452e',1.4,.65);
    a+=l(`M21 19C${end*.45} 15 ${end*.7} 23 ${end-18} 18`,'#e6b17b',1.4,.6);
    a+=l(`M${end*.48} -7l${end*.12} 1M${end*.65} 3l${end*.16} -1`,'#8d5433',1.1,.5);
    a+=l(`M${end-7} -20Q${end-2} -8 ${end-7} 3`,'#6f412c',1.4,.62);
    a+=p('M0-25C-15-27-25-16-25 0C-25 17-15 29 0 27C16 27 24 15 23 0C22-15 15-24 0-25Z','url(#cn9-inner)');
    a+=p('M-10-10C0-20 14-12 13 1C12 13 0 17-8 10C-13 4-6-5 1 0C6 5 1 9-2 6','none','stroke="#7b472e" stroke-width="2.3"');
    a+=l('M-18-7Q-18-17-8-20','#f7d9ad',1.8,.9);
    return a;
  }
  let a='<g transform="translate(62 119) rotate(-27)">'+roll()+'</g>';
  a+='<g transform="translate(67 183) rotate(-20) scale(.68)">'+roll(true)+'</g>';
  a+='<g transform="translate(93 170) rotate(-22)">'+roll()+'</g>';
  return doc('肉桂',defs,a);
}

function vanillaSeeds(){
  const defs=g('vs9-wood',['#f4d9ac','#d4aa74','#b07d48'])+g('vs9-rim',['#e5c28e','#bf8e56','#96633f'])+g('vs9-seeds',['#60442e','#3c2c22','#291f1a'])+g('vs9-pod',['#946943','#64422e','#3e2d23']);
  // A shallow wooden scoop and an opened vanilla pod give two distinct identity cues.
  let a=p('M120 133C143 150 168 170 197 195C204 201 204 208 199 212C194 216 188 213 183 208C160 181 139 160 115 143Z','url(#vs9-wood)');
  a+=l('M139 154Q169 183 193 206','#f3d4a5',2,.78);
  a+=p('M60 72C77 55 107 62 132 84C158 106 164 133 149 151C132 171 99 160 75 140C51 121 44 90 60 72Z','url(#vs9-rim)');
  a+=p('M61 72C78 56 108 65 131 85C152 104 156 126 143 140C129 155 104 147 82 129C60 111 47 88 61 72Z','url(#vs9-wood)');
  a+=p('M69 79C81 68 105 77 122 92C139 106 146 124 136 134C126 144 105 136 88 123C72 110 59 90 69 79Z','url(#vs9-seeds)','stroke-width="1.6"');
  for(let i=0;i<42;i++){
    const a0=i*2.399963,r=5+Math.sqrt(i/42)*30,x=101+Math.cos(a0)*r*.92,y=108+Math.sin(a0)*r*.57;
    a+=e(x,y,.8+(i%3)*.2,.65+(i%2)*.3,i%4===0?'#a47c4e':i%3===0?'#211b17':'#775537','stroke="none"');
  }
  a+=l('M58 84C56 102 73 121 93 136','#ffe7bc',2,.85);
  a+=l('M76 68Q94 67 111 78','#fff1cf',1.7,.6);
  a+=p('M147 55C150 81 161 106 175 129C183 143 186 160 180 176C190 158 185 139 179 125C166 100 158 77 157 53C155 47 149 49 147 55Z','url(#vs9-pod)');
  a+=p('M155 56C158 82 169 107 182 128C190 143 195 153 194 165C202 152 194 135 188 123C175 98 166 78 161 54C159 49 156 50 155 56Z','url(#vs9-pod)');
  a+=l('M154 61C158 88 169 113 180 132','#cc9b62',1.25,.75);
  a+=l('M157 59Q164 93 180 120','#251d17',1.35,.85);
  return doc('香草籽',defs,a);
}

function vanillaExtract(){
  const defs=g('ve9-glass',['#bf8b4e','#945d35','#573a2b'])+g('ve9-liquid',['#a86a37','#794626','#4d3022'])+g('ve9-cork',['#e3bc87','#c3935f','#a5784a'])+g('ve9-paper',['#fff6d9','#f1dfb4','#dbc694']);
  const bottle='M105 58L105 80C103 88 83 94 78 109C74 121 75 167 76 192C76 206 86 213 99 214L165 214C179 214 186 207 186 193L186 119C186 99 165 94 159 81L159 58Z';
  let a=p(bottle,'url(#ve9-glass)');
  a+=p('M82 129C103 133 153 135 180 129L180 192C180 203 173 207 163 208L101 208C90 208 82 202 82 191Z','url(#ve9-liquid)','stroke="none"');
  a+=l('M83 130Q130 137 178 131','#d3a366',1.5,.75);
  a+=l('M112 79Q113 88 96 99C86 107 84 116 84 134L84 175','#f4cc8c',4,.67);
  a+=l('M177 152 177 184Q178 199 168 201','#c28e54',1.7,.58);
  a+=p('M98 134Q99 130 105 130L161 130Q166 130 166 135L166 177Q166 182 160 182L104 182Q98 182 98 177Z','url(#ve9-paper)','stroke="#684c35" stroke-width="1.6"');
  a+=p('M112 166C125 159 135 147 145 143C145 156 134 168 117 170Z','#8b613e','stroke="#684c35" stroke-width="1.2"');
  a+=l('M116 166 141 147','#d4b682',1.1,.8);
  a+=p('M106 63L105 47Q105 42 110 42L154 42Q160 42 160 47L159 63Z','url(#ve9-cork)');
  a+=e(132,43,27,5.2,'#e4c495','stroke-width="1.7"');
  a+=l('M113 49 113 57M123 48 123 53M148 49 148 58','#9e754b',1.2,.65);
  a+=p('M104 63Q131 67 160 63L160 73Q131 78 104 72Z','url(#ve9-glass)','stroke-width="2.2"');
  a+=l('M110 66Q126 70 146 67','#dfb678',1.6,.75);
  return doc('香草精',defs,'<g transform="rotate(5 131 128)">'+a+'</g>');
}

function mixedLeaves(){
  const defs=g('mx9-bay',['#c7d58a','#92ab59','#657e42'])+g('mx9-sage',['#b6ccb0','#81a88c','#568174'])+g('mx9-mint',['#b5d77d','#73a353','#477943'])+g('mx9-dry',['#d5bb7d','#b18e50','#8c6b3e'])+g('mx9-tie',['#e9ca8b','#c3a165']);
  let a=l('M109 214 144 74M117 213 89 103M124 209 180 118M119 210 119 109','#5d7844',4.2,1);
  // Rosemary behind the broad leaves: three sparse pairs keep the small silhouette legible.
  a+=l('M134 151 154 57','#557648',3.1,1);
  a+=p('M150 78C139 76 137 65 140 58C150 62 154 70 150 78ZM153 84C154 71 162 64 170 63C169 74 163 83 153 84ZM145 103C134 98 133 89 134 81C145 86 149 94 145 103ZM149 112C152 98 162 91 171 91C169 102 161 111 149 112Z','url(#mx9-sage)','stroke-width="2.2"');
  a+=p('M107 163C83 153 74 129 80 107C84 88 82 75 76 64C106 70 130 91 131 116C133 138 121 156 107 163Z','url(#mx9-bay)');
  a+=l('M111 152C110 120 99 94 86 77','#6f8248',1.6,.75);
  a+=l('M110 129 91 115M105 108 111 93M113 142 124 124','#e1e2ad',1.25,.75);
  a+=p('M126 170C126 145 138 126 160 119C177 113 192 119 207 113C203 141 185 167 164 173C148 178 137 176 126 170Z','url(#mx9-sage)');
  a+=l('M135 169C159 151 182 137 196 123','#4f7767',1.65,.8);
  a+=l('M157 154 159 135M173 142 187 149','#cfdec2',1.3,.8);
  a+=p('M117 191C93 195 72 180 61 164C73 159 78 147 78 136C103 140 123 154 128 171C131 180 126 187 117 191Z','url(#mx9-mint)');
  a+=l('M120 185C105 175 89 160 78 148','#638947',1.55,.8);
  a+=p('M133 192C139 171 155 164 171 170C183 174 190 183 202 186C185 205 165 213 146 205C139 202 134 197 133 192Z','url(#mx9-dry)');
  a+=l('M140 193C157 191 174 189 192 188','#785e39',1.5,.8);
  a+=p('M119 179C102 169 102 150 111 136L119 124L124 117L130 125L137 123L138 131L146 135L141 142L145 149L138 153C138 167 129 177 119 179Z','url(#mx9-mint)');
  a+=l('M122 172 128 131','#638847',1.5,.75);
  a+=p('M103 197Q118 192 136 191L139 201Q123 205 106 207Z','url(#mx9-tie)','stroke-width="2.1"');
  a+=l('M108 201 133 196','#f5e1ad',1.3,.8);
  return doc('混合香叶',defs,a);
}

export const spiceTailCandidates=[
  {id:'fresh-spice-6',name:'罗勒',svg:basil(),expectedOccupancy:.78,design:{silhouette:'六枚大小不等、自然错层的圆润嫩叶围合成低矮叶簇，短茎从底部露出',angle:'轻俯视，前叶遮挡后叶，避免一根竖直树枝的几何排列',material:'明亮青绿、稍深背叶与柔和叶面反光，轻微卷曲表现鲜嫩',identity:'宽圆基部、饱满叶面与浅中脉形成罗勒的大叶特征',container:'裸叶簇透明背景，无花、无器皿'},reason:'将规则竖枝改为自然嫩叶簇，以宽阔叶面和克制层次表现鲜嫩，保留小图清楚的深色轮廓。'},
  {id:'fresh-spice-7',name:'肉桂',svg:cinnamon(),expectedOccupancy:.80,design:{silhouette:'两根长卷皮错层斜放，一枚短段靠在下方，卷口与自然起伏边缘清楚',angle:'三分之四侧视，左近端展露卷口，长轴向右上延伸',material:'蜂蜜褐与赤棕树皮，少量纵向纹理和薄边高光，卷内颜色更深',identity:'近端卷曲螺旋、薄皮层和不平直的卷身区别木管或饼干',container:'裸肉桂透明背景，无绑带或器皿'},reason:'以真实卷皮的薄层、弯曲边和长短主次重绘肉桂，减少僵直木管感。'},
  {id:'fresh-spice-8',name:'香草籽',svg:vanillaSeeds(),expectedOccupancy:.80,design:{silhouette:'一把浅木匙斜托深棕细籽，侧边两片剖开的细长香草荚',angle:'略俯视，椭圆匙面显露籽床与木质薄边',material:'温润浅木、细小黑棕籽与暗褐柔韧荚皮，反光克制',identity:'细籽床搭配开荚形体，不把香草籽画成大豆粒或咖啡豆',container:'只有必要承托的小木匙，透明背景，无额外餐具'},reason:'用浅木匙与开荚取代原碗式摆法，深浅块面更清楚，保留香草细籽的身份线索。'},
  {id:'fresh-spice-9',name:'香草精',svg:vanillaExtract(),expectedOccupancy:.80,design:{silhouette:'短颈圆肩琥珀瓶轻微倾斜，软木塞、液面和无字浅色标签清楚',angle:'近正面略俯视，瓶口小椭圆带来体积，瓶身轻倾而不歪斜',material:'琥珀玻璃与深棕液体，左侧窄反光、底部折射及暖纸标签',identity:'小瓶、软木封口、液体与香荚图案共同指向香草精',container:'食材本身的玻璃瓶，透明背景，无桌面或配件'},reason:'以圆肩小琥珀瓶重做体积与液体层次，保留干净无字标签和清楚瓶形。'},
  {id:'fresh-spice-10',name:'混合香叶',svg:mixedLeaves(),expectedOccupancy:.80,design:{silhouette:'宽月桂叶、灰绿鼠尾草叶、明绿薄荷与细迷迭香错层成小束，一枚暖褐干叶点出混合感',angle:'轻俯视，窄叶在后、宽叶前后分层，底部短束口集中形体',material:'深浅不同的鲜叶与一点干叶暖褐，叶脉少而清楚，避免花束装饰',identity:'宽叶、锯齿叶和细针叶三种明显形体区别单一罗勒叶簇',container:'裸香叶小束，一条简洁束口，透明背景'},reason:'通过不同叶形、叶色与干鲜变化组织混合香叶，让它在小图中也能区别罗勒。'},
];

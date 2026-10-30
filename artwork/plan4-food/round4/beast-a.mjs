// Round 4: individually authored alternatives for the user to select.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const s=(d,color,width=1.5,extra='')=>p(d,'none',`stroke="${color}" stroke-width="${width}" ${extra}`);
const linear=(id,colors,coords='x1=".1" y1="0" x2=".8" y2="1"')=>`<linearGradient id="${id}" ${coords}>${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const radial=(id,colors)=>`<radialGradient id="${id}" cx=".31" cy=".2" r=".9">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</radialGradient>`;
const doc=(name,prefix,defs,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 全新设计候选</title><defs>${defs}</defs><g stroke="#37271f" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`.replace(/id="/g,`id="${prefix}-`).replace(/url\(#/g,`url(#${prefix}-`);

function sausage(){
  const shape='M77 52C90 57 90 79 91 91C93 129 117 158 149 166C171 172 187 163 200 158C214 153 229 171 220 184C199 213 156 221 119 207C70 190 42 144 42 96C40 72 48 43 64 46C69 46 74 49 77 52Z';
  const defs=radial('sausage',['#f8ac8b','#df7963','#b94f44','#8c3735'])+linear('knot',['#ed9a7d','#bc6455'])+`<clipPath id="body">${p(shape,'#fff')}</clipPath>`;
  let b=p('M53 50C45 46 42 43 40 36C47 38 53 39 58 44C58 36 63 33 67 31C70 38 71 43 65 50Z','url(#knot)','stroke-width="2.4"');
  b+=p('M218 161C224 155 231 153 238 154C235 162 231 167 225 169C234 172 237 178 237 184C230 183 223 179 218 174Z','url(#knot)','stroke-width="2.4"');
  b+=p(shape,'url(#sausage)');
  b+='<g clip-path="url(#body)" stroke="none">'+p('M48 88C58 140 85 179 123 194C158 209 195 201 220 180C212 203 186 219 153 215C90 216 42 162 40 108Z','#833937','opacity=".2"')+p('M66 60C59 81 60 103 65 121C69 132 77 129 76 120C72 98 76 78 80 67Z','#ffd5ad','opacity=".44"')+'</g>';
  b+=s('M61 69C57 86 59 105 63 117','#ffe2bb',4.1,'opacity=".87"')+s('M77 143C83 154 90 161 99 168M116 182L128 188M153 194Q173 195 187 188','#873b36',1.65,'opacity=".66"')+s('M87 160L93 163M109 178L114 179M172 179L184 176','#f3b08d',1.6,'opacity=".64"');
  return doc('香肠','b01',defs,b);
}

function bacon(){
  const defs=linear('lean',['#f8b3a0','#e88678','#bd574f'])+linear('edge',['#d58270','#aa4d46'])+linear('fat',['#fff2db','#f5d5b7','#e7b49b']);
  let b='';
  // Three independently shaped short strips, close enough to read as a compact stack.
  b+=p('M63 58C83 48 101 62 119 64C144 71 162 50 186 57L205 71L205 100C183 91 164 112 141 111C113 114 91 90 65 100L51 86Z','url(#edge)');
  b+=p('M63 58C83 48 101 62 119 64C144 71 162 50 186 57L205 71C180 67 165 89 141 87C113 89 91 66 66 78L51 86Z','url(#lean)');
  b+=p('M60 66C84 56 100 73 122 75C149 83 169 61 194 65L199 70C175 70 158 91 137 86C112 87 91 71 66 79L55 83Z','url(#fat)','stroke="none"');
  b+=p('M49 101C71 87 91 108 117 111C145 114 163 93 190 99L213 114L209 145C183 137 166 158 142 158C111 158 92 135 64 146L42 128Z','url(#edge)');
  b+=p('M49 101C71 87 91 108 117 111C145 114 163 93 190 99L213 114C188 104 168 130 140 130C111 132 91 108 66 120L42 128Z','url(#lean)');
  b+=p('M46 112C70 97 92 119 116 121C146 126 168 102 195 108L204 114C179 111 162 138 134 136C109 137 87 117 65 128L46 137Z','url(#fat)','stroke="none"');
  b+=p('M51 146C77 134 95 153 119 156C145 161 163 143 190 148L210 163L206 194C180 184 162 206 136 205C108 206 87 184 65 195L40 176Z','url(#edge)');
  b+=p('M51 146C77 134 95 153 119 156C145 161 163 143 190 148L210 163C187 155 165 177 138 176C109 178 87 157 66 168L40 176Z','url(#lean)');
  b+=p('M45 159C68 145 94 168 119 168C148 175 168 152 195 157L204 162C181 160 162 183 137 183C110 184 91 166 67 177L45 185Z','url(#fat)','stroke="none"');
  b+=s('M67 59Q82 55 98 64M56 104Q71 100 85 108M56 150Q74 144 88 152','#ffe7ce',2.7,'opacity=".74"')+s('M69 189C93 181 111 201 137 199C163 200 178 181 200 188','#f3b89b',1.6,'opacity=".77"');
  return doc('培根','b02',defs,b);
}

function meatballs(){
  const defs=radial('back',['#c98764','#a95e43','#7c3c30','#5c2b27'])+radial('front',['#cf8b68','#ad6046','#844031','#5c2a26']);
  let b=p('M40 105C40 78 58 59 85 58C112 56 133 78 131 105C131 131 111 151 86 151C60 153 39 132 40 105Z','url(#back)');
  b+=s('M54 90C57 77 67 70 79 69','#f5c29b',3.5,'opacity=".78"')+s('M49 111Q54 130 72 136','#6c322b',1.5,'opacity=".8"');
  b+=p('M124 102C128 77 149 63 173 66C201 68 218 89 215 114C213 140 193 157 169 155C143 154 122 132 124 102Z','url(#back)');
  b+=s('M141 92C147 81 157 77 169 78','#edb590',3.4,'opacity=".74"')+s('M192 130Q183 143 170 143','#6b3029',1.6,'opacity=".76"');
  b+=p('M77 174C76 147 97 125 125 124C153 124 176 144 177 172C179 198 158 221 130 222C102 224 78 203 77 174Z','url(#front)');
  b+=s('M94 158C100 144 112 137 125 138','#f0bd95',3.6,'opacity=".8"')+s('M91 187Q100 204 118 207','#6e3229',1.6,'opacity=".77"');
  for(const [x,y]of [[84,86],[102,113],[66,113],[160,105],[185,100],[196,119],[112,168],[144,152],[152,183],[123,200]]) b+=e(x,y,1.7,1.3,'#5d2a25','stroke="none" opacity=".68"')+s(`M${x-1} ${y-2}l2-.4`,'#dc9b75',1.1,'opacity=".65"');
  b+=s('M104 98L110 101M164 121L171 124M110 186L116 190M143 167L149 169','#743b2c',1.35,'opacity=".55"');
  return doc('肉丸','b03',defs,b);
}

function porkBelly(){
  const defs=linear('skin',['#ffe6c4','#f0c097','#dca07f'])+linear('fat',['#fff5e3','#f3d8c1','#e8b9a1'])+linear('lean',['#f0a8a0','#dd807b','#bc5a59'])+linear('side',['#e69b8e','#bf7067']);
  let b=p('M43 87L169 49L218 82L215 172L89 212L42 178Z','url(#side)');
  b+=p('M89 117L218 82L215 172L89 212Z','url(#fat)');
  b+=p('M89 131C120 121 134 122 156 113L217 96L217 114L158 132C137 139 118 140 89 150Z','url(#lean)','stroke="none"');
  b+=p('M89 165C112 157 136 154 154 146L216 129L216 149L157 167C135 172 116 180 89 187Z','url(#lean)','stroke="none"');
  b+=p('M89 202C115 194 136 185 156 181L215 163L215 172L89 212Z','#ce8174','stroke="none"');
  b+=p('M43 87L89 117L89 212L42 178Z','url(#fat)');
  b+=p('M43 102L89 131V150L43 121Z','url(#lean)','stroke="none"');
  b+=p('M43 137L89 166V186L42 157Z','url(#lean)','stroke="none"');
  b+=p('M42 171L89 201V212L42 178Z','#cb7c70','stroke="none"');
  b+=p('M43 87C85 70 127 57 169 49L218 82L89 117Z','url(#skin)');
  b+=p('M57 86C92 74 131 63 165 58L199 80L91 109Z','#ffead0','stroke="none" opacity=".42"');
  b+=s('M62 83C94 72 126 64 152 59','#fff4de',3.8,'opacity=".85"')+s('M96 141C123 132 138 133 153 126L205 110M96 178C120 169 138 166 156 158L204 144','#f6c9b8',1.5,'opacity=".82"');
  b+=s('M89 119V207M46 96V174','#7a5144',1.35,'opacity=".5"');
  for(const [x,y]of [[85,85],[111,78],[139,70],[164,78],[182,84],[115,96]]) b+=e(x,y,1.3,.8,'#b97e62','stroke="none" opacity=".5"');
  return doc('五花肉','b04',defs,b);
}

function ribs(){
  const defs=linear('bone',['#fff8e7','#f5dfbf','#dcbf99'])+linear('meat',['#f6b3a5','#e58e84','#c96a65'])+linear('depth',['#d27b72','#ac5651'])+linear('fat',['#fff0db','#eac5ad']);
  let b='';
  const bones=[{x:60,y:68,a:-13,h:66},{x:100,y:58,a:-8,h:70},{x:140,y:51,a:-3,h:70},{x:180,y:47,a:3,h:65}];
  for(const {x,y,a,h}of bones){b+=`<g transform="translate(${x} ${y}) rotate(${a})">`+p(`M-8 ${h}L-9 19C-15 16-14 7-9 5C-4 1 6 1 11 6C16 11 13 17 8 19L9 ${h}Z`,'url(#bone)','stroke-width="2.6"')+s(`M-2 21L-1 ${h-7}`,'#fffaf0',2.8,'opacity=".82"')+'</g>';}
  b+=p('M42 129C77 135 98 120 127 118C153 117 176 103 199 105L215 139L215 176C177 177 151 197 122 197C95 199 73 208 51 197L40 162Z','url(#depth)');
  b+=p('M42 129C77 135 98 120 127 118C153 117 176 103 199 105L215 139C182 141 162 160 132 162C101 164 77 177 52 167L40 153Z','url(#meat)');
  b+=p('M53 119C56 108 70 105 77 113C84 122 84 142 87 154L61 164C53 151 48 133 53 119Z','url(#meat)','stroke-width="2.2"');
  b+=p('M93 109C97 98 111 94 118 103C126 113 126 133 130 145L104 156C96 143 90 122 93 109Z','url(#meat)','stroke-width="2.2"');
  b+=p('M136 101C140 90 154 87 161 96C168 106 171 125 174 137L147 146C140 134 132 114 136 101Z','url(#meat)','stroke-width="2.2"');
  b+=p('M176 91C180 81 193 82 201 90C207 100 211 119 214 131L188 140C180 126 171 104 176 91Z','url(#meat)','stroke-width="2.2"');
  b+=s('M62 120Q62 135 68 144M103 109Q103 125 110 137M145 100Q145 116 152 129M185 92Q187 109 194 120','#ffe3ca',3,'opacity=".82"');
  b+=p('M44 156C67 169 91 159 119 155C153 153 176 137 214 134L215 146C181 148 155 168 124 170C96 172 72 182 49 171Z','url(#fat)','stroke-width="1.5"');
  b+=s('M58 187C76 193 96 182 117 183M143 177Q175 164 204 160','#e49d8a',1.5,'opacity=".75"');
  return doc('排骨','b05',defs,b);
}

export const beastACandidates=[
  {id:'fresh-beast-1',name:'香肠',svg:sausage(),design:{silhouette:'完整饱满弯香肠，两端自然收口与柔软肠衣小结',angle:'三分之四近正面，弯曲内缘形成清楚负形',material:'暖红褐肠衣、柔和紧绷光泽与少量细褶',identity:'去掉原版方块状端帽，轮廓全部属于香肠和自然肠衣',container:'无盛器、无外部装饰'},reason:'按要求去掉前端方块状，重做完整弯肠与自然扎口；以饱满轮廓和红褐肠衣体现香肠。'},
  {id:'fresh-beast-2',name:'培根',svg:bacon(),design:{silhouette:'三条短厚培根紧密错层，形成一小叠紧凑肉片',angle:'略俯视可见每片厚度和前后遮挡',material:'粉红瘦肉与乳白脂肪成带状相间，边缘有柔软波浪',identity:'收紧横向跨度与条间空隙，三片层叠而不散开',container:'无盘子、无配料'},reason:'按要求变得更紧凑；短厚肉片紧密层叠，脂肪与瘦肉带仍清楚可读。'},
  {id:'fresh-beast-3',name:'肉丸',svg:meatballs(),design:{silhouette:'三颗大小相近的圆润肉丸聚拢成稳定三角构图',angle:'略俯视，前丸遮住后方两丸的一小部分',material:'深红棕与酱褐肉色，圆润曲面配少量细小肉质凹点',identity:'按要求更换原土豆橙黄调，使用深棕红肉色，三丸边缘分别清楚',container:'无盛器和配菜'},reason:'按要求更换肉丸颜色，采用深红棕／酱褐色；聚拢的三颗肉丸具有清楚体积与肉质。'},
  {id:'fresh-beast-4',name:'五花肉',svg:porkBelly(),design:{silhouette:'独立重绘的厚切五花肉块，完整皮面与前侧切面形成稳固三维块体',angle:'偏俯视三分之四，皮面及两个切面均可见',material:'柔软乳白脂肪与粉红瘦肉分层，顶端薄皮略有细孔',identity:'大块肥瘦相间与皮层厚度可一眼辨认，不能只以换色代替新画',container:'裸食材，无盛器'},reason:'按全项提供新版的要求独立重绘皮面、厚度与肥瘦层；保留五花肉身份，是否采用由用户决定。'},
  {id:'fresh-beast-5',name:'排骨',svg:ribs(),design:{silhouette:'四根骨端和紧密连在一起的肉排，形成斜向起伏的完整肋排',angle:'偏俯视三分之四，后方骨端伸出、前方可见肉层厚度',material:'奶白骨质、粉红肋肉与薄脂边分开处理，骨肉交界有清楚遮挡',identity:'保留肋排成组结构，骨头不过分膨大，主角是连在一起的肉排',container:'无盘子、无配菜'},reason:'全新设计排骨的骨肉比例与连接结构，肉层更饱满，骨端仍在小图下易于识别。'},
];

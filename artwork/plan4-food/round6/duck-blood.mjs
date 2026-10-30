// P03 is the newly ordered duck-blood slot. This artwork is the only fresh candidate in round 6.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.45,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colors,coords='x1=".1" y1="0" x2=".82" y2="1"')=>`<linearGradient id="${id}" ${coords}>${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

const main='M68 65L162 48Q174 46 182 53L205 73Q212 80 210 92L204 138Q203 151 192 155L112 175Q101 178 92 171L58 145Q51 140 53 130L59 80Q60 69 68 65Z';
const top='M68 65L162 48Q174 46 182 53L205 73Q211 80 202 84L124 108Q112 112 102 105L64 82Q55 75 68 65Z';
const defs=grad('r6db-top',['#b47173','#995660','#7e3f4c'])
  +grad('r6db-front',['#8d4957','#723544','#552c39'])
  +grad('r6db-side',['#733d4b','#572c3b','#472531'])
  +grad('r6db-slice',['#a05e68','#894653','#6f3545'])
  +`<clipPath id="r6db-main">${p(main,'#fff')}</clipPath>`;

let art=p(main,'url(#r6db-side)');
art+=p('M62 82L102 106Q112 113 125 108L207 83L204 137Q202 149 192 153L113 173Q102 176 94 169L58 143Q52 139 55 129Z','url(#r6db-front)','stroke-width="2.85"');
art+=p(top,'url(#r6db-top)','stroke-width="3.1"');
art+=`<g clip-path="url(#r6db-main)" stroke="none">`;
art+=p('M71 68L155 53Q170 51 178 58L184 64C158 59 121 68 89 77Q76 81 68 78Z','#e8a6a2','opacity=".14"');
art+=p('M168 99L208 87L203 140Q198 153 183 155L153 162C170 145 174 121 168 99Z','#4e2937','opacity=".15"');
art+='</g>';
art+=line('M73 69L149 55Q165 52 173 57','#e8aaa4',2.5,.7);
art+=line('M112 117Q113 136 108 152','#b8737d',1.35,.42);
art+=e(86,78,10,2.2,'#efb7af','stroke="none" opacity=".21" transform="rotate(-10 86 78)"');

// The two front cuts are low, soft slabs rather than another pair of box-shaped cubes.
const slice='M-49-16Q-42-22-31-22L39-19Q52-17 54-7L51 10Q48 20 37 20L-38 16Q-50 15-53 6L-55-7Q-56-13-49-16Z';
const face='M-49-16Q-42-22-31-22L39-19Q52-17 54-7Q53-1 43 1L-38-1Q-53-2-55-7Q-56-13-49-16Z';
for(const [i,s]of [{x:157,y:171,a:-16,scale:1},{x:99,y:203,a:10,scale:.98}].entries()) {
  art+=`<g transform="translate(${s.x} ${s.y}) rotate(${s.a}) scale(${s.scale})">`;
  art+=p(slice,'url(#r6db-front)','stroke-width="3.1"');
  art+=p(face,'url(#r6db-slice)','stroke-width="1.55"');
  art+=line('M-40-14Q-31-18-18-17L26-15','#d58c91',2.0,.56);
  art+=line('M-37 7Q-13 11 13 10','#a96273',1.25,.4);
  if(i===0)art+=e(32,-9,5.5,1.2,'#e4a2a4','stroke="none" opacity=".18"');
  art+='</g>';
}

const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>鸭血 · 圆角厚块与嫩切片</title><defs>${defs}</defs><g stroke="#34232b" stroke-width="3.15" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

export const duckBloodCandidates=[{
  id:'fresh-poultry-3',
  name:'鸭血',
  svg,
  design:{
    silhouette:'后方饱满圆角厚块与前方两片错角嫩切片，构图紧凑，边角自然圆润',
    angle:'三分之四略俯视，顶切面完整，厚块与薄片显示不同切法',
    material:'温暖深酒红凝块、光滑切面与克制湿润反光，侧面柔和压暗而不死黑',
    identity:'无纤维的嫩凝块与完整平滑切口，不用尖角箱体、内框线或多层夹心表现',
    container:'无盛器、无血水、无配菜，裸食材透明背景',
  },
  reason:'按新顺序重画P03鸭血：将上一版尖角立方体改为圆角厚块和两片嫩切片，用深酒红、柔和切面与微湿光泽表现鸭血质感。',
}];

// Round 52: warm bamboo steamers and deep blue-black woks with practical upgrades.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,c,w=1.5,o=1)=>p(d,'none',`stroke="${c}" stroke-width="${w}" opacity="${o}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".85" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art,dy=0,dx=0)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 料理器具新版候选</title><defs>${defs}</defs><g stroke="#49372d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(${dx} ${dy})">${art}</g></svg>`;

function bambooTier(k,y,grips=false,offset=0){
  let a=p(`M55 ${y}L201 ${y}L199 ${y+30}Q128 ${y+59} 57 ${y+31}Z`,`url(#${k}-bamboo)`);
  a+=e(128,y,73,19,`url(#${k}-bamboo)`,'stroke-width="2"');
  a+=p(`M56 ${y+3}Q128 ${y+29} 200 ${y+3}L200 ${y+10}Q127 ${y+37} 56 ${y+10}Z`,`url(#${k}-binding)`,'stroke-width="1.8"');
  a+=p(`M57 ${y+27}Q128 ${y+52} 199 ${y+27}L198 ${y+34}Q128 ${y+61} 58 ${y+34}Z`,`url(#${k}-binding)`,'stroke-width="1.8"');
  a+=line(`M63 ${y+16}Q127 ${y+39} 192 ${y+17}`,'#b48b50',1.3,.84);
  for(const x of[78+offset,111+offset,151+offset,181+offset])a+=line(`M${x} ${y+14+(x<95||x>175?0:5)}L${x+1} ${y+31+(x<95||x>175?0:7)}`,'#b38b52',1.3,.77);
  a+=line(`M65 ${y+11}Q82 ${y+18} 101 ${y+19}`,'#fff2c9',1.6,.94);
  if(grips){
    a+=e(78,y+24,13,6,`url(#${k}-binding)`,'stroke="#a38653" stroke-width="1.4"');
    a+=e(78,y+25,8,2.8,'#896841','stroke-width="1.1"');
    a+=e(178,y+25,12,5.5,`url(#${k}-binding)`,'stroke="#a38653" stroke-width="1.4"');
    a+=e(178,y+26,7.5,2.6,'#896841','stroke-width="1.1"');
  }
  return a;
}
function bambooLid(k,y){
  let a=p(`M51 ${y-4}Q69 ${y-35} 128 ${y-33}Q187 ${y-35} 205 ${y-2}Q128 ${y+27} 51 ${y-4}Z`,`url(#${k}-bamboo)`);
  // A few bent strips imply woven bamboo, without a dense grid at board size.
  a+=line(`M70 ${y-12}Q92 ${y-27} 117 ${y-25}M91 ${y-4}Q119 ${y-21} 150 ${y-21}M127 ${y+3}Q152 ${y-10} 177 ${y-8}`,'#b48a4b',1.45,.83);
  a+=line(`M87 ${y-24}Q113 ${y-13} 139 ${y+6}M127 ${y-29}Q151 ${y-18} 173 ${y+1}`,'#f9e7b5',1.6,.94);
  a+=p(`M51 ${y-3}Q128 ${y+20} 205 ${y-2}L206 ${y+6}Q128 ${y+30} 50 ${y+5}Z`,`url(#${k}-binding)`,'stroke-width="2.1"');
  a+=p(`M115 ${y-32}L117 ${y-42}Q128 ${y-50} 140 ${y-42}L142 ${y-31}Z`,`url(#${k}-bamboo)`,'stroke-width="2.1"');
  a+=line(`M121 ${y-40}Q128 ${y-44} 135 ${y-40}M65 ${y+6}Q84 ${y+13} 105 ${y+14}`,'#fff1c5',1.55,.96);
  return a;
}
function steamer(level){
  const k='eq52-steam-'+level,defs=grad(k+'-bamboo',['#f6dda5','#dcb777','#b98f50'])+grad(k+'-binding',['#fff4d6','#efdfb9','#d4bd90'])+grad(k+'-metal',['#f2f1d7','#d1ddc8','#9cb5a4'])+grad(k+'-shade',['#d5d8b9','#b4c6ac','#839c89']);
  let a='';
  if(level===1){
    a+=bambooTier(k,112);
    a+=bambooLid(k,109);
  }else{
    if(level===3){
      // The lowest vessel is metal water/steam storage, not a third bamboo tier.
      a+=p('M51 181Q47 175 39 179Q32 185 39 192L54 193L57 185Z',`url(#${k}-metal)`,'stroke-width="2.1"');
      a+=p('M200 183Q210 175 219 181Q226 189 217 195L200 194Z',`url(#${k}-metal)`,'stroke-width="2.1"');
      a+=p('M50 181L206 181L203 205Q194 224 128 225Q64 222 53 205Z',`url(#${k}-metal)`);
      a+=e(128,181,78,20,`url(#${k}-shade)`,'stroke-width="2"');
      a+=p('M55 202Q127 227 202 202L200 212Q128 237 58 213Z',`url(#${k}-shade)`,'stroke-width="1.8"');
      a+=line('M65 211Q127 230 190 213M61 188L64 199','#fff7d8',1.65,.95);
    }
    const lower=level===2?135:132,upper=level===2?96:93;
    a+=bambooTier(k,lower,true,-2);
    a+=bambooTier(k,upper,true,2);
    // The raised joining lip visibly locates one basket in the next.
    a+=line(`M60 ${lower+1}Q128 ${lower+26} 196 ${lower+1}`,'#a47b42',1.6,.91);
    a+=bambooLid(k,upper-3);
  }
  return doc('蒸笼',defs,a,[16,13,-4][level-1]);
}

function parkedSpatula(k){
  let a=p('M38 150L31 112L37 110L45 148Z',`url(#${k}-wood)`,'stroke-width="1.9"');
  a+=p('M32 151L49 147L56 167L37 172Z',`url(#${k}-metal)`,'stroke-width="2"');
  a+=line('M37 154L47 153M39 160L49 159','#eff5dd',1.35,.94);
  return a;
}
function wok(level){
  const k='eq52-wok-'+level,defs=grad(k+'-iron',['#81a0a4','#4a7382','#2d5266'])+grad(k+'-inside',['#79999d','#4e7583','#315361'])+grad(k+'-wood',['#f0cf99','#d6a66c','#ad7b45'])+grad(k+'-metal',['#eff0d8','#c7d6c2','#94ac9d'])+grad(k+'-shade',['#b6c6b0','#889f8b','#607b70']);
  let a='';
  if(level===1){
    a+=line('M89 180L83 199M128 185L128 207M168 181L175 198','#627a70',6,.98);
    a+=e(128,181,47,11,`url(#${k}-metal)`,'stroke-width="2.1"');
    a+=e(128,181,38,6.5,'#647a70','stroke-width="1.35"');
  }else if(level===2){
    a+=line('M79 185L73 204M128 189L128 213M176 185L182 203','#627b6f',7,.98);
    a+=e(128,184,57,15,`url(#${k}-metal)`,'stroke-width="2.3"');
    a+=e(128,183,47,9,'#5d7770','stroke-width="1.55"');
    a+=p('M45 163L62 166L65 177L47 175Z',`url(#${k}-metal)`,'stroke-width="2"');
    a+=parkedSpatula(k);
  }else{
    // Low annular burner, insulated supports and one side utensil sleeve.
    a+=p('M59 193L198 193L198 214Q191 230 130 232Q69 229 59 215Z',`url(#${k}-metal)`);
    a+=e(128,193,70,20,'#d6dec2','stroke-width="2.2"');
    a+=e(128,190,59,15,'#637c71','stroke-width="1.6"');
    a+=e(128,190,47,9,'#3c5a54','stroke-width="1.4"');
    a+=p('M77 183L90 177L101 184L97 192L82 191Z',`url(#${k}-wood)`,'stroke-width="1.65"');
    a+=p('M156 184L169 179L181 186L176 195L162 193Z',`url(#${k}-wood)`,'stroke-width="1.65"');
    a+=e(127,217,7,6,`url(#${k}-wood)`,'stroke-width="1.8"');
    a+=line('M126 213L127 217M72 216Q97 227 114 226','#fff1c5',1.5,.95);
    a+=p('M29 166L58 170L63 202L33 198Z',`url(#${k}-metal)`,'stroke-width="2.1"');
    a+=p('M34 169L54 172L56 181L36 178Z','#586f63','stroke-width="1.35"');
    a+=parkedSpatula(k);
    a+=p('M35 178L57 181L60 195L37 192Z',`url(#${k}-shade)`,'stroke-width="1.8"');
  }
  if(level>=2){
    // The helper grip stays short; the warm long wooden handle is the dominant one.
    a+=p('M65 126Q48 116 41 125Q34 138 46 145L65 144L67 136L52 137Q45 135 49 130L64 134Z',`url(#${k}-iron)`,'stroke-width="2.25"');
    a+=line('M44 126Q40 134 47 139','#9bb7ae',1.45,.95);
  }
  // A genuinely deep curved cast-iron bowl, with a bright rim and dark blue concavity.
  a+=p('M62 123L187 124Q184 164 161 180Q145 191 123 189Q79 184 66 153Z',`url(#${k}-iron)`);
  a+=p('M69 137Q76 164 98 174Q106 180 117 181Q88 179 76 161Q68 149 69 137Z','#aac1b3','stroke="none" opacity=".47"');
  a+=line('M90 175Q110 187 130 185M169 145L166 156','#6a93a0',1.6,.92);
  a+=e(125,123,64,23,'#99b2a7','stroke-width="2.1"');
  a+=e(125,121,56,17,`url(#${k}-inside)`,'stroke="#476878" stroke-width="1.5"');
  a+=p('M72 123Q123 145 179 124Q163 143 124 143Q88 142 72 123Z','#305263','stroke="none" opacity=".68"');
  a+=line('M78 117Q105 104 129 108M153 110L165 114','#bed2c0',1.55,.88);
  // Long handle has a distinct metal socket and a rounded warm-wood grip.
  a+=p('M178 113L191 91L205 99L190 129Z',`url(#${k}-iron)`,'stroke-width="2.2"');
  a+=p('M187 94L220 49Q224 43 229 46L236 53Q240 57 235 63L204 106Z',`url(#${k}-wood)`);
  a+=line('M195 93L226 53M227 62L232 58','#ffe2ac',1.6,.95);
  a+=line('M188 110L196 100','#a6bbb0',1.45,.9);
  return doc('炒锅',defs,a,[-1,-3,-12][level-1],[-1,-5,-5][level-1]);
}

const occupancy=[.78,.82,.84];
export const applianceSteamerWokCandidates=[
  ...[1,2,3].map(level=>({id:`steamer-l${level}`,code:`EQ21-L${level}`,name:'蒸笼',familyId:'steamer',deviceKind:'appliance',outputChains:[],level,expectedOccupancy:occupancy[level-1],svg:steamer(level),reason:['单层低竹笼以暖竹编盖、清楚盖钮和米白绑边保持传统蒸笼身份。','两层竹笼有真实叠接环与清楚防烫握口，层次自然，不靠加大蒸汽表现升级。','分层竹笼稳坐低金属蒸汽底锅，竹与金属功能分工清楚，轮廓完整。'][level-1],design:{silhouette:['单层低圆竹笼、编织盖与小盖钮','双层真实叠接竹笼、米白绑边与防烫侧握口','双层竹蒸笼、稳固低金属蒸汽底锅及小底锅握耳'][level-1],angle:'三分之四轻俯视，盖面编织、圆形笼口和层间叠接清楚，统一左上光',material:'温暖竹片、米白绑边与克制编织纹理，三级底锅为淡冷金属，竹与金属层次分明',identity:'用于蒸虾饺、肠粉、糯米饭等料理，笼体、盖和底锅承担明确用途，不堆点心或大量蒸汽',progression:'一级单层低笼，二级双层叠接及防烫握口，三级增加低金属蒸汽底锅；结构升级而非单纯放大',palette:'暖竹金、米白与淡金属绿，清楚近黑轮廓和左上柔光',size:`含笼体约占画布${Math.round(occupancy[level-1]*100)}%，透明留白，无图内文字、数字、刻度或等级角标`}})),
  ...[1,2,3].map(level=>({id:`wok-l${level}`,code:`EQ22-L${level}`,name:'炒锅',familyId:'wok',deviceKind:'appliance',outputChains:[],level,expectedOccupancy:occupancy[level-1],svg:wok(level),reason:['深弧蓝黑铸铁圆锅、暖木长柄与低支撑形成清楚炒锅轮廓。','辅助短握柄、承托锅圈和一把锅铲停放位补足实用操作结构。','稳固环形灶座、隔热承托与侧收纳形成升级，深锅身和长木柄仍是主体。'][level-1],design:{silhouette:['深弧圆锅、明显暖木长柄与低支撑','深锅与长柄、辅助短握柄、承托圈及单锅铲停放','深锅与长柄、稳固低环形灶座、隔热支撑及侧收纳'][level-1],angle:'三分之四俯视，深弧锅腹、内壁凹面和木柄金属接头可辨，左上光',material:'深蓝黑铸铁、淡金属承托与温暖木柄；内壁深浅有层次，不用满黑平面',identity:'用于翻炒蔬菜、肉类与小食，保持深圆锅和单长柄，不改成平煎台或双耳汤锅，不堆火舌与食材',progression:'一级深锅长柄和低支撑，二级辅助握柄、锅圈及锅铲停放，三级环形灶座、隔热支撑和侧收纳；最多停放一把锅铲',palette:'深铸铁蓝、暖木金与淡金属绿，冷暖相衬，轮廓清楚',size:`含锅具约占画布${Math.round(occupancy[level-1]*100)}%，透明留白，无文字、数字、刻度或等级角标`}})),
];

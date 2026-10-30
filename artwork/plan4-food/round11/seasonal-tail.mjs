// Review alternatives only. Existing selected and runtime artwork stays untouched.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const l=(d,color,width=1.45,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const g=(id,colors,coords='x1=".12" y1="0" x2=".86" y2="1"')=>`<linearGradient id="${id}" ${coords}>${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 时蔬新稿</title><defs>${defs}</defs><g stroke="#3e3227" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function lettuce(){
  const defs=g('lt11-back',['#bfda80','#8fbb5c','#608c45'])+g('lt11-leaf',['#e0e9a1','#b5d174','#86ae51'])+g('lt11-fold',['#c5d98b','#97bb63','#6e9949'])+g('lt11-heart',['#f0efbc','#cfdf92','#a3c46c']);
  let a=p('M110 186C82 190 65 170 65 149C50 137 51 117 63 108C55 91 68 76 84 78C87 58 109 53 123 63C137 49 156 56 161 73C181 66 198 82 193 100C209 107 212 128 198 141C206 159 192 180 173 179C157 196 133 199 110 186Z','url(#lt11-back)');
  a+=p('M111 184C91 182 74 167 70 148C62 140 65 127 76 123C67 112 71 99 81 97C86 85 97 84 105 92C119 111 126 142 124 164Z','url(#lt11-fold)');
  a+=p('M131 184C152 177 171 161 178 143C191 138 197 122 186 114C190 99 176 88 164 95C154 80 140 87 135 99C128 118 127 151 131 184Z','url(#lt11-leaf)');
  a+=l('M133 175C148 150 163 126 177 104','#91af5c',1.65,.77);
  a+=l('M153 142 169 138M163 124 162 112','#edf1be',1.45,.82);
  a+=p('M129 193C104 192 81 183 76 164C66 159 65 147 74 140C77 130 89 127 99 133C111 130 120 139 124 151C129 165 134 183 129 193Z','url(#lt11-leaf)');
  a+=l('M121 185C110 166 96 150 83 144','#89a758',1.5,.65);
  a+=p('M127 194C144 197 168 187 177 172C190 167 190 153 181 149C177 136 162 135 151 141C134 145 125 165 127 194Z','url(#lt11-fold)');
  a+=l('M134 186C147 169 161 158 176 153','#dce8aa',1.6,.82);
  a+=p('M119 193C104 176 103 155 111 137C105 126 111 113 123 113C129 102 145 106 149 118C160 124 158 139 150 147C147 168 137 185 126 194Z','url(#lt11-heart)');
  a+=l('M125 185C127 164 131 143 138 122','#8ea955',1.7,.72);
  a+=l('M128 162 116 148M132 143 144 139','#f2f2c7',1.45,.9);
  a+=l('M88 88Q96 85 103 94M69 114Q70 105 78 103M158 84Q164 78 173 83','#edf0b9',2.2,.74);
  return doc('生菜',defs,a);
}

function beans(){
  const defs=g('bn11-back',['#abd171','#79ad51','#4c8141'])+g('bn11-front',['#c6dc87','#91bd5c','#5a9147'])+g('bn11-inner',['#e1e7a4','#b7cf77','#88ad56'])+g('bn11-seed',['#f3edbd','#d5d89b','#b2bd7a']);
  const closed='M40 157C72 149 100 131 123 106C145 82 162 57 185 40C177 72 157 104 133 128C107 154 78 171 48 175L31 183L36 171C33 167 35 161 40 157Z';
  function pod(back=false){
    let a=p(closed,`url(#${back?'bn11-back':'bn11-front'})`);
    a+=l('M43 166C77 158 107 138 132 113C155 90 170 66 179 50','#e5eaba',1.6,.8);
    a+=l('M46 174C80 170 115 146 139 121','#4e8040',1.45,.56);
    a+=l('M91 152Q93 145 100 143M116 133Q117 126 124 124M138 111Q141 103 147 100','#7a9c4d',1.2,.6);
    return a;
  }
  let a='<g transform="translate(23 -10) rotate(10 128 128) scale(.92)">'+pod(true)+'</g>';
  a+='<g transform="translate(-13 10) rotate(-7 128 128)">'+pod()+'</g>';
  const open='M69 191C100 175 124 154 141 133C158 113 172 93 186 80C187 105 172 135 155 155C134 179 106 199 81 205L59 214L66 202C62 197 64 193 69 191Z';
  a+=p(open,'url(#bn11-front)');
  a+=p('M78 194C108 178 132 156 150 133C164 116 174 100 181 91C178 113 167 133 152 151C130 175 106 192 80 201Z','url(#bn11-inner)','stroke="#75944c" stroke-width="1.35"');
  for(const [x,y,rx,ry,angle]of [[91,188,8,5.1,-30],[113,174,8.1,5.2,-39],[135,153,7.8,5,-46],[155,130,7.3,4.8,-55]])a+=e(x,y,rx,ry,'url(#bn11-seed)',`transform="rotate(${angle} ${x} ${y})" stroke="#8b9e59" stroke-width="1.2"`);
  a+=l('M75 204C110 196 144 166 166 133','#3e743b',1.5,.7);
  a+=l('M66 204 59 214M37 179 31 183','#678944',1.3,.72);
  return doc('四季豆',defs,a);
}

function eggplant(){
  const body='M149 67C173 68 189 94 184 120C178 156 151 190 121 205C94 219 68 214 57 196C44 175 57 152 77 140C100 126 111 112 115 93C119 76 132 65 149 67Z';
  const defs=g('eg11-skin',['#c1a0c9','#9874ac','#714d87','#573b6d'])+g('eg11-leaf',['#bbcd7b','#80a45d','#547e48'])+`<clipPath id="eg11-body">${p(body,'#fff')}</clipPath>`;
  let a=p(body,'url(#eg11-skin)');
  a+='<g clip-path="url(#eg11-body)" stroke="none">';
  a+=p('M164 82C171 115 156 153 129 178C106 201 81 205 59 192C70 220 107 228 139 210C173 191 201 143 188 104Z','#4e365f','opacity=".17"');
  a+=p('M103 125C90 140 72 145 67 160C63 171 72 178 78 170C87 155 104 148 114 132C120 122 112 116 103 125Z','#f0dcef','opacity=".46"');
  a+=p('M92 184C100 182 110 176 117 170C125 163 128 168 122 176C115 186 104 191 97 191C89 192 86 188 92 184Z','#d9b9dc','opacity=".19"');
  a+='</g>';
  a+=p('M145 74C134 71 122 79 115 91C123 90 131 91 136 96C139 88 146 85 152 88C160 96 173 96 181 93C170 84 166 77 165 69C159 74 153 76 145 74Z','url(#eg11-leaf)');
  a+=p('M144 76C144 62 150 48 160 41C165 39 170 43 166 47C158 55 155 65 155 75Z','url(#eg11-leaf)');
  a+=l('M148 68Q152 51 162 45','#d2dda0',1.65,.8);
  a+=l('M138 83Q148 80 160 85','#6c8e4d',1.4,.72);
  a+=l('M66 183Q69 190 76 193','#ecdae9',2.2,.7);
  return doc('茄子',defs,a);
}

function radish(){
  const body='M101 88C83 101 83 123 88 147C94 173 108 195 121 208C128 215 132 223 133 230C139 219 137 212 142 204C161 175 176 146 174 122C173 99 158 86 139 84C124 81 112 82 101 88Z';
  const defs=g('rd11-root',['#fffdf0','#f6edcf','#dfd0a8'])+g('rd11-shoulder',['#dce2b7','#f2edcf','#fff7df'])+g('rd11-leaf',['#b9d37b','#8bb35b','#5a8a48'])+g('rd11-fold',['#a8c975','#77a650','#47773f'])+`<clipPath id="rd11-root-clip">${p(body,'#fff')}</clipPath>`;
  let a=p(body,'url(#rd11-root)');
  a+='<g clip-path="url(#rd11-root-clip)" stroke="none">';
  a+=p('M84 106C108 95 143 98 176 109L179 78L83 69Z','url(#rd11-shoulder)','opacity=".75"');
  a+=p('M154 91C164 123 154 158 135 187C127 199 128 215 134 229L169 205L192 114Z','#d6c99d','opacity=".18"');
  a+=p('M100 109C93 130 101 153 109 166C115 172 116 165 112 156C107 142 106 122 110 112C112 105 104 102 100 109Z','#fffef3','opacity=".63"');
  a+='</g>';
  a+=l('M96 119 108 122M143 135 157 132M111 151 122 153M130 177 140 173','#bdaf83',1.55,.65);
  a+=l('M122 206Q127 211 128 215','#c3b48a',1.3,.65);
  a+=p('M115 91C103 88 92 76 93 63C83 56 87 44 98 44C98 31 111 28 119 37C130 39 132 52 124 59C132 73 128 86 123 94Z','url(#rd11-fold)');
  a+=l('M119 87C114 71 108 54 104 41','#d0df9b',1.65,.82);
  a+=p('M130 91C133 72 141 58 158 51C159 40 172 37 178 46C192 45 200 57 191 66C197 76 188 86 179 85C170 99 151 104 136 98Z','url(#rd11-leaf)');
  a+=l('M138 91C151 80 166 66 182 55','#537f42',1.55,.75);
  a+=l('M157 76 155 65M169 66 184 69','#dce8ad',1.3,.78);
  a+=p('M124 93C114 75 118 58 131 46C127 36 134 27 144 31C149 20 162 24 162 36C174 42 173 53 163 59C164 73 151 91 136 98Z','url(#rd11-leaf)');
  a+=l('M132 90C137 71 143 51 150 34','#557c41',1.7,.8);
  a+=l('M139 67 130 56M146 47 158 45','#d4e2a5',1.35,.8);
  return doc('白萝卜',defs,a);
}

export const seasonalTailCandidates=[
  {id:'fresh-seasonal-5',name:'生菜',svg:lettuce(),expectedOccupancy:.72,design:{silhouette:'一小簇宽叶前后交叠，中心一片直立卷心，外围叶缘自然错落而非规则花瓣',angle:'略俯视，左后叶较深、前方嫩心明亮，短菜根藏于叶片底部',material:'黄绿嫩叶、浅色肉质叶脊与少量柔和折面',identity:'宽而柔软的卷叶和浅色中心，区别罗勒叶束、西兰花和圆球甘蓝',container:'裸菜透明背景，无盘无配件'},reason:'以少量宽叶和浅色卷心重画生菜，保持小图清楚的细深描边；五级体量收敛，不塞满画布。'},
  {id:'fresh-seasonal-6',name:'四季豆',svg:beans(),expectedOccupancy:.78,design:{silhouette:'三根长短错落的自然弯豆荚，前方一根轻开窄缝，整体形成修长斜束',angle:'从左下向右上伸展，闭荚在后、窄开荚在前，不平行机械排列',material:'嫩绿荚皮、浅黄绿内壁与少量奶绿长圆豆粒',identity:'细长豆荚的尖端、弯曲中线和长圆豆粒，避免旧版半圆豌豆片造型',container:'无盘无扎绳，透明底裸食材'},reason:'用修长整荚和一条克制开荚重设计四季豆，保留鲜绿食材身份，避免看成几片豌豆皮。'},
  {id:'fresh-seasonal-7',name:'茄子',svg:eggplant(),expectedOccupancy:.80,design:{silhouette:'一根短胖弯茄子，紫色主体向左下圆润展开，右上保留短颈与星状绿萼',angle:'斜置三分之四视角，弯曲主体形成清楚的单根大形',material:'柔亮深紫茄皮、一处宽软反光与嫩绿萼片',identity:'紫色弯果、绿色星状萼和短弯柄共同辨识，不加第二根或切片',container:'单根裸茄透明背景，无盛器'},reason:'以自然短胖弯形重画茄子，强化星状绿萼和紫皮体积，保持一眼能认的简洁轮廓。'},
  {id:'fresh-seasonal-8',name:'白萝卜',svg:radish(),expectedOccupancy:.80,design:{silhouette:'一根上宽下收的丰润白根，根尖自然弯细，顶端三片长短错落的带缺口叶',angle:'白根略向右下延伸，绿叶集中在上方，保持根叶主次',material:'奶白光洁根皮、浅绿肩部、少量横向根痕与嫩绿叶片',identity:'长白根、细根尖和分裂叶共同识别，区别白梨、蒜和球形菜',container:'完整裸萝卜透明底，无盘无附加食材'},reason:'重画白萝卜的丰润根身、渐细根尖与清楚叶簇，以少量横痕表现根菜，延续原版细深描边与轻巧卡通感。'},
];

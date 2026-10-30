// Round 24: independently drawn mixer ingredients; transparent editable SVG masters.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour='#60766e',width=1.45,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".88" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 特调基底独立候选</title><defs>${defs}</defs><g stroke="#3e4239" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function iceCubes(){
  const defs=gradient('m24-ice-front',['#dff6f3','#b9e0e5','#8bbccf'])
    +gradient('m24-ice-top',['#f7fffa','#deefed','#c6e4e8'])
    +gradient('m24-ice-side',['#b9dde5','#90c1d1','#76a7bd']);
  const cube=(x,y,scale,angle)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">`
    +p('M-33-28L13-38L39-15L35 26L-5 39L-31 16Z','url(#m24-ice-front)','stroke="none"')
    +p('M-33-28L13-38L39-15L-8-4Z','url(#m24-ice-top)','stroke="none"')
    +p('M-8-4L39-15L35 26L-5 39Z','url(#m24-ice-side)','stroke="none"')
    +line('M-33-28L-8-4L39-15M-8-4L-5 39','#5d8f9e',1.65)
    +line('M-24-24L-23 11M-16-25L-6-28','#fbfff9',3,.94)
    +line('M4 2L28-5M4 7L24 0','#d7f3f4',1.8,.86)
    +p('M-33-28L13-38L39-15L35 26L-5 39L-31 16Z','none')
    +'</g>';
  let art=cube(130,95,.90,10);
  art+=cube(92,146,.97,-12);
  art+=cube(152,159,1.02,8);
  return doc('冰块',defs,art);
}

function mineralWater(){
  const defs=gradient('m24-water-glass',['#f3fffa','#d6eef0','#a2c9d5'])
    +gradient('m24-water-liquid',['#cceff4','#9dd4e0','#75b4ca'])
    +gradient('m24-water-cap',['#77b9d6','#4388af','#336887'])
    +gradient('m24-water-label',['#fffdf0','#edf5e8','#d8e9df']);
  let art=p('M107 60L149 60L149 78C149 88 168 92 172 107L175 189C175 207 81 207 81 189L84 107C87 92 107 88 107 78Z','url(#m24-water-glass)');
  art+=p('M89 117C109 122 148 122 168 117L170 187C170 198 87 198 87 187Z','url(#m24-water-liquid)','stroke="none"');
  art+=e(128.5,117,39.5,7,'#d1f1ef','stroke="#7aaebd" stroke-width="1.45"');
  art+=p('M87 135Q128 143 170 135L171 171Q129 181 86 171Z','url(#m24-water-label)','stroke="#6e9697" stroke-width="1.6"');
  art+=p('M127 143C124 150 116 155 116 162C116 176 139 177 140 163C141 156 132 148 127 143Z','#5da9ca','stroke="#467b90" stroke-width="1.6"');
  art+=p('M123 157C120 161 120 166 124 167C126 168 128 166 125 164C123 162 124 159 125 157Z','#deeff0','stroke="none"');
  art+=p('M96 100C92 118 93 129 94 134M94 180L94 189','none','stroke="#f8fff5" stroke-width="5"');
  art+=line('M155 96Q165 105 165 115','#b4dce0',1.6,.9);
  art+=p('M106 45Q128 40 150 45L150 63Q129 70 106 63Z','url(#m24-water-cap)');
  art+=e(128,45,22,5.5,'#91c5d5','stroke-width="2.2"');
  art+=line('M113 50L113 60M121 51L121 62M136 51L136 62M144 50L144 60','#3b7492',1.1,.8);
  art+=line('M109 68Q129 74 147 68','#8db9c1',1.5);
  art+=line('M98 194Q128 199 156 194','#e4f4ec',1.8,.86);
  return doc('矿泉水',defs,art);
}

function sodaWater(){
  const defs=gradient('m24-soda-metal',['#f1f5df','#cadbd2','#91b4b0'])
    +gradient('m24-soda-body',['#83d3c2','#54b6a9','#2b8b86'])
    +gradient('m24-soda-label',['#eaf8d9','#d4edc2','#b7dbaa']);
  let art=p('M87 66C87 57 168 57 168 66L173 185C173 205 82 205 82 185Z','url(#m24-soda-body)');
  art+=p('M87 110C114 99 143 99 169 111L171 160C147 153 108 164 83 159Z','url(#m24-soda-label)','stroke="none"');
  art+=p('M153 76L167 71L171 184C171 193 160 198 145 198C157 184 156 136 153 76Z','#277b78','stroke="none" opacity=".48"');
  art+=p('M95 83C92 103 93 125 96 135C97 139 102 139 102 133L103 85C103 78 96 77 95 83Z','#d4f5da','stroke="none" opacity=".75"');
  art+=e(127.5,66,40.5,11.5,'url(#m24-soda-metal)');
  art+=e(127.5,65,32.5,6.5,'#c2d7cb','stroke="#688e8a" stroke-width="1.4"');
  art+=p('M115 62Q125 57 138 61L139 66Q128 72 117 68Z','#eaf1d8','stroke="#607f78" stroke-width="1.5"');
  art+=e(126,64,5,2,'#72978b','stroke="none"');
  art+=e(127,133,14.5,14.5,'#f6ffe8','stroke="#5f9d89" stroke-width="1.65"');
  art+=e(151,120,6.5,6.5,'#eefadd','stroke="#6ba78c" stroke-width="1.4"');
  art+=e(108,148,5,5,'#f1fcdf','stroke="#6ba78c" stroke-width="1.35"');
  art+=line('M120 127Q123 122 129 123','#b9dcbc',1.4,.9);
  art+=line('M88 188Q127 201 168 188','#d2e4cc',2.2,.9);
  return doc('苏打水',defs,art);
}

function gingerWater(){
  const defs=gradient('m24-ginger-glass',['#fff9df','#f7e8bf','#d9bd81'])
    +gradient('m24-ginger-liquid',['#f5dc85','#e7b94e','#cf973b'])
    +gradient('m24-ginger-skin',['#f5d69a','#dcae6c','#bb854c'])
    +gradient('m24-ginger-cut',['#fff0b5','#f4d98c','#e3bb61']);
  let art=p('M63 91C62 119 67 164 76 182C84 199 169 199 178 182C187 162 191 119 190 91Z','url(#m24-ginger-glass)');
  art+=p('M70 111C101 119 153 119 183 111C182 140 179 166 173 177C166 190 88 190 81 177C75 162 72 139 70 111Z','url(#m24-ginger-liquid)','stroke="#ab8b45" stroke-width="1.4"');
  art+=e(126.5,111,56.5,17,'#f4d879','stroke="#c49c4d" stroke-width="1.45"');
  art+=p('M159 124C155 143 158 167 167 175C174 169 177 143 178 123Z','#c49234','stroke="none" opacity=".25"');
  art+=e(126.5,91,63.5,22,'#fff5d7','fill-opacity=".64"');
  art+=e(126.5,92,55,15,'#fcebc1','fill-opacity=".38" stroke="#bcaa78" stroke-width="1.4"');
  art+=line('M77 88Q92 80 114 80','#fffdec',3.1,.93);
  art+=p('M78 110C77 131 82 155 87 166C89 171 94 169 93 163L87 116C86 108 79 105 78 110Z','#fffae0','stroke="none" opacity=".82"');
  art+=line('M92 183Q124 191 160 183','#f8e9bb',1.7,.93);
  // A pair of ginger slices sits inside the drink silhouette rather than enlarging the icon.
  art+=p('M129 142C120 137 115 144 111 145C103 144 100 151 103 157C99 164 106 170 113 169C119 176 128 172 130 167C139 165 139 157 134 153C136 147 133 143 129 142Z','url(#m24-ginger-skin)','stroke="#775c37" stroke-width="1.8"');
  art+=p('M124 146C119 143 116 149 112 149C107 148 105 153 108 157C104 161 109 165 114 164C118 169 124 167 126 163C132 162 134 157 129 155C131 150 128 148 124 146Z','url(#m24-ginger-cut)','stroke="#c6a15f" stroke-width="1.2"');
  art+=line('M114 153L119 157L122 163M119 157L126 153','#e0b866',1.1,.9);
  art+=p('M146 155C141 151 136 155 136 161C131 165 135 173 142 172C147 177 154 173 153 167C158 162 153 154 146 155Z','url(#m24-ginger-skin)','stroke="#775c37" stroke-width="1.7"');
  art+=p('M145 159C141 156 139 159 140 163C135 166 139 170 143 168C147 172 151 170 149 166C153 163 150 158 145 159Z','url(#m24-ginger-cut)','stroke="#c6a15f" stroke-width="1.1"');
  return doc('姜汁水',defs,art);
}

export const mixerFrontCandidates=[
  {id:'fresh-mixer-1',name:'冰块',svg:iceCubes(),expectedOccupancy:.66,design:{silhouette:'三枚有切角的冰块紧凑相叠，稳定三角形组合',angle:'轻俯视，每块均能看见完整顶面与两个侧面',material:'冰蓝透明感大色块，三面用浅青白与清蓝分面，少量干净短反光',identity:'立方切面和清楚折线区别矿泉水瓶与苏打罐',container:'裸冰块，透明背景，无地面投影或额外配饰'},reason:'以三枚圆角切面冰块重设计一级，细深描边固定形体，清爽冰蓝分面在40px仍清楚，主体约66%。'},
  {id:'fresh-mixer-2',name:'矿泉水',svg:mineralWater(),expectedOccupancy:.68,design:{silhouette:'矮肩圆润透明水瓶，短蓝瓶盖与清楚收口',angle:'轻俯视正面，可辨瓶盖椭圆与瓶身弧面',material:'淡蓝清水、蓝色瓶盖、奶白小标签和一枚醒目蓝水滴',identity:'纯水瓶轮廓与水滴标记，区别易拉罐及高阶酒瓶',container:'单瓶，无文字商标与瓶外装饰'},reason:'用短肩蓝盖水瓶和单枚水滴建立矿泉水身份，保留清爽透明材质，二级主体约68%，避免标签细字。'},
  {id:'fresh-mixer-3',name:'苏打水',svg:sodaWater(),expectedOccupancy:.70,design:{silhouette:'中矮青绿易拉罐，上下卷边清楚，圆柱形体紧凑',angle:'略俯视，可见金属罐顶与简洁拉环',material:'清爽青绿金属罐和浅薄荷标签，三颗大小分明的气泡',identity:'罐型和大气泡图形区别矿泉水瓶、可乐红罐和能量瘦罐',container:'单罐，不依赖文字或外置吸管'},reason:'将苏打水独立设计成青绿易拉罐，以大气泡和罐顶拉环表达气泡水，三级主体约70%，小图轮廓与矿泉水明显不同。'},
  {id:'fresh-mixer-4',name:'姜汁水',svg:gingerWater(),expectedOccupancy:.68,design:{silhouette:'无把矮圆玻璃杯，圆润宽口与略收小的杯底',angle:'略俯视，完整茶汤椭圆面与杯身均可见',material:'温暖姜黄饮料与柔亮玻璃，杯内两片浅金姜片形成身份',identity:'姜黄液面和可辨姜片，区别冷色罐瓶与深色咖啡',container:'单只小玻璃杯，姜片收在杯身范围内，不扩大低阶轮廓'},reason:'以小巧圆玻璃杯、暖姜黄汁和两片清楚姜片重设计姜汁水，四级主体约68%，保留活泼颜色与克制材质。'},
];

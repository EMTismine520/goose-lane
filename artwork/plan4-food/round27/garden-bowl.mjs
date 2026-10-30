// Round 27: a shallow harvest bowl made from broccoli and mixed bell peppers.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const gradient=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".87" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function harvestBowl(){
  const defs=gradient('g27-porcelain',['#fff9e7','#f4e6c8','#d8c6a6'])
    +gradient('g27-rim',['#fffdf0','#eee8d0','#d9dcc1'])
    +gradient('g27-floret-back',['#9bcd5c','#70ae43','#47843d'])
    +gradient('g27-floret-front',['#8fc752','#60a443','#397940'])
    +gradient('g27-stalk',['#d4e8a1','#a8ce77','#76a95b'])
    +gradient('g27-pepper-red',['#ff9166','#f05c43','#d93e33'])
    +gradient('g27-pepper-gold',['#ffe276','#ffc445','#ef9a2c']);
  let art=p('M103 177H155L155 187C142 195 116 195 103 187Z','url(#g27-porcelain)','stroke-width="2.7"');
  art+=p('M40 125C49 164 77 188 128 188C179 188 207 164 216 125Z','url(#g27-porcelain)');
  art+=p('M195 137L212 129C201 160 178 179 145 184C169 174 184 157 195 137Z','#c9b894','stroke="none" opacity=".38"');
  art+=p('M58 145C63 160 74 172 89 177C94 179 96 175 92 172C81 165 74 157 70 145Z','#fffdf0','stroke="none" opacity=".94"');
  art+=e(128,125,88,32,'url(#g27-rim)');
  art+=e(128,125,77,24,'#ced5a7','stroke="#91a078" stroke-width="1.4"');
  art+=e(127,126,69,18,'#b9cb91','stroke="none"');

  // Broad curved pepper sections sit among the florets rather than outside the bowl.
  art+=p('M60 113C72 96 93 92 112 98L108 109C92 104 77 109 69 121Z','url(#g27-pepper-gold)');
  art+=line('M70 109C81 100 95 99 105 102','#fff1a4',2,.9);
  art+=p('M159 99C175 94 192 99 201 112C207 121 203 133 195 141L186 134C192 128 196 122 192 117C184 108 174 107 162 111Z','url(#g27-pepper-red)');
  art+=line('M167 102C180 99 192 107 196 115','#ffbd85',2,.9);

  const floret=(x,y,angle,scale,front=false)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale} ${scale*.84})">`
    +p('M-8 3L-13 21Q-3 31 9 23L11 5Z','url(#g27-stalk)')
    +p('M-4 18L-15 6M3 17L16 5','none','stroke="#87ae5e" stroke-width="2.2"')
    +p('M-29 1C-38-6-33-20-22-21C-23-33-8-39 1-31C11-40 27-32 27-21C40-18 40-3 29 4C27 16 14 23 4 16C-6 26-22 20-24 10C-31 10-34 5-29 1Z',`url(#g27-floret-${front?'front':'back'})`)
    +p('M-25 5C-17 12-8 9-2 14C9 7 20 11 30 0C29 11 20 20 8 16C-3 23-18 20-24 10Z','#3c7d3d','stroke="none" opacity=".34"')
    +line('M-22-16Q-16-25-7-23M5-29Q14-33 20-25','#c5e68c',2.2,.92)
    +line('M-18-3Q-12-9-4-6M8-10Q17-15 23-8','#a8d670',1.8,.86)
    +'</g>';
  art+=floret(82,112,-18,.76);
  art+=floret(133,103,8,.79);
  art+=floret(177,125,23,.63);

  // Yellow and red flesh, with pale cut edges, read as pepper strips at board scale.
  art+=p('M113 116C124 108 141 110 152 117C163 125 162 137 152 143C146 147 137 148 130 146L132 136C141 138 150 134 149 129C148 121 130 118 120 125Z','url(#g27-pepper-gold)');
  art+=line('M119 119C129 114 143 118 149 124','#fff0a5',2.1,.95);
  art+=p('M54 130C64 117 83 115 96 123C110 132 104 146 90 151C79 154 68 151 61 147L65 137C74 142 87 143 93 138C99 132 83 123 72 129L62 138Z','url(#g27-pepper-red)');
  art+=line('M61 129C71 120 85 122 91 128','#ffbd86',2,.95);
  art+=line('M68 145Q79 150 88 146','#ca3c2b',1.4,.72);
  art+=floret(111,141,-12,.64,true);
  art+=p('M152 135C165 129 182 132 193 141L188 150C178 141 164 140 156 145Z','url(#g27-pepper-gold)');
  art+=line('M158 137Q174 134 187 143','#ffe99a',2,.94);
  art+=p('M128 144C138 140 149 143 155 149L149 157C144 153 138 151 131 154Z','url(#g27-pepper-red)','stroke-width="2.8"');

  // The front lip follows the food, grounding all pieces inside one shallow serving.
  art+=p('M41 128C58 149 86 157 128 157C170 157 198 149 215 128L212 136C190 156 161 164 128 164C95 164 65 156 44 136Z','url(#g27-rim)','stroke-width="2.4"');
  art+=line('M49 134C70 151 99 157 128 157C159 157 188 150 207 135','#fbfae6',2.6,.95);
  art+=line('M75 167C92 176 110 180 131 180C148 180 167 176 181 169','#a9b59c',1.55,.83);
  art+=line('M103 188Q128 196 153 188','#fdf8e4',1.8,.9);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>田园丰收碗 · 西兰花彩椒新版</title><defs>${defs}</defs><g stroke="#49392e" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const gardenBowlRedesign={
  id:'dish-fresh-garden-bowl',
  name:'田园丰收碗',
  svg:harvestBowl(),
  expectedOccupancy:.82,
  reason:'以西兰花与红金彩椒组成清拌鲜蔬碗，短切花球和粗弧椒条自然交错；温润浅碗承托饱满而低矮的菜品，主料、切法和配方对应。',
  design:{
    silhouette:'低矮温润陶碗，四簇大小有节奏的短切西兰花与红金彩椒弧条贴合碗内自然层叠',
    angle:'更自然的略俯视角，能看清椒条切面、花球形体与浅碗内沿',
    material:'清脆鲜绿花球、润亮红金椒肉和奶油色陶瓷，柔光集中于大形内部',
    identity:'绿色西兰花短切块与红金色粗弧彩椒，直接对应西兰花和彩椒两种实际原料',
    container:'完整浅陶碗带极薄清浅釉线，碗口承托主料，前沿遮挡让整碗食物落稳',
    size:'包含盛器主体最长边约82%，按成品的饱满与视觉平衡控制体量'
  }
};

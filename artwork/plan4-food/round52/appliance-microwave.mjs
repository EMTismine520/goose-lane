// Round 52: low coral microwave capsules, with a turntable and no baking hardware.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const r=(x,y,w,h,rx,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".14" y1="0" x2=".82" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function microwave(level){
  const prefix=`r52-micro-l${level}-`,g=id=>`url(#${prefix+id})`;
  const defs=grad(prefix+'coral',['#f9c8aa','#e6a28f','#cd857b'])
    +grad(prefix+'apricot',['#fff3da','#f2dcc0','#d5b89d'])
    +grad(prefix+'metal',['#f5f5e8','#d3dfd2','#a4bdb4'])
    +grad(prefix+'glass',['#738087','#515f67','#35464f'])
    +grad(prefix+'plate',['#e8f1e4','#c3d5ca','#91aea7']);
  let art=e(136,205,96,10,'#687c6c','stroke="none" opacity=".12"');
  if(level===3){
    // A detachable low support cradle is separate from the double-wall body.
    art+=p('M30 188L215 188L237 177L240 188L222 205L43 207Q28 205 30 188Z',g('metal'));
    art+=line('M40 201L214 201M223 198L233 188','#f5fae9',1.55,.97);
    art+=r(55,204,20,7,3,'#697f72','stroke="#50675b" stroke-width="2"');
    art+=r(188,204,20,7,3,'#697f72','stroke="#50675b" stroke-width="2"');
  }else{
    art+=r(55,188,18,10,3,'#748674','stroke="#526959" stroke-width="2"');
    art+=r(183,188,18,10,3,'#748674','stroke="#526959" stroke-width="2"');
  }
  // A much wider-than-tall capsule and a small side depth distinguish it from the oven.
  art+=p('M213 94L230 107Q235 112 235 120L236 169Q236 181 219 190L210 179Z',g('coral'));
  art+=line('M228 119L230 162M228 173L221 180','#f7d4ba',1.5,.95);
  if(level===3){
    art+=r(28,77,199,119,29,g('apricot'));
    art+=r(36,85,185,104,23,g('coral'),'stroke="#9a7163" stroke-width="2.2"');
    art+=line('M40 101Q43 88 57 87L199 87M39 168Q43 184 61 184','#ffe8cf',1.65,.96);
  }else{
    art+=r(32,85,192,107,25,g('coral'));
    art+=line('M43 111L43 105Q44 94 58 94L196 94M43 119L43 131','#ffe9ce',1.7,.96);
    art+=p('M211 108Q219 123 219 140L219 170Q216 185 199 185L70 185Q62 184 57 180Q136 184 193 178Q210 176 210 159Z','#bc776e','stroke="none" opacity=".22"');
  }

  // The second version gains a clearly separate insulated frame around the wide capsule door.
  if(level>=2)art+=r(42,102,139,73,21,g('apricot'),'stroke="#a68d75" stroke-width="2.2"');
  art+=r(level===1?44:47,level===1?104:107,level===1?133:129,level===1?68:63,19,'#737b73','stroke="#52645a" stroke-width="2.1"');
  art+=r(52,113,117,50,14,g('glass'),'stroke="#3f5055" stroke-width="1.8"');
  // A shallow interior floor and one empty circular turntable; no racks, tubes or food trays.
  art+=p('M59 145L72 136L151 136L163 145L159 158L65 158Z','#566a6a','stroke="none" opacity=".72"');
  art+=e(111,153,8,2.8,'#819e97','stroke="#607f79" stroke-width="1.3"');
  art+=e(111,147,40,8.6,g('plate'),'fill-opacity=".82" stroke="#9fb8ab" stroke-width="1.45"');
  art+=e(111,145.5,32.5,5.8,'#dce9db','fill-opacity=".6" stroke="#abc2b4" stroke-width="1.3"');
  art+=line('M80 146Q91 140 106 141M117 141L130 143','#f8ffed',1.4,.8);
  // Low-contrast perforations are a microwave door screen, not lettering or a control grid.
  for(let y=0;y<3;y++)for(let x=0;x<10;x++)art+=e(64+x*10,121+y*6,.66,.64,'#c7d1c4','stroke="none" opacity=".24"');
  art+=line('M57 125L57 133M61 151L64 155M155 116L161 121','#e3ebd9',1.35,.38);

  // A vertical side-opening pull is deliberately different from the oven's horizontal handle.
  art+=r(171,121,8,34,4,g('metal'),'stroke="#6e8a7c" stroke-width="2.1"');
  art+=line('M174 126L174 148','#ffffee',1.35,.96);
  if(level===1){
    art+=r(191,132,15,7,3.5,g('apricot'),'stroke="#a18d72" stroke-width="1.6"');
  }else{
    art+=r(188,107,25,62,8,g('apricot'),'stroke="#bd9980" stroke-width="1.5"');
    art+=r(193,116,15,6,3,'#e1e8d4','stroke="#96a38b" stroke-width="1.3"');
    art+=e(200.5,143,6.3,6.2,g('metal'),'stroke="#819b87" stroke-width="1.55"');
    art+=p('M197 140Q200 137 203 140Q200 139 198 143Z','#faffeb','stroke="none" opacity=".85"');
  }
  if(level===3){
    // Reinforced hinges and two physical cooling sections upgrade the shell, not the button count.
    art+=r(36,116,11,12,4,g('metal'),'stroke="#6e8877" stroke-width="1.8"');
    art+=r(36,151,11,12,4,g('metal'),'stroke="#6e8877" stroke-width="1.8"');
    art+=line('M40 120L40 124M40 155L40 159','#f8ffed',1.3);
    art+=p('M221 111L235 116L239 123L239 146L222 140Z',g('metal'),'stroke="#769286" stroke-width="2.2"');
    art+=p('M222 147L239 152L239 174L223 181Z',g('apricot'),'stroke="#a48971" stroke-width="2.2"');
    art+=line('M226 122L234 125M226 129L234 132M226 136L234 139','#789a8d',1.4);
    art+=line('M227 155L234 158M227 163L234 166M227 171L234 173','#b49a7f',1.35);
    art+=line('M226 115L232 117M236 124L236 141','#edf7df',1.35,.95);
  }else if(level===2){
    art+=p('M223 117L235 122L236 165L223 171Z',g('metal'),'stroke="#7a978a" stroke-width="2.1"');
    art+=line('M227 128L233 130M227 137L233 139M227 146L233 148M227 155L233 157','#73978a',1.4);
    art+=line('M225 121L232 124','#f2f9e4',1.35,.97);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>微波炉 · 转盘加热器材新版</title><defs>${defs}</defs><g stroke="#49382d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}

export const applianceMicrowaveCandidates=[1,2,3].map(level=>({
  id:`microwave-l${level}`,code:`EQ23-L${level}`,name:'微波炉',familyId:'microwave',level,
  expectedOccupancy:[.78,.82,.84][level-1],svg:microwave(level),
  reason:[
    '小巧珊瑚淡杏色横向扁胶囊机身，长圆深灰微孔门窗和竖向侧开门扣清楚；窗内只留一只空圆转盘，不画任何烤架、烤管或面包盘。',
    '增加独立隔热门框、侧控制区和侧散热壳，长圆横窗仍能看见空圆转盘；通过机壳与门体升级，保持低矮紧凑形态。',
    '双层机壳、加强门铰、可拆承托底座与侧面分区冷却结构共同升级，控制数量保持克制；横扁胶囊轮廓与烤箱显著区分。'
  ][level-1],
  design:{
    silhouette:['小巧横扁圆角胶囊机身、长圆门窗、侧开门扣与圆转盘','横扁机身、隔热门框、侧控制区与独立散热壳','双层横扁机壳、加强门铰、可拆承托底座与侧冷却分区'][level-1],
    angle:'略有俯视的横向正面，空圆转盘、侧开门把手和短侧面结构清楚，左上光与柔和Q版体积',
    material:'珊瑚淡杏搪瓷、浅奶油隔热结构、深灰微孔门窗、浅透玻璃转盘与克制银灰金属，近黑细描边',
    identity:'微波炉属于烹饪器材，没有食材产出链；以深灰微孔门窗、侧开门和圆转盘表达既有微波加热用途，不画烤架、烤管、面包盘或食品堆',
    progression:'基础横机身与转盘；增加隔热门框、侧控制区和散热壳；最后增加双层壳体、加强门铰、可拆底座与冷却分区，不靠单纯加按钮或换色',
    container:'完全不放食物，保留清楚空转盘；无文字数字、刻度、角标或标牌，低级小巧、透明留白与视觉居中'
  }
}));

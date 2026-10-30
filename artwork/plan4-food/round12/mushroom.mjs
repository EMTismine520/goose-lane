// Round 12 alternative only: a short-stemmed brown button mushroom and a cut half.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.4,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const gradient=(id,colors,radial=false)=>radial
  ? `<radialGradient id="${id}" cx=".3" cy=".18" r=".9">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</radialGradient>`
  : `<linearGradient id="${id}" x1=".1" y1=".05" x2=".86" y2="1">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

const cap='M51 122C51 94 68 68 94 60C122 50 151 57 171 76C185 90 192 111 190 129C177 143 151 148 124 147C97 148 68 142 52 132C50 129 50 126 51 122Z';
const cut='M132 174C132 156 143 142 158 139C176 134 193 142 204 156C209 163 212 171 211 179C201 185 191 187 181 185L186 205C182 214 171 216 162 208L160 184C150 185 140 182 132 178Z';
const defs=gradient('mu12-cap',['#f6d39d','#d9a66d','#b27b48'],true)
  +gradient('mu12-stem',['#fff9e6','#f1e4cb','#d4bf9f'])
  +gradient('mu12-under',['#e5ceb0','#c6a889','#a98765'])
  +gradient('mu12-flesh',['#fffbed','#f5ead4','#dec9aa'])
  +gradient('mu12-rind',['#dfb27b','#bb8756','#946442'])
  +`<clipPath id="mu12-cap-clip">${p(cap,'#fff')}</clipPath>`
  +`<clipPath id="mu12-cut-clip">${p(cut,'#fff')}</clipPath>`;

// The complete mushroom is compact and rounded; its short, broad stem remains visible.
let art=p('M101 134C103 146 99 159 101 171C109 182 130 184 141 173C141 160 137 147 139 135Z','url(#mu12-stem)');
art+=p('M128 139C125 154 127 170 134 178L142 172L139 135Z','#bba17f','opacity=".19" stroke="none"');
art+=line('M111 147C109 157 109 167 113 173','#fffdf0',2.8,.82);
art+=p('M57 126C72 114 101 109 125 111C153 111 175 119 188 128C179 147 150 156 124 154C96 154 70 144 57 132Z','url(#mu12-under)');
art+=line('M78 134Q94 144 107 145M132 146Q151 143 168 134','#9b7757',1.35,.6);
art+=p(cap,'url(#mu12-cap)');
art+='<g clip-path="url(#mu12-cap-clip)" stroke="none">';
art+=p('M162 70C179 95 177 119 163 143L202 141L194 91Z','#8d5f3a','opacity=".13"');
art+=p('M66 109C69 86 89 71 111 69C117 69 119 73 113 76C94 78 80 89 75 108C73 115 66 116 66 109Z','#fff0cf','opacity=".77"');
art+=p('M77 130C102 141 143 144 172 132C156 146 106 150 77 136Z','#f3cf9b','opacity=".38"');
art+='</g>';
art+=line('M64 131C94 146 143 149 178 134','#f4d5a8',1.6,.8);

// A half cut in front shows creamy cap flesh, a few broad gills, and the thick stem.
art+=p(cut,'url(#mu12-flesh)');
art+='<g clip-path="url(#mu12-cut-clip)" stroke="none">';
art+=p('M132 176C133 155 143 142 158 139C176 134 193 142 204 156C208 162 212 172 211 179L204 176C201 161 188 149 173 147C155 143 142 155 139 174Z','url(#mu12-rind)');
art+=p('M142 170C148 160 158 155 169 155C182 155 192 163 200 174C191 177 181 178 174 174L168 171L160 176C154 176 148 173 142 170Z','url(#mu12-under)');
art+=p('M172 182L180 183L186 205C182 210 177 213 171 212C176 205 175 192 172 182Z','#c7ad89','opacity=".24"');
art+='</g>';
art+=line('M145 170Q152 167 160 171M154 161Q161 163 166 169M174 160Q175 165 174 170M185 165Q181 167 178 172M194 174Q186 172 180 174','#987454',1.25,.68);
art+=line('M165 182Q164 196 168 205','#fffdf1',2.1,.82);
art+=line('M144 156C153 145 169 143 181 148','#fff1d5',2.3,.66);
// Reassert only the outside edge after the clipped flesh and rind shapes.
art+=p(cut,'none');

const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>蘑菇 · 短柄棕口蘑与半切面</title><defs>${defs}</defs><g stroke="#3d2e24" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

export const mushroomCandidates=[{
  id:'fresh-seasonal-1',name:'蘑菇',svg,expectedOccupancy:.66,
  design:{
    silhouette:'后方一朵圆厚菌盖、短宽菌柄的完整棕口蘑，前方搭一枚半切口蘑；主次紧凑相接',
    angle:'完整蘑菇略俯视，半切面向前展示，两个观察面形成清楚结构差异',
    material:'浅栗褐菌盖、奶油白菌肉和短柄，少量暖褐扇形菌褶，柔光克制而不密描纹理',
    identity:'完整厚菌盖与带短柄的半切面共同辨识；避免上轮同姿双伞和细长柄',
    container:'裸食材透明背景，无盛器、配菜或装饰',
  },
  reason:'把上轮两朵同姿长柄蘑菇改为短柄整蘑与半切面的紧凑组合，以圆厚菌盖、奶油白切面和少量菌褶表现鲜嫩；一级体量控制在约66%，保留清楚细深描边。',
}];

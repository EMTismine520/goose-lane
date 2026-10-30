// Review proposal: three compact, trimmed chicken cartilage pieces.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=1.35,opacity=1)=>p(d,'none',`stroke="${color}" stroke-width="${width}" opacity="${opacity}"`);
const gradient=(id,colors)=>`<linearGradient id="${id}" x1=".2" y1=".05" x2=".75" y2="1">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

const rearLeft='M57 108C51 104 51 96 57 87L71 67C76 59 85 60 90 67C94 74 93 82 100 87L110 97C117 105 113 116 104 119L78 126C67 128 60 121 57 108Z';
const rearRight='M135 84C136 75 145 71 154 75C163 79 168 80 177 77C186 73 194 79 198 88L208 108C211 119 204 127 193 126C183 125 180 131 171 132C160 133 156 124 146 122C135 119 129 109 133 100Z';
const main='M87 132C92 127 97 118 102 108C108 96 119 93 129 100C139 107 141 119 152 127C161 132 169 132 175 140C181 149 178 158 171 164C163 170 154 172 146 180C139 187 129 192 118 188C107 185 101 177 90 176C77 175 69 165 73 153C76 144 81 138 87 132Z';
const defs=gradient('cc8-cartilage',['#fffdf0','#f2e7d4','#d5c4b2'])
  +gradient('cc8-rear',['#f9f5e6','#e8dece','#c9b9a9'])
  +gradient('cc8-meat',['#e9b3a4','#d99c8d','#b9776d'])
  +gradient('cc8-edge',['#f4cbb9','#e7b4a3','#cd9283'])
  +`<clipPath id="cc8-left">${p(rearLeft,'#fff')}</clipPath><clipPath id="cc8-right">${p(rearRight,'#fff')}</clipPath><clipPath id="cc8-main">${p(main,'#fff')}</clipPath>`;

// Rounded irregular triangles, a soft pink collar and a clear ivory face establish
// trimmed joint cartilage. There are no long bones, stalks or broken sharp ends.
let art='';
// Smaller back-left piece, partially hidden by the main piece.
art+=p(rearLeft,'url(#cc8-rear)');
art+='<g clip-path="url(#cc8-left)" stroke="none">'+p('M53 105C68 112 76 113 88 109C98 105 105 105 115 102L117 131L62 137Z','url(#cc8-meat)')+'</g>';
art+=line('M60 109C72 116 79 114 89 111C99 108 104 108 110 108','#ad8070',1.35,.8);
art+=p(rearLeft,'none');
art+=line('M65 95Q66 85 78 73M65 105Q70 113 78 112','#fffbed',2.4,.8);
art+=line('M93 95Q96 102 102 103','#bca797',1.25,.55);
// Rear-right piece. Its broad low profile avoids a second egg-shaped silhouette.
art+=p(rearRight,'url(#cc8-rear)');
art+='<g clip-path="url(#cc8-right)" stroke="none">'+p('M151 118C158 114 162 112 167 115C174 121 181 120 186 115C190 111 201 110 212 115L211 139L150 140Z','url(#cc8-edge)')+'</g>';
art+=line('M155 119Q162 111 168 118C176 124 181 120 188 116Q199 111 204 116','#bd9382',1.3,.72);
art+=p(rearRight,'none');
art+=line('M146 85Q155 90 160 91M179 87Q185 87 189 96','#fffbed',2.3,.86);
art+=line('M149 108Q154 110 157 114M184 114Q190 110 196 113','#bca797',1.3,.54);
// Main front piece: a short, thick irregular triangle with a narrow meat rim.
art+=p(main,'url(#cc8-cartilage)');
// Broad, restrained planes keep the surface readable when reduced to 40 px.
art+=p('M109 116C113 106 118 107 122 111C130 120 132 131 143 137C150 142 159 141 164 147C167 152 161 153 156 151C139 144 133 144 126 135C120 128 117 123 109 126C104 128 105 123 109 116Z','#fffdf2','stroke="none" opacity=".55"');
art+=p('M83 157C94 155 103 158 114 167C123 174 130 174 139 169C145 166 150 165 157 166C149 170 144 176 138 180C130 185 122 185 115 181C106 176 99 172 90 172C84 170 81 163 83 157Z','#ac9484','stroke="none" opacity=".13"');
art+='<g clip-path="url(#cc8-main)" stroke="none">'+p('M72 164C85 166 95 163 102 168C109 172 109 178 117 178C125 178 134 173 142 173C147 172 151 174 154 177L149 197L102 198L72 184Z','url(#cc8-edge)')+'</g>';
art+=line('M80 168C91 166 98 167 103 171C109 176 110 181 119 181C129 180 135 175 143 176','#bc9180',1.45,.75);
art+=p(main,'none');
art+=line('M95 139Q104 131 110 118','#fffdf2',3,.72);
art+=line('M84 152Q80 157 84 161M119 171Q128 174 137 169','#fff9ea',1.9,.8);
art+=line('M103 159Q110 160 117 167M148 151Q155 152 160 149','#b7a393',1.35,.6);
art+=line('M87 171Q93 170 98 174M126 186Q134 185 140 181','#c99584',1.35,.65);

const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>鸡软骨 · 乳白软骨与淡粉肉缘</title><defs>${defs}</defs><g stroke="#3c2c24" stroke-width="3.05" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

export const p02Candidates=[{
  id:'fresh-poultry-2',name:'鸡软骨',svg,
  design:{
    silhouette:'三枚大小有别的短厚软骨紧凑叠放，前方圆钝三角为主、后方两枚较小；轻微凹腰与圆角构成自然剪影',
    angle:'三分之四略俯视，正面切面宽而完整，后方小块只露出足够的轮廓',
    material:'柔润乳白与浅米灰软骨切面，外围少量淡粉肉缘；用柔和面转折和窄亮边表现弹润感',
    identity:'不带长骨、尖锐断面或蒜瓣式尖梢；乳白切面与粉色肉缘区别鸡蛋、鸭掌、肉串和胸肉',
    container:'裸食材，透明背景，无盛器、配菜或装饰',
  },
  reason:'以鸡软骨替换鸡胗，用乳白软骨切面、淡粉肉缘和短厚圆钝三角引入更轻盈的低级食材形象，避免再次使用双叶内脏。',
}];

// Round 33: clear seafood broth and plain rice porridge, drawn from their real inputs.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const e=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,colour,width=1.5,opacity=1)=>p(d,'none',`stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const grad=(id,colours)=>`<linearGradient id="${id}" x1=".12" y1="0" x2=".86" y2="1">${colours.map((c,i)=>`<stop offset="${i/(colours.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const doc=(name,defs,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>${name} · 料理锅新版候选</title><defs>${defs}</defs><g stroke="#493b30" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

function seafoodSoup(){
  const defs=grad('p33-sea-bowl',['#e3f1f0','#b5d6dc','#7eaebf'])
    +grad('p33-sea-rim',['#fffdf0','#edf3e9','#cadfe0'])
    +grad('p33-clear-broth',['#fff0bd','#f3d795','#dfbb70'])
    +grad('p33-cooked-shrimp',['#ffcea8','#f6a078','#dc765d'])
    +grad('p33-conch',['#f6dfb2','#ddb67d','#b98a54'])
    +grad('p33-shell',['#dab78a','#b18b5e','#8b6747']);
  let art=p('M105 187H151L153 199Q128 210 103 199Z','url(#p33-sea-bowl)','stroke-width="2.6"');
  art+=p('M36 137C42 174 75 200 128 200C181 200 214 174 220 137Z','url(#p33-sea-bowl)');
  art+=p('M197 150L215 140C206 170 182 190 153 195C173 183 190 168 197 150Z','#6799ac','stroke="none" opacity=".32"');
  art+=e(128,136,92,31,'url(#p33-sea-rim)');
  art+=e(128,134,80,23,'url(#p33-clear-broth)','stroke="#b6a57c" stroke-width="1.4"');

  // A small conch shell is only an identity cue; its cooked meat remains the food.
  art+='<g transform="translate(173 118) rotate(15) scale(.72)">';
  art+=p('M-18-7L-16-20L-6-16L-1-26L8-18L18-17L17-5Q24 11 7 20Q-12 29-23 11Q-29 0-18-7Z','url(#p33-shell)','stroke-width="2.8"');
  art+=p('M-8-6Q4-16 15-4Q25 12 8 19Q-9 26-17 11Q-22 0-11-5Q0-12 7-2Q14 8 4 13Q-5 17-9 9Q-13 1-4-1Q3-3 2 4','none','stroke="#806047" stroke-width="1.8"');
  art+=line('M-12-12L-9-8M0-18L3-13','#f1d6aa',1.5,.95);
  art+='</g>';

  const squid=(x,y,a,s)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +e(0,2,18,12,'#e1d9bc','stroke-width="2.7"')
    +e(0,0,18,11,'#fff9e8','stroke-width="2.7"')
    +e(0,.2,13.2,7.3,'url(#p33-clear-broth)','stroke="#bcae8a" stroke-width="1.4"')
    +line('M-12-4Q-6-8 1-7','#ffffff',1.7,.95)+'</g>';
  art+=squid(144,108,-18,.96);
  art+=squid(164,137,18,.92);

  // A single peeled, cooked prawn curls above the broth, with a small coral tail.
  art+='<g transform="translate(96 124) rotate(-18) scale(.93)">';
  art+=p('M13-27L25-37L34-31L29-23L38-17L33-9L16-14Z','#ef8b6c','stroke-width="2.8"');
  art+=p('M16-27C-4-40-31-25-34-4C-37 15-20 30 0 27L-2 14C-15 17-23 5-20-6C-17-19-7-23 4-17L12-10Z','url(#p33-cooked-shrimp)');
  art+=p('M-27-13C-29-1-23 10-13 13Q-9 17-1 16L0 22C-17 25-30 12-31 0Z','#d77f5e','stroke="none" opacity=".34"');
  art+=line('M-24-18L-15-10M-31-5L-21-2M-26 9L-17 7M-13 21L-9 12','#bc735a',1.6,.93);
  art+=line('M-22-18Q-10-27 0-23M-28-2Q-28 7-21 12','#ffe4c4',2.25,.95);
  art+='</g>';

  // One cooked conch portion, cream-gold and cut, sits partly below the front soup line.
  art+='<g transform="translate(126 144) rotate(10)">';
  art+=p('M-18-5Q-15-16-2-14Q8-15 15-7L20 1Q17 14 4 16Q-10 18-18 9Q-25 2-18-5Z','url(#p33-conch)','stroke-width="2.7"');
  art+=p('M-13-5Q-7-11 3-9Q11-7 13 0Q12 7 4 9Q-7 12-13 5Z','#f8e7c4','stroke="#c09a68" stroke-width="1.5"');
  art+=line('M-8-4Q0-7 6-1M-5 4Q2 6 8 2','#dbbb88',1.4,.92);
  art+='</g>';
  art+=line('M54 132Q61 125 70 126M179 143Q189 142 194 136','#fff5d1',2,.94);
  art+=line('M81 149Q93 154 105 149M142 156Q153 156 159 151','#fbeac0',1.6,.9);

  // The uninterrupted front lip makes all four seafood portions sit in the soup.
  art+=p('M38 139C61 158 95 167 128 167C162 167 195 158 218 139L215 149C188 169 159 177 128 177C97 177 65 169 41 149Z','url(#p33-sea-rim)','stroke-width="2.6"');
  art+=line('M48 149Q128 184 208 149','#fffdf2',2.2,.95);
  art+=p('M58 165Q65 183 84 188Q90 188 86 184Q73 177 69 164Z','#f0fbf8','stroke="none" opacity=".86"');
  art+=line('M96 190Q131 202 164 188','#6695a6',1.45,.76);
  return doc('什锦海鲜汤',defs,art);
}

function plainPorridge(){
  const defs=grad('p33-porridge-bowl',['#f1f7e9','#d8e7d7','#adc9bd'])
    +grad('p33-porridge-rim',['#fffdf0','#edf3e5','#d5e2d3'])
    +grad('p33-porridge',['#fffdf1','#f5f1db','#e5dfbf']);
  let art=p('M108 176H148L151 187Q129 197 105 187Z','url(#p33-porridge-bowl)','stroke-width="2.6"');
  art+=p('M38 126C46 165 80 188 128 188C176 188 210 165 218 126Z','url(#p33-porridge-bowl)');
  art+=p('M192 142L212 129C202 159 179 178 150 183C169 171 184 155 192 142Z','#96b4a9','stroke="none" opacity=".30"');
  art+=e(128,126,90,30,'url(#p33-porridge-rim)');
  art+=e(128,123,79,23,'url(#p33-porridge)','stroke="#b9bea4" stroke-width="1.4"');

  // A thick, gently broken surface reads as rice porridge rather than a glass of milk.
  art+=p('M56 125C64 115 78 119 86 113C95 107 104 113 114 109C128 104 139 112 150 109C165 105 179 116 189 124C179 137 77 145 56 125Z','#fffcf0','stroke="none"');
  art+=line('M62 129C73 120 83 133 95 126C106 119 113 130 126 125C141 119 148 130 160 124Q176 119 186 127','#e6dfc1',1.8,.95);
  art+=line('M85 116Q95 109 105 114M132 113Q142 117 152 112M112 138Q124 141 135 136','#f4ebcd',1.5,.9);
  const grain=(x,y,a,s=1)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`
    +p('M-7 0Q-6-3 0-3Q7-3 8 0Q7 3 0 3Q-6 3-7 0Z','#fffdf4','stroke="#b8b598" stroke-width="1.3"')
    +line('M-2-1L2-1','#ffffff',1.1,.95)+'</g>';
  art+=grain(87,120,-23,.9)+grain(111,108,13,.9)+grain(144,119,-18,1);
  art+=grain(170,128,28,.92)+grain(128,136,8,.9)+grain(91,138,31,.88);
  art+=line('M59 119Q66 114 73 115M172 137L179 133','#fffefa',1.9,.92);

  art+=p('M40 130C65 149 97 156 128 156C159 156 193 149 216 130L213 139C189 157 159 165 128 165C97 165 66 157 43 139Z','url(#p33-porridge-rim)','stroke-width="2.6"');
  art+=line('M50 140Q128 173 206 140','#fffef4',2.2,.95);
  art+=p('M59 153Q68 173 85 177Q91 177 87 173Q74 166 70 153Z','#f9fcf1','stroke="none" opacity=".92"');
  art+=line('M96 178Q129 188 162 177','#9db7a9',1.4,.72);
  return doc('特色白粥',defs,art);
}

export const potSoupCandidates=[
  {id:'dish-fresh-ico-0089',name:'什锦海鲜汤',svg:seafoodSoup(),expectedOccupancy:.84,reason:'一只熟珊瑚虾、两个白鱿鱼环与一份奶金海螺肉清楚排布，少量螺壳仅作身份提示；浅金清汤盛入蓝白深碗，数量克制，所有海鲜均呈熟色。',design:{silhouette:'宽口蓝白深碗，熟虾卷曲、鱿鱼双环与海螺切肉各有独立轮廓',angle:'略俯视，能读出清汤、海鲜切面和碗壁厚度',material:'珊瑚熟虾、奶白鱿鱼、奶金螺肉与透亮浅金汤，蓝白陶碗柔光',identity:'只围绕鲜虾、鱿鱼、海螺三种实际主料，不增加蔬菜或其它贝类',container:'蓝白深陶碗，前碗沿包住汤面，含碗主体约84%',mainIngredientCounts:{shrimp:1,squidRings:2,conchPortion:1}}},
  {id:'dish-fresh-ico-0104',name:'特色白粥',svg:plainPorridge(),expectedOccupancy:.82,reason:'只用乳白米粥、自然稠纹与六粒饱满熟米表现清润白粥，青白低陶碗盛得饱满；不加鸡蛋、葱花或肉菜，让米与米汤本身清楚可辨。',design:{silhouette:'低矮宽口青白陶碗，粥面平缓饱满，米粒稠纹清楚',angle:'略俯视，露出宽阔粥面和圆润碗壁',material:'乳白米汤、柔软熟米与青白釉陶，克制自然波纹',identity:'实际主料只有大米；用六粒熟米和黏稠米汤区别干饭、牛奶与其它加料粥',container:'青白低陶碗，宽口与低足形成轻盈稳定轮廓，含碗主体约82%',visibleRiceGrains:6}}
];

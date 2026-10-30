// Plan 4 food direction samples. Each serving is independently composed.
// Transparent, editable 256-unit artwork; exports are intentionally not tied to
// the legacy mobile image budget. No runtime mapping is changed by this module.
const path = (d, fill, stroke = '#76503c', width = 1.5, extra = '') => '<path d="' + d + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + width + '" stroke-linejoin="round" stroke-linecap="round" ' + extra + '/>';
const ellipse = (x, y, rx, ry, fill, extra = '', more = '') => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '" ' + extra + ' ' + more + '/>';
const line = (d, stroke, width = 1.4, extra = '') => path(d, 'none', stroke, width, extra);
const group = (body, transform, extra = '') => '<g transform="' + transform + '" ' + extra + '>' + body + '</g>';
const gradient = (id, colors, extra = '') => '<linearGradient id="' + id + '" x1="0" y1="0" x2=".8" y2="1" ' + extra + '>' + colors.map((color, index) => '<stop offset="' + index / (colors.length - 1) + '" stop-color="' + color + '"/>').join('') + '</linearGradient>';
const radial = (id, colors, extra = '') => '<radialGradient id="' + id + '" cx=".32" cy=".21" r=".8" ' + extra + '>' + colors.map((color, index) => '<stop offset="' + index / (colors.length - 1) + '" stop-color="' + color + '"/>').join('') + '</radialGradient>';
const u = id => 'url(#' + id + ')';
const commonDefs = gradient('porcelain', ['#fffef4', '#f5efde', '#d8cdb7']) + gradient('porcelain-edge', ['#f0ebdc', '#d6cbb5', '#baa98c']) + radial('porcelain-top', ['#fffef8', '#fcf9e9', '#e8e2cf']);
const svg = (id, title, defs, body) => {
  const content = '<defs>' + commonDefs + defs + '</defs>' + body;
  const scoped = content.replace(/id="([^"]+)"/g, 'id="' + id + '-$1"').replace(/url\(#([^)]+)\)/g, 'url(#' + id + '-$1)');
  return '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256" fill="none"><title>' + title + '</title>' + scoped + '</svg>';
};
const shadow = (x = 128, y = 207, rx = 91, ry = 15) => ellipse(x, y, rx, ry, '#62462f', 'opacity=".07"') + ellipse(x, y - 1, rx * .8, ry * .6, '#62462f', 'opacity=".055"');
const plate = (x = 128, y = 163, rx = 110, ry = 54) => {
  return ellipse(x, y + 7, rx - 2, ry, u('porcelain-edge'), 'stroke="#ad967a" stroke-width="1.7"')
    + ellipse(x, y, rx, ry, u('porcelain-top'), 'stroke="#b9a68c" stroke-width="1.7"')
    + ellipse(x, y - 1, rx - 16, ry - 12, '#f8f5e6', 'stroke="#dbd1ba" stroke-width="1.25"')
    + line('M' + (x - rx + 13) + ' ' + (y - 8) + 'q' + (rx * .5) + ' -' + ry + ' ' + (rx * 1.1) + ' -' + (ry * .56), '#fffef7', 3, 'opacity=".75"');
};
const littleLeaf = (x, y, scale = 1, angle = 0) => group(path('M0 0C-22-5-26-22-7-22 10-24 15-8 0 0Z', u('leaf'), '#4f7838', 1.1) + line('M-15-16 0 0m-9-14 4 7m-8-4 7 7', '#b4d57b', 1.1), 'translate(' + x + ' ' + y + ') rotate(' + angle + ') scale(' + scale + ')');
const tomatoWedge = (x, y, scale = 1, angle = 0) => group(
  path('M-30-4Q-10-35 28-18L37 6Q2 41-30-4Z', u('tomato'), '#a04c32', 1.55)
  + path('M-24-5Q-7-26 25-14L29 5Q4 31-24-5Z', '#ff9670', '#f4a36f', 1.2)
  + path('M-17-3Q-7-16 9-15L3 4Z', '#cf462e', 'none')
  + path('M10-12 24-10 24 2 8 10Z', '#d74c2e', 'none')
  + path('M-13 2 1 8 9 18-1 20Z', '#d5452b', 'none')
  + [-9, 8, 19, 0].map((a, i) => ellipse(a, [-7, -7, 0, 14][i], 2.2, 1.2, '#ffe9a3', 'transform="rotate(' + (i * 35) + ' ' + a + ' ' + [-7, -7, 0, 14][i] + ')"')).join('')
  + line('M-23-8Q-3-29 24-17', '#ffd8a5', 2.2),
  'translate(' + x + ' ' + y + ') rotate(' + angle + ') scale(' + scale + ')'
);
const leafDefs = gradient('leaf', ['#c4db74', '#7eae45', '#3c793a']);
const tomatoDefs = radial('tomato', ['#ffc379', '#f77842', '#c44229']);

function tomatoEggs() {
  const defs = leafDefs + tomatoDefs + radial('egg', ['#fff4a4', '#fbd35e', '#edaa2b']) + gradient('egg-fold', ['#ffeaa0', '#f5bf40', '#df8d21']);
  const folds = [
    ['M42 120q-11-16 6-24 9-18 26-7 14-12 28 2 18-2 17 18-12 22-40 20Z', 0],
    ['M91 117q-8-19 7-29 11-10 25 0 14-12 27 3 24-4 29 14-2 24-35 25Z', 0],
    ['M59 148q-10-14 4-28 17-9 27 4 17-11 30 3 25-2 31 17-11 19-38 12-34 12-54-8Z', 0],
    ['M122 156q-13-20 6-31 13-7 24 5 13-11 30 0 17 0 15 17-4 26-43 21Z', 0]
  ].map(([d]) => path(d, u('egg'), '#d9962b', 1.6)).join('');
  const body = shadow(128, 209, 95, 12) + plate()
    + ellipse(129, 151, 80, 28, '#d99432', 'opacity=".1"')
    + tomatoWedge(73, 107, .95, -23) + tomatoWedge(163, 111, 1, 12)
    + folds
    + path('M58 106q20 13 34-5m18 4q17 14 36-1m-63 36q18 11 33-1m23 12q14 8 30-1', 'none', '#d99725', 2.2)
    + path('M49 112q11-13 23-7m32-9q13-7 23 1m-51 32q12-4 24 2m43 4q12-8 26 0', 'none', '#fff3bd', 3.5)
    + tomatoWedge(73, 159, 1.12, 13) + tomatoWedge(172, 148, 1.04, -24) + tomatoWedge(118, 121, .72, -9)
    + littleLeaf(114, 94, .59, -46) + littleLeaf(120, 94, .5, 50)
    + line('M68 181l10-3m53-18 9-3m39 7 10 3m-88-51 6-4', '#568540', 3)
    + [[46,148],[90,94],[146,178],[196,134]].map(([x,y])=>ellipse(x,y,2.2,1.2,'#fff4bd')).join('');
  return svg('eggs', '番茄炒蛋 · 金黄嫩蛋与多汁番茄', defs, body);
}

function redWineSteak() {
  const defs = leafDefs + radial('steak', ['#db9b5e', '#ae693f', '#713e2c']) + gradient('steak-edge', ['#a85d38', '#79452f', '#552e26']) + gradient('cut-face', ['#e8ae8c', '#d58b75', '#b96a58']) + gradient('sauce', ['#a95d46', '#7a3e32', '#582d27']) + gradient('potato', ['#ffdf8c', '#e8ad4a', '#bf7638']) + gradient('asparagus', ['#a9c16a', '#6a913e', '#436b36']);
  const potatoes = [[170,105,-14],[192,117,25],[180,136,12]].map(([x,y,a]) => group(
    path('M-17-10Q-10-24 5-19L19-4q4 15-15 23-20-2-21-29Z',u('potato'),'#aa713e',1.3)
    + line('M-9-11Q-3-16 4-13','#ffe7ac',2.7)
    + [[0,-7],[9,4],[-3,10]].map(([dx,dy])=>ellipse(dx,dy,1.2,1,'#ac763e')).join(''),
    'translate('+x+' '+y+') rotate('+a+')'
  )).join('');
  const asparagus = [0,1,2].map(i => group(path('M-3 20 1-36l8 1-2 55Z',u('asparagus'),'#62823f',1.1)+path('M1-34-2-42l6-15 7 14-2 9Z',u('asparagus'),'#55783a',1.1)+line('M2-41l4 3m-3-8 5 3m-3-11 3 4','#c0d28a',1), 'translate('+(184+i*10)+' '+(161-i*5)+') rotate(28)')).join('');
  const body = shadow(129,211,96,12) + plate(128,167,111,53)
    + path('M48 150q20-31 58-27 41-21 70 7 28 4 25 28-16 34-65 30-58 9-88-17-8-8 0-21Z',u('sauce'),'none')
    + line('M56 167q35 20 65 10m23-5 33-6','#be7a59',2.1,'opacity=".7"')
    + potatoes + asparagus
    + path('M51 112q14-37 55-35 44-8 62 29l-6 37q-33 34-78 18-38-9-33-49Z',u('steak-edge'),'#62402e',2)
    + path('M49 109q12-35 55-34 40-6 62 26 7 16-16 29-32 25-71 12-34-8-30-33Z',u('steak'),'#805032',1.8)
    + path('M61 105q20-25 49-20 31-3 42 16', 'none','#f2c58b',2.2,'opacity=".85"')
    + [[68,101],[92,88],[119,90],[139,104],[81,121],[110,126],[147,119],[67,116]].map(([x,y],i)=>line('M'+x+' '+y+'l'+(i%2?17:21)+' '+(i%2?8:9),'#73412e',2.7,'opacity=".65"')).join('')
    + [[62,99],[120,100],[89,136],[138,119],[102,89]].map(([x,y])=>ellipse(x,y,1.5,1,'#5c4434')).join('')
    + group(path('M-39-13 19-23l18 19-3 17-57 12-19-17Z',u('steak-edge'),'#75422e',1.5)
      +path('M-39-13 19-23 37-4-20 9Z',u('steak'),'#8a5135',1.3)
      +path('M-20 9 37-4 34 13-23 25Z',u('cut-face'),'#9a5c47',1.3)
      +line('M-13 14 26 5','#f3c2a0',2)
      +line('M-25-9 9-16m-17 17 28-7','#70402d',2.3),'translate(91 161) rotate(-6)')
    + littleLeaf(155,174,.42,50) + line('M144 173 170 162m-17 7 4-10m4 6 6-8','#51743b',1.8);
  return svg('steak', '红酒酱牛排 · 焦香表皮与湿润切面', defs, body);
}

function gardenSalad() {
  const defs = leafDefs + tomatoDefs + gradient('bowl-green', ['#a9bb82', '#6f9461', '#4f7955']) + gradient('lettuce', ['#e2e99c', '#acd269', '#659b42']) + gradient('cucumber', ['#e9efb4', '#c4d890', '#90b85b']) + gradient('onion', ['#f8e7f0', '#dab1d0', '#a478a6']);
  const lettuce = [[59,101,-20,1],[90,82,8,1],[127,92,28,1.05],[167,88,-8,1],[192,111,35,.9],[84,126,-18,1],[148,123,30,.9]].map(([x,y,a,s]) => group(
    path('M-24 10q-18-5-13-18-7-13 6-17 4-14 17-10 12-9 20 1 16-2 17 12 17 7 5 18-12 19-34 14Z',u('lettuce'),'#6f9b45',1.35)
    + line('M-17-26Q-6-7 7 10m-18-29-12-4m19 14 12-13m-6 20 15-5','#d3e797',1.45),
    'translate('+x+' '+y+') rotate('+a+') scale('+s+')'
  )).join('');
  const cucumber = [[61,136,-25],[131,99,18],[170,141,18]].map(([x,y,a])=>group(
    ellipse(0,0,22,16,'#5e9148','stroke="#497e3f" stroke-width="1.4"')+ellipse(0,-2,18,12,u('cucumber'),'stroke="#a8c77a" stroke-width="1.1"')
    +[-10,0,10].map(dx=>ellipse(dx,-2,1.3,4,'#f7f0c5','transform="rotate(23 '+dx+' -2)"')).join(''),
    'translate('+x+' '+y+') rotate('+a+')'
  )).join('');
  const body = shadow(128,214,83,12)
    + path('M30 137q97-36 197 0l-15 39q-21 38-83 39-63 0-84-37Z',u('bowl-green'),'#56724d',1.8)
    + ellipse(129,137,99,38,'#e9ecd3','stroke="#718954" stroke-width="2"')
    + ellipse(129,136,89,29,'#6b8b43')
    + lettuce + cucumber
    + tomatoWedge(103,124,.91,-12)+tomatoWedge(179,117,.92,20)+tomatoWedge(105,157,.95,13)
    + group(ellipse(0,0,21,13,'none','stroke="#ad77a8" stroke-width="5"')+ellipse(0,0,16,8,'none','stroke="#f4deed" stroke-width="2"'),'translate(139 140) rotate(-18)')
    + group(ellipse(0,0,16,9,'none','stroke="#b57fae" stroke-width="4"')+line('M-12-3q11-8 23-1','#f5dfec',1.6),'translate(79 105) rotate(24)')
    + line('M45 155q79 42 166-2','#dce3b6',3,'opacity=".6"')
    + path('M41 161q25 20 55 23','none','#c8d89e',3.5)
    + [[72,88],[155,107],[122,155],[188,146],[95,131]].map(([x,y])=>ellipse(x,y,1.9,1.3,'#fff3bb','opacity=".9"')).join('')
    + littleLeaf(135,77,.5,-10);
  return svg('salad', '田园沙拉 · 鲜脆叶片与清透蔬果', defs, body);
}

function garlicBread() {
  const defs = leafDefs + gradient('board', ['#eacb94', '#d2a46e', '#b7834e']) + radial('crust', ['#edbd6f', '#cf8e3f', '#96552d']) + gradient('crumb', ['#fff0b8', '#ead18e', '#d1ab61']) + gradient('butter', ['#ffed91', '#e6c365', '#c99d3f']);
  const bread = (x,y,a,s) => group(
    path('M-60-15q-2-14 13-22 44-22 93-2 19 9 14 28l-13 31q-40 26-86 3Z',u('crust'),'#9a6235',1.8)
    +path('M-57-17q2-12 17-17 39-17 83-1 14 5 15 18-47 29-115 0Z',u('crumb'),'#c2934b',1.4)
    +path('M-49-17q12-11 28-11 22-8 47 0 13 0 22 10-43 22-97 1Z',u('butter'),'none')
    +[[-38,-19,3,2.1],[-20,-27,2.3,1.6],[-5,-15,4,2.3],[11,-25,3,1.8],[28,-15,3.5,1.8],[39,-22,2,1.5],[-23,-10,2.5,1.6],[18,-8,2,1.4]].map(([px,py,rx,ry])=>ellipse(px,py,rx,ry,'#b58e4b','opacity=".48"')).join('')
    +[[-37,-13],[-17,-22],[5,-10],[27,-22],[37,-13],[-5,-24]].map(([px,py],i)=>path('M'+px+' '+py+'l4-3 3 3-4 4Z',i%2?'#5e8d3c':'#7e9d41','none')).join('')
    +line('M-49-20q20-11 45-10m12 29 26-4','#fff6cd',2.7)
    +line('M-45 5q40 20 84 1','#a66c32',1.8)
    +line('M-41 15q30 10 57 7','#e7b56c',2.1),
    'translate('+x+' '+y+') rotate('+a+') scale('+s+')'
  );
  const body = shadow(129,215,91,12)
    +path('M30 129 169 75l64 83q5 8-4 13L91 224q-10 4-18-5L24 148q-8-12 6-19Z',u('board'),'#a87d4d',1.8)
    +line('M39 143 169 91m-117 76 130-50m-113 74 130-50m-112 73 129-50','#bc8e57',1.4,'opacity=".5"')
    +bread(147,107,-21,.96)+bread(103,155,-21,1.02)
    +littleLeaf(188,185,.7,18)+littleLeaf(189,183,.56,92)+littleLeaf(186,182,.5,-56)
    +path('M47 192q-8-9-13-1-4 9 9 16 12-5 4-15Z','#fff1c7','#c8b58f',1.1)
    +path('M45 194q-1 6 0 9','none','#dbcb9f',1)
    +[[98,201],[113,202],[135,190],[161,187]].map(([x,y],i)=>path('M'+x+' '+y+'l'+(3+i%2)+' -2 2 3-3 2Z','#e2bd76','none')).join('');
  return svg('bread', '蒜香面包 · 酥脆外壳与黄油蒜香切面', defs, body);
}

function mangoPudding() {
  const defs = leafDefs + gradient('pudding', ['#ffe999', '#f9c85b', '#eaa039']) + gradient('pudding-side', ['#f5bf51', '#efad3d', '#d7872c']) + radial('pudding-top', ['#fff2b2', '#ffd96a', '#edb33b']) + gradient('syrup', ['#ffd15a', '#f4ae30', '#d68a24']) + gradient('mango', ['#ffe28a', '#ffbd39', '#e99523']);
  const cube = (x,y,a,s=1) => group(path('M-14-13 7-20 22-8 16 13-5 20-20 7Z',u('mango'),'#cf8c2b',1.15)+path('M-14-13 2-2 22-8 7-20Z','#ffdf7d','#e9b142',1)+path('M2-2-5 20m7-22 14 15','none','#e7a437',1.1)+line('M-10-13 6-18','#fff0b6',1.8),'translate('+x+' '+y+') rotate('+a+') scale('+s+')');
  const body = shadow(128,216,93,12)
    +path('M22 169q-6-10 7-17l90-32q13-5 28 1l80 33q12 7 6 17l-87 45q-15 7-30 1Z',u('porcelain-edge'),'#b29f81',1.7)
    +path('M22 162q-4-7 9-13l89-32q12-4 25 1l82 32q13 7 5 14l-87 43q-15 7-29 1Z',u('porcelain-top'),'#cabda0',1.5)
    +ellipse(115,170,65,24,'#e6a03a','opacity=".18"')
    +cube(179,132,-8,.8)+cube(194,153,10,.9)+cube(174,168,-8,.8)
    +path('M66 89q43-19 85 0l17 73q-3 32-58 34-53-6-55-30Z',u('pudding-side'),'#cf8d32',1.65)
    +path('M70 92q10-5 18-7l-8 93q-8-3-13-9Z',u('pudding'),'none')
    +path('M96 85q11-3 20-1l-1 104q-12-1-21-4Z',u('pudding'),'none')
    +path('M126 85q10 1 17 6l8 88q-8 6-18 8Z',u('pudding'),'none')
    +ellipse(109,90,43,19,u('pudding-top'),'stroke="#dba447" stroke-width="1.5"')
    +path('M67 89q16-18 43-17 29 0 42 18-20 18-42 17-28 1-43-18Z',u('syrup'),'#e2a037',1.1)
    +path('M81 84q14-8 32-8 17 0 27 8','none','#fff1a4',3.1)
    +path('M70 104q-2 34-8 54m40-45-3 56','none','#fff0b0',2.7,'opacity=".8"')
    +path('M70 177q25 18 57 11','none','#fbd46c',1.8)
    +cube(103,73,-7,.7)+cube(126,76,9,.58)
    +littleLeaf(119,60,.53,35)+littleLeaf(120,61,.42,-58)
    +ellipse(86,84,5,1.9,'#fff6c0','opacity=".75"');
  return svg('pudding', 'QQ芒果布丁 · 柔软奶冻与透亮芒果淋面', defs, body);
}

function espresso() {
  const defs = gradient('cup', ['#fffdf2', '#ece4cf', '#cfc3aa']) + gradient('cup-shadow', ['#e6dbc1', '#c7b696', '#b3a080']) + radial('coffee', ['#a77344', '#734526', '#3f2a21']) + radial('crema', ['#efc482', '#c28a47', '#8e582d']) + gradient('bean', ['#bb8b54', '#865333', '#513526']);
  const beans = [[183,184,30],[201,174,-17],[194,195,63]].map(([x,y,a])=>group(ellipse(0,0,11,7.5,u('bean'),'stroke="#69472d" stroke-width="1.1"')+line('M-6-3q9 0 7 7','#4f3528',1.7)+line('M-6-4q3-2 6-1','#d3a36d',1.3),'translate('+x+' '+y+') rotate('+a+')')).join('');
  const body = shadow(124,212,89,12)
    +ellipse(120,188,94,28,u('porcelain-edge'),'stroke="#b8a17f" stroke-width="1.5"')
    +ellipse(120,182,95,29,u('porcelain-top'),'stroke="#c4b492" stroke-width="1.5"')
    +ellipse(120,182,60,17,'none','stroke="#ded1b4" stroke-width="1.3"')
    +path('M168 112q48-6 43 27-6 27-43 20l1-13q22 5 27-10 4-14-26-11Z',u('cup-shadow'),'#aa9575',1.7)
    +path('M54 111h121l-7 39q-4 38-55 38-49-1-53-37Z',u('cup'),'#bba98a',1.9)
    +path('M65 124q-2 34 15 43','none','#fffef4',5,'opacity=".85"')
    +path('M157 130q-3 26-15 36','none','#cabc9e',2.4,'opacity=".7"')
    +ellipse(114,111,61,24,u('porcelain-top'),'stroke="#b9a484" stroke-width="1.9"')
    +ellipse(114,113,53,18,u('coffee'),'stroke="#9d754a" stroke-width="1.2"')
    +ellipse(114,110,52,16,u('crema'))
    +path('M68 110q12-16 45-14 32-2 46 11-9 13-28 14-37 8-63-11Z',u('crema'),'none')
    +path('M78 109q20-14 52-9 18 3 17 8-2 10-27 8-18-1-23-5 0-4 15-6 12 0 13 3','none','#f7d49a',2.2)
    +ellipse(117,113,12,3,'#71462a','opacity=".5"')
    +[[77,107,1.7],[88,100,1.3],[101,119,1.2],[137,112,1.5],[145,104,1.1],[125,99,1.1],[91,114,1.4],[151,112,1.1]].map(([x,y,r])=>ellipse(x,y,r,r*.65,'#ffdfaa','opacity=".8"')).join('')
    +line('M65 104q15-15 43-15','#fffef7',2.8)
    +beans;
  return svg('espresso', '浓缩咖啡 · 厚瓷小杯与金褐油脂', defs, body);
}

function greenTea() {
  const defs = leafDefs + gradient('jade', ['#e5eccf', '#b5cc9b', '#7f9e73']) + gradient('jade-edge', ['#c7d6ad', '#93af82', '#6c8c62']) + radial('tea', ['#e2dfa0', '#aabc64', '#789944']) + gradient('tea-depth', ['#bccb80', '#8ea459', '#567c3d']);
  const body = shadow(126,212,89,12)
    +ellipse(123,193,82,24,u('jade-edge'),'stroke="#789367" stroke-width="1.5"')
    +ellipse(123,188,86,25,u('jade'),'stroke="#a2b58c" stroke-width="1.7"')
    +ellipse(123,188,60,15,'none','stroke="#b3c59b" stroke-width="1.2"')
    +path('M48 109h147l-16 49q-9 33-58 34-48-2-59-34Z',u('jade'),'#829866',1.9)
    +path('M62 130q7 28 26 40','none','#f0f3d9',4.5)
    +path('M180 135q-7 22-23 34','none','#91a77b',2.5)
    +ellipse(122,109,75,27,u('jade'),'stroke="#879f6f" stroke-width="1.9"')
    +ellipse(122,109,65,21,u('tea-depth'),'stroke="#97ad69" stroke-width="1"')
    +ellipse(122,106,63,18,u('tea'))
    +path('M68 104q20-16 54-15 28-1 51 10','none','#eef0bd',2.2,'opacity=".8"')
    +ellipse(115,109,32,8,'#c5d891','opacity=".23"')
    +group(path('M-22 4q11-18 37-12-7 22-28 20Z',u('leaf'),'#678948',1.2)+line('M-14 8 8-4','#bfd48e',1.1),'translate(128 107) rotate(-12)')
    +path('M118 115q11 5 23 2','none','#e3e9b3',1.1,'opacity=".75"')
    +littleLeaf(197,186,.78,15)+littleLeaf(195,186,.58,85)+littleLeaf(196,184,.56,-64)
    +line('M194 185 207 204','#738f4d',1.8)
    +ellipse(91,111,1.7,1,'#f9f7ce')+ellipse(94,113,1,1,'#f9f7ce');
  return svg('tea', '绿茶 · 青瓷茶盏与清透茶汤', defs, body);
}

const lemon = (x,y,s=1,a=0) => group(
  ellipse(0,0,30,28,u('lemon-rind'),'stroke="#cda139" stroke-width="1.3"')
  +ellipse(0,-1,25,23,'#fff1ac','stroke="#fff8ce" stroke-width="2"')
  +Array.from({length:8},(_,i)=>group(path('M1-3 3-21Q13-20 16-14L4 0Z',i%2?'#f5ca58':'#f3d66c','none'),'rotate('+(i*45)+')')).join('')
  +ellipse(0,0,4.2,4,'#fff1b4')
  +[[10,-10],[-11,7],[-4,14]].map(([px,py])=>ellipse(px,py,1.2,3,'#fff9d9','transform="rotate(25 '+px+' '+py+')"')).join('')
  +line('M-23-14Q-11-28 6-24','#fff6b7',2),
  'translate('+x+' '+y+') rotate('+a+') scale('+s+')'
);
function lemonTea() {
  const defs = leafDefs + gradient('glass', ['#f3ffed', '#d5e6ca', '#9fbdac']) + gradient('glass-wall', ['#f7fff1', '#cddfc7', '#8fada0']) + gradient('amber', ['#f8db7d', '#d7a44b', '#aa7030']) + gradient('lemon-rind', ['#ffed88', '#f8d447', '#d7a634']) + gradient('ice', ['#fbfff1', '#dcf0dc', '#a1cfc2']);
  const ice = (x,y,a,s=1)=>group(path('M-16-12 3-18 21-7 14 13-7 17-20 3Z',u('ice'),'#a5cabc',1.15,'fill-opacity=".7"')+path('M-16-12 1-4 21-7 3-18Z','#f6fff2','none','1','opacity=".8"')+line('M1-4-7 17m8-21 13 17','#e9f9e5',1.3),'translate('+x+' '+y+') rotate('+a+') scale('+s+')');
  const body = shadow(128,231,83,10)
    +path('M175 83q58-9 55 42-2 39-52 35l-1-15q35 3 37-21 0-25-37-24Z',u('glass-wall'),'#89aa9a',2.1)
    +path('M49 63q64-20 129 0l-1 132q-1 27-64 28-60-1-61-26Z',u('glass'),'#8faa98',2.1,'fill-opacity=".55"')
    +path('M58 90q56-16 111 0l-1 106q-5 18-54 18-47-2-54-19Z',u('amber'),'#c69c4c',1.1,'fill-opacity=".93"')
    +ellipse(114,92,56,15,'#e3bd67','stroke="#b38d42" stroke-width="1.1"')
    +path('M144 37 167 20l5 7-20 17-30 91-8-3Z','#759d72','#54774f',1.4)
    +line('M148 37 165 25','#bfd5a3',1.5)
    +ice(91,92,-18,.94)+ice(132,99,22,.96)+ice(145,83,-9,.79)
    +lemon(111,149,1.05,-17)+lemon(94,182,.67,16)
    +ellipse(114,65,66,17,'#edf5d9','stroke="#8faa98" stroke-width="2"','opacity=".7"')
    +ellipse(114,65,58,12,'#f4e5a3','stroke="#b7c5a0" stroke-width="1.2"','opacity=".35"')
    +lemon(67,64,.79,-18)
    +littleLeaf(81,44,.59,11)+littleLeaf(81,45,.45,80)
    +path('M58 82 62 195q8 12 23 13','none','#fffef0',4.4,'opacity=".88"')
    +path('M160 112 159 192','none','#fffbe8',2.4,'opacity=".65"')
    +line('M69 217q39 15 79-1','#d5e5c8',2.5)
    +[[67,118,2.8],[153,142,2.3],[73,172,1.8],[149,188,2.5],[66,146,1.8]].map(([x,y,r])=>ellipse(x,y,r,r*1.3,'#f5fff0','fill-opacity=".65" stroke="#d4e8ce" stroke-width=".7"')).join('');
  return svg('lemon-tea', '鹅鹅手打柠檬茶 · 清透琥珀茶与鲜柠切片', defs, body);
}

function pearlMilkTea() {
  const defs = gradient('glass', ['#f2fff1', '#d9e9d4', '#a4bcb0']) + gradient('milk-tea', ['#e8cba0', '#d6ad78', '#b98a56']) + gradient('brown-sugar', ['#a57746', '#7c522f', '#4c3526']) + radial('pearl', ['#a67b52', '#6c482e', '#382b22']) + gradient('lid', ['#fbfff3', '#d7e9db', '#a4bdb3']);
  const pearls = [[86,182,9],[107,186,10],[131,187,9],[153,183,9],[96,167,9],[121,167,10],[145,164,8],[114,202,8],[139,202,8],[84,199,7]].map(([x,y,r])=>ellipse(x,y,r,r*.9,u('pearl'),'stroke="#65472d" stroke-width=".9"')+ellipse(x-r*.27,y-r*.29,r*.25,r*.15,'#d6b082','opacity=".7"')).join('');
  const body = shadow(126,233,71,10)
    +path('M170 82 158 204q-3 24-42 24-38-1-42-25L57 83Z',u('glass'),'#91a99b',1.9)
    +path('M66 99h95l-12 102q-2 17-33 18-31-2-34-19Z',u('milk-tea'),'#c29d6e',1.1)
    +path('M78 181q19-20 34-7 13-14 40-4l-3 31q-2 17-33 18-28-2-33-17Z',u('brown-sugar'),'none','1','opacity=".75"')
    +path('M73 116q17 0 12 32-8 27 11 29m49-61q-17 2-11 34 8 22-4 38m-18-74q-7 19 0 35','none','#aa7a47',5,'opacity=".28"')
    +pearls
    +ellipse(114,100,48,14,'#e7c79c','stroke="#c8a16e" stroke-width="1.1"')
    +path('M54 80q0-27 22-42 18-12 38-11 22-2 40 11 20 16 20 42Z',u('lid'),'#a2b8aa',1.8,'fill-opacity=".68"')
    +path('M65 72q2-20 24-31 22-9 41-3','none','#fffef5',3.4,'opacity=".95"')
    +path('M127 88 149 12l12 3-23 80Z','#705035','#513c2b',1.45)
    +path('M151 18 143 48','none','#b39168',2.3)
    +ellipse(114,81,62,16,u('glass'),'stroke="#96ae9f" stroke-width="1.8"')
    +ellipse(114,79,55,10,'#eef7df','stroke="#bdccba" stroke-width="1.1"','opacity=".35"')
    +path('M52 81q-2-5 5-6 57 17 115 0 6 2 4 7l-3 8q-57 17-118-1Z',u('lid'),'#a0b7a7',1.5)
    +path('M66 99 79 199q4 12 13 15','none','#fff9e6',4.7,'opacity=".8"')
    +path('M156 110 148 179','none','#fff9e8',2.1,'opacity=".75"')
    +path('M90 223q29 10 53-2','none','#d8e6cf',2.3);
  return svg('milk-tea', '珍珠奶茶 · 温润奶茶与黑糖珍珠', defs, body);
}

const item = (name, group, design, draw) => ({ name, group, design, svg: draw() });
export const finishedSamples = [
  item('番茄炒蛋', '熟食甜点', { silhouette:'低盘中堆叠的嫩蛋块与五瓣番茄切面', angle:'偏俯视三分之四', material:'嫩蛋褶皱、多汁果肉、薄瓷盘', identity:'金黄色嫩蛋与有籽番茄切面共同占主导', container:'浅奶油色椭圆瓷盘' }, tomatoEggs),
  item('红酒酱牛排', '熟食甜点', { silhouette:'整块厚牛排加前方切片，右后侧少量配菜', angle:'三分之四，前切面朝向观察者', material:'焦香外壳、湿润肉切面、浓稠红酒酱', identity:'有厚度的主排与粉棕切面、烤痕和深红酱汁', container:'宽沿浅瓷盘' }, redWineSteak),
  item('田园沙拉', '熟食甜点', { silhouette:'高低起伏的叶片从深碗口探出', angle:'偏俯视三分之四', material:'薄脆生菜、清透瓜片、鲜番茄、柔光釉碗', identity:'叶片构成主体，瓜片与紫洋葱环作为区别特征', container:'低饱和叶绿色深陶碗' }, gardenSalad),
  item('蒜香面包', '熟食甜点', { silhouette:'两块错位斜放的长面包切片', angle:'切面向上、斜向三分之四', material:'棕金酥壳、多孔面包内芯、融化黄油与蒜粒', identity:'长条切片与金黄涂面，绿色香草分布克制', container:'有厚度的浅木板' }, garlicBread),
  item('QQ芒果布丁', '熟食甜点', { silhouette:'完整柔软布丁与右侧芒果丁组合', angle:'三分之四，露出顶面与竖向奶冻褶面', material:'柔软奶冻、透亮芒果淋面、新鲜芒果果肉', identity:'金黄布丁体、圆顶淋面和芒果方块', container:'圆角方形白瓷碟' }, mangoPudding),
  item('浓缩咖啡', '饮品', { silhouette:'厚瓷矮小杯与右侧圆耳、宽碟', angle:'偏俯视，完整看到咖啡油脂面', material:'厚釉瓷、金褐咖啡油脂、烘焙咖啡豆', identity:'小杯深色咖啡与薄金褐油脂，不使用奶泡图案', container:'奶油白意式小杯与同色杯碟' }, espresso),
  item('绿茶', '饮品', { silhouette:'无把手的外撇青瓷茶盏与少量茶叶', angle:'偏俯视，清楚展示茶汤与薄杯口', material:'温润青瓷、透明黄绿茶汤、柔软茶叶', identity:'开放式青瓷茶盏、浅色茶汤与单片浮叶', container:'浅青瓷茶盏及杯碟' }, greenTea),
  item('鹅鹅手打柠檬茶', '饮品', { silhouette:'右侧带柄的高透明杯、弯吸管和杯口柠檬', angle:'三分之四，杯口椭圆且杯壁通透', material:'厚玻璃、琥珀茶液、清透冰块、柠檬果瓣', identity:'带柄玻璃杯中大块柠檬切面和琥珀茶液', container:'透明直身玻璃杯' }, lemonTea),
  item('珍珠奶茶', '饮品', { silhouette:'收底高杯、圆拱透明盖与粗斜吸管', angle:'三分之四，可见圆盖厚度和杯底', material:'温润奶液、黑糖流纹、光泽珍珠、透明杯盖', identity:'底部大颗珍珠与粗吸管，杯型独立于柠檬茶', container:'透明圆拱盖奶茶杯' }, pearlMilkTea),
];

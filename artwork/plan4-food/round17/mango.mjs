// EX04: the long ripe fruit and scored cheek deliberately differ from lemon.
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.45, opacity = 1) => p(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);
const fruit = 'M143 45C164 48 178 67 180 91C183 119 169 148 145 171C126 190 101 204 81 200C62 197 52 182 55 165C58 147 73 136 83 121C94 104 91 87 104 67C114 51 129 42 143 45Z';
const defs = `<linearGradient id="r17-mango-skin" x1=".9" y1=".02" x2=".16" y2=".96"><stop stop-color="#e96850"/><stop offset=".35" stop-color="#f68f3f"/><stop offset=".72" stop-color="#ffbd46"/><stop offset="1" stop-color="#ffd476"/></linearGradient>
  <linearGradient id="r17-mango-cheek" x1=".2" y1="0" x2=".65" y2="1"><stop stop-color="#ffca56"/><stop offset="1" stop-color="#f2a02b"/></linearGradient>
  <linearGradient id="r17-mango-cut" x1=".15" y1="0" x2=".75" y2="1"><stop stop-color="#ffdf79"/><stop offset="1" stop-color="#ffbf37"/></linearGradient>
  <linearGradient id="r17-mango-cube-side" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#f6ac2e"/><stop offset="1" stop-color="#e78b27"/></linearGradient>
  <clipPath id="r17-mango-fruit-clip">${p(fruit, '#fff')}</clipPath>`;

let art = p('M136 49C139 42 139 37 137 33C139 31 143 32 145 34C148 40 148 47 145 54Z', '#8d6745', 'stroke-width="2.1"');
art += p(fruit, 'url(#r17-mango-skin)');
art += '<g clip-path="url(#r17-mango-fruit-clip)" stroke="none">';
art += p('M150 52C168 64 175 86 172 106C169 126 157 144 146 153C159 125 159 98 150 77C144 64 143 57 150 52Z', '#d85645', 'opacity=".24"');
art += p('M119 64C104 80 106 98 98 117C91 133 75 146 69 160C65 169 66 178 70 183C62 175 64 163 71 151C81 134 91 124 95 106C100 87 102 71 113 62C119 57 123 59 119 64Z', '#ffe1a0', 'opacity=".64"');
art += p('M78 187C91 194 110 187 126 178C112 195 90 203 78 196Z', '#e9a73d', 'opacity=".4"');
art += '</g>';
art += line('M130 54Q137 57 144 54', '#a95d39', 1.4, .7);
art += line('M160 115C155 135 139 155 123 166', '#d77c30', 1.35, .55);

// A shallow, curved cheek supports six broad connected flesh pieces.
art += p('M107 147C129 136 159 140 185 154C201 162 212 174 212 186C209 200 192 214 171 219C150 223 126 215 112 202C99 190 96 175 100 162Z', '#e97840');
art += p('M106 148C127 136 155 140 182 153C198 160 209 171 209 182C208 194 193 206 173 210C151 215 128 207 114 194C101 182 97 165 106 148Z', 'url(#r17-mango-cheek)', 'stroke="#a7682e" stroke-width="1.7"');
art += line('M117 200C132 213 152 217 171 215', '#ffc65d', 1.6, .8);
const pieces = [
  ['M107 151Q120 145 132 147L130 167L108 166Q102 158 107 151Z', 'M108 166L130 167L132 176L110 174Z'],
  ['M136 147Q149 148 161 153L157 175L134 169Z', 'M134 169L157 175L159 184L136 178Z'],
  ['M165 154Q181 160 190 170L181 187L161 177Z', 'M161 177L181 187L182 196L163 186Z'],
  ['M111 179L132 180L138 198Q125 194 116 188Z', 'M116 188Q126 198 138 202L138 208Q124 204 116 196Z'],
  ['M137 181L159 187L159 207L142 203Z', 'M142 203L159 207L160 214L144 210Z'],
  ['M164 188L184 199Q176 206 164 209Z', 'M164 209Q177 207 184 202L183 208Q175 214 164 216Z'],
];
for(const [top,side] of pieces){
  art += p(side, 'url(#r17-mango-cube-side)', 'stroke="#b97528" stroke-width="1.25"');
  art += p(top, 'url(#r17-mango-cut)', 'stroke="#be7b2c" stroke-width="1.45"');
}
art += line('M112 154Q119 151 125 152M141 152L153 156M168 160Q178 164 183 170', '#ffedaa', 1.65, .85);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>芒果 · 橙红长果与金黄果颊</title><defs>${defs}</defs><g stroke="#684434" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;

export const mangoRedesign = {
  id: 'fresh-exotic-4', name: '芒果', svg, expectedOccupancy: .68,
  design: {
    silhouette: '偏长弯曲、肩部饱满而末端带小喙的整芒果，前方一小片六块宽果肉的弯曲果颊',
    angle: '整果斜立在左后，切开的果颊朝前上方，形成紧凑的高低错位',
    material: '成熟橙黄与珊瑚红渐变果皮、金黄果肉和一点亮奶金反光，清楚细深棕描边',
    identity: '橙红不对称长果身与六块相连的大果肉瓣，区别柠檬的黄色椭圆和柑橘扇区',
    container: '整果与一片小果颊裸放，透明背景，无盘无装饰叶',
  },
  reason: '从果形与切面重新设计芒果，以偏长弯曲的橙红成熟果和少量金黄果肉瓣拉开与柠檬的轮廓、色相和内部结构差异，四级保持约68%体量。',
};

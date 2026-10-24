// The 33 newly drawn B masters. Existing approved samples are deliberately excluded.
// All visible artwork is native editable SVG geometry; no raster or external assets.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, 'masters');
const ink = '#795438';
const gradients = {
  pork: '<linearGradient id="pork" x1=".12" y1="0" x2=".8" y2="1"><stop stop-color="#f7baa2"/><stop offset=".5" stop-color="#eb987e"/><stop offset="1" stop-color="#d77b68"/></linearGradient>',
  red: '<linearGradient id="red" x1=".12" y1="0" x2=".8" y2="1"><stop stop-color="#ed9d85"/><stop offset=".52" stop-color="#d77c69"/><stop offset="1" stop-color="#bd5f53"/></linearGradient>',
  fat: '<linearGradient id="fat" x1=".1" y1="0" x2=".85" y2="1"><stop stop-color="#fff6dc"/><stop offset="1" stop-color="#eed5b1"/></linearGradient>',
  bone: '<linearGradient id="bone" x1=".12" y1="0" x2=".8" y2="1"><stop stop-color="#fff9e4"/><stop offset="1" stop-color="#e3caa3"/></linearGradient>',
  chicken: '<linearGradient id="chicken" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#ffdfba"/><stop offset=".55" stop-color="#f3bb94"/><stop offset="1" stop-color="#df9c77"/></linearGradient>',
  gizzard: '<linearGradient id="gizzard" x1=".1" y1="0" x2=".8" y2="1"><stop stop-color="#d99783"/><stop offset=".55" stop-color="#ba7767"/><stop offset="1" stop-color="#9b5b51"/></linearGradient>',
  green: '<linearGradient id="green" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#b3cc74"/><stop offset=".5" stop-color="#89ad58"/><stop offset="1" stop-color="#628c47"/></linearGradient>',
  darkGreen: '<linearGradient id="darkGreen" x1=".1" y1="0" x2=".9" y2="1"><stop stop-color="#8eb96a"/><stop offset="1" stop-color="#557e44"/></linearGradient>',
  onion: '<linearGradient id="onion" x1=".12" y1="0" x2=".85" y2="1"><stop stop-color="#d1a7c3"/><stop offset=".48" stop-color="#b980a7"/><stop offset="1" stop-color="#946184"/></linearGradient>',
  garlic: '<linearGradient id="garlic" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#fff9df"/><stop offset=".6" stop-color="#f5e5bd"/><stop offset="1" stop-color="#dbc99f"/></linearGradient>',
  vanilla: '<linearGradient id="vanilla" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b4875d"/><stop offset="1" stop-color="#795138"/></linearGradient>',
  cinnamon: '<linearGradient id="cinnamon" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#d9a66f"/><stop offset=".5" stop-color="#bc8855"/><stop offset="1" stop-color="#a56e45"/></linearGradient>',
  bowl: '<linearGradient id="bowl" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#fff8de"/><stop offset=".65" stop-color="#f4e8c5"/><stop offset="1" stop-color="#d9c49a"/></linearGradient>',
  tomato: '<linearGradient id="tomato" x1=".05" y1="0" x2=".9" y2="1"><stop stop-color="#f7aa77"/><stop offset=".5" stop-color="#e98159"/><stop offset="1" stop-color="#cf654a"/></linearGradient>',
  egg: '<linearGradient id="egg" x1=".1" y1="0" x2=".8" y2="1"><stop stop-color="#ffeaae"/><stop offset=".55" stop-color="#f3cd72"/><stop offset="1" stop-color="#dfab52"/></linearGradient>',
  rice: '<linearGradient id="rice" x1=".1" y1="0" x2=".85" y2="1"><stop stop-color="#fff9db"/><stop offset=".5" stop-color="#f6e6b1"/><stop offset="1" stop-color="#e5cd94"/></linearGradient>',
  roast: '<linearGradient id="roast" x1=".12" y1="0" x2=".85" y2="1"><stop stop-color="#e7b583"/><stop offset=".5" stop-color="#cb905f"/><stop offset="1" stop-color="#ae704b"/></linearGradient>',
  glaze: '<linearGradient id="glaze" x1=".1" y1="0" x2=".9" y2="1"><stop stop-color="#e7ab70"/><stop offset=".52" stop-color="#c4854f"/><stop offset="1" stop-color="#a96841"/></linearGradient>',
  wood: '<linearGradient id="wood" x1=".05" y1="0" x2=".85" y2="1"><stop stop-color="#e9ca93"/><stop offset=".5" stop-color="#d8b27a"/><stop offset="1" stop-color="#c59b65"/></linearGradient>',
  enamel: '<linearGradient id="enamel" x1=".1" y1="0" x2=".85" y2="1"><stop stop-color="#c4d3a1"/><stop offset=".55" stop-color="#a7bd88"/><stop offset="1" stop-color="#819d6d"/></linearGradient>',
};
const p = (d, fill = 'none', rest = '') => `<path d="${d}" fill="${fill}"${rest ? ` ${rest}` : ''}/>`;
const e = (cx, cy, rx, ry, fill, rest = '') => p(`M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`, fill, rest);
const line = (d, color = ink, width = 1.7) => p(d, 'none', `stroke="${color}" stroke-width="${width}"`);
const light = (d, width = 3.5) => line(d, '#ffe7bd', width);
const plate = () => `${e(48, 61, 39, 22, '#dfc7a1')}${e(48, 56, 39, 23, 'url(#bowl)')}${e(48, 55, 32, 17, '#f5e7c1', 'stroke="#d9bd92" stroke-width="1.5"')}${line('M17 54q1-7 11-11', '#fffcef', 2.6)}`;
const leaf = (d, vein) => `${p(d, 'url(#green)')}${line(vein, '#5d8646', 1.7)}`;
const dish = (body) => `${plate()}${body}`;
const arts = [];
const add = (id, name, body) => arts.push({ id, name, body });

// Pork belly: thick, clear alternating fat and lean cut face.
add('fresh-beast-4', '五花肉', [
  p('M16 31 66 16q5-1 9 3l9 11-5 37q-1 6-6 8L25 86q-5 1-7-4l-7-27Z', 'url(#pork)'),
  p('m16 31 50-15q5-1 9 3l9 11-50 16Z', 'url(#fat)'),
  p('m11 43 7 14q2 4 7 3l54-16-1 9-50 16q-5 2-8-3l-7-12Z', '#fff0d1', 'stroke="none"'),
  p('m15 64 6 13q2 4 7 3l49-15-1 7-48 14q-6 1-9-4Z', '#fff0d1', 'stroke="none"'),
  line('m34 46-1 31m46-45-1 34', '#bd7262', 1.7),
  light('m23 32 39-11', 3.1),
  line('m23 49 7-2m12-2 9-3m-16 23 12-4m12-3 10-3', '#f8c7ad', 2.5),
].join(''));

// Ribs: three individually capped bones emerging from a connected rack.
add('fresh-beast-5', '排骨', [
  p('M29 44 20 23q-7 1-8-5-1-6 5-7 4-1 6 4 5-4 9 0 4 5-2 9l9 20Z', 'url(#bone)'),
  p('m45 37-4-17q-6-1-6-6 0-6 5-6 4 0 5 4 5-2 8 2 2 5-3 8l5 18Z', 'url(#bone)'),
  p('m63 38 1-15q-6-2-4-7 2-6 7-3 3 1 3 5 6 0 7 5 0 5-5 6l-1 15Z', 'url(#bone)'),
  p('M22 41q9-12 22-9 9-6 18 2 9-2 14 6l9 27q2 9-7 12L40 88q-8 0-12-8L16 57q-3-9 6-16Z', 'url(#pork)'),
  p('M24 45q7-10 18-6 9-6 18 1 8-1 12 6l6 19q-10-6-16 0-8-7-16 0-8-3-15 1Z', '#f5c6a8', 'stroke="none"'),
  line('m30 45 12 27m6-32 11 29m7-25 9 24', '#bf7865', 2.5),
  p('m26 72 13 8 39-10 2 6-40 11Z', '#fff0cd', 'stroke="none"'),
  light('m25 48 5 12m17-19 3 8m15-1 3 8', 3.4),
].join(''));

// Pork chop: softly angular fat rim and a short pear-shaped bone.
add('fresh-beast-6', '猪排', [
  p('M49 12c13-1 21 9 27 20 6 10 13 18 10 29-3 15-20 23-37 23-20 0-35-9-37-24-2-13 6-20 12-26 9-9 10-21 25-22Z', 'url(#fat)'),
  p('M50 20c11-1 17 8 22 18 5 10 11 17 7 26-5 10-16 14-30 14-16 0-28-6-30-17-2-10 7-16 13-24 6-8 7-16 18-17Z', 'url(#pork)'),
  p('M52 27q8-1 9 6l-1 12q0 5 5 9 6 5 2 10-5 6-12 2-9-5-12-13-2-8 4-13l-1-7q-1-5 6-6Z', 'url(#bone)'),
  e(54, 33, 3, 3.2, '#d3b490', 'stroke="none"'),
  line('M29 57q5-11 14-15m-11 27q7-7 16-8m19-20 5 9', '#cb806a', 1.8),
  light('M37 33q4-7 10-8m-24 29q-3 7 1 12', 3.6),
  line('M39 75q12 4 23-1', '#c47763', 2),
].join(''));

// Hock: irregular round muscle, skin band, and pronounced joint bone.
add('fresh-beast-7', '带骨肘子', [
  p('m65 39 9-13q-3-6 2-10 5-4 9 1 4 4 0 8 6 4 2 9-4 4-9 0l-8 12Z', 'url(#bone)'),
  p('M32 23c12-4 27 0 34 10 8 12 15 14 16 25 1 17-17 28-36 29-18 1-34-9-35-24-2-16 8-22 11-29 2-5 4-9 10-11Z', 'url(#pork)'),
  p('M28 28q13-4 24 3-8 10-9 21-2 18-17 19-12-2-12-11 0-11 8-20Z', '#f5c5a4', 'stroke="none"'),
  p('M52 30q17 5 22 22 3 9-6 17-11 10-25 8 13-6 15-17 2-12-6-18Z', '#d78066', 'stroke="none"'),
  line('M54 39c-6 8-4 17 4 21m-30 6q11-4 12-15m-10 23q12 6 21 2', '#b46b56', 2.2),
  p('M23 27q11-7 23-3l8 5q-14-3-25 4Z', 'url(#fat)'),
  light('M25 41q-7 8-6 15m18-26 6 1', 4),
  line('m67 74 5-4', '#f8c9a4', 3),
].join(''));

// T-bone steak: broad silhouette and a continuous T-shaped cream bone.
add('fresh-beast-8', '带骨牛排', [
  p('M34 12q12-5 25 2 9-2 18 7 11 12 8 29 7 13-3 23-12 14-30 11-15 7-30-6C9 67 7 54 13 42c1-14 8-25 21-30Z', 'url(#fat)'),
  p('M34 19q13-4 24 2 10-2 16 7 8 11 4 23 7 12-2 19-10 10-25 7-14 6-25-4-13-10-8-27 0-17 16-27Z', 'url(#red)'),
  p('m30 30 11-4 12 16 15-7 4 7-15 8 12 20-8 5-13-21-20 8-3-8 18-9Z', 'url(#bone)'),
  line('M28 39q-8 7-6 16m13 15q-9-3-10-9m35-34 6 3m3 30 4 6', '#f4b7a0', 2),
  line('m33 22 5 3m31 20 5-2m-38 18-7 4', '#b96b5b', 1.7),
  light('M24 34q2-9 10-10m22-1 7 2', 3.6),
].join(''));

// Lamb rack: three long narrow bones and separate little cut eyes.
add('fresh-beast-9', '羊排', [
  p('m32 45-5-24q-5 0-6-4-1-5 4-6 4-1 6 3 5-1 6 4 1 4-4 5l6 23Z', 'url(#bone)'),
  p('m48 40 1-25q-5-2-4-6 1-4 6-3 3 0 4 4 5 1 5 5-1 4-6 4l1 24Z', 'url(#bone)'),
  p('m65 47 6-23q-4-3-2-7 3-4 7-1 3 2 2 5 5 2 3 6-2 5-7 3l-5 23Z', 'url(#bone)'),
  p('M23 44q6-9 16-5 7-9 17-2 10-2 17 8l9 20q3 8-4 12-13 10-28 10-20-1-33-11-5-4-2-12Z', 'url(#fat)'),
  p('M25 49q5-8 14-3 8-9 16-2 10-3 15 6l7 15q2 6-5 10-12 6-23 6-15-2-25-8-5-3-3-9Z', 'url(#red)'),
  line('M39 47q-5 11 1 30m15-32q-4 14 4 32', '#edb29b', 3.1),
  light('M25 57q1-6 6-8m15-1 4-1m13 5 4 4', 3.4),
  line('M27 70q4 4 10 4m9 1 5 1m11-4 5-2', '#b76a58', 1.7),
].join(''));

// Ham: unmistakable round cut face with a small marrow circle and a short shank.
add('fresh-beast-10', '火腿', [
  p('m29 34-9-10q-7 2-9-3-3-6 3-8 4-1 7 3 3-4 8-2 5 3 1 9l8 10Z', 'url(#bone)'),
  p('M34 27c16-12 38-4 47 11 11 17 8 33-9 42-15 8-35 6-44-6-7-9-6-23-2-32Z', 'url(#pork)'),
  p('M37 28q15-10 29-2 12 7 14 17l-9 20-33-7-9-14Z', '#c97f5b', 'stroke="none"'),
  line('m40 30 6 9m8-13 7 12m7-7 6 10', '#f5bf8b', 2.6),
  e(47, 61, 28, 24, 'url(#fat)'),
  e(47, 61, 22, 18.5, 'url(#red)'),
  p('M47 48q8-2 11 3 1 6-4 8l-2 8q-3 5-8 2-4-2-1-6l-5-5q-3-5 2-8Z', 'url(#bone)'),
  e(48, 55, 3.3, 2.7, '#d5ad8d', 'stroke="none"'),
  light('M29 56q4-8 12-9m-5-15 5-2', 3.5),
  line('M59 70q-6 6-14 5', '#b76b59', 1.8),
].join(''));

// Three different gizzard lobes; the pale centers distinguish these from meatballs.
add('fresh-poultry-2', '鸡胗', [
  p('M20 25q8-10 19-2 10 9 7 19-4 10-17 9-16-2-17-11-1-9 8-15Z', 'url(#gizzard)'),
  p('M57 19q13-7 21 4 9 10 5 20-6 9-18 4-12-1-13-12-1-9 5-16Z', 'url(#gizzard)'),
  p('M29 49q12-11 24-1 10-6 19 4 11 15 0 26-12 12-29 6-14-3-16-16-1-11 2-19Z', 'url(#gizzard)'),
  p('M31 25q-3 10 3 17l7-2q-6-9-3-14Z', '#f1cdad', 'stroke="none"'),
  p('M62 23q-1 10 9 18l6-3q-10-7-10-15Z', '#f1cdad', 'stroke="none"'),
  p('M45 51q-4 12 7 25l8-4q-10-10-9-22Z', '#f1cdad', 'stroke="none"'),
  light('M19 31q3-5 7-5m32 2 2-2m-25 32q2-5 6-6', 3.5),
  line('M24 44q4 3 9 1m34-1 6 1M37 72q2 6 7 7', '#90574a', 1.8),
].join(''));

// Wingettes: two parallel tapered parts, with paired joint ends.
add('fresh-poultry-3', '鸡翅中', [
  p('M52 19q2-7 8-5 3 1 4 4 4-2 7 1 4 4 0 8l-8 7-14-5Z', 'url(#bone)'),
  p('M52 25q13-1 17 11 3 10-6 18L42 72q-11 8-18 1-7-6 0-15l19-23q3-7 9-10Z', 'url(#chicken)'),
  p('M66 40q3-7 8-5 3 1 4 4 4-1 6 2 2 5-2 7l-7 6-12-5Z', 'url(#bone)'),
  p('M65 47q12 0 14 11 1 8-7 14L47 87q-9 5-14-2-6-8 2-15l22-17q3-5 8-6Z', 'url(#chicken)'),
  line('M51 34 31 64m36-8L43 77', '#d79370', 2.2),
  light('M48 34 30 57m31-1L40 72', 3.6),
  line('M35 68q3-5 7-4m8 14 7-5', '#ffe4be', 2.1),
].join(''));

// Breast: one broad asymmetric taper, long soft muscle lines.
add('fresh-poultry-4', '鸡胸肉', [
  p('M27 22c11-10 28-11 39-1 11 9 15 23 20 41 2 9-1 15-11 16-10 2-17 7-31 8-17 0-30-10-32-23-3-16 6-32 15-41Z', 'url(#chicken)'),
  p('M29 25q16-12 29-3c10 8 12 22 23 42-10-5-17-7-25-6-15-1-25-10-27-33Z', '#f9cfa9', 'stroke="none"'),
  line('M32 29q-3 19 21 28M24 39q0 22 23 30m-26-16q2 20 21 24m11-48q5 17 17 28', '#dc9d79', 1.8),
  light('M27 32q6-10 15-10m-24 25q-3 10-1 15', 3.8),
  line('M61 77q9-4 16-4', '#cb8969', 1.9),
].join(''));

// Drumstick: joint at upper right; bulb at lower left.
add('fresh-poultry-5', '鸡腿', [
  p('m58 36 13-14q-4-7 1-11 5-4 9 1 1 2 1 5 6-1 8 5 2 6-5 9l-5-1-12 15Z', 'url(#bone)'),
  p('M33 30q14-4 24 5 11 3 12 13 0 9-11 16-6 17-21 21-15 4-24-8C3 62 14 35 33 30Z', 'url(#chicken)'),
  p('M17 51q6-16 19-16 12 0 16 9c-15-3-22 7-22 20-8 7-15 3-13-13Z', '#fbd6b0', 'stroke="none"'),
  light('M20 53q3-12 14-14m16 2 5 3', 4),
  line('M54 50q-10 1-14 12m-8 16q10-2 15-10', '#d38f6c', 2.2),
  line('m67 36 6-7', '#fffbea', 2.5),
].join(''));

// Whole wing: distinctly folded three-segment silhouette.
add('fresh-poultry-6', '鸡全翅', [
  p('M17 58c-7-8-4-19 6-22 11-4 16 3 18 10l7 14 12-24q6-12 17-10 11 2 9 10-2 7-11 9L62 72q-5 11-15 11-8-1-14-9Z', 'url(#chicken)'),
  p('M68 30q2-9 9-13l10-8-4 14-6 8Z', 'url(#fat)'),
  p('M21 40q8-3 13 7l13 23 7-3q-3 12-11 9-5-2-11-13L20 52Z', '#fbd1aa', 'stroke="none"'),
  line('M25 45q4 0 7 8l10 18m12-3 12-26q4-9 10-9', '#d49571', 2.1),
  light('M18 46q0-5 6-6m34 16 9-17', 3.6),
  e(48, 72, 4.7, 4.1, '#e7ac84', 'stroke="#cf906b" stroke-width="1.4"'),
].join(''));

// Whole chicken: compact plump body, two tucked wings, and two lower drumsticks.
add('fresh-poultry-7', '整鸡', [
  p('M26 35q-12 2-14 15-2 13 10 18l13-13Z', 'url(#chicken)'),
  p('M70 35q12 2 14 15 2 13-10 18L61 55Z', 'url(#chicken)'),
  p('M37 14q11-5 22 0l-1 14H38Z', 'url(#chicken)'),
  p('M48 21c18 0 29 17 28 35-1 20-13 29-28 29S21 76 20 56c-1-18 10-35 28-35Z', 'url(#chicken)'),
  p('M36 30q10-7 18-1c-12 7-17 22-16 35-12 2-17-12-11-24Z', '#fbd7b2', 'stroke="none"'),
  p('M28 62q12-2 14 9 3 10-6 13l-13-3-2-9q0-6 7-10Z', 'url(#chicken)'),
  p('M68 62q-12-2-14 9-3 10 6 13l13-3 2-9q0-6-7-10Z', 'url(#chicken)'),
  p('m24 78-5 4q-4-1-4 3 0 4 4 3 3 3 6 0l4-5Z', 'url(#bone)'),
  p('m72 78 5 4q4-1 4 3 0 4-4 3-3 3-6 0l-4-5Z', 'url(#bone)'),
  line('M48 36q-4 13 0 27m-28-19q-5 7-1 13m57-13q5 7 1 13', '#d59a76', 1.8),
  light('M31 38q3-7 10-10m-15 41 6-2', 3.6),
].join(''));

// Scallion bundle: long leafy blades, cream bulbs, and a subtle straw tie.
add('fresh-spice-2', '香葱', [
  p('M50 62C27 48 15 30 13 11c13 14 20 25 44 44Z', 'url(#darkGreen)'),
  p('M55 60C39 44 32 23 35 9c8 17 13 27 27 46Z', 'url(#green)'),
  p('M61 60C53 41 54 25 64 12c-2 17-1 25 5 42Z', 'url(#darkGreen)'),
  p('M52 61C31 56 14 47 9 33c15 6 28 12 48 20Z', 'url(#green)'),
  p('m47 53 9-7q10 11 16 16l-1 8-7 3q-9-8-17-20Z', 'url(#garlic)'),
  p('m56 52 9-6q8 15 17 22l-1 9-8 1Q62 69 56 52Z', 'url(#garlic)'),
  p('m46 56 8-7q5 10 14 18l-1 10-7 1Q48 69 46 56Z', 'url(#garlic)'),
  line('m62 77 3 8m2-7 6 6m4-5 3 7m1-8 8 5m-21-5 1 7', '#b49770', 1.5),
  p('m43 51 17-11 4 7-16 11Z', '#dbba78'),
  light('M20 23q10 17 24 27m-7-27q4 15 11 23', 2.5),
].join(''));

// Whole purple onion and one cut half, with concentric cut-face rings.
add('fresh-spice-3', '紫洋葱', [
  p('m41 28-3-15 5-4 4 11 8-10 5 3-7 17Z', '#a5b777'),
  p('M44 25c12-4 31 15 31 31 1 17-12 27-29 27-16 0-29-11-28-26 1-15 13-23 26-32Z', 'url(#onion)'),
  line('M43 32c-15 17-15 30-8 41m14-42c10 17 14 30 10 43', '#986084', 2),
  light('M32 42q-6 7-6 15', 4),
  p('M54 49q12-14 28-7l5 26q-7 18-27 18L44 69Z', 'url(#onion)'),
  p('M54 49q13-13 28-7c3 13-5 27-19 30q-12-2-16-9Z', '#f4e6d9'),
  p('M58 51q9-9 20-6c1 10-5 19-15 22q-7-1-11-6Z', '#d0a2bd', 'stroke="#b783a5" stroke-width="1.7"'),
  p('M62 52q6-5 12-4c-1 7-4 11-10 14l-7-3Z', '#f5e4dc', 'stroke="#b783a5" stroke-width="1.7"'),
  line('m40 82-4 5m7-4-1 6m5-6 3 5', '#a38268', 1.5),
].join(''));

// Vanilla: two curved pods with a pale five-petal vanilla blossom.
add('fresh-spice-4', '香草荚', [
  p('M19 20c9 12 13 30 25 42 9 10 21 15 34 17l6 4c-19 2-36-5-49-18C20 51 15 31 15 17Z', 'url(#vanilla)'),
  p('M23 79c17-6 28-20 35-38 4-11 10-20 18-25l6-1c-10 11-15 21-20 35-6 16-19 30-36 34l-8-1Z', 'url(#vanilla)'),
  line('M22 30c6 20 17 38 41 46M29 79c17-8 24-21 31-37', '#e3b783', 2.1),
  p('M47 27c-10-1-14-8-10-12 5-4 12 1 14 8 4-10 12-13 15-7 3 6-4 12-12 12 9 2 14 9 9 13-6 4-12-2-12-10-2 10-10 14-14 9-5-5 1-12 10-13Z', 'url(#garlic)'),
  p('M48 25q5-6 9 0 2 5-5 10-7-5-4-10Z', 'url(#egg)', 'stroke-width="1.7"'),
  line('m20 20 3 8m54-9-4 5', '#f4d0a2', 2.4),
].join(''));

// Garlic: full segmented bulb and one curved peeled clove.
add('fresh-spice-5', '大蒜', [
  p('M40 33q-1-11 4-23l10 1q-3 12 1 22c12 4 23 16 23 28-1 15-14 23-33 23S13 76 13 62c0-14 12-25 27-29Z', 'url(#garlic)'),
  p('M44 31q-11 11-12 29 0 17 13 22M51 32q13 10 15 26 1 17-13 25', 'none', 'stroke="#c9b58f" stroke-width="1.8"'),
  line('M46 35q-6 22 0 42m4-65-3 14', '#d3c29b', 1.6),
  light('M30 43q-8 8-9 17m18-21-3 8', 3.5),
  p('M69 56q9 0 15-8c3 15 3 28-6 35q-6 5-13 0-8-6-3-16Z', 'url(#garlic)'),
  line('M79 57q0 13-9 21', '#d5c29b', 1.6),
  light('M68 65q3-5 7-7', 2.8),
  line('m38 84-3 3m9-3-1 5m7-5 2 4m7-5 3 3', '#b99d77', 1.5),
].join(''));

// Basil: deliberately broad, cupped leaves with readable midribs.
add('fresh-spice-6', '罗勒', [
  line('M39 86q13-26 18-59', '#795438', 4.6),
  line('M39 85q13-26 18-59', '#8aa75b', 2.4),
  leaf('M52 45C33 43 25 28 29 12c19 2 32 13 23 33Z', 'M50 41 34 19m10 13-8-1'),
  leaf('M57 42c-5-16 5-29 23-31 5 17-2 29-23 31Z', 'M60 37 76 17m-9 12 7-1'),
  leaf('M46 65C27 69 13 57 10 40c19-4 34 5 36 25Z', 'M41 61 16 46m16 11-10 1'),
  leaf('M50 63C51 45 66 37 84 43c-1 19-14 27-34 20Z', 'M55 60 78 47m-14 9 9 2'),
  leaf('M40 79C24 82 17 72 16 61c13-2 23 4 24 18Z', 'M36 75 22 66'),
  leaf('M45 79C48 65 59 61 72 66c-3 13-12 19-27 13Z', 'M50 76 66 69'),
  light('M34 19q0 7 5 12M16 45q3 8 10 11m39-33 5-4', 2.8),
].join(''));

// Cinnamon: three hollow bark curls, with visible warm cream inner spirals.
add('fresh-spice-7', '肉桂', [
  p('M29 12q8-3 14 3l28 49-15 14-33-51q-5-11 6-15Z', 'url(#cinnamon)'),
  e(62, 72, 10, 7.5, '#d9ab77', 'transform="rotate(-32 62 72)"'),
  p('M56 74q-2-7 5-9 6-2 8 4 1 5-4 6-4 1-4-3l3-2', 'none', 'stroke="#8c5c3e" stroke-width="1.9"'),
  p('M15 34q4-7 12-4l47 29-7 16L18 48q-9-5-3-14Z', 'url(#cinnamon)'),
  e(70, 67, 8.5, 10, '#ddb17e', 'transform="rotate(-55 70 67)"'),
  p('M66 71q-5-5-1-10 5-5 10 0 3 5-2 7-4 2-4-2l2-2', 'none', 'stroke="#8c5c3e" stroke-width="1.9"'),
  p('M21 66q-3-7 5-10l49-18q9-3 12 4 4 8-5 12L32 75q-8 3-11-9Z', 'url(#cinnamon)'),
  e(27, 66, 7.5, 10, '#e2b985', 'transform="rotate(-20 27 66)"'),
  p('M28 71q-7-1-7-7 0-6 6-6 7 1 5 7-1 4-5 2l-1-3', 'none', 'stroke="#8c5c3e" stroke-width="1.9"'),
  light('m31 18 20 35m-29-19 28 16m-10 9 33-12', 2.4),
  line('m37 29 5 9m-8 6 9 5m11 13 11-5', '#9d6a45', 1.5),
].join(''));

// Ten dishes share one low, cream ceramic service and the same camera angle.
add('dish-fresh-home-onion-salad', '凉拌紫洋葱', dish([
  leaf('M24 60q-12-8-9-20 15 0 20 11Z', 'm20 46 9 11'),
  leaf('M65 58q3-15 17-15 4 14-11 20Z', 'm69 57 8-9'),
  e(46, 47, 18, 12, '#d3a8c5', 'transform="rotate(-18 46 47)"'),
  e(46, 47, 11, 6.5, '#f4e5d2', 'stroke="#b17c9e" stroke-width="1.8" transform="rotate(-18 46 47)"'),
  p('M22 54c-6 11 8 23 24 19 12-3 19-14 10-21l-6 4c6 5 0 11-8 12-10 1-17-4-13-11Z', '#cc9cbd'),
  p('M48 52c3-13 24-17 31-6 8 11-8 25-23 21l1-6c10 1 19-7 16-12-4-6-16-2-18 5Z', '#bf89ae'),
  line('M26 55q-6 10 14 15m15-19q3-9 13-8', '#f8deec', 2.3),
  p('m35 39 4-5 8 5-4 5Z', '#e89563', 'stroke-width="1.5"'),
  line('m39 57 6-3m11 16 6-2m-5-28 5-2', '#83a35d', 3.5),
].join('')));

add('dish-fresh-home-tomato-eggs', '番茄炒蛋', dish([
  p('M18 48q8-16 24-12l-2 18q-11 9-22-6Z', 'url(#tomato)'),
  p('M23 45q6-7 13-5l-2 9q-7 2-11-4Z', '#fbc58a', 'stroke="none"'),
  p('M55 35q16-3 25 11-8 15-25 9Z', 'url(#tomato)'),
  p('M60 40q10 0 15 7-5 5-14 4Z', '#fbc58a', 'stroke="none"'),
  p('M30 45q4-9 12-4 6-8 13-2 8-2 10 7 7 4 2 12-10 2-19-2-11 6-19 0Z', 'url(#egg)'),
  p('M19 60q6-9 14-2 8-6 14 3 4 5-3 12-6-2-11 0-11 1-14-7Z', 'url(#egg)'),
  p('M59 59q8-7 16-2 9 4 5 11-12 8-24 5l-7-8Z', 'url(#tomato)'),
  line('m35 47 8 3 8-5m-27 18 6 4m36-7 7 2', '#fff1bc', 3),
  line('m47 64 6 4m-21-27 5 3m30 7 5 1', '#88a85e', 3),
  line('m28 45 3 1m35 1 4 1', '#ffe3ac', 1.8),
].join('')));

add('dish-fresh-home-meatball-soup', '肉丸蔬菜汤', [
  p('M11 45q-8-2-8 5 0 6 11 6m68-11q10-2 10 5 0 6-12 7', 'url(#bowl)'),
  p('M11 46c2 26 15 39 37 39s35-13 37-39Z', 'url(#bowl)'),
  e(48, 45, 37, 22, '#fff6d8'),
  e(48, 45, 31.5, 16.5, '#dcb174', 'stroke="#c29b6b" stroke-width="1.5"'),
  e(30, 42, 11, 10, 'url(#roast)'),
  e(58, 36, 12, 11, 'url(#roast)'),
  e(55, 52, 12, 10.5, 'url(#roast)'),
  light('M23 39q2-4 6-4m23-3 5-2m-9 19 4-3', 2.5),
  line('m32 45 4 1m24-6 4 1m-6 17 4 1', '#a86a47', 1.5),
  p('m18 48 7 2 2 7-7-1Z', 'url(#tomato)', 'stroke-width="1.3"'),
  p('m69 42 9-3 2 6-9 4Z', 'url(#tomato)', 'stroke-width="1.3"'),
  leaf('M34 55q-5-8 3-13 9 4 5 12Z', 'm37 52 1-5'),
  leaf('M67 57q-2-9 8-10 5 9-8 10Z', 'm69 54 4-3'),
  line('M23 66q7 10 18 11', '#fffced', 3),
  line('M27 18q-4-4 0-8m19 8q-4-4 0-8m19 9q-4-4 0-8', '#d3b88f', 2.2),
].join(''));

add('dish-fresh-home-garlic-broccoli', '蒜香西兰花', dish([
  p('m34 43 4 25 11 4 5-6-9-11 1-13Z', '#bbcc8a'),
  p('m62 46-8 18 11 8 7-5-6-9 7-10Z', '#bbcc8a'),
  p('m24 53 4 14 11 2 3-6-9-6-1-8Z', '#bfd094'),
  p('M19 45q-4-10 5-13 1-12 12-11 10-6 16 2 13-1 14 9 10 6 3 15-5 6-13 3-9 6-17 0-12 5-20-5Z', 'url(#darkGreen)'),
  p('M48 54q-4-9 4-13-1-9 8-10 7-4 13 2 10-1 10 8 6 7-1 13-7 3-12 0-12 6-22 0Z', 'url(#green)'),
  p('M14 58q-4-7 3-12 1-8 8-7 8-4 13 4 10 2 8 10 1 9-10 9-7 5-13-1-6 3-9-3Z', 'url(#green)'),
  line('M28 30q4-5 9-2m7 3q4-5 8-2m7 12 5-2M22 48q4-4 8-1', '#b7d184', 2.7),
  p('M43 59q7-5 12-3-1 11-10 11-5-2-2-8Z', 'url(#garlic)', 'stroke-width="1.5"'),
  p('M67 66q7-5 12-2-3 10-10 9-5-1-2-7Z', 'url(#garlic)', 'stroke-width="1.5"'),
].join('')));

const riceMound = (color = 'url(#rice)') => p('M21 60c-1-16 11-30 28-31 17 0 29 13 29 29 0 9-14 15-29 15S22 68 21 60Z', color);
const riceMarks = () => line('m29 51 4-2m8-10 4-1m13 0 4 1m7 9 4 2m-39 9 4 2m11-8 4 1m6 10 4-1m-18 5 4 1', '#d2b786', 1.7);
add('dish-fresh-home-vegetable-rice', '彩蔬拌饭', dish([
  riceMound(), riceMarks(),
  p('m30 43 8-3 5 6-7 5-6-2Z', 'url(#tomato)', 'stroke-width="1.5"'),
  p('m54 34 8 2 1 7-8 2-3-5Z', 'url(#egg)', 'stroke-width="1.5"'),
  p('m57 54 10-3 5 6-7 5-7-1Z', 'url(#tomato)', 'stroke-width="1.5"'),
  p('m34 60 7-4 6 5-3 6-9-1Z', 'url(#egg)', 'stroke-width="1.5"'),
  e(48, 45, 4, 3.5, 'url(#green)', 'stroke-width="1.5"'),
  e(26, 59, 3.5, 3, 'url(#green)', 'stroke-width="1.5"'),
  e(57, 65, 3.5, 3, 'url(#green)', 'stroke-width="1.5"'),
  e(71, 48, 3, 3, 'url(#green)', 'stroke-width="1.5"'),
  line('m46 57 4-2m16 14 5-2', '#82a25d', 3),
  light('m30 36 6-2m11-1 6-1', 2.5),
].join('')));

add('dish-fresh-home-scallion-egg-rice', '葱香蛋饭', dish([
  riceMound('url(#egg)'),
  p('M28 42q3-8 12-4 4-7 12-1 8-3 11 4l-7 8-15 2-10-3Z', '#ffe8a1', 'stroke="#caa268" stroke-width="1.7"'),
  p('M24 56q6-7 14-2 8-5 14 1l-1 8-10 5-12-4Z', '#ffe8a1', 'stroke="#caa268" stroke-width="1.7"'),
  p('M59 52q5-7 12-2 8 0 8 8l-8 7-11-2-5-4Z', '#ffe8a1', 'stroke="#caa268" stroke-width="1.7"'),
  line('m33 43 6 2m-10 14 7 2m26-5 6 2m-16 8 5 1', '#fff3c4', 2.6),
  e(32, 50, 4, 2.5, '#81a15a', 'stroke="#62834a" stroke-width="1.2" transform="rotate(-25 32 50)"'),
  e(51, 37, 4, 2.5, '#81a15a', 'stroke="#62834a" stroke-width="1.2" transform="rotate(25 51 37)"'),
  e(55, 55, 4, 2.5, '#81a15a', 'stroke="#62834a" stroke-width="1.2" transform="rotate(-25 55 55)"'),
  e(68, 67, 4, 2.5, '#81a15a', 'stroke="#62834a" stroke-width="1.2"'),
  line('m42 61 4-2m-17-1 4-2m31-14 4 1m-18 25 5-1', '#67904c', 2.7),
].join('')));

add('dish-fresh-home-seared-pork', '香煎肉片', dish([
  leaf('M17 50q-7-10 0-16 12 4 15 13Z', 'm18 40 9 9'),
  p('M27 38q7-8 18-5l23 13q8 6 3 13-5 6-14 2L29 48q-9-4-2-10Z', 'url(#fat)'),
  p('M30 39q6-6 13-2l22 12q5 4 1 8-4 3-10-1L32 46q-5-2-2-7Z', 'url(#roast)', 'stroke="#ad704c" stroke-width="1.6"'),
  p('M20 52q7-8 18-5l25 12q8 5 3 12-5 6-14 2L23 62q-9-4-3-10Z', 'url(#fat)'),
  p('M24 53q6-6 13-2l23 10q5 4 1 8-3 3-10-1L26 60q-5-2-2-7Z', 'url(#roast)', 'stroke="#ad704c" stroke-width="1.6"'),
  line('m39 39-3 6m13-1-4 6m-10 4-3 6m13-2-3 6m14-3-3 5', '#92603f', 2),
  p('M70 43q6-3 11 0-1 10-9 10-6-2-2-10Z', 'url(#garlic)', 'stroke-width="1.5"'),
  leaf('M69 68q2-10 13-10 0 12-13 10Z', 'm72 65 6-4'),
  light('m28 39 5-2m-8 17 5-2', 2.5),
].join('')));

add('dish-fresh-home-garlic-cucumber', '蒜香黄瓜', dish([
  p('m20 43 24-12 13 10-3 12-24 11-13-10Z', 'url(#darkGreen)'),
  p('m20 43 24-12 10 10-24 13Z', '#d9e5a7', 'stroke="#72934e" stroke-width="1.7"'),
  p('m36 52 25-10 13 9-2 13-24 12-14-11Z', 'url(#darkGreen)'),
  p('m36 52 25-10 12 9-25 13Z', '#d9e5a7', 'stroke="#72934e" stroke-width="1.7"'),
  p('m18 62 20-6 11 10-3 9-20 4-10-8Z', 'url(#darkGreen)'),
  p('m18 62 20-6 11 10-23 7Z', '#d9e5a7', 'stroke="#72934e" stroke-width="1.7"'),
  line('m31 43 5-2m6-2 4-2m7 15 5-2m5-2 4-2m-35 16 5-1', '#fff4d2', 2.2),
  p('M65 65q6-5 13-3-1 10-10 11-5-1-3-8Z', 'url(#garlic)', 'stroke-width="1.5"'),
  p('M55 34q5-5 10-3-1 9-8 9-5-1-2-6Z', 'url(#garlic)', 'stroke-width="1.5"'),
  line('m30 58 3 1m28 7 4-2m-15-18 4 1', '#d87a55', 3),
].join('')));

add('dish-fresh-home-chicken-roll', '香煎鸡肉卷', dish([
  leaf('M17 59q-7-10 0-17 12 2 18 12Z', 'm18 47 11 9'),
  p('M34 30q9-4 17 2l24 22-21 21-28-20q-13-14 8-25Z', 'url(#roast)'),
  e(38, 43, 17, 14, 'url(#chicken)', 'transform="rotate(27 38 43)"'),
  p('M30 36q10-7 18 4 5 9-5 13-10 2-12-7-2-6 6-6 7 1 5 7', 'none', 'stroke="#b87b52" stroke-width="2.3"'),
  p('m36 40 7 3-3 7-6-4Z', 'url(#green)', 'stroke-width="1.4"'),
  p('M55 48q11-3 19 6l6 11-19 12-15-12Z', 'url(#roast)'),
  e(62, 63, 17, 13, 'url(#chicken)', 'transform="rotate(27 62 63)"'),
  p('M54 57q10-6 17 4 5 9-5 12-10 2-12-7-1-5 5-5 7 0 5 5', 'none', 'stroke="#b87b52" stroke-width="2.3"'),
  p('m59 61 7 3-3 6-6-4Z', 'url(#green)', 'stroke-width="1.4"'),
  p('m39 45 4 2-2 4-4-2Zm24 21 4 1-1 4-4-2Z', '#e9a06c', 'stroke="none"'),
  light('M27 37q4-5 9-4m15 24 6-3', 2.6),
].join('')));

add('dish-fresh-home-orange-ribs', '橙香小排', dish([
  p('M62 27q17 1 23 16L67 58 55 42Z', 'url(#egg)'),
  p('M65 32q11 2 15 11L67 52 60 42Z', '#f4b865', 'stroke="#e4a358" stroke-width="1.3"'),
  line('m66 34 1 16m-4-9 14 1', '#ffedba', 1.8),
  p('m25 42-7-5q-4 3-6 0-3-4 1-6 3-1 4 2 4-2 6 1l6 5Z', 'url(#bone)', 'stroke-width="1.6"'),
  p('m39 59-8 9q2 4-2 6-5 1-5-3-4 0-5-4 0-4 5-4l8-10Z', 'url(#bone)', 'stroke-width="1.6"'),
  p('m63 63 9 8q4-2 6 1 2 4-2 5-1 5-5 3-3-1-2-5l-12-6Z', 'url(#bone)', 'stroke-width="1.6"'),
  p('M26 32q6-3 12 2l18 12q7 7 0 14-5 5-12 1L24 47q-8-8 2-15Z', 'url(#glaze)'),
  p('M53 40q8-4 14 2l12 12q6 8-2 14-7 5-13-1L49 54q-5-8 4-14Z', 'url(#glaze)'),
  p('M40 54q8-2 13 4l13 13q4 7-4 11-8 2-13-3L34 67q-6-8 6-13Z', 'url(#glaze)'),
  light('m28 36 12 7m14 2 9 6m-21 7 10 8', 3),
  line('m33 46 3 2m27 10 4 3m-16 14 4 3', '#915b3c', 1.8),
  line('m43 35 3-2m-24 21 4-1m48 11 4-2', '#83a15c', 3),
].join('')));

// Four equipment silhouettes. Wheels and handles remain clear at board scale.
const wheel = (cx) => `${e(cx, 81, 7, 7, '#9f8261')}${e(cx, 81, 2.5, 2.5, '#f6e8be', 'stroke-width="1.4"')}`;
add('beast-meat-cart', '兽肉推车', [
  line('M19 68V24m57 45V24', ink, 3.6),
  p('M16 13q31-8 62 0l6 17q-7 7-14 0-8 7-15 0-8 7-15 0-8 7-15 0-7 7-14 0Z', '#fff0ce'),
  p('m26 11 13-2 1 21q-8 7-15 0Zm29-2 13 1 2 20q-8 7-15 0Z', '#a7bb82', 'stroke="none"'),
  line('M11 30q7 7 14 0 7 7 15 0 7 7 15 0 7 7 15 0 7 7 14 0', ink, 2.4),
  p('M13 53h65v24H13Z', 'url(#wood)'),
  p('M18 57h55v15H18Z', '#f9edc9', 'stroke-width="1.7"'),
  p('M10 49h72v8H10Z', 'url(#fat)'),
  p('M24 39q8-10 20-2l4 11H21Z', 'url(#pork)'),
  p('m28 39 7-3 6 5-2 6-12-1Z', '#fff0ce', 'stroke-width="1.5"'),
  p('M55 38q6-5 12 0l7 9H51Z', 'url(#red)'),
  line('m60 40 4 3', '#f7c3a6', 2.3),
  p('M82 54v-9h5', 'none', 'stroke-width="3"'),
  wheel(24), wheel(67),
  e(46, 65, 7.5, 4.5, 'url(#pork)', 'stroke-width="1.6"'),
  line('m42 64 5 3', '#ffe2b8', 1.8),
].join(''));

add('poultry-cart', '禽肉推车', [
  p('M14 34V17q0-5 5-5h52q5 0 5 5v17Z', 'url(#wood)'),
  p('M20 17h50v12H20Z', '#fbefcc', 'stroke-width="1.5"'),
  p('M30 21q3-6 7 0 1 6-4 6-5 0-3-6Zm20 1q3-5 6 0 2 5-3 5-5 0-3-5Z', 'url(#chicken)', 'stroke-width="1.3"'),
  p('M12 40h67v35H12Z', 'url(#enamel)'),
  p('M18 48h55v22H18Z', 'url(#bowl)', 'stroke-width="1.7"'),
  p('M9 35h73v9H9Z', 'url(#wood)'),
  p('M25 31q-3-7 3-12 5-4 9 2 4 6 0 10Z', 'url(#garlic)', 'transform="translate(0 8)" stroke-width="1.5"'),
  p('M39 33q-1-8 5-11 5-1 8 5 2 5-2 9Z', 'url(#garlic)', 'stroke-width="1.5"'),
  p('m60 32 7-6q-2-4 1-5 3-2 5 1 3-1 4 2 1 3-3 4l-7 7Z', 'url(#bone)', 'stroke-width="1.5"'),
  p('M55 29q8-4 13 2 4 6-4 9-9 3-14-1-2-6 5-10Z', 'url(#chicken)', 'stroke-width="1.7"'),
  light('m54 33 5-2', 2),
  line('M79 48h7v20', ink, 3),
  wheel(23), wheel(68),
  p('M37 56q8-5 16 0l-1 8H38Z', '#b4c895', 'stroke-width="1.6"'),
  line('m44 58 2 4m4-5-1 5', '#e9eac5', 1.4),
].join(''));

add('spice-box', '香料盒', [
  p('M13 43V17q0-5 5-5h61q5 0 5 5v26Z', 'url(#wood)'),
  p('M20 20h57v19H20Z', '#f9edca', 'stroke-width="1.7"'),
  p('M37 34q3-11 12-12 9 1 12 12Z', 'url(#enamel)', 'stroke-width="1.7"'),
  line('m48 25 1 7m-6-4 5 4 6-4', '#71905b', 1.5),
  p('M10 44q0-5 5-5h66q5 0 5 5v31q0 6-6 6H16q-6 0-6-6Z', 'url(#wood)'),
  p('M16 46h64v21H16Z', '#fbefd2'),
  p('M17 46h30v20H17Z', '#c6d4a0', 'stroke="none"'),
  p('M49 46h30v20H49Z', '#ecd293', 'stroke="none"'),
  line('M48 45v22M16 56h64', '#b78f5f', 2.2),
  p('M21 52q1-8 7-6 4 1 8 5-10 7-15 1Z', 'url(#tomato)', 'stroke-width="1.4"'),
  p('m24 46-3-3 1-2 5 4', 'none', 'stroke="#719057" stroke-width="1.7"'),
  p('M54 51q1-6 6-7 5 1 7 7-6 5-13 0Z', 'url(#garlic)', 'stroke-width="1.4"'),
  p('M23 63q-3-6 3-7 7 1 9 7-7 4-12 0Z', 'url(#green)', 'stroke-width="1.4"'),
  p('M54 63q2-7 10-6 7 0 10 6Z', 'url(#egg)', 'stroke-width="1.4"'),
  p('M41 70h14v14H41Z', '#ede1b9', 'stroke-width="1.8"'),
  line('M48 74v4', '#ac8c62', 2),
  light('M19 16h34M15 72v4h10', 2.5),
].join(''));

add('home-cooking-pot', '料理锅', [
  p('M20 45q-8-9-13-3-5 8 10 15m59-12q8-9 13-3 5 8-10 15', 'url(#wood)'),
  p('M18 42c0 28 10 42 30 42s30-14 30-42Z', 'url(#enamel)'),
  e(48, 42, 30, 15, 'url(#bowl)'),
  e(48, 42, 24.5, 10.2, '#d5b078', 'stroke="#ad8c60" stroke-width="1.5"'),
  p('m29 40 8-5 7 5-3 6-11-1Z', 'url(#tomato)', 'stroke-width="1.5"'),
  p('m49 38 9-5 8 5-6 7-10-1Z', 'url(#egg)', 'stroke-width="1.5"'),
  leaf('M42 46q-3-9 5-11 8 6-5 11Z', 'm44 43 2-4'),
  leaf('M63 46q0-7 7-8 4 7-7 8Z', 'm65 43 3-2'),
  p('M19 28q1-13 26-16 22-3 33 10Z', 'url(#enamel)'),
  p('M38 14q-2-7 6-8 7 0 8 6Z', 'url(#wood)'),
  line('M20 28 78 22', '#f2e8c5', 3.4),
  light('M30 20q8-4 16-4', 2.5),
  line('M27 56q2 15 10 18', '#dbe3bc', 3.5),
  line('M55 28q-3-4 1-8m11 10q-2-4 2-8', '#d6c49d', 2.1),
].join(''));

// Leave breathing room around the five wide or long silhouettes. These transforms
// retain editable geometry and the original proportions; runtime sizing is separate.
const inset = {
  'dish-fresh-home-meatball-soup': 'translate(7.2 7.1) scale(.86)',
  'fresh-beast-9': 'translate(3.6 5.4) scale(.92)',
  'fresh-poultry-5': 'translate(1.2 3.3) scale(.94)',
  'fresh-poultry-7': 'translate(2 -.4) scale(.96)',
  'home-cooking-pot': 'translate(4.8 7.5) scale(.9)',
};

await mkdir(target, { recursive: true });
for (const { id, name, body } of arts) {
  const used = [...new Set([...body.matchAll(/url\(#([^)]+)\)/g)].map((match) => match[1]))];
  const defs = used.map((key) => gradients[key]).join('');
  if (used.some((key) => !gradients[key])) throw new Error(`Unknown gradient in ${id}`);
  const transform = inset[id] ? ` transform="${inset[id]}"` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">\n  <title>${name} · B 组暖色卡通可编辑母稿</title>\n  <defs>${defs}</defs>\n  <g stroke="${ink}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"${transform}>\n    ${body}\n  </g>\n</svg>\n`;
  await writeFile(join(target, `${id}.svg`), svg, 'utf8');
}
console.log(`Drew ${arts.length} editable 96×96 B masters into ${target}`);

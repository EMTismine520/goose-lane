// Round 15 seafood candidates: independent editable silhouettes, 256px masters.
const ink = '#694536';
const wrap = (defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs>${defs}</defs><g stroke="${ink}" stroke-width="3.1" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;

const fatCrab = wrap(
  `<linearGradient id="fat-shell" x1="0" y1="0" x2="0.25" y2="1"><stop stop-color="#ff9b58"/><stop offset="1" stop-color="#e5573e"/></linearGradient><linearGradient id="fat-claw" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="#ffab62"/><stop offset="1" stop-color="#ee6847"/></linearGradient>`,
  `<!-- The short tucked walking legs keep this crab broad and plump. -->
  <path fill="#ef7a4d" d="M80 122 57 116 41 127 49 140 65 132 84 138Z"/>
  <path fill="#f38b55" d="M76 140 51 137 36 151 46 161 61 152 81 155Z"/>
  <path fill="#e86b47" d="M77 158 53 161 43 179 55 185 67 172 86 171Z"/>
  <path fill="#e9784d" d="M89 173 68 181 63 199 76 203 84 189 101 183Z"/>
  <path fill="#ef7a4d" d="M175 122 198 115 215 126 207 140 190 131 172 138Z"/>
  <path fill="#f38b55" d="M180 139 205 136 220 150 211 161 194 151 176 154Z"/>
  <path fill="#e86b47" d="M178 158 202 161 212 179 201 185 188 171 169 171Z"/>
  <path fill="#e9784d" d="M167 173 188 181 193 198 180 203 172 189 155 183Z"/>
  <g fill="none" stroke="#ffd39a" stroke-width="1.45"><path d="m60 124-12 4m6 18-11 6m17 15-9 10m23 10-4 10M197 124l10 4m-4 18 10 6m-17 15 8 10m-23 10 4 10"/></g>
  <path fill="#e96241" d="M88 120 72 105 66 88 78 80 88 99 103 110Z"/>
  <path fill="#e96241" d="m168 119 16-17 7-17-12-7-10 20-16 12Z"/>
  <!-- Two rounded lobes and one clean opening make the heavy claws readable. -->
  <path fill="url(#fat-claw)" d="M70 101C55 107 39 100 35 87 30 76 35 58 46 51 52 47 58 47 61 51L65 67 75 53C80 50 86 55 88 63 94 78 84 96 70 101Z"/>
  <path fill="url(#fat-claw)" d="M186 100C201 105 217 97 220 83 223 70 216 55 206 50 200 47 194 48 192 53L190 68 179 55C174 53 169 59 168 66 165 80 174 96 186 100Z"/>
  <path fill="none" stroke-width="1.45" d="m65 67 7 10m118-9-6 10"/>
  <path fill="#ffd09a" stroke="none" d="M42 73c2-9 8-15 13-16l3 11c-7 1-11 6-12 12Z M211 72c-2-8-7-14-12-15l-3 11c6 1 10 5 11 10Z"/>
  <path fill="url(#fat-shell)" d="M69 132C69 111 89 97 113 96 121 92 135 92 143 96 168 97 187 111 187 132 187 165 167 188 129 191 91 189 69 167 69 132Z"/>
  <path fill="#ffb374" stroke="none" d="M81 122C91 106 115 101 138 106 151 108 162 112 168 120 149 114 133 114 117 119 99 124 90 129 81 122Z"/>
  <path fill="none" stroke="#ffd4a2" stroke-width="4.7" d="M88 119c8-7 18-10 28-11"/>
  <path fill="#df5a3f" stroke="none" d="M76 144c4 18 14 29 29 36-19-5-29-17-29-36Z"/>`
);

const lobster = wrap(
  `<linearGradient id="lobster-red" x1="0" y1="0" x2=".65" y2="1"><stop stop-color="#ff9c5d"/><stop offset=".5" stop-color="#f36c48"/><stop offset="1" stop-color="#d94f3c"/></linearGradient><linearGradient id="lobster-tail" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffad65"/><stop offset="1" stop-color="#ee6846"/></linearGradient>`,
  `<g transform="rotate(-12 128 128)"><!-- A curved abdomen and offset claws avoid a rigid frontal silhouette. -->
  <path fill="none" stroke-width="2.1" d="M119 78c-4-15-11-24-18-28M136 75c3-17 9-28 17-35"/>
  <path fill="#f38a55" d="m109 106-19-6-12 10 5 7 13-8 16 8Z M109 119l-21-3-13 12 7 7 12-10 18 6Z M116 132l-20 1-13 16 8 5 12-13 19-1Z M124 143l-17 6-9 17 9 3 9-14 16-4Z"/>
  <path fill="#f38a55" d="m143 102 19-7 13 8-5 8-13-6-15 7Z M148 115l21-2 13 13-7 7-13-11-16 4Z M149 129l22 2 13 15-8 6-13-12-17-2Z M153 143l18 8 7 18-9 3-8-15-15-5Z"/>
  <path fill="#e76243" d="M110 101 88 90 73 83 66 94 85 104 108 116Z"/>
  <path fill="#e76243" d="m143 96 14-16 17-16 8 10-14 20-22 17Z"/>
  <path fill="url(#lobster-red)" d="M72 101C54 104 40 92 39 77 37 65 44 49 56 46 61 45 64 49 65 56L65 70 77 53C80 50 85 53 88 60 97 79 89 94 72 101Z"/>
  <path fill="url(#lobster-red)" d="M174 78C187 86 203 77 208 63 214 50 209 34 198 28 192 24 188 28 187 35L184 48 177 32C174 29 168 34 166 41 158 58 162 71 174 78Z"/>
  <path fill="none" stroke-width="1.45" d="m65 70 7 10m112-32-3 12"/>
  <path fill="#ffd2a0" stroke="none" d="M46 68c2-8 6-13 11-14l2 11c-5 1-8 5-9 11Z M199 38c5 3 8 10 6 17l-6-2c1-5-2-9-5-11Z"/>
  <path fill="url(#lobster-red)" d="M110 83C117 72 131 69 141 77 151 87 153 106 150 123L146 139 119 145C109 133 103 116 104 101 104 93 106 87 110 83Z"/>
  <path fill="#ffb579" stroke="none" d="M111 91c5-9 14-12 22-8 4 3 6 8 7 13-11-4-21-2-30 4Z"/>
  <path fill="none" stroke-width="1.45" d="M119 104c2 11 4 22 9 31M111 83l8 3m22-9-4 8"/>
  <path fill="url(#lobster-tail)" d="M118 136C128 131 141 128 150 134L157 148 150 162 129 164 119 154Z"/>
  <path fill="url(#lobster-tail)" d="M126 155C136 150 149 148 157 154L164 169 156 181 136 180 127 170Z"/>
  <path fill="url(#lobster-tail)" d="M136 173C145 168 158 166 165 174L170 187 163 197 147 195 138 187Z"/>
  <path fill="url(#lobster-tail)" d="M148 189c7-5 15-5 21 1l7 13-10 11-15-10Z"/>
  <path fill="none" stroke="#ffc28b" stroke-width="3.5" d="M126 142c7-3 13-4 18-2M135 161c6-3 12-3 16-1M146 178c5-2 8-2 12 0"/>
  <path fill="#f1784d" d="M163 205c-8-6-14-8-21-5-2 8 0 19 7 26l17-7c5 7 12 10 20 9l5-19c-7-7-16-8-22-5Z"/>
  <path fill="#ffad68" d="m164 204-4 20c8 8 18 10 28 5l-5-22c-6-5-13-6-19-3Z"/>
  <path fill="none" stroke-width="1.45" d="m168 210 5 15m-20-17 1 11"/></g>`
);

const kingCrab = wrap(
  `<linearGradient id="king-shell" x1="0" y1="0" x2=".55" y2="1"><stop stop-color="#ff9c60"/><stop offset=".55" stop-color="#f4794f"/><stop offset="1" stop-color="#db543e"/></linearGradient><linearGradient id="king-leg" x1="0" y1="0" x2="0.4" y2="1"><stop stop-color="#ffac66"/><stop offset="1" stop-color="#e96142"/></linearGradient>`,
  `<!-- Four separated angular walking-leg pairs form a compact fan. -->
  <path fill="url(#king-leg)" d="M98 107 77 82 55 85 38 110 44 115 61 99 74 98 89 119Z"/>
  <path fill="url(#king-leg)" d="m87 120-23-15-21 15-17 33 7 5 20-26 13-10 20 13Z"/>
  <path fill="url(#king-leg)" d="m89 137-26 1-19 30-7 28 7 3 14-26 14-18 23-3Z"/>
  <path fill="url(#king-leg)" d="m108 151-25 14-10 29 6 23 7-3 1-19 12-20 22-12Z"/>
  <path fill="url(#king-leg)" d="m159 108 21-25 22 4 17 24-6 5-17-16-13-1-15 21Z"/>
  <path fill="url(#king-leg)" d="m170 120 24-13 21 15 16 32-7 5-19-25-13-10-21 13Z"/>
  <path fill="url(#king-leg)" d="m168 138 26 2 18 31 6 27-7 3-13-27-14-18-23-3Z"/>
  <path fill="url(#king-leg)" d="m149 152 24 15 9 28-6 23-7-3-1-20-11-19-22-12Z"/>
  <g fill="none" stroke="#ffe1ad" stroke-width="2.8"><path d="m76 91-16 1-14 17m18 6-14 12-16 24m32-6-15 26-8 20m45-18-9 23 3 15M181 92l16 1 14 17m-17 7 14 12 15 24m-32-6 14 26 8 21m-44-19 8 22-3 15"/></g>
  <path fill="#f0804f" d="m102 109-18-25-12-9-9 11 16 14 13 20Z"/>
  <path fill="#f0804f" d="m153 110 18-24 13-8 9 11-17 13-13 20Z"/>
  <path fill="url(#king-shell)" d="M73 88C60 87 49 77 50 66 50 57 56 49 63 47L69 61 76 48C83 50 88 59 88 67 87 77 82 85 73 88Z"/>
  <path fill="url(#king-shell)" d="M184 91C197 90 207 80 206 69 205 60 200 52 192 50L187 64 179 51C172 54 168 62 169 70 171 80 175 88 184 91Z"/>
  <path fill="none" stroke-width="1.45" d="m69 61 4 9m114-6-4 9"/>
  <path fill="#ffd5a1" stroke="none" d="M56 66c0-5 2-10 5-11l4 9-5 8Z M201 69c-1-5-3-9-6-11l-3 9 5 8Z"/>
  <path fill="url(#king-shell)" d="m81 115 3-16 13 1 8-11 12 8 11-9 12 9 12-6 9 12 13-1 3 17-7 17-15 17-24 17-24-13-17-16Z"/>
  <path fill="#ffb979" stroke="none" d="M94 112c8-9 24-12 35-10 14 1 25 5 33 13-12-3-21-3-31 1-16 5-27 5-37-4Z"/>
  <path fill="#ffc68b" stroke="none" d="m104 143 24 16 24-16-10 14-11 7-14-7Z"/>
  <path fill="none" stroke="#ffd6a0" stroke-width="4" d="M101 111c6-4 13-6 20-6"/>
  <path fill="#e46443" stroke="none" d="m89 126 16 21 14 9-15-5-12-13Z"/>`
);

export const seaTailCandidates = [
  {
    id: 'fresh-sea-9', name: '肥蟹', svg: fatCrab,
    design: { silhouette: '宽圆饱满的蟹壳、两只鼓起的大蟹钳与四对短腿，轮廓敦实', angle: '略带体积的俯视，左右蟹钳自然错位', material: '明亮橘红甲壳、大块暖色柔和高光，细深棕轮廓', identity: '胖圆蟹壳和肉厚圆钳，与长腿帝王蟹明确区分', container: '无容器，透明背景' },
    reason: '把肥蟹的圆、胖、短腿作为主要识别点，减少零碎甲壳纹理，让棋盘小图仍能看清两只丰满蟹钳。', expectedOccupancy: .8
  },
  {
    id: 'fresh-sea-10', name: '龙虾', svg: lobster,
    design: { silhouette: '错位大双钳、修长头胸、向右弯曲的分节长尾与扇形尾端', angle: '轻微斜向的弧线俯视姿态，尾部自然转弯', material: '珊瑚红与鲜橙甲壳、少量奶油色高光，外线 3.1 内线 1.45', identity: '长分节腹尾与完整尾扇清楚区分虾和蟹，短触须辅助识别', container: '无容器，透明背景' },
    reason: '用长尾的曲线与不对称双钳建立龙虾姿态，保留少量粗分节和短触须，避免机械式正面人形。', expectedOccupancy: .8
  },
  {
    id: 'fresh-sea-11', name: '帝王蟹', svg: kingCrab,
    design: { silhouette: '宽三角蟹甲、四对向外折起的长步足与较小双钳，整体紧凑有力', angle: '俯视，长腿以清晰扇形在两侧错开', material: '鲜红橙色甲壳、奶油色步足下缘与少量大块高光', identity: '有棱角的三角甲壳和长折腿，与肥蟹的圆壳短腿明确区分', container: '无容器，透明背景' },
    reason: '通过三角蟹甲与八条分开的折腿呈现帝王蟹，少量甲缘尖角代替密集小刺，确保高等级轮廓强但不拥挤。', expectedOccupancy: .8
  }
];

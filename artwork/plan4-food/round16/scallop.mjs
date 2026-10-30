// Independent SE03 alternative. Runtime ingredient data is not changed here.
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (d, colour, width = 1.45, opacity = 1) => path(d, 'none', `stroke="${colour}" stroke-width="${width}" opacity="${opacity}"`);

const shell = 'M111 196C87 182 61 157 45 129C36 123 31 111 38 102C31 89 41 76 54 77C53 63 67 54 80 59C86 45 102 41 113 50C125 39 141 43 148 55C162 48 176 56 177 69C192 68 203 81 198 94C212 100 215 114 205 125C190 154 171 178 147 196L141 207L116 209Z';
const defs = `<linearGradient id="s16-scallop-shell" x1=".15" y1="0" x2=".75" y2="1"><stop stop-color="#ffd5b7"/><stop offset=".52" stop-color="#eeae99"/><stop offset="1" stop-color="#d98780"/></linearGradient>
  <linearGradient id="s16-scallop-inner" x1=".2" y1="0" x2=".8" y2="1"><stop stop-color="#fff0d7"/><stop offset="1" stop-color="#f2c6a5"/></linearGradient>
  <linearGradient id="s16-scallop-meat" x1=".18" y1="0" x2=".75" y2="1"><stop stop-color="#fffcec"/><stop offset=".5" stop-color="#fff3d9"/><stop offset="1" stop-color="#ead5b0"/></linearGradient>
  <linearGradient id="s16-scallop-side" x1="0" y1="0" x2=".2" y2="1"><stop stop-color="#f5e7c8"/><stop offset="1" stop-color="#d8b78e"/></linearGradient>
  <linearGradient id="s16-scallop-roe" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#ffc36f"/><stop offset="1" stop-color="#e98e55"/></linearGradient>
  <clipPath id="s16-scallop-shell-clip">${path(shell, '#fff')}</clipPath>`;

let art = path('M110 182L83 189L91 211L120 205L141 206L164 207L173 186L146 182Z', '#e69a89');
art += path(shell, 'url(#s16-scallop-shell)');
art += '<g clip-path="url(#s16-scallop-shell-clip)">';
art += path('M47 112C59 94 87 78 111 78C144 72 173 88 197 106C184 143 161 169 137 193L119 194C88 171 66 143 47 112Z', 'url(#s16-scallop-inner)', 'stroke="none"');
art += line('M113 195C95 169 62 144 40 108M117 193C103 161 80 118 57 79M121 192C111 155 100 102 83 59M127 192C126 154 123 97 115 50M134 193C143 152 147 99 148 55M140 193C162 155 172 110 178 71M145 193C175 160 193 128 202 104', '#b97771', 1.55, .78);
art += line('M114 189C93 161 72 138 49 113M121 188C110 157 94 117 71 80M130 188C130 154 128 111 126 64M139 187C156 154 168 117 174 89M146 185C169 160 185 135 194 117', '#ffe7cb', 1.65, .87);
art += path('M54 139C76 166 94 182 115 195L120 205L107 199C82 184 64 162 54 139Z', '#d1897c', 'stroke="none" opacity=".45"');
art += '</g>';
art += path('M87 143C79 132 80 117 91 111C104 103 119 111 129 123C141 136 159 143 171 136C176 147 169 159 156 165C139 175 112 168 98 160C91 156 88 150 87 143Z', 'url(#s16-scallop-roe)', 'stroke="#a96e50" stroke-width="1.6"');
art += line('M87 126C88 116 96 113 102 116M146 158Q158 162 165 151', '#ffe1a4', 1.65, .86);
art += path('M94 116C96 98 114 88 134 90C156 91 170 106 170 125L169 139C168 156 151 166 131 164C109 163 92 151 92 136Z', 'url(#s16-scallop-side)', 'stroke="#9b8064" stroke-width="2.1"');
art += path('M94 116C94 101 111 91 132 91C154 91 170 103 170 119C170 135 153 147 132 146C110 145 94 132 94 116Z', 'url(#s16-scallop-meat)', 'stroke="#a68d6e" stroke-width="1.65"');
art += path('M103 111C107 101 120 97 131 99C136 100 136 104 131 104C120 103 113 107 109 115C106 120 100 116 103 111Z', '#fffdf3', 'stroke="none" opacity=".9"');
art += line('M103 140C111 147 121 150 131 150M151 148Q158 145 162 139', '#fff5dd', 1.5, .82);
art += line('M98 138Q98 146 103 151M111 147Q113 155 117 157M133 152L133 160M151 148L150 156', '#bf9f79', 1.3, .68);
art += line('M121 201Q129 204 138 200M92 197L99 201M159 194L154 199', '#ffe0b8', 1.65, .82);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><title>扇贝 · 鳕鱼位置替换候选</title><defs>${defs}</defs><g stroke="#574038" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(14 128 128)">${art}</g></g></svg>`;

export const seaCodRedesign = {
  id: 'fresh-sea-3', name: '扇贝', previousName: '鳕鱼', svg, expectedOccupancy: .68,
  design: {
    silhouette: '宽圆扇形半贝壳向小铰合部渐收，内有一枚厚实奶白扇贝肉与小橙色裙边',
    angle: '半壳斜向俯视略顺时针转动，扇贝肉顶部和近侧厚度同时可见',
    material: '桃粉珊瑚壳、奶油珍珠内壁、柔白厚肉与一点杏橙裙边，清晰细深棕描边',
    identity: '扇形壳沿与收向铰合部的疏朗放射肋纹，厚圆贝柱清楚区别不规则长生蚝',
    container: '食材放在自身一枚半贝壳内，透明背景，无盘无香草装饰',
  },
  reason: '将鳕鱼位置提出扇贝候选，用扇形壳与厚圆贝柱建立更明确轮廓；暖桃壳、奶白肉和少量橙裙边鲜明但克制，三级保持小巧。',
};

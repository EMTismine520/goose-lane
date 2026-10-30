// Individually authored review candidate. Production artwork remains unchanged.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256">
<title>鸡翅中 · 双骨与关节精修候选</title>
<defs>
  <linearGradient id="cw-skin" x1=".18" y1="0" x2=".68" y2="1">
    <stop stop-color="#ffe6c6"/><stop offset=".5" stop-color="#f7c69f"/><stop offset="1" stop-color="#e8a77e"/>
  </linearGradient>
  <linearGradient id="cw-under" x1="0" y1="0" x2=".4" y2="1">
    <stop stop-color="#f5c19b"/><stop offset="1" stop-color="#d99a74"/>
  </linearGradient>
  <linearGradient id="cw-joint" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#fff0d5"/><stop offset="1" stop-color="#f2c7a0"/>
  </linearGradient>
  <clipPath id="cw-body"><path d="M-93-13C-98-26-88-38-74-37-67-46-52-45-40-38-17-33 16-33 43-35 63-39 83-34 91-21 102-3 97 18 80 28 69 35 55 32 44 29 18 28-11 32-37 35-60 40-84 35-94 21-100 12-100-2-93-13Z"/></clipPath>
</defs>
<g transform="translate(129 128) rotate(-16)" stroke-linecap="round" stroke-linejoin="round">
  <path d="M-93-13C-98-26-88-38-74-37-67-46-52-45-40-38-17-33 16-33 43-35 63-39 83-34 91-21 102-3 97 18 80 28 69 35 55 32 44 29 18 28-11 32-37 35-60 40-84 35-94 21-100 12-100-2-93-13Z" fill="url(#cw-skin)" stroke="#3d2b22" stroke-width="3.1"/>
  <g clip-path="url(#cw-body)">
    <path d="M-98 10C-73 28-50 27-29 25 3 22 28 18 49 19 75 26 88 13 99-5L105 45H-103Z" fill="url(#cw-under)" opacity=".56"/>
    <path d="M-53 7C-25 3 10 3 38 1 58-1 74 3 82 10" fill="none" stroke="#ca936f" stroke-width="1.65"/>
    <path d="M-51 11C-21 8 12 8 37 5" fill="none" stroke="#ffe7c7" stroke-width="2.1" opacity=".7"/>
    <path d="M-72-31C-83-24-86-14-81-6" fill="none" stroke="#bd8868" stroke-width="1.5"/>
    <path d="M-79 5C-84 13-81 23-71 27" fill="none" stroke="#c28b68" stroke-width="1.45"/>
    <path d="M67-26C77-20 81-12 80-6M70 20C76 16 79 13 80 10" fill="none" stroke="#c18b68" stroke-width="1.45"/>
    <path d="M-77-28C-71-36-62-36-54-31" fill="none" stroke="#fff3dc" stroke-width="3.8" opacity=".88"/>
    <path d="M-63-19C-44-15-15-15 6-16" fill="none" stroke="#fff0d5" stroke-width="3.3" opacity=".78"/>
    <path d="M-68 24C-52 29-33 25-17 24" fill="none" stroke="#fbd5af" stroke-width="2.2" opacity=".78"/>
    <path d="M-92-8C-87-15-80-12-79-6-80 0-85 2-91-1Z" fill="url(#cw-joint)" stroke="#bd8e6d" stroke-width="1.3"/>
    <path d="M-93 10C-88 4-81 7-81 13-82 19-88 21-93 16Z" fill="url(#cw-joint)" stroke="#bd8e6d" stroke-width="1.3"/>
  </g>
</g>
</svg>`;

export const chickenWingCandidates = [{
  id: 'fresh-poultry-3',
  name: '鸡翅中',
  svg,
  design: {
    silhouette: '保留斜向长条鸡翅中，两端关节略宽、中央双骨连接段收紧，外轮廓连续清楚',
    angle: '沿原版略俯视斜放，翅中皮面朝上，短端关节轻微露出',
    material: '粉浅黄鸡皮与柔和肉色体积，少量皮褶交代双骨和关节，不增加烹调焦色',
    identity: '两端关节、沿长轴的双骨厚度与浅皮色共同区分鸡胸肉和鸡全翅',
    container: '无盛器、无装饰、无新增食物',
  },
  reason: '原版长条胶囊形缺少关节特征；保留方向和浅皮色，补清两端宽窄与轻微双骨结构，让小图更像鸡翅中。',
}];

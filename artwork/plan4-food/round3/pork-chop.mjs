// Round 3 proposal only. The accepted masters and production mappings are untouched.
const silhouette = 'M41 118C46 77 76 52 120 49C159 45 193 60 206 91C223 130 201 169 170 193C134 222 94 226 65 207C38 190 29 156 41 118Z';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256">
<title>猪排 · 兽肉链精修候选</title>
<defs>
  <linearGradient id="pc-meat" x1=".1" y1="0" x2=".85" y2="1"><stop stop-color="#ffc2a6"/><stop offset=".55" stop-color="#ed967e"/><stop offset="1" stop-color="#cb6b5e"/></linearGradient>
  <linearGradient id="pc-fat" x1=".18" y1=".12" x2=".78" y2="1"><stop stop-color="#fff5df"/><stop offset=".64" stop-color="#f5dabd"/><stop offset="1" stop-color="#e5bfa3"/></linearGradient>
  <linearGradient id="pc-bone" x1=".1" y1="0" x2=".85" y2="1"><stop stop-color="#fffae9"/><stop offset=".55" stop-color="#f2e0c2"/><stop offset="1" stop-color="#d9bd99"/></linearGradient>
  <clipPath id="pc-clip"><path d="${silhouette}"/></clipPath>
</defs>
<g stroke="#3d2d25" stroke-linecap="round" stroke-linejoin="round">
  <g transform="translate(187 176) rotate(135) scale(1.2)"><path d="M-6 4V-7q-10-9-3-15 6-4 10 2 6-6 11-1 5 7-5 14V4Z" fill="url(#pc-bone)" stroke-width="2.1"/></g>
  <path d="${silhouette}" fill="url(#pc-meat)" stroke-width="3.1"/>
  <g clip-path="url(#pc-clip)" stroke="none">
    <path d="M162 63C150 88 142 109 147 138C151 166 173 181 189 183L207 153L221 87Z" fill="#c26a61" opacity=".09"/>
    <path d="M60 143C85 135 112 144 129 160C140 171 145 187 146 209C118 224 77 214 57 194Z" fill="#e68a75" opacity=".2"/>
  </g>
  <path d="M113 58C85 61 64 79 53 104C43 126 41 151 48 171C50 176 55 176 58 169C52 149 56 122 66 103C77 82 94 71 113 68C121 67 121 59 113 58Z" fill="url(#pc-fat)" stroke="#966e59" stroke-width="1.45"/>
  <path d="M164 78C148 98 141 120 147 144C151 160 161 173 176 182M61 146C83 139 109 146 127 162C137 171 142 183 145 195" fill="none" stroke="#b77464" stroke-width="1.45" opacity=".44"/>
  <path d="M81 91C93 79 110 74 126 76" fill="none" stroke="#ffe7bd" stroke-width="4" opacity=".67"/>
</g>
</svg>`;

export const porkChopCandidates = [{
  id: 'fresh-beast-6',
  name: '猪排',
  svg,
  design: {
    silhouette: '保留原版饱满椭圆肉排及右下侧小骨头，主体完整，不添加盛器或配料',
    angle: '延续原版近正面略俯视的单块肉排，切面朝前、骨头向右下',
    material: '沿用粉珊瑚红肉色和克制渐变，以两三块大肉面表现体积；浅乳白脂肪局部沿外缘分布',
    identity: '取消中央闭合脂肪环，明确肉排切面、局部脂边与侧骨之间的结构，保持生猪排状态',
    container: '无盛器、无新增装饰，原生透明背景',
  },
  reason: '原版中央闭合脂肪环在小图下偏像肉卷；保留肉排大形与原色，将脂肪移为不闭合外缘脂边，略明确右下侧骨与大块肉面。',
}];

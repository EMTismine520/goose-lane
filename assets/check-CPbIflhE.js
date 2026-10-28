import{r as a}from"./gift-codes-Djut_bYv.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),c=(...r)=>r.filter((e,t,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===t).join(" ").trim();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var p={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=a.forwardRef(({color:r="currentColor",size:e=24,strokeWidth:t=2,absoluteStrokeWidth:o,className:s="",children:n,iconNode:i,...l},m)=>a.createElement("svg",{ref:m,...p,width:e,height:e,stroke:r,strokeWidth:o?Number(t)*24/Number(e):t,className:c("lucide",s),...l},[...i.map(([u,d])=>a.createElement(u,d)),...Array.isArray(n)?n:[n]]));/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=(r,e)=>{const t=a.forwardRef(({className:o,...s},n)=>a.createElement(w,{ref:n,iconNode:e,className:c(`lucide-${f(r)}`,o),...s}));return t.displayName=`${r}`,t};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=h("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);export{g as C,h as c};

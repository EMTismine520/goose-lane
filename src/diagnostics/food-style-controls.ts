export {};
const frame = document.querySelector<HTMLIFrameElement>('#game')!;
const status = document.querySelector<HTMLElement>('#status')!;
const query = new URLSearchParams(location.search);
const dpr = Math.min(3, Math.max(1, Math.ceil(Number(query.get('dpr')) || devicePixelRatio || 1)));
const renderer = query.get('renderer') === 'auto' ? 'auto' : 'canvas';
const send = () => frame.contentWindow?.postMessage({ type: 'food-art:config', renderer, dpr }, location.origin);
const reset = () => {
  status.textContent = '正在准备…';
  const url = new URL('./food-style-frame.html', location.href);
  url.search = new URLSearchParams({ renderer, dpr: String(dpr) }).toString();
  frame.src = url.href;
};
document.querySelector('#reset')!.addEventListener('click', reset);
frame.addEventListener('load', send);
addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'food-art:state') return;
  status.textContent = event.data.ready ? '可以试玩' : '正在准备…';
});
reset();

export {};
const frame = document.querySelector<HTMLIFrameElement>('#game')!;
const status = document.querySelector<HTMLElement>('#status')!;
const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-style]')];
let style = new URLSearchParams(location.search).get('style') === 'cartoon' ? 'cartoon' : 'painted';
const dpr = Math.min(3, Math.max(1, Math.ceil(devicePixelRatio || 1)));
const send = () => frame.contentWindow?.postMessage({ type: 'food-art:config', style, renderer: 'canvas', dpr }, location.origin);
const showChoice = () => buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.style === style)));
const reset = () => {
  status.textContent = '正在准备…';
  const url = new URL('./food-style-frame.html', location.href);
  url.search = new URLSearchParams({ style, renderer: 'canvas', dpr: String(dpr) }).toString();
  frame.src = url.href;
};
buttons.forEach(button => button.addEventListener('click', () => {
  style = button.dataset.style!;
  showChoice();
  status.textContent = '正在换装…';
  const url = new URL(location.href);
  url.searchParams.set('style', style);
  history.replaceState(null, '', url);
  send();
}));
document.querySelector('#reset')!.addEventListener('click', reset);
frame.addEventListener('load', send);
addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'food-art:state') return;
  if (event.data.style === style) status.textContent = event.data.ready ? '可以试玩' : '正在换装…';
});
showChoice();
reset();

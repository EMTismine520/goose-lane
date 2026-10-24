/** These mobile browser shells showed an empty WebGL board on the published game. */
export function boardRendererMode(userAgent: string): 'canvas' | 'auto' {
  return /MicroMessenger|Quark/i.test(userAgent) ? 'canvas' : 'auto';
}

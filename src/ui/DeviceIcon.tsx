import { deviceAssetPath } from '../content/assets';
import { DEVICE_FAMILIES } from '../content/expansion';
import { ArtImage } from './ArtImage';
export interface CodexView { query: string; filter: string; scroll: number; }
export const EMPTY_CODEX: CodexView = { query: '', filter: 'all', scroll: 0 };
export function DeviceIcon({ family, level = 1, size = 64 }: { family: string; level?: number; size?: number }) {
  return <ArtImage className="device-icon" path={deviceAssetPath(`${family}-l${level}`)} size={size} alt={`${DEVICE_FAMILIES.find(entry => entry.id === family)?.name} ${level}级`} draggable={false}/>;
}

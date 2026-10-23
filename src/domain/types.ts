export type ItemId = string;
export interface ItemDef { id: ItemId; name: string; chain: string; level: number; icon: number; description: string; source: string; sell: number; kind: 'ingredient' | 'dish'; }
export interface ChainDef { id: string; name: string; color: string; unlockDay: number; items: ItemId[]; }
export interface Requirement { item: ItemId; count: number; }
export interface RecipeDef { id: string; name: string; inputs: Requirement[]; output: ItemId; appliance: number; duration: number; unlockDay: number; description: string; }
export interface OrderDef { id: string; day: number; customer: string; title: string; message: string; thanks: string; needs: Requirement[]; coins: number; reputation: number; }
export interface ShopDef { id: string; name: string; subtitle: string; day: number; color: string; costs: number[]; description: string; }
export interface CustomerDef { id: string; name: string; role: string; color: string; accessory: string; story: string[]; }
export interface DecorationDef { id: string; name: string; shop: string; cost: number; bonus: 'tips' | 'speed'; description: string; }
export interface ItemInstance { uid: string; item: ItemId; }
export interface CookingJob { id: string; recipe: string; startedAt: number; endsAt: number; }
export interface GeneratorState { remaining: number; readyAt: number; }
export interface Settings { music: boolean; sound: boolean; reducedMotion: boolean; volume: number; }
export interface GameState {
  schemaVersion: number; contentVersion: string; revision: number; seed: number; nextId: number;
  board: (ItemInstance | null)[]; storage: ItemInstance[]; storageCapacity: number;
  generators: Record<string, GeneratorState>; jobs: (CookingJob | null)[];
  completedOrders: string[]; day: number; coins: number; reputation: number;
  shops: Record<string, number>; decorations: string[]; discovered: ItemId[];
  stats: { merges: number; generated: number; cooked: number; earned: number; };
  tutorial: number; settings: Settings; lastSeen: number;
  undo: { item: ItemInstance; index: number; coins: number; revision: number } | null;
}
export type Command =
  | { type: 'generate'; chain: string }
  | { type: 'move'; from: number; to: number }
  | { type: 'store'; index: number }
  | { type: 'retrieve'; uid: string }
  | { type: 'sell'; index: number }
  | { type: 'undo' }
  | { type: 'cook'; recipe: string; slot: number }
  | { type: 'collect'; slot: number }
  | { type: 'deliver'; order: string }
  | { type: 'upgrade'; shop: string }
  | { type: 'decorate'; decoration: string }
  | { type: 'nextDay' }
  | { type: 'settings'; settings: Partial<Settings> }
  | { type: 'tutorial'; step: number };
export interface GameEvent { type: string; message: string; index?: number; item?: ItemId; amount?: number; }
export interface CommandResult { state: GameState; ok: boolean; events: GameEvent[]; }

export type ItemId = string;
export interface ItemDef { id: ItemId; name: string; chain: string; level: number; icon: number; assetId?: string; description: string; source: string; sell: number; kind: 'ingredient' | 'dish'; }
export interface ChainDef { id: string; name: string; color: string; unlockDay: number; items: ItemId[]; }
export interface Requirement { item: ItemId; count: number; }
export interface RecipeDef { id: string; name: string; inputs: Requirement[]; output: ItemId; appliance: number; duration: number; unlockDay: number; description: string; }
export interface OrderDef { id: string; day: number; customer: string; title: string; message: string; thanks: string; needs: Requirement[]; coins: number; reputation: number; }
export interface ShopDef { id: string; name: string; subtitle: string; day: number; color: string; costs: number[]; description: string; }
export interface CustomerDef { id: string; name: string; role: string; color: string; accessory: string; story: string[]; }
export interface DecorationDef { id: string; name: string; shop: string; cost: number; bonus: 'tips' | 'speed'; description: string; }
export interface ItemInstance { uid: string; item: ItemId; }
export interface CookingJob { id: string; recipe: string; startedAt: number; endsAt: number; output?: ItemId; }
export interface ApplianceState { id: string; slot: number; index: number; inputSlots: ItemInstance[]; job: CookingJob | null; outputSlot: ItemInstance | null; version: number; }
export interface EnergyState { value: number; lastRecoveryAt: number; }
export interface TutorialState { node: string; completed: string[]; targetUid: string | null; }
export interface SessionState { page: 'merge' | 'street'; selectedUid: string | null; orderScroll: number; }
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
  campaign: 'fresh' | 'legacy'; energy: EnergyState; appliances: ApplianceState[];
  construction: { completed: string[]; hats: number; rewardClaimed: boolean };
  tutorialState: TutorialState; session: SessionState; migrationInbox: ItemInstance[];
  processedCommandIds: string[]; cellVersions: number[];
}
export type CommandMetadata = { commandId?: string; expectedUid?: string; expectedTargetUid?: string | null; expectedTargetVersion?: number; expectedVersion?: number; expectedJobId?: string };
export type Command = CommandMetadata & (
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
  | { type: 'tutorial'; step: number }
  | { type: 'stageInput'; from: number; appliance: string }
  | { type: 'withdrawInput'; appliance: string; uid: string }
  | { type: 'startCooking'; appliance: string; recipe?: string }
  | { type: 'collectAppliance'; appliance: string }
  | { type: 'build'; node: string }
  | { type: 'claimConstructionReward' }
  | { type: 'claimMigration'; uid: string }
  | { type: 'session'; session: Partial<SessionState> }
  | { type: 'recover' });
export interface GameEvent { type: string; message: string; index?: number; from?: number; item?: ItemId; uid?: string; appliance?: string; order?: string; node?: string; amount?: number; }
export interface CommandResult { state: GameState; ok: boolean; events: GameEvent[]; }

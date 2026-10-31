import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import { artUrl, itemPresentation } from '../content/assets';
import { CHAINS, ITEMS } from '../content/catalog';
import { getApplianceStatus, getBoardEntity } from '../domain/engine';
import type { Command, GameState } from '../domain/types';
import { audio } from '../platform/audio';
import { BOARD_COLUMNS, BOARD_HEIGHT, BOARD_ROWS, BOARD_WIDTH, DRAG_THRESHOLD, boardTapAction, cellAt, isDropCommitted, moveCommand, nextKeyboardCell, selectionAfterDrop } from './board-input';
import type { DropSelection } from './board-input';
import { BoardRenderer, itemDisplaySize, itemTexture } from './board-render';
import { boardPixelRatio, boardPoint, refreshBoardViewport } from './board-viewport';
import { boardRendererMode } from './board-renderer-mode';
import { useItemArt } from '../ui/ItemArtContext';
import type { ApplianceTargets } from '../ui/ui-guidance';
import { planBoardAssets, type BoardAsset } from './board-assets';
import { acquireArtImage, type AssetLease } from '../platform/asset-queue';
import { loadEngine } from './load-engine';
import { DecorationBudget, perfFrame, perfMark, perfMilestone, perfSpan, resetFrameClock } from '../platform/performance';

export interface BoardProps {
  state: GameState;
  selected: number | null;
  onSelect: (index: number | null) => void;
  act?: (command: Command) => Promise<boolean | void> | boolean | void;
  /** Compatibility for consumers which have not yet moved to command dispatch. */
  onMove?: (from: number, to: number) => void;
  hint?: [number, number] | null;
  tutorialTarget?: number | null;
  guidanceUids?: readonly string[];
  active?: boolean;
  inputEnabled?: boolean;
  sessionEpoch?: number;
  selectionCancelSequence?: number;
  onReady?: (ready: boolean) => void;
  applianceTargets?: ApplianceTargets;
  onSpeedUp?: (appliance: string, jobId: string) => void;
}
interface BoardBridge { sync: () => void; resize: () => void; activate: (index: number) => void; cancel: () => void; retry: () => void; }
interface Gesture { index: number; x: number; y: number; pointerId: number; uid: string | null; selected: number | null; maxDistance: number; }

/** One scene per mounted board. React supplies snapshots; Phaser never mutates inventory. */
function Board(props: BoardProps) {
  const art = useItemArt();
  const mount = useRef<HTMLDivElement>(null);
  const live = useRef(props);
  const bridge = useRef<BoardBridge | null>(null);
  const buttons = useRef(new Map<number, HTMLButtonElement>());
  const [focused, setFocused] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [loadingMessage, setLoadingMessage] = useState('正在加载绘图引擎…');
  const [attempt, setAttempt] = useState(0);
  const [deferredError, setDeferredError] = useState('');
  const [started, setStarted] = useState(props.active !== false);
  const rendererMode = art.renderer ?? boardRendererMode(typeof navigator === 'undefined' ? '' : navigator.userAgent);
  const deviceRatio = useRef(boardPixelRatio(typeof window === 'undefined' ? 1 : window.devicePixelRatio)).current;
  const pixelRatio = art.pixelRatio === undefined ? deviceRatio : boardPixelRatio(art.pixelRatio, 3);
  live.current = props;
  useEffect(() => { if (props.active !== false) setStarted(true); }, [props.active]);

  useLayoutEffect(() => { bridge.current?.sync(); }, [props.state, props.selected, props.hint, props.tutorialTarget, props.guidanceUids, props.active, props.inputEnabled, props.sessionEpoch, props.selectionCancelSequence, props.applianceTargets]);

  useEffect(() => {
    if (!started) return;
    setStatus('loading');
    live.current.onReady?.(false);
    let disposed = false;
    let game: Phaser.Game | undefined;
    let removeListeners: (() => void) | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let failed = false;
    let loadTimer: ReturnType<typeof setTimeout>;
    const fail = (message: string, cause?: unknown) => {
      if (disposed || failed) return;
      failed = true;
      clearTimeout(loadTimer);
      setLoadingMessage(message);
      setStatus('failed');
      if (cause) console.error('The pantry canvas could not start.', cause);
    };
    const progress = (message: string) => {
      if (disposed || failed) return;
      setLoadingMessage(message);
      clearTimeout(loadTimer);
      loadTimer = setTimeout(() => fail('加载已超过 30 秒没有进展，请检查网络后重试。'), 30000);
    };
    progress('正在加载绘图引擎…');

    const prepared = new Map<string, HTMLImageElement>();
    const requests = new Map<string, { lease: AssetLease<HTMLImageElement>; epoch: number | undefined }>();
    const failedArt = new Set<string>();
    let acceptArt: ((key: string, image: HTMLImageElement) => void) | undefined;
    const enqueue = (resource: BoardAsset, priority: number) => {
      const epoch = live.current.sessionEpoch, existing = requests.get(resource.key);
      if (existing && existing.epoch === epoch || failedArt.has(resource.key)) return;
      existing?.lease.release();
      const lease = acquireArtImage(artUrl(resource.path), priority), task = { lease, epoch };
      requests.set(resource.key, task);
      void lease.promise.then(image => {
        if (disposed || epoch !== live.current.sessionEpoch) return;
        if (acceptArt) acceptArt(resource.key, image); else prepared.set(resource.key, image);
      }, error => {
        if (!disposed && epoch === live.current.sessionEpoch && error?.name !== 'AbortError') {
          failedArt.add(resource.key);
          if (priority === 0) setDeferredError('有张图片还没准备好，可按名称继续操作');
        }
      }).finally(() => { lease.release(); if (requests.get(resource.key) === task) requests.delete(resource.key); });
    };
    // Fetch current art alongside the engine; no image is a global scene-start barrier.
    for (const resource of planBoardAssets(live.current.state, pixelRatio).critical) enqueue(resource, 0);
    void loadEngine().then(({ default: Engine }) => {
      if (disposed || failed || !mount.current) return;
      progress('正在初始化料理台…');
      class PantryScene extends Engine.Scene {
        private board!: BoardRenderer;
        private start: Gesture | null = null;
        private dragged: number | null = null;
        private ghost: Phaser.GameObjects.Image | null = null;
        private hovered: number | null = null;
        private pending = new Set<string>();
        private pendingSelection: DropSelection | null = null;
        private selectionIntent = 0;
        private paused = false;
        private lastPressed = -Infinity;
        private painted = false;
        private incomingArt = new Map<string, HTMLImageElement>();
        private artRevision = -1;
        private pruneTimer: Phaser.Time.TimerEvent | undefined;
        private nextPointer: Phaser.Input.Pointer | null = null;
        private cssScale = 1;
        private measuredDrag = false;
        private pendingGhosts = new Set<Phaser.GameObjects.Image>();
        private decoration = new DecorationBudget();

        constructor() { super('pantry'); }

        preload() {
          for (const [key, image] of prepared) this.textures.addImage(key, image);
          prepared.clear();
          acceptArt = (key, image) => this.incomingArt.set(key, image);
          const placeholder = this.make.graphics({ x: 0, y: 0 });
          placeholder.fillStyle(0xeadcc6).fillCircle(48, 48, 33).lineStyle(3, 0xfffcf2).strokeCircle(48, 48, 25);
          placeholder.generateTexture('pending-food', 96, 96); placeholder.destroy();
        }

        private queueArt() {
          const plan = planBoardAssets(live.current.state, pixelRatio);
          const wanted = new Set([...plan.critical, ...plan.soon].map(asset => asset.key));
          for (const [key, task] of requests) if (!wanted.has(key) || task.epoch !== live.current.sessionEpoch) {
            task.lease.release(); requests.delete(key);
          }
          for (const [priority, resources] of [[0, plan.critical], [2, this.painted ? plan.soon : []]] as const) for (const resource of resources) {
            if (this.textures.exists(resource.key) || this.incomingArt.has(resource.key)) continue;
            if (priority === 0 && failedArt.has(resource.key)) setDeferredError('有张图片还没准备好，可按名称继续操作');
            enqueue(resource, priority);
          }
        }

        private flushArt() {
          const changed: string[] = [];
          for (const [key, image] of this.incomingArt) {
            if (!this.textures.exists(key)) this.textures.addImage(key, image);
            this.incomingArt.delete(key); changed.push(key);
            if (changed.length === 2) break;
          }
          if (changed.length) {
            this.installLegacyFrames(); this.board.refreshArt(changed);
            if (planBoardAssets(live.current.state, pixelRatio).critical.every(asset => this.textures.exists(asset.key))) perfMark('board-assets-ready');
          }
        }

        private pruneTextures() {
          const plan = planBoardAssets(live.current.state, pixelRatio), keep = new Set([...plan.critical, ...plan.soon].map(asset => asset.key));
          const visit = (objects: readonly Phaser.GameObjects.GameObject[]) => {
            for (const object of objects) {
              const child = object as Phaser.GameObjects.Image & { list?: Phaser.GameObjects.GameObject[] };
              if (child.texture) keep.add(child.texture.key);
              if (child.list) visit(child.list);
            }
          };
          visit(this.children.list);
          for (const key of this.textures.getTextureKeys()) if (/^(item:|entity:)/.test(key) && !keep.has(key)) this.textures.remove(key);
        }

        private installLegacyFrames() {
          if (!this.textures.exists('legacy-foods')) return;
          const texture = this.textures.get('legacy-foods');
          if (texture.has('0')) return;
          const source = texture.getSourceImage() as HTMLImageElement;
          for (let i = 0; i < 64; i++) texture.add(i, 0, (i % 8) * source.width / 8, Math.floor(i / 8) * source.height / 8, source.width / 8, source.height / 8);
        }

        create() {
          if (disposed || failed) return;
          try { this.createBoard(); }
          catch (cause) { fail('料理台绘制未能完成，请重试或使用最新版 Chrome、Edge 打开。', cause); }
        }

        private createBoard() {
          perfMark('board-scene-ready');
          this.cameras.main.setZoom(pixelRatio).centerOn(BOARD_WIDTH / 2, BOARD_HEIGHT / 2);
          this.game.canvas.dataset.renderBackend = this.game.renderer.type === Engine.CANVAS ? 'canvas' : 'webgl';
          if (this.game.renderer instanceof Engine.Renderer.Canvas.CanvasRenderer) {
            this.game.renderer.gameContext.imageSmoothingEnabled = true;
            this.game.renderer.gameContext.imageSmoothingQuality = 'high';
          }
          this.installLegacyFrames();
          this.board = new BoardRenderer(this, () => live.current.state, pixelRatio, () => this.decoration.reduced, () => live.current.applianceTargets);
          this.input.on('pointerdown', this.press, this);
          this.input.on('pointermove', this.drag, this);
          this.input.on('pointerup', this.release, this);
          this.input.on('pointerupoutside', this.cancel, this);
          const cancel = () => this.cancel();
          const retryArt = () => { failedArt.clear(); setDeferredError(''); this.queueArt(); };
          const visibility = () => this.sync();
          const rendered = () => { const now = performance.now(); perfFrame(now); this.decoration.sample(now); };
          this.game.events.on(Engine.Core.Events.POST_RENDER, rendered);
          const keydown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !event.defaultPrevented && this.allowed()) {
              event.preventDefault();
              this.cancel();
              live.current.onSelect(null);
            }
          };
          window.addEventListener('blur', cancel);
          window.addEventListener('online', retryArt);
          document.addEventListener('visibilitychange', visibility);
          document.addEventListener('keydown', keydown);
          this.game.canvas.addEventListener('pointercancel', cancel);
          this.game.canvas.addEventListener('touchcancel', cancel);
          this.game.canvas.setAttribute('aria-hidden', 'true');
          removeListeners = () => {
            window.removeEventListener('blur', cancel);
            window.removeEventListener('online', retryArt);
            document.removeEventListener('visibilitychange', visibility);
            document.removeEventListener('keydown', keydown);
            this.game.canvas.removeEventListener('pointercancel', cancel);
            this.game.canvas.removeEventListener('touchcancel', cancel);
            this.game.events.off(Engine.Core.Events.POST_RENDER, rendered);
          };
          bridge.current = { sync: () => this.sync(), resize: () => this.refreshViewport(), activate: index => this.activate(index), cancel: () => this.cancel(), retry: () => { setDeferredError(''); failedArt.clear(); this.queueArt(); } };
          this.sync();
          this.refreshViewport();
          perfMark('board-objects-ready');
          clearTimeout(loadTimer);
          this.game.events.once(Engine.Core.Events.POST_RENDER, () => {
            if (!disposed) {
              this.painted = true; setStatus('ready'); live.current.onReady?.(true); perfMark('board-ready');
              if (planBoardAssets(live.current.state, pixelRatio).critical.every(asset => this.textures.exists(asset.key))) perfMark('board-assets-ready');
              this.sync();
            }
          });
        }

        update() { if (this.nextPointer) { const pointer = this.nextPointer; this.nextPointer = null; this.flushDrag(pointer); } if (this.board) { this.flushArt(); this.board.updateClock(Date.now()); } }

        private allowed() { return this.painted && live.current.active !== false && live.current.inputEnabled !== false && !document.hidden; }

        private refreshViewport() {
          if (mount.current && live.current.active !== false && !document.hidden) {
            refreshBoardViewport(this.scale, mount.current);
            this.cssScale = this.game.canvas.getBoundingClientRect().width / BOARD_WIDTH || 1;
          }
        }

        private restoredEpoch = live.current.sessionEpoch;
        private selectionCancelSequence = live.current.selectionCancelSequence;

        private sync() {
          if (!this.board) return;
          const restoring = this.restoredEpoch !== live.current.sessionEpoch;
          if (restoring) {
            this.restoredEpoch = live.current.sessionEpoch; this.cancel(); this.board.settle(); setDeferredError(''); failedArt.clear();
            this.incomingArt.clear();
          }
          this.queueArt();
          if (this.selectionCancelSequence !== live.current.selectionCancelSequence) {
            this.selectionCancelSequence = live.current.selectionCancelSequence;
            this.cancel();
          }
          const inactive = live.current.active === false || document.hidden;
          if (!this.allowed()) this.cancel();
          if (this.start?.uid && getBoardEntity(live.current.state,this.start.index).id !== this.start.uid) this.cancel();
          if (inactive !== this.paused) {
            this.paused = inactive;
            if (inactive) {
              this.board.settle();
              this.scene.pause();
              this.sys.setVisible(false); this.game.loop.sleep(); resetFrameClock();
            } else {
              this.sys.setVisible(true); this.scene.resume(); this.game.loop.wake(); resetFrameClock(); this.decoration.reset();
              this.refreshViewport();
            }
          }
          this.input.enabled = this.allowed();
          this.board.sync(!inactive && !restoring);
          if (this.artRevision !== live.current.state.revision) {
            this.artRevision = live.current.state.revision; this.pruneTextures();
            if (!this.pruneTimer) this.pruneTimer = this.time.delayedCall(1000, () => { this.pruneTextures(); this.pruneTimer = undefined; });
          }
          this.reconcileSelection();
          this.paintHighlights();
        }

        private press(pointer: Phaser.Input.Pointer) {
          if (!this.allowed() || this.start || !pointer.primaryDown) return;
          const point = boardPoint(pointer, pixelRatio);
          const index = cellAt(point.x, point.y);
          if (index === null) return;
          const entity = getBoardEntity(live.current.state, index);
          if (entity.item && this.pending.has(entity.item.uid)) return;
          this.selectionIntent++;
          this.measuredDrag = false;
          this.game.events.once(Engine.Core.Events.POST_RENDER, perfSpan('press-feedback'));
          this.pendingSelection = null;
          const selected = live.current.selected;
          this.cssScale = this.game.canvas.getBoundingClientRect().width / BOARD_WIDTH || 1;
          this.start = { index, x: point.x, y: point.y, pointerId: pointer.id, uid: entity.canMove ? entity.id : null, selected, maxDistance: 0 };
          this.board.press(index);
          void audio.unlock();
          if (this.time.now - this.lastPressed > 70) { audio.play('click'); this.lastPressed = this.time.now; }
        }

        private measureMovement(point: { x: number; y: number }) {
          if (!this.start) return;
          this.start.maxDistance = Math.max(this.start.maxDistance, Math.hypot(point.x - this.start.x, point.y - this.start.y) * this.cssScale);
        }

        private drag(pointer: Phaser.Input.Pointer) {
          if (!this.allowed() || !this.start || pointer.id !== this.start.pointerId || !pointer.isDown) return;
          this.measureMovement(boardPoint(pointer, pixelRatio));
          if (!this.measuredDrag && this.start.maxDistance >= DRAG_THRESHOLD) {
            this.measuredDrag = true; this.game.events.once(Engine.Core.Events.POST_RENDER, perfSpan('drag-feedback'));
          }
          this.nextPointer = pointer;
        }

        private flushDrag(pointer: Phaser.Input.Pointer) {
          if (!this.allowed() || !this.start || pointer.id !== this.start.pointerId) return;
          const point = boardPoint(pointer, pixelRatio);
          this.measureMovement(point);
          if (this.start.maxDistance < DRAG_THRESHOLD || !this.start.uid) return;
          const entity = getBoardEntity(live.current.state, this.start.index);
          if (!entity.canMove || entity.id !== this.start.uid) { this.cancel(); return; }
          if (this.dragged === null) {
            this.dragged = this.start.index;
            live.current.onSelect(this.dragged);
            const d=live.current.state.devices.find(d=>d.id===entity.id);
            const texture = entity.item?itemTexture(this, entity.item.item):{key:`entity:${d?`${d.familyId}-l${d.level}`:entity.id}`,frame:undefined};
            const size = (entity.item?itemDisplaySize(entity.item.item):47) * 1.1;
            this.ghost = this.add.image(point.x, point.y, texture.key, texture.frame).setDisplaySize(size, size).setDepth(40);
            this.board.setDragging(this.start.uid);
          }
          if (this.dragged !== null) {
            const presentation = entity.item?itemPresentation(entity.item.item):{offsetX:0,offsetY:-2};
            this.ghost?.setPosition(point.x + presentation.offsetX, point.y + presentation.offsetY - (pointer.wasTouch ? 18 : 4));
            this.hovered = cellAt(point.x, point.y);
            this.paintHighlights();
          }
        }

        private release(pointer: Phaser.Input.Pointer) {
          if (!this.start || pointer.id !== this.start.pointerId) return;
          // Phaser emits pointerup for native touchcancel before our DOM listener runs.
          if (pointer.wasCanceled) { this.cancel(); return; }
          this.flushDrag(pointer);
          const start = this.start;
          const point = boardPoint(pointer, pixelRatio);
          this.measureMovement(point);
          const target = cellAt(point.x, point.y);
          const dragged = this.dragged;
          const ghost = this.ghost; this.ghost = null;
          this.endGesture();
          if (!this.allowed() || target === null) { ghost?.destroy(); return; }
          if (dragged !== null && start.uid) { void this.drop(start.index, target, start.uid, ghost); return; }
          ghost?.destroy();
          if (start.maxDistance >= DRAG_THRESHOLD) return;
          if (target !== start.index) return;
          this.activate(target, start);
        }

        private activate(index: number, gesture?: Gesture) {
          if (!this.allowed()) return;
          if (!gesture) { this.selectionIntent++; this.pendingSelection = null; void audio.unlock(); }
          const state = live.current.state;
          const selected = gesture ? gesture.selected : live.current.selected;
          const action = boardTapAction(state, index, selected, live.current.applianceTargets?.[getBoardEntity(state, index).id]);
          live.current.onSelect(action.kind === 'select' ? action.index : index);
          if (action.kind === 'command') void this.submit(action.command, action.identity);
          if (action.kind === 'confirmSpeedup') live.current.onSpeedUp?.(action.appliance, action.jobId);
        }

        private async drop(from: number, to: number, uid: string, ghost: Phaser.GameObjects.Image | null) {
          if (this.pending.has(uid)) { ghost?.destroy(); return; }
          const command = moveCommand(live.current.state, from, to, uid);
          if (!command) { ghost?.destroy(); this.board.reject(from); return; }
          if (ghost) { ghost.setAlpha(.72); this.pendingGhosts.add(ghost); this.board.setPending(uid, true); }
          const selection = selectionAfterDrop(live.current.state, from, to, uid);
          const intent = this.selectionIntent;
          const epoch = live.current.sessionEpoch;
          const success = await this.submit(command, uid);
          if (ghost) { this.pendingGhosts.delete(ghost); ghost.destroy(); }
          if (disposed) return;
          this.board.setPending(uid, false);
          if (epoch !== live.current.sessionEpoch) return;
          if (success && intent === this.selectionIntent) { this.pendingSelection = selection; this.reconcileSelection(); }
          else if (!success) this.board.reject(from);
        }

        private reconcileSelection() {
          if (!this.pendingSelection || !isDropCommitted(live.current.state, this.pendingSelection)) return;
          const index = this.pendingSelection.index;
          this.pendingSelection = null;
          live.current.onSelect(index);
        }

        private async submit(command: Command, identity?: string): Promise<boolean> {
          if (identity && this.pending.has(identity)) return false;
          if (identity) this.pending.add(identity);
          try {
            if (live.current.act) return (await live.current.act(command)) !== false;
            if (command.type === 'move' && live.current.onMove) { live.current.onMove(command.from, command.to); return true; }
            return false;
          } catch {
            return false;
          } finally {
            if (identity) this.pending.delete(identity);
          }
        }

        private cancel() {
          this.selectionIntent++;
          this.pendingSelection = null;
          this.endGesture();
          for (const ghost of this.pendingGhosts) ghost.destroy();
          this.pendingGhosts.clear();
        }

        private endGesture() {
          this.nextPointer = null;
          this.start = null;
          this.dragged = null;
          this.hovered = null;
          this.ghost?.destroy();
          this.ghost = null;
          this.board?.setDragging(null);
          this.paintHighlights();
        }

        private paintHighlights() { this.board?.highlight(live.current.selected, live.current.hint, this.hovered, this.dragged, live.current.tutorialTarget, live.current.guidanceUids); }
      }

      game = new Engine.Game({
        type: rendererMode === 'canvas' ? Engine.CANVAS : Engine.AUTO, parent: mount.current, width: BOARD_WIDTH * pixelRatio, height: BOARD_HEIGHT * pixelRatio,
        transparent: true, antialias: true, roundPixels: false, scene: PantryScene,
        scale: { mode: Engine.Scale.FIT, autoCenter: Engine.Scale.CENTER_BOTH, width: BOARD_WIDTH * pixelRatio, height: BOARD_HEIGHT * pixelRatio },
        input: { activePointers: 1, touch: { capture: true }, mouse: { preventDefaultWheel: false } },
        render: { antialias: true, pixelArt: false }, audio: { noAudio: true }, banner: false,
        fps: { target: 60, limit: 60 },
        loader: { maxParallelDownloads: 4, imageLoadType: 'HTMLImageElement' },
      });
      perfMark('board-engine-created');
      resizeObserver = new ResizeObserver(() => bridge.current?.resize());
      resizeObserver.observe(mount.current);
    }).catch(error => {
      fail('绘图引擎未能加载，请检查网络后重试。', error);
    });

    return () => {
      disposed = true;
      clearTimeout(loadTimer);
      for (const task of requests.values()) task.lease.release();
      requests.clear(); prepared.clear(); acceptArt = undefined;
      bridge.current = null;
      resizeObserver?.disconnect();
      removeListeners?.();
      game?.destroy(true);
    };
  }, [rendererMode, pixelRatio, attempt, started]);

  const interactive = status === 'ready' && props.active !== false && props.inputEnabled !== false;
  return <div className="board-shell" data-board-status={status} data-board-ready-ms={perfMilestone('board-ready')} data-board-renderer={rendererMode} data-board-pixel-ratio={pixelRatio} style={{ position: 'relative' }}>
    <div ref={mount} className="phaser-board" style={{ width: '100%', height: '100%', touchAction: 'none', overflow: 'hidden', borderRadius: 9 }} />
    <div className="board-keyboard-grid" role="grid" aria-label="料理棋盘，方向键换格，回车选择和操作，Escape取消选择" aria-rowcount={BOARD_ROWS} aria-colcount={BOARD_COLUMNS} style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateRows: 'repeat(9, minmax(0, 1fr))', pointerEvents: 'none' }}>
      {Array.from({ length: BOARD_ROWS }, (_, row) => <div key={row} role="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', minWidth: 0, minHeight: 0 }}>
        {Array.from({ length: BOARD_COLUMNS }, (_, column) => {
          const index = row * BOARD_COLUMNS + column;
          const entity = getBoardEntity(props.state, index);
          const appliance = entity.kind === 'appliance' ? getApplianceStatus(props.state, entity.id) : null;
          const target = props.applianceTargets?.[entity.id];
          const details = entity.item ? CHAINS.some(c=>c.items.includes(entity.item!.item))?`${ITEMS[entity.item.item].level}级`:`成品${ITEMS[entity.item.item].kind==='drink'?'饮品':'料理'}` : appliance ? { idle: '等待投料', loaded: `${target?.recipe.name ?? appliance.recipe?.name ?? '食材'}，${(target?.canStart ?? appliance.canStart) ? '点击开火' : '待投料'}`, cooking: '烹饪中，点击确认使用加速券', ready: '点击领取' }[appliance.phase] : '';
          return <div key={index} role="gridcell" aria-selected={props.selected === index} aria-rowindex={row + 1} aria-colindex={column + 1} style={{ minWidth: 0, minHeight: 0 }}>
            <button ref={node => { if (node) buttons.current.set(index, node); else buttons.current.delete(index); }} type="button" data-board-index={index} data-board-item={entity.item?.item} data-board-uid={entity.id} disabled={!interactive} tabIndex={interactive && index === (focused ?? 0) ? 0 : -1}
              aria-label={`第${row + 1}行第${column + 1}列，${entity.name}${details ? `，${details}` : ''}`}
              onFocus={() => setFocused(index)} onBlur={() => setFocused(null)}
              onClick={() => bridge.current?.activate(index)}
              onKeyDown={event => {
                const next = nextKeyboardCell(index, event.key);
                if (event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') { event.preventDefault(); buttons.current.get(next)?.focus(); }
              }}
              style={{ display: 'block', width: '100%', height: '100%', minWidth: 0, minHeight: 0, overflow: 'hidden', opacity: focused === index ? 1 : 0, pointerEvents: 'none', border: '3px solid #4e965a', background: '#fff8e5ee', color: '#4c663b', borderRadius: 7, fontSize: 10, padding: 2, outline: 'none' }}>
              {entity.name}
            </button>
          </div>;
        })}
      </div>)}
    </div>
    {status === 'loading' && <div className="board-loading" role="status" style={{ position: 'absolute', inset: 0 }}>{loadingMessage}</div>}
    {deferredError && status === 'ready' && <div className="board-art-retry" role="status">{deferredError}<button onClick={() => bridge.current?.retry()}>重试图片</button></div>}
    {status === 'failed' && <div className="board-error" role="alert" style={{ position: 'absolute', inset: 12, display: 'grid', placeContent: 'center', textAlign: 'center', background: '#eef2d5' }}><p>{loadingMessage}</p><button className="primary" onClick={() => setAttempt(value => value + 1)}>重新加载料理台</button><small>已保存的进度会保留</small></div>}
  </div>;
}
export default memo(Board);

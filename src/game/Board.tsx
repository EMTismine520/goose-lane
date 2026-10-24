import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import { ALL_DEVICES } from '../content/board-layouts';
import { deviceAssetPath, itemImageUrl, itemPresentation } from '../content/assets';
import { ITEMS } from '../content/catalog';
import { getApplianceStatus, getBoardEntity } from '../domain/engine';
import type { Command, GameState } from '../domain/types';
import { audio } from '../platform/audio';
import { BOARD_COLUMNS, BOARD_HEIGHT, BOARD_ROWS, BOARD_WIDTH, DRAG_THRESHOLD, cellAt, isDropCommitted, moveCommand, nextKeyboardCell, selectionAfterDrop } from './board-input';
import type { DropSelection } from './board-input';
import { BoardRenderer, itemDisplaySize, itemTexture } from './board-render';
import { boardPixelRatio, boardPoint, refreshBoardViewport } from './board-viewport';
import { boardRendererMode } from './board-renderer-mode';
import { useItemArt } from '../ui/ItemArtContext';

export interface BoardProps {
  state: GameState;
  selected: number | null;
  onSelect: (index: number | null) => void;
  act?: (command: Command) => Promise<boolean | void> | boolean | void;
  /** Compatibility for consumers which have not yet moved to command dispatch. */
  onMove?: (from: number, to: number) => void;
  hint?: [number, number] | null;
  tutorialTarget?: number | null;
  active?: boolean;
  inputEnabled?: boolean;
  sessionEpoch?: number;
}
interface BoardBridge { sync: () => void; resize: () => void; activate: (index: number) => void; cancel: () => void; }
interface Gesture { index: number; x: number; y: number; pointerId: number; uid: string | null; selectedUid: string | null; selected: number | null; }

/** One scene per mounted board. React supplies snapshots; Phaser never mutates inventory. */
export default function Board(props: BoardProps) {
  const art = useItemArt();
  const mount = useRef<HTMLDivElement>(null);
  const live = useRef(props);
  const bridge = useRef<BoardBridge | null>(null);
  const buttons = useRef(new Map<number, HTMLButtonElement>());
  const [focused, setFocused] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [loadingMessage, setLoadingMessage] = useState('正在加载绘图引擎…');
  const rendererMode = art.renderer ?? boardRendererMode(typeof navigator === 'undefined' ? '' : navigator.userAgent);
  const pixelRatio = boardPixelRatio(art.pixelRatio ?? (typeof window === 'undefined' ? 1 : window.devicePixelRatio));
  live.current = props;

  useLayoutEffect(() => { bridge.current?.sync(); }, [props.state, props.selected, props.hint, props.tutorialTarget, props.active, props.inputEnabled, props.sessionEpoch]);

  useEffect(() => {
    setStatus('loading');
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

    void import('phaser').then(({ default: Engine }) => {
      if (disposed || failed || !mount.current) return;
      progress('正在初始化料理台…');
      const directImages = rendererMode === 'canvas';

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

        constructor() { super('pantry'); }

        preload() {
          progress('正在加载棋盘素材… 0%');
          this.load.on('progress', (value: number) => progress(`正在加载棋盘素材… ${Math.round(value * 100)}%`));
          this.load.on('loaderror', () => fail('棋盘素材未能加载，请检查网络后重试。'));
          const base = `${import.meta.env.BASE_URL}assets/`;
          this.load.image('legacy-foods', `${base}foods.webp`);
          for (const item of Object.values(ITEMS)) {
            if (item.assetId) {
              const path = itemImageUrl(item.id, art.items);
              const size = Math.max(itemPresentation(item.id, art.items).svgSize, 96 * pixelRatio);
              if (path.endsWith('.svg') && !directImages) this.load.svg(`item:${item.assetId}`, path, { width: size, height: size });
              else this.load.image(`item:${item.assetId}`, path);
            }
          }
          for (const entity of ALL_DEVICES) {
            const path = `${import.meta.env.BASE_URL}${deviceAssetPath(entity.id)}`;
            if (path.endsWith('.svg') && !directImages) this.load.svg(`entity:${entity.id}`, path, { width: 96 * pixelRatio, height: 96 * pixelRatio });
            else this.load.image(`entity:${entity.id}`, path);
          }
          if (directImages) this.load.image('entity:crate', `${base}entities/crate.svg`);
          else this.load.svg('entity:crate', `${base}entities/crate.svg`, { width: 96 * pixelRatio, height: 96 * pixelRatio });
        }

        create() {
          if (disposed || failed) return;
          try { this.createBoard(); }
          catch (cause) { fail('料理台绘制未能完成，请重试或使用最新版 Chrome、Edge 打开。', cause); }
        }

        private createBoard() {
          this.cameras.main.setZoom(pixelRatio).centerOn(BOARD_WIDTH / 2, BOARD_HEIGHT / 2);
          this.game.canvas.dataset.renderBackend = this.game.renderer.type === Engine.CANVAS ? 'canvas' : 'webgl';
          if (this.game.renderer instanceof Engine.Renderer.Canvas.CanvasRenderer) {
            this.game.renderer.gameContext.imageSmoothingEnabled = true;
            this.game.renderer.gameContext.imageSmoothingQuality = 'high';
          }
          if (this.textures.exists('legacy-foods')) {
            const texture = this.textures.get('legacy-foods');
            const source = texture.getSourceImage() as HTMLImageElement;
            for (let i = 0; i < 64; i++) texture.add(i, 0, (i % 8) * source.width / 8, Math.floor(i / 8) * source.height / 8, source.width / 8, source.height / 8);
          }
          this.board = new BoardRenderer(this, () => live.current.state, art.items, pixelRatio);
          this.input.on('pointerdown', this.press, this);
          this.input.on('pointermove', this.drag, this);
          this.input.on('pointerup', this.release, this);
          this.input.on('pointerupoutside', this.cancel, this);
          const cancel = () => this.cancel();
          const visibility = () => this.sync();
          const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') this.cancel(); };
          window.addEventListener('blur', cancel);
          document.addEventListener('visibilitychange', visibility);
          document.addEventListener('keydown', keydown);
          this.game.canvas.addEventListener('pointercancel', cancel);
          this.game.canvas.addEventListener('touchcancel', cancel);
          this.game.canvas.setAttribute('aria-hidden', 'true');
          removeListeners = () => {
            window.removeEventListener('blur', cancel);
            document.removeEventListener('visibilitychange', visibility);
            document.removeEventListener('keydown', keydown);
            this.game.canvas.removeEventListener('pointercancel', cancel);
            this.game.canvas.removeEventListener('touchcancel', cancel);
          };
          bridge.current = { sync: () => this.sync(), resize: () => this.refreshViewport(), activate: index => this.activate(index), cancel: () => this.cancel() };
          this.sync();
          this.refreshViewport();
          clearTimeout(loadTimer);
          if (!disposed) setStatus('ready');
        }

        update() { this.board?.updateClock(Date.now()); }

        private allowed() { return live.current.active !== false && live.current.inputEnabled !== false && !document.hidden; }

        private refreshViewport() {
          if (mount.current && live.current.active !== false && !document.hidden) refreshBoardViewport(this.scale, mount.current);
        }

        private restoredEpoch = live.current.sessionEpoch;

        private sync() {
          if (!this.board) return;
          const restoring = this.restoredEpoch !== live.current.sessionEpoch;
          if (restoring) { this.restoredEpoch = live.current.sessionEpoch; this.cancel(); this.pendingSelection = null; this.selectionIntent++; this.board.settle(); }
          const inactive = live.current.active === false || document.hidden;
          if (!this.allowed()) this.cancel();
          if (this.start?.uid && live.current.state.board[this.start.index]?.uid !== this.start.uid) this.cancel();
          if (inactive !== this.paused) {
            this.paused = inactive;
            if (inactive) {
              this.board.settle();
              this.scene.pause();
            } else {
              this.refreshViewport();
              this.scene.resume();
            }
          }
          this.input.enabled = this.allowed();
          this.board.sync(!inactive && !restoring);
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
          this.pendingSelection = null;
          const selected = live.current.selected;
          this.start = { index, x: point.x, y: point.y, pointerId: pointer.id, uid: entity.item?.uid ?? null, selected, selectedUid: selected === null ? null : live.current.state.board[selected]?.uid ?? null };
          this.board.press(index);
          void audio.unlock();
          if (this.time.now - this.lastPressed > 70) { audio.play('click'); this.lastPressed = this.time.now; }
        }

        private drag(pointer: Phaser.Input.Pointer) {
          if (!this.allowed() || !this.start || pointer.id !== this.start.pointerId || !pointer.isDown || !this.start.uid) return;
          const entity = getBoardEntity(live.current.state, this.start.index);
          if (!entity.canMove || entity.item?.uid !== this.start.uid) { this.cancel(); return; }
          const canvasScale = this.game.canvas.getBoundingClientRect().width / BOARD_WIDTH;
          const point = boardPoint(pointer, pixelRatio);
          if (this.dragged === null && Math.hypot(point.x - this.start.x, point.y - this.start.y) * canvasScale >= DRAG_THRESHOLD) {
            this.dragged = this.start.index;
            live.current.onSelect(this.dragged);
            const texture = itemTexture(this, entity.item.item);
            const size = itemDisplaySize(entity.item.item, art.items) * 1.1;
            this.ghost = this.add.image(point.x, point.y, texture.key, texture.frame).setDisplaySize(size, size).setDepth(40);
            this.board.setDragging(this.start.uid);
          }
          if (this.dragged !== null) {
            const presentation = itemPresentation(entity.item.item, art.items);
            this.ghost?.setPosition(point.x + presentation.offsetX, point.y + presentation.offsetY - (pointer.wasTouch ? 18 : 4));
            this.hovered = cellAt(point.x, point.y);
            this.paintHighlights();
          }
        }

        private release(pointer: Phaser.Input.Pointer) {
          if (!this.start || pointer.id !== this.start.pointerId) return;
          // Phaser emits pointerup for native touchcancel before our DOM listener runs.
          if (pointer.wasCanceled) { this.cancel(); return; }
          const start = this.start;
          const point = boardPoint(pointer, pixelRatio);
          const target = cellAt(point.x, point.y);
          const dragged = this.dragged;
          this.cancel();
          if (!this.allowed() || target === null) return;
          if (dragged !== null && start.uid) { void this.drop(start.index, target, start.uid); return; }
          if (target !== start.index) return;
          this.activate(target, start);
        }

        private activate(index: number, gesture?: Gesture) {
          if (!this.allowed()) return;
          if (!gesture) { this.selectionIntent++; this.pendingSelection = null; void audio.unlock(); }
          const state = live.current.state;
          const entity = getBoardEntity(state, index);
          const selected = gesture ? gesture.selected : live.current.selected;
          const selectedUid = gesture ? gesture.selectedUid : selected === null ? null : state.board[selected]?.uid ?? null;
          if (entity.kind === 'generator' && entity.chain) {
            live.current.onSelect(index);
            void this.submit({ type: 'generate', chain: entity.chain });
          } else if (selected !== null && selected !== index && selectedUid) {
            void this.drop(selected, index, selectedUid);
          } else if (entity.kind === 'appliance') {
            live.current.onSelect(index);
            const appliance = getApplianceStatus(state, entity.id);
            if (appliance?.phase === 'ready') void this.submit({ type: 'collectAppliance', appliance: entity.id, expectedJobId: appliance.appliance.job?.id }, `appliance:${entity.id}`);
            else if (appliance?.canStart) void this.submit({ type: 'startCooking', appliance: entity.id }, `appliance:${entity.id}`);
          } else {
            live.current.onSelect(entity.kind === 'empty' || selected === index ? null : index);
          }
        }

        private async drop(from: number, to: number, uid: string) {
          if (this.pending.has(uid)) return;
          const command = moveCommand(live.current.state, from, to, uid);
          if (!command) { this.board.reject(from); return; }
          const selection = selectionAfterDrop(live.current.state, from, to, uid);
          const intent = this.selectionIntent;
          const success = await this.submit(command, uid);
          if (disposed) return;
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
          this.start = null;
          this.dragged = null;
          this.hovered = null;
          this.ghost?.destroy();
          this.ghost = null;
          this.board?.setDragging(null);
          this.paintHighlights();
        }

        private paintHighlights() { this.board?.highlight(live.current.selected, live.current.hint, this.hovered, this.dragged, live.current.tutorialTarget); }
      }

      game = new Engine.Game({
        type: rendererMode === 'canvas' ? Engine.CANVAS : Engine.AUTO, parent: mount.current, width: BOARD_WIDTH * pixelRatio, height: BOARD_HEIGHT * pixelRatio,
        transparent: true, antialias: true, roundPixels: false, scene: PantryScene,
        scale: { mode: Engine.Scale.FIT, autoCenter: Engine.Scale.CENTER_BOTH, width: BOARD_WIDTH * pixelRatio, height: BOARD_HEIGHT * pixelRatio },
        input: { activePointers: 1, touch: { capture: true }, mouse: { preventDefaultWheel: false } },
        render: { antialias: true, pixelArt: false }, audio: { noAudio: true }, banner: false,
        loader: { imageLoadType: directImages ? 'HTMLImageElement' : 'XHR' },
      });
      resizeObserver = new ResizeObserver(() => bridge.current?.resize());
      resizeObserver.observe(mount.current);
    }).catch(error => {
      fail('绘图引擎未能加载，请检查网络后重试。', error);
    });

    return () => {
      disposed = true;
      clearTimeout(loadTimer);
      bridge.current = null;
      resizeObserver?.disconnect();
      removeListeners?.();
      game?.destroy(true);
    };
  }, [rendererMode, pixelRatio, art.items]);

  const interactive = props.active !== false && props.inputEnabled !== false;
  return <div className="board-shell" data-board-status={status} data-board-renderer={rendererMode} data-board-pixel-ratio={pixelRatio} style={{ position: 'relative' }}>
    <div ref={mount} className="phaser-board" style={{ width: '100%', height: '100%', touchAction: 'none', overflow: 'hidden', borderRadius: 9 }} />
    <div className="board-keyboard-grid" role="grid" aria-label="料理棋盘，方向键换格，回车选择和操作，Escape取消选择" aria-rowcount={BOARD_ROWS} aria-colcount={BOARD_COLUMNS} style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateRows: 'repeat(9, 1fr)', pointerEvents: 'none' }}>
      {Array.from({ length: BOARD_ROWS }, (_, row) => <div key={row} role="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {Array.from({ length: BOARD_COLUMNS }, (_, column) => {
          const index = row * BOARD_COLUMNS + column;
          const entity = getBoardEntity(props.state, index);
          const appliance = entity.kind === 'appliance' ? getApplianceStatus(props.state, entity.id) : null;
          const details = entity.item ? `${ITEMS[entity.item.item].level}级` : appliance ? { idle: '等待投料', loaded: '已投料', cooking: '烹饪中', ready: '点击领取' }[appliance.phase] : '';
          return <div key={index} role="gridcell" aria-selected={props.selected === index} aria-rowindex={row + 1} aria-colindex={column + 1}>
            <button ref={node => { if (node) buttons.current.set(index, node); else buttons.current.delete(index); }} type="button" disabled={!interactive} tabIndex={interactive && index === (focused ?? 0) ? 0 : -1}
              aria-label={`第${row + 1}行第${column + 1}列，${entity.name}${details ? `，${details}` : ''}`}
              onFocus={() => setFocused(index)} onBlur={() => setFocused(null)}
              onClick={() => bridge.current?.activate(index)}
              onKeyDown={event => {
                const next = nextKeyboardCell(index, event.key);
                if (event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') { event.preventDefault(); buttons.current.get(next)?.focus(); }
                if (event.key === 'Escape') { event.preventDefault(); bridge.current?.cancel(); props.onSelect(null); }
              }}
              style={{ width: '100%', height: '100%', opacity: focused === index ? 1 : 0, pointerEvents: 'none', border: '3px solid #4e965a', background: '#fff8e5ee', color: '#4c663b', borderRadius: 7, fontSize: 10, padding: 2, outline: 'none' }}>
              {entity.name}
            </button>
          </div>;
        })}
      </div>)}
    </div>
    {status === 'loading' && <div className="board-loading" role="status" style={{ position: 'absolute', inset: 0 }}>{loadingMessage}</div>}
    {status === 'failed' && <div className="board-error" role="alert" style={{ position: 'absolute', inset: 12, display: 'grid', placeContent: 'center', textAlign: 'center', background: '#eef2d5' }}><p>{loadingMessage}</p><button className="primary" onClick={() => window.location.reload()}>重新加载料理台</button><small>已保存的进度会保留</small></div>}
  </div>;
}

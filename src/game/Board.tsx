import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import { BOARD_LAYOUT } from '../content/board-layouts';
import { ITEMS } from '../content/catalog';
import { getApplianceStatus, getBoardEntity } from '../domain/engine';
import type { Command, GameState } from '../domain/types';
import { audio } from '../platform/audio';
import { BOARD_COLUMNS, BOARD_HEIGHT, BOARD_ROWS, BOARD_WIDTH, DRAG_THRESHOLD, cellAt, isDropCommitted, moveCommand, nextKeyboardCell, selectionAfterDrop } from './board-input';
import type { DropSelection } from './board-input';
import { BoardRenderer, entityAsset, itemDisplaySize, itemTexture } from './board-render';

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
}
interface BoardBridge { sync: () => void; activate: (index: number) => void; cancel: () => void; }
interface Gesture { index: number; x: number; y: number; pointerId: number; uid: string | null; selectedUid: string | null; selected: number | null; }

/** One scene per mounted board. React supplies snapshots; Phaser never mutates inventory. */
export default function Board(props: BoardProps) {
  const mount = useRef<HTMLDivElement>(null);
  const live = useRef(props);
  const bridge = useRef<BoardBridge | null>(null);
  const buttons = useRef(new Map<number, HTMLButtonElement>());
  const [focused, setFocused] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  live.current = props;

  useLayoutEffect(() => { bridge.current?.sync(); }, [props.state, props.selected, props.hint, props.tutorialTarget, props.active, props.inputEnabled]);

  useEffect(() => {
    let disposed = false;
    let game: Phaser.Game | undefined;
    let removeListeners: (() => void) | undefined;

    void import('phaser').then(({ default: Engine }) => {
      if (disposed || !mount.current) return;

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
          const base = `${import.meta.env.BASE_URL}assets/`;
          this.load.image('legacy-foods', `${base}foods.webp`);
          for (const item of Object.values(ITEMS)) {
            if (item.assetId) this.load.svg(`item:${item.assetId}`, `${base}items/${item.assetId}.svg`, { width: 96, height: 96 });
          }
          for (const entity of BOARD_LAYOUT.entities) this.load.svg(`entity:${entity.id}`, `${base}entities/${entityAsset(entity.id)}.svg`, { width: 96, height: 96 });
          this.load.svg('entity:crate', `${base}entities/crate.svg`, { width: 96, height: 96 });
        }

        create() {
          if (this.textures.exists('legacy-foods')) {
            const texture = this.textures.get('legacy-foods');
            const source = texture.getSourceImage() as HTMLImageElement;
            for (let i = 0; i < 64; i++) texture.add(i, 0, (i % 8) * source.width / 8, Math.floor(i / 8) * source.height / 8, source.width / 8, source.height / 8);
          }
          this.board = new BoardRenderer(this, () => live.current.state);
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
          bridge.current = { sync: () => this.sync(), activate: index => this.activate(index), cancel: () => this.cancel() };
          this.sync();
          if (!disposed) setStatus('ready');
        }

        update() { this.board?.updateClock(Date.now()); }

        private allowed() { return live.current.active !== false && live.current.inputEnabled !== false && !document.hidden; }

        private sync() {
          if (!this.board) return;
          const inactive = live.current.active === false || document.hidden;
          if (!this.allowed()) this.cancel();
          if (this.start?.uid && live.current.state.board[this.start.index]?.uid !== this.start.uid) this.cancel();
          if (inactive !== this.paused) {
            this.paused = inactive;
            if (inactive) {
              this.board.settle();
              this.scene.pause();
            } else {
              this.scale.refresh();
              this.scene.resume();
            }
          }
          this.input.enabled = this.allowed();
          this.board.sync(!inactive);
          this.reconcileSelection();
          this.paintHighlights();
        }

        private press(pointer: Phaser.Input.Pointer) {
          if (!this.allowed() || this.start || !pointer.primaryDown) return;
          const index = cellAt(pointer.x, pointer.y);
          if (index === null) return;
          const entity = getBoardEntity(live.current.state, index);
          if (entity.item && this.pending.has(entity.item.uid)) return;
          this.selectionIntent++;
          this.pendingSelection = null;
          const selected = live.current.selected;
          this.start = { index, x: pointer.x, y: pointer.y, pointerId: pointer.id, uid: entity.item?.uid ?? null, selected, selectedUid: selected === null ? null : live.current.state.board[selected]?.uid ?? null };
          this.board.press(index);
          void audio.unlock();
          if (this.time.now - this.lastPressed > 70) { audio.play('click'); this.lastPressed = this.time.now; }
        }

        private drag(pointer: Phaser.Input.Pointer) {
          if (!this.allowed() || !this.start || pointer.id !== this.start.pointerId || !pointer.isDown || !this.start.uid) return;
          const entity = getBoardEntity(live.current.state, this.start.index);
          if (!entity.canMove || entity.item?.uid !== this.start.uid) { this.cancel(); return; }
          const canvasScale = this.game.canvas.getBoundingClientRect().width / BOARD_WIDTH;
          if (this.dragged === null && Math.hypot(pointer.x - this.start.x, pointer.y - this.start.y) * canvasScale >= DRAG_THRESHOLD) {
            this.dragged = this.start.index;
            live.current.onSelect(this.dragged);
            const texture = itemTexture(this, entity.item.item);
            const size = itemDisplaySize(entity.item.item) * 1.1;
            this.ghost = this.add.image(pointer.x, pointer.y, texture.key, texture.frame).setDisplaySize(size, size).setDepth(40);
            this.board.setDragging(this.start.uid);
          }
          if (this.dragged !== null) {
            this.ghost?.setPosition(pointer.x, pointer.y - (pointer.wasTouch ? 18 : 4));
            this.hovered = cellAt(pointer.x, pointer.y);
            this.paintHighlights();
          }
        }

        private release(pointer: Phaser.Input.Pointer) {
          if (!this.start || pointer.id !== this.start.pointerId) return;
          // Phaser emits pointerup for native touchcancel before our DOM listener runs.
          if (pointer.wasCanceled) { this.cancel(); return; }
          const start = this.start;
          const target = cellAt(pointer.x, pointer.y);
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
        type: Engine.AUTO, parent: mount.current, width: BOARD_WIDTH, height: BOARD_HEIGHT,
        transparent: true, antialias: true, roundPixels: false, scene: PantryScene,
        scale: { mode: Engine.Scale.FIT, autoCenter: Engine.Scale.CENTER_BOTH, width: BOARD_WIDTH, height: BOARD_HEIGHT },
        input: { activePointers: 1, touch: { capture: true }, mouse: { preventDefaultWheel: false } },
        render: { antialias: true, pixelArt: false }, audio: { noAudio: true }, banner: false,
      });
    }).catch(error => {
      console.error('The pantry canvas could not start.', error);
      if (!disposed) setStatus('failed');
    });

    return () => {
      disposed = true;
      bridge.current = null;
      removeListeners?.();
      game?.destroy(true);
    };
  }, []);

  const interactive = props.active !== false && props.inputEnabled !== false;
  return <div className="board-shell" data-board-status={status} style={{ position: 'relative' }}>
    <div ref={mount} className="phaser-board" style={{ width: '100%', aspectRatio: '7 / 9', touchAction: 'none', overflow: 'hidden', borderRadius: 9 }} />
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
    {status === 'loading' && <div className="board-loading" role="status">正在铺好料理台…</div>}
    {status === 'failed' && <p className="board-error" role="status">料理台暂时未能加载，请刷新重试。</p>}
  </div>;
}

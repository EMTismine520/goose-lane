import { useEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import { ITEMS } from '../content/catalog';
import { mergeTarget, unlockedCells } from '../domain/engine';
import type { GameState } from '../domain/types';

export interface BoardProps {
  state: GameState;
  selected: number | null;
  onSelect: (index: number | null) => void;
  onMove: (from: number, to: number) => void;
  hint?: [number, number] | null;
}

const CELL = 72;
const COLS = 7;
const ROWS = 8;
const WIDTH = CELL * COLS;
const HEIGHT = CELL * ROWS;
const center = (index: number) => ({ x: (index % COLS) * CELL + CELL / 2, y: Math.floor(index / COLS) * CELL + CELL / 2 });

/** Phaser only renders and reports gestures. All game mutations go through the domain reducer. */
export default function Board(props: BoardProps) {
  const mount = useRef<HTMLDivElement>(null);
  const live = useRef(props);
  const bridge = useRef<{ render: () => void } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  live.current = props;

  useEffect(() => { bridge.current?.render(); }, [props.state, props.selected, props.hint]);

  useEffect(() => {
    let disposed = false;
    let game: Phaser.Game | undefined;
    let removeCancellationListeners: (() => void) | undefined;

    void import('phaser').then(({ default: Engine }) => {
      if (disposed || !mount.current) return;

      class PantryScene extends Engine.Scene {
        private tiles!: Phaser.GameObjects.Graphics;
        private contents!: Phaser.GameObjects.Container;
        private halo!: Phaser.GameObjects.Graphics;
        private previous: (string | null)[] = [];
        private previousMergeCount = 0;
        private icons = new Map<number, Phaser.GameObjects.Container>();
        private start: { index: number; x: number; y: number; selected: number | null; pointerId: number } | null = null;
        private dragged: number | null = null;
        private ghost: Phaser.GameObjects.Image | null = null;
        private hovered: number | null = null;
        private textureReady = false;

        constructor() { super('pantry'); }

        preload() {
          this.load.image('food-atlas', `${import.meta.env.BASE_URL}assets/foods.webp`);
          this.load.on('loaderror', () => { if (!disposed) setStatus('failed'); });
        }

        create() {
          const texture = this.textures.get('food-atlas');
          this.textureReady = this.textures.exists('food-atlas');
          if (this.textureReady) {
            const source = texture.getSourceImage() as HTMLImageElement;
            const frameWidth = source.width / 8;
            const frameHeight = source.height / 8;
            for (let index = 0; index < 64; index++) {
              texture.add(index, 0, (index % 8) * frameWidth, Math.floor(index / 8) * frameHeight, frameWidth, frameHeight);
            }
          }
          this.tiles = this.add.graphics();
          this.halo = this.add.graphics().setDepth(2);
          this.contents = this.add.container(0, 0).setDepth(3);
          this.input.on('pointerdown', this.press, this);
          this.input.on('pointermove', this.drag, this);
          this.input.on('pointerup', this.release, this);
          this.input.on('pointerupoutside', this.cancel, this);
          this.game.events.on('blur', this.cancel, this);
          const cancel = () => this.cancel();
          const visibility = () => { if (document.hidden) cancel(); };
          window.addEventListener('blur', cancel);
          document.addEventListener('visibilitychange', visibility);
          this.game.canvas.addEventListener('pointercancel', cancel);
          this.game.canvas.setAttribute('aria-label', '食材合成棋盘，7列8行。可拖动食材，也可点选食材后点目标格。下方提供键盘操作。');
          this.game.canvas.setAttribute('role', 'img');
          removeCancellationListeners = () => {
            window.removeEventListener('blur', cancel);
            document.removeEventListener('visibilitychange', visibility);
            this.game.canvas.removeEventListener('pointercancel', cancel);
          };
          bridge.current = { render: () => this.paint() };
          this.paint();
          if (!disposed && this.textureReady) setStatus('ready');
        }

        private cellAt(x: number, y: number) {
          if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return null;
          const index = Math.floor(y / CELL) * COLS + Math.floor(x / CELL);
          return index < unlockedCells(live.current.state) ? index : null;
        }

        private mergeable(from: number, to: number) {
          const board = live.current.state.board;
          return from !== to && !!board[from] && board[from]?.item === board[to]?.item && !!mergeTarget(board[from]!.item);
        }

        private press(pointer: Phaser.Input.Pointer) {
          if (this.start || !pointer.primaryDown) return;
          const index = this.cellAt(pointer.x, pointer.y);
          if (index === null) return;
          this.start = { index, x: pointer.x, y: pointer.y, selected: live.current.selected, pointerId: pointer.id };
        }

        private drag(pointer: Phaser.Input.Pointer) {
          if (!this.start || pointer.id !== this.start.pointerId || !pointer.isDown) return;
          const item = live.current.state.board[this.start.index];
          if (!item) return;
          if (this.dragged === null && Math.hypot(pointer.x - this.start.x, pointer.y - this.start.y) > 7) {
            this.dragged = this.start.index;
            live.current.onSelect(this.dragged);
            if (this.textureReady) {
              this.ghost = this.add.image(pointer.x, pointer.y - 10, 'food-atlas', ITEMS[item.item].icon)
                .setDisplaySize(68, 68).setDepth(20).setAlpha(0.96);
              this.icons.get(this.dragged)?.setAlpha(0.18);
            }
          }
          if (this.dragged !== null) {
            this.ghost?.setPosition(pointer.x, pointer.y - 10);
            this.hovered = this.cellAt(pointer.x, pointer.y);
            this.paintHighlights();
          }
        }

        private release(pointer: Phaser.Input.Pointer) {
          if (!this.start || pointer.id !== this.start.pointerId) return;
          const start = this.start;
          const target = this.cellAt(pointer.x, pointer.y);
          const dragged = this.dragged;
          this.cancel();
          if (target === null) return;
          if (dragged !== null) {
            if (target !== dragged) live.current.onMove(dragged, target);
            return;
          }
          if (target !== start.index) return;
          if (start.selected !== null && start.selected !== target) {
            live.current.onMove(start.selected, target);
          } else if (live.current.state.board[target]) {
            live.current.onSelect(start.selected === target ? null : target);
          } else {
            live.current.onSelect(null);
          }
        }

        private cancel() {
          this.start = null;
          if (this.dragged !== null) this.icons.get(this.dragged)?.setAlpha(1);
          this.dragged = null;
          this.hovered = null;
          this.ghost?.destroy();
          this.ghost = null;
          if (this.halo) this.paintHighlights();
        }

        private paintHighlights() {
          this.halo.clear();
          const source = this.dragged ?? live.current.selected;
          for (let index = 0; index < unlockedCells(live.current.state); index++) {
            const { x, y } = center(index);
            const selected = source === index;
            const matching = source !== null && this.mergeable(source, index);
            const hinted = live.current.hint?.includes(index);
            const over = this.hovered === index && this.dragged !== index;
            if (selected || matching || hinted || over) {
              this.halo.fillStyle(selected ? 0x427a60 : matching || hinted ? 0xf2c15e : 0x9eb19a, selected ? 0.11 : 0.15);
              this.halo.fillRoundedRect(x - 32, y - 32, 64, 64, 15);
              this.halo.lineStyle(selected || over ? 2.5 : 1.7, selected || over ? 0x4b8468 : 0xd6a348, 0.95);
              this.halo.strokeRoundedRect(x - 32, y - 32, 64, 64, 15);
              if (matching || hinted) {
                this.halo.fillStyle(0xd6a348, 1);
                this.halo.fillCircle(x + 25, y - 25, 3);
              }
            }
          }
        }

        private paint() {
          if (!this.tiles) return;
          const { state } = live.current;
          const unlocked = unlockedCells(state);
          const didMerge = state.stats.merges > this.previousMergeCount;
          this.tweens.killTweensOf(this.contents.list);
          this.contents.removeAll(true);
          this.icons.clear();
          this.tiles.clear();
          this.tiles.fillStyle(0xe5dece, 1);
          this.tiles.fillRoundedRect(0, 0, WIDTH, HEIGHT, 16);
          const next: (string | null)[] = [];

          for (let index = 0; index < COLS * ROWS; index++) {
            const { x, y } = center(index);
            const locked = index >= unlocked;
            this.tiles.fillStyle(0xc9c1af, locked ? 0.15 : 0.25);
            this.tiles.fillRoundedRect(x - 31, y - 29, 62, 62, 14);
            this.tiles.fillStyle(locked ? 0xdcd8cb : (Math.floor(index / COLS) + index % COLS) % 2 ? 0xf9f5e9 : 0xfffcf3, 1);
            this.tiles.fillRoundedRect(x - 31, y - 32, 62, 62, 14);

            if (locked) {
              this.tiles.lineStyle(1.5, 0xa5a995, 0.7);
              this.tiles.strokeRoundedRect(x - 5, y - 8, 10, 12, 5);
              this.tiles.fillStyle(0xa5a995, 0.7);
              this.tiles.fillRoundedRect(x - 8, y - 3, 16, 13, 3);
              this.tiles.fillStyle(0xdcd8cb, 1);
              this.tiles.fillCircle(x, y + 2, 1.6);
              next.push(null);
              continue;
            }

            const instance = state.board[index];
            next.push(instance ? `${instance.uid}:${instance.item}` : null);
            if (!instance || !ITEMS[instance.item]) continue;
            const def = ITEMS[instance.item];
            const item = this.add.container(x, y);
            if (this.textureReady) {
              const sprite = this.add.image(0, -3, 'food-atlas', def.icon).setDisplaySize(57, 57);
              item.add(sprite);
            } else {
              item.add(this.add.text(0, -6, def.name.slice(0, 3), { fontFamily: 'sans-serif', fontSize: '13px', color: '#466652' }).setOrigin(0.5));
            }
            const badge = this.add.graphics();
            badge.fillStyle(def.kind === 'dish' ? 0xd49454 : 0x69866a, 1);
            badge.fillRoundedRect(15, 15, 16, 15, 5);
            item.add(badge);
            item.add(this.add.text(23, 22.5, def.kind === 'dish' ? '成' : String(def.level), {
              fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#ffffff',
            }).setOrigin(0.5));
            this.contents.add(item);
            this.icons.set(index, item);
            if (this.dragged === index) item.setAlpha(0.18);

            if (this.previous.length && this.previous[index] !== next[index] && !state.settings.reducedMotion && this.dragged === null) {
              item.setScale(0.66);
              this.tweens.add({ targets: item, scaleX: 1, scaleY: 1, duration: 260, ease: 'Back.easeOut' });
              if (this.previous[index] && didMerge) this.sparkle(x, y);
            }
          }
          this.previous = next;
          this.previousMergeCount = state.stats.merges;
          this.paintHighlights();
        }

        private sparkle(x: number, y: number) {
          for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3;
            const dot = this.add.circle(x, y, i % 2 ? 2 : 3, i % 2 ? 0xe8bc69 : 0x83a47f).setDepth(10);
            this.tweens.add({ targets: dot, x: x + Math.cos(angle) * 31, y: y + Math.sin(angle) * 31, alpha: 0, scale: 0.4, duration: 390, ease: 'Cubic.easeOut', onComplete: () => dot.destroy() });
          }
        }
      }

      game = new Engine.Game({
        type: Engine.AUTO,
        parent: mount.current,
        width: WIDTH,
        height: HEIGHT,
        transparent: true,
        antialias: true,
        roundPixels: false,
        scene: PantryScene,
        scale: { mode: Engine.Scale.FIT, autoCenter: Engine.Scale.CENTER_BOTH, width: WIDTH, height: HEIGHT },
        input: { activePointers: 1, touch: { capture: true }, mouse: { preventDefaultWheel: false } },
        render: { antialias: true, pixelArt: false },
        audio: { noAudio: true },
        banner: false,
      });
    }).catch(error => {
      console.error('The pantry canvas could not start.', error);
      if (!disposed) setStatus('failed');
    });

    return () => {
      disposed = true;
      bridge.current = null;
      removeCancellationListeners?.();
      game?.destroy(true);
    };
  }, []);

  return <div className="board-shell" data-board-status={status}>
    <div ref={mount} className="phaser-board" style={{ width: '100%', aspectRatio: '7 / 8', touchAction: 'none', overflow: 'hidden', borderRadius: 16 }} />
    {status === 'loading' && <div className="board-loading" role="status">正在铺好料理台…</div>}
    {status === 'failed' && <p className="board-error" role="status">画布或插画加载遇到问题。可继续使用下方键盘棋盘，刷新后重试。</p>}
  </div>;
}

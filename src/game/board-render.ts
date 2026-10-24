import type Phaser from 'phaser';
import { activeDevices, BOARD_LAYOUT } from '../content/board-layouts';
import { ITEMS } from '../content/catalog';
import { itemPresentation, type ItemArtOverrides } from '../content/assets';
import { getApplianceStatus, getBoardEntity } from '../domain/engine';
import type { GameState, ItemInstance } from '../domain/types';
import { BoardEffects } from './board-fx';
import { BOARD_COLUMNS, BOARD_HEIGHT, BOARD_ROWS, BOARD_WIDTH, cellCenter, dropKind } from './board-input';

export interface ItemSprite {
  uid: string;
  item: string;
  index: number;
  container: Phaser.GameObjects.Container;
}
interface DeviceSprite {
  container: Phaser.GameObjects.Container;
  label: Phaser.GameObjects.Text;
  labelBack: Phaser.GameObjects.Graphics;
  activity: Phaser.GameObjects.Graphics;
  phase: string;
}

export const entityAsset = (id: string) => id;

export function itemTexture(scene: Phaser.Scene, item: string): { key: string; frame?: number } {
  const def = ITEMS[item];
  const key = `item:${def?.assetId ?? item}`;
  return scene.textures.exists(key) ? { key } : { key: 'legacy-foods', frame: def?.icon ?? 0 };
}

export function itemDisplaySize(item: string, art?: ItemArtOverrides): number {
  return itemPresentation(item, art).displaySize;
}

/** Static tiles, devices, UID-owned item sprites, and temporary FX are separate layers. */
export class BoardRenderer {
  readonly items = new Map<string, ItemSprite>();
  readonly devices = new Map<string, DeviceSprite>();
  readonly effects: BoardEffects;
  private tiles: Phaser.GameObjects.Graphics;
  private highlights: Phaser.GameObjects.Graphics;
  private crates: Phaser.GameObjects.Container;
  private previous: GameState | null = null;
  private gridSignature = '';
  private draggedUid: string | null = null;
  private lastClock = 0;

  constructor(private scene: Phaser.Scene, private state: () => GameState, private art?: ItemArtOverrides, private pixelRatio = 1) {
    this.tiles = scene.add.graphics().setDepth(0);
    this.highlights = scene.add.graphics().setDepth(2);
    this.crates = scene.add.container(0, 0).setDepth(1);
    this.effects = new BoardEffects(scene, () => state().settings.reducedMotion);
  }

  sync(animate = true) {
    const state = this.state();
    const devices = activeDevices(state);
    const signature = `${state.day}:${state.campaign}:${state.construction.completed.join(',')}:${devices.map(device => device.id).join(',')}`;
    if (signature !== this.gridSignature) {
      this.paintTiles();
      this.gridSignature = signature;
    }
    const liveUids = new Set<string>();
    const didMerge = !!this.previous && state.stats.merges > this.previous.stats.merges;
    const didGenerate = !!this.previous && state.stats.generated > this.previous.stats.generated;
    for (let index = 0; index < BOARD_COLUMNS * BOARD_ROWS; index++) {
      const entity = getBoardEntity(state, index);
      if (entity.kind === 'generator' || entity.kind === 'appliance') this.ensureDevice(entity.id, index);
      const instance = entity.item;
      if (entity.kind !== 'item' || !instance) continue;
      liveUids.add(instance.uid);
      let rendered = this.items.get(instance.uid);
      if (rendered && rendered.item !== instance.item) {
        this.scene.tweens.killTweensOf(rendered.container);
        rendered.container.destroy(true);
        this.items.delete(instance.uid);
        rendered = undefined;
      }
      const at = cellCenter(index);
      if (!rendered) {
        rendered = this.createItem(instance, index);
        this.items.set(instance.uid, rendered);
        if (animate && this.previous) {
          const producer = devices.find(device => getBoardEntity(state, device.index).chain === ITEMS[instance.item]?.chain);
          this.effects.appear(rendered.container, didMerge ? 'merge' : didGenerate ? 'generate' : 'collect', producer ? cellCenter(producer.index) : undefined);
        }
      } else if (rendered.index !== index) {
        rendered.index = index;
        if (animate) this.effects.move(rendered.container, at.x, at.y);
        else rendered.container.setPosition(at.x, at.y);
      }
      rendered.container.setAlpha(instance.uid === this.draggedUid ? 0.2 : 1);
    }
    for (const [uid, rendered] of this.items) {
      if (liveUids.has(uid)) continue;
      const receiver = state.appliances.find(appliance => appliance.inputSlots.some(input => input.uid === uid));
      if (animate && receiver) { const at = cellCenter(receiver.index); this.effects.stage(rendered.container, at.x, at.y); }
      else { this.scene.tweens.killTweensOf(rendered.container); rendered.container.destroy(true); }
      this.items.delete(uid);
    }
    for (const [id, device] of this.devices) {
      if (devices.some(def => def.id === id && getBoardEntity(state, def.index).id === id)) continue;
      this.scene.tweens.killTweensOf(device.container);
      device.container.destroy(true);
      this.devices.delete(id);
    }
    this.previous = state;
    this.updateClock(Date.now(), true);
  }

  private createItem(instance: ItemInstance, index: number): ItemSprite {
    const at = cellCenter(index);
    const def = ITEMS[instance.item];
    const container = this.scene.add.container(at.x, at.y).setDepth(5);
    const shadow = this.scene.add.ellipse(0, 16, 29, 7, 0x8d6443, 0.13);
    const texture = itemTexture(this.scene, instance.item);
    const presentation = itemPresentation(instance.item, this.art);
    const size = presentation.displaySize;
    const image = this.scene.add.image(presentation.offsetX, presentation.offsetY, texture.key, texture.frame).setDisplaySize(size, size);
    const badge = this.scene.add.graphics();
    badge.fillStyle(def.kind === 'dish' ? 0xf29b45 : 0x77ae64, 1);
    badge.fillRoundedRect(10, 10, 13, 13, 4);
    badge.lineStyle(1.5, 0xfffdf2, 1);
    badge.strokeRoundedRect(10, 10, 13, 13, 4);
    const level = this.scene.add.text(16.5, 16.5, def.kind === 'dish' ? '成' : `${def.level}`, { resolution: this.pixelRatio, fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#fffef5' }).setOrigin(0.5);
    container.add([shadow, image, badge, level]);
    return { uid: instance.uid, item: instance.item, index, container };
  }

  private ensureDevice(id: string, index: number) {
    if (this.devices.has(id)) return;
    const at = cellCenter(index);
    const entity = getBoardEntity(this.state(), index);
    const container = this.scene.add.container(at.x, at.y).setDepth(4);
    const shadow = this.scene.add.ellipse(0, 17, 37, 9, 0x795834, 0.17);
    const texture = `entity:${id}`;
    const image = this.scene.textures.exists(texture)
      ? this.scene.add.image(0, -2, texture).setDisplaySize(47, 47)
      : this.scene.add.text(0, 0, entity.name, { resolution: this.pixelRatio, fontFamily: 'sans-serif', fontSize: '10px', color: '#80552e', wordWrap: { width: 40 } }).setOrigin(0.5);
    const labelBack = this.scene.add.graphics();
    const activity = this.scene.add.graphics();
    const label = this.scene.add.text(0, -22, '', { resolution: this.pixelRatio, fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#fffef2' }).setOrigin(0.5);
    container.add([shadow, image, activity, labelBack, label]);
    this.devices.set(id, { container, label, labelBack, activity, phase: '' });
    if (entity.kind === 'generator') {
      labelBack.fillStyle(0xf7bc45, 1).fillRoundedRect(9, 10, 16, 14, 5);
      labelBack.lineStyle(1.5, 0xfff9df, 1).strokeRoundedRect(9, 10, 16, 14, 5);
      label.setText('1').setPosition(17, 17).setColor('#7e4b1d');
    }
  }

  private paintTiles() {
    this.tiles.clear();
    this.tiles.fillStyle(0xdfb98a, 1).fillRoundedRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT, 9);
    for (let index = 0; index < BOARD_COLUMNS * BOARD_ROWS; index++) {
      const at = cellCenter(index);
      const locked = getBoardEntity(this.state(), index).kind === 'blocker';
      this.tiles.fillStyle(locked ? 0xe6c6a0 : (Math.floor(index / BOARD_COLUMNS) + index % BOARD_COLUMNS) % 2 ? 0xffefd5 : 0xfff6e2, 1);
      this.tiles.fillRoundedRect(at.x - 24, at.y - 24, 48, 48, 5);
    }
    this.crates.removeAll(true);
    for (const block of BOARD_LAYOUT.blockers) {
      const entity = getBoardEntity(this.state(), block.index);
      if (entity.kind !== 'blocker') continue;
      const at = cellCenter(block.index);
      const width = block.footprint.length * 50 - 4;
      const band = this.scene.add.graphics();
      band.fillStyle(0xd3a66f, 0.4).fillRoundedRect(at.x - 23, at.y - 23, width, 46, 7);
      this.crates.add(band);
      for (let i = 0; i < block.footprint.length; i++) {
        if (this.scene.textures.exists('entity:crate')) {
          const crate = this.scene.add.image(at.x + i * 50, at.y + 1, 'entity:crate').setDisplaySize(45, 45).setAlpha(0.86);
          this.crates.add(crate);
        } else {
          const box = this.scene.add.graphics();
          const x = at.x + i * 50;
          box.fillStyle(0xdab47e).fillRoundedRect(x - 21, at.y - 18, 42, 38, 4);
          box.lineStyle(2, 0xaf8553).strokeRoundedRect(x - 21, at.y - 18, 42, 38, 4);
          box.fillStyle(0xe9c78f).fillRect(x - 4, at.y - 18, 8, 38);
          this.crates.add(box);
        }
      }
      const badgeX = BOARD_WIDTH / 2;
      const badge = this.scene.add.graphics();
      badge.fillStyle(0x94714c, 0.94).fillRoundedRect(badgeX - 52, at.y - 10, 104, 22, 10);
      badge.lineStyle(1.5, 0xfce6bd, 0.7).strokeRoundedRect(badgeX - 52, at.y - 10, 104, 22, 10);
      const text = this.scene.add.text(badgeX, at.y + 1, entity.name, { fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#fff5da' }).setOrigin(0.5);
      this.crates.add([badge, text]);
    }
  }

  highlight(selected: number | null, hint: [number, number] | null | undefined, hovered: number | null = null, dragged: number | null = null, tutorialTarget?: number | null) {
    this.highlights.clear();
    const state = this.state();
    const source = dragged ?? selected;
    for (let index = 0; index < BOARD_COLUMNS * BOARD_ROWS; index++) {
      const entity = getBoardEntity(state, index);
      if (entity.kind === 'blocker') continue;
      const at = cellCenter(index);
      const isSource = source === index;
      const matching = tutorialTarget == null && source !== null && dropKind(state, source, index) === 'merge';
      const isHint = tutorialTarget == null && hint?.includes(index);
      const isTutorialTarget = tutorialTarget === index;
      const over = hovered === index && dragged !== index;
      if (!isSource && !matching && !isHint && !over && !isTutorialTarget) continue;
      const kind = over && source !== null ? dropKind(state, source, index) : null;
      const color = kind === 'blocked' ? 0xe78265 : kind === 'stage' ? 0x62b9c0 : matching || isHint || isTutorialTarget ? 0xf1ba42 : 0x82b74e;
      this.highlights.fillStyle(color, over ? 0.25 : 0.13).fillRoundedRect(at.x - 23, at.y - 23, 46, 46, 8);
      this.highlights.lineStyle(isSource || over ? 2.5 : 1.7, color, 1).strokeRoundedRect(at.x - 23, at.y - 23, 46, 46, 8);
      if (matching || isHint) this.highlights.fillStyle(color, 1).fillCircle(at.x + 18, at.y - 18, 3);
      if (isTutorialTarget) {
        this.highlights.lineStyle(2.5, 0xf0ad37, 1).strokeRoundedRect(at.x - 23, at.y - 23, 46, 46, 8);
        this.highlights.fillStyle(0xffd366, 1).fillTriangle(at.x + 10, at.y - 23, at.x + 24, at.y - 23, at.x + 17, at.y - 12);
        this.highlights.lineStyle(1.5, 0xa6752e, 1).strokeTriangle(at.x + 10, at.y - 23, at.x + 24, at.y - 23, at.x + 17, at.y - 12);
      }
      if (over && kind !== 'blocked' && kind !== 'same') {
        this.highlights.lineStyle(2, color, 1).lineBetween(at.x - 4, at.y + 15, at.x - 1, at.y + 18).lineBetween(at.x - 1, at.y + 18, at.x + 5, at.y + 11);
      }
    }
  }

  setDragging(uid: string | null) {
    this.draggedUid = uid;
    for (const item of this.items.values()) item.container.setAlpha(item.uid === uid ? 0.2 : 1);
  }

  press(index: number) {
    const entity = getBoardEntity(this.state(), index);
    const container = entity.item ? this.items.get(entity.item.uid)?.container : this.devices.get(entity.id)?.container;
    if (container) {
      const at = cellCenter(index);
      container.setPosition(at.x, at.y);
      this.effects.press(container);
    }
  }

  reject(index: number) {
    const item = this.state().board[index];
    const sprite = item ? this.items.get(item.uid) : undefined;
    if (sprite) this.effects.reject(sprite.container);
  }

  updateClock(now: number, force = false) {
    if (!force && now - this.lastClock < 200) return;
    this.lastClock = now;
    const state = this.state();
    for (const device of activeDevices(state)) {
      if (device.kind !== 'appliance') continue;
      const visual = this.devices.get(device.id);
      if (!visual) continue;
      const status = getApplianceStatus(state, device.id, now);
      if (!status) continue;
      const phase = status.phase;
      const label = phase === 'cooking' ? `${Math.ceil(status.remaining / 1000)}s` : phase === 'ready' ? '领取' : phase === 'loaded' ? status.canStart ? '烹饪' : '待投料' : '';
      const color = phase === 'ready' ? 0x70ac4b : phase === 'cooking' ? 0xd78b43 : 0x79ad4c;
      visual.label.setText(label);
      visual.labelBack.clear();
      visual.activity.clear();
      if (label) visual.labelBack.fillStyle(color, 1).fillRoundedRect(-18, -29, 36, 14, 6);
      if (phase === 'cooking') {
        const progress = status.appliance.job ? Math.min(1, (now - status.appliance.job.startedAt) / Math.max(1, status.appliance.job.endsAt - status.appliance.job.startedAt)) : 0;
        visual.activity.fillStyle(0x805a38, 0.3).fillRoundedRect(-18, 20, 36, 4, 2);
        visual.activity.fillStyle(0xf7bd4d).fillRoundedRect(-18, 20, Math.max(3, 36 * progress), 4, 2);
        if (!state.settings.reducedMotion) {
          const rise = (now % 1500) / 1500;
          visual.activity.fillStyle(0xfffdf0, 0.7 * (1 - rise)).fillCircle(-7, -13 - rise * 14, 3 + rise * 2).fillCircle(7, -10 - rise * 15, 2 + rise * 2);
        }
      }
      if (phase === 'ready') {
        visual.activity.lineStyle(1.8, 0x8fc263, 0.9).strokeCircle(0, -2, 22);
        if (visual.phase === 'cooking') this.effects.burst(visual.container.x, visual.container.y - 8, 0x92c85f);
      }
      visual.phase = phase;
    }
  }

  settle() {
    this.effects.clear();
    for (const item of this.items.values()) {
      this.scene.tweens.killTweensOf(item.container);
      const at = cellCenter(item.index);
      item.container.setPosition(at.x, at.y).setScale(1).setAlpha(1);
    }
    for (const device of this.devices.values()) {
      this.scene.tweens.killTweensOf(device.container);
      device.container.setScale(1);
    }
  }
}

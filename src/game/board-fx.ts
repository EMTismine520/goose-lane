import type Phaser from 'phaser';

/** Small, bounded effects. No effect is allowed to own or delay a game transaction. */
export class BoardEffects {
  private particles = new Set<Phaser.GameObjects.Arc>();
  private lastBurst = 0;

  constructor(private scene: Phaser.Scene, private reduced: () => boolean) {}

  press(target: Phaser.GameObjects.Container) {
    this.scene.tweens.killTweensOf(target);
    target.setScale(1);
    if (this.reduced()) return;
    target.setScale(0.94);
    this.scene.tweens.add({ targets: target, scale: 1, duration: 100, ease: 'Back.easeOut' });
  }

  appear(target: Phaser.GameObjects.Container, kind: 'generate' | 'merge' | 'collect', origin?: { x: number; y: number }) {
    if (this.reduced()) return;
    const x = target.x;
    const y = target.y;
    if (kind === 'generate' && origin) {
      target.setPosition(origin.x, origin.y).setScale(0.5).setAlpha(0.8);
      this.scene.tweens.add({ targets: target, x, y, scale: 1, alpha: 1, duration: 230, ease: 'Back.easeOut' });
      return;
    }
    target.setScale(kind === 'merge' ? 0.35 : 0.7);
    this.scene.tweens.add({ targets: target, scale: 1, duration: kind === 'merge' ? 280 : 220, ease: 'Back.easeOut' });
    this.burst(x, y, kind === 'merge' ? 0xffc750 : 0x88c774);
  }

  move(target: Phaser.GameObjects.Container, x: number, y: number) {
    this.scene.tweens.killTweensOf(target);
    target.setScale(1).setAlpha(1);
    if (this.reduced()) target.setPosition(x, y);
    else this.scene.tweens.add({ targets: target, x, y, duration: 145, ease: 'Cubic.easeOut' });
  }

  reject(target: Phaser.GameObjects.Container) {
    if (this.reduced()) return;
    const x = target.x;
    this.scene.tweens.add({ targets: target, x: x + 3, duration: 42, yoyo: true, repeat: 1, onComplete: () => target.setX(x) });
  }

  burst(x: number, y: number, color = 0xffc750) {
    if (this.reduced() || this.particles.size >= 24 || this.scene.time.now - this.lastBurst < 70) return;
    this.lastBurst = this.scene.time.now;
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3 - Math.PI / 2;
      const particle = this.scene.add.circle(x, y, i % 2 ? 2 : 2.8, i % 2 ? 0xfffaf0 : color).setDepth(30);
      this.particles.add(particle);
      this.scene.tweens.add({ targets: particle, x: x + Math.cos(angle) * 25, y: y + Math.sin(angle) * 25, alpha: 0, scale: 0.3, duration: 300,
        onComplete: () => { this.particles.delete(particle); particle.destroy(); } });
    }
  }

  clear() {
    for (const particle of this.particles) {
      this.scene.tweens.killTweensOf(particle);
      particle.destroy();
    }
    this.particles.clear();
  }
}

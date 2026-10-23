import type { Settings } from '../domain/types';

export type SoundKind = 'merge' | 'generate' | 'deliver' | 'cook' | 'complete' | 'click' | 'upgrade';

export const SOUND_MOTIFS: Record<SoundKind, readonly number[]> = {
  click: [660], generate: [392, 523.25], merge: [523.25, 659.25, 783.99],
  cook: [293.66, 392, 440], complete: [880, 1174.66, 1046.5],
  deliver: [523.25, 659.25, 783.99, 1046.5], upgrade: [392, 523.25, 659.25, 783.99, 1046.5],
};

/** Original, locally synthesized score and sound effects: no downloads or copyrighted samples. */
class GooseAudio {
  private context: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private soundGain: GainNode | null = null;
  private settings: Settings = { music: true, sound: true, reducedMotion: false, volume: 0.45 };
  private timer: ReturnType<typeof setTimeout> | null = null;
  private beat = 0;
  private unlocked = false;
  private listening = false;
  private active = new Set<OscillatorNode>();
  private lastSound = -Infinity;
  private lastByKind = new Map<SoundKind, number>();

  async unlock(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!this.context) {
      const AudioConstructor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioConstructor) return;
      this.context = new AudioConstructor();
      this.musicGain = this.context.createGain();
      this.soundGain = this.context.createGain();
      this.musicGain.connect(this.context.destination);
      this.soundGain.connect(this.context.destination);
      if (!this.listening) {
        document.addEventListener('visibilitychange', this.visibility);
        this.listening = true;
      }
      this.configure(this.settings);
    }
    if (document.hidden) return;
    try {
      await this.context.resume();
      this.unlocked = true;
      this.schedule();
    } catch { /* Playback permission is retried on the next user gesture. */ }
  }

  configure(settings: Settings): void {
    this.settings = { ...settings, volume: Math.min(1, Math.max(0, settings.volume)) };
    if (!this.context) return;
    const now = this.context.currentTime;
    this.musicGain?.gain.setTargetAtTime(this.settings.music ? this.settings.volume * 0.18 : 0, now, 0.035);
    this.soundGain?.gain.setTargetAtTime(this.settings.sound ? this.settings.volume * 0.3 : 0, now, 0.015);
    if (settings.music) this.schedule();
    else this.stopSchedule();
  }

  play(kind: SoundKind): void {
    const context = this.context;
    if (!context || !this.unlocked || !this.settings.sound || document.hidden || context.state !== 'running') return;
    // Bound polyphony and rapid repeat clicks without affecting the authoritative game state.
    const cooldown = kind === 'click' ? 0.075 : kind === 'generate' ? 0.09 : 0.12;
    if (context.currentTime - this.lastSound < 0.025 || context.currentTime - (this.lastByKind.get(kind) ?? -Infinity) < cooldown) return;
    this.lastSound = context.currentTime;
    this.lastByKind.set(kind, context.currentTime);
    const duration = kind === 'click' ? 0.07 : kind === 'cook' ? 0.11 : 0.18;
    SOUND_MOTIFS[kind].forEach((pitch, i) => this.note(pitch, context.currentTime + i * 0.05, duration, this.soundGain!, kind === 'complete' ? 0.28 : 0.35, kind === 'cook' ? 'triangle' : 'sine'));
  }

  private note(pitch: number, when: number, duration: number, target: GainNode, loudness: number, type: OscillatorType): void {
    if (!this.context || this.active.size >= 32) return;
    const voice = this.context.createOscillator();
    const envelope = this.context.createGain();
    voice.type = type;
    voice.frequency.value = pitch;
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(loudness, when + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.001, when + duration);
    voice.connect(envelope);
    envelope.connect(target);
    this.active.add(voice);
    voice.onended = () => { this.active.delete(voice); voice.disconnect(); envelope.disconnect(); };
    voice.start(when);
    voice.stop(when + duration + 0.025);
  }

  private schedule(): void {
    if (this.timer || !this.context || !this.unlocked || !this.settings.music || document.hidden || this.context.state !== 'running') return;
    // An original sparse pentatonic miniature, with a low soft chord every eight beats.
    const melody = [523.25, 0, 659.25, 783.99, 0, 659.25, 587.33, 0, 440, 523.25, 0, 659.25, 587.33, 0, 523.25, 0];
    const index = this.beat++ % melody.length;
    const now = this.context.currentTime;
    if (melody[index]) this.note(melody[index], now, 1.05, this.musicGain!, 0.27, 'sine');
    if (index % 8 === 0) {
      const bass = index === 0 ? 130.81 : 110;
      [bass, bass * 1.5, bass * 2].forEach((pitch) => this.note(pitch, now, 3.2, this.musicGain!, 0.12, 'sine'));
    }
    this.timer = setTimeout(() => { this.timer = null; this.schedule(); }, 520);
  }

  private stopSchedule(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private visibility = (): void => {
    this.stopSchedule();
    if (!this.context) return;
    if (document.hidden) {
      this.active.forEach((voice) => { try { voice.stop(); } catch { /* Already stopped. */ } });
      void this.context.suspend().catch(() => undefined);
    } else if (this.unlocked) {
      void this.context.resume().then(() => this.schedule()).catch(() => undefined);
    }
  };

  dispose(): void {
    this.stopSchedule();
    if (this.listening) document.removeEventListener('visibilitychange', this.visibility);
    this.listening = false;
    this.unlocked = false;
    this.beat = 0;
    this.lastSound = -Infinity;
    this.lastByKind.clear();
    this.active.forEach((voice) => { try { voice.stop(); } catch { /* Already stopped. */ } });
    this.active.clear();
    if (this.context) void this.context.close().catch(() => undefined);
    this.context = null;
    this.musicGain = null;
    this.soundGain = null;
  }
}

export const audio = new GooseAudio();

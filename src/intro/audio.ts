import type { SoundCue } from './content';

/** Web Audio is an external resource, not React state. Created after a user gesture. */
export class AudioScene {
  private context: AudioContext;
  private master: GainNode;
  private noise: AudioBuffer;
  private sources = new Set<AudioScheduledSourceNode>();
  private effects = new Set<AudioScheduledSourceNode>();
  private loops: AudioScheduledSourceNode[] = [];

  constructor() {
    const Context =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) throw new Error('Web Audio is unavailable');
    this.context = new Context();
    this.master = this.context.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.context.destination);
    const n = this.context.sampleRate * 3;
    this.noise = this.context.createBuffer(1, n, this.context.sampleRate);
    const data = this.noise.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < n; i++) {
      brown = (brown + (Math.random() * 2 - 1) * 0.025) / 1.025;
      data[i] = brown * 3 + (Math.random() * 2 - 1) * 0.12;
    }
  }

  private track<T extends AudioScheduledSourceNode>(source: T, effect = true): T {
    this.sources.add(source);
    if (effect) this.effects.add(source);
    source.onended = () => {
      this.sources.delete(source);
      this.effects.delete(source);
    };
    return source;
  }
  mix(muted: boolean, volume: number) {
    if (this.context.state === 'closed') return;
    this.master.gain.setTargetAtTime(muted ? 0 : volume * 0.65, this.context.currentTime, 0.1);
  }
  async resume() {
    if (this.context.state !== 'closed') await this.context.resume();
  }
  async suspend() {
    if (this.context.state !== 'closed') await this.context.suspend();
  }
  start() {
    if (this.loops.length || this.context.state === 'closed') return;
    const rain = this.track(this.context.createBufferSource(), false);
    rain.buffer = this.noise;
    rain.loop = true;
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2600;
    const gain = this.context.createGain();
    gain.gain.value = 0.42;
    rain.connect(filter).connect(gain).connect(this.master);
    rain.start();
    this.loops.push(rain);
    for (const frequency of [55, 82.41]) {
      const tone = this.track(this.context.createOscillator(), false);
      const g = this.context.createGain();
      tone.frequency.value = frequency;
      g.gain.value = 0.018;
      tone.connect(g).connect(this.master);
      tone.start();
      this.loops.push(tone);
    }
  }
  private tone(frequency: number, seconds: number, strength: number, delay = 0) {
    const at = this.context.currentTime + delay;
    const osc = this.track(this.context.createOscillator());
    const gain = this.context.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(strength, at + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
    osc.connect(gain).connect(this.master);
    osc.start(at);
    osc.stop(at + seconds + 0.02);
  }
  private burst(seconds: number, strength: number, frequency: number, delay = 0) {
    const at = this.context.currentTime + delay;
    const source = this.track(this.context.createBufferSource());
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = this.noise;
    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    filter.Q.value = 0.8;
    gain.gain.setValueAtTime(strength, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
    source.connect(filter).connect(gain).connect(this.master);
    source.start(at);
    source.stop(at + seconds + 0.02);
  }
  cue(name: SoundCue) {
    if (this.context.state !== 'running') return;
    if (name === 'arrival') {
      this.tone(440, 0.5, 0.035);
      this.tone(330, 0.8, 0.025, 0.5);
    }
    if (name === 'steps') for (let i = 0; i < 5; i++) this.burst(0.15, 0.18, 170, i * 0.65);
    if (name === 'door') {
      this.burst(0.25, 0.18, 220);
      this.tone(95, 0.4, 0.03, 0.12);
    }
    if (name === 'reveal') {
      this.tone(164.81, 2, 0.045);
      this.tone(174.61, 2, 0.02, 0.4);
    }
    if (name === 'title') {
      this.tone(110, 2, 0.06);
      this.tone(164.81, 2, 0.035, 0.15);
      this.tone(220, 2, 0.02, 0.3);
    }
    if (name === 'page') this.burst(0.13, 0.065, 1900);
  }
  cancelCues() {
    for (const source of this.effects) {
      try {
        source.stop();
      } catch {
        /* Already ended. */
      }
    }
    this.effects.clear();
  }
  stop() {
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {
        /* Already ended. */
      }
    }
    this.sources.clear();
    this.effects.clear();
    this.loops = [];
  }
  async dispose() {
    this.stop();
    if (this.context.state !== 'closed') await this.context.close();
  }
}

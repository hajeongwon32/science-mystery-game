export function createShipSound() {
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0.42;
  master.connect(context.destination);

  const engine = context.createOscillator();
  const engineLevel = context.createGain();
  engine.type = 'triangle';
  engine.frequency.value = 35;
  engineLevel.gain.value = 0.08;
  engine.connect(engineLevel).connect(master);
  engine.start();

  const wash = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const washLevel = context.createGain();
  const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
  const samples = buffer.getChannelData(0);
  let previous = 0;
  for (let index = 0; index < samples.length; index++) {
    previous = 0.96 * previous + 0.04 * (Math.random() * 2 - 1);
    samples[index] = previous;
  }
  filter.type = 'lowpass';
  filter.frequency.value = 700;
  washLevel.gain.value = 0.24;
  wash.buffer = buffer;
  wash.loop = true;
  wash.connect(filter).connect(washLevel).connect(master);
  wash.start();

  return {
    mute(muted: boolean) {
      master.gain.setTargetAtTime(muted ? 0 : 0.42, context.currentTime, 0.08);
    },
    outdoors(outdoors: boolean) {
      washLevel.gain.setTargetAtTime(outdoors ? 0.62 : 0.15, context.currentTime, 0.18);
      filter.frequency.setTargetAtTime(outdoors ? 930 : 320, context.currentTime, 0.18);
    },
    knock() {
      const now = context.currentTime;
      for (const [frequency, level] of [
        [96, 0.3],
        [410, 0.055],
        [720, 0.025],
      ]) {
        const tone = context.createOscillator();
        const volume = context.createGain();
        tone.frequency.value = frequency;
        volume.gain.setValueAtTime(level, now);
        volume.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        tone.connect(volume).connect(master);
        tone.start(now);
        tone.stop(now + 0.34);
        tone.onended = () => {
          tone.disconnect();
          volume.disconnect();
        };
      }
    },
    resume: () => context.resume(),
    close: () => context.close(),
  };
}

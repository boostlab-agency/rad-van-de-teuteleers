/**
 * Alle geluiden worden live gesynthetiseerd met de Web Audio API:
 * geen audiobestanden nodig, werkt offline en laadt direct.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function ac(): AudioContext | null {
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.ratio.value = 6;
    master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Aanroepen bij een gebruikersactie zodat iOS audio toestaat */
export function unlockAudio() {
  const c = ac();
  if (!c || !master) return;
  const b = c.createBuffer(1, 1, 22050);
  const s = c.createBufferSource();
  s.buffer = b;
  s.connect(master);
  s.start(0);
}

function ready(): [AudioContext, GainNode] | null {
  if (!enabled) return null;
  const c = ac();
  if (!c || !master) return null;
  return [c, master];
}

function env(g: GainNode, t: number, peak: number, attack: number, dur: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

let noiseBuf: AudioBuffer | null = null;
function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

/** Koperblazer: twee licht ontstemde zaagtanden door een openende filter */
function brass(c: AudioContext, out: AudioNode, freq: number, t: number, dur: number, vol = 0.18, vibrato = 0) {
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.Q.value = 2;
  f.frequency.setValueAtTime(freq * 1.5, t);
  f.frequency.exponentialRampToValueAtTime(freq * 6, t + 0.06);
  f.frequency.exponentialRampToValueAtTime(freq * 3, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
  g.gain.setValueAtTime(vol * 0.8, t + Math.max(0.05, dur - 0.08));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  f.connect(g).connect(out);
  for (const det of [-6, 7]) {
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(freq, t);
    o.detune.value = det;
    if (vibrato) {
      const lfo = c.createOscillator();
      const lg = c.createGain();
      lfo.frequency.value = 5.5;
      lg.gain.value = vibrato;
      lfo.connect(lg).connect(o.frequency);
      lfo.start(t);
      lfo.stop(t + dur);
    }
    o.connect(f);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
}

function drum(c: AudioContext, out: AudioNode, t: number, vol = 0.25, freq = 1800) {
  const s = noise(c);
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  const g = c.createGain();
  env(g, t, vol, 0.002, 0.12);
  s.connect(f).connect(g).connect(out);
  s.start(t, Math.random() * 0.5, 0.15);
}

function kick(c: AudioContext, out: AudioNode, t: number, vol = 0.5) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.15);
  env(g, t, vol, 0.003, 0.2);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 0.22);
}

const N = (n: number) => 440 * Math.pow(2, (n - 69) / 12); // midi → Hz

export const sound = {
  tick(intensity = 1) {
    const r = ready();
    if (!r) return;
    const [c, out] = r;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(1500 + Math.random() * 400, t);
    o.frequency.exponentialRampToValueAtTime(420, t + 0.03);
    env(g, t, 0.07 * intensity, 0.001, 0.035);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.05);
  },

  pop() {
    const r = ready();
    if (!r) return;
    const [c, out] = r;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(380, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.07);
    env(g, t, 0.18, 0.005, 0.1);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.12);
  },

  whoosh() {
    const r = ready();
    if (!r) return;
    const [c, out] = r;
    const t = c.currentTime;
    const s = noise(c);
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(2600, t + 0.35);
    f.frequency.exponentialRampToValueAtTime(500, t + 0.7);
    const g = c.createGain();
    env(g, t, 0.35, 0.08, 0.7);
    s.connect(f).connect(g).connect(out);
    s.start(t, 0, 0.75);
  },

  boing() {
    const r = ready();
    if (!r) return;
    const [c, out] = r;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    const lfo = c.createOscillator();
    const lg = c.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(520, t + 0.12);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.55);
    lfo.frequency.value = 22;
    lg.gain.value = 40;
    lfo.connect(lg).connect(o.frequency);
    env(g, t, 0.35, 0.01, 0.6);
    o.connect(g).connect(out);
    o.start(t);
    lfo.start(t);
    o.stop(t + 0.62);
    lfo.stop(t + 0.62);
    kick(c, out, t, 0.4);
  },

  /** Tetteretèt! Carnavalsfanfare met hoempa-bas en trom */
  fanfare() {
    const r = ready();
    if (!r) return;
    const [c, out] = r;
    const t = c.currentTime + 0.02;
    const b = 0.13;
    const melody: [number, number, number][] = [
      [67, 0, 1], [67, 1, 1], [67, 2, 1], [72, 3, 3],
      [76, 6, 1], [74, 7, 1], [76, 8, 1], [79, 9, 6],
    ];
    for (const [n, s, d] of melody) {
      brass(c, out, N(n), t + s * b, d * b * 0.95, 0.14);
      brass(c, out, N(n - 12), t + s * b, d * b * 0.95, 0.07);
    }
    const bass: [number, number][] = [[48, 3], [43, 5], [48, 6], [43, 8], [48, 9]];
    for (const [n, s] of bass) brass(c, out, N(n), t + s * b, b * 0.9, 0.16);
    for (let i = 0; i < 16; i++) {
      if (i % 2 === 0) kick(c, out, t + i * b * 0.98, 0.35);
      drum(c, out, t + i * b * 0.98, i >= 9 ? 0.22 : 0.12, 2400);
    }
    // bekkenslag
    const s = noise(c);
    const hf = c.createBiquadFilter();
    hf.type = 'highpass';
    hf.frequency.value = 5000;
    const g = c.createGain();
    env(g, t + 9 * b, 0.25, 0.005, 1.2);
    s.connect(hf).connect(g).connect(out);
    s.start(t + 9 * b, 0, 1.2);
  },

  /** Treurige trombone: wah wah wah waaaah */
  sad() {
    const r = ready();
    if (!r) return;
    const [c, out] = r;
    const t = c.currentTime + 0.02;
    const notes = [55, 54, 53];
    notes.forEach((n, i) => brass(c, out, N(n), t + i * 0.42, 0.38, 0.16));
    brass(c, out, N(52), t + 3 * 0.42, 1.3, 0.16, 6);
  },

  /** Glinsterend arpeggio voor de Geluksvogel */
  lucky() {
    const r = ready();
    if (!r) return;
    const [c, out] = r;
    const t = c.currentTime;
    [72, 76, 79, 84, 88, 91, 96].forEach((n, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'triangle';
      o.frequency.value = N(n);
      env(g, t + i * 0.06, 0.12, 0.005, 0.5);
      o.connect(g).connect(out);
      o.start(t + i * 0.06);
      o.stop(t + i * 0.06 + 0.55);
    });
    window.setTimeout(() => sound.fanfare(), 380);
  },

  /** Kort tromgeroffel als het rad bijna stilstaat */
  roll() {
    const r = ready();
    if (!r) return;
    const [c, out] = r;
    const t = c.currentTime;
    for (let i = 0; i < 14; i++) drum(c, out, t + i * 0.045, 0.05 + i * 0.008, 1500);
  },
};

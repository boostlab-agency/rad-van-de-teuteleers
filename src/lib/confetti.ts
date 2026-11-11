import confetti from 'canvas-confetti';

let enabled = true;
export function setConfettiEnabled(v: boolean) {
  enabled = v;
}

const COLORS = ['#5db130', '#f08d24', '#ffffff', '#ffd23f', '#2f6b17', '#ffb366'];
const GOLD = ['#ffd23f', '#ffe9a3', '#f5b301', '#ffffff', '#5db130'];
const Z = 9999;

type Shape = confetti.Shape;
let shapes: Shape[] | null = null;

/** Sokjes- en carnavals-emoji als confetti-vormen (indien ondersteund) */
function emojiShapes(): Shape[] {
  if (shapes) return shapes;
  const c = confetti as unknown as { shapeFromText?: (o: { text: string; scalar?: number }) => Shape };
  shapes = c.shapeFromText ? ['🧦', '🎉', '🍺'].map((text) => c.shapeFromText!({ text, scalar: 2 })) : [];
  return shapes;
}

export const fx = {
  burst(x = 0.5, y = 0.55, power = 1) {
    if (!enabled) return;
    confetti({ particleCount: Math.round(140 * power), spread: 100, startVelocity: 48 * power, origin: { x, y }, colors: COLORS, zIndex: Z, scalar: 1.1 });
    const s = emojiShapes();
    if (s.length)
      confetti({ particleCount: Math.round(18 * power), spread: 120, startVelocity: 40 * power, origin: { x, y }, shapes: s, scalar: 2.2, zIndex: Z, flat: true } as confetti.Options);
  },

  cannons() {
    if (!enabled) return;
    const end = Date.now() + 1400;
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: COLORS, zIndex: Z, startVelocity: 60 });
      confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: COLORS, zIndex: Z, startVelocity: 60 });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  },

  gold() {
    if (!enabled) return;
    const end = Date.now() + 2200;
    const s = emojiShapes();
    const frame = () => {
      confetti({ particleCount: 4, startVelocity: 0, ticks: 300, gravity: 0.6, origin: { x: Math.random(), y: -0.05 }, colors: GOLD, shapes: ['star', 'circle'], scalar: 1.3, zIndex: Z });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    confetti({ particleCount: 160, spread: 160, startVelocity: 55, origin: { x: 0.5, y: 0.5 }, colors: GOLD, shapes: ['star'], scalar: 1.4, zIndex: Z });
    if (s.length) confetti({ particleCount: 14, spread: 140, origin: { x: 0.5, y: 0.5 }, shapes: [s[0]], scalar: 2.4, zIndex: Z, flat: true } as confetti.Options);
  },

  sockRain(duration = 2500) {
    if (!enabled) return;
    const s = emojiShapes();
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 2,
        startVelocity: 0,
        ticks: 260,
        gravity: 0.7,
        origin: { x: Math.random(), y: -0.05 },
        ...(s.length ? { shapes: [s[0]], scalar: 2.6, flat: true } : { colors: COLORS }),
        zIndex: Z,
      } as confetti.Options);
      confetti({ particleCount: 3, startVelocity: 0, ticks: 260, origin: { x: Math.random(), y: -0.05 }, colors: COLORS, zIndex: Z });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  },
};

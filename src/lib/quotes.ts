export const QUOTES = [
  'Te laat is ook op tijd voor volgend jaar.',
  'Da hedde gij mooi verdiend.',
  'Ge zijt de sjaak, kameraod.',
  'Een Teuteleer is nooit te laat. De rest is gewoon te vroeg.',
  'Kruikenstad wacht op niemand.',
  'Nie lullen, mar draaien.',
  'Hedde gij oe wekker weer in oew sok gestopt?',
  'Alaaf! En nou draaien, gij.',
  'Wie te laat komt, trakteert. Zo simpel is ‘t.',
  'Tilburg, waar zelfs de klok carnaval viert.',
  'Schrobbelèr in de hand, straf aan de wand.',
  'Mee de kop in de wolken en mee de voeten te laat.',
  'Ook een sok kan op tijd komen. Behalve deze.',
  'Ge kunt beter een uur te vroeg zijn dan één minuut te laat. Zeggen ze.',
  'Het rad liegt nooit, kameraod.',
  'Eerst draaien, dan zeuren.',
  'Op tijd komen is voor mensen zonder fantasie.',
];

export const SPIN_SHOUTS = ['Alaaf!', 'Daar gaat ie!', 'Hou je sokken vast!', 'Spannend hè?', 'Tetteretèt!'];

export function randomFrom<T>(list: readonly T[]): T {
  return list[Math.floor(rand() * list.length)];
}

/** Cryptografisch willekeurig getal in [0, 1) */
export function rand(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 2 ** 32;
  }
  return Math.random();
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

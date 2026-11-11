import type { Punishment, Settings } from './types';

const p = (id: string, emoji: string, label: string, kind: Punishment['kind'] = 'normal', confetti = false): Punishment => ({
  id,
  emoji,
  label,
  kind,
  confetti,
});

export const DEFAULT_PUNISHMENTS: Punishment[] = [
  p('jas', '🧥', 'Jas onder je kiel'),
  p('pils', '🍺', 'Rondje pils halen', 'normal', true),
  p('schrob', '🥃', 'Rondje schrob halen', 'normal', true),
  p('barkruipen', '🐛', 'Bar kruipen bij Heuvel 15 van begin tot eind', 'normal', true),
  p('gingezeik', '🍸', 'Meeloopstage bij Gin Gezeik'),
  p('schoonmaken', '🧽', 'Woensdag Heuvel 15 schoonmaken'),
  p('nogeens', '🔁', 'Draai nog een keer', 'again'),
  p('fiets', '🚲', 'Kruip onder een fiets'),
  p('logeren', '🛏️', 'Avond niet in je eigen huis slapen'),
  p('bak', '🍻', 'Trek een bak', 'normal', true),
  p('naarhuis', '🏠', 'Direct naar huis', 'home'),
  p('haring', '🐟', 'Woensdag haring happen in een café gekozen door de rest'),
  p('worstenbrood', '🌭', 'Worstenbroodje zonder handen eten'),
  p('geluk', '🍀', 'Geluksvogel', 'lucky', true),
];

export const DEFAULT_SETTINGS: Settings = { sound: true, dark: true, confetti: true };

export const STORAGE_KEYS = {
  punishments: 'teut:punishments:v1',
  history: 'teut:history:v1',
  settings: 'teut:settings:v1',
} as const;

export const ADMIN_PIN = '1111';

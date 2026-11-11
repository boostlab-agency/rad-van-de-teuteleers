export type PunishmentKind = 'normal' | 'again' | 'lucky' | 'home';

export interface Punishment {
  id: string;
  label: string;
  emoji: string;
  kind: PunishmentKind;
  /** Confetti-explosie bij deze uitkomst */
  confetti: boolean;
}

export interface SpinRecord {
  id: string;
  /** Eén te-laat-moment; "Draai nog een keer" deelt dezelfde lateId */
  lateId: string;
  name: string;
  punishmentId: string;
  label: string;
  emoji: string;
  kind: PunishmentKind;
  ts: number;
}

export interface Settings {
  sound: boolean;
  dark: boolean;
  confetti: boolean;
}

export type Tab = 'rad' | 'fame' | 'opties';

export const KIND_INFO: Record<PunishmentKind, { label: string; hint: string }> = {
  normal: { label: 'Straf', hint: 'Gewone straf, telt mee voor Sjaak van het Jaar' },
  again: { label: 'Nog een keer', hint: 'Speler moet direct opnieuw draaien' },
  lucky: { label: 'Geluksvogel', hint: 'Geen straf, telt voor het Geluksvogel Klassement' },
  home: { label: 'Naar huis', hint: 'Treurige trombone, telt als straf' },
};

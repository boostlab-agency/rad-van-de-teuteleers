import type { SpinRecord } from './types';

/** Carnavalsseizoen start op 11-11. Seizoen 2026 = 11 nov 2026 t/m 10 nov 2027 */
export function seasonOf(ts: number): number {
  const d = new Date(ts);
  const y = d.getFullYear();
  return ts >= new Date(y, 10, 11).getTime() ? y : y - 1;
}

export const seasonLabel = (y: number) => `${y}–'${String((y + 1) % 100).padStart(2, '0')}`;

export const isElfElf = (d = new Date()) => d.getMonth() === 10 && d.getDate() === 11;

export type Metric = 'late' | 'sjaak' | 'lucky';

export interface Row {
  key: string;
  name: string;
  count: number;
  last: number;
}

const keyOf = (name: string) => name.trim().toLowerCase();

export function leaderboard(records: SpinRecord[], metric: Metric): Row[] {
  const map = new Map<string, Row & { lateIds: Set<string> }>();
  for (const r of records) {
    const key = keyOf(r.name);
    let row = map.get(key);
    if (!row) {
      row = { key, name: r.name, count: 0, last: 0, lateIds: new Set() };
      map.set(key, row);
    }
    if (r.ts >= row.last) {
      row.last = r.ts;
      row.name = r.name;
    }
    if (metric === 'late') row.lateIds.add(r.lateId);
    else if (metric === 'sjaak' && (r.kind === 'normal' || r.kind === 'home')) row.count++;
    else if (metric === 'lucky' && r.kind === 'lucky') row.count++;
  }
  return [...map.values()]
    .map(({ lateIds, ...row }) => (metric === 'late' ? { ...row, count: lateIds.size } : row))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count || b.last - a.last);
}

export function lateCount(records: SpinRecord[], name: string, season: number): number {
  const key = keyOf(name);
  return new Set(records.filter((r) => keyOf(r.name) === key && seasonOf(r.ts) === season).map((r) => r.lateId)).size;
}

/** Bekende namen, meest gebruikte eerst */
export function knownNames(records: SpinRecord[]): string[] {
  return leaderboard(records, 'late').map((r) => r.name);
}

export function timeAgo(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'zojuist';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min geleden`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} uur geleden`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} ${d === 1 ? 'dag' : 'dagen'} geleden`;
  return new Date(ts).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

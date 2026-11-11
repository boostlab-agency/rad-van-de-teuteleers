/** Breekt een straf op in 1–3 regels en kiest de grootst passende lettergrootte */
export function layoutLabel(label: string, radialSpace: number, maxFont = 15): { lines: string[]; size: number } {
  const words = label.trim().split(/\s+/);
  let best = { lines: [label], size: 0 };
  const heightCap = [maxFont, maxFont * 0.8, maxFont * 0.64];
  for (let k = 1; k <= 3; k++) {
    const target = Math.ceil(label.length / k);
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      if (cur && (cur + ' ' + w).length > target + 2 && lines.length < k - 1) {
        lines.push(cur);
        cur = w;
      } else cur = cur ? cur + ' ' + w : w;
    }
    lines.push(cur);
    const longest = Math.max(...lines.map((l) => l.length));
    const size = Math.min(heightCap[k - 1], radialSpace / (longest * 0.52));
    if (size > best.size + 0.4) best = { lines, size };
  }
  return best;
}

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { SpinRecord } from '../lib/types';
import { leaderboard, seasonLabel, seasonOf, timeAgo, type Metric } from '../lib/stats';
import { sokGroen, sokOranje } from '../lib/assets';

const METRICS: { id: Metric; label: string; emoji: string; title: string; unit: string; empty: string }[] = [
  { id: 'late', label: 'Te laat', emoji: '⏰', title: 'Te Laat Hall of Fame', unit: '× te laat', empty: 'Nog niemand te laat. Verdacht…' },
  { id: 'sjaak', label: 'Sjaak', emoji: '🤡', title: 'Grootste Sjaak van het Jaar', unit: 'straffen', empty: 'Nog geen straffen uitgedeeld. Saai!' },
  { id: 'lucky', label: 'Geluk', emoji: '🍀', title: 'Geluksvogel Klassement', unit: '× geluk', empty: 'Nog geen geluksvogels. Het rad is streng.' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

export default function HallOfFame({ history }: { history: SpinRecord[] }) {
  const [metric, setMetric] = useState<Metric>('late');
  const seasons = useMemo(() => [...new Set(history.map((r) => seasonOf(r.ts)))].sort((a, b) => b - a), [history]);
  const current = seasonOf(Date.now());
  const [season, setSeason] = useState<number | 'all'>(current);
  const filtered = useMemo(() => (season === 'all' ? history : history.filter((r) => seasonOf(r.ts) === season)), [history, season]);
  const rows = useMemo(() => leaderboard(filtered, metric), [filtered, metric]);
  const meta = METRICS.find((m) => m.id === metric)!;
  const max = rows[0]?.count ?? 1;
  const recent = useMemo(() => [...history].sort((a, b) => b.ts - a.ts).slice(0, 8), [history]);
  const seasonOptions = [...new Set([current, ...seasons])];

  const podium = rows.slice(0, 3);
  const podiumOrder = [podium[1], podium[0], podium[2]];

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-6">
      <h1 className="mb-1 text-center font-display text-3xl">{meta.title}</h1>
      <p className="mb-4 text-center text-sm font-bold opacity-60">Eeuwige roem (of schaamte) in Kruikenstad</p>

      {/* segmented control */}
      <div className="glass relative mb-3 grid grid-cols-3 rounded-2xl p-1">
        {METRICS.map((m) => (
          <button key={m.id} onClick={() => setMetric(m.id)} className="relative z-10 rounded-xl py-2.5 text-sm font-extrabold">
            {metric === m.id && (
              <motion.span layoutId="seg" className="absolute inset-0 -z-10 rounded-xl bg-teut-orange shadow" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
            )}
            <span className={metric === m.id ? 'text-white' : ''}>
              {m.emoji} {m.label}
            </span>
          </button>
        ))}
      </div>

      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
        {seasonOptions.map((s) => (
          <Chip key={s} active={season === s} onClick={() => setSeason(s)}>
            Seizoen {seasonLabel(s)}
          </Chip>
        ))}
        <Chip active={season === 'all'} onClick={() => setSeason('all')}>
          Aller tijden
        </Chip>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${metric}-${season}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          {rows.length === 0 ? (
            <div className="glass flex flex-col items-center rounded-3xl px-6 py-10 text-center">
              <div className="mb-3 flex">
                <img src={sokOranje} alt="" className="h-20 wiggle" />
                <img src={sokGroen} alt="" className="h-20 wiggle" style={{ animationDelay: '.25s' }} />
              </div>
              <div className="font-display text-xl">{meta.empty}</div>
            </div>
          ) : (
            <>
              {/* podium */}
              <div className="mb-5 grid grid-cols-3 items-end gap-2">
                {podiumOrder.map((r, i) => {
                  if (!r) return <div key={i} />;
                  const place = i === 1 ? 0 : i === 0 ? 1 : 2;
                  const h = [140, 104, 84][place];
                  return (
                    <div key={r.key} className="flex flex-col items-center">
                      <motion.div
                        className="mb-1 text-3xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: place === 0 ? [-8, 8, -8] : 0 }}
                        transition={{ scale: { delay: 0.3 + place * 0.1, type: 'spring' }, rotate: { repeat: Infinity, duration: 1.4 } }}
                      >
                        {place === 0 ? '👑' : MEDALS[place]}
                      </motion.div>
                      <div className="mb-1 max-w-full truncate px-1 text-center text-sm font-black">{r.name}</div>
                      <motion.div
                        className="flex w-full flex-col items-center justify-start rounded-t-2xl pt-2 text-white shadow-lg"
                        style={{
                          background: place === 0 ? 'linear-gradient(180deg,#ffd23f,#f08d24)' : place === 1 ? 'linear-gradient(180deg,#a3e07a,#5db130)' : 'linear-gradient(180deg,#ffb366,#c4650b)',
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: h }}
                        transition={{ delay: 0.1 + place * 0.1, type: 'spring', stiffness: 120, damping: 14 }}
                      >
                        <span className="font-display text-3xl drop-shadow">{r.count}</span>
                        <span className="text-[10px] font-black uppercase opacity-90">{meta.unit}</span>
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                {rows.map((r, i) => (
                  <motion.div
                    key={r.key}
                    className="glass flex items-center gap-3 rounded-2xl px-4 py-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i, 10) * 0.04 }}
                  >
                    <div className="w-7 text-center font-display text-lg opacity-70">{i < 3 ? MEDALS[i] : i + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-extrabold">{r.name}</div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-teut-green to-teut-orange"
                          initial={{ width: 0 }}
                          animate={{ width: `${(r.count / max) * 100}%` }}
                          transition={{ delay: 0.2 + i * 0.04, duration: 0.6 }}
                        />
                      </div>
                    </div>
                    <div className="font-display text-2xl tabular-nums">{r.count}</div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {recent.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-display text-xl">Laatste slachtoffers</h2>
          <div className="flex flex-col gap-2">
            {recent.map((r) => (
              <div key={r.id} className="glass flex items-center gap-3 rounded-2xl px-4 py-2.5">
                <span className="text-2xl">{r.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black">{r.name}</div>
                  <div className="truncate text-xs font-bold opacity-60">{r.label}</div>
                </div>
                <div className="shrink-0 text-[11px] font-bold opacity-50">{timeAgo(r.ts)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${active ? 'bg-teut-green text-white shadow-md' : 'glass opacity-80'}`}
    >
      {children}
    </button>
  );
}

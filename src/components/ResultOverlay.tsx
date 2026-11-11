import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import type { Punishment, SpinRecord } from '../lib/types';
import { sokGroen, sokOranje } from '../lib/assets';
import { QUOTES, randomFrom } from '../lib/quotes';
import { sound } from '../lib/sound';
import { fx } from '../lib/confetti';
import { toast } from '../lib/toast';

interface Props {
  record: SpinRecord;
  punishment: Punishment;
  lateThisSeason: number;
  onAgain: () => void;
  onNext: () => void;
  onClose: () => void;
}

const THEME = {
  normal: { from: '#f08d24', to: '#5db130', title: 'moet…', rays: 'rgba(255,210,63,.18)' },
  again: { from: '#7c3aed', to: '#f08d24', title: 'mag nog een keer!', rays: 'rgba(255,255,255,.14)' },
  lucky: { from: '#ffd23f', to: '#5db130', title: 'is een…', rays: 'rgba(255,240,170,.35)' },
  home: { from: '#334155', to: '#0d2a0a', title: 'moet…', rays: 'rgba(255,255,255,.06)' },
} as const;

function badgeFor(n: number): string | null {
  if (n === 11) return '👑 11× te laat: Prins(es) Carnaval van de Laatkomers!';
  if (n >= 10) return `🏆 ${n}× te laat dit seizoen. Legendarisch.`;
  if (n === 5) return '🖐️ 5× te laat: high five, sjaak!';
  if (n === 3) return '🎩 Hattrick! 3× te laat dit seizoen';
  if (n === 2) return '✌️ Alweer jij? 2e keer dit seizoen';
  return null;
}

export default function ResultOverlay({ record, punishment, lateThisSeason, onAgain, onNext, onClose }: Props) {
  const kind = punishment.kind;
  const theme = THEME[kind];
  const quote = useMemo(() => (kind === 'lucky' ? 'Geluk zit in een klein sokje.' : kind === 'home' ? 'Doei! Morgen beter, kameraod.' : randomFrom(QUOTES)), [kind]);
  const words = punishment.label.split(' ');
  const badge = kind === 'again' ? null : badgeFor(lateThisSeason);

  useEffect(() => {
    if (kind === 'home') {
      sound.sad();
    } else if (kind === 'lucky') {
      sound.lucky();
      fx.gold();
    } else {
      sound.fanfare();
      if (punishment.confetti) {
        fx.burst(0.5, 0.5, 1.1);
        fx.cannons();
      } else fx.burst(0.5, 0.35, 0.45);
    }
    navigator.vibrate?.([80, 60, 120]);
  }, [kind, punishment.confetti]);

  const share = async () => {
    const text =
      kind === 'lucky'
        ? `🍀 ${record.name} kwam te laat bij De Teuteleers… en draaide GELUKSVOGEL! Onterecht. #RadVanDeTeuteleers`
        : `🧦 ${record.name} kwam te laat bij De Teuteleers en moet: ${punishment.emoji} ${punishment.label}! Alaaf! #RadVanDeTeuteleers`;
    const url = window.location.origin;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Rad van de Teuteleers', text, url });
        return;
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast('Gekopieerd! Plak ‘m in de groepsapp', '📋');
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden px-6 pb-safe pt-safe"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at 50% 40%, ${theme.from} 0%, ${theme.to} 55%, #061505 100%)` }}
        initial={{ scale: 0, borderRadius: '50%' }}
        animate={{ scale: 2.4, borderRadius: '0%' }}
        transition={{ duration: 0.6, ease: [0.2, 0.9, 0.3, 1] }}
      />
      {/* zonnestralen */}
      <div className="pointer-events-none absolute left-1/2 top-[38%] h-[180vmax] w-[180vmax] -translate-x-1/2 -translate-y-1/2">
        <div className="rays h-full w-full" style={{ background: `repeating-conic-gradient(${theme.rays} 0deg 10deg, transparent 10deg 20deg)` }} />
      </div>

      {/* zwaaiende sokjes */}
      <motion.img
        src={sokOranje}
        alt=""
        className="pointer-events-none absolute -bottom-6 -left-6 w-32 sm:w-40"
        initial={{ y: 200, rotate: -30 }}
        animate={{ y: 0, rotate: [12, -4, 12] }}
        transition={{ y: { delay: 0.5, type: 'spring', stiffness: 120 }, rotate: { repeat: Infinity, duration: 1.2, delay: 0.5 } }}
      />
      <motion.img
        src={sokGroen}
        alt=""
        className="pointer-events-none absolute -bottom-6 -right-6 w-32 sm:w-40"
        initial={{ y: 200, rotate: 30 }}
        animate={{ y: 0, rotate: [-10, 6, -10] }}
        transition={{ y: { delay: 0.6, type: 'spring', stiffness: 120 }, rotate: { repeat: Infinity, duration: 1.1, delay: 0.6 } }}
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center text-white">
        <motion.div
          className="font-display text-xl text-white/90 drop-shadow"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="rounded-full bg-black/25 px-4 py-1.5">{record.name}</span> {theme.title}
        </motion.div>

        <motion.div
          className="my-4 text-[110px] leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,.35)]"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 11 }}
        >
          <motion.span
            className="inline-block"
            animate={kind === 'home' ? { y: [0, 8, 0], rotate: [-3, 3, -3] } : { y: [0, -14, 0], rotate: [-8, 8, -8] }}
            transition={{ repeat: Infinity, duration: kind === 'home' ? 2 : 0.9, ease: 'easeInOut' }}
          >
            {punishment.emoji}
          </motion.span>
        </motion.div>

        <h2 className="font-display text-[clamp(2.2rem,10vw,3.6rem)] leading-[1.02] text-outline">
          {words.map((w, i) => (
            <motion.span
              key={i}
              className={`mr-[0.22em] inline-block ${kind === 'lucky' ? 'shimmer-text' : ''}`}
              initial={{ y: 60, opacity: 0, scale: 0.4, rotate: -12 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.55 + i * 0.08, type: 'spring', stiffness: 300, damping: 14 }}
            >
              {w}
            </motion.span>
          ))}
        </h2>

        {badge && (
          <motion.div
            className="mt-4 rounded-full bg-white/20 px-4 py-1.5 text-sm font-black backdrop-blur"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 1.1 }}
          >
            {badge}
          </motion.div>
        )}

        <motion.p
          className="mt-4 max-w-xs text-base font-extrabold italic text-white/85"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          “{quote}”
        </motion.p>

        <motion.div
          className="mt-8 flex w-full flex-col gap-3"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.15, type: 'spring' }}
        >
          {kind === 'again' ? (
            <motion.button className="btn-orange w-full text-2xl" onClick={onAgain} animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 0.9 }}>
              🔁 Draai nog een keer!
            </motion.button>
          ) : (
            <button className="btn-orange w-full text-xl" onClick={onNext}>
              🎡 Opnieuw draaien
            </button>
          )}
          <div className="flex gap-3">
            <button className="btn flex-1 bg-white/20 text-white backdrop-blur" onClick={share}>
              📣 Delen
            </button>
            {kind !== 'again' && (
              <button className="btn flex-1 bg-black/25 text-white backdrop-blur" onClick={onClose}>
                Klaar
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

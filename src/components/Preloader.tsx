import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { logo, SOCKS, sokGroen } from '../lib/assets';
import { fx } from '../lib/confetti';
import { sound } from '../lib/sound';

/**
 * Openingsanimatie (± 5 s):
 * donker → sokjes vliegen binnen → optocht-rondje → vormen het logo → glow →
 * sokjes knallen uit elkaar als confetti → één sokje komt TE LAAT aanrennen,
 * botst tegen het logo → de app verschijnt.
 */
type Phase = 'dark' | 'fly' | 'parade' | 'form' | 'burst' | 'late' | 'bump' | 'out';

const TIMELINE: [Phase, number][] = [
  ['fly', 200],
  ['parade', 1250],
  ['form', 2150],
  ['burst', 2750],
  ['late', 3250],
  ['bump', 4350],
];
/** Zodra het late sokje tegen het logo knalt, verschijnt de app */
const DONE_AT = 4550;
const COUNT = 12;

const order: Phase[] = ['dark', 'fly', 'parade', 'form', 'burst', 'late', 'bump', 'out'];
const atLeast = (p: Phase, q: Phase) => order.indexOf(p) >= order.indexOf(q);

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('dark');
  const { vw, vh } = useMemo(() => ({ vw: window.innerWidth, vh: window.innerHeight }), []);
  const R = Math.min(vw, vh) * 0.34;
  const logoW = Math.min(vw * 0.62, 300);

  const socks = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const a = (i / COUNT) * Math.PI * 2;
        const from = i * 2.39996; // gulden hoek → overal vandaan
        const dist = Math.max(vw, vh) * 0.9;
        return {
          i,
          src: SOCKS[i % 2],
          a,
          sx: Math.cos(from) * dist,
          sy: Math.sin(from) * dist,
          spin: (i % 2 ? 1 : -1) * (360 + i * 40),
          burstA: a + (Math.random() - 0.5) * 0.6,
          burstD: Math.max(vw, vh) * (0.7 + Math.random() * 0.4),
        };
      }),
    [vw, vh],
  );

  useEffect(() => {
    const timers = TIMELINE.map(([p, t]) => window.setTimeout(() => setPhase(p), t));
    timers.push(window.setTimeout(onDone, DONE_AT));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  useEffect(() => {
    if (phase === 'burst') fx.burst(0.5, 0.45, 0.9);
    if (phase === 'bump') {
      sound.boing();
      navigator.vibrate?.(60);
    }
  }, [phase]);

  const sockAnim = (s: (typeof socks)[number]) => {
    const cx = Math.cos(s.a) * R;
    const cy = Math.sin(s.a) * R;
    switch (phase) {
      case 'dark':
        return { x: s.sx, y: s.sy, rotate: s.spin, scale: 0.9, opacity: 1 };
      case 'fly':
      case 'parade':
        return { x: cx, y: cy, rotate: 0, scale: 1, opacity: 1 };
      case 'form':
        return { x: 0, y: 0, rotate: s.spin / 4, scale: 0.25, opacity: 0 };
      default:
        return {
          x: [0, Math.cos(s.burstA) * s.burstD],
          y: [0, Math.sin(s.burstA) * s.burstD],
          rotate: [0, s.spin * 2],
          scale: [0.4, 1.2],
          opacity: [1, 1, 0],
        };
    }
  };

  const sockTransition = (s: (typeof socks)[number]) => {
    if (phase === 'fly' || phase === 'parade') return { type: 'spring' as const, stiffness: 70, damping: 13, delay: s.i * 0.045 };
    if (phase === 'form') return { duration: 0.5, ease: [0.6, 0, 0.9, 0.4] as const, delay: s.i * 0.015 };
    return { duration: 1.1, ease: 'easeOut' as const };
  };

  const showSocks = phase !== 'late' && phase !== 'bump' && phase !== 'out';

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden bg-[#050d04]"
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      onClick={() => phase !== 'dark' && atLeast(phase, 'parade') && onDone()}
    >
      {/* sfeerlicht */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: atLeast(phase, 'fly') ? 1 : 0 }}
        transition={{ duration: 1.2 }}
        style={{
          background:
            'radial-gradient(60% 45% at 50% 45%, rgba(93,177,48,.35) 0%, rgba(13,42,10,.4) 45%, transparent 75%), radial-gradient(40% 30% at 50% 60%, rgba(240,141,36,.25), transparent 70%)',
        }}
      />

      {/* spotlights */}
      {[-1, 1].map((d) => (
        <motion.div
          key={d}
          className="absolute left-1/2 top-[-20%] h-[140%] w-[60vw] origin-top"
          style={{
            background: `linear-gradient(180deg, ${d < 0 ? 'rgba(240,141,36,.22)' : 'rgba(93,177,48,.22)'}, transparent 75%)`,
            clipPath: 'polygon(45% 0, 55% 0, 100% 100%, 0 100%)',
            x: '-50%',
          }}
          initial={{ rotate: d * 35, opacity: 0 }}
          animate={{ rotate: [d * 35, d * -20, d * 25], opacity: atLeast(phase, 'fly') ? 1 : 0 }}
          transition={{ rotate: { duration: 4, ease: 'easeInOut' }, opacity: { duration: 0.8 } }}
        />
      ))}

      <div className="absolute left-1/2 top-[45%] h-0 w-0">
        {/* optocht van sokjes */}
        {showSocks && (
          <motion.div
            className="absolute left-0 top-0"
            animate={{ rotate: phase === 'parade' ? 220 : phase === 'form' ? 300 : 0 }}
            transition={{ duration: phase === 'parade' ? 1 : 0.5, ease: 'easeInOut' }}
          >
            {socks.map((s) => (
              <motion.div
                key={s.i}
                className="absolute"
                style={{ left: -32, top: -36, width: 64, height: 72 }}
                initial={{ x: s.sx, y: s.sy, rotate: s.spin, opacity: 1 }}
                animate={sockAnim(s)}
                transition={sockTransition(s)}
              >
                <motion.img
                  src={s.src}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,.5)]"
                  animate={phase === 'parade' ? { y: [0, -14, 0], rotate: [-12, 12, -12] } : { y: 0, rotate: 0 }}
                  transition={phase === 'parade' ? { duration: 0.42, repeat: Infinity, delay: s.i * 0.06 } : { duration: 0.2 }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* logo */}
        <motion.div
          className="absolute"
          style={{ width: logoW, left: -logoW / 2, top: -logoW * 0.4 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={
            phase === 'out'
              ? { scale: 1.5, opacity: 0, rotate: 0 }
              : phase === 'bump'
                ? { scale: [1, 0.86, 1.1, 1], rotate: [0, 9, -5, 0], x: [0, 26, -8, 0], opacity: 1 }
                : atLeast(phase, 'form')
                  ? { scale: [0.2, 1.18, 1], opacity: 1, rotate: [-20, 6, 0] }
                  : { scale: 0, opacity: 0 }
          }
          transition={
            phase === 'bump'
              ? { duration: 0.55, ease: 'easeOut' }
              : phase === 'out'
                ? { duration: 0.45, ease: 'easeIn' }
                : { duration: 0.75, ease: [0.2, 1.4, 0.4, 1] }
          }
        >
          {/* groen-oranje glow */}
          <motion.div
            className="absolute inset-[-30%] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(240,141,36,.65) 0%, rgba(93,177,48,.45) 40%, transparent 70%)',
              filter: 'blur(24px)',
            }}
            animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <img src={logo} alt="De Teuteleers" draggable={false} className="relative w-full drop-shadow-[0_0_24px_rgba(240,141,36,.55)]" />
          <motion.div
            className="relative mt-4 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={atLeast(phase, 'burst') ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.5 }}
          >
            <div className="font-display text-[13px] uppercase tracking-[0.35em] text-teut-orange">De Teuteleers</div>
            <div className="font-display text-3xl leading-tight text-white drop-shadow-[0_2px_0_#2f6b17]">Rad van de Teuteleers</div>
          </motion.div>
        </motion.div>

        {/* het sokje dat te laat komt */}
        <AnimatePresence>
          {(phase === 'late' || phase === 'bump') && (
            <motion.div
              className="absolute"
              style={{ width: 100, height: 116, left: -50, top: -40 }}
              initial={{ x: -vw / 2 - 120, y: 0 }}
              animate={
                phase === 'late'
                  ? { x: -logoW / 2 - 28, y: 0, rotate: 0 }
                  : { x: [-logoW / 2 - 28, -logoW / 2 - 100, -logoW / 2 - 140], y: [0, -70, vh], rotate: [0, -50, -200] }
              }
              exit={{ opacity: 0 }}
              transition={phase === 'late' ? { duration: 1.1, ease: [0.4, 0, 1, 1] } : { duration: 1, ease: 'easeIn', times: [0, 0.25, 1] }}
            >
              <motion.img
                src={sokGroen}
                alt=""
                draggable={false}
                className="h-full w-full object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,.5)]"
                animate={phase === 'late' ? { y: [0, -18, 0], rotate: [8, -8, 8] } : {}}
                transition={{ duration: 0.2, repeat: Infinity }}
              />
              {phase === 'late' && (
                <>
                  <motion.div
                    className="absolute -top-9 left-6 whitespace-nowrap rounded-2xl rounded-bl-none bg-white px-3 py-1 font-display text-sm text-teut-greenDeep shadow-lg"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: [-6, 4, -6] }}
                    transition={{ scale: { delay: 0.2, type: 'spring' }, rotate: { repeat: Infinity, duration: 0.6 } }}
                  >
                    WACHT OP MIJ!! 😱
                  </motion.div>
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="absolute bottom-0 left-0 h-4 w-4 rounded-full bg-white/40"
                      animate={{ x: [-4, -40], y: [0, -10], scale: [0.4, 1.6], opacity: [0.8, 0] }}
                      transition={{ duration: 0.45, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </>
              )}
              {phase === 'bump' && (
                <motion.div className="absolute -top-6 left-2 text-3xl" animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}>
                  💫
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOEM-tekst bij de botsing */}
        <AnimatePresence>
          {phase === 'bump' && (
            <motion.div
              className="absolute font-display text-5xl text-teut-orange text-outline"
              style={{ left: -logoW / 2 - 70, top: -logoW * 0.55 }}
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: [0, 1.4, 1], rotate: -12 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              BOEM!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* flits bij de botsing */}
      <AnimatePresence>
        {phase === 'bump' && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(circle at 40% 45%, rgba(255,255,255,.9), rgba(240,141,36,.5) 30%, transparent 65%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="absolute inset-x-0 bottom-10 text-center text-xs font-bold uppercase tracking-[0.3em] text-white/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: atLeast(phase, 'parade') ? 1 : 0 }}
      >
        Kruikenstad · Alaaf!
      </motion.div>
    </motion.div>
  );
}

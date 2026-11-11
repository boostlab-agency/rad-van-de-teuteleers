import { motion } from 'framer-motion';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { Punishment } from '../lib/types';
import { logo, sokGroen, sokOranje } from '../lib/assets';
import { layoutLabel } from '../lib/wheelText';
import { rand } from '../lib/quotes';
import { sound } from '../lib/sound';

export interface WheelHandle {
  spin: () => void;
  isSpinning: () => boolean;
}

interface Props {
  punishments: Punishment[];
  /** Mag er gedraaid worden? (bv. naam ingevuld). Wordt aangeroepen bij tik/swipe. */
  requestSpin: () => boolean;
  onSpinStart?: () => void;
  onSpinEnd: (p: Punishment) => void;
  onWildSpin?: () => void;
  onHubLongPress?: () => void;
}

const R_SEG = 186; // straal van de vakken
const R_RIM = 201; // straal van de sokjesrand
const HUB = 50;

// Fysica: dω/dt = −(μ + c·ω)  → constante wrijving + luchtweerstand.
const MU = 52;
const DRAG = 0.31;

type Seg = { p: Punishment; i: number; fill: string; d: string; mid: number };

function arcPath(a0: number, a1: number, r: number) {
  const rad = (a: number) => ((a - 90) * Math.PI) / 180;
  const x0 = Math.cos(rad(a0)) * r;
  const y0 = Math.sin(rad(a0)) * r;
  const x1 = Math.cos(rad(a1)) * r;
  const y1 = Math.sin(rad(a1)) * r;
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M0 0 L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

const Wheel = forwardRef<WheelHandle, Props>(function Wheel(
  { punishments, requestSpin, onSpinStart, onSpinEnd, onWildSpin, onHubLongPress },
  ref,
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rotorRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const rot = useRef(rand() * 360);
  const raf = useRef(0);
  const spinningRef = useRef(false);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [speedFx, setSpeedFx] = useState(0);
  const punRef = useRef(punishments);
  punRef.current = punishments;
  const cb = useRef({ onSpinEnd, onSpinStart, requestSpin, onWildSpin });
  cb.current = { onSpinEnd, onSpinStart, requestSpin, onWildSpin };

  const n = punishments.length;
  const seg = 360 / Math.max(n, 1);

  const apply = useCallback(() => {
    if (rotorRef.current) rotorRef.current.style.transform = `rotate(${rot.current}deg)`;
  }, []);

  useEffect(() => {
    apply();
    return () => cancelAnimationFrame(raf.current);
  }, [apply]);

  // reset markering als de straffen veranderen
  useEffect(() => setWinner(null), [punishments]);

  const flick = useCallback((dir: number, speed: number) => {
    const el = pointerRef.current;
    if (!el) return;
    const dur = Math.max(70, Math.min(260, (360 / Math.max(speed, 1)) * 60));
    el.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${-dir * 26}deg)` }, { transform: 'rotate(0deg)' }], {
      duration: dur,
      easing: 'cubic-bezier(.2,.8,.3,1)',
    });
  }, []);

  const startSpin = useCallback(
    (w0: number) => {
      if (spinningRef.current || punRef.current.length < 2) return;
      const segNow = 360 / punRef.current.length;
      spinningRef.current = true;
      setSpinning(true);
      setWinner(null);
      cb.current.onSpinStart?.();
      sound.whoosh();

      let omega = w0;
      let last = performance.now();
      let bucket = Math.floor(rot.current / segNow);
      let rolled = false;
      let fxFrame = 0;

      const step = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const dir = Math.sign(omega) || 1;
        let mag = Math.abs(omega);
        mag -= (MU + DRAG * mag) * dt;
        if (mag <= 0) {
          finish();
          return;
        }
        omega = dir * mag;
        rot.current += omega * dt;
        apply();

        const b = Math.floor(rot.current / segNow);
        if (b !== bucket) {
          bucket = b;
          sound.tick(Math.min(1, 0.45 + 300 / mag));
          flick(dir, mag);
          if (mag < 500) navigator.vibrate?.(4);
        }
        if (!rolled && mag < 140) {
          rolled = true;
          sound.roll();
        }
        if (++fxFrame % 6 === 0) setSpeedFx(Math.min(1, mag / 1800));
        raf.current = requestAnimationFrame(step);
      };

      const finish = () => {
        spinningRef.current = false;
        setSpinning(false);
        setSpeedFx(0);
        const list = punRef.current;
        const a = (((-rot.current % 360) + 360) % 360) / (360 / list.length);
        const idx = Math.floor(a) % list.length;
        setWinner(idx);
        navigator.vibrate?.([30, 40, 60]);
        window.setTimeout(() => cb.current.onSpinEnd(list[idx]), 850);
      };

      raf.current = requestAnimationFrame(step);
    },
    [apply, flick],
  );

  const randomOmega = () => (1050 + rand() * 750) * (rand() < 0.12 ? -1 : 1);

  useImperativeHandle(ref, () => ({ spin: () => startSpin(randomOmega()), isSpinning: () => spinningRef.current }), [startSpin]);

  /* ---------- swipen/slingeren ---------- */
  const drag = useRef({ active: false, last: 0, bucket: 0, samples: [] as { t: number; r: number }[] });
  const angleOf = (e: React.PointerEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2)) * 180) / Math.PI;
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (spinningRef.current) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { active: true, last: angleOf(e), bucket: Math.floor(rot.current / seg), samples: [{ t: performance.now(), r: rot.current }] };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const a = angleOf(e);
    let delta = a - d.last;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    d.last = a;
    rot.current += delta;
    apply();
    const b = Math.floor(rot.current / seg);
    if (b !== d.bucket) {
      d.bucket = b;
      sound.tick(0.6);
      flick(Math.sign(delta), 300);
    }
    const now = performance.now();
    d.samples.push({ t: now, r: rot.current });
    while (d.samples.length > 2 && now - d.samples[0].t > 110) d.samples.shift();
  };
  const onPointerUp = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    const s = d.samples;
    if (s.length < 2) return;
    const dt = (s[s.length - 1].t - s[0].t) / 1000;
    if (dt <= 0) return;
    const v = (s[s.length - 1].r - s[0].r) / dt;
    if (Math.abs(v) < 220) return;
    if (!cb.current.requestSpin()) return;
    if (Math.abs(v) > 2600) cb.current.onWildSpin?.();
    const w = Math.min(2900, Math.max(800, Math.abs(v) * 1.1)) * (0.88 + rand() * 0.24);
    startSpin(Math.sign(v) * w);
  };

  /* ---------- naaf (midden) ---------- */
  const press = useRef<number | null>(null);
  const longPressed = useRef(false);
  const hubDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    longPressed.current = false;
    press.current = window.setTimeout(() => {
      longPressed.current = true;
      onHubLongPress?.();
    }, 650);
  };
  const hubUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (press.current) clearTimeout(press.current);
    if (longPressed.current || spinningRef.current) return;
    if (cb.current.requestSpin()) startSpin(randomOmega());
  };

  /* ---------- geometrie ---------- */
  const segments: Seg[] = useMemo(() => {
    let alt = 0;
    return punishments.map((p, i) => {
      let fill: string;
      if (p.kind === 'lucky') fill = 'url(#g-gold)';
      else {
        fill = alt % 2 === 0 ? 'url(#g-green)' : 'url(#g-orange)';
        alt++;
      }
      return { p, i, fill, d: arcPath(i * seg, (i + 1) * seg, R_SEG), mid: (i + 0.5) * seg };
    });
  }, [punishments, seg]);
  // voorkomen dat eerste en laatste vak dezelfde kleur hebben
  const fixedSegments = useMemo(() => {
    if (segments.length < 3) return segments;
    const first = segments[0].fill;
    const last = segments[segments.length - 1];
    if (last.fill === first && last.p.kind !== 'lucky') return [...segments.slice(0, -1), { ...last, fill: 'url(#g-deep)' }];
    return segments;
  }, [segments]);

  const rotor = useMemo(
    () => (
      <svg viewBox="-230 -230 460 460" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id="g-green" cx="0" cy="0" r="190" gradientUnits="userSpaceOnUse">
            <stop offset="0.25" stopColor="#3f8f1d" />
            <stop offset="1" stopColor="#6cc63b" />
          </radialGradient>
          <radialGradient id="g-orange" cx="0" cy="0" r="190" gradientUnits="userSpaceOnUse">
            <stop offset="0.25" stopColor="#d66f0c" />
            <stop offset="1" stopColor="#ffa040" />
          </radialGradient>
          <radialGradient id="g-gold" cx="0" cy="0" r="190" gradientUnits="userSpaceOnUse">
            <stop offset="0.25" stopColor="#d99a00" />
            <stop offset="0.8" stopColor="#ffd23f" />
            <stop offset="1" stopColor="#fff1a8" />
          </radialGradient>
          <radialGradient id="g-deep" cx="0" cy="0" r="190" gradientUnits="userSpaceOnUse">
            <stop offset="0.25" stopColor="#1f5210" />
            <stop offset="1" stopColor="#2f7a1a" />
          </radialGradient>
          <linearGradient id="g-rim" x1="0" y1="-1" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#1b4a12" />
            <stop offset="0.5" stopColor="#0b2208" />
            <stop offset="1" stopColor="#1b4a12" />
          </linearGradient>
        </defs>

        {/* rand */}
        <circle r={R_RIM} fill="none" stroke="url(#g-rim)" strokeWidth={30} />
        <circle r={R_RIM + 15} fill="none" stroke="#f08d24" strokeWidth={3.5} />
        <circle r={R_RIM - 15} fill="none" stroke="#ffd23f" strokeWidth={2} opacity={0.8} />

        {/* vakken */}
        {fixedSegments.map((s) => (
          <path key={s.p.id} d={s.d} fill={s.fill} stroke="#0d2a0a" strokeWidth={2} />
        ))}

        {/* sokjes-watermerk in elk vak */}
        {fixedSegments.map((s) => (
          <g key={`wm-${s.p.id}`} transform={`rotate(${s.mid}) translate(0 -128) rotate(${s.i % 2 ? 18 : -18})`} opacity={0.16}>
            <image href={s.i % 2 ? sokOranje : sokGroen} x={-26} y={-30} width={52} height={60} />
          </g>
        ))}

        {/* teksten */}
        {fixedSegments.map((s) => {
          const { lines, size } = layoutLabel(s.p.label, 88, n > 16 ? 12 : 15);
          const lh = size * 1.05;
          const dark = s.p.kind === 'lucky';
          return (
            <g key={`t-${s.p.id}`} transform={`rotate(${s.mid - 90})`}>
              <text x={168} y={0} fontSize={20} textAnchor="middle" dominantBaseline="central" transform="rotate(90 168 0)">
                {s.p.emoji}
              </text>
              <text
                x={150}
                y={-((lines.length - 1) * lh) / 2}
                textAnchor="end"
                dominantBaseline="central"
                fontFamily="'Lilita One', system-ui"
                fontSize={size}
                fill={dark ? '#3a2500' : '#fff'}
                stroke={dark ? '#fff6c9' : '#0d2a0a'}
                strokeWidth={dark ? 2 : 3}
                strokeLinejoin="round"
                paintOrder="stroke fill"
                letterSpacing={0.3}
              >
                {lines.map((l, k) => (
                  <tspan key={k} x={150} dy={k === 0 ? 0 : lh}>
                    {l}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}

        {/* lampjes op het midden van elk vak */}
        {fixedSegments.map((s) => (
          <g key={`b-${s.p.id}`} transform={`rotate(${s.mid}) translate(0 ${-R_RIM})`}>
            <circle r={5.5} className={`bulb ${s.i % 2 ? 'alt' : ''}`} stroke="#3a2a00" strokeWidth={1} />
          </g>
        ))}

        {/* sokjes op de rand, op elke vakgrens = de pinnen waar de wijzer tegenaan tikt */}
        {fixedSegments.map((s) => (
          <g key={`s-${s.p.id}`} transform={`rotate(${s.i * seg}) translate(0 ${-R_RIM})`}>
            <image href={s.i % 2 ? sokGroen : sokOranje} x={-19} y={-23} width={38} height={46} style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.5))' }} />
          </g>
        ))}

        {/* winnaar-markering */}
        {winner != null && winner < n && (
          <path d={arcPath(winner * seg, (winner + 1) * seg, R_SEG)} fill="#fff" className="animate-pulse" opacity={0.35} />
        )}
      </svg>
    ),
    [fixedSegments, n, seg, winner],
  );

  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[440px] select-none ${spinning ? 'is-spinning' : ''}`}>
      {/* gloed achter het rad */}
      <motion.div
        className="absolute inset-[6%] rounded-full"
        style={{ background: 'conic-gradient(from 0deg, #f08d24, #5db130, #ffd23f, #f08d24)', filter: 'blur(28px)' }}
        animate={{ opacity: spinning ? 0.85 : 0.45, scale: spinning ? 1.06 : 1, rotate: 360 }}
        transition={{ opacity: { duration: 0.4 }, scale: { duration: 0.4 }, rotate: { duration: spinning ? 2 : 12, repeat: Infinity, ease: 'linear' } }}
      />

      <div
        ref={wrapRef}
        className="absolute inset-0 touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={rotorRef} className="absolute inset-0 will-change-transform">
          {rotor}
        </div>

        {/* glasglans (draait niet mee) */}
        <div
          className="pointer-events-none absolute inset-[9%] rounded-full"
          style={{
            background:
              'radial-gradient(120% 70% at 30% 15%, rgba(255,255,255,.38) 0%, rgba(255,255,255,.08) 35%, transparent 55%), radial-gradient(circle, transparent 60%, rgba(0,0,0,.25) 100%)',
          }}
        />
        {/* snelheidswaas */}
        <div
          className="pointer-events-none absolute inset-[9%] rounded-full transition-opacity duration-200"
          style={{
            opacity: speedFx * 0.55,
            background: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,.18) 0deg 3deg, transparent 3deg 14deg)',
            filter: 'blur(3px)',
          }}
        />

        {/* naaf met logo */}
        <motion.button
          type="button"
          aria-label="Draai aan het rad"
          onPointerDown={hubDown}
          onPointerUp={hubUp}
          onPointerCancel={() => press.current && clearTimeout(press.current)}
          className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center rounded-full"
          style={{
            width: `${((HUB * 2) / 460) * 100}%`,
            height: `${((HUB * 2) / 460) * 100}%`,
            x: '-50%',
            y: '-50%',
            background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #fff4df 45%, #f3d9a8 100%)',
            boxShadow: '0 0 0 5px #0d2a0a, 0 0 0 9px #f08d24, 0 10px 30px rgba(0,0,0,.45), inset 0 -6px 12px rgba(0,0,0,.12)',
          }}
          animate={spinning ? { scale: 0.96 } : { scale: [1, 1.06, 1] }}
          transition={spinning ? { duration: 0.2 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          whileTap={{ scale: 0.88 }}
        >
          <img src={logo} alt="" draggable={false} className={`pointer-events-none w-[70%] ${spinning ? 'wiggle' : ''}`} />
          <span className="pointer-events-none mt-0.5 font-display text-[11px] leading-none tracking-wider text-teut-orange sm:text-sm">
            {spinning ? 'Alaaf!' : 'DRAAI!'}
          </span>
        </motion.button>
      </div>

      {/* wijzer */}
      <div className="pointer-events-none absolute left-1/2 top-[-1.5%] z-10 w-[13%] -translate-x-1/2">
        <div ref={pointerRef} style={{ transformOrigin: '50% 22%' }}>
          <svg viewBox="0 0 60 84" className="w-full drop-shadow-[0_6px_8px_rgba(0,0,0,.45)]">
            <defs>
              <linearGradient id="ptr" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffb560" />
                <stop offset="1" stopColor="#e2730d" />
              </linearGradient>
            </defs>
            <path d="M30 82 L8 30 A24 24 0 1 1 52 30 Z" fill="url(#ptr)" stroke="#0d2a0a" strokeWidth={4} strokeLinejoin="round" />
            <circle cx={30} cy={20} r={9} fill="#fff7e8" stroke="#0d2a0a" strokeWidth={3} />
            <circle cx={30} cy={20} r={3.5} fill="#5db130" />
            <path d="M16 12 Q22 4 32 6" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.6} />
          </svg>
        </div>
      </div>
    </div>
  );
});

export default Wheel;

import { memo, useMemo } from 'react';
import { sokGroen, sokOranje } from '../lib/assets';

/** Feestelijke achtergrond: zwevende kleurvlekken, glitters en drijvende sokjes */
function Background() {
  const glitters = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 4 + Math.random() * 9,
        d: 2 + Math.random() * 3,
        delay: Math.random() * 4,
        color: ['#ffd23f', '#f08d24', '#5db130', '#ffffff'][i % 4],
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#fff3dc_0%,#fde8c4_40%,#e8f5dc_100%)] dark:bg-[radial-gradient(120%_80%_at_50%_0%,#1d5413_0%,#0d2a0a_55%,#061505_100%)]" />
      <div className="blob absolute -left-[20vw] -top-[10vh] h-[60vw] w-[60vw] max-h-[480px] max-w-[480px] rounded-full bg-teut-orange/40 blur-[80px] dark:bg-teut-orange/25" style={{ ['--d' as string]: '20s' }} />
      <div className="blob absolute -right-[25vw] top-[30vh] h-[70vw] w-[70vw] max-h-[520px] max-w-[520px] rounded-full bg-teut-green/40 blur-[90px] dark:bg-teut-green/30" style={{ ['--d' as string]: '26s' }} />
      <div className="blob absolute -bottom-[15vh] left-[10vw] h-[50vw] w-[50vw] max-h-[420px] max-w-[420px] rounded-full bg-[#ffd23f]/30 blur-[90px] dark:bg-[#ffd23f]/10" style={{ ['--d' as string]: '23s' }} />

      <img src={sokOranje} alt="" className="drift absolute -left-6 top-[58%] w-28 opacity-[0.08] dark:opacity-[0.07]" style={{ ['--d' as string]: '11s' }} />
      <img src={sokGroen} alt="" className="drift absolute -right-8 top-[14%] w-32 opacity-[0.08] dark:opacity-[0.07]" style={{ ['--d' as string]: '13s' }} />

      {glitters.map((g) => (
        <span
          key={g.i}
          className="twinkle absolute"
          style={{
            left: `${g.left}%`,
            top: `${g.top}%`,
            width: g.size,
            height: g.size,
            ['--d' as string]: `${g.d}s`,
            ['--delay' as string]: `${g.delay}s`,
          }}
        >
          <svg viewBox="0 0 10 10" className="h-full w-full">
            <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill={g.color} />
          </svg>
        </span>
      ))}

      {/* ruis-textuur voor een premium afwerking */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

export default memo(Background);

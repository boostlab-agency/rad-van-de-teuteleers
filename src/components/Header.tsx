import { motion } from 'framer-motion';
import { useRef } from 'react';
import { logo } from '../lib/assets';

interface Props {
  onGear: () => void;
  onSecret: () => void;
}

/** 11× op het logo tikken = Alaaf-modus 🎉 */
export default function Header({ onGear, onSecret }: Props) {
  const taps = useRef<number[]>([]);
  const tap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 4000), now];
    if (taps.current.length >= 11) {
      taps.current = [];
      onSecret();
    }
  };

  return (
    <header className="sticky top-0 z-30 px-4 pb-2 pt-safe">
      <div className="glass mx-auto flex max-w-lg items-center gap-3 rounded-full py-2 pl-2 pr-2">
        <motion.button whileTap={{ scale: 0.85, rotate: -10 }} onClick={tap} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-inner" aria-label="Logo De Teuteleers">
          <img src={logo} alt="" className="w-9" draggable={false} />
        </motion.button>
        <div className="min-w-0 flex-1 leading-none">
          <div className="truncate font-display text-[19px]">Rad van de Teuteleers</div>
          <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.22em] text-teut-orange">Kruikenstad · Alaaf</div>
        </div>
        <motion.button
          onClick={onGear}
          whileTap={{ scale: 0.85 }}
          whileHover={{ rotate: 90 }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
          aria-label="Beheer"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        </motion.button>
      </div>
    </header>
  );
}

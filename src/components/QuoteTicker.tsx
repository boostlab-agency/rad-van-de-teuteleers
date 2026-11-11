import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { QUOTES, rand } from '../lib/quotes';

export default function QuoteTicker() {
  const [i, setI] = useState(() => Math.floor(rand() * QUOTES.length));
  useEffect(() => {
    const t = window.setInterval(() => setI((x) => (x + 1 + Math.floor(rand() * (QUOTES.length - 1))) % QUOTES.length), 6500);
    return () => clearInterval(t);
  }, []);

  return (
    <button onClick={() => setI((x) => (x + 1) % QUOTES.length)} className="glass relative mx-auto flex min-h-[64px] w-full max-w-md items-center justify-center overflow-hidden rounded-3xl px-5 py-3">
      <span className="absolute left-3 top-1 font-display text-4xl leading-none text-teut-orange/40">“</span>
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          className="px-3 text-center text-[15px] font-extrabold italic leading-snug"
          initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
          transition={{ duration: 0.35 }}
        >
          {QUOTES[i]}
        </motion.p>
      </AnimatePresence>
    </button>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { onToast, type ToastMsg } from '../lib/toast';

export default function Toaster() {
  const [items, setItems] = useState<ToastMsg[]>([]);

  useEffect(
    () =>
      onToast((t) => {
        setItems((cur) => [...cur.slice(-2), t]);
        window.setTimeout(() => setItems((cur) => cur.filter((x) => x.id !== t.id)), 2800);
      }),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[200] flex flex-col items-center gap-2 px-4 pt-safe">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ y: -40, opacity: 0, scale: 0.9 }}
            animate={{ y: 8, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="glass-strong flex max-w-sm items-center gap-3 rounded-full px-4 py-2.5 text-sm font-extrabold shadow-xl"
          >
            <span className="text-xl">{t.emoji}</span>
            <span>{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

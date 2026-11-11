import { motion } from 'framer-motion';
import type { Tab } from '../lib/types';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'rad', label: 'Rad', emoji: '🎡' },
  { id: 'fame', label: 'Hall of Fame', emoji: '🏆' },
  { id: 'opties', label: 'Opties', emoji: '🎛️' },
];

export default function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-safe">
      <div className="glass-strong mx-auto mb-1 grid max-w-sm grid-cols-3 rounded-[28px] p-1.5 shadow-2xl">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button key={t.id} onClick={() => onChange(t.id)} className="relative flex flex-col items-center rounded-[22px] py-2">
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-teut-orange to-[#f5a34a] shadow-[0_6px_16px_-4px_rgba(240,141,36,.7)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              )}
              <motion.span className="relative text-xl" animate={{ scale: active ? 1.15 : 1, y: active ? -1 : 0 }}>
                {t.emoji}
              </motion.span>
              <span className={`relative text-[11px] font-black ${active ? 'text-white' : 'opacity-70'}`}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

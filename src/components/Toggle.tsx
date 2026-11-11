import { motion } from 'framer-motion';

export default function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-8 w-14 shrink-0 rounded-full p-1 transition-colors ${on ? 'bg-teut-green' : 'bg-black/20 dark:bg-white/20'}`}
    >
      <motion.span
        className="block h-6 w-6 rounded-full bg-white shadow-md"
        animate={{ x: on ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 600, damping: 32 }}
      />
    </button>
  );
}

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Sheet from './Sheet';
import { sokOranje } from '../lib/assets';

interface Props {
  open: boolean;
  names: string[];
  initial: string;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

const EXCUSES = ['De wekker was stuk', 'Fiets had een lekke band', 'Ik was er al, maar verstopt', 'Mijn oma belde', 'Ik stond bij de verkeerde kroeg'];

export default function NameSheet({ open, names, initial, onClose, onConfirm }: Props) {
  const [value, setValue] = useState(initial);
  const [shake, setShake] = useState(0);
  useEffect(() => {
    if (open) setValue(initial);
  }, [open, initial]);

  const submit = (v = value) => {
    const name = v.trim().slice(0, 24);
    if (!name) {
      setShake((s) => s + 1);
      return;
    }
    onConfirm(name);
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <img src={sokOranje} alt="" className="h-10 wiggle" />
          <span>Wie is de sjaak?</span>
        </div>
      }
    >
      <p className="-mt-2 mb-4 text-sm font-bold opacity-70">Wie kwam er te laat binnenwaaien? Smoesjes worden niet geaccepteerd.</p>
      <motion.form
        key={shake}
        animate={shake ? { x: [0, -14, 12, -8, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex gap-2"
      >
        <input
          autoFocus
          className="field"
          placeholder="Naam van de laatkomer…"
          value={value}
          maxLength={24}
          onChange={(e) => setValue(e.target.value)}
          enterKeyHint="go"
          autoComplete="off"
        />
        <button type="submit" className="btn-orange shrink-0 px-4">
          Draai!
        </button>
      </motion.form>

      {names.length > 0 && (
        <>
          <div className="mb-2 mt-5 text-xs font-extrabold uppercase tracking-widest opacity-60">Bekende laatkomers</div>
          <div className="no-scrollbar flex max-h-36 flex-wrap gap-2 overflow-y-auto">
            {names.slice(0, 18).map((n, i) => (
              <motion.button
                key={n}
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => submit(n)}
                className="glass rounded-full px-4 py-2 text-sm font-extrabold"
              >
                {n}
              </motion.button>
            ))}
          </div>
        </>
      )}
      <div className="mt-5 text-center text-xs font-bold italic opacity-50">
        Smoesje van de dag: “{EXCUSES[new Date().getDate() % EXCUSES.length]}” 🙄
      </div>
    </Sheet>
  );
}

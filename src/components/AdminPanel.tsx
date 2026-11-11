import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion';
import { useState } from 'react';
import type { Punishment, PunishmentKind, SpinRecord } from '../lib/types';
import { KIND_INFO } from '../lib/types';
import { ADMIN_PIN, DEFAULT_PUNISHMENTS } from '../lib/defaults';
import { uid } from '../lib/quotes';
import { toast } from '../lib/toast';
import { sound } from '../lib/sound';
import Toggle from './Toggle';
import { logo } from '../lib/assets';

interface Props {
  open: boolean;
  onClose: () => void;
  punishments: Punishment[];
  setPunishments: (p: Punishment[]) => void;
  history: SpinRecord[];
  setHistory: (h: SpinRecord[]) => void;
}

const UNLOCK_KEY = 'teut:admin-unlocked';

export default function AdminPanel(props: Props) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(UNLOCK_KEY) === '1';
    } catch {
      return false;
    }
  });

  return (
    <AnimatePresence>
      {props.open && (
        <motion.div
          className="fixed inset-0 z-[140] flex flex-col bg-teut-cream dark:bg-[#0a2108]"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        >
          <div className="flex items-center gap-3 border-b border-black/5 px-4 pb-3 pt-safe dark:border-white/10">
            <button onClick={props.onClose} className="glass flex h-10 w-10 items-center justify-center rounded-full text-xl" aria-label="Terug">
              ‹
            </button>
            <div className="flex-1">
              <div className="font-display text-xl leading-none">Beheer</div>
              <div className="text-xs font-bold opacity-60">Alleen voor de Raad van Elf</div>
            </div>
            <img src={logo} alt="" className="h-9" />
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto">
            {unlocked ? (
              <AdminContent {...props} />
            ) : (
              <PinGate
                onUnlock={() => {
                  setUnlocked(true);
                  try {
                    sessionStorage.setItem(UNLOCK_KEY, '1');
                  } catch {
                    /* */
                  }
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(0);
  const press = (d: string) => {
    sound.tick();
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      if (next === ADMIN_PIN) {
        sound.fanfare();
        window.setTimeout(onUnlock, 250);
      } else {
        setErr((e) => e + 1);
        navigator.vibrate?.(200);
        window.setTimeout(() => setPin(''), 350);
      }
    }
  };
  return (
    <div className="flex flex-col items-center px-6 pt-10">
      <div className="mb-2 text-5xl">🔐</div>
      <div className="mb-1 font-display text-2xl">Geheime code</div>
      <div className="mb-6 text-center text-sm font-bold opacity-60">Hint: wanneer begint het carnavalsseizoen?</div>
      <motion.div key={err} className="mb-8 flex gap-4" animate={err ? { x: [0, -16, 14, -10, 6, 0] } : {}} transition={{ duration: 0.4 }}>
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className={`h-4 w-4 rounded-full border-2 border-teut-orange ${i < pin.length ? 'bg-teut-orange' : ''}`}
            animate={{ scale: i < pin.length ? [1, 1.4, 1] : 1 }}
          />
        ))}
      </motion.div>
      <div className="grid w-full max-w-[280px] grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) =>
          k === '' ? (
            <div key={i} />
          ) : (
            <motion.button
              key={i}
              whileTap={{ scale: 0.88 }}
              onClick={() => (k === '⌫' ? setPin((p) => p.slice(0, -1)) : press(k))}
              className="glass aspect-square rounded-full font-display text-2xl"
            >
              {k}
            </motion.button>
          ),
        )}
      </div>
      {err > 2 && <div className="mt-6 text-center text-sm font-bold opacity-60">Psst… 11-11 🤫</div>}
    </div>
  );
}

function AdminContent({ punishments, setPunishments, history, setHistory }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎭');
  const [confirm, setConfirm] = useState<null | 'reset' | 'stats'>(null);

  const update = (id: string, patch: Partial<Punishment>) => setPunishments(punishments.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const remove = (id: string) => {
    if (punishments.length <= 2) {
      toast('Een rad met minder dan 2 vakken? Kom op zeg.', '🙅');
      return;
    }
    setPunishments(punishments.filter((p) => p.id !== id));
    toast('Straf verwijderd', '🗑️');
  };
  const move = (id: string, dir: -1 | 1) => {
    const i = punishments.findIndex((p) => p.id === id);
    const j = i + dir;
    if (j < 0 || j >= punishments.length) return;
    const next = [...punishments];
    [next[i], next[j]] = [next[j], next[i]];
    setPunishments(next);
  };
  const add = () => {
    const label = newLabel.trim();
    if (!label) return;
    if (punishments.length >= 24) {
      toast('Maximaal 24 vakken, anders wordt het onleesbaar', '🤏');
      return;
    }
    setPunishments([...punishments, { id: uid(), label: label.slice(0, 60), emoji: newEmoji.trim() || '🎭', kind: 'normal', confetti: false }]);
    setNewLabel('');
    sound.pop();
    toast('Straf toegevoegd aan het rad!', '✅');
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-16 pt-4">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="font-display text-2xl">Straffen ({punishments.length})</h2>
        <span className="text-xs font-bold opacity-50">Sleep ⠿ om te sorteren</span>
      </div>

      <Reorder.Group axis="y" values={punishments} onReorder={setPunishments} className="flex flex-col gap-2">
        {punishments.map((p, i) => (
          <Row
            key={p.id}
            p={p}
            first={i === 0}
            last={i === punishments.length - 1}
            open={editing === p.id}
            onToggle={() => setEditing(editing === p.id ? null : p.id)}
            onUpdate={(patch) => update(p.id, patch)}
            onRemove={() => remove(p.id)}
            onMove={(d) => move(p.id, d)}
          />
        ))}
      </Reorder.Group>

      <div className="glass mt-4 rounded-3xl p-4">
        <div className="mb-2 font-display text-lg">Nieuwe straf</div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <input className="field w-16 shrink-0 px-2 text-center text-xl" value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} maxLength={4} aria-label="Emoji" />
          <input className="field" placeholder="Bv. Polonaise door de kroeg" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} maxLength={60} />
          <button type="submit" className="btn-green shrink-0 px-4">
            +
          </button>
        </form>
      </div>

      <h2 className="mb-3 mt-8 font-display text-2xl">Gevarenzone</h2>
      <div className="glass flex flex-col gap-2 rounded-3xl p-4">
        <button
          className="rounded-2xl bg-black/5 px-4 py-3 text-left font-extrabold dark:bg-white/10"
          onClick={() => {
            if (!history.length) return toast('Er valt niks ongedaan te maken', '🤷');
            const last = [...history].sort((a, b) => b.ts - a.ts)[0];
            setHistory(history.filter((h) => h.id !== last.id));
            toast(`Laatste draai van ${last.name} geschrapt`, '↩️');
          }}
        >
          ↩️ Laatste draai ongedaan maken
        </button>
        <button className="rounded-2xl bg-black/5 px-4 py-3 text-left font-extrabold dark:bg-white/10" onClick={() => setConfirm('reset')}>
          🔄 Standaard straffen herstellen
        </button>
        <button className="rounded-2xl bg-red-500/15 px-4 py-3 text-left font-extrabold text-red-600 dark:text-red-400" onClick={() => setConfirm('stats')}>
          🧨 Alle statistieken wissen ({history.length} draaien)
        </button>
      </div>
      <p className="mt-3 text-center text-xs font-bold opacity-50">Alles wordt automatisch opgeslagen op dit toestel.</p>

      <AnimatePresence>
        {confirm && (
          <motion.div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass-strong w-full max-w-sm rounded-3xl p-6 text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <div className="mb-2 text-5xl">{confirm === 'reset' ? '🔄' : '🧨'}</div>
              <div className="mb-2 font-display text-2xl">Zeker weten?</div>
              <p className="mb-5 text-sm font-bold opacity-70">
                {confirm === 'reset' ? 'Alle aangepaste straffen worden vervangen door de originele lijst.' : 'Hall of Fame, Sjaak-ranglijst en Geluksvogels gaan voorgoed de prullenbak in.'}
              </p>
              <div className="flex gap-3">
                <button className="btn-ghost flex-1" onClick={() => setConfirm(null)}>
                  Nee
                </button>
                <button
                  className="btn-orange flex-1"
                  onClick={() => {
                    if (confirm === 'reset') {
                      setPunishments(DEFAULT_PUNISHMENTS);
                      toast('Origineel rad hersteld', '🎡');
                    } else {
                      setHistory([]);
                      toast('Schone lei! Iedereen weer onschuldig', '😇');
                    }
                    setConfirm(null);
                  }}
                >
                  Ja, doe maar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface RowProps {
  p: Punishment;
  first: boolean;
  last: boolean;
  open: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<Punishment>) => void;
  onRemove: () => void;
  onMove: (d: -1 | 1) => void;
}

function Row({ p, first, last, open, onToggle, onUpdate, onRemove, onMove }: RowProps) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={p} dragListener={false} dragControls={controls} className="glass relative rounded-2xl" whileDrag={{ scale: 1.03, zIndex: 10, boxShadow: '0 20px 40px rgba(0,0,0,.3)' }}>
      <div className="flex items-center gap-2 px-2 py-2">
        <button className="touch-none px-2 py-2 text-lg opacity-50" onPointerDown={(e) => controls.start(e)} aria-label="Verslepen">
          ⠿
        </button>
        <span className="text-2xl">{p.emoji}</span>
        <button className="min-w-0 flex-1 truncate py-2 text-left text-sm font-extrabold" onClick={onToggle}>
          {p.label}
          {p.kind !== 'normal' && <span className="ml-2 rounded-full bg-teut-orange/20 px-2 py-0.5 text-[10px] font-black uppercase text-teut-orangeDark dark:text-teut-orange">{KIND_INFO[p.kind].label}</span>}
        </button>
        <div className="flex flex-col">
          <button disabled={first} onClick={() => onMove(-1)} className="px-2 text-xs opacity-60 disabled:opacity-20" aria-label="Omhoog">
            ▲
          </button>
          <button disabled={last} onClick={() => onMove(1)} className="px-2 text-xs opacity-60 disabled:opacity-20" aria-label="Omlaag">
            ▼
          </button>
        </div>
        <button onClick={onToggle} className="px-2 text-lg" aria-label="Bewerken">
          ✏️
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-col gap-3 border-t border-black/5 p-3 dark:border-white/10">
              <div className="flex gap-2">
                <input className="field w-16 shrink-0 px-2 text-center text-xl" value={p.emoji} maxLength={4} onChange={(e) => onUpdate({ emoji: e.target.value })} aria-label="Emoji" />
                <input className="field" value={p.label} maxLength={60} onChange={(e) => onUpdate({ label: e.target.value })} aria-label="Straf" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(KIND_INFO) as PunishmentKind[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => onUpdate({ kind: k })}
                    className={`rounded-xl px-3 py-2 text-left text-xs font-extrabold transition ${p.kind === k ? 'bg-teut-green text-white' : 'bg-black/5 dark:bg-white/10'}`}
                  >
                    {KIND_INFO[k].label}
                    <div className="mt-0.5 text-[10px] font-bold opacity-70">{KIND_INFO[k].hint}</div>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold">🎊 Extra confetti</span>
                <Toggle label="Confetti" on={p.confetti} onChange={(v) => onUpdate({ confetti: v })} />
              </div>
              <button onClick={onRemove} className="rounded-xl bg-red-500/15 py-2.5 text-sm font-black text-red-600 dark:text-red-400">
                🗑️ Verwijderen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}

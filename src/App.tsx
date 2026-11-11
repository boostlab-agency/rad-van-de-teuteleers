import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Preloader from './components/Preloader';
import Background from './components/Background';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Wheel, { type WheelHandle } from './components/Wheel';
import NameSheet from './components/NameSheet';
import ResultOverlay from './components/ResultOverlay';
import HallOfFame from './components/HallOfFame';
import SettingsView from './components/SettingsView';
import AdminPanel from './components/AdminPanel';
import QuoteTicker from './components/QuoteTicker';
import Toaster from './components/Toaster';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_PUNISHMENTS, DEFAULT_SETTINGS, STORAGE_KEYS } from './lib/defaults';
import type { Punishment, Settings, SpinRecord, Tab } from './lib/types';
import { setSoundEnabled, sound, unlockAudio } from './lib/sound';
import { fx, setConfettiEnabled } from './lib/confetti';
import { isElfElf, knownNames, lateCount, seasonOf } from './lib/stats';
import { SPIN_SHOUTS, randomFrom, uid } from './lib/quotes';
import { toast } from './lib/toast';
import { sokGroen, sokOranje } from './lib/assets';

export default function App() {
  const [booted, setBooted] = useState(false);
  const [settings, setSettings] = useLocalStorage<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  const [punishments, setPunishments] = useLocalStorage<Punishment[]>(STORAGE_KEYS.punishments, DEFAULT_PUNISHMENTS);
  const [history, setHistory] = useLocalStorage<SpinRecord[]>(STORAGE_KEYS.history, []);

  const [tab, setTab] = useState<Tab>('rad');
  const [adminOpen, setAdminOpen] = useState(false);
  const [name, setName] = useState('');
  const [nameSheet, setNameSheet] = useState(false);
  const [result, setResult] = useState<{ record: SpinRecord; punishment: Punishment } | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [party, setParty] = useState(false);

  const wheelRef = useRef<WheelHandle>(null);
  const lateId = useRef<string | null>(null);
  const nameRef = useRef(name);
  nameRef.current = name;

  /* instellingen toepassen */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.dark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', settings.dark ? '#0d2a0a' : '#fff3dc');
    setSoundEnabled(settings.sound);
    setConfettiEnabled(settings.confetti);
  }, [settings]);

  const finishBoot = useCallback(() => setBooted(true), []);

  /* 11-11: het seizoen is geopend! */
  useEffect(() => {
    if (!booted || !isElfElf()) return;
    const t = window.setTimeout(() => {
      fx.cannons();
      toast('11-11! Het carnavalsseizoen is geopend!', '🎉');
    }, 600);
    return () => clearTimeout(t);
  }, [booted]);

  const names = useMemo(() => knownNames(history), [history]);

  /* -------- draaien -------- */
  const requestSpin = useCallback(() => {
    unlockAudio();
    if (result) return false;
    if (!nameRef.current.trim()) {
      setNameSheet(true);
      return false;
    }
    if (!lateId.current) lateId.current = uid();
    return true;
  }, [result]);

  const onSpinStart = useCallback(() => {
    setSpinning(true);
    const h = new Date().getHours();
    if (h >= 2 && h < 6) toast('Wa doede gij nog wakker? Draaien zal je!', '🦉');
    else if (Math.random() < 0.3) toast(randomFrom(SPIN_SHOUTS), '🥁');
  }, []);

  const onSpinEnd = useCallback(
    (p: Punishment) => {
      setSpinning(false);
      const record: SpinRecord = {
        id: uid(),
        lateId: lateId.current ?? uid(),
        name: nameRef.current.trim() || 'Anonieme sjaak',
        punishmentId: p.id,
        label: p.label,
        emoji: p.emoji,
        kind: p.kind,
        ts: Date.now(),
      };
      setHistory((h) => [...h, record]);
      setResult({ record, punishment: p });
    },
    [setHistory],
  );

  const confirmName = (n: string) => {
    unlockAudio();
    setName(n);
    nameRef.current = n;
    setNameSheet(false);
    lateId.current = uid();
    sound.pop();
    window.setTimeout(() => wheelRef.current?.spin(), 450);
  };

  const closeResult = () => {
    setResult(null);
    setName('');
    lateId.current = null;
  };

  const spinAgainSame = () => {
    setResult(null);
    window.setTimeout(() => wheelRef.current?.spin(), 500);
  };

  const nextPerson = () => {
    closeResult();
    window.setTimeout(() => setNameSheet(true), 350);
  };

  /* -------- easter eggs -------- */
  const alaafMode = () => {
    unlockAudio();
    setParty(true);
    sound.fanfare();
    fx.sockRain(3500);
    toast('ALAAF-MODUS ONTGRENDELD!', '🥳');
    window.setTimeout(() => setParty(false), 4500);
  };

  const sockDance = () => {
    unlockAudio();
    sound.boing();
    setParty(true);
    toast('De sokjes gaan los!', '🕺');
    window.setTimeout(() => setParty(false), 2500);
  };

  const lateThisSeason = result ? lateCount(history, result.record.name, seasonOf(result.record.ts)) : 0;

  return (
    <>
      <Background />
      <Toaster />

      <AnimatePresence>{!booted && <Preloader key="pre" onDone={finishBoot} />}</AnimatePresence>

      {booted && (
        <motion.div
          className="flex min-h-full flex-col"
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: [0.2, 0.9, 0.3, 1] }}
        >
          <Header onGear={() => setAdminOpen(true)} onSecret={alaafMode} />

          <main className="flex-1 pb-28">
            {/* Rad-tab blijft altijd gemount zodat een draaiend rad niet stopt */}
            <section className={tab === 'rad' ? 'block' : 'hidden'}>
              <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-4 pt-2">
                {isElfElf() && (
                  <motion.div
                    className="rounded-full bg-gradient-to-r from-teut-orange to-teut-green px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-glow"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [-2, 2, -2] }}
                    transition={{ rotate: { repeat: Infinity, duration: 2 } }}
                  >
                    🎉 11-11 · Het seizoen is geopend!
                  </motion.div>
                )}

                <button
                  onClick={() => !spinning && setNameSheet(true)}
                  className="glass group flex w-full max-w-md items-center gap-3 rounded-full py-2 pl-2 pr-4 text-left"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teut-orange to-teut-orangeDark text-lg text-white shadow">
                    ⏰
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-black uppercase tracking-widest opacity-60">Te laat binnengekomen</span>
                    <span className="block truncate font-display text-lg leading-tight">{name || 'Wie is de sjaak?'}</span>
                  </span>
                  <span className="text-xs font-black text-teut-orange">{name ? 'Wijzig' : 'Kies'}</span>
                </button>

                <div className="relative w-full">
                  {/* dansende sokjes naast het rad (easter egg: lang drukken op het midden) */}
                  <motion.img
                    src={sokOranje}
                    alt=""
                    className="pointer-events-none absolute -left-3 bottom-0 z-20 w-14 sm:-left-10 sm:w-20"
                    animate={party ? { y: [0, -40, 0], rotate: [0, -30, 20, 0] } : spinning ? { rotate: [-10, 10] } : { rotate: 0, y: 0 }}
                    transition={party ? { duration: 0.5, repeat: Infinity } : spinning ? { duration: 0.25, repeat: Infinity, repeatType: 'reverse' } : {}}
                  />
                  <motion.img
                    src={sokGroen}
                    alt=""
                    className="pointer-events-none absolute -right-3 bottom-0 z-20 w-14 sm:-right-10 sm:w-20"
                    animate={party ? { y: [0, -40, 0], rotate: [0, 30, -20, 0] } : spinning ? { rotate: [10, -10] } : { rotate: 0, y: 0 }}
                    transition={party ? { duration: 0.5, repeat: Infinity, delay: 0.15 } : spinning ? { duration: 0.25, repeat: Infinity, repeatType: 'reverse' } : {}}
                  />
                  <Wheel
                    ref={wheelRef}
                    punishments={punishments}
                    requestSpin={requestSpin}
                    onSpinStart={onSpinStart}
                    onSpinEnd={onSpinEnd}
                    onWildSpin={() => toast('Rustig aan! Ge draait ‘t rad nog uit z’n hengsels!', '🌪️')}
                    onHubLongPress={sockDance}
                  />
                </div>

                <p className="text-center text-xs font-bold opacity-55">Tik op het midden of geef het rad een flinke zwiep 👆</p>
                <QuoteTicker />
              </div>
            </section>

            <AnimatePresence mode="wait">
              {tab !== 'rad' && (
                <motion.section key={tab} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                  {tab === 'fame' && <HallOfFame history={history} />}
                  {tab === 'opties' && <SettingsView settings={settings} onChange={setSettings} />}
                </motion.section>
              )}
            </AnimatePresence>
          </main>

          <BottomNav
            tab={tab}
            onChange={(t) => {
              setTab(t);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </motion.div>
      )}

      <NameSheet open={nameSheet} names={names} initial={name} onClose={() => setNameSheet(false)} onConfirm={confirmName} />

      <AnimatePresence>
        {result && (
          <ResultOverlay
            key={result.record.id}
            record={result.record}
            punishment={result.punishment}
            lateThisSeason={lateThisSeason}
            onAgain={spinAgainSame}
            onNext={nextPerson}
            onClose={closeResult}
          />
        )}
      </AnimatePresence>

      <AdminPanel
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        punishments={punishments}
        setPunishments={setPunishments}
        history={history}
        setHistory={setHistory}
      />
    </>
  );
}

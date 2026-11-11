import type { Settings } from '../lib/types';
import Toggle from './Toggle';
import { sound } from '../lib/sound';
import { fx } from '../lib/confetti';
import { logo } from '../lib/assets';

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
}

export default function SettingsView({ settings, onChange }: Props) {
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => onChange({ ...settings, [k]: v });

  const rows: { k: keyof Settings; emoji: string; title: string; sub: string; test?: () => void }[] = [
    { k: 'sound', emoji: '🎺', title: 'Carnavalsgeluiden', sub: 'Tikken, toeters en tetteretèt', test: () => sound.fanfare() },
    { k: 'confetti', emoji: '🎊', title: 'Confetti-modus', sub: 'Sokjes en snippers bij elke uitslag', test: () => fx.burst(0.5, 0.6) },
    { k: 'dark', emoji: '🌙', title: 'Donkere modus', sub: 'Voor in de kroeg om 03:00' },
  ];

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-6">
      <h1 className="mb-5 text-center font-display text-3xl">Opties</h1>

      <div className="glass divide-y divide-black/5 overflow-hidden rounded-3xl dark:divide-white/10">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center gap-4 px-4 py-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teut-orange to-teut-green text-2xl shadow-inner">{r.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="font-extrabold">{r.title}</div>
              <div className="text-xs font-bold opacity-60">{r.sub}</div>
            </div>
            {r.test && settings[r.k] && (
              <button onClick={r.test} className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-black dark:bg-white/10">
                Test
              </button>
            )}
            <Toggle label={r.title} on={settings[r.k]} onChange={(v) => set(r.k, v)} />
          </div>
        ))}
      </div>

      <div className="glass mt-5 rounded-3xl p-5">
        <div className="mb-2 font-display text-xl">Spelregels</div>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm font-bold opacity-80">
          <li>Te laat? Dan draai je. Geen discussie.</li>
          <li>Tik op het midden of geef het rad een flinke zwiep.</li>
          <li>De straf wordt dezelfde avond uitgevoerd.</li>
          <li>“Draai nog een keer” betekent: nog een keer draaien. Ja echt.</li>
          <li>Geluksvogel? Proost. De rest is jaloers.</li>
        </ol>
      </div>

      <div className="glass mt-5 rounded-3xl p-5 text-sm font-bold">
        <div className="mb-1 font-display text-lg">📱 Op je beginscherm</div>
        <p className="opacity-75">
          iPhone: tik op <b>Deel</b> → <b>Zet op beginscherm</b>. Android: menu ⋮ → <b>App installeren</b>. Dan voelt ‘t als een echte app.
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 text-center opacity-60">
        <img src={logo} alt="" className="h-12" />
        <div className="text-xs font-black uppercase tracking-[0.25em]">De Teuteleers · Kruikenstad</div>
        <div className="text-[11px] font-bold">Alaaf! v1.0</div>
      </div>
    </div>
  );
}

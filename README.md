# Rad van de Teuteleers 🧦🎡

Mobiele webapp voor carnavalsvereniging **De Teuteleers** (Kruikenstad). Wie te laat komt, draait aan het rad.

React + TypeScript + Tailwind CSS + Framer Motion, gebouwd met Vite. Geen backend: alles staat in `localStorage`.

## Lokaal draaien

```bash
npm install
npm run dev       # ontwikkelserver
npm run build     # productie-build naar dist/
npm run preview   # productie-build bekijken
```

## Deployen naar Vercel

1. Zet deze map in een Git-repo (GitHub/GitLab) en importeer hem in Vercel, **of** run `npx vercel` in deze map.
2. Vercel herkent Vite automatisch (`vercel.json` staat er al): build `npm run build`, output `dist`.

## Functies

- **Openingsanimatie**: sokjes vliegen binnen, lopen een optocht, vormen het logo, knallen uit elkaar. Eén sokje komt te laat aanrennen en botst tegen het logo, en dan opent de app. (Tik om over te slaan.)
- **Het rad**: vakken in groen en oranje met sokjes-watermerk, sokjes als pinnen op de rand, knipperende lampjes. Het draait met echte fysica (wrijving en luchtweerstand), tikt bij elke pin en vertraagt geleidelijk. Tik op het midden of geef het rad een zwiep.
- **Uitslag**: grote animatie, fanfare (of een treurige trombone bij "Direct naar huis"), confetti, knoppen om te delen en opnieuw te draaien.
- **Hall of Fame**: Te laat (een "Draai nog een keer" telt niet dubbel), Grootste Sjaak en Geluksvogel Klassement, per seizoen (dat begint op 11-11) of over alle tijden.
- **Opties**: geluid, confetti-modus en donkere modus.
- **Beheer**: via het tandwiel rechtsboven, **pincode `1111`**. Hier voeg je straffen toe, pas je ze aan, verwijder je ze en verander je de volgorde (slepen of ▲▼). Je kunt ook het type straf en confetti instellen, de laatste draai ongedaan maken en statistieken wissen.

## Easter eggs 🥚

- Tik **11×** op het logo linksboven: Alaaf-modus met regenende sokjes.
- Houd het **midden van het rad lang ingedrukt**: de sokjes gaan dansen.
- Geef het rad een **extreem harde zwiep**: je krijgt een waarschuwing.
- Draai je tussen **02:00 en 06:00**: "Wa doede gij nog wakker?"
- Op **11 november**: het seizoen wordt geopend met confetti.
- Badges bij 2, 3 (hattrick), 5, 10 en 11× te laat in een seizoen.

Alle geluiden worden live gemaakt met de Web Audio API, dus er zijn geen audiobestanden nodig.

## Structuur

```
src/
  App.tsx                 app-state en flow
  components/             Preloader, Wheel, ResultOverlay, HallOfFame, AdminPanel, …
  hooks/useLocalStorage.ts
  lib/                    geluid, confetti, statistieken, standaardstraffen, quotes
  assets/                 sokjes-SVG's
```

# Music Bopper

A rhythm game built with Vite + React + TypeScript. Players match beats by pressing keys (D, F, J, K) in time with music.

## Project Structure

```
src/
├── App.tsx          # Root React component
├── main.tsx         # Entry point
├── App.css          # App styles
├── index.css        # Global styles
└── assets/          # Static assets
documents/
└── product-requirements.md   # PRD with development phases
```

## Commands

- `bun install` — Install dependencies
- `bun run dev` — Start dev server (http://localhost:5173)
- `bun run build` — TypeScript check + production build
- `bun run lint` — Run ESLint
- `bun run preview` — Serve production build locally

## Tech Stack

- **Runtime/package manager:** Bun
- **Framework:** React 19 with TypeScript (~5.9)
- **Build tool:** Vite 7
- **Linting:** ESLint with React Hooks and React Refresh plugins

## Development Phases

See `documents/product-requirements.md` for the full roadmap:

1. Four key blobs mapped to D, F, J, K
2. Continuously moving note blobs
3. Music-to-rhythm conversion
4. Apply rhythm to notes
5. Key press alignment with notes
6. Styling polish
7. Music quality improvements (melodies, instrument separation)

## Key Design Decisions

- **Early stage** — Project is freshly scaffolded from Vite's React-TS template. Architecture will evolve as features are built.
- **Keyboard input** — Core interaction is via D, F, J, K keys mapped to four lanes.
- **Timing source of truth: audio clock, not game loop clock** — Hit detection timing uses `Audio.getCurrentTime()` (backed by Tone.js `Transport.seconds` / `AudioContext.currentTime`), NOT `performance.now()`. Reasons: (1) MIDI files have absolute timestamps (`GameNote.time`), so comparing against the audio clock is a direct comparison with no drift. (2) `performance.now()` is a separate clock from the audio engine and can drift from what the player actually hears. (3) The game loop clock (`performance.now()` in `Game.ts`) is fine for driving update/render ticks, but should not be used for note-to-input accuracy. The flow: `AudioManager` writes `world.songTime = audio.getCurrentTime()` each frame, and all other managers read `world.songTime` as the single timing reference.

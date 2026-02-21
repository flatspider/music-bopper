# Music Bopper

A rhythm game built with Vite + PixiJS + TypeScript. Players match beats by pressing keys (D, F, J, K) in time with music.

## Project Structure

```
src/
├── main.ts              # Entry point — bootstraps PixiJS Application, loads SongSelectScene
├── engine/
│   ├── Game.ts          # Game loop (fixed timestep with accumulator)
│   ├── Audio.ts         # Tone.js wrapper for MIDI playback and synthesis
│   ├── Input.ts         # Keyboard input tracking
│   ├── Renderer.ts      # PixiJS drawing helpers
│   └── types.ts         # Shared constants and interfaces (canvas size, tick rate, Manager/Scene)
├── managers/
│   ├── AudioManager.ts      # Writes world.songTime from audio clock each tick
│   ├── InputManager.ts      # Captures key presses into world.pendingInputs
│   ├── GameplayManager.ts   # Hit detection, scoring, combo logic
│   ├── LaneManager.ts       # Per-lane note rendering and hit zone visuals
│   ├── SongSelectManager.ts # Song selection UI rendering
│   └── BgMusicPlayer.ts     # Background music playback for menus
├── scenes/
│   ├── RhythmScene.ts   # Main gameplay scene — wires managers in order
│   ├── RhythmWorld.ts   # World state factory (score, combo, notes, etc.)
│   ├── SongSelectScene.ts # Song selection screen
│   └── types.ts         # Game state enum, key-lane mapping, world interfaces
├── midi/
│   ├── parser.ts        # MIDI file parsing and lane assignment
│   └── strategies.ts    # Lane assignment strategies
├── types/
│   └── miditypes.ts     # MIDI-specific type definitions
└── assets/              # Static assets (MIDI files, etc.)
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
- **Rendering:** PixiJS (canvas-based game rendering)
- **Audio:** Tone.js (Web Audio synthesis and MIDI playback)
- **Language:** TypeScript (~5.9)
- **Build tool:** Vite 7
- **Linting:** ESLint

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

- **Architecture** — Scene/Manager pattern: `Game` runs a fixed-timestep loop, each `Scene` owns a set of `Manager`s that read/write a shared `World` object. Managers execute in a defined order each tick (Audio → Input → Gameplay → Rendering).
- **Keyboard input** — Core interaction is via D, F, J, K keys mapped to four lanes.
- **Timing source of truth: audio clock, not game loop clock** — Hit detection timing uses `Audio.getCurrentTime()` (backed by Tone.js `Transport.seconds` / `AudioContext.currentTime`), NOT `performance.now()`. Reasons: (1) MIDI files have absolute timestamps (`GameNote.time`), so comparing against the audio clock is a direct comparison with no drift. (2) `performance.now()` is a separate clock from the audio engine and can drift from what the player actually hears. (3) The game loop clock (`performance.now()` in `Game.ts`) is fine for driving update/render ticks, but should not be used for note-to-input accuracy. The flow: `AudioManager` writes `world.songTime = audio.getCurrentTime()` each frame, and all other managers read `world.songTime` as the single timing reference.

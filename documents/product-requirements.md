# Product Requirements Document: Rhythm Typing Game

**Working title:** TBD: Music Bopper
**Date:** 2026-02-17
**Authors:** Conor McManamon
**Status:** Draft — living document

---

## 1. Product Objective

Build a browser-based rhythm game where music is converted into a stream of falling notes that the player must type in time.

## 2. Scope

**In scope:**

- A single-player, browser-based rhythm game
- A curated starter library of songs with pre-generated charts
- Difficulty scaling
- Scoring, streaks, and session stats
- A jazz-inspired visual and audio identity

**Not in scope (for now):**

- An audio analysis pipeline that converts any uploaded song into a playable note chart
- User accounts, leaderboards, or persistent profiles
- Multiplayer / ensemble mode
- Streaming songs via Spotify or YouTube
- Mobile (touch targets and keyboard requirements make this a desktop-browser experience first)
- A chart editor for community-created note maps
- Monetization

## 3. Assumptions

- Players use keyboard (not touchscreen)
- Players are on a modern desktop browser (Chrome, Firefox, Safari — latest 2 versions)
- Audio latency in the browser (via Web Audio API) is manageable for a casual-difficulty rhythm game, though it will require calibration
- Small team (2–4 people) can ship an MVP in a focused sprint, then iterate
- Users are willing to upload audio files (MP3, WAV, FLAC) rather than stream from Spotify/Apple Music (streaming API licensing is out of scope)

## 4. Constraints

- Built in web browser.
- Audio latency needs to be managed. ML-based transcription will be hard for clientside to do.
- Song analysis needs backend. Curated library must use royalty-free, Creative Commons, or original recordings.
- User-uploaded songs stay client-side (never stored on our servers) to avoid DMCA exposure.
- No filesystem access (user uploads via file picker), no low-level audio device control, WebGL for rendering.

Music is heavy. Keep only song metadata in initial bundle (title, duration, difficulty, cover art URL). Lazy-load audio/chart only when selected. Cache downloaded files for replay (Cache Storage/IndexedDB), with an LRU cap (for example 300-500MB).
Store charts separately from audio (charts are tiny, audio is heavy).
Offer “download for offline” explicitly instead of silently caching everything.

## 5. Tech Stack

│ Layer │ Tool │ Purpose │
├───────────┼────────────────────┼──────────────────────────────────────────────────────────┤
│ Analysis │ Essentia.js (WASM) │ Beat tracking, onset detection, pitch — runs client-side │
├───────────┼────────────────────┼──────────────────────────────────────────────────────────┤
│ Playback │ Tone.js │ Precise audio scheduling and sync │
├───────────┼────────────────────┼──────────────────────────────────────────────────────────┤
│ Rendering │ PixiJS │ Note stream, visual effects │
├───────────┼────────────────────┼──────────────────────────────────────────────────────────┤
│ Frontend │ React + TypeScript │ UI, state, upload flow │
├───────────┼────────────────────┼──────────────────────────────────────────────────────────┤
│ Backend │ Express │ Serve the app, eventually proxy to ML service │

## 6a. MVP (no server) System Design

```mermaid
flowchart LR
  subgraph C["Client-Only MVP (Desktop Browser)"]
    UI["React + TypeScript UI"]
    LIB["Curated Song Library (bundled or CDN static JSON/charts)"]
    PICK["File Picker (MP3/WAV/FLAC)"]
    DEC["Audio Decode (Web Audio API)"]
    WASM["Essentia.js (WASM) in Web Worker"]
    CHART["Chart Generator (onset/beat -> lanes/keys/difficulty)"]
    PLAY["Playback + Timing Engine (Tone.js/Web Audio clock)"]
    INPUT["Keyboard Input"]
    RENDER["PixiJS Renderer"]
    STATS["Session Stats (localStorage only)"]
    CAL["Latency Calibration (local offset ms)"]
  end

  UI --> LIB
  UI --> PICK
  PICK --> DEC --> WASM --> CHART
  LIB --> CHART
  CHART --> PLAY
  INPUT --> PLAY
  PLAY --> RENDER
  PLAY --> STATS
  CAL --> PLAY

```

## 6b. Advanced System Design

```mermaid
flowchart LR
  subgraph B["Browser Client (Desktop)"]
    UI["React + TypeScript UI"]
    UP["File Picker (MP3/WAV/FLAC)"]
    AW["Audio Analysis Worker (Essentia.js WASM)"]
    CG["Chart Generator (heuristics + difficulty mapper)"]
    TE["Timing Engine (Tone.js + hit windows)"]
    PX["Renderer (PixiJS/WebGL)"]
    KB["Keyboard Input (DF/JK + expanded sets)"]
    RS["Run Stats (score, streak, accuracy, last session local)"]
  end

  subgraph S["Backend (MVP)"]
    EX["Express: static app + API"]
    CL["Curated Library (metadata + pre-generated charts)"]
    EV["Anonymous Event Ingest (optional)"]
  end

  UI --> UP
  UP --> AW
  AW --> CG
  CG --> TE
  KB --> TE
  TE --> PX
  TE --> RS

  UI <--> EX
  EX <--> CL
  RS -. "session metrics only (no account)" .-> EV
  UP -. "user audio remains client-side" .- EX

```

## 8. Target Audience & User Stories

**Primary audience:** Casual gamers — people who enjoy rhythm games but aren't grinding for perfect scores. Wordle crowd.

**Secondary audience:** Tech demo, so being able to demonstrate live ML transcription, new song uploaded and then turned into multiplayer as a technical feat itself.

### 8a. User Stories

- **As a new player,** I want to pick a song from the starter library and be playing within 5 seconds, so I can see if I like the game before uploading my own music.
- **As a player,** I want to upload my favorite song and get a playable note chart generated automatically, so I can play along to music I already love.
- **As a casual player,** I want difficulty levels that feel fun at Easy without feeling trivial, so I can enjoy myself without frustration.
- **As a returning player,** I want to see my score and streak from the last session, so I have a reason to come back and beat it.
- **As a player,** I want the notes I'm typing to feel connected to what I'm hearing — like I'm actually playing the music — so the experience is immersive.
- **As a player with audio latency issues,** I want a simple calibration tool so the game feels fair on my setup.

### 8b. User Simple Journey (First Session)

1. Player lands on the game, sees instructions.
2. Selects song, song begins.
3. Play with keyboard keys DF JK.
4. Player continues in song, scoring points. Or fails out.
5. Can restart or select new song.

### 8c. User Advanced Journey (First Session)

1. Player lands on the game. A short, animated intro sets the mood — think a neon sign flickering on outside a jazz club.
2. Player sees a curated list of 5 starter songs. Each shows title, artist, duration, and difficulty.
3. Player picks a song. A brief 4-beat count-in plays. Notes begin falling.
4. Player types along. Visual feedback (glow, ripple, color shift) on hits. The music stays full volume regardless of accuracy — do we punish with silence?
5. Song ends. Player sees score, longest streak, accuracy %. A single call-to-action: "Try another" or "Upload your own."
6. Player uploads an MP3. A short loading screen (5–15 seconds) while the analysis pipeline runs. Then they're playing.

## 9. Product Functionality — Game Mechanics

### The Note Stream

Notes fall from the top of the screen toward a "hit zone" at the bottom. Each note is a keyboard character (a letter, number, or symbol). The player presses the corresponding key when the note crosses the hit zone.

**Key mapping philosophy:** Notes should feel musical, not random. The mapping system should:

- Use clusters of adjacent keys for runs (e.g., `a-s-d-f` for a descending line)
- Mirror melodic contour — higher-pitched notes map to keys on the right, lower on the left
- At Easy difficulty, stay on home row. At Hard, use the full keyboard.

### Difficulty Tiers

Note: Develop this out to a "fun" amount of keys. How many is that?

| **Chill** | Home row only (a–l) | Quarter notes, simple rhythms | Generous (±150ms) |
| **Groove** | Home + top row | Eighth notes, light syncopation | Moderate (±100ms) |
| **Virtuoso** | Full keyboard | Sixteenth notes, complex rhythms, chords (simultaneous keys) | Tight (±50ms)

### Scoring

- **Hit quality:** Perfect / Good / OK / Miss, based on timing offset from the ideal beat
- **Streak multiplier:** Consecutive hits without a miss multiply the score (caps at 8x)
- **Groove meter:** A feel-good visual indicator that fills as you maintain a streak. Drains on misses, not instantly.
- **End-of-song summary:** Total score, accuracy %, longest streak, hit quality distribution

### The "Swing" Mechanic (Possible Feature)

This may be impossible to time properly: In jazz, rhythmic feel matters more than robotic precision. Our scoring should reflect this. Instead of only rewarding dead-center timing, the game detects the song's _swing feel_ and adjusts the scoring grid to match. A song with heavy swing rewards slightly laid-back timing. A straight-eighth funk track rewards metronomic hits.

This is subtle, but it makes the game _feel_ different from every other rhythm game. You're rewarded for musicality, not just reaction time.

### Call and Response (Possible Feature)

Certain sections of a song trigger "call and response" mode: the game plays a short phrase (3–6 notes), then the player echoes it back from memory. This mirrors real jazz improvisation and adds a memory/ear-training dimension that pure reaction-time games don't have.

## 10. Vision — Look and Feel

![alt text](image.png)

Jazz album covers, blues and blacks, lighting flickering.

- Notes glow and pulse on successful hits
- The background environment responds to play quality — lights brighten, crowd ambience swells, the scene comes alive when you're in a groove
- Misses don't punish harshly — a subtle flicker, not a jarring buzzer

## 11. Core Technical Challenges & Approaches

The central unsolved question: **How do you take an arbitrary audio file and turn it into a fun, playable note chart?**

### Approach A: Beat & Onset Detection (MVP Path)

Use **Essentia** (JS Library) to detect:

- Tempo (BPM) and beat positions
- Note onsets (moments where a new sound begins)
- Spectral features (brightness, energy) to inform difficulty mapping

And control playback use Tone.js for extreme control over note sounds.

Then algorithmically place keyboard notes at detected onset positions, using heuristics to choose which keys map to which events. This is fast, lightweight, and well-understood — but it doesn't capture _melody_, only rhythm.

**Best for:** Getting an MVP running quickly. Works great for percussion-heavy and rhythmically clear music. Less musical for complex harmonies.

### Approach B: ML-Powered Music Transcription

Use **Spotify's Basic Pitch** (open-source neural network) to transcribe audio into MIDI — extracting actual pitches, note durations, and polyphony. MIDI data maps directly to keyboard layout (pitch → key position). This gives melodically accurate charts that feel connected to what the player is hearing.

**Best for:** Making the typing feel like you're _playing the melody_. Requires a backend (the model is ~50MB and needs Python/PyTorch), adding 5–15 seconds of processing per song.

### Approach C: Source Separation + Layered Analysis (Target Architecture)

Use **Meta's Demucs** (or **HTDemucs**) to separate a song into stems — vocals, drums, bass, other instruments. Then apply different analysis to each stem:

- Drums → onset detection → rhythmic backbone of the chart
- Bass → pitch tracking → left-hand / lower-key patterns
- Melody/other → Basic Pitch transcription → right-hand / upper-key patterns
- Vocals → optionally display lyrics as typing targets during vocal sections

This produces the richest, most musical charts. Each difficulty tier can emphasize different stems (Chill = just drums, Groove = drums + bass, Virtuoso = full ensemble).

**Best for:** The full vision. Most compute-intensive. Demucs is heavy (~300MB model, benefits from GPU). Could run as a serverless GPU function (Replicate, Modal, or a lightweight FastAPI backend on a GPU instance).

## 12. Weird Ideas for Functionality

1. **Swing-aware scoring** (described in Section 6). Makes sloppy tapping more fun.

2. **Any-song playability.** Upload-and-play pipeline is a killer feature.

3. **Jazz club atmosphere as gameplay feedback.** Play well and the club comes alive: lights warm, crowd murmurs swell to cheers. Fall off the groove and the room gets quiet, the lights dim. Crowd Boos, cheers.

4. **Call and response mode** (described in Section 6). Adds a memory and listening dimension that pure reaction-time games lack. Directly references jazz tradition.

5. **Stem-aware difficulty.** Instead of just thinning out notes for easier difficulties, each tier plays a different _role in the band_. Easy mode plays the drums. Medium adds the bass line. Hard plays the full arrangement.

## 13. Success Metrics

1. Quick to start a song <10 secs after landing on page
2. Session length (how long does a user play)
3. Do users upload their own songs...?
4. Do they rate the auto-generated songs as fun?

## 14. Milestones

### Phase 1: Proof of Concept (Wednesday Morning)

- [ ] Static note stream falling on screen (PixiJS)
- [ ] Keyboard input detection with timing evaluation
- [ ] Hardcoded note chart for one 10 second clip — prove the core loop feels good
- [ ] Basic scoring (hit/miss/streak)
- [ ] Audio playback synced to note stream

**Exit criteria:** One song is playable end-to-end and it feels fun.

### Phase 2: Auto Generate Beat Map (Wednesday Evening)

- [ ] Load songs and generate (via essentia) beat maps for music library (NOT user uploaded)
- [ ] Difficulty tier generation (Chill / Groove from same analysis)
- [ ] Ensure audio playback synced to note stream in fun way
- [ ] Latency calibration tool

### Phase 3: Polish & Identity (Wednesday Evening)

- [ ] Jazz club visual design — background, lighting, note styling
- [ ] Audio design — ambient sounds, hit/miss feedback, transitions
- [ ] Curated song library (5–10 songs with tuned charts)
- [ ] Score summary screen
- [ ] Swing-aware scoring prototype

**Exit criteria:** The game looks and sounds like a finished product. Someone who didn't build it says "this is cool."

### Phase 4: Advanced Pipeline (Stretch)

- [ ] Source separation via Demucs
- [ ] Multiplayer songs simultaneously occuring
- [ ] Stem-aware difficulty (Virtuoso tier)
- [ ] Call and response mode
- [ ] Basic Pitch integration for melodic charts

**Exit criteria:** The chart quality on uploaded songs is noticeably more musical than Phase 2.

## 15. Tradeoffs & Open Questions

**Pre-built charts vs. auto-generation quality.** Auto-generated charts will never match hand-authored ones for quality. Mitigation: ship a curated library for first impressions, use auto-gen for user uploads where "good enough" is the bar.

**Server-side audio processing vs. client-side.** ML models (Basic Pitch, Demucs) need a backend. The fallback (essentia-style onset detection) can run server-side cheaply or potentially client-side via WASM. We should start with the simpler pipeline and upgrade.

**Typing as a mechanic — is it fun enough?** Typing might feel disconnected. The swing scoring and melodic key mapping are our answers to this, but it's an open design risk that needs playtesting early.

**Music licensing for curated library.** We need royalty-free or CC-licensed jazz recordings. Alternatively, we commission short original tracks. This has a cost. Open question: is there a corpus of high-quality Creative Commons jazz?

**Latency calibration UX.** Rhythm games live and die on sync. Most serious rhythm games (osu!, StepMania) require manual offset calibration. Can we make this invisible to casual players? Auto-detection via a "tap along to this beat" onboarding step is the leading idea.

---

_This document is a living artifact. Update it as decisions are made and assumptions are tested._

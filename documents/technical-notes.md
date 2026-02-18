# Technical Notes: Note Rendering & Timing

## 1. JSON Notes → Screen Notes

The `Song.notes[]` array contains note events with a `time` property (seconds). At song start, **GameplayManager** converts these into game notes stored in `RhythmWorld.gameNotes[]`:

```
Song.notes[] → gameNotes[] (with lane assignment + state tracking)
```

Each game note has:

- **`targetTime`** — when it should be hit (from the JSON `time`)
- **`lane`** — which of the 4 columns (mapped from MIDI pitch → D/F/J/K)
- **`state`** — `pending | active | hit | missed`

**RenderManager** reads `gameNotes[]` every frame and draws only visible notes. Notes are never "spawned" on a timer — the full array exists from init. We just filter to what's on screen.

## 2. Scrolling Notes (Spawn Before Hit)

A note's vertical position is derived from the time difference between now and when it needs to be hit:

```
noteScreenY = hitZoneY - (note.targetTime - songTime) * scrollSpeed
```

| Condition | Result |
|-----------|--------|
| `songTime` well before `targetTime` | Note is above viewport (don't draw) |
| `songTime` approaching `targetTime` | Note scrolls downward into view |
| `songTime === targetTime` | Note is exactly at the hit zone |
| `songTime` past `targetTime` | Note passes through, eventually off-screen (mark missed) |

**Look-ahead window**: With a canvas height of 600px and a known `scrollSpeed` (px/sec), the visible time window is `600 / scrollSpeed` seconds. Only draw notes within that window.

This is purely visual — the game loop doesn't need spawn timers or queues.

## 3. Timing & Latency

### Use Audio Time, Not Frame Time

The game loop runs at 150ms fixed ticks — **too coarse for hit detection**. Instead, derive `songTime` from the Web Audio API clock:

```
songTime = audioContext.currentTime - songStartTime
```

`AudioContext.currentTime` is hardware-accurate and frame-rate independent. **AudioManager** exposes this value; **GameplayManager** reads it directly rather than accumulating `dt`.

### Hit Windows

On keypress, compute: `offset = |songTime - note.targetTime|`

| Rating  | Window  |
|---------|---------|
| Perfect | ≤ 30ms  |
| Good    | ≤ 70ms  |
| OK      | ≤ 100–150ms |
| Miss    | > window |

Windows scale per difficulty (PRD Section 9): ±50ms (Virtuoso), ±100ms (Groove), ±150ms (Chill).

**Flow**: InputManager fires on `keydown` → GameplayManager finds the closest unresolved note in that lane → scores it against the window.

### Audio-Visual Sync Compensation

Display latency means what the player sees lags behind what they hear. Add a **calibration offset** to the visual position:

```
visualTime = songTime + displayOffset
```

`displayOffset` is a small constant (~20–50ms) that players can fine-tune in settings. This is standard practice in Guitar Hero, osu!, StepMania, etc.

The PRD (Section 15) already calls out a "tap along to this beat" onboarding step as the leading idea for auto-calibration.

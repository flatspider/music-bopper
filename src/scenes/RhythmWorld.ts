import type { RhythmWorld } from "./types.ts"
const INITIAL_HIT_COUNTS = { perfect: 0, great: 0, good: 0, missed: 0 };

// Factory method for creating RhythmWorld objects
export function createWorld(): RhythmWorld {
  return {
    state: "start",
    player: {},
    songTime: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    hitCounts: { ...INITIAL_HIT_COUNTS },
    lastHitResult: null,
    notes: { D: [], F: [], J: [], K: [] },
    pendingInputs: [],
    countdownTimer: 0,
  };
}

export function resetWorld(world: RhythmWorld): void {
    world.state = "start"
    world.player = {}
    world.songTime = 0
    world.score = 0
    world.combo = 0
    world.maxCombo = 0
    world.hitCounts = { ...INITIAL_HIT_COUNTS }
    world.lastHitResult = null
    // notes stay — they're the song data, not gameplay state
    // reset note statuses back to active
    for (const lane of Object.values(world.notes)) {
        for (const note of lane) {
            note.status = "active"
            note.hitGrade = undefined
        }
    }
    world.pendingInputs = []
    world.countdownTimer = 0
}
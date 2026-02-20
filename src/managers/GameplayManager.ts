import type { HitGrade, GameNote } from "../midi/parser";
import type { Manager, RhythmWorld, Lane } from "../scenes/types";

// Hit windows in seconds — how far from the note's exact time counts as a hit
const HIT_WINDOWS: { grade: HitGrade; window: number }[] = [
  { grade: "perfect", window: 0.05 },  // ±50ms
  { grade: "great",   window: 0.10 },  // ±100ms
  { grade: "good",    window: 0.15 },  // ±150ms
];

// The outermost window — once songTime passes a note by more than this, it's a miss
const MISS_THRESHOLD = HIT_WINDOWS[HIT_WINDOWS.length - 1].window;

// Points awarded per grade. Combo multiplier is applied on top.
const GRADE_POINTS: Record<HitGrade, number> = {
  perfect: 300,
  great:   200,
  good:    100,
};

export class GameplayManager implements Manager {
  update(world: RhythmWorld, _dt: number): void {
    if (world.state !== "playing") return;

    // Process all pending inputs from InputManager
    for (const input of world.pendingInputs) {
      this.processHit(world, input.lane, input.time);
    }
    world.pendingInputs = [];

    // Mark notes as missed once they're past the hit window
    this.detectMisses(world);
  }

  private processHit(world: RhythmWorld, lane: Lane, time: number): void {
    const notes = world.notes[lane];

    // Find the closest active note to this input time
    let closestNote: GameNote | null = null;
    let closestDist = Infinity;

    for (const note of notes) {
      if (note.status !== "active") continue;

      const dist = Math.abs(note.time - time);

      // Notes are sorted by time — if we're getting farther away and already
      // past the note, no point checking the rest
      if (dist > closestDist && note.time > time) break;

      if (dist < closestDist) {
        closestDist = dist;
        closestNote = note;
      }
    }

    if (!closestNote) return;

    // Check against hit windows (tightest first)
    for (const { grade, window } of HIT_WINDOWS) {
      if (closestDist <= window) {
        closestNote.status = "hit";
        closestNote.hitGrade = grade;

        // Score: base points × (1 + combo bonus)
        const comboMultiplier = 1 + Math.floor(world.combo / 10) * 0.1;
        world.score += Math.round(GRADE_POINTS[grade] * comboMultiplier);
        world.combo += 1;
        if (world.combo > world.maxCombo) world.maxCombo = world.combo;
        world.hitCounts[grade] += 1;

        // Store for on-screen feedback
        world.lastHitResult = { grade, time };
        return;
      }
    }

    // Outside all windows — ignore (no penalty for mashing)
  }

  private detectMisses(world: RhythmWorld): void {
    for (const lane of Object.values(world.notes)) {
      for (const note of lane) {
        if (note.status !== "active") continue;

        // If songTime is past this note by more than the miss threshold, it's gone
        if (world.songTime - note.time > MISS_THRESHOLD) {
          note.status = "missed";
          world.combo = 0;
          world.hitCounts.missed += 1;
        }

        // Notes are sorted by time — once we hit a note that's still in the future,
        // no more misses possible in this lane
        if (note.time > world.songTime) break;
      }
    }
  }
}

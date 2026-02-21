import type { HitGrade, GameNote } from "../midi/parser";
import type { Manager, RhythmWorld, Lane } from "../scenes/types";
import { gameConfig } from "../config/GameConfig";

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

    // Song complete — all notes resolved
    this.detectSongEnd(world);
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
    const { perfectWindow, greatWindow, goodWindow,
            perfectPoints, greatPoints, goodPoints,
            comboStep, comboBonusPct } = gameConfig.gameplay;
    const hitWindows: { grade: HitGrade; window: number }[] = [
      { grade: "perfect", window: perfectWindow },
      { grade: "great",   window: greatWindow },
      { grade: "good",    window: goodWindow },
    ];
    const gradePoints: Record<HitGrade, number> = {
      perfect: perfectPoints,
      great:   greatPoints,
      good:    goodPoints,
    };

    for (const { grade, window } of hitWindows) {
      if (closestDist <= window) {
        closestNote.status = "hit";
        closestNote.hitGrade = grade;

        // Score: base points × (1 + combo bonus)
        const comboMultiplier = 1 + Math.floor(world.combo / comboStep) * comboBonusPct;
        world.score += Math.round(gradePoints[grade] * comboMultiplier);
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

  private detectSongEnd(world: RhythmWorld): void {
    for (const lane of Object.values(world.notes)) {
      for (const note of lane) {
        if (note.status === "active") return;
      }
    }
    world.state = "gameOver";
  }

  private detectMisses(world: RhythmWorld): void {
    for (const lane of Object.values(world.notes)) {
      for (const note of lane) {
        if (note.status !== "active") continue;

        // If songTime is past this note by more than the outermost window, it's gone
        if (world.songTime - note.time > gameConfig.gameplay.goodWindow) {
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

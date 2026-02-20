import type { Manager, RhythmWorld } from "../scenes/types";

export class GameplayManager implements Manager {
  update(world: RhythmWorld, _dt: number): void {
    if (world.state !== "playing") return;

    // Process all pending inputs from InputManager
    for (const input of world.pendingInputs) {
      this.processHit(world, input.lane, input.time);
    }
    world.pendingInputs = [];

    // TODO (Step 5): detect missed notes here
  }

  private processHit(_world: RhythmWorld, lane: string, time: number): void {
    // TODO (Step 4): find closest active note in lane, grade it, update score
    console.log(`GameplayManager: hit in lane ${lane} at ${time.toFixed(3)}s`);
  }
}

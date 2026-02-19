import type { RhythmWorld } from "./types.ts"

// Factory method for creating RhythmWorld objects
export function createWorld(): RhythmWorld {
  const world: RhythmWorld = {
    state: "start",
    player: {}
  };
  resetWorld(world);
  return world;
}

export function resetWorld(world: RhythmWorld): void {
    world.state = "start"
    world.player = {}
}

// Need to add more fields to RhythmWorld interface in the scene/types.ts
// eg songTime, notes, and score fields
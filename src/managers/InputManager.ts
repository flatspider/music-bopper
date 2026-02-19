import type { Manager, RhythmWorld, Lane } from "../scenes/types.js"
import { KEY_LANE } from "../scenes/types.js";

export class InputManager implements Manager {
    onKeyDown(world: RhythmWorld, key: string): void {
        // Step 1: Handle state transitions.
        //   Any key while "start" → "playing" (press any key to start)
        //   Any key while "gameOver" → "start" (return to menu)
        //   Escape while "playing" → "pause"
        //   Escape while "pause" → "playing" (resume)
        //   Return early after any state transition.

        if (key) {
            if (world.state === "start") {
                world.state = "playing";
            } else if (world.state == "gameOver") {
                resetWorld(world)
                world.state "start"
            }
        }

        // Step 2: If the game isn't in "playing" state, ignore all other keys.
        //   (Same pattern as Snake: if (world.state !== "playing") return)

        // Step 3: Look up the lane for this key using KEY_LANE.
        //   If the key isn't D/F/J/K, lane will be undefined — return early.

        // Step 4 (future): Hit detection.
        //   Once world.songTime and world.notes exist, this is where you'd:
        //   - Find the closest unhit note in this lane
        //   - Compare world.songTime to note.time
        //   - Assign a grade (perfect/great/good/miss)
        //   For now, just console.log the lane to verify it works.
    }

    onKeyUp(world: RhythmWorld, key: string): void {
        // Future: Hold note release detection.
        // Check if the player held long enough for a hold note.
    }

    onKeyHold(world: RhythmWorld, key: string): void {
        // Future: Visual feedback while key is held.
    }
}

import type { Manager, RhythmWorld, Lane } from "../scenes/types.js"
import { KEY_LANE } from "../scenes/types.js";
import { resetWorld} from "../scenes/RhythmWorld.js";

export class InputManager implements Manager {
    onKeyDown(world: RhythmWorld, key: string): void {
        // Step 1: Handle state transitions
        if (key === "Escape") {
            if (world.state === "playing") {
                world.state = "pause"
            } else if (world.state === "pause") {
                world.state = "playing"
            }
            return
        }

        if (world.state === "start") {
            world.state = "playing"
            return
        }

        if (world.state === "gameOver") {
            resetWorld(world)
            return
        }

        console.log(`InputManager state: ${world.state}`)

        // Step 2: If the game isn't in "playing" state, ignore all other keys
        if (world.state !== "playing") return

        // Step 3: If the key isn't D/F/J/K, lane will be undefined — return early
        const lane = KEY_LANE[key]
        if (!lane) return

        // Step 4 (future): Record the raw input into world state.
        //   Once world.songTime and a world.lastInput field exist:
        //   - Write { lane, time: world.songTime } into world state
        //   - GameplayManager will read this in update() to do the actual
        //     hit detection, grading, and scoring.
        //   InputManager says "lane D was pressed at this time."

        console.log(`InputManager key: ${key} and lane: ${lane}`,)

    }

    // Below need the hit ditection with world.songTime and world.notes
    // using _world to tell Typescript that we are not using it yet

    onKeyUp(_world: RhythmWorld, key: string): void {
        // Future: Hold note release detection. Check if the player held long enough for a hold note.
        console.log(`InputManager keyUp: ${key}`)
    }

    onKeyHold(_world: RhythmWorld, key: string): void {
        // Future: Visual feedback while key is held.
        console.log(`InputManager keyHold: ${key}`,)
    }
}

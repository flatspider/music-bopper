import type { Manager, RhythmWorld } from "../scenes/types.js"
import { KEY_LANE } from "../scenes/types.js";
import { resetWorld } from "../scenes/RhythmWorld.js";

export class InputManager implements Manager {
    onKeyDown(world: RhythmWorld, key: string): void {
        // Escape toggles pause
        if (key === "Escape") {
            if (world.state === "playing") {
                world.state = "pause"
            } else if (world.state === "pause") {
                world.state = "countdown"
                world.countdownTimer = 3
            } else if (world.state === "countdown") {
                world.state = "pause"
            }
            return
        }

        // Enter returns to song select from pause
        if (key === "Enter" && world.state === "pause") {
            world.state = "songSelect"
            return
        }

        // Game over — any key resets
        if (world.state === "gameOver") {
            resetWorld(world)
            return
        }

        // Only process lane keys while playing
        if (world.state !== "playing") return

        const lane = KEY_LANE[key]
        if (!lane) return

        // Record the input — GameplayManager will process it in update()
        world.pendingInputs.push({ lane, time: world.songTime })
    }

    onKeyUp(_world: RhythmWorld, _key: string): void {}
    onKeyHold(_world: RhythmWorld, _key: string): void {}
}

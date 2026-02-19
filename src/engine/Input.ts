// Input implementation

import type { Scene } from "./types";

const GAME_KEYS = new Set([
    "KeyD",
    "KeyF",
    "KeyJ",
    "KeyK",
    "Esc",
    
])

export class Input {
    private scene: Scene | null = null;
    held = new Set<string>();
    private onKeyDown: (e: KeyboardEvent) => void;
    private onKeyUp: (e: KeyboardEvent) => void;

    constructor() {
        this.onKeyDown = (e: KeyboardEvent) => {
            if(GAME_KEYS.has(e.code)) {
                e.preventDefault();
            }

            // STEP 5a: Filter out repeat events (OS sends these when a key is held down).
            //   Check e.repeat — if true, return early and do nothing.

            if(e.repeat){
                return
            }

            // STEP 5b: Track the key in the held set.
            //   Add e.code to this.held here.

            this.held.add(e.code); // empty Set never null or undefined, doesn't need optional chaining

            this.scene?.onKeyDown(e.code);
        }

        this.onKeyUp = (e: KeyboardEvent) => {
            if(GAME_KEYS.has(e.code)) {
                e.preventDefault();
            }

            // STEP 5c: Remove the key from the held set.
            //   Delete e.code from this.held here.

            this.held.delete(e.code); // remove from held Set

            this.scene?.onKeyUp(e.code);
        }
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }

    setScene(scene: Scene | null): void {
        this.scene = scene;
    }

    destroy(): void {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
    }

};
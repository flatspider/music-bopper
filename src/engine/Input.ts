// Input implementation

import type { Scene } from "./types";

const GAME_KEYS = new Set([
  "KeyD",
  "KeyF",
  "KeyJ",
  "KeyK",
  "Esc",
  "ArrowUp",
  "ArrowDown",
]);

export class Input {
  private scene: Scene | null = null;
  held = new Set<string>();
  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.onKeyDown = (e: KeyboardEvent) => {
      if (GAME_KEYS.has(e.code)) {
        e.preventDefault();
      }
      this.scene?.onKeyDown(e.code);
    };

    this.onKeyUp = (e: KeyboardEvent) => {
      if (GAME_KEYS.has(e.code)) {
        e.preventDefault();
      }
      this.scene?.onKeyUp(e.code);
    };
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
}

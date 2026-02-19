// --- GAME CONSTANTS -- 

import type { AlphaFilter } from "pixi.js";

// Notes should be dynamic to canvas size
export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 600;
export const TICK_RATE_MS = 150;
export const TICK_RATE_S = TICK_RATE_MS / 1000;
// When you lose focus on the page, how long should it accumulate?
export const MAX_ACCUMULATOR_MS = 1000;

// --- Interfaces ---

export interface GameContext {
    canvasWidth: number;
    canvasHeight: number;
}

export interface Renderer {
   drawRect(
    gridX: number,
    gridY: number,
    widthCells: number,
    heightCells: number,
    color: number
  ): void;
  drawText(
    text: string,
    pixelX: number,
    pixelY: number,
    options?: {fontSize?: number; color?: number; anchor?: number}
  ): void;
  drawCircle(pixelX: number, pixelY: number, radius: number, color: number, alpha: number): void;
  clear(): void;
  // May not modify stage direct. Inline import.
  readonly stage: import("pixi.js").Container;
}

export interface Scene {
    init(context: GameContext): void;
    update(dt: number): void;
    render(renderer: Renderer): void;
    onKeyDown(key : string):void;
    onKeyUp(key: string): void;
    onKeyHold(key: string): void;
    destroy(): void;
}

// Needs detail
export interface Audio {
    play(): void;
    pause(): void;
    resume(): void;
}


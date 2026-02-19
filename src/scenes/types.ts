import type { Renderer } from "../engine/types";

// Shared types go here

// Gamestate, direction

// -- Shared Constants

// -- Keys and Lanes

export type Lane = "D" | "F" | "J" | "K";

export const KEY_LANE: Record<string, Lane> = {
    KeyD: "D",
    KeyF: "F",
    KeyJ: "J",
    KeyK: "K"
}

// --- Game State --- 

export type GameState = "start" | "playing" | "pause" | "gameOver" 


// --- Game World ---

export interface RhythmWorld {
    state: GameState;
    player: {};
}

// --- Manager Interface ---

export interface Manager {
    update?(world: RhythmWorld, dt: number): void;
    render?(world: RhythmWorld, renderer: Renderer): void;
    onKeyDown?(world: RhythmWorld, key: string): void;
    onKeyUp?(world: RhythmWorld, key: string): void;
    onKeyHold?(world: RhythmWorld, key:string): void;
    destroy?(): void;
}
import type { Renderer } from "../engine/types";


// Shared types go here

// Gamestate, direction

// -- Shared Constants

// key direction, 

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
    destroy?(): void;
}
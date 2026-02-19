import type { Game } from "../engine/Game";
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

// --- Game State ---

export type GameState =
  | "start"
  | "playing"
  | "pause"
  | "gameOver"
  | "songSelect";

// --- Game World ---

// this is the shared interface between the Worlds
// doing this allows us to map Manager interface to be shared
export interface GameWorld {
  state: GameState;
  player: {};
}

// rhythmworld still contains state, player, we just can avoid repeating it here!
export interface RhythmWorld extends GameWorld {}

// also contains state and player
export interface SongSelectWorld extends GameWorld {
  currentCardHighlight: number; // current highlighted songCard
  selectedSong: string; // song User selects (loaded into RhythmScene, RhythmWorld)
}

// Need to add more fields to RhythmWorld interface in the scene/types.ts
// eg songTime, notes, and score fields

// --- Manager Interface ---

export interface Manager {
    update?(world: RhythmWorld, dt: number): void;
    render?(world: RhythmWorld, renderer: Renderer): void;
    onKeyDown?(world: RhythmWorld, key: string): void;
    onKeyUp?(world: RhythmWorld, key: string): void;
    onKeyHold?(world: RhythmWorld, key:string): void;
    destroy?(): void;
}

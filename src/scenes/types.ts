import type { Game } from "../engine/Game";
import type { Renderer } from "../engine/types";
import type { MidiSongJson } from "../types/miditypes";

// Shared types go here

// Gamestate, direction

// -- Shared Constants

// key direction,

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
export interface RhythmWorld extends GameWorld {
  songTime: number; // from audio, shared music timing
}

// also contains state and player
export interface SongSelectWorld extends GameWorld {
  currentCardHighlight: number; // current highlighted songCard
  selectedSong: string; // song User selects (loaded into RhythmScene, RhythmWorld)
}

// --- Manager Interface ---

export interface Manager {
  update?(world: GameWorld, dt: number): void;
  render?(world: GameWorld, renderer: Renderer): void;
  onKeyDown?(world: GameWorld, key: string): void;
  onKeyUp?(world: GameWorld, key: string): void;
  destroy?(): void;
}

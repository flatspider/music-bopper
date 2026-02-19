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

export interface RhythmWorld {
  state: GameState;
  player: {};
}

export interface SongSelectWorld {
  audio: MidiSongJson; // bg music
  currentCardHighlight: number; // current highlighted songCard
  selectedSong: string; // song User selects (loaded into RhythmScene, RhythmWorld)
  player: {}; // previous song completion scores, history?
}

// --- Manager Interface ---

export interface Manager {
  update?(world: RhythmWorld, dt: number): void;
  render?(world: RhythmWorld, renderer: Renderer): void;
  onKeyDown?(world: RhythmWorld, key: string): void;
  onKeyUp?(world: RhythmWorld, key: string): void;
  destroy?(): void;
}

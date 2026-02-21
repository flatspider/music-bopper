// Types for the pre-converted MIDI JSON chart format
// Produced by scripts/midi-to-json.ts — a flattened, denormalized schema
// distinct from @tonejs/midi's MidiJSON/NoteJSON types.
// See: public/midi/json/*.json

import type { Lane } from "../scenes/types";

export interface MidiSongJson {
  name: string;
  bpm: number;
  duration: number; // total length in seconds
  ppq: number; // pulses per quarter note
  totalNotes: number;
  noteRange: {
    min: number; // lowest MIDI pitch
    max: number; // highest MIDI pitch
  };
  tracks: MidiTrackSummary[];
  notes: MidiFlatNote[];
}

export interface MidiTrackSummary {
  name: string;
  instrument: string;
  channel: number;
  noteCount: number;
}

export interface MidiFlatNote {
  time: number; // absolute seconds from start
  duration: number; // seconds
  midi: number; // MIDI pitch (0-127)
  velocity: number; // 0-1 normalized
  track: string; // track name reference
  channel: number; // MIDI channel
  lane: Lane;
  noteNumber: number; // match to songMap
}

// Derived type for the song selection screen
export type Difficulty = "Chill" | "Groove" | "Virtuoso";

export interface SongEntry {
  filename: string; // for loading the full JSON
  name: string;
  bpm: number;
  duration: number;
  totalNotes: number;
  difficulty: Difficulty; // computed from totalNotes / duration
}

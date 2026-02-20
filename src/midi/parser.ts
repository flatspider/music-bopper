import { Midi } from "@tonejs/midi";
import { type Lane } from "../scenes/types.ts"

export const LANES: Lane[] = ["D", "F", "J", "K"];

export type NoteStatus = "active" | "hit" | "missed";

export type HitGrade = "perfect" | "great" | "good";

export interface GameNote {
  time: number; // absolute seconds from start
  lane: Lane;
  duration: number; // seconds
  velocity: number; // 0-1 (normalized)
  noteNumber: number; // original MIDI pitch
  status: NoteStatus; // tracking whether note was hit, missed, or still active
  hitGrade?: HitGrade; // set when status becomes "hit"
}

export interface SongMap {
  name: string;
  duration: number; // total song length in seconds
  bpm: number; // primary tempo
  notes: GameNote[]; // all notes, sorted by time
}

/**
 * Assign a MIDI note number to a lane based on pitch quartiles.
 * Low notes → D (left), high notes → K (right), mirroring piano layout.
 */
function assignLane(
  noteNumber: number,
  min: number,
  range: number
): Lane {
  if (range === 0) return "F";
  const position = (noteNumber - min) / range;
  if (position <= 0.25) return "D";
  if (position <= 0.5) return "F";
  if (position <= 0.75) return "J";
  return "K";
}

/**
 * Parse a MIDI file into a SongMap.
 * Merges all tracks, assigns lanes by pitch quartile.
 */
export function parseMidi(data: ArrayBuffer, name?: string): SongMap {
  const midi = new Midi(new Uint8Array(data));

  // Collect all notes from all tracks
  const allNotes: { midi: number; time: number; duration: number; velocity: number }[] = [];
  for (const track of midi.tracks) {
    for (const note of track.notes) {
      allNotes.push({
        midi: note.midi,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity,
      });
    }
  }

  if (allNotes.length === 0) {
    return {
      name: name ?? "Unknown",
      duration: midi.duration,
      bpm: midi.header.tempos[0]?.bpm ?? 120,
      notes: [],
    };
  }

  // Find pitch range for quartile mapping
  let minNote = 127;
  let maxNote = 0;
  for (const n of allNotes) {
    if (n.midi < minNote) minNote = n.midi;
    if (n.midi > maxNote) maxNote = n.midi;
  }
  const range = maxNote - minNote;

  // Map to GameNotes with lane assignment
  const gameNotes: GameNote[] = allNotes.map((n) => ({
    time: n.time,
    lane: assignLane(n.midi, minNote, range),
    duration: n.duration,
    velocity: n.velocity,
    noteNumber: n.midi,
    status: "active" as const,
  }));

  // Sort by time (stable sort preserves pitch order for simultaneous notes)
  gameNotes.sort((a, b) => a.time - b.time);

  return {
    name: name ?? "Unknown",
    duration: midi.duration,
    bpm: midi.header.tempos[0]?.bpm ?? 120,
    notes: gameNotes,
  };
}

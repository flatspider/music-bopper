import { Midi } from "@tonejs/midi";
import { readdir, mkdir } from "node:fs/promises";
import { join, basename } from "node:path";

const MIDI_DIR = join(import.meta.dir, "..", "midi");
const OUTPUT_DIR = join(import.meta.dir, "..", "src", "assets", "midi", "json");

type Lane = "D" | "F" | "J" | "K";

function assignLane(noteNumber: number, min: number, range: number): Lane {
  if (range === 0) return "F";
  const position = (noteNumber - min) / range;
  if (position <= 0.25) return "D";
  if (position <= 0.5) return "F";
  if (position <= 0.75) return "J";
  return "K";
}

interface RawNote {
  time: number;
  duration: number;
  midi: number; // MIDI pitch 0-127
  velocity: number; // 0-1
  track: string; // track name
  channel: number;
  lane: Lane;
  noteNumber: number; // conform to songMap interface
}

interface SongJSON {
  name: string;
  bpm: number;
  duration: number;
  ppq: number;
  totalNotes: number;
  noteRange: { min: number; max: number };
  tracks: {
    name: string;
    instrument: string;
    channel: number;
    noteCount: number;
  }[];
  notes: RawNote[];
}

async function midiToJson(filePath: string): Promise<SongJSON> {
  const file = Bun.file(filePath);
  const arrayBuffer = await file.arrayBuffer();
  const midi = new Midi(new Uint8Array(arrayBuffer));

  const notes: RawNote[] = [];
  const trackSummaries: SongJSON["tracks"] = [];

  for (const track of midi.tracks) {
    if (track.notes.length === 0) continue;

    trackSummaries.push({
      name: track.name || "(unnamed)",
      instrument: track.instrument?.name ?? "unknown",
      channel: track.channel,
      noteCount: track.notes.length,
    });

    for (const note of track.notes) {
      notes.push({
        time: Math.round(note.time * 1000) / 1000,
        duration: Math.round(note.duration * 1000) / 1000,
        midi: note.midi,
        noteNumber: note.midi,
        velocity: Math.round(note.velocity * 100) / 100,
        track: track.name || "(unnamed)",
        channel: track.channel,
        lane: "D", // placeholder, assigned in second pass
      });
    }
  }

  notes.sort((a, b) => a.time - b.time);

  let min = 127,
    max = 0;
  for (const n of notes) {
    if (n.midi < min) min = n.midi;
    if (n.midi > max) max = n.midi;
  }

  const range = max - min;
  for (const n of notes) {
    n.lane = assignLane(n.midi, min, range);
  }

  const name = basename(filePath, ".mid");

  return {
    name,
    bpm: Math.round(midi.header.tempos[0]?.bpm ?? 120),
    duration: Math.round(midi.duration * 100) / 100,
    ppq: midi.header.ppq,
    totalNotes: notes.length,
    noteRange: { min, max },
    tracks: trackSummaries,
    notes,
  };
}

// Run
await mkdir(OUTPUT_DIR, { recursive: true });

const files = await readdir(MIDI_DIR);
const midiFiles = files.filter(
  (f) => f.endsWith(".mid") || f.endsWith(".midi"),
);

for (const file of midiFiles) {
  const songJson = await midiToJson(join(MIDI_DIR, file));
  const outName = basename(file, ".mid") + ".json";
  const outPath = join(OUTPUT_DIR, outName);
  await Bun.write(outPath, JSON.stringify(songJson, null, 2));
  console.log(`Wrote ${outPath} (${songJson.totalNotes} notes)`);
}

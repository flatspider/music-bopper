// singleton class that instantiates the Audio Primitive.

import { PolySynth } from "tone";
import type { SongMap } from "../midi/parser";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone"; // audio engine (Transport, PolySynth, Frequency)

// This is what 'loads' the midi song in

export class Audio {
  constructor() {
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
  }
  private songMap: SongMap | null = null;
  private synth: Tone.PolySynth;

  loadSong(song: SongMap) {
    this.songMap = song;

    // Reset timing and song logic (new play)
    Tone.getTransport().cancel();
    Tone.getTransport().seconds = 0;

    for (const note of this.songMap.notes) {
      Tone.getTransport().schedule((time) => {
        this.synth.triggerAttackRelease(
          Tone.Frequency(note.noteNumber, "midi").toNote(),
          note.duration,
          time,
          note.velocity,
        );
      }, note.time);
    }
  }

  async play() {
    if (!this.songMap) return;
    await Tone.start();
    Tone.getTransport().start(); // resumes if paused, restarts if new
  }

  pause() {
    Tone.getTransport().pause();
  }

  // this will return the current time the song is at
  // Since the graphics read from the songMap as well,
  // this is the true 'source of truth'.
  getCurrentTime(): number {
    return Tone.getTransport().seconds;
  }
}

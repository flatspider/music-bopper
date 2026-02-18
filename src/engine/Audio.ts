import type { SongMap } from "../midi/parser";
import * as Tone from "tone";

/**
 * Audio engine singleton — owns the Tone.js synth and Transport.
 *
 * Lifecycle:
 *   1. `loadSong(songMap)` — schedule every note onto the Transport timeline.
 *   2. `play()`            — unlock browser audio (first call) and start playback.
 *   3. `pause()` / `play()` — pause and resume from the same position.
 *
 * The Transport is the single source of truth for song position.
 * Scenes should call `getCurrentTime()` each frame to sync visuals with audio.
 */
export class Audio {
  /** Parsed MIDI data currently loaded (null until loadSong is called). */
  private songMap: SongMap | null = null;

  /** Polyphonic synth routed to the default audio output. */
  private synth: Tone.PolySynth;

  constructor() {
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
  }

  /**
   * Load a parsed SongMap and schedule all its notes on the Transport.
   * Calling this again with a new song cancels the previous schedule.
   */
  loadSong(song: SongMap) {
    this.songMap = song;

    // Clear any previously scheduled notes and reset the playhead.
    Tone.getTransport().cancel();
    Tone.getTransport().seconds = 0;

    // Schedule every note as a triggerAttackRelease on the Transport timeline.
    // Transport calls back with the precise audio-context time for each note.
    for (const note of this.songMap.notes) {
      Tone.getTransport().schedule((time) => {
        this.synth.triggerAttackRelease(
          Tone.Frequency(note.noteNumber, "midi").toNote(), // MIDI pitch -> e.g. "C4"
          note.duration,
          time,
          note.velocity,
        );
      }, note.time);
    }
  }

  /**
   * Start or resume playback.
   * Must be called from a user gesture (click/keypress) so the browser
   * allows `Tone.start()` to unlock the AudioContext.
   */
  async play() {
    if (!this.songMap) return;
    await Tone.start();
    Tone.getTransport().start();
  }

  /** Pause playback. Call `play()` again to resume from the same position. */
  pause() {
    Tone.getTransport().pause();
  }

  /**
   * Current song position in seconds — the single source of truth.
   * RhythmScene reads this each frame to position notes on screen.
   */
  getCurrentTime(): number {
    return Tone.getTransport().seconds;
  }
}

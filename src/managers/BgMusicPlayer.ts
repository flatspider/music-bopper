import type { MidiSongJson } from "../types/miditypes";
import * as Tone from "tone";

/**
 * Lightweight background music player for non-gameplay screens.
 *
 * Uses its own synths routed through a shared Volume node so the
 * entire mix can be faded in/out without touching the gameplay Audio engine.
 * Schedules notes on the global Transport — the gameplay Audio.loadSong()
 * calls Transport.cancel() which naturally clears bg music when transitioning.
 */
export class BgMusicPlayer {
  private master: Tone.Volume;
  private synth: Tone.PolySynth;
  private bass: Tone.Synth;
  private loaded = false;

  /** Default volume in dB — quiet enough to sit behind the UI */
  private static readonly DEFAULT_VOL = -18;
  /** Duration of fade-out in seconds */
  private static readonly FADE_DURATION = 0.6;

  constructor() {
    this.master = new Tone.Volume(BgMusicPlayer.DEFAULT_VOL).toDestination();

    this.synth = new Tone.PolySynth(Tone.Synth).connect(this.master);
    this.synth.maxPolyphony = 32;

    this.bass = new Tone.Synth().connect(this.master);
    this.bass.volume.value = -4; // bass sits slightly louder in the submix
  }

  /**
   * Schedule all notes from a MidiSongJson onto the Transport.
   * Loops by scheduling a second pass offset by the song duration.
   */
  load(song: MidiSongJson): void {
    for (const note of song.notes) {
      if (note.channel === 9) continue; // skip percussion for chill bg vibe

      const freq = Tone.Frequency(note.midi, "midi").toNote();
      const synth = note.midi < 48 ? this.bass : this.synth;

      // First pass
      Tone.getTransport().schedule((time) => {
        synth.triggerAttackRelease(freq, note.duration, time, note.velocity * 0.7);
      }, note.time);

      // Second pass (loop) — offset by song duration so it repeats once
      Tone.getTransport().schedule((time) => {
        synth.triggerAttackRelease(freq, note.duration, time, note.velocity * 0.7);
      }, note.time + song.duration);
    }

    this.loaded = true;
  }

  /** Start playback (unlocks AudioContext if needed). */
  async play(): Promise<void> {
    if (!this.loaded) return;
    await Tone.start();
    Tone.getTransport().start();
  }

  /**
   * Fade out over ~0.6s. Returns a promise that resolves when the fade
   * is complete so callers can wait before transitioning scenes.
   */
  fadeOut(): Promise<void> {
    return new Promise((resolve) => {
      this.master.volume.rampTo(-60, BgMusicPlayer.FADE_DURATION);
      setTimeout(() => {
        this.stop();
        resolve();
      }, BgMusicPlayer.FADE_DURATION * 1000);
    });
  }

  /** Hard stop — pause transport and silence immediately. */
  stop(): void {
    Tone.getTransport().pause();
    this.synth.releaseAll();
  }

  /** Clean up synths and volume node. */
  dispose(): void {
    this.stop();
    this.synth.dispose();
    this.bass.dispose();
    this.master.dispose();
  }
}

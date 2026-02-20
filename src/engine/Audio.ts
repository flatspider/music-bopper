import type { MidiSongJson } from "../types/miditypes";
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
  private songMap: MidiSongJson | null = null;

  /** Polyphonic synth for pitched instruments (channels 1-8). */
  private synth: Tone.PolySynth;
  /** Membrane synth for kicks and toms (channel 9, MIDI < 47). */
  private kick: Tone.MembraneSynth;
  /** Noise synth for hi-hats, cymbals, snare (channel 9, MIDI >= 47). */
  private hat: Tone.NoiseSynth;

  constructor() {
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    this.synth.maxPolyphony = 64;

    this.kick = new Tone.MembraneSynth().toDestination();
    this.kick.volume.value = -10;

    this.hat = new Tone.NoiseSynth({
      envelope: { attack: 0.001, decay: 0.1, sustain: 0 },
    }).toDestination();
    this.hat.volume.value = -10;
  }

  /**
   * Load a parsed MidiSongJson and schedule all its notes on the Transport.
   * Calling this again with a new song cancels the previous schedule.
   */
  loadSong(song: MidiSongJson) {
    this.songMap = song;

    // Clear any previously scheduled notes and reset the playhead.
    Tone.getTransport().cancel();
    Tone.getTransport().seconds = 0;

    // Schedule every note, routing by channel + MIDI pitch:
    //   channel 9 = percussion → kick (MembraneSynth) or hat (NoiseSynth)
    //   all other channels      → pitched PolySynth
    for (const note of this.songMap.notes) {
      if (note.channel === 9) {
        // Percussion: split by MIDI pitch — low = kick/toms, high = hat/cymbal/snare
        if (note.noteNumber < 47) {
          Tone.getTransport().schedule((time) => {
            this.kick.triggerAttackRelease("C2", note.duration, time, note.velocity);
          }, note.time);
        } else {
          Tone.getTransport().schedule((time) => {
            this.hat.triggerAttackRelease(note.duration, time);
          }, note.time);
        }
      } else {
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
  }

  /**
   * Start or resume playback.
   * This will play synchronously
   */
  play() {
    if (!this.songMap) return;
    Tone.getTransport().start();
  }

  /**
   * Audio must be triggered from a user event, hence we use "unlock"
   * This means when the user presses play /pause, we unlock audio, then we can start
   * Allows us to add a countdown (321) if needed, etc.
   * === CLAUDE SAYS ===
   * Unlock (Tone.start()) — This is a browser security requirement, not a game concept.
   * Browsers block all audio output until the user interacts with the page (click, keypress). Tone.start() tells the browser "the user has engaged, please allow sound now." It's a one-time gate — once unlocked, it stays unlocked for the rest of the page session. It produces no sound itself.
   */
  async unlock() {
    // AudioContext needs ot be "unlocked", which is async. Claude recommends separating it into a separate function
    await Tone.start();
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

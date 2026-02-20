import { Audio } from "../engine/Audio";
import type { SongMap } from "../midi/parser";
import type { GameState, Manager, RhythmWorld } from "../scenes/types";

export class AudioManager implements Manager {
  audio: Audio;
  private lastState: GameState;

  constructor() {
    this.audio = new Audio();
    this.lastState = "start";
  }

  loadSong(songmap: SongMap) {
    this.audio.loadSong(songmap);
  }

  update(world: RhythmWorld, dt: number) {
    // check if gameState changed, then play/pause

    world.songTime = this.audio.getCurrentTime(); // update shared time with Audio time
    if (this.lastState !== world.state) {
      if (world.state == "playing") {
        this.audio.play();
      } else if (world.state == "pause") {
        this.audio.pause();
      }
      // update state
      this.lastState = world.state;
    }
  }

  // makes audio ready to be played (see Audio about unlock)
  onKeyDown(world: RhythmWorld, key: string): void {
    if (world.state == "start" && key === "Space") {
      this.audio.unlock();

      // Let the world now we are now 'playing'. User is prompted for spacebar to start..
      world.state = "playing";
    }
  }

  destroy() {
    // reset audio. Does audio.pause() reset? Will we need to load an new song?
    this.audio.pause();
  }

  // update() would tell audio manager to keep playing audio

  // destroy() clear the audio
}

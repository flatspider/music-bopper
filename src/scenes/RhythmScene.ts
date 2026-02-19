import { Audio } from "../engine/Audio.js";
import type { Scene, GameContext, Renderer, Audio } from "../engine/types.js";
import type { Manager, RhythmWorld } from "./types.js";
import { LANES } from "../midi/parser.js";

export class RhythmScene implements Scene {
private world!: GameContext;
private managers: Manager[];

  init(context: GameContext): void {
    this.managers = [];
    let currentSong = new Audio();

    let songMap = currentSong.loadSong(src/assets/midi/json/COLTRANE.Countdown.json);

    LANES.forEach(lane => {
        let notes = songMap.notes.filter((n)=>n.lane === lane);
        let musicLane = new LaneManager(notes, lane);
        this.managers.push(musicLane);
    });

    let firstManager = new SimpleManager(); 
    
    this.managers.push(firstManager);
    
  }

  update(dt: number): void {
    for (const m of this.managers) m.update?.(this.world, dt);
  }

  render(renderer: Renderer): void {
    renderer.clear();
    for (const m of this.managers) m.render?.(this.world, renderer);
  }

  onKeyDown(key: string): void {
    for (const m of this.managers) m.onKeyDown?.(this.world, key);
  }

  onKeyUp(key: string): void {
    for (const m of this.managers) m.onKeyUp?.(this.world, key);
  }

   onKeyHold(key: string): void {
    for (const m of this.managers) m.onKeyHold?.(this.world, key);
  }

  destroy(): void {
    for (const m of this.managers) m.destroy?.();
  }

}

export class SimpleManager implements Manager {
    render(world: RhythmWorld, renderer: Renderer): void {
        renderer.drawText("HELLO WORLD", 40, 40,{fontSize: 20, color:0xffffff});
        
    }
}


// Each lane manager gets a list of corresponding notes for its input keys
export class LaneManager implements Manager {
    // Know where you are in the song
    // Calculate where the notes should be
    // noteScreenY = hiZoneY - (note.targetTime - songTime) * scrollSpeed
    // If it scrolls past and was not hit

    update(): void {
        // Move the notes down based on song time, check for misses
    }
    render(world: RhythmWorld, renderer: Renderer): void {

    }

}
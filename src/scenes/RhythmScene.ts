import { Audio } from "../engine/Audio.js";
import type { Scene, GameContext, Renderer, Audio } from "../engine/types.js";
import type { Manager, RhythmWorld } from "./types.js";
import { LANES, type GameNote, type Lane } from "../midi/parser.js";

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
    private readonly notes: GameNote[];
    private readonly laneKey: Lane;
    private readonly laneIndex: number;
    private readonly x: number;
    private readonly scrollSpeed: number;
    private readonly hitZoneY: number;
    private readonly noteWidth: number;
    private readonly noteHeight: number;
    private readonly hitZoneHeight: number;
    private readonly visibleTop: number;
    private readonly visibleBottom: number;

    constructor(notes: GameNote[], laneKey: Lane) {
        this.notes = notes;
        this.laneKey = laneKey;
        this.laneIndex = LANES.indexOf(laneKey);

        // Literal guesses on size
        this.noteWidth = 16;
        this.noteHeight = 28;
        this.hitZoneHeight = 14;
        this.scrollSpeed = 300;
        this.hitZoneY = 540;

        // Map the canvas height
        this.visibleTop = 0;
        this.visibleBottom = 600;

        const laneSpacing = 72;
        const firstLaneX = 160;
        this.x = firstLaneX + this.laneIndex * laneSpacing;

    }


    // Know where you are in the song
    // Calculate where the notes should be
    // noteScreenY = hiZoneY - (note.targetTime - songTime) * scrollSpeed


    update(world: RhythmWorld, dt: number): void {
        // Need to know what time it is in the world
        // Move the notes down based on song time, check for misses
    }
    render(world: RhythmWorld, renderer: Renderer): void {
        // First pass draw targets:
        // 1) lane guide (full height skinny column)
        // 2) hit zone (short rectangle near bottom)
        // 3) notes filtered by visibility
    }

}

import { Audio } from "../engine/Audio.js";
import type { Scene, GameContext, Renderer } from "../engine/types.js";
import type { Manager, RhythmWorld } from "./types.js";
import { LANES, type GameNote, type Lane, type SongMap } from "../midi/parser.js";
import { Graphics } from "pixi.js";


// Temporary local data while wiring LaneManager:
// Maybe change time to targetTime
const songMap: SongMap = {
  name: "Dummy Groove",
  duration: 6,
  bpm: 120,
  notes: [
    { time: 0.8, lane: "D", duration: 0.12, velocity: 0.9, noteNumber: 48 },
    { time: 1.1, lane: "F", duration: 0.12, velocity: 0.85, noteNumber: 52 },
    { time: 1.4, lane: "J", duration: 0.12, velocity: 0.88, noteNumber: 57 },
    { time: 1.7, lane: "K", duration: 0.12, velocity: 0.92, noteNumber: 60 },

    { time: 2.2, lane: "D", duration: 0.15, velocity: 0.95, noteNumber: 50 },
    { time: 2.5, lane: "F", duration: 0.15, velocity: 0.87, noteNumber: 53 },
    { time: 2.8, lane: "J", duration: 0.15, velocity: 0.9, noteNumber: 58 },
    { time: 3.1, lane: "K", duration: 0.15, velocity: 0.93, noteNumber: 62 },
  ],
};

export class RhythmScene implements Scene {
private world!: GameContext;
private managers: Manager[];

  init(context: GameContext): void {
    this.managers = [];
    let currentSong = new Audio();

    //let songMap = [];

    LANES.forEach(lane => {
        let notes = songMap.notes.filter((n)=>n.lane === lane);
        let musicLane = new LaneManager(notes, lane);
        this.managers.push(musicLane);
    });
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
    // songTime will eventually live on RhythmWorld
    private songTime: number = 0;

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

        // Space in between
        const laneSpacing = 72;
        const firstLaneX = 160;
        // Calculate the x 
        this.x = firstLaneX + this.laneIndex * laneSpacing;

    }


    // Know where you are in the song
    // Calculate where the notes should be
    // noteScreenY = hiZoneY - (note.targetTime - songTime) * scrollSpeed

    update(world: RhythmWorld, dt: number): void {
        // Update does math, changes states, marks notes as missed
        // Need to know what time it is in the world
        // Move the notes down based on song time, check for misses

        // Update the songtime with the cumulative elapsed time between renders
        this.songTime = this.songTime + dt;
    }
    render(world: RhythmWorld, renderer: Renderer): void {
        // Assembles the drawings. Takes the current state and draws it on the screen
        // Just reads and paints
        // First pass draw targets:
        // 1) lane guide (full height skinny column)
        // 2) hit zone (short rectangle near bottom)
        // 3) notes filtered by visibility
        let rectangle1 = new Graphics();

        let centerX = this.x + 2;
        let hitZoneX = centerX - (this.noteWidth / 2);

        // Draw the notes
        this.notes.forEach((note)=> {
            let noteScreenY = this.hitZoneY - (note.time - this.songTime) * this.scrollSpeed

            rectangle1.rect(this.x,noteScreenY, 12,4);
        });


        rectangle1.rect(this.x, this.visibleTop, 4, this.visibleBottom).fill("white");
        rectangle1.rect(hitZoneX, this.hitZoneY, this.noteWidth, this.hitZoneHeight).fill("yellow");
        renderer.stage.addChild(rectangle1);

       

    }

}

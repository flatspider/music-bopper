import { SONG_LIST, SongId } from "../assets/midi/songlist";
import type { Scene, GameContext, Renderer } from "../engine/types";
import type { Manager, RhythmWorld } from "./types";
import { LANES, type GameNote, type Lane } from "../midi/parser";
import { AudioManager } from "../managers/AudioManager.js";

export class RhythmScene implements Scene {
  private world!: RhythmWorld;
  private managers: Manager[];
  private songId: SongId;

  constructor(songId: SongId) {
    this.songId = songId;
  }

  init(context: GameContext): void {
    this.managers = [];

    // 1. Get song data (MidiSongJson is structurally compatible with SongMap)
    const song = SONG_LIST[this.songId];

    // 2. Create AudioManager and load song — push first so it writes world.songTime before LaneManagers read it
    const audioManager = new AudioManager();
    audioManager.loadSong(song);
    this.managers.push(audioManager);

    // 3. Create LaneManagers from real song data
    LANES.forEach((lane) => {
      const notes = song.notes.filter((n) => n.lane === lane);
      this.managers.push(new LaneManager(notes, lane));
    });

    // 4. Init world — "start" state waits for Space to unlock audio
    this.world = {
      state: "start",
      player: {},
      songTime: 0,
    };
  }

  update(dt: number): void {
    for (const m of this.managers) m.update?.(this.world, dt);
  }

  render(renderer: Renderer): void {
    renderer.clear();

    for (const m of this.managers) m.render?.(this.world, renderer);

    if (this.world.state == "start") {
      renderer.drawText("Press SPACE to start when ready!", 40, 40, {
        fontSize: 20,
        color: 0xffffff,
      });
    }
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
    renderer.drawText("HELLO WORLD", 40, 40, { fontSize: 20, color: 0xffffff });
  }
}

// Lookup for lanes defined outside of the class
const keyLookup = { D: "KeyD", F: "KeyF", J: "KeyJ", K: "KeyK" };

// Earning points condition
// Less than 350 note gap returns "good" points
const hitWindow = { good: 350, better: 250, Perfect: 150 };

// Each lane manager gets a list of corresponding notes for its input keys
export class LaneManager implements Manager {
  private notes: GameNote[];
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
  private songTime: number = 0;

  //Managing key press
  private isPressed: boolean;

  constructor(notes: GameNote[], laneKey: Lane) {
    this.notes = notes;
    this.laneKey = laneKey;
    this.laneIndex = LANES.indexOf(laneKey);

    // Dialing in size
    this.noteWidth = 64;
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

    this.isPressed = false;
  }

  onKeyDown(world: RhythmWorld, key: string): void {
    if (key !== keyLookup[this.laneKey]) return;
    this.isPressed = true;

    let closestDist = Infinity;
    let closestNote: GameNote | null = null;

    for (const note of this.notes) {
      const distanceFromNote = Math.abs(note.time - this.songTime);

      if (distanceFromNote < closestDist) {
        closestDist = distanceFromNote;
        closestNote = note;
      }
    }
    if (!closestNote) return;

    if (closestDist < 0.15) {
      console.log("GREAT");
    } else {
      console.log("TOO FAR");
    }
  }

  onKeyUp(world: RhythmWorld, key: string): void {
    if (key !== keyLookup[this.laneKey]) return;
    this.isPressed = false;
  }

  update(world: RhythmWorld, _dt: number): void {
    // Update does math, changes states, marks notes as missed
    // Need to know what time it is in the world
    // Move the notes down based on song time, check for misses

    // Read audio clock from world — single source of truth
    this.songTime = (world as RhythmWorld).songTime;
  }
  render(world: RhythmWorld, renderer: Renderer): void {
    // Assembles the drawings. Takes the current state and draws it on the screen
    // Just reads and paints
    // First pass draw targets:
    // 1) lane guide (full height skinny column)
    // 2) hit zone (short rectangle near bottom)
    // 3) notes filtered by visibility

    let centerX = this.x + 2;
    let hitZoneX = centerX - this.noteWidth / 2;

    // Draw only visible notes (cull off-screen to avoid rendering all 1750)
    const buffer = 40;
    for (const note of this.notes) {
      const noteScreenY =
        this.hitZoneY - (note.time - this.songTime) * this.scrollSpeed;

      // Skip notes below the screen (already passed)
      if (noteScreenY > this.visibleBottom + buffer) continue;
      // Skip notes above the screen (far in the future) — and stop early since notes are sorted by time
      if (noteScreenY < this.visibleTop - buffer) break;

      // Glow layer. X position, y position, radius, gold, opacity
      renderer.drawCircle(this.x, noteScreenY, 20, 0xffd700, 0.25);

      // Inner note layer. X position, y position, radius, cream white, opacity
      renderer.drawCircle(this.x, noteScreenY, 14, 0xfff8dc, 1);
    }

    // This is the skinny rectangle
    renderer.drawRect(this.x, this.visibleTop, 4, this.visibleBottom, 0xffffff);

    // This is the yellow hitzone with press logic

    if (this.isPressed) {
      renderer.drawRect(
        hitZoneX,
        this.hitZoneY,
        this.noteWidth,
        this.hitZoneHeight,
        0xd65a4a,
      );
    } else {
      renderer.drawRect(
        hitZoneX,
        this.hitZoneY,
        this.noteWidth,
        this.hitZoneHeight,
        0xffe066,
      );
    }
  }
}

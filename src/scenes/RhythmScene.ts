import { SONG_LIST, SongId } from "../assets/midi/songlist";
import type { Scene, GameContext, Renderer } from "../engine/types";
import type { Manager, RhythmWorld, Lane } from "./types";
import { LANES, type GameNote, type SongMap } from "../midi/parser";
import { AudioManager } from "../managers/AudioManager.js";
import { InputManager } from "../managers/InputManager.js";
import { GameplayManager } from "../managers/GameplayManager.js";
import { LaneManager } from "../managers/LaneManager.js";

export class RhythmScene implements Scene {
  private world!: RhythmWorld;
  private managers!: Manager[];
  private songId: SongId;

  constructor(songId: SongId) {
    this.songId = songId;
  }

  init(_context: GameContext): void {
    // 1. Get song data
    const song = SONG_LIST[this.songId];

    // 2. Build notes by lane for the world
    const notesByLane: Record<Lane, GameNote[]> = { D: [], F: [], J: [], K: [] };
    for (const lane of LANES) {
      notesByLane[lane] = song.notes
        .filter((n) => n.lane === lane)
        .map((n) => ({
          time: n.time,
          lane: n.lane,
          duration: n.duration,
          velocity: n.velocity,
          noteNumber: n.noteNumber,
          status: "active" as const,
        }));
    }

    // 3. Init world
    this.world = {
      state: "start",
      player: {},
      songTime: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      hitCounts: { perfect: 0, great: 0, good: 0, missed: 0 },
      lastHitResult: null,
      notes: notesByLane,
      pendingInputs: [],
    };

    // 4. Create managers — order matters:
    //    AudioManager first (writes songTime before others read it)
    //    InputManager next (writes pendingInputs)
    //    GameplayManager next (drains pendingInputs, updates score)
    //    LaneManagers last (read note statuses for rendering)
    const audioManager = new AudioManager();
    audioManager.loadSong(song as unknown as SongMap);

    this.managers = [
      audioManager,
      new InputManager(),
      new GameplayManager(),
      ...LANES.map((lane) => new LaneManager(lane)),
    ];
  }

  update(dt: number): void {
    for (const m of this.managers) m.update?.(this.world, dt);
  }

  render(renderer: Renderer): void {
    renderer.clear();
    for (const m of this.managers) m.render?.(this.world, renderer);

    if (this.world.state === "start") {
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

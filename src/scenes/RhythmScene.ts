import { SONG_LIST, SongId } from "../assets/midi/songlist";
import type { Scene, GameContext, Renderer } from "../engine/types";
import type { Manager, RhythmWorld, Lane } from "./types";
import { LANES, assignLane, type GameNote } from "../midi/parser";
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

    // 2. Normalize notes — some JSON files have lane/noteNumber, some only have midi
    const rawNotes = song.notes as Array<Record<string, any>>;
    const minMidi = Math.min(...rawNotes.map((n) => n.midi ?? n.noteNumber ?? 60));
    const maxMidi = Math.max(...rawNotes.map((n) => n.midi ?? n.noteNumber ?? 60));
    const range = maxMidi - minMidi;

    const allNotes: GameNote[] = rawNotes.map((n) => {
      const noteNumber = n.noteNumber ?? n.midi ?? 60;
      const lane = n.lane ?? assignLane(noteNumber, minMidi, range);
      return {
        time: n.time,
        lane,
        duration: n.duration,
        velocity: n.velocity,
        noteNumber,
        status: "active" as const,
      };
    });

    // 3. Distribute to lanes
    const notesByLane: Record<Lane, GameNote[]> = { D: [], F: [], J: [], K: [] };
    for (const note of allNotes) {
      notesByLane[note.lane].push(note);
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
    audioManager.loadSong({
      name: song.name,
      duration: song.duration,
      bpm: song.bpm,
      notes: allNotes,
    });

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
      return;
    }

    // Score (top-right)
    renderer.drawText(`${this.world.score}`, 560, 30, {
      fontSize: 28,
      color: 0xffffff,
      anchor: 1,
    });

    // Combo (below score, only when active)
    if (this.world.combo > 1) {
      renderer.drawText(`${this.world.combo}x combo`, 560, 60, {
        fontSize: 16,
        color: 0xffe066,
        anchor: 1,
      });
    }

    // Hit grade feedback — flash for 0.4s after each hit
    if (this.world.lastHitResult) {
      const age = this.world.songTime - this.world.lastHitResult.time;
      if (age < 0.4) {
        const grade = this.world.lastHitResult.grade;
        const label = grade.toUpperCase() + "!";
        const color = grade === "perfect" ? 0xffd700
                    : grade === "great"   ? 0x44cc44
                    :                       0xaaaaaa;
        renderer.drawText(label, 300, 480, {
          fontSize: 24,
          color,
          anchor: 0.5,
        });
      }
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

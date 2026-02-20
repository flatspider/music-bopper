import { SONG_LIST, CHART_TRACKS, SongId } from "../assets/midi/songlist";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../engine/types";
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

    // 2. Filter to chart tracks (if configured), otherwise use all notes
    const chartTrackNames = CHART_TRACKS[this.songId];
    let rawNotes = song.notes as Array<Record<string, any>>;
    if (chartTrackNames) {
      rawNotes = rawNotes.filter((n) => chartTrackNames.includes(n.track));
    }

    // 3. Recompute lanes based on filtered pitch range (so notes spread across all 4 lanes)
    const minMidi = Math.min(...rawNotes.map((n) => n.midi ?? n.noteNumber ?? 60));
    const maxMidi = Math.max(...rawNotes.map((n) => n.midi ?? n.noteNumber ?? 60));
    const range = maxMidi - minMidi;

    let chartNotes: GameNote[] = rawNotes.map((n) => {
      const noteNumber = n.noteNumber ?? n.midi ?? 60;
      return {
        time: n.time,
        lane: assignLane(noteNumber, minMidi, range),
        duration: n.duration,
        velocity: n.velocity,
        noteNumber,
        status: "active" as const,
      };
    });

    // 4. Thin quick-succession notes — drop every 3rd note within 0.12s of its predecessor (~30% removal)
    chartNotes.sort((a, b) => a.time - b.time);
    const thinned: GameNote[] = [];
    let quickRun = 0;
    for (let i = 0; i < chartNotes.length; i++) {
      const gap = i > 0 ? chartNotes[i].time - chartNotes[i - 1].time : Infinity;
      if (gap < 0.12) {
        quickRun++;
        if (quickRun % 3 === 0) continue;
      } else {
        quickRun = 0;
      }
      thinned.push(chartNotes[i]);
    }
    chartNotes = thinned;

    // 5. Distribute to lanes
    const notesByLane: Record<Lane, GameNote[]> = { D: [], F: [], J: [], K: [] };
    for (const note of chartNotes) {
      notesByLane[note.lane].push(note);
    }

    // 6. Init world
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

    // 7. Create managers — order matters:
    //    AudioManager first (writes songTime before others read it)
    //    InputManager next (writes pendingInputs)
    //    GameplayManager next (drains pendingInputs, updates score)
    //    LaneManagers last (read note statuses for rendering)
    const audioManager = new AudioManager();
    audioManager.loadSong(song);

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

    this.renderScoreHUD(renderer);
    this.renderGradeFeedback(renderer);
  }

  // --- Score HUD (top-right panel, matches SongSelect aesthetic) ---

  private renderScoreHUD(renderer: Renderer): void {
    const panelW = 180;
    const panelH = this.world.combo > 1 ? 80 : 56;
    const panelX = CANVAS_WIDTH - panelW - 16;
    const panelY = 12;

    // Dark panel background
    renderer.drawRect(panelX, panelY, panelW, panelH, 0x141416);
    // Gold left accent bar
    renderer.drawRect(panelX, panelY, 3, panelH, 0xd4af37);

    // "SCORE" label
    renderer.drawText("SCORE", panelX + 14, panelY + 8, {
      fontSize: 10,
      color: 0x777777,
      letterSpacing: 3,
    });

    // Score value
    renderer.drawText(`${this.world.score}`, panelX + 14, panelY + 24, {
      fontSize: 26,
      color: 0xffffff,
      fontWeight: "bold",
      fontFamily: "Arial Black, Arial, sans-serif",
    });

    // Combo (only when active)
    if (this.world.combo > 1) {
      renderer.drawText(`${this.world.combo}x COMBO`, panelX + 14, panelY + 56, {
        fontSize: 13,
        color: 0xd4af37,
        fontWeight: "bold",
        letterSpacing: 2,
      });
    }
  }

  // --- Hit grade feedback (centered, below hit zone) ---

  private renderGradeFeedback(renderer: Renderer): void {
    if (!this.world.lastHitResult) return;

    const age = this.world.songTime - this.world.lastHitResult.time;
    if (age >= 0.4) return;

    const grade = this.world.lastHitResult.grade;
    const label = grade.toUpperCase() + "!";
    const color = grade === "perfect" ? 0xd4af37  // gold (matches SongSelect accent)
               : grade === "great"   ? 0x44cc44
               :                       0x888888;

    renderer.drawText(label, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 120, {
      fontSize: 28,
      color,
      anchor: 0.5,
      fontWeight: "bold",
      fontFamily: "Arial Black, Arial, sans-serif",
      letterSpacing: 4,
    });
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

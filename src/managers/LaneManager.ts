import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../engine/types";
import type { Renderer } from "../engine/types";
import type { Manager, RhythmWorld, Lane } from "../scenes/types";
import { LANES } from "../midi/parser";
import { gameConfig } from "../config/GameConfig";

const keyLookup: Record<Lane, string> = { D: "KeyD", F: "KeyF", J: "KeyJ", K: "KeyK" };

export class LaneManager implements Manager {
  private readonly laneKey: Lane;
  private readonly laneIndex: number;

  private isPressed: boolean = false;

  constructor(laneKey: Lane) {
    this.laneKey = laneKey;
    this.laneIndex = LANES.indexOf(laneKey);

    this.noteWidth = 64;
    this.hitZoneHeight = 14;
    this.scrollSpeed = 300;
    this.hitZoneY = CANVAS_HEIGHT - 60;
    this.visibleTop = 0;
    this.visibleBottom = CANVAS_HEIGHT;

    // Center 4 lanes in the canvas
    const laneSpacing = 80;
    const totalLaneWidth = (LANES.length - 1) * laneSpacing;
    const firstLaneX = (CANVAS_WIDTH - totalLaneWidth) / 2;
    this.x = firstLaneX + this.laneIndex * laneSpacing;
  }

  onKeyDown(_world: RhythmWorld, key: string): void {
    if (key !== keyLookup[this.laneKey]) return;
    this.isPressed = true;
  }

  onKeyUp(_world: RhythmWorld, key: string): void {
    if (key !== keyLookup[this.laneKey]) return;
    this.isPressed = false;
  }

  render(world: RhythmWorld, renderer: Renderer): void {
    const { scrollSpeed, noteWidth, hitZoneY, hitZoneHeight,
            laneSpacing, firstLaneX, noteGlowRadius, noteInnerRadius } = gameConfig.visuals;
    const x = firstLaneX + this.laneIndex * laneSpacing;

    const notes = world.notes[this.laneKey];
    const songTime = world.songTime;
    const centerX = x + 2;
    const hitZoneX = centerX - noteWidth / 2;

    // Draw only visible, active notes
    const visibleTop = 0;
    const visibleBottom = 600;
    const buffer = 40;
    for (const note of notes) {
      if (note.status !== "active") continue;

      const noteScreenY =
        hitZoneY - (note.time - songTime) * scrollSpeed;

      if (noteScreenY > visibleBottom + buffer) continue;
      if (noteScreenY < visibleTop - buffer) break;

      // Glow layer
      renderer.drawCircle(x, noteScreenY, noteGlowRadius, 0xffd700, 0.25);
      // Inner note
      renderer.drawCircle(x, noteScreenY, noteInnerRadius, 0xfff8dc, 1);
    }

    // Lane guide line
    renderer.drawRect(x, visibleTop, 4, visibleBottom, 0xffffff);

    // Hit zone — changes color on press
    const hitZoneColor = this.isPressed ? 0xd65a4a : 0xffe066;
    renderer.drawRect(
      hitZoneX,
      hitZoneY,
      noteWidth,
      hitZoneHeight,
      hitZoneColor,
    );
  }
}

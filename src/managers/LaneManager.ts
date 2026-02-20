import type { Renderer } from "../engine/types";
import type { Manager, RhythmWorld, Lane } from "../scenes/types";
import { LANES } from "../midi/parser";

const keyLookup: Record<Lane, string> = { D: "KeyD", F: "KeyF", J: "KeyJ", K: "KeyK" };

export class LaneManager implements Manager {
  private readonly laneKey: Lane;
  private readonly laneIndex: number;
  private readonly x: number;
  private readonly scrollSpeed: number;
  private readonly hitZoneY: number;
  private readonly noteWidth: number;
  private readonly hitZoneHeight: number;
  private readonly visibleTop: number;
  private readonly visibleBottom: number;

  private isPressed: boolean = false;

  constructor(laneKey: Lane) {
    this.laneKey = laneKey;
    this.laneIndex = LANES.indexOf(laneKey);

    this.noteWidth = 64;
    this.hitZoneHeight = 14;
    this.scrollSpeed = 300;
    this.hitZoneY = 540;
    this.visibleTop = 0;
    this.visibleBottom = 600;

    const laneSpacing = 72;
    const firstLaneX = 160;
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
    const notes = world.notes[this.laneKey];
    const songTime = world.songTime;
    const centerX = this.x + 2;
    const hitZoneX = centerX - this.noteWidth / 2;

    // Draw only visible, active notes
    const buffer = 40;
    for (const note of notes) {
      if (note.status !== "active") continue;

      const noteScreenY =
        this.hitZoneY - (note.time - songTime) * this.scrollSpeed;

      if (noteScreenY > this.visibleBottom + buffer) continue;
      if (noteScreenY < this.visibleTop - buffer) break;

      // Glow layer
      renderer.drawCircle(this.x, noteScreenY, 20, 0xffd700, 0.25);
      // Inner note
      renderer.drawCircle(this.x, noteScreenY, 14, 0xfff8dc, 1);
    }

    // Lane guide line
    renderer.drawRect(this.x, this.visibleTop, 4, this.visibleBottom, 0xffffff);

    // Hit zone — changes color on press
    const hitZoneColor = this.isPressed ? 0xd65a4a : 0xffe066;
    renderer.drawRect(
      hitZoneX,
      this.hitZoneY,
      this.noteWidth,
      this.hitZoneHeight,
      hitZoneColor,
    );
  }
}

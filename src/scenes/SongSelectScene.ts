import type { SongId } from "../assets/midi/songlist";
import type { Scene, GameContext, Renderer } from "../engine/types";
import { SongSelectManager } from "../managers/SongSelectManager";
import { RhythmScene } from "./RhythmScene";
import type { Manager, SongSelectWorld } from "./types";

export class SongSelectScene implements Scene {
  private world!: SongSelectWorld;
  private managers!: Manager<SongSelectWorld>[];
  private context!: GameContext;

  init(context: GameContext): void {
    // Create simple manager
    this.managers = [];
    this.context = context;

    // songSelectWorld
    this.world = {
      state: "songSelect",
      player: {},
      currentCardHighlight: 0,
      selectedSong: "", // this is falsy
    };

    this.managers.push(new SongSelectManager());
  }

  update(dt: number): void {
    if (this.world.selectedSong) {
      const rhythmScene = new RhythmScene(this.world.selectedSong as SongId);
      this.context.loadScene?.(rhythmScene);
      return;
    }
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

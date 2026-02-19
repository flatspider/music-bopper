import type { Scene, GameContext, Renderer } from "../engine/types.js";
import type { Manager, RhythmWorld } from "./types.js";

export class RhythmScene implements Scene {
private world!: GameContext;
private managers: Manager[];

  init(context: GameContext): void {
    // Create simple manager
    this.managers = [];
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
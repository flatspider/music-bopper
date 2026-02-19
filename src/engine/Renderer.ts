import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import type { Renderer as IRenderer } from "./types.ts";

export class Renderer implements IRenderer {
  private app: Application;
  private drawContainer: Container;

  get stage(): Container {
    return this.app.stage;
  }

  constructor(app: Application) {
    this.app = app;
    this.drawContainer = new Container();
    this.app.stage.addChild(this.drawContainer);
  }

  drawCircle(
    pixelX: number,
    pixelY: number,
    radius: number,
    color: number,
    alpha: number,
  ): void {
    let circleDrawing = new Graphics();
    circleDrawing
      .circle(pixelX, pixelY, radius)
      .fill({ color: color, alpha: alpha });
    this.drawContainer.addChild(circleDrawing);
  }

  drawRect(
    gridX: number,
    gridY: number,
    widthCells: number,
    heightCells: number,
    color: number,
  ): void {
    let drawing = new Graphics();
    drawing.rect(gridX, gridY, widthCells, heightCells).fill(color);
    this.drawContainer.addChild(drawing);
  }
  drawRoundedRect(
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number,
    color: number,
  ): void {
    const g = new Graphics();
    g.roundRect(x, y, w, h, radius);
    g.fill(color);
    this.drawContainer.addChild(g);
  }
  drawText(
    text: string,
    pixelX: number,
    pixelY: number,
    options?: { fontSize?: number; color?: number; anchor?: number },
  ): void {
    const newText = new Text({
      text: text,
      style: {
        fontSize: options?.fontSize,
        fill: options?.color,
      },
      x: pixelX,
      y: pixelY,
    });
    this.drawContainer.addChild(newText);
  }
  clear(): void {
    this.drawContainer.removeChildren();
  }
}

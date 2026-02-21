import {
  Application,
  Container,
  Graphics,
  Text,
  type TextStyleFontWeight,
  type TextStyleFontStyle,
} from "pixi.js";
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
  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number,
    width: number = 1,
  ): void {
    const g = new Graphics();
    g.moveTo(x1, y1).lineTo(x2, y2).stroke({ color, width });
    this.drawContainer.addChild(g);
  }

  drawText(
    text: string,
    pixelX: number,
    pixelY: number,
    options?: {
      fontSize?: number;
      color?: number;
      anchor?: number;
      fontWeight?: TextStyleFontWeight;
      fontStyle?: TextStyleFontStyle;
      fontFamily?: string;
      letterSpacing?: number;
    },
  ): void {
    const style: Record<string, unknown> = {};
    if (options?.fontSize != null) style.fontSize = options.fontSize;
    if (options?.color != null) style.fill = options.color;
    if (options?.fontWeight) style.fontWeight = options.fontWeight;
    if (options?.fontStyle) style.fontStyle = options.fontStyle;
    if (options?.fontFamily) style.fontFamily = options.fontFamily;
    if (options?.letterSpacing != null)
      style.letterSpacing = options.letterSpacing;

    const newText = new Text({
      text: text,
      style,
      x: pixelX,
      y: pixelY,
    });
    if (options?.anchor != null) newText.anchor.x = options.anchor;
    this.drawContainer.addChild(newText);
  }
  clear(): void {
    this.drawContainer.removeChildren();
  }
}

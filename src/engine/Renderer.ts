import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import type { Renderer as IRenderer } from "./types.ts"

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
        
        drawRect(gridX: number, gridY: number, widthCells: number, heightCells: number, color: number): void {
            
        }
        drawText(text: string, pixelX: number, pixelY: number, options?: { fontSize?: number; color?: number; anchor?: number }): void {
            
        }
        clear(): void {
            this.drawContainer.removeChildren();
        }

        
    }



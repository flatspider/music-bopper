import GUI from "lil-gui";
import { gameConfig, defaultConfig } from "../config/GameConfig";

// --- Presets ---

type Preset = typeof gameConfig;

const presets: Record<string, Partial<{ [K in keyof Preset]: Partial<Preset[K]> }>> = {
  "Easy Mode": {
    gameplay: { perfectWindow: 0.15, greatWindow: 0.25, goodWindow: 0.4 },
    visuals:  { scrollSpeed: 180 },
  },
  "Hard Mode": {
    gameplay: { perfectWindow: 0.03, greatWindow: 0.06, goodWindow: 0.09 },
    visuals:  { scrollSpeed: 500 },
  },
  "Chaos Mode": {
    engine:   { tickRateMs: 80 },
    gameplay: { perfectWindow: 0.02, greatWindow: 0.04, goodWindow: 0.06 },
    visuals:  { scrollSpeed: 900, noteGlowRadius: 40, noteInnerRadius: 6, laneSpacing: 40 },
  },
};

function applyPreset(preset: Partial<{ [K in keyof Preset]: Partial<Preset[K]> }>, gui: GUI) {
  for (const category of Object.keys(preset) as (keyof Preset)[]) {
    Object.assign(gameConfig[category], preset[category]);
  }
  gui.controllersRecursive().forEach((c) => c.updateDisplay());
}

function resetAll(gui: GUI) {
  for (const category of Object.keys(defaultConfig) as (keyof Preset)[]) {
    Object.assign(gameConfig[category], defaultConfig[category]);
  }
  gui.controllersRecursive().forEach((c) => c.updateDisplay());
}

// --- Panel ---

/**
 * Runtime control panel built on lil-gui.
 * Toggle visibility with the backtick (`) key.
 */
export function createControlPanel(): GUI {
  const gui = new GUI({ title: "Game Config" });
  gui.close();

  // --- Presets & Reset ---
  const actions = {
    preset: "Easy Mode",
    applyPreset: () => applyPreset(presets[actions.preset], gui),
    resetAll: () => resetAll(gui),
  };
  gui.add(actions, "preset", Object.keys(presets)).name("Preset");
  gui.add(actions, "applyPreset").name("Apply Preset");
  gui.add(actions, "resetAll").name("Reset to Defaults");

  // --- Engine ---
  const engine = gui.addFolder("Engine");
  engine.add(gameConfig.engine, "tickRateMs", 1, 200, 1).name("Tick Rate (ms)");
  engine.add(gameConfig.engine, "maxAccumulatorMs", 100, 5000, 100).name("Max Accumulator (ms)");

  // --- Gameplay ---
  const gameplay = gui.addFolder("Gameplay");
  gameplay.add(gameConfig.gameplay, "perfectWindow", 0.01, 0.3, 0.01).name("Perfect Window (s)");
  gameplay.add(gameConfig.gameplay, "greatWindow", 0.01, 0.5, 0.01).name("Great Window (s)");
  gameplay.add(gameConfig.gameplay, "goodWindow", 0.01, 0.5, 0.01).name("Good Window (s)");
  gameplay.add(gameConfig.gameplay, "perfectPoints", 0, 1000, 10).name("Perfect Points");
  gameplay.add(gameConfig.gameplay, "greatPoints", 0, 1000, 10).name("Great Points");
  gameplay.add(gameConfig.gameplay, "goodPoints", 0, 1000, 10).name("Good Points");
  gameplay.add(gameConfig.gameplay, "comboStep", 1, 50, 1).name("Combo Step");
  gameplay.add(gameConfig.gameplay, "comboBonusPct", 0, 1, 0.05).name("Combo Bonus %");
  gameplay.add(gameConfig.gameplay, "quickNoteGap", 0.01, 0.5, 0.01).name("Quick Note Gap (s)");
  gameplay.add(gameConfig.gameplay, "noteThinRate", 2, 10, 1).name("Note Thin Rate");

  // --- Visuals ---
  const visuals = gui.addFolder("Visuals");
  visuals.add(gameConfig.visuals, "scrollSpeed", 50, 1200, 10).name("Scroll Speed");
  visuals.add(gameConfig.visuals, "noteWidth", 10, 200, 2).name("Note Width");
  visuals.add(gameConfig.visuals, "hitZoneY", 100, 590, 10).name("Hit Zone Y");
  visuals.add(gameConfig.visuals, "hitZoneHeight", 2, 60, 2).name("Hit Zone Height");
  visuals.add(gameConfig.visuals, "laneSpacing", 20, 150, 2).name("Lane Spacing");
  visuals.add(gameConfig.visuals, "firstLaneX", 0, 400, 10).name("First Lane X");
  visuals.add(gameConfig.visuals, "noteGlowRadius", 0, 60, 1).name("Note Glow Radius");
  visuals.add(gameConfig.visuals, "noteInnerRadius", 2, 40, 1).name("Note Inner Radius");
  visuals.add(gameConfig.visuals, "hitFeedbackDuration", 0.1, 2, 0.1).name("Feedback Duration (s)");

  // Toggle with backtick key
  window.addEventListener("keydown", (e) => {
    if (e.code === "Backquote") {
      gui.show(gui._hidden);
    }
  });

  return gui;
}

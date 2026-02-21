import GUI from "lil-gui";
import { gameConfig } from "../config/GameConfig";

/**
 * Runtime control panel built on lil-gui.
 * Toggle visibility with the backtick (`) key.
 */
export function createControlPanel(): GUI {
  const gui = new GUI({ title: "Game Config" });
  gui.close();

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

  // --- Audio ---
  const audio = gui.addFolder("Audio");
  audio.add(gameConfig.audio, "synthPolyphony", 4, 128, 4).name("Synth Polyphony");
  audio.add(gameConfig.audio, "kickVolume", -30, 0, 1).name("Kick Volume (dB)");
  audio.add(gameConfig.audio, "hatVolume", -30, 0, 1).name("Hat Volume (dB)");
  audio.add(gameConfig.audio, "bgMusicVolume", -40, 0, 1).name("BG Music Volume (dB)");
  audio.add(gameConfig.audio, "bgFadeDuration", 0.1, 3, 0.1).name("BG Fade Duration (s)");
  audio.add(gameConfig.audio, "bgVelocityMultiplier", 0.1, 1.5, 0.05).name("BG Velocity Mult");
  audio.add(gameConfig.audio, "bgSynthPolyphony", 4, 128, 4).name("BG Synth Polyphony");

  // Toggle with backtick key
  window.addEventListener("keydown", (e) => {
    if (e.code === "Backquote") {
      gui.show(gui._hidden);
    }
  });

  return gui;
}

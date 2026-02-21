/**
 * Runtime-tweakable game configuration.
 *
 * This is a plain object that lil-gui binds to directly.
 * Managers read from it each tick, so changes take effect immediately.
 * Organized by category for the control panel UI.
 */

export const gameConfig = {
  engine: {
    tickRateMs: 16,
    maxAccumulatorMs: 1000,
  },

  gameplay: {
    perfectWindow: 0.05,
    greatWindow: 0.10,
    goodWindow: 0.15,
    perfectPoints: 300,
    greatPoints: 200,
    goodPoints: 100,
    comboStep: 10,
    comboBonusPct: 0.1,
    quickNoteGap: 0.12,
    noteThinRate: 3,
  },

  visuals: {
    scrollSpeed: 300,
    noteWidth: 64,
    hitZoneY: 680,
    hitZoneHeight: 14,
    laneSpacing: 80,
    firstLaneX: 260,
    noteGlowRadius: 20,
    noteInnerRadius: 14,
    hitFeedbackDuration: 0.4,
  },

};

/** Deep copy of initial values for reset functionality. */
export const defaultConfig = structuredClone(gameConfig);

export type Lane = "D" | "F" | "J" | "K";
export const LANES: Lane[] = ["D", "F", "J", "K"];

export interface RawNote {
  time: number;
  duration: number;
  midi: number;
  velocity: number;
  track: string;
  channel: number;
}

export interface GameNote {
  time: number;
  duration: number;
  lane: Lane;
  velocity: number;
  midi: number;
  track: string;
}

export type Strategy = "percentile" | "track";

// ── Percentile-based ────────────────────────────────────────────────
// Sort all notes by pitch, split into 4 equal-count buckets.
// Guarantees balanced lane distribution regardless of pitch clustering.

function mapPercentile(notes: RawNote[]): GameNote[] {
  // Sort by pitch to find percentile boundaries
  const sorted = [...notes].sort((a, b) => a.midi - b.midi);
  const quarter = Math.floor(sorted.length / 4);

  // Pitch thresholds at 25th, 50th, 75th percentile
  const p25 = sorted[quarter]?.midi ?? 0;
  const p50 = sorted[quarter * 2]?.midi ?? 0;
  const p75 = sorted[quarter * 3]?.midi ?? 0;

  return notes.map((n) => ({
    time: n.time,
    duration: n.duration,
    lane: n.midi <= p25 ? "D" : n.midi <= p50 ? "F" : n.midi <= p75 ? "J" : "K",
    velocity: n.velocity,
    midi: n.midi,
    track: n.track,
  }));
}

// ── Track-based ─────────────────────────────────────────────────────
// Assign entire tracks to lanes. Sorts tracks by average pitch
// (lowest-pitched track → D, highest → K). If more than 4 tracks,
// groups them into 4 clusters.

function mapTrackBased(notes: RawNote[]): GameNote[] {
  // Gather unique tracks and their average pitch
  const trackStats = new Map<string, { sum: number; count: number }>();
  for (const n of notes) {
    const stat = trackStats.get(n.track) ?? { sum: 0, count: 0 };
    stat.sum += n.midi;
    stat.count++;
    trackStats.set(n.track, stat);
  }

  // Sort tracks by average pitch (low to high)
  const tracksByPitch = [...trackStats.entries()]
    .map(([name, stat]) => ({ name, avgPitch: stat.sum / stat.count }))
    .sort((a, b) => a.avgPitch - b.avgPitch);

  // Assign tracks to lanes (distribute evenly across 4 lanes)
  const trackToLane = new Map<string, Lane>();
  const numTracks = tracksByPitch.length;
  for (let i = 0; i < numTracks; i++) {
    const laneIdx = Math.min(Math.floor((i / numTracks) * 4), 3);
    trackToLane.set(tracksByPitch[i].name, LANES[laneIdx]);
  }

  return notes.map((n) => ({
    time: n.time,
    duration: n.duration,
    lane: trackToLane.get(n.track) ?? "F",
    velocity: n.velocity,
    midi: n.midi,
    track: n.track,
  }));
}

// ── Public API ───────────────────────────────────────────────────────

export function applyStrategy(notes: RawNote[], strategy: Strategy): GameNote[] {
  const mapped = strategy === "percentile" ? mapPercentile(notes) : mapTrackBased(notes);
  return mapped.sort((a, b) => a.time - b.time);
}

export function getLaneDistribution(notes: GameNote[]): Record<Lane, number> {
  const dist: Record<Lane, number> = { D: 0, F: 0, J: 0, K: 0 };
  for (const n of notes) dist[n.lane]++;
  return dist;
}

import type { MidiSongJson } from "../../types/miditypes";
import ColtraneData from "./json/COLTRANE.Countdown.json";
import PiratesData from "./json/Pirates of the Caribbean - He's a Pirate (3).json";
import TakeFiveData from "./json/Take-Five-1.json";
import WiiChannelsData from "./json/Wii Channels - Mii Channel.json";

export const SongId = {
  ColtraneCountdown: "ColtraneCountdown",
  PiratesOfTheCaribbean: "PiratesOfTheCaribbean",
  TakeFive: "TakeFive",
  WillChannel: "WillChannel",
} as const;

// enums causing an issue, so dumb workaround
export type SongId = (typeof SongId)[keyof typeof SongId];

export const SONG_LIST: Record<SongId, MidiSongJson> = {
  ColtraneCountdown: ColtraneData,
  PiratesOfTheCaribbean: PiratesData,
  TakeFive: TakeFiveData,
  WillChannel: WiiChannelsData,
};

// Per-song chart track filter — only these tracks become gameplay notes.
// Audio still plays ALL tracks. Omit a song to use all tracks for chart.
export const CHART_TRACKS: Partial<Record<SongId, string[]>> = {
  PiratesOfTheCaribbean: ["Right Hand"],
};

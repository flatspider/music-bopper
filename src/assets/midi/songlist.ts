import type { MidiSongJson } from "../../types/miditypes";
import ColtraneData from "./json/COLTRANE.Countdown.json";
import PiratesData from "./json/Pirates of the Caribbean.json";

export const SongId = {
  ColtraneCountdown: "ColtraneCountdown",
  PiratesOfTheCaribbean: "PiratesOfTheCaribbean",
} as const;

// enums causing an issue, so dumb workaround
export type SongId = (typeof SongId)[keyof typeof SongId];

export const SONG_LIST: Record<SongId, MidiSongJson> = {
  ColtraneCountdown: ColtraneData,
  PiratesOfTheCaribbean: PiratesData,
};

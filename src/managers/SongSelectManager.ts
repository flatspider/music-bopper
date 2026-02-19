import { SONG_LIST } from "../assets/midi/songlist";
import type { Renderer } from "../engine/Renderer";

import type { GameWorld, Manager, SongSelectWorld } from "../scenes/types";
import type { MidiSongJson } from "../types/miditypes";

export class SongSelectManager implements Manager {
  private songModules = SONG_LIST;

  onKeyDown(world: GameWorld, key: string): void {
    const ssWorld = world as SongSelectWorld;

    const songCount = Object.keys(this.songModules).length;

    if (key == "ArrowUp") {
      // check if last item, use modulo to return to first
      ssWorld.currentCardHighlight =
        (ssWorld.currentCardHighlight - 1 + songCount) % songCount;

      // select the Song below. If last one, loop around to top
    } else if (key == "ArrowDown") {
      // select song above. If first, loop around to bottom
      ssWorld.currentCardHighlight =
        (ssWorld.currentCardHighlight + 1) % songCount;
    } else if (key == "Enter") {
      const songSelectWorld = world as SongSelectWorld;
      const keys = Object.keys(this.songModules);

      songSelectWorld.selectedSong = keys[songSelectWorld.currentCardHighlight];

      // then load in the specific RhythmScene... init with RhythmWorld with the right song
    }
  }

  private songCard(
    renderer: Renderer,
    song: MidiSongJson,
    x: number,
    y: number,
    isSelected: boolean,
  ) {
    const width = 400;
    const height = 60;
    const radius = 12;

    // jazz palette: gold highlight vs smoky blue
    const bgColor = isSelected ? 0xd4af37 : 0x2a3a5c;
    const textColor = isSelected ? 0x1a1a2e : 0xfff5e1;

    // rect first (background)
    renderer.drawRoundedRect(x, y, width, height, radius, bgColor);
    // text on top (positioned within the rect)
    renderer.drawText(song.name, x + 20, y + 18, {
      fontSize: 20,
      color: textColor,
    });
  }

  render(world: SongSelectWorld, renderer: Renderer): void {
    // Songs are on values of the songModules
    const songs = Object.values(this.songModules);
    songs.forEach((song, idx) => {
      this.songCard(
        renderer,
        song,
        40,
        40 + idx * 80,
        idx === world.currentCardHighlight,
      );
    });
  }
}

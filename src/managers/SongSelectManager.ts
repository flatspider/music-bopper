import { SONG_LIST } from "../assets/midi/songlist";
import type { Renderer } from "../engine/Renderer";
import type { Manager, RhythmWorld } from "../scenes/types";

export class SongSelectManager implements Manager {
  songModules: typeof SONG_LIST;
  constructor() {
    this.songModules = SONG_LIST;
    this.world = SongSelectWorld;
  }

  onKeyDown(world: RhythmWorld, key: string): void {
    if (key == "ArrowUp") {
      // select the Song below. If last one, loop around to top
    } else if (key == "ArrowDown") {
      // select song above. If first, loop around to bottom
    } else if (key == "Enter") {
      this.world.loadScene(); // then load in the specific RhythmScene... init with RhythmWorld with the right song
    }
  }

  private songCard() {
    // will return a rect with the data we need. This will be used in the forEach to generate the songCards and displayed in render()
  }

  render(world: RhythmWorld, renderer: Renderer): void {
    // forEach midi song in /midi

    // display some sort of object with the renderer
    // populate it with the song title, name

    // add an optional argument for prev score

    // display equal sizes, would be nice to have a stacked vertical list
    Object.values(this.songModules).forEach((song, idx) => {
      const yPos = 40 + idx * 40;
      renderer.drawText(
        `Song: ${song.name}`,
        40, // x stays fixed
        yPos, // y increases per song
        {
          fontSize: 20,
          color: 0xffffff,
        },
      );
    });
  }
}

import { SONG_LIST, type SongId } from "../assets/midi/songlist";
import CarnivalData from "../assets/midi/json/Carnival-Or-Manha-De-Carnival-(Jazz-Gitaar-Trio).json";
import { BgMusicPlayer } from "../managers/BgMusicPlayer";
import type { Renderer } from "../engine/Renderer";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../engine/types";
import type { GameWorld, Manager, SongSelectWorld } from "../scenes/types";
import type { MidiSongJson } from "../types/miditypes";

// --- Song metadata that isn't in the MIDI JSON ---

type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

interface SongMeta {
  artist: string;
  difficulty: DifficultyLevel;
  difficultyLabel: string;
  accentColor: number; // left color block
}

const SONG_META: Record<SongId, SongMeta> = {
  ColtraneCountdown: {
    artist: "John Coltrane",
    difficulty: 5,
    difficultyLabel: "EXTR",
    accentColor: 0xb0522a, // warm copper
  },
  PiratesOfTheCaribbean: {
    artist: "Klaus Badelt",
    difficulty: 3,
    difficultyLabel: "MED",
    accentColor: 0x1a5aaa, // deep blue
  },
  TakeFive: {
    artist: "Dave Brubeck",
    difficulty: 2,
    difficultyLabel: "EASY",
    accentColor: 0xb0522a,
  },
  WillChannel: {
    artist: "Kazumi Totaka",
    difficulty: 1,
    difficultyLabel: "EASY",
    accentColor: 0x1a5aaa,
  },
};

// --- Layout constants ---

const COLORS = {
  bg: 0x141416,
  headerText: 0xffffff,
  subtitleText: 0x888888,
  columnLabel: 0x777777,
  columnLine: 0x444444,
  cardBg: 0x1e1e22,
  cardBgSelected: 0x3c3c44,
  cardBorder: 0xd4af37, // gold highlight for selected
  songTitle: 0xffffff,
  artistText: 0x999999,
  bpmText: 0x888888,
  diffText: 0x999999,
  diffBlockFilled: 0xcccccc,
  diffBlockEmpty: 0x444444,
};

const HEADER_HEIGHT = 150;
const CARD_HEIGHT = 120;
const CARD_GAP = 2;
const ACCENT_WIDTH = 190;
const TEXT_PAD_LEFT = ACCENT_WIDTH + 20;
const MAX_VISIBLE_CARDS = 6; // how many cards fit on screen

// --- Manager ---

export class SongSelectManager implements Manager {
  private songModules = SONG_LIST;
  private scrollOffset = 0;

  // --- Background music ---
  private bgMusic = new BgMusicPlayer();
  private bgStarted = false;
  private fadingOut = false;

  constructor() {
    this.bgMusic.load(CarnivalData as unknown as MidiSongJson);
  }

  /** Start bg music on the first user keypress (browser requires gesture). */
  private ensureBgPlaying(): void {
    if (this.bgStarted) return;
    this.bgStarted = true;
    this.bgMusic.play();
  }

  destroy(): void {
    this.bgMusic.dispose();
  }

  onKeyDown(world: GameWorld, key: string): void {
    const ssWorld = world as SongSelectWorld;
    const songCount = Object.keys(this.songModules).length;

    this.ensureBgPlaying();

    if (this.fadingOut) return; // ignore input during fade-out

    if (key === "ArrowUp") {
      ssWorld.currentCardHighlight =
        (ssWorld.currentCardHighlight - 1 + songCount) % songCount;
      this.updateScroll(ssWorld.currentCardHighlight, songCount);
    } else if (key === "ArrowDown") {
      ssWorld.currentCardHighlight =
        (ssWorld.currentCardHighlight + 1) % songCount;
      this.updateScroll(ssWorld.currentCardHighlight, songCount);
    } else if (key === "Enter") {
      this.fadingOut = true;
      const keys = Object.keys(this.songModules);
      const selectedSongId = keys[ssWorld.currentCardHighlight];

      // Fade out bg music, then trigger the scene transition
      this.bgMusic.fadeOut().then(() => {
        ssWorld.selectedSong = selectedSongId;
      });
    }
  }

  /** Keep the highlighted card visible by adjusting scroll offset */
  private updateScroll(highlight: number, _songCount: number): void {
    if (highlight < this.scrollOffset) {
      this.scrollOffset = highlight;
    } else if (highlight >= this.scrollOffset + MAX_VISIBLE_CARDS) {
      this.scrollOffset = highlight - MAX_VISIBLE_CARDS + 1;
    }
  }

  // --- Rendering ---

  render(world: SongSelectWorld, renderer: Renderer): void {
    // Full-screen dark background
    renderer.drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, COLORS.bg);

    this.renderHeader(renderer);
    this.renderColumnLabels(renderer);
    this.renderSongList(world, renderer);
  }

  private renderHeader(renderer: Renderer): void {
    // Main title
    renderer.drawText("MUSIC BOPPER", 30, 30, {
      fontSize: 48,
      color: COLORS.headerText,
      fontWeight: "bold",
      fontFamily: "Arial Black, Arial, sans-serif",
    });

    // Subtitle
    renderer.drawText("Jazz & Other Songs", 32, 88, {
      fontSize: 18,
      color: COLORS.subtitleText,
      fontStyle: "italic",
    });
  }

  private renderColumnLabels(renderer: Renderer): void {
    const y = HEADER_HEIGHT - 18;

    // "SELECT TRACK" on left
    renderer.drawText("SELECT TRACK", 30, y, {
      fontSize: 12,
      color: COLORS.columnLabel,
      letterSpacing: 3,
    });

    // Divider line
    renderer.drawLine(190, y + 8, CANVAS_WIDTH - 180, y + 8, COLORS.columnLine);

    // "BPM / DIFFICULTY" on right
    renderer.drawText("BPM / DIFFICULTY", CANVAS_WIDTH - 170, y, {
      fontSize: 12,
      color: COLORS.columnLabel,
      letterSpacing: 2,
    });
  }

  private renderSongList(world: SongSelectWorld, renderer: Renderer): void {
    const songEntries = Object.entries(this.songModules);
    const startY = HEADER_HEIGHT;

    for (let i = 0; i < songEntries.length; i++) {
      const visibleIdx = i - this.scrollOffset;
      if (visibleIdx < 0 || visibleIdx >= MAX_VISIBLE_CARDS) continue;

      const [songId, song] = songEntries[i];
      const y = startY + visibleIdx * (CARD_HEIGHT + CARD_GAP);
      const isSelected = i === world.currentCardHighlight;
      const meta = SONG_META[songId as SongId];

      this.renderSongCard(renderer, song, meta, y, isSelected);
    }
  }

  private renderSongCard(
    renderer: Renderer,
    song: MidiSongJson,
    meta: SongMeta,
    y: number,
    isSelected: boolean,
  ): void {
    const cardW = CANVAS_WIDTH;

    // Card background
    renderer.drawRect(
      0,
      y,
      cardW,
      CARD_HEIGHT,
      isSelected ? COLORS.cardBgSelected : COLORS.cardBg,
    );

    // Selected indicator — gold left edge
    if (isSelected) {
      renderer.drawRect(0, y, 4, CARD_HEIGHT, COLORS.cardBorder);
    }

    // Accent color block (left side)
    renderer.drawRect(
      8,
      y + 4,
      ACCENT_WIDTH - 16,
      CARD_HEIGHT - 8,
      meta.accentColor,
    );

    // Song title (bold, uppercase)
    renderer.drawText(song.name.toUpperCase(), TEXT_PAD_LEFT, y + 12, {
      fontSize: 22,
      color: COLORS.songTitle,
      fontWeight: "bold",
      fontFamily: "Arial Black, Arial, sans-serif",
    });

    // Artist (italic)
    renderer.drawText(meta.artist, TEXT_PAD_LEFT, y + 42, {
      fontSize: 14,
      color: COLORS.artistText,
      fontStyle: "italic",
    });

    // BPM
    renderer.drawText(`${song.bpm} BPM`, TEXT_PAD_LEFT, y + CARD_HEIGHT - 26, {
      fontSize: 12,
      color: COLORS.bpmText,
      letterSpacing: 2,
    });

    // Difficulty blocks + label (right side)
    this.renderDifficultyIndicator(
      renderer,
      meta.difficulty,
      meta.difficultyLabel,
      cardW - 80,
      y + CARD_HEIGHT - 32,
    );
  }

  private renderDifficultyIndicator(
    renderer: Renderer,
    level: DifficultyLevel,
    label: string,
    x: number,
    y: number,
  ): void {
    const blockSize = 8;
    const blockGap = 3;
    const totalBlocks = 5;

    // Draw 5 small blocks, filled up to `level`
    for (let i = 0; i < totalBlocks; i++) {
      const bx = x + i * (blockSize + blockGap);
      const color = i < level ? COLORS.diffBlockFilled : COLORS.diffBlockEmpty;
      renderer.drawRect(bx, y, blockSize, blockSize, color);
    }

    // Label below blocks
    renderer.drawText(label, x, y + blockSize + 4, {
      fontSize: 11,
      color: COLORS.diffText,
      letterSpacing: 2,
    });
  }
}

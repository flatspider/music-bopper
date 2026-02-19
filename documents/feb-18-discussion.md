## Notes on Managers

Managers directly manipulate the display!

The *Scene* is like a global store of state (score, song, player information). 

Each manager then writes to update the Scene. 

On each game loop, the Scene calls the shared functions in each Manager. Example, on `Scene.render()`, each manager's `.render()` is also called. 

Here are the managers we're thinking of implementing:

### Gameplay Manager:
- handle winning conditions
- Is the user's score too low? (did they fail the song?)
- Did the user correctly hit the key at the right time (when the note is in the hitbox)
- Update the score accordingly 

### LaneManager
Manages display of each 'lane'. Since we have 4 keys, we have four lanes.

LaneManager is responsible for drawing the notes, creating the 'hitbox', and the bottom component where the user should be clicking the button to hit the note 'correctly'.

- drawNote
- redraw notes (responsible for note traveling down)
- draw hitboxes
- display coloring if note successfully hit

### UI Manager

Responsible for tracking state of 'playingGame', 'MainMenu'. – This should track where the user actually is, and to display the correct display. 

```[typescript]
    if (world.state === "start") {
      renderer.drawText("Snake", cx, 200, { fontSize: 64, color: 0x44cc44, anchor: 0.5 });
      renderer.drawText("Press SPACE to start", cx, 320, {
        fontSize: 24,
        color: 0xaaaaaa,
        anchor: 0.5,
      });
      renderer.drawText("Arrow keys or WASD to move", cx, 360, {
        fontSize: 18,
        color: 0x666666,
        anchor: 0.5,
      });
      return;
    }
```

See Snake's `UIManager` for a good example.

## Notes and HitBoxing Logic

The Notes structure includes a timing component and a lane component.

The `LaneManager` and the `AudioManager` will both read from the Song, which will have the source of truth.

## TODOs:

Ask Claude how we can adjust the note timing to display the note a few seconds before it's supposed to be hit, so it can "fall" into place.

Ask Claude how to best compute the hitbox logic and scoring.
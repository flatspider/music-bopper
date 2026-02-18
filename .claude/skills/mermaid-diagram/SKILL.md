---
name: mermaid-diagram
description: Generate architecture diagrams, flowcharts, sequence diagrams, state diagrams, class diagrams, or ER diagrams using Mermaid. Trigger when the user asks for a diagram, image, map, drawing, picture, or visualization of a system, architecture, or codebase.
---

# Mermaid Diagram Skill

Generate beautiful SVG and ASCII diagrams from Mermaid code using the `beautiful-mermaid` library.

## Workflow

### Step 1: Understand the input

Prompt the user to choose an input mode:

1. **Verbal description** — the user describes the system from memory or understanding
2. **Image** — the user provides a photo or screenshot of a hand-drawn or existing diagram
3. **Codebase exploration** — the user points you at a project directory and you analyze the code

For **verbal or image input**, also help the user reason about what they're trying to understand:
- Is their mental model too high-level? Maybe they need the mechanical details drawn out.
- Are they mixing concerns? Architecture and sequence flow are often better as separate diagrams.
- Are they stuck on how parts connect? Drawing it can be the escape route.

Ask clarifying questions before generating. Be a thinking partner, not just a renderer.

### Step 1.5: Choose the detail level

Every system can be drawn at different depths. Before writing any Mermaid code, figure out what level the user needs. These levels can be combined in one diagram.

**Architecture level** — what are the parts, who's responsible for what.
- Nodes are components/modules with role descriptions ("Express Server", "React App")
- Edges show data flow direction ("POST /api/move", "fetches state")
- Good for: orientation, explaining a system to someone new, planning

**Mechanical level** — how execution actually flows at runtime.
- Nodes include specific functions/methods (`loadScene()`, `loop()`, `requestAnimationFrame()`)
- Edges reference actual function calls (`scene.onKeyDown()`, `scene.update()`)
- Shows initialization sequences (numbered: 1a, 1b, 1c...) separate from runtime loops
- Shows cycles: event loops, render cycles, polling intervals
- Good for: debugging, understanding *why* code executes in a certain order, bridging diagrams back to code

**Deciding which level:**
- If the user is new to a codebase or explaining to someone else → architecture
- If the user is debugging, confused about execution order, or studying how something works → mechanical
- If the user provides an image or reference diagram → match that diagram's level
- When in doubt, ask. Or start with architecture and offer to go deeper.

**Checklist for mechanical-level diagrams:**

Use these prompts to decide what to include. Not all will apply to every system.

- **Runtime environment:** Where does this code execute? Nest everything inside a `subgraph` for the environment (Browser, Node.js, Docker, Lambda, etc.). If client-server, show both environments.
- **External actors:** Who/what triggers the system from outside? (User, cron job, webhook, another service.) Place these outside all subgraphs.
- **Initialization vs runtime:** Does the system have a boot/setup phase that's different from steady-state? Show bootstrap steps with numbered labels (1a, 1b...) and runtime steps separately (2a, 2b...).
- **Cycles and loops:** Is there a recurring process? (Event loop, render cycle, polling, retry logic.) Show the cycle explicitly — edge from the last step back to the first.
- **Function names:** Should nodes and edges reference actual function/method names from the code? This bridges the diagram to the codebase. Use when the user needs to map diagram → code.
- **Data access patterns:** Do connections have different read/write semantics? Label edges with "Read", "Write", or "Read/Write" to show who mutates state vs. who observes it.
- **Temporal phases:** Can you number the flows? (1: bootstrap, 2: game loop, 3: user input.) Numbering makes execution order unambiguous.

### Step 2: Choose the diagram type

Pick the Mermaid diagram type that best fits what the user needs:
- `graph TD` or `graph LR` — architecture, system overview, data flow
- `sequenceDiagram` — request/response flows, function call chains, event ordering
- `stateDiagram-v2` — state machines, lifecycle transitions
- `classDiagram` — object relationships, type hierarchies
- `erDiagram` — database schemas, entity relationships

If the user's description mixes concerns, suggest splitting into multiple diagrams rather than cramming everything into one.

### Step 3: Write the Mermaid code

Follow these constraints (library limitations):
- **Single-line node labels only.** The library cannot render multi-line text inside nodes. Keep labels short and descriptive.
- **No semicolons.** Each statement must be on its own line. The graph header (`graph TD`, `sequenceDiagram`, etc.) must be on its own line.
- **One edge per line.** Write `A --> B` and `B --> C` on separate lines, not `A --> B --> C`.

### Step 4: Decide on labeling

Use judgment based on diagram complexity:
- **Simple diagrams (under 5 nodes):** Use descriptive labels directly, no legend needed.
- **Medium diagrams:** Use short labels with a legend. Ask the user if they prefer A/B/C, 1/2/3, or another scheme.
- **Complex diagrams:** Use hierarchical labels (A1, A2, B1, B2 or 1A, 1B, 2A, 2B) with a legend. Group related nodes under the same prefix.

Do not default to any single scheme. Match the labeling to the diagram's structure, or ask the user.

### Step 5: Render the diagram

Run the script:

```bash
bun scripts/mermaid-diagram.ts "<mermaid-code>" "<name>" "<legend>"
```

Arguments:
- **mermaid-code** (required): The Mermaid diagram string
- **name** (optional): A descriptive filename, defaults to timestamp. Use kebab-case (e.g., `ttt-architecture`, `auth-flow`).
- **legend** (optional): Legend text with `\n` separating lines. First line is bolded as the title in the SVG.

This produces three output files:
- `scripts/output/diagrams/<name>.svg` — rendered SVG
- `scripts/output/diagrams/<name>.txt` — ASCII art with legend
- `scripts/output/markdown/<name>.md` — Mermaid source with links to SVG and TXT

The script also appends a reference link to the current day's daily note at `daily-notes/YYYY-MM-DD.md`.

### Step 6: Show the results

After rendering, open all three files in VS Code so the user can review them side by side:

```bash
code scripts/output/markdown/<name>.md scripts/output/diagrams/<name>.svg scripts/output/diagrams/<name>.txt
```

Also print the ASCII diagram inline in the conversation so the user sees immediate output.

## Examples

### Simple flowchart (no legend needed)

```bash
bun scripts/mermaid-diagram.ts 'graph LR
A["Browser"] --> B["Server"]
B --> C["Database"]' "simple-stack"
```

### Architecture diagram with legend

```bash
bun scripts/mermaid-diagram.ts 'graph TD
  subgraph Server["A: Express Server"]
    A1["A1: GET /api/game"]
    A2["A2: POST /api/move"]
  end
  subgraph Client["B: React App"]
    B1["B1: App component"]
    B2["B2: handleCellClick"]
  end
  B2 -->|POST /api/move| A2
  B1 -->|GET /api/game| A1' "ttt-architecture" 'LEGEND\nA: Express Server — port 3000\nA1: Returns current game state\nA2: Validates and applies a move\nB: React frontend\nB1: Main component, fetches state on mount\nB2: Sends move to server on cell click'
```

### Mechanical-level diagram (runtime environment, function names, init + loop)

```bash
bun scripts/mermaid-diagram.ts 'graph LR
  U["User"]
  subgraph Browser["Browser"]
    IH["index.html"]
    MT["main.ts bootstrap"]
    subgraph Game["Game"]
      IN["Input"]
      LS["loadScene"]
      RAF["requestAnimationFrame"]
      LP["loop"]
      subgraph SceneArea["Scene"]
        SC["Scene: init + delegate"]
        WO["World: state object"]
        IM["InputManager"]
        GM["GameplayManager"]
        RM["RenderManager"]
        UM["UIManager"]
      end
    end
    RN["Renderer"]
    subgraph PixiApp["Application: pixi.js"]
      HCE["HTML Canvas Element"]
      ST["stage"]
      CO["Container"]
    end
  end
  U -->|"1: Visits website"| IH
  IH --> MT
  MT -->|"1a: Create pixi.js app"| HCE
  MT -->|"1c: create Game"| IN
  MT -->|"1d: create Scene"| SC
  MT -->|"1e: load scene into game"| LS
  U -->|"3: Press keys"| IN
  IN -->|"onKeyDown/onKeyUp"| SC
  LS -->|"2a: init, enqueue loop"| RAF
  RAF -->|"2b: call loop"| LP
  LP -->|"2c: scene.update"| SC
  LP -->|"2d: scene.render"| SC
  LP -->|"2e: enqueue loop"| RAF
  SC --> IM
  SC --> GM
  SC --> RM
  SC --> UM
  IM -->|"Read/Write"| WO
  GM -->|"Read/Write"| WO
  WO -->|"Read"| RM
  WO -->|"Read"| UM
  RM -->|"draws to"| RN
  UM -->|"draws to"| RN
  RN -->|"draws to"| CO
  ST --> CO' "snake-architecture-detailed" 'SNAKE GAME — DETAILED ARCHITECTURE\nBOOTSTRAP: 1 visit site, 1a create Pixi app, 1c create Game, 1d create Scene, 1e load scene\nGAME LOOP: 2a init + enqueue, 2b rAF calls loop, 2c scene.update, 2d scene.render, 2e re-enqueue\nINPUT: 3 keys hit Input, forwarded via scene.onKeyDown/onKeyUp\nScene: init creates World + Managers, delegates all lifecycle methods\nWorld: shared state — segments, direction, food, score, game phase\nInputManager: buffers direction, commits per tick (Read/Write)\nGameplayManager: moves snake, collision, food scoring (Read/Write)\nRenderManager: draws game world (Read)\nUIManager: draws text overlays (Read)\nRenderer: wraps Pixi.js, grid-to-pixel, draws to stage Container'
```

Key patterns in this example:
- **Nested subgraphs** for runtime environment: `Browser > Game > Scene`
- **External actor** (`User`) placed outside all subgraphs
- **Numbered temporal phases**: 1x = bootstrap, 2x = game loop, 3 = user input
- **Function names on edges**: `scene.update`, `onKeyDown/onKeyUp`
- **Cycle**: `RAF --> LP --> RAF` shows the game loop
- **Data access labels**: `Read/Write` vs `Read` on manager-to-world edges

# Music Bopper

- Single-player desktop web game
- Curated starter songs
- Falling-note gameplay across 4 lanes
- Scoring, combo streaks, and end-of-song summary
- Story progression with harder songs

## Visual Vibe

- Jazz-club energy
- Blues, blacks, warm highlights, and neon accents
- Reactive environment: stronger performance makes the world feel more alive

## Run On Your Machine (Bun)

### Prerequisites

- Bun installed ([https://bun.sh](https://bun.sh))

### Install dependencies

```bash
bun install
```

### Start development server

```bash
bun run dev
```

Then open the local URL shown in terminal (usually `http://localhost:5173`).

### Build for production
      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
=======
```bash
bun run build
```

### Preview production build

```bash
bun run preview
```

### Run lint checks

```bash
bun run lint
```

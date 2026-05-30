# AGENTS.md

This file provides guidance to AI agents and coding assistants working in this repository.

## Project

`obsidian-chessboard` is an [Obsidian](https://obsidian.md) plugin that renders chess positions as interactive SVG boards inside Markdown preview. Authors write a FEN string or PGN game inside a fenced code block; the plugin converts it to an inline SVG with optional annotations (highlights, arrows, move-quality icons) and, for PGN games, interactive ply-by-ply navigation.

## Commands

```bash
npm install          # install dependencies
npm run build        # production build -> main.js
npm run dev          # watch mode (incremental builds)
npm test             # run Vitest test suite
npm run test:watch   # watch mode for tests
npm run test:coverage # coverage report
npx eslint src/      # lint TypeScript sources
```

Manual testing of Obsidian integration requires loading `main.js` as a local plugin.

## Working rules

### Output style

Tokens are expensive. Be brief and to the point. Omit preamble, pleasantries, and summaries of what you just did. One sentence per update. Code speaks louder than prose.

### TDD/BDD workflow

Follow strict red-green-refactor:

1. Write one failing test that describes the behavior (red).
2. Write the minimum code to make it pass (green).
3. Refactor only while green.

No work may be declared complete unless:

- Passing tests exist for the new behavior.
- `npm test` passes with zero failures (full regression).
- Any regressions introduced are fixed before declaring done.

Tests must use public interfaces only. No testing implementation details or private methods.

Every `it` block must open with a BDD-style comment documenting the scenario it exercises:

```typescript
it('does something', () => {
  // Scenario: <one-line description of the requirement or feature being verified>
  // Given: <preconditions / initial state>
  // When: <the action or event under test>
  // Then: <the expected outcome>
})
```

For trivial assertions where Given/When/Then would duplicate the test name, a single `// Scenario:` line suffices.

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) with semver semantics:

- `feat:` — new feature (triggers minor bump)
- `fix:` — bug fix (triggers patch bump)
- `feat!:` / `fix!:` / `BREAKING CHANGE:` — breaking change (triggers major bump)
- `chore:`, `refactor:`, `test:`, `docs:` — no release

Do **not** add `Co-Authored-By:` lines to commits, PRs, or anywhere else.

When creating PRs, always use the template in `.github/pull_request_template.md` — fill every section, remove optional sections that don't apply.

### Changelog

After adding any new feature, update `CHANGELOG.md` with a brief entry under the `[Unreleased]` section describing the change. Follow the existing format in that file.

### Markdown authoring

Double trailing spaces (`  `) produce a hard linebreak in Markdown. When writing markdown that uses frontmatter-style blocks or bullet lists where each line must stay on its own line (i.e. must not reflow into the previous line), terminate each line with two spaces. Never rely on a blank line between items when a hard linebreak within a block is intended. `.editorconfig` preserves trailing whitespace in `.md` files for this reason.

After writing or editing any Markdown file, lint it with `markdownlint-cli` if available:

```bash
npx markdownlint-cli <file>.md
```

If `markdownlint-cli` is not installed and cannot be run via `npx`, note this to the user and ask them to install it (`npm install -g markdownlint-cli`) so Markdown quality can be maintained.

## Architecture

Obsidian plugin that renders chess positions as inline SVGs inside Markdown preview. The bundled output is a single `main.js` (CJS, via Rollup) that Obsidian loads directly.

### Entry point: `src/main.ts`

`ObsidianChess` (extends `Plugin`) registers two Markdown code block processors:

- **`chessboard`** — FEN-based static boards. Parsing delegated to `parseCodeBlock()` in `Annotations.ts`; rendering via `SVGChessboard.fromFEN()`.
- **`chessboard-pgn`** — PGN-based boards. Options (`ply`, `show-move`, `interactive`, `move-list`, `orientation`) are parsed inline from the source lines before the PGN content. Routes to either `SVGChessboard.fromPGN()` (static) or `createInteractivePGNBoard()` (interactive).

Settings (board colors, max width) are stored via Obsidian's `loadData/saveData` and exposed through a `PluginSettingTab`.

### Core SVG layer: `src/chessboardsvg/`

- **`Chessboard.ts`** — Thin façade over `chess.js`. Handles FEN loading (with optional strict-mode bypass for non-standard positions) and PGN loading with ply replay. Tracks `lastMovePlayed` for move highlighting.
- **`index.ts` (`SVGChessboard`)** — Main rendering class. Constructs the full SVG from board squares, coordinate labels, pieces, and annotations (highlights, arrows, icons, shapes). All SVG nodes are created via `activeDocument.createElementNS` (Obsidian's DOM API). Piece SVGs are recolored at construction time via `Pieces.ts`.
- **`InteractivePGN.ts`** — Stateful interactive board. `PGNGameState` manages ply navigation efficiently (forward via `chess.move()`, backward via `chess.undo()`). `createInteractivePGNBoard()` builds the DOM container with nav buttons, optional move-list panel, and keyboard arrow-key handlers.
- **`Arrow.ts`**, **`Shapes.ts`**, **`Icons.ts`** — Pure SVG helpers for annotation rendering. Icons are SVG files imported as strings via `rollup-plugin-svg-import`.

### Annotation parsing: `src/Annotations.ts`

`parseCodeBlock()` splits the FEN code block into the FEN string plus `annotations:` lines. Each annotation token is parsed by prefix: `A` (arrow), `H` (highlight), `C`/`S`/`Q` (shapes), `!!`/`!?`/`!`/`??`/`?`/`F` (move-quality icons). Color modifiers `/r`, `/g`, `/b`, `/y` are suffix-matched.

### Key constraints

- The fixed SVG viewBox is `0 0 320 320` (8×8 grid of 40px squares). Board max-width is controlled via CSS custom property `--chess-board-max-width`.
- `activeDocument` (not `document`) must be used for all DOM creation — this is Obsidian's multi-window API.
- PGN annotations are not yet supported (static PGN path has a TODO stub in `main.ts`).

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`THeK3nger/obsidian-chessboard`). See `docs/agents/issue-tracker.md`.


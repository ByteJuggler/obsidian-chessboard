# obsidian-chessboard — Domain Glossary

## Board modes

**FEN mode** — a `chessboard` fenced code block. Renders a single static board from a FEN string, with optional annotations.

**PGN mode** — a `chessboard-pgn` fenced code block. Renders a board from a PGN game. Supports two rendering sub-modes:

- **Static PGN board** — a single frozen SVG at a specified ply (or the last ply if unspecified).
- **Interactive PGN board** — a navigable board with prev/next controls and optional move-list panel, driven by `PGNGameState`.

## Annotations

**Annotation** — a visual overlay drawn on top of the board. Four annotation types exist:

- **Highlight** — colours a single square (prefix `H`, e.g. `Hc5/g`).
- **Arrow** — draws an arrow between two squares (prefix `A`, e.g. `Ac7-c5/r`).
- **Icon** — places a move-quality icon on a square (prefixes `!`, `!!`, `!?`, `?`, `??`, `F`, e.g. `!c5`).
- **Shape** — draws a circle (`C`), square (`S`), or squircle (`Q`) outline on a square.

**Annotation line** — the `annotations: <tokens>` option line in a code block. One or more annotation lines may appear; all are accumulated.

**Target ply** — the single ply at which annotations are rendered. Equals the `ply:` option value when specified; otherwise the last ply of the game. In interactive mode, annotations are visible only when the current ply matches the target ply.

## Options (PGN mode)

**`ply:`** — sets both the starting ply for navigation (interactive mode) and the target ply for annotations. When absent, navigation starts at ply 0 and annotations target the last ply.

**`show-move:`** — controls automatic last-move highlighting: `none` (default), `squares`, or `arrow`. Distinct from user-authored annotations; overlap between the two is not checked.

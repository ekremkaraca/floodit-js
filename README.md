# FloodIt JS

`floodit-js` now includes both classic FloodIt and maze mode, based on the same Bun + vanilla JavaScript architecture.

## Gameplay Modes

- `Classic`: original FloodIt objective, fill the whole board with one color.
- `Maze`: flood through carved corridors and reach the goal tile (`G`) at bottom-right.

### Presets

- Classic: `Easy`, `Normal`, `Hard`
- Maze: `Maze Easy`, `Maze Normal`, `Maze Hard`
- `Custom`: choose board size and move limit (supports Classic and Maze)

## Features

- Start marker (`S`) on the top-left tile
- Goal marker (`G`) in maze mode
- In-game legend with mode-specific target hint
- Dedicated Help & Rules screen
- Confirmed actions (reset/new/quit)
- Dark mode with persisted preference
- Welcome header quick actions (Help, Dark Mode, Source) as icon buttons
- Keyboard shortcuts: `Alt+Shift+R`, `Alt+Shift+N`, `Alt+Shift+Q`
- Responsive board/keyboard fitting tuned for mobile, desktop, and short-height screens
- Recent maze modes surfaced in New Game menu
- Incremental StyleX adoption for selected UI layout styles

## Setup

```bash
bun install
```

## Commands

```bash
bun run dev
bun run build
bun run preview
bun run lint
bun run test
```

## Project Structure

- `server.ts`: Bun server entry
- `src/engine/game.js`: core flood logic + maze generation/win checks
- `src/engine/gameFlow.js`: pure move/round-start flow decisions
- `src/actions/gameActions.js`: game action orchestration
- `src/styles/stylex*.js`: StyleX style modules for selected views
- `src/state/*`: store + persistence
- `src/views/*`: stateless UI renderers
- `tests/*`: engine/actions/state tests
- `docs/CODEBASE.md`: architecture and lifecycle details
- `docs/PLAN.md`: implementation roadmap

## Quality Gates

- `bun run test`
- `bun run lint`
- `bun run build`

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

Based on the original [Flood It](https://github.com/tfuxu/floodit) GTK desktop application by tfuxu.

Game algorithm inspired by [Open Flood](https://github.com/GunshipPenguin/open_flood) and [The FloodIt! game](https://otfried.org/scala/floodit.html) by Otfried Cheong.

Thanks [Windsurf IDE](https://windsurf.com), [OpenAI Codex](https://openai.com/codex/) and their AI assistants for helping with the implementation.

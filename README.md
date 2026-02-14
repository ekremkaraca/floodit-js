# FloodIt JS

`floodit-js` now includes both classic FloodIt and maze mode, based on the same Bun + vanilla JavaScript architecture.

## Gameplay Modes

- `Classic`: original FloodIt objective, fill the whole board with one color.
- `Maze`: flood through carved corridors and reach the goal tile (`G`) at bottom-right.

### Presets

- Classic: `Easy`, `Normal`, `Hard`
- Maze: `Maze Easy`, `Maze Normal`, `Maze Hard`
- `Custom`: choose board size and move limit (supports Classic and Maze)

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
- `src/actions/gameActions.js`: game action orchestration
- `src/state/*`: store + persistence
- `src/views/*`: stateless UI renderers
- `tests/*`: engine/actions/state tests
- `docs/CODEBASE.md`: architecture and lifecycle details
- `docs/PLAN.md`: implementation roadmap

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

Based on the original [Flood It](https://github.com/tfuxu/floodit) GTK desktop application by tfuxu.

Game algorithm inspired by [Open Flood](https://github.com/GunshipPenguin/open_flood) and [The FloodIt! game](https://otfried.org/scala/floodit.html) by Otfried Cheong.

Thanks [Windsurf IDE](https://windsurf.com), [OpenAI Codex](https://openai.com/codex/) and their AI assistants for helping with the implementation.

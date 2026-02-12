# FloodIt JS

## Overview
`floodit-js` is a Bun + vanilla JavaScript implementation of FloodIt, designed to keep strong parity with the [React implementation](https://github.com/ekremkaraca/floodit-react)  while staying lightweight.

## Features

- 🎮 **Classic Gameplay**: Flood the entire board with one color in limited moves
- 🎯 **Multiple Difficulties**: Easy (6×6), Normal (10×10), Hard (14×14)
- ⚙️ **Custom Game Mode**: Create your own board size and move limits
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- ⚡ **Instant Play**: No installation required, runs in any modern browser

## How to Play

1. **Start from the top-left corner** (already highlighted)
2. **Select colors** from the color keyboard at the bottom
3. **Flood connected areas** with your chosen color
4. **Fill the entire board** with one color before running out of moves
5. **Complete in minimum moves** for the best efficiency score

### Controls

- **Color Selection**: Click/tap color buttons in the keyboard at the bottom
- **New Game**: Click "New Game" dropdown and select difficulty
- **Reset**: Click "Reset" to restart the current board
- **Dark Mode**: Toggle with the moon/sun icon
- **Keyboard Shortcuts**: `Alt+Shift+R` (reset), `Alt+Shift+N` (new round), `Alt+Shift+Q` (quit)

## Game Modes

### Standard Difficulties
- **Easy**: 6×6 board, 15 moves
- **Normal**: 10×10 board, 20 moves  
- **Hard**: 14×14 board, 25 moves

### Custom Mode
- **Board Size**: 5×5 to 25×25
- **Move Limit**: Custom or auto-calculated
- **Perfect for**: Creating your own challenge level

## Tech Stack
- Bun (`Bun.serve`) for runtime/server
- Vanilla JavaScript (ES modules) for frontend
- Custom CSS (`src/styles/app.css`)

## Project Structure
- `src/engine/game.js`: core game logic (board init, flood, win/loss)
- `src/state/store.js`: pub/sub state store
- `src/actions/gameActions.js`: action/state transition layer
- `src/views/*`: UI rendering modules
- `src/main.js`: app bootstrap + keyboard shortcuts
- `server.ts`: Bun server entry
- `docs/CODEBASE.md`: architecture, data flow, and maintenance guide
- `docs/PLAN.md`: roadmap and implementation status

## Architecture At A Glance
The app uses a straightforward loop:
1. Views trigger action callbacks.
2. Actions compute next state (using engine helpers) and update the store.
3. Store subscribers remount the app from current state.

See `docs/CODEBASE.md` for full lifecycle details and module responsibilities.

## Setup
```bash
bun install
```

## Commands
```bash
# Development
bun run dev

# Production build
bun run build

# Preview production
bun run preview

```

## Current Status
- Core gameplay and major UX flows are implemented.
- Build is passing via `bun run build`.
- No automated tests are committed yet.

### Latest Updates
- Improved Custom difficulty labeling (removed misleading `0×0` UI text).
- Simplified confirm dialog close flow to avoid redundant close calls.
- Removed Tailwind dependency and build tooling in favor of project-owned CSS.
- Migrated view styling to semantic classes and rebuilt `src/styles/app.css`.
- Added mobile/narrow-screen UI polish for header actions and modal touch ergonomics.
- Fixed Custom Mode range slider behavior for board sizes above `10`.
- Kept documentation aligned in `docs/PLAN.md`.

## Roadmap (Short)
1. Add automated tests for engine/actions.
2. Improve accessibility for dialogs and menus.
3. Add localStorage game-state persistence.
4. Reduce full-app remounting with targeted updates.

For the full plan and progress log, see `docs/PLAN.md`.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

Based on the original [Flood It](https://github.com/tfuxu/floodit) GTK desktop application by tfuxu.

Game algorithm inspired by [Open Flood](https://github.com/GunshipPenguin/open_flood) and [The FloodIt! game](https://otfried.org/scala/floodit.html) by Otfried Cheong.

Thanks [Windsurf IDE](https://windsurf.com), [OpenAI Codex](https://openai.com/codex/) and their AI assistants for helping with the implementation.

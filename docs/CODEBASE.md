# FloodIt JS Codebase Guide

This document explains how the project is organized, how data flows through the app, and where to make common changes safely.

## High-Level Architecture

The app follows a simple unidirectional flow:

1. User interacts with UI elements rendered from `src/views/*`.
2. View callbacks call action functions from `src/actions/gameActions.js`.
3. Actions compute next state (often using `src/engine/game.js`) and update the store (`src/state/store.js`).
4. Store subscribers trigger a full remount in `src/main.js`.
5. `renderApp` in `src/views/appView.js` re-renders from current state.

There is no framework runtime. Rendering is plain DOM creation using a helper function (`h`) in `src/views/dom.js`.

## Entry Points

- `server.ts`: Bun HTTP entrypoint, serves `src/index.html` with HMR in development.
- `src/index.html`: bootstraps theme preference early to avoid dark-mode flash and loads `src/main.js`.
- `src/main.js`: initializes state, wires actions, subscribes to store updates, mounts app, and registers global keyboard shortcuts.

## Core Modules

- `src/engine/game.js`
  - Pure game rules and board operations.
  - Defines color set (`DEFAULT_COLORS`) and preset difficulties (`DIFFICULTIES`).
  - Exposes board creation, flood fill, step counting, win checks.

- `src/state/store.js`
  - Tiny pub/sub store with `getState`, `setState`, `update`, and `subscribe`.
  - No middleware, no async queue, no selector system.

- `src/actions/gameActions.js`
  - Orchestrates state transitions for all user intents.
  - Bridges the pure engine with UI state (modals, dark mode, current selection).
  - Returns game progression metadata from `makeMove`.

- `src/views/*`
  - Stateless render functions that build DOM nodes from `{ state, actions }` or explicit props.
  - `appView.js` composes all feature views.
  - `modals.js`, `welcome.js`, `customGameMode.js`, `gameHeader.js`, `gameBoard.js`, `colorKeyboard.js` implement specific UI sections.

## State Shape

`src/main.js` defines initial state:

- `board`: active board or `null`.
- `selectedColor`: last user-selected color name.
- `showCustomMode`: whether custom game setup screen is active.
- `showGameOverModal`: whether game-over modal is visible.
- `showConfirmDialog`: whether confirm dialog is visible.
- `pendingAction`: callback executed after confirmation.
- `confirmDialogContent`: `{ title, message }`.
- `lastGameConfig`: last game setup metadata (`difficulty` or `custom`) used to start a new round.
- `isDarkMode`: current theme flag.
- `customSettings`: `{ boardSize, customMoveLimit, moveLimit }`.

## Game Lifecycle

### Start Flow

1. User chooses a difficulty or custom settings.
2. Action creates board (`initializeBoard` or `initializeCustomBoard`).
3. Store receives board and resets transient UI flags.
4. App re-renders into gameplay view.

### Move Flow

1. User selects a color.
2. `actions.makeMove(color)` validates move and steps left.
3. `flood(board, color)` returns updated board with incremented `step`.
4. Action stores new board and returns one of:
   - `{ success: true, gameState: "playing" }`
   - `{ success: true, gameState: "won" }`
   - `{ success: true, gameState: "lost" }`
   - `{ success: false, gameState: null | "lost" }` for invalid/no-op/blocked input.
5. View opens game-over modal on `won`/`lost`.

### Confirmed Actions

Reset/new/quit flows use the shared confirm dialog:

1. `openConfirmDialog({ title, message, pendingAction })`.
2. If user confirms: `confirmPendingAction` executes callback then clears dialog state.
3. If user cancels: `closeConfirmDialog` clears callback without side effects.

## Rendering Strategy

Current rendering strategy intentionally remounts the full app on each state change:

- `store.subscribe(() => mount())` in `src/main.js`.
- `mount` clears `#app` and appends a fresh tree from `renderApp`.

Tradeoff:
- Simpler mental model and fewer partial-update bugs.
- More DOM churn than targeted updates.

This tradeoff is acceptable at current app size and is already tracked as a potential optimization in `docs/PLAN.md`.

## Styling Pipeline

- Source Tailwind file: `src/styles/tailwind.css`.
- Build script: `scripts/tailwind-build.ts`.
  - Scans `src/**/*.{html,js}` for class-like tokens.
  - Compiles Tailwind and writes `src/styles/app.css`.
  - In watch mode, ignores `app.css` writes to prevent rebuild loops.
- `src/main.js` imports `src/styles/app.css`.

## Keyboard Shortcuts

Global shortcuts in `src/main.js` (gameplay only):

- `Alt+Shift+R`: reset current game (with confirm dialog).
- `Alt+Shift+N`: start new game with current settings (with confirm dialog).
- `Alt+Shift+Q`: quit to welcome screen (with confirm dialog).

Shortcuts are ignored when:

- No active board.
- Custom mode or confirm dialog is open.
- Focus is in input/textarea/select/contentEditable.
- Ctrl/Meta is also pressed.

## Known Maintenance Notes

- There are no committed automated tests yet; `bun test` currently finds no test files.

## Recommended First Files for New Contributors

1. `src/main.js`
2. `src/views/appView.js`
3. `src/actions/gameActions.js`
4. `src/engine/game.js`
5. `src/state/store.js`

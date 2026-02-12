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
  - Defines color set (`DEFAULT_COLORS`), seed sentinel (`AUTO_GENERATE_SEED`), and preset difficulties (`DIFFICULTIES`).
  - Exposes board creation, flood fill, step counting, win checks.
  - Uses shared JSDoc type contracts from `src/types/game.js`.

- `src/state/store.js`
  - Tiny pub/sub store with `getState`, `setState`, `update`, and `subscribe`.
  - Includes no-op guards: `setState`/`update` do not emit if the next state reference is unchanged.
  - No middleware, no async queue, no selector system.

- `src/actions/gameActions.js`
  - Orchestrates state transitions for all user intents.
  - Bridges the pure engine with UI state (modals, dark mode, current selection).
  - Returns game progression metadata from `makeMove`.
  - Includes `setCustomSettings` for immutable custom-mode updates via store.

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

### Reset Behavior

- `resetGame` keeps board dimensions and move limit, but intentionally generates a fresh random board.
- This is implemented by passing `AUTO_GENERATE_SEED` into `initializeBoard`.
- If deterministic replay is needed, pass an explicit numeric seed to `startNewGame`/`startCustomGame`.

## Rendering Strategy

Current rendering strategy uses a hybrid approach:

- App tree is still fully remounted from state in `src/main.js`.
- Remount is requestAnimationFrame-batched (`scheduleMount`) to avoid repeated remounts in the same frame.
- `mount` clears `#app` and appends a fresh tree from `renderApp`.

Layout-sensitive components self-adjust after mount:

- `src/views/gameBoard.js`
  - Uses `ResizeObserver` + RAF layout scheduling.
  - Applies a concrete initial pixel size before first paint.
  - Caches the last computed size per board dimensions to prevent visual "relaunch/grow" on move remounts.
- `src/views/colorKeyboard.js`
  - Uses `ResizeObserver` + RAF layout scheduling.
  - Applies a concrete initial layout (gap/maxWidth/key size) before first paint to avoid one-frame disappearing.

Practical outcome:
- Move clicks still remount the app, but board/keyboard sizing no longer visibly jitters during that remount.

## Styling Pipeline

- Styling is maintained directly in `src/styles/app.css`.
- There is no external CSS preprocessor step in dev/build scripts.
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

## Type Contracts (JS)

- Shared domain contracts are documented in `src/types/game.js` via JSDoc typedefs.
- Core logic modules import these typedefs in JSDoc (`import('../types/game.js')`) for editor/type-hint support while staying plain JavaScript.

## Quality Gates

- Lint: `bun run lint`
- Build: `bun run build`
- Tests: no committed test suite yet (`bun test` currently finds no test files).

## Recommended First Files for New Contributors

1. `src/main.js`
2. `src/views/appView.js`
3. `src/actions/gameActions.js`
4. `src/engine/game.js`
5. `src/state/store.js`

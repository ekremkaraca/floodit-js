# FloodIt JS Codebase Guide

This document explains how the project is organized, how data flows through the app, and where to make common changes safely.

## High-Level Architecture

The app follows a simple unidirectional flow:

1. User interacts with UI elements rendered from `src/views/*`.
2. View callbacks call action functions from `src/actions/gameActions.js`.
3. Actions compute next state (often using `src/engine/game.js`) and update the store (`src/state/store.js`).
   - Flow-only rules are centralized in `src/engine/gameFlow.js`.
4. Store subscribers schedule render and persistence work in `src/main.js`.
5. Renderer applies targeted slot patches for gameplay updates when possible, with full remount fallback for structural transitions.

There is no framework runtime. Rendering is plain DOM creation using a helper function (`h`) in `src/views/dom.js`.

## Entry Points

- `server.ts`: Bun HTTP entrypoint, serves `src/index.html` with HMR in development.
- `src/index.html`: bootstraps theme preference early to avoid dark-mode flash and loads `src/main.js`.
- `src/main.js`: initializes state, wires actions, subscribes to store updates, mounts app, and registers global keyboard shortcuts.
- `src/state/persistence.js`: versioned localStorage load/save + sanitization.

## Core Modules

- `src/engine/game.js`
  - Pure game rules and board operations.
  - Defines color set (`DEFAULT_COLORS`), seed sentinel (`AUTO_GENERATE_SEED`), and preset difficulties (`DIFFICULTIES`).
  - Exposes classic board creation, maze board creation, flood fill, step counting, and unified win checks.
  - Uses shared JSDoc type contracts from `src/types/game.js`.

- `src/engine/gameFlow.js`
  - Pure action-independent game flow helpers.
  - Resolves move outcomes (`playing`/`won`/`lost`/no-op) and next-round start targets.
  - Keeps branching logic out of action orchestration and enables focused unit testing.

- `src/state/store.js`
  - Tiny pub/sub store with `getState`, `setState`, `update`, and `subscribe`.
  - Includes no-op guards: `setState`/`update` do not emit if the next state reference is unchanged.
  - No middleware, no async queue, no selector system.

- `src/actions/gameActions.js`
  - Orchestrates state transitions for all user intents.
  - Bridges pure engine modules with UI state (modals, dark mode, help page, current selection).
  - Returns game progression metadata from `makeMove`.
  - Includes `setCustomSettings` for immutable custom-mode updates via store.

- `src/views/*`
  - Stateless render functions that build DOM nodes from `{ state, actions }` or explicit props.
  - `appView.js` composes all feature views.
  - `modals.js`, `welcome.js`, `helpRules.js`, `customGameMode.js`, `gameHeader.js`, `gameBoard.js`, `colorKeyboard.js` implement specific UI sections.

## State Shape

`src/main.js` defines initial state:

- `board`: active board or `null`.
- `selectedColor`: last user-selected color name.
- `showHelpPage`: whether Help & Rules screen is active.
- `showCustomMode`: whether custom game setup screen is active.
- `showGameOverModal`: whether game-over modal is visible.
- `showConfirmDialog`: whether confirm dialog is visible.
- `pendingAction`: callback executed after confirmation.
- `confirmDialogContent`: `{ title, message }`.
- `lastGameConfig`: last game setup metadata (`difficulty` or `custom`) used to start a new round.
- `isDarkMode`: current theme flag.
- `customSettings`: `{ gameMode, boardSize, customMoveLimit, moveLimit }`.

### Board Model Notes

`board` supports both classic and maze modes:

- Shared fields: `name`, `seed`, `rows`, `columns`, `step`, `maxSteps`, `matrix`
- Optional mode field: `mode` (`classic` or `maze`)
- Maze-only fields:
  - `walls`: `boolean[][]` where `true` blocks flood expansion
  - `goal`: `{ row, column }` target position (currently bottom-right)

## Game Lifecycle

### Start Flow

1. User chooses a difficulty or custom settings.
2. Action creates board:
   - classic presets/custom use `initializeBoard`/`initializeCustomBoard`
   - maze presets use `initializeMazeBoard`
3. Store receives board and resets transient UI flags.
4. App re-renders into gameplay view.

### Move Flow

1. User selects a color.
2. `actions.makeMove(color)` delegates to `resolveMove(board, color)` in `src/engine/gameFlow.js`.
3. `flood(board, color)` returns updated board with incremented `step`.
   - In maze mode, flood expansion cannot cross `walls`.
4. Action stores new board and returns one of:
   - `{ success: true, gameState: "playing" }`
   - `{ success: true, gameState: "won" }`
   - `{ success: true, gameState: "lost" }`
   - `{ success: false, gameState: null | "lost" }` for invalid/no-op/blocked input.
5. Win is evaluated by `isBoardWon(board)`:
   - classic: `isAllFilled(board)`
   - maze: `isGoalReached(board)`
6. View opens game-over modal on `won`/`lost`.

### Confirmed Actions

Reset/new/quit flows use the shared confirm dialog:

1. `openConfirmDialog({ title, message, pendingAction })`.
2. If user confirms: `confirmPendingAction` executes callback then clears dialog state.
3. If user cancels: `closeConfirmDialog` clears callback without side effects.

### Reset Behavior

- `resetGame` keeps board dimensions and move limit, but intentionally generates a fresh random board.
- This is implemented by passing `AUTO_GENERATE_SEED` into `initializeBoard`.
- If deterministic replay is needed, pass an explicit numeric seed to `startNewGame`/`startCustomGame`.

### Help Screen Flow

1. Help can be opened from welcome or in-game header.
   - Welcome header action row exposes Help, Dark Mode toggle, and Source link as icon buttons.
2. `showHelpPage` switches root rendering to `renderHelpRules(...)`.
3. Back action closes help and restores previous context (welcome or game).

## Rendering Strategy

Current rendering strategy uses a hybrid approach:

- Render work is requestAnimationFrame-batched (`scheduleRender`) in `src/main.js`.
- For gameplay-only updates, the renderer patches specific slots (`game-header`, `game-board`, `color-keyboard`) instead of remounting the entire app.
- Board patching includes an in-place fast path that updates existing `.board-cell` backgrounds only when cell colors change.
  - Wall cells are skipped during color patching because they are structural tiles.
- Full remount is retained as a safe fallback for structural UI transitions (welcome/custom mode/dialog/game-over visibility changes).

Layout-sensitive components self-adjust after mount:

- `src/views/gameBoard.js`
  - Uses `ResizeObserver` + RAF layout scheduling.
  - Applies a concrete initial pixel size before first paint.
  - Caches the last computed size per board dimensions to prevent visual "relaunch/grow" on move remounts.
  - Includes mode-aware board legend and start/goal markers (`S`/`G`).
  - Uses tighter viewport heuristics for tiny mobile and short desktop heights.
- `src/views/colorKeyboard.js`
  - Uses `ResizeObserver` + RAF layout scheduling.
  - Applies a concrete initial layout (gap/maxWidth/key size) before first paint to avoid one-frame disappearing.
  - Scales spacing and key sizes for tiny mobile and ultra-fit desktop viewports.

Practical outcome:
- Move interactions avoid full app remounts in the normal gameplay path.
- Board updates reduce DOM churn by mutating existing cell styles where possible.
- Layout-sensitive components keep their `ResizeObserver`-based stabilization behavior.

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
- Help page is open.
- Focus is in input/textarea/select/contentEditable.
- Ctrl/Meta is also pressed.

## Type Contracts (JS)

- Shared domain contracts are documented in `src/types/game.js` via JSDoc typedefs.
- Core logic modules import these typedefs in JSDoc (`import('../types/game.js')`) for editor/type-hint support while staying plain JavaScript.
- Maze fields are also documented there (`mode`, `walls`, `goal`).

## Quality Gates

- Lint: `bun run lint`
- Build: `bun run build`
- Tests: `bun test` (suite lives under `tests/`).

Current snapshot:
- `bun test`: 39 passing tests across engine/actions/state modules

## Recommended First Files for New Contributors

1. `src/main.js`
2. `src/views/appView.js`
3. `src/actions/gameActions.js`
4. `src/engine/game.js`
5. `src/engine/gameFlow.js`

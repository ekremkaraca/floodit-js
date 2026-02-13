# FloodIt JS — Project Plan & Status

## Overview
- **Project**: `floodit-js`
- **Goal**: Maintain a lightweight Bun + vanilla JS version of FloodIt with strong parity to the React reference app.
- **Current state**: App builds and runs successfully; core gameplay and major UX flows are implemented.
- **Documentation**: Architecture/data-flow notes are maintained in `docs/CODEBASE.md`.

## Tech Stack
- **Runtime/Server**: Bun (`Bun.serve`) 
- **Frontend**: Vanilla JavaScript (ES modules) + DOM helper rendering
- **Styling**: Custom CSS (`src/styles/app.css`)
- **Build/Serve commands**:
  - `bun run dev`
  - `bun run lint`
  - `bun run build`
  - `bun run preview`

## Architecture Summary
- `src/engine/game.js`: game rules, board setup, flood fill, win/loss checks.
- `src/state/store.js`: minimal pub/sub state container.
- `src/actions/gameActions.js`: user/game actions and state transitions.
- `src/views/*`: UI rendering modules.
- `src/main.js`: app bootstrap, subscriptions, keyboard shortcuts.
- `server.ts`: Bun server entrypoint.

## Completed So Far

### Core migration and feature parity
- Ported core gameplay logic (seeded board init, flood fill, move tracking, win/loss).
- Implemented app state/store and action layer for game lifecycle flows.
- Implemented full view layer (welcome, board, keyboard, header, custom mode, dialogs).
- Added keyboard shortcuts in gameplay context: `Alt+Shift+R`, `Alt+Shift+N`, `Alt+Shift+Q`.
- Added dark mode initialization, toggle, and persisted preference handling.

### Build and styling stability
- Configured Bun-first scripts for dev/build/preview in `package.json`.
- Added oxlint quality gate (`bun run lint`).
- Removed Tailwind build tooling and dependency in favor of static custom CSS.
- Replaced utility-style class usage with semantic component classes across `src/views/*`.
- Rebuilt `src/styles/app.css` as project-owned design tokens + component styles.
- Fixed board rendering regression by restoring CSS grid behavior for the board container.
- Added responsive UI polish for mobile, including compact header controls and thumb-friendly modal actions.
- Added extra narrow-screen (`<=380px`) overflow safeguards for header action row wrapping.
- Confirmed production build output works under `dist/`.

### UX/documentation improvements completed in latest pass
- Updated Custom difficulty labels to avoid misleading `0×0` text:
  - in welcome difficulty buttons
  - in in-game New Game menu
- Fixed confirm-dialog flow to avoid redundant close calls (single close path).
- Fixed Custom Mode slider interaction issue by switching range updates to change-driven rerendering.
- Verified current build after fixes.

### Architecture and runtime stability improvements
- Added shared JS type contracts in `src/types/game.js` and integrated JSDoc imports in core modules.
- Standardized seed handling with `AUTO_GENERATE_SEED` constant.
- Updated reset behavior to generate a fresh board with same dimensions/move limit (new seed).
- Added safe external link handling with `noopener,noreferrer`.
- Reworked custom settings updates to immutable store updates (`setCustomSettings`) instead of direct object mutation.
- Added no-op guards in store/actions to skip unnecessary emits and remounts.
- Switched app remount trigger to RAF batching.
- Moved board and color keyboard sizing to component-local `ResizeObserver` + RAF scheduling.
- Fixed board relaunch/grow and keyboard one-frame disappear by applying stable initial layout before first paint.
- Added board size caching by dimension profile to reduce remount jitter further.

## Verification Snapshot
- **Lint**: `bun run lint` ✅
- **Build**: `bun run build` ✅
- **Tests**: `bun test` currently reports no test files found (test suite not added yet).

## Known Gaps / Remaining Work
- Add automated tests (engine + action flows).
- Run manual UI QA for overlays, transitions, and keyboard interactions.
- Improve accessibility for dialogs and menu controls (semantics + keyboard/focus behavior).
- Reduce full-app remounting during move flow by patching only board/keyboard region (next rendering optimization step).
- Expand README with architecture and testing sections.
- Evaluate optional mobile UX enhancement for tap-on-board color selection (currently deferred due to accidental-tap and precision risks).

## Prioritized Roadmap

### 1) Add automated tests (highest priority)
- Add `bun test` coverage for:
  - `initializeBoard`, `flood`, `isAllFilled`, `getStepsLeft`, `calculateMaxSteps`
  - critical action flows (start/reset/quit/confirm, win/loss path)

### 2) Accessibility pass
- Add dialog semantics (`role`, `aria-modal`), Escape close behavior, and focus handling.
- Improve keyboard interaction for menu/dialog controls.

### 3) Persistence
- Persist in-progress game/UI state to `localStorage` with a schema version.

### 4) Rendering optimization
- Preserve current stabilized layout system and remove full-app remounts on move where practical.

### 5) Nice-to-have enhancements
- Seeded challenge sharing via URL params.
- Player stats/progression.
- Keyboard color selection (`1-6`).

## Suggested Next Implementation Order
1. Tests
2. Accessibility
3. Persistence
4. Rendering optimization
5. Enhancements (seed sharing, stats, color hotkeys)

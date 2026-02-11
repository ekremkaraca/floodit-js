# FloodIt JS — Project Plan & Status

## Overview
- **Project**: `floodit-js`
- **Goal**: Maintain a lightweight Bun + vanilla JS version of FloodIt with strong parity to the React reference app.
- **Current state**: App builds and runs successfully; core gameplay and major UX flows are implemented.
- **Documentation**: Architecture/data-flow notes are maintained in `docs/CODEBASE.md`.

## Tech Stack
- **Runtime/Server**: Bun (`Bun.serve`) 
- **Frontend**: Vanilla JavaScript (ES modules) + DOM helper rendering
- **Styling**: Tailwind CSS v4 (custom build script)
- **Build/Serve commands**:
  - `bun run dev`
  - `bun run build`
  - `bun run preview`

## Architecture Summary
- `src/engine/game.js`: game rules, board setup, flood fill, win/loss checks.
- `src/state/store.js`: minimal pub/sub state container.
- `src/actions/gameActions.js`: user/game actions and state transitions.
- `src/views/*`: UI rendering modules.
- `src/main.js`: app bootstrap, subscriptions, keyboard shortcuts.
- `scripts/tailwind-build.ts`: Tailwind candidate extraction + CSS generation.
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
- Fixed Tailwind candidate extraction so essential classes are generated.
- Fixed watch-mode CSS rebuild loop in `scripts/tailwind-build.ts`.
- Confirmed production build output works under `dist/`.

### UX/documentation improvements completed in latest pass
- Updated Custom difficulty labels to avoid misleading `0×0` text:
  - in welcome difficulty buttons
  - in in-game New Game menu
- Fixed confirm-dialog flow to avoid redundant close calls (single close path).
- Verified current build after fixes.

## Verification Snapshot
- **Build**: `bun run build` ✅
- **Tests**: `bun test` currently reports no test files found (test suite not added yet).

## Known Gaps / Remaining Work
- Add automated tests (engine + action flows).
- Run manual UI QA for overlays, transitions, and keyboard interactions.
- Improve accessibility for dialogs and menu controls (semantics + keyboard/focus behavior).
- Reduce full-app remounting on every state update (targeted rendering improvements).
- Expand README with architecture and testing sections.

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
- Move from full remount strategy toward targeted updates where practical.

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

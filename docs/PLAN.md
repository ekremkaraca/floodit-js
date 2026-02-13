# FloodIt JS — Project Plan & Status

## Overview
- **Project**: `floodit-js`
- **Goal**: Maintain a lightweight Bun + vanilla JS version of FloodIt with strong parity to the React reference app.
- **Current state**: Core gameplay is stable, tested, and optimized with targeted rendering updates.
- **Documentation**: Architecture/data-flow details are maintained in `docs/CODEBASE.md`.

## Tech Stack
- **Runtime/Server**: Bun (`Bun.serve`)
- **Frontend**: Vanilla JavaScript (ES modules) + DOM helper rendering
- **Styling**: Custom CSS (`src/styles/app.css`)
- **Quality tooling**:
  - Lint: `bun run lint` (oxlint)
  - Test: `bun test`
  - Build: `bun run build`

## Completed

### Core gameplay and UX
- Ported core gameplay logic (seeded board init, flood fill, move tracking, win/loss).
- Implemented state/store/action architecture for game lifecycle flows.
- Implemented full view layer (welcome, board, keyboard, header, custom mode, dialogs).
- Added keyboard shortcuts: `Alt+Shift+R`, `Alt+Shift+N`, `Alt+Shift+Q`.
- Added dark mode initialization, toggle, and persisted preference handling.

### Tooling and quality gates
- Standardized Bun-first scripts for dev/build/preview.
- Migrated linting from ESLint to oxlint (`bun run lint`).
- Added automated tests under `tests/`:
  - `tests/engine/game.test.js`
  - `tests/actions/gameActions.test.js`
  - `tests/state/persistence.test.js`

### Architecture and performance
- Added shared JSDoc type contracts in `src/types/game.js`.
- Standardized seed handling with `AUTO_GENERATE_SEED`.
- Added immutable custom settings updates and no-op state update guards.
- Added RAF-batched render + persistence scheduling in `src/main.js`.
- Replaced full-remount-only rendering with hybrid targeted patching for gameplay slots.
- Added in-place board-cell patch path to reduce board subtree rebuild cost.

### Accessibility and persistence
- Added confirm/game-over dialog accessibility improvements:
  - dialog semantics (`role="dialog"`, `aria-modal`)
  - Escape-close behavior
  - focus trap and focus restore
- Added versioned localStorage persistence in `src/state/persistence.js` with sanitization.

### Styling and motion
- Rebuilt styling with project-owned semantic CSS.
- Added board color-change transitions aligned with React behavior.
- Added board-cell motion tokens for centralized transition tuning.
- Added `prefers-reduced-motion` override for board-cell animations.

## Verification Snapshot
- **Lint**: `bun run lint` ✅
- **Test**: `bun test` ✅
- **Build**: `bun run build` ✅

## Open Work
- Complete keyboard/menu accessibility pass for header controls.
- Reduce color-keyboard subtree churn with key-level in-place patching.
- Add player stats/progression (local best, win/loss, streak).
- Add seeded challenge sharing via URL params.
- Add optional numeric color hotkeys (`1-6`).

## Prioritized Next Steps
1. Header/menu accessibility hardening (ARIA + keyboard navigation)
2. Keyboard rendering micro-optimization (in-place key patching)
3. Stats/progression persistence and UI
4. Seeded challenge/share links
5. Numeric color shortcuts

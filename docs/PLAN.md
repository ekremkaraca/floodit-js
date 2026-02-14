# FloodIt Maze JS Plan

## Goal
Build a maze-oriented FloodIt variant while keeping the existing engine/actions/state/views architecture stable and well-documented.

## Current Status (2026-02-14)

### Completed
- Baseline architecture ported from `floodit-js`:
  - `src/engine/game.js`, `src/actions/gameActions.js`, `src/state/*`, `src/views/*`, `src/main.js`, `src/index.html`, `server.ts`
- Core maze gameplay implemented:
  - board mode support (`classic` / `maze`)
  - maze board data (`walls`, `goal`)
  - flood behavior respects walls
  - unified win logic (`isBoardWon`) with maze goal detection
  - carved maze generation with guaranteed path to goal
- Mode presets updated:
  - Classic: `Easy`, `Normal`, `Hard`
  - Maze: `Maze Easy`, `Maze Normal`, `Maze Hard`
  - Custom flow supports both classic and maze (`customSettings.gameMode`)
- Welcome screen improvements:
  - tabbed view (`Classic` / `Maze`)
  - mode-specific “How to Play” text
  - compact layout and stable sizing between tabs
  - custom button available in both tabs (`Custom`, `Custom Maze`)
- Game header "New" dropdown improvements:
  - `Recent Maze Modes` section
  - full `All Modes` list always shown
  - compact visual style for long lists
- Persistence updates:
  - sanitize/persist maze fields (`mode`, `walls`, `goal`)
  - sanitize/persist custom mode selection (`customSettings.gameMode`)
  - sanitize/persist `recentMazeModes`
- UX/runtime updates:
  - refresh now always opens welcome screen (no auto-resume board)
  - HMR accept hook added in `src/main.js`
- Icon system updates:
  - Lucide integrated with reusable renderer (`src/views/icons.js`)
  - header, modal, and welcome icons migrated to Lucide SVGs
- Documentation/test coverage extended across engine/actions/state.

### Verification Snapshot
- `bun run test`: passing (`27/27`)
- `bun run build`: passing
- `bun run lint`: passing

## Next Work
1. Maze balancing pass (move limits vs generated complexity).
2. Add maze progress telemetry (for example goal-distance estimate).
3. Seed-based challenge sharing via URL params.
4. Add numeric color shortcuts (`1-6`) and optional maze overlay toggle.
5. Expand docs with a short “How maze generation works” developer section.

## Notes
- Keep architecture boundaries unchanged: engine purity + action orchestration + stateless views.
- Maintain quality gates before every merge:
  - `bun run test`
  - `bun run build`
  - `bun run lint`

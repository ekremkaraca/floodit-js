# FloodIt Maze JS Plan

## Goal
Build a maze-oriented FloodIt variant while keeping the existing engine/actions/state/views architecture stable and well-documented.

## Current Status (2026-02-15)

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
  - welcome header quick actions use icon buttons (Help, Dark Mode, Source)
- Game header "New" dropdown improvements:
  - `Recent Maze Modes` section
  - full `All Modes` list always shown
  - compact visual style for long lists
- Board UX improvements:
  - start marker (`S`) rendered on top-left tile
  - in-game legend with marker hints and mode-aware objective text
  - goal marker (`G`) retained for maze mode
- Help/learnability improvements:
  - dedicated `Help & Rules` screen (`src/views/helpRules.js`)
  - help entry points from welcome and in-game header
- Styling architecture updates:
  - removed Pico.css experiment and restored custom stylesheet pipeline
  - started incremental StyleX adoption for targeted layout styles
  - current StyleX coverage: welcome header actions + help screen layout wrappers
- Responsive behavior improvements:
  - tighter board sizing for tiny mobile and short desktop heights
  - keyboard key-size/gap scaling tuned for constrained viewports
- Game flow architecture improvements:
  - pure flow module added (`src/engine/gameFlow.js`)
  - actions now delegate move resolution and next-round target selection to pure helpers
  - dedicated flow test coverage added (`tests/engine/gameFlow.test.js`)
- New-game menu behavior improvements:
  - new-game menu closes on outside click/touch
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
- `bun run test`: passing (`39/39`)
- `bun run build`: passing
- `bun run lint`: last known passing (re-run before merge)

## Next Work
1. Maze balancing pass (move limits vs generated complexity).
2. Add maze progress telemetry (for example goal-distance estimate).
3. Seed-based challenge sharing via URL params.
4. Add numeric color shortcuts (`1-6`) and optional maze overlay toggle.
5. Add e2e smoke checks for view transitions (welcome/help/custom/game/modal).
6. Expand docs with a short “How maze generation works” developer section.

## Notes
- Keep architecture boundaries unchanged: engine purity + action orchestration + stateless views.
- Maintain quality gates before every merge:
  - `bun run test`
  - `bun run build`
  - `bun run lint`

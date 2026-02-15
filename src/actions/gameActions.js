import {
  DEFAULT_COLORS,
  AUTO_GENERATE_SEED,
  initializeBoard,
  initializeMazeBoard,
  initializeCustomBoard,
} from '../engine/game.js';
import { resolveMove, resolveRoundStartTarget } from '../engine/gameFlow.js';
/** @typedef {import('../types/game.js').Difficulty} Difficulty */
/** @typedef {import('../types/game.js').CustomGameSettings} CustomGameSettings */

function difficultyKey(difficulty) {
  return [
    difficulty.name,
    difficulty.rows,
    difficulty.columns,
    difficulty.maxSteps ?? 0,
    difficulty.mode ?? 'classic',
  ].join('|');
}

/**
 * Track a small list of recently started maze modes for quick access in menus.
 * @param {import('../types/game.js').Difficulty[]} previous
 * @param {import('../types/game.js').Difficulty} mazeDifficulty
 * @returns {import('../types/game.js').Difficulty[]}
 */
function pushRecentMazeMode(previous, mazeDifficulty) {
  const next = [mazeDifficulty];
  const seen = new Set([difficultyKey(mazeDifficulty)]);

  for (const item of previous ?? []) {
    if (item.mode !== 'maze') continue;
    const key = difficultyKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(item);
    if (next.length >= 3) break;
  }

  return next;
}

/**
 * Action factory that encapsulates all state transitions.
 * Each method is intentionally small and maps closely to one user intent.
 */
export function createActions(store) {
  /**
   * @param {CustomGameSettings} nextSettings
   */
  function setCustomSettings(nextSettings) {
    store.update((s) => {
      if (
        s.customSettings.gameMode === nextSettings.gameMode &&
        s.customSettings.boardSize === nextSettings.boardSize &&
        s.customSettings.customMoveLimit === nextSettings.customMoveLimit &&
        s.customSettings.moveLimit === nextSettings.moveLimit
      ) {
        return s;
      }

      return {
        ...s,
        customSettings: {
          ...nextSettings,
        },
      };
    });
  }

  function setSelectedColor(colorName) {
    store.update((s) => (
      s.selectedColor === colorName
        ? s
        : { ...s, selectedColor: colorName }
    ));
  }

  /**
   * @param {Difficulty} difficulty
   * @param {number} [seed]
   */
  function startNewGame(difficulty, seed = AUTO_GENERATE_SEED) {
    const newBoard = difficulty.mode === 'maze'
      ? initializeMazeBoard(
          difficulty.name,
          difficulty.rows,
          difficulty.columns,
          seed,
          difficulty.maxSteps || 0,
        )
      : initializeBoard(
          difficulty.name,
          difficulty.rows,
          difficulty.columns,
          seed,
          difficulty.maxSteps || 0,
        );

    store.update((s) => ({
      ...s,
      board: newBoard,
      selectedColor: '',
      showCustomMode: false,
      showGameOverModal: false,
      lastGameConfig: { type: 'difficulty', difficulty },
      recentMazeModes: difficulty.mode === 'maze'
        ? pushRecentMazeMode(s.recentMazeModes, difficulty)
        : s.recentMazeModes,
    }));
  }

  /**
   * @param {CustomGameSettings} settings
   * @param {number} [seed]
   */
  function startCustomGame(settings, seed = AUTO_GENERATE_SEED) {
    const gameMode = settings.gameMode === 'maze' ? 'maze' : 'classic';
    const normalizedSettings = {
      ...settings,
      gameMode,
    };
    const newBoard = gameMode === 'maze'
      ? initializeMazeBoard(
          'Custom Maze',
          settings.boardSize,
          settings.boardSize,
          seed,
          settings.moveLimit,
        )
      : initializeCustomBoard(normalizedSettings, seed);

    store.update((s) => ({
      ...s,
      board: newBoard,
      selectedColor: '',
      showCustomMode: false,
      showGameOverModal: false,
      lastGameConfig: { type: 'custom', settings: normalizedSettings },
      recentMazeModes: gameMode === 'maze'
        ? pushRecentMazeMode(s.recentMazeModes, {
            name: 'Custom Maze',
            rows: normalizedSettings.boardSize,
            columns: normalizedSettings.boardSize,
            maxSteps: normalizedSettings.moveLimit,
            mode: 'maze',
          })
        : s.recentMazeModes,
    }));
  }

  function resetGame() {
    const { board } = store.getState();
    if (!board) return;

    const newBoard = board.mode === 'maze'
      ? initializeMazeBoard(
          board.name,
          board.rows,
          board.columns,
          AUTO_GENERATE_SEED,
          board.maxSteps,
        )
      : initializeBoard(
          board.name,
          board.rows,
          board.columns,
          AUTO_GENERATE_SEED,
          board.maxSteps,
        );

    store.update((s) => ({
      ...s,
      board: newBoard,
      selectedColor: '',
      showGameOverModal: false,
    }));
  }

  function quitGame() {
    store.update((s) => ({
      ...s,
      board: null,
      showHelpPage: false,
      selectedColor: '',
      showCustomMode: false,
      showGameOverModal: false,
      showConfirmDialog: false,
      pendingAction: null,
    }));
  }

  /**
   * @param {string} colorName
   * @returns {{ success: boolean, gameState: 'playing' | 'won' | 'lost' | null }}
   */
  function makeMove(colorName) {
    const { board } = store.getState();
    const { nextBoard, result } = resolveMove(board, colorName);

    if (nextBoard !== board) {
      store.update((s) => ({
        ...s,
        board: nextBoard,
      }));
    }

    return result;
  }

  function openCustomMode() {
    store.update((s) => ({ ...s, showCustomMode: true }));
  }

  function closeCustomMode() {
    store.update((s) => ({ ...s, showCustomMode: false }));
  }

  function openHelpPage() {
    store.update((s) => ({ ...s, showHelpPage: true }));
  }

  function closeHelpPage() {
    store.update((s) => ({ ...s, showHelpPage: false }));
  }

  function openGameOverModal() {
    store.update((s) => ({ ...s, showGameOverModal: true }));
  }

  function closeGameOverModal() {
    store.update((s) => ({ ...s, showGameOverModal: false }));
  }

  function openConfirmDialog({ title, message, pendingAction }) {
    store.update((s) => ({
      ...s,
      showConfirmDialog: true,
      confirmDialogContent: { title, message },
      pendingAction,
    }));
  }

  function closeConfirmDialog() {
    store.update((s) => ({
      ...s,
      showConfirmDialog: false,
      pendingAction: null,
    }));
  }

  /**
   * Execute the action queued by `openConfirmDialog`, then always clear dialog state.
   * This ensures a single close path for dialog lifecycle.
   */
  function confirmPendingAction() {
    const { pendingAction } = store.getState();
    if (typeof pendingAction === 'function') {
      pendingAction();
    }

    closeConfirmDialog();
  }

  /**
   * Start a fresh game using the most recent configuration.
   * Fallbacks to current board shape if last configuration metadata is unavailable.
   */
  function startNewRoundWithCurrentSettings() {
    const { lastGameConfig, board } = store.getState();
    const target = resolveRoundStartTarget(lastGameConfig, board);

    if (!target) {
      return;
    }

    if (target.type === 'difficulty') {
      startNewGame(target.difficulty);
      return;
    }

    startCustomGame(target.settings);
  }

  /**
   * Toggle dark mode class on <html> and persist preference in localStorage.
   */
  function toggleDarkMode() {
    const saved = localStorage.getItem('darkMode');
    const current = saved !== null ? saved === 'true' : document.documentElement.classList.contains('dark');
    const next = !current;

    localStorage.setItem('darkMode', next.toString());

    if (next) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }

    store.update((s) => ({ ...s, isDarkMode: next }));
  }

  return {
    DEFAULT_COLORS,
    setCustomSettings,
    setSelectedColor,
    startNewGame,
    startCustomGame,
    resetGame,
    quitGame,
    makeMove,
    openCustomMode,
    closeCustomMode,
    openHelpPage,
    closeHelpPage,
    openGameOverModal,
    closeGameOverModal,
    openConfirmDialog,
    closeConfirmDialog,
    confirmPendingAction,
    startNewRoundWithCurrentSettings,
    toggleDarkMode,
  };
}

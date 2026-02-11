import {
  DEFAULT_COLORS,
  initializeBoard,
  initializeCustomBoard,
  flood,
  getStepsLeft,
  isAllFilled,
} from '../engine/game.js';

/**
 * Action factory that encapsulates all state transitions.
 * Each method is intentionally small and maps closely to one user intent.
 */
export function createActions(store) {
  function setSelectedColor(colorName) {
    store.update((s) => ({ ...s, selectedColor: colorName }));
  }

  function startNewGame(difficulty, seed = 0) {
    const newBoard = initializeBoard(
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
    }));
  }

  function startCustomGame(settings, seed = 0) {
    const newBoard = initializeCustomBoard(settings, seed);

    store.update((s) => ({
      ...s,
      board: newBoard,
      selectedColor: '',
      showCustomMode: false,
      showGameOverModal: false,
      lastGameConfig: { type: 'custom', settings },
    }));
  }

  function resetGame() {
    const { board } = store.getState();
    if (!board) return;

    const newBoard = initializeBoard(
      board.name,
      board.rows,
      board.columns,
      board.seed,
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
      selectedColor: '',
      showCustomMode: false,
      showGameOverModal: false,
      showConfirmDialog: false,
      pendingAction: null,
    }));
  }

  function makeMove(colorName) {
    const { board } = store.getState();
    if (!board || getStepsLeft(board) < 1) {
      return { success: false, gameState: 'lost' };
    }

    if (board.matrix[0][0] === colorName) {
      return { success: false, gameState: null };
    }

    const newBoard = flood(board, colorName);

    store.update((s) => ({
      ...s,
      board: newBoard,
    }));

    if (isAllFilled(newBoard)) {
      return { success: true, gameState: 'won' };
    }

    if (getStepsLeft(newBoard) < 1) {
      return { success: true, gameState: 'lost' };
    }

    return { success: true, gameState: 'playing' };
  }

  function openCustomMode() {
    store.update((s) => ({ ...s, showCustomMode: true }));
  }

  function closeCustomMode() {
    store.update((s) => ({ ...s, showCustomMode: false }));
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

    if (lastGameConfig?.type === 'difficulty') {
      startNewGame(lastGameConfig.difficulty);
      return;
    }

    if (lastGameConfig?.type === 'custom') {
      startCustomGame(lastGameConfig.settings);
      return;
    }

    if (board) {
      startNewGame({
        name: board.name,
        rows: board.rows,
        columns: board.columns,
        maxSteps: board.maxSteps,
      });
    }
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
    setSelectedColor,
    startNewGame,
    startCustomGame,
    resetGame,
    quitGame,
    makeMove,
    openCustomMode,
    closeCustomMode,
    openGameOverModal,
    closeGameOverModal,
    openConfirmDialog,
    closeConfirmDialog,
    confirmPendingAction,
    startNewRoundWithCurrentSettings,
    toggleDarkMode,
  };
}

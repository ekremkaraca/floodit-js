import { describe, expect, test } from 'bun:test';
import { createStore } from '../../src/state/store.js';
import { createActions } from '../../src/actions/gameActions.js';

function createInitialState() {
  return {
    board: null,
    selectedColor: '',
    showHelpPage: false,
    showCustomMode: false,
    showGameOverModal: false,
    showConfirmDialog: false,
    pendingAction: null,
    confirmDialogContent: {
      title: 'Confirm Action',
      message: 'Are you sure?',
    },
    lastGameConfig: null,
    isDarkMode: false,
    customSettings: {
      gameMode: 'classic',
      boardSize: 10,
      customMoveLimit: false,
      moveLimit: 20,
    },
    recentMazeModes: [],
  };
}

function createStoreAndActions() {
  const store = createStore(createInitialState());
  const actions = createActions(store);
  return { store, actions };
}

describe('actions/gameActions', () => {
  test('startNewGame initializes board and stores last difficulty config', () => {
    const { store, actions } = createStoreAndActions();

    actions.startNewGame({ name: 'Easy', rows: 6, columns: 6, maxSteps: 15 }, 42);

    const state = store.getState();
    expect(state.board).not.toBeNull();
    expect(state.board?.seed).toBe(42);
    expect(state.board?.rows).toBe(6);
    expect(state.selectedColor).toBe('');
    expect(state.showCustomMode).toBe(false);
    expect(state.lastGameConfig?.type).toBe('difficulty');
  });

  test('startCustomGame initializes custom board and stores settings config', () => {
    const { store, actions } = createStoreAndActions();

    actions.startCustomGame({
      gameMode: 'classic',
      boardSize: 7,
      customMoveLimit: true,
      moveLimit: 31,
    }, 99);

    const state = store.getState();
    expect(state.board?.name).toBe('Custom');
    expect(state.board?.rows).toBe(7);
    expect(state.board?.columns).toBe(7);
    expect(state.board?.maxSteps).toBe(31);
    expect(state.lastGameConfig).toEqual({
      type: 'custom',
      settings: {
        gameMode: 'classic',
        boardSize: 7,
        customMoveLimit: true,
        moveLimit: 31,
      },
    });
  });

  test('makeMove reports won when board becomes fully filled', () => {
    const { store, actions } = createStoreAndActions();

    store.update((s) => ({
      ...s,
      board: {
        name: 'T',
        seed: 1,
        rows: 2,
        columns: 2,
        step: 0,
        maxSteps: 5,
        matrix: [
          ['blue', 'blue'],
          ['blue', 'red'],
        ],
      },
    }));

    const result = actions.makeMove('red');
    const board = store.getState().board;

    expect(result).toEqual({ success: true, gameState: 'won' });
    expect(board?.step).toBe(1);
  });

  test('makeMove reports lost when steps run out after a valid move', () => {
    const { store, actions } = createStoreAndActions();

    store.update((s) => ({
      ...s,
      board: {
        name: 'T',
        seed: 1,
        rows: 2,
        columns: 2,
        step: 0,
        maxSteps: 1,
        matrix: [
          ['blue', 'red'],
          ['green', 'yellow'],
        ],
      },
    }));

    const result = actions.makeMove('red');

    expect(result).toEqual({ success: true, gameState: 'lost' });
  });

  test('makeMove reports won for maze board when goal is reached', () => {
    const { store, actions } = createStoreAndActions();

    store.update((s) => ({
      ...s,
      board: {
        name: 'Maze',
        mode: 'maze',
        seed: 1,
        rows: 2,
        columns: 2,
        step: 0,
        maxSteps: 5,
        matrix: [
          ['blue', 'red'],
          ['green', 'red'],
        ],
        walls: [
          [false, false],
          [true, false],
        ],
        goal: { row: 1, column: 1 },
      },
    }));

    const result = actions.makeMove('red');
    expect(result).toEqual({ success: true, gameState: 'won' });
    expect(store.getState().board?.step).toBe(1);
  });

  test('makeMove rejects same-color selection', () => {
    const { store, actions } = createStoreAndActions();

    store.update((s) => ({
      ...s,
      board: {
        name: 'T',
        seed: 1,
        rows: 2,
        columns: 2,
        step: 0,
        maxSteps: 5,
        matrix: [
          ['blue', 'red'],
          ['green', 'yellow'],
        ],
      },
    }));

    const result = actions.makeMove('blue');

    expect(result).toEqual({ success: false, gameState: null });
    expect(store.getState().board?.step).toBe(0);
  });

  test('confirmPendingAction executes pending callback and closes dialog', () => {
    const { store, actions } = createStoreAndActions();
    let didRun = false;

    actions.openConfirmDialog({
      title: 'Confirm',
      message: 'Run action?',
      pendingAction: () => {
        didRun = true;
      },
    });

    expect(store.getState().showConfirmDialog).toBe(true);

    actions.confirmPendingAction();

    const state = store.getState();
    expect(didRun).toBe(true);
    expect(state.showConfirmDialog).toBe(false);
    expect(state.pendingAction).toBeNull();
  });

  test('resetGame keeps dimensions/maxSteps but clears progress', () => {
    const { store, actions } = createStoreAndActions();

    actions.startNewGame({ name: 'Normal', rows: 10, columns: 10, maxSteps: 20 }, 123);
    actions.makeMove('red');

    const beforeReset = store.getState().board;
    actions.resetGame();
    const afterReset = store.getState().board;

    expect(beforeReset).not.toBeNull();
    expect(afterReset).not.toBeNull();
    expect(afterReset?.rows).toBe(beforeReset?.rows);
    expect(afterReset?.columns).toBe(beforeReset?.columns);
    expect(afterReset?.maxSteps).toBe(beforeReset?.maxSteps);
    expect(afterReset?.step).toBe(0);
  });

  test('startNewRoundWithCurrentSettings uses stored custom config', () => {
    const { store, actions } = createStoreAndActions();

    actions.startCustomGame({
      gameMode: 'maze',
      boardSize: 9,
      customMoveLimit: true,
      moveLimit: 40,
    }, 321);
    actions.startNewRoundWithCurrentSettings();

    const board = store.getState().board;
    expect(board?.name).toBe('Custom Maze');
    expect(board?.mode).toBe('maze');
    expect(board?.rows).toBe(9);
    expect(board?.maxSteps).toBe(40);
  });

  test('quitGame clears active game state', () => {
    const { store, actions } = createStoreAndActions();

    actions.startNewGame({ name: 'Easy', rows: 6, columns: 6, maxSteps: 15 }, 111);
    actions.openConfirmDialog({
      title: 'Quit?',
      message: 'Sure?',
      pendingAction: () => {},
    });

    actions.quitGame();

    const state = store.getState();
    expect(state.board).toBeNull();
    expect(state.showConfirmDialog).toBe(false);
    expect(state.pendingAction).toBeNull();
  });

  test('openHelpPage and closeHelpPage toggle help screen state', () => {
    const { store, actions } = createStoreAndActions();

    actions.openHelpPage();
    expect(store.getState().showHelpPage).toBe(true);

    actions.closeHelpPage();
    expect(store.getState().showHelpPage).toBe(false);
  });

  test('startNewGame tracks recent maze modes for new-game menu', () => {
    const { store, actions } = createStoreAndActions();

    actions.startNewGame({ name: 'Maze Easy', mode: 'maze', rows: 10, columns: 10, maxSteps: 22 }, 1);
    actions.startNewGame({ name: 'Maze Normal', mode: 'maze', rows: 12, columns: 12, maxSteps: 24 }, 2);
    actions.startNewGame({ name: 'Maze Easy', mode: 'maze', rows: 10, columns: 10, maxSteps: 22 }, 3);

    const recent = store.getState().recentMazeModes;
    expect(recent).toHaveLength(2);
    expect(recent[0]?.name).toBe('Maze Easy');
    expect(recent[1]?.name).toBe('Maze Normal');
  });
});

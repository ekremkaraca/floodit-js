import { describe, expect, test } from 'bun:test';
import { resolveMove, resolveRoundStartTarget } from '../../src/engine/gameFlow.js';

function createBoard(overrides = {}) {
  return {
    name: 'Test',
    seed: 1,
    rows: 2,
    columns: 2,
    step: 0,
    maxSteps: 5,
    matrix: [
      ['blue', 'red'],
      ['green', 'yellow'],
    ],
    ...overrides,
  };
}

describe('engine/gameFlow resolveMove', () => {
  test('returns lost when board is null', () => {
    const resolution = resolveMove(null, 'red');
    expect(resolution.nextBoard).toBeNull();
    expect(resolution.result).toEqual({ success: false, gameState: 'lost' });
  });

  test('returns lost when no steps are left', () => {
    const board = createBoard({ step: 5, maxSteps: 5 });
    const resolution = resolveMove(board, 'red');
    expect(resolution.nextBoard).toBe(board);
    expect(resolution.result).toEqual({ success: false, gameState: 'lost' });
  });

  test('rejects same-color selection as no-op', () => {
    const board = createBoard();
    const resolution = resolveMove(board, 'blue');
    expect(resolution.nextBoard).toBe(board);
    expect(resolution.result).toEqual({ success: false, gameState: null });
  });

  test('returns won when flood fills the board', () => {
    const board = createBoard({
      matrix: [
        ['blue', 'blue'],
        ['blue', 'red'],
      ],
    });

    const resolution = resolveMove(board, 'red');
    expect(resolution.nextBoard).not.toBe(board);
    expect(resolution.result).toEqual({ success: true, gameState: 'won' });
    expect(resolution.nextBoard?.step).toBe(1);
  });

  test('returns lost when steps run out after a valid move', () => {
    const board = createBoard({ step: 0, maxSteps: 1 });
    const resolution = resolveMove(board, 'red');
    expect(resolution.result).toEqual({ success: true, gameState: 'lost' });
    expect(resolution.nextBoard?.step).toBe(1);
  });

  test('returns playing while game is still active', () => {
    const board = createBoard({ maxSteps: 4 });
    const resolution = resolveMove(board, 'red');
    expect(resolution.result).toEqual({ success: true, gameState: 'playing' });
    expect(resolution.nextBoard?.step).toBe(1);
  });
});

describe('engine/gameFlow resolveRoundStartTarget', () => {
  test('prefers last difficulty config when present', () => {
    const difficulty = { name: 'Easy', rows: 6, columns: 6, maxSteps: 15 };
    const target = resolveRoundStartTarget({ type: 'difficulty', difficulty }, null);
    expect(target).toEqual({ type: 'difficulty', difficulty });
  });

  test('prefers last custom config when present', () => {
    const settings = {
      gameMode: 'classic',
      boardSize: 12,
      customMoveLimit: true,
      moveLimit: 28,
    };
    const target = resolveRoundStartTarget({ type: 'custom', settings }, null);
    expect(target).toEqual({ type: 'custom', settings });
  });

  test('falls back to current board settings when no last config exists', () => {
    const board = createBoard({
      name: 'Normal',
      rows: 10,
      columns: 10,
      maxSteps: 20,
    });
    const target = resolveRoundStartTarget(null, board);

    expect(target).toEqual({
      type: 'difficulty',
      difficulty: {
        name: 'Normal',
        rows: 10,
        columns: 10,
        maxSteps: 20,
        mode: 'classic',
      },
    });
  });

  test('fallback keeps maze mode from current board', () => {
    const board = createBoard({
      name: 'Maze Easy',
      mode: 'maze',
      rows: 10,
      columns: 10,
      maxSteps: 22,
    });

    const target = resolveRoundStartTarget(null, board);
    expect(target).toEqual({
      type: 'difficulty',
      difficulty: {
        name: 'Maze Easy',
        rows: 10,
        columns: 10,
        maxSteps: 22,
        mode: 'maze',
      },
    });
  });

  test('returns null when no config and no board', () => {
    expect(resolveRoundStartTarget(null, null)).toBeNull();
  });
});

import { describe, expect, test } from 'bun:test';
import {
  AUTO_GENERATE_SEED,
  calculateMaxSteps,
  flood,
  getStepsLeft,
  initializeBoard,
  initializeCustomBoard,
  isAllFilled,
} from '../../src/engine/game.js';

describe('engine/game', () => {
  test('initializeBoard is deterministic with explicit seed', () => {
    const boardA = initializeBoard('Easy', 6, 6, 1234, 15);
    const boardB = initializeBoard('Easy', 6, 6, 1234, 15);

    expect(boardA.seed).toBe(1234);
    expect(boardB.seed).toBe(1234);
    expect(boardA.matrix).toEqual(boardB.matrix);
    expect(boardA.maxSteps).toBe(15);
  });

  test('initializeBoard auto-calculates max steps when maxSteps=0', () => {
    const board = initializeBoard('Auto', 10, 10, 1234, 0);
    expect(board.maxSteps).toBe(calculateMaxSteps({ rows: 10 }));
  });

  test('initializeCustomBoard uses boardSize and moveLimit', () => {
    const board = initializeCustomBoard(
      { boardSize: 8, customMoveLimit: true, moveLimit: 30 },
      777,
    );

    expect(board.name).toBe('Custom');
    expect(board.rows).toBe(8);
    expect(board.columns).toBe(8);
    expect(board.maxSteps).toBe(30);
    expect(board.seed).toBe(777);
  });

  test('AUTO_GENERATE_SEED generates a numeric seed', () => {
    const board = initializeBoard('Easy', 6, 6, AUTO_GENERATE_SEED, 15);
    expect(typeof board.seed).toBe('number');
    expect(Number.isFinite(board.seed)).toBe(true);
  });

  test('flood returns original board when selecting same color', () => {
    const board = {
      name: 'Test',
      seed: 1,
      rows: 2,
      columns: 2,
      step: 3,
      maxSteps: 10,
      matrix: [
        ['blue', 'green'],
        ['red', 'yellow'],
      ],
    };

    const next = flood(board, 'blue');
    expect(next).toBe(board);
  });

  test('flood applies fill and increments step', () => {
    const board = {
      name: 'Test',
      seed: 1,
      rows: 3,
      columns: 3,
      step: 0,
      maxSteps: 10,
      matrix: [
        ['blue', 'blue', 'green'],
        ['blue', 'red', 'green'],
        ['yellow', 'red', 'green'],
      ],
    };

    const next = flood(board, 'red');

    expect(next).not.toBe(board);
    expect(next.step).toBe(1);
    expect(next.matrix).toEqual([
      ['red', 'red', 'green'],
      ['red', 'red', 'green'],
      ['yellow', 'red', 'green'],
    ]);
    expect(board.matrix[0][0]).toBe('blue');
  });

  test('isAllFilled and getStepsLeft reflect board state', () => {
    const complete = {
      name: 'Done',
      seed: 1,
      rows: 2,
      columns: 2,
      step: 4,
      maxSteps: 10,
      matrix: [
        ['green', 'green'],
        ['green', 'green'],
      ],
    };

    const incomplete = {
      ...complete,
      matrix: [
        ['green', 'green'],
        ['green', 'red'],
      ],
    };

    expect(isAllFilled(complete)).toBe(true);
    expect(isAllFilled(incomplete)).toBe(false);
    expect(getStepsLeft(complete)).toBe(6);
  });
});

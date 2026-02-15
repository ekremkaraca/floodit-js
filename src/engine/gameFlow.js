import { flood, getStepsLeft, isBoardWon } from './game.js';

/**
 * @typedef {import('../types/game.js').Board} Board
 * @typedef {import('../types/game.js').Difficulty} Difficulty
 * @typedef {import('../types/game.js').CustomGameSettings} CustomGameSettings
 */

/**
 * @typedef {{ success: boolean, gameState: 'playing' | 'won' | 'lost' | null }} MoveResult
 * @typedef {{ result: MoveResult, nextBoard: Board | null }} MoveResolution
 * @typedef {{ type: 'difficulty', difficulty: Difficulty } | { type: 'custom', settings: CustomGameSettings } | null} LastGameConfig
 * @typedef {{ type: 'difficulty', difficulty: Difficulty } | { type: 'custom', settings: CustomGameSettings } | null} RoundStartTarget
 */

/**
 * Resolve one move attempt against current board state.
 * @param {Board | null} board
 * @param {string} colorName
 * @returns {MoveResolution}
 */
export function resolveMove(board, colorName) {
  if (!board || getStepsLeft(board) < 1) {
    return {
      nextBoard: board,
      result: { success: false, gameState: 'lost' },
    };
  }

  if (board.matrix[0][0] === colorName) {
    return {
      nextBoard: board,
      result: { success: false, gameState: null },
    };
  }

  const nextBoard = flood(board, colorName);

  if (isBoardWon(nextBoard)) {
    return {
      nextBoard,
      result: { success: true, gameState: 'won' },
    };
  }

  if (getStepsLeft(nextBoard) < 1) {
    return {
      nextBoard,
      result: { success: true, gameState: 'lost' },
    };
  }

  return {
    nextBoard,
    result: { success: true, gameState: 'playing' },
  };
}

/**
 * Resolve the next-round start target from persisted metadata or active board.
 * @param {LastGameConfig} lastGameConfig
 * @param {Board | null} board
 * @returns {RoundStartTarget}
 */
export function resolveRoundStartTarget(lastGameConfig, board) {
  if (lastGameConfig?.type === 'difficulty') {
    return { type: 'difficulty', difficulty: lastGameConfig.difficulty };
  }

  if (lastGameConfig?.type === 'custom') {
    return { type: 'custom', settings: lastGameConfig.settings };
  }

  if (board) {
    return {
      type: 'difficulty',
      difficulty: {
        name: board.name,
        rows: board.rows,
        columns: board.columns,
        maxSteps: board.maxSteps,
        mode: board.mode ?? 'classic',
      },
    };
  }

  return null;
}

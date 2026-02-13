/** @typedef {import('../types/game.js').Board} Board */
/** @typedef {import('../types/game.js').Position} Position */
/** @typedef {import('../types/game.js').CustomGameSettings} CustomGameSettings */

export const DEFAULT_COLORS = [
  { name: 'blue', hex: '#3584e4' },
  { name: 'green', hex: '#33d17a' },
  { name: 'yellow', hex: '#f6d32d' },
  { name: 'orange', hex: '#ff7800' },
  { name: 'red', hex: '#ed333b' },
  { name: 'purple', hex: '#9141ac' },
];

export const AUTO_GENERATE_SEED = 0;

/**
 * Preset game modes shown in the UI.
 * Custom is a sentinel entry that opens the custom setup view.
 */
export const DIFFICULTIES = [
  { name: 'Easy', rows: 6, columns: 6, maxSteps: 15 },
  { name: 'Normal', rows: 10, columns: 10, maxSteps: 20 },
  { name: 'Hard', rows: 14, columns: 14, maxSteps: 25 },
  { name: 'Custom', rows: 0, columns: 0 },
];

/**
 * Create a deterministic board. If `seed` is omitted/0, current timestamp is used.
 * @param {string} name
 * @param {number} rows
 * @param {number} columns
 * @param {number} [seed=0]
 * @param {number} [maxSteps=0]
 * @returns {Board}
 */
export function initializeBoard(
  name,
  rows,
  columns,
  seed = AUTO_GENERATE_SEED,
  maxSteps = 0,
) {
  const matrix = Array(rows)
    .fill(null)
    .map(() => Array(columns).fill(''));

  const availableColors = DEFAULT_COLORS.map((c) => c.name);

  if (seed === AUTO_GENERATE_SEED) {
    seed = Date.now();
  }

  let random = seed;
  function rand() {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const colorIndex = Math.floor(rand() * availableColors.length);
      matrix[row][col] = availableColors[colorIndex];
    }
  }

  const board = {
    name,
    seed,
    rows,
    columns,
    step: 0,
    matrix,
    maxSteps,
  };

  if (maxSteps === 0) {
    board.maxSteps = calculateMaxSteps(board);
  }

  return board;
}

/**
 * Return valid orthogonal neighbors for a given position.
 * @param {{ rows: number, columns: number }} board
 * @param {Position} pos
 * @returns {Position[]}
 */
function getNeighbors(board, pos) {
  const { row, column } = pos;
  const neighbors = [];

  if (row > 0) neighbors.push({ row: row - 1, column });
  if (column > 0) neighbors.push({ row, column: column - 1 });
  if (row < board.rows - 1) neighbors.push({ row: row + 1, column });
  if (column < board.columns - 1) neighbors.push({ row, column: column + 1 });

  return neighbors;
}

/**
 * Flood-fill from top-left and return next immutable board snapshot.
 * Returns the original board if selected color is unchanged.
 * @param {Board} board
 * @param {string} newColor
 * @returns {Board}
 */
export function flood(board, newColor) {
  const newBoard = { ...board };
  const newMatrix = board.matrix.map((r) => [...r]);

  const targetColor = newMatrix[0][0];
  if (targetColor === newColor) {
    return board;
  }

  const visited = Array.from({ length: board.rows }, () =>
    Array(board.columns).fill(false),
  );

  const queue = [{ row: 0, column: 0 }];
  let queueIndex = 0;
  visited[0][0] = true;
  newMatrix[0][0] = newColor;

  while (queueIndex < queue.length) {
    const current = queue[queueIndex++];
    const neighbors = getNeighbors(board, current);

    for (const pos of neighbors) {
      if (visited[pos.row][pos.column]) {
        continue;
      }

      const cellColor = newMatrix[pos.row][pos.column];
      if (cellColor === targetColor || cellColor === newColor) {
        visited[pos.row][pos.column] = true;
        newMatrix[pos.row][pos.column] = newColor;
        queue.push(pos);
      }
    }
  }

  newBoard.matrix = newMatrix;
  newBoard.step++;

  return newBoard;
}

/**
 * Create a custom-mode board from custom settings.
 * @param {CustomGameSettings} settings
 * @param {number} [seed=0]
 * @returns {Board}
 */
export function initializeCustomBoard(settings, seed = AUTO_GENERATE_SEED) {
  return initializeBoard(
    'Custom',
    settings.boardSize,
    settings.boardSize,
    seed,
    settings.moveLimit,
  );
}

/**
 * Remaining attempts for the current board.
 * @param {Board} board
 * @returns {number}
 */
export function getStepsLeft(board) {
  return board.maxSteps - board.step;
}

/**
 * Heuristic used by the original implementation to estimate reasonable move limits.
 * @param {{ rows: number }} board
 * @returns {number}
 */
export function calculateMaxSteps(board) {
  return Math.floor((30 * (board.rows * DEFAULT_COLORS.length)) / (17 * 6));
}

/**
 * True when every cell matches the top-left color.
 * @param {Board} board
 * @returns {boolean}
 */
export function isAllFilled(board) {
  const targetColor = board.matrix[0][0];

  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.columns; col++) {
      if (board.matrix[row][col] !== targetColor) {
        return false;
      }
    }
  }

  return true;
}

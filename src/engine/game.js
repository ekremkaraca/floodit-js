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
  { name: 'Easy', rows: 6, columns: 6, maxSteps: 15, mode: 'classic' },
  { name: 'Normal', rows: 10, columns: 10, maxSteps: 20, mode: 'classic' },
  { name: 'Hard', rows: 14, columns: 14, maxSteps: 25, mode: 'classic' },
  { name: 'Maze Easy', rows: 10, columns: 10, maxSteps: 22, mode: 'maze' },
  { name: 'Maze Normal', rows: 12, columns: 12, maxSteps: 24, mode: 'maze' },
  { name: 'Maze Hard', rows: 14, columns: 14, maxSteps: 28, mode: 'maze' },
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
    mode: 'classic',
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

function createMazeWalls(rows, columns, rand) {
  // Start with fully blocked grid and carve corridors with iterative DFS.
  const walls = Array.from({ length: rows }, () => Array(columns).fill(true));
  const stack = [{ row: 0, column: 0 }];
  walls[0][0] = false;

  const directions = [
    { dr: -2, dc: 0 },
    { dr: 2, dc: 0 },
    { dr: 0, dc: -2 },
    { dr: 0, dc: 2 },
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const candidates = [];

    for (const { dr, dc } of directions) {
      const nextRow = current.row + dr;
      const nextColumn = current.column + dc;
      if (
        nextRow < 0 ||
        nextRow >= rows ||
        nextColumn < 0 ||
        nextColumn >= columns
      ) {
        continue;
      }

      if (!walls[nextRow][nextColumn]) {
        continue;
      }

      candidates.push({ nextRow, nextColumn, midRow: current.row + dr / 2, midColumn: current.column + dc / 2 });
    }

    if (candidates.length === 0) {
      stack.pop();
      continue;
    }

    // Carve both the midpoint and the destination cell to form a corridor.
    const pick = candidates[Math.floor(rand() * candidates.length)];
    walls[pick.midRow][pick.midColumn] = false;
    walls[pick.nextRow][pick.nextColumn] = false;
    stack.push({ row: pick.nextRow, column: pick.nextColumn });
  }

  // Ensure bottom-right goal cell is open and connected to the carved maze.
  let row = rows - 1;
  let column = columns - 1;
  walls[row][column] = false;
  while (row !== 0 || column !== 0) {
    walls[row][column] = false;
    const canMoveUp = row > 0;
    const canMoveLeft = column > 0;
    if (canMoveUp && canMoveLeft) {
      if (rand() < 0.5) {
        row -= 1;
      } else {
        column -= 1;
      }
    } else if (canMoveUp) {
      row -= 1;
    } else {
      column -= 1;
    }
    walls[row][column] = false;
  }

  return walls;
}

/**
 * Create maze-mode board with deterministic walls and a bottom-right goal.
 * @param {string} name
 * @param {number} rows
 * @param {number} columns
 * @param {number} [seed=0]
 * @param {number} [maxSteps=0]
 * @returns {Board}
 */
export function initializeMazeBoard(
  name,
  rows,
  columns,
  seed = AUTO_GENERATE_SEED,
  maxSteps = 0,
) {
  const board = initializeBoard(name, rows, columns, seed, maxSteps);
  let random = board.seed;
  function rand() {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  }

  return {
    ...board,
    mode: 'maze',
    walls: createMazeWalls(rows, columns, rand),
    goal: { row: rows - 1, column: columns - 1 },
  };
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

      if (board.walls?.[pos.row]?.[pos.column]) {
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

/**
 * True when the flooded region reaches board.goal (maze mode).
 * @param {Board} board
 * @returns {boolean}
 */
export function isGoalReached(board) {
  if (!board.goal) return false;
  const { row: goalRow, column: goalColumn } = board.goal;
  if (
    goalRow < 0 ||
    goalRow >= board.rows ||
    goalColumn < 0 ||
    goalColumn >= board.columns
  ) {
    return false;
  }

  const targetColor = board.matrix[0][0];
  const visited = Array.from({ length: board.rows }, () =>
    Array(board.columns).fill(false),
  );
  const queue = [{ row: 0, column: 0 }];
  visited[0][0] = true;
  let queueIndex = 0;

  while (queueIndex < queue.length) {
    const current = queue[queueIndex++];
    if (current.row === goalRow && current.column === goalColumn) {
      return true;
    }

    const neighbors = getNeighbors(board, current);
    for (const pos of neighbors) {
      if (visited[pos.row][pos.column]) continue;
      // In maze mode, wall tiles are structural blockers for the flood region.
      if (board.walls?.[pos.row]?.[pos.column]) continue;
      if (board.matrix[pos.row][pos.column] !== targetColor) continue;

      visited[pos.row][pos.column] = true;
      queue.push(pos);
    }
  }

  return false;
}

/**
 * Unified win check for classic and maze boards.
 * @param {Board} board
 * @returns {boolean}
 */
export function isBoardWon(board) {
  if (board.mode === 'maze' || board.goal) {
    return isGoalReached(board);
  }
  return isAllFilled(board);
}

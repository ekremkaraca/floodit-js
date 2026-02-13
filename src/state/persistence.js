import { DEFAULT_COLORS } from '../engine/game.js';

export const STORAGE_KEY = 'floodit.state.v1';
export const STORAGE_VERSION = 1;

const VALID_COLORS = new Set(DEFAULT_COLORS.map((c) => c.name));

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toSafeInteger(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.trunc(n);
  return Math.min(max, Math.max(min, i));
}

function sanitizeBoard(board) {
  if (!isPlainObject(board)) return null;

  const rows = toSafeInteger(board.rows, 0, 1, 25);
  const columns = toSafeInteger(board.columns, 0, 1, 25);
  if (rows < 1 || columns < 1) return null;

  if (!Array.isArray(board.matrix) || board.matrix.length !== rows) {
    return null;
  }

  const matrix = [];
  for (let r = 0; r < rows; r++) {
    const row = board.matrix[r];
    if (!Array.isArray(row) || row.length !== columns) {
      return null;
    }

    const nextRow = [];
    for (let c = 0; c < columns; c++) {
      const color = row[c];
      nextRow.push(VALID_COLORS.has(color) ? color : 'blue');
    }
    matrix.push(nextRow);
  }

  const maxSteps = toSafeInteger(board.maxSteps, 20, 1, 500);
  const step = toSafeInteger(board.step, 0, 0, maxSteps);
  const seed = Number.isFinite(Number(board.seed)) ? Number(board.seed) : Date.now();

  return {
    name: typeof board.name === 'string' && board.name.length > 0 ? board.name : 'Custom',
    seed,
    rows,
    columns,
    step,
    maxSteps,
    matrix,
  };
}

function sanitizeCustomSettings(value) {
  if (!isPlainObject(value)) {
    return {
      boardSize: 10,
      customMoveLimit: false,
      moveLimit: 20,
    };
  }

  const boardSize = toSafeInteger(value.boardSize, 10, 5, 25);
  const customMoveLimit = Boolean(value.customMoveLimit);
  const moveLimit = toSafeInteger(value.moveLimit, 20, 5, 100);

  return {
    boardSize,
    customMoveLimit,
    moveLimit,
  };
}

function sanitizeLastGameConfig(value) {
  if (!isPlainObject(value)) return null;

  if (value.type === 'difficulty' && isPlainObject(value.difficulty)) {
    const difficulty = value.difficulty;
    const rows = toSafeInteger(difficulty.rows, 10, 1, 25);
    const columns = toSafeInteger(difficulty.columns, 10, 1, 25);
    const maxSteps = toSafeInteger(difficulty.maxSteps ?? 0, 0, 0, 500);

    return {
      type: 'difficulty',
      difficulty: {
        name: typeof difficulty.name === 'string' && difficulty.name.length > 0 ? difficulty.name : 'Custom',
        rows,
        columns,
        maxSteps,
      },
    };
  }

  if (value.type === 'custom' && isPlainObject(value.settings)) {
    return {
      type: 'custom',
      settings: sanitizeCustomSettings(value.settings),
    };
  }

  return null;
}

export function sanitizePersistedSnapshot(raw) {
  if (!isPlainObject(raw)) return null;
  if (raw.version !== STORAGE_VERSION || !isPlainObject(raw.data)) {
    return null;
  }

  const data = raw.data;

  return {
    board: sanitizeBoard(data.board),
    selectedColor: typeof data.selectedColor === 'string' && VALID_COLORS.has(data.selectedColor)
      ? data.selectedColor
      : '',
    showCustomMode: Boolean(data.showCustomMode),
    lastGameConfig: sanitizeLastGameConfig(data.lastGameConfig),
    customSettings: sanitizeCustomSettings(data.customSettings),
  };
}

export function loadPersistedState(storage = globalThis.localStorage) {
  if (!storage) return null;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return sanitizePersistedSnapshot(parsed);
  } catch {
    return null;
  }
}

function toPersistedData(state) {
  return {
    board: state.board,
    selectedColor: state.selectedColor,
    showCustomMode: state.showCustomMode,
    lastGameConfig: state.lastGameConfig,
    customSettings: state.customSettings,
  };
}

export function savePersistedState(state, storage = globalThis.localStorage) {
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({
      version: STORAGE_VERSION,
      data: toPersistedData(state),
    }));
  } catch {
    // Storage access can fail (private mode, quota). Ignore safely.
  }
}

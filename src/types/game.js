/**
 * @typedef {Object} Position
 * @property {number} row
 * @property {number} column
 */

/**
 * @typedef {Object} Board
 * @property {string} name
 * @property {'classic' | 'maze'} [mode]
 * @property {number} seed
 * @property {number} rows
 * @property {number} columns
 * @property {number} step
 * @property {number} maxSteps
 * @property {string[][]} matrix
 * @property {boolean[][]} [walls]
 * @property {Position} [goal]
 */

/**
 * @typedef {Object} GameColor
 * @property {string} name
 * @property {string} hex
 */

/**
 * @typedef {Object} Difficulty
 * @property {string} name
 * @property {number} rows
 * @property {number} columns
 * @property {number} [maxSteps]
 * @property {'classic' | 'maze'} [mode]
 */

/**
 * @typedef {Object} CustomGameSettings
 * @property {'classic' | 'maze'} gameMode
 * @property {number} boardSize
 * @property {boolean} customMoveLimit
 * @property {number} moveLimit
 */

export {};

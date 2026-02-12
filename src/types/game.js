/**
 * @typedef {Object} Position
 * @property {number} row
 * @property {number} column
 */

/**
 * @typedef {Object} Board
 * @property {string} name
 * @property {number} seed
 * @property {number} rows
 * @property {number} columns
 * @property {number} step
 * @property {number} maxSteps
 * @property {string[][]} matrix
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
 */

/**
 * @typedef {Object} CustomGameSettings
 * @property {number} boardSize
 * @property {boolean} customMoveLimit
 * @property {number} moveLimit
 */

export {};

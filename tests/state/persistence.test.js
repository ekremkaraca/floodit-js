import { describe, expect, test } from 'bun:test';
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  loadPersistedState,
  savePersistedState,
  sanitizePersistedSnapshot,
} from '../../src/state/persistence.js';

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
  };
}

describe('state/persistence', () => {
  test('savePersistedState writes versioned payload', () => {
    const storage = createMemoryStorage();

    savePersistedState({
      board: null,
      selectedColor: 'blue',
      showCustomMode: false,
      lastGameConfig: null,
      customSettings: { boardSize: 10, customMoveLimit: false, moveLimit: 20 },
    }, storage);

    const stored = JSON.parse(storage.getItem(STORAGE_KEY));
    expect(stored.version).toBe(STORAGE_VERSION);
    expect(stored.data.selectedColor).toBe('blue');
  });

  test('loadPersistedState returns null on malformed json', () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, '{invalid');

    expect(loadPersistedState(storage)).toBeNull();
  });

  test('sanitizePersistedSnapshot clamps and validates board/custom data', () => {
    const sanitized = sanitizePersistedSnapshot({
      version: STORAGE_VERSION,
      data: {
        board: {
          name: 'Hard',
          seed: 123,
          rows: 2,
          columns: 2,
          step: 999,
          maxSteps: 10,
          matrix: [
            ['blue', 'invalid-color'],
            ['green', 'yellow'],
          ],
        },
        selectedColor: 'invalid-color',
        showCustomMode: 1,
        lastGameConfig: {
          type: 'custom',
          settings: {
            boardSize: 100,
            customMoveLimit: true,
            moveLimit: 999,
          },
        },
        customSettings: {
          boardSize: 1,
          customMoveLimit: true,
          moveLimit: 1000,
        },
      },
    });

    expect(sanitized).not.toBeNull();
    expect(sanitized?.board?.matrix[0][1]).toBe('blue');
    expect(sanitized?.board?.step).toBe(10);
    expect(sanitized?.selectedColor).toBe('');
    expect(sanitized?.customSettings.boardSize).toBe(5);
    expect(sanitized?.customSettings.moveLimit).toBe(100);
    expect(sanitized?.lastGameConfig?.type).toBe('custom');
    expect(sanitized?.lastGameConfig?.settings.boardSize).toBe(25);
  });

  test('loadPersistedState returns sanitized snapshot', () => {
    const storage = createMemoryStorage();

    storage.setItem(STORAGE_KEY, JSON.stringify({
      version: STORAGE_VERSION,
      data: {
        board: null,
        selectedColor: 'red',
        showCustomMode: false,
        lastGameConfig: null,
        customSettings: { boardSize: 12, customMoveLimit: false, moveLimit: 20 },
      },
    }));

    const loaded = loadPersistedState(storage);
    expect(loaded).toEqual({
      board: null,
      selectedColor: 'red',
      showCustomMode: false,
      lastGameConfig: null,
      customSettings: { boardSize: 12, customMoveLimit: false, moveLimit: 20 },
    });
  });
});

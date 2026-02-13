import './styles/app.css';

import { DEFAULT_COLORS } from './engine/game.js';
import { createStore } from './state/store.js';
import { createActions } from './actions/gameActions.js';
import { loadPersistedState, savePersistedState } from './state/persistence.js';
import { clear } from './views/dom.js';
import {
  renderApp,
  renderColorKeyboardContent,
  renderGameBoardContent,
  renderGameHeaderContent,
} from './views/appView.js';

const COLOR_HEX = Object.fromEntries(
  DEFAULT_COLORS.map((color) => [color.name, color.hex]),
);

const appEl = document.getElementById('app');
if (!appEl) throw new Error('Missing #app element');

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const saved = localStorage.getItem('darkMode');
const initialDarkMode = saved !== null ? saved === 'true' : prefersDark;
const persisted = loadPersistedState();

const store = createStore({
  board: persisted?.board ?? null,
  selectedColor: persisted?.selectedColor ?? '',
  showCustomMode: persisted?.showCustomMode ?? false,
  showGameOverModal: false,
  showConfirmDialog: false,
  pendingAction: null,
  confirmDialogContent: { title: 'Confirm Action', message: 'Are you sure you want to proceed?' },
  lastGameConfig: persisted?.lastGameConfig ?? null,
  isDarkMode: initialDarkMode,
  customSettings: persisted?.customSettings ?? {
    boardSize: 10,
    customMoveLimit: false,
    moveLimit: 20,
  },
});

const baseActions = createActions(store);
const actions = { ...baseActions, store };

function replaceSlotContent(root, slotName, nextNode) {
  const slot = root.querySelector(`[data-slot="${slotName}"]`);
  if (!(slot instanceof HTMLElement)) return false;
  clear(slot);
  slot.appendChild(nextNode);
  return true;
}

function patchBoardCells(root, board) {
  const slot = root.querySelector('[data-slot="game-board"]');
  if (!(slot instanceof HTMLElement)) return false;

  const grid = slot.querySelector('.board-grid');
  if (!(grid instanceof HTMLElement)) return false;
  if (grid.dataset.rows !== String(board.rows)) return false;
  if (grid.dataset.columns !== String(board.columns)) return false;

  const expectedCellCount = board.rows * board.columns;
  if (grid.children.length !== expectedCellCount) return false;

  let index = 0;
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.columns; c++) {
      const cell = grid.children[index];
      if (!(cell instanceof HTMLElement)) return false;

      const color = board.matrix[r][c];
      if (cell.dataset.color !== color) {
        const nextBackground = COLOR_HEX[color] || '#9ca3af';
        cell.style.backgroundColor = nextBackground;
        cell.dataset.color = color;
      }

      index += 1;
    }
  }

  return true;
}

function patchGameView(state, plan) {
  const screen = appEl.firstElementChild;
  if (!(screen instanceof HTMLElement)) return false;
  if (!screen.classList.contains('app-screen--game')) return false;

  if (plan.header) {
    const headerUpdated = replaceSlotContent(
      screen,
      'game-header',
      renderGameHeaderContent({ state, actions }),
    );
    if (!headerUpdated) return false;
  }

  if (plan.board) {
    const boardUpdated =
      patchBoardCells(screen, state.board) ||
      replaceSlotContent(
        screen,
        'game-board',
        renderGameBoardContent({ state }),
      );
    if (!boardUpdated) return false;
  }

  if (plan.keyboard) {
    const keyboardUpdated = replaceSlotContent(
      screen,
      'color-keyboard',
      renderColorKeyboardContent({ state, actions }),
    );
    if (!keyboardUpdated) return false;
  }

  return true;
}

function canPatchGameView(prev, next) {
  if (!prev || !next) return false;
  if (!prev.board || !next.board) return false;
  if (prev.showCustomMode || next.showCustomMode) return false;
  if (prev.showConfirmDialog || next.showConfirmDialog) return false;
  if (prev.showGameOverModal || next.showGameOverModal) return false;
  return true;
}

function buildPatchPlan(prev, next) {
  const boardChanged = prev.board !== next.board;

  const plan = {
    header: false,
    board: false,
    keyboard: false,
  };

  if (boardChanged) {
    // Board changes affect progress/header metrics and keyboard disabled state.
    plan.header = true;
    plan.board = true;
    plan.keyboard = true;
    return plan;
  }

  if (prev.selectedColor !== next.selectedColor) {
    plan.keyboard = true;
  }

  if (prev.isDarkMode !== next.isDarkMode) {
    plan.header = true;
  }

  return plan;
}

function mount(state) {
  clear(appEl);
  appEl.appendChild(renderApp({ state, actions }));
}

let lastRenderedState = null;
let renderRaf = 0;
let persistRaf = 0;

function render() {
  const state = store.getState();

  if (canPatchGameView(lastRenderedState, state)) {
    const plan = buildPatchPlan(lastRenderedState, state);
    if (!plan.header && !plan.board && !plan.keyboard) {
      lastRenderedState = state;
      return;
    }

    if (patchGameView(state, plan)) {
      lastRenderedState = state;
      return;
    }
  }

  mount(state);
  lastRenderedState = state;
}

function scheduleRender() {
  if (renderRaf) return;
  renderRaf = requestAnimationFrame(() => {
    renderRaf = 0;
    render();
  });
}

function schedulePersist() {
  if (persistRaf) return;
  persistRaf = requestAnimationFrame(() => {
    persistRaf = 0;
    savePersistedState(store.getState());
  });
}

store.subscribe(() => {
  scheduleRender();
  schedulePersist();
});

scheduleRender();

// Avoid stealing global shortcuts while user is typing in inputs.
function isTextInputTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  );
}

// Gameplay shortcuts: Alt+Shift+R (reset), N (new), Q (quit).
window.addEventListener('keydown', (event) => {
  const state = store.getState();
  const isShortcutModifier = event.altKey && event.shiftKey;

  if (!isShortcutModifier || event.ctrlKey || event.metaKey || isTextInputTarget(event.target)) {
    return;
  }

  const key = event.key.toLowerCase();
  const hasBoard = Boolean(state.board);

  if (!hasBoard || state.showConfirmDialog || state.showCustomMode) {
    return;
  }

  if (key === 'r') {
    event.preventDefault();
    actions.openConfirmDialog({
      title: 'Reset Game?',
      message: 'This will reset your current board and progress. Continue?',
      pendingAction: () => actions.resetGame(),
    });
    return;
  }

  if (key === 'n') {
    event.preventDefault();
    actions.openConfirmDialog({
      title: 'Start New Game?',
      message: 'This will start a new board with your current settings. Continue?',
      pendingAction: () => actions.startNewRoundWithCurrentSettings(),
    });
    return;
  }

  if (key === 'q') {
    event.preventDefault();
    actions.openConfirmDialog({
      title: 'Quit Game?',
      message: 'This will return to the welcome screen and end your current game. Continue?',
      pendingAction: () => actions.quitGame(),
    });
  }
});

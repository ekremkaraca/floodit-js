import './styles/app.css';

import { createStore } from './state/store.js';
import { createActions } from './actions/gameActions.js';
import { clear } from './views/dom.js';
import { renderApp } from './views/appView.js';

const appEl = document.getElementById('app');
if (!appEl) throw new Error('Missing #app element');

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const saved = localStorage.getItem('darkMode');
const initialDarkMode = saved !== null ? saved === 'true' : prefersDark;

const store = createStore({
  board: null,
  selectedColor: '',
  showCustomMode: false,
  showGameOverModal: false,
  showConfirmDialog: false,
  pendingAction: null,
  confirmDialogContent: { title: 'Confirm Action', message: 'Are you sure you want to proceed?' },
  lastGameConfig: null,
  isDarkMode: initialDarkMode,
  customSettings: {
    boardSize: 10,
    customMoveLimit: false,
    moveLimit: 20,
  },
});

const baseActions = createActions(store);
const actions = { ...baseActions, store };

// Full remount strategy: simple and predictable for current app size.
function mount() {
  clear(appEl);
  appEl.appendChild(renderApp({ state: store.getState(), actions }));
}

store.subscribe(() => {
  mount();
});

mount();

let resizeRaf = 0;
window.addEventListener('resize', () => {
  if (resizeRaf) {
    cancelAnimationFrame(resizeRaf);
  }
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    mount();
  });
});

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

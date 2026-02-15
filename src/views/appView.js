import { h } from './dom.js';
import { getStepsLeft, isBoardWon, DIFFICULTIES } from '../engine/game.js';
import { renderWelcome } from './welcome.js';
import { renderCustomGameMode } from './customGameMode.js';
import { renderHelpRules } from './helpRules.js';
import { renderGameBoard } from './gameBoard.js';
import { renderColorKeyboard } from './colorKeyboard.js';
import { renderGameHeader } from './gameHeader.js';
import { renderConfirmDialog, renderGameOverModal } from './modals.js';

function getGameStatus(board) {
  const stepsLeft = getStepsLeft(board);
  // Unified win check keeps view logic mode-agnostic (classic vs maze).
  const hasWon = isBoardWon(board);
  const isGameOver = hasWon || stepsLeft < 1;

  return {
    stepsLeft,
    isGameOver,
    hasWon,
  };
}

function renderMenuItem(difficulty, actions) {
  return h('button', {
    type: 'button',
    className: 'menu-item',
    onClick: () => {
      if (difficulty.name === 'Custom') {
        actions.openCustomMode();
        return;
      }

      const start = () => actions.startNewGame(difficulty);
      actions.openConfirmDialog({
        title: 'Start New Game?',
        message: 'Starting a new game will end your current game. Continue?',
        pendingAction: start,
      });
    },
  }, [
    h('div', { className: 'menu-item__title' }, [difficulty.name]),
    h('div', { className: 'menu-item__meta' }, [
      difficulty.name === 'Custom'
        ? 'Configure board size and move limit'
        : difficulty.mode === 'maze'
          ? `${difficulty.rows}×${difficulty.columns} maze goal mode`
        : `${difficulty.rows}×${difficulty.columns}`,
    ]),
  ]);
}

function buildNewGameMenuItems(state, actions) {
  const recentMazeModes = state.recentMazeModes ?? [];
  const baseItems = DIFFICULTIES.map((difficulty) => renderMenuItem(difficulty, actions));

  if (recentMazeModes.length === 0) {
    return baseItems;
  }

  return [
    h('div', { className: 'menu-section-title' }, ['Recent Maze Modes']),
    ...recentMazeModes.map((difficulty) => (
      h('div', { className: 'menu-recent-item' }, [
        renderMenuItem(difficulty, actions),
      ])
    )),
    h('div', { className: 'menu-divider', 'aria-hidden': 'true' }),
    h('div', { className: 'menu-section-title' }, ['All Modes']),
    ...baseItems,
  ];
}

export function renderGameHeaderContent({ state, actions }) {
  const board = state.board;
  if (!board) {
    return document.createTextNode('');
  }

  const { stepsLeft } = getGameStatus(board);

  return renderGameHeader({
    boardName: board.name,
    stepsLeft,
    currentStep: board.step,
    maxSteps: board.maxSteps,
    onNewGame: buildNewGameMenuItems(state, actions),
    onReset: () => {
      actions.openConfirmDialog({
        title: 'Reset Game?',
        message: 'This will reset your current board and progress. Continue?',
        pendingAction: () => actions.resetGame(),
      });
    },
    onToggleDarkMode: () => actions.toggleDarkMode(),
    isDarkMode: state.isDarkMode,
    onHelp: () => actions.openHelpPage(),
  });
}

export function renderGameBoardContent({ state }) {
  const board = state.board;
  if (!board) {
    return document.createTextNode('');
  }

  return h('div', { className: 'app-board-area' }, [
    h('div', { className: 'app-board-inner' }, [renderGameBoard({ board })]),
  ]);
}

export function renderColorKeyboardContent({ state, actions }) {
  const board = state.board;
  if (!board) {
    return document.createTextNode('');
  }

  const { isGameOver } = getGameStatus(board);

  return renderColorKeyboard({
    colors: actions.DEFAULT_COLORS,
    selectedColor: state.selectedColor,
    disabled: isGameOver,
    board,
    onColorSelect: (colorName) => {
      if (isGameOver) return;

      actions.setSelectedColor(colorName);
      const result = actions.makeMove(colorName);
      if (result.gameState === 'won' || result.gameState === 'lost') {
        actions.openGameOverModal();
      }
    },
  });
}

/**
 * Root view composer. Chooses which screen to render from current state.
 */
export function renderApp({ state, actions }) {
  if (state.showHelpPage) {
    return renderHelpRules({
      onBack: () => actions.closeHelpPage(),
      isInGame: Boolean(state.board),
    });
  }

  if (state.showCustomMode) {
    return renderCustomGameMode({ actions });
  }

  if (!state.board) {
    return renderWelcome({ actions });
  }

  const board = state.board;
  const { isGameOver, hasWon } = getGameStatus(board);

  const root = h('div', {
    className: 'app-screen app-screen--game',
  });

  root.appendChild(
    h('header', {
      className: 'app-header-shell',
    }, [
      h('div', { className: 'app-header-inner' }, [
        h('div', { 'data-slot': 'game-header' }, [
          renderGameHeaderContent({ state, actions }),
        ]),
      ]),
    ]),
  );

  root.appendChild(
    h('div', { className: 'app-main' }, [
      h('div', { className: 'app-content' }, [
        h('div', { 'data-slot': 'game-board' }, [
          renderGameBoardContent({ state }),
        ]),
        h('div', { 'data-slot': 'color-keyboard' }, [
          renderColorKeyboardContent({ state, actions }),
        ]),
      ]),
    ]),
  );

  root.appendChild(
    renderConfirmDialog({
      isOpen: state.showConfirmDialog,
      title: state.confirmDialogContent.title,
      message: state.confirmDialogContent.message,
      onClose: () => actions.closeConfirmDialog(),
      onConfirm: () => actions.confirmPendingAction(),
    }) || document.createTextNode(''),
  );

  if (isGameOver) {
    root.appendChild(
      renderGameOverModal({
        isOpen: state.showGameOverModal,
        hasWon,
        board,
        onClose: () => actions.closeGameOverModal(),
        onNewGame: () => {
          actions.startNewRoundWithCurrentSettings();
          actions.closeGameOverModal();
        },
      }),
    );
  }

  return root;
}

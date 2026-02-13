import { h } from './dom.js';
import { getStepsLeft, isAllFilled, DIFFICULTIES } from '../engine/game.js';
import { renderWelcome } from './welcome.js';
import { renderCustomGameMode } from './customGameMode.js';
import { renderGameBoard } from './gameBoard.js';
import { renderColorKeyboard } from './colorKeyboard.js';
import { renderGameHeader } from './gameHeader.js';
import { renderConfirmDialog, renderGameOverModal } from './modals.js';

function getGameStatus(board) {
  const stepsLeft = getStepsLeft(board);
  const isFilled = isAllFilled(board);
  const isGameOver = isFilled || stepsLeft < 1;

  return {
    stepsLeft,
    isFilled,
    isGameOver,
    hasWon: isFilled,
  };
}

function buildNewGameMenuItems(actions) {
  return DIFFICULTIES.map((difficulty) =>
    h('button', {
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
          : `${difficulty.rows}×${difficulty.columns}`,
      ]),
    ]),
  );
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
    onNewGame: buildNewGameMenuItems(actions),
    onReset: () => {
      actions.openConfirmDialog({
        title: 'Reset Game?',
        message: 'This will reset your current board and progress. Continue?',
        pendingAction: () => actions.resetGame(),
      });
    },
    onToggleDarkMode: () => actions.toggleDarkMode(),
    isDarkMode: state.isDarkMode,
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

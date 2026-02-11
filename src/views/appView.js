import { h } from './dom.js';
import { getStepsLeft, isAllFilled, DIFFICULTIES } from '../engine/game.js';
import { renderWelcome } from './welcome.js';
import { renderCustomGameMode } from './customGameMode.js';
import { renderGameBoard } from './gameBoard.js';
import { renderColorKeyboard } from './colorKeyboard.js';
import { renderGameHeader } from './gameHeader.js';
import { renderConfirmDialog, renderGameOverModal } from './modals.js';

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
  const stepsLeft = getStepsLeft(board);
  const isGameOver = isAllFilled(board) || stepsLeft < 1;
  const hasWon = isAllFilled(board);

  const newGameMenuItems = DIFFICULTIES.map((difficulty) =>
    h('button', {
      type: 'button',
      className:
        'w-full px-3 py-2 sm:px-4 sm:py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm sm:text-base',
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
      h('div', { className: 'font-medium' }, [difficulty.name]),
      h('div', { className: 'text-xs sm:text-sm text-gray-500 dark:text-gray-400' }, [
        difficulty.name === 'Custom'
          ? 'Configure board size and move limit'
          : `${difficulty.rows}×${difficulty.columns}`,
      ]),
    ]),
  );

  const root = h('div', {
    className:
      'min-h-dvh bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-colors duration-200',
  });

  root.appendChild(
    h('header', {
      className:
        'sticky top-0 z-20 shrink-0 bg-white/95 dark:bg-gray-800/95 border-b border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur transition-colors duration-200',
    }, [
      h('div', { className: 'max-w-full mx-auto px-2 py-0' }, [
        renderGameHeader({
          boardName: board.name,
          stepsLeft,
          currentStep: board.step,
          maxSteps: board.maxSteps,
          onNewGame: newGameMenuItems,
          onReset: () => {
            actions.openConfirmDialog({
              title: 'Reset Game?',
              message: 'This will reset your current board and progress. Continue?',
              pendingAction: () => actions.resetGame(),
            });
          },
          onToggleDarkMode: () => actions.toggleDarkMode(),
          isDarkMode: state.isDarkMode,
        }),
      ]),
    ]),
  );

  root.appendChild(
    h('div', { className: 'flex-1 min-h-0 p-2 sm:p-4 overflow-auto' }, [
      h('div', { className: 'max-w-4xl mx-auto min-h-0 h-full flex flex-col' }, [
        h('div', { className: 'flex-1 min-h-0 flex items-center justify-center' }, [
          h('div', { className: 'w-full h-full min-h-0' }, [renderGameBoard({ board })]),
        ]),

        renderColorKeyboard({
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
        }),
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

import { h } from './dom.js';

export function renderConfirmDialog({ isOpen, title, message, onClose, onConfirm }) {
  if (!isOpen) return null;

  return h('div', { className: 'fixed inset-0 z-[9999] flex items-center justify-center p-4' }, [
    h('div', {
      className: 'absolute inset-0 bg-black/50 transition-opacity duration-300',
      onClick: onClose,
      'aria-hidden': 'true',
    }),
    h('div', {
      className:
        'relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 opacity-100',
    }, [
      h('h3', { className: 'text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4' }, [title]),
      h('p', { className: 'text-gray-700 dark:text-gray-300 mb-6' }, [message]),
      h('div', { className: 'flex justify-end space-x-3' }, [
        h('button', {
          type: 'button',
          onClick: onClose,
          className:
            'px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200',
        }, ['Cancel']),
        h('button', {
          type: 'button',
          onClick: () => {
            onConfirm();
          },
          className:
            'px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200',
        }, ['Confirm']),
      ]),
    ]),
  ]);
}

export function renderGameOverModal({ isOpen, hasWon, board, onClose, onNewGame }) {
  if (!board) return null;

  return h('div', {
    className: `fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
      isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`,
  }, [
    h('div', {
      className: `absolute inset-0 bg-black/50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`,
      onClick: onClose,
    }),
    h('div', {
      className: `relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full transition-all duration-300 transform ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`,
    }, [
      h('button', {
        type: 'button',
        onClick: onClose,
        className:
          'absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200',
        'aria-label': 'Close game over dialog',
      }, ['×']),
      h('div', { className: 'text-center' }, [
        h('div', {
          className: `text-3xl font-bold mb-4 ${
            hasWon ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`,
        }, [hasWon ? 'You Won!' : 'Game Over']),
        h('p', { className: 'text-gray-600 dark:text-gray-400 text-lg mb-4' }, [
          hasWon
            ? `Congratulations! You completed the board in ${board.step} moves!`
            : 'You ran out of moves. The board was not completely flooded.',
        ]),
        hasWon
          ? h('div', { className: 'mb-6' }, [
              h('div', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-2' }, [
                'Efficiency Score',
              ]),
              h('div', { className: 'text-2xl font-bold text-blue-600 dark:text-blue-400' }, [
                `${board.step > 0 ? Math.round((board.maxSteps / board.step) * 100) : 100}%`,
              ]),
              h('div', { className: 'text-xs text-gray-500 dark:text-gray-400 mt-1' }, [
                board.step > 0
                  ? `${board.step} moves used out of ${board.maxSteps}`
                  : 'Perfect game!',
              ]),
            ])
          : null,
        h('div', { className: 'flex gap-3 justify-center' }, [
          h('button', {
            type: 'button',
            onClick: onClose,
            className:
              'px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold shadow-md',
          }, ['Close']),
          h('button', {
            type: 'button',
            onClick: onNewGame,
            className:
              'px-6 py-3 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-md',
          }, ['New Game']),
        ]),
      ]),
    ]),
  ]);
}

import { h } from './dom.js';

export function renderConfirmDialog({ isOpen, title, message, onClose, onConfirm }) {
  if (!isOpen) return null;

  return h('div', { className: 'modal modal--confirm is-open' }, [
    h('div', {
      className: 'modal__backdrop is-open',
      onClick: onClose,
      'aria-hidden': 'true',
    }),
    h('div', {
      className: 'modal__panel modal__panel--confirm is-open',
    }, [
      h('h3', { className: 'modal__title' }, [title]),
      h('p', { className: 'modal__message' }, [message]),
      h('div', { className: 'modal__actions modal__actions--right' }, [
        h('button', {
          type: 'button',
          onClick: onClose,
          className: 'btn btn--subtle',
        }, ['Cancel']),
        h('button', {
          type: 'button',
          onClick: () => {
            onConfirm();
          },
          className: 'btn btn--danger',
        }, ['Confirm']),
      ]),
    ]),
  ]);
}

export function renderGameOverModal({ isOpen, hasWon, board, onClose, onNewGame }) {
  if (!board) return null;

  const stateClass = isOpen ? 'is-open' : 'is-closed';

  return h('div', {
    className: `modal modal--gameover ${stateClass}`,
  }, [
    h('div', {
      className: `modal__backdrop ${stateClass}`,
      onClick: onClose,
    }),
    h('div', {
      className: `modal__panel modal__panel--gameover ${stateClass}`,
    }, [
      h('button', {
        type: 'button',
        onClick: onClose,
        className: 'modal__close',
        'aria-label': 'Close game over dialog',
      }, ['×']),
      h('div', { className: 'modal__content' }, [
        h('div', {
          className: `modal__status ${hasWon ? 'modal__status--success' : 'modal__status--danger'}`,
        }, [hasWon ? 'You Won!' : 'Game Over']),
        h('p', { className: 'modal__lead' }, [
          hasWon
            ? `Congratulations! You completed the board in ${board.step} moves!`
            : 'You ran out of moves. The board was not completely flooded.',
        ]),
        hasWon
          ? h('div', { className: 'modal__score' }, [
              h('div', { className: 'modal__score-label' }, [
                'Efficiency Score',
              ]),
              h('div', { className: 'modal__score-value' }, [
                `${board.step > 0 ? Math.round((board.maxSteps / board.step) * 100) : 100}%`,
              ]),
              h('div', { className: 'modal__score-meta' }, [
                board.step > 0
                  ? `${board.step} moves used out of ${board.maxSteps}`
                  : 'Perfect game!',
              ]),
            ])
          : null,
        h('div', { className: 'modal__actions modal__actions--center' }, [
          h('button', {
            type: 'button',
            onClick: onClose,
            className: 'btn btn--neutral',
          }, ['Close']),
          h('button', {
            type: 'button',
            onClick: onNewGame,
            className: 'btn btn--primary',
          }, ['New Game']),
        ]),
      ]),
    ]),
  ]);
}

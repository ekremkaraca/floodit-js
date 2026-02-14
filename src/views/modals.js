import { h } from './dom.js';
import { X } from 'lucide';
import { renderIcon } from './icons.js';

let modalId = 0;

function createDialogIds(prefix) {
  modalId += 1;
  return {
    titleId: `${prefix}-title-${modalId}`,
    descriptionId: `${prefix}-description-${modalId}`,
  };
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function setupDialogKeyboard({ root, panel, onClose }) {
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusable = getFocusableElements(panel);
    if (focusable.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  requestAnimationFrame(() => {
    const focusable = getFocusableElements(panel);
    const target = focusable[0] || panel;
    target.focus();
  });
}

export function renderConfirmDialog({ isOpen, title, message, onClose, onConfirm }) {
  if (!isOpen) return null;

  const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const { titleId, descriptionId } = createDialogIds('confirm-dialog');
  const closeAndRestore = () => {
    onClose();
    if (previouslyFocused && previouslyFocused.isConnected) {
      requestAnimationFrame(() => previouslyFocused.focus());
    }
  };

  const root = h('div', { className: 'modal modal--confirm is-open' }, [
    h('div', {
      className: 'modal__backdrop is-open',
      onClick: closeAndRestore,
      'aria-hidden': 'true',
    }),
    h('div', {
      className: 'modal__panel modal__panel--confirm is-open',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': titleId,
      'aria-describedby': descriptionId,
      tabindex: '-1',
    }, [
      h('h3', { id: titleId, className: 'modal__title' }, [title]),
      h('p', { id: descriptionId, className: 'modal__message' }, [message]),
      h('div', { className: 'modal__actions modal__actions--right' }, [
        h('button', {
          type: 'button',
          onClick: closeAndRestore,
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

  const panel = root.querySelector('.modal__panel');
  if (panel) {
    setupDialogKeyboard({ root, panel, onClose: closeAndRestore });
  }

  return root;
}

export function renderGameOverModal({ isOpen, hasWon, board, onClose, onNewGame }) {
  if (!board) return null;

  const isMaze = board.mode === 'maze' || Boolean(board.goal);
  const stateClass = isOpen ? 'is-open' : 'is-closed';
  const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const { titleId, descriptionId } = createDialogIds('gameover-dialog');
  const closeAndRestore = () => {
    onClose();
    if (previouslyFocused && previouslyFocused.isConnected) {
      requestAnimationFrame(() => previouslyFocused.focus());
    }
  };

  const root = h('div', {
    className: `modal modal--gameover ${stateClass}`,
  }, [
    h('div', {
      className: `modal__backdrop ${stateClass}`,
      onClick: closeAndRestore,
      'aria-hidden': 'true',
    }),
    h('div', {
      className: `modal__panel modal__panel--gameover ${stateClass}`,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': titleId,
      'aria-describedby': descriptionId,
      tabindex: '-1',
    }, [
      h('button', {
        type: 'button',
        onClick: closeAndRestore,
        className: 'modal__close',
        'aria-label': 'Close game over dialog',
      }, [renderIcon(X, { className: 'ui-icon modal__close-icon' })]),
      h('div', { className: 'modal__content' }, [
        h('div', {
          id: titleId,
          className: `modal__status ${hasWon ? 'modal__status--success' : 'modal__status--danger'}`,
        }, [hasWon ? 'You Won!' : 'Game Over']),
        h('p', { id: descriptionId, className: 'modal__lead' }, [
          hasWon
            ? isMaze
              ? `Great run! You reached the maze goal in ${board.step} moves.`
              : `Congratulations! You completed the board in ${board.step} moves!`
            : isMaze
              ? 'You ran out of moves before reaching the maze goal.'
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
            onClick: closeAndRestore,
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

  if (isOpen) {
    const panel = root.querySelector('.modal__panel');
    if (panel) {
      setupDialogKeyboard({ root, panel, onClose: closeAndRestore });
    }
  }

  return root;
}

import { h } from './dom.js';
import { calculateMaxSteps } from '../engine/game.js';

export function renderCustomGameMode({ actions }) {
  const state = actions.store.getState();
  const settings = state.customSettings;

  const root = h('div', {
    className:
      'min-h-dvh bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-200',
  });

  const panel = h('div', {
    className:
      'bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full transition-colors duration-200',
  });

  function render() {
    panel.innerHTML = '';

    panel.appendChild(
      h('h2', {
        className:
          'text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100',
      }, ['Custom Game Mode']),
    );

    const boardSize = settings.boardSize;
    const customMoveLimit = settings.customMoveLimit;
    const moveLimit = settings.moveLimit;

    panel.appendChild(
      h('div', { className: 'space-y-6' }, [
        h('div', {}, [
          h('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, [
            `Board Size: ${boardSize}×${boardSize}`,
          ]),
          h('input', {
            type: 'range',
            min: '5',
            max: '25',
            value: String(boardSize),
            className:
              'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500',
            onInput: (e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) {
                settings.boardSize = Math.min(25, Math.max(5, n));
                render();
              }
            },
          }),
          h('div', { className: 'flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1' }, [
            h('span', {}, ['5×5']),
            h('span', {}, ['25×25']),
          ]),
        ]),

        h('div', {}, [
          h('div', { className: 'flex items-center justify-between mb-2' }, [
            h('label', { className: 'text-sm font-medium text-gray-700 dark:text-gray-300' }, [
              'Custom Move Limit',
            ]),
            h('button', {
              type: 'button',
              className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                customMoveLimit ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`,
              onClick: () => {
                settings.customMoveLimit = !settings.customMoveLimit;
                render();
              },
            }, [
              h('span', {
                className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  customMoveLimit ? 'translate-x-6' : 'translate-x-1'
                }`,
              }),
            ]),
          ]),

          customMoveLimit
            ? h('div', { className: 'mt-3' }, [
                h('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, [
                  `Move Limit: ${moveLimit}`,
                ]),
                h('input', {
                  type: 'range',
                  min: '5',
                  max: '100',
                  value: String(moveLimit),
                  className:
                    'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500',
                  onInput: (e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) {
                      settings.moveLimit = Math.min(100, Math.max(5, n));
                      render();
                    }
                  },
                }),
                h('div', { className: 'flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1' }, [
                  h('span', {}, ['5']),
                  h('span', {}, ['100']),
                ]),
              ])
            : null,
        ]),

        h('div', { className: 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4' }, [
          h('h3', { className: 'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2' }, [
            'Game Settings',
          ]),
          h('div', { className: 'space-y-1 text-sm text-gray-600 dark:text-gray-400' }, [
            h('div', {}, [`Board: ${boardSize}×${boardSize} (${boardSize * boardSize} cells)`]),
            h('div', {}, [
              `Move Limit: ${customMoveLimit ? moveLimit : 'Auto-calculated'}`,
              !customMoveLimit
                ? h('span', { className: 'text-xs text-gray-500 dark:text-gray-500 ml-1' }, [
                    `(≈${calculateMaxSteps({ rows: boardSize })} moves)`,
                  ])
                : null,
            ]),
          ]),
        ]),
      ]),
    );

    panel.appendChild(
      h('div', { className: 'flex gap-3 mt-8' }, [
        h('button', {
          type: 'button',
          className:
            'flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold shadow-md',
          onClick: () => actions.closeCustomMode(),
        }, ['Cancel']),
        h('button', {
          type: 'button',
          className:
            'flex-1 px-4 py-3 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-md',
          onClick: () => {
            actions.startCustomGame({
              boardSize: settings.boardSize,
              customMoveLimit: settings.customMoveLimit,
              moveLimit: settings.customMoveLimit ? settings.moveLimit : 0,
            });
          },
        }, ['Start Game']),
      ]),
    );
  }

  render();
  root.appendChild(panel);
  return root;
}

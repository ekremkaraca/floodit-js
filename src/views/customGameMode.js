import { h } from './dom.js';
import { calculateMaxSteps } from '../engine/game.js';

export function renderCustomGameMode({ actions }) {
  const state = actions.store.getState();
  const settings = state.customSettings;

  const root = h('div', {
    className: 'app-screen app-screen--centered',
  });

  const panel = h('div', {
    className: 'panel panel--custom',
  });

  function render() {
    panel.innerHTML = '';

    panel.appendChild(
      h('h2', {
        className: 'panel__title panel__title--md',
      }, ['Custom Game Mode']),
    );

    const boardSize = settings.boardSize;
    const customMoveLimit = settings.customMoveLimit;
    const moveLimit = settings.moveLimit;

    panel.appendChild(
      h('div', { className: 'custom-form' }, [
        h('div', {}, [
          h('label', { className: 'form-label' }, [
            `Board Size: ${boardSize}×${boardSize}`,
          ]),
          h('input', {
            type: 'range',
            min: '5',
            max: '25',
            value: String(boardSize),
            className: 'range-slider',
            onChange: (e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) {
                settings.boardSize = Math.min(25, Math.max(5, n));
                render();
              }
            },
          }),
          h('div', { className: 'range-labels' }, [
            h('span', {}, ['5×5']),
            h('span', {}, ['25×25']),
          ]),
        ]),

        h('div', {}, [
          h('div', { className: 'form-row' }, [
            h('label', { className: 'form-label form-label--compact' }, [
              'Custom Move Limit',
            ]),
            h('button', {
              type: 'button',
              className: `switch ${customMoveLimit ? 'switch--on' : ''}`,
              'aria-label': 'Toggle custom move limit',
              'aria-pressed': customMoveLimit ? 'true' : 'false',
              onClick: () => {
                settings.customMoveLimit = !settings.customMoveLimit;
                render();
              },
            }, [
              h('span', {
                className: `switch__thumb ${customMoveLimit ? 'switch__thumb--on' : ''}`,
              }),
            ]),
          ]),

          customMoveLimit
            ? h('div', { className: 'custom-form__nested' }, [
                h('label', { className: 'form-label' }, [
                  `Move Limit: ${moveLimit}`,
                ]),
                h('input', {
                  type: 'range',
                  min: '5',
                  max: '100',
                  value: String(moveLimit),
                  className: 'range-slider',
                  onChange: (e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) {
                      settings.moveLimit = Math.min(100, Math.max(5, n));
                      render();
                    }
                  },
                }),
                h('div', { className: 'range-labels' }, [
                  h('span', {}, ['5']),
                  h('span', {}, ['100']),
                ]),
              ])
            : null,
        ]),

        h('div', { className: 'settings-card' }, [
          h('h3', { className: 'settings-card__title' }, [
            'Game Settings',
          ]),
          h('div', { className: 'settings-card__body' }, [
            h('div', {}, [`Board: ${boardSize}×${boardSize} (${boardSize * boardSize} cells)`]),
            h('div', {}, [
              `Move Limit: ${customMoveLimit ? moveLimit : 'Auto-calculated'}`,
              !customMoveLimit
                ? h('span', { className: 'settings-card__note' }, [
                    `(≈${calculateMaxSteps({ rows: boardSize })} moves)`,
                  ])
                : null,
            ]),
          ]),
        ]),
      ]),
    );

    panel.appendChild(
      h('div', { className: 'action-row action-row--split' }, [
        h('button', {
          type: 'button',
          className: 'btn btn--neutral btn--block',
          onClick: () => actions.closeCustomMode(),
        }, ['Cancel']),
        h('button', {
          type: 'button',
          className: 'btn btn--primary btn--block',
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

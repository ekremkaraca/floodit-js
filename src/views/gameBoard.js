import { h } from './dom.js';
import { DEFAULT_COLORS } from '../engine/game.js';

const COLOR_HEX = Object.fromEntries(
  DEFAULT_COLORS.map((color) => [color.name, color.hex]),
);

export function renderGameBoard({ board }) {
  const wrapper = h('div', {
    className: 'board-wrap',
  });

  const isDesktop = window.innerWidth >= 1024;
  const viewportWidth = window.innerWidth * 0.9;
  const viewportHeight = window.innerHeight * (isDesktop ? 0.65 : 0.9);
  const maxWidth = Math.min(viewportWidth, 900);
  const maxHeight = Math.min(viewportHeight, 900);
  const aspect = board.columns / board.rows;

  let width = maxWidth;
  let height = width / aspect;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }

  const sizeStyle = {
    width: `${Math.max(0, Math.floor(width))}px`,
    height: `${Math.max(0, Math.floor(height))}px`,
    gridTemplateColumns: `repeat(${board.columns}, 1fr)`,
    gridTemplateRows: `repeat(${board.rows}, 1fr)`,
  };

  const grid = h('div', {
    className: 'board-grid',
    style: sizeStyle,
  });

  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.columns; c++) {
      const color = board.matrix[r][c];
      grid.appendChild(
        h('div', {
          className: 'board-cell',
          style: {
            backgroundColor: COLOR_HEX[color] || '#9ca3af',
          },
        }),
      );
    }
  }

  wrapper.appendChild(grid);
  return wrapper;
}

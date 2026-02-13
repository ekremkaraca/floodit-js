import { h } from './dom.js';
import { DEFAULT_COLORS } from '../engine/game.js';

const COLOR_HEX = Object.fromEntries(
  DEFAULT_COLORS.map((color) => [color.name, color.hex]),
);
const BOARD_SIZE_CACHE = new Map();

export function renderGameBoard({ board }) {
  const wrapper = h('div', {
    className: 'board-wrap',
  });
  const cacheKey = `${board.rows}x${board.columns}`;

  function getGridSize(availableWidth) {
    const viewportWidth = document.documentElement.clientWidth * 0.9;
    const isDesktop = document.documentElement.clientWidth >= 1024;
    const viewportHeight = document.documentElement.clientHeight * (isDesktop ? 0.65 : 0.9);

    const maxWidth = Math.min(availableWidth > 0 ? availableWidth : viewportWidth, viewportWidth, 900);
    const maxHeight = Math.min(viewportHeight, 900);
    const aspect = board.columns / board.rows;

    let width = maxWidth;
    let height = width / aspect;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspect;
    }

    return {
      width: Math.max(0, Math.floor(width)),
      height: Math.max(0, Math.floor(height)),
    };
  }

  const initialSize = BOARD_SIZE_CACHE.get(cacheKey) || getGridSize(0);
  const grid = h('div', {
    className: 'board-grid',
    'data-rows': String(board.rows),
    'data-columns': String(board.columns),
    style: {
      width: `${initialSize.width}px`,
      height: `${initialSize.height}px`,
      gridTemplateColumns: `repeat(${board.columns}, 1fr)`,
      gridTemplateRows: `repeat(${board.rows}, 1fr)`,
    },
  });

  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.columns; c++) {
      const color = board.matrix[r][c];
      grid.appendChild(
        h('div', {
          className: 'board-cell',
          'data-color': color,
          style: {
            backgroundColor: COLOR_HEX[color] || '#9ca3af',
          },
        }),
      );
    }
  }

  let rafId = 0;
  function updateLayout() {
    if (!wrapper.isConnected) return;

    const rect = wrapper.getBoundingClientRect();
    const next = getGridSize(rect.width);
    BOARD_SIZE_CACHE.set(cacheKey, next);
    grid.style.width = `${next.width}px`;
    grid.style.height = `${next.height}px`;
  }

  function scheduleLayout() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      updateLayout();
    });
  }

  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(() => {
      scheduleLayout();
    });
    observer.observe(wrapper);
  }
  scheduleLayout();

  wrapper.appendChild(grid);
  return wrapper;
}

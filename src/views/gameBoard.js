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
  const stack = h('div', { className: 'board-wrap__stack' });
  const cacheKey = `${board.rows}x${board.columns}`;

  function getGridSize(availableWidth, availableHeight) {
    const viewport = document.documentElement;
    const viewportWidthPx = viewport.clientWidth;
    const viewportHeightPx = viewport.clientHeight;
    const isDesktop = viewportWidthPx >= 1024;
    const isMobile = viewportWidthPx > 0 && viewportWidthPx < 640;
    const isTinyMobile = isMobile && viewportHeightPx > 0 && viewportHeightPx <= 760;
    const isUltraFitDesktop = isDesktop && viewportHeightPx > 0 && viewportHeightPx <= 860;
    const viewportWidth = (viewportWidthPx || 1000) * 0.9;
    const viewportHeight = (viewportHeightPx || 1000) * (
      isUltraFitDesktop ? 0.56 : isDesktop ? 0.62 : isTinyMobile ? 0.44 : isMobile ? 0.47 : 0.72
    );

    const maxWidth = Math.min(availableWidth > 0 ? availableWidth : viewportWidth, viewportWidth, 900);
    const maxHeight = Math.min(availableHeight > 0 ? availableHeight : viewportHeight, viewportHeight, 900);
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

  const initialSize = BOARD_SIZE_CACHE.get(cacheKey) || getGridSize(0, 0);
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
      const isWall = Boolean(board.walls?.[r]?.[c]);
      const isGoal = board.goal?.row === r && board.goal?.column === c;
      const isStart = r === 0 && c === 0;
      const cellClasses = ['board-cell'];
      if (isWall) cellClasses.push('board-cell--wall');
      if (isStart) cellClasses.push('board-cell--start');
      if (isGoal) cellClasses.push('board-cell--goal');
      grid.appendChild(
        h('div', {
          className: cellClasses.join(' '),
          'data-color': color,
          'data-wall': isWall ? 'true' : 'false',
          'data-start': isStart ? 'true' : 'false',
          'data-goal': isGoal ? 'true' : 'false',
          title: isStart ? 'Start' : (isGoal ? 'Goal' : undefined),
          style: {
            backgroundColor: isWall ? '#1f2937' : (COLOR_HEX[color] || '#9ca3af'),
          },
        }),
      );
    }
  }

  let rafId = 0;
  function updateLayout() {
    if (!wrapper.isConnected) return;

    const rect = wrapper.getBoundingClientRect();
    const next = getGridSize(rect.width, rect.height);
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

  stack.appendChild(grid);
  stack.appendChild(
    h('div', { className: 'board-legend', 'aria-label': 'Board markers legend' }, [
      h('div', { className: 'board-legend__markers' }, [
        h('span', { className: 'board-legend__item' }, [
          h('span', { className: 'board-legend__marker', 'aria-hidden': 'true' }, ['S']),
          'Start',
        ]),
        board.mode === 'maze'
          ? h('span', { className: 'board-legend__item' }, [
              h('span', { className: 'board-legend__marker', 'aria-hidden': 'true' }, ['G']),
              'Goal',
            ])
          : null,
      ]),
      h('div', { className: 'board-legend__target' }, [
        board.mode === 'maze'
          ? 'Target: reach the goal tile before moves run out.'
          : 'Target: flood the entire board before moves run out.',
      ]),
    ]),
  );
  wrapper.appendChild(stack);
  return wrapper;
}

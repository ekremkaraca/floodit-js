import { h } from './dom.js';

export function renderColorKeyboard({ colors, selectedColor, disabled, onColorSelect, board }) {
  const boardSize = board ? board.rows * board.columns : 0;

  const paddingClass =
    boardSize <= 36
      ? 'keyboard-wrap--large'
      : boardSize <= 100
        ? 'keyboard-wrap--medium'
        : 'keyboard-wrap--small';

  const container = h('div', { className: `keyboard-wrap ${paddingClass}` });
  const [maxSize, minSize] =
    boardSize <= 36
      ? [88, 48]
      : boardSize <= 100
        ? [72, 42]
        : boardSize <= 196
          ? [64, 38]
          : [56, 32];

  function getLayout(containerWidth) {
    const keyboardWidth = Math.max(320, Math.min(containerWidth * 0.92, 540));
    const columns = keyboardWidth < 420 ? 3 : Math.min(colors.length, 6);
    const gap = boardSize > 0 && boardSize <= 100 ? 10 : 8;
    const totalGap = gap * (columns - 1);
    const sizeFromWidth = Math.floor((keyboardWidth - totalGap) / columns);
    const size = Math.max(minSize, Math.min(maxSize, sizeFromWidth));
    const maxRowWidth = columns * size + totalGap;
    return { gap, size, maxRowWidth };
  }

  const initialLayout = getLayout(document.documentElement.clientWidth || 360);
  const grid = h('div', {
    className: 'keyboard-grid',
    style: {
      gap: `${initialLayout.gap}px`,
      maxWidth: `${initialLayout.maxRowWidth}px`,
    },
  });

  const keys = [];

  for (const color of colors) {
    const isSelected = selectedColor === color.name;

    const key = h('button', {
      type: 'button',
      title: color.name,
      'aria-label': `Select ${color.name} color`,
      disabled,
      className: [
        'color-key',
        isSelected ? 'is-selected' : '',
        disabled ? 'is-disabled' : '',
      ].join(' '),
      style: {
        width: `${initialLayout.size}px`,
        height: `${initialLayout.size}px`,
        backgroundColor: color.hex || '#9ca3af',
      },
      onClick: () => onColorSelect(color.name),
    });
    keys.push(key);
    grid.appendChild(key);
  }

  let rafId = 0;
  function updateLayout() {
    if (!container.isConnected) return;

    const containerWidth = container.getBoundingClientRect().width || document.documentElement.clientWidth;
    const layout = getLayout(containerWidth);
    grid.style.gap = `${layout.gap}px`;
    grid.style.maxWidth = `${layout.maxRowWidth}px`;

    for (const key of keys) {
      key.style.width = `${layout.size}px`;
      key.style.height = `${layout.size}px`;
    }
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
    observer.observe(container);
  }
  scheduleLayout();

  container.appendChild(grid);
  return container;
}

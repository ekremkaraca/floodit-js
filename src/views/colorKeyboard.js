import { h } from './dom.js';

export function renderColorKeyboard({ colors, selectedColor, disabled, onColorSelect, board }) {
  const boardSize = board ? board.rows * board.columns : 0;

  const paddingClass =
    boardSize <= 36
      ? 'keyboard-wrap--large'
      : boardSize <= 100
        ? 'keyboard-wrap--medium'
        : 'keyboard-wrap--small';

  const keyboardWidth = Math.max(320, Math.min(window.innerWidth * 0.92, 540));
  const columns = keyboardWidth < 420 ? 3 : Math.min(colors.length, 6);
  const gap = boardSize > 0 && boardSize <= 100 ? 10 : 8;
  const totalGap = gap * (columns - 1);

  const container = h('div', { className: `keyboard-wrap ${paddingClass}` });
  const grid = h('div', {
    className: 'keyboard-grid',
    style: {
      gap: `${gap}px`,
      maxWidth: `${columns * 88 + totalGap}px`,
    },
  });

  let maxSize = 64;
  let minSize = 36;
  if (boardSize <= 36) {
    maxSize = 88;
    minSize = 48;
  } else if (boardSize <= 100) {
    maxSize = 72;
    minSize = 42;
  } else if (boardSize <= 196) {
    maxSize = 64;
    minSize = 38;
  } else {
    maxSize = 56;
    minSize = 32;
  }

  const sizeFromWidth = Math.floor((keyboardWidth - totalGap) / columns);
  const size = Math.max(minSize, Math.min(maxSize, sizeFromWidth));

  for (const color of colors) {
    const isSelected = selectedColor === color.name;

    grid.appendChild(
      h('button', {
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
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color.hex || '#9ca3af',
        },
        onClick: () => onColorSelect(color.name),
      }),
    );
  }

  container.appendChild(grid);
  return container;
}

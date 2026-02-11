module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'game-blue': 'var(--color-game-blue)',
        'game-green': 'var(--color-game-green)',
        'game-yellow': 'var(--color-game-yellow)',
        'game-orange': 'var(--color-game-orange)',
        'game-red': 'var(--color-game-red)',
        'game-purple': 'var(--color-game-purple)',
      },
    },
  },
  safelist: [
    // add dynamic class patterns here if you generate classes at runtime
    // { pattern: /^bg-(red|green|blue)-\d{3}$/ }
  ],
  plugins: [],
};
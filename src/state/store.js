/**
 * Minimal pub/sub store used by the app.
 * State is replaced immutably by callers via `setState` or `update`.
 * @template T
 * @param {T} initialState
 */
export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  function emit() {
    for (const listener of listeners) {
      listener(state);
    }
  }

  return {
    /** @returns {T} */
    getState() {
      return state;
    },
    /** @param {T} next */
    setState(next) {
      state = next;
      emit();
    },
    /** @param {(state: T) => T} fn */
    update(fn) {
      state = fn(state);
      emit();
    },
    /** @param {(state: T) => void} listener */
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

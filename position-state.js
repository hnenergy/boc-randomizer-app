(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpinOrderPositions = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function revealPositions(count, direction) {
    const total = Number.isInteger(count) && count > 0 ? count : 0;
    const positions = Array.from({length: total}, (_, index) => index + 1);
    return direction === 'first' ? positions : positions.reverse();
  }

  function create(count, direction) {
    const order = revealPositions(count, direction);
    return {count: order.length, direction: direction === 'first' ? 'first' : 'last', order, remaining: [...order], completed: [], activePosition: order[0] || null, phase: order.length ? 'idle' : 'complete'};
  }

  function restore(count, direction, assignedPositions) {
    const state = create(count, direction), assigned = new Set((Array.isArray(assignedPositions) ? assignedPositions : []).map(Number));
    state.completed = state.order.filter(position => assigned.has(position));
    state.remaining = state.order.filter(position => !assigned.has(position));
    state.activePosition = state.completed.at(-1) || state.order[0] || null;
    state.phase = state.remaining.length ? 'idle' : 'complete';
    return state;
  }

  function beginSpin(state) {
    if (!state || state.phase !== 'idle' || !state.remaining.length) return {accepted: false, state};
    return {accepted: true, state: {...state, activePosition: state.remaining[0], phase: 'spinning'}};
  }

  function completeSpin(state) {
    if (!state || state.phase !== 'spinning' || state.activePosition !== state.remaining[0]) return {accepted: false, state};
    const remaining = state.remaining.slice(1), completed = [...state.completed, state.activePosition];
    return {accepted: true, position: state.activePosition, state: {...state, remaining, completed, phase: remaining.length ? 'idle' : 'complete'}};
  }

  function displayed(state) {
    return state && Number.isInteger(state.activePosition) && state.activePosition >= 1 && state.activePosition <= state.count ? state.activePosition : null;
  }

  function next(state) {
    return state && state.phase === 'idle' && state.remaining.length ? state.remaining[0] : null;
  }

  return {revealPositions, create, restore, beginSpin, completeSpin, displayed, next};
});

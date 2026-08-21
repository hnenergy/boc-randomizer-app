(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpinOrderAutomation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function create(options = {}) {
    const scheduler = options.scheduler || globalThis;
    const onStateChange = typeof options.onStateChange === 'function' ? options.onStateChange : function () {};
    const onCountdown = typeof options.onCountdown === 'function' ? options.onCountdown : function () {};
    const onSpinRequested = typeof options.onSpinRequested === 'function' ? options.onSpinRequested : function () {};
    let state = 'idle', countdown = null, countdownIntervalId = null, countdownTimeoutId = null, generation = 0;

    function snapshot() { return {state, countdown, countdownIntervalId, countdownTimeoutId, generation}; }
    function notify() { onStateChange(snapshot()); }
    function clearCountdownTimers() {
      if (countdownIntervalId !== null) scheduler.clearInterval(countdownIntervalId);
      if (countdownTimeoutId !== null) scheduler.clearTimeout(countdownTimeoutId);
      countdownIntervalId = null; countdownTimeoutId = null; countdown = null;
    }
    function setState(next) { state = next; notify(); }
    function requestSpin() { setState('spinning'); onSpinRequested(); }
    function startCountdown() {
      clearCountdownTimers(); const token = ++generation; countdown = 3; setState('countdown'); onCountdown(3);
      countdownIntervalId = scheduler.setInterval(function () {
        if (token !== generation || state !== 'countdown') return;
        countdown -= 1;
        if (countdown > 0) { onCountdown(countdown); notify(); }
      }, 1000);
      countdownTimeoutId = scheduler.setTimeout(function () {
        if (token !== generation || state !== 'countdown') return;
        clearCountdownTimers(); requestSpin();
      }, 3000);
    }
    function start(hasRemaining = true) {
      if (!hasRemaining || !['idle','stopped'].includes(state)) return false;
      clearCountdownTimers(); generation += 1; requestSpin(); return true;
    }
    function spinCompleted(hasRemaining) {
      if (!hasRemaining) { clearCountdownTimers(); generation += 1; setState('complete'); return; }
      if (state === 'paused' || state === 'stopped') { notify(); return; }
      if (state === 'spinning') startCountdown();
    }
    function pause() {
      if (!['spinning','countdown'].includes(state)) return false;
      if (state === 'countdown') { clearCountdownTimers(); generation += 1; }
      setState('paused'); return true;
    }
    function resume(hasRemaining = true) {
      if (state !== 'paused' || !hasRemaining) return false;
      startCountdown(); return true;
    }
    function stop() {
      if (!['spinning','countdown','paused'].includes(state)) return false;
      if (state === 'countdown') { clearCountdownTimers(); generation += 1; }
      setState('stopped'); return true;
    }
    function reset(hasRemaining = true) {
      clearCountdownTimers(); generation += 1; setState(hasRemaining ? 'idle' : 'complete');
    }
    function restore(hasRemaining = true, hasProgress = false) {
      clearCountdownTimers(); generation += 1; setState(hasRemaining ? (hasProgress ? 'stopped' : 'idle') : 'complete');
    }

    return {snapshot,start,spinCompleted,pause,resume,stop,reset,restore,clearCountdownTimers};
  }

  return {create};
});

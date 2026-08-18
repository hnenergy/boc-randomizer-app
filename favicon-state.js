(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpinOrderFavicons = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_ACTIVITY = 'Football';
  const ACTIVITY_FAVICONS = Object.freeze({
    Football: 'assets/icons/football.svg',
    Baseball: 'assets/icons/baseball.svg',
    Golf: 'assets/icons/golf.svg',
    Basketball: 'assets/icons/basketball.svg',
    Generic: 'assets/icons/generic.svg'
  });

  function normalizeActivity(activity) {
    return Object.hasOwn(ACTIVITY_FAVICONS, activity) ? activity : DEFAULT_ACTIVITY;
  }

  function update(documentObject, activity) {
    const selected = normalizeActivity(activity);
    let link = documentObject.getElementById('browserFavicon');
    if (!link) {
      link = documentObject.createElement('link');
      link.id = 'browserFavicon';
      link.rel = 'icon';
      documentObject.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = ACTIVITY_FAVICONS[selected];
    return selected;
  }

  return {DEFAULT_ACTIVITY, ACTIVITY_FAVICONS, normalizeActivity, update};
});

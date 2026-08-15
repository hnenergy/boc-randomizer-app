(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpinOrderSetup = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'spinorder-setup-v2';
  const LEGACY_STORAGE_KEY = 'spinorder-setup-v1';
  const VERSION = 2;
  const ACTIVITIES = Object.freeze({
    Football: '🏈',
    Baseball: '⚾',
    Golf: '⛳',
    Basketball: '🏀',
    Generic: '🔄'
  });
  const LABELS = Object.freeze(['Draft Order', 'Random Order', 'Drawing Order', 'Custom']);
  const DEFAULT_VALUES = Object.freeze({eventName: '', activity: 'Football', activityLabel: 'Random Order', customLabel: '', spinMode: 'manual', revealOrder: 'last'});

  function cleanText(value, maximum) {
    return typeof value === 'string' ? value.trim().slice(0, maximum) : '';
  }

  function normalize(values) {
    const source = values && typeof values === 'object' ? values : {};
    return {
      eventName: cleanText(source.eventName, 80),
      activity: Object.hasOwn(ACTIVITIES, source.activity) ? source.activity : DEFAULT_VALUES.activity,
      activityLabel: LABELS.includes(source.activityLabel) ? source.activityLabel : DEFAULT_VALUES.activityLabel,
      customLabel: cleanText(source.customLabel, 30),
      spinMode: 'manual',
      revealOrder: source.revealOrder === 'first' ? 'first' : 'last'
    };
  }

  function validate(values) {
    const normalized = normalize(values);
    const errors = {};
    if (!normalized.eventName) errors.eventName = 'Enter an event name.';
    if (!values || !Object.hasOwn(ACTIVITIES, values.activity)) errors.activity = 'Choose an activity.';
    if (!values || !LABELS.includes(values.activityLabel)) errors.activityLabel = 'Choose what you are randomizing.';
    if (!values || !['first','last'].includes(values.revealOrder)) errors.revealOrder = 'Choose a reveal order.';
    if (normalized.activityLabel === 'Custom' && !normalized.customLabel) errors.customLabel = 'Enter a custom activity label.';
    return {values: normalized, errors, valid: Object.keys(errors).length === 0};
  }

  function displayLabel(values) {
    const normalized = normalize(values);
    return normalized.activityLabel === 'Custom' ? normalized.customLabel || 'Random Order' : normalized.activityLabel;
  }

  function save(storage, values) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify({version: VERSION, values: normalize(values)}));
      return true;
    } catch (_) {
      return false;
    }
  }

  function load(storage) {
    try {
      const current=JSON.parse(storage.getItem(STORAGE_KEY));
      if(current&&current.version===VERSION&&current.values&&typeof current.values==='object')return normalize(current.values);
      const legacy=JSON.parse(storage.getItem(LEGACY_STORAGE_KEY));
      return legacy&&legacy.values&&typeof legacy.values==='object'?normalize(legacy.values):{...DEFAULT_VALUES};
    } catch (_) {
      return {...DEFAULT_VALUES};
    }
  }

  return {STORAGE_KEY,LEGACY_STORAGE_KEY,VERSION,ACTIVITIES,LABELS,DEFAULT_VALUES,normalize,validate,displayLabel,save,load};
});

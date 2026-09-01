(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpinOrderSetup = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'spinorder-setup-v4';
  const LEGACY_STORAGE_KEY = 'spinorder-setup-v3';
  const OLDEST_STORAGE_KEY = 'spinorder-setup-v2';
  const VERSION = 4;
  const ACTIVITIES = Object.freeze({
    Football: '🏈',
    Baseball: '⚾',
    Golf: '⛳',
    Basketball: '🏀',
    Generic: '🔄'
  });
  const LABELS = Object.freeze(['Draft Order', 'Random Order', 'Drawing Order', 'Team Assignment', 'Custom']);
  const DEFAULT_VALUES = Object.freeze({eventName: '', activity: 'Football', activityLabel: 'Random Order', customLabel: '', teamCount: 2, spinMode: 'manual', revealOrder: 'last'});
  const PRESETS = Object.freeze({
    'football-draft': Object.freeze({...DEFAULT_VALUES, activity: 'Football', activityLabel: 'Draft Order'}),
    'team-generator': Object.freeze({...DEFAULT_VALUES, activity: 'Generic', activityLabel: 'Team Assignment', teamCount: 2})
  });

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
      teamCount: Number.isInteger(Number(source.teamCount)) ? Number(source.teamCount) : DEFAULT_VALUES.teamCount,
      spinMode: source.spinMode === 'auto' ? 'auto' : 'manual',
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
    if (!values || !['manual','auto'].includes(values.spinMode)) errors.spinMode = 'Choose a spin mode.';
    if (normalized.activityLabel === 'Custom' && !normalized.customLabel) errors.customLabel = 'Enter a custom activity label.';
    if (normalized.activityLabel === 'Team Assignment' && (normalized.teamCount < 2 || normalized.teamCount > 10)) errors.teamCount = 'Choose between 2 and 10 teams.';
    return {values: normalized, errors, valid: Object.keys(errors).length === 0};
  }

  function displayLabel(values) {
    const normalized = normalize(values);
    return normalized.activityLabel === 'Custom' ? normalized.customLabel || 'Random Order' : normalized.activityLabel;
  }

  function presetFromSearch(search) {
    try {
      const key = new URLSearchParams(typeof search === 'string' ? search : '').get('preset');
      return key && Object.hasOwn(PRESETS, key) ? key : null;
    } catch (_) {
      return null;
    }
  }

  function valuesForPreset(key) {
    return typeof key === 'string' && Object.hasOwn(PRESETS, key) ? {...PRESETS[key]} : null;
  }

  function applyPreset(storage, search) {
    const key = presetFromSearch(search);
    const values = valuesForPreset(key);
    return key && values && save(storage, values) ? {key, values} : null;
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
      if(legacy&&legacy.values&&typeof legacy.values==='object')return normalize(legacy.values);
      const oldest=JSON.parse(storage.getItem(OLDEST_STORAGE_KEY));
      return oldest&&oldest.values&&typeof oldest.values==='object'?normalize(oldest.values):{...DEFAULT_VALUES};
    } catch (_) {
      return {...DEFAULT_VALUES};
    }
  }

  return {STORAGE_KEY,LEGACY_STORAGE_KEY,OLDEST_STORAGE_KEY,VERSION,ACTIVITIES,LABELS,DEFAULT_VALUES,PRESETS,normalize,validate,displayLabel,presetFromSearch,valuesForPreset,applyPreset,save,load};
});

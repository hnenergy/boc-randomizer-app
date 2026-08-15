'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const setup = require('../setup-state.js');

test('event name is required and surrounding whitespace is trimmed', () => {
  assert.equal(setup.validate({...setup.DEFAULT_VALUES, eventName: '   '}).errors.eventName, 'Enter an event name.');
  assert.equal(setup.validate({...setup.DEFAULT_VALUES, eventName: '  Friday Golf Groups  '}).values.eventName, 'Friday Golf Groups');
});

test('activity selection accepts only supported activities', () => {
  assert.equal(setup.validate({...setup.DEFAULT_VALUES, eventName: 'League', activity: 'Golf'}).values.activity, 'Golf');
  assert.equal(setup.validate({...setup.DEFAULT_VALUES, eventName: 'League', activity: 'Casino'}).valid, false);
});

test('predefined and custom activity labels validate correctly', () => {
  assert.deepEqual(setup.LABELS, ['Draft Order', 'Random Order', 'Drawing Order', 'Custom']);
  assert.equal(setup.DEFAULT_VALUES.activityLabel, 'Random Order');
  assert.equal(setup.displayLabel({...setup.DEFAULT_VALUES, activityLabel: 'Draft Order'}), 'Draft Order');
  const missing = setup.validate({...setup.DEFAULT_VALUES, eventName: 'Drawing', activityLabel: 'Custom', customLabel: '  '});
  assert.equal(missing.errors.customLabel, 'Enter a custom activity label.');
  const custom = setup.validate({...setup.DEFAULT_VALUES, eventName: 'Drawing', activityLabel: 'Custom', customLabel: '  Tee Time  '});
  assert.equal(custom.valid, true);
  assert.equal(setup.displayLabel(custom.values), 'Tee Time');
});

test('reveal order defaults to last position first and validates both directions', () => {
  assert.equal(setup.DEFAULT_VALUES.revealOrder, 'last');
  assert.equal(setup.validate({...setup.DEFAULT_VALUES, eventName: 'Event', revealOrder: 'first'}).valid, true);
  assert.equal(setup.validate({...setup.DEFAULT_VALUES, eventName: 'Event', revealOrder: 'last'}).valid, true);
  assert.equal(setup.validate({...setup.DEFAULT_VALUES, eventName: 'Event', revealOrder: 'sideways'}).valid, false);
});

test('Auto spin cannot be selected in normalized or submitted setup state', () => {
  assert.equal(setup.normalize({...setup.DEFAULT_VALUES, spinMode: 'auto'}).spinMode, 'manual');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /value="auto"[^>]*disabled/);
  assert.match(html, /Coming soon/);
});

test('valid setup restores from versioned session storage and malformed data is ignored', () => {
  const data = new Map();
  const storage = {setItem: (key, value) => data.set(key, value), getItem: key => data.get(key) ?? null};
  const values = {eventName: 'Friday Golf', activity: 'Golf', activityLabel: 'Drawing Order', customLabel: '', spinMode: 'manual', revealOrder: 'first'};
  assert.equal(setup.save(storage, values), true);
  assert.deepEqual(setup.load(storage), values);
  data.set(setup.STORAGE_KEY, '{bad json');
  assert.deepEqual(setup.load(storage), setup.DEFAULT_VALUES);
  const unavailable = {setItem: () => { throw new Error('blocked'); }, getItem: () => { throw new Error('blocked'); }};
  assert.equal(setup.save(unavailable, values), false);
  assert.deepEqual(setup.load(unavailable), setup.DEFAULT_VALUES);
});

test('landing, setup, and randomizer navigation and applied configuration are wired', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /id="landingView"/);
  assert.match(html, /id="setupView"[^>]*hidden/);
  assert.match(html, /id="randomizerView"[^>]*hidden/);
  assert.match(html, /history\.pushState\(\{spinorderView:'setup'/);
  assert.match(html, /history\.pushState\(\{spinorderView:'randomizer'/);
  assert.match(html, /function applySetupToRandomizer/);
  assert.match(html, /eventIcon\.textContent/);
  assert.match(html, /randomizerTitle\.textContent=eventName/);
  assert.match(html, /reset\.textContent=`↻ Reset \$\{label\}`/);
  assert.equal((html.match(/type="radio" name="activityLabel"/g) || []).length, 4);
});

test('setup Back routes directly to the landing page regardless of prior history', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /function backFromSetup\(\)\{\s*history\.replaceState\(\{spinorderView:'landing'\},'',location\.pathname\+location\.search\);showView\('landing',true\)\s*\}/);
});

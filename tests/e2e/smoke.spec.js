const { test, expect } = require('@playwright/test');

const useCases = [
  ['Fantasy football', '/fantasy-football-draft-order-randomizer/', 'Free Fantasy Football Draft Order Randomizer', '/?preset=football-draft#setup'],
  ['Golf groups', '/golf-group-randomizer/', 'Free Golf Group Randomizer', '/?preset=golf-groups'],
  ['Team assignments', '/random-team-generator/', 'Free Random Team Generator', '/?preset=team-generator'],
  ['Classroom order', '/classroom-name-picker/', 'Free Classroom Name Picker', '/?preset=classroom-picker'],
  ['Generic drawings', '/random-drawing-order-generator/', 'Free Random Drawing Order Generator', '/?preset=drawing-order']
];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.afterEach(async ({ page }) => {
  await page.close();
});

async function openConfiguredNames(page, { preset, eventName = 'Browser Smoke Test', spinMode, teamCount } = {}) {
  await page.goto(preset ? `/?preset=${preset}` : '/');
  if (!preset) await page.getByRole('button', { name: 'Create Randomizer' }).click();
  await expect(page).toHaveURL(/#setup$/);
  if (!preset) await expect(page.locator('#setupTitle')).toBeFocused();
  await page.getByLabel('Event name').fill(eventName);
  if (spinMode) await page.getByRole('radio', { name: new RegExp(`^${spinMode}`, 'i') }).check();
  if (teamCount) await page.getByLabel(/Number of (teams|groups)/).fill(String(teamCount));
  await page.getByRole('button', { name: 'Continue to Names' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /names/i })).toBeVisible();
  await expect(page.locator('#participantsTitle')).toBeFocused();
}

async function addNames(page, names, classroom = false) {
  await expect(page.locator('#participantsTitle')).toBeFocused();
  const input = page.getByRole('textbox', { name: classroom ? 'Student name' : 'Participant name', exact: true });
  const addButton = page.getByRole('button', { name: classroom ? 'Add student' : 'Add participant' });
  for (const [index, name] of names.entries()) {
    const expectedCount = index + 1;
    await input.focus();
    await input.fill(name);
    await expect(input).toHaveValue(name);
    await addButton.click();
    await expect(page.locator('#participantList li')).toHaveCount(expectedCount);
  }
}

async function createWheel(page, classroom = false) {
  await page.getByRole('button', { name: classroom ? 'Create Name Picker' : 'Create Randomizer' }).click();
  await expect(page).toHaveURL(/#randomizer$/);
}

async function completeManual(page, participantCount) {
  const spin = page.locator('#spin');
  for (let index = 0; index < participantCount - 1; index += 1) {
    await expect(spin).toBeEnabled({ timeout: 12_000 });
    await spin.click();
  }
  await expect(page.locator('#status')).toContainText(/Order Set|All students selected|Teams Set|Groups Set/i, { timeout: 12_000 });
}

async function resultNames(page) {
  return page.locator('#results .team').allTextContents();
}

test('homepage boots cleanly and its five use-case chips are real links', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#landingView h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1, name: 'Make the order. Make it fair.' })).toBeVisible();
  for (const [label, href] of useCases) await expect(page.getByRole('link', { name: label })).toHaveAttribute('href', href);
  await page.getByRole('button', { name: 'Create Randomizer' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Set up your randomizer' })).toBeVisible();
  await expect(page.getByLabel('Event name')).toHaveValue('');
  await expect(page.getByRole('radio', { name: /^Football/ })).toBeChecked();
  await expect(page.getByRole('radio', { name: /^Random Order/ })).toBeChecked();
  expect(errors).toEqual([]);
});

test('public landing and information routes, robots, and sitemap load', async ({ page, request }) => {
  for (const [, route, heading, cta] of useCases) {
    const response = await page.goto(route);
    expect(response && response.ok()).toBeTruthy();
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.locator(`a[href="${cta}"]`).first()).toBeVisible();
  }
  for (const [route, heading] of [['/about/', 'A simple way to set a fair order'], ['/privacy/', 'Privacy'], ['/contact/', 'How can we help?']]) {
    const response = await page.goto(route);
    expect(response && response.ok()).toBeTruthy();
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }
  expect((await request.get('/robots.txt')).ok()).toBeTruthy();
  expect((await request.get('/sitemap.xml')).ok()).toBeTruthy();
});

test('allowlisted presets apply configuration and remove the query string', async ({ page }) => {
  const cases = [
    ['football-draft', 'Football', 'Draft Order', 'Last position first'],
    ['team-generator', 'Generic', 'Team Assignment', null],
    ['golf-groups', 'Golf', 'Team Assignment', null],
    ['classroom-picker', 'Classroom', 'Random Order', 'Position 1 first'],
    ['drawing-order', 'Generic', 'Drawing Order', 'Position 1 first']
  ];
  for (const [preset, activity, orderType, reveal] of cases) {
    await page.goto(`/?preset=${preset}&names=Injected&participant=Hidden`);
    await expect(page).toHaveURL(/\/#setup$/);
    await expect(page.locator(`input[name="activity"][value="${activity}"]`)).toBeChecked();
    await expect(page.locator(`input[name="activityLabel"][value="${orderType}"]`)).toBeChecked();
    if (reveal) await expect(page.locator(`input[name="revealOrder"][value="${reveal.startsWith('Position') ? 'first' : 'last'}"]`)).toBeChecked();
    await page.getByLabel('Event name').fill(`Preset ${preset}`);
    await page.getByRole('button', { name: 'Continue to Names' }).click();
    await expect(page.locator('#participantList li')).toHaveCount(0);
  }
});

test('unknown presets are ignored and cannot inject participant data', async ({ page }) => {
  await page.goto('/?preset=unknown&names=Alex,Jordan');
  await expect(page.getByRole('heading', { level: 1, name: 'Make the order. Make it fair.' })).toBeVisible();
  await page.getByRole('button', { name: 'Create Randomizer' }).click();
  await page.getByLabel('Event name').fill('Clean Event');
  await page.getByRole('button', { name: 'Continue to Names' }).click();
  await expect(page.locator('#participantList li')).toHaveCount(0);
});

test('manual names can be added, edited, removed, completed uniquely, and reset', async ({ page }) => {
  await openConfiguredNames(page);
  await addNames(page, ['Alpha', 'Bravo', 'Charlie', 'Remove Me']);
  const editAlpha = page.getByLabel(/Edit participant 1:/);
  await editAlpha.fill('Alpha Updated');
  await editAlpha.press('Enter');
  await page.getByRole('button', { name: 'Remove Remove Me' }).click();
  await createWheel(page);
  await completeManual(page, 3);
  const names = await resultNames(page);
  expect(names.sort()).toEqual(['Alpha Updated', 'Bravo', 'Charlie'].sort());
  expect(new Set(names).size).toBe(3);
  await page.getByRole('button', { name: /Reset/ }).click();
  await expect(page.locator('#status')).toContainText('3 names remaining');
  await expect(page.locator('#sharePanel')).toBeHidden();
});

for (const [preset, initialPosition] of [['football-draft', '#3'], ['drawing-order', '#1']]) {
  test(`${preset} preserves reveal semantics without repeats`, async ({ page }) => {
    await openConfiguredNames(page, { preset, eventName: `${preset} Test` });
    await addNames(page, ['A', 'B', 'C']);
    await createWheel(page);
    await expect(page.locator('#pickNum')).toHaveText(initialPosition);
    await completeManual(page, 3);
    expect(new Set(await resultNames(page)).size).toBe(3);
  });
}

for (const [preset, headingWord] of [['team-generator', 'Team'], ['golf-groups', 'Group']]) {
  test(`${preset} produces balanced round-robin destinations`, async ({ page }) => {
    const groupCount = preset === 'team-generator' ? 3 : 2;
    await openConfiguredNames(page, { preset, eventName: `${headingWord} Test`, teamCount: groupCount });
    await addNames(page, ['A', 'B', 'C', 'D', 'E']);
    await createWheel(page);
    await completeManual(page, 5);
    const groups = page.locator('#results .team-group');
    await expect(groups).toHaveCount(groupCount);
    await expect(groups.nth(0).getByRole('heading', { level: 3 })).toHaveText(`${headingWord} 1`);
    await expect(groups.nth(1).getByRole('heading', { level: 3 })).toHaveText(`${headingWord} 2`);
    if (groupCount === 3) await expect(groups.nth(2).getByRole('heading', { level: 3 })).toHaveText('Team 3');
    const sizes = await groups.evaluateAll(items => items.map(item => item.querySelectorAll('.team').length));
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    expect(new Set(await resultNames(page)).size).toBe(5);
  });
}

test('classroom picker uses student language and never repeats a student', async ({ page }) => {
  await openConfiguredNames(page, { preset: 'classroom-picker', eventName: 'Morning Class' });
  await addNames(page, ['Ana', 'Bo', 'Cy'], true);
  await createWheel(page, true);
  await expect(page.locator('#resultsTitle')).toContainText('Selected Students');
  await completeManual(page, 3);
  const names = await resultNames(page);
  expect(new Set(names).size).toBe(3);
  await expect(page.locator('#results')).not.toContainText(/winner|rank/i);
  await page.getByRole('button', { name: /Reset/ }).click();
  await expect(page.locator('#status')).toContainText('3 students remaining');
});

test('Auto Spin can pause, resume, stop, restart, and finish without duplicates', async ({ page }) => {
  test.setTimeout(70_000);
  await openConfiguredNames(page, { eventName: 'Auto Test', spinMode: 'Auto spin' });
  await addNames(page, ['A', 'B', 'C', 'D']);
  await createWheel(page);
  await page.getByRole('button', { name: 'Start Auto Spin' }).click();
  await page.waitForFunction(() => {
    const pause = document.querySelector('#pauseAuto');
    if (pause && !pause.disabled) {
      pause.click();
      return true;
    }
    return false;
  });
  await expect(page.locator('#status')).toContainText('Auto Spin paused', { timeout: 8_000 });
  const assigned = (await resultNames(page)).filter(name => name !== 'Pending').length;
  await page.waitForTimeout(1_100);
  expect((await resultNames(page)).filter(name => name !== 'Pending').length).toBe(assigned);
  await page.getByRole('button', { name: 'Resume Auto Spin' }).click();
  await page.waitForFunction(() => {
    const status = document.querySelector('#status');
    const stop = document.querySelector('#stopAuto');
    if (status?.textContent.includes('Next spin in 3') && stop && !stop.disabled) {
      stop.click();
      return true;
    }
    return false;
  });
  await expect(page.locator('#status')).toContainText('Auto Spin stopped');
  await page.getByRole('button', { name: 'Start Auto Spin' }).click();
  await expect(page.locator('#status')).toContainText('Order Set', { timeout: 20_000 });
  const names = await resultNames(page);
  expect(names).toHaveLength(4);
  expect(new Set(names).size).toBe(4);
});

test('completed results copy correctly and Download Image initiates a PNG download', async ({ page }) => {
  await page.addInitScript(() => {
    window.__copiedResults = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__copiedResults = value; } } });
    window.__openedWindows = [];
    window.open = (...args) => { window.__openedWindows.push(args); return {}; };
  });
  await openConfiguredNames(page, { eventName: 'Export Test' });
  await addNames(page, ['Alex', 'Jordan']);
  await createWheel(page);
  await completeManual(page, 2);
  await page.getByText('Share Results').click();
  await page.getByRole('button', { name: 'Copy Results' }).click();
  const copied = await page.evaluate(() => window.__copiedResults);
  expect(copied).toContain('SpinOrder');
  expect(copied).toContain('1.');
  expect(copied).toContain('2.');
  expect(copied).toContain('Alex');
  expect(copied).toContain('Jordan');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download Image' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^spinorder-export-test-\d{4}-\d{2}-\d{2}\.png$/);
  await page.getByRole('button', { name: 'Gmail' }).click();
  const opened = await page.evaluate(() => window.__openedWindows);
  expect(opened.at(-1)[0]).toMatch(/^https:\/\/mail\.google\.com\/mail\/\?view=cm/);
});

test('critical flow controls remain visible and usable at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Create Randomizer' })).toBeVisible();
  await page.getByRole('button', { name: 'Create Randomizer' }).click();
  await expect(page.locator('#setupTitle')).toBeFocused();
  await expect(page.getByLabel('Event name')).toBeVisible();
  await page.getByLabel('Event name').fill('Mobile Test');
  await page.getByRole('button', { name: 'Continue to Names' }).click();
  await expect(page.locator('#participantsTitle')).toBeFocused();
  await addNames(page, ['One', 'Two']);
  await expect(page.getByRole('button', { name: 'Create Randomizer' })).toBeVisible();
  await createWheel(page);
  await expect(page.locator('#spin')).toBeVisible();
  await completeManual(page, 2);
  await expect(page.getByText('Share Results')).toBeVisible();
});

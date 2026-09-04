const { test, expect } = require('@playwright/test');

const publicRoutes = [
  '/',
  '/about/',
  '/privacy/',
  '/contact/',
  '/fantasy-football-draft-order-randomizer/',
  '/random-team-generator/',
  '/golf-group-randomizer/',
  '/classroom-name-picker/',
  '/random-drawing-order-generator/'
];

test.beforeEach(async ({ page }) => {
  await page.route('**/_vercel/insights/script.js', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: ''
  }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

async function addNamesWithEnter(page, names) {
  await expect(page.locator('#participantsTitle')).toBeFocused();
  const input = page.getByRole('textbox', { name: 'Participant name', exact: true });
  const initialCount = await page.locator('#participantList li').count();
  for (const [index, name] of names.entries()) {
    await input.click();
    await input.pressSequentially(name, { delay: 10 });
    await input.press('Enter');
    await expect(page.locator('#participantList li')).toHaveCount(initialCount + index + 1);
  }
}

async function buildCompletedOrder(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create Randomizer' }).click();
  await expect(page.locator('#setupTitle')).toBeFocused();
  await page.getByLabel('Event name').fill('Accessibility Review');
  await page.getByRole('button', { name: 'Continue to Names' }).click();
  await addNamesWithEnter(page, ['Alex', 'Jordan']);
  await page.getByRole('button', { name: 'Create Randomizer' }).click();
  await page.locator('#spin').click();
  await expect(page.locator('#status')).toContainText('Order Set', { timeout: 10_000 });
}

test('keyboard activation, validation focus, and participant controls remain usable', async ({ page }) => {
  await page.goto('/');
  const create = page.getByRole('button', { name: 'Create Randomizer' });
  await create.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#setupTitle')).toBeFocused();

  const continueButton = page.getByRole('button', { name: 'Continue to Names' });
  await continueButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Event name')).toBeFocused();
  await expect(page.getByLabel('Event name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#eventNameError')).toHaveText('Enter an event name.');

  await page.getByLabel('Event name').fill('Keyboard Event');
  await continueButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#participantsTitle')).toBeFocused();
  const input = page.getByRole('textbox', { name: 'Participant name', exact: true });
  await input.fill('Alpha');
  await input.press('Enter');
  await expect(page.getByLabel(/Edit participant 1: Alpha/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove Alpha' })).toBeVisible();
});

test('completed Share Results menu and Yahoo dialog are keyboard accessible', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => undefined }
    });
    window.open = () => ({});
  });
  await buildCompletedOrder(page);
  const summary = page.locator('#sharePanel summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Yahoo Mail' })).toBeVisible();
  await page.getByRole('button', { name: 'Yahoo Mail' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Results copied' })).toBeVisible();
  await expect(page.locator('#yahooDialogCancel')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#yahooDialogPrimary')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Yahoo Mail' })).toBeFocused();
});

test('public pages and internal links load without script or request failures', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(`page: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) errors.push(`console: ${message.text()}`);
  });
  page.on('requestfailed', failed => {
    if (!failed.url().endsWith('/_vercel/insights/script.js')) errors.push(`request: ${failed.url()}`);
  });
  page.on('response', response => {
    if (response.status() >= 400 && !response.url().endsWith('/_vercel/insights/script.js')) errors.push(`response ${response.status()}: ${response.url()}`);
  });

  for (const route of publicRoutes) {
    const response = await page.goto(route);
    expect(response && response.ok(), route).toBeTruthy();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const hrefs = await page.locator('a[href]').evaluateAll(links => links.map(link => link.getAttribute('href')));
    for (const href of hrefs) {
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) continue;
      const linked = await request.get(new URL(href, 'http://127.0.0.1:4173').pathname);
      expect(linked.ok(), `${route} -> ${href}`).toBeTruthy();
    }
  }
  expect(errors).toEqual([]);
});

test('320px layouts do not create essential horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const route of publicRoutes) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, route).toBeLessThanOrEqual(1);
  }

  await page.goto('/');
  await page.getByRole('button', { name: 'Create Randomizer' }).click();
  await expect(page.locator('#setupTitle')).toBeFocused();
  await page.getByLabel('Event name').fill('Small Screen');
  for (const selector of ['#setupView', '#participantsView', '#randomizerView']) {
    if (selector === '#participantsView') await page.getByRole('button', { name: 'Continue to Names' }).click();
    if (selector === '#randomizerView') {
      await addNamesWithEnter(page, ['One', 'Two']);
      await page.getByRole('button', { name: 'Create Randomizer' }).click();
    }
    await expect(page.locator(selector)).toBeVisible();
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      elements: [...document.querySelectorAll('body *')].map(element => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName, id: element.id, className: typeof element.className === 'string' ? element.className : '', left: rect.left, right: rect.right, width: rect.width };
      }).filter(item => item.left < -1 || item.right > document.documentElement.clientWidth + 1)
    }));
    expect(metrics.overflow, `${selector}: ${JSON.stringify(metrics.elements)}`).toBeLessThanOrEqual(1);
  }
});

test('reduced motion shortens visual animation without bypassing completion', async ({ page }) => {
  await page.goto('/');
  await expect(page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).resolves.toBe(true);
  await page.getByRole('button', { name: 'Create Randomizer' }).click();
  await expect(page.locator('#setupTitle')).toBeFocused();
  await page.getByLabel('Event name').fill('Reduced Motion');
  await page.getByRole('button', { name: 'Continue to Names' }).click();
  await addNamesWithEnter(page, ['One', 'Two']);
  await page.getByRole('button', { name: 'Create Randomizer' }).click();
  const duration = await page.locator('#wheel').evaluate(element => getComputedStyle(element).transitionDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.001);
  await page.locator('#spin').click();
  await expect(page.locator('#status')).toContainText('Order Set', { timeout: 10_000 });
  await expect(page.locator('#results .pending')).toHaveCount(0);
});

test('visible interactive controls provide usable touch targets', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  const tooSmall = await page.locator('button:visible, a:visible, [role="button"]:visible').evaluateAll(elements => elements
    .map(element => ({ label: element.getAttribute('aria-label') || element.textContent.trim(), rect: element.getBoundingClientRect() }))
    .filter(item => item.rect.width < 24 || item.rect.height < 24));
  expect(tooSmall).toEqual([]);
});

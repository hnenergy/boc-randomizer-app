const { defineConfig, devices } = require('@playwright/test');

const isCI = Boolean(process.env.CI);

module.exports = defineConfig({
  testDir: './tests/e2e',
  globalTeardown: require.resolve('./tests/stop-test-server.js'),
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 7_000 },
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    actionTimeout: 8_000,
    navigationTimeout: 15_000,
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'node tests/start-test-server.js',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: !isCI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: { ...process.env, NO_UPDATE_CHECK: '1' },
    gracefulShutdown: { signal: 'SIGINT', timeout: 500 }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' }
    },
    {
      name: 'webkit-iphone',
      workers: 1,
      use: { ...devices['iPhone 13'], reducedMotion: 'reduce' }
    }
  ]
});

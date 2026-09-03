const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('package scripts preserve static tests and expose isolated Playwright commands', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(packageJson.scripts['test:static'], 'node --test tests/*.test.js');
  assert.match(packageJson.scripts.test, /test:static.*test:e2e/);
  assert.ok(packageJson.scripts['test:e2e:chromium']);
  assert.ok(packageJson.scripts['test:e2e:webkit']);
  assert.equal(packageJson.scripts['serve:test'], 'node tests/start-test-server.js');
  assert.deepEqual(Object.keys(packageJson.dependencies || {}), []);
});

test('GitHub Actions runs the complete suite without deployment or secrets', () => {
  const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'tests.yml'), 'utf8');
  assert.match(workflow, /pull_request:\s*\n\s*branches: \[main\]/);
  assert.match(workflow, /push:\s*\n\s*branches: \[main\]/);
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /playwright install --with-deps chromium webkit/);
  assert.match(workflow, /run: npm test/);
  assert.doesNotMatch(workflow, /deploy|secrets\./i);
});

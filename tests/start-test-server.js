'use strict';

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const stopFile = path.join(__dirname, '.playwright-stop');
try { fs.rmSync(stopFile, { force: true }); } catch (_) {}

const child = spawn(process.execPath, [
  path.join(__dirname, '..', 'node_modules', 'serve', 'build', 'main.js'),
  '.',
  '-l',
  'tcp://127.0.0.1:4173',
  '--no-clipboard'
], {
  env: { ...process.env, NO_UPDATE_CHECK: '1' },
  stdio: 'inherit'
});

let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  child.kill();
  setTimeout(() => process.exit(0), 500).unref();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
child.on('exit', code => process.exit(stopping ? 0 : (code ?? 1)));
const stopWatcher = setInterval(() => {
  if (fs.existsSync(stopFile)) {
    clearInterval(stopWatcher);
    try { fs.rmSync(stopFile, { force: true }); } catch (_) {}
    stop();
  }
}, 100);

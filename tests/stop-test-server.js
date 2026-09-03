'use strict';

const fs = require('node:fs');
const path = require('node:path');

module.exports = async function stopTestServer() {
  fs.writeFileSync(path.join(__dirname, '.playwright-stop'), 'stop');
};

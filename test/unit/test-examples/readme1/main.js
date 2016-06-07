// Example from the README
'use strict';
const assert = require('assert');

// Need `.new()` here to make sure we get a fresh instance
const C1 = require('../../../src/main.js').new();
const cfg = C1();

const siteConfig = cfg.sites[cfg['current-site']];
const port = siteConfig.port;   //=> 80
assert.equal(port, 80);

module.exports = cfg;

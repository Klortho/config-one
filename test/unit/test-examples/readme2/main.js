// Example from the README
'use strict';
const assert = require('assert');

// Need `.new()` here to make sure we get a fresh instance
var C1 = require('../../../../src/main.js').new();
var cfg = C1();

var siteConfig = cfg.sites[cfg['current-site']];
var port = siteConfig.port;   //=> 80
assert.equal(port, 8880);

module.exports = cfg;

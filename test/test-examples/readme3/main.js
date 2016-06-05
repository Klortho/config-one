// Example from the README
'use strict';
const assert = require('assert');

// Need `.new()` here to make sure we get a fresh instance
var C1 = require('../../../src/main.js').new();
var cfg = C1();

// nothing to see here

module.exports = cfg;

//console.log('done: ', C1.freeze(C1.extend(cfg)));

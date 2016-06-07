/**
 * Since config-one uses itself to manage its own options, there is a
 * bit of a chicken-egg problem. The `seed.js` module contains all of the
 * code that doesn't depend on default options (almost all). Both `main.js`,
 * here and `defaults.js` require `seed.js`.
 */
"use strict";

const seed = require('./seed.js');
const defaults = require('./defaults.js')();

seed.private.defaults = defaults;

const C1 = seed.new(defaults);
module.exports = C1;

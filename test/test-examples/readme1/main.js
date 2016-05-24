// Example from the README
'use strict';
const assert = require('assert');
const process = require('process');
const path = require('path');
const baseDir = path.resolve(__dirname, '../../..');
const config1_path = path.join(baseDir, 'src/main.js');

//-----------------------------------------------------
console.log('readme1 main: about to require config1');
var C1 = require(config1_path).new();
var cfg = C1();

var siteConfig = cfg.sites[cfg['current-site']];
var port = siteConfig.port;   //=> 80
assert.equal(port, 80);
//-----------------------------------------------------

module.exports = cfg;

// Example from the README
'use strict';
const assert = require('assert');
const process = require('process');
const path = require('path');
const baseDir = path.resolve(__dirname, '../../..');
const config1_path = path.join(baseDir, 'src/main.js');


console.log('-----------------------------------');
console.log('readme2, cwd: ' + process.cwd());

var overrides = {
  configDir: '/Users/klortho/git/klortho/config-one/test/test-examples/readme2'
};
var C1 = require(config1_path).new(overrides);
var opts = C1.options;
console.log('options: ' + C1.ppConsole(opts));
assert.equal(opts.configDirEnv, 'CONFIG1_DIR');
assert.equal(opts.configDir, 
  '/Users/klortho/git/klortho/config-one/test/test-examples/readme2');




var cfg = C1();
var siteConfig = cfg.sites[cfg['current-site']];
var port = siteConfig.port;   //=> 80
assert.equal(port, 8880);


module.exports = cfg;

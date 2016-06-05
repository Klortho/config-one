// This checks a specification object against a real received object. For
// every value set in the spec, it will test for equality, and report if there's
// an error.

// This is supposed to be what R.whereEq() does, but it doesn't work on arrays.

// If you want to turn on detailed logging, to get more visibility into where
// a mismatch occurs (until I get a better scheme), then:
//
//     const checkSpec = require('./check-spec.js');
//     checkSpec.logEnabled = true;
//     checkSpec(...);

const assert = require('assert');
const logMaker = require('../src/log.js');

const checkSpec = function(actual, spec) {
  const log = logMaker();
  checkSpec.logEnabled ? log.enable() : log.disable();

  log.enter('checkSpec');
  check(actual, spec, '');

  function check(actual, spec, path) {
    log.enter('checking ' + path);
    
    if (spec instanceof Array) {
      log('checking array');
      spec.forEach(function(item, i) {
        const a_item = actual[i];
        check(item, a_item, path + '.' + i);
      });
    }
    else if (spec && typeof spec === 'object') {
      log('checking object');
      Object.keys(spec).forEach(k => {
        const a_val = actual[k];
        check(a_val, spec[k], path + '.' + k);
      });
    }
    else {
      assert.equal(actual, spec, 'not equal: actual=' + actual +
        ', spec=' + spec);
      log('okay: ' + spec + '==' + actual);
    }
    log.exit();
  }
  log.exit();
};

checkSpec.logEnabled = false;

module.exports = checkSpec;

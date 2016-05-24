// Test examples from the docs.
"use strict";

const assert = require('assert');
const path = require('path');
const process = require('process');
const vows = require('vows');

const baseDir = path.resolve(__dirname, '../../..');
const checkSpec = require(path.join(baseDir, 'test/check-spec.js'));

/*
const ℂ = require('../../../src/main.js'),
      ppConsole = ℂ.ppConsole;
var cfg = ℂ();
ppConsole(cfg);
console.log('done');
*/

var suite = vows.describe('examples-readme2');

process.chdir(__dirname);

suite.addBatch({
  'README example 2: with local config': {
    topic: function() {
      process.chdir(__dirname);
      return require('./main.js');
    },
    'should reflect overrides': function(cfg) {
      checkSpec(cfg,
        { 'current-site': 'dev',
          sites: {
            dev: {
              port: 8880,
              path: '/home/acme/project', 
            },
            prod: {
              port: 80,
              path: '/var/acme/data',
            }
          }
        });
    },
  },
});

suite.export(module);

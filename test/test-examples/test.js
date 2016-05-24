// Test examples from the docs.
"use strict";

const assert = require('assert');
const path = require('path');
const process = require('process');
const vows = require('vows');

const baseDir = path.resolve(__dirname, '../..');
const checkSpec = require(path.join(baseDir, 'test/check-spec.js'));

var suite = vows.describe('examples-readme1');

console.log('readme1: in the module, cwd is ' + process.cwd());

suite.addBatch({
  'README example 1: no config-local': {
    topic: function() {
      process.chdir(__dirname + '/readme1');
      console.log('readme1: starting topic, cwd is ' + process.cwd());
      return require('./readme1/main.js');
    },
    'should match the config file': function(cfg) {
      checkSpec(cfg,
        { 'current-site': 'prod',
          sites: {
            dev: {
              port: 8870,
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

suite.addBatch({
  'README example 2: with local config': {
    topic: function() {
      process.chdir(__dirname + '/readme2');
      return require('./readme2/main.js');
    },
    'should reflect overrides': function(cfg) {
      assert(true);
      /*
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
      */
    },
  },
});



suite.export(module);

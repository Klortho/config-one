// Test examples from the docs.
"use strict";

const assert = require('assert');
const path = require('path');
const process = require('process');
const vows = require('vows');
const checkSpec = require('../check-spec.js');

var suite = vows.describe('examples-all');

// Make sure these are executed sequentially
var test1_done = false;
var test2_started = false;

suite.addBatch({
  'README example 1: no config-local': {
    topic: function() {
      if (test2_started) throw Error('test2 started early!');
      process.chdir(__dirname + '/readme1');
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
      test1_done = true;
      if (test2_started) throw Error('test2 started early!');
    },
  },
});

suite.addBatch({
  'README example 2: with local config': {
    topic: function() {
      if (!test1_done) throw Error('sequential, dammit!');
      process.chdir(__dirname + '/readme2');
      return require('./readme2/main.js');
    },
    'should reflect overrides': function(cfg) {
      if (!test1_done) throw Error('sequential, dammit!');
      assert(true);
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

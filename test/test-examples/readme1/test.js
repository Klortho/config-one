// Test examples from the docs.
"use strict";

const assert = require('assert');
const path = require('path');
const process = require('process');
const vows = require('vows');

const baseDir = path.resolve(__dirname, '../../..');
const checkSpec = require(path.join(baseDir, 'test/check-spec.js'));

var suite = vows.describe('examples-readme1');

process.chdir(__dirname);
console.log('readme1: in the module, cwd is ' + process.cwd());

suite.addBatch({
  'README example 1: no config-local': {
    topic: function() {
      process.chdir(__dirname);
      console.log('readme1: starting topic, cwd is ' + process.cwd());
      return require('./main.js');
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

suite.export(module);

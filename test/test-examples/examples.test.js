// Test examples from the docs.
"use strict";
const uut = process.env.C1_BUILD_UUT || 'src';
const target = process.env.C1_BUILD_TARGET || 'node';

if (target === 'node') {
  const ℂ = require(uut === 'src' ? '../../src/main.js' : '../../dist/config1.js');

  const assert = require('chai').assert;
  const path = require('path');
  const checkSpec = require('../check-spec.js');

  // Make sure these are execute sequentially
  var test1_done = false;
  var test2_started = false;

  describe('examples', function() {

    describe('README example 1: no config-local', function() {
      it('should match the config file', function() {
        const saveCwd = process.cwd();
        process.chdir(__dirname + '/readme1');
        try {
          const cfg = require('./readme1/main.js');
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
            }
          );
        }
        finally {
          process.chdir(saveCwd);
        }
        test1_done = true;
        assert.equal(test2_started, false, 'test2 started early!');
      });
    });

    describe('README example 2: with local config', function() {
      it('should reflect overrides', function() {
        assert.equal(test1_done, true, 'sequential, dammit!');
        const saveCwd = process.cwd();
        process.chdir(__dirname + '/readme2');
        try {
          const cfg = require('./readme2/main.js');
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
            }
          );
        }
        finally {
          process.chdir(saveCwd);
        }
      });
    });

    describe('README example 3: semver example', function() {
      it('computes best version correctly', function() {


        const saveCwd = process.cwd();
        process.chdir(__dirname + '/readme3');
        try {
          const cfg = require('./readme3/main.js');
          checkSpec(cfg,
            { cdn: 'https://cdn.org/',
              libs: { 
                available: {  
                  'markdown-it': {
                    versions: [ '1.0.0', '1.1.0', '2.0.1' ],
                  },
                },
                required: { 'markdown-it': '>=2.0.0' },
                enabled: { 'markdown-it': '2.0.1' } 
              } 
            }
          );
        }
        finally {
          process.chdir(saveCwd);
        }
      });
    });
  });
}

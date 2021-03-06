// Test the default configuration of this library; that it matches what's
// documented.

// This helps to test the bootstrapping process. See the main.js file.
// In these tests, nothing is read from config
// files. The defaults.js module is invoked to get a copy of the defaults
// object, including recipes. Then, C1.extend() is called to resolve those
// and produce a view.

// These tests only run when uut == `src`.

"use strict";
const join = require('path').join;
const uut = require('../resolve-uut.js');
const debug = uut.debug;

if (debug) console.log(
  '---------------------------- defaults -----------------------------');

if (uut.key === 'src') {
  const seed = require(join(uut.dirPath, 'seed.js'));
  const defaults = require(join(uut.dirPath, 'defaults.js'));

  const assert = require('chai').assert;
  const checkSpec = require('../check-spec.js');
  const path = require('path');
  const R = require('ramda');

  describe('defaults', function() {
    describe('Initial config of seed object', function() {
      it('seed does not have default options', function () {
        assert(!('basenames' in seed.options), 'seed.options has basenames');
      });
    });

    describe('Default options', function() {
      it('has the right default options', function () {

        // Get a fresh new copy of the defaults object
        const defConfig = defaults();
        // Extend it into a config
        const opts = seed.extend(defConfig);

        // This spec contains expected values whereever we want to look.
        // We won't test deepEquals, but rather only test where spec has
        // a value set.
        const spec = {
          configDirEnv: 'CONFIG1_DIR',
          configDir: path.resolve(process.cwd()),
          basenames: ['config', 'config-local'],
          suffixes: ['.js', '.json'],
          filenames: [
            'config.js', 
            'config.json', 
            'config-local.js', 
            'config-local.json',
          ],
          pathnames: [
            path.resolve('config.js'), 
            path.resolve('config.json'), 
            path.resolve('config-local.js'), 
            path.resolve('config-local.json'),
          ],
          envPrefix: 'CONFIG1_',
          sourceTypes: {
            file: {
              specs: [
                { type: 'file', 
                  pathname: path.resolve('config.js')}, 
                { type: 'file', 
                  pathname: path.resolve('config.json')}, 
                { type: 'file', 
                  pathname: path.resolve('config-local.js')}, 
                { type: 'file', 
                  pathname: path.resolve('config-local.json')},
              ]
            },
            envPrefix: {
              specs: [
                { type: 'envPrefix',
                  prefix: 'CONFIG1_' }
              ]
            }
          },
          sources: [
            { type: 'file',
              pathname: path.resolve('config.js') },
            { type: 'file',
              pathname: path.resolve('config.json') },
            { type: 'file',
              pathname: path.resolve('config-local.js') },
            { type: 'file',
              pathname: path.resolve('config-local.json') },
            { type: 'envPrefix',
              prefix: 'CONFIG1_' },
          ]
        };

        if (debug) checkSpec.logEnabled = true;
        checkSpec(opts, spec);

        assert(path.isAbsolute(opts.configDir));
        
        //var accessible = true;
        //try { fs.accessSync(opts.configDir, fs.F_OK); }
        //catch(err) { accessible = false; }
        //assert(accessible);
      });
    });
  });
}

if (debug) console.log(
  '-------------------------- done defaults.test.js --------------------');


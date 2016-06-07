// Many tests can operate on code from either the original sources (`src`) or 
// the distribution bundles (`dist`). This little module figures out which.

// This also adds the `debug` flag to the exports, if the corresponding
// environment variable is set.

// This doesn't require the unit under test module, but leaves it up to the
// tests to do that when it needs it.

'use strict';

// The units-under-test that we know about:
const specs = {
  src: {
    dir: 'src',      // directory, relative to package root
    main: 'main.js',
  },
  dist: {
    dir: 'dist',
    main: 'config-one.js',
  }
};

const debug = (process.env.C1_DEBUG === 'true');
const join = require('path').join;
const packageRoot = join(__dirname, '..');  // absolute path
const uut = process.env.C1_BUILD_UUT || 'src';

if (!uut in specs) throw RangeError(
  'Unrecognized value for environment variable C1_BUILD_UUT');

const spec = specs[uut];
const dirPath = join(packageRoot, spec.dir);
const mainPath = join(dirPath, spec.main);

module.exports = {
  key: uut,             // `src` or `dist`
  dir: spec.dir,     // directory, relative to package root
  main: spec.main,   // usu. just filename, but generally, the relative path 
                        // of main entry file, from `dir`
  dirPath: dirPath,     // absolute path to the uut's directory
  mainPath: mainPath,   // full path to main entry file
  debug: debug,
  require: function() { 
    const reqmod = require(mainPath);
    reqmod.split = 'fleegle';
    return reqmod;
  },
};

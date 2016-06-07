// Test the default configuration of this library; that it matches what's
// documented.
"use strict";
const uut = require('../resolve-uut.js');
const debug = uut.debug;
const ℂ = uut.require();

if (debug) console.log(
  '---------------------------- read -----------------------------');

const target = process.env.C1_BUILD_TARGET || 'node';

// FIXME: this *must* be made to work with node and webpack -- it's central 
// functionality! The problem is that right now I'm using `require` to read
// in external JS config files, and webpack clobbers them.

if (uut.key === 'src' && target === 'node') {
  const ℂ = uut.require();

  const assert = require('chai').assert;
  const path = require('path');
  const R = require('ramda');
  const util = require('util');

  // Helper functions
  const checkSpec = require('../check-spec.js');
  assert.isDefined(checkSpec);

  const absPath = R.partial(path.resolve, [__dirname]);

  // filename -> source spec
  const spec = filename => {
    const s = {
      type: 'file',
      pathname: absPath('read-files/' + filename)
    };
    return s;
  };


  // [filenames] -> [source specs]
  const specs = R.map(spec);

  // [filenames] -> [config views]
  const readFilesArray = files => R.apply(ℂ.read, specs(files));

  // Same function, but takes a variable number of args instead of an array
  // (*filenames) -> [config views]
  const readFiles = R.unapply(readFilesArray);

  describe('read', function() {

    it('returns null when calling read with an empty list', function() {
      const view = ℂ.read();
      assert(view == null);
    });

    it('can read a hardcoded filename', function() {
      // First do it with a hard-coded source spec (because easier to debug)
      const view = ℂ.read({ 
        type: 'file',
        pathname: __dirname + '/read-files/simple2.json',
      });
    });


    it('can read from a simple js file - part 1', function () {
      const view = readFiles('simple1.js');
      checkSpec(view, {
        a: 1,
        b: { sunshine: 'blue skies' }
      });
    });

    it('can read from a simple json file - part 2', function() {
      const view = readFiles('simple2.json');
      checkSpec(view, {
        a: 1,
        b: { sunshine: 'blue skies' }
      });
    });

    it('can read from a js file with recipes', function() {
      const view = readFiles('recipes1.js');
      checkSpec(view, {
        ver: '1.0.0',
        mdlib: 'markdown-it',
        libs: {
          mdlib: 'markdown-it',
          jqlib: 'jQuery',
        },
        cdn: 'https://cdn.org/',
        jqurl: 'https://cdn.org/jQuery-1.0.0',
      });
    });

    it('can handle missing files without choking', function() {
      const view = readFiles(
        'missing1.js', 'recipes1.js', 'missing2.js');
      checkSpec(view, {
        ver: '1.0.0',
        mdlib: 'markdown-it',
        libs: {
          mdlib: 'markdown-it',
          jqlib: 'jQuery',
        },
        cdn: 'https://cdn.org/',
        jqurl: 'https://cdn.org/jQuery-1.0.0',
      });
    });

    describe('Nested, layered, and recipes', function() {
      it('can read from several JS files with overrides and recipes - first layer', 
        function() {
          const view = readFiles('nested1.js');
          assert.deepEqual(view, {
            A: {
              B: {
                C: {
                  D: 'red',
                  F: 'red pink'
                },
              },
              H: 'pink',
            },
            J: {
              K: {
                D: 'red',
                F: 'red pink',
              }
            }
          });
        }
      );

      it('can read from several JS files with overrides and recipes - second layer',
        function() {
          const view = readFiles('nested1.js', 'nested2.js');
          assert.deepEqual(view, {
            A: {
              B: {
                C: {
                  D: 'red',
                  F: 'red rose'
                },
              },
              G: 'gold',
              H: 'rose',
            },
            I: 'icy blue',
            J: {
              K: {
                D: 'red',
                F: 'red rose',
              }
            },
            L: {
              M: {
                C: {
                  D: 'red',
                  F: 'red rose'
                }            
              }
            }
          });
        }
      );

      it('can read from several JS files with overrides and recipes - third layer',
        function() {
          const view = readFiles(
            'nested1.js', 'nested2.js', 'nested3.js');
          assert.deepEqual(view, {
            A: {
              B: {
                C: {
                  D: 'red',
                  E: 'eggshell',
                  F: 'red rose'
                },
              },
              G: 'gold',
              H: 'rose',
            },
            I: 'icy blue',
            J: {
              N: 'navy',
              K: { 
                D: 'red', 
                E: 'egg white', 
                F: 'red rose',
                Q: 'sea green'
              } 
            },
            L: {
              M: {
                C: {
                  D: 'red',
                  E: 'eggshell',
                  F: 'red rose',
                  O: 'off-white'
                }            
              }
            }
          });
        }
      );
    });
  });
}

if (debug) console.log(
  '-------------------------- done read.test.js --------------------');

// Test the default configuration of this library; that it matches what's
// documented.
"use strict";

const assert = require('assert');
const path = require('path');
const R = require('ramda');
const util = require('util');
const vows = require('vows');

const ℂ = require('../src/main.js'),
      ppConsole = ℂ.ppConsole;
const checkSpec = require('./check-spec.js');

var suite = vows.describe('read');
const absPath = R.partial(path.resolve, [__dirname]);


// First make a function to help specify these tests

// filename -> source spec
const spec = filename => ({
  type: 'file',
  pathname: absPath('read-files/' + filename)
});

// [filenames] -> [source specs]
const specs = R.map(spec);

// [filenames] -> [config views]
const readFilesArray = files => R.apply(ℂ.read, specs(files));

// Same function, but takes a variable number of args instead of an array
// (*filenames) -> [config views]
const readFiles = R.unapply(readFilesArray);


suite.addBatch({
  'Empty list': {
    'Calling read with an empty list should return null': function() {
      const view = ℂ.read();
      assert(view == null);
    },
  },
});

suite.addBatch({
  'Simple JavaScript file': {
    'read from a simple js file': function() {
      const view = readFiles('simple1.js');
      checkSpec(view, {
        a: 1,
        b: { sunshine: 'blue skies' }
      });
    },
  },
});

suite.addBatch({
  'Simple JSON file': {
    'read from a simple json file': function() {
      const view = readFiles('simple2.json');
      checkSpec(view, {
        a: 1,
        b: { sunshine: 'blue skies' }
      });
    },
  },
});

suite.addBatch({
  'JS with recipes': {
    'read from a js file with recipes': function() {
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
    },
  },
});

// Verify that missing files are no problem
suite.addBatch({
  'JS with recipes': {
    'read from a js file with recipes': function() {
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
    },
  },
});

// Nested, layered and recipes - 1st layer
suite.addBatch({
  'Overrides and recipes - layer 1': {
    'Read from several JS files with overrides and recipes': 
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
    },
  },
});

// Nested, layered and recipes - 2nd layer
suite.addBatch({
  'Overrides and recipes - layer 2': {
    'Read from several JS files with overrides and recipes': 
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
    },
  },
});

// Nested, layered and recipes - 3rd layer
suite.addBatch({
  'Overrides and recipes - layer 3': {
    'Read from several JS files with overrides and recipes': 
    function() {
      const view = readFiles(
        'nested1.js', 'nested2.js', 'nested3.js');
      //ppView(view);
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
    },
  },
});

suite.export(module);

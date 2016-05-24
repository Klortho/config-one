// Test the default configuration of this library; that it matches what's
// documented.
"use strict";

const assert = require('assert'),
      vows = require('vows'),
      ℂ = require('../src/main.js');

var suite = vows.describe('views');

const obja = {a: 11, b: 12, c: 13};
const objb = {a: 21, c: 23, d: 24};
const objc = {a: 31, b: 32, d: 34, e: 35};
const objList = [obja, objb, objc];

suite.addBatch({

  'Creating views': {
    'generate a new clone': function test_clone() {
      var seed = ℂ.private.seed;
      var clone = ℂ.private.clone;
      var seed2 = clone();
      // This is a different object
      assert(seed2 !== seed);
      assert(seed instanceof Function);
      assert(seed.private.clone === clone);
    },

    'new object makes a view': function test_new_view() {
      var view = ℂ.extend({a: 11});
      assert.equal(typeof view, 'object');
      assert('__config1__' in view);
      assert.equal(view.a, 11);
      // I used to have a `view` property in c1; bad idea.
      assert(!('view' in ℂ));
    },

    'can make simple views': function test_simple_views() {
      var viewb = ℂ.extend({a: 21, b: 22, c: 23});
      assert.equal(viewb.a, 21);
      assert.equal(viewb.b, 22);
      assert.equal(viewb.c, 23);

      var viewc = ℂ.extend(
        {a: 31, b: 32, c: 33},
        {a: 35}
      );
      assert(viewc.a == 35 && viewc.b == 32 && viewc.c == 33);

      var viewd = ℂ.extend(obja, objb, objc);
      assert.equal(viewb.a, 21);
      assert.deepEqual(viewd,
        { a: 31,
          b: 32,
          c: 23,
          d: 34,
          e: 35,
        }
      );
    },

    'test two-level-deep views': function test_two_level() {
      var src = {
        a: 1,
        b: {a: 3, c: 2}
      };
      var view = ℂ.extend(src);
      assert.equal(view.a, 1);
      assert.equal(view.b.a, 3);
      assert.equal(view.b.c, 2);
      assert.deepEqual(view, src);
    },

    'deeply nested view': function test_nested() {
      var nested = [
        {
          b: 2,
          c: {
            a: 'cat',
            b: {
              b: 'b',
              d: 'd',
            },
          }
        },
        {
          a: 1,
          b: 9,
          c: {
            b: {
              a: {
                a: 'x',
              },
              b: 'b',
              c: 'wart',
              d: 'freckle',
            },
            c: 'dog',
          }
        },
        {
          a: 1,
          b: 2,
          c: {
            b: {
              a: {
                b: 'y',
                c: 'z',
              },
              d: 'mole',
            },
            x: 'doggy',
          },
          y: 'awesome!',
        },
      ];
      var view = ℂ.extend(...nested);
      var exp = {
        a: 1,
        b: 2,
        c: {
          a: 'cat',
          b: {
            a: {
              a: 'x',
              b: 'y',
              c: 'z',
            },
            b: 'b',
            c: 'wart',
            d: 'mole',
          },
          c: 'dog',
          x: 'doggy',
        },
        y: 'awesome!',
      };
      assert.deepEqual(view, exp);
    },
  },
})
.export(module);

// Test the default configuration of this library; that it matches what's
// documented.
"use strict";

const uut = require('../resolve-uut.js');
const debug = uut.debug;
const ℂ = uut.require();
if (debug) console.log(
  '---------------------------- views -----------------------------');

const assert = require('chai').assert;

const obja = {a: 11, b: 12, c: 13};
const objb = {a: 21, c: 23, d: 24};
const objc = {a: 31, b: 32, d: 34, e: 35};
const objList = [obja, objb, objc];

describe('views - creating views', function() {

  it('can generate a new clone', function() {
    const seed = ℂ.private.seed;
    const clone = ℂ.private.clone;
    const seed2 = clone();
    // This is a different object
    assert.notEqual(seed2, seed);
    assert.instanceOf(seed, Function);
    assert.strictEqual(seed.private.clone, clone);
  });

  it('new object makes a view', function() {
    const view = ℂ.extend({a: 11});
    assert.equal(typeof view, 'object');
    assert('__config1__' in view);
    assert.equal(view.a, 11);
    // I used to have a `view` property in c1; bad idea.
    assert(!('view' in ℂ));
  });

  it('can make simple views', function() {
    const viewb = ℂ.extend({a: 21, b: 22, c: 23});
    assert.equal(viewb.a, 21);
    assert.equal(viewb.b, 22);
    assert.equal(viewb.c, 23);

    const viewc = ℂ.extend(
      {a: 31, b: 32, c: 33},
      {a: 35}
    );
    assert(viewc.a == 35 && viewc.b == 32 && viewc.c == 33);

    const viewd = ℂ.extend(obja, objb, objc);
    assert.equal(viewb.a, 21);
    assert.deepEqual(viewd,
      { a: 31,
        b: 32,
        c: 23,
        d: 34,
        e: 35,
      }
    );
  });

  it('test two-level-deep views', function() {
    const src = {
      a: 1,
      b: {a: 3, c: 2}
    };
    const view = ℂ.extend(src);
    assert.equal(view.a, 1);
    assert.equal(view.b.a, 3);
    assert.equal(view.b.c, 2);
    assert.deepEqual(view, src);
  });

  it('deeply nested view', function() {
    const nested = [
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
    const view = ℂ.extend(...nested);
    const exp = {
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
  });
});

if (debug) console.log(
  '-------------------------- done views.test.js --------------------');

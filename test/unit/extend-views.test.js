// Test the default configuration of this library; that it matches what's
// documented.
"use strict";

const uut = require('../resolve-uut.js');
const debug = uut.debug;
const ℂ = uut.require();
console.log('uut.require: ', uut.require);

module.exports = (function (ℂ) {
  const assert = require('chai').assert;
  const R = require('ramda');
  const X = ℂ.extend;

  // This version of extend takes an array instead of variable # of args
  const Xa = R.apply(X);

  const sources = [
    { a: 1,
      b: ℂ(Ɔ=> Ɔ.a),
      c: 3, },
    { a: 12,
      d: ℂ(Ɔ=> Ɔ.a), },
    { a: 
      { m: 1234,
        n: { p: 7777, q: 9876, },
      },
      d: { m: { q: 8888 } },
      e: ℂ(Ɔ=> Ɔ.b.n.p)
    }
  ];

  describe('extend-views', function() {
    it('can generate a new clone', function() {
      var config0 = Xa( sources.slice(0, 1) );
      assert.deepEqual(config0, {a: 1, b: 1, c: 3});

      var config01 = Xa( sources.slice(0, 2) );
      const view01 = {
        a: 12,
        b: 12,
        c: 3,
        d: 12,
      };
      assert.deepEqual(config01, view01);

      // extend using the config instead of the source - same results
      var config01_a = X( config0, sources[1] );
      assert.deepEqual(config01_a, view01);

      // extend all three
      const config012 = Xa(sources);
      const merged012 = { a: { m: 1234, n: { p: 7777, q: 9876 } },
        d: { m: { q: 8888 }, n: { p: 7777, q: 9876 } },
        e: 7777,
        b: { m: 1234, n: { p: 7777, q: 9876 } },
        c: 3 };
      assert.deepEqual(config012, merged012);

      // check a few different combinations of swapping source -> config
      const config012_a = X(config0, sources[1], sources[2]);
      assert.deepEqual(config012_a, merged012);

      const config012_b = X(config01, sources[2]);
      assert.deepEqual(config012_b, merged012);
    });
  });
})();

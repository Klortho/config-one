// Unit tests of the low-level level implementation functions within the 
// module
"use strict";

const assert = require('assert'),
      vows = require('vows'),
      ℂ = require('../src/main.js');

var suite = vows.describe('low-level');

const obja = {a: 11, b: 12, c: 13};
const objb = {a: 21, c: 23, d: 24};
const objc = {a: 31, b: 32, d: 34, e: 35};
const objList = [obja, objb, objc];

suite.addBatch({
  'Creating object mappings': {

    // aggregate(acc, value) - used in reduce to push values into an array.
    'aggregate': function test_aggregate() {
      const aggregate = ℂ.private.aggregate;
      var t0 = aggregate(null, 7);
      assert(t0.length == 1);
      assert(t0 instanceof Array);
      assert(t0[0] == 7);
      var t1 = aggregate([9], 8);
      assert(t1.length == 2);
      assert(t1 instanceof Array);
      assert(t1[0] == 9);
    },

    'aggObjects': function test_aggObjects() {
      const aggObjects = ℂ.private.aggObjects;
      var t5 = aggObjects({}, objb);
      // t5:  { a: [ 21 ], c: [ 23 ], d: [ 24 ] }
      assert(t5.length = 3);
      assert(t5['a'][0] == 21);
    },

    'aggAllObjects': function test_aggAllObjects() {
      const aggAllObjects = ℂ.private.aggAllObjects;
      const agg = aggAllObjects(objList);
      assert.deepEqual(agg,
        { a: [11, 21, 31],
          b: [12, 32],
          c: [13, 23],
          d: [24, 34],
          e: [35]
        });
    },

    'mapping': function test_mapping() {
      const mapping = ℂ.private.mapping;
      const m0 = mapping(objList);
      assert.deepEqual(m0,
        { a: [11, 21, 31],
          b: [12, 32],
          c: [13, 23],
          d: [24, 34],
          e: [35]
        }
      );
      const m1 = mapping([{a: 1}]);
      assert.deepEqual(m1, {a: [1]});
    },
  },
})
.export(module);

// Test basic functionality of the recipes (formerly called "deferreds").
"use strict";

var assert = require('assert'),
    vows = require('vows');

var suite = vows.describe('recipes');

var ℂ = require('../src/main.js'),
    X = ℂ.extend;

suite.addBatch({
  'Recipe tests': {
    'Recipes are evaluated late': function() {
      var flag = false;
      var config = X(
        { a: 1,
          b: ℂ(Ɔ=> {
            flag = true;
            return 3;
          }),
        }
      );
      assert(!flag);
      assert(config.b == 3);
      assert(flag);
    },

    'Functions come through unscathed': function() {
      var config = X(
        { a: 1,
          b: ℂ(Ɔ=> function() { return 'ho'; }),
          c: function() { return 'hey'; },
        }
      );
      assert(config.c instanceof Function);
      assert.equal(config.b(), 'ho');
      assert.equal(config.c(), 'hey');
    },

    "Recipes can use 'this' to refer to the config" : function () {
      var config = X(
        { a: 1,
          b: ℂ(function() { return this.a; }),
        }
      );
      assert.equal(config.b, 1);
    },

    'Recipes can return objects': function() {
      var config = X(
        { a: {
            A: 79,
            B: 67,
          },
          b: ℂ(Ɔ=> ({
            A: 77,
            B: 88,
          })),
        }
      );
      assert.equal(config.a.A, 79);
      assert.equal(config.a.B, 67);
      assert.equal(config.b.A, 77);
      assert.equal(config.b.B, 88);
    },
    
    'Recipes cross-references': function() {
      var config = X(
        { a: {
            A: 79,
            B: 67,
          },
          b: ℂ(Ɔ=> ({
            A: 77,
            B: ℂ(Ɔ=> Ɔ.a),
          })),
        }
      );
      assert.deepEqual(config,
        { a: {
            A: 79,
            B: 67,
          },
          b: {
            A: 77,
            B: {
              A: 79,
              B: 67
            }
          }
        }
      );
    },

    'More recipe cross-references': function() {
      var config = X(
        { a: 42,
          b: ℂ(Ɔ=> ({
            A: 77,
            B: ℂ(Ɔ=> Ɔ.a),
          })),
          c: ℂ(Ɔ=> Ɔ.b.A),
        }
      );
      assert.equal(config.a, 42);
      assert.equal(config.b.A, 77);
      assert.equal(config.b.B, 42);
      assert.equal(config.c, 77);
    },

    'Service registry example': function() {
      var config0 = {
        ver: '1.0.0',
        mdlib: 'markdown-it',
        libs: ℂ(Ɔ=> ({
          mdlib: Ɔ.mdlib,
          jqlib: 'jQuery',
        })),
        cdn: 'https://cdn.org/',
        jqurl: ℂ(Ɔ=> Ɔ.cdn + Ɔ.libs.jqlib + '-' + Ɔ.ver),
      };
      var config1 = {
        ver: '1.1.0',
        libs: { funclib: 'ramda', },
        clibs: ℂ(Ɔ=> Ɔ.libs),
      };
      // FIXME: add config1
      var config = X(config0, config1);
      assert.deepEqual(config,
        { ver: '1.1.0',
          mdlib: 'markdown-it',
          libs: {
            mdlib: 'markdown-it',
            jqlib: 'jQuery',
            funclib: 'ramda'
          },
          cdn: 'https://cdn.org/',
          jqurl: 'https://cdn.org/jQuery-1.1.0',
          clibs: {
            mdlib: 'markdown-it',
            jqlib: 'jQuery',
            funclib: 'ramda'
          },
        }
      );
    },
  },
})
.export(module);

// Test basic functionality of the recipes (formerly called "deferreds").
"use strict";

const assert = require('chai').assert;

// units under test
const ℂ = require('../src/main.js');
const X = ℂ.extend;

describe('recipes', function() {

  it('evaluates recipes late', function() {
    var flag = false;
    const config = X(
      { a: 1,
        b: ℂ(Ɔ=> {
          flag = true;
          return 3;
        }),
      }
    );
    assert.isNotOk(flag);
    assert.equal(config.b, 3);
    assert.isOk(flag);
  });

  it('passes functions through', function() {
    const config = X(
      { a: 1,
        b: ℂ(Ɔ=> function() { return 'ho'; }),
        c: function() { return 'hey'; },
      }
    );
    assert.instanceOf(config.c, Function);
    assert.equal(config.b(), 'ho');
    assert.equal(config.c(), 'hey');
  });

  it('allows using "this" to refer to the config', function() {
    const config = X(
      { a: 1,
        b: ℂ(function() { return this.a; }),
      }
    );
    assert.equal(config.b, 1);
  });

  it('recipes can return objects', function() {
    const config = X(
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
  });

  it('handles recipe cross-references', function() {
    const config = X(
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
  });

  it('more recipe cross-references', function() {
    const config = X(
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
  });

  it('works with the service-registry example', function() {
    const config0 = {
      ver: '1.0.0',
      mdlib: 'markdown-it',
      libs: ℂ(Ɔ=> ({
        mdlib: Ɔ.mdlib,
        jqlib: 'jQuery',
      })),
      cdn: 'https://cdn.org/',
      jqurl: ℂ(Ɔ=> Ɔ.cdn + Ɔ.libs.jqlib + '-' + Ɔ.ver),
    };
    const config1 = {
      ver: '1.1.0',
      libs: { funclib: 'ramda', },
      clibs: ℂ(Ɔ=> Ɔ.libs),
    };
    const config = X(config0, config1);
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
  });
});

// THIS FILE IS A MESS
/*
 // Expected results for deferred stress test
 var expectedStress =  {
 images: { src: 'foobar' },
 srcSvgGlob: [ '/plyr/src/sprite/*.svg', 'foobar/*.svg' ],
 a1: 1,
 ℂ: 1,
 d1: 2,
 e1: 4,
 f1: 2,
 g1: 1,
 h1: { ha: 5, hb: 5 },
 h2: { a: { a: [ 7, 'fleegle', 5 ] } },
 i0: { a: { a: 21, b: 9 }, b: [ 9, 'snorky', 1 ] },
 i2:
 { z: 5,
 a: { a: 'snorky', b: 1 },
 b: [ -2, [ 9, 'snorky', 1 ] ],
 c: 'snorky' },
 i1: { ic: { ha: 5, hb: 5 }, id: { ha: 5, hb: 5 } },
 a2: 1,
 b2: 1,
 c2: [ { d0: 0, d1: 1 }, [ 'hello', 1 ] ],
 d2: { d0: 0, d1: 1 },
 e2: { e0: [ 'hello', 1 ] },
 f2:
 { fa: { a: { a: 1 } },
 fb: { a: [ 5, 'blue', { a: { a: 1, b: 'orange' } } ] } } };
 */



var defer = require('../../defer').deferConfig;

var config = {
  siteTitle : 'New Instance!',
};

config.map = {
  centerPoint :  { lat: 3, lon: 4 },
};

var RealServiceAdapter = function() {};
RealServiceAdapter.prototype.message = 'Real thing';
config.service = {
  // Add our service adapter to the regiistry
  registry: {
    'real': new RealServiceAdapter()
  },
  // Override the active service
  name: 'real'
};

var stressConfig = {
  // From issue #231
  images: {
    src: 'foobar',  // override
  },

  a1: 1,
  c1: defer(function(cfg) { return cfg.a1; }),
  d1: defer(function(cfg) { return cfg.a1 + cfg.a1; }),
  e1: defer(function(cfg) { return cfg.a1 + cfg.c1 + cfg.d1; }),
  // This one references an item that (perhaps) is evaluated later
  f1: defer(function(cfg) { return cfg.g1 + cfg.a1; }),
  g1: defer(function(cfg) { return cfg.a1; }),

  // deferreds in descendants
  h1: { ha: 5,
    hb: defer(function(cfg) { return cfg.a1 + cfg.e1; }), },
  h2: {
    a: {
      a: [
        7, 'fleegle',
        defer(function(cfg) { return cfg.a1 + cfg.e1; }),
      ],
    },
  },

  // For i0 - i2: see default.js

  a2: 1,
  b2: defer(function(cfg) { return cfg.a2; }),
  c2: defer(function(cfg) {
    return [
      cfg.d2,
      cfg.e2.e0,
    ];
  }),
  d2: defer(function(cfg) {
    return {
      d0: 0,
      d1: 1,
    };
  }),
  e2: defer(function(cfg) {
    return {
      e0: defer(function(cfg) {
        return [
          'hello',
          cfg.b2,
        ];
      }),
    };
  }),

  // For f2: see default.js
};

Object.keys(stressConfig).forEach(function(key) {
  config[key] = stressConfig[key];
});

module.exports = config;

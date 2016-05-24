var ρ = require('../main').recipe;

var config = {
 siteTitle : 'New Instance!',
};

config.map = {
  centerPoint : { lat: 3, lon: 4 },
};

// Example of how dependency injection might work
var RealServiceAdapter = function() {};
RealServiceAdapter.prototype.message = 'Real thing';
config.service = {
  // Add our service adapter to the registry
  registry: {
    'real': new RealServiceAdapter()
  },
  name: 'real',   // Override the name that identifies the active service
};

var stressConfig = {
  // From issue #231
  images: {
    src: 'foobar',  // override
  },

  a1: 1,
  c1: ρ(function(cfg) { return cfg.a1; }),
  d1: ρ(function(cfg) { return cfg.a1 + cfg.a1; }),
  e1: ρ(function(cfg) { return cfg.a1 + cfg.c1 + cfg.d1; }),
  // This one references an item that (perhaps) is evaluated later
  f1: ρ(function(cfg) { return cfg.g1 + cfg.a1; }),
  g1: ρ(function(cfg) { return cfg.a1; }),

  // deferreds in descendants
  h1: { ha: 5,
    hb: ρ(function(cfg) { return cfg.a1 + cfg.e1; }), },
  h2: {
    a: {
      a: [
        7, 'fleegle',
        ρ(function(cfg) { return cfg.a1 + cfg.e1; }),
      ],
    },
  },

  // For i0 - i2: see default.js

  a2: 1,
  b2: ρ(function(cfg) { return cfg.a2; }),
  c2: ρ(function(cfg) {
    return [
      cfg.d2,
      cfg.e2.e0,
    ]; 
  }),
  d2: ρ(function(cfg) {
    return {
      d0: 0,
      d1: 1,
    };
  }),
  e2: ρ(function(cfg) {
    return {
      e0: ρ(function(cfg) {
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

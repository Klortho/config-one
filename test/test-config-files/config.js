var ρ = require('../main').recipe;

var config = {
  siteTitle : 'Site title',
  latitude  : 1,
  longitude : 2,
};

config.welcomeEmail = {
  subject :  ρ(function(cfg) {
    return "Welcome to "+cfg.siteTitle;
  }),
  // A plain function should be not disturbed.
  aFunc  : function() {
    return "Still just a function.";
  },

  // Look ma, no arg passing. The main c1 object is bound to 'this'
  justThis: ρ(function() {
    return "Welcome to this "+this.siteTitle;
  }),
};

config.map = {
  centerPoint : ρ(function() {
    return { lat: this.latitude, lon: this.longitude };
  }),
};

config.name = ρ(function(cfg) {
  return {
    first: 'Robert',
    nickname: ρ(function(cfg) {
      return cfg.name.first == 'Robert' ? 'Bob' : 'Bruce'; 
    }),
  };
});

// Here's one way you could do dependency injection.
// Define a class to provide the default implementation of a service adapter.
// At runtime, some other c1 file could add to the registry, and/or reset the active service.
var MockServiceAdapter = function() {};
MockServiceAdapter.prototype.message = 'Mock service for development';
config.service = {
  registry: {
    mock: MockServiceAdapter,
  },
  name: 'mock',
  active: ρ(function(cfg) {
    return cfg.service.registry[cfg.service.name];
  }),
};

// "stress test" of the recipes. Some of this data is here, and some in local.js.
var stressConfig = {
  // From issue #231
  images: {
    src: 'happy-gardens',
  },
  srcSvgGlob: [
    '/plyr/src/sprite/*.svg',
    ρ(function (cfg) {
      return cfg.images.src + '/*.svg';
    })
  ],

  // For a1 - h2: see local.js

  // Recipes that resolve to trees
  i0: ρ(function(cfg) {
    return {
      a: { a: 21, b: 9, },
      b: [ 9, 'snorky', ρ(function (cfg) { return cfg.a1; })]
    }
  }),

  // Recipes within recipes
  i1: ρ(function(cfg) {
    return {
      ic: cfg.h1,  // .h1 has a deferred in it
      id: ρ(function(cfg) {
        return ρ(function(cfg) { return cfg.h1; });
      }),
    };
  }),

  // Referencing nested items
  i2: ρ(function(cfg) {
    return {
      z: 5,
      a: { a: cfg.i0.b[1], b: cfg.i0.b[2], },
      b: [ -2, cfg.i0.b, ],
      c: ρ(function(cfg) {
        return cfg.i2.b[1][1];  //=> 'snorky'; from a sib in the same subtree
      }), 
    };
  }),

  // For a2 - e2: see local.js

  // Some more deeply nested deferreds
  f2: {
    fa: {
      a: {
        a: ρ(function(cfg) { return cfg.a1; }),
      }
    },
    fb: {
      a: [
        5,
        'blue',
        { a: {
          a: ρ(function(cfg) { return cfg.c1; }),
          b: 'orange',
        },
        },
      ],
    },
  },
};

Object.keys(stressConfig).forEach(function(key) {
  config[key] = stressConfig[key];
});

module.exports = config;

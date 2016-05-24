// FIXME: When in a browser, defaults will be different (maybe, no defaults)
"use strict";

const C1 = require('./seed.js');
const recipe = C1.recipe;
const R = require('ramda');
const process = require('process');
const path = require('path');

const log = require('./log.js')({id: 'root'});
log.disable();


// Given a base directory, returns a function that resolves a path relative
// to that base
const resolveFrom = base => R.partial(path.resolve, [base]);

module.exports = function() {
  return {
    configDirEnv: 'CONFIG1_DIR',

    configDir: recipe(X=> {
      const env = X.configDirEnv;
      const rel = process.env[env] || process.cwd();
      return path.resolve(rel);
    }),

    // The list of config filenames that are searched for first, in order from
    // defaults -> overrides
    basenames: [ 'config', 'config-local' ],

    // List of valid filename suffixes
    suffixes: [ '.js', '.json' ],

    // List of filenames, which is the every combination of basenames and suffixes
    filenames: recipe(X=> {
      const mapcat2 = R.lift(R.curry((a, b) => a + b));
      return mapcat2(X.basenames, X.suffixes);
    }),

    // List of absolute pathnames
    pathnames: recipe(X=> {
      const resolve = resolveFrom(X.configDir);
      return R.map(resolve, X.filenames)
    }),

    // Environent variables. Setting this to the empty string or null will 
    // disable looking for config info in the environment  
    envPrefix: 'CONFIG1_',

    // The source specification types we understand. The `sources` option is
    // a list of source specifications, each of which is a plain object with a
    // type property that matches the key here.
    sourceTypes: {
      file: {
        makeSpec: pathname => {
          return {
            type: 'file',
            pathname: pathname
          };
        },
        specs: recipe(X=> {
          const self = X.sourceTypes.file;
          return X.pathnames ? R.map(self.makeSpec, X.pathnames) : null;
        }),
        fetch: function(srcspec) {
          try {
            return require(srcspec.pathname);
          }
          catch(err) {}
        },
      },

      envPrefix: {
        makeSpec: prefix => ({
          type: 'envPrefix',
          prefix: prefix
        }),
        specs: recipe(X=> {
          const self = X.sourceTypes.envPrefix;
          return X.envPrefix ? [self.makeSpec(X.envPrefix)] : null;
        }),
        fetch: function(srcspec) {
          // FIXME: implement!
        },
      },

      envJson: {
        makeSpec: name => ({
          type: 'envJson',
          name: name
        }),
        specs: recipe(X=> {
          const self = X.sourceTypes.envJson;
          return X.envJson ? [self.makeSpec(X.envPrefix)] : null;
        }),
        fetch: function(srcspec) {
          // FIXME: implement!
        },
      },
    },

    // Put them all together
    sources: recipe(X=> {
      // FIXME: this needs to concatenate all the specs, rather than just these two
      const stypes = X.sourceTypes;
      const srcs = stypes.file.specs.concat(stypes.envPrefix.specs);
      return srcs;
    }),

    // Function to take any source specification, and return the config data
    // for that source. This closes over the root view -- I'm pretty
    // sure that won't be a problem!
    fetchSource: recipe(X=>
      function(srcspec) {
        const type = srcspec.type,
              fetch = X.sourceTypes[type].fetch;
        return fetch(srcspec);
      }
    ),
  };
};

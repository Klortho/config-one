// Interestingly, this C1 doesn't have to be the exact C1 being used by
// main.js, since we're only using it for the .recipe method.
var C1 = require('../../../src/main.js');

var semver = require('semver');

// Compose a function to select the best matching semver from a list
var sort = semvers => semvers.sort(semver.lt);
var match = vexpr => (ver => semver.satisfies(ver, vexpr));
var best = (semvers, vexpr) => sort(semvers).find(match(vexpr));

module.exports = {
  cdn: 'https://cdn.org/',
  libs: {
    available: {
      'markdown-it': {
        versions: [ '1.0.0', '1.1.0', '2.0.1' ],
      },
      // ... 
    },
    required: {   // specify libs using semver
      'markdown-it': '>=2.0.0',
      // ...
    },

    // Recipe for the enabled libraries

    enabled: C1(X=> { 

      // Recipe will return this object
      var enabled = {};

      // References to other config items
      var available = X.libs.available,  
          required = X.libs.required;

      // For each required lib
      Object.keys(required).forEach(key => {   
        var req = required[key],
            avail = available[key];

        // Is it available?
        if (!avail || !avail.versions) { throw Error('lib not available');  }

        // Find a matching version

        // FIXME: for now, this is needed, because the `sort` method is not 
        // working on our array view
        var versions = C1.freeze(avail.versions);

        var winner = best(versions, req);
        if (!winner) { throw Error('no matching semver'); }

        enabled[key] = winner;
      });

      return enabled;
    })
  }
};


//console.log('done: ', C1.freeze(C1.extend(module.exports)));


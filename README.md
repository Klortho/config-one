# config-one

[![Build Status](https://travis-ci.org/Klortho/config-one.svg?branch=master)](https://travis-ci.org/Klortho/config-one)
[![Join the chat at https://gitter.im/Klortho/config-one](https://badges.gitter.im/Klortho/config-one.svg)](https://gitter.im/Klortho/config-one?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


A zero configuration (but highly configurable) library for managing app 
configuration data. This module uses a simple yet sophisticated algorithm,
based on functional programming principles, to provide a robust and  
flexible mechanism for managing and merging configuration data trees.

<div style='background: #DDD; border: 2px solid #888; border-radius: 1em; margin: 2em; padding: 0.8em;'>

***Alpha version***

This library is still in a very early stage, and the API is likely to change.

Also, currently this requires Node.js version 6. I'll fix the build process
so that the distribution version can be used with earlier versions, but  that
is not yet done.

</div>

## Features

* Flexible, robust overrides. You can overlay new configation sources at any 
  time.
* Computed configuration settings. Any setting can compute its value from 
  any other setting, using "recipes" (which are just JavaScript functions).
  Overrides preserve the references, and they *just work*. No need to worry 
  about the order of evaluation, how deep in the defaults the functions
  are, or any other implemention details.
* Many more. [More complete documentation coming soon.]


## Quick start

Install:

```
npm install config-one
```

Create a file called "config.js", with, for example:

```javascript
module.exports = {
  'current-site': 'prod',
  sites: {
    dev: {
      port: 8870,
      path: '/home/acme/project', 
    },
    prod: {
      port: 80,
      path: '/var/acme/data',
    }
  }
};
```

Access this from your scripts with, for example:

```javascript
var cfg = require('config-one')();

var siteConfig = cfg.sites[cfg['current-site']];
var port = siteConfig.port;   //=> 80
```

You can apply overrides from other sources at any time. By default, this library
looks for and reads config values from files in the current process' working 
directory, and from environment variables. 

You can specify an alternate directory to use as an option to `require`, or 
by setting the `CONFIG1_DIR` environment variable. 

The sources it uses by default are:

* `config.json`, `config.js` - default values
* `config-local.json`, `config-local.js` - local overrides
* Environment variables prefixed with `CONFIG1_` - take precedence over files

For example, to run a development version of your app, you could create a 
file named "config-local.json" (which typically would not be included in 
version control) with:

```json
{ "current-site": "dev",
  "sites": {
    "dev": { "port": 8880 }
  }
}
```

The `port` variable in the example above would then resolve to `8880`.

You could override any of those local settings with environment variables.
For example, if you ran with `CONFIG1_sites.dev.port=9000`, the example above
would yield `9000`.


## Overrides and recipes

In your JavaScript configuration files, you can use functions (called "recipes")
that specify how to derive some settings from others. For example, you could
include the logic to select the highest-version library that matches a semver
expression, right in your JavaScript configuration file:

```javascript
// config.js

var C1 = require('config-one');
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
```

The advantage of doing this is that you could override any of the settings,
whether they be from hard-coded data or recipes, and other settings that 
use those values will be correct. In other words, the semantic logic behind
the settings values does not get clobbered by the overrides.



More detailed documentation is coming soon, but for another example of what you 
can do, have a look at the options settings for this library itself, at
[src/defaults](src/defaults).

Note how the settings variables are normalized to eliminate redundancy, and
logic that derives some settings from others is baked in, using "recipes"
(sorry for the pun)! The unique thing about this library is that these recipes
will work, without having to fret about the order of evaluation, or when they
are evaluated, or how they are overridden. You can override them at any point
in the processing chain, and the library will do the right thing.




## API

```javascript
var C1 = require('config-one');

// Read configuration data according to the current options
var cfg = C1();

// Make a new, permanent clone with custom options.
var C2 = C1.new(opts);

// Read config data from a set of source specifiers.
var cfg = C1.read(...sourceSpecifiers)

// Create a new view over the supplied config objects and/or views
var cfg = C1.extend(...configs);

// Create a new recipe (used inside configuration objects)
C1.recipe(<function>)

// Shortcut for .recipe() (one argument which is a function)
C1(<function>)

// Make a permanent, static deep copy of a configuration view
var opts = C1.freeze(cfg);

```



## Building / development

```
npm install
npm test
```

To compile all the ES6 into more portable ES5, using babel:

```
npm run build   #=> products are written to dist/
```

## Acknowledgements

***node-config library***

This is a fantastic package, with a very well-thought out API.
I particularly like the default behavior, which makes
it dead simple to use out of the box. (It would be nice if it were more
configurable, though -- after all, it's a configuration manager!)

[Mark Stosberg](https://github.com/markstos) developed the "deferred"
feature of that library, and described an algorithm (see [this
comment](https://github.com/lorenwest/node-config/issues/266#issuecomment-207520735),
under "Proposed design: lazy resolution using getters") that evolved into the
one now used here.

***Chainmap (Python recipe)***

See this [Python recipe](http://code.activestate.com/recipes/305268/), by
Raymond Hettinger. This was where I first learned of the value of maintaining
the chain of maps indefinitely, and rather than resolving them, to provide
a view into them, that looks like a single map to the user.


## Future enhancements

See [Future enhancements](future.md).

## Implementation

See [Implementation details](implementation.md).

## To do

See [To do list](to-do.md)

## License

[WTFPL](http://www.wtfpl.net/)

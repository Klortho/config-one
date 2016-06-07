# config-one

[![Build Status](https://travis-ci.org/Klortho/config-one.svg?branch=master)](https://travis-ci.org/Klortho/config-one)
[![Join the chat at https://gitter.im/Klortho/config-one](https://badges.gitter.im/Klortho/config-one.svg)](https://gitter.im/Klortho/config-one?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


A zero configuration (but highly configurable) library for managing app 
configuration data. This module uses a simple yet sophisticated algorithm,
based on functional programming principles, to provide a robust and  
flexible mechanism for managing and merging configuration data trees.

***Alpha version***

This library is still in a very early stage, and the API is likely to change.

Also, currently this requires Node.js version 6. I'll fix the build process
so that the distribution version can be used with earlier versions, but  that
is not yet done.


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

    // Recipe to determine the enabled libraries
    enabled: C1(X=> { 
      var enabled = {};   // The recipe will return this object
      // References to other config items:
      var available = X.libs.available,  
          required = X.libs.required;

      Object.keys(required).forEach(key => {   
        var req = required[key],
            avail = available[key];

        if (!avail || !avail.versions) { throw Error('lib not available');  }

        // Find a matching version [FIXME: need `freeze` for now]
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

Putting these functions in the settings file allows you to override them at
any step in the processing chain, and other settings that 
use those values will be correct. In other words, the semantic logic that
ties the settings together does not get clobbered by the overrides.

More detailed documentation is coming soon, but for another example of what you 
can do, have a look at the options settings for this library itself, at
[src/defaults.js](src/defaults.js).

Note how the settings variables are normalized to eliminate redundancy, and
logic that derives some settings from others is baked in, using recipes
(sorry for the pun)! These recipes work without your having to fret about 
the order of evaluation, or how or when they are overridden. 


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

You can turn on some verbose debugging messages in various places by setting
the `C1_BUILD_DEBUG` environment variable to "true". This will go away once we
integrate a real logging framework.


```
npm install
npm test
```

To compile all the ES6 into more portable ES5, using babel, use the following.
Outputs are written to "dist".

```
npm run build
```

To generate the browser version dist/config-one.js:

```
webpack
```

## Testing

This test suite uses mocha, run against files in the test/ subdirectory tree
that match "test*.js".

Building and running the various combinations of tests and environments is
controlled by two environment variables:

* `C1_BUILD_UUT` - defaults to 'src'
* `C1_BUILD_TARGET` - defaults to 'node'

[Note to self:  if any module encounters one of these unset, then it must either:

1. Use the default value above, or
2. If it is positioned such that it can reset it and be sure all other modules
  well get the new value (like the webpack config, for example) then it can
  change the env. variable to a new value.]

A third variable turns on  some verbose messages in places:

* `C1_BUILD_DEBUG`

### node / src

```
npm test
```

The `test` script is defined in package.json, and you could run it without
`npm`, as well:

```
test/test.sh
```

That shell script, in turn, is just a thin wrapper around this command:

```
mocha -R nyan `find ./test -name '*.test.js'`
```

To run an individual test from the suite, just specify it by filename. For
example:

```
mocha -R nyan test/low-level.test.js
```


### node / dist

This mode runs the same suite of tests against the final, bundled library.
First make sure you build the distribution bundle (with `webpack`) and then,
to run the tests, either of these will work (they are equivalent):

```
npm run test-dist
C1_BUILD_UUT=dist npm test
```

This invokes the same script as above, test/test.sh, but with the `C1_BUILD_UUT`
environment variable set to indicate the "unit-under-test".


### browser smoke test

This doesn't use mocha, it is just a basic test to make sure the distribution
bundle is working.

Running this without the webpack-dev-server provides an additional assurance
that the static library bundle works as a stand-alone, relocatable module.

```
webpack               #=> builds dist/config-one.js
http-server -p 9000   #=> avoid port conflict with the webpack-dev-server
```

Then open http://localhost:9000/test/browser-smoke-test.html, and verify that
you see a green "pass" on the page.

Viewing this smoke test page through the dev server allows it to reflect
changes to source files on the fly.

```
webpack-dev-server
```

Then open http://localhost:8080/test/browser-smoke-test.html (note the port
number is different from above).

Note that when there are changes to source files, the dev server will 
automatically rebuild the bundle and serve it from memory at the URL
path /dist/config-one.js. To get the physical file to be rebuilt, you'll still
need to run the `webpack` command separately.


### browser / src

As with a normal web application, there are two main ways of running the Mocha 
test suite through a browser: with a static bundle (in this case, it's
a test bundle, that includes the library bundle within it), or by using
the webpack-dev-server.

To create the static bundle:

```
webpack --config test/webpack.test.config.js
```

Then, start your static web server, and bring up this page (assuming your 
server is on port 9000): http://localhost:9000/test/test.html.


The work with these tests using the dev server:

[***This is the best option for dynamically viewing test results as you develop.
since this dev server instance will rebuild everything whenever there is any
change to a library source file or to a test.***]

```
webpack-dev-server --config webpack.test.config.js
```

Then bring up http://localhost:8080/test/test.html. (If you want to change the
dev server port number, you have to do it from the command line.)


### browser / dist

This is nearly the same as the previous example. The only difference is that
the test modules `require` the library from the distribution bundle, rather
than directly from the sources.

To create the static bundle:

```
C1_BUILD_UUT=dist webpack --config webpack.test.config.js
```

Then bring the file up in 
http://localhost:9000/test/test.html.

To view it through the webpack-dev-server, do the following (but note that this
does not auto-rebuild when there are changes to the original source files, so
this setup isn't recommended):

```
C1_BUILD_UUT=dist webpack-dev-server --config webpack.test.config.js --hot
```

And then point your browser at http://localhost:8080/test/test.html.



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

## Implementation, other notes

Are at [config-one-project](https://github.com/klortho/config-one).

## License

Public domain. 

[ODC Public Domain Dedication & License 
1.0](http://opendatacommons.org/licenses/pddl/1.0/)

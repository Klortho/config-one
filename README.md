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
the `C1_DEBUG` environment variable to "true". This will go away once we
integrate a real logging framework.

To install all the needed dependencies:

```
npm install
```

Run unit tests against the original source files with:

```
npm test
```

To compile all the ES2015 (also known as EcmaScript 6) into more portable ES5, 
invoke `babel` with:


[FIXME: when Babel is integrated with webpack, we should probably do away with 
this step.]

```
npm run build     #=> outputs are written to build/
```

To generate the main cross-platform distribution bundle:

```
webpack        #=> dist/config-one.js:
```

The next sections give reference information and some how-tos

## Directory and file conventions

The directory structure of this app looks like the following. This list is
annotated with some rationale information.

```
/
  package.json
  webpack.config.js
  ...
  src/
  dist/  - just for final distribution packages
  test/
    ✓run.sh - just runs the mocha tests without bundling - this is currently
        test.sh. It is what is invoked by the `npm test` scripts.
    ✓index.html  - driver for the mocha tests in the browser, the main JS
        this invokes are ../build-{src|dest}/test-bundle.js.
    webpack.test.config.js
    check-spec.js  - and any other utility modules

    unit/         - sources for the unit tests
        main.js   - currently this is test/index.js
        <name>.test.js
        ...
    smoke/
        browser-test.html
        browser-test.js
    build/      - test bundles
        test-bundle-src.js
        test-bundle-dist.js
    reports/
        src/    - separate destination for each unit-under-test
        dist/
```



## Testing

The unit test scripts use mocha/chai, and are in the test/unit/ subdirectory,
with names that end with ".test.js".

Building and running the various combinations of tests and environments is
controlled by two environment variables:

* `C1_UUT` - defaults to 'src'
* `C1_TARGET` - defaults to 'node'

[FIXME: I don't thing `TARGET` actually makes sense here, since we are 
producing a single "UMD" bunde that runs anywhere.]

A third variable can but used to turn on some verbose messages in places:

* `C1_DEBUG`


### Testing sources: $C1_UUT = "src"

As describe above, to run the unit tests against the original source files, 
from the command line, just enter

```
npm test
```

The `test` script is defined in package.json, and you could run it manually,
without `npm`, if you need to:

```
test/run.sh
```

That shell script, in turn, is just a thin wrapper around this command:

```
mocha -R mochawesome --reporter-options \
  "reportDir=$REPORT_DIR,reportName=test-report" $TEST_FILES
```

In addition to reporting the test status on the console, this also produces a 
very informative HTML report at test/reports/src/test-report.html.

To run an individual test from the suite, just specify it by filename. For
example:

```
mocha test/unit/low-level.test.js
```

### Node.js platform, testing "dist"

This mode runs the same suite of tests against the final, bundled library.
First make sure you build the distribution bundle (with `webpack`) and then,
to run the tests:

```
npm run test-dist
```

This invokes the same script as above, test/test.sh, but with the `C1_UUT`
environment variable set to "dist".


### Browser smoke test

This doesn't use mocha, and doesn't run extensive unit testing. It is just a 
basic test to ensure that the distribution bundle can run in whatever browser
you use.

Running this without using any runtime webpack components (such as the 
webpack-dev-server), provides an additional assurance that the bundle can
be distributed.

To use it, make sure the distribution bundle has been build, then start a
static server, with, for example:

```
http-server -p 9000
```

Then open http://localhost:9000/test/smoke/browser-test.html, and verify that
you see a green "pass" indication on the page.

Viewing this smoke test page through the dev server allows it to update 
dynamically with every change to a source file.

```
webpack-dev-server
```

Then open http://localhost:8080/test/browser-smoke-test.html. (Note the port
number is different!)

When there are changes to source files, the dev server will 
automatically rebuild the bundle and serve it from memory at the URL
path /dist/config-one.js. 


### browser / src

As with a normal web application, there are two main ways of running the Mocha 
test suite through a browser: with a static bundle (in this case, it's
a test bundle, that includes the library code bundle within it), or by using
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
C1_UUT=dist webpack --config webpack.test.config.js
```

Then bring the file up in 
http://localhost:9000/test/test.html.

To view it through the webpack-dev-server, do the following (but note that this
does not auto-rebuild when there are changes to the original source files, so
this setup isn't recommended):

```
C1_UUT=dist webpack-dev-server --config webpack.test.config.js --hot
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

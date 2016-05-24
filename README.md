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

* Seamless cascade. Create new configs at any time, using any other to
  provide the defaults.
* Computed configuration settings. Any setting can compute its value from any other
  setting, using "recipes" (which are just JavaScript functions). Overrides preserve
  these references, and they *just work*. No need to worry about the order of
  evaluation, or any other implemention details.
* Fast and efficient - settings are resolved in O(log n) time (FIXME: need to verify).


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








Options

`fetchSource(sourceSpec)` - fetches a real source object from a specifier




Each item in the `configs` list is one of:

- a plain-old config (JavaScript object), 
- a string - filesystem path or a url
- a View (?)
- a `recipe` that produces one of the above. This recipe's context is
  `c1`'s options object.


## How tos / use cases

* This could be used to implement a universal configuration handler for an
  application. Build configuration and runtime configuration could be managed
  the same way. For example, request time info like cookies or query-string
  parameters could be used to override selected configuration data to aid in
  debugging.

* *Recipes* could be leveraged to provide validation and/or normalization of
  data values. See this [feature
  request](https://github.com/lorenwest/node-config/issues/319) against
  node-config, for example.

### Recursive option-setting API

A very useful pattern for a software library is to provide a way for users to override
settings values. To maximize the potential for reuse, and handy software pattern is
to return an object to the user that behaves just like the original object (same API)
but with modified options.

Extending that idea to its logical conclusion, the returned object should itself
expose the same interface for allowing options to be overridden. To any user of
*that* object, the overridden settings look like the defaults.


### Frozen configs

A *frozen config* is a *config* that has had
all of its *recipes* evaluated (think of cooking all the dishes, packing them
in tupperware, and putting them in the freezer).

There are no artifacts of this library left
in the tree. All objects remaining in the tree are plain JavaScript (note that
that's not the same as "plain old JSON" -- they can include any kind of
JavaScript object, class, function, etc., *except* the ones from this
library.)

This would have to be a deep copy of the original, since we depend on
the immutability of the original *objects*.



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

See [Future enhancements](doc/future.md).

## Implementation

See [Implementation details](doc/implementation.md).

## To do

* Finish the default sources for config info.

* Document with literate programming technique. The "implementation section
  is huge, and the comments in the code are extensive, and there's a lot of 
  overlap. I think a literate programming library could turn it into a really
  nice document.

* Use klortho/tree to develop easy-to-use animated tree diagram

* Instead of my current mix-in strategy for c1 objects, use an ES6 class with a 
  Symbol.species of `Function` (see 
  [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#Species))

* Also use a Symbol to identify recipe instances.
  Read this [intro to species](http://blog.keithcirkel.co.uk/metaprogramming-in-es6-symbols/)

* Find and destroy `FIXME`s

* See also [GitHub issues](https://github.com/Klortho/config-one/issues)

* Add some of the write-up of "motivation", in
  [settings-resolver](https://github.com/Klortho/settings-resolver), to
  this README.

* Let's use
  [d3-flextree](http://klortho.github.io/d3-flextree/index.html) to make
  some nifty animated diagrams, illustrating how it works. See also
  [dtd-diagram](http://klortho.github.io/dtd-diagram/)

## License

[WTFPL](http://www.wtfpl.net/)

# To do

## For initial alpha release

* Check phone for other ideas for the presentation
* Talk about why people put stuff into config files in the first place: because
  it's easier to make changes there.
* Build a browser version
* Integrate with tree-chart and make a demo page


## First beta release

* Change license
* Get it working (for runtime, not dev) in earlier versions of node. How to 
  get travis to test runtime-only in those environments?

* Finish the documentation. Go through:
    * Content below the fold, below
    * [implementation.md](implementation.md)
    * [future.md](future.md)

* Finish implementing these sources for config:
    * envPrefix
    * envJson

* Get it working robustly with arrays and functions.
    * See the GitHub issue
    * See get-all-property-names.js for some experiments
    * Verify you fix the problem in test-examples/readme3

* Add some of the write-up of "motivation", in
  [settings-resolver](https://github.com/Klortho/settings-resolver), to
  the README.


## Improve presentation / demo

* Document with literate programming technique. The "implementation section
  is huge, and the comments in the code are extensive, and there's a lot of 
  overlap. I think a literate programming library could turn it into a really
  nice document.

## Implementation improvements

* Instead of my current mix-in strategy for the new C1 objects, use an ES6 
  class with a Symbol.species of `Function` (see 
  [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#Species))

* Also use a Symbol to identify recipe instances. Read this [intro to 
  species](http://blog.keithcirkel.co.uk/metaprogramming-in-es6-symbols/)


----

Integrate all this content into the README, after going through it.


Caveats:

* Don't expect to change the config files, and then be able to reload them
  using the same C1 object. If you ever want to reload files that have been
  loaded before, use `C1.new()`.


Add to "future":

* Any override can reach in and access any layer of the chain. You could make
  alias top-level keys for this purpose, like, `C.__layer[5]...`. The
  current layer number could be `C.__currentLayer`.
* Inside recipes, be able to access config info through relative references.


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



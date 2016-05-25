"use strict";
const path = require('path');
const process = require('process');
const R = require('ramda');
const util = require('util');

const log = require('./log.js')({id: 'root'});
log.disable();


// template - private - This function is copied for new c1 instances. The body
// of this function implements the main user API.
const template = function(...args) {
  const c1 = this.c1,
        opts = this.options;

  log.enter('seed:template: welcome my son, num args: ' + args.length);
  var ret;

  // If there's just one argument that is a Function, then this is being used
  // as a shortcut for `recipe`.
  if (args.length == 1 &&
      args[0] instanceof Function && nodeType(args[0]) !== 'recipe') {
    ret = recipe(args[0]);
  }
  else {
    log.enter('calling read');
    ret = c1.read.apply(c1, c1.options.sources);
  }

  log.exit();
  return ret;
};

// clone() - private - Create a new c1 object, by making a copy of template
// with a new binding. This does not set the options.
const clone = function() {
  // Bind c1 to a "back" object so it can find itself when invoked.
  const back = {};
  const c1 = template.bind(back);
  back.c1 = c1;
  
  // Mix in properties and bind methods
  R.keys(Config1).map(key => {
    const v = Config1[key];
    c1[key] = (v instanceof Function) ? v.bind(c1) : v;
  });
  return c1;
};

// c1.new(opts) - Create a new c1 object from an existing one, overriding options
const _new = function(opts) {
  const c1 = this;
  const next = clone();

  // If no opts were given, use an empty object. This forces the library to
  // create a new view, which means all recipes (which might depend on env.
  // variables, for instance) will get re-evaluated.
  next.options = c1.extend(c1.options, (opts || {}));
  return next;
};

// Traverse-type utilities. 
// FIXME: I want to make sure that all of the routines here use the same
// lower-level functions, so that they all agree on exactly how they deal
// with various properties and attributes.

// visit every node in a config object (without evaluating recipes) or
// a view, running pre- and post-traversal functions on each.
const walk = R.curry((pre, post, tree) => {
  pre(tree);
  Object.keys(tree).map(walk(pre, post));
  post(tree);
});

// Quick and dirty deep equals.

// compare types, considering view and object to be the same
const cmpType = function(item) {
  const t = nodeType(item);
  return t == 'view' ? 'object' : t;
};

const deepEqual = (actual, expected) => {
  const ta = cmpType(actual),
        tb = cmpType(expected);
  if (ta !== tb) return false;
  if (ta === 'recipe') return actual === expected;
  if (ta === 'atom') {
    return (actual == expected);
  }

  const aKeys = Object.keys(actual);
  const eKeys = Object.keys(expected);
  if (aKeys.length != eKeys.length) return false;
  aKeys.map(function(k) {
    if (!(k in expected)) return false;
    if (!deepEqual(actual[k], expected[k])) return false;
  });
  return true;
};

// ✓ has test.
// Create a new array if it doesn't exist already, and push a value into it.
const aggregate = function(acc, value) {
  const _acc = acc || [];
  _acc.push(value);
  return _acc;
};

// ✓ test-low-level
// For every key in obj, aggregates it with the corresponding value in the
// accumulator. The accumulator's values are arrays
const aggObjects = function(acc, obj) {
  R.keys(obj).map(key => {
    acc[key] = aggregate(acc[key], obj[key]);
  });
  return acc;
};

// ✓ test-low-level
// Given a list of objects, return a new object whose keys are the union of
// all of the keys in the list, and whose values are arrays of all the values
// that occur for that key. In other words, this turns an array of objects into
// an object of arrays.
const aggAllObjects = function(objects) {
  return R.reduce(
    function (acc, obj) {
      return aggObjects(acc, obj);
    }, {}, objects
  );
};

// ✓ test-low-level
// Creates a mapping of an array of objects. The set of keys is the union of
// the sets of all of the keys in objects. The values are arrays of the values
// from the objects that have those keys.
const _mapping = function(objects) {
  return aggAllObjects(objects);
};

// c1.read(...sourceSpecifiers) - Construct a new root view from a list
// of source specifiers. This is called when the user invokes the main module
// function with no arguments. In that case, the sourceSpecifiers are generated
// from the default options.
// Sources are in the order from defaults to
// overrides. (That's per the user API. The first thing we do is reverse them;
// internally they are always in the order of highest-precedence override
// first.)
// If none of the sources resolve to any config data objects, this returns null.
const read = function(...specs) {
  const c1 = this;

  // Reverse them, to get them into "internal" order
  const rspecs = R.reverse(specs);

  // Fetch the real sources from the user-supplied source-specifiers.
  const _sources = rspecs.map(spec => c1.options.fetchSource(spec));
  const sources = _sources.filter(s => !!s);

  const root = (sources.length == 0) ? null : (()=> {
    const _root = newView(null, sources, null, 0);

    const data = _root.__config1__;
    data.root = _root;
    data.c1 = c1;
    return _root;    
  })();

  return root;
};

// c1.extend(...configs) - the arguments are config objects, that are merged
// together in order from defaults to higher-precedence overrides.
const extend = function(...configs) {
  const c1 = this;

  // Reverse them, to get them into "internal" order
  const rconfigs = R.reverse(configs);

  // If an item is a view, replace it with its original sources
  const getSources = item =>
    (nodeType(item) === 'view') ? item.__config1__.sources : item;

  // If any are views, replace them with their original sources
  const sourceGroups = R.map(getSources, rconfigs);

  // Flatten into a single array
  const sources = R.flatten(sourceGroups);

  // Wrap them in a view
  const root = newView(null, sources, null, 0),
        data = root.__config1__;
  data.root = root;
  data.c1 = c1;
  return root;
};

// If srcnode is of `recipe` type, evaluate it recursively, until you get
// something that's not.
const cook = function(root, srcnode) {
  const t = nodeType(srcnode);
  const cooked = (t === 'recipe') ?
    // use `.call(root, root)` so `root` is bound to `this` inside the recipe
    cook(root, srcnode.eval.call(root, root)) : srcnode;
  return cooked;
};

// Cook all the recipes inside a set of sources
const cookAll = function(root, sources) {
  const cooked = sources.map(srcnode => cook(root, srcnode))
  return cooked;
};

// newView - the heart of the algorithm for managing the view.
// Sources are in "internal" order: highest precedence first. The source nodes
// can be of any type: atom, object, recipe, or vnode.
const newView = function(root, sources, key, depth) {
  // Cook the recipes, for all of the top-level nodes of each of the sources
  // in the list
  // FIXME: for now, recipes cannot be at the root. I'd like to make that an
  // option. If so, the context will be the c1 object itself.
  const cooked = root ? cookAll(root, sources) : sources;

  // FIXME: Make an option for the user to pass in a validator that gets applied
  // here. One "canned" validator might be one that 
  // made sure that an item is not getting overridden by 
  // something of a different type
  const item = cooked[0];
  const t = nodeType(item);

  // The node must be either an atom, view, or object. If it's an atom or view,
  // we'll just return it as-is. Otherwise ...
  const vnode = (
    t !== 'object' ? item :
      item instanceof Array ? [] : {}
  );

  if (t === 'object') {
    // Determine the real root
    const _root = root ? root : vnode;

    // Make the mapping for all of the keys to the lists of sources for that key.
    const mapping = _mapping(cooked);

    // Add a non-enumerable property __config1__ to the view, to store various
    // data, and keep it from colliding with the source's property names.
    // FIXME: use an ES6 Symbol for this -- are there good polyfills?
    const data = {
      root: _root,
      key: key,
      depth: depth,
      mapping: mapping,
      sources: sources,
    };
    Object.defineProperty(vnode, '__config1__', {
      __proto__: null,
      value: data,
    });

    // Make the getters.
    // Contract: a getter always returns an atom or a view (never
    // a source object or a recipe).
    const memos = {};  // memoize results
    R.keys(mapping).map(function (childKey) {
      Object.defineProperty(vnode, childKey, {
        __proto__: null,
        enumerable: true,
        configurable: false,
        get: function () {
          if (!(childKey in memos)) {
            memos[childKey] =
              newView(_root, mapping[childKey], childKey, depth + 1);
          }
          return memos[childKey];
        }
      });
    });
  }
  return vnode;
};

// nodeType - determine the type of a node; one of: atom,
// object, recipe, or view.
const nodeType = function(node) {
  if (!node || typeof node !== 'object') return 'atom';
  if (typeof node === 'object' && '__config1__' in node) return 'view';
  if (node instanceof Date) return 'atom';
  // The test for Recipe addresses the concern in this PR (but it's not
  // a complete fix): https://github.com/lorenwest/node-config/pull/205.
  // FIXME: I think using an ES6 Symbol would work here.
  if (node instanceof Recipe ||
    (('constructor' in node) && (node.constructor.name === 'Recipe')))
    return 'recipe';
  return 'object';
};

// Recipe class
var Recipe = function(func) {
  this.eval = func;
};

// recipe(func) function - part of the API.
// This is a Recipe factory, it is exposed for use in the source data tree to
// wrap functions, turning them into recipes.
var recipe = function(func) {
  recipeCount++;
  return new Recipe(func);
};

// Keep a count of the total number of recipes created
// FIXME: put back in the feature that checks for this, and if it's zero,
// doesn't walk the tree.
var recipeCount = 0;


// Utilities
//----------

// freeze

// FIXME: this is not thoroughly tested yet.
var freeze = function(cfg) {
  return (function _freeze(cfg, key) {
    var t = nodeType(cfg);
    const keystr = (key ? `${key}: ` : '');
    var ret = cfg;

    if (t === 'atom') {
    }

    else if (t === 'view') {
      // FIXME: need to clone a function maybe
      ret = (cfg instanceof Array) ? [] : {};
      Object.keys(cfg).forEach(function(k) {
        ret[k] = _freeze(cfg[k], k);
      });
    }

    // should be none of these:
    else if (t === 'object' || t == 'recipe') {
      console.error('Very strange indeed!');
    }

    return ret;
  })(cfg);
};

// Pretty-printer

// config object -> string
const ppString = obj => 
  util.inspect(obj, {showHidden: true, depth: null});  

// config object -> print to stdout
const ppConsole = cfg => {
  console.log(ppString(freeze(cfg)));
};


// Prepare exports

// Expose the private functions in a `private` property, for unit tests
const _private = {
  aggAllObjects: aggAllObjects,
  aggObjects: aggObjects,
  aggregate: aggregate,
  clone: clone,
  mapping: _mapping,
  Recipe: Recipe,
  recipeCount: recipeCount,
  template: template,
  nodeType: nodeType,
};

const Config1 = {
  extend: extend,
  new: _new,
  read: read,
  private: _private,
  recipe: recipe,
  freeze: freeze,
  ppString: ppString,
  ppConsole: ppConsole,
  walk: walk,
  deepEqual: deepEqual,
};

// C1.seed - The original C1 object, from which all others derive. This is the
// the export of this module. This has to come last, after Config1 has been
// initialized.
const seed = clone();
seed.options = {};
_private.seed = seed;

module.exports = seed;

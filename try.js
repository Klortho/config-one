const assert = require('assert');
const path = require('path');
const process = require('process');
const R = require('ramda');
const util = require('util');



var b = a +
{
  console.log('hey');
  'hey';
};


//const C2 = C1.new();
//assert(C1 !== C2);


/* A little FP for directory resolvers

const fromHere = R.partial(path.resolve, [__dirname]);
console.log('up one: ' + fromHere('..'));

// Given a base directory, returns a function that resolves a path relative
// to that base
const resolveFrom = base => R.partial(path.resolve, [base]);

const fromHome = resolveFrom('/Users/klortho');
console.log('temp: ' + fromHome('temp'));
*/


/*
const pp = obj => {
  console.log(util.inspect(obj, { showHidden: true, depth: null }));  
};

const ppOpts = cfg => {
  const opts = cfg.options;
  const srcs = cfg.freeze(opts);
  console.log('======================================================');
  pp(srcs);
};

//ppOpts(C1);


process.chdir('test');
console.log('cwd: ' + process.cwd());
const c2 = C1.new({});
ppOpts(c2);
*/
// Master test file used by webpack to create the test bundle. This cannot be
// executed outside of webpack.
'use strict';

// Set the environment variables. These are made available to the modules 
// through the EnvironmentPlugin. Default values come from
// webpack.test.config.js.

const debug = process.env.C1_BUILD_DEBUG || false;
const uut = process.env.C1_BUILD_UUT || 'src';
const target = process.env.C1_BUILD_TARGET || 'node';
if (debug)
  console.log('test/index.js: uut: ', uut, ', target: ', target);

// This will search for files ending in .test.js and `require` them,
// so that they are added to the webpack bundle.
var context = require.context('.', true, /.+\.test\.js?$/);
context.keys().forEach(context);
module.exports = context;

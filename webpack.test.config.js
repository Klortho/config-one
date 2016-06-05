// Configuration for bundling the test suite. The tests are very portable,
// and the bundled version is, as well -- it can run from either Node.js or
// the browser.

const path = require('path');
const webpack = require('webpack');

// If the environment variables C1_BUILD_UUT and/or C1_BUILD_TARGET aren't set, then
// this sets them to default values for the duration of this build:
// - C1_BUILD_UUT: src
// - C1_BUILD_TARGET: browser

if (!process.env.C1_BUILD_UUT) process.env.C1_BUILD_UUT = 'src';
if (!process.env.C1_BUILD_TARGET) process.env.C1_BUILD_TARGET = 'browser';
const debug = process.env.C1_BUILD_DEBUG || false;
const uut = process.env.C1_BUILD_UUT;
const target = process.env.C1_BUILD_TARGET;
if (debug)
  console.log('webpack.test.config.js: uut: ', uut, ', target: ', target);


module.exports = {
  context: __dirname,
  entry: 'mocha!./test/index.js',
  output: {
    path: __dirname + '/tdist',
    filename: 'tbundle.js',
    publicPath: "/tdist/",
  },
  devtool: 'inline-sourcemap',
  plugins: [
  /*
    // FIXME: I don't think we'll need this anymore.
    // We need to pass environment information into our modules. We could use
    // EnvironmentPlugin, but it clobbers the Node.js global process object,
    // and we want our bundle to be usable both on browsers and in Node.js.
    // So, we're using the DefinePlugin with a custom variable.
    (function() {
      return new webpack.DefinePlugin({
       'CONFIG_ONE_ENV': {
          'C1_BUILD_UUT': `"${uut}"`,
          'C1_BUILD_TARGET': `"${target}"`,
        }
      });
    })(),
  */

    new webpack.EnvironmentPlugin([
      'C1_BUILD_DEBUG',
      'C1_BUILD_UUT',
      'C1_BUILD_TARGET',
    ])
  ],
};

// Configuration for bundling the test suite. The tests are very portable,
// and the bundled version is, as well -- it can run from either Node.js or
// the browser.

const path = require('path');
const webpack = require('webpack');

// If the environment variables C1_UUT and/or C1_TARGET aren't set, then
// this sets them to default values for the duration of this build:
// - C1_UUT: src
// - C1_TARGET: browser

if (!process.env.C1_UUT) process.env.C1_UUT = 'src';
if (!process.env.C1_TARGET) process.env.C1_TARGET = 'browser';
const debug = process.env.C1_DEBUG || false;
const uut = process.env.C1_UUT;
const target = process.env.C1_TARGET;
if (debug)
  console.log('webpack.test.config.js: uut: ', uut, ', target: ', target);

const outputPath = path.join(__dirname, 'build');

module.exports = {
  context: __dirname,
  entry: 'mocha!./index.js',
  output: {
    path: outputPath,
    filename: `test-bundle-${uut}.js`,
    publicPath: outputPath,
  },
  devtool: 'inline-sourcemap',
  plugins: [
    new webpack.EnvironmentPlugin([
      'C1_DEBUG',
      'C1_UUT',
      'C1_TARGET',
    ])
  ],
};

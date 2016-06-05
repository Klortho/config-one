var glob = require('glob')
var path = require('path');
var webpack = require('webpack');

const projDir = path.join(__dirname, '..');
const tests = glob.sync(path.join(projDir, 'test/**/test*.js'));


module.exports = {
  context: projDir,
  entry: tests.map(path => 'mocha!' + path),
  output: {
    path: __dirname,
    filename: 'test-bundle.js',
  },
  devtool: 'inline-sourcemap',
  plugins: [
  ],
};

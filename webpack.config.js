var webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: "./src/main.js",
  output: {
    library: 'config1',
    libraryTarget: 'var',
    path: __dirname + '/dist',
    filename: 'config1.js',
  },
  devtool: 'inline-sourcemap',
  plugins: [
  ],
};

// Others we'll probably want:
//    // minified:
//    output: {
//      filename: 'bundle.min.js',
//    },
//    plugins: [
//      //new webpack.optimize.DedupePlugin(),
//      //new webpack.optimize.OccurenceOrderPlugin(),
//      new webpack.optimize.UglifyJsPlugin({
//        mangle: false, sourcemap: false
//      }),
//    ]

console.log(module.exports);

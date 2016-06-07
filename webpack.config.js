var webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: "./src/main.js",
  output: {
    library: 'C1',
    libraryTarget: 'umd',
    path: __dirname + '/dist',
    // FIXME: this needs to change to 'config-one':
    filename: 'config-one.js',
    publicPath: "/dist/",
  },
  devtool: 'inline-sourcemap',
  plugins: [],
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

//console.log(module.exports);

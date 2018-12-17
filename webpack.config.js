var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: __dirname + '/src/tpanorama.js',
  output: {
    path: __dirname + '/lib',
    filename: 'tpanorama.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
};
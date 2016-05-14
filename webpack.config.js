var path = require("path");

module.exports = {
  entry: "./test.tsx",
  output: {
    filename: 'app.js',
    path: './',
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['', '.webpack.js', '.json', '.web.js', '.ts', '.tsx', '.js']
  },
  module: {
    loaders: [
     { test: /node_modules[\/\\]react-geocoder[\/\\].*\.js/, loader: 'babel-loader', query: {presets:['react','es2015']}},
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.css$/, loader: 'style!css'},
      { test: /\.ts(x?)$/, loader: 'ts-loader' },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
      { test: /\.png$/, loader: "url-loader?mimetype=image/png" },
      { test: /\.json$/,    loader: "json-loader" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
    ]
  },
  devtool:'source-map',
    devServer: {
        contentBase: "./",
        hot:false
    }
}


const glob = require('glob');

module.exports = {
  mode: 'development',
  target: 'node', // use require() & use NodeJs CommonJS style
  entry: glob.sync('./src/**/*.{ts,tsx,js}').reduce((acc, file) => {
    acc[file.replace(/^\.\/src\//, '').replace(/\.[a-z]+$/, '')] = file;
    return acc;
  }, {}),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name]-[id].js',
    path: `${__dirname  }/dist`
  },
};
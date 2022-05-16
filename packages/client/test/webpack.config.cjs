const path = require('path');
var glob = require('glob');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const getTests = () => glob.sync(`${__dirname}/tests/**/*-test.{js,ts}`);

module.exports = {
  mode: 'development',
  entry: () => ['./tests.ts', ...getTests()],
  context: path.resolve(__dirname),
  target: 'web',
  devtool: 'inline-source-map',
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
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
    alias: {
      '@yavin/client': path.resolve(__dirname, '../src'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

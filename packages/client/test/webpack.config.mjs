import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import glob from 'glob';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getTests = () => glob.sync(path.join(__dirname, './tests/**/*-test.{js,ts}'));

export default {
  mode: 'development',
  entry: () => [path.join(__dirname, './tests.ts'), ...getTests()],
  context: path.resolve(__dirname),
  target: 'web',
  devtool: 'inline-source-map',
  experiments: {
    outputModule: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'esbuild-loader',
        exclude: /node_modules/,
        options: {
          loader: 'ts',  // Or 'ts' if you don't need tsx
          target: 'es2015'
        }
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
    alias: {
      '@yavin/client': path.resolve(__dirname, '../lib/esm'),
    },
  },
  plugins: [
    // Allow msw node and service worker code in same file
    new webpack.IgnorePlugin({
      resourceRegExp: /^msw\/lib\/node\/index.js$/,
      contextRegExp: new RegExp(`^${__dirname}/.*`),
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

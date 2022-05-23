import path from 'path';
import { fileURLToPath } from 'url';
import glob from 'glob';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getTests = () => glob.sync(`${__dirname}/tests/**/*-test.{js,ts}`);

export default {
  mode: 'development',
  entry: () => ['./tests.ts', ...getTests()],
  context: path.resolve(__dirname),
  target: 'web',
  devtool: 'inline-source-map',
  experiments: {
    outputModule: true,
  },
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
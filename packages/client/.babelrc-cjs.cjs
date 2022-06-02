module.exports = {
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        modules: 'commonjs',
        useBuiltIns: 'usage',
        corejs: '3.22',
      },
    ],
  ],
  plugins: ['import-graphql'],
};

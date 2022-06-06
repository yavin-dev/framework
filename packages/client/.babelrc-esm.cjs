module.exports = {
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        modules: false,
        useBuiltIns: 'usage',
        corejs: '3.22',
      },
    ],
  ],
  plugins: [
    ['@babel/plugin-transform-typescript', { allowDeclareFields: true }],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    'import-graphql',
  ],
};

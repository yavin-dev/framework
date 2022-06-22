module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import', 'node'],
  rules: {
    'prefer-const': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',

    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    'import/extensions': ['error', 'always', { ts: 'never', ignorePackages: true }],
    'node/file-extension-in-import': ['error', 'always', { '.cjs': 'never' }],
  },
};

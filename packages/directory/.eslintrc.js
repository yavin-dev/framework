'use strict';

module.exports = {
  globals: {
    server: true,
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['ember', 'prettier', 'qunit', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:qunit/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  env: {
    browser: true,
  },
  rules: {
    // ember specific
    'ember/no-jquery': 'error',

    // cleanliness & consistency
    'prefer-const': 'off', // const has misleading safety implications
    'no-debugger': 'error',

    // typescript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',

    // prettier
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],

    // better handled by prettier:
    '@typescript-eslint/indent': 'off',
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.prettierrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'index.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js',
      ],
      excludedFiles: ['addon/**', 'addon-test-support/**', 'app/**', 'tests/dummy/app/**'],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
      rules: {
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['tests/**/*.js', 'tests/test-helper.ts'],
      rules: {
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off',
      },
    },
  ],
};

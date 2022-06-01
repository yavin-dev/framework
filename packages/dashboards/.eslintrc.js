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
    'ember/no-jquery': 'warn',

    // TODO: These need to be cleaned up
    'ember/no-get': 'warn',
    'ember/no-mixins': 'warn',
    'ember/no-new-mixins': 'warn',
    'ember/no-observers': 'warn',
    'ember/no-classic-classes': 'warn',
    'ember/no-classic-components': 'warn',
    'ember/no-computed-properties-in-native-classes': 'warn',
    'ember/no-controller-access-in-routes': 'warn',
    'ember/no-actions-hash': 'warn',

    // cleanliness & consistency
    'prefer-const': 'off', // const has misleading safety implications
    'prefer-rest-params': 'off', // useful for super(...arguments) calls
    'no-debugger': 'error',

    // typescript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',

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
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['tests/**/*.js'],
      rules: {
        'ember/no-jquery': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
      },
    },
  ],
};

'use strict';

module.exports = {
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

    // TODO: These need to be resolved
    'ember/no-mixins': 'warn',
    'ember/no-new-mixins': 'warn',
    'ember/no-observers': 'warn',
    'ember/no-private-routing-service': 'warn',
    'ember/require-tagless-components': 'warn',
    'ember/no-get': 'warn',
    'ember/no-classic-components': 'warn',
    'ember/no-classic-classes': 'warn',
    'ember/avoid-leaking-state-in-ember-objects': 'warn',
    'ember/no-component-lifecycle-hooks': 'warn',
    'ember/no-computed-properties-in-native-classes': 'warn',
    'ember/use-ember-data-rfc-395-imports': 'warn', // Some of these don't seem possible to fix yet

    // cleanliness & consistency
    'prefer-const': 'off', // const has misleading safety implications
    'prefer-rest-params': 'off', // useful for super(...arguments) calls
    'no-debugger': 'error',
    'ember/no-empty-glimmer-component-classes': 'off', // ignore to keep arg types on template only components

    // typescript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',

    // prettier
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],

    // better handled by prettier:
    '@typescript-eslint/indent': 'off',
  },
  globals: {
    c3: true,
    d3: true,
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
      files: ['blueprints/**'],
      rules: {
        'node/no-extraneous-require': 'off',
      },
    },
    {
      files: ['tests/**', 'addon-test-support/**'],
      rules: {
        'ember/no-jquery': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
      },
    },
    {
      files: ['app/mirage/routes/**'],
      rules: {
        'ember/no-get': 'off',
      },
    },
  ],
};

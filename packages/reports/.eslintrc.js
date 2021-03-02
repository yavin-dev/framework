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
    'ember/no-observers': 'warn',
    'ember/no-side-effects': 'warn',
    'ember/no-jquery': 'warn',
    'ember/no-new-mixins': 'warn',
    'ember/no-mixins': 'warn', // get rid of mixins
    'ember/no-get': 'off', // come back and do this
    'ember/use-ember-data-rfc-395-imports': 'off', // after updating ember-data

    // cleanliness & consistency
    'prefer-const': 'off', // const has misleading safety implications
    'prefer-rest-params': 'off', // useful for super(...arguments) calls

    // typescript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/camelcase': ['error', { allow: ['_id$'] }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',

    // prettier
    'prettier/prettier': 'error',

    // better handled by prettier:
    '@typescript-eslint/indent': 'off',
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
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
        'multiline-comment-style': ['error', 'starred-block'],
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['tests/**/*.js', 'tests/test-helper.ts'],
      rules: {
        'ember/no-jquery': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off',
      },
    },
  ],
};

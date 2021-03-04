module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  plugins: ['ember'],
  extends: ['eslint:recommended', 'plugin:ember/recommended', 'prettier'],
  env: {
    browser: true,
    es6: true,
  },
  rules: {
    'multiline-comment-style': ['error', 'starred-block'],
    'ember/no-jquery': 'error',
  },
  globals: {
    NAVI_APP_SETTINGS: true,
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js',
        'server/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        /**
         * add your custom rules and overrides for node files here
         *
         * this can be removed once the following is fixed
         * https://github.com/mysticatea/eslint-plugin-node/issues/77
         */
        'node/no-unpublished-require': 'off',
      }),
    },
    {
      files: ['tests/**/*.js'],
      rules: {
        'ember/no-jquery': 'off',
      },
    },
  ],
};

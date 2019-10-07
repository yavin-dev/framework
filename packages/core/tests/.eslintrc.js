module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['ember'],
  extends: ['eslint:recommended', 'plugin:ember/recommended', 'prettier'],
  env: {
    browser: true
  },
  rules: {
    'multiline-comment-style': ['error', 'starred-block'],
    'ember/no-jquery': 'off' //We still use jquery for certain tests where we need to use 'contains' in the selector
  },
  overrides: [
    // node files
    {
      files: ['.eslintrc.js'],
      parserOptions: {
        sourceType: 'script'
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here
      })
    }
  ]
};

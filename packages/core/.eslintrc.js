module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  extends: ['eslint:recommended', 'prettier'],
  env: {
    browser: true
  },
  rules: {
    'multiline-comment-style': ['error', 'starred-block']
  },
  globals: {
    c3: true,
    d3: true
  }
};

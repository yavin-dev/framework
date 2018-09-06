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
    indent: [
      2,
      2,
      {
        VariableDeclarator: { var: 2, let: 2, const: 3 }
      }
    ],
    'multiline-comment-style': ['error', 'starred-block']
  }
};

module.exports = {
  env: {
    embertest: true
  },
  globals: {
    clickDropdown: true
  },
  rules: {
    indent: [ 2, 2, {
      'VariableDeclarator': { 'var': 2, 'let': 2, 'const': 3 }
    }],
    'multiline-comment-style': ['error', 'starred-block']
  }
};

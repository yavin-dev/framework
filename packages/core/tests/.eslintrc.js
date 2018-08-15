module.exports = {
  env: {
    embertest: true
  },
  globals: {
    server: true,
    $: true,
    d3: true,
    reorder: true,
    selectChoose: true,
    wait: true
  },
  rules: {
    indent: [2, 2, {'VariableDeclarator': { 'var': 2, 'let': 2, 'const': 3}}],
    'multiline-comment-style': ['error', 'starred-block']
  }
};

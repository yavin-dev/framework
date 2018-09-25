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
    'multiline-comment-style': ['error', 'starred-block']
  }
};

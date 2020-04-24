'use strict';

module.exports = {
  extends: 'octane',
  rules: {
    'no-bare-strings': false,
    'no-curly-component-invocation': {
      allow: ['current-route', 'parent-route', 'sibling-route']
    },
    'no-implicit-this': {
      allow: ['current-route', 'parent-route', 'sibling-route']
    }
  },
  ignore: ['blueprints/**']
};

'use strict';

module.exports = {
  extends: 'octane',
  rules: {
    'no-implicit-this': {
      allow: ['get-user'],
    },
  },
};

/* eslint-env node */
'use strict';

module.exports = function(/* environment, appConfig */) {
  return {
    navi: {
      searchThresholds: {
        contains: 600,
        in: 50000
      }
    }
  };
};

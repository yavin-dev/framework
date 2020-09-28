'use strict';

module.exports = function(/* environment, appConfig */) {
  return {
    navi: {
      dataEpoch: '2013-01-01',
      searchThresholds: {
        contains: 600,
        in: 50000
      }
    }
  };
};

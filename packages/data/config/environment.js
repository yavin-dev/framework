'use strict';

module.exports = function (/* environment, appConfig */) {
  return {
    navi: {
      dataEpoch: '2013-01-01',
      cardinalities: {
        small: 600,
        medium: 50000,
      },
      dimensionCache: {
        timeoutMs: 60 * 60 * 1000,
        maxSize: 10,
      },
    },
  };
};

'use strict';

module.exports = function (/* environment, appConfig */) {
  return {
    navi: {
      dataEpoch: '2013-01-01',
      cardinalities: {
        small: 600,
        medium: 50000,
      },
    },
  };
};

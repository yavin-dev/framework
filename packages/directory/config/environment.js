'use strict';

module.exports = function (/* environment, appConfig */) {
  return {
    navi: {
      FEATURES: {
        enableDirectory: true, //Enable directory whenever this addon is installed
      },
    },
  };
};

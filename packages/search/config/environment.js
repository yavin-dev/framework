'use strict';

module.exports = function(/* environment, appConfig */) {
  return {
    navi: {
      dataSources: [{ name: 'dummy', uri: 'https://data.naviapp.io', type: 'bard-facts' }]
    }
  };
};

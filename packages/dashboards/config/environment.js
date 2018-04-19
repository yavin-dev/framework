/* eslint-env node */
'use strict';

module.exports = function(/* environment, appConfig */) {
  return {
    moment: {
      includeTimezone: 'all'
    },
    navi: {
      FEATURES: {
        dashboards: true,
        enableDashboardExport: false,
        enableScheduleDashboards: false
      }
    },
    'ember-gridstack': {
      // Exclude the optional jquery.ui.touch-punch dependency
      exclude: ['jquery.ui.touch-punch']
    }
  };
};

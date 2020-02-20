'use strict';

module.exports = function(/* environment, appConfig */) {
  return {
    moment: {
      includeTimezone: 'all'
    },
    navi: {
      widgetsRequestsMaxConcurrency: 15, // Remove or set to Infinity to run all concurrently
      FEATURES: {
        dashboards: true,
        enableDashboardExport: false,
        enableScheduleDashboards: false,
        enableDashboardFilters: false
      }
    },
    'ember-gridstack': {
      // Exclude the optional jquery.ui.touch-punch dependency
      exclude: ['jquery.ui.touch-punch']
    }
  };
};

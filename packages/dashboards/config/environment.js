'use strict';

module.exports = function(/* environment, appConfig */) {
  return {
    moment: {
      includeTimezone: 'all'
    },
    navi: {
      widgetsRequestsMaxConcurrency: 5,
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

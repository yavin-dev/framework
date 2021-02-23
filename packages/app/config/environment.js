'use strict';

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'navi-app',
    environment,
    rootURL: '/ui/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        /*
         * Here you can enable experimental features on an ember canary build
         * e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
         */
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },

    APP: {
      /*
       * Here you can pass flags/options to your application instance
       * when it is created
       */
    },

    navi: {
      dataEpoch: '1900-01-01',
      FEATURES: {
        enableScheduleReports: true,
        enableDashboardFilters: true,
        exportFileTypes: [],
        enableTableEditing: true,
        enableTotals: true,
      },
    },
    apollo: {},
  };

  if (environment === 'development') {
    ENV['ember-cli-mirage'] = { enabled: !(process.env.DISABLE_MOCKS || process.env.APP_ENV === 'localElide') };
    /*
     * ENV.APP.LOG_RESOLVER = true;
     * ENV.APP.LOG_ACTIVE_GENERATION = true;
     * ENV.APP.LOG_TRANSITIONS = true;
     * ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
     * ENV.APP.LOG_VIEW_LOOKUPS = true;
     */
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    if (process.env.BUILD_NAVI_DEMO === 'true') {
      ENV['rootURL'] = '/yavin/';
      ENV['locationType'] = 'hash';
      ENV['ember-cli-mirage'] = { enabled: true };
    }
  }

  return ENV;
};

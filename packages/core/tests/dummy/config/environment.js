'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'dummy',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      /*
       * Here you can pass flags/options to your application instance
       * when it is created
       */
    },
    navi: {
      user: 'navi_user',
      dataEpoch: '2013-01-01',
      dataSources: [{ name: 'dummy', uri: 'https://data.naviapp.io', type: 'bard-facts' }],
      appPersistence: {
        type: 'webservice',
        uri: 'https://persistence.naviapp.io',
        timeout: 90000
      },
      predefinedIntervalRanges: {
        day: ['P1D', 'P7D', 'P14D', 'P30D', 'P60D', 'P90D', 'P180D', 'P400D'],
        week: ['P1W', 'P4W', 'P8W', 'P13W', 'P26W', 'P52W', 'P78W', 'P104W'],
        month: ['P1M', 'P3M', 'P6M', 'P12M', 'P18M', 'P24M'],
        quarter: ['P3M', 'P6M', 'P12M', 'P24M'],
        year: ['P1Y', 'P2Y']
      },
      notifications: {
        short: 3000,
        medium: 10000
      },
      FEATURES: {
        enableTotals: false,
        enableTableEditing: true,
        enabledNotifyIfData: true
      }
    }
  };

  /*
   * here you can enable a production-specific feature
   * ENV.APP.LOG_RESOLVER = true;
   * ENV.APP.LOG_ACTIVE_GENERATION = true;
   * ENV.APP.LOG_TRANSITIONS = true;
   * ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
   * ENV.APP.LOG_VIEW_LOOKUPS = true;
   */

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
  }

  return ENV;
};

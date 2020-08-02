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
      dataSources: [
        { name: 'dummy', uri: 'https://data.naviapp.io', type: 'bard' },
        { name: 'blockhead', uri: 'https://data2.naviapp.com', type: 'bard' },
        { name: 'dummy-gql', uri: 'https://data.naviapp.io', type: 'elide' },
        { name: 'blockhead-gql', uri: 'https://data2.naviapp.com', type: 'elide' }
      ],
      defaultDataSource: 'dummy',
      searchThresholds: {
        contains: 600,
        in: 50000
      }
    }
  };

  if (environment === 'development') {
    /*
     * ENV.APP.LOG_RESOLVER = true;
     * ENV.APP.LOG_ACTIVE_GENERATION = true;
     * ENV.APP.LOG_TRANSITIONS = true;
     * ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
     * ENV.APP.LOG_VIEW_LOOKUPS = true;
     */
  }

  if (environment === 'test') {
    /*
     * Testem prefers this...
     * here you can enable a production-specific feature
     */

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};

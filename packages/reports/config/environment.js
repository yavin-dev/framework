'use strict';

module.exports = function (/* environment, appConfig */) {
  return {
    moment: {
      includeTimezone: 'all',
    },
    navi: {
      predefinedIntervalRanges: {
        second: ['P1D', 'P4D'],
        minute: ['P1D', 'P4D', 'P7D'],
        hour: ['P1D', 'P7D', 'P14D', 'P30D'],
        day: ['P1D', 'P7D', 'P14D', 'P30D', 'P60D', 'P90D', 'P180D', 'P400D'],
        //TODO: Better 'week' support
        isoWeek: ['P1W', 'P4W', 'P8W', 'P13W', 'P26W', 'P52W', 'P78W', 'P104W'],
        month: ['P1M', 'P3M', 'P6M', 'P12M', 'P18M', 'P24M'],
        quarter: ['P3M', 'P6M', 'P12M', 'P24M'],
        year: ['P1Y', 'P2Y'],
      },
      schedule: {
        formats: null,
        frequencies: null,
      },
      FEATURES: {
        exportFileTypes: [],
        enabledNotifyIfData: false,
      },
    },
  };
};

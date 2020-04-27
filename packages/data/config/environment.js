'use strict';

module.exports = function(/* environment, appConfig */) {
  return {
    navi: {
      dataEpoch: '2013-01-01',
      predefinedIntervalRanges: {
        hour: ['P1D', 'P7D', 'P14D', 'P30D'],
        day: ['P1D', 'P7D', 'P14D', 'P30D', 'P60D', 'P90D', 'P180D', 'P400D'],
        week: ['P1W', 'P4W', 'P8W', 'P13W', 'P26W', 'P52W', 'P78W', 'P104W'],
        month: ['P1M', 'P3M', 'P6M', 'P12M', 'P18M', 'P24M'],
        quarter: ['P3M', 'P6M', 'P12M', 'P24M'],
        year: ['P1Y', 'P2Y']
      },
      searchThresholds: {
        contains: 600,
        in: 50000
      }
    }
  };
};

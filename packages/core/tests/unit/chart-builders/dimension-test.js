import { test, module } from 'ember-qunit';
import Ember from 'ember';
import BuilderClass from 'navi-core/chart-builders/dimension';
import TooltipTemplate from '../../../../navi-core/templates/chart-tooltips/dimension';

const DimensionChartBuilder = BuilderClass.create();
const { get } = Ember;

const DATA = [
  {
    'dateTime': '2016-05-30 00:00:00.000',
    'age|id': "-3",
    'age|desc': "All Other",
    'totalPageViews': 3669828357
  },
  {
    'dateTime': '2016-05-31 00:00:00.000',
    'age|id': "-3",
    'age|desc': "All Other",
    'totalPageViews': 4088487125
  },
  {
    'dateTime': '2016-06-01 00:00:00.000',
    'age|id': "-3",
    'age|desc': "All Other",
    'totalPageViews': 4024700302
  },
  {
    'dateTime': '2016-05-30 00:00:00.000',
    'age|id': "1",
    'age|desc': "under 13",
    'totalPageViews': 2669828357
  },
  {
    'dateTime': '2016-05-31 00:00:00.000',
    'age|id': "1",
    'age|desc': "under 13",
    'totalPageViews': 3088487125
  },
  {
    'dateTime': '2016-06-01 00:00:00.000',
    'age|id': "1",
    'age|desc': "under 13",
    'totalPageViews': 3024700302
  }
];

const DATA2 = [
        {
          'dateTime': "2016-01-01 00:00:00.000",
          'age|id': "-2",
          'age|desc': "Not Available",
          'gender|id': "-1",
          'gender|desc': "Unknown",
          'totalPageViews': 176267792438
        },
        {
          'dateTime': "2016-01-01 00:00:00.000",
          'age|id': "-2",
          'age|desc': "Not Available",
          'gender|id': "f",
          'gender|desc': "Female",
          'totalPageViews': 76735188
        },
        {
          'dateTime': "2016-01-01 00:00:00.000",
          'age|id': "-2",
          'age|desc': "Not Available",
          'gender|id': "m",
          'gender|desc': "Male",
          'totalPageViews': 74621538
        },
        {
          'dateTime': "2016-01-01 00:00:00.000",
          'age|id': "1",
          'age|desc': "under 13",
          'gender|id': "-1",
          'gender|desc': "Unknown",
          'totalPageViews': 2306935
        },
        {
          'dateTime': "2016-01-01 00:00:00.000",
          'age|id': "1",
          'age|desc': "under 13",
          'gender|id': "f",
          'gender|desc': "Female",
          'totalPageViews': 158591335
        },
        {
          'dateTime': "2016-01-01 00:00:00.000",
          'age|id': "1",
          'age|desc': "under 13",
          'gender|id': "m",
          'gender|desc': "Male",
          'totalPageViews': 293462742
        },
        {
          'dateTime': "2016-01-02 00:00:00.000",
          'age|id': "-2",
          'age|desc': "Not Available",
          'gender|id': "-1",
          'gender|desc': "Unknown",
          'totalPageViews': 163354994741
        },
        {
          'dateTime': "2016-01-02 00:00:00.000",
          'age|id': "-2",
          'age|desc': "Not Available",
          'gender|id': "f",
          'gender|desc': "Female",
          'totalPageViews': 74006011
        },
        {
          'dateTime': "2016-01-02 00:00:00.000",
          'age|id': "-2",
          'age|desc': "Not Available",
          'gender|id': "m",
          'gender|desc': "Male",
          'totalPageViews': 72011227
        },
        {
          'dateTime': "2016-01-02 00:00:00.000",
          'age|id': "1",
          'age|desc': "under 13",
          'gender|id': "-1",
          'gender|desc': "Unknown",
          'totalPageViews': 5630202
        },
        {
          'dateTime': "2016-01-02 00:00:00.000",
          'age|id': "1",
          'age|desc': "under 13",
          'gender|id': "f",
          'gender|desc': "Female",
          'totalPageViews': 156664890
        },
        {
          'dateTime': "2016-01-02 00:00:00.000",
          'age|id': "1",
          'age|desc': "under 13",
          'gender|id': "m",
          'gender|desc': "Male",
          'totalPageViews': 289431575
        }
      ],
      REQUEST = {
        logicalTable: {
          timeGrain: 'day'
        },
        intervals: [
          {
            start: '2016-05-30 00:00:00.000',
            end: '2016-06-02 00:00:00.000'
          }
        ]
      },
      REQUEST2 = {
        logicalTable: {
          timeGrain: 'day'
        },
        intervals: [
          {
            start: 'P2D',
            end: '2016-01-03 00:00:00.000'
          }
        ]
      };

module('Unit | Utils | Chart Builder Dimension');

test('buildData - no dimensions', function(assert) {
  assert.expect(1);

  assert.deepEqual(DimensionChartBuilder.buildData(DATA, {
    metric: { metric: 'totalPageViews', parameters: {}, canonicalName: 'totalPageViews' },
    dimensionOrder: ['age'],
    dimensions: []
  },
  REQUEST
  ),
  [
    {
      x: {
        rawValue: '2016-05-30 00:00:00.000',
        displayValue: 'May 30'
      }
    },
    {
      x: {
        rawValue: '2016-05-31 00:00:00.000',
        displayValue: 'May 31'
      }
    },
    {
      x: {
        rawValue: '2016-06-01 00:00:00.000',
        displayValue: 'Jun 1'
      }
    }
  ],
  'Error Case: No series are made when no dimensions are requested');
});

test('groupDataBySeries - many dimensions of same type', function(assert) {
  assert.expect(1);

  assert.deepEqual(DimensionChartBuilder.buildData(DATA, {
    metric: { metric: 'totalPageViews', parameters: {}, canonicalName: 'totalPageViews' },
    dimensionOrder: ['age'],
    dimensions: [
      {
        name: 'All Other',
        values: {age: '-3'}
      },
      {
        name: 'Under 13',
        values: {age: '1'}
      }
    ]},
  REQUEST
  ),
  [
    {
      x: {
        rawValue: '2016-05-30 00:00:00.000',
        displayValue: 'May 30'
      },
      'All Other': 3669828357,
      'Under 13': 2669828357
    },
    {
      x: {
        rawValue: '2016-05-31 00:00:00.000',
        displayValue: 'May 31'
      },
      'All Other': 4088487125,
      'Under 13': 3088487125
    },
    {
      x: {
        rawValue: '2016-06-01 00:00:00.000',
        displayValue: 'Jun 1'
      },
      'All Other': 4024700302,
      'Under 13': 3024700302
    }
  ],
  'A series is made for each requested dimension');
});

test('groupDataBySeries all granularity - many dimensions of same type', function (assert) {
  assert.expect(1);

  let request = {
        logicalTable: {
          timeGrain: 'all'
        },
        intervals: [
          {
            start: '2016-05-30 00:00:00.000',
            end: '2016-05-30 00:00:00.000'
          }
        ]
      },
      data = [
        {
          'dateTime': '2016-05-30 00:00:00.000',
          'age|id': "-3",
          'age|desc': "All Other",
          'totalPageViews': 3669828357
        },
        {
          'dateTime': '2016-05-30 00:00:00.000',
          'age|id': "1",
          'age|desc': "under 13",
          'totalPageViews': 3669828357
        }
      ];

  assert.deepEqual(DimensionChartBuilder.buildData(data, {
    metric: { metric: 'totalPageViews', parameters: {}, canonicalName: 'totalPageViews' },
    dimensionOrder: ['age'],
    dimensions: [
      {
        name: 'All Other',
        values: { age: '-3' }
      },
      {
        name: 'Under 13',
        values: { age: '1' }
      }
    ]
  },
  request
  ),
  [
    {
      x: {
        rawValue: '2016-05-30 00:00:00.000',
        displayValue: 'May 30'
      },
      'All Other': 3669828357,
      'Under 13': 3669828357
    }
  ],
  'A series has the properly formatted displayValue');
});

test('groupDataBySeries hour granularity - many dimensions of same type', function(assert) {
  assert.expect(1);

  let request = {
        logicalTable: {
          timeGrain: 'hour'
        },
        intervals: [
          {
            start: '2016-05-30 00:00:00.000',
            end: '2016-05-30 02:00:00.000'
          }
        ]
      },
      data = [
        {
          'dateTime': '2016-05-30 00:00:00.000',
          'age|id': "-3",
          'age|desc': "All Other",
          'totalPageViews': 3669828357
        },
        {
          'dateTime': '2016-05-30 01:00:00.000',
          'age|id': "-3",
          'age|desc': "All Other",
          'totalPageViews': 4088487125
        },
        {
          'dateTime': '2016-05-30 00:00:00.000',
          'age|id': "1",
          'age|desc': "under 13",
          'totalPageViews': 3669828357
        },
        {
          'dateTime': '2016-05-30 01:00:00.000',
          'age|id': "1",
          'age|desc': "under 13",
          'totalPageViews': 4088487125
        }
      ];

  assert.deepEqual(DimensionChartBuilder.buildData(data, {
    metric: { metric: 'totalPageViews', parameters: {}, canonicalName: 'totalPageViews' },
    dimensionOrder: ['age'],
    dimensions: [
      {
        name: 'All Other',
        values: {age: '-3'}
      },
      {
        name: 'Under 13',
        values: {age: '1'}
      }
    ]},
  request
  ),
  [
    {
      x: {
        rawValue: '2016-05-30 00:00:00.000',
        displayValue: '00:00'
      },
      'All Other': 3669828357,
      'Under 13': 3669828357
    },
    {
      x: {
        rawValue: '2016-05-30 01:00:00.000',
        displayValue: '01:00'
      },
      'All Other': 4088487125,
      'Under 13': 4088487125
    }
  ],
  'A series has the properly formmatted displayValue');
});

test('groupDataBySeries month granularity - many dimensions of same type', function(assert) {
  assert.expect(1);

  let request = {
        logicalTable: {
          timeGrain: 'month'
        },
        intervals: [
          {
            start: '2016-12-01 00:00:00.000',
            end: '2017-02-01 00:00:00.000'
          }
        ]
      },
      data = [
        {
          'dateTime': '2016-12-01 00:00:00.000',
          'age|id': "-3",
          'age|desc': "All Other",
          'totalPageViews': 3669828357
        },
        {
          'dateTime': '2017-01-01 00:00:00.000',
          'age|id': "-3",
          'age|desc': "All Other",
          'totalPageViews': 4088487125
        },
        {
          'dateTime': '2016-12-01 00:00:00.000',
          'age|id': "1",
          'age|desc': "under 13",
          'totalPageViews': 3669828357
        },
        {
          'dateTime': '2017-01-01 00:00:00.000',
          'age|id': "1",
          'age|desc': "under 13",
          'totalPageViews': 4088487125
        }
      ];

  assert.deepEqual(DimensionChartBuilder.buildData(data, {
    metric: { metric: 'totalPageViews', parameters: {}, canonicalName: 'totalPageViews' },
    dimensionOrder: ['age'],
    dimensions: [
      {
        name: 'All Other',
        values: {age: '-3'}
      },
      {
        name: 'Under 13',
        values: {age: '1'}
      }
    ]},
  request
  ),
  [
    {
      x: {
        rawValue: '2016-12-01 00:00:00.000',
        displayValue: 'Dec 2016'
      },
      'All Other': 3669828357,
      'Under 13': 3669828357
    },
    {
      x: {
        rawValue: '2017-01-01 00:00:00.000',
        displayValue: 'Jan 2017'
      },
      'All Other': 4088487125,
      'Under 13': 4088487125
    }
  ],
  'A series has the properly formmatted displayValue');
});

test('groupDataBySeries - many dimensions of different type', function(assert) {
  assert.expect(1);

  assert.deepEqual(DimensionChartBuilder.buildData(DATA2, {
    metric: { metric: 'totalPageViews', parameters: {}, canonicalName: 'totalPageViews' },
    dimensionOrder: ['age', 'gender'],
    dimensions: [
      {
        name: 'All Other | M',
        values: {age: '-2', gender: 'm'}
      },
      {
        name: 'Under 13 | F',
        values: {age: '1', gender: 'f'}
      }
    ]},
  REQUEST2
  ),
  [
    {
      x: {
        displayValue: "Jan 1",
        rawValue: "2016-01-01 00:00:00.000"
      },
      'All Other | M': 74621538,
      'Under 13 | F': 158591335
    },
    {
      x: {
        displayValue: "Jan 2",
        rawValue: "2016-01-02 00:00:00.000"
      },
      'All Other | M': 72011227,
      'Under 13 | F': 156664890
    }
  ],
  'A series is made for each requested dimension with multiple dimension');
});

test('groupDataBySeries - many dimensions of different type with some that are not found', function(assert) {
  assert.expect(1);

  assert.deepEqual(DimensionChartBuilder.buildData(DATA2, {
    metric: { metric: 'totalPageViews', parameters: {}, canonicalName: 'totalPageViews' },
    dimensionOrder: ['age', 'gender'],
    dimensions: [
      {
        name: 'Unknown | M',
        values: {age: '-3', gender: 'm'}
      },
      {
        name: 'Under 13 | F',
        values: {age: '1', gender: 'f'}
      }
    ]},
  REQUEST2
  ),
  [
    {
      x: {
        displayValue: "Jan 1",
        rawValue: "2016-01-01 00:00:00.000"
      },
      'Under 13 | F': 158591335,
      'Unknown | M': null
    },
    {
      x: {
        displayValue: "Jan 2",
        rawValue: "2016-01-02 00:00:00.000"
      },
      'Under 13 | F': 156664890,
      'Unknown | M': null
    }
  ],
  'A series is made for each requested dimension with multiple dimension with some that are not found');
});

test('buildTooltip', function(assert) {
  assert.expect(2);

  let config = {
        metric: { metric: 'totalPageViews', parameters: {}, canonicalName: 'totalPageViews' },
        dimensionOrder: ['age'],
        dimensions: [
          {
            name: 'All Other',
            values: {age: '-3'}
          },
          {
            name: 'Under 13',
            values: {age: '1'}
          }
        ]
      },
      x = '2016-05-31 00:00:00.000',
      tooltipData = [{
        x,
        id: -3,
        name: 'All Other',
        value: 4088487125
      }];

  //Populates the 'byXSeries' property in the builder that buildTooltip uses
  DimensionChartBuilder.buildData(DATA, config, REQUEST);

  let mixin = DimensionChartBuilder.buildTooltip(DATA, config, REQUEST),
      tooltipClass = Ember.Object.extend(mixin, {}),
      tooltip = tooltipClass.create({config, REQUEST, tooltipData, x});

  assert.equal(get(tooltip, 'layout'),
    TooltipTemplate,
    'Tooltip uses dimension tooltip template');

  assert.deepEqual(get(tooltip, 'rowData'),
    [DATA[1]],
    'The correct response row is given to the tooltip');
});

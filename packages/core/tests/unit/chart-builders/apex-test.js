import { module, test } from 'qunit';
import { _normalize } from 'navi-core/chart-builders/apex';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupTest } from 'ember-qunit';

// 1 metric, no dimension, instant
const RESPONSE_09_GOOD = [
  {
    dateTime: '2020-09-04 00:00:00.000',
    totalPageViews: '1234'
  }
];
// missing totalPageViews value
const RESPONSE_09_BAD = [
  {
    dateTime: '2020-09-04 00:00:00.000'
  }
];

// 1 metric, no dimension, over time
const RESPONSE_10_GOOD = [
  {
    dateTime: '2020-09-04 00:00:00.000',
    totalPageViews: 1234
  },
  {
    dateTime: '2020-09-05 00:00:00.000',
    totalPageViews: 3456
  },
  {
    dateTime: '2020-09-06 00:00:00.000',
    totalPageViews: 5678
  }
];
// missing 2020-05 date
const RESPONSE_10_BAD = [
  {
    dateTime: '2020-09-04 00:00:00.000',
    totalPageViews: 1234
  },
  {
    dateTime: '2020-09-06 00:00:00.000',
    totalPageViews: 5678
  }
];

// 1 metric, 1 dimension, instant
const RESPONSE_11_GOOD = [
  {
    dateTime: '2016-05-30 00:00:00.000',
    'age|id': '1',
    'age|desc': 'young',
    totalPageViews: 1234
  },
  {
    dateTime: '2016-05-30 00:00:00.000',
    'age|id': '2',
    'age|desc': 'middle-ish',
    totalPageViews: 2345
  },
  {
    dateTime: '2016-05-30 00:00:00.000',
    'age|id': '3',
    'age|desc': 'old',
    totalPageViews: 3456
  },
  {
    dateTime: '2016-05-30 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'i never could guess ages anyway',
    totalPageViews: 4567
  }
];
// missing middle-ish totalPageView value
const RESPONSE_11_BAD = [
  {
    dateTime: '2016-05-30 00:00:00.000',
    'age|id': '1',
    'age|desc': 'young',
    totalPageViews: 1234
  },
  {
    dateTime: '2016-05-30 00:00:00.000',
    'age|id': '2',
    'age|desc': 'middle-ish'
  },
  {
    dateTime: '2016-05-30 00:00:00.000',
    'age|id': '3',
    'age|desc': 'old',
    totalPageViews: 3456
  },
  {
    dateTime: '2016-05-30 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'i never could guess ages anyway',
    totalPageViews: 4567
  }
];

// 1 metric, 1 dimension, over time
const RESPONSE_12_GOOD = [
  {
    dateTime: '2016-05-30 00:00:00.000',
    'age|id': '-3',
    'age|desc': 'All Other',
    totalPageViews: 1234
  },
  {
    dateTime: '2016-05-31 00:00:00.000',
    'age|id': '-3',
    'age|desc': 'All Other',
    totalPageViews: 2345
  },
  {
    dateTime: '2016-06-01 00:00:00.000',
    'age|id': '-3',
    'age|desc': 'All Other',
    totalPageViews: 3456
  },
  {
    dateTime: '2016-05-30 00:00:00.000',
    'age|id': '1',
    'age|desc': 'ET',
    totalPageViews: 4567
  },
  {
    dateTime: '2016-05-31 00:00:00.000',
    'age|id': '1',
    'age|desc': 'ET',
    totalPageViews: 5678
  },
  {
    dateTime: '2016-06-01 00:00:00.000',
    'age|id': '1',
    'age|desc': 'ET',
    totalPageViews: 6789
  }
];
// missing All Other 2016-05-31 date
const RESPONSE_12_BAD = [
  {
    dateTime: '2016-05-30 00:00:00.000',
    'age|id': '-3',
    'age|desc': 'All Other',
    totalPageViews: 1234
  },
  {
    dateTime: '2016-06-01 00:00:00.000',
    'age|id': '-3',
    'age|desc': 'All Other',
    totalPageViews: 3456
  },
  {
    dateTime: '2016-05-30 00:00:00.000',
    'age|id': '1',
    'age|desc': 'ET',
    totalPageViews: 4567
  },
  {
    dateTime: '2016-05-31 00:00:00.000',
    'age|id': '1',
    'age|desc': 'ET',
    totalPageViews: 5678
  },
  {
    dateTime: '2016-06-01 00:00:00.000',
    'age|id': '1',
    'age|desc': 'ET',
    totalPageViews: 6789
  }
];

//TODO: 1 metric, 2 dimensions, instant
const RESPONSE_13_GOOD = [
  {
    dateTime: '2016-01-01 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': '-1',
    'gender|desc': 'Other',
    totalPageViews: 1
  },
  {
    dateTime: '2016-01-01 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': 'f',
    'gender|desc': 'Female',
    totalPageViews: 2
  },
  {
    dateTime: '2016-01-01 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': 'm',
    'gender|desc': 'Male',
    totalPageViews: 3
  },
  {
    dateTime: '2016-01-01 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': '-1',
    'gender|desc': 'Other',
    totalPageViews: 4
  },
  {
    dateTime: '2016-01-01 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': 'f',
    'gender|desc': 'Female',
    totalPageViews: 5
  },
  {
    dateTime: '2016-01-01 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': 'm',
    'gender|desc': 'Male',
    totalPageViews: 6
  }
];
// missing 2016-01-01 "not available, ____" gender value
const RESPONSE_13_BAD = [
  {
    dateTime: '2016-01-01 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    totalPageViews: 1
  },
  {
    dateTime: '2016-01-01 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': 'f',
    'gender|desc': 'Female',
    totalPageViews: 2
  },
  {
    dateTime: '2016-01-01 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': 'm',
    'gender|desc': 'Male',
    totalPageViews: 3
  },
  {
    dateTime: '2016-01-01 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': '-1',
    'gender|desc': 'Other',
    totalPageViews: 4
  },
  {
    dateTime: '2016-01-01 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': 'f',
    'gender|desc': 'Female',
    totalPageViews: 5
  },
  {
    dateTime: '2016-01-01 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': 'm',
    'gender|desc': 'Male',
    totalPageViews: 6
  }
];

// 1 metric, 2 dimensions, over time
const RESPONSE_14_GOOD = [
  {
    dateTime: '2020-01-01 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': '-1',
    'gender|desc': 'Other',
    totalPageViews: 1
  },
  {
    dateTime: '2020-01-01 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': 'f',
    'gender|desc': 'Female',
    totalPageViews: 2
  },
  {
    dateTime: '2020-01-01 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': 'm',
    'gender|desc': 'Male',
    totalPageViews: 3
  },
  {
    dateTime: '2020-01-01 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': '-1',
    'gender|desc': 'Other',
    totalPageViews: 4
  },
  {
    dateTime: '2020-01-01 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': 'f',
    'gender|desc': 'Female',
    totalPageViews: 5
  },
  {
    dateTime: '2020-01-01 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': 'm',
    'gender|desc': 'Male',
    totalPageViews: 6
  },
  {
    dateTime: '2020-01-02 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': '-1',
    'gender|desc': 'Other',
    totalPageViews: 7
  },
  {
    dateTime: '2020-01-02 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': 'f',
    'gender|desc': 'Female',
    totalPageViews: 8
  },
  {
    dateTime: '2020-01-02 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': 'm',
    'gender|desc': 'Male',
    totalPageViews: 9
  },
  {
    dateTime: '2020-01-02 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': '-1',
    'gender|desc': 'Other',
    totalPageViews: 10
  },
  {
    dateTime: '2020-01-02 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': 'f',
    'gender|desc': 'Female',
    totalPageViews: 11
  },
  {
    dateTime: '2020-01-02 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': 'm',
    'gender|desc': 'Male',
    totalPageViews: 12
  }
];
// missing "available, other" 2016-01-01 date
// missing "available, other" 2016-01-02 value
const RESPONSE_14_BAD = [
  {
    dateTime: '2020-01-01 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': '-1',
    'gender|desc': 'Other',
    totalPageViews: 1
  },
  {
    dateTime: '2020-01-01 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': 'f',
    'gender|desc': 'Female',
    totalPageViews: 2
  },
  {
    dateTime: '2020-01-01 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': 'm',
    'gender|desc': 'Male',
    totalPageViews: 3
  },
  {
    dateTime: '2020-01-01 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': 'f',
    'gender|desc': 'Female',
    totalPageViews: 5
  },
  {
    dateTime: '2020-01-01 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': 'm',
    'gender|desc': 'Male',
    totalPageViews: 6
  },
  {
    dateTime: '2020-01-02 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': '-1',
    'gender|desc': 'Other',
    totalPageViews: 7
  },
  {
    dateTime: '2020-01-02 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': 'f',
    'gender|desc': 'Female',
    totalPageViews: 8
  },
  {
    dateTime: '2020-01-02 00:00:00.000',
    'age|id': '-2',
    'age|desc': 'Not Available',
    'gender|id': 'm',
    'gender|desc': 'Male',
    totalPageViews: 9
  },
  {
    dateTime: '2020-01-02 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': '-1',
    'gender|desc': 'Other',
    totalPageViews: undefined
  },
  {
    dateTime: '2020-01-02 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': 'f',
    'gender|desc': 'Female',
    totalPageViews: 11
  },
  {
    dateTime: '2020-01-02 00:00:00.000',
    'age|id': '1',
    'age|desc': 'Available',
    'gender|id': 'm',
    'gender|desc': 'Male',
    totalPageViews: 12
  }
];

// 2 metric, no dimension, instant
const RESPONSE_15_GOOD = [
  {
    dateTime: '2020-09-04',
    totalPageViews: 1234,
    revenue: 4321
  }
];
// missing totalPageViews
const RESPONSE_15_BAD = [
  {
    dateTime: '2020-09-04',
    revenue: 4321
  }
];

// 2 metric, no dimension, over time
const RESPONSE_16_GOOD = [
  {
    dateTime: '2020-09-04',
    totalPageViews: 1234,
    revenue: 4321
  },
  {
    dateTime: '2020-09-05',
    totalPageViews: 4567,
    revenue: 7654
  },
  {
    dateTime: '2020-09-06',
    totalPageViews: 7890,
    revenue: 987
  }
];
// missing all revenue values
const RESPONSE_16_BAD = [
  {
    dateTime: '2020-09-04',
    totalPageViews: 1234
  },
  {
    dateTime: '2020-09-05',
    totalPageViews: 4567
  },
  {
    dateTime: '2020-09-06',
    totalPageViews: 7890
  }
];

let Store, MetadataService;

module('Unit | Chart Builders | Apex', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');
    await MetadataService.loadMetadata();
  });

  // request type 09
  test('single metric, no dimension, instant requests return correctly formatted values', function(assert) {
    assert.expect(2);
    const REQUEST_09 = {
      logicalTable: {
        timeGrain: 'day'
      },
      intervals: [
        {
          start: '2020-09-04 00:00:00.000',
          end: '2020-09-05 00:00:00.000'
        }
      ],
      metrics: [
        Store.createFragment('bard-request/fragments/metric', {
          metric: MetadataService.getById('metric', 'totalPageViews', 'dummy')
        })
      ]
    };
    assert.deepEqual(
      _normalize(REQUEST_09, RESPONSE_09_GOOD, 'metric', 'metric'),
      {
        labels: ['totalPageViews'],
        series: [
          {
            name: 'totalPageViews',
            data: [1234]
          }
        ]
      },
      'request type 09 returns correct values and format with correct data'
    );
    assert.deepEqual(
      _normalize(REQUEST_09, RESPONSE_09_BAD, 'metric', 'metric'),
      {
        labels: ['totalPageViews'],
        series: [
          {
            name: 'totalPageViews',
            data: [null]
          }
        ]
      },
      'request type 09 returns correct values and format for corrupted data'
    );
  });

  // request type 10
  test('single metric, no dimension, over-time requests return correctly formatted values', function(assert) {
    assert.expect(2);
    const REQUEST_10 = {
      logicalTable: {
        timeGrain: 'day'
      },
      intervals: [
        {
          start: '2020-09-04 00:00:00.000',
          end: '2020-09-07 00:00:00.000'
        }
      ],
      metrics: [
        Store.createFragment('bard-request/fragments/metric', {
          metric: MetadataService.getById('metric', 'totalPageViews', 'dummy')
        })
      ]
    };
    assert.deepEqual(
      _normalize(REQUEST_10, RESPONSE_10_GOOD, 'time', 'metric'),
      {
        labels: ['09/04/2020', '09/05/2020', '09/06/2020'],
        series: [
          {
            name: 'totalPageViews',
            data: [1234, 3456, 5678]
          }
        ]
      },
      'request type 10 returns correct values and format with correct data'
    );
    assert.deepEqual(
      _normalize(REQUEST_10, RESPONSE_10_BAD, 'time', 'metric'),
      {
        labels: ['09/04/2020', '09/05/2020', '09/06/2020'],
        series: [
          {
            name: 'totalPageViews',
            data: [1234, null, 5678]
          }
        ]
      },
      'request type 10 returns correct values and format for corrupted data'
    );
  });

  // request type 11
  test('single metric, single dimension, instantaneous requests return correctly formatted values', function(assert) {
    assert.expect(2);
    const REQUEST_11 = {
      logicalTable: {
        timeGrain: 'day'
      },
      intervals: [
        {
          start: '2016-05-30 00:00:00.000',
          end: '2016-05-31 00:00:00.000'
        }
      ],
      metrics: [
        Store.createFragment('bard-request/fragments/metric', {
          metric: MetadataService.getById('metric', 'totalPageViews', 'dummy')
        })
      ],
      dimensions: [
        Store.createFragment('bard-request/fragments/dimension', {
          dimension: MetadataService.getById('dimension', 'age', 'dummy')
        })
      ]
    };
    assert.deepEqual(
      _normalize(REQUEST_11, RESPONSE_11_GOOD, 'dimension', 'metric'),
      {
        labels: ['young', 'middle-ish', 'old', 'i never could guess ages anyway'],
        series: [
          {
            name: 'totalPageViews',
            data: [1234, 2345, 3456, 4567]
          }
        ]
      },
      'request type 11 returns correct values and format with correct data'
    );
    assert.deepEqual(
      _normalize(REQUEST_11, RESPONSE_11_BAD, 'dimension', 'metric'),
      {
        labels: ['young', 'middle-ish', 'old', 'i never could guess ages anyway'],
        series: [
          {
            name: 'totalPageViews',
            data: [1234, null, 3456, 4567]
          }
        ]
      },
      'request type 11 returns correct values and format with incorrect data'
    );
  });

  // request type 12
  test('single metric, single dimension, over-time requests return correctly formatted values', function(assert) {
    assert.expect(2);
    const REQUEST_12 = {
      logicalTable: {
        timeGrain: 'day'
      },
      intervals: [
        {
          start: '2016-05-30 00:00:00.000',
          end: '2016-06-02 00:00:00.000'
        }
      ],
      metrics: [
        Store.createFragment('bard-request/fragments/metric', {
          metric: MetadataService.getById('metric', 'totalPageViews', 'dummy')
        })
      ],
      dimensions: [
        Store.createFragment('bard-request/fragments/dimension', {
          dimension: MetadataService.getById('dimension', 'age', 'dummy')
        })
      ]
    };
    assert.deepEqual(
      _normalize(REQUEST_12, RESPONSE_12_GOOD, 'time', 'dimension'),
      {
        labels: ['05/30/2016', '05/31/2016', '06/01/2016'],
        series: [
          {
            name: 'All Other',
            data: [1234, 2345, 3456]
          },
          {
            name: 'ET',
            data: [4567, 5678, 6789]
          }
        ]
      },
      'request type 12 returns correct values and format with correct data'
    );
    assert.deepEqual(
      _normalize(REQUEST_12, RESPONSE_12_BAD, 'time', 'dimension'),
      {
        labels: ['05/30/2016', '05/31/2016', '06/01/2016'],
        series: [
          {
            name: 'All Other',
            data: [1234, null, 3456]
          },
          {
            name: 'ET',
            data: [4567, 5678, 6789]
          }
        ]
      },
      'request type 12 returns correct values and format with incorrect data'
    );
  });

  // request type 13
  test('single metric, multiple-dimension, instant request return correctly formatted values', function(assert) {
    assert.expect(2);
    const REQUEST_13 = {
      logicalTable: {
        timeGrain: 'day'
      },
      intervals: [
        {
          start: '2016-01-01 00:00:00.000',
          end: '2016-01-02 00:00:00.000'
        }
      ],
      metrics: [
        Store.createFragment('bard-request/fragments/metric', {
          metric: MetadataService.getById('metric', 'totalPageViews', 'dummy')
        })
      ],
      dimensions: [
        Store.createFragment('bard-request/fragments/dimension', {
          dimension: MetadataService.getById('dimension', 'age', 'dummy')
        }),
        Store.createFragment('bard-request/fragments/dimension', {
          dimension: MetadataService.getById('dimension', 'gender', 'dummy')
        })
      ]
    };
    assert.deepEqual(
      _normalize(REQUEST_13, RESPONSE_13_GOOD, 'dimension', 'metric'),
      {
        labels: [
          'Not Available, Other',
          'Not Available, Female',
          'Not Available, Male',
          'Available, Other',
          'Available, Female',
          'Available, Male'
        ],
        series: [
          {
            name: 'totalPageViews',
            data: [1, 2, 3, 4, 5, 6]
          }
        ]
      },
      'request type 13 returns correct values and format with correct data'
    );
    // TODO: Change to 'Not Available, --'
    assert.deepEqual(
      _normalize(REQUEST_13, RESPONSE_13_BAD, 'dimension', 'metric'),
      {
        labels: [
          'Not Available, ',
          'Not Available, Female',
          'Not Available, Male',
          'Available, Other',
          'Available, Female',
          'Available, Male'
        ],
        series: [
          {
            name: 'totalPageViews',
            data: [1, 2, 3, 4, 5, 6]
          }
        ]
      },
      'request type 13 returns correct values and format with incorrect data'
    );
  });

  // request type 14
  test('single metric, multi-dimension, over-time requests return correctly formatted values', function(assert) {
    assert.expect(2);
    const REQUEST_14 = {
      logicalTable: {
        timeGrain: 'day'
      },
      intervals: [
        {
          start: '2020-01-01 00:00:00.000',
          end: '2020-01-03 00:00:00.000'
        }
      ],
      metrics: [
        Store.createFragment('bard-request/fragments/metric', {
          metric: MetadataService.getById('metric', 'totalPageViews', 'dummy')
        })
      ],
      dimensions: [
        Store.createFragment('bard-request/fragments/dimension', {
          dimension: MetadataService.getById('dimension', 'age', 'dummy')
        }),
        Store.createFragment('bard-request/fragments/dimension', {
          dimension: MetadataService.getById('dimension', 'gender', 'dummy')
        })
      ]
    };
    assert.deepEqual(
      _normalize(REQUEST_14, RESPONSE_14_GOOD, 'time', 'dimension'),
      {
        labels: ['01/01/2020', '01/02/2020'],
        series: [
          { name: 'Not Available, Other', data: [1, 7] },
          { name: 'Not Available, Female', data: [2, 8] },
          { name: 'Not Available, Male', data: [3, 9] },
          { name: 'Available, Other', data: [4, 10] },
          { name: 'Available, Female', data: [5, 11] },
          { name: 'Available, Male', data: [6, 12] }
        ]
      },
      'request type 14 returns correct values and format with correct data'
    );
    assert.deepEqual(
      _normalize(REQUEST_14, RESPONSE_14_BAD, 'time', 'dimension'),
      {
        labels: ['01/01/2020', '01/02/2020'],
        series: [
          { name: 'Not Available, Other', data: [1, 7] },
          { name: 'Not Available, Female', data: [2, 8] },
          { name: 'Not Available, Male', data: [3, 9] },
          { name: 'Available, Female', data: [5, 11] },
          { name: 'Available, Male', data: [6, 12] },
          { name: 'Available, Other', data: [null, null] }
        ]
      },
      'request type 14 returns correct values and format with incorrect data'
    );
  });

  // request type 15
  test('multi-metric, no dimension, instant requests return correctly formatted values', function(assert) {
    assert.expect(2);
    const REQUEST_15 = {
      logicalTable: {
        timeGrain: 'day'
      },
      intervals: [
        {
          start: '2020-09-04 00:00:00.000',
          end: '2020-09-04 00:00:00.000'
        }
      ],
      metrics: [
        Store.createFragment('bard-request/fragments/metric', {
          metric: MetadataService.getById('metric', 'totalPageViews', 'dummy')
        }),
        Store.createFragment('bard-request/fragments/metric', {
          metric: MetadataService.getById('metric', 'revenue', 'dummy')
        })
      ]
    };
    assert.deepEqual(
      _normalize(REQUEST_15, RESPONSE_15_GOOD, 'metric', 'metric'),
      {
        labels: ['totalPageViews', 'revenue'],
        series: [
          { name: 'totalPageViews', data: [1234] },
          { name: 'revenue', data: [4321] }
        ]
      },
      'request type 15 returns correct values and format with correct data'
    );
    assert.deepEqual(
      _normalize(REQUEST_15, RESPONSE_15_BAD, 'metric', 'metric'),
      {
        labels: ['totalPageViews', 'revenue'],
        series: [
          { name: 'totalPageViews', data: [null] },
          { name: 'revenue', data: [4321] }
        ]
      },
      'request type 15 returns correct values and format with incorrect data'
    );
  });

  // request type 16
  test('multi-metric, no dimension, over-time requests return correctly formatted values', function(assert) {
    //assert.expect(2);
    const REQUEST_16 = {
      logicalTable: {
        timeGrain: 'day'
      },
      intervals: [
        {
          start: '2020-09-04 00:00:00.000',
          end: '2020-09-07 00:00:00.000'
        }
      ],
      metrics: [
        Store.createFragment('bard-request/fragments/metric', {
          metric: MetadataService.getById('metric', 'totalPageViews', 'dummy')
        }),
        Store.createFragment('bard-request/fragments/metric', {
          metric: MetadataService.getById('metric', 'revenue', 'dummy')
        })
      ]
    };
    assert.deepEqual(
      _normalize(REQUEST_16, RESPONSE_16_GOOD, 'time', 'metric'),
      {
        labels: ['09/04/2020', '09/05/2020', '09/06/2020'],
        series: [
          { name: 'totalPageViews', data: [1234, 4567, 7890] },
          { name: 'revenue', data: [4321, 7654, 987] }
        ]
      },
      'request type 16 returns correct values and format with correct data'
    );
    /*
    assert.deepEqual(
      _normalize(REQUEST_16, RESPONSE_16_BAD, 'time', 'metric'),
      {
        labels: ['09/04/2020', '09/05/2020', '09/06/2020'],
        series: [
          { name: 'totalPageViews', data: [1234, 4567, 7890] },
          { name: 'revenue', data: [null, null, null] }
        ]
      },
      'request type 16 returns correct values and format with incorrect data'
    );
    */
  });
});

import { test, module } from 'ember-qunit';
import { topN, mostRecentData, dataByDimensions, maxDataByDimensions } from 'navi-core/utils/data';

module('Unit | Utils | Data');

test('top n values', function(assert) {
  assert.expect(3);

  let rows = [
    {
      a: '400'
    },
    {
      a: '20'
    },
    {
      a: '600'
    }
  ];

  assert.deepEqual(
    topN(rows, 'a', 2),
    [
      {
        a: '600'
      },
      {
        a: '400'
      }
    ],
    'Top 2 rows for given field are returned'
  );

  assert.deepEqual(topN(rows, 'a', 20), rows, 'All rows are returned when n > rows.length');

  assert.deepEqual(topN([], 'a', 20), [], 'No rows are returned when rows.length = 0');
});

test('top n with undefined fields', function(assert) {
  assert.expect(1);

  let rows = [
    {
      a: '400'
    },
    {
      a: '20'
    },
    {
      b: '600'
    }
  ];

  assert.deepEqual(
    topN(rows, 'a', 2),
    [
      {
        a: '400'
      },
      {
        a: '20'
      }
    ],
    'Undefined field values are skipped'
  );
});

test('most recent data', function(assert) {
  assert.expect(1);

  let rows = [
    {
      dateTime: '2015',
      metric: 100
    },
    {
      dateTime: '2016',
      metric: 100
    },
    {
      dateTime: '2017',
      metric: 100
    },
    {
      dateTime: '2015',
      metric: 200
    },
    {
      dateTime: '2016',
      metric: 200
    },
    {
      dateTime: '2017',
      metric: 200
    }
  ];

  assert.deepEqual(
    mostRecentData(rows),
    [
      {
        dateTime: '2017',
        metric: 100
      },
      {
        dateTime: '2017',
        metric: 200
      }
    ],
    'All data rows with latest dateTime are returned'
  );
});

test('data by dimensions', function(assert) {
  assert.expect(1);

  let rows = [
    {
      'dimension|id': 'a',
      metric: 100
    },
    {
      'dimension|id': 'a',
      metric: 200
    },
    {
      'dimension|id': 'b',
      metric: 100
    },
    {
      'dimension|id': 'b',
      metric: 300
    }
  ];

  const data = dataByDimensions(rows, ['dimension']);

  assert.deepEqual(
    data.getDataForKey('a'),
    [
      {
        'dimension|id': 'a',
        metric: 100
      },
      {
        'dimension|id': 'a',
        metric: 200
      }
    ],
    'All data rows for dimension a are returned'
  );
});

test('max data by dimensions', function(assert) {
  assert.expect(1);

  let rows = [
    {
      'dimension|id': 'a',
      metric: 100
    },
    {
      'dimension|id': 'a',
      metric: 200
    },
    {
      'dimension|id': 'b',
      metric: 100
    },
    {
      'dimension|id': 'b',
      metric: 300
    }
  ];

  assert.deepEqual(
    maxDataByDimensions(rows, ['dimension'], 'metric'),
    [
      {
        'dimension|id': 'a',
        metric: 200
      },
      {
        'dimension|id': 'b',
        metric: 300
      }
    ],
    'All data rows for max value based on dimensions are returned'
  );
});

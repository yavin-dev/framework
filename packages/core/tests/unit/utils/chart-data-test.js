import { module, test } from 'qunit';
import {
  groupDataByDimensions,
  buildSeriesKey,
  getSeriesName,
  chartTypeForRequest,
  getRequestMetrics,
  getRequestDimensions,
  buildDimensionSeriesValues
} from 'navi-core/utils/chart-data';
import { buildTestRequest } from '../../helpers/request';

module('Unit | Utils | Chart Data', function() {
  test('groupDataByDimensions', function(assert) {
    assert.expect(2);

    let rows = [
        {
          'age|desc': 'All Other',
          'age|id': '-3',
          dateTime: '2015-12-14 00:00:00.000',
          totalPageViews: 3072620639,
          uniqueIdentifier: 155191081
        },
        {
          'age|desc': 'under 13',
          'age|id': '1',
          dateTime: '2015-12-14 00:00:00.000',
          totalPageViews: 2072620639,
          uniqueIdentifier: 55191081
        }
      ],
      config = {
        metric: 'totalPageViews',
        dimensionOrder: ['age'],
        dimensions: [
          {
            name: 'All Other',
            values: { age: '-3' }
          },
          {
            name: 'under 13',
            values: { age: '1' }
          }
        ]
      },
      expectedDataGroup = [
        {
          'age|desc': 'under 13',
          'age|id': '1',
          dateTime: '2015-12-14 00:00:00.000',
          totalPageViews: 2072620639,
          uniqueIdentifier: 55191081
        }
      ],
      dataGroup = groupDataByDimensions(rows, config);

    assert.deepEqual(dataGroup.getDataForKey('1'), expectedDataGroup, 'groupDataByDimensions groups data as expected');

    assert.deepEqual(
      groupDataByDimensions(
        [
          {
            'foo|desc': 'foo',
            metricName: 123
          },
          {
            'foo|desc': 'bar',
            metricName: 321
          }
        ],
        {
          metric: 'metricName',
          dimensionOrder: ['foo'],
          dimensions: [
            {
              name: 'foo',
              values: { foo: 'foo' }
            },
            {
              name: 'bar',
              values: { foo: 'bar' }
            }
          ]
        }
      ).getDataForKey('bar'),
      [
        {
          'foo|desc': 'bar',
          metricName: 321
        }
      ],
      "Still can group even if identifier field isn't present"
    );
  });

  test('buildSeriesKey', function(assert) {
    assert.expect(1);

    let config = {
      metric: 'totalPageViews',
      dimensionOrder: ['age'],
      dimensions: [
        {
          name: 'All Other',
          values: { age: '-3' }
        },
        {
          name: 'under 13',
          values: { age: '1' }
        }
      ]
    };

    assert.deepEqual(buildSeriesKey(config), ['-3', '1'], 'buildSeriesKey returns expected series keys');
  });

  test('getSeriesName', function(assert) {
    assert.expect(1);

    let config = {
      metric: 'totalPageViews',
      dimensionOrder: ['age'],
      dimensions: [
        {
          name: 'All Other',
          values: { age: '-3' }
        },
        {
          name: 'under 13',
          values: { age: '1' }
        }
      ]
    };

    assert.deepEqual(getSeriesName(config), ['All Other', 'under 13'], 'getSeriesName returns expected series keys');
  });

  test('chartTypeForRequest', function(assert) {
    assert.expect(3);

    let request = buildTestRequest(['totalPageViews'], ['age', 'gender']);

    assert.equal(chartTypeForRequest(request), 'dimension', 'chartTypeForRequest retuns dimension series as expected');

    request = buildTestRequest(['totalPageViews']);

    assert.equal(chartTypeForRequest(request), 'metric', 'chartTypeForRequest retuns metric series as expected');

    request = buildTestRequest(['totalPageViews'], [], [{ end: 'current', start: 'P104W' }]);

    assert.equal(
      chartTypeForRequest(request),
      'dateTime',
      'chartTypeForRequest returns dateTime series when request has single metric, no dimensions, and interval over a year'
    );
  });

  test('getRequestMetrics', function(assert) {
    assert.expect(1);

    let request = {
      metrics: [
        {
          metric: { name: 'totalPageViews' },
          canonicalName: 'totalPageViews',
          toJSON() {
            return {
              metric: this.metric,
              canonicalName: this.canonicalName
            };
          }
        }
      ],
      dimensions: [{ dimension: { name: 'age' } }, { dimension: { name: 'gender' } }]
    };

    assert.deepEqual(
      getRequestMetrics(request),
      [{ metric: { name: 'totalPageViews' }, canonicalName: 'totalPageViews' }],
      'getRequestMetrics returns expected metric object'
    );
  });

  test('getRequestDimensions', function(assert) {
    assert.expect(1);

    let request = {
      metrics: [{ metric: { name: 'totalPageViews' } }],
      dimensions: [{ dimension: { name: 'age' } }, { dimension: { name: 'gender' } }]
    };

    assert.deepEqual(
      getRequestDimensions(request),
      ['age', 'gender'],
      'getRequestDimensions retuns expected dimension names'
    );
  });

  test('buildDimensionSeriesValues', function(assert) {
    assert.expect(2);

    let request = {
        metrics: [{ metric: { name: 'totalPageViews' } }],
        dimensions: [{ dimension: { name: 'age', longName: 'Age' } }]
      },
      rows = [
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '-3',
          'age|desc': 'All Other',
          uniqueIdentifier: 155191081,
          totalPageViews: 3072620639
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '1',
          'age|desc': 'under 13',
          uniqueIdentifier: 55191081,
          totalPageViews: 2072620639
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '2',
          'age|desc': '13 - 25',
          uniqueIdentifier: 55191081,
          totalPageViews: 2620639
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '3',
          'age|desc': '25 - 35',
          uniqueIdentifier: 55191081,
          totalPageViews: 72620639
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '4',
          'age|desc': '35 - 45',
          uniqueIdentifier: 55191081,
          totalPageViews: 72620639
        }
      ];

    assert.deepEqual(
      buildDimensionSeriesValues(request, rows),
      [
        {
          name: 'under 13',
          values: { age: '1' }
        },
        {
          name: '13 - 25',
          values: { age: '2' }
        },
        {
          name: '25 - 35',
          values: { age: '3' }
        },
        {
          name: '35 - 45',
          values: { age: '4' }
        },
        {
          name: 'All Other',
          values: { age: '-3' }
        }
      ],
      'buildDimensionSeriesValues retuns expected series object'
    );

    assert.deepEqual(
      buildDimensionSeriesValues(
        request,
        rows.map(row => ({
          dateTime: row.dateTime,
          'age|desc': row['age|desc'],
          uniqueIdentifier: row.uniqueIdentifier,
          totalPageViews: row.totalPageViews
        }))
      ),
      [
        {
          name: 'All Other',
          values: {
            age: 'All Other'
          }
        },
        {
          name: 'under 13',
          values: {
            age: 'under 13'
          }
        },
        {
          name: '13 - 25',
          values: {
            age: '13 - 25'
          }
        },
        {
          name: '25 - 35',
          values: {
            age: '25 - 35'
          }
        },
        {
          name: '35 - 45',
          values: {
            age: '35 - 45'
          }
        }
      ],
      'Builds series when id is not available'
    );
  });
});

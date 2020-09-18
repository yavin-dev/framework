import { module, test } from 'qunit';
import { topN, mostRecentData, dataByDimensions, maxDataByDimensions } from 'navi-core/utils/data';
import { setupTest } from 'ember-qunit';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';

module('Unit | Utils | Data', function(hooks) {
  setupTest(hooks);

  test('top n values', function(assert) {
    assert.expect(3);

    let rows = [{ a: '400' }, { a: '20' }, { a: '600' }];

    assert.deepEqual(topN(rows, 'a', 2), [{ a: '600' }, { a: '400' }], 'Top 2 rows for given field are returned');

    assert.deepEqual(topN(rows, 'a', 20), rows, 'All rows are returned when n > rows.length');

    assert.deepEqual(topN([], 'a', 20), [], 'No rows are returned when rows.length = 0');
  });

  test('top n with undefined fields', function(assert) {
    assert.expect(1);

    let rows = [{ a: '400' }, { a: '20' }, { b: '600' }];

    assert.deepEqual(topN(rows, 'a', 2), [{ a: '400' }, { a: '20' }], 'Undefined field values are skipped');
  });

  test('most recent data', function(assert) {
    assert.expect(2);

    let rows = [
      { 'network.dateTime(grain=year)': '2015', metric: 100, otherDate: '2030' },
      { 'network.dateTime(grain=year)': '2016', metric: 100, otherDate: '2031' },
      { 'network.dateTime(grain=year)': '2017', metric: 100, otherDate: '2032' },
      { 'network.dateTime(grain=year)': '2015', metric: 200, otherDate: '2033' },
      { 'network.dateTime(grain=year)': '2016', metric: 200, otherDate: '2034' },
      { 'network.dateTime(grain=year)': '2017', metric: 200, otherDate: '2035' }
    ];

    assert.deepEqual(
      mostRecentData(rows),
      [
        { 'network.dateTime(grain=year)': '2017', metric: 100, otherDate: '2032' },
        { 'network.dateTime(grain=year)': '2017', metric: 200, otherDate: '2035' }
      ],
      'All data rows with latest .dateTime are returned'
    );

    assert.deepEqual(
      mostRecentData(rows, 'otherDate'),
      [{ 'network.dateTime(grain=year)': '2017', metric: 200, otherDate: '2035' }],
      'All data rows with latest specified canonicalName timeDimension are returned'
    );
  });

  test('data by dimensions', function(assert) {
    assert.expect(1);

    let rows = [
      { 'dimension(field=id)': 'a', metric: 100 },
      { 'dimension(field=id)': 'a', metric: 200 },
      { 'dimension(field=id)': 'b', metric: 100 },
      { 'dimension(field=id)': 'b', metric: 300 }
    ];

    const data = dataByDimensions(rows, [{ canonicalName: 'dimension(field=id)' }] as ColumnFragment[]);

    assert.deepEqual(
      data.getDataForKey('a'),
      [
        { 'dimension(field=id)': 'a', metric: 100 },
        { 'dimension(field=id)': 'a', metric: 200 }
      ],
      'All data rows for dimension a are returned'
    );
  });

  test('max data by dimensions', function(assert) {
    assert.expect(1);

    let rows = [
      { 'dimension(field=id)': 'a', metric: 100 },
      { 'dimension(field=id)': 'a', metric: 200 },
      { 'dimension(field=id)': 'b', metric: 100 },
      { 'dimension(field=id)': 'b', metric: 300 }
    ];

    assert.deepEqual(
      maxDataByDimensions(rows, [{ canonicalName: 'dimension(field=id)' }] as ColumnFragment[], 'metric'),
      [
        { 'dimension(field=id)': 'a', metric: 200 },
        { 'dimension(field=id)': 'b', metric: 300 }
      ],
      'All data rows for max value based on dimensions are returned'
    );
  });
});

import { module, test } from 'qunit';
import { groupDataByDimensions, chartTypeForRequest } from 'navi-core/utils/chart-data';
import { buildTestRequest } from '../../helpers/request';
import { setupTest } from 'ember-qunit';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

module('Unit | Utils | Chart Data', function(hooks) {
  setupTest(hooks);

  test('groupDataByDimensions', function(assert) {
    assert.expect(2);

    const rows = [
      {
        'age(field=id)': '-3',
        dateTime: '2015-12-14 00:00:00.000',
        totalPageViews: 3072620639,
        uniqueIdentifier: 155191081
      },
      {
        'age(field=id)': '1',
        dateTime: '2015-12-14 00:00:00.000',
        totalPageViews: 2072620639,
        uniqueIdentifier: 55191081
      }
    ];
    const expectedDataGroup = [
      {
        'age(field=id)': '1',
        dateTime: '2015-12-14 00:00:00.000',
        totalPageViews: 2072620639,
        uniqueIdentifier: 55191081
      }
    ];
    const dataGroup = groupDataByDimensions(rows, [{ canonicalName: 'age(field=id)' }] as ColumnFragment[]);

    assert.deepEqual(dataGroup.getDataForKey('1'), expectedDataGroup, 'groupDataByDimensions groups data as expected');

    assert.deepEqual(
      groupDataByDimensions(
        [
          { 'foo(field=desc)': 'foo', metricName: 123 },
          { 'foo(field=desc)': 'bar', metricName: 321 }
        ],
        [{ canonicalName: 'foo(field=desc)' }] as ColumnFragment[]
      ).getDataForKey('bar'),
      [{ 'foo(field=desc)': 'bar', metricName: 321 }],
      "Still can group even if identifier field isn't present"
    );
  });

  test('chartTypeForRequest', function(assert) {
    assert.expect(3);

    let request = buildTestRequest([{ field: 'totalPageViews' }], [{ field: 'age' }, { field: 'gender' }]);

    assert.equal(chartTypeForRequest(request), 'dimension', 'chartTypeForRequest retuns dimension series as expected');

    request = buildTestRequest([{ field: 'totalPageViews' }]);

    assert.equal(chartTypeForRequest(request), 'metric', 'chartTypeForRequest retuns metric series as expected');

    request = buildTestRequest([{ field: 'totalPageViews' }], [], { start: 'P104W', end: 'current' });

    assert.equal(
      chartTypeForRequest(request),
      'dateTime',
      'chartTypeForRequest returns dateTime series when request has single metric, no dimensions, and interval over a year'
    );
  });
});

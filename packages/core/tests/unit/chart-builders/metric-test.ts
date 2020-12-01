import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { TestContext as Context } from 'ember-test-helpers';
import { buildTestRequest } from '../../helpers/request';
import MetricChartBuilder from 'navi-core/chart-builders/metric';
//@ts-ignore
import TooltipTemplate from '../../../../navi-core/templates/chart-tooltips/metric';
import EmberObject from '@ember/object';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { C3Row } from 'navi-core/chart-builders/base';
import { setOwner } from '@ember/application';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import StoreService from '@ember-data/store';

interface TestContext extends Context {
  store: StoreService;
}

const DATA = NaviFactResponse.create({
  rows: [
    {
      'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
      uniqueIdentifier: 172933788,
      totalPageViews: 3669828357
    },
    {
      'network.dateTime(grain=day)': '2016-05-31 00:00:00.000',
      uniqueIdentifier: 183206656,
      totalPageViews: 4088487125
    },
    {
      'network.dateTime(grain=day)': '2016-06-01 00:00:00.000',
      uniqueIdentifier: 183380921,
      totalPageViews: 4024700302
    },
    {
      'network.dateTime(grain=day)': '2016-06-02 00:00:00.000',
      uniqueIdentifier: 180559793,
      totalPageViews: 3950276031
    },
    {
      'network.dateTime(grain=day)': '2016-06-03 00:00:00.000',
      uniqueIdentifier: 172724594,
      totalPageViews: 3697156058
    }
  ]
});
let ChartBuilder = MetricChartBuilder.create();
let Request: RequestFragment;

module('Unit | Chart Builders | Metric', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    setOwner(ChartBuilder, this.owner);
    Request = buildTestRequest(
      [{ field: 'uniqueIdentifier' }, { field: 'totalPageViews' }],
      [],
      { start: '2016-05-30 00:00:00.000', end: '2016-06-04 00:00:00.000' },
      'day'
    );
    this.store = this.owner.lookup('service:store') as StoreService;
    const naviMetadata = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    await naviMetadata.loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('buildData - no metrics', function(assert) {
    assert.expect(1);

    const request = buildTestRequest(
      [],
      [],
      { start: '2016-05-30 00:00:00.000', end: '2016-06-04 00:00:00.000' },
      'day'
    );
    assert.deepEqual(
      ChartBuilder.buildData(DATA, {}, request).series,
      [
        { x: { rawValue: '2016-05-30 00:00:00.000', displayValue: 'May 30' } },
        { x: { rawValue: '2016-05-31 00:00:00.000', displayValue: 'May 31' } },
        { x: { rawValue: '2016-06-01 00:00:00.000', displayValue: 'Jun 1' } },
        { x: { rawValue: '2016-06-02 00:00:00.000', displayValue: 'Jun 2' } },
        { x: { rawValue: '2016-06-03 00:00:00.000', displayValue: 'Jun 3' } }
      ],
      'No series are made when no metrics are requested'
    );
  });

  test('groupDataBySeries - many metrics', function(assert) {
    assert.expect(1);

    assert.deepEqual(
      ChartBuilder.buildData(DATA, {}, Request),
      {
        series: ([
          {
            x: { rawValue: '2016-05-30 00:00:00.000', displayValue: 'May 30' },
            'series.0': 172933788,
            'series.1': 3669828357
          },
          {
            x: { rawValue: '2016-05-31 00:00:00.000', displayValue: 'May 31' },
            'series.0': 183206656,
            'series.1': 4088487125
          },
          {
            x: { rawValue: '2016-06-01 00:00:00.000', displayValue: 'Jun 1' },
            'series.0': 183380921,
            'series.1': 4024700302
          },
          {
            x: { rawValue: '2016-06-02 00:00:00.000', displayValue: 'Jun 2' },
            'series.0': 180559793,
            'series.1': 3950276031
          },
          {
            x: { rawValue: '2016-06-03 00:00:00.000', displayValue: 'Jun 3' },
            'series.0': 172724594,
            'series.1': 3697156058
          }
        ] as unknown) as C3Row[],
        names: {
          'series.0': 'Unique Identifiers',
          'series.1': 'Total Page Views'
        }
      },
      'A series is made for each requested metric'
    );
  });

  test('groupDataBySeries - gaps in data', function(assert) {
    assert.expect(1);

    const request = buildTestRequest(
      [{ field: 'totalPageViews' }, { field: 'uniqueIdentifier' }],
      [],
      { start: '2016-06-01 00:00:00.000', end: '2016-06-10 00:00:00.000' },
      'day'
    );
    const data = NaviFactResponse.create({
      rows: [
        { 'network.dateTime(grain=day)': '2016-06-03 00:00:00.000', totalPageViews: 3669828357 },
        { 'network.dateTime(grain=day)': '2016-06-05 00:00:00.000', totalPageViews: 3669823211 }
      ]
    });

    assert.deepEqual(
      ChartBuilder.buildData(data, {}, request),
      {
        series: ([
          {
            x: { rawValue: '2016-06-03 00:00:00.000', displayValue: 'Jun 3' },
            'series.0': 3669828357,
            'series.1': null
          },
          {
            x: { rawValue: '2016-06-04 00:00:00.000', displayValue: 'Jun 4' },
            'series.0': null,
            'series.1': null
          },
          {
            x: { rawValue: '2016-06-05 00:00:00.000', displayValue: 'Jun 5' },
            'series.0': 3669823211,
            'series.1': null
          }
        ] as unknown) as C3Row[],
        names: {
          'series.0': 'Total Page Views',
          'series.1': 'Unique Identifiers'
        }
      },
      'Intervals are trimmed and missing data points are filled with null values'
    );
  });

  test('groupDataBySeries - hour granularity series', function(assert) {
    assert.expect(1);

    const request = buildTestRequest(
      [{ field: 'totalPageViews' }],
      [],
      { start: '2016-05-31 00:00:00.000', end: '2016-05-31 02:00:00.000' },
      'hour'
    );
    const data = NaviFactResponse.create({
      rows: [
        { 'network.dateTime(grain=hour)': '2016-05-31 00:00:00.000', totalPageViews: 3669828357 },
        { 'network.dateTime(grain=hour)': '2016-05-31 01:00:00.000', totalPageViews: 4088487125 }
      ]
    });

    assert.deepEqual(
      ChartBuilder.buildData(data, {}, request),
      {
        series: ([
          {
            x: { rawValue: '2016-05-31 00:00:00.000', displayValue: '00:00' },
            'series.0': 3669828357
          },
          {
            x: { rawValue: '2016-05-31 01:00:00.000', displayValue: '01:00' },
            'series.0': 4088487125
          }
        ] as unknown) as C3Row[],
        names: {
          'series.0': 'Total Page Views'
        }
      },
      'A series has the properly formatted displayValue'
    );
  });

  test('groupDataBySeries - month granularity series', function(assert) {
    assert.expect(1);

    const request = buildTestRequest(
      [{ field: 'totalPageViews' }],
      [],
      { start: '2016-12-01 00:00:00.000', end: '2017-02-01 01:00:00.000' },
      'month'
    );
    const data = NaviFactResponse.create({
      rows: [
        { 'network.dateTime(grain=month)': '2016-12-01 00:00:00.000', totalPageViews: 3669828357 },
        { 'network.dateTime(grain=month)': '2017-01-01 00:00:00.000', totalPageViews: 4088487125 }
      ]
    });

    assert.deepEqual(
      ChartBuilder.buildData(data, {}, request),
      {
        series: ([
          {
            x: { rawValue: '2016-12-01 00:00:00.000', displayValue: 'Dec 2016' },
            'series.0': 3669828357
          },
          {
            x: { rawValue: '2017-01-01 00:00:00.000', displayValue: 'Jan 2017' },
            'series.0': 4088487125
          }
        ] as unknown) as C3Row[],
        names: {
          'series.0': 'Total Page Views'
        }
      },
      'A series has the properly formatted displayValue'
    );
  });

  test('Zero in chart data', function(assert) {
    assert.expect(1);

    const request = buildTestRequest(
      [{ field: 'totalPageViews' }, { field: 'uniqueIdentifier' }],
      [],
      { start: '2016-06-02 00:00:00.000', end: '2016-06-03 00:00:00.000' },
      'day'
    );
    const data = NaviFactResponse.create({
      rows: [{ 'network.dateTime(grain=day)': '2016-06-02 00:00:00.000', totalPageViews: 0 }]
    });

    assert.deepEqual(
      ChartBuilder.buildData(data, {}, request),
      {
        series: ([
          {
            x: { rawValue: '2016-06-02 00:00:00.000', displayValue: 'Jun 2' },
            'series.0': 0,
            'series.1': null
          }
        ] as unknown) as C3Row[],
        names: {
          'series.0': 'Total Page Views',
          'series.1': 'Unique Identifiers'
        }
      },
      'Zero values are not considered gaps in data'
    );
  });

  test('buildData - no time dimension', function(assert) {
    const request = this.store.createFragment('bard-request-v2/request', {
      columns: [
        { type: 'metric', field: 'uniqueIdentifier', parameters: {}, source: 'bardOne' },
        { type: 'metric', field: 'pageViews', parameters: {}, source: 'bardOne' }
      ],
      filters: [],
      sorts: [],
      requestVersion: '2.0',
      dataSource: 'bardOne',
      table: 'network'
    });

    const data = NaviFactResponse.create({
      rows: [{ pageViews: 10, uniqueIdentifier: 22 }]
    });

    assert.deepEqual(
      ChartBuilder.buildData(data, {}, request),
      {
        names: {
          'series.0': 'Unique Identifiers',
          'series.1': 'Page Views'
        },
        series: ([
          {
            'series.0': 22,
            'series.1': 10,
            x: {
              displayValue: '',
              rawValue: ''
            }
          }
        ] as unknown) as C3Row[]
      },
      '`buildData` constructs a single c3 row when a time dimension is not requested'
    );
  });

  test('buildTooltip', function(assert) {
    assert.expect(2);

    let config = {},
      x = '2016-06-02 00:00:00.000',
      tooltipData = [
        {
          x,
          name: 'Unique Identifiers',
          value: 180559793
        }
      ];

    //Populates the 'byXSeries' property in the builder that buildTooltip uses
    ChartBuilder.buildData(DATA, config, Request);

    let mixin = ChartBuilder.buildTooltip(config, Request),
      tooltipClass = EmberObject.extend(mixin, {}),
      tooltip = tooltipClass.create({ config, Request, tooltipData, x });

    assert.equal(tooltip.layout, TooltipTemplate, 'Tooltip uses metric tooltip template');

    //@ts-expect-error
    assert.deepEqual(tooltip.rowData, [DATA.rows[3]], 'The correct response row is given to the tooltip');
  });
});

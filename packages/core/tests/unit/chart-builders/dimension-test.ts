/* eslint-disable @typescript-eslint/camelcase */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import BuilderClass from 'navi-core/chart-builders/dimension';
//@ts-ignore
import TooltipTemplate from '../../../../navi-core/templates/chart-tooltips/dimension';
import { buildTestRequest } from 'dummy/tests/helpers/request';
import { C3Row } from 'navi-core/chart-builders/base';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { TestContext as Context } from 'ember-test-helpers';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import StoreService from '@ember-data/store';

interface TestContext extends Context {
  store: StoreService;
}

const DimensionChartBuilder = BuilderClass.create();

/*eslint max-len: ["error", { "code": 200 }]*/
// prettier-ignore
const DATA = NaviFactResponse.create({
  rows: [
    { 'network.dateTime(grain=day)': '2016-05-30 00:00:00.000', 'age(field=id)': '-3', totalPageViews: 3669828357 },
    { 'network.dateTime(grain=day)': '2016-05-31 00:00:00.000', 'age(field=id)': '-3', totalPageViews: 4088487125 },
    { 'network.dateTime(grain=day)': '2016-06-01 00:00:00.000', 'age(field=id)': '-3', totalPageViews: 4024700302 },
    { 'network.dateTime(grain=day)': '2016-05-30 00:00:00.000', 'age(field=id)': '1', totalPageViews: 2669828357 },
    { 'network.dateTime(grain=day)': '2016-05-31 00:00:00.000', 'age(field=id)': '1', totalPageViews: 3088487125 },
    { 'network.dateTime(grain=day)': '2016-06-01 00:00:00.000', 'age(field=id)': '1', totalPageViews: 3024700302 }
  ]
});
// prettier-ignore
const DATA2 = NaviFactResponse.create({
  rows: [
    { 'network.dateTime(grain=day)': '2016-01-01 00:00:00.000', 'age(field=id)': '-2', 'gender(field=id)': '-1', totalPageViews: 176267792438 },
    { 'network.dateTime(grain=day)': '2016-01-01 00:00:00.000', 'age(field=id)': '-2', 'gender(field=id)': 'f', totalPageViews: 76735188 },
    { 'network.dateTime(grain=day)': '2016-01-01 00:00:00.000', 'age(field=id)': '-2', 'gender(field=id)': 'm', totalPageViews: 74621538 },
    { 'network.dateTime(grain=day)': '2016-01-01 00:00:00.000', 'age(field=id)': '1', 'gender(field=id)': '-1', totalPageViews: 2306935 },
    { 'network.dateTime(grain=day)': '2016-01-01 00:00:00.000', 'age(field=id)': '1', 'gender(field=id)': 'f', totalPageViews: 158591335 },
    { 'network.dateTime(grain=day)': '2016-01-01 00:00:00.000', 'age(field=id)': '1', 'gender(field=id)': 'm', totalPageViews: 293462742 },
    { 'network.dateTime(grain=day)': '2016-01-02 00:00:00.000', 'age(field=id)': '-2', 'gender(field=id)': '-1', totalPageViews: 163354994741 },
    { 'network.dateTime(grain=day)': '2016-01-02 00:00:00.000', 'age(field=id)': '-2', 'gender(field=id)': 'f', totalPageViews: 74006011 },
    { 'network.dateTime(grain=day)': '2016-01-02 00:00:00.000', 'age(field=id)': '-2', 'gender(field=id)': 'm', totalPageViews: 72011227 },
    { 'network.dateTime(grain=day)': '2016-01-02 00:00:00.000', 'age(field=id)': '1', 'gender(field=id)': '-1', totalPageViews: 5630202 },
    { 'network.dateTime(grain=day)': '2016-01-02 00:00:00.000', 'age(field=id)': '1', 'gender(field=id)': 'f', totalPageViews: 156664890 },
    { 'network.dateTime(grain=day)': '2016-01-02 00:00:00.000', 'age(field=id)': '1', 'gender(field=id)': 'm', totalPageViews: 289431575 }
  ]
});

const metrics = [{ cid: 'cid_totalPageViews', field: 'totalPageViews' }];
const ageDim = { cid: 'cid_age', field: 'age', parameters: { field: 'id' } };
const genderDim = { cid: 'cid_gender', field: 'gender', parameters: { field: 'id' } };

let REQUEST: RequestFragment, REQUEST2: RequestFragment;

module('Unit | Chart Builders | Dimension', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    REQUEST = buildTestRequest(
      metrics,
      [ageDim],
      { start: '2016-05-30 00:00:00.000', end: '2016-06-02 00:00:00.000' },
      'day'
    );
    this.store = this.owner.lookup('service:store') as StoreService;
    REQUEST2 = buildTestRequest(metrics, [ageDim, genderDim], { start: 'P2D', end: '2016-01-03 00:00:00.000' }, 'day');
    const naviMetadata = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    await naviMetadata.loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('buildData - no dimensions', function (assert) {
    assert.expect(1);

    assert.deepEqual(
      DimensionChartBuilder.buildData(DATA, { metricCid: 'cid_totalPageViews', dimensions: [] }, REQUEST),
      {
        series: [
          { x: { rawValue: '2016-05-30 00:00:00.000', displayValue: 'May 30' } },
          { x: { rawValue: '2016-05-31 00:00:00.000', displayValue: 'May 31' } },
          { x: { rawValue: '2016-06-01 00:00:00.000', displayValue: 'Jun 1' } },
        ] as C3Row[],
        names: {},
      },
      'Error Case: No series are made when no dimensions are requested'
    );
  });

  test('buildData - no time dimension', function (assert) {
    const request = this.store.createFragment('bard-request-v2/request', {
      columns: [
        { type: 'metric', field: 'totalPageViews', cid: 'cid_totalPageViews', parameters: {}, source: 'bardOne' },
        { type: 'dimension', field: 'age', cid: 'cid_age', parameters: {}, source: 'bardOne' },
        { type: 'dimension', field: 'gender', cid: 'cid_gender', parameters: {}, source: 'bardOne' },
      ],
      filters: [],
      sorts: [],
      requestVersion: '2.0',
      dataSource: 'bardOne',
      table: 'network',
    });

    const data = NaviFactResponse.create({
      rows: [
        { totalPageViews: 10, age: '-2', gender: 'm' },
        { totalPageViews: 12, age: '1', gender: 'f' },
      ],
    });

    assert.deepEqual(
      DimensionChartBuilder.buildData(
        data,
        {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            { name: 'All Other | M', values: { cid_age: '-2', cid_gender: 'm' } },
            { name: 'Under 13 | F', values: { cid_age: '1', cid_gender: 'f' } },
          ],
        },
        request
      ),
      {
        names: {
          'series.0': 'All Other | M',
          'series.1': 'Under 13 | F',
        },
        series: ([
          {
            'series.0': 10,
            'series.1': 12,
            x: {
              displayValue: '',
              rawValue: '',
            },
          },
        ] as unknown) as C3Row[],
      },
      '`buildData` constructs a single c3 row when a time dimension is not requested'
    );
  });

  test('groupDataBySeries - many dimensions of same type', function (assert) {
    assert.expect(1);

    assert.deepEqual(
      DimensionChartBuilder.buildData(
        DATA,
        {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            { name: 'All Other', values: { cid_age: '-3' } },
            { name: 'Under 13', values: { cid_age: '1' } },
          ],
        },
        REQUEST
      ),
      {
        series: ([
          {
            x: { rawValue: '2016-05-30 00:00:00.000', displayValue: 'May 30' },
            'series.0': 3669828357,
            'series.1': 2669828357,
          },
          {
            x: { rawValue: '2016-05-31 00:00:00.000', displayValue: 'May 31' },
            'series.0': 4088487125,
            'series.1': 3088487125,
          },
          {
            x: { rawValue: '2016-06-01 00:00:00.000', displayValue: 'Jun 1' },
            'series.0': 4024700302,
            'series.1': 3024700302,
          },
        ] as unknown) as C3Row[],
        names: {
          'series.0': 'All Other',
          'series.1': 'Under 13',
        },
      },
      'A series is made for each requested dimension'
    );
  });

  test('groupDataBySeries hour granularity - many dimensions of same type', function (assert) {
    assert.expect(1);

    let request = buildTestRequest(
      metrics,
      [ageDim],
      { start: '2016-05-30 00:00:00.000', end: '2016-05-30 02:00:00.000' },
      'hour'
    );
    const data = NaviFactResponse.create({
      //prettier-ignore
      rows: [
        { 'network.dateTime(grain=hour)': '2016-05-30 00:00:00.000', 'age(field=id)': '-3', totalPageViews: 3669828357 },
        { 'network.dateTime(grain=hour)': '2016-05-30 01:00:00.000', 'age(field=id)': '-3', totalPageViews: 4088487125 },
        { 'network.dateTime(grain=hour)': '2016-05-30 00:00:00.000', 'age(field=id)': '1', totalPageViews: 3669828357 },
        { 'network.dateTime(grain=hour)': '2016-05-30 01:00:00.000', 'age(field=id)': '1', totalPageViews: 4088487125 }
      ],
    });

    assert.deepEqual(
      DimensionChartBuilder.buildData(
        data,
        {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            { name: 'All Other', values: { cid_age: '-3' } },
            { name: 'Under 13', values: { cid_age: '1' } },
          ],
        },
        request
      ),
      {
        series: ([
          {
            x: { rawValue: '2016-05-30 00:00:00.000', displayValue: '00:00' },
            'series.0': 3669828357,
            'series.1': 3669828357,
          },
          {
            x: { rawValue: '2016-05-30 01:00:00.000', displayValue: '01:00' },
            'series.0': 4088487125,
            'series.1': 4088487125,
          },
        ] as unknown) as C3Row[],
        names: {
          'series.0': 'All Other',
          'series.1': 'Under 13',
        },
      },
      'A series has the properly formmatted displayValue'
    );
  });

  test('groupDataBySeries month granularity - many dimensions of same type', function (assert) {
    assert.expect(1);

    const request = buildTestRequest(
      metrics,
      [ageDim],
      { start: '2016-12-01 00:00:00.000', end: '2017-02-01 00:00:00.000' },
      'month'
    );
    const data = NaviFactResponse.create({
      //prettier-ignore
      rows: [
        { 'network.dateTime(grain=month)': '2016-12-01 00:00:00.000', 'age(field=id)': '-3', totalPageViews: 3669828357 },
        { 'network.dateTime(grain=month)': '2017-01-01 00:00:00.000', 'age(field=id)': '-3', totalPageViews: 4088487125 },
        { 'network.dateTime(grain=month)': '2016-12-01 00:00:00.000', 'age(field=id)': '1', totalPageViews: 3669828357 },
        { 'network.dateTime(grain=month)': '2017-01-01 00:00:00.000', 'age(field=id)': '1', totalPageViews: 4088487125 }
      ],
    });

    assert.deepEqual(
      DimensionChartBuilder.buildData(
        data,
        {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            { name: 'All Other', values: { cid_age: '-3' } },
            { name: 'Under 13', values: { cid_age: '1' } },
          ],
        },
        request
      ),
      {
        series: ([
          {
            x: { rawValue: '2016-12-01 00:00:00.000', displayValue: 'Dec 2016' },
            'series.0': 3669828357,
            'series.1': 3669828357,
          },
          {
            x: { rawValue: '2017-01-01 00:00:00.000', displayValue: 'Jan 2017' },
            'series.0': 4088487125,
            'series.1': 4088487125,
          },
        ] as unknown) as C3Row[],
        names: {
          'series.0': 'All Other',
          'series.1': 'Under 13',
        },
      },
      'A series has the properly formmatted displayValue'
    );
  });

  test('groupDataBySeries - many dimensions of different type', function (assert) {
    assert.expect(1);

    assert.deepEqual(
      DimensionChartBuilder.buildData(
        DATA2,
        {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            { name: 'All Other | M', values: { cid_age: '-2', cid_gender: 'm' } },
            { name: 'Under 13 | F', values: { cid_age: '1', cid_gender: 'f' } },
          ],
        },
        REQUEST2
      ),
      {
        series: ([
          {
            x: { displayValue: 'Jan 1', rawValue: '2016-01-01 00:00:00.000' },
            'series.0': 74621538,
            'series.1': 158591335,
          },
          {
            x: { displayValue: 'Jan 2', rawValue: '2016-01-02 00:00:00.000' },
            'series.0': 72011227,
            'series.1': 156664890,
          },
        ] as unknown) as C3Row[],
        names: {
          'series.0': 'All Other | M',
          'series.1': 'Under 13 | F',
        },
      },
      'A series is made for each requested dimension with multiple dimension'
    );
  });

  test('groupDataBySeries - many dimensions of different type with some that are not found', function (assert) {
    assert.expect(1);

    assert.deepEqual(
      DimensionChartBuilder.buildData(
        DATA2,
        {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            { name: 'Unknown | M', values: { cid_age: '-3', cid_gender: 'm' } },
            { name: 'Under 13 | F', values: { cid_age: '1', cid_gender: 'f' } },
          ],
        },
        REQUEST2
      ),
      {
        series: ([
          {
            x: { displayValue: 'Jan 1', rawValue: '2016-01-01 00:00:00.000' },
            'series.0': null,
            'series.1': 158591335,
          },
          {
            x: { displayValue: 'Jan 2', rawValue: '2016-01-02 00:00:00.000' },
            'series.0': null,
            'series.1': 156664890,
          },
        ] as unknown) as C3Row[],
        names: {
          'series.0': 'Unknown | M',
          'series.1': 'Under 13 | F',
        },
      },
      'A series is made for each requested dimension with multiple dimension with some that are not found'
    );
  });

  test('buildTooltip', function (assert) {
    assert.expect(2);

    const config = {
      metricCid: 'cid_totalPageViews',
      dimensions: [
        { name: 'All Other', values: { cid_age: '-3' } },
        { name: 'Under 13', values: { cid_age: '1' } },
      ],
    };
    const x = '2016-05-31 00:00:00.000';
    const tooltipData = [{ x, id: -3, name: 'All Other', value: 4088487125 }];

    //Populates the 'byXSeries' property in the builder that buildTooltip uses
    DimensionChartBuilder.buildData(DATA, config, REQUEST);

    let mixin = DimensionChartBuilder.buildTooltip(config, REQUEST),
      tooltipClass = EmberObject.extend(mixin, {}),
      tooltip = tooltipClass.create({ config, REQUEST, tooltipData, x });

    assert.equal(tooltip.layout, TooltipTemplate, 'Tooltip uses dimension tooltip template');

    //@ts-expect-error
    assert.deepEqual(tooltip.rowData, [DATA.rows[1]], 'The correct response row is given to the tooltip');
  });
});

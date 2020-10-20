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

const DimensionChartBuilder = BuilderClass.create();

/*eslint max-len: ["error", { "code": 200 }]*/
// prettier-ignore
const DATA = {
  rows: [
    { 'network.dateTime(grain=day)': '2016-05-30 00:00:00.000', 'age(field=id)': '-3', totalPageViews: 3669828357 },
    { 'network.dateTime(grain=day)': '2016-05-31 00:00:00.000', 'age(field=id)': '-3', totalPageViews: 4088487125 },
    { 'network.dateTime(grain=day)': '2016-06-01 00:00:00.000', 'age(field=id)': '-3', totalPageViews: 4024700302 },
    { 'network.dateTime(grain=day)': '2016-05-30 00:00:00.000', 'age(field=id)': '1', totalPageViews: 2669828357 },
    { 'network.dateTime(grain=day)': '2016-05-31 00:00:00.000', 'age(field=id)': '1', totalPageViews: 3088487125 },
    { 'network.dateTime(grain=day)': '2016-06-01 00:00:00.000', 'age(field=id)': '1', totalPageViews: 3024700302 }
  ],
  meta: {}
};
// prettier-ignore
const DATA2 = {
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
  ],
  meta: {}
};

const metrics = [{ cid: 'cid_totalPageViews', field: 'totalPageViews' }];
const ageDim = { cid: 'cid_age', field: 'age', parameters: { field: 'id' } };
const genderDim = { cid: 'cid_gender', field: 'gender', parameters: { field: 'id' } };

let REQUEST: RequestFragment, REQUEST2: RequestFragment;

module('Unit | Chart Builders | Dimension', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    REQUEST = buildTestRequest(
      metrics,
      [ageDim],
      { start: '2016-05-30 00:00:00.000', end: '2016-06-02 00:00:00.000' },
      'day'
    );
    REQUEST2 = buildTestRequest(metrics, [ageDim, genderDim], { start: 'P2D', end: '2016-01-03 00:00:00.000' }, 'day');
  });

  test('buildData - no dimensions', function(assert) {
    assert.expect(1);

    assert.deepEqual(
      DimensionChartBuilder.buildData(DATA, { metricCid: 'cid_totalPageViews', dimensions: [] }, REQUEST),
      [
        { x: { rawValue: '2016-05-30 00:00:00.000', displayValue: 'May 30' } },
        { x: { rawValue: '2016-05-31 00:00:00.000', displayValue: 'May 31' } },
        { x: { rawValue: '2016-06-01 00:00:00.000', displayValue: 'Jun 1' } }
      ],
      'Error Case: No series are made when no dimensions are requested'
    );
  });

  test('groupDataBySeries - many dimensions of same type', function(assert) {
    assert.expect(1);

    assert.deepEqual(
      DimensionChartBuilder.buildData(
        DATA,
        {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            { name: 'All Other', values: { cid_age: '-3' } },
            { name: 'Under 13', values: { cid_age: '1' } }
          ]
        },
        REQUEST
      ),
      ([
        {
          x: { rawValue: '2016-05-30 00:00:00.000', displayValue: 'May 30' },
          'All Other': 3669828357,
          'Under 13': 2669828357
        },
        {
          x: { rawValue: '2016-05-31 00:00:00.000', displayValue: 'May 31' },
          'All Other': 4088487125,
          'Under 13': 3088487125
        },
        {
          x: { rawValue: '2016-06-01 00:00:00.000', displayValue: 'Jun 1' },
          'All Other': 4024700302,
          'Under 13': 3024700302
        }
      ] as unknown) as C3Row[],
      'A series is made for each requested dimension'
    );
  });

  test('groupDataBySeries all granularity - many dimensions of same type', function(assert) {
    assert.expect(1);

    const request = buildTestRequest(
      metrics,
      [ageDim],
      { start: '2016-05-30 00:00:00.000', end: '2016-05-30 00:00:00.000' },
      'all'
    );
    const data = {
      //prettier-ignore
      rows: [
        { 'network.dateTime(grain=all)': '2016-05-30 00:00:00.000', 'age(field=id)': '-3', totalPageViews: 3669828357 },
        { 'network.dateTime(grain=all)': '2016-05-30 00:00:00.000', 'age(field=id)': '1', totalPageViews: 3669828357 }
      ],
      meta: {}
    };

    assert.deepEqual(
      DimensionChartBuilder.buildData(
        data,
        {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            { name: 'All Other', values: { cid_age: '-3' } },
            { name: 'Under 13', values: { cid_age: '1' } }
          ]
        },
        request
      ),
      ([
        {
          x: { rawValue: '2016-05-30 00:00:00.000', displayValue: 'May 30' },
          'All Other': 3669828357,
          'Under 13': 3669828357
        }
      ] as unknown) as C3Row[],
      'A series has the properly formatted displayValue'
    );
  });

  test('groupDataBySeries hour granularity - many dimensions of same type', function(assert) {
    assert.expect(1);

    let request = buildTestRequest(
      metrics,
      [ageDim],
      { start: '2016-05-30 00:00:00.000', end: '2016-05-30 02:00:00.000' },
      'hour'
    );
    const data = {
      //prettier-ignore
      rows: [
        { 'network.dateTime(grain=hour)': '2016-05-30 00:00:00.000', 'age(field=id)': '-3', totalPageViews: 3669828357 },
        { 'network.dateTime(grain=hour)': '2016-05-30 01:00:00.000', 'age(field=id)': '-3', totalPageViews: 4088487125 },
        { 'network.dateTime(grain=hour)': '2016-05-30 00:00:00.000', 'age(field=id)': '1', totalPageViews: 3669828357 },
        { 'network.dateTime(grain=hour)': '2016-05-30 01:00:00.000', 'age(field=id)': '1', totalPageViews: 4088487125 }
      ],
      meta: {}
    };

    assert.deepEqual(
      DimensionChartBuilder.buildData(
        data,
        {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            { name: 'All Other', values: { cid_age: '-3' } },
            { name: 'Under 13', values: { cid_age: '1' } }
          ]
        },
        request
      ),
      ([
        {
          x: { rawValue: '2016-05-30 00:00:00.000', displayValue: '00:00' },
          'All Other': 3669828357,
          'Under 13': 3669828357
        },
        {
          x: { rawValue: '2016-05-30 01:00:00.000', displayValue: '01:00' },
          'All Other': 4088487125,
          'Under 13': 4088487125
        }
      ] as unknown) as C3Row[],
      'A series has the properly formmatted displayValue'
    );
  });

  test('groupDataBySeries month granularity - many dimensions of same type', function(assert) {
    assert.expect(1);

    const request = buildTestRequest(
      metrics,
      [ageDim],
      { start: '2016-12-01 00:00:00.000', end: '2017-02-01 00:00:00.000' },
      'month'
    );
    const data = {
      //prettier-ignore
      rows: [
        { 'network.dateTime(grain=month)': '2016-12-01 00:00:00.000', 'age(field=id)': '-3', totalPageViews: 3669828357 },
        { 'network.dateTime(grain=month)': '2017-01-01 00:00:00.000', 'age(field=id)': '-3', totalPageViews: 4088487125 },
        { 'network.dateTime(grain=month)': '2016-12-01 00:00:00.000', 'age(field=id)': '1', totalPageViews: 3669828357 },
        { 'network.dateTime(grain=month)': '2017-01-01 00:00:00.000', 'age(field=id)': '1', totalPageViews: 4088487125 }
      ],
      meta: {}
    };

    assert.deepEqual(
      DimensionChartBuilder.buildData(
        data,
        {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            { name: 'All Other', values: { cid_age: '-3' } },
            { name: 'Under 13', values: { cid_age: '1' } }
          ]
        },
        request
      ),
      ([
        {
          x: { rawValue: '2016-12-01 00:00:00.000', displayValue: 'Dec 2016' },
          'All Other': 3669828357,
          'Under 13': 3669828357
        },
        {
          x: { rawValue: '2017-01-01 00:00:00.000', displayValue: 'Jan 2017' },
          'All Other': 4088487125,
          'Under 13': 4088487125
        }
      ] as unknown) as C3Row[],
      'A series has the properly formmatted displayValue'
    );
  });

  test('groupDataBySeries - many dimensions of different type', function(assert) {
    assert.expect(1);

    assert.deepEqual(
      DimensionChartBuilder.buildData(
        DATA2,
        {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            { name: 'All Other | M', values: { cid_age: '-2', cid_gender: 'm' } },
            { name: 'Under 13 | F', values: { cid_age: '1', cid_gender: 'f' } }
          ]
        },
        REQUEST2
      ),
      ([
        {
          x: { displayValue: 'Jan 1', rawValue: '2016-01-01 00:00:00.000' },
          'All Other | M': 74621538,
          'Under 13 | F': 158591335
        },
        {
          x: { displayValue: 'Jan 2', rawValue: '2016-01-02 00:00:00.000' },
          'All Other | M': 72011227,
          'Under 13 | F': 156664890
        }
      ] as unknown) as C3Row[],
      'A series is made for each requested dimension with multiple dimension'
    );
  });

  test('groupDataBySeries - many dimensions of different type with some that are not found', function(assert) {
    assert.expect(1);

    assert.deepEqual(
      DimensionChartBuilder.buildData(
        DATA2,
        {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            { name: 'Unknown | M', values: { cid_age: '-3', cid_gender: 'm' } },
            { name: 'Under 13 | F', values: { cid_age: '1', cid_gender: 'f' } }
          ]
        },
        REQUEST2
      ),
      ([
        {
          x: { displayValue: 'Jan 1', rawValue: '2016-01-01 00:00:00.000' },
          'Under 13 | F': 158591335,
          'Unknown | M': null
        },
        {
          x: { displayValue: 'Jan 2', rawValue: '2016-01-02 00:00:00.000' },
          'Under 13 | F': 156664890,
          'Unknown | M': null
        }
      ] as unknown) as C3Row[],
      'A series is made for each requested dimension with multiple dimension with some that are not found'
    );
  });

  test('buildTooltip', function(assert) {
    assert.expect(2);

    const config = {
      metricCid: 'cid_totalPageViews',
      dimensions: [
        { name: 'All Other', values: { cid_age: '-3' } },
        { name: 'Under 13', values: { cid_age: '1' } }
      ]
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
    assert.deepEqual(tooltip.rowData, [DATA[1]], 'The correct response row is given to the tooltip');
  });
});

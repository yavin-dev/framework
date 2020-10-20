import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Object from '@ember/object';
import BuilderClass from 'navi-core/chart-builders/date-time';
import TooltipTemplate from 'navi-core/templates/chart-tooltips/date';
import { C3Row } from 'navi-core/chart-builders/base';
import { buildTestRequest } from 'dummy/tests/helpers/request';

const DateChartBuilder = BuilderClass.create();

module('Unit | Chart Builders | Date Time', function(hooks) {
  setupTest(hooks);

  test('weeks by year uses isoWeekYear', function(assert) {
    assert.expect(2);

    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2016-01-01 00:00:00.000', end: '2016-01-04 00:00:00.000' },
      'week'
    );
    const config = { timeGrain: 'year', metricCid: 'cid_pageViews' };
    const response = {
      rows: [
        { 'network.dateTime(grain=week)': '2016-01-04 00:00:00.000', pageViews: 2 }, // Week 1, 2016
        { 'network.dateTime(grain=week)': '2016-01-01 00:00:00.000', pageViews: 1 } // Week 53, 2015
      ],
      meta: {}
    };
    const data = DateChartBuilder.buildData(response, config, request);

    assert.equal(data.length, 53, 'A data entry exists for each possible week in a year');

    assert.deepEqual(
      data[0],
      ({
        x: { rawValue: 1, displayValue: 'Jan' },
        2015: null,
        2016: 2
      } as unknown) as C3Row,
      'Weeks are grouped into years based on isoWeekYear'
    );
  });

  test('days by month', function(assert) {
    assert.expect(2);

    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2015-01-01 00:00:00.000', end: '2016-03-15 00:00:00.000' },
      'day'
    );
    const config = { timeGrain: 'month', metricCid: 'cid_pageViews' };
    const response = {
      rows: [
        { 'network.dateTime(grain=day)': '2016-01-01 00:00:00.000', pageViews: 1 },
        { 'network.dateTime(grain=day)': '2016-02-01 00:00:00.000', pageViews: 2 },
        { 'network.dateTime(grain=day)': '2015-01-01 00:00:00.000', pageViews: 3 },
        { 'network.dateTime(grain=day)': '2016-03-15 00:00:00.000', pageViews: 4 }
      ],
      meta: {}
    };
    const data = DateChartBuilder.buildData(response, config, request);

    assert.equal(data.length, 31, 'A data entry exists for each possible day in a month');

    assert.deepEqual(
      data[0],
      ({
        x: { rawValue: 1, displayValue: 'Day 1' },
        'Jan 2016': 1,
        'Feb 2016': 2,
        'Jan 2015': 3,
        'Mar 2016': null
      } as unknown) as C3Row,
      'Days are grouped into month'
    );
  });

  test('days by year', function(assert) {
    assert.expect(2);

    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2015-01-01 00:00:00.000', end: '2016-03-15 00:00:00.000' },
      'day'
    );
    const config = { timeGrain: 'year', metricCid: 'cid_pageViews' };
    const response = {
      rows: [
        { 'network.dateTime(grain=day)': '2016-01-01 00:00:00.000', pageViews: 1 },
        { 'network.dateTime(grain=day)': '2016-02-01 00:00:00.000', pageViews: 2 },
        { 'network.dateTime(grain=day)': '2015-01-01 00:00:00.000', pageViews: 3 },
        { 'network.dateTime(grain=day)': '2016-03-15 00:00:00.000', pageViews: 4 }
      ],
      meta: {}
    };
    const data = DateChartBuilder.buildData(response, config, request);

    assert.equal(data.length, 366, 'A data entry exists for each possible day in a year');

    assert.deepEqual(
      data[0],
      ({
        x: { rawValue: 1, displayValue: 'Jan' },
        '2016': 1,
        '2015': 3
      } as unknown) as C3Row,
      'First data point contains values for first day of each year'
    );
  });

  test('months by year', function(assert) {
    assert.expect(2);

    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2015-01-01 00:00:00.000', end: '2016-03-15 00:00:00.000' },
      'month'
    );
    const config = { timeGrain: 'year', metricCid: 'cid_pageViews' };
    const response = {
      rows: [
        { 'network.dateTime(grain=month)': '2016-01-01 00:00:00.000', pageViews: 1 },
        { 'network.dateTime(grain=month)': '2016-02-01 00:00:00.000', pageViews: 2 },
        { 'network.dateTime(grain=month)': '2015-01-01 00:00:00.000', pageViews: 3 },
        { 'network.dateTime(grain=month)': '2014-03-15 00:00:00.000', pageViews: 4 }
      ],
      meta: {}
    };
    const data = DateChartBuilder.buildData(response, config, request);

    assert.equal(data.length, 12, 'A data entry exists for each possible month in a year');

    assert.deepEqual(
      data[0],
      ({
        x: { rawValue: 1, displayValue: 'Jan' },
        '2016': 1,
        '2015': 3,
        '2014': null
      } as unknown) as C3Row,
      'First data point contains values for first month of each year'
    );
  });

  test('hours by day', function(assert) {
    assert.expect(2);

    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2016-01-01 01:00:00.000', end: '2016-01-03 01:00:00.000' },
      'hour'
    );
    const config = { timeGrain: 'day', metricCid: 'cid_pageViews' };
    const response = {
      rows: [
        { 'network.dateTime(grain=hour)': '2016-01-01 01:00:00.000', pageViews: 1 },
        { 'network.dateTime(grain=hour)': '2016-01-02 01:00:00.000', pageViews: 2 },
        { 'network.dateTime(grain=hour)': '2016-01-03 01:00:00.000', pageViews: 3 }
      ],
      meta: {}
    };
    const data = DateChartBuilder.buildData(response, config, request);

    assert.equal(data.length, 24, 'A data entry exists for each hour in a day');

    assert.deepEqual(
      data[1],
      ({
        x: { rawValue: 2, displayValue: 'Hour 2' },
        'Jan 1': 1,
        'Jan 2': 2,
        'Jan 3': 3
      } as unknown) as C3Row,
      'Data point contains values for hour of each day'
    );
  });

  test('minutes by hour', function(assert) {
    assert.expect(2);

    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2016-01-01 00:04:00.000', end: '2016-01-02 02:04:00.000' },
      'minute'
    );
    const config = { timeGrain: 'hour', metricCid: 'cid_pageViews' };
    const response = {
      rows: [
        { 'network.dateTime(grain=minute)': '2016-01-01 00:04:00.000', pageViews: 1 },
        { 'network.dateTime(grain=minute)': '2016-01-01 01:04:00.000', pageViews: 2 },
        { 'network.dateTime(grain=minute)': '2016-01-02 02:04:00.000', pageViews: 3 }
      ],
      meta: {}
    };
    const data = DateChartBuilder.buildData(response, config, request);

    assert.equal(data.length, 60, 'A data entry exists for each minute in a hour');

    assert.deepEqual(
      data[4],
      ({
        x: { rawValue: 5, displayValue: 'Minute 5' },
        'Jan 1 00:00': 1,
        'Jan 1 01:00': 2,
        'Jan 2 02:00': 3
      } as unknown) as C3Row,
      'Data point contains values for minute of each hour'
    );
  });

  test('seconds by minute', function(assert) {
    assert.expect(2);

    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2016-01-01 00:00:20.000', end: '2016-01-01 00:03:20.000' },
      'second'
    );
    const config = { timeGrain: 'minute', metricCid: 'cid_pageViews' };
    const response = {
      rows: [
        { 'network.dateTime(grain=second)': '2016-01-01 00:00:20.000', pageViews: 1 },
        { 'network.dateTime(grain=second)': '2016-01-01 00:01:20.000', pageViews: 2 },
        { 'network.dateTime(grain=second)': '2016-01-01 00:03:20.000', pageViews: 3 }
      ],
      meta: {}
    };
    const data = DateChartBuilder.buildData(response, config, request);

    assert.equal(data.length, 61, 'A data entry exists for each second in a minute');

    assert.deepEqual(
      data[20],
      ({
        x: { rawValue: 21, displayValue: 'Second 21' },
        'Jan 1 00:00': 1,
        'Jan 1 00:01': 2,
        'Jan 1 00:03': 3
      } as unknown) as C3Row,
      'Data point contains values for second of each minute'
    );
  });

  test('Zero in chart data', function(assert) {
    assert.expect(1);

    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2016-01-01 00:00:00.000', end: '2016-01-01 00:00:00.000' },
      'day'
    );
    const config = { timeGrain: 'month', metricCid: 'cid_pageViews' };
    const response = {
      rows: [{ 'network.dateTime(grain=day)': '2016-01-01 00:00:00.000', pageViews: 0 }],
      meta: {}
    };
    const data = DateChartBuilder.buildData(response, config, request);

    assert.deepEqual(
      data[0],
      ({
        x: { rawValue: 1, displayValue: 'Day 1' },
        'Jan 2016': 0
      } as unknown) as C3Row,
      'Zero values are not considered gaps in data'
    );
  });

  test('buildTooltip', function(assert) {
    assert.expect(2);

    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2016-01-01 00:00:20.000', end: '2016-01-03 00:03:20.000' },
      'day'
    );
    const config = {
      timeGrain: 'month',
      metricCid: 'cid_pageViews'
    };
    const response = {
      rows: [
        { dateTime: '2016-01-01 00:00:20.000', pageViews: 1 },
        { dateTime: '2016-01-02 00:01:20.000', pageViews: 2 },
        { dateTime: '2016-01-03 00:03:20.000', pageViews: 3 }
      ],
      meta: {}
    };
    const x = 2;
    const tooltipData = [{ x, name: 'Jan 2016', value: 2 }];
    const mixin = DateChartBuilder.buildTooltip(config, request);
    const tooltipClass = Object.extend(mixin, {});
    const tooltip = tooltipClass.create({ config, request, tooltipData, x });

    assert.equal(tooltip.layout, TooltipTemplate, 'Tooltip uses date template');

    //@ts-expect-error
    assert.deepEqual(tooltip.rowData, [response[1]], 'The correct response row is given to the tooltip');
  });
});

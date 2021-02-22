import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Object from '@ember/object';
import BuilderClass from 'navi-core/chart-builders/date-time';
import TooltipTemplate from 'navi-core/templates/chart-tooltips/date';
import { C3Row } from 'navi-core/chart-builders/base';
import { buildTestRequest } from '../../helpers/request';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import { TestContext } from 'ember-test-helpers';

const DateChartBuilder = BuilderClass.create();

module('Unit | Chart Builders | Date Time', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    const naviMetadata = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    await naviMetadata.loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('weeks by year uses isoWeekYear', function (assert) {
    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2016-01-01 00:00:00.000', end: '2016-01-04 00:00:00.000' },
      'isoWeek'
    );
    const config = { timeGrain: 'year', metricCid: 'cid_pageViews' };
    const response = NaviFactResponse.create({
      rows: [
        { 'network.dateTime(grain=isoWeek)': '2016-01-04 00:00:00.000', pageViews: 2 }, // Week 1, 2016
        { 'network.dateTime(grain=isoWeek)': '2016-01-01 00:00:00.000', pageViews: 1 }, // Week 53, 2015
      ],
    });
    const data = DateChartBuilder.buildData(response, config, request);

    assert.equal(data.series.length, 53, 'A data entry exists for each possible week in a year');

    assert.deepEqual(
      data.series[0],
      ({
        x: { rawValue: 1, displayValue: 'Jan' },
        'series.0': null,
        'series.1': 2,
      } as unknown) as C3Row,
      'Weeks are grouped into years based on isoWeekYear'
    );

    assert.deepEqual(data.names, { 'series.0': '2015', 'series.1': '2016' }, 'Series names are mapped properly');
  });

  test('days by month', function (assert) {
    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2015-01-01 00:00:00.000', end: '2016-03-15 00:00:00.000' },
      'day'
    );
    const config = { timeGrain: 'month', metricCid: 'cid_pageViews' };
    const response = NaviFactResponse.create({
      rows: [
        { 'network.dateTime(grain=day)': '2016-01-01 00:00:00.000', pageViews: 1 },
        { 'network.dateTime(grain=day)': '2016-02-01 00:00:00.000', pageViews: 2 },
        { 'network.dateTime(grain=day)': '2015-01-01 00:00:00.000', pageViews: 3 },
        { 'network.dateTime(grain=day)': '2016-03-15 00:00:00.000', pageViews: 4 },
      ],
    });
    const data = DateChartBuilder.buildData(response, config, request);

    assert.equal(data.series.length, 31, 'A data entry exists for each possible day in a month');

    assert.deepEqual(
      data.series[0],
      ({
        x: { rawValue: 1, displayValue: 'Day 1' },
        'series.0': 1,
        'series.1': 2,
        'series.2': 3,
        'series.3': null,
      } as unknown) as C3Row,
      'Days are grouped into month'
    );

    assert.deepEqual(
      data.names,
      { 'series.0': 'Jan 2016', 'series.1': 'Feb 2016', 'series.2': 'Jan 2015', 'series.3': 'Mar 2016' },
      'Series names are mapped properly'
    );
  });

  test('days by year', function (assert) {
    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2015-01-01 00:00:00.000', end: '2016-03-15 00:00:00.000' },
      'day'
    );
    const config = { timeGrain: 'year', metricCid: 'cid_pageViews' };
    const response = NaviFactResponse.create({
      rows: [
        { 'network.dateTime(grain=day)': '2016-01-01 00:00:00.000', pageViews: 1 },
        { 'network.dateTime(grain=day)': '2016-02-01 00:00:00.000', pageViews: 2 },
        { 'network.dateTime(grain=day)': '2015-01-01 00:00:00.000', pageViews: 3 },
        { 'network.dateTime(grain=day)': '2016-03-15 00:00:00.000', pageViews: 4 },
      ],
    });
    const data = DateChartBuilder.buildData(response, config, request);

    assert.equal(data.series.length, 366, 'A data entry exists for each possible day in a year');

    assert.deepEqual(
      data.series[0],
      ({
        x: { rawValue: 1, displayValue: 'Jan' },
        'series.0': 3,
        'series.1': 1,
      } as unknown) as C3Row,
      'First data point contains values for first day of each year'
    );

    assert.deepEqual(data.names, { 'series.0': '2015', 'series.1': '2016' }, 'Series names are mapped properly');
  });

  test('months by year', function (assert) {
    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2015-01-01 00:00:00.000', end: '2016-03-15 00:00:00.000' },
      'month'
    );
    const config = { timeGrain: 'year', metricCid: 'cid_pageViews' };
    const response = NaviFactResponse.create({
      rows: [
        { 'network.dateTime(grain=month)': '2016-01-01 00:00:00.000', pageViews: 1 },
        { 'network.dateTime(grain=month)': '2016-02-01 00:00:00.000', pageViews: 2 },
        { 'network.dateTime(grain=month)': '2015-01-01 00:00:00.000', pageViews: 3 },
        { 'network.dateTime(grain=month)': '2014-03-15 00:00:00.000', pageViews: 4 },
      ],
    });
    const data = DateChartBuilder.buildData(response, config, request);

    assert.equal(data.series.length, 12, 'A data entry exists for each possible month in a year');

    assert.deepEqual(
      data.series[0],
      ({
        x: { rawValue: 1, displayValue: 'Jan' },
        'series.0': null,
        'series.2': 1,
        'series.1': 3,
      } as unknown) as C3Row,
      'First data point contains values for first month of each year'
    );

    assert.deepEqual(
      data.names,
      { 'series.0': '2014', 'series.1': '2015', 'series.2': '2016' },
      'Series names are mapped properly'
    );
  });

  test('hours by day', function (assert) {
    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2016-01-01 01:00:00.000', end: '2016-01-03 01:00:00.000' },
      'hour'
    );
    const config = { timeGrain: 'day', metricCid: 'cid_pageViews' };
    const response = NaviFactResponse.create({
      rows: [
        { 'network.dateTime(grain=hour)': '2016-01-01 01:00:00.000', pageViews: 1 },
        { 'network.dateTime(grain=hour)': '2016-01-02 01:00:00.000', pageViews: 2 },
        { 'network.dateTime(grain=hour)': '2016-01-03 01:00:00.000', pageViews: 3 },
      ],
    });
    const data = DateChartBuilder.buildData(response, config, request);

    assert.equal(data.series.length, 24, 'A data entry exists for each hour in a day');

    assert.deepEqual(
      data.series[1],
      ({
        x: { rawValue: 2, displayValue: 'Hour 2' },
        'series.0': 1,
        'series.1': 2,
        'series.2': 3,
      } as unknown) as C3Row,
      'Data point contains values for hour of each day'
    );

    assert.deepEqual(
      data.names,
      { 'series.0': 'Jan 1', 'series.1': 'Jan 2', 'series.2': 'Jan 3' },
      'Series names are mapped properly'
    );
  });

  test('minutes by hour', function (assert) {
    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2016-01-01 00:04:00.000', end: '2016-01-02 02:04:00.000' },
      'minute'
    );
    const config = { timeGrain: 'hour', metricCid: 'cid_pageViews' };
    const response = NaviFactResponse.create({
      rows: [
        { 'network.dateTime(grain=minute)': '2016-01-01 00:04:00.000', pageViews: 1 },
        { 'network.dateTime(grain=minute)': '2016-01-01 01:04:00.000', pageViews: 2 },
        { 'network.dateTime(grain=minute)': '2016-01-02 02:04:00.000', pageViews: 3 },
      ],
    });
    const data = DateChartBuilder.buildData(response, config, request);

    assert.equal(data.series.length, 60, 'A data entry exists for each minute in a hour');

    assert.deepEqual(
      data.series[4],
      ({
        x: { rawValue: 5, displayValue: 'Minute 5' },
        'series.0': 1,
        'series.1': 2,
        'series.2': 3,
      } as unknown) as C3Row,
      'Data point contains values for minute of each hour'
    );

    assert.deepEqual(
      data.names,
      { 'series.0': 'Jan 1 00:00', 'series.1': 'Jan 1 01:00', 'series.2': 'Jan 2 02:00' },
      'Series names are mapped properly'
    );
  });

  test('seconds by minute', function (assert) {
    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2016-01-01 00:00:20.000', end: '2016-01-01 00:03:20.000' },
      'second'
    );
    const config = { timeGrain: 'minute', metricCid: 'cid_pageViews' };
    const response = NaviFactResponse.create({
      rows: [
        { 'network.dateTime(grain=second)': '2016-01-01 00:00:20.000', pageViews: 1 },
        { 'network.dateTime(grain=second)': '2016-01-01 00:01:20.000', pageViews: 2 },
        { 'network.dateTime(grain=second)': '2016-01-01 00:03:20.000', pageViews: 3 },
      ],
    });
    const data = DateChartBuilder.buildData(response, config, request);

    assert.equal(data.series.length, 61, 'A data entry exists for each second in a minute');

    assert.deepEqual(
      data.series[20],
      ({
        x: { rawValue: 21, displayValue: 'Second 21' },
        'series.0': 1,
        'series.1': 2,
        'series.2': 3,
      } as unknown) as C3Row,
      'Data point contains values for second of each minute'
    );

    assert.deepEqual(
      data.names,
      { 'series.0': 'Jan 1 00:00', 'series.1': 'Jan 1 00:01', 'series.2': 'Jan 1 00:03' },
      'Series names are mapped properly'
    );
  });

  test('Zero in chart data', function (assert) {
    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2016-01-01 00:00:00.000', end: '2016-01-01 00:00:00.000' },
      'day'
    );
    const config = { timeGrain: 'month', metricCid: 'cid_pageViews' };
    const response = NaviFactResponse.create({
      rows: [{ 'network.dateTime(grain=day)': '2016-01-01 00:00:00.000', pageViews: 0 }],
    });
    const data = DateChartBuilder.buildData(response, config, request);

    assert.deepEqual(
      data.series[0],
      ({
        x: { rawValue: 1, displayValue: 'Day 1' },
        'series.0': 0,
      } as unknown) as C3Row,
      'Zero values are not considered gaps in data'
    );

    assert.deepEqual(data.names, { 'series.0': 'Jan 2016' }, 'Series names are mapped properly');
  });

  test('buildTooltip', function (assert) {
    assert.expect(2);

    const request = buildTestRequest(
      [{ cid: 'cid_pageViews', field: 'pageViews' }],
      [],
      { start: '2016-01-01 00:00:20.000', end: '2016-01-03 00:03:20.000' },
      'day'
    );
    const config = {
      timeGrain: 'month',
      metricCid: 'cid_pageViews',
    };
    const response = NaviFactResponse.create({
      rows: [
        { 'network.dateTime(grain=day)': '2016-01-01 00:00:20.000', pageViews: 1 },
        { 'network.dateTime(grain=day)': '2016-01-02 00:01:20.000', pageViews: 2 },
        { 'network.dateTime(grain=day)': '2016-01-03 00:03:20.000', pageViews: 3 },
      ],
    });
    const x = 2;
    const tooltipData = [{ x, name: 'Jan 2016', value: 2 }];

    //Populates the 'byXSeries' property in the builder that buildTooltip uses
    DateChartBuilder.buildData(response, config, request);

    const mixin = DateChartBuilder.buildTooltip(config, request);
    const tooltipClass = Object.extend(mixin, {});
    const tooltip = tooltipClass.create({ config, request, tooltipData, x });

    assert.equal(tooltip.layout, TooltipTemplate, 'Tooltip uses date template');

    //@ts-expect-error
    assert.deepEqual(tooltip.rowData, [response.rows[1]], 'The correct response row is given to the tooltip');
  });
});

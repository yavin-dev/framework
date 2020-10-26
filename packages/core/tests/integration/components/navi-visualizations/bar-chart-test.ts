/* eslint-disable @typescript-eslint/camelcase */
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { initialize as injectC3Enhancements } from 'navi-core/initializers/inject-c3-enhancements';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import { buildTestRequest } from '../../../helpers/request';
import { VisualizationModel } from 'navi-core/components/navi-visualizations/table';
import { TestContext } from 'ember-test-helpers';

const TEMPLATE = hbs`
  <NaviVisualizations::BarChart
    @model={{this.model}}
    @options={{this.options}}
  />`;

/*eslint max-len: ["error", { "code": 250 }]*/

const metricResponse = NaviFactResponse.create({
  //prettier-ignore
  rows: [
    { 'network.dateTime(grain=day)': '2016-05-30 00:00:00.000', uniqueIdentifier: 172933788, totalPageViews: 3669828357 },
    { 'network.dateTime(grain=day)': '2016-05-31 00:00:00.000', uniqueIdentifier: 183206656, totalPageViews: 4088487125 },
    { 'network.dateTime(grain=day)': '2016-06-01 00:00:00.000', uniqueIdentifier: 183380921, totalPageViews: 4024700302 },
    { 'network.dateTime(grain=day)': '2016-06-02 00:00:00.000', uniqueIdentifier: 180559793, totalPageViews: 3950276031 },
    { 'network.dateTime(grain=day)': '2016-06-03 00:00:00.000', uniqueIdentifier: 172724594, totalPageViews: 3697156058 }
  ]
});

const dimensionReponse = NaviFactResponse.create({
  //prettier-ignore
  rows: [
    { 'network.dateTime(grain=week)': '2016-02-15 00:00:00.000', 'age(field=id)': '-3', uniqueIdentifier: 155191081, totalPageViews: 3072620639 },
    { 'network.dateTime(grain=week)': '2015-12-14 00:00:00.000', 'age(field=id)': '1', uniqueIdentifier: 55191081, totalPageViews: 2072620639 },
    { 'network.dateTime(grain=week)': '2015-12-21 00:00:00.000', 'age(field=id)': '1', uniqueIdentifier: 72724594, totalPageViews: 2697156058 },
    { 'network.dateTime(grain=week)': '2015-12-28 00:00:00.000', 'age(field=id)': '1', uniqueIdentifier: 83380921, totalPageViews: 3024700302 },
    { 'network.dateTime(grain=week)': '2016-01-04 00:00:00.000', 'age(field=id)': '1', uniqueIdentifier: 72933788, totalPageViews: 2669828357 },
    { 'network.dateTime(grain=week)': '2016-01-11 00:00:00.000', 'age(field=id)': '1', uniqueIdentifier: 83206656, totalPageViews: 3088487125 },
    { 'network.dateTime(grain=week)': '2016-01-18 00:00:00.000', 'age(field=id)': '1', uniqueIdentifier: 83380921, totalPageViews: 2024700302 },
    { 'network.dateTime(grain=week)': '2016-01-25 00:00:00.000', 'age(field=id)': '1', uniqueIdentifier: 80559793, totalPageViews: 2950276031 },
    { 'network.dateTime(grain=week)': '2016-02-01 00:00:00.000', 'age(field=id)': '1', uniqueIdentifier: 72724594, totalPageViews: 2697156058 },
    { 'network.dateTime(grain=week)': '2016-02-08 00:00:00.000', 'age(field=id)': '1', uniqueIdentifier: 52298735, totalPageViews: 2008425744 },
    { 'network.dateTime(grain=week)': '2016-02-15 00:00:00.000', 'age(field=id)': '1', uniqueIdentifier: 55191081, totalPageViews: 2072620639 },
    { 'network.dateTime(grain=week)': '2015-12-14 00:00:00.000', 'age(field=id)': '2', uniqueIdentifier: 55191081, totalPageViews: 2620639 },
    { 'network.dateTime(grain=week)': '2015-12-21 00:00:00.000', 'age(field=id)': '2', uniqueIdentifier: 72724594, totalPageViews: 2156058 },
    { 'network.dateTime(grain=week)': '2015-12-28 00:00:00.000', 'age(field=id)': '2', uniqueIdentifier: 83380921, totalPageViews: 24700302 },
    { 'network.dateTime(grain=week)': '2016-01-04 00:00:00.000', 'age(field=id)': '2', uniqueIdentifier: 72933788, totalPageViews: 9828357 },
    { 'network.dateTime(grain=week)': '2016-01-11 00:00:00.000', 'age(field=id)': '2', uniqueIdentifier: 83206656, totalPageViews: 88487125 },
    { 'network.dateTime(grain=week)': '2016-01-18 00:00:00.000', 'age(field=id)': '2', uniqueIdentifier: 83380921, totalPageViews: 4700302 },
    { 'network.dateTime(grain=week)': '2016-01-25 00:00:00.000', 'age(field=id)': '2', uniqueIdentifier: 80559793, totalPageViews: 276031 },
    { 'network.dateTime(grain=week)': '2016-02-01 00:00:00.000', 'age(field=id)': '2', uniqueIdentifier: 72724594, totalPageViews: 7156058 },
    { 'network.dateTime(grain=week)': '2016-02-08 00:00:00.000', 'age(field=id)': '2', uniqueIdentifier: 52298735, totalPageViews: 8425744 },
    { 'network.dateTime(grain=week)': '2016-02-15 00:00:00.000', 'age(field=id)': '2', uniqueIdentifier: 55191081, totalPageViews: 72620639 },
    { 'network.dateTime(grain=week)': '2015-12-14 00:00:00.000', 'age(field=id)': '3', uniqueIdentifier: 55191081, totalPageViews: 72620639 },
    { 'network.dateTime(grain=week)': '2015-12-21 00:00:00.000', 'age(field=id)': '3', uniqueIdentifier: 72724594, totalPageViews: 697156058 },
    { 'network.dateTime(grain=week)': '2015-12-28 00:00:00.000', 'age(field=id)': '3', uniqueIdentifier: 83380921, totalPageViews: 24700302 },
    { 'network.dateTime(grain=week)': '2016-01-04 00:00:00.000', 'age(field=id)': '3', uniqueIdentifier: 72933788, totalPageViews: 669828357 },
    { 'network.dateTime(grain=week)': '2016-01-11 00:00:00.000', 'age(field=id)': '3', uniqueIdentifier: 83206656, totalPageViews: 88487125 },
    { 'network.dateTime(grain=week)': '2016-01-18 00:00:00.000', 'age(field=id)': '3', uniqueIdentifier: 83380921, totalPageViews: 24700302 },
    { 'network.dateTime(grain=week)': '2016-01-25 00:00:00.000', 'age(field=id)': '3', uniqueIdentifier: 80559793, totalPageViews: 950276031 },
    { 'network.dateTime(grain=week)': '2016-02-01 00:00:00.000', 'age(field=id)': '3', uniqueIdentifier: 72724594, totalPageViews: 697156058 },
    { 'network.dateTime(grain=week)': '2016-02-08 00:00:00.000', 'age(field=id)': '3', uniqueIdentifier: 52298735, totalPageViews: 8425744 },
    { 'network.dateTime(grain=week)': '2016-02-15 00:00:00.000', 'age(field=id)': '3', uniqueIdentifier: 55191081, totalPageViews: 2620639 },
    { 'network.dateTime(grain=week)': '2015-12-14 00:00:00.000', 'age(field=id)': '4', uniqueIdentifier: 55191081, totalPageViews: 72620639 },
    { 'network.dateTime(grain=week)': '2015-12-21 00:00:00.000', 'age(field=id)': '4', uniqueIdentifier: 72724594, totalPageViews: 97156058 },
    { 'network.dateTime(grain=week)': '2015-12-28 00:00:00.000', 'age(field=id)': '4', uniqueIdentifier: 83380921, totalPageViews: 24700302 },
    { 'network.dateTime(grain=week)': '2016-01-04 00:00:00.000', 'age(field=id)': '4', uniqueIdentifier: 72933788, totalPageViews: 2669828357 },
    { 'network.dateTime(grain=week)': '2016-01-11 00:00:00.000', 'age(field=id)': '4', uniqueIdentifier: 83206656, totalPageViews: 88487125 },
    { 'network.dateTime(grain=week)': '2016-01-18 00:00:00.000', 'age(field=id)': '4', uniqueIdentifier: 83380921, totalPageViews: 24700302 },
    { 'network.dateTime(grain=week)': '2016-01-25 00:00:00.000', 'age(field=id)': '4', uniqueIdentifier: 80559793, totalPageViews: 50276031 },
    { 'network.dateTime(grain=week)': '2016-02-01 00:00:00.000', 'age(field=id)': '4', uniqueIdentifier: 72724594, totalPageViews: 97156058 },
    { 'network.dateTime(grain=week)': '2016-02-08 00:00:00.000', 'age(field=id)': '4', uniqueIdentifier: 52298735, totalPageViews: 8425744 },
    { 'network.dateTime(grain=week)': '2016-02-15 00:00:00.000', 'age(field=id)': '4', uniqueIdentifier: 55191081, totalPageViews: 72620639 }
  ]
});

module('Integration | Component | bar chart', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    injectC3Enhancements();

    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {}
          }
        }
      }
    });

    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('it renders', async function(assert) {
    assert.expect(2);

    const singleMetricRequest = buildTestRequest(
      [{ field: 'uniqueIdentifier' }],
      [],
      { start: '2016-05-30 00:00:00.000', end: '2016-06-04 00:00:00.000' },
      'day'
    );

    const Model: VisualizationModel = A([{ request: singleMetricRequest, response: metricResponse }]);
    this.set('model', Model);

    await render(TEMPLATE);

    assert.dom('.navi-vis-c3-chart').isVisible('The bar chart widget component is visible');

    assert.dom('.c3-bar').exists({ count: 5 }, '5 bars are present on the chart');
  });

  test('multiple metric series', async function(assert) {
    assert.expect(1);

    const multipleMetricRequest = buildTestRequest(
      [{ field: 'uniqueIdentifier' }, { field: 'totalPageViews' }],
      [],
      { start: '2016-05-30 00:00:00.000', end: '2016-06-04 00:00:00.000' },
      'day'
    );

    const Model: VisualizationModel = A([{ request: multipleMetricRequest, response: metricResponse }]);
    this.set('model', Model);
    await render(TEMPLATE);

    assert.dom('.c3-bar').exists({ count: 10 }, 'Ten bars are present in the bar based on the metrics in the request');
  });

  test('multiple dimension series', async function(assert) {
    assert.expect(2);

    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'dimension',
            config: {
              metricCid: 'cid_totalPageViews',
              dimensions: [
                { name: 'All Other', values: { cid_age: '-3' } },
                { name: 'under 13', values: { cid_age: '1' } },
                { name: '13 - 25', values: { cid_age: '2' } },
                { name: '25 - 35', values: { cid_age: '3' } },
                { name: '35 - 45', values: { cid_age: '4' } }
              ]
            }
          }
        }
      }
    });
    const dimensionRequest = buildTestRequest(
      [{ field: 'uniqueIdentifier' }, { cid: 'cid_totalPageViews', field: 'totalPageViews' }],
      [{ cid: 'cid_age', field: 'age', parameters: { field: 'id' } }],
      { start: '2015-12-14 00:00:00.000', end: '2016-02-22 00:00:00.000' },
      'week'
    );

    const Model: VisualizationModel = A([{ request: dimensionRequest, response: dimensionReponse }]);
    this.set('model', Model);

    await render(TEMPLATE);
    assert
      .dom('.c3-bars')
      .exists({ count: 5 }, 'Five series are present in the bar chart based on the dimension series in the request');

    assert
      .dom('.c3-bar')
      .exists({ count: 50 }, 'Fifty bars are present in the bar chart based on the dimension series in the request');
  });
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { buildTestRequest } from '../../helpers/request';
import StoreService from '@ember-data/store';
import { TestContext } from 'ember-test-helpers';
import PieChartModel from 'navi-core/models/pie-chart';
import NaviFactResponse from 'navi-data/models/navi-fact-response';

let PieChart: PieChartModel;

module('Unit | Model | Pie Chart Visualization Fragment', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    const Store = this.owner.lookup('service:store') as StoreService;
    PieChart = Store.createRecord('all-the-fragments').pieChart;
  });

  test('default value', function (assert) {
    assert.expect(1);

    assert.notOk(
      PieChart.isValidForRequest(
        buildTestRequest(
          [
            { field: 'm1', cid: '1' },
            { field: 'm2', cid: '2' },
          ],
          [
            { field: 'd1', cid: '3' },
            { field: 'd2', cid: '4' },
          ]
        )
      ),
      'the default chart fragment values are invalid'
    );
  });

  test('chart type', function (assert) {
    assert.expect(2);

    PieChart.metadata.series = {
      type: 'dimension',
      config: {
        metricCid: '1',
        dimensions: [
          {
            name: 'Foo2',
            values: { '2': 'Foo2' },
          },
          {
            name: 'Foo1',
            values: { '2': 'Foo1' },
          },
        ],
      },
    };

    assert.notOk(
      PieChart.isValidForRequest(buildTestRequest([{ field: 'm1', cid: '1' }], [{ field: 'd1', cid: '2' }])),
      'dimension pie-chart always invalid'
    );

    assert.notOk(
      PieChart.isValidForRequest(buildTestRequest([{ field: 'm1', cid: '1' }], [{ field: 'd3', cid: '3' }])),
      'dimension pie-chart always invalid'
    );
  });

  test('dimension series - metric', function (assert) {
    assert.expect(2);

    PieChart.metadata.series = {
      type: 'dimension',
      config: {
        metricCid: '1',
        dimensions: [
          {
            name: 'Foo',
            values: {
              '3': 'Foo',
            },
          },
        ],
      },
    };

    assert.notOk(
      PieChart.isValidForRequest(
        buildTestRequest(
          [
            { field: 'm1', cid: '1' },
            { field: 'm2', cid: '2' },
          ],
          [{ field: 'd1', cid: '3' }]
        )
      ),
      'dimension pie-chart always invalid'
    );

    assert.notOk(
      PieChart.isValidForRequest(buildTestRequest([{ field: 'm3', cid: '4' }], [{ field: 'd1', cid: '3' }])),
      'dimension pie-chart always invalid'
    );
  });

  test('rebuildConfig - dimension series - less than max series', function (assert) {
    const response = NaviFactResponse.create({
      //prettier-ignore
      rows: [
        { m1: 1, 'd1(field=id)': 'foo1', 'd1(field=desc)': 'Foo1', 'd2(field=id)': 'bar1', 'd2(field=desc)': 'Bar1' },
        { m1: 2, 'd1(field=id)': 'foo1', 'd1(field=desc)': 'Foo1', 'd2(field=id)': 'bar1', 'd2(field=desc)': 'Bar1' },
        { m1: 3, 'd1(field=id)': 'foo2', 'd1(field=desc)': 'Foo2', 'd2(field=id)': 'bar2', 'd2(field=desc)': 'Bar2' }
      ],
    });

    const request = buildTestRequest(
      [{ field: 'm1', cid: '1' }],
      [
        { field: 'd1', cid: '2', parameters: { field: 'desc' } },
        { field: 'd2', cid: '3', parameters: { field: 'desc' } },
      ]
    );
    const config = PieChart.rebuildConfig(request, response).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'pie-chart',
        version: 2,
        metadata: {
          series: {
            type: 'dimension',
            config: {
              metricCid: '1',
              dimensions: [
                {
                  name: 'Foo2,Bar2',
                  values: { '2': 'Foo2', '3': 'Bar2' },
                },
                {
                  name: 'Foo1,Bar1',
                  values: { '2': 'Foo1', '3': 'Bar1' },
                },
              ],
            },
          },
        },
      },
      'dimension series config generated with less unique dimension combinations then the max'
    );
  });

  test('rebuildConfig - dimension series - greater than maxSeries', function (assert) {
    const response = NaviFactResponse.create({
      //prettier-ignore
      rows: [
        { m1: 1, 'd1(field=id)': 'foo1', 'd1(field=desc)': 'Foo1', 'd2(field=id)': 'bar1', 'd2(field=desc)': 'Bar1' },
        { m1: 2, 'd1(field=id)': 'foo1', 'd1(field=desc)': 'Foo1', 'd2(field=id)': 'bar1', 'd2(field=desc)': 'Bar1' },
        { m1: 3, 'd1(field=id)': 'foo2', 'd1(field=desc)': 'Foo2', 'd2(field=id)': 'bar2', 'd2(field=desc)': 'Bar2' },
        { m1: 4, 'd1(field=id)': 'foo2', 'd1(field=desc)': 'Foo2', 'd2(field=id)': 'bar3', 'd2(field=desc)': 'Bar3' },
        { m1: 5, 'd1(field=id)': 'foo3', 'd1(field=desc)': 'Foo3', 'd2(field=id)': 'bar3', 'd2(field=desc)': 'Bar3' },
        { m1: 6, 'd1(field=id)': 'foo4', 'd1(field=desc)': 'Foo4', 'd2(field=id)': 'bar4', 'd2(field=desc)': 'Bar4' },
        { m1: 7, 'd1(field=id)': 'foo5', 'd1(field=desc)': 'Foo5', 'd2(field=id)': 'bar5', 'd2(field=desc)': 'Bar5' },
        { m1: 8, 'd1(field=id)': 'foo6', 'd1(field=desc)': 'Foo6', 'd2(field=id)': 'bar6', 'd2(field=desc)': 'Bar6' },
        { m1: 9, 'd1(field=id)': 'foo7', 'd1(field=desc)': 'Foo7', 'd2(field=id)': 'bar7', 'd2(field=desc)': 'Bar7' },
        { m1: 10, 'd1(field=id)': 'foo8', 'd1(field=desc)': 'Foo8', 'd2(field=id)': 'bar8', 'd2(field=desc)': 'Bar8' },
        { m1: 11, 'd1(field=id)': 'foo9', 'd1(field=desc)': 'Foo9', 'd2(field=id)': 'bar9', 'd2(field=desc)': 'Bar9' }
      ],
    });

    const request = buildTestRequest(
      [{ field: 'm1', cid: '1' }],
      [
        { field: 'd1', cid: '2', parameters: { field: 'desc' } },
        { field: 'd2', cid: '3', parameters: { field: 'desc' } },
      ]
    );
    const config = PieChart.rebuildConfig(request, response).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'pie-chart',
        version: 2,
        metadata: {
          series: {
            type: 'dimension',
            config: {
              metricCid: '1',
              //prettier-ignore
              dimensions: [
                { name: 'Foo9,Bar9', values: { '2': 'Foo9', '3': 'Bar9' } },
                { name: 'Foo8,Bar8', values: { '2': 'Foo8', '3': 'Bar8' } },
                { name: 'Foo7,Bar7', values: { '2': 'Foo7', '3': 'Bar7' } },
                { name: 'Foo6,Bar6', values: { '2': 'Foo6', '3': 'Bar6' } },
                { name: 'Foo5,Bar5', values: { '2': 'Foo5', '3': 'Bar5' } },
                { name: 'Foo4,Bar4', values: { '2': 'Foo4', '3': 'Bar4' } },
                { name: 'Foo3,Bar3', values: { '2': 'Foo3', '3': 'Bar3' } },
                { name: 'Foo2,Bar3', values: { '2': 'Foo2', '3': 'Bar3' } },
                { name: 'Foo2,Bar2', values: { '2': 'Foo2', '3': 'Bar2' } },
                { name: 'Foo1,Bar1', values: { '2': 'Foo1', '3': 'Bar1' } }
              ],
            },
          },
        },
      },
      'dimension series config generated with up to the max unique dimension combinations and sorted by metric value'
    );
  });

  test('rebuildConfig - dimension series - only metric', function (assert) {
    const response = NaviFactResponse.create({
      rows: [
        {
          requestMetric: 1,
          'd1(field=id)': 'configValue1',
          'd2(field=id)': 'configValue2',
        },
        {
          requestMetric: 1,
          'd1(field=id)': 'foo1',
          'd2(field=id)': 'bar1',
        },
      ],
    });

    PieChart.metadata.series = {
      type: 'dimension',
      config: {
        metricCid: '1',
        dimensions: [
          {
            name: 'Foo1,Bar1',
            values: { '2': 'configValue1', '3': 'configValue2' },
          },
        ],
      },
    };

    const request = buildTestRequest(
      [{ field: 'requestMetric', cid: '1' }],
      [
        { cid: '2', field: 'd1', parameters: { field: 'id' } },
        { cid: '3', field: 'd2', parameters: { field: 'id' } },
      ]
    );
    const config = PieChart.rebuildConfig(request, response).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'pie-chart',
        version: 2,
        metadata: {
          series: {
            type: 'dimension',
            config: {
              metricCid: '1',
              dimensions: [
                {
                  name: 'Foo1,Bar1',
                  values: { '2': 'configValue1', '3': 'configValue2' },
                },
                {
                  name: 'foo1,bar1',
                  values: { '2': 'foo1', '3': 'bar1' },
                },
              ],
            },
          },
        },
      },
      'dimension series config regenerated with metric updated, old valid series kept, new series added to config'
    );
  });

  test('rebuildConfig - dimension series - dimensions', function (assert) {
    const response = NaviFactResponse.create({
      rows: [
        {
          requestMetric: 1,
          'requestDim(field=id)': 'foo',
          'requestDim(field=desc)': 'Request Dim',
        },
      ],
    });

    PieChart.metadata.series = {
      type: 'dimension',
      config: {
        metricCid: '1',
        dimensions: [
          {
            name: 'Config Value 1,Config Value 2',
            values: { '2': 'configValue1', '3': 'configValue2' },
          },
        ],
      },
    };

    const request = buildTestRequest(
      [{ field: 'requestMetric', cid: '1' }],
      [{ field: 'requestDim', parameters: { field: 'desc' }, cid: '4' }]
    );
    const config = PieChart.rebuildConfig(request, response).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'pie-chart',
        version: 2,
        metadata: {
          series: {
            type: 'dimension',
            config: {
              metricCid: '1',
              dimensions: [
                {
                  name: 'Request Dim',
                  values: { '4': 'Request Dim' },
                },
              ],
            },
          },
        },
      },
      'dimension series config regenerated with metric and dimensions updated'
    );
  });

  test('rebuildConfig - dimension series - zero dimension series', function (assert) {
    const response = NaviFactResponse.create({
      rows: [
        {
          m1: 1,
          'd1(field=id)': 'foo',
          'd1(field=desc)': 'Foo',
          'd2(field=id)': 'bar',
          'd2(field=desc)': 'Bar',
        },
      ],
    });

    PieChart.metadata.series = {
      type: 'dimension',
      config: {
        metricCid: '1',
        dimensions: [],
      },
    };

    const request = buildTestRequest(
      [{ field: 'm1', cid: '1' }],
      [
        {
          field: 'd1',
          cid: '2',
          parameters: {
            field: 'desc',
          },
        },
        { field: 'd2', cid: '3', parameters: { field: 'id' } },
      ]
    );
    const config = PieChart.rebuildConfig(request, response).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'pie-chart',
        version: 2,
        metadata: {
          series: {
            type: 'dimension',
            config: {
              metricCid: '1',
              dimensions: [
                {
                  name: 'Foo,bar',
                  values: {
                    '2': 'Foo',
                    '3': 'bar',
                  },
                },
              ],
            },
          },
        },
      },
      'dimension series config regenerated when no dimension series are configured'
    );
  });
});

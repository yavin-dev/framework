/* eslint-disable @typescript-eslint/camelcase */
import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { buildTestRequest } from '../../helpers/request';
import { TestContext } from 'ember-test-helpers';
import StoreService from '@ember-data/store';

let Store: StoreService;

module('Unit | Model | Line Chart Visualization Fragment', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    Store = this.owner.lookup('service:store') as StoreService;
  });

  test('default value', function(assert) {
    assert.expect(1);

    const metricsAndDims = [
      [{ field: 'm1' }, { field: 'm2' }],
      [{ field: 'd1' }, { field: 'd2' }]
    ];
    const chart = Store.createRecord('all-the-fragments').lineChart;

    assert.ok(
      !chart.isValidForRequest(buildTestRequest(...metricsAndDims)),
      'the default chart fragment values are invalid'
    );
  });

  test('chart type', function(assert) {
    assert.expect(4);

    let chart = Store.createRecord('all-the-fragments').lineChart;

    set(chart.metadata.axis.y, 'series', {
      type: 'metric',
      config: {}
    });

    assert.ok(
      chart.isValidForRequest(buildTestRequest([{ field: 'm1' }], [])),
      'metric line-chart is valid when request has no dimensions'
    );

    assert.ok(
      !chart.isValidForRequest(buildTestRequest([{ field: 'm1' }], [{ field: 'd1' }])),
      'metric line-chart is invalid when request has dimensions'
    );

    set(chart.metadata.axis.y, 'series', {
      type: 'dimension',
      config: {
        metricCid: 'cid_m1',
        dimensions: [
          {
            name: 'Foo',
            values: { cid_d1: 'foo' }
          }
        ]
      }
    });

    assert.ok(
      chart.isValidForRequest(buildTestRequest([{ cid: 'cid_m1', field: 'm1' }], [{ cid: 'cid_d1', field: 'd1' }])),
      'dimension line-chart is valid when request has at least one dimension'
    );

    assert.ok(
      !chart.isValidForRequest(buildTestRequest([{ cid: 'cid_m1', field: 'm1' }], [])),
      'dimension line-chart is invalid when request has no dimensions'
    );
  });

  test('metric series - metrics', function(assert) {
    assert.expect(2);

    let chart = Store.createRecord('all-the-fragments').lineChart;

    set(chart.metadata.axis.y, 'series', {
      type: 'metric',
      config: {}
    });

    assert.ok(
      chart.isValidForRequest(buildTestRequest([{ field: 'm1' }, { field: 'm2' }], [])),
      'metric line-chart is valid for metric series'
    );

    assert.ok(
      chart.isValidForRequest(buildTestRequest([{ field: 'm1' }, { field: 'm2' }, { field: 'm3' }], [])),
      'metric line-chart is valid for metric series with more metrics'
    );
  });

  test('dimension series - metric', function(assert) {
    assert.expect(2);

    let chart = Store.createRecord('all-the-fragments').lineChart;

    set(chart.metadata.axis.y, 'series', {
      type: 'dimension',
      config: {
        metricCid: 'cid_m1',
        dimensions: [
          {
            name: 'Foo',
            values: { cid_d1: 'foo' }
          }
        ]
      }
    });

    assert.ok(
      chart.isValidForRequest(
        buildTestRequest([{ cid: 'cid_m1', field: 'm1' }, { field: 'm2' }], [{ cid: 'cid_d1', field: 'd1' }])
      ),
      'dimension line-chart is valid when it has a metric in the request metrics'
    );

    assert.ok(
      !chart.isValidForRequest(buildTestRequest([{ field: 'm3' }], [{ cid: 'cid_d1', field: 'd1' }])),
      'dimension line-chart is invalid when it does not have a metric in the request metrics'
    );
  });

  test('rebuildConfig - metric', function(assert) {
    const chart = Store.createRecord('all-the-fragments').lineChart;
    const request = buildTestRequest([{ field: 'm1' }, { field: 'm2' }], []);
    const config = chart.rebuildConfig(request, { rows: [], meta: {} }).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'line-chart',
        version: 2,
        metadata: {
          style: {},
          axis: {
            y: {
              series: {
                type: 'metric',
                config: {}
              }
            }
          }
        }
      },
      'metric series config correctly generated'
    );
  });

  test('rebuildConfig - dimension series - less than max series', function(assert) {
    let rows = [
      { m1: 1, 'd1(field=id)': 'foo1', 'd2(field=id)': 'bar1' },
      { m1: 2, 'd1(field=id)': 'foo1', 'd2(field=id)': 'bar1' },
      { m1: 3, 'd1(field=id)': 'foo2', 'd2(field=id)': 'bar2' }
    ];

    const chart = Store.createRecord('all-the-fragments').lineChart;
    const request = buildTestRequest(
      [{ cid: 'cid_m1', field: 'm1' }],
      [
        { cid: 'cid_d1', field: 'd1', parameters: { field: 'id' } },
        { cid: 'cid_d2', field: 'd2', parameters: { field: 'id' } }
      ]
    );
    const config = chart.rebuildConfig(request, { rows, meta: {} }).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'line-chart',
        version: 2,
        metadata: {
          style: {},
          axis: {
            y: {
              series: {
                type: 'dimension',
                config: {
                  metricCid: 'cid_m1',
                  dimensions: [
                    { name: 'foo2,bar2', values: { cid_d1: 'foo2', cid_d2: 'bar2' } },
                    { name: 'foo1,bar1', values: { cid_d1: 'foo1', cid_d2: 'bar1' } }
                  ]
                }
              }
            }
          }
        }
      },
      'dimension series config generated with less unique dimension combinations then the max'
    );
  });

  test('rebuildConfig - dimension series - greater than maxSeries', function(assert) {
    let rows = [
      { m1: 1, 'd1(field=id)': 'foo1', 'd2(field=id)': 'bar1' },
      { m1: 2, 'd1(field=id)': 'foo1', 'd2(field=id)': 'bar1' },
      { m1: 3, 'd1(field=id)': 'foo2', 'd2(field=id)': 'bar2' },
      { m1: 4, 'd1(field=id)': 'foo2', 'd2(field=id)': 'bar3' },
      { m1: 5, 'd1(field=id)': 'foo3', 'd2(field=id)': 'bar3' },
      { m1: 6, 'd1(field=id)': 'foo4', 'd2(field=id)': 'bar4' },
      { m1: 7, 'd1(field=id)': 'foo5', 'd2(field=id)': 'bar5' },
      { m1: 8, 'd1(field=id)': 'foo6', 'd2(field=id)': 'bar6' },
      { m1: 9, 'd1(field=id)': 'foo7', 'd2(field=id)': 'bar7' },
      { m1: 10, 'd1(field=id)': 'foo8', 'd2(field=id)': 'bar8' },
      { m1: 11, 'd1(field=id)': 'foo9', 'd2(field=id)': 'bar9' }
    ];

    const chart = Store.createRecord('all-the-fragments').lineChart;
    const request = buildTestRequest(
      [{ cid: 'cid_m1', field: 'm1' }],
      [
        { cid: 'cid_d1', field: 'd1', parameters: { field: 'id' } },
        { cid: 'cid_d2', field: 'd2', parameters: { field: 'id' } }
      ]
    );
    const config = chart.rebuildConfig(request, { rows, meta: {} }).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'line-chart',
        version: 2,
        metadata: {
          style: {},
          axis: {
            y: {
              series: {
                type: 'dimension',
                config: {
                  metricCid: 'cid_m1',
                  dimensions: [
                    { name: 'foo9,bar9', values: { cid_d1: 'foo9', cid_d2: 'bar9' } },
                    { name: 'foo8,bar8', values: { cid_d1: 'foo8', cid_d2: 'bar8' } },
                    { name: 'foo7,bar7', values: { cid_d1: 'foo7', cid_d2: 'bar7' } },
                    { name: 'foo6,bar6', values: { cid_d1: 'foo6', cid_d2: 'bar6' } },
                    { name: 'foo5,bar5', values: { cid_d1: 'foo5', cid_d2: 'bar5' } },
                    { name: 'foo4,bar4', values: { cid_d1: 'foo4', cid_d2: 'bar4' } },
                    { name: 'foo3,bar3', values: { cid_d1: 'foo3', cid_d2: 'bar3' } },
                    { name: 'foo2,bar3', values: { cid_d1: 'foo2', cid_d2: 'bar3' } },
                    { name: 'foo2,bar2', values: { cid_d1: 'foo2', cid_d2: 'bar2' } },
                    { name: 'foo1,bar1', values: { cid_d1: 'foo1', cid_d2: 'bar1' } }
                  ]
                }
              }
            }
          }
        }
      },
      'dimension series config generated with up to the max unique dimension combinations and sorted by metric value'
    );
  });

  test('rebuildConfig - dimension series - only metric', function(assert) {
    let rows = [{ requestMetric: 1, 'd1(field=id)': 'foo1', 'd2(field=id)': 'bar1' }];

    let chart = Store.createRecord('all-the-fragments').lineChart;
    set(chart.metadata.axis.y, 'series', {
      type: 'dimension',
      config: {
        metricCid: 'cid_configMetric',
        dimensions: [
          {
            name: 'Foo1,Bar1',
            values: { cid_d1: 'configValue1', cid_d2: 'configValue2' }
          }
        ]
      }
    });

    const request = buildTestRequest(
      [{ cid: 'cid_requestMetric', field: 'requestMetric' }],
      [
        { cid: 'cid_d1', field: 'd1' },
        { cid: 'cid_d2', field: 'd2' }
      ]
    );
    const config = chart.rebuildConfig(request, { rows, meta: {} }).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'line-chart',
        version: 2,
        metadata: {
          style: {},
          axis: {
            y: {
              series: {
                type: 'dimension',
                config: {
                  metricCid: 'cid_requestMetric',
                  dimensions: [
                    {
                      name: 'Foo1,Bar1',
                      values: { cid_d1: 'configValue1', cid_d2: 'configValue2' }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      'dimension series config regenerated with only metric updated'
    );
  });

  test('rebuildConfig - dimension series - zero dimension series', function(assert) {
    let rows = [
      {
        m1: 1,
        'd1(field=id)': 'foo',
        'd2(field=id)': 'bar'
      }
    ];

    let chart = Store.createRecord('all-the-fragments').lineChart;
    set(chart.metadata.axis.y, 'series', {
      type: 'dimension',
      config: {
        metricCid: 'cid_m1',
        dimensions: []
      }
    });

    const request = buildTestRequest(
      [{ cid: 'cid_m1', field: 'm1' }],
      [
        { cid: 'cid_d1', field: 'd1', parameters: { field: 'id' } },
        { cid: 'cid_d2', field: 'd2', parameters: { field: 'id' } }
      ]
    );
    const config = chart.rebuildConfig(request, { rows, meta: {} }).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'line-chart',
        version: 2,
        metadata: {
          style: {},
          axis: {
            y: {
              series: {
                type: 'dimension',
                config: {
                  metricCid: 'cid_m1',
                  dimensions: [
                    {
                      name: 'foo,bar',
                      values: {
                        cid_d1: 'foo',
                        cid_d2: 'bar'
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      'dimension series config regenerated when no dimension series are configured'
    );
  });
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { buildTestRequest, Column } from '../../helpers/request';

module('Unit | Model | Pie Chart Visualization Fragment', function(hooks) {
  setupTest(hooks);

  test('default value', function(assert) {
    assert.expect(1);

    const metricsAndDims: Column[][] = [
      [
        { field: 'm1', cid: '1' },
        { field: 'm2', cid: '2' }
      ],
      [
        { field: 'd1', cid: '3' },
        { field: 'd2', cid: '4' }
      ]
    ];
    const chart = this.owner
      .lookup('service:store')
      .createRecord('all-the-fragments')
      .get('pieChart');

    assert.notOk(
      chart.isValidForRequest(buildTestRequest(...metricsAndDims)),
      'the default chart fragment values are invalid'
    );
  });

  test('chart type', function(assert) {
    assert.expect(2);

    const chart = this.owner
      .lookup('service:store')
      .createRecord('all-the-fragments')
      .get('pieChart');

    chart.metadata.series = {
      type: 'dimension',
      config: {
        metricCid: '1',
        dimensions: [
          {
            name: 'Foo2',
            values: { '2': 'Foo2' }
          },
          {
            name: 'Foo1',
            values: { '2': 'Foo1' }
          }
        ]
      }
    };

    assert.ok(
      chart.isValidForRequest(buildTestRequest([{ field: 'm1', cid: '1' }], [{ field: 'd1', cid: '2' }])),
      'pie-chart is valid when request has at least one dimension'
    );

    assert.ok(
      !chart.isValidForRequest(buildTestRequest([{ field: 'm1', cid: '1' }], [{ field: 'd3', cid: '3' }])),
      'dimension `d3` pie-chart is invalid when request does not have `d3`'
    );
  });

  test('dimension series - metric', function(assert) {
    assert.expect(2);

    const chart = this.owner
      .lookup('service:store')
      .createRecord('all-the-fragments')
      .get('pieChart');

    chart.metadata.series = {
      type: 'dimension',
      config: {
        metricCid: '1',
        dimensions: [
          {
            name: 'Foo',
            values: {
              '3': 'Foo'
            }
          }
        ]
      }
    };

    assert.ok(
      chart.isValidForRequest(
        buildTestRequest(
          [
            { field: 'm1', cid: '1' },
            { field: 'm2', cid: '2' }
          ],
          [{ field: 'd1', cid: '3' }]
        )
      ),
      'pie-chart is valid when it has a metric in the request metrics'
    );

    assert.notOk(
      chart.isValidForRequest(buildTestRequest([{ field: 'm3', cid: '4' }], [{ field: 'd1', cid: '3' }])),
      'pie-chart is invalid when it does not have a metric in the request metrics'
    );
  });

  test('rebuildConfig - dimension series - less than max series', function(assert) {
    let rows = [
      {
        m1: 1,
        'd1(field=id)': 'foo1',
        'd1(field=desc)': 'Foo1',
        'd2(field=id)': 'bar1',
        'd2(field=desc)': 'Bar1'
      },
      {
        m1: 2,
        'd1(field=id)': 'foo1',
        'd1(field=desc)': 'Foo1',
        'd2(field=id)': 'bar1',
        'd2(field=desc)': 'Bar1'
      },
      {
        m1: 3,
        'd1(field=id)': 'foo2',
        'd1(field=desc)': 'Foo2',
        'd2(field=id)': 'bar2',
        'd2(field=desc)': 'Bar2'
      }
    ];

    const chart = this.owner
      .lookup('service:store')
      .createRecord('all-the-fragments')
      .get('pieChart');
    const request = buildTestRequest(
      [{ field: 'm1', cid: '1' }],
      [
        { field: 'd1', cid: '2', parameters: { field: 'desc' } },
        { field: 'd2', cid: '3', parameters: { field: 'desc' } }
      ]
    );
    const config = chart.rebuildConfig(request, { rows }).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'pie-chart',
        version: 1,
        metadata: {
          series: {
            type: 'dimension',
            config: {
              metricCid: '1',
              dimensions: [
                {
                  name: 'Foo2,Bar2',
                  values: { '2': 'Foo2', '3': 'Bar2' }
                },
                {
                  name: 'Foo1,Bar1',
                  values: { '2': 'Foo1', '3': 'Bar1' }
                }
              ]
            }
          }
        }
      },
      'dimension series config generated with less unique dimension combinations then the max'
    );
  });

  test('rebuildConfig - dimension series - greater than maxSeries', function(assert) {
    let rows = [
      {
        m1: 1,
        'd1(field=id)': 'foo1',
        'd1(field=desc)': 'Foo1',
        'd2(field=id)': 'bar1',
        'd2(field=desc)': 'Bar1'
      },
      {
        m1: 2,
        'd1(field=id)': 'foo1',
        'd1(field=desc)': 'Foo1',
        'd2(field=id)': 'bar1',
        'd2(field=desc)': 'Bar1'
      },
      {
        m1: 3,
        'd1(field=id)': 'foo2',
        'd1(field=desc)': 'Foo2',
        'd2(field=id)': 'bar2',
        'd2(field=desc)': 'Bar2'
      },
      {
        m1: 4,
        'd1(field=id)': 'foo2',
        'd1(field=desc)': 'Foo2',
        'd2(field=id)': 'bar3',
        'd2(field=desc)': 'Bar3'
      },
      {
        m1: 5,
        'd1(field=id)': 'foo3',
        'd1(field=desc)': 'Foo3',
        'd2(field=id)': 'bar3',
        'd2(field=desc)': 'Bar3'
      },
      {
        m1: 6,
        'd1(field=id)': 'foo4',
        'd1(field=desc)': 'Foo4',
        'd2(field=id)': 'bar4',
        'd2(field=desc)': 'Bar4'
      },
      {
        m1: 7,
        'd1(field=id)': 'foo5',
        'd1(field=desc)': 'Foo5',
        'd2(field=id)': 'bar5',
        'd2(field=desc)': 'Bar5'
      },
      {
        m1: 8,
        'd1(field=id)': 'foo6',
        'd1(field=desc)': 'Foo6',
        'd2(field=id)': 'bar6',
        'd2(field=desc)': 'Bar6'
      },
      {
        m1: 9,
        'd1(field=id)': 'foo7',
        'd1(field=desc)': 'Foo7',
        'd2(field=id)': 'bar7',
        'd2(field=desc)': 'Bar7'
      },
      {
        m1: 10,
        'd1(field=id)': 'foo8',
        'd1(field=desc)': 'Foo8',
        'd2(field=id)': 'bar8',
        'd2(field=desc)': 'Bar8'
      },
      {
        m1: 11,
        'd1(field=id)': 'foo9',
        'd1(field=desc)': 'Foo9',
        'd2(field=id)': 'bar9',
        'd2(field=desc)': 'Bar9'
      }
    ];

    const chart = this.owner
      .lookup('service:store')
      .createRecord('all-the-fragments')
      .get('pieChart');
    const request = buildTestRequest(
      [{ field: 'm1', cid: '1' }],
      [
        { field: 'd1', cid: '2', parameters: { field: 'desc' } },
        { field: 'd2', cid: '3', parameters: { field: 'desc' } }
      ]
    );
    const config = chart.rebuildConfig(request, { rows }).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'pie-chart',
        version: 1,
        metadata: {
          series: {
            type: 'dimension',
            config: {
              metricCid: '1',
              dimensions: [
                {
                  name: 'Foo9,Bar9',
                  values: { '2': 'Foo9', '3': 'Bar9' }
                },
                {
                  name: 'Foo8,Bar8',
                  values: { '2': 'Foo8', '3': 'Bar8' }
                },
                {
                  name: 'Foo7,Bar7',
                  values: { '2': 'Foo7', '3': 'Bar7' }
                },
                {
                  name: 'Foo6,Bar6',
                  values: { '2': 'Foo6', '3': 'Bar6' }
                },
                {
                  name: 'Foo5,Bar5',
                  values: { '2': 'Foo5', '3': 'Bar5' }
                },
                {
                  name: 'Foo4,Bar4',
                  values: { '2': 'Foo4', '3': 'Bar4' }
                },
                {
                  name: 'Foo3,Bar3',
                  values: { '2': 'Foo3', '3': 'Bar3' }
                },
                {
                  name: 'Foo2,Bar3',
                  values: { '2': 'Foo2', '3': 'Bar3' }
                },
                {
                  name: 'Foo2,Bar2',
                  values: { '2': 'Foo2', '3': 'Bar2' }
                },
                {
                  name: 'Foo1,Bar1',
                  values: { '2': 'Foo1', '3': 'Bar1' }
                }
              ]
            }
          }
        }
      },
      'dimension series config generated with up to the max unique dimension combinations and sorted by metric value'
    );
  });

  test('rebuildConfig - dimension series - only metric', function(assert) {
    let rows = [
      {
        requestMetric: 1,
        'd1(field=id)': 'foo1',
        'd1(field=desc)': 'Foo1',
        'd2(field=id)': 'bar1',
        'd2(field=desc)': 'Bar1'
      }
    ];

    const chart = this.owner
      .lookup('service:store')
      .createRecord('all-the-fragments')
      .get('pieChart');
    chart.metadata.series = {
      type: 'dimension',
      config: {
        metricCid: '1',
        dimensions: [
          {
            name: 'Foo1,Bar1',
            values: { '2': 'configValue1', '3': 'configValue2' }
          }
        ]
      }
    };

    const request = buildTestRequest(
      [{ field: 'requestMetric', cid: '1' }],
      [
        {
          field: 'd1',
          cid: '2'
        },
        { field: 'd2', cid: '3' }
      ]
    );
    const config = chart.rebuildConfig(request, { rows }).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'pie-chart',
        version: 1,
        metadata: {
          series: {
            type: 'dimension',
            config: {
              metricCid: '1',
              dimensions: [
                {
                  name: 'Foo1,Bar1',
                  values: { '2': 'configValue1', '3': 'configValue2' }
                }
              ]
            }
          }
        }
      },
      'dimension series config regenerated with only metric updated'
    );
  });

  test('rebuildConfig - dimension series - dimension order', function(assert) {
    let rows = [
      {
        requestMetric: 1,
        'requestDim(field=id)': 'foo',
        'requestDim(field=desc)': 'Request Dim'
      }
    ];

    const chart = this.owner
      .lookup('service:store')
      .createRecord('all-the-fragments')
      .get('pieChart');
    chart.metadata.series = {
      type: 'dimension',
      config: {
        metricCid: '1',
        dimensions: [
          {
            name: 'Config Value 1,Config Value 2',
            values: { '2': 'configValue1', '3': 'configValue2' }
          }
        ]
      }
    };

    const request = buildTestRequest(
      [{ field: 'requestMetric', cid: '1' }],
      [{ field: 'requestDim', parameters: { field: 'desc' }, cid: '2' }]
    );
    const config = chart.rebuildConfig(request, { rows }).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'pie-chart',
        version: 1,
        metadata: {
          series: {
            type: 'dimension',
            config: {
              metricCid: '1',
              dimensions: [
                {
                  name: 'Config Value 1,Config Value 2',
                  values: { '2': 'configValue1', '3': 'configValue2' }
                }
              ]
            }
          }
        }
      },
      'dimension series config regenerated with metric and dimensions updated'
    );
  });

  test('rebuildConfig - dimension series - zero dimension series', function(assert) {
    let rows = [
      {
        m1: 1,
        'd1(field=id)': 'foo',
        'd1(field=desc)': 'Foo',
        'd2(field=id)': 'bar',
        'd2(field=desc)': 'Bar'
      }
    ];

    const chart = this.owner
      .lookup('service:store')
      .createRecord('all-the-fragments')
      .get('pieChart');
    chart.metadata.series = {
      type: 'dimension',
      config: {
        metricCid: '1',
        dimensions: []
      }
    };

    const request = buildTestRequest(
      [{ field: 'm1', cid: '1' }],
      [
        {
          field: 'd1',
          cid: '2',
          parameters: {
            field: 'desc'
          }
        },
        { field: 'd2', cid: '3', parameters: { field: 'id' } }
      ]
    );
    const config = chart.rebuildConfig(request, { rows }).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'pie-chart',
        version: 1,
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
                    '3': 'bar'
                  }
                }
              ]
            }
          }
        }
      },
      'dimension series config regenerated when no dimension series are configured'
    );
  });

  test('rebuildConfig - dimension series - missing dimension value description', function(assert) {
    let rows = [
      { m1: 1, 'd1(field=id)': 'foo1', 'd1(field=desc)': 'Foo', 'd2(field=id)': 'bar1', 'd2(field=desc)': 'Baz' }
    ];

    const chart = this.owner
      .lookup('service:store')
      .createRecord('all-the-fragments')
      .get('pieChart');
    const request = buildTestRequest(
      [{ field: 'm1', cid: '1' }],
      [
        {
          field: 'd1',
          cid: '2',
          parameters: {
            field: 'desc'
          }
        },
        { field: 'd2', cid: '3', parameters: { field: 'id' } }
      ]
    );
    const config = chart.rebuildConfig(request, { rows }).toJSON();

    assert.deepEqual(
      config,
      {
        type: 'pie-chart',
        version: 1,
        metadata: {
          series: {
            type: 'dimension',
            config: {
              metricCid: '1',
              dimensions: [
                {
                  name: 'Foo,bar1',
                  values: { '2': 'Foo', '3': 'bar1' }
                }
              ]
            }
          }
        }
      },
      'dimension series config generated with ids as name when description is empty'
    );
  });
});

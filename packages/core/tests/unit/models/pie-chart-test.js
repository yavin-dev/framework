import { set } from '@ember/object';
import { run } from '@ember/runloop';
import { moduleForModel, test } from 'ember-qunit';
import { buildTestRequest } from '../../helpers/request';

moduleForModel('all-the-fragments', 'Unit | Model | Pie Chart Visualization Fragment', {
  needs: [
    'transform:fragment',
    'validator:length',
    'validator:chart-type',
    'validator:request-metric-exist',
    'validator:request-dimension-order',
    'model:pie-chart'
  ]
});

test('default value', function(assert) {
  assert.expect(1);

  let metricsAndDims = [['m1', 'm2'], ['d1', 'd2']],
    chart = run(() => this.subject().get('pieChart'));

  assert.ok(
    !chart.isValidForRequest(buildTestRequest(...metricsAndDims)),
    'the default chart fragment values are invalid'
  );
});

test('chart type', function(assert) {
  assert.expect(2);

  let chart = run(() => this.subject().get('pieChart'));

  set(chart, 'metadata.series', {
    type: 'dimension',
    config: {
      metric: {
        metric: 'm1',
        parameters: {}
      },
      dimensionOrder: ['d1']
    }
  });

  assert.ok(
    chart.isValidForRequest(buildTestRequest(['m1'], ['d1'])),
    'pie-chart is valid when request has at least one dimension'
  );

  assert.ok(
    !chart.isValidForRequest(buildTestRequest(['m1'], ['d3'])),
    'dimension `d3` pie-chart is invalid when request does not have `d3`'
  );
});

test('dimension series - metric', function(assert) {
  assert.expect(2);

  let chart = run(() => this.subject().get('pieChart'));

  set(chart, 'metadata.series', {
    type: 'dimension',
    config: {
      metric: {
        metric: 'm1',
        parameters: {}
      },
      dimensionOrder: ['d1']
    }
  });

  assert.ok(
    chart.isValidForRequest(buildTestRequest(['m1', 'm2'], ['d1'])),
    'pie-chart is valid when it has a metric in the request metrics'
  );

  assert.notOk(
    chart.isValidForRequest(buildTestRequest(['m3'], ['d1'])),
    'pie-chart is invalid when it does not have a metric in the request metrics'
  );
});

test('dimension series - dimensionOrder', function(assert) {
  assert.expect(2);

  let chart = run(() => this.subject().get('pieChart'));

  set(chart, 'metadata.series', {
    type: 'dimension',
    config: {
      metric: {
        metric: 'm1',
        parameters: {}
      },
      dimensionOrder: ['d1', 'd2']
    }
  });

  assert.ok(
    chart.isValidForRequest(buildTestRequest(['m1'], ['d1', 'd2'])),
    "pie-chart is valid when it's dimensions match the request metrics"
  );

  assert.notOk(
    chart.isValidForRequest(buildTestRequest(['m1'], ['d1', 'd2', 'd3'])),
    "pie-chart is invalid when it's dimensions do not match the request metrics"
  );
});

test('rebuildConfig - dimension series - less than max series', function(assert) {
  let rows = [
    {
      m1: 1,
      'd1|id': 'foo1',
      'd1|desc': 'Foo1',
      'd2|id': 'bar1',
      'd2|desc': 'Bar1'
    },
    {
      m1: 2,
      'd1|id': 'foo1',
      'd1|desc': 'Foo1',
      'd2|id': 'bar1',
      'd2|desc': 'Bar1'
    },
    {
      m1: 3,
      'd1|id': 'foo2',
      'd1|desc': 'Foo2',
      'd2|id': 'bar2',
      'd2|desc': 'Bar2'
    }
  ];

  let chart = run(() => this.subject().get('pieChart')),
    request = buildTestRequest(['m1'], ['d1', 'd2']),
    config = run(() => chart.rebuildConfig(request, { rows }).toJSON());

  assert.deepEqual(
    config,
    {
      type: 'pie-chart',
      version: 1,
      metadata: {
        series: {
          type: 'dimension',
          config: {
            metric: {
              metric: 'm1',
              parameters: {}
            },
            dimensionOrder: ['d1', 'd2'],
            dimensions: [
              {
                name: 'Foo2,Bar2',
                values: { d1: 'foo2', d2: 'bar2' }
              },
              {
                name: 'Foo1,Bar1',
                values: { d1: 'foo1', d2: 'bar1' }
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
      'd1|id': 'foo1',
      'd1|desc': 'Foo1',
      'd2|id': 'bar1',
      'd2|desc': 'Bar1'
    },
    {
      m1: 2,
      'd1|id': 'foo1',
      'd1|desc': 'Foo1',
      'd2|id': 'bar1',
      'd2|desc': 'Bar1'
    },
    {
      m1: 3,
      'd1|id': 'foo2',
      'd1|desc': 'Foo2',
      'd2|id': 'bar2',
      'd2|desc': 'Bar2'
    },
    {
      m1: 4,
      'd1|id': 'foo2',
      'd1|desc': 'Foo2',
      'd2|id': 'bar3',
      'd2|desc': 'Bar3'
    },
    {
      m1: 5,
      'd1|id': 'foo3',
      'd1|desc': 'Foo3',
      'd2|id': 'bar3',
      'd2|desc': 'Bar3'
    },
    {
      m1: 6,
      'd1|id': 'foo4',
      'd1|desc': 'Foo4',
      'd2|id': 'bar4',
      'd2|desc': 'Bar4'
    },
    {
      m1: 7,
      'd1|id': 'foo5',
      'd1|desc': 'Foo5',
      'd2|id': 'bar5',
      'd2|desc': 'Bar5'
    },
    {
      m1: 8,
      'd1|id': 'foo6',
      'd1|desc': 'Foo6',
      'd2|id': 'bar6',
      'd2|desc': 'Bar6'
    },
    {
      m1: 9,
      'd1|id': 'foo7',
      'd1|desc': 'Foo7',
      'd2|id': 'bar7',
      'd2|desc': 'Bar7'
    },
    {
      m1: 10,
      'd1|id': 'foo8',
      'd1|desc': 'Foo8',
      'd2|id': 'bar8',
      'd2|desc': 'Bar8'
    },
    {
      m1: 11,
      'd1|id': 'foo9',
      'd1|desc': 'Foo9',
      'd2|id': 'bar9',
      'd2|desc': 'Bar9'
    }
  ];

  let chart = run(() => this.subject().get('pieChart')),
    request = buildTestRequest(['m1'], ['d1', 'd2']),
    config = run(() => chart.rebuildConfig(request, { rows }).toJSON());

  assert.deepEqual(
    config,
    {
      type: 'pie-chart',
      version: 1,
      metadata: {
        series: {
          type: 'dimension',
          config: {
            metric: {
              metric: 'm1',
              parameters: {}
            },
            dimensionOrder: ['d1', 'd2'],
            dimensions: [
              {
                name: 'Foo9,Bar9',
                values: { d1: 'foo9', d2: 'bar9' }
              },
              {
                name: 'Foo8,Bar8',
                values: { d1: 'foo8', d2: 'bar8' }
              },
              {
                name: 'Foo7,Bar7',
                values: { d1: 'foo7', d2: 'bar7' }
              },
              {
                name: 'Foo6,Bar6',
                values: { d1: 'foo6', d2: 'bar6' }
              },
              {
                name: 'Foo5,Bar5',
                values: { d1: 'foo5', d2: 'bar5' }
              },
              {
                name: 'Foo4,Bar4',
                values: { d1: 'foo4', d2: 'bar4' }
              },
              {
                name: 'Foo3,Bar3',
                values: { d1: 'foo3', d2: 'bar3' }
              },
              {
                name: 'Foo2,Bar3',
                values: { d1: 'foo2', d2: 'bar3' }
              },
              {
                name: 'Foo2,Bar2',
                values: { d1: 'foo2', d2: 'bar2' }
              },
              {
                name: 'Foo1,Bar1',
                values: { d1: 'foo1', d2: 'bar1' }
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
      'd1|id': 'foo1',
      'd1|desc': 'Foo1',
      'd2|id': 'bar1',
      'd2|desc': 'Bar1'
    }
  ];

  let chart = run(() => this.subject().get('pieChart'));
  set(chart, 'metadata.series', {
    type: 'dimension',
    config: {
      metric: {
        metric: 'configMetric',
        parameters: {}
      },
      dimensionOrder: ['d1', 'd2'],
      dimensions: [
        {
          name: 'Foo1,Bar1',
          values: { d1: 'configValue1', d2: 'configValue2' }
        }
      ]
    }
  });

  let request = buildTestRequest(['requestMetric'], ['d1', 'd2']),
    config = run(() => chart.rebuildConfig(request, { rows }).toJSON());

  assert.deepEqual(
    config,
    {
      type: 'pie-chart',
      version: 1,
      metadata: {
        series: {
          type: 'dimension',
          config: {
            metric: {
              metric: 'requestMetric',
              parameters: {}
            },
            dimensionOrder: ['d1', 'd2'],
            dimensions: [
              {
                name: 'Foo1,Bar1',
                values: { d1: 'configValue1', d2: 'configValue2' }
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
      'requestDim|id': 'foo',
      'requestDim|desc': 'Request Dim'
    }
  ];

  let chart = run(() => this.subject().get('pieChart'));
  set(chart, 'metadata.series', {
    type: 'dimension',
    config: {
      metric: {
        metric: 'requestMetric',
        parameters: {}
      },
      dimensionOrder: ['configDim1', 'configDim2'],
      dimensions: [
        {
          name: 'Config Value 1,Config Value 2',
          values: { configDim1: 'configValue1', configDim2: 'configValue2' }
        }
      ]
    }
  });

  let request = buildTestRequest(['requestMetric'], ['requestDim']),
    config = run(() => chart.rebuildConfig(request, { rows }).toJSON());

  assert.deepEqual(
    config,
    {
      type: 'pie-chart',
      version: 1,
      metadata: {
        series: {
          type: 'dimension',
          config: {
            metric: {
              metric: 'requestMetric',
              parameters: {}
            },
            dimensionOrder: ['requestDim'],
            dimensions: [
              {
                name: 'Request Dim',
                values: { requestDim: 'foo' }
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
      'd1|id': 'foo',
      'd1|desc': 'Foo',
      'd2|id': 'bar',
      'd2|desc': 'Bar'
    }
  ];

  let chart = run(() => this.subject().get('pieChart'));
  set(chart, 'metadata.series', {
    type: 'dimension',
    config: {
      metric: {
        metric: 'm1',
        parameters: {}
      },
      dimensionOrder: ['d1', 'd2'],
      dimensions: []
    }
  });

  let request = buildTestRequest(['m1'], ['d1', 'd2']),
    config = run(() => chart.rebuildConfig(request, { rows }).toJSON());

  assert.deepEqual(
    config,
    {
      type: 'pie-chart',
      version: 1,
      metadata: {
        series: {
          type: 'dimension',
          config: {
            metric: {
              metric: 'm1',
              parameters: {}
            },
            dimensionOrder: ['d1', 'd2'],
            dimensions: [
              {
                name: 'Foo,Bar',
                values: {
                  d1: 'foo',
                  d2: 'bar'
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
  let rows = [{ m1: 1, 'd1|id': 'foo1', 'd1|desc': '', 'd2|id': 'bar1', 'd2|desc': '' }];

  let chart = run(() => this.subject().get('pieChart')),
    request = buildTestRequest(['m1'], ['d1', 'd2']),
    config = run(() => chart.rebuildConfig(request, { rows }).toJSON());

  assert.deepEqual(
    config,
    {
      type: 'pie-chart',
      version: 1,
      metadata: {
        series: {
          type: 'dimension',
          config: {
            metric: {
              metric: 'm1',
              parameters: {}
            },
            dimensionOrder: ['d1', 'd2'],
            dimensions: [
              {
                name: 'foo1,bar1',
                values: { d1: 'foo1', d2: 'bar1' }
              }
            ]
          }
        }
      }
    },
    'dimension series config generated with ids as name when description is empty'
  );
});

import { set } from '@ember/object';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { buildApexTestRequest } from '../../helpers/request';

module('Unit | Model | Apex Pie', function(hooks) {
  setupTest(hooks);

  test('rebuildConfig formats correctly', function(assert) {
    assert.expect(4);
    const rows = [
      {
        m1: 1,
        'd1|id': '1',
        'd1|desc': 'Foo1',
        'd2|id': '1',
        'd2|desc': 'Bar1'
      },
      {
        m1: 2,
        'd1|id': '2',
        'd1|desc': 'Foo2',
        'd2|id': '2',
        'd2|desc': 'Bar2'
      },
      {
        m1: 3,
        'd1|id': '3',
        'd1|desc': 'Foo3',
        'd2|id': '3',
        'd2|desc': 'Bar3'
      }
    ];
    const chart = run(() =>
      run(() => this.owner.lookup('service:store').createRecord('all-the-fragments')).get('apexPie')
    );
    // testing one metric with one dimension
    let request = buildApexTestRequest(['m1'], ['d1']);
    let config = run(() => chart.rebuildConfig(request, { rows }).toJSON());
    assert.deepEqual(config, {
      type: 'apex-pie',
      version: 1,
      metadata: {
        series: {
          config: {
            colors: ['#87d812', '#fed800', '#19c6f4'],
            metrics: [
              {
                metric: 'm1'
              }
            ],
            dimensions: [
              {
                dimension: 'd1'
              }
            ]
          }
        }
      }
    });
    assert.ok(chart.isValidForRequest(request), 'apex-pie valid for single-metric single-dimension requests');
    // testing one metric with many dimensions
    request = buildApexTestRequest(['m1'], ['d1', 'd2']);
    config = run(() => chart.rebuildConfig(request, { rows }).toJSON());
    assert.deepEqual(config, {
      type: 'apex-pie',
      version: 1,
      metadata: {
        series: {
          config: {
            colors: ['#87d812', '#fed800', '#19c6f4'],
            metrics: [
              {
                metric: 'm1'
              }
            ],
            dimensions: [
              {
                dimension: 'd1'
              },
              {
                dimension: 'd2'
              }
            ]
          }
        }
      }
    });
    assert.ok(chart.isValidForRequest(request), 'apex-pie valid for single-metric multiple-dimensions requests');
  });

  test('no-metric and dimensionless requests SHALL NOT PASS!!!', function(assert) {
    assert.expect(3);
    const chart = run(() =>
      run(() => this.owner.lookup('service:store').createRecord('all-the-fragments')).get('apexPie')
    );
    const rows = [
      {
        m1: 1,
        m2: 2,
        'd1|id': '1',
        'd1|desc': 'Foo1',
        'd2|id': '1',
        'd2|desc': 'Bar1'
      },
      {
        m1: 3,
        m2: 4,
        'd1|id': '2',
        'd1|desc': 'Foo2',
        'd2|id': '2',
        'd2|desc': 'Bar2'
      },
      {
        m1: 5,
        m2: 6,
        'd1|id': '3',
        'd1|desc': 'Foo3',
        'd2|id': '3',
        'd2|desc': 'Bar3'
      }
    ];
    let request = buildApexTestRequest([], ['d1', 'd2']);
    chart.rebuildConfig(request, { rows });

    assert.notOk(chart.isValidForRequest(request), 'apex-pie invalid for no-metric requests');
    request = buildApexTestRequest(['m1'], []);
    chart.rebuildConfig(request, { rows });

    assert.notOk(
      chart.isValidForRequest(buildApexTestRequest(['m1'], [])),
      'apex-pie invalid for dimensionless requests'
    );
    request = buildApexTestRequest(['m1', 'm2'], ['d1']);
    chart.rebuildConfig(request, { rows });

    assert.notOk(
      chart.isValidForRequest(buildApexTestRequest(['m1', 'm2'], ['d1'])),
      'apex-pie invalid for multiple-metric requests'
    );
  });

  test('config updates to match request changes', function(assert) {
    let rows = [
      {
        m1: 1,
        'd1|id': 'foo',
        'd1|desc': 'Foo',
        'd3|id': 'bar',
        'd3|desc': 'Bar'
      }
    ];
    let chart = run(() =>
      run(() => this.owner.lookup('service:store').createRecord('all-the-fragments')).get('apexPie')
    );
    set(chart, 'metadata.series', {
      config: {
        colors: ['#87d812', '#fed800', '#19c6f4'],
        metrics: [
          {
            metric: 'm1'
          }
        ],
        dimensions: [
          {
            dimension: 'd1'
          },
          {
            dimension: 'd2'
          }
        ]
      }
    });
    let request = buildApexTestRequest(['m1'], ['d1', 'd3']);
    let config = run(() => chart.rebuildConfig(request, { rows }).toJSON());
    assert.deepEqual(config, {
      type: 'apex-pie',
      version: 1,
      metadata: {
        series: {
          config: {
            colors: ['#87d812'],
            metrics: [
              {
                metric: 'm1'
              }
            ],
            dimensions: [
              {
                dimension: 'd1'
              },
              {
                dimension: 'd3'
              }
            ]
          }
        }
      }
    });
  });
});

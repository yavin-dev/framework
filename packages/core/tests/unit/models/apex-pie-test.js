import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { buildModelTestRequest } from '../../helpers/request';

module('Unit | Model | Apex Pie', function(hooks) {
  setupTest(hooks);

  test('rebuildConfig formats correctly', function(assert) {
    assert.expect(4);
    let rows = [
      {
        m1: 1,
        'd1|id': '1',
        'd1|desc': 'Foo1'
      },
      {
        m1: 2,
        'd1|id': '2',
        'd1|desc': 'Foo2'
      },
      {
        m1: 3,
        'd1|id': '3',
        'd1|desc': 'Foo3'
      }
    ];
    const chart = this.owner
      .lookup('service:store')
      .createRecord('all-the-fragments')
      .get('apexPie');
    let request = buildModelTestRequest(['m1'], ['d1']);
    let config = chart.rebuildConfig(request, { rows }).toJSON();
    assert.deepEqual(
      config,
      {
        type: 'apex-pie',
        version: 1,
        metadata: {
          series: {
            config: {
              colors: ['#87d812', '#fed800', '#19c6f4'],
              metrics: [
                {
                  id: 'm1',
                  name: 'M1'
                }
              ],
              dimensions: [
                {
                  id: 'd1',
                  name: 'D1'
                }
              ]
            }
          }
        }
      },
      'testing one metric with one dimension'
    );
    assert.ok(chart.isValidForRequest(request), 'apex-pie valid for single-metric single-dimension requests');
    request = buildModelTestRequest(['m1'], ['d1', 'd2']);
    rows = [
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
    config = chart.rebuildConfig(request, { rows }).toJSON();
    assert.deepEqual(
      config,
      {
        type: 'apex-pie',
        version: 1,
        metadata: {
          series: {
            config: {
              colors: ['#87d812', '#fed800', '#19c6f4'],
              metrics: [
                {
                  id: 'm1',
                  name: 'M1'
                }
              ],
              dimensions: [
                {
                  id: 'd1',
                  name: 'D1'
                },
                {
                  id: 'd2',
                  name: 'D2'
                }
              ]
            }
          }
        }
      },
      'testing one metric with many dimensions'
    );
    assert.ok(chart.isValidForRequest(request), 'apex-pie valid for single-metric multiple-dimensions requests');
  });

  test('no-metric and dimensionless requests SHALL NOT PASS!!!', function(assert) {
    assert.expect(3);
    const chart = this.owner
      .lookup('service:store')
      .createRecord('all-the-fragments')
      .get('apexPie');
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
    let request = buildModelTestRequest([], ['d1', 'd2']);
    chart.rebuildConfig(request, { rows });
    assert.notOk(chart.isValidForRequest(request), 'apex-pie invalid for no-metric requests');
    request = buildModelTestRequest(['m1'], []);
    chart.rebuildConfig(request, { rows });
    assert.notOk(chart.isValidForRequest(request), 'apex-pie invalid for dimensionless requests');
    request = buildModelTestRequest(['m1', 'm2'], ['d1']);
    chart.rebuildConfig(request, { rows });
    assert.notOk(chart.isValidForRequest(request), 'apex-pie invalid for multiple-metric requests');
  });

  test('config updates to match request changes', function(assert) {
    let rows = [
      {
        m1: 1,
        'd1|id': '1',
        'd1|desc': 'D1-1',
        'd2|id': 'a',
        'd2|desc': 'D2-a'
      },
      {
        m1: 2,
        'd1|id': '1',
        'd1|desc': 'D1-1',
        'd2|id': 'b',
        'd2|desc': 'D2-b'
      },
      {
        m1: 3,
        'd1|id': '2',
        'd1|desc': 'D1-2',
        'd2|id': 'a',
        'd2|desc': 'D2-a'
      },
      {
        m1: 4,
        'd1|id': '2',
        'd1|desc': 'D1-2',
        'd2|id': 'b',
        'd2|desc': 'D2-b'
      }
    ];
    let chart = this.owner
      .lookup('service:store')
      .createRecord('all-the-fragments')
      .get('apexPie');
    set(chart, 'metadata.series', {
      config: {
        colors: ['#663399', '#000000', '#ffffff'],
        metrics: [
          {
            id: 'm1',
            name: 'M1'
          }
        ],
        dimensions: [
          {
            id: 'd1',
            name: 'D1'
          },
          {
            id: 'd2',
            name: 'D2'
          }
        ]
      }
    });
    let request = buildModelTestRequest(['m2'], ['d1', 'd2']);
    let config = chart.rebuildConfig(request, { rows }).toJSON();
    assert.deepEqual(
      config,
      {
        type: 'apex-pie',
        version: 1,
        metadata: {
          series: {
            config: {
              colors: ['#663399', '#000000', '#ffffff', '#9a2ead'],
              metrics: [
                {
                  id: 'm2',
                  name: 'M2'
                }
              ],
              dimensions: [
                {
                  id: 'd1',
                  name: 'D1'
                },
                {
                  id: 'd2',
                  name: 'D2'
                }
              ]
            }
          }
        }
      },
      'config updates to match request but already set config values persist'
    );
  });
});

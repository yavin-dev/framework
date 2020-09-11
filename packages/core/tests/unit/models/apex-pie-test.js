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
              colors: [],
              dataLabelsVisible: true,
              legendVisible: true
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
              colors: [],
              dataLabelsVisible: true,
              legendVisible: true
            }
          }
        }
      },
      'testing one metric with many dimensions'
    );
    assert.ok(chart.isValidForRequest(request), 'apex-pie valid for single-metric multiple-dimensions requests');
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
        colors: [
          {
            color: '#000000',
            label: 'Widow'
          },
          {
            color: '#00ff00',
            label: 'Lantern'
          }
        ],
        dataLabelsVisible: true,
        legendVisible: true
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
              colors: [
                {
                  color: '#000000',
                  label: 'Widow'
                },
                {
                  color: '#00ff00',
                  label: 'Lantern'
                }
              ],
              dataLabelsVisible: true,
              legendVisible: true
            }
          }
        }
      },
      'config updates to match request but already set config values persist'
    );
  });
});

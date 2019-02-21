import { get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

let Component;

module('Unit | Component | line chart type - metric', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    let request = {
        metrics: [
          {
            metric: {
              name: 'totalPageViews',
              longName: 'Total Page Views'
            }
          },
          {
            metric: {
              name: 'uniqueIdentifier',
              longName: 'Unique Identifier'
            }
          }
        ]
      },
      seriesConfig = {
        metrics: ['totalPageViews']
      };
    Component = this.owner.factoryFor('component:visualization-config/chart-type/metric').create({
      seriesConfig,
      request
    });
  });

  test('selected and unselected Metrics', function(assert) {
    assert.expect(2);

    assert.deepEqual(
      get(Component, 'selectedMetrics'),
      [
        {
          name: 'totalPageViews',
          longName: 'Total Page Views'
        }
      ],
      'Selected Metrics is an array of metric objects with ids in chart config metrics'
    );

    assert.deepEqual(
      get(Component, 'unselectedMetrics'),
      [
        {
          name: 'uniqueIdentifier',
          longName: 'Unique Identifier'
        }
      ],
      'Unselected Metrics is a set diff of request metrics and selectedMetric'
    );
  });

  test('chartSeriesClass', function(assert) {
    assert.expect(1);

    assert.deepEqual(
      get(Component, 'chartSeriesClass'),
      'chart-series-1',
      'chart series class name is based on the length of selectedMetrics array'
    );
  });
});

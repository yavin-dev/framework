import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger as toggleSelector, nativeMouseUp as toggleOption } from 'ember-power-select/test-support/helpers';
import { setupMock, teardownMock } from '../../../../helpers/mirage-helper';
import { get } from '@ember/object';

let MetadataService;

let Template = hbs`{{visualization-config/chart-type/dimension
                    seriesConfig=seriesConfig
                    response=response
                    request=request
                    onUpdateConfig=(action onUpdateChartConfig)
                }}`;

const ROWS = [
  {
    metric1: 1707077,
    dateTime: '2015-11-09 00:00:00.000',
    metric2: 2707077,
    'revenue(currency=USD)': 3707077,
    'foo|id': '1',
    'foo|desc': 'Foo1'
  },
  {
    metric1: 1659538,
    dateTime: '2015-11-09 00:00:00.000',
    metric2: 2959538,
    'revenue(currency=USD)': 3959538,
    'foo|id': '2',
    'foo|desc': 'Foo2'
  },
  {
    metric1: 1977070,
    dateTime: '2015-11-11 00:00:00.000',
    metric2: 2977070,
    'revenue(currency=USD)': 3977070,
    'foo|id': '1',
    'foo|desc': 'Foo1'
  },
  {
    metric1: 1755382,
    dateTime: '2015-11-12 00:00:00.000',
    metric2: 2755382,
    'revenue(currency=USD)': 3755382,
    'foo|id': '1',
    'foo|desc': 'Foo1'
  },
  {
    metric1: 1348750,
    dateTime: '2015-11-13 00:00:00.000',
    metric2: 2348750,
    'revenue(currency=USD)': 3348750,
    'foo|id': '3',
    'foo|desc': ''
  }
];

module('Integration | Component | visualization config/line chart type/dimension', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    setupMock();

    this.set('seriesConfig', {
      dimensionOrder: ['foo'],
      metric: {
        metric: 'metric1',
        parameters: {},
        canonicalName: 'metric1',
        toJSON() {
          return this;
        }
      },
      dimensions: [
        {
          name: 'Foo1',
          values: { foo: '1' }
        },
        {
          name: 'Foo2',
          values: { foo: '2' }
        }
      ]
    });

    this.setProperties({
      request: {
        dimensions: [{ dimension: { name: 'foo' } }],
        metrics: [
          {
            metric: 'metric1',
            parameters: {},
            canonicalName: 'metric1',
            toJSON() {
              return this;
            }
          },
          {
            metric: 'metric2',
            parameters: {},
            canonicalName: 'metric2',
            toJSON() {
              return this;
            }
          },
          {
            metric: 'revenue',
            parameters: { currency: 'USD' },
            canonicalName: 'revenue(currency=USD)',
            toJSON() {
              return this;
            }
          }
        ]
      },
      response: ROWS,
      onUpdateChartConfig: () => null
    });

    MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('component renders', async function(assert) {
    assert.expect(3);

    await render(Template);

    assert.dom('.dimension-line-chart-config').isVisible('The line chart config component renders');

    assert
      .dom('.dimension-line-chart-config .dimension-line-chart-config__metric-selector')
      .isVisible('The metric selector component is displayed in the line chart config');

    assert
      .dom('.dimension-line-chart-config .chart-series-collection')
      .isVisible('The chart series selection component is displayed in the line chart config');
  });

  test('on metric change', async function(assert) {
    assert.expect(2);

    await render(Template);

    this.set('onUpdateChartConfig', config => {
      assert.deepEqual(
        get(config, 'metric.canonicalName'),
        'metric2',
        'Metric 2 is selected and passed on to the onUpdateChartConfig action'
      );
    });

    toggleSelector('.dimension-line-chart-config__metric-selector');

    assert
      .dom('.dimension-line-chart-config__metric-selector .ember-power-select-option[data-option-index="2"]')
      .hasText('Revenue (USD)', 'Parameterized metric is displayed correctly in the dimension visualization config');

    toggleOption(
      find('.dimension-line-chart-config__metric-selector .ember-power-select-option[data-option-index="1"]')
    );
  });

  test('on add series', async function(assert) {
    assert.expect(1);

    this.set('onUpdateChartConfig', config => {
      assert.deepEqual(
        config.dimensions,
        [
          {
            name: 'Foo1',
            values: { foo: '1' }
          },
          {
            name: 'Foo2',
            values: { foo: '2' }
          },
          {
            name: '3',
            values: { foo: '3' }
          }
        ],
        'The new series selected is added to the config and passed on to the onUpdateChartConfig action'
      );
    });

    await render(Template);

    //Add first series in dropdown
    await click('.add-series .btn-add');
    await click('.add-series .table-body .table-row');
  });

  test('on remove series', async function(assert) {
    assert.expect(1);

    this.set('onUpdateChartConfig', config => {
      assert.deepEqual(
        config.dimensions,
        [
          {
            name: 'Foo2',
            values: { foo: '2' }
          }
        ],
        'The deleted series is removed to the config and passed on to the onUpdateChartConfig action'
      );
    });

    await render(Template);
    await click('.navi-icon__delete');
  });
});

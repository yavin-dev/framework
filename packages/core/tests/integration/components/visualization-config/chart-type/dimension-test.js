import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger as toggleSelector, nativeMouseUp as toggleOption } from '../../../../helpers/ember-power-select';
import { setupMock, teardownMock } from '../../../../helpers/mirage-helper';
import { get } from '@ember/object';
import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';

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

moduleForComponent(
  'visualization-config/chart-type/dimension',
  'Integration | Component | visualization config/line chart type/dimension',
  {
    integration: true,
    beforeEach() {
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

      MetadataService = getOwner(this).lookup('service:bard-metadata');
      return MetadataService.loadMetadata();
    },

    afterEach() {
      teardownMock();
    }
  }
);

test('component renders', function(assert) {
  assert.expect(3);

  this.render(Template);

  assert.ok(this.$('.dimension-line-chart-config').is(':visible'), 'The line chart config component renders');

  assert.ok(
    this.$('.dimension-line-chart-config .dimension-line-chart-config__metric-selector').is(':visible'),
    'The metric selector component is displayed in the line chart config'
  );

  assert.ok(
    this.$('.dimension-line-chart-config .chart-series-collection').is(':visible'),
    'The chart series selection component is displayed in the line chart config'
  );
});

test('on metric change', function(assert) {
  assert.expect(2);

  this.render(Template);

  this.set('onUpdateChartConfig', config => {
    assert.deepEqual(
      get(config, 'metric.canonicalName'),
      'metric2',
      'Metric 2 is selected and passed on to the onUpdateChartConfig action'
    );
  });

  toggleSelector('.dimension-line-chart-config__metric-selector');

  assert.equal(
    this.$('.dimension-line-chart-config__metric-selector .ember-power-select-option:contains(Revenue)')
      .text()
      .trim(),
    'Revenue (USD)',
    'Parameterized metric is displayed correctly in the dimension visualization config'
  );

  toggleOption($('.dimension-line-chart-config__metric-selector .ember-power-select-option:contains(metric2)')[0]);
});

test('on add series', function(assert) {
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

  this.render(Template);

  //Add first series in dropdown
  $('.add-series .btn-add').click();
  this.$('.add-series .table-row:first-of-type').click();
});

test('on remove series', function(assert) {
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

  this.render(Template);

  return run(() => {
    // Delete first series
    this.$('.navi-icon__delete')
      .first()
      .click();
  });
});

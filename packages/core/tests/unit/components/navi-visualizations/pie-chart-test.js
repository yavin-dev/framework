import { A } from '@ember/array';
import { get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Component | pie chart', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  const REQUEST = {
    dimensions: [
      {
        dimension: {
          id: 'age',
          name: 'Age'
        }
      }
    ],
    metrics: [
      {
        metric: {
          id: 'totalPageViews',
          name: 'Total Page Views'
        }
      },
      {
        metric: {
          id: 'uniqueIdentifier',
          name: 'Unique Identifier'
        }
      }
    ],
    intervals: [
      {
        start: '2015-12-14 00:00:00.000',
        end: '2015-12-15 00:00:00.000'
      }
    ],
    logicalTable: {
      timeGrain: 'day'
    }
  };

  const RESPONSE = {
    rows: [
      {
        dateTime: '2015-12-14 00:00:00.000',
        'age|id': '-3',
        'age|desc': 'All Other',
        uniqueIdentifier: 155191081,
        totalPageViews: 3072620639
      },
      {
        dateTime: '2015-12-14 00:00:00.000',
        'age|id': '1',
        'age|desc': 'under 13',
        uniqueIdentifier: 55191081,
        totalPageViews: 2072620639
      },
      {
        dateTime: '2015-12-14 00:00:00.000',
        'age|id': '2',
        'age|desc': '13 - 25',
        uniqueIdentifier: 55191081,
        totalPageViews: 2620639
      },
      {
        dateTime: '2015-12-14 00:00:00.000',
        'age|id': '3',
        'age|desc': '25 - 35',
        uniqueIdentifier: 55191081,
        totalPageViews: 72620639
      },
      {
        dateTime: '2015-12-14 00:00:00.000',
        'age|id': '4',
        'age|desc': '35 - 45',
        uniqueIdentifier: 55191081,
        totalPageViews: 72620639
      }
    ]
  };

  const DIMENSION_SERIES_OPTIONS = {
    series: {
      type: 'dimension',
      config: {
        metric: {
          metric: 'totalPageViews',
          parameters: {},
          canonicalName: 'totalPageViews'
        },
        dimensionOrder: ['age'],
        dimensions: [
          {
            name: 'All Other',
            values: { age: '-3' }
          },
          {
            name: 'under 13',
            values: { age: '1' }
          },
          {
            name: '13 - 25',
            values: { age: '2' }
          },
          {
            name: '25 - 35',
            values: { age: '3' }
          },
          {
            name: '35 - 45',
            values: { age: '4' }
          }
        ]
      }
    }
  };

  const METRIC_SERIES_OPTIONS = {
    series: {
      type: 'metric',
      config: {
        metrics: [
          {
            metric: 'totalPageViews',
            parameters: {},
            canonicalName: 'totalPageViews'
          },
          {
            metric: 'uniqueIdentifier',
            parameters: {},
            canonicalName: 'uniqueIdentifier'
          }
        ]
      }
    }
  };

  test('pieConfig', function(assert) {
    assert.expect(1);

    let component = this.owner.factoryFor('component:navi-visualizations/pie-chart').create();

    assert.notEqual(component.get('pieConfig').pie.label.format, undefined, 'Pie chart has label function defined');
  });

  test('dataConfig', function(assert) {
    assert.expect(4);

    let component = this.owner.factoryFor('component:navi-visualizations/pie-chart').create(),
      model = { request: REQUEST, response: RESPONSE };

    component.set('model', A([model]));
    component.set('options', DIMENSION_SERIES_OPTIONS);

    assert.equal(component.get('dataConfig.data.type'), 'pie', 'Data config contains the type property as `pie`');

    assert.deepEqual(
      component.get('dataConfig.data.json'),
      [
        {
          '13 - 25': 2620639,
          '25 - 35': 72620639,
          '35 - 45': 72620639,
          'All Other': 3072620639,
          'under 13': 2072620639,
          x: {
            displayValue: 'Dec 14',
            rawValue: '2015-12-14 00:00:00.000'
          }
        }
      ],
      'Data config contains json property with values for each slice of pie'
    );

    let updatedOptions = {
      series: {
        type: 'dimension',
        config: {
          metric: {
            metric: 'uniqueIdentifier',
            parameters: {},
            canonicalName: 'uniqueIdentifier'
          },
          dimensionOrder: ['age'],
          dimensions: [
            {
              name: 'All Other',
              values: { age: '-3' }
            },
            {
              name: 'under 13',
              values: { age: '1' }
            },
            {
              name: '13 - 25',
              values: { age: '2' }
            },
            {
              name: '25 - 35',
              values: { age: '3' }
            },
            {
              name: '35 - 45',
              values: { age: '4' }
            }
          ]
        }
      }
    };

    component.set('options', updatedOptions);

    assert.deepEqual(
      component.get('dataConfig.data.json'),
      [
        {
          '13 - 25': 55191081,
          '25 - 35': 55191081,
          '35 - 45': 55191081,
          'All Other': 155191081,
          'under 13': 55191081,
          x: {
            displayValue: 'Dec 14',
            rawValue: '2015-12-14 00:00:00.000'
          }
        }
      ],
      'Data config updates when metric has been changed in series options'
    );

    component.set('options', METRIC_SERIES_OPTIONS);

    assert.deepEqual(
      component.get('dataConfig.data.json'),
      [
        {
          'Total Page Views': 3072620639,
          'Unique Identifiers': 155191081,
          x: {
            displayValue: 'Dec 14',
            rawValue: '2015-12-14 00:00:00.000'
          }
        }
      ],
      'Data config updates correctly for a metrics series according to first row of response'
    );
  });

  test('tooltipComponent', function(assert) {
    assert.expect(1);

    let component = this.owner.factoryFor('component:navi-visualizations/pie-chart').create(),
      model = { request: REQUEST, response: RESPONSE },
      x = '2015-12-14 00:00:00.000',
      requiredToolTipData = {
        x,
        id: 2,
        name: '13 - 25'
      };

    component.set('model', A([model]));
    component.set('options', DIMENSION_SERIES_OPTIONS);
    component.get('dataConfig');

    let metricName = component.get('seriesConfig.metric'),
      tooltipComponent = component.get('tooltipComponent'),
      tooltip = tooltipComponent.create({
        requiredToolTipData,
        metricName,
        x
      });

    assert.deepEqual(
      get(tooltip, 'rowData'),
      get(RESPONSE, 'rows')[2],
      'The correct response row is passed to the tooltip'
    );
  });
});

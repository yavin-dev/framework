import { A } from '@ember/array';
import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { RequestV2 } from 'navi-data/addon/adapters/facts/interface';
import { ResponseV1 } from 'navi-data/addon/serializers/facts/interface';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
let ComponentManager: any, ComponentClass: any;

module('Unit | Component | pie chart', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    await this.owner.lookup('service:navi-metadata').loadMetadata();
    ComponentManager = this.owner.lookup('component-manager:glimmer');
    ComponentClass = this.owner.factoryFor('component:navi-visualizations/pie-chart').class;
  });

  const REQUEST: RequestV2 = {
    columns: [
      {
        cid: 'd1',
        field: 'age',
        parameters: { field: 'desc' },
        type: 'dimension'
      },
      {
        cid: 'm1',
        field: 'totalPageViews',
        parameters: {},
        type: 'metric'
      },
      {
        cid: 'm2',
        field: 'uniqueIdentifier',
        parameters: {},
        type: 'metric'
      },
      {
        cid: 'td1',
        field: 'dateTime',
        parameters: {
          grain: 'day'
        },
        type: 'timeDimension'
      }
    ],
    filters: [
      {
        field: 'dateTime',
        parameters: {
          grain: 'day'
        },
        operator: 'bet',
        values: ['2015-12-14 00:00:00.000', '2015-12-15 00:00:00.000'],
        type: 'timeDimension'
      }
    ],
    table: 'tableA',
    dataSource: 'bardOne',
    sorts: [],
    requestVersion: '2.0'
  };

  const RESPONSE: ResponseV1 = {
    meta: {},
    rows: [
      {
        'dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=id)': '-3',
        'age(field=desc)': 'All Other',
        uniqueIdentifier: 155191081,
        totalPageViews: 3072620639
      },
      {
        'dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=id)': '1',
        'age(field=desc)': 'under 13',
        uniqueIdentifier: 55191081,
        totalPageViews: 2072620639
      },
      {
        'dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=id)': '2',
        'age(field=desc)': '13 - 25',
        uniqueIdentifier: 55191081,
        totalPageViews: 2620639
      },
      {
        'dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=id)': '3',
        'age(field=desc)': '25 - 35',
        uniqueIdentifier: 55191081,
        totalPageViews: 72620639
      },
      {
        'dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=id)': '4',
        'age(field=desc)': '35 - 45',
        uniqueIdentifier: 55191081,
        totalPageViews: 72620639
      }
    ]
  };

  const DIMENSION_SERIES_OPTIONS = {
    series: {
      type: 'dimension',
      config: {
        metricCid: 'm1',
        dimensionOrder: ['d1'],
        dimensions: [
          {
            name: 'All Other',
            values: { d1: 'All Other' }
          },
          {
            name: 'under 13',
            values: { d1: 'under 13' }
          },
          {
            name: '13 - 25',
            values: { d1: '13 - 25' }
          },
          {
            name: '25 - 35',
            values: { d1: '25 - 35' }
          },
          {
            name: '35 - 45',
            values: { d1: '35 - 45' }
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
    const request: RequestFragment = this.owner
      .lookup('service:store')
      .createFragment('bard-request-v2/request', REQUEST);

    let component = ComponentManager.createComponent(ComponentClass, {
      named: {
        model: A([{ request, response: RESPONSE }])
      }
    });

    assert.notEqual(component.pieConfig.pie.label.format, undefined, 'Pie chart has label function defined');
  });

  test('dataConfig', function(assert) {
    assert.expect(4);

    const request: RequestFragment = this.owner
      .lookup('service:store')
      .createFragment('bard-request-v2/request', REQUEST);
    request.columns.forEach(c => (c.source = request.dataSource)); //Manually set the source on each column
    const model = A([{ request, response: RESPONSE }]);
    const component = ComponentManager.createComponent(ComponentClass, {
      named: { model, options: DIMENSION_SERIES_OPTIONS }
    });

    assert.equal(component.dataConfig.data.type, 'pie', 'Data config contains the type property as `pie`');

    assert.deepEqual(
      component.dataConfig.data.json,
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
          metricCid: 'm2',
          dimensionOrder: ['d1'],
          dimensions: [
            {
              name: 'All Other',
              values: { d1: 'All Other' }
            },
            {
              name: 'under 13',
              values: { d1: 'under 13' }
            },
            {
              name: '13 - 25',
              values: { d1: '13 - 25' }
            },
            {
              name: '25 - 35',
              values: { d1: '25 - 35' }
            },
            {
              name: '35 - 45',
              values: { d1: '35 - 45' }
            }
          ]
        }
      }
    };

    set(component, 'args.options', updatedOptions);

    assert.deepEqual(
      component.dataConfig.data.json,
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

    set(component, 'args.options', METRIC_SERIES_OPTIONS);

    assert.deepEqual(
      component.dataConfig.data.json,
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

    const request: RequestFragment = this.owner
      .lookup('service:store')
      .createFragment('bard-request-v2/request', REQUEST);
    request.columns.forEach(c => (c.source = request.dataSource)); //Manually set the source on each column
    const model = A([{ request, response: RESPONSE }]);
    const component = ComponentManager.createComponent(ComponentClass, {
      named: { model, options: DIMENSION_SERIES_OPTIONS }
    });
    component.dataConfig;
    const x = '2015-12-14 00:00:00.000 ';
    const requiredToolTipData = {
      x,
      id: '13 - 25,2015-12-14 00:00:00.000',
      name: '13 - 25'
    };

    const metricName = component.seriesConfig.metric;
    const tooltipComponent = component.tooltipComponent;
    const tooltip = tooltipComponent.create({
      requiredToolTipData,
      metricName,
      x
    });

    assert.deepEqual(tooltip.rowData, RESPONSE.rows[2], 'The correct response row is passed to the tooltip');
  });
});

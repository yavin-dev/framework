import { A } from '@ember/array';
import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import PieChart, { PieChartOptions } from 'navi-core/components/navi-visualizations/pie-chart';
import { createGlimmerComponent } from 'navi-core/test-support';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { C3Row } from 'navi-core/chart-builders/base';

let Request: RequestFragment;

module('Unit | Component | pie chart', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    await this.owner.lookup('service:navi-metadata').loadMetadata();
    Request = this.owner.lookup('service:store').createFragment('bard-request-v2/request', {
      columns: [
        {
          cid: 'cid_age(field=desc)',
          field: 'age',
          parameters: { field: 'desc' },
          type: 'dimension',
          source: 'bardOne'
        },
        {
          cid: 'cid_totalPageViews',
          field: 'totalPageViews',
          parameters: {},
          type: 'metric',
          source: 'bardOne'
        },
        {
          cid: 'cid_uniqueIdentifier',
          field: 'uniqueIdentifier',
          parameters: {},
          type: 'metric',
          source: 'bardOne'
        },
        {
          cid: 'cid_network.dateTime',
          field: 'network.dateTime',
          parameters: {
            grain: 'day'
          },
          type: 'timeDimension',
          source: 'bardOne'
        }
      ],
      filters: [
        {
          field: 'network.dateTime',
          parameters: {
            grain: 'day'
          },
          operator: 'bet',
          values: ['2015-12-14 00:00:00.000', '2015-12-15 00:00:00.000'],
          type: 'timeDimension',
          source: 'bardOne'
        }
      ],
      table: 'network',
      dataSource: 'bardOne',
      sorts: [],
      requestVersion: '2.0'
    });
  });

  const RESPONSE = NaviFactResponse.create({
    rows: [
      {
        'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=id)': '-3',
        'age(field=desc)': 'All Other',
        uniqueIdentifier: 155191081,
        totalPageViews: 3072620639
      },
      {
        'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=id)': '1',
        'age(field=desc)': 'under 13',
        uniqueIdentifier: 55191081,
        totalPageViews: 2072620639
      },
      {
        'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=id)': '2',
        'age(field=desc)': '13 - 25',
        uniqueIdentifier: 55191081,
        totalPageViews: 2620639
      },
      {
        'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=id)': '3',
        'age(field=desc)': '25 - 35',
        uniqueIdentifier: 55191081,
        totalPageViews: 72620639
      },
      {
        'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=id)': '4',
        'age(field=desc)': '35 - 45',
        uniqueIdentifier: 55191081,
        totalPageViews: 72620639
      }
    ]
  });

  const DIMENSION_SERIES_OPTIONS: PieChartOptions = {
    series: {
      type: 'dimension',
      config: {
        metricCid: 'cid_totalPageViews',
        dimensions: [
          {
            name: 'All Other',
            values: { 'cid_age(field=desc)': 'All Other' }
          },
          {
            name: 'under 13',
            values: { 'cid_age(field=desc)': 'under 13' }
          },
          {
            name: '13 - 25',
            values: { 'cid_age(field=desc)': '13 - 25' }
          },
          {
            name: '25 - 35',
            values: { 'cid_age(field=desc)': '25 - 35' }
          },
          {
            name: '35 - 45',
            values: { 'cid_age(field=desc)': '35 - 45' }
          }
        ]
      }
    }
  };

  const METRIC_SERIES_OPTIONS: PieChartOptions = {
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

    let component = createGlimmerComponent('component:navi-visualizations/pie-chart', {
      model: A([{ Request, response: RESPONSE }])
    }) as PieChart;

    assert.notEqual(component.pieConfig.pie.label.format, undefined, 'Pie chart has label function defined');
  });

  test('dataConfig', function(assert) {
    assert.expect(4);

    const model = A([{ request: Request, response: RESPONSE }]);
    const component = createGlimmerComponent('component:navi-visualizations/pie-chart', {
      model,
      options: DIMENSION_SERIES_OPTIONS
    }) as PieChart;

    assert.equal(component.dataConfig.data.type, 'pie', 'Data config contains the type property as `pie`');

    assert.deepEqual(
      component.dataConfig.data.json,
      ([
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
      ] as unknown) as C3Row[],
      'Data config contains json property with values for each slice of pie'
    );

    let updatedOptions: PieChartOptions = {
      series: {
        type: 'dimension',
        config: {
          metricCid: 'cid_uniqueIdentifier',
          dimensions: [
            {
              name: 'All Other',
              values: { 'cid_age(field=desc)': 'All Other' }
            },
            {
              name: 'under 13',
              values: { 'cid_age(field=desc)': 'under 13' }
            },
            {
              name: '13 - 25',
              values: { 'cid_age(field=desc)': '13 - 25' }
            },
            {
              name: '25 - 35',
              values: { 'cid_age(field=desc)': '25 - 35' }
            },
            {
              name: '35 - 45',
              values: { 'cid_age(field=desc)': '35 - 45' }
            }
          ]
        }
      }
    };

    set(component.args, 'options', updatedOptions);

    assert.deepEqual(
      component.dataConfig.data.json,
      ([
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
      ] as unknown) as C3Row[],
      'Data config updates when metric has been changed in series options'
    );

    set(component.args, 'options', METRIC_SERIES_OPTIONS);

    assert.deepEqual(
      component.dataConfig.data.json,
      ([
        {
          'Total Page Views': 3072620639,
          'Unique Identifiers': 155191081,
          x: {
            displayValue: 'Dec 14',
            rawValue: '2015-12-14 00:00:00.000'
          }
        }
      ] as unknown) as C3Row[],
      'Data config updates correctly for a metrics series according to first row of response'
    );
  });

  test('tooltipComponent', function(assert) {
    assert.expect(1);

    const model = A([{ request: Request, response: RESPONSE }]);
    const component = createGlimmerComponent('component:navi-visualizations/pie-chart', {
      model,
      options: DIMENSION_SERIES_OPTIONS
    }) as PieChart;
    component.dataConfig;
    const x = '2015-12-14 00:00:00.000';
    const requiredToolTipData = {
      x,
      id: '13 - 25',
      name: '13 - 25'
    };

    const tooltipComponent = component.tooltipComponent;
    const tooltip = tooltipComponent.create({
      requiredToolTipData,
      x
    });

    assert.deepEqual(tooltip.rowData, RESPONSE.rows[2], 'The correct response row is passed to the tooltip');
  });
});

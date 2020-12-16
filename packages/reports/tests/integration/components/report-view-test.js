import { helper as buildHelper } from '@ember/component/helper';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import $ from 'jquery';
import { setupMirage } from 'ember-cli-mirage/test-support';
import hbs from 'htmlbars-inline-precompile';
import NaviFactResponse from 'navi-data/models/navi-fact-response';

const TEMPLATE = hbs`
<ReportView
  @report={{this.report}}
  @response={{this.response}}
/>`;

const RESPONSE = NaviFactResponse.create({
  rows: [
    {
      adClicks: 1707077,
      'network.dateTime(grain=day)': '2015-11-09 00:00:00.000'
    },
    {
      adClicks: 1659538,
      'network.dateTime(grain=day)': '2015-11-09 00:00:00.000'
    },
    {
      adClicks: 1977070,
      'network.dateTime(grain=day)': '2015-11-11 00:00:00.000'
    },
    {
      adClicks: 1755382,
      'network.dateTime(grain=day)': '2015-11-12 00:00:00.000'
    },
    {
      adClicks: 1348750,
      'network.dateTime(grain=day)': '2015-11-13 00:00:00.000'
    },
    {
      adClicks: 856732,
      'network.dateTime(grain=day)': '2015-11-14 00:00:00.000'
    },
    {
      adClicks: 716731,
      'network.dateTime(grain=day)': '2015-11-14 00:00:00.000'
    },
    {
      adClicks: 399790,
      'network.dateTime(grain=day)': '2015-11-14 00:00:00.000'
    },
    {
      adClicks: 699490,
      'network.dateTime(grain=day)': '2015-11-14 00:00:00.000'
    }
  ]
});

module('Integration | Component | report view', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    this.owner.register(
      'helper:route-action',
      buildHelper(() => {
        return () => {};
      }),
      { instantiate: false }
    );
    this.owner.register(
      'helper:update-report-action',
      buildHelper(() => {
        return () => {};
      }),
      { instantiate: false }
    );

    const metadataService = this.owner.lookup('service:navi-metadata');
    const store = this.owner.lookup('service:store');

    await metadataService.loadMetadata();
    this.set('response', RESPONSE);

    //set report object
    this.set(
      'report',
      store.createRecord('report', {
        request: {
          table: 'network',
          dataSource: 'bardOne',
          limit: null,
          requestVersion: '2.0',
          filters: [
            {
              type: 'timeDimension',
              source: 'bardOne',
              field: 'network.dateTime',
              parameters: { grain: 'day' },
              operator: 'bet',
              values: ['2015-11-09', '2015-11-14']
            }
          ],
          columns: [
            {
              cid: 'c1',
              field: 'network.dateTime',
              parameters: {
                grain: 'day'
              },
              source: 'bardOne',
              type: 'timeDimension'
            },
            {
              cid: 'c2',
              type: 'metric',
              field: 'adClicks',
              source: 'bardOne',
              parameters: {}
            }
          ],
          sorts: []
        },
        visualization: {
          type: 'line-chart',
          version: 2,
          metadata: {
            axis: {
              y: {
                series: {
                  type: 'metric',
                  config: {}
                }
              }
            }
          }
        }
      })
    );
  });

  test('metric label visualization selector is available on single metric, single time bucket, no dimensions', async function(assert) {
    assert.expect(2);

    this.set('report.request', {
      table: 'network',
      dataSource: 'bardOne',
      limit: null,
      requestVersion: '2.0',
      filters: [
        {
          type: 'timeDimension',
          source: 'bardOne',
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          operator: 'bet',
          values: ['current', 'next']
        }
      ],
      columns: [
        {
          type: 'timeDimension',
          source: 'bardOne',
          field: 'network.dateTime',
          parameters: { grain: 'day' }
        },
        {
          cid: 'c2',
          dataSource: 'bardOne',
          type: 'metric',
          field: 'adClicks',
          parameters: {}
        }
      ],
      sorts: [
        {
          metric: 'navClicks',
          direction: 'asc'
        }
      ]
    });

    await render(TEMPLATE);

    assert.dom('.visualization-toggle__option[title="Data Table"]').isVisible('Table Selector is visible');
    assert.dom('.visualization-toggle__option[title="Metric Label"]').isVisible('Metric Label Selector is visible');
  });

  test('visualization is chosen based on report', async function(assert) {
    assert.expect(3);

    await render(TEMPLATE);

    assert.ok(
      $('.line-chart-widget').is(':visible'),
      'Visualization is rendered based on the report visualization type'
    );

    this.set('report.visualization', {
      type: 'table',
      version: 2,
      metadata: {
        columnAttributes: {
          c1: { canAggregateSubtotal: false },
          c2: { canAggregateSubtotal: false }
        }
      }
    });

    assert.ok($('.table-widget').is(':visible'), 'Rendered visualization updates with report');

    assert.notOk($('.line-chart-widget').is(':visible'), 'Old visualization is removed');
  });

  test('no data', async function(assert) {
    assert.expect(1);
    this.set('response', {
      rows: [],
      meta: {
        pagination: {
          currentPage: 1,
          rowsPerPage: 10000,
          numberOfResults: 0
        }
      }
    });

    await render(TEMPLATE);

    assert
      .dom('.report-view__visualization-no-results')
      .hasText('No results available.', 'A message is displayed when the response has no data');
  });
});

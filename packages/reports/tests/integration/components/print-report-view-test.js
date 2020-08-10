import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import hbs from 'htmlbars-inline-precompile';
import Interval from 'navi-core/utils/classes/interval';

const RESPONSE = {
  rows: [
    {
      adClicks: 1707077,
      dateTime: '2015-11-09 00:00:00.000'
    },
    {
      adClicks: 1659538,
      dateTime: '2015-11-09 00:00:00.000'
    },
    {
      adClicks: 1977070,
      dateTime: '2015-11-11 00:00:00.000'
    },
    {
      adClicks: 1755382,
      dateTime: '2015-11-12 00:00:00.000'
    },
    {
      adClicks: 1348750,
      dateTime: '2015-11-13 00:00:00.000'
    },
    {
      adClicks: 856732,
      dateTime: '2015-11-14 00:00:00.000'
    },
    {
      adClicks: 716731,
      dateTime: '2015-11-14 00:00:00.000'
    },
    {
      adClicks: 399790,
      dateTime: '2015-11-14 00:00:00.000'
    },
    {
      adClicks: 699490,
      dateTime: '2015-11-14 00:00:00.000'
    }
  ]
};

module('Integration | Component | print report view', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const metadataService = this.owner.lookup('service:navi-metadata');
    const store = this.owner.lookup('service:store');

    await metadataService.loadMetadata();
    this.set('response', RESPONSE);

    //set report object
    this.set(
      'report',
      store.createRecord('report', {
        request: store.createFragment('bard-request/request', {
          logicalTable: store.createFragment('bard-request/fragments/logicalTable', {
            table: metadataService.getById('table', 'spaceId', 'bardOne'),
            timeGrain: 'day'
          }),
          responseFormat: 'csv',
          intervals: A([{ interval: new Interval('current', 'next') }])
        }),
        visualization: {
          type: 'line-chart',
          version: 1,
          metadata: {
            axis: {
              y: {
                series: {
                  type: 'metric',
                  config: {
                    metrics: [
                      {
                        metric: 'adClicks',
                        parameters: {},
                        canonicalName: 'adClicks',
                        longName: 'Ad Clicks'
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      })
    );
  });

  test('visualization is chosen based on report', async function(assert) {
    assert.expect(3);

    await settled();
    await render(hbs`
      {{print-report-view
        report=report
        response=response
      }}
    `);

    assert.dom('.line-chart-widget').exists('Visualization is rendered based on the report visualization type');

    this.set('report.visualization', {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          {
            attributes: { name: 'dateTime' },
            type: 'dateTime',
            displayName: 'Date'
          },
          {
            attributes: { name: 'adClicks' },
            type: 'metric',
            displayName: 'Ad Clicks'
          }
        ]
      }
    });

    assert.dom('.table-widget').exists('Rendered visualization updates with report');

    assert.dom('.line-chart-widget').doesNotExist('Old visualization is removed');
  });

  test('no data', function(assert) {
    assert.expect(1);

    return settled().then(async () => {
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

      await render(hbs`
              {{print-report-view
                  report=report
                  response=response
              }}
          `);

      assert
        .dom('.print-report-view__visualization-no-results')
        .hasText('No results available.', 'A message is displayed when the response has no data');
    });
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import { setupMirage } from 'ember-cli-mirage/test-support';

const Request = {
  table: 'network',
  dataSource: 'bardOne',
  limit: null,
  requestVersion: '2.0',
  filters: [
    {
      type: 'timeDimension',
      field: 'network.dateTime',
      parameters: { grain: 'day' },
      operator: 'bet',
      values: ['2015-10-02', '2015-10-14'],
      source: 'bardOne'
    }
  ],
  columns: [
    {
      cid: 'c1',
      type: 'timeDimension',
      field: 'network.dateTime',
      parameters: {
        grain: 'day'
      },
      source: 'bardOne'
    },
    {
      cid: 'c2',
      type: 'metric',
      field: 'adClicks',
      parameters: {},
      source: 'bardOne'
    }
  ],
  sorts: []
};

let Store;
module('Integration | Component | report visualization', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Store = this.owner.lookup('service:store');
    await this.owner.lookup('service:navi-metadata').loadMetadata({ dataSourceName: 'bardOne' });
    this.set(
      'report',
      Store.createRecord('report', {
        request: Request,
        visualization: {
          type: 'table',
          version: 2,
          metadata: {
            columnAttributes: {
              c1: { canAggregateSubtotal: false },
              c3: { canAggregateSubtotal: false },
              c2: { canAggregateSubtotal: false }
            },
            showTotals: {}
          }
        }
      })
    );
  });

  test('it renders the specified visualization', async function(assert) {
    assert.expect(2);

    await render(hbs`
      {{report-visualization
        report=report
        print=false
      }}
    `);

    assert.ok(!!findAll('.table-widget').length, 'report-visualization renders the correct visualization');

    assert.notOk(
      !!findAll('.table-widget--print').length,
      'report-visualization renders the correct screen visualization'
    );
  });

  test('it renders the specified print visualization', async function(assert) {
    assert.expect(1);

    await render(hbs`
      {{report-visualization
        report=report
        print=true
      }}
    `);

    assert.ok(!!findAll('.table-widget--print').length, 'report-visualization renders the correct print visualization');
  });

  test('it renders the specified fallback print visualization', async function(assert) {
    assert.expect(2);

    this.set(
      'report',
      Store.createRecord('report', {
        request: Request,
        visualization: {
          type: 'line-chart',
          version: 2,
          metadata: {
            style: {
              area: false,
              stacked: false
            },
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
    this.set('response', NaviFactResponse.create({ rows: [] }));

    await render(hbs`
      {{report-visualization
        report=report
        response=response
        print=true
      }}
    `);

    assert.ok(
      !!findAll('.line-chart-widget').length,
      'report-visualization falls back to non print visualization when print version is not available'
    );

    assert.notOk(
      !!findAll('.line-chart-widget--print').length,
      'report-visualization falls back to non print visualization when print version is not available'
    );
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const Request = {
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
      values: ['2015-10-02', '2015-10-14']
    }
  ],
  columns: [
    {
      cid: 'c1',
      field: 'network.dateTime',
      parameters: {
        grain: 'day'
      },
      type: 'timeDimension'
    },
    {
      cid: 'c2',
      type: 'metric',
      field: 'adClicks',
      parameters: {}
    }
  ],
  sorts: []
};

module('Integration | Component | report visualization', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('report', {
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
          showTotals: []
        }
      }
    });
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

    this.set('report', {
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
    });
    this.set('response', { rows: [] });

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

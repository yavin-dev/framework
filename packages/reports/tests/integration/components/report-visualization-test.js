import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const Request = {
  serialize() {
    return {
      dimensions: [{ dimension: 'os' }],
      metrics: [{ metric: 'uniqueIdentifier' }, { metric: 'totalPageViews' }],
      intervals: [
        {
          start: '2016-05-30 00:00:00.000',
          end: '2016-06-04 00:00:00.000'
        }
      ],
      logicalTable: {
        table: 'network',
        timeGrain: {
          name: 'day'
        }
      }
    };
  }
};

module('Integration | Component | report visualization', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders the specified visualization', async function(assert) {
    assert.expect(2);

    this.set('report', {
      request: Request,
      visualization: { type: 'table' }
    });

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

    this.set('report', {
      request: Request,
      visualization: { type: 'table' }
    });

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
      visualization: { type: 'line-chart' }
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

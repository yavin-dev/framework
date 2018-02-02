import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const Request = {
  serialize() {
    return {
      dimensions: [ {dimension:'os'} ],
      metrics: [
        {metric: 'uniqueIdentifier'},
        {metric: 'totalPageViews'}
      ],
      intervals: [
        {
          start: '2016-05-30 00:00:00.000',
          end: '2016-06-04 00:00:00.000'
        }
      ],
      logicalTable: {
        table: 'network',
        timeGrain:{
          name: 'day'
        }
      }
    }
  }
};

moduleForComponent('report-visualization', 'Integration | Component | report visualization', {
  integration: true
});

test('it renders the specified visualization', function(assert) {
  assert.expect(2);

  this.set('report', {
    request: Request,
    visualization: { type: 'table' }
  });

  this.render(hbs`
    {{report-visualization
      report=report
      print=false
    }}
  `);

  assert.ok(!!this.$('.table-widget').length,
    'report-visualization renders the correct visualization')

  assert.notOk(!!this.$('.table-widget--print').length,
    'report-visualization renders the correct screen visualization')
});

test('it renders the specified print visualization', function(assert) {
  assert.expect(1);

  this.set('report', {
    request: Request,
    visualization: { type: 'table' }
  });

  this.render(hbs`
    {{report-visualization
      report=report
      print=true
    }}
  `);

  assert.ok(!!this.$('.table-widget--print').length,
    'report-visualization renders the correct print visualization')
});

test('it renders the specified fallback print visualization', function(assert) {
  assert.expect(2);

  this.set('report', {
    request: Request,
    visualization: { type: 'line-chart' }
  });
  this.set('response', { rows: [] } );

  this.render(hbs`
    {{report-visualization
      report=report
      response=response
      print=true
    }}
  `);

  assert.ok(!!this.$('.line-chart-widget').length,
    'report-visualization falls back to non print visualization when print version is not available')

  assert.notOk(!!this.$('.line-chart-widget--print').length,
    'report-visualization falls back to non print visualization when print version is not available')
});

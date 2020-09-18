import { formatChartTooltipDate } from 'navi-core/helpers/format-chart-tooltip-date';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Store from 'ember-data/store';

module('Unit | Helpers | Format Chart Tooltip Date', function(hooks) {
  setupTest(hooks);

  test('formatChartTooltipDate', function(assert) {
    assert.expect(8);

    const store = this.owner.lookup('service:store') as Store;

    const request = store.createFragment('bard-request-v2/request', {
      dataSource: 'bardOne',
      requestVersion: '2.0',
      table: 'network',
      filters: [],
      columns: [{ type: 'timeDimension', field: 'network.dateTime', parameters: { grain: 'year' }, source: 'bardOne' }],
      sorts: []
    });

    const setTimeGrain = (grain: string) => request.columns.objectAt(0)?.updateParameters({ grain });

    assert.equal(
      formatChartTooltipDate(request, '2017-02-09 00:00:00'),
      '2017',
      'formatChartTooltipDate formats correctly for year timeGrain'
    );

    setTimeGrain('quarter');
    assert.equal(
      formatChartTooltipDate(request, '2017-02-09 00:00:00'),
      'Q1 2017',
      'formatChartTooltipDate formats correctly for quarter timeGrain'
    );

    setTimeGrain('month');
    assert.equal(
      formatChartTooltipDate(request, '2017-02-09 00:00:00'),
      'Feb 2017',
      'formatChartTooltipDate formats correctly for month timeGrain'
    );

    setTimeGrain('week');
    assert.equal(
      formatChartTooltipDate(request, '2017-02-09 00:00:00'),
      'February 9, 2017',
      'formatChartTooltipDate formats correctly for week timeGrain'
    );

    setTimeGrain('day');
    assert.equal(
      formatChartTooltipDate(request, '2017-02-09 00:00:00'),
      'February 9, 2017',
      'formatChartTooltipDate formats correctly for day timeGrain'
    );

    setTimeGrain('hour');
    assert.equal(
      formatChartTooltipDate(request, '2017-02-09 15:00:00'),
      'Feb 9 15:00',
      'formatChartTooltipDate formats correctly for hour timeGrain'
    );

    setTimeGrain('minute');
    assert.equal(
      formatChartTooltipDate(request, '2017-02-09 15:25:00'),
      'Feb 9 15:25:00',
      'formatChartTooltipDate formats correctly for minute timeGrain'
    );

    setTimeGrain('second');
    assert.equal(
      formatChartTooltipDate(request, '2017-02-09 15:25:35'),
      'Feb 9 15:25:35',
      'formatChartTooltipDate formats correctly for second timeGrain'
    );
  });
});

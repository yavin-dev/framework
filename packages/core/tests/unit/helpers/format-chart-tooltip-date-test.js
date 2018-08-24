import { formatChartTooltipDate } from 'navi-core/helpers/format-chart-tooltip-date';
import { module, test } from 'qunit';

module('Unit | Helpers | Format Chart Tooltip Date');

test('formatChartTooltipDate', function(assert){
  assert.expect(8);

  let request = {
    logicalTable: {
      timeGrain: 'year'
    }
  };

  assert.equal(formatChartTooltipDate(request, '2017-02-09 00:00:00'),
    '2017',
    'formatChartTooltipDate formats correctly for year timeGrain');

  request = {
    logicalTable: {
      timeGrain: 'quarter'
    }
  };

  assert.equal(formatChartTooltipDate(request, '2017-02-09 00:00:00'),
    'Q1 2017',
    'formatChartTooltipDate formats correctly for quarter timeGrain');

  request = {
    logicalTable: {
      timeGrain: 'month'
    }
  };

  assert.equal(formatChartTooltipDate(request, '2017-02-09 00:00:00'),
    'Feb 2017',
    'formatChartTooltipDate formats correctly for month timeGrain');

  request = {
    logicalTable: {
      timeGrain: 'week'
    }
  };

  assert.equal(formatChartTooltipDate(request, '2017-02-09 00:00:00'),
    'February 9, 2017',
    'formatChartTooltipDate formats correctly for week timeGrain');

  request = {
    logicalTable: {
      timeGrain: 'day'
    }
  };

  assert.equal(formatChartTooltipDate(request, '2017-02-09 00:00:00'),
    'February 9, 2017',
    'formatChartTooltipDate formats correctly for day timeGrain');

  request = {
    logicalTable: {
      timeGrain: 'hour'
    }
  };

  assert.equal(formatChartTooltipDate(request, '2017-02-09 15:00:00'),
    'Feb 9 15:00',
    'formatChartTooltipDate formats correctly for hour timeGrain');

  request = {
    logicalTable: {
      timeGrain: 'minute'
    }
  };

  assert.equal(formatChartTooltipDate(request, '2017-02-09 15:25:00'),
    'Feb 9 15:25:00',
    'formatChartTooltipDate formats correctly for minute timeGrain');

  request = {
    logicalTable: {
      timeGrain: 'second'
    }
  };

  assert.equal(formatChartTooltipDate(request, '2017-02-09 15:25:35'),
    'Feb 9 15:25:35',
    'formatChartTooltipDate formats correctly for second timeGrain');
});

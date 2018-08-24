import { test, module } from 'ember-qunit';
import Ember from 'ember';
import BuilderClass from 'navi-core/chart-builders/date-time';
import TooltipTemplate from '../../../../navi-core/templates/chart-tooltips/date';

const DateChartBuilder = BuilderClass.create();
const { get } = Ember;

module('Unit | Utils | Chart Builder Date Time');

test('weeks by year uses isoWeekYear', function(assert) {
  assert.expect(2);

  let request = {
        logicalTable: {
          timeGrain: 'week'
        }
      },
      config = {
        timeGrain: 'year',
        metric: { metric: 'pageViews', parameters: {}, canonicalName: 'pageViews' }
      },
      response = [
        {
          dateTime: "2016-01-04 00:00:00.000", // Week 1, 2016
          pageViews: 2
        },
        {
          dateTime: "2016-01-01 00:00:00.000", // Week 52, 2015
          pageViews: 1
        }
      ],
      data = DateChartBuilder.buildData(response, config, request);

  assert.equal(data.length,
    53,
    'A data entry exists for each possible week in a year');

  assert.deepEqual(data[0],
    {
      x: {
        rawValue: 1,
        displayValue: 'Jan'
      },
      2015: null,
      2016: 2
    },
    'Weeks are grouped into years based on isoWeekYear');
});

test('days by month', function(assert) {
  assert.expect(2);

  let request = {
        logicalTable: {
          timeGrain: 'day'
        }
      },
      config = {
        timeGrain: 'month',
        metric: { metric: 'pageViews', parameters: {}, canonicalName: 'pageViews' }
      },
      response = [
        {
          dateTime: "2016-01-01 00:00:00.000",
          pageViews: 1
        },
        {
          dateTime: "2016-02-01 00:00:00.000",
          pageViews: 2
        },
        {
          dateTime: "2015-01-01 00:00:00.000",
          pageViews: 3
        },
        {
          dateTime: "2016-03-15 00:00:00.000",
          pageViews: 4
        },
      ],
      data = DateChartBuilder.buildData(response, config, request);

  assert.equal(data.length,
    31,
    'A data entry exists for each possible day in a month');

  assert.deepEqual(data[0],
    {
      x: {
        rawValue: 1,
        displayValue: 'Day 1'
      },
      'Jan 2016': 1,
      'Feb 2016': 2,
      'Jan 2015': 3,
      'Mar 2016': null
    },
    'Days are grouped into month');
});

test('days by year', function(assert) {
  assert.expect(2);

  let request = {
        logicalTable: {
          timeGrain: 'day'
        }
      },
      config = {
        timeGrain: 'year',
        metric: { metric: 'pageViews', parameters: {}, canonicalName: 'pageViews' }
      },
      response = [
        {
          dateTime: "2016-01-01 00:00:00.000",
          pageViews: 1
        },
        {
          dateTime: "2016-02-01 00:00:00.000",
          pageViews: 2
        },
        {
          dateTime: "2015-01-01 00:00:00.000",
          pageViews: 3
        },
        {
          dateTime: "2016-03-15 00:00:00.000",
          pageViews: 4
        },
      ],
      data = DateChartBuilder.buildData(response, config, request);

  assert.equal(data.length,
    366,
    'A data entry exists for each possible day in a year');

  assert.deepEqual(data[0],
    {
      x: {
        rawValue: 1,
        displayValue: 'Day 1'
      },
      '2016': 1,
      '2015': 3,
    },
    'First data point contains values for first day of each year');
});

test('months by year', function(assert) {
  assert.expect(2);

  let request = {
        logicalTable: {
          timeGrain: 'month'
        }
      },
      config = {
        timeGrain: 'year',
        metric: { metric: 'pageViews', parameters: {}, canonicalName: 'pageViews' }
      },
      response = [
        {
          dateTime: "2016-01-01 00:00:00.000",
          pageViews: 1
        },
        {
          dateTime: "2016-02-01 00:00:00.000",
          pageViews: 2
        },
        {
          dateTime: "2015-01-01 00:00:00.000",
          pageViews: 3
        },
        {
          dateTime: "2014-03-15 00:00:00.000",
          pageViews: 4
        },
      ],
      data = DateChartBuilder.buildData(response, config, request);

  assert.equal(data.length,
    12,
    'A data entry exists for each possible month in a year');

  assert.deepEqual(data[0],
    {
      x: {
        rawValue: 1,
        displayValue: 'Jan'
      },
      '2016': 1,
      '2015': 3,
      '2014': null
    },
    'First data point contains values for first month of each year');
});

test('hours by day', function(assert) {
  assert.expect(2);

  let request = {
        logicalTable: {
          timeGrain: 'hour'
        }
      },
      config = {
        timeGrain: 'day',
        metric: { metric: 'pageViews', parameters: {}, canonicalName: 'pageViews' }
      },
      response = [
        {
          dateTime: "2016-01-01 01:00:00.000",
          pageViews: 1
        },
        {
          dateTime: "2016-01-02 01:00:00.000",
          pageViews: 2
        },
        {
          dateTime: "2016-01-03 01:00:00.000",
          pageViews: 3
        }
      ],
      data = DateChartBuilder.buildData(response, config, request);

  assert.equal(data.length,
    24,
    'A data entry exists for each hour in a day');

  assert.deepEqual(data[1],
    {
      x: {
        rawValue: 2,
        displayValue: 'Hour 2'
      },
      'Jan 1': 1,
      'Jan 2': 2,
      'Jan 3': 3
    },
    'Data point contains values for hour of each day');
});

test('minutes by hour', function(assert) {
  assert.expect(2);

  let request = {
        logicalTable: {
          timeGrain: 'minute'
        }
      },
      config = {
        timeGrain: 'hour',
        metric: { metric: 'pageViews', parameters: {}, canonicalName: 'pageViews' }
      },
      response = [
        {
          dateTime: "2016-01-01 00:04:00.000",
          pageViews: 1
        },
        {
          dateTime: "2016-01-01 01:04:00.000",
          pageViews: 2
        },
        {
          dateTime: "2016-01-02 02:04:00.000",
          pageViews: 3
        }
      ],
      data = DateChartBuilder.buildData(response, config, request);

  assert.equal(data.length,
    60,
    'A data entry exists for each minute in a hour');

  assert.deepEqual(data[4],
    {
      x: {
        rawValue: 5,
        displayValue: 'Minute 5'
      },
      'Jan 1 00:00': 1,
      'Jan 1 01:00': 2,
      'Jan 2 02:00': 3
    },
    'Data point contains values for minute of each hour');
});

test('seconds by minute', function(assert) {
  assert.expect(2);

  let request = {
        logicalTable: {
          timeGrain: 'second'
        }
      },
      config = {
        timeGrain: 'minute',
        metric: { metric: 'pageViews', parameters: {}, canonicalName: 'pageViews' }
      },
      response = [
        {
          dateTime: "2016-01-01 00:00:20.000",
          pageViews: 1
        },
        {
          dateTime: "2016-01-01 00:01:20.000",
          pageViews: 2
        },
        {
          dateTime: "2016-01-01 00:03:20.000",
          pageViews: 3
        }
      ],
      data = DateChartBuilder.buildData(response, config, request);

  assert.equal(data.length,
    61,
    'A data entry exists for each second in a minute');

  assert.deepEqual(data[20],
    {
      x: {
        rawValue: 21,
        displayValue: 'Second 21'
      },
      'Jan 1 00:00': 1,
      'Jan 1 00:01': 2,
      'Jan 1 00:03': 3
    },
    'Data point contains values for second of each minute');
});

test('Zero in chart data', function(assert) {
  assert.expect(1);

  let request = {
        logicalTable: {
          timeGrain: 'day'
        }
      },
      config = {
        timeGrain: 'month',
        metric: { metric: 'pageViews', parameters: {}, canonicalName: 'pageViews' }
      },
      response = [
        {
          dateTime: "2016-01-01 00:00:00.000",
          pageViews: 0
        }
      ],
      data = DateChartBuilder.buildData(response, config, request);

  assert.deepEqual(data[0],
    {
      x: {
        rawValue: 1,
        displayValue: 'Day 1'
      },
      'Jan 2016': 0
    },
    'Zero values are not considered gaps in data');
});

test('buildTooltip', function(assert) {
  assert.expect(2);

  let request = {
        logicalTable: {
          timeGrain: 'day'
        }
      },
      config = {
        timeGrain: 'month',
        metric: {metric: 'pageViews', parameters: {}, canonicalName: 'pageViews'}
      },
      response = [
        {
          dateTime: "2016-01-01 00:00:20.000",
          pageViews: 1
        },
        {
          dateTime: "2016-01-02 00:01:20.000",
          pageViews: 2
        },
        {
          dateTime: "2016-01-03 00:03:20.000",
          pageViews: 3
        }
      ],
      x = 2,
      tooltipData = [{
        x,
        name: 'Jan 2016',
        value: 2
      }],
      data = DateChartBuilder.buildData(response, config, request),
      mixin = DateChartBuilder.buildTooltip(data, config, request),
      tooltipClass = Ember.Object.extend(mixin, {}),
      tooltip = tooltipClass.create({config, request, tooltipData, x});

  assert.equal(get(tooltip, 'layout'),
    TooltipTemplate,
    'Tooltip uses date template');

  assert.deepEqual(get(tooltip, 'rowData'),
    [response[1]],
    'The correct response row is given to the tooltip');
});

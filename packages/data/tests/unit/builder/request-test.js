import RequestBuilder from  'navi-data/builder/request';
import { module, test } from 'qunit';

const Request = RequestBuilder.create();

module('Unit | Builder | Request');

test('logical table', function(assert) {
  assert.expect(3);

  assert.deepEqual(Request.logicalTable,
    {},
    'logicalTable is initially an empty object');

  let updatedRequest = Request.setLogicalTable('network', 'day');

  assert.deepEqual(updatedRequest.logicalTable,
    {
      table: 'network',
      timeGrain: 'day'
    },
    'logicalTable can be updated with set function');

  assert.notEqual(Request,
    updatedRequest,
    'original request was not modified');
});

test('dimensions', function(assert) {
  assert.expect(4);

  assert.deepEqual(Request.dimensions,
    [],
    'dimensions is initially an empty array');

  let updatedRequest = Request.addDimensions('age', 'gender');

  assert.deepEqual(updatedRequest.dimensions,
    [
      {
        dimension: 'age'
      },
      {
        dimension: 'gender'
      }
    ],
    'dimensions can be updated with add function');

  updatedRequest = updatedRequest.setDimensions('property', 'browser');
  assert.deepEqual(updatedRequest.dimensions,
    [
      {
        dimension: 'property'
      },
      {
        dimension: 'browser'
      }
    ],
    'dimensions can be replaced with set function');

  assert.notEqual(Request,
    updatedRequest,
    'original request was not modified');
});

test('metrics', function(assert) {
  assert.expect(4);

  assert.deepEqual(Request.metrics,
    [],
    'metrics is initially an empty array');

  let updatedRequest = Request.addMetrics('pageViews', 'adClicks');

  assert.deepEqual(updatedRequest.metrics,
    [
      {
        metric: 'pageViews'
      },
      {
        metric: 'adClicks'
      }
    ],
    'metrics can be updated with add function');

  updatedRequest = updatedRequest.setMetrics('navClicks', 'navClicksWoW');
  assert.deepEqual(updatedRequest.metrics,
    [
      {
        metric: 'navClicks'
      },
      {
        metric: 'navClicksWoW'
      }
    ],
    'metrics can be replaced with set function');

  assert.notEqual(Request,
    updatedRequest,
    'original request was not modified');
});

test('intervals', function(assert) {
  assert.expect(5);

  assert.deepEqual(Request.intervals,
    [],
    'intervals is initially an empty array');

  /* == Add Interval Shorthand == */
  let updatedRequest = Request.addInterval('P7D', 'current');

  assert.deepEqual(updatedRequest.intervals,
    [
      {
        start: 'P7D',
        end:   'current'
      }
    ],
    'intervals can be updated with shorthand add function');

  /* == Add Intervals == */
  updatedRequest = updatedRequest.addIntervals({start: 'P14D', end: 'current'});

  assert.deepEqual(updatedRequest.intervals,
    [
      {
        start: 'P7D',
        end:   'current'
      },
      {
        start: 'P14D',
        end:   'current'
      }
    ],
    'intervals can be updated with add function');

  /* == Set Interval == */
  updatedRequest = updatedRequest.setIntervals({start: 'P4W', end: 'prev'});

  assert.deepEqual(updatedRequest.intervals,
    [
      {
        start: 'P4W',
        end:   'prev'
      }
    ],
    'intervals can be replaced with set function');

  assert.notEqual(Request,
    updatedRequest,
    'original request was not modified');
});

test('filters', function(assert) {
  assert.expect(5);

  assert.deepEqual(Request.filters,
    [],
    'filters is initially an empty array');

  /* == Add Filter Shorthand == */
  let updatedRequest = Request.addFilter('gender', 'notin', ['m', 'f']);

  assert.deepEqual(updatedRequest.filters,
    [
      {
        dimension: 'gender',
        operator: 'notin',
        values: ['m', 'f']
      }
    ],
    'filters can be updated with shorthand add function');

  /* == Add Filters == */
  updatedRequest = updatedRequest.addFilters({dimension: 'browser', operator: 'in', values: ['firefox']});

  assert.deepEqual(updatedRequest.filters,
    [
      {
        dimension: 'gender',
        operator: 'notin',
        values: ['m', 'f']
      },
      {
        dimension: 'browser',
        operator: 'in',
        values: ['firefox']
      }
    ],
    'filters can be updated with add function');

  /* == Set Filters == */
  updatedRequest = updatedRequest.setFilters({dimension: 'browser', operator: 'in', values: ['chrome']});

  assert.deepEqual(updatedRequest.filters,
    [
      {
        dimension: 'browser',
        operator: 'in',
        values: ['chrome']
      }
    ],
    'filters can be updated with setfunction');

  assert.notEqual(Request,
    updatedRequest,
    'original request was not modified');
});

test('having', function(assert) {
  assert.expect(5);

  assert.deepEqual(Request.having,
    [],
    'having is initially an empty array');

  /* == Add Having Shorthand == */
  let updatedRequest = Request.addHaving('pageViews', 'gt', 1000);

  assert.deepEqual(updatedRequest.having,
    [
      {
        metric: 'pageViews',
        operator: 'gt',
        values: [1000]
      }
    ],
    'having can be updated with shorthand add function');

  /* == Add Having == */
  updatedRequest = updatedRequest.addHavings({metric: 'adClicks', operator: 'gt', values: [500]});

  assert.deepEqual(updatedRequest.having,
    [
      {
        metric: 'pageViews',
        operator: 'gt',
        values: [1000]
      },
      {
        metric: 'adClicks',
        operator: 'gt',
        values: [500]
      }
    ],
    'having can be updated with add function');

  /* == Set Having == */
  updatedRequest = updatedRequest.setHavings({metric: 'navClicks', operator: 'gt', values: [10]});

  assert.deepEqual(updatedRequest.having,
    [
      {
        metric: 'navClicks',
        operator: 'gt',
        values: [10]
      }
    ],
    'having can be replaced with set function');

  assert.notEqual(Request,
    updatedRequest,
    'original request was not modified');
});

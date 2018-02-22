import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import wait from 'ember-test-helpers/wait';

import moment from 'moment';
import Interval from 'navi-core/utils/classes/interval';
import Duration from 'navi-core/utils/classes/duration';

const { get, getOwner } = Ember;

const UNDEFINED_SORT_MODEL = 2,
      MODEL_TO_CLONE = 3;

let Store,
    MetadataService;

moduleForModel('fragments-mock', 'Unit | Model Fragment | BardRequest - Request', {
  needs: [
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:sort',
    'transform:moment',
    'transform:table',
    'model:dimension-age',
    'model:bard-request/request',
    'model:bard-request/fragments/dimension',
    'model:bard-request/fragments/filter',
    'model:bard-request/fragments/interval',
    'model:bard-request/fragments/logicalTable',
    'model:bard-request/fragments/metric',
    'model:bard-request/fragments/having',
    'model:bard-request/fragments/sort',
    'serializer:bard-request/fragments/logical-table',
    'serializer:bard-request/fragments/interval',
    'validator:length',
    'validator:belongs-to',
    'validator:has-many',
    'validator:interval',
    'validator:presence',
    'validator:array-empty-value',
    'service:bard-metadata',
    'adapter:bard-metadata',
    'serializer:bard-metadata',
    'service:keg',
    'service:ajax',
    'service:bard-facts',
    'model:metadata/table',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/time-grain',
    'service:bard-dimensions',
    'adapter:dimensions/bard',
    'validator:number',
    'validator:array-number'
  ],

  beforeEach() {

    setupMock();
    Store = getOwner(this).lookup('service:store');

    MetadataService =  getOwner(this).lookup('service:bard-metadata');

    MetadataService.loadMetadata().then(() => {
      Ember.run(() => {
        Store.pushPayload({
          data: [{
            "id": 1,
            type: 'dimension-age',
            attributes: {
              "description": "under 13"
            }
          },
          {
            "id": 2,
            type: 'dimension-age',
            attributes: {
              "description": "13-17"
            }
          },
          {
            "id": 3,
            type: 'dimension-age',
            attributes: {
              "description": "18-20"
            }
          }]
        });

        Store.pushPayload({
          data: [{
            id: 1,
            type: 'fragments-mock',
            attributes: {
              request: {
                logicalTable: {
                  table: 'network',
                  timeGrain: 'day'
                },
                metrics: [
                  {
                    metric: 'uniqueIdentifier'
                  }
                ],
                intervals: [
                  {
                    id: 'all',
                    start: 'P7D',
                    end: 'current'
                  }
                ],
                dimensions: [],
                filters: [],
                having: [],
                sort: []
              }
            }
          },{
            id: MODEL_TO_CLONE,
            type: 'fragments-mock',
            attributes: {
              request: {
                logicalTable: {
                  table: 'network',
                  timeGrain: 'day'
                },
                metrics: [
                  {
                    metric: 'uniqueIdentifier'
                  }
                ],
                intervals: [
                  {
                    id: 'all',
                    start: 'P7D',
                    end: 'current'
                  }
                ],
                dimensions: [
                  {
                    dimension: 'property'
                  }
                ],
                filters: [
                  {
                    dimension: 'property',
                    operator: 'in',
                    values: [ '644700' ]
                  }
                ],
                having: [{
                  metric: 'uniqueIdentifier',
                  operator: 'gt',
                  values: [ 0 ]
                }],
                sort: [
                  {
                    metric: 'dateTime',
                    direction: 'desc'
                  },
                  {
                    metric: 'navClicks',
                    direction: 'asc'
                  }
                ]
              }
            }
          },{
            id: UNDEFINED_SORT_MODEL,
            type: 'fragments-mock',
            attributes: {
              request: {
                logicalTable: {
                  table: 'network',
                  timeGrain: 'day'
                },
                metrics: [
                  {
                    metric: 'uniqueIdentifier'
                  }
                ],
                intervals: [
                  {
                    id: 'all',
                    start: 'P7D',
                    end: 'current'
                  }
                ],
                dimensions: [],
                filters: [],
                having: []
              }
            }
          }]
        });
      });
    });
  },
  afterEach() {
    teardownMock();
  }
});

test('Request Model Fragment', function(assert) {
  assert.expect(9);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        request = mockModel.get('request');

    assert.equal(request.get('logicalTable.table'),
      MetadataService.getById('table', 'network'),
      'The property Logical Table is set correctly in the request model fragment');

    assert.equal(request.get('metrics').objectAt(0).get('metric'),
      MetadataService.getById('metric', 'uniqueIdentifier'),
      'The property Metric is set correctly in the request model fragment');

    assert.ok(request.get('intervals.firstObject.interval').isEqual(
      new Interval(new Duration('P7D'), 'current')),
    'The property Interval is set correctly in the request model fragment');

    assert.equal(request.get('responseFormat'),
      'json',
      'The property responseFormat is set correctly in the request model fragment');

    assert.equal(request.get('bardVersion'),
      'v1',
      'The property bardVersion is set correctly to the default in the request model fragment');

    assert.equal(request.get('requestVersion'),
      'v1',
      'The property requestVersion is set correctly to the default in the request model fragment');

    assert.equal(request.get('dimensions.length'),
      0,
      'There are no groupBy dimensions in the request model fragment');

    assert.equal(request.get('filters.length'),
      0,
      'There are no filters in the request model fragment');

    assert.equal(request.get('sort.length'),
      0,
      'There are no sort in the request model fragment');
  });
});

test('Clone Request', function(assert) {
  assert.expect(10);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', MODEL_TO_CLONE),
        request = mockModel.get('request').clone();

    assert.equal(request.get('logicalTable.table'),
      MetadataService.getById('table', 'network'),
      'The property Logical Table is set correctly in the request model fragment');

    assert.equal(request.get('metrics').objectAt(0).get('metric'),
      MetadataService.getById('metric', 'uniqueIdentifier'),
      'The property Metric is set correctly in the request model fragment');

    assert.ok(request.get('intervals.firstObject.interval').isEqual(
      new Interval(new Duration('P7D'), 'current')),
    'The property Interval is set correctly in the request model fragment');

    assert.equal(request.get('responseFormat'),
      'json',
      'The property responseFormat is set correctly in the request model fragment');

    assert.equal(request.get('bardVersion'),
      'v1',
      'The property bardVersion is set correctly to the default in the request model fragment');

    assert.equal(request.get('requestVersion'),
      'v1',
      'The property requestVersion is set correctly to the default in the request model fragment');

    assert.equal(request.get('dimensions.firstObject.dimension'),
      MetadataService.getById('dimension', 'property'),
      'The property dimensions is set with correct metadata');

    /*
     * TODO uncomment when cloning filters is fixed
     * assert.equal(request.get('filters.firstObject.values.length'),
     * 1,
     * 'Filter values should be cloned');
     */

    assert.deepEqual(request.get('sort.firstObject.metric'),
      { name: 'dateTime' },
      'The dateTime property in sort is set with correct metadata');

    assert.equal(request.get('sort').toArray()[1].get('metric'),
      MetadataService.getById('metric', 'navClicks'),
      'The property sort is set with correct metadata');

    assert.equal(request.get('having.firstObject.metric'),
      MetadataService.getById('metric', 'uniqueIdentifier'),
      'The property having is set with correct metadata');
  });
});

// Test that navi supports legacy saved reports without a sort field
test('Clone Request without sort', function(assert) {
  assert.expect(1);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', UNDEFINED_SORT_MODEL),
        request = mockModel.get('request').clone();

    assert.equal(request.get('sort.length'),
      0,
      'Undefined sort is cloned to be an empty array');
  });
});

/* == Metric == */

test('addMetric', function(assert) {
  assert.expect(4);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newMetric = {
          metric: MetadataService.getById('metric', 'pageViews')
        },
        request = mockModel.get('request');

        /* == Test initial state == */
    assert.equal(request.get('metrics.length'),
      1,
      'There is one metric in the request model fragment');

    /* == Test adding new metric == */
    request.addMetric(newMetric);
    assert.equal(request.get('metrics.length'),
      2,
      'There are now two metrics in the request model fragment');

    assert.equal(request.get('metrics').objectAt(1).get('metric'),
      MetadataService.getById('metric', 'pageViews'),
      'The new metric has been added to the model fragment');

    /* == Test adding existing metric == */
    request.addMetric(newMetric);
    assert.deepEqual(request.get('metrics').map(m => get(m, 'metric.name')),
      [ 'uniqueIdentifier', 'pageViews' ],
      'Adding a metric already present in the request does not result in duplicate metrics');
  });
});

test('addRequestMetricByModel', function(assert) {
  assert.expect(6);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newMetric = MetadataService.getById('metric', 'pageViews'),
        request = mockModel.get('request');

    assert.equal(request.get('metrics.length'),
      1,
      'There is one metric in the model fragment');

    request.addRequestMetricByModel(newMetric);

    assert.equal(request.get('metrics.length'),
      2,
      'There are now two metrics in the model fragment');

    assert.equal(request.get('metrics').objectAt(1).get('metric'),
      MetadataService.getById('metric', 'pageViews'),
      'The new metric has been added to the model fragment');

    let revenueMetric = MetadataService.getById('metric', 'revenue');

    request.addRequestMetricByModel(revenueMetric);

    assert.equal(request.get('metrics.length'),
      3,
      'There are now three metrics in the model fragment');

    assert.equal(request.get('metrics').objectAt(2).get('metric'),
      MetadataService.getById('metric', 'revenue'),
      'The new metric has been added to the model fragment');

    assert.deepEqual(request.get('metrics').objectAt(2).get('parameters'),
      { currency: 'USD' },
      'The new metric with the default parameter has been added to the model fragment');
  });
});

test('addRequestMetricWithParam', function(assert) {
  assert.expect(8);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newMetric = MetadataService.getById('metric', 'revenue'),
        request = mockModel.get('request');

    assert.equal(request.get('metrics.length'),
      1,
      'There is one metric in the model fragment');

    request.addRequestMetricWithParam(newMetric);

    assert.equal(request.get('metrics.length'),
      2,
      'There are now two metrics in the model fragment');

    assert.equal(request.get('metrics').objectAt(1).get('metric'),
      MetadataService.getById('metric', 'revenue'),
      'The new metric has been added to the model fragment');

    assert.deepEqual(request.get('metrics').objectAt(1).get('parameters'),
      { currency: 'USD' },
      'The new metric with the default parameter has been added to the model fragment');

    request.addRequestMetricWithParam(newMetric, { currency: 'AUD' });

    assert.equal(request.get('metrics.length'),
      3,
      'There are now three metrics in the model fragment');

    assert.equal(request.get('metrics').objectAt(2).get('metric'),
      MetadataService.getById('metric', 'revenue'),
      'The new metric has been added to the model fragment');

    assert.deepEqual(request.get('metrics').objectAt(2).get('parameters'),
      { currency: 'AUD' },
      'The new metric with the specified parameter has been added to the model fragment');

    request.addRequestMetricWithParam(newMetric, { currency: 'USD' });

    assert.equal(request.get('metrics.length'),
      3,
      'The final metric is not added since it already exists in the request');
  });
});

test('removeRequestMetric', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        request = mockModel.get('request');

    assert.equal(request.get('metrics.length'),
      1,
      'There is one metric in the model fragment');

    request.removeRequestMetric(request.get('metrics').objectAt(0));
    assert.equal(request.get('metrics.length'),
      0,
      'There are no metrics in the model fragment');
  });
});

test('removeRequestMetricByModel', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        request = mockModel.get('request');

    assert.equal(request.get('metrics.length'),
      1,
      'There is one metric in the model fragment');

    request.removeRequestMetricByModel(MetadataService.getById('metric', 'uniqueIdentifier'));

    assert.equal(request.get('metrics.length'),
      0,
      'There are no metrics in the model fragment');
  });
});

test('clearMetrics', function(assert){
  assert.expect(2);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newMetric = MetadataService.getById('metric', 'pageViews'),
        request = mockModel.get('request');

    request.addRequestMetricByModel(newMetric);
    assert.equal(request.get('metrics.length'),
      2,
      'There are now two metrics in the model fragment');

    request.clearMetrics();
    assert.equal(request.get('metrics.length'),
      0,
      'All metrics have been cleared in the model fragment');
  });
});

/* == Interval == */

test('addInterval', function(assert) {
  assert.expect(4);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        startDate = moment('1951-07-21 00:00:00.000'),
        endDate = moment('2014-08-11 00:00:00.000'),
        newInterval = new Interval(startDate, endDate),
        request = mockModel.get('request');

    assert.equal(request.get('intervals.length'),
      1,
      'There is one interval in the model fragment');

    request.addInterval(newInterval);

    assert.equal(request.get('intervals.length'),
      2,
      'There are now two intervals in the model fragment');

    assert.ok(request.get('intervals.lastObject.interval').isEqual(newInterval),
      'The new interval has been added to the model fragment');

    /* == Test adding existing interval == */
    request.addInterval(newInterval);
    assert.deepEqual(request.get('intervals').serialize(),
      [ {start: 'P7D',end: 'current'}, newInterval.asStrings() ],
      'Adding an interval already present in the request does not result in duplicate intervals');
  });
});

test('removeInterval', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        request = mockModel.get('request');

    assert.equal(request.get('intervals.length'),
      1,
      'There is one interval in the model fragment');

    request.removeInterval(request.get('intervals.firstObject'));
    assert.equal(request.get('intervals.length'),
      0,
      'There are no intervals in the model fragment');
  });
});

/* == Dimension == */

test('addDimension', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newDimension = {
          dimension: MetadataService.getById('dimension', 'age')
        },
        request = mockModel.get('request');

    request.addDimension(newDimension);

    assert.equal(request.get('dimensions.length'),
      1,
      'There is now one dimension in the model fragment');

    assert.equal(request.get('dimensions').objectAt(0).get('dimension'),
      MetadataService.getById('dimension', 'age'),
      'The new dimension has been added to the model fragment');

    /* == Test adding existing dimension == */
    request.addDimension(newDimension);
    assert.deepEqual(request.get('dimensions').map(m => get(m, 'dimension.name')),
      [ 'age' ],
      'Adding a dimension already present in the request does not result in duplicate dimensions');
  });
});

test('addRequestDimensionByModel', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newDimension =  MetadataService.getById('dimension', 'age'),
        request = mockModel.get('request');

    request.addRequestDimensionByModel(newDimension);

    assert.equal(request.get('dimensions.length'),
      1,
      'There is now one dimension in the model fragment');

    assert.equal(request.get('dimensions').objectAt(0).get('dimension'),
      MetadataService.getById('dimension', 'age'),
      'The new dimension has been added to the model fragment');
  });
});

test('removeRequestDimension', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newDimension = {
          dimension: MetadataService.getById('dimension', 'age')
        },
        request = mockModel.get('request');

    request.addDimension(newDimension);
    assert.equal(request.get('dimensions.length'),
      1,
      'There is one groupBy dimension in the model fragment');

    request.removeRequestDimension(request.get('dimensions').objectAt(0));
    assert.equal(request.get('dimensions.length'),
      0,
      'There are no groupBy dimensions in the model fragment');
  });
});

test('removeRequestDimensionByModel', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newDimension = {
          dimension: MetadataService.getById('dimension', 'age')
        },
        request = mockModel.get('request');

    request.addDimension(newDimension);
    assert.equal(request.get('dimensions.length'),
      1,
      'There is one groupBy dimension in the model fragment');

    request.removeRequestDimensionByModel(MetadataService.getById('dimension', 'age'));
    assert.equal(request.get('dimensions.length'),
      0,
      'There are no groupBy dimensions in the model fragment');
  });
});

test('clearDimensions', function(assert){
  assert.expect(2);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        dimension1 = {
          dimension: MetadataService.getById('dimension', 'age')
        },
        dimension2 = {
          dimension: MetadataService.getById('dimension', 'os')
        },
        request = mockModel.get('request');

    request.addDimension(dimension1);
    request.addDimension(dimension2);
    assert.equal(request.get('dimensions.length'),
      2,
      'There are now two dimensions in the model fragment');

    request.clearDimensions();
    assert.equal(request.get('dimensions.length'),
      0,
      'All dimensions have been cleared in the model fragment');
  });

});

/* == Filters == */

test('addFilters', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newFilter = {
          dimension: MetadataService.getById('dimension', 'age'),
          operator: 'in',
          field: null,
          values: []
        },
        request = mockModel.get('request');

    request.addFilter(newFilter);

    assert.equal(request.get('filters.length'),
      1,
      'There is now one filter in the model fragment');

    assert.equal(request.get('filters').objectAt(0).get('dimension'),
      MetadataService.getById('dimension', 'age'),
      'The new filter has been added to the model fragment');

    /* == Test adding existing filter == */
    request.addFilter(newFilter);
    assert.deepEqual(request.get('filters').map(m => m.serialize()),
      [{
        dimension: get(newFilter,'dimension.name'),
        field: get(newFilter, 'field'),
        operator: get(newFilter, 'operator'),
        rawValues: get(newFilter, 'values')
      }],
      'Adding a filter that is already present in the request does not result in duplicate filters');
  });
});

test('removeRequestFilter', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newFilter = {
          dimension: MetadataService.getById('dimension', 'age'),
          operator: 'in',
          values: []
        },
        request = mockModel.get('request');

    request.addFilter(newFilter);
    assert.equal(request.get('filters.length'),
      1,
      'There is one filter in the model fragment');

    request.removeRequestFilter(request.get('filters').objectAt(0));
    assert.equal(request.get('filters.length'),
      0,
      'There is no filters in the model fragment');
  });
});

test('removeRequestFilterByDimension', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newFilter = {
          dimension: MetadataService.getById('dimension', 'age'),
          operator: 'in',
          values: [],
        },
        request = mockModel.get('request');

    request.addFilter(newFilter);
    assert.equal(request.get('filters.length'),
      1,
      'There is one filter in the model fragment');

    request.removeRequestFilterByDimension(MetadataService.getById('dimension', 'age'));
    assert.equal(request.get('filters.length'),
      0,
      'There are no filters in the model fragment');
  });
});

test('updateFilter', function(assert) {
  assert.expect(9);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        filter = {
          dimension: MetadataService.getById('dimension', 'age'),
          operator: 'in',
          values: [ Store.peekRecord('dimension-age', 1) ]
        },
        request = mockModel.get('request');

    request.addFilter(filter);

    assert.equal(request.get('filters.length'),
      1,
      'There is one filter in the model fragment');

    assert.equal(request.get('filters').objectAt(0).get('operator'),
      'in',
      'The filter has been added successfully to the model fragment');

    assert.equal(request.get('filters').objectAt(0).get('values').objectAt(0).get('description'),
      'under 13',
      'The filter description has the right value');

    request.updateFilterForDimension(filter.dimension, {
      operator: 'not-in',
      values: [ Store.peekRecord('dimension-age', 1), Store.peekRecord('dimension-age', 2) ]
    });

    assert.equal(request.get('filters').objectAt(0).get('operator'),
      'not-in',
      'The filter operator has been updated successfully in the model fragment');

    assert.deepEqual(request.get('filters').objectAt(0).get('rawValues'),
      [ '1', '2' ],
      'The filter values have been updated successfully in the model fragment');

    request.updateFilterForDimension(filter.dimension, {
      operator: 'add'
    });

    assert.equal(request.get('filters').objectAt(0).get('operator'),
      'add',
      'The filter operator has been updated successfully to add in the model fragment');

    assert.deepEqual(request.get('filters').objectAt(0).get('rawValues'),
      [ '1', '2' ],
      'The filter values remain the same in the model fragment');

    request.updateFilterForDimension(filter.dimension, {
      values: [ Store.peekRecord('dimension-age', 2) ]
    });

    assert.equal(request.get('filters').objectAt(0).get('operator'),
      'add',
      'The filter operator remains the same in the model fragment');

    assert.deepEqual(request.get('filters').objectAt(0).get('rawValues'),
      [ '2' ],
      'The filter values is updated in the model fragment');
  });
});

/* == Having == */

test('addHaving', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newHaving = {
          metric: MetadataService.getById('metric', 'pageViews'),
          operator: 'gt',
          value: 100
        },
        request = mockModel.get('request');

    request.addHaving(newHaving);

    assert.equal(request.get('having.length'),
      1,
      'There is now one having in the model fragment');

    assert.equal(request.get('having').objectAt(0).get('metric'),
      MetadataService.getById('metric', 'pageViews'),
      'The new having has been added to the model fragment');

    /* == Test adding existing having == */
    request.addHaving(newHaving);

    assert.deepEqual(request.get('having').map(m => m.serialize()),
      [{
        metric: get(newHaving, 'metric.name'),
        operator: get(newHaving, 'operator'),
        values: [ get(newHaving, 'value') ]
      }],
      'Adding a having already present in the request does not result in duplicate havings'
    );
  });
});

test('removeRequestHaving', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newHaving = {
          metric: MetadataService.getById('metric', 'pageViews'),
          operator: 'gt',
          value: 100
        },
        request = mockModel.get('request');

    request.addHaving(newHaving);
    assert.equal(request.get('having.length'),
      1,
      'There is one having in the model fragment');

    request.removeRequestHaving(request.get('having').objectAt(0));
    assert.equal(request.get('having.length'),
      0,
      'There is no having in the model fragment');
  });
});

test('removeRequestHavingByMetric', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newHaving = {
          metric: MetadataService.getById('metric', 'pageViews'),
          operator: 'gt',
          value: 100
        },
        request = mockModel.get('request');

    request.addHaving(newHaving);
    assert.equal(request.get('having.length'),
      1,
      'There is one having in the model fragment');

    request.removeRequestHavingByMetric(MetadataService.getById('metric', 'pageViews'));
    assert.equal(request.get('having.length'),
      0,
      'There are no having in the model fragment');
  });
});

test('updateHaving', function(assert) {
  assert.expect(5);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        having = {
          metric: MetadataService.getById('metric', 'pageViews'),
          operator: 'gt',
          value: 100
        },
        request = mockModel.get('request');

    request.addHaving(having);

    assert.equal(request.get('having.length'),
      1,
      'There is one having in the model fragment');

    assert.equal(request.get('having').objectAt(0).get('operator'),
      'gt',
      'The having has been added successfully to the model fragment');

    assert.equal(request.get('having').objectAt(0).get('value'),
      100,
      'The having value is correct');

    request.updateHavingForMetric(having.metric, {
      operator: 'gte',
      value: 200
    });

    assert.equal(request.get('having').objectAt(0).get('operator'),
      'gte',
      'The having operator has been updated successfully in the model fragment');

    assert.equal(request.get('having').objectAt(0).get('value'),
      200,
      'The filter value have been updated successfully in the model fragment');
  });
});

/* == Sort == */

test('dateTime Sort', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newSort = {
          metric: MetadataService.getById('metric', 'pageViews'),
          direction: 'desc'
        },
        request = mockModel.get('request');

    request.addSort(newSort);
    request.addDateTimeSort('desc');

    assert.equal(request.get('sort.length'),
      2,
      'There is now one sort in the model fragment');

    assert.deepEqual(request.get('sort').objectAt(0).get('metric'),
      { name: 'dateTime' },
      'The new dateTime sort has been added to the model fragment as the first object');

    request.updateDateTimeSort({ direction: 'asc' });
    assert.deepEqual(request.get('sort').objectAt(0).serialize(), {
      metric: 'dateTime',
      direction: 'asc'
    }, 'The new dateTime sort direction has been updated');
  });
});

test('addSorts', function(assert) {
  assert.expect(4);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newSort = {
          metric: MetadataService.getById('metric', 'pageViews'),
          direction: 'desc'
        },
        request = mockModel.get('request');

    request.addSort(newSort);

    assert.equal(request.get('sort.length'),
      1,
      'There is now one sort in the model fragment');

    assert.equal(request.get('sort').objectAt(0).get('metric'),
      MetadataService.getById('metric', 'pageViews'),
      'The new sort has been added to the model fragment');

    /* == Test adding existing sort == */
    assert.throws(function() {request.addSort(newSort);},
      /^Error.*Metric: pageViews cannot have multiple sorts on it$/,
      'Sort Fragment throws an error when adding multiple sorts to a single metric');

    assert.deepEqual(request.get('sort').map(m => m.serialize()),
      [{
        metric: get(newSort, 'metric.name'),
        direction: get(newSort, 'direction')
      }],
      'Adding a sort already present in the request does not result in duplicate sorts');
  });
});

test('removeSort', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newSort = {
          metric: MetadataService.getById('metric', 'pageViews'),
          direction: 'desc'
        },
        request = mockModel.get('request');

    request.addSort(newSort);
    assert.equal(request.get('sort.length'),
      1,
      'There is one sort in the model fragment');

    request.removeSort(request.get('sort').objectAt(0));
    assert.equal(request.get('sort.length'),
      0,
      'There is no sort in the model fragment');
  });
});

test('removeSortByMetricName', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newSort = {
          metric: MetadataService.getById('metric', 'pageViews'),
          direction: 'desc'
        },
        request = mockModel.get('request');

    request.addSort(newSort);
    assert.equal(request.get('sort.length'),
      1,
      'There is one sort in the model fragment');

    request.removeSortByMetricName('pageViews');
    assert.equal(request.get('sort.length'),
      0,
      'There are no sort in the model fragment');
  });
});

test('updateSort', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        sort = {
          metric: MetadataService.getById('metric', 'pageViews'),
          direction: 'asc'
        },
        request = mockModel.get('request');

    request.addSort(sort);

    assert.equal(request.get('sort.length'),
      1,
      'There is one sort in the model fragment');

    assert.equal(request.get('sort').objectAt(0).get('direction'),
      'asc',
      'The sort has been added successfully to the model fragment with correct direction');

    request.updateSortForMetric(sort.metric, {
      direction: 'desc'
    });

    assert.equal(request.get('sort').objectAt(0).get('direction'),
      'desc',
      'The sort direction has been updated successfully in the model fragment');
  });
});

test('Validations', function(assert) {
  assert.expect(14);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        request = mockModel.get('request');

    request.validate().then(({ validations }) => {
      assert.ok(validations.get('isValid'), 'Request is valid');
      assert.equal(validations.get('messages').length,
        0,
        'There are no validation errors');
    });

    //setting logicalTable to null
    request.set('logicalTable', null);
    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages').length,
        1,
        'One Field is invalid in the request model');
      assert.equal(validations.get('messages').objectAt(0),
        'Please select a table',
        'Logical Table cannot be empty error is part of the messages');
    });

    //setting response format to empty
    request.set('responseFormat', '');
    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages').length,
        2,
        'Two Fields are invalid in the request model');
      assert.equal(validations.get('messages').objectAt(1),
        'Please select a response format',
        'Response format cannot be empty error is part of the messages');
    });

    //setting metrics to empty
    request.set('metrics', []);

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'),
        3,
        'Three Fields are invalid in the request model');
      assert.equal(validations.get('messages').objectAt(2),
        'At least one metric should be selected',
        'At least one metric should be selected is part of the messages');
    });

    //setting intervals to empty
    request.set('intervals', []);

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'),
        4,
        'Four Fields are invalid in the request model');
      assert.equal(validations.get('messages').objectAt(3),
        'Please select a date range',
        'Intervals missing is part of the messages');
    });
  });
});

test('logicalTable belongs-to validation', function(assert) {
  assert.expect(4);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        request = mockModel.get('request');

    request.set('logicalTable', Store.createFragment('bard-request/fragments/logical-table', { table: undefined }));

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'),
        2,
        'Two Fields are invalid in the request model');
      assert.equal(validations.get('messages').objectAt(0),
        'Please select a table',
        'Please select a table is a part of the messages');
      assert.equal(validations.get('messages').objectAt(1),
        'The timeGrainName field cannot be empty',
        'Time Grain Name cannot be empty is a part of the messages');
    });
  });
});

test('dimensions has-many validation', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        request = mockModel.get('request');

    request.addDimension({ dimension: undefined });

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'),
        1,
        'One Field is invalid in the request model');
      assert.equal(validations.get('messages').objectAt(0),
        'The dimension field cannot be empty',
        'Dimension cannot be empty is a part of the messages');
    });
  });
});

test('filters has-many validation', function(assert) {
  assert.expect(4);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newFilter = {
          dimension: MetadataService.getById('dimension', 'age'),
          values: []
        },
        request = mockModel.get('request');

    request.addFilter(newFilter);

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'),
        2,
        'Two Fields are invalid in the request model');

      assert.equal(validations.get('messages').objectAt(0),
        'The operator field in the filter cannot be empty',
        'Operator cannot be empty is a part of the messages');

      assert.equal(validations.get('messages').objectAt(1),
        'Age filter needs at least one value',
        'Values cannot be empty is a part of the messages');
    });
  });
});

test('metrics has-many validation', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        request = mockModel.get('request');

    request.addMetric({ metric: undefined });

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'),
        1,
        'One Field is invalid in the request model');
      assert.equal(validations.get('messages').objectAt(0),
        'The metric field cannot be empty',
        'Metric cannot be empty is a part of the messages');
    });
  });
});

test('intervals has-many validations', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newInterval = new Interval(
          moment('2015', 'YYYY'),
          moment('1990', 'YYYY')
        ),
        request = mockModel.get('request');

    request.addInterval(newInterval);

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'),
        1,
        'An error is given when there are no valid intervals');
      assert.equal(validations.get('messages').objectAt(0),
        'The start date should be before end date',
        'Start Date should be before end date is a part of the error messages');
    });
  });
});

test('sort has-many validation', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newSort = {
          metric: MetadataService.getById('metric', 'pageViews'),
        },
        request = mockModel.get('request');

    request.addSort(newSort);

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'),
        1,
        'One of the Field is invalid in the request model');

      assert.equal(validations.get('messages').objectAt(0),
        'The direction field in sort cannot be empty',
        'Direction cannot be empty is a part of the messages');
    });
  });
});

test('having has-many validation', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    let mockModel = Store.peekRecord('fragments-mock', 1),
        newHaving = {
          metric: MetadataService.getById('metric', 'pageViews')
        },
        request = mockModel.get('request');

    request.addHaving(newHaving);

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'),
        1,
        'One Field is invalid in the request model');

      assert.equal(validations.get('messages').objectAt(0),
        'The values field in the having cannot be empty',
        'Values cannot be empty is a part of the messages');
    });
  });
});

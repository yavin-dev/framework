import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';
import { settled } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { set } from '@ember/object';
import { run } from '@ember/runloop';
import moment from 'moment';
import Interval from 'navi-core/utils/classes/interval';
import Duration from 'navi-core/utils/classes/duration';

const UNDEFINED_SORT_MODEL = 2,
  MODEL_TO_CLONE = 3;

let Store, MetadataService;

module('Unit | Model Fragment | BardRequest - Request', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Store = this.owner.lookup('service:store');

    MetadataService = this.owner.lookup('service:bard-metadata');

    await Promise.all([
      MetadataService.loadMetadata(),
      MetadataService.loadMetadata({ dataSourceName: 'blockhead' })
    ]).then(() => {
      run(() => {
        Store.pushPayload({
          data: [
            {
              id: 1,
              type: 'dimension-age',
              attributes: {
                description: 'under 13'
              }
            },
            {
              id: 2,
              type: 'dimension-age',
              attributes: {
                description: '13-17'
              }
            },
            {
              id: 3,
              type: 'dimension-age',
              attributes: {
                description: '18-20'
              }
            }
          ]
        });

        Store.pushPayload({
          data: [
            {
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
            },
            {
              id: MODEL_TO_CLONE,
              type: 'fragments-mock',
              attributes: {
                request: {
                  logicalTable: {
                    table: 'network',
                    timeGrain: 'day'
                  },
                  dataSource: 'dummy',
                  metrics: [
                    {
                      metric: 'uniqueIdentifier',
                      parameters: { param: 'foo', as: 'm1' }
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
                      values: ['644700']
                    },
                    {
                      dimension: 'multiSystemId',
                      operator: 'in',
                      field: 'key',
                      values: ['12345']
                    }
                  ],
                  having: [
                    {
                      metric: { metric: 'uniqueIdentifier' },
                      operator: 'gt',
                      values: [0]
                    }
                  ],
                  sort: [
                    {
                      metric: { metric: 'dateTime' },
                      direction: 'desc'
                    },
                    {
                      metric: { metric: 'navClicks' },
                      direction: 'asc'
                    }
                  ]
                }
              }
            },
            {
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
                    },
                    {
                      metric: 'revenue',
                      parameters: {
                        currency: 'USD'
                      }
                    },
                    {
                      metric: 'revenue',
                      parameters: {
                        currency: 'CAD'
                      }
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
            }
          ]
        });
      });
    });
  });

  test('Request Model Fragment', async function(assert) {
    assert.expect(9);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      request = mockModel.get('request');

    assert.equal(
      request.logicalTable?.table,
      MetadataService.getById('table', 'network'),
      'The property Logical Table is set correctly in the request model fragment'
    );

    assert.equal(
      request
        .get('metrics')
        .objectAt(0)
        .get('metric'),
      MetadataService.getById('metric', 'uniqueIdentifier'),
      'The property Metric is set correctly in the request model fragment'
    );

    assert.ok(
      request.get('intervals.firstObject.interval').isEqual(new Interval(new Duration('P7D'), 'current')),
      'The property Interval is set correctly in the request model fragment'
    );

    assert.equal(
      request.responseFormat,
      'json',
      'The property responseFormat is set correctly in the request model fragment'
    );

    assert.equal(
      request.bardVersion,
      'v1',
      'The property bardVersion is set correctly to the default in the request model fragment'
    );

    assert.equal(
      request.requestVersion,
      'v1',
      'The property requestVersion is set correctly to the default in the request model fragment'
    );

    assert.equal(request.dimensions.length, 0, 'There are no groupBy dimensions in the request model fragment');

    assert.equal(request.filters.length, 0, 'There are no filters in the request model fragment');

    assert.equal(request.sort.length, 0, 'There are no sort in the request model fragment');
  });

  test('Clone Request', async function(assert) {
    assert.expect(14);

    await settled();
    const mockModel = Store.peekRecord('fragments-mock', MODEL_TO_CLONE);
    const request = mockModel.get('request').clone();

    assert.equal(
      request.logicalTable?.table,
      MetadataService.getById('table', 'network'),
      'The property Logical Table is set correctly in the request model fragment'
    );

    assert.equal(
      request
        .get('metrics')
        .objectAt(0)
        .get('metric'),
      MetadataService.getById('metric', 'uniqueIdentifier'),
      'The property Metric is set correctly in the request model fragment'
    );

    assert.deepEqual(
      request
        .get('metrics')
        .objectAt(0)
        .get('parameters'),
      { param: 'foo' },
      'The cloned metric has the right parameters set in the request model fragment'
    );

    assert.ok(
      request.get('intervals.firstObject.interval').isEqual(new Interval(new Duration('P7D'), 'current')),
      'The property Interval is set correctly in the request model fragment'
    );

    assert.equal(
      request.responseFormat,
      'json',
      'The property responseFormat is set correctly in the request model fragment'
    );

    assert.equal(
      request.bardVersion,
      'v1',
      'The property bardVersion is set correctly to the default in the request model fragment'
    );

    assert.equal(
      request.requestVersion,
      'v1',
      'The property requestVersion is set correctly to the default in the request model fragment'
    );

    assert.equal(
      request.get('dimensions.firstObject.dimension'),
      MetadataService.getById('dimension', 'property'),
      'The property dimensions is set with correct metadata'
    );

    /**
     * TODO uncomment when cloning filters is fixed
     * assert.equal(request.get('filters.firstObject.values.length'),
     * 1,
     * 'Filter values should be cloned');
     */

    assert.equal(
      request
        .get('filters')
        .objectAt(1)
        .get('field'),
      'key',
      'clone field when it is present'
    );

    assert.deepEqual(
      request.get('sort.firstObject.metric.metric'),
      { id: 'dateTime' },
      'The dateTime property in sort is set with correct metadata'
    );
    assert.equal(
      request
        .get('sort')
        .toArray()[1]
        .get('metric.metric'),
      MetadataService.getById('metric', 'navClicks'),
      'The property sort is set with correct metadata'
    );

    assert.deepEqual(
      request.get('having.firstObject.metric.metric'),
      mockModel.get('request.having.firstObject.metric.metric'),
      'The property having is set with correct metadata'
    );

    assert.deepEqual(
      request.get('having.firstObject.metric.parameters'),
      mockModel.get('request.having.firstObject.metric.parameters'),
      'The property having is set with correct parameters'
    );

    assert.equal(request.dataSource, 'dummy', 'datasource was cloned correctly');
  });

  // Test that navi supports legacy saved reports without a sort field
  test('Clone Request without sort', async function(assert) {
    assert.expect(1);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', UNDEFINED_SORT_MODEL),
      request = mockModel.get('request').clone();

    assert.equal(request.sort.length, 0, 'Undefined sort is cloned to be an empty array');
  });

  /* == Metric == */

  test('addMetric', async function(assert) {
    assert.expect(5);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newMetric = {
        metric: MetadataService.getById('metric', 'pageViews')
      },
      request = mockModel.get('request');

    /* == Test initial state == */
    assert.equal(request.metrics.length, 1, 'There is one metric in the request model fragment');

    /* == Test adding new metric == */
    request.addMetric(newMetric);
    assert.equal(request.metrics.length, 2, 'There are now two metrics in the request model fragment');

    assert.equal(
      request
        .get('metrics')
        .objectAt(1)
        .get('metric'),
      MetadataService.getById('metric', 'pageViews'),
      'The new metric has been added to the model fragment'
    );

    /* == Test adding existing metric == */
    request.addMetric(newMetric);
    assert.deepEqual(
      request.metrics.map(m => m.metric.id),
      ['uniqueIdentifier', 'pageViews'],
      'Adding a metric already present in the request does not result in duplicate metrics'
    );

    config.navi.FEATURES.enableRequestPreview = true;
    request.addMetric(newMetric);
    assert.deepEqual(
      request.metrics.map(m => m.metric?.id),
      ['uniqueIdentifier', 'pageViews', 'pageViews'],
      'Adding a metric already present in the request results in duplicate metrics when enableRequestPreview feature flag is on'
    );
    config.navi.FEATURES.enableRequestPreview = false;
  });

  test('addRequestMetricByModel', async function(assert) {
    assert.expect(6);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newMetric = MetadataService.getById('metric', 'pageViews'),
      request = mockModel.get('request');

    assert.equal(request.metrics.length, 1, 'There is one metric in the model fragment');

    request.addRequestMetricByModel(newMetric);

    assert.equal(request.metrics.length, 2, 'There are now two metrics in the model fragment');

    assert.equal(
      request
        .get('metrics')
        .objectAt(1)
        .get('metric'),
      MetadataService.getById('metric', 'pageViews'),
      'The new metric has been added to the model fragment'
    );

    let revenueMetric = MetadataService.getById('metric', 'revenue');

    request.addRequestMetricByModel(revenueMetric);

    assert.equal(request.metrics.length, 3, 'There are now three metrics in the model fragment');

    assert.equal(
      request
        .get('metrics')
        .objectAt(2)
        .get('metric'),
      MetadataService.getById('metric', 'revenue'),
      'The new metric has been added to the model fragment'
    );

    assert.deepEqual(
      request
        .get('metrics')
        .objectAt(2)
        .get('parameters'),
      { currency: 'USD' },
      'The new metric with the default parameter has been added to the model fragment'
    );
  });

  test('addRequestMetricWithParam', async function(assert) {
    assert.expect(8);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newMetric = MetadataService.getById('metric', 'revenue'),
      request = mockModel.get('request');

    assert.equal(request.metrics.length, 1, 'There is one metric in the model fragment');

    request.addRequestMetricWithParam(newMetric);

    assert.equal(request.metrics.length, 2, 'There are now two metrics in the model fragment');

    assert.equal(
      request
        .get('metrics')
        .objectAt(1)
        .get('metric'),
      MetadataService.getById('metric', 'revenue'),
      'The new metric has been added to the model fragment'
    );

    assert.deepEqual(
      request
        .get('metrics')
        .objectAt(1)
        .get('parameters'),
      { currency: 'USD' },
      'The new metric with the default parameter has been added to the model fragment'
    );

    request.addRequestMetricWithParam(newMetric, { currency: 'AUD' });

    assert.equal(request.metrics.length, 3, 'There are now three metrics in the model fragment');

    assert.equal(
      request
        .get('metrics')
        .objectAt(2)
        .get('metric'),
      MetadataService.getById('metric', 'revenue'),
      'The new metric has been added to the model fragment'
    );

    assert.deepEqual(
      request
        .get('metrics')
        .objectAt(2)
        .get('parameters'),
      { currency: 'AUD' },
      'The new metric with the specified parameter has been added to the model fragment'
    );

    request.addRequestMetricWithParam(newMetric, { currency: 'USD' });

    assert.equal(request.metrics.length, 3, 'The final metric is not added since it already exists in the request');
  });

  test('removeRequestMetric', async function(assert) {
    assert.expect(2);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      request = mockModel.get('request');

    assert.equal(request.metrics.length, 1, 'There is one metric in the model fragment');

    request.removeRequestMetric(request.get('metrics').objectAt(0));
    assert.equal(request.metrics.length, 0, 'There are no metrics in the model fragment');
  });

  test('removeRequestMetricByModel', async function(assert) {
    assert.expect(2);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      request = mockModel.get('request');

    assert.equal(request.metrics.length, 1, 'There is one metric in the model fragment');

    request.removeRequestMetricByModel(MetadataService.getById('metric', 'uniqueIdentifier'));

    assert.equal(request.metrics.length, 0, 'There are no metrics in the model fragment');
  });

  test('removeRequestMetricByModel - multiple metrics', async function(assert) {
    assert.expect(2);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      revenueMetric = MetadataService.getById('metric', 'revenue'),
      request = mockModel.get('request');

    request.addRequestMetricWithParam(revenueMetric);
    request.addRequestMetricWithParam(revenueMetric, { currency: 'AUD' });

    assert.equal(request.metrics.length, 3, 'There is one metric in the model fragment');

    request.removeRequestMetricByModel(revenueMetric);

    assert.equal(request.metrics.length, 1, 'There are no metrics in the model fragment');
  });

  test('removeRequestMetricWithParam', async function(assert) {
    assert.expect(4);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      revenueMetric = MetadataService.getById('metric', 'revenue'),
      request = mockModel.get('request');

    request.addRequestMetricWithParam(revenueMetric);
    request.addRequestMetricWithParam(revenueMetric, {
      currency: 'AUD',
      as: 'm1'
    });

    assert.equal(request.metrics.length, 3, 'There are three metrics in the model fragment');

    request.removeRequestMetricWithParam(revenueMetric, { currency: 'AUD' });

    assert.equal(request.metrics.length, 2, 'There is now two metrics in the model fragment');

    let selectedRevenueMetric = request.get('metrics').objectAt(1);

    assert.equal(selectedRevenueMetric.metric?.id, 'revenue', 'One revenue metric is part of the selected metric list');

    assert.deepEqual(
      selectedRevenueMetric.parameters,
      { currency: 'USD' },
      'the selected revenue metric has the right parameter'
    );
  });

  test('clearMetrics', async function(assert) {
    assert.expect(2);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newMetric = MetadataService.getById('metric', 'pageViews'),
      request = mockModel.get('request');

    request.addRequestMetricByModel(newMetric);
    assert.equal(request.metrics.length, 2, 'There are now two metrics in the model fragment');

    request.clearMetrics();
    assert.equal(request.metrics.length, 0, 'All metrics have been cleared in the model fragment');
  });

  /* == Interval == */

  test('addInterval', async function(assert) {
    assert.expect(4);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      startDate = moment('1951-07-21 00:00:00.000'),
      endDate = moment('2014-08-11 00:00:00.000'),
      newInterval = new Interval(startDate, endDate),
      request = mockModel.get('request');

    assert.equal(request.intervals.length, 1, 'There is one interval in the model fragment');

    request.addInterval(newInterval);

    assert.equal(request.intervals.length, 2, 'There are now two intervals in the model fragment');

    assert.ok(
      request.get('intervals.lastObject.interval').isEqual(newInterval),
      'The new interval has been added to the model fragment'
    );

    /* == Test adding existing interval == */
    request.addInterval(newInterval);
    assert.deepEqual(
      request.get('intervals').serialize(),
      [{ start: 'P7D', end: 'current' }, newInterval.asStrings()],
      'Adding an interval already present in the request does not result in duplicate intervals'
    );
  });

  test('removeInterval', async function(assert) {
    assert.expect(2);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      request = mockModel.get('request');

    assert.equal(request.intervals.length, 1, 'There is one interval in the model fragment');

    request.removeInterval(request.get('intervals.firstObject'));
    assert.equal(request.intervals.length, 0, 'There are no intervals in the model fragment');
  });

  /* == Dimension == */

  test('addDimension', async function(assert) {
    assert.expect(4);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newDimension = {
        dimension: MetadataService.getById('dimension', 'age')
      },
      request = mockModel.get('request');

    request.addDimension(newDimension);

    assert.equal(request.dimensions.length, 1, 'There is now one dimension in the model fragment');

    assert.equal(
      request
        .get('dimensions')
        .objectAt(0)
        .get('dimension'),
      MetadataService.getById('dimension', 'age'),
      'The new dimension has been added to the model fragment'
    );

    /* == Test adding existing dimension == */
    request.addDimension(newDimension);
    assert.deepEqual(
      request.dimensions.map(m => m.dimension?.id),
      ['age'],
      'Adding a dimension already present in the request does not result in duplicate dimensions'
    );

    config.navi.FEATURES.enableRequestPreview = true;
    request.addDimension(newDimension);
    assert.deepEqual(
      request.dimensions.map(m => m.dimension?.id),
      ['age', 'age'],
      'Adding a dimension already present in the request results in duplicate dimensions when enableRequestPreview feature flag is on'
    );
    config.navi.FEATURES.enableRequestPreview = false;
  });

  test('addRequestDimensionByModel', async function(assert) {
    assert.expect(2);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newDimension = MetadataService.getById('dimension', 'age'),
      request = mockModel.get('request');

    request.addRequestDimensionByModel(newDimension);

    assert.equal(request.dimensions.length, 1, 'There is now one dimension in the model fragment');

    assert.equal(
      request
        .get('dimensions')
        .objectAt(0)
        .get('dimension'),
      MetadataService.getById('dimension', 'age'),
      'The new dimension has been added to the model fragment'
    );
  });

  test('removeRequestDimension', async function(assert) {
    assert.expect(2);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newDimension = {
        dimension: MetadataService.getById('dimension', 'age')
      },
      request = mockModel.get('request');

    request.addDimension(newDimension);
    assert.equal(request.dimensions.length, 1, 'There is one groupBy dimension in the model fragment');

    request.removeRequestDimension(request.get('dimensions').objectAt(0));
    assert.equal(request.dimensions.length, 0, 'There are no groupBy dimensions in the model fragment');
  });

  test('removeRequestDimensionByModel', async function(assert) {
    assert.expect(2);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newDimension = {
        dimension: MetadataService.getById('dimension', 'age')
      },
      request = mockModel.get('request');

    request.addDimension(newDimension);
    assert.equal(request.dimensions.length, 1, 'There is one groupBy dimension in the model fragment');

    request.removeRequestDimensionByModel(MetadataService.getById('dimension', 'age'));
    assert.equal(request.dimensions.length, 0, 'There are no groupBy dimensions in the model fragment');
  });

  test('clearDimensions', async function(assert) {
    assert.expect(2);

    await settled();
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
    assert.equal(request.dimensions.length, 2, 'There are now two dimensions in the model fragment');

    request.clearDimensions();
    assert.equal(request.dimensions.length, 0, 'All dimensions have been cleared in the model fragment');
  });

  /* == Filters == */

  test('addFilters', async function(assert) {
    assert.expect(3);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newFilter = {
        dimension: MetadataService.getById('dimension', 'age'),
        operator: 'in',
        field: null,
        values: []
      },
      request = mockModel.get('request');

    request.addFilter(newFilter);

    assert.equal(request.filters.length, 1, 'There is now one filter in the model fragment');

    assert.equal(
      request
        .get('filters')
        .objectAt(0)
        .get('dimension'),
      MetadataService.getById('dimension', 'age'),
      'The new filter has been added to the model fragment'
    );

    /* == Test adding existing filter == */
    request.addFilter(newFilter);
    assert.deepEqual(
      request.get('filters').map(m => m.serialize()),
      [
        {
          dimension: newFilter.dimension?.id,
          field: newFilter.field,
          operator: newFilter.operator,
          values: newFilter.values
        }
      ],
      'Adding a filter that is already present in the request does not result in duplicate filters'
    );
  });

  test('removeRequestFilter', async function(assert) {
    assert.expect(2);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newFilter = {
        dimension: MetadataService.getById('dimension', 'age'),
        operator: 'in',
        values: []
      },
      request = mockModel.get('request');

    request.addFilter(newFilter);
    assert.equal(request.filters.length, 1, 'There is one filter in the model fragment');

    request.removeRequestFilter(request.get('filters').objectAt(0));
    assert.equal(request.filters.length, 0, 'There is no filters in the model fragment');
  });

  test('removeRequestFilterByDimension', async function(assert) {
    assert.expect(2);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newFilter = {
        dimension: MetadataService.getById('dimension', 'age'),
        operator: 'in',
        values: []
      },
      request = mockModel.get('request');

    request.addFilter(newFilter);
    assert.equal(request.filters.length, 1, 'There is one filter in the model fragment');

    request.removeRequestFilterByDimension(MetadataService.getById('dimension', 'age'));
    assert.equal(request.filters.length, 0, 'There are no filters in the model fragment');
  });

  test('updateFilter', async function(assert) {
    assert.expect(9);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      filter = {
        dimension: MetadataService.getById('dimension', 'age'),
        operator: 'in',
        values: [Store.peekRecord('dimension-age', 1)]
      },
      request = mockModel.get('request');

    request.addFilter(filter);

    assert.equal(request.filters.length, 1, 'There is one filter in the model fragment');

    assert.equal(
      request
        .get('filters')
        .objectAt(0)
        .get('operator'),
      'in',
      'The filter has been added successfully to the model fragment'
    );

    assert.equal(
      request
        .get('filters')
        .objectAt(0)
        .get('values')
        .objectAt(0)
        .get('description'),
      'under 13',
      'The filter description has the right value'
    );

    request.updateFilterForDimension(filter.dimension, {
      operator: 'not-in',
      values: [Store.peekRecord('dimension-age', 1), Store.peekRecord('dimension-age', 2)]
    });

    assert.equal(
      request
        .get('filters')
        .objectAt(0)
        .get('operator'),
      'not-in',
      'The filter operator has been updated successfully in the model fragment'
    );

    assert.deepEqual(
      request
        .get('filters')
        .objectAt(0)
        .get('rawValues'),
      ['1', '2'],
      'The filter values have been updated successfully in the model fragment'
    );

    request.updateFilterForDimension(filter.dimension, {
      operator: 'add'
    });

    assert.equal(
      request
        .get('filters')
        .objectAt(0)
        .get('operator'),
      'add',
      'The filter operator has been updated successfully to add in the model fragment'
    );

    assert.deepEqual(
      request
        .get('filters')
        .objectAt(0)
        .get('rawValues'),
      ['1', '2'],
      'The filter values remain the same in the model fragment'
    );

    request.updateFilterForDimension(filter.dimension, {
      values: [Store.peekRecord('dimension-age', 2)]
    });

    assert.equal(
      request
        .get('filters')
        .objectAt(0)
        .get('operator'),
      'add',
      'The filter operator remains the same in the model fragment'
    );

    assert.deepEqual(
      request
        .get('filters')
        .objectAt(0)
        .get('rawValues'),
      ['2'],
      'The filter values is updated in the model fragment'
    );
  });

  /* == Having == */

  test('addHaving', async function(assert) {
    assert.expect(3);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newHaving = {
        metric: {
          metric: MetadataService.getById('metric', 'pageViews')
        },
        operator: 'gt',
        value: 100
      },
      request = mockModel.get('request');

    request.addHaving(newHaving);

    assert.equal(request.having.length, 1, 'There is now one having in the model fragment');

    assert.equal(
      request
        .get('having')
        .objectAt(0)
        .get('metric.metric'),
      MetadataService.getById('metric', 'pageViews'),
      'The new having has been added to the model fragment'
    );

    /* == Test adding existing having == */
    request.addHaving(newHaving);

    assert.deepEqual(
      request.get('having').map(m => m.serialize()),
      [
        {
          metric: {
            metric: newHaving.metric?.metric?.id
          },
          operator: newHaving.operator,
          values: [newHaving.value]
        }
      ],
      'Adding a having already present in the request does not result in duplicate havings'
    );
  });

  test('removeRequestHaving', async function(assert) {
    assert.expect(2);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newHaving = {
        metric: {
          metric: MetadataService.getById('metric', 'pageViews')
        },
        operator: 'gt',
        value: 100
      },
      request = mockModel.get('request');

    request.addHaving(newHaving);
    assert.equal(request.having.length, 1, 'There is one having in the model fragment');

    request.removeRequestHaving(request.get('having').objectAt(0));
    assert.equal(request.having.length, 0, 'There is no having in the model fragment');
  });

  test('removeRequestHavingByMetric', async function(assert) {
    assert.expect(2);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newHaving = {
        metric: {
          metric: MetadataService.getById('metric', 'pageViews')
        },
        operator: 'gt',
        value: 100
      },
      request = mockModel.get('request');

    request.addHaving(newHaving);
    assert.equal(request.having.length, 1, 'There is one having in the model fragment');

    request.removeRequestHavingByMetric(MetadataService.getById('metric', 'pageViews'));
    assert.equal(request.having.length, 0, 'There are no having in the model fragment');
  });

  test('updateHaving', async function(assert) {
    assert.expect(5);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      having = {
        metric: {
          metric: MetadataService.getById('metric', 'pageViews')
        },
        operator: 'gt',
        value: 100
      },
      request = mockModel.get('request');

    request.addHaving(having);

    assert.equal(request.having.length, 1, 'There is one having in the model fragment');

    assert.equal(
      request
        .get('having')
        .objectAt(0)
        .get('operator'),
      'gt',
      'The having has been added successfully to the model fragment'
    );

    assert.equal(
      request
        .get('having')
        .objectAt(0)
        .get('value'),
      100,
      'The having value is correct'
    );

    request.updateHavingForMetric(having.metric.metric, {
      operator: 'gte',
      value: 200
    });

    assert.equal(
      request
        .get('having')
        .objectAt(0)
        .get('operator'),
      'gte',
      'The having operator has been updated successfully in the model fragment'
    );

    assert.equal(
      request
        .get('having')
        .objectAt(0)
        .get('value'),
      200,
      'The filter value have been updated successfully in the model fragment'
    );
  });

  /* == Sort == */

  test('dateTime Sort', async function(assert) {
    assert.expect(3);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newSort = {
        metric: { metric: MetadataService.getById('metric', 'pageViews') },
        direction: 'desc'
      },
      request = mockModel.get('request');

    request.addSort(newSort);
    request.addDateTimeSort('desc');

    assert.equal(request.sort.length, 2, 'There is now one sort in the model fragment');

    assert.deepEqual(
      request
        .get('sort')
        .objectAt(0)
        .get('metric.metric'),
      { id: 'dateTime' },
      'The new dateTime sort has been added to the model fragment as the first object'
    );

    request.updateDateTimeSort({ direction: 'asc' });
    assert.deepEqual(
      request
        .get('sort')
        .objectAt(0)
        .serialize(),
      {
        metric: { metric: 'dateTime' },
        direction: 'asc'
      },
      'The new dateTime sort direction has been updated'
    );
  });

  test('addSorts', async function(assert) {
    assert.expect(4);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newSort = {
        metric: Store.createFragment('bard-request/fragments/metric', {
          metric: MetadataService.getById('metric', 'pageViews')
        }),
        direction: 'desc'
      },
      request = mockModel.get('request');

    request.addSort(newSort);

    assert.equal(request.sort.length, 1, 'There is now one sort in the model fragment');

    assert.equal(
      request
        .get('sort')
        .objectAt(0)
        .get('metric.metric'),
      MetadataService.getById('metric', 'pageViews'),
      'The new sort has been added to the model fragment'
    );

    /* == Test adding existing sort == */
    assert.throws(
      function() {
        request.addSort({
          metric: Store.createFragment('bard-request/fragments/metric', {
            metric: MetadataService.getById('metric', 'pageViews')
          }),
          direction: 'desc'
        });
      },
      /^Error.*Metric: pageViews cannot have multiple sorts on it$/,
      'Sort Fragment throws an error when adding multiple sorts to a single metric'
    );

    assert.deepEqual(
      request.get('sort').map(m => m.serialize()),
      [
        {
          metric: {
            metric: newSort.metric?.metric?.id
          },
          direction: newSort.direction
        }
      ],
      'Adding a sort already present in the request does not result in duplicate sorts'
    );
  });

  test('add Parameterized Sort', async function(assert) {
    assert.expect(5);
    await settled();
    let mockModel = Store.peekRecord('fragments-mock', UNDEFINED_SORT_MODEL),
      newSort = {
        metric: Store.createFragment('bard-request/fragments/metric', {
          metric: MetadataService.getById('metric', 'revenue'),
          parameters: { currency: 'USD' }
        }),
        direction: 'desc'
      },
      request = mockModel.get('request');

    request.addSort(newSort);

    assert.equal(request.sort.length, 1, 'There is now one sort in the model fragment');

    assert.equal(
      request
        .get('sort')
        .objectAt(0)
        .get('metric.metric'),
      MetadataService.getById('metric', 'revenue'),
      'The new sort has been added to the model fragment'
    );

    /* == Test adding existing sort == */
    assert.expectAssertion(
      function() {
        request.addSort({
          metric: Store.createFragment('bard-request/fragments/metric', {
            metric: MetadataService.getById('metric', 'revenue'),
            parameters: { currency: 'USD' }
          }),
          direction: 'desc'
        });
      },
      'Assertion Failed: Metric: revenue(currency=USD) cannot have multiple sorts on it',
      'Sort Fragment throws an error when adding multiple sorts to a single metric'
    );

    assert.deepEqual(
      request
        .get('sort')
        .map(m => m.serialize())
        .toArray(),
      [
        {
          metric: {
            metric: newSort.metric.metric.id,
            parameters: { currency: 'USD' }
          },
          direction: newSort.direction
        }
      ],
      'Adding a sort already present in the request does not result in duplicate sorts'
    );

    set(newSort, 'metric.parameters', { currency: 'CAD' });

    request.addSort(newSort, 'desc');

    let latestSort = request.get('sort').objectAt(1);

    assert.deepEqual(
      latestSort.serialize(),
      {
        metric: {
          metric: newSort.metric.metric.id,
          parameters: { currency: 'CAD' }
        },
        direction: 'desc'
      },
      'Adding a sort with a different parameter loads correctly'
    );
  });

  test('addSort By Metric Name', async function(assert) {
    assert.expect(11);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', UNDEFINED_SORT_MODEL),
      request = mockModel.get('request');

    request.addSortByMetricName('uniqueIdentifier', 'desc');

    assert.equal(request.sort.length, 1, 'There is now one sort in the model fragment');

    let theSort = request.get('sort').objectAt(0);

    assert.equal(theSort.metric.metric.id, 'uniqueIdentifier', 'Copied the right metric');

    assert.equal(theSort.direction, 'desc', 'Goes the right direction');

    assert.expectAssertion(
      function() {
        request.addSortByMetricName('revenue');
      },
      /Metric with canonical name "revenue" was not found in the request/,
      'ambiguous adding of parameterized sorts throws error'
    );

    request.addSortByMetricName('revenue(currency=CAD)');
    request.addSortByMetricName('revenue(currency=USD)', 'desc');

    assert.equal(request.sort.length, 3, 'Adding parameterized metrics should add each metric');

    theSort = request.get('sort').objectAt(1);

    assert.equal(theSort.metric.metric.id, 'revenue', 'Copied the right parameterized CAD metric');

    assert.equal(theSort.metric.parameters.currency, 'CAD', 'Copied the right parameterized CAD metric');

    assert.equal(theSort.direction, 'asc', 'parameterized CAD metric Goes the right direction');

    theSort = request.get('sort').objectAt(2);

    assert.equal(theSort.metric.metric.id, 'revenue', 'Copied the right parameterized USD metric');

    assert.equal(theSort.metric.parameters.currency, 'USD', 'Copied the right parameterized USD metric');

    assert.equal(theSort.direction, 'desc', 'parameterized USD metric Goes the right direction');
  });

  test('removeSort', async function(assert) {
    assert.expect(4);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', UNDEFINED_SORT_MODEL),
      newSort = {
        metric: { metric: MetadataService.getById('metric', 'pageViews') },
        direction: 'desc'
      },
      request = mockModel.get('request');

    request.addSort(newSort);
    assert.equal(request.sort.length, 1, 'There is one sort in the model fragment');

    request.removeSort(request.get('sort').objectAt(0));
    assert.equal(request.sort.length, 0, 'There is no sort in the model fragment');

    let parameterizedSortUSD = {
      metric: {
        metric: MetadataService.getById('metric', 'revenue'),
        parameters: { currency: 'USD' }
      },
      direction: 'asc'
    };

    let parameterizedSortCAD = {
      metric: {
        metric: MetadataService.getById('metric', 'revenue'),
        parameters: { currency: 'CAD' }
      },
      direction: 'asc'
    };

    request.addSort(parameterizedSortUSD);
    request.addSort(parameterizedSortCAD);

    assert.equal(request.sort.length, 2, 'There are two parameterized sorts in the model fragment');

    request.removeSort(request.get('sort').objectAt(0));
    assert.equal(request.sort.length, 1, 'There is one parameterized sort in the model fragment');
  });

  test('removeSortByMetricName', async function(assert) {
    assert.expect(4);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newSort = {
        metric: { metric: MetadataService.getById('metric', 'pageViews') },
        direction: 'desc'
      },
      request = mockModel.get('request');

    request.addSort(newSort);
    assert.equal(request.sort.length, 1, 'There is one sort in the model fragment');

    request.removeSortByMetricName('pageViews');
    assert.equal(request.sort.length, 0, 'There are no sort in the model fragment');

    let parameterizedSortUSD = {
      metric: {
        metric: MetadataService.getById('metric', 'revenue'),
        parameters: { currency: 'USD' }
      },
      direction: 'asc'
    };

    let parameterizedSortCAD = {
      metric: {
        metric: MetadataService.getById('metric', 'revenue'),
        parameters: { currency: 'CAD' }
      },
      direction: 'asc'
    };

    request.addSort(parameterizedSortUSD);
    request.addSort(parameterizedSortCAD);

    assert.equal(request.sort.length, 2, 'There are two parameterized sorts in the model fragment');

    request.removeSortByMetricName('revenue(currency=CAD)');
    assert.equal(request.sort.length, 1, 'There is one parameterized sort in the model fragment');
  });

  test('removeSortMetricWithParam', async function(assert) {
    assert.expect(3);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      revenueMetric = MetadataService.getById('metric', 'revenue'),
      request = mockModel.get('request');

    let parameterizedSortUSD = {
      metric: {
        metric: revenueMetric,
        parameters: { currency: 'USD' }
      },
      direction: 'asc'
    };

    let parameterizedSortCAD = {
      metric: {
        metric: revenueMetric,
        parameters: { currency: 'CAD' }
      },
      direction: 'asc'
    };

    request.addSort(parameterizedSortUSD);
    request.addSort(parameterizedSortCAD);

    assert.equal(request.sort.length, 2, 'There are two parameterized sorts in the model fragment');

    request.removeSortMetricWithParam(revenueMetric, { currency: 'USD' });

    assert.equal(request.sort.length, 1, 'There is one parameterized sort in the model fragment');

    assert.deepEqual(
      request
        .get('sort')
        .objectAt(0)
        .get('metric.parameters'),
      { currency: 'CAD' },
      'Revenue metric with parametrer currency=CAD is not removed from the sort in the model fragment'
    );
  });

  test('removeSortMetricByModel', async function(assert) {
    assert.expect(3);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      revenueMetric = MetadataService.getById('metric', 'revenue'),
      request = mockModel.get('request');

    let pageViewsSort = {
      metric: { metric: MetadataService.getById('metric', 'pageViews') },
      direction: 'desc'
    };

    // add a non-parameterized metric to the sort
    request.addSort(pageViewsSort);

    let parameterizedSortUSD = {
      metric: {
        metric: revenueMetric,
        parameters: { currency: 'USD' }
      },
      direction: 'asc'
    };

    let parameterizedSortCAD = {
      metric: {
        metric: revenueMetric,
        parameters: { currency: 'CAD' }
      },
      direction: 'asc'
    };

    // add two parameterized metrics to the sort
    request.addSort(parameterizedSortUSD);
    request.addSort(parameterizedSortCAD);

    assert.equal(request.sort.length, 3, 'There are three sorts in the model fragment');

    request.removeSortMetricByModel(revenueMetric);

    assert.equal(request.sort.length, 1, 'There is one sort in the model fragment');

    assert.equal(
      request
        .get('sort')
        .objectAt(0)
        .get('metric.metric.id'),
      'pageViews',
      'pageViews metric is not removed from the sort in the model fragment'
    );
  });

  test('updateSort', async function(assert) {
    assert.expect(5);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      sort = {
        metric: Store.createFragment('bard-request/fragments/metric', {
          metric: MetadataService.getById('metric', 'pageViews')
        }),
        direction: 'asc'
      },
      request = mockModel.get('request');

    request.addSort(sort);

    assert.equal(request.sort.length, 1, 'There is one sort in the model fragment');

    assert.equal(
      request
        .get('sort')
        .objectAt(0)
        .get('direction'),
      'asc',
      'The sort has been added successfully to the model fragment with correct direction'
    );

    request.updateSortForMetric(sort.metric, {
      direction: 'desc'
    });

    assert.equal(
      request
        .get('sort')
        .objectAt(0)
        .get('direction'),
      'desc',
      'The sort direction has been updated successfully in the model fragment'
    );

    let parameterizedSortUSD = {
      metric: Store.createFragment('bard-request/fragments/metric', {
        metric: MetadataService.getById('metric', 'revenue'),
        parameters: { currency: 'USD' }
      }),
      direction: 'asc'
    };

    let parameterizedSortCAD = {
      metric: Store.createFragment('bard-request/fragments/metric', {
        metric: MetadataService.getById('metric', 'revenue'),
        parameters: { currency: 'CAD' }
      }),
      direction: 'asc'
    };

    request.addSort(parameterizedSortUSD);
    request.addSort(parameterizedSortCAD);

    request.updateSortForMetric(parameterizedSortUSD.metric, {
      direction: 'desc'
    });

    assert.equal(
      request
        .get('sort')
        .objectAt(1)
        .get('direction'),
      'desc',
      'The sort direction has been updated successfully in the right paramterized model fragment'
    );

    assert.equal(
      request
        .get('sort')
        .objectAt(2)
        .get('direction'),
      'asc',
      'The sort direction is preserved for unmatching canonicalized metric'
    );
  });

  test('Validations', async function(assert) {
    assert.expect(13);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      request = mockModel.get('request');

    request.validate().then(({ validations }) => {
      assert.ok(validations.get('isValid'), 'Request is valid');
      assert.equal(validations.get('messages').length, 0, 'There are no validation errors');
    });

    //setting logicalTable to null
    request.set('logicalTable', null);
    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages').length, 1, 'One Field is invalid in the request model');
      assert.equal(
        validations.get('messages').objectAt(0),
        'Please select a table',
        'Logical Table cannot be empty error is part of the messages'
      );
    });

    //setting response format to empty
    request.set('responseFormat', '');
    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages').length, 2, 'Two Fields are invalid in the request model');
      assert.equal(
        validations.get('messages').objectAt(1),
        'Please select a response format',
        'Response format cannot be empty error is part of the messages'
      );
    });

    //setting metrics to empty
    request.set('metrics', []);

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'), 2, 'Two Fields are invalid in the request model');
    });

    //setting intervals to empty
    request.set('intervals', []);

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'), 3, 'Three Fields are invalid in the request model');
      assert.equal(
        validations.get('messages').objectAt(2),
        'Please select a date range',
        'Intervals missing is part of the messages'
      );
    });
  });

  test('logicalTable belongs-to validation', async function(assert) {
    assert.expect(4);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      request = mockModel.get('request');

    request.set(
      'logicalTable',
      Store.createFragment('bard-request/fragments/logical-table', {
        table: undefined
      })
    );

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'), 2, 'Two Fields are invalid in the request model');
      assert.equal(
        validations.get('messages').objectAt(0),
        'Table is invalid or unavailable',
        'Table is invalid or unavailable is a part of the messages'
      );
      assert.equal(
        validations.get('messages').objectAt(1),
        'The timeGrain field cannot be empty',
        'Time Grain Name cannot be empty is a part of the messages'
      );
    });
  });

  test('dimensions has-many validation', async function(assert) {
    assert.expect(3);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      request = mockModel.get('request');

    request.addDimension({ dimension: undefined });

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'), 1, 'One Field is invalid in the request model');
      assert.equal(
        validations.get('messages').objectAt(0),
        'The dimension field cannot be empty',
        'Dimension cannot be empty is a part of the messages'
      );
    });
  });

  test('filters has-many validation', async function(assert) {
    assert.expect(4);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newFilter = {
        dimension: MetadataService.getById('dimension', 'age'),
        values: []
      },
      request = mockModel.get('request');

    request.addFilter(newFilter);

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'), 2, 'Two Fields are invalid in the request model');

      assert.equal(
        validations.get('messages').objectAt(0),
        'The operator field in the filter cannot be empty',
        'Operator cannot be empty is a part of the messages'
      );

      assert.equal(
        validations.get('messages').objectAt(1),
        'Age filter needs at least one value',
        'Values cannot be empty is a part of the messages'
      );
    });
  });

  test('metrics has-many validation', async function(assert) {
    assert.expect(3);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      request = mockModel.get('request');

    request.addMetric({ metric: undefined });

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'), 1, 'One Field is invalid in the request model');
      assert.equal(
        validations.get('messages').objectAt(0),
        'The metric field cannot be empty',
        'Metric cannot be empty is a part of the messages'
      );
    });
  });

  test('intervals has-many validations', async function(assert) {
    assert.expect(3);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newInterval = new Interval(moment('2015', 'YYYY'), moment('1990', 'YYYY')),
      request = mockModel.get('request');

    request.addInterval(newInterval);

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'), 1, 'An error is given when there are no valid intervals');
      assert.equal(
        validations.get('messages').objectAt(0),
        'The start date should be before end date',
        'Start Date should be before end date is a part of the error messages'
      );
    });
  });

  test('sort has-many validation', async function(assert) {
    assert.expect(3);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newSort = {
        metric: { metric: MetadataService.getById('metric', 'pageViews') }
      },
      request = mockModel.get('request');

    request.addSort(newSort);

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'), 1, 'One of the Field is invalid in the request model');

      assert.equal(
        validations.get('messages').objectAt(0),
        'The direction field in sort cannot be empty',
        'Direction cannot be empty is a part of the messages'
      );
    });
  });

  test('having has-many validation', async function(assert) {
    assert.expect(3);

    await settled();
    let mockModel = Store.peekRecord('fragments-mock', 1),
      newHaving = {
        metric: {
          metric: MetadataService.getById('metric', 'pageViews')
        }
      },
      request = mockModel.get('request');

    request.addHaving(newHaving);

    request.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Request is invalid');
      assert.equal(validations.get('messages.length'), 1, 'One Field is invalid in the request model');

      assert.equal(
        validations.get('messages').objectAt(0),
        'The values field in the having cannot be empty',
        'Values cannot be empty is a part of the messages'
      );
    });
  });
});

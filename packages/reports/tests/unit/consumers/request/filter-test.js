import { A } from '@ember/array';
import { get } from '@ember/object';
import { getOwner } from '@ember/application';
import { moduleFor, test } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import Interval from 'navi-core/utils/classes/interval';
import Moment from 'moment';
import DefaultIntervals from 'navi-reports/utils/enums/default-intervals';

moduleFor('consumer:request/filter', 'Unit | Consumer | request filter', {
  needs: ['consumer:action-consumer', 'service:request-action-dispatcher'],

  beforeEach() {
    // Isolate test to focus on only this consumer
    let requestActionDispatcher = getOwner(this).lookup('service:request-action-dispatcher');
    requestActionDispatcher._registeredConsumers = [];
    requestActionDispatcher.registerConsumer('request/filter');
  }
});

test('UPDATE_FILTER', function(assert) {
  assert.expect(2);

  let filter = { dimension: 'age', operator: 'in', values: [] },
    changeSet = { operator: 'notin', values: [1, 2, 3] };

  this.subject().send(RequestActions.UPDATE_FILTER, { currentModel: null }, filter, changeSet);

  assert.deepEqual(
    filter,
    {
      dimension: 'age',
      operator: 'notin',
      values: [1, 2, 3]
    },
    'Properties in changeSet are added to filter'
  );

  filter = { dimension: 'dateDimension', operator: 'bet', values: [] };
  changeSet = { interval: new Interval(new Moment('2018-10-31'), new Moment('2018-11-10')) };

  this.subject().send(RequestActions.UPDATE_FILTER, { currentModel: null }, filter, changeSet);

  assert.deepEqual(
    filter,
    {
      dimension: 'dateDimension',
      operator: 'bet',
      values: ['2018-10-31/2018-11-10']
    },
    'The interval is set in the values array when the between operator is being used and the interval property is not set'
  );
});

test('UPDATE_FILTER_PARAM', function(assert) {
  assert.expect(1);

  let subject = { metric: 'foo', parameters: { param: 'bar' } },
    filter = { subject, operator: 'in', values: [1, 2, 3] },
    parameter = 'param',
    parameterValue = 'baz';

  this.subject().send(RequestActions.UPDATE_FILTER_PARAM, { currentModel: null }, filter, parameter, parameterValue);

  assert.deepEqual(
    filter,
    {
      subject: { metric: 'foo', parameters: { param: 'baz' } },
      operator: 'in',
      values: [1, 2, 3]
    },
    'the parameter is updated and the rest of the filter remains unchanged'
  );
});

test('REMOVE_FILTER', function(assert) {
  assert.expect(3);

  let filter = { dimension: 'age', operator: 'in', values: [] },
    request = {
      filters: A([filter]),
      intervals: A([1, 2, 3]),
      having: A([123])
    };

  this.subject().send(RequestActions.REMOVE_FILTER, { currentModel: { request } }, filter);
  assert.deepEqual(
    request,
    {
      filters: A([]),
      intervals: A([1, 2, 3]),
      having: A([123])
    },
    'The given filter was removed from any "filter" property that contained it'
  );

  this.subject().send(RequestActions.REMOVE_FILTER, { currentModel: { request } }, 2);
  assert.deepEqual(
    request,
    {
      filters: A([]),
      intervals: A([1, 3]),
      having: A([123])
    },
    'The given filter was removed from any "filter" property that contained it'
  );

  this.subject().send(RequestActions.REMOVE_FILTER, { currentModel: { request } }, 123);
  assert.deepEqual(
    request,
    {
      filters: A([]),
      intervals: A([1, 3]),
      having: A([])
    },
    'The given filter was removed from any "filter" property that contained it'
  );
});

test('TOGGLE_DIM_FILTER', function(assert) {
  assert.expect(2);

  const MockDispatcher = {
    dispatch(action, route, dimension) {
      assert.equal(action, RequestActions.ADD_DIM_FILTER, 'ADD_DIM_FILTER is sent as part of TOGGLE_DIM_FILTER');

      assert.equal(dimension, 'mockDim', 'the filter dimension is passed on to ADD_DIM_FILTER');
    }
  };

  let consumer = this.subject({ requestActionDispatcher: MockDispatcher }),
    currentModel = { request: { filters: A() } };

  consumer.send(RequestActions.TOGGLE_DIM_FILTER, { currentModel }, 'mockDim');
});

test('ADD_DIM_FILTER', function(assert) {
  assert.expect(1);

  let addFilter = filterObj => {
      assert.deepEqual(
        filterObj,
        {
          dimension: { dimension: 'mockDim', primaryKeyFieldName: 'id' },
          field: 'id',
          operator: 'in',
          values: []
        },
        'the filterObj passed to the request to add is well formed'
      );
    },
    currentModel = { request: { filters: A(), addFilter } };

  this.subject().send(
    RequestActions.ADD_DIM_FILTER,
    { currentModel },
    { dimension: 'mockDim', primaryKeyFieldName: 'id' }
  );
});

test('ADD_DIM_FILTER - alternative primary key', function(assert) {
  assert.expect(1);

  let addFilter = filterObj => {
      assert.deepEqual(
        filterObj,
        {
          dimension: { dimension: 'mockDim', primaryKeyFieldName: 'key' },
          field: 'key',
          operator: 'in',
          values: []
        },
        'the filterObj passed to the request has the right field'
      );
    },
    currentModel = { request: { filters: A(), addFilter } };

  this.subject().send(
    RequestActions.ADD_DIM_FILTER,
    { currentModel },
    { dimension: 'mockDim', primaryKeyFieldName: 'key' }
  );
});

test('TOGGLE_METRIC_FILTER', function(assert) {
  assert.expect(2);

  const MockDispatcher = {
    dispatch(action, route, metric) {
      assert.equal(
        action,
        RequestActions.ADD_METRIC_FILTER,
        'ADD_METRIC_FILTER is sent as part of TOGGLE_METRIC_FILTER'
      );

      assert.equal(metric, 'mockMetric', 'the filter metric is passed on to ADD_METRIC_FILTER');
    }
  };

  let consumer = this.subject({ requestActionDispatcher: MockDispatcher }),
    currentModel = { request: { having: A() } };

  consumer.send(RequestActions.TOGGLE_METRIC_FILTER, { currentModel }, 'mockMetric');
});

test('ADD_METRIC_FILTER', function(assert) {
  assert.expect(1);

  let addHaving = filterObj => {
      assert.deepEqual(
        filterObj,
        {
          metric: { metric: 'mockMetric' },
          operator: 'gt',
          values: 0
        },
        'the filterObj passed to the request to addHaving is well formed'
      );
    },
    currentModel = { request: { having: A(), addHaving } };

  this.subject().send(RequestActions.ADD_METRIC_FILTER, { currentModel }, 'mockMetric');
});

test('ADD_METRIC_FILTER - with parameters', function(assert) {
  assert.expect(1);

  let parameters = { foo: 'bar' },
    addHaving = filterObj => {
      assert.deepEqual(
        filterObj,
        {
          metric: { metric: 'mockMetric', parameters },
          operator: 'gt',
          values: 0
        },
        'the filterObj passed to the request to addHaving is well formed'
      );
    },
    currentModel = { request: { having: A(), addHaving } };

  this.subject().send(RequestActions.ADD_METRIC_FILTER, { currentModel }, 'mockMetric', parameters);
});

test('REMOVE_METRIC', function(assert) {
  assert.expect(3);

  const AdClicks = { name: 'adClicks', getDefaultParameters: () => ({}) },
    PageViews = { name: 'pageViews', getDefaultParameters: () => ({}) },
    TimeSpent = { name: 'timeSpent', getDefaultParameters: () => ({}) };

  let currentModel = {
      request: {
        intervals: A(),
        filters: A(),
        having: A(),
        addHaving(having) {
          let metric = having.metric;
          metric.canonicalName = metric.name;
          this.having.pushObject(having);
        }
      }
    },
    consumer = this.subject();

  consumer.send(RequestActions.TOGGLE_METRIC_FILTER, { currentModel }, AdClicks);
  consumer.send(RequestActions.TOGGLE_METRIC_FILTER, { currentModel }, PageViews);

  assert.deepEqual(
    get(currentModel, 'request.having').mapBy('metric.metric.name'),
    ['adClicks', 'pageViews'],
    'Havings starts with two metric filters'
  );

  /* == Remove a metric that isn't a having == */
  consumer.send(RequestActions.REMOVE_METRIC, { currentModel }, TimeSpent);
  assert.deepEqual(
    get(currentModel, 'request.having').mapBy('metric.metric.name'),
    ['adClicks', 'pageViews'],
    'When removing a metric that is not filtered on, the having array is unchanged'
  );

  /* == Remove a metric that is also a having == */
  consumer.send(RequestActions.REMOVE_METRIC, { currentModel }, AdClicks);
  assert.deepEqual(
    get(currentModel, 'request.having').mapBy('metric.metric.name'),
    ['pageViews'],
    'When removing a metric that is filtered on, the corresponding having is removed'
  );
});

test('REMOVE_METRIC - multiple of same base metric', function(assert) {
  assert.expect(2);

  const AdClicks = { name: 'adClicks', getDefaultParameters: () => ({}) };

  let currentModel = {
      request: {
        intervals: A(),
        filters: A(),
        having: A(),
        addHaving(having) {
          let metric = having.metric;
          metric.canonicalName = metric.parameters.foo;
          this.having.pushObject(having);
        }
      }
    },
    consumer = this.subject();

  consumer.send(RequestActions.TOGGLE_PARAMETERIZED_METRIC_FILTER, { currentModel }, AdClicks, { foo: 'bar' });
  consumer.send(RequestActions.TOGGLE_PARAMETERIZED_METRIC_FILTER, { currentModel }, AdClicks, { foo: 'baz' });

  assert.deepEqual(
    get(currentModel, 'request.having').mapBy('metric.canonicalName'),
    ['bar', 'baz'],
    'Havings starts with two metric filters with the same base, but different parameter set'
  );

  /* == Remove a metric that is also a having == */
  consumer.send(RequestActions.REMOVE_METRIC, { currentModel }, AdClicks);
  assert.ok(
    get(currentModel, 'request.having').length === 0,
    'When removing a metric, all havings for that metric is removed'
  );
});

test('DID_UPDATE_TIME_GRAIN', function(assert) {
  assert.expect(2);

  const Age = { name: 'age' },
    Gender = { name: 'gender' },
    Device = { name: 'device' };

  let currentModel = {
      request: {
        intervals: A([{}]),
        filters: A([{ dimension: Age }, { dimension: Gender }]),
        having: A()
      }
    },
    newTimeGrain = {
      name: 'day',
      dimensions: [Age, Device]
    };

  this.subject().send(RequestActions.DID_UPDATE_TIME_GRAIN, { currentModel }, newTimeGrain);

  assert.ok(
    get(currentModel, 'request.intervals.firstObject.interval').isEqual(DefaultIntervals.getDefault(newTimeGrain.name)),
    'After time grain change, interval filter is set to default for new time grain'
  );

  assert.deepEqual(
    currentModel.request.filters.toArray(),
    [{ dimension: Age }],
    'Filter based on dimension that is not in new time grain is removed'
  );
});

test('TOGGLE_PARAMETERIZED_METRIC_FILTER - add metric', function(assert) {
  assert.expect(3);

  let parameters = { foo: 'bar' };

  const MockDispatcher = {
    dispatch(action, route, metric, params) {
      assert.equal(
        action,
        RequestActions.ADD_METRIC_FILTER,
        'ADD_METRIC_FILTER is sent as part of TOGGLE_METRIC_FILTER'
      );

      assert.equal(metric, 'mockMetric', 'the filter metric is passed on to ADD_METRIC_FILTER');

      assert.deepEqual(params, parameters, 'the filter metric parameters are passed on to ADD_METRIC_FILTER');
    }
  };

  let consumer = this.subject({ requestActionDispatcher: MockDispatcher }),
    currentModel = { request: { having: A() } };

  consumer.send(RequestActions.TOGGLE_PARAMETERIZED_METRIC_FILTER, { currentModel }, 'mockMetric', parameters);
});

test('TOGGLE_PARAMETERIZED_METRIC_FILTER - remove metric', function(assert) {
  assert.expect(3);

  let parameters = { foo: 'bar' },
    metricWParam = { name: 'metric-with-param' },
    havings = [
      {
        metric: {
          metric: metricWParam,
          canonicalName: 'metric-with-param(foo=bar)',
          parameters
        }
      }
    ];

  const MockDispatcher = {
    dispatch(action, route, having) {
      assert.equal(action, RequestActions.REMOVE_FILTER, 'REMOVE_FILTER is sent as part of TOGGLE_METRIC_FILTER');

      assert.deepEqual(having.metric.metric, metricWParam, 'the filter metric is passed on to ADD_METRIC_FILTER');

      assert.deepEqual(
        having.metric.parameters,
        parameters,
        'the filter metric parameters are passed on to ADD_METRIC_FILTER'
      );
    }
  };

  let consumer = this.subject({ requestActionDispatcher: MockDispatcher }),
    currentModel = { request: { having: A(havings) } };

  consumer.send(RequestActions.TOGGLE_PARAMETERIZED_METRIC_FILTER, { currentModel }, metricWParam, parameters);
});

import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';

const { get, getOwner } = Ember;

moduleFor('consumer:request/sort', 'Unit | Consumer | request sort', {
  needs: [ 'consumer:action-consumer', 'service:request-action-dispatcher' ],

  beforeEach() {
    // Isolate test to focus on only this consumer
    let requestActionDispatcher = getOwner(this).lookup('service:request-action-dispatcher');
    requestActionDispatcher._registeredConsumers = [];
    requestActionDispatcher.registerConsumer('request/sort');
  }
});

test('UPSERT_SORT', function(assert) {
  assert.expect(3);

  const addDateTimeSort = (direction) => {
    assert.equal(direction,
      'desc',
      'dateTimeSort is added when not present in the request');
  };

  const addSortByMetricName = (metricName, direction) => {
    assert.deepEqual([metricName, direction],
      ['click', 'desc'],
      'metricSort is added when not present in the request');
  };

  let currentModel = { request: {
        sort: Ember.A([]),
        addDateTimeSort,
        addSortByMetricName
      }},
      consumer = this.subject();

  consumer.send(RequestActions.UPSERT_SORT, { currentModel }, 'dateTime', 'desc');
  consumer.send(RequestActions.UPSERT_SORT, { currentModel }, 'click', 'desc');

  currentModel.request.sort = Ember.A([Ember.Object.create({metric: {metric: {name: 'dateTime'}, canonicalName: 'dateTime'}})]);
  consumer.send(RequestActions.UPSERT_SORT, { currentModel }, 'dateTime', 'desc');
  assert.equal(currentModel.request.sort[0].direction,
    'desc',
    'sort direction is updated');
});

test('REMOVE_SORT', function(assert) {
  assert.expect(1);

  const removeSortByMetricName = (metric) => {
    assert.equal(metric,
      'click',
      'metricSort is removed from the request');
  };

  let currentModel = { request: {
        removeSortByMetricName
      }},
      consumer = this.subject();

  consumer.send(RequestActions.REMOVE_SORT, { currentModel }, 'click', 'desc');
});

test('REMOVE_METRIC', function(assert) {
  assert.expect(3);

  const AdClicks = { name: 'adClicks' },
        TimeSpent = { name: 'timeSpent' },
        consumer = this.subject();

  let currentModel = { request: {
    sort: Ember.A(),
    addSortByMetricName(metric) { this.sort.pushObject({ metric: { name: metric }, direction: 'desc' }); },
    removeSortByMetricName(metricName) {
      let sortObj = this.sort.findBy('metric.name', metricName);
      this.sort.removeObject(sortObj);
    }
  }};

  /* == Add sort for testing == */
  consumer.send(RequestActions.UPSERT_SORT, { currentModel }, 'adClicks', 'desc');

  assert.deepEqual(get(currentModel, 'request.sort').mapBy('metric.name'),
    [ 'adClicks' ],
    'Request initially contains one metric sort');

  /* == Remove a metric that isn't sorted == */
  consumer.send(RequestActions.REMOVE_METRIC, { currentModel }, TimeSpent);
  assert.deepEqual(get(currentModel, 'request.sort').mapBy('metric.name'),
    [ 'adClicks' ],
    'When removing a metric that is not sorted, the sort array is unchanged');

  /* == Remove a metric that is sorted == */
  consumer.send(RequestActions.REMOVE_METRIC, { currentModel }, AdClicks);
  assert.equal(get(currentModel, 'request.sort.length'),
    0,
    'When removing a metric that is already sorted, the corresponding sort is removed');
});

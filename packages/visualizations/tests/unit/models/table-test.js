import { moduleForModel, test } from 'ember-qunit';
import Ember from 'ember';

const { set, run, String: { classify } } = Ember;

moduleForModel('all-the-fragments', 'Unit | Model | Table Visualization Fragment', {
  needs: [
    'transform:fragment',
    'model:table'
  ]
});

test('default value', function(assert) {
  assert.expect(1);

  let metricsAndDims = [ ['d1', 'd2'], ['m1', 'm2'] ],
      table = run(() => this.subject().get('table'));

  assert.ok(!table.isValidForRequest(
    buildTestRequest(...metricsAndDims)
  ), 'the default table fragment values are invalid');
});

test('valid and invalid table fragment', function(assert) {
  assert.expect(4);

  let dimsMetricsAndThresholds = [ ['d1', 'd2'], ['m1', 'm2'], [ 't1' ] ],
      request = buildTestRequest(...dimsMetricsAndThresholds),
      model = this.subject();

  run(() => {
    set(model, 'table', buildTestConfig(...dimsMetricsAndThresholds));
  });

  assert.ok(model.get('table').isValidForRequest(request),
    'a table fragment with the same metrics and dimensions as the request is valid');

  run(() => {
    set(model, 'table', buildTestConfig(['d1', 'foo'], ['m1', 'm2']));
  });

  assert.ok(!model.get('table').isValidForRequest(request),
    'a table fragment with mis-match dimensions is invalid');

  run(() => {
    set(model, 'table', buildTestConfig(['d1', 'd2'], ['m1', 'foo']));
  });

  assert.ok(!model.get('table').isValidForRequest(request),
    'a table fragment with mis-match metrics is invalid');

  run(() => {
    set(model, 'table', buildTestConfig(['d1', 'd2'], ['m1', 'm2', 'm3'],  ['t1']));
  });

  assert.ok(!model.get('table').isValidForRequest(request),
    'a table columns with more metrics than in the request is invalid');
});


test('rebuildConfig', function(assert) {
  assert.expect(3);

  let table    = run(() => this.subject().get('table')),
      request1 = buildTestRequest(['d1', 'd2'],['m1', 'm2']),
      config1  = run(() => table.rebuildConfig(request1).toJSON());

  assert.deepEqual(config1, {
    'type': 'table',
    'version': 1,
    'metadata': {
      'columns': [
        { 'displayName': 'Date', 'field': 'dateTime', 'type': 'dateTime' },
        { 'displayName': 'D1', 'field': 'd1', 'type': 'dimension' },
        { 'displayName': 'D2', 'field': 'd2', 'type': 'dimension' },
        { 'displayName': 'M1', 'field': 'm1', 'type': 'metric' },
        { 'displayName': 'M2', 'field': 'm2', 'type': 'metric' }
      ]
    }
  }, 'Date, dimensions, and metrics from request are serialized into columns');

  let request2 = buildTestRequest([], ['m1', 'm2']),
      config2  = run(() => table.rebuildConfig(request2).toJSON());

  assert.deepEqual(config2, {
    'type': 'table',
    'version': 1,
    'metadata': {
      'columns': [
        { 'displayName': 'Date', 'field': 'dateTime', 'type': 'dateTime' },
        { 'displayName': 'M1', 'field': 'm1', 'type': 'metric' },
        { 'displayName': 'M2', 'field': 'm2', 'type': 'metric' }
      ]
    }
  },'Dimension column is not required');

  let request3 = buildTestRequest([], ['m1', 'm2']);
  request3.metrics[0].metric.category = 'Clicks,Trend';

  let config3 = run(() => table.rebuildConfig(request3).toJSON());

  assert.deepEqual(config3, {
    'type': 'table',
    'version': 1,
    'metadata': {
      'columns': [
        { 'displayName': 'Date', 'field': 'dateTime', 'type': 'dateTime' },
        { 'displayName': 'M1', 'field': 'm1', 'type': 'threshold' },
        { 'displayName': 'M2', 'field': 'm2', 'type': 'metric' }
      ]
    }
  }, 'Trend metrics use threshold column');
});

/**
 * @function buildTestConfig
 * @param {Array} dimensions - array of dimensions
 * @param {Array} metrics - array of metrics
 * @param {Array} thresholds - array of thresholds
 * @returns {Object} config object
 */
function buildTestConfig(dimensions=[], metrics=[], thresholds=[]) {
  let columns = [
    { field: 'dateTime', type: 'dateTime' },
    ...metrics.map(m => {
      return { field: m, type: 'metric', valueType: 'number' };
    }),
    ...thresholds.map(t => {
      return { field: t, type: 'threshold' };
    }),
    ...dimensions.map(d => {
      return { field: d, type: 'dimension' };
    }),
  ];
  return  {
    metadata: {
      columns
    }
  };
}

/**
 * @function buildTestRequest
 * @param {Array} dimensions - array of dimensions
 * @param {Array} metrics - array of metrics
 * @param {Array} thresholds - array of thresholds
 * @returns {Object} request object
 */
function buildTestRequest(dimensions=[], metrics=[], thresholds=[]) {
  return {
    metrics: [ ...metrics, ...thresholds].map( m => {
      return { metric: { name: m, longName: classify(m), category: 'category', valueType: 'number'} };
    }),
    dimensions: dimensions.map(d => {
      return { dimension: { name: d, longName: classify(d) } };
    }),
  };
}

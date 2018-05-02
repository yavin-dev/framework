import { moduleForModel, test } from 'ember-qunit';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import Ember from 'ember';

const { get, set, isPresent, run, String: { classify } } = Ember;

moduleForModel('all-the-fragments', 'Unit | Model | Table Visualization Fragment', {
  needs: [
    'transform:fragment',
    'model:table'
  ]
});

test('default value', function(assert) {
  assert.expect(1);

  let metricsAndDims = [ ['d1', 'd2'], [{metric: 'm1'}, {metric: 'm2'}] ],
      table = run(() => this.subject().get('table'));

  assert.ok(!table.isValidForRequest(
    buildTestRequest(...metricsAndDims)
  ), 'the default table fragment values are invalid');
});

test('valid and invalid table fragment', function(assert) {
  assert.expect(4);

  let dimsMetricsAndThresholds = [ ['d1', 'd2'], [{metric: 'm1'}, {metric: 'm2'}], [{metric: 't1'}] ],
      request = buildTestRequest(...dimsMetricsAndThresholds),
      model = this.subject();

  run(() => {
    set(model, 'table', buildTestConfig(...dimsMetricsAndThresholds));
  });

  assert.ok(model.get('table').isValidForRequest(request),
    'a table fragment with the same metrics and dimensions as the request is valid');

  run(() => {
    set(model, 'table', buildTestConfig(['d1', 'foo'], [{metric: 'm1'}, {metric: 'm2'}]));
  });

  assert.ok(!model.get('table').isValidForRequest(request),
    'a table fragment with mis-match dimensions is invalid');

  run(() => {
    set(model, 'table', buildTestConfig(['d1', 'd2'], [{metric: 'm1'}, {metric: 'foo'}]));
  });

  assert.ok(!model.get('table').isValidForRequest(request),
    'a table fragment with mis-match metrics is invalid');

  run(() => {
    set(model, 'table', buildTestConfig(['d1', 'd2'], [{metric: 'm1'}, {metric: 'm2'}, {metric: 'm3'}],  ['t1']));
  });

  assert.ok(!model.get('table').isValidForRequest(request),
    'a table columns with more metrics than in the request is invalid');
});


test('rebuildConfig', function(assert) {
  assert.expect(3);

  let table    = run(() => this.subject().get('table')),
      request1 = buildTestRequest(['d1', 'd2'],[{metric: 'm1'}, {metric: 'm2'}]),
      config1  = run(() => table.rebuildConfig(request1).toJSON());

  assert.deepEqual(config1, {
    'type': 'table',
    'version': 1,
    'metadata': {
      'columns': [
        { 'displayName': 'Date', 'field': { dateTime: 'dateTime' }, 'type': 'dateTime' },
        { 'displayName': 'D1', 'field': {dimension: 'd1'}, 'type': 'dimension' },
        { 'displayName': 'D2', 'field': {dimension: 'd2'}, 'type': 'dimension' },
        { 'displayName': 'M1', 'field': {metric: 'm1', parameters: {}}, 'type': 'metric' },
        { 'displayName': 'M2', 'field': {metric: 'm2', parameters: {}}, 'type': 'metric' }
      ]
    }
  }, 'Date, dimensions, and metrics from request are serialized into columns');

  let request2 = buildTestRequest([], [{metric: 'm1'}, {metric: 'm2'}]),
      config2  = run(() => table.rebuildConfig(request2).toJSON());

  assert.deepEqual(config2, {
    'type': 'table',
    'version': 1,
    'metadata': {
      'columns': [
        { 'displayName': 'Date', 'field': { dateTime: 'dateTime' }, 'type': 'dateTime' },
        { 'displayName': 'M1', 'field': {metric: 'm1', parameters: {}}, 'type': 'metric' },
        { 'displayName': 'M2', 'field': {metric: 'm2', parameters: {}}, 'type': 'metric' }
      ]
    }
  },'Dimension column is not required');

  let request3 = buildTestRequest([], [{metric: 'm1'}, {metric: 'm2'}]);
  request3.metrics[0].metric.category = 'Clicks,Trend';

  let config3 = run(() => table.rebuildConfig(request3).toJSON());

  assert.deepEqual(config3, {
    'type': 'table',
    'version': 1,
    'metadata': {
      'columns': [
        { 'displayName': 'Date', 'field': { dateTime: 'dateTime' }, 'type': 'dateTime' },
        { 'displayName': 'M1', 'field': {metric: 'm1', parameters: {}}, 'type': 'threshold' },
        { 'displayName': 'M2', 'field': {metric: 'm2', parameters: {}}, 'type': 'metric' }
      ]
    }
  }, 'Trend metrics use threshold column');
});

test('rebuildConfig with parameterized metrics', function(assert) {
  assert.expect(1);
  let table    = run(() => this.subject().get('table')),
      request4 = buildTestRequest([], [
        {
          metric: 'm1',
          parameters: {
            param1: 'paramVal1'
          }
        },
        { metric: 'm2' }
      ]),
      config4 = run(() => table.rebuildConfig(request4).toJSON());

  assert.deepEqual(config4, {
    'type': 'table',
    'version': 1,
    'metadata': {
      'columns': [
        { 'displayName': 'Date', 'field': { dateTime: 'dateTime' }, 'type': 'dateTime' },
        { 'displayName': 'M1 (paramVal1)', 'field': {metric: 'm1', parameters: {param1: 'paramVal1'}}, 'type': 'metric' },
        { 'displayName': 'M2', 'field': {metric: 'm2', parameters: {}}, 'type': 'metric' }
      ]
    }
  },'Columns with parameterized metrics are formatted correctly');
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
    { field: {dateTime: 'dateTime'}, type: 'dateTime' },
    ...metrics.map(m => {
      let metricName = get(m, 'metric'),
          parameters = get(m, 'parameters') || {},
          valueType = isPresent(parameters) && get(parameters, 'currency') ?  'money' : 'number';
      return { field: {metric: metricName, parameters}, type: 'metric', valueType };
    }),
    ...thresholds.map(t => {
      let metricName = get(t, 'metric'),
          parameters = get(t, 'parameters') || {};
      return { field: {metric: metricName, parameters}, type: 'threshold' };
    }),
    ...dimensions.map(d => {
      return { field: {dimension: d}, type: 'dimension' };
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
      let metricName = get(m, 'metric'),
          parameters = get(m, 'parameters') || {},
          canonicalName = canonicalizeMetric({ metric: metricName, parameters});

      return {
        metric: {
          name: metricName,
          longName: classify(metricName),
          category: 'category',
          valueType: 'number'
        },
        parameters,
        canonicalName,
        toJSON() {
          return {
            metric: metricName,
            parameters
          };
        }
      };
    }),
    dimensions: dimensions.map(d => {
      return { dimension: { name: d, longName: classify(d) } };
    }),
  };
}

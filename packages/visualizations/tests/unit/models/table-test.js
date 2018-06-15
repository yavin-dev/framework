import { moduleForModel, test } from 'ember-qunit';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import Ember from 'ember';
import { indexColumnById } from 'navi-visualizations/models/table';

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
  assert.expect(4);

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
        { 'displayName': 'M1', 'field': { metric: 'm1', parameters: {} }, 'type': 'metric', format: '' },
        { 'displayName': 'M2', 'field': { metric: 'm2', parameters: {} }, 'type': 'metric', format: '' }
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
        { 'displayName': 'M1', 'field': { metric: 'm1', parameters: {} }, 'type': 'metric', format: '' },
        { 'displayName': 'M2', 'field': { metric: 'm2', parameters: {} }, 'type': 'metric', format: '' }
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
        { 'displayName': 'M1', 'field': { metric: 'm1', parameters: {} }, 'type': 'threshold', format: '' },
        { 'displayName': 'M2', 'field': { metric: 'm2', parameters: {} }, 'type': 'metric', format: '' }
      ]
    }
  }, 'Trend metrics use threshold column');

  config3.metadata.columns[1].displayName = 'M4';
  config3.metadata.columns[2].format = 'number';
  let config4 = run(() => table.rebuildConfig(request3).toJSON());

  assert.deepEqual(config4, {
    'type': 'table',
    'version': 1,
    'metadata': {
      'columns': [
        { 'displayName': 'Date', 'field': { dateTime: 'dateTime' }, 'type': 'dateTime' },
        { 'displayName': 'M4', 'field': { metric: 'm1', parameters: {} }, 'type': 'threshold', format: '' },
        { 'displayName': 'M2', 'field': { metric: 'm2', parameters: {} }, 'type': 'metric', format: 'number' }
      ]
    }
  }, 'Columns config should be persistent');
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
        { 'displayName': 'M1 (paramVal1)', 'field': { metric: 'm1', parameters: { param1: 'paramVal1' } }, 'type': 'metric', format: '' },
        { 'displayName': 'M2', 'field': { metric: 'm2', parameters: {} }, 'type': 'metric', format: '' }
      ]
    }
  },'Columns with parameterized metrics are formatted correctly');
});

test('index column by id', function(assert) {
  assert.expect(1);

  let columnA = {
        type: 'metric',
        field: {
          metric: 'A'
        }
      },
      columnB = {
        type: 'threshold',
        field: {
          metric: 'B'
        }
      },
      rows = [columnA, columnB];

  assert.deepEqual(
    indexColumnById(rows),
    {
      A: columnA,
      B: columnB
    },
    'Should return object having metricId as key column as value'
  );
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

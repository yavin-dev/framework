import { moduleForModel, test } from 'ember-qunit';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import Ember from 'ember';
import { indexColumnById } from 'navi-core/models/table';

const {
  get,
  set,
  isPresent,
  run,
  String: { classify }
} = Ember;

moduleForModel('all-the-fragments', 'Unit | Model | Table Visualization Fragment', {
  needs: ['transform:fragment', 'model:table']
});

test('default value', function(assert) {
  assert.expect(1);

  let metricsAndDims = [[{ dimension: 'd1' }, { dimension: 'd2' }], [{ metric: 'm1' }, { metric: 'm2' }]],
    table = run(() => this.subject().get('table'));

  assert.ok(
    !table.isValidForRequest(buildTestRequest(...metricsAndDims)),
    'the default table fragment values are invalid'
  );
});

test('valid and invalid table fragment', function(assert) {
  assert.expect(9);

  let dimsMetricsAndThresholds = [
      [
        { dimension: 'd1' },
        {
          dimension: 'd2',
          fields: ['id', 'desc']
        }
      ],
      [{ metric: 'm1' }, { metric: 'm2' }],
      [{ metric: 't1' }]
    ],
    request = buildTestRequest(...dimsMetricsAndThresholds),
    model = this.subject();

  run(() => {
    set(
      model,
      'table',
      buildTestConfig(
        [{ dimension: 'd1' }, { dimension: 'd2', field: 'id' }, { dimension: 'd2', field: 'desc' }],
        [{ metric: 'm1' }, { metric: 'm2' }],
        [{ metric: 't1' }]
      )
    );
  });

  assert.ok(
    model.get('table').isValidForRequest(request),
    'a table fragment with the same metrics and dimensions as the request is valid'
  );

  run(() => {
    set(
      model,
      'table',
      buildTestConfig(
        [{ dimension: 'd1' }, { dimension: 'foo' }],
        [{ metric: 'm1' }, { metric: 'm2' }],
        [{ metric: 't1' }]
      )
    );
  });

  assert.ok(!model.get('table').isValidForRequest(request), 'a table fragment with mis-match dimensions is invalid');

  run(() => {
    set(
      model,
      'table',
      buildTestConfig(
        [{ dimension: 'd2', field: 'id' }, { dimension: 'd2', field: 'desc' }],
        [{ metric: 'm1' }, { metric: 'm2' }],
        [{ metric: 't1' }]
      )
    );
  });

  assert.ok(!model.get('table').isValidForRequest(request), 'a table fragment with a missing dimension is invalid');

  run(() => {
    set(
      model,
      'table',
      buildTestConfig(
        [{ dimension: 'd1' }, { dimension: 'd2' }],
        [{ metric: 'm1' }, { metric: 'm2' }],
        [{ metric: 't1' }]
      )
    );
  });

  assert.ok(!model.get('table').isValidForRequest(request), 'a table fragment with no dimension fields is invalid');

  run(() => {
    set(
      model,
      'table',
      buildTestConfig(
        [{ dimension: 'd1' }, { dimension: 'd2', field: 'id' }],
        [{ metric: 'm1' }, { metric: 'm2' }],
        [{ metric: 't1' }]
      )
    );
  });

  assert.ok(
    !model.get('table').isValidForRequest(request),
    'a table fragment with missing dimension fields is invalid'
  );

  run(() => {
    set(
      model,
      'table',
      buildTestConfig(
        [{ dimension: 'd1' }, { dimension: 'd2', field: 'id' }, { dimension: 'd2', field: 'foo' }],
        [{ metric: 'm1' }, { metric: 'm2' }],
        [{ metric: 't1' }]
      )
    );
  });

  assert.ok(
    !model.get('table').isValidForRequest(request),
    'a table fragment with mis-match dimension fields is invalid'
  );

  run(() => {
    set(
      model,
      'table',
      buildTestConfig(
        [{ dimension: 'd1' }, { dimension: 'd2', field: 'id' }, { dimension: 'd2', field: 'desc' }],
        [{ metric: 'm1' }],
        [{ metric: 't1' }]
      )
    );
  });

  assert.ok(!model.get('table').isValidForRequest(request), 'a table fragment with missing metrics is invalid');

  run(() => {
    set(
      model,
      'table',
      buildTestConfig(
        [{ dimension: 'd1' }, { dimension: 'd2', field: 'id' }, { dimension: 'd2', field: 'foo' }],
        [{ metric: 'm1' }, { metric: 'foo' }],
        [{ metric: 't1' }]
      )
    );
  });

  assert.ok(!model.get('table').isValidForRequest(request), 'a table fragment with mis-match metrics is invalid');

  run(() => {
    set(
      model,
      'table',
      buildTestConfig(
        [{ dimension: 'd1' }, { dimension: 'd2', field: 'id' }, { dimension: 'd2', field: 'foo' }],
        [{ metric: 'm1' }, { metric: 'm2' }, { metric: 'm3' }],
        [{ metric: 't1' }]
      )
    );
  });

  assert.ok(
    !model.get('table').isValidForRequest(request),
    'a table columns with more metrics than in the request is invalid'
  );
});

test('rebuildConfig', function(assert) {
  assert.expect(4);

  let table = run(() => this.subject().get('table')),
    request1 = buildTestRequest(
      [
        { dimension: 'd1' },
        {
          dimension: 'd2',
          fields: ['id', 'desc']
        }
      ],
      [{ metric: 'm1' }, { metric: 'm2' }]
    ),
    config1 = run(() => table.rebuildConfig(request1).toJSON());

  assert.deepEqual(
    config1,
    {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          {
            displayName: 'Date',
            field: { dateTime: 'dateTime' },
            type: 'dateTime'
          },
          { displayName: 'D1', field: { dimension: 'd1' }, type: 'dimension' },
          { displayName: 'D2 (id)', field: { dimension: 'd2', field: 'id' }, type: 'dimension' },
          { displayName: 'D2 (desc)', field: { dimension: 'd2', field: 'desc' }, type: 'dimension' },
          {
            displayName: 'M1',
            field: { metric: 'm1', parameters: {} },
            type: 'metric',
            format: ''
          },
          {
            displayName: 'M2',
            field: { metric: 'm2', parameters: {} },
            type: 'metric',
            format: ''
          }
        ]
      }
    },
    'Date, dimensions, and metrics from request are serialized into columns'
  );

  let request2 = buildTestRequest([], [{ metric: 'm1' }, { metric: 'm2' }]),
    config2 = run(() => table.rebuildConfig(request2).toJSON());

  assert.deepEqual(
    config2,
    {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          {
            displayName: 'Date',
            field: { dateTime: 'dateTime' },
            type: 'dateTime'
          },
          {
            displayName: 'M1',
            field: { metric: 'm1', parameters: {} },
            type: 'metric',
            format: ''
          },
          {
            displayName: 'M2',
            field: { metric: 'm2', parameters: {} },
            type: 'metric',
            format: ''
          }
        ]
      }
    },
    'Dimension column is not required'
  );

  let request3 = buildTestRequest([], [{ metric: 'm1' }, { metric: 'm2' }]);
  request3.metrics[0].metric.category = 'Clicks,Trend';

  let config3 = run(() => table.rebuildConfig(request3).toJSON());

  assert.deepEqual(
    config3,
    {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          {
            displayName: 'Date',
            field: { dateTime: 'dateTime' },
            type: 'dateTime'
          },
          {
            displayName: 'M1',
            field: { metric: 'm1', parameters: {} },
            type: 'threshold',
            format: ''
          },
          {
            displayName: 'M2',
            field: { metric: 'm2', parameters: {} },
            type: 'metric',
            format: ''
          }
        ]
      }
    },
    'Trend metrics use threshold column'
  );

  config3.metadata.columns[1].displayName = 'M4';
  config3.metadata.columns[2].format = 'number';
  let config4 = run(() => table.rebuildConfig(request3).toJSON());

  assert.deepEqual(
    config4,
    {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          {
            displayName: 'Date',
            field: { dateTime: 'dateTime' },
            type: 'dateTime'
          },
          {
            displayName: 'M4',
            field: { metric: 'm1', parameters: {} },
            type: 'threshold',
            format: ''
          },
          {
            displayName: 'M2',
            field: { metric: 'm2', parameters: {} },
            type: 'metric',
            format: 'number'
          }
        ]
      }
    },
    'Columns config should be persistent'
  );
});

test('rebuildConfig with parameterized metrics', function(assert) {
  assert.expect(2);
  let table = run(() => this.subject().get('table')),
    request4 = buildTestRequest(
      [],
      [
        {
          metric: 'm1',
          parameters: {
            param1: 'paramVal1'
          }
        },
        {
          metric: 'm1',
          parameters: {
            param1: 'paramVal2'
          }
        },
        { metric: 'm2' }
      ]
    ),
    config4 = run(() => table.rebuildConfig(request4).toJSON());

  assert.deepEqual(
    config4,
    {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          {
            displayName: 'Date',
            field: { dateTime: 'dateTime' },
            type: 'dateTime'
          },
          {
            displayName: 'M1 (paramVal1)',
            field: { metric: 'm1', parameters: { param1: 'paramVal1' } },
            type: 'metric',
            format: ''
          },
          {
            displayName: 'M1 (paramVal2)',
            field: { metric: 'm1', parameters: { param1: 'paramVal2' } },
            type: 'metric',
            format: ''
          },
          {
            displayName: 'M2',
            field: { metric: 'm2', parameters: {} },
            type: 'metric',
            format: ''
          }
        ]
      }
    },
    'Columns with parameterized metrics are formatted correctly'
  );

  let config5 = run(() => table.rebuildConfig(request4).toJSON());
  assert.deepEqual(
    config5,
    {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          {
            displayName: 'Date',
            field: { dateTime: 'dateTime' },
            type: 'dateTime'
          },
          {
            displayName: 'M1 (paramVal1)',
            field: { metric: 'm1', parameters: { param1: 'paramVal1' } },
            type: 'metric',
            format: ''
          },
          {
            displayName: 'M1 (paramVal2)',
            field: { metric: 'm1', parameters: { param1: 'paramVal2' } },
            type: 'metric',
            format: ''
          },
          {
            displayName: 'M2',
            field: { metric: 'm2', parameters: {} },
            type: 'metric',
            format: ''
          }
        ]
      }
    },
    'Rebuilding again provides consistent results'
  );
});

test('index column by id', function(assert) {
  assert.expect(1);

  let dimensionColumn = {
      type: 'dimension',
      field: {
        dimension: 'D1'
      }
    },
    dimensionColumnWithField = {
      type: 'dimension',
      field: {
        dimension: 'D2',
        field: 'desc'
      }
    },
    metricColumn = {
      type: 'metric',
      field: {
        metric: 'M'
      }
    },
    thresholdColumn = {
      type: 'threshold',
      field: {
        metric: 'T'
      }
    },
    rows = [dimensionColumn, dimensionColumnWithField, metricColumn, thresholdColumn];

  assert.deepEqual(
    indexColumnById(rows),
    {
      D1: dimensionColumn,
      'D2(desc)': dimensionColumnWithField,
      M: metricColumn,
      T: thresholdColumn
    },
    'Should return object having canonical ids as keys, columns as values'
  );
});

/**
 * @function buildTestConfig
 * @param {Array} dimensions - array of dimensions
 * @param {Array} metrics - array of metrics
 * @param {Array} thresholds - array of thresholds
 * @returns {Object} config object
 */
function buildTestConfig(dimensions = [], metrics = [], thresholds = []) {
  let columns = [
    { field: { dateTime: 'dateTime' }, type: 'dateTime' },
    ...metrics.map(m => {
      let metricName = get(m, 'metric'),
        parameters = get(m, 'parameters') || {},
        valueType = isPresent(parameters) && get(parameters, 'currency') ? 'money' : 'number';
      return {
        field: { metric: metricName, parameters },
        type: 'metric',
        valueType
      };
    }),
    ...thresholds.map(t => {
      let metricName = get(t, 'metric'),
        parameters = get(t, 'parameters') || {};
      return { field: { metric: metricName, parameters }, type: 'threshold' };
    }),
    ...dimensions.map(({ dimension, field }) => ({
      field: { dimension, field },
      type: 'dimension'
    }))
  ];
  return {
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
function buildTestRequest(dimensions = [], metrics = [], thresholds = []) {
  return {
    metrics: [...metrics, ...thresholds].map(m => {
      let metricName = get(m, 'metric'),
        parameters = get(m, 'parameters') || {},
        canonicalName = canonicalizeMetric({ metric: metricName, parameters });

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
    dimensions: dimensions.map(({ dimension, fields }) => ({
      dimension: {
        name: dimension,
        longName: classify(dimension),
        fields,
        getFieldsForTag: () => (fields ? fields.map(name => ({ name })) : [])
      }
    }))
  };
}

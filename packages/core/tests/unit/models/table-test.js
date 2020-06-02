import { set, get } from '@ember/object';
import { isPresent } from '@ember/utils';
import { run } from '@ember/runloop';
import { classify } from '@ember/string';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { indexColumnById } from 'navi-core/models/table';

module('Unit | Model | Table Visualization Fragment', function(hooks) {
  setupTest(hooks);

  test('default value', function(assert) {
    assert.expect(1);

    let metricsAndDims = [
        [{ dimension: 'd1' }, { dimension: 'd2' }],
        [{ metric: 'm1' }, { metric: 'm2' }]
      ],
      table = run(() => run(() => this.owner.lookup('service:store').createRecord('all-the-fragments')).get('table'));

    assert.ok(
      !table.isValidForRequest(buildTestRequest(...metricsAndDims)),
      'the default table fragment values are invalid'
    );
  });

  test('valid and invalid table fragment', function(assert) {
    assert.expect(12);

    let metricsAndDims = [
        [
          { dimension: 'd1' },
          {
            dimension: 'd2',
            fields: ['id', 'desc']
          }
        ],
        [{ metric: 'm1' }, { metric: 'm2' }]
      ],
      request = buildTestRequest(...metricsAndDims, 'day'),
      allTimeGrainRequest = buildTestRequest(...metricsAndDims, 'all'),
      model = run(() => this.owner.lookup('service:store').createRecord('all-the-fragments'));

    run(() => {
      set(
        model,
        'table',
        buildTestConfig(
          [{ dimension: 'd1' }, { dimension: 'd2', field: 'id' }, { dimension: 'd2', field: 'desc' }],
          [{ metric: 'm1' }, { metric: 'm2' }]
        )
      );
    });

    assert.ok(
      model.get('table').isValidForRequest(request),
      'a table fragment with the same metrics and dimensions as the request and a datetime column on a non-all timegrain is valid'
    );

    assert.notOk(
      model.get('table').isValidForRequest(allTimeGrainRequest),
      'a table with all timegrain and a datetime column is invalid'
    );

    run(() => {
      set(
        model,
        'table',
        buildTestConfig(
          [{ dimension: 'd1' }, { dimension: 'd2', field: 'id' }, { dimension: 'd2', field: 'desc' }],
          [{ metric: 'm1' }, { metric: 'm2' }],
          false //Don't include a date time column in the config
        )
      );
    });

    assert.notOk(
      model.get('table').isValidForRequest(request),
      'a table fragment with the same metrics and dimensions as the request but no datetime column on a non-all timegrain is invalid'
    );

    assert.ok(
      model.get('table').isValidForRequest(allTimeGrainRequest),
      'a table with all timegrain and no datetime column is valid'
    );

    run(() => {
      set(
        model,
        'table',
        buildTestConfig([{ dimension: 'd1' }, { dimension: 'foo' }], [{ metric: 'm1' }, { metric: 'm2' }])
      );
    });

    assert.ok(!model.get('table').isValidForRequest(request), 'a table fragment with mis-match dimensions is invalid');

    run(() => {
      set(
        model,
        'table',
        buildTestConfig(
          [
            { dimension: 'd2', field: 'id' },
            { dimension: 'd2', field: 'desc' }
          ],
          [{ metric: 'm1' }, { metric: 'm2' }]
        )
      );
    });

    assert.ok(!model.get('table').isValidForRequest(request), 'a table fragment with a missing dimension is invalid');

    run(() => {
      set(
        model,
        'table',
        buildTestConfig([{ dimension: 'd1' }, { dimension: 'd2' }], [{ metric: 'm1' }, { metric: 'm2' }])
      );
    });

    assert.ok(!model.get('table').isValidForRequest(request), 'a table fragment with no dimension fields is invalid');

    run(() => {
      set(
        model,
        'table',
        buildTestConfig([{ dimension: 'd1' }, { dimension: 'd2', field: 'id' }], [{ metric: 'm1' }, { metric: 'm2' }])
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
          [{ metric: 'm1' }, { metric: 'm2' }]
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
          [{ metric: 'm1' }]
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
          [{ metric: 'm1' }, { metric: 'foo' }]
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
          [{ metric: 'm1' }, { metric: 'm2' }, { metric: 'm3' }]
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

    let table = run(() => run(() => this.owner.lookup('service:store').createRecord('all-the-fragments')).get('table')),
      request1 = buildTestRequest(
        [
          { dimension: 'd1' },
          {
            dimension: 'd2',
            fields: ['id', 'desc']
          }
        ],
        [{ metric: 'm1' }, { metric: 'm2' }],
        'month'
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
              attributes: { name: 'dateTime' },
              type: 'dateTime'
            },
            { displayName: 'D1', attributes: { name: 'd1' }, type: 'dimension' },
            { displayName: 'D2 (id)', attributes: { name: 'd2', field: 'id' }, type: 'dimension' },
            { displayName: 'D2 (desc)', attributes: { name: 'd2', field: 'desc' }, type: 'dimension' },
            {
              displayName: 'M1',
              attributes: {
                canAggregateSubtotal: true,
                name: 'm1',
                parameters: {},
                format: ''
              },
              type: 'metric'
            },
            {
              displayName: 'M2',
              attributes: {
                canAggregateSubtotal: true,
                name: 'm2',
                parameters: {},
                format: ''
              },
              type: 'metric'
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
              attributes: { name: 'dateTime' },
              type: 'dateTime'
            },
            {
              displayName: 'M1',
              attributes: {
                canAggregateSubtotal: true,
                name: 'm1',
                parameters: {},
                format: ''
              },
              type: 'metric'
            },
            {
              displayName: 'M2',
              attributes: {
                canAggregateSubtotal: true,
                name: 'm2',
                parameters: {},
                format: ''
              },
              type: 'metric'
            }
          ]
        }
      },
      'Dimension column is not required'
    );

    config2.metadata.columns[1].displayName = 'M4';
    config2.metadata.columns[2].format = 'number';
    let config3 = run(() => table.rebuildConfig(request2).toJSON());

    assert.deepEqual(
      config3,
      {
        type: 'table',
        version: 1,
        metadata: {
          columns: [
            {
              displayName: 'Date',
              attributes: { name: 'dateTime' },
              type: 'dateTime'
            },
            {
              displayName: 'M4',
              attributes: {
                canAggregateSubtotal: true,
                name: 'm1',
                parameters: {},
                format: ''
              },
              type: 'metric'
            },
            {
              displayName: 'M2',
              attributes: {
                canAggregateSubtotal: true,
                name: 'm2',
                parameters: {},
                format: ''
              },
              type: 'metric'
            }
          ]
        }
      },
      'Columns config should be persistent'
    );

    let allTimeGrainRequest = buildTestRequest(
      [
        { dimension: 'd1' },
        {
          dimension: 'd2',
          fields: ['id', 'desc']
        }
      ],
      [{ metric: 'm1' }, { metric: 'm2' }],
      'all'
    );

    let allTimeGrainConfig = run(() => table.rebuildConfig(allTimeGrainRequest).toJSON());

    assert.deepEqual(
      allTimeGrainConfig,
      {
        type: 'table',
        version: 1,
        metadata: {
          columns: [
            { displayName: 'D1', attributes: { name: 'd1' }, type: 'dimension' },
            { displayName: 'D2 (id)', attributes: { name: 'd2', field: 'id' }, type: 'dimension' },
            { displayName: 'D2 (desc)', attributes: { name: 'd2', field: 'desc' }, type: 'dimension' },
            {
              displayName: 'M4',
              attributes: {
                canAggregateSubtotal: true,
                name: 'm1',
                parameters: {},
                format: ''
              },
              type: 'metric'
            },
            {
              displayName: 'M2',
              attributes: {
                canAggregateSubtotal: true,
                name: 'm2',
                parameters: {},
                format: ''
              },
              type: 'metric'
            }
          ]
        }
      },
      'Date time column is not present for request with all time grain'
    );
  });

  test('rebuildConfig with parameterized metrics', function(assert) {
    assert.expect(2);
    let table = run(() => run(() => this.owner.lookup('service:store').createRecord('all-the-fragments')).get('table')),
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
              attributes: { name: 'dateTime' },
              type: 'dateTime'
            },
            {
              displayName: 'M1 (paramVal1)',
              attributes: {
                canAggregateSubtotal: true,
                name: 'm1',
                parameters: { param1: 'paramVal1' },
                format: ''
              },
              type: 'metric'
            },
            {
              displayName: 'M1 (paramVal2)',
              attributes: {
                canAggregateSubtotal: true,
                name: 'm1',
                parameters: { param1: 'paramVal2' },
                format: ''
              },
              type: 'metric'
            },
            {
              displayName: 'M2',
              attributes: {
                canAggregateSubtotal: true,
                name: 'm2',
                parameters: {},
                format: ''
              },
              type: 'metric'
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
              attributes: { name: 'dateTime' },
              type: 'dateTime'
            },
            {
              displayName: 'M1 (paramVal1)',
              attributes: {
                canAggregateSubtotal: true,
                name: 'm1',
                parameters: { param1: 'paramVal1' },
                format: ''
              },
              type: 'metric'
            },
            {
              displayName: 'M1 (paramVal2)',
              attributes: {
                canAggregateSubtotal: true,
                name: 'm1',
                parameters: { param1: 'paramVal2' },
                format: ''
              },
              type: 'metric'
            },
            {
              displayName: 'M2',
              attributes: {
                canAggregateSubtotal: true,
                name: 'm2',
                parameters: {},
                format: ''
              },
              type: 'metric'
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
        attributes: {
          name: 'D1'
        }
      },
      dimensionColumnWithField = {
        type: 'dimension',
        attributes: {
          name: 'D2',
          field: 'desc'
        }
      },
      metricColumn = {
        type: 'metric',
        attributes: {
          name: 'M'
        }
      },
      rows = [dimensionColumn, dimensionColumnWithField, metricColumn];

    assert.deepEqual(
      indexColumnById(rows),
      {
        D1: dimensionColumn,
        'D2(desc)': dimensionColumnWithField,
        M: metricColumn
      },
      'Should return object having canonical ids as keys, columns as values'
    );
  });

  /**
   * @function buildTestConfig
   * @param {Array} dimensions - array of dimensions
   * @param {Array} metrics - array of metrics
   * @param {Array} thresholds - array of thresholds
   * @param {Boolean} includeDateTime - should include DateTime column
   * @returns {Object} config object
   */
  function buildTestConfig(dimensions = [], metrics = [], includeDateTime = true) {
    let columns = [
      ...metrics.map(m => {
        let name = get(m, 'metric'),
          parameters = get(m, 'parameters') || {},
          valueType = isPresent(parameters) && get(parameters, 'currency') ? 'money' : 'number';
        return {
          attributes: {
            canAggregateSubtotal: true,
            name,
            parameters
          },
          type: 'metric',
          valueType
        };
      }),
      ...dimensions.map(({ dimension, field }) => ({
        attributes: { name: dimension, field },
        type: 'dimension'
      }))
    ];

    if (includeDateTime) {
      columns.unshift({
        attributes: { name: 'dateTime' },
        type: 'dateTime'
      });
    }

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
  function buildTestRequest(dimensions = [], metrics = [], timeGrain = 'day') {
    return {
      metrics: metrics.map(m => {
        let metricName = get(m, 'metric'),
          parameters = get(m, 'parameters') || {},
          canonicalName = canonicalizeMetric({ metric: metricName, parameters });

        return {
          metric: {
            id: metricName,
            name: classify(metricName),
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
          id: dimension,
          name: classify(dimension),
          fields,
          getFieldsForTag: () => (fields ? fields.map(name => ({ name })) : [])
        }
      })),
      logicalTable: {
        timeGrain
      }
    };
  }
});

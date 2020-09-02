import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { getContext } from '@ember/test-helpers';
import { set } from '@ember/object';

module('Unit | Model | Table Visualization Fragment', function(hooks) {
  setupTest(hooks);

  test('default value', function(assert) {
    assert.expect(1);

    let metricsAndDims = [
        [{ dimension: 'd1' }, { dimension: 'd2' }],
        [{ metric: 'm1' }, { metric: 'm2' }]
      ],
      table = this.owner
        .lookup('service:store')
        .createRecord('all-the-fragments')
        .get('table');

    assert.strictEqual(
      table.isValidForRequest(buildTestRequest(...metricsAndDims)),
      true,
      'the default table fragment values are valid, no extra attributes are given'
    );
  });

  test('valid and invalid table fragment', function(assert) {
    assert.expect(3);

    let metricsAndDims = [
        [{ dimension: 'd1' }, { dimension: 'd2', fields: ['id', 'desc'] }],
        [{ metric: 'm1' }, { metric: 'm2' }]
      ],
      request = buildTestRequest(...metricsAndDims, 'day'),
      model = this.owner.lookup('service:store').createRecord('all-the-fragments');

    assert.strictEqual(
      model.get('table').isValidForRequest(request),
      true,
      'table with no column attributes are valid'
    );

    set(model, 'table', {
      metadata: {
        columnAttributes: {
          2: {
            format: 'yes'
          }
        }
      }
    });

    assert.strictEqual(
      model.get('table').isValidForRequest(request),
      true,
      'table with attributes on valid column ids are valid'
    );
    set(model, 'table', {
      metadata: {
        columnAttributes: {
          10: {
            format: 'no'
          }
        }
      }
    });
    assert.strictEqual(
      model.get('table').isValidForRequest(request),
      false,
      'table with attributes for missing column ids are invalid'
    );
  });

  test('rebuildConfig', function(assert) {
    assert.expect(3);

    const table = this.owner
        .lookup('service:store')
        .createRecord('all-the-fragments')
        .get('table'),
      request1 = buildTestRequest(
        [{ dimension: 'd1' }, { dimension: 'd2', fields: ['id', 'desc'] }],
        [
          { metric: 'm1', parameters: { gone: 'no' } },
          { metric: 'm2', parameters: { gone: 'yes' } }
        ],
        'month'
      ),
      config1 = table.rebuildConfig(request1).toJSON();

    assert.deepEqual(
      config1,
      {
        metadata: {
          columnAttributes: {}
        },
        type: 'table',
        version: 2
      },
      'table config is created with no extra attributes when it has no existing column attributes'
    );

    set(table, 'metadata', {
      columnAttributes: {
        1: {
          format: 'ok'
        },
        2: {
          format: 'bye param'
        },
        4: {
          format: 'bye dimension'
        }
      }
    });
    const request2 = buildTestRequest([], [{ metric: 'm1', parameters: { gone: 'no' } }, { metric: 'm2' }]);
    const config2 = table.rebuildConfig(request2).toJSON();

    assert.deepEqual(
      config2,
      {
        metadata: {
          columnAttributes: {
            '1': {
              format: 'ok'
            }
          }
        },
        type: 'table',
        version: 2
      },
      'Only valid existing columns are moved over, dif'
    );

    const config3 = table.rebuildConfig(request2).toJSON();

    assert.deepEqual(
      config3,
      {
        metadata: {
          columnAttributes: {
            '1': {
              format: 'ok'
            }
          }
        },
        type: 'table',
        version: 2
      },
      'Columns config should be persistent'
    );
  });

  /**
   * @function buildTestRequest
   * @param {Array} dimensions - array of dimensions
   * @param {Array} metrics - array of metrics
   * @param {Array} thresholds - array of thresholds
   * @returns {Object} request object
   */
  function buildTestRequest(dimensions = [], metrics = [], timeGrain = 'day') {
    const store = getContext().owner.lookup('service:store');

    return store.createFragment('bard-request-v2/request', {
      columns: [
        { type: 'timeDimension', field: 'dateTime', parameters: { grain: timeGrain }, source: 'bardOne' },
        ...metrics.map(({ metric, parameters = {} }) => {
          return { type: 'metric', field: metric, parameters, source: 'bardOne' };
        }),
        ...dimensions.flatMap(({ dimension, fields = ['id'] }) => {
          return fields.map(field => {
            return { type: 'dimension', field: dimension, parameters: { field }, source: 'bardOne' };
          });
        })
      ]
    });
  }
});

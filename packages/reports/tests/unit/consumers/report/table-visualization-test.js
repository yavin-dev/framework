import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { UpdateReportActions } from 'navi-reports/services/update-report-action-dispatcher';
import { get } from '@ember/object';
import { A as arr } from '@ember/array';
import { run } from '@ember/runloop';

module('Unit | Consumer | report table visualization', function(hooks) {
  setupTest(hooks);

  test('UPDATE_TABLE_COLUMN_ORDER', function(assert) {
    assert.expect(2);

    let currentModel = {
      request: {
        metrics: arr()
      },
      visualization: {
        type: 'table',
        metadata: { columns: 'old' }
      }
    };

    run(() => {
      this.owner
        .lookup('consumer:report/table-visualization')
        .send(UpdateReportActions.UPDATE_TABLE_COLUMN_ORDER, { currentModel }, [{ type: 'test' }]);
    });

    assert.deepEqual(
      get(currentModel, 'visualization.metadata.columns'),
      [{ type: 'test' }],
      'updateColumnOrder updates the columns in the visualization metadata'
    );

    let invalidVisModel = {
      visualization: {
        type: 'line-chart'
      }
    };

    assert.throws(
      () =>
        this.owner
          .lookup('consumer:report/table-visualization')
          .send(UpdateReportActions.UPDATE_TABLE_COLUMN_ORDER, { currentModel: invalidVisModel }, 'new'),
      /Visualization must be a table/,
      'Trying to update column order on a non-table visualization throws an error'
    );
  });

  test('reorder metrics', function(assert) {
    assert.expect(1);

    let currentModel = {
      request: {
        metrics: arr([
          {
            canonicalName: 'a'
          },
          {
            canonicalName: 'b'
          }
        ])
      },
      visualization: {
        type: 'table',
        metadata: {}
      }
    };

    let newColumns = [
      {
        type: 'metric',
        attributes: { name: 'b' }
      },
      {
        type: 'threshold',
        attributes: { name: 'a' }
      }
    ];

    run(() => {
      this.owner
        .lookup('consumer:report/table-visualization')
        .send(UpdateReportActions.UPDATE_TABLE_COLUMN_ORDER, { currentModel }, newColumns);
    });

    assert.deepEqual(
      get(currentModel, 'request.metrics').map(metric => get(metric, 'canonicalName')),
      ['b', 'a'],
      'updateColumnOrder updates the order of the metrics in the request metrics'
    );
  });

  test('UPDATE_TABLE_COLUMN', function(assert) {
    assert.expect(1);

    let currentModel = {
      visualization: {
        type: 'table',
        metadata: {
          columns: [{ attributes: { name: 'a' }, value: 1 }, { attributes: { name: 'b', format: 'foo' }, value: 2 }]
        }
      }
    };

    run(() => {
      this.owner
        .lookup('consumer:report/table-visualization')
        .send(
          UpdateReportActions.UPDATE_TABLE_COLUMN,
          { currentModel },
          { attributes: { name: 'b', format: 'bar' }, value: 3 }
        );
    });

    assert.deepEqual(
      get(currentModel, 'visualization.metadata.columns'),
      [{ attributes: { name: 'a' }, value: 1 }, { attributes: { name: 'b', format: 'bar' }, value: 3 }],
      'updateColumn updates the column in the visualization metadata'
    );
  });
});

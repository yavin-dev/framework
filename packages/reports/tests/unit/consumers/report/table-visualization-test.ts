import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { UpdateReportActions } from 'navi-reports/services/update-report-action-dispatcher';
import { TestContext } from 'ember-test-helpers';
import StoreService from 'ember-data/store';
import ReportModel from 'navi-core/models/report';
import TableVisualizationConsumer from 'navi-reports/consumers/report/table-visualization';

let Consumer: TableVisualizationConsumer;
let Store: StoreService;

const routeFor = (model: Partial<ReportModel>) => ({ modelFor: () => model });

module('Unit | Consumer | report table visualization', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    Consumer = this.owner.lookup('consumer:report/table-visualization');
    Store = this.owner.lookup('service:store');
  });

  test('UPDATE_TABLE_COLUMN_ORDER', function(assert) {
    const request = Store.createFragment('bard-request-v2/request', {
      table: 'network',
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [{ cid: 'cid0' }, { cid: 'cid1' }, { cid: 'cid2' }],
      filters: [],
      sorts: []
    });

    const visualization = Store.createRecord('table', {
      type: 'table',
      version: 2,
      metadata: {
        columnAttributes: {
          cid2: {
            format: 'yes'
          }
        }
      }
    });

    const route = routeFor({ request, visualization });

    Consumer.send(UpdateReportActions.UPDATE_TABLE_COLUMN_ORDER, route, [
      { fragment: request.columns.objectAt(2) },
      { fragment: request.columns.objectAt(0) },
      { fragment: request.columns.objectAt(1) }
    ]);

    assert.deepEqual(
      visualization.metadata.columnAttributes,
      { cid2: { format: 'yes' } },
      'updateColumnOrder updates the columns in the visualization metadata'
    );

    assert.deepEqual(
      request.columns.map(c => c.cid),
      ['cid2', 'cid0', 'cid1'],
      'updateColumnOrder updates the columns in the visualization metadata'
    );

    //@ts-expect-error
    const invalidVisRoute = routeFor({ request, visualization: { type: 'line-chart' } });

    assert.throws(
      () => Consumer.send(UpdateReportActions.UPDATE_TABLE_COLUMN_ORDER, invalidVisRoute, 'anything'),
      /Visualization must be a table/,
      'Trying to update column order on a non-table visualization throws an error'
    );
  });

  test('UPDATE_TABLE_COLUMN', function(assert) {
    assert.expect(1);

    const request = Store.createFragment('bard-request-v2/request', {
      table: 'network',
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [{ cid: 'cid0' }, { cid: 'cid1' }],
      filters: [],
      sorts: []
    });

    const visualization = Store.createRecord('table', {
      type: 'table',
      version: 2,
      metadata: {
        columnAttributes: {
          cid0: {
            canAggregateSubtotal: false
          },
          cid1: {
            format: 'foo'
          }
        }
      }
    });

    const route = routeFor({ request, visualization });

    Consumer.send(UpdateReportActions.UPDATE_TABLE_COLUMN, route, {
      attributes: { format: 'bar' },
      fragment: { cid: 'cid1' }
    });

    assert.deepEqual(
      visualization.metadata.columnAttributes,
      {
        cid0: {
          canAggregateSubtotal: false
        },
        cid1: {
          format: 'bar'
        }
      },
      'updateColumn updates the column in the visualization metadata'
    );
  });
});

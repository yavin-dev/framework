import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { ReportActions } from 'navi-reports/services/report-action-dispatcher';

const { get } = Ember;

moduleFor('consumer:report/table-visualization', 'Unit | Consumer | report table visualization', {
  needs: [ 'consumer:action-consumer' ]
});

test('UPDATE_TABLE_COLUMN_ORDER', function(assert) {
  assert.expect(2);

  let currentModel = {
    visualization: {
      type: 'table',
      metadata: { columns: 'old' }
    }
  };

  Ember.run(() => {
    this.subject().send(ReportActions.UPDATE_TABLE_COLUMN_ORDER, { currentModel: currentModel }, 'new');
  });

  assert.equal(get(currentModel, 'visualization.metadata.columns'),
    'new',
    'updateColumnOrder updates the columns in the visualization metadata');

  let invalidVisModel = {
    visualization: {
      type: 'line-chart'
    }
  };

  assert.throws(() => this.subject().send(ReportActions.UPDATE_TABLE_COLUMN_ORDER, { currentModel: invalidVisModel }, 'new'),
    /Visualization must be a table/,
    'Trying to update column order on a non-table visualization throws an error');
});

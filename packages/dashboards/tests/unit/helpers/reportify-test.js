
import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';

const widgetModel = {
  author: 'navi',
  request: {
    clone() {
      return {}
    }
  },
  toJSON() {
    return {
      title: 'test',
      visualization: {
        type: 'line-chart'
      },
    }
  }
}

moduleFor('helper:reportify', 'Unit | Helper | reportify', {
  needs: [
    'model:bard-request/fragments/logical-table',
    'model:bard-request/request',
    'model:delivery-rule',
    'model:line-chart',
    'model:report',
    'model:user',
    'model:visualization',
    'service:bard-metadata',
    'service:user',
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:moment',
    'transform:table',
    'validator:belongs-to',
    'validator:chart-type',
    'validator:has-many',
    'validator:length',
    'validator:presence',
    'validator:request-dimension-order',
    'validator:request-metrics',
    'validator:request-metric-exist',
    'validator:request-time-grain',
    'validator:request-filters'
  ]
});

test('reportify returns report', function (assert) {
  assert.expect(2);

  let reportify = this.subject();

  return wait().then(() => {
    return Ember.run(() => {
      let report = reportify.compute([widgetModel]),
          reportObject = report.toJSON();

      assert.deepEqual(reportObject.title,
        'test',
        'Report should have correct title');
      assert.deepEqual(reportObject.visualization.type,
        'line-chart',
        'Report should have correct visualization type');
    });
  });
});
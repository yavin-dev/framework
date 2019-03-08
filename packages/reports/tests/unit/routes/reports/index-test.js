import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import wait from 'ember-test-helpers/wait';

moduleFor('route:reports/index', 'Unit | Route | reports/index', {
  needs: [
    'adapter:report',
    'adapter:user',
    'model:report',
    'model:user',
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:moment',
    'transform:table',
    'model:bard-request/request',
    'model:bard-request/fragments/dimension',
    'model:bard-request/fragments/filter',
    'model:bard-request/fragments/having',
    'model:bard-request/fragments/interval',
    'model:bard-request/fragments/logicalTable',
    'model:bard-request/fragments/metric',
    'model:bard-request/fragments/sort',
    'model:line-chart',
    'model:table',
    'model:dashboard',
    'serializer:bard-request/fragments/logical-table',
    'serializer:bard-request/fragments/interval',
    'validator:length',
    'validator:belongs-to',
    'validator:has-many',
    'validator:interval',
    'validator:presence',
    'validator:chart-type',
    'validator:request-metrics',
    'validator:request-metric-exist',
    'validator:request-dimension-order',
    'service:bard-metadata',
    'adapter:bard-metadata',
    'serializer:report',
    'serializer:user',
    'serializer:bard-metadata',
    'service:keg',
    'service:ajax',
    'service:bard-facts',
    'model:metadata/table',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/time-grain',
    'service:bard-dimensions',
    'service:user',
    'service:navi-notifications',
    'adapter:dimensions/bard',
    'model:delivery-rule'
  ],

  beforeEach() {
    setupMock();
    return getOwner(this)
      .lookup('service:bard-metadata')
      .loadMetadata();
  },

  afterEach() {
    teardownMock();
  }
});

test('reports model', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let route = this.subject();

    return run(() => {
      return route.model().then(model => {
        return model.get('reports').then(reports => {
          assert.deepEqual(reports.mapBy('id'), ['1', '2', '4'], 'Routes model returns the reports');

          assert.deepEqual(
            reports.mapBy('title'),
            ['Hyrule News', 'Hyrule Ad&Nav Clicks', 'Report 12'],
            'Model contains user reports and favorite reports'
          );
        });
      });
    });
  });
});

import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

moduleFor('route:report-collections/collection', 'Unit | Route | report collections/collection', {
  needs: [
    'model:report-collection',
    'adapter:report-collection',
    'config:environment',
    'adapter:report',
    'adapter:user',
    'model:report',
    'model:deliverable-item',
    'model:user',
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:moment',
    'transform:table',
    'validator:chart-type',
    'validator:request-metrics',
    'validator:request-metric-exist',
    'validator:request-dimension-order',
    'validator:request-time-grain',
    'validator:request-filters',
    'model:bard-request/request',
    'model:bard-request/fragments/dimension',
    'model:bard-request/fragments/filter',
    'model:bard-request/fragments/interval',
    'model:bard-request/fragments/logicalTable',
    'model:bard-request/fragments/metric',
    'model:bard-request/fragments/sort',
    'model:line-chart',
    'model:table',
    'serializer:bard-request/fragments/logical-table',
    'serializer:bard-request/fragments/interval',
    'validator:length',
    'validator:belongs-to',
    'validator:has-many',
    'validator:interval',
    'validator:presence',
    'service:bard-metadata',
    'adapter:bard-metadata',
    'serializer:report',
    'serializer:user',
    'serializer:report-collection',
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
    'adapter:dimensions/bard',
    'model:delivery-rule',
    'model:dashboard'
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

test('model', function(assert) {
  assert.expect(4);

  return run(() => {
    let params = { collection_id: 1 },
      route = this.subject(),
      modelPromise = route.model(params);

    assert.ok(modelPromise.then, 'Route returns a promise in the model hook');

    return modelPromise.then(model => {
      assert.equal(model.id, params.collection_id, 'The requested collection is retrieved');

      assert.equal(
        model.get('title'),
        `Report Collection ${params.collection_id}`,
        'The requested collection is retrieved'
      );

      return model.get('reports').then(reports => {
        assert.equal(reports.length, 2, 'The requested collection is retrieved with the two reports');
      });
    });
  });
});

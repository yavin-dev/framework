import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

moduleFor(
  'route:dashboard-collections/collection',
  'Unit | Route | dashboard collections/collection',
  {
    needs: [
      'model:dashboard-collection',
      'adapter:dashboard-collection',
      'serializer:dashboard-collection',
      'transform:moment',
      'model:dashboard',
      'model:user',
      'transform:fragment',
      'model:fragments/presentation',
      'adapter:dashboard',
      'serializer:dashboard',
      'model:dashboard-widget',
      'adapter:dashboard-widget',
      'serializer:dashboard-widget',
      'config:environment',
      'service:user'
    ],
    beforeEach() {
      setupMock();
    },
    afterEach() {
      teardownMock();
    }
  }
);

test('model', function(assert) {
  assert.expect(4);

  return Ember.run(() => {
    let params = { collectionId: 1 },
      route = this.subject(),
      modelPromise = route.model(params);

    assert.ok(modelPromise.then, 'Route returns a promise in the model hook');

    return modelPromise.then(model => {
      assert.equal(
        model.id,
        params.collectionId,
        'The requested collection is retrieved'
      );

      assert.equal(
        model.get('title'),
        `Collection ${params.collectionId}`,
        'The requested collection is retrieved'
      );

      return model.get('dashboards').then(dashboards => {
        assert.equal(
          dashboards.length,
          2,
          'The requested collection is retrieved with the two dashboards'
        );
      });
    });
  });
});

import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

let Route;

moduleFor('route:dashboard-collections/index', 'Unit | Route | dashboard collections/index', {
  needs: [
    'model:dashboard-collection',
    'adapter:dashboard-collection',
    'serializer:dashboard-collection',
    'model:report',
    'model:user',
    'model:dashboard',
    'adapter:dashboard',
    'serializer:dashboard',
    'model:dashboard-widget',
    'transform:fragment',
    'model:fragments/presentation',
    'transform:moment'
  ],
  beforeEach() {
    setupMock();
    Route = this.subject();
  },
  afterEach() {
    teardownMock();
  }
});

test('model', function(assert) {
  assert.expect(2);

  return Ember.run(() => {
    return Route.model().then(collections => {
      assert.deepEqual(
        collections.mapBy('id'),
        ['1', '2', '3'],
        'Routes model returns the `navi_user`s dashboard collections'
      );

      assert.deepEqual(
        collections.mapBy('title'),
        ['Collection 1', 'Collection 2', 'Collection 3'],
        'the actual models of the dashboard collections can be retrieved through the model'
      );
    });
  });
});

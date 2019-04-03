import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

module('Unit | Route | dashboard collections/collection', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('model', function(assert) {
    assert.expect(4);

    return run(() => {
      let params = { collection_id: 1 },
        route = this.owner.lookup('route:dashboard-collections/collection'),
        modelPromise = route.model(params);

      assert.ok(modelPromise.then, 'Route returns a promise in the model hook');

      return modelPromise.then(model => {
        assert.equal(model.id, params.collection_id, 'The requested collection is retrieved');

        assert.equal(model.get('title'), `Collection ${params.collection_id}`, 'The requested collection is retrieved');

        return model.get('dashboards').then(dashboards => {
          assert.equal(dashboards.length, 2, 'The requested collection is retrieved with the two dashboards');
        });
      });
    });
  });
});

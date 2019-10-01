import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Route | report collections/collection', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  test('model', function(assert) {
    assert.expect(4);

    return run(() => {
      let params = { collection_id: 1 },
        route = this.owner.lookup('route:report-collections/collection'),
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
});

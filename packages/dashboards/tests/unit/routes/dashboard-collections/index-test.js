import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

let Route;

module('Unit | Route | dashboard collections/index', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    Route = this.owner.lookup('route:dashboard-collections/index');
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('model', function(assert) {
    assert.expect(2);

    return run(() => {
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
});

import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import { initialize as initializeUserModel } from 'navi-dashboards/initializers/user-model';

let Route;

module('Unit | Route | dashboards/index', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    initializeUserModel();
    Route = this.owner.lookup('route:dashboards/index');
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('model', function(assert) {
    assert.expect(2);

    return run(() => {
      return Route.model().then(model => {
        return model.get('dashboards').then(dashboards => {
          assert.deepEqual(dashboards.mapBy('id'), ['1', '2', '5'], 'Routes model returns the `navi_user`s dashboards');

          assert.deepEqual(
            dashboards.mapBy('title'),
            ['Tumblr Goals Dashboard', 'Dashboard 2', 'Empty Dashboard'],
            'the actual models of the dashboards can be retrieved through the model'
          );
        });
      });
    });
  });
});

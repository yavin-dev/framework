import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import { initialize as initializeUserModel } from 'navi-dashboards/initializers/user-model';

let Route;

moduleFor('route:dashboards/index', 'Unit | Route | dashboards/index', {
  needs: [
    'adapter:dashboard',
    'adapter:user',
    'model:dashboard',
    'model:dashboard-widget',
    'model:delivery-rule',
    'model:fragments/presentation',
    'model:report',
    'model:user',
    'serializer:dashboard',
    'service:navi-notifications',
    'service:user',
    'serializer:user',
    'transform:fragment',
    'transform:moment'
  ],
  beforeEach() {
    setupMock();
    initializeUserModel();
    Route = this.subject();
  },
  afterEach() {
    teardownMock();
  }
});

test('model', function(assert) {
  assert.expect(2);

  return Ember.run(() => {
    return Route.model().then(model => {
      return model.get('dashboards').then(dashboards => {
        assert.deepEqual(
          dashboards.mapBy('id'),
          ['1', '2'],
          'Routes model returns the `navi_user`s dashboards'
        );

        assert.deepEqual(
          dashboards.mapBy('title'),
          ['Tumblr Goals Dashboard', 'Dashboard 2'],
          'the actual models of the dashboards can be retrieved through the model'
        );
      });
    });
  });
});

test('buildDashboardUrl', function(assert) {
  assert.expect(1);

  // Mock router
  Route.set('router', {
    generate: (route, id) => `/dashboards/${id}`
  });

  assert.equal(
    Route.send('buildDashboardUrl', { id: 3 }),
    document.location.origin + '/dashboards/3',
    'Action builds url based on router and given dashboard id'
  );
});

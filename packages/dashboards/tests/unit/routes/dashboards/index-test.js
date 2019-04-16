import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import { initialize as initializeUserModel } from 'navi-dashboards/initializers/user-model';

let Route;

moduleFor('route:dashboards/index', 'Unit | Route | dashboards/index', {
  needs: [
    'adapter:bard-metadata',
    'adapter:dashboard',
    'adapter:user',
    'model:bard-request/fragments/filter',
    'model:dashboard-widget',
    'model:dashboard',
    'model:deliverable-item',
    'model:delivery-rule',
    'model:fragments/presentation',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/table',
    'model:metadata/time-grain',
    'model:report',
    'model:user',
    'serializer:bard-metadata',
    'serializer:bard-request/fragments/filter',
    'serializer:dashboard',
    'serializer:user',
    'service:ajax',
    'service:bard-metadata',
    'service:keg',
    'service:navi-notifications',
    'service:user',
    'transform:dimension',
    'transform:fragment-array',
    'transform:fragment',
    'transform:moment',
    'validator:presence'
  ],
  beforeEach() {
    setupMock();
    initializeUserModel();
    this.container.lookup('service:bard-metadata').loadMetadata();
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

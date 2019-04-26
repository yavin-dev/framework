import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

let Route;

const NEW_MODEL = {
    author: 'navi_user',
    createdOn: null,
    filters: [],
    presentation: {
      columns: 12,
      layout: [],
      version: 1
    },
    updatedOn: null
  },
  NEW_MODEL_WITH_DEFAULT_TITLE = Object.assign({}, NEW_MODEL, {
    title: 'Untitled Dashboard'
  }),
  NEW_MODEL_WITH_GIVEN_TITLE = Object.assign({}, NEW_MODEL, {
    title: 'Dashing Dashboard'
  });

moduleFor('route:dashboards/new', 'Unit | Route | dashboards/new', {
  needs: [
    'service:user',
    'model:user',
    'model:report',
    'adapter:user',
    'serializer:user',
    'model:dashboard',
    'adapter:dashboard',
    'serializer:dashboard',
    'transform:fragment',
    'transform:fragment-array',
    'transform:moment',
    'model:fragments/presentation',
    'model:dashboard-widget',
    'model:delivery-rule',
    'service:navi-notifications',
    'validator:presence'
  ],

  beforeEach() {
    setupMock();
    Route = this.subject();
  },
  afterEach() {
    teardownMock();
  }
});

test('model - new with default title', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    let modelPromise = Route.model(null, {});

    return modelPromise.then(routeModel => {
      //We don't need to match on the createdOn and updatedOn timestamps so just set them to null
      assert.deepEqual(
        Object.assign({}, routeModel.toJSON(), { createdOn: null, updatedOn: null }),
        NEW_MODEL_WITH_DEFAULT_TITLE,
        'The model hook returns a new model when the title query param is not defined'
      );
    });
  });
});

test('model - new with given title', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    let queryParams = { title: 'Dashing Dashboard' },
      modelPromise = Route.model(null, { queryParams });

    return modelPromise.then(routeModel => {
      //We don't need to match on the createdOn and updatedOn timestamps so just set them to null
      assert.deepEqual(
        Object.assign({}, routeModel.toJSON(), { createdOn: null, updatedOn: null }),
        NEW_MODEL_WITH_GIVEN_TITLE,
        'The model hook returns a new model when the title query param is defined'
      );
    });
  });
});

test('afterModel', function(assert) {
  assert.expect(2);

  let dashboard = { id: 3 },
    queryParams = {};

  /* == Without unsavedWidgetId == */
  Route.replaceWith = destinationRoute => {
    assert.equal(
      destinationRoute,
      'dashboards.dashboard',
      'Route redirects to dashboard/:id route when unsavedWidgetId is not given'
    );
  };
  Route.afterModel(dashboard, { queryParams });

  /* == With unsavedWidgetId == */
  queryParams.unsavedWidgetId = 10;
  Route.replaceWith = destinationRoute => {
    assert.equal(
      destinationRoute,
      'dashboards.dashboard.widgets.add',
      'Route redirects to dashboard/:id/widgets/new route when unsavedWidgetId is given'
    );
  };
  Route.afterModel(dashboard, { queryParams });
});

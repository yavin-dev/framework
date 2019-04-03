import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
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

module('Unit | Route | dashboards/new', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    Route = this.owner.lookup('route:dashboards/new');
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('model - new with default title', function(assert) {
    assert.expect(1);

    return run(() => {
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

    return run(() => {
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
});

import { all } from 'rsvp';
import { run } from '@ember/runloop';
import { get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import Mirage from 'ember-cli-mirage';

let Route;

const CLONED_MODEL = {
  author: 'navi_user',
  createdOn: null,
  presentation: {
    columns: 12,
    layout: [
      {
        column: 0,
        height: 4,
        row: 0,
        widgetId: 6,
        width: 6
      },
      {
        column: 6,
        height: 4,
        row: 0,
        widgetId: 7,
        width: 6
      },
      {
        column: 0,
        height: 4,
        row: 4,
        widgetId: 8,
        width: 12
      }
    ],
    version: 1
  },
  title: 'Copy of Tumblr Goals Dashboard',
  updatedOn: null
};

module('Unit | Route | dashboards/dashboard/clone', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Route = this.owner.lookup('route:dashboards/dashboard/clone');
    await this.owner.lookup('service:user').findUser();
    await this.container.lookup('service:bard-metadata').loadMetadata();
  },

  test('_cloneDashboard - valid dashboard', function(assert) {
    assert.expect(4);

    return run(() => {
      return Route.store.findRecord('dashboard', 1).then(dashboard => {
        let cloneDashboard = Route._cloneDashboard(dashboard),
          widgetIdinDashboard1 = dashboard.get('presentation.layout').map(layout => layout.widgetId);

        return cloneDashboard.then(model => {
          let expectedModel = model.toJSON(),
            widgetIdinExpectedModel = model.get('presentation.layout').map(layout => layout.widgetId);

          assert.equal(expectedModel.title, CLONED_MODEL.title, 'Expected Models title is correct');

          assert.equal(expectedModel.author, CLONED_MODEL.author, 'Expected Models Author is correct');

          assert.notEqual(
            widgetIdinExpectedModel,
            widgetIdinDashboard1,
            'WidgetIds in expected dashboard and original dashboard is not the same'
          );

          assert.deepEqual(
            expectedModel.presentation,
            CLONED_MODEL.presentation,
            'Expected Models presentation object is correct'
          );
        });
      });
    });
  });

  test('_cloneDashboard - invalid widgets for a dashboard', function(assert) {
    assert.expect(1);

    //Mock Server Endpoint
    server.get('/dashboards/:id/widgets/', () => {
      return new Mirage.Response(500);
    });

    return run(() => {
      return Route.store.findRecord('dashboard', 1).then(dashboard => {
        let cloneDashboard = Route._cloneDashboard(dashboard);
        return cloneDashboard.catch(() => {
          assert.ok(true, 'clone dashboard fails for invalid widgets');
        });
      });
    });
  });

  test('_cloneWidget - valid widget', function(assert) {
    assert.expect(15);

    return run(() => {
      return Route.store.findRecord('dashboard', 1).then(dashboard => {
        return dashboard.get('widgets').then(oldWidgets => {
          let cloneDashboard = dashboard.clone();

          return cloneDashboard.save().then(cloneDashboardModel =>
            Route._cloneWidgets(dashboard, cloneDashboardModel).then(async widgetPromiseArray => {
              widgetPromiseArray.forEach((widgetPromise, idx) =>
                widgetPromise.then(clonedWidget => {
                  assert.equal(
                    get(clonedWidget, 'title'),
                    oldWidgets.objectAt(idx).get('title'),
                    'Widget titles are same'
                  );

                  assert.deepEqual(
                    get(clonedWidget, 'requests.firstObject').toJSON(),
                    oldWidgets
                      .objectAt(idx)
                      .get('requests.firstObject')
                      .toJSON(),
                    'Widget requests are same'
                  );

                  assert.deepEqual(
                    get(clonedWidget, 'visualization').toJSON(),
                    oldWidgets
                      .objectAt(idx)
                      .get('visualization')
                      .toJSON(),
                    'Widget visualization are same'
                  );

                  assert.notEqual(
                    get(clonedWidget, 'id'),
                    oldWidgets.objectAt(idx).get('id'),
                    'Widget ids are not same'
                  );

                  assert.equal(
                    get(clonedWidget, 'dashboard.id'),
                    get(cloneDashboardModel, 'id'),
                    'Cloned Widgets are set to the correct dashboard'
                  );
                })
              );
              return all(widgetPromiseArray);
            })
          );
        });
      });
    });
  });

  test('afterModel', function(assert) {
    assert.expect(1);

    return settled().then(() => {
      let dashboard = { id: 6 };

      Route.replaceWith = destinationRoute => {
        assert.equal(destinationRoute, 'dashboards.dashboard', 'Route redirects to dashboard/:id route ');
      };
      Route.afterModel(dashboard);
    });
  });
});

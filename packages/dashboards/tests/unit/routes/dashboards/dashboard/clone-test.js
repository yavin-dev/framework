import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../../helpers/mirage-helper';
import Mirage from 'ember-cli-mirage';
import wait from 'ember-test-helpers/wait';

const { get } = Ember;

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

moduleFor('route:dashboards/dashboard/clone', 'Unit | Route | dashboards/dashboard/clone', {
  needs: [
    'serializer:dashboard',
    'serializer:dashboard-widget',
    'adapter:dashboard-widget',
    'service:user',
    'model:user',
    'model:report',
    'model:visualization',
    'model:goal-gauge',
    'model:line-chart',
    'model:table',
    'adapter:user',
    'model:dashboard',
    'adapter:dashboard',
    'transform:fragment',
    'transform:moment',
    'model:fragments/presentation',
    'model:dashboard-widget',
    'adapter:bard-metadata',
    'adapter:dimensions/bard',
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:moment',
    'transform:table',
    'model:bard-request/request',
    'model:bard-request/fragments/dimension',
    'model:bard-request/fragments/filter',
    'model:bard-request/fragments/interval',
    'model:bard-request/fragments/logicalTable',
    'model:bard-request/fragments/metric',
    'model:bard-request/fragments/sort',
    'model:metadata/table',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/time-grain',
    'validator:length',
    'validator:belongs-to',
    'validator:has-many',
    'validator:interval',
    'validator:presence',
    'validator:request-metric-exist',
    'validator:chart-type',
    'validator:request-metrics',
    'validator:request-dimension-order',
    'validator:request-filters',
    'validator:request-time-grain',
    'validator:number',
    'service:bard-metadata',
    'serializer:bard-request/fragments/logical-table',
    'serializer:bard-request/fragments/interval',
    'serializer:visualization',
    'serializer:report',
    'serializer:user',
    'serializer:bard-metadata',
    'service:keg',
    'service:ajax',
    'service:bard-facts',
    'service:user',
    'service:bard-dimensions',
    'model:delivery-rule',
    'service:navi-notifications'
  ],
  async beforeEach() {
    setupMock();
    Route = this.subject();
    this.container.lookup('service:user').findUser();

    // Load metadata needed for request fragment
    let metadataService = this.container.lookup('service:bard-metadata');
    await metadataService.loadMetadata();
  },
  afterEach() {
    teardownMock();
  }
});

test('_cloneDashboard - valid dashboard', function(assert) {
  assert.expect(4);

  return Ember.run(() => {
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

  return Ember.run(() => {
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

  return Ember.run(() => {
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

                assert.notEqual(get(clonedWidget, 'id'), oldWidgets.objectAt(idx).get('id'), 'Widget ids are not same');

                assert.equal(
                  get(clonedWidget, 'dashboard.id'),
                  get(cloneDashboardModel, 'id'),
                  'Cloned Widgets are set to the correct dashboard'
                );
              })
            );
            return Ember.RSVP.all(widgetPromiseArray);
          })
        );
      });
    });
  });
});

test('afterModel', function(assert) {
  assert.expect(1);

  return wait().then(() => {
    let dashboard = { id: 6 };

    Route.replaceWith = destinationRoute => {
      assert.equal(destinationRoute, 'dashboards.dashboard', 'Route redirects to dashboard/:id route ');
    };
    Route.afterModel(dashboard);
  });
});

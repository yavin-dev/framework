import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import wait from 'ember-test-helpers/wait';
import Mirage from 'ember-cli-mirage';

const { get } = Ember;

let Route;

moduleFor('route:dashboards/dashboard', 'Unit | Route | dashboards/dashboard', {
  needs: [
    'model:dashboard',
    'adapter:dashboard',
    'serializer:dashboard',
    'model:dashboard-widget',
    'transform:fragment',
    'model:fragments/presentation',
    'model:user',
    'adapter:dashboard-widget',
    'serializer:dashboard-widget',
    'transform:moment',
    'service:dashboard-data',
    'service:bard-facts',
    'service:bard-metadata',
    'service:bard-dimensions',
    'adapter:bard-facts',
    'serializer:bard-facts',
    'service:ajax',
    'service:navi-notifications',
    'config:environment',
    'service:request-decorator',
    'model:visualization',
    'model:goal-gauge',
    'model:line-chart',
    'model:table',
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
    'service:bard-dimensions'
  ],
  beforeEach() {
    setupMock();

    // Load metadata needed for request fragment
    let metadataService = this.container.lookup('service:bard-metadata');
    metadataService.loadMetadata();

    Route = this.subject();
  },
  afterEach() {
    teardownMock();
  }
});

test('it exists', function(assert) {
  assert.expect(1);
  assert.ok(Route, 'Route Exists');
});

test('model', function(assert) {
  assert.expect(4);

  return Ember.run(() => {
    let params = { dashboardId: '1' },
      modelPromise = Route.model(params);

    assert.ok(modelPromise.then, 'Route returns a promise in the model hook');

    return modelPromise.then(dashboard => {
      assert.equal(
        dashboard.id,
        params.dashboardId,
        'The requested dashboard is retrieved'
      );

      assert.equal(
        dashboard.get('title'),
        'Tumblr Goals Dashboard',
        'The requested dashboard is retrieved'
      );

      return dashboard.get('widgets').then(res => {
        assert.deepEqual(
          res.mapBy('id'),
          ['1', '2', '3'],
          'The requested dashboard is retrieved with the three widgets'
        );
      });
    });
  });
});

test('currentDashboard', function(assert) {
  assert.expect(1);

  let model = {};
  Route.reopen(mockModelFor(model));

  assert.equal(
    get(Route, 'currentDashboard'),
    model,
    'currentDashboard returns the dashboard in the current model object'
  );
});

test('_updateLayout', function(assert) {
  assert.expect(2);

  let dashboard = {
    presentation: {
      layout: [
        { widgetId: 1, column: 0, row: 0, height: 4, width: 4 },
        { widgetId: 2, column: 0, row: 4, height: 3, width: 3 },
        { widgetId: 3, column: 1, row: 7, height: 3, width: 9 }
      ]
    }
  };
  Route.reopen(mockModelFor(dashboard));

  Route._updateLayout([
    { id: 1, x: 1, y: 1, height: 3, width: 1 },
    { id: 2, x: 2, y: 4, height: 4, width: 5 }
  ]);

  let expectedLayout = [
    { widgetId: 1, column: 1, row: 1, height: 3, width: 1 },
    { widgetId: 2, column: 2, row: 4, height: 4, width: 5 },
    { widgetId: 3, column: 1, row: 7, height: 3, width: 9 }
  ];

  let actualLayout = get(Route, 'currentDashboard.presentation.layout');

  assert.deepEqual(
    actualLayout,
    expectedLayout,
    '_updateLayout successfully updated the dashboard layout'
  );

  Route._updateLayout();

  assert.deepEqual(
    actualLayout,
    expectedLayout,
    '_updateLayout does not update the dashboard layout when not passed arguments'
  );
});

test('_saveDashboardFn', function(assert) {
  assert.expect(1);

  let dashboard = {
    save: () => Ember.RSVP.resolve()
  };

  Route.reopen(mockModelFor(dashboard));
  return Route._saveDashboardFn().then(() => {
    assert.ok(
      true,
      '_saveDashboardFn saves dashboard model when user can edit'
    );
  });
});

test('didUpdateLayout - user can edit', function(assert) {
  assert.expect(1);

  Route.reopen({
    _updateLayout() {
      return;
    },
    currentDashboard: {
      canUserEdit: true,
      save: () => Ember.RSVP.resolve()
    },
    _saveDashboardFn() {
      assert.ok(true, '_saveDashboardFn method is called when user can edit');
    }
  });

  Route.send('didUpdateLayout', undefined, [1, 2]);
  return wait();
});

test('didUpdateLayout - user cannot edit', function(assert) {
  assert.expect(1);

  Route.reopen({
    _updateLayout() {
      return;
    },
    currentDashboard: {
      canUserEdit: false
    },
    _saveDashboardFn() {
      assert.ok(false, 'Error: _saveDashboardFn method when user cannot edit');
    }
  });

  Route.send('didUpdateLayout', undefined, [1, 2]);
  assert.ok(true, '_saveDashboardFn method is not called');
  return wait();
});

test('delete widget - success', function(assert) {
  assert.expect(5);

  return Ember.run(() => {
    return Route.store.findRecord('dashboard', 1).then(dashboard => {
      Route.reopen(mockModelFor(dashboard), {
        naviNotifications: {
          add({ message }) {
            assert.equal(
              message,
              'Widget "Mobile DAU Graph" deleted successfully!',
              'A notification is sent containing the widget title'
            );
          }
        },
        _saveDashboardFn() {
          assert.ok(true, 'Dashboard is saved after layout update');
        },
        transitionTo(route) {
          assert.equal(
            route,
            this.routeName,
            'After deleting a widget, user is transitioned out of any child route'
          );
        }
      });

      // Make sure necessary widget is prefetched
      return dashboard.get('widgets').then(() => {
        let originalWidgetCount = dashboard.get('widgets.length');

        Route.send(
          'deleteWidget',
          Route.store.peekRecord('dashboard-widget', 2)
        );

        return wait().then(() => {
          assert.equal(
            dashboard.get('widgets.length'),
            originalWidgetCount - 1,
            'Dashboard has one less widget after a delete'
          );

          assert.equal(
            Ember.A(dashboard.get('presentation.layout')).findBy('widgetId', 2),
            undefined,
            'Dashboard layout no longer has reference to deleted widget'
          );
        });
      });
    });
  });
});

test('delete widget - failure', function(assert) {
  assert.expect(3);

  //Mock Server Endpoint
  server.delete('/dashboards/:id/widgets/:widgetId', () => {
    return new Mirage.Response(500);
  });

  return Ember.run(() => {
    return Route.store.findRecord('dashboard', 1).then(dashboard => {
      Route.reopen(mockModelFor(dashboard), {
        naviNotifications: {
          add({ message }) {
            assert.equal(
              message,
              'OOPS! An error occurred while deleting widget "Mobile DAU Graph"',
              'A notification is sent containing the widget title'
            );
          }
        }
      });

      // Make sure necessary widget is prefetched
      return dashboard.get('widgets').then(() => {
        let originalWidgetCount = dashboard.get('widgets.length');

        Route.send(
          'deleteWidget',
          Route.store.peekRecord('dashboard-widget', 2)
        );

        return wait().then(() => {
          assert.equal(
            dashboard.get('widgets.length'),
            originalWidgetCount,
            'Dashboard still has all widgets after a failed delete'
          );

          assert.notEqual(
            Ember.A(dashboard.get('presentation.layout')).findBy('widgetId', 2),
            undefined,
            'Dashboard layout still has reference to widget after a failed delete'
          );
        });
      });
    });
  });
});

function mockModelFor(currentDashboard) {
  return {
    currentDashboard
  };
}

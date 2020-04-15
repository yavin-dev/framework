import { resolve } from 'rsvp';
import { run } from '@ember/runloop';
import emberObj from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'ember-cli-mirage';
import DashboardsDashboardRoute from 'navi-dashboards/routes/dashboards/dashboard';

const serializeLayout = layout => JSON.parse(JSON.stringify(layout));

module('Unit | Route | dashboards/dashboard', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  test('it exists', function(assert) {
    assert.expect(1);
    assert.ok(this.owner.lookup('route:dashboards/dashboard'), 'Route Exists');
  });

  test('model', async function(assert) {
    assert.expect(4);

    const route = this.owner.lookup('route:dashboards/dashboard');

    await run(async () => {
      const params = { dashboard_id: '1' };
      const modelPromise = route.model(params);

      assert.ok(modelPromise.then, 'Route returns a promise in the model hook');

      const dashboard = await modelPromise;
      assert.equal(dashboard.id, params.dashboard_id, 'The requested dashboard is retrieved');

      assert.equal(dashboard.get('title'), 'Tumblr Goals Dashboard', 'The requested dashboard is retrieved');

      const widgets = await dashboard.get('widgets');
      assert.deepEqual(
        widgets.map(w => w.id),
        ['1', '2', '3'],
        'The requested dashboard is retrieved with the three widgets'
      );
    });
  });

  test('currentDashboard', function(assert) {
    assert.expect(1);

    const model = {};

    const TestRoute = class extends DashboardsDashboardRoute {
      currentDashboard = model;
    };
    const route = TestRoute.create();

    assert.equal(
      route.currentDashboard,
      model,
      'currentDashboard returns the dashboard in the current model emberObject'
    );
  });

  test('_updateLayout', function(assert) {
    assert.expect(2);

    const dashboard = {
      presentation: {
        layout: [
          emberObj.create({ widgetId: 1, column: 0, row: 0, height: 4, width: 4 }),
          emberObj.create({ widgetId: 2, column: 0, row: 4, height: 3, width: 3 }),
          emberObj.create({ widgetId: 3, column: 1, row: 7, height: 3, width: 9 })
        ]
      }
    };
    const TestRoute = class extends DashboardsDashboardRoute {
      currentDashboard = dashboard;
    };
    const route = TestRoute.create();

    route._updateLayout([{ id: 1, x: 1, y: 1, height: 3, width: 1 }, { id: 2, x: 2, y: 4, height: 4, width: 5 }]);

    const expectedLayout = [
      { widgetId: 1, column: 1, row: 1, height: 3, width: 1 },
      { widgetId: 2, column: 2, row: 4, height: 4, width: 5 },
      { widgetId: 3, column: 1, row: 7, height: 3, width: 9 }
    ];

    const actualLayout = serializeLayout(route.currentDashboard.presentation.layout);

    assert.deepEqual(actualLayout, expectedLayout, '_updateLayout successfully updated the dashboard layout');

    route._updateLayout();

    assert.deepEqual(
      actualLayout,
      expectedLayout,
      '_updateLayout does not update the dashboard layout when not passed arguments'
    );
  });

  test('saveDashboard', async function(assert) {
    assert.expect(1);

    const dashboard = {
      save: () => resolve(),
      widgets: []
    };

    const TestRoute = class extends DashboardsDashboardRoute {
      currentDashboard = dashboard;
    };
    const route = TestRoute.create();
    await route.actions.saveDashboard.call(route);
    assert.ok(true, 'saveDashboard saves dashboard model when user can edit');
  });

  test('didUpdateLayout - user can edit', async function(assert) {
    assert.expect(1);

    const currentDashboard = {
      canUserEdit: true,
      save: () => resolve(),
      widgets: [],
      presentation: { layout: [emberObj.create({ widgetId: 1 }), emberObj.create({ widgetId: 2 })] }
    };

    const TestRoute = class extends DashboardsDashboardRoute {
      currentDashboard = currentDashboard;
    };
    const route = TestRoute.create();

    route.send('didUpdateLayout', undefined, [
      { id: 1, x: 1, y: 2, height: 5, width: 12 },
      { id: 2, x: 3, y: 3, height: 4, width: 6 }
    ]);

    assert.deepEqual(
      serializeLayout(route.get('currentDashboard.presentation.layout')),
      [
        { widgetId: 1, column: 1, row: 2, height: 5, width: 12 },
        { widgetId: 2, column: 3, row: 3, height: 4, width: 6 }
      ],
      'layout is updaded'
    );

    await settled();
  });

  test('didUpdateLayout - user cannot edit', async function(assert) {
    assert.expect(1);

    const currentDashboard = { canUserEdit: false };
    const TestRoute = class extends DashboardsDashboardRoute {
      currentDashboard = currentDashboard;
      _updateLayout = () => undefined;
      _saveDashboardFn() {
        assert.ok(false, 'Error: _saveDashboardFn method when user cannot edit');
      }
    };
    const route = TestRoute.create();

    route.send('didUpdateLayout', undefined, [1, 2]);
    assert.ok(true, '_saveDashboardFn method is not called');
    await settled();
  });

  test('delete widget - success', async function(assert) {
    assert.expect(4);

    const store = this.owner.lookup('service:store');
    const dashboard = await store.findRecord('dashboard', 1);

    const TestRoute = class extends DashboardsDashboardRoute {
      store = store;
      currentDashboard = dashboard;
      transitionTo(route) {
        assert.equal(
          route,
          'dashboards.dashboard',
          'After deleting a widget, user is transitioned out of any child route'
        );
      }

      saveDashboard(...args) {
        assert.ok(true, 'Dashboard is saved after save is clicked');
        super.saveDashboard(...args);
      }
    };
    const route = TestRoute.create();

    const widgets = await dashboard.get('widgets');
    const originalWidgetCount = widgets.length;

    route.deleteWidget(store.peekRecord('dashboard-widget', 2));
    await settled();

    route.saveDashboard();
    await settled();

    assert.equal(dashboard.widgets.length, originalWidgetCount - 1, 'Dashboard has one less widget after a delete');

    assert.equal(
      dashboard.presentation.layout.find(w => w.widgetId === 2),
      undefined,
      'Dashboard layout no longer has reference to deleted widget'
    );
  });

  test('delete widget - failure', async function(assert) {
    assert.expect(3);

    //Mock Server Endpoint
    server.delete('/dashboards/:id/widgets/:widget_id', () => new Response(500));

    const store = this.owner.lookup('service:store');
    const dashboard = await store.findRecord('dashboard', 1);

    const TestRoute = class extends DashboardsDashboardRoute {
      currentDashboard = dashboard;
      naviNotifications = {
        add({ message }) {
          assert.equal(
            message,
            'OOPS! An error occurred while deleting widget "Mobile DAU Graph"',
            'A notification is sent containing the widget title'
          );
        }
      };
      transitionTo(routeName) {
        assert.equal(routeName, 'dashboards.dashboard', 'transtion back to dashboard after delete');
      }
    };
    const route = TestRoute.create();

    const widgets = await dashboard.get('widgets');
    const originalWidgetCount = widgets.length;

    route.deleteWidget(store.peekRecord('dashboard-widget', 2));
    await settled();

    route.revertDashboard();
    await settled();

    assert.equal(
      dashboard.widgets.length,
      originalWidgetCount,
      'Dashboard still has all widgets after a failed delete revert'
    );

    assert.notEqual(
      dashboard.presentation.layout.find(w => w.widgetId === 2),
      undefined,
      'Dashboard layout still has reference to widget after a failed delete'
    );
  });
});

import { findAll, currentURL, visit } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';

let Application;

module('Acceptance | Add New Widget', function(hooks) {
  hooks.beforeEach(function() {
    Application = startApp();
    wait();
  });

  hooks.afterEach(function() {
    server.shutdown();
    run(Application, 'destroy');
  });

  test('visiting /dashboards/dashboard/widgets/Adds without param', async function(assert) {
    assert.expect(1);

    //Initial state
    await visit('/dashboards/2');

    await visit('/dashboards/1/widgets/add');

    assert.equal(
      currentURL(),
      '/dashboards/1/view',
      'visiting dashboards/1/widgets/add route without params routes to dashboards/1/view'
    );
  });

  test('visiting /dashboards/dashboard/widgets/add with unsavedWidgetId param', async function(assert) {
    assert.expect(6);

    //Check initial state
    await visit('/dashboards/1/');
    assert.dom('.navi-widget').exists({ count: 3 }, 'dashboard 1 initially has 3 widgets');

    assert.notOk(!!findAll('[data-gs-id="6"]').length, 'widget 4 is not present');

    //Make a new widget
    let store = Application.__container__.lookup('service:store'),
      widget = store.peekRecord('dashboard-widget', 1).clone(),
      tempId = widget.get('tempId');

    //Visit somewhere else to test the add route redirect
    await visit('/dashboards/2/');

    await visit(`/dashboards/1/widgets/add?unsavedWidgetId=${tempId}`);

    assert.equal(
      currentURL(),
      '/dashboards/1/view',
      'visiting dashboards/1/widgets/add route redirects to dashboards/1/view'
    );

    assert.dom('.navi-widget').exists({ count: 4 }, 'visiting the add route adds a widget to dashboard 1');

    assert.ok(!!findAll('[data-gs-id="6"]').length, 'widget 4 is present');

    assert.equal(find('[data-gs-id="6"]').data().gsY, 8, 'widget 4 was added to the next available row');
  });
});

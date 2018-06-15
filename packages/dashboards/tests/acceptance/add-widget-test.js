import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';

let Application;

module('Acceptance | Add New Widget', {
  beforeEach: function() {
    Application = startApp();
    wait();
  },

  afterEach: function() {
    server.shutdown();
    Ember.run(Application, 'destroy');
  }
});

test('visiting /dashboards/dashboard/widgets/Adds without param', function(assert) {
  assert.expect(1);

  //Initial state
  visit('/dashboards/2');

  visit('/dashboards/1/widgets/add');

  andThen(function() {
    assert.equal(
      currentURL(),
      '/dashboards/1/view',
      'visiting dashboards/1/widgets/add route without params routes to dashboards/1/view'
    );
  });
});

test('visiting /dashboards/dashboard/widgets/add with unsavedWidgetId param', function(assert) {
  assert.expect(6);

  //Check initial state
  visit('/dashboards/1/');
  andThen(function() {
    assert.equal(
      find('.navi-widget').length,
      3,
      'dashboard 1 initially has 3 widgets'
    );

    assert.notOk(!!find('[data-gs-id="6"]').length, 'widget 4 is not present');

    //Make a new widget
    let store = Application.__container__.lookup('service:store'),
      widget = store.peekRecord('dashboard-widget', 1).clone(),
      tempId = widget.get('tempId');

    //Visit somewhere else to test the add route redirect
    visit('/dashboards/2/');

    visit(`/dashboards/1/widgets/add?unsavedWidgetId=${tempId}`);

    //Check to see that the new widget was added to the dashboard
    andThen(function() {
      assert.equal(
        currentURL(),
        '/dashboards/1/view',
        'visiting dashboards/1/widgets/add route redirects to dashboards/1/view'
      );

      assert.equal(
        find('.navi-widget').length,
        4,
        'visiting the add route adds a widget to dashboard 1'
      );

      assert.ok(!!find('[data-gs-id="6"]').length, 'widget 4 is present');

      assert.equal(
        find('[data-gs-id="6"]').data().gsY,
        8,
        'widget 4 was added to the next available row'
      );
    });
  });
});

import { currentURL, find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { getContext } from '@ember/test-helpers';

module('Acceptance | Add New Widget', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting /dashboards/dashboard/widgets/add without param', async function (assert) {
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

  test('visiting /dashboards/dashboard/widgets/add with unsavedWidgetId param', async function (assert) {
    assert.expect(8);

    //Check initial state
    await visit('/dashboards/1/');
    assert.dom('.navi-widget').exists({ count: 3 }, 'dashboard 1 initially has 3 widgets');

    const NEW_WIDGET_ID = 14;

    assert.dom(`[data-gs-id="${NEW_WIDGET_ID}"]`).doesNotExist('next widget is not present');

    //Make a new widget
    const store = getContext().owner.lookup('service:store');
    const widget = store.peekRecord('dashboard-widget', 1).clone();
    const tempId = widget.get('tempId');

    //Visit somewhere else to test the add route redirect
    await visit('/dashboards/2/');

    await visit(`/dashboards/1/widgets/add?unsavedWidgetId=${tempId}`);

    assert.equal(
      currentURL(),
      `/dashboards/1/view?lastAddedWidgetId=${NEW_WIDGET_ID}`,
      'visiting dashboards/1/widgets/add route redirects to dashboards/1/view'
    );

    assert.dom('.navi-widget').exists({ count: 4 }, 'visiting the add route adds a widget to dashboard 1');

    assert.dom(`[data-gs-id="${NEW_WIDGET_ID}"] .navi-widget__last-added`).exists('next widget is present');

    assert.dom('.navi-widget__last-added').exists({ count: 1 }, 'last added dummy div exists only once');

    assert.true(find('.navi-dashboard__widgets').scrollTop > 0, 'page is scrolled down');

    assert
      .dom(`[data-gs-id="${NEW_WIDGET_ID}"]`)
      .hasAttribute('data-gs-y', '8', '4th widget was added to the next available row');
  });
});

import { click, currentURL, find, findAll, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectChoose } from 'ember-power-select/test-support';

module('Acceptance | Clone Widget', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting the clone widget route', async function (assert) {
    await visit('/dashboards/1');

    assert.dom('.navi-widget').exists({ count: 3 }, 'dashboard initially contains 3 widgets');

    await visit('/dashboards/1/widgets/2/clone');

    const NEW_WIDGET_ID = 14;

    assert.equal(
      currentURL(),
      `/dashboards/1/view?lastAddedWidgetId=${NEW_WIDGET_ID}`,
      'redirects to dashboard view and adds query param correctly'
    );

    assert.dom('.alert.is-danger').doesNotExist('Error notification is not shown');

    assert.dom('.navi-widget').exists({ count: 4 }, 'adds a widget to the dashboard');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent?.trim()),
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table', 'Copy of Mobile DAU Graph'],
      'Dashboard widgets have correct titles'
    );

    assert.dom(`[gs-id="${NEW_WIDGET_ID}"] .navi-widget__last-added`).exists('next widget is present');

    assert.dom('.navi-widget__last-added').exists({ count: 1 }, 'last added dummy div exists only once');

    assert.true(find('.navi-dashboard__widgets').scrollTop > 0, 'page is scrolled down');

    assert
      .dom(`[gs-id="${NEW_WIDGET_ID}"]`)
      .hasAttribute('gs-y', '8', '4th widget was added to the next available row');
  });

  test('visiting the clone widget route with no edit permissions', async function (assert) {
    await visit('/dashboards/4');

    assert.dom('.navi-widget').exists({ count: 1 }, 'dashboard initially contains only 1 widget');

    assert.dom('.navi-widget__clone-btn').doesNotExist('clone widget button does not exist');

    await visit('/dashboards/4/widgets/6/clone');

    assert.equal(currentURL(), '/dashboards/4/view', 'redirects to dashboards/4/view');

    assert
      .dom('.alert.is-danger')
      .hasText('You do not have edit permission for this dashboard.', 'Error notification is shown');

    assert.dom('.navi-widget').exists({ count: 1 }, 'widget has not been added to the dashboard');
  });

  test('clone widget', async function (assert) {
    await visit('/dashboards/1/');
    assert.dom('.navi-widget').exists({ count: 3 }, 'dashboard 1 initially has 3 widgets');

    const NEW_WIDGET_ID = 14;

    assert.dom(`[gs-id="${NEW_WIDGET_ID}"]`).doesNotExist('next widget is not present');

    //Clone widget
    await click(findAll('.navi-widget__clone-btn')[1]);

    assert.equal(
      currentURL(),
      `/dashboards/1/view?lastAddedWidgetId=${NEW_WIDGET_ID}`,
      'cloning widget stays in dashboard view and adds query param correctly'
    );

    assert.dom('.alert.is-danger').doesNotExist('Error notification is not shown');

    assert.dom('.navi-widget').exists({ count: 4 }, 'cloning adds a widget to the dashboard');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent?.trim()),
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table', 'Copy of Mobile DAU Graph'],
      'Dashboard widgets have correct titles'
    );

    assert.dom(`[gs-id="${NEW_WIDGET_ID}"] .navi-widget__last-added`).exists('next widget is present');

    assert.dom('.navi-widget__last-added').exists({ count: 1 }, 'last added dummy div exists only once');

    assert.true(find('.navi-dashboard__widgets').scrollTop > 0, 'page is scrolled down');

    assert
      .dom(`[gs-id="${NEW_WIDGET_ID}"]`)
      .hasAttribute('gs-y', '8', '4th widget was added to the next available row');
  });

  test('clone cloned widget', async function (assert) {
    await visit('/dashboards/1/');
    assert.dom('.navi-widget').exists({ count: 3 }, 'dashboard 1 initially has 3 widgets');

    //Clone widget
    await click(findAll('.navi-widget__clone-btn')[1]);

    const { scrollTop } = find('.navi-dashboard__widgets');

    const NEW_WIDGET_ID = 15;

    //Clone cloned widget
    await click(findAll('.navi-widget__clone-btn')[3]);

    assert.equal(
      currentURL(),
      `/dashboards/1/view?lastAddedWidgetId=${NEW_WIDGET_ID}`,
      'cloning widget stays in dashboard view and adds query param correctly'
    );

    assert.dom('.navi-widget').exists({ count: 5 }, 'cloning adds a widget to the dashboard');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent?.trim()),
      [
        'Mobile DAU Goal',
        'Mobile DAU Graph',
        'Mobile DAU Table',
        'Copy of Mobile DAU Graph',
        'Copy of Copy of Mobile DAU Graph',
      ],
      'Dashboard widgets have correct titles'
    );

    assert.dom(`[gs-id="${NEW_WIDGET_ID}"] .navi-widget__last-added`).exists('next widget is present');

    assert.dom('.navi-widget__last-added').exists({ count: 1 }, 'last added dummy div exists only once');

    assert.true(find('.navi-dashboard__widgets').scrollTop > scrollTop, 'page is scrolled further down');

    assert
      .dom(`[gs-id="${NEW_WIDGET_ID}"]`)
      .hasAttribute('gs-y', '8', '5th widget was added to the next available space');

    assert
      .dom(`[gs-id="${NEW_WIDGET_ID}"]`)
      .hasAttribute('gs-x', '5', '5th widget was added to the next available space');
  });

  test('clone newly added widget', async function (assert) {
    await visit('/dashboards/1/');
    assert.dom('.navi-widget').exists({ count: 3 }, 'dashboard 1 initially has 3 widgets');

    let NEW_WIDGET_ID = 14;

    assert.dom(`[gs-id="${NEW_WIDGET_ID}"]`).doesNotExist('next widget is not present');

    //Add new widget
    await click('.dashboard-header__add-widget-btn');
    await selectChoose('.add-widget__report-select-trigger', 'Report 12');
    await click('.add-widget__add-btn');

    assert.equal(
      currentURL(),
      `/dashboards/1/view?lastAddedWidgetId=${NEW_WIDGET_ID}`,
      'adding a widget stays in dashboard view and adds query param correctly (1)'
    );

    assert.dom('.navi-widget').exists({ count: 4 }, 'widget is added to the dashboard (1)');

    assert.dom(`[gs-id="${NEW_WIDGET_ID}"] .navi-widget__last-added`).exists('next widget is present (1)');

    assert.dom('.navi-widget__last-added').exists({ count: 1 }, 'last added dummy div exists only once (1)');

    const { scrollTop } = find('.navi-dashboard__widgets');
    assert.true(scrollTop > 0, 'page is scrolled down');

    assert
      .dom(`[gs-id="${NEW_WIDGET_ID}"]`)
      .hasAttribute('gs-y', '8', '4th widget was added to the next available row');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent?.trim()),
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table', 'Report 12'],
      'Dashboard widgets have correct titles (1)'
    );

    NEW_WIDGET_ID++;

    //Clone widget
    await click(findAll('.navi-widget__clone-btn')[3]);

    assert.equal(
      currentURL(),
      `/dashboards/1/view?lastAddedWidgetId=${NEW_WIDGET_ID}`,
      'cloning widget stays in dashboard view and adds query param correctly (2)'
    );

    assert.dom('.navi-widget').exists({ count: 5 }, 'cloning adds a widget to the dashboard');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent?.trim()),
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table', 'Report 12', 'Copy of Report 12'],
      'Dashboard widgets have correct titles (2)'
    );

    assert.dom(`[gs-id="${NEW_WIDGET_ID}"] .navi-widget__last-added`).exists('next widget is present (2)');

    assert.dom('.navi-widget__last-added').exists({ count: 1 }, 'last added dummy div exists only once (2)');

    assert.true(find('.navi-dashboard__widgets').scrollTop > scrollTop, 'page is scrolled further down');

    assert
      .dom(`[gs-id="${NEW_WIDGET_ID}"]`)
      .hasAttribute('gs-y', '8', '5th widget was added to the next available space');

    assert
      .dom(`[gs-id="${NEW_WIDGET_ID}"]`)
      .hasAttribute('gs-x', '5', '5th widget was added to the next available space');
  });

  test('clone after changing filters', async function (assert) {
    await visit('/dashboards/2/');
    assert.dom('.navi-widget').exists({ count: 2 }, 'dashboard initially has 2 widgets');

    //change filters
    await click('.dashboard-filters__expand-button');
    await click(findAll('.filter-collection__remove')[1]);

    let NEW_WIDGET_ID = 14;

    assert.dom(`[gs-id="${NEW_WIDGET_ID}"]`).doesNotExist('next widget is not present');

    //Clone widget
    await click('.navi-widget__clone-btn');

    assert.ok(
      currentURL().match(/^\/dashboards\/2\/view\?filters=.+&lastAddedWidgetId=14$/),
      'cloning widget stays in dashboard view and adds query param correctly'
    );

    assert.dom('.navi-widget').exists({ count: 3 }, 'cloning adds a widget to the dashboard');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent?.trim()),
      ['Clicks', 'Last Week By OS', 'Copy of Clicks'],
      'Dashboard widgets have correct titles'
    );

    assert.dom(`[gs-id="${NEW_WIDGET_ID}"] .navi-widget__last-added`).exists('next widget is present');

    assert.dom('.navi-widget__last-added').exists({ count: 1 }, 'last added dummy div exists only once');

    assert.true(find('.navi-dashboard__widgets').scrollTop > 0, 'page is scrolled down');

    assert
      .dom(`[gs-id="${NEW_WIDGET_ID}"]`)
      .hasAttribute('gs-y', '11', '3rd widget was added to the next available space');

    assert
      .dom(`[gs-id="${NEW_WIDGET_ID}"]`)
      .hasAttribute('gs-x', '0', '3rd widget was added to the next available space');
  });

  test('delete cloned widget', async function (assert) {
    await visit('/dashboards/2/');
    assert.dom('.navi-widget').exists({ count: 2 }, 'dashboard initially has 2 widgets');

    let NEW_WIDGET_ID = 14;

    assert.dom(`[gs-id="${NEW_WIDGET_ID}"]`).doesNotExist('next widget is not present');

    //Clone widget
    await click('.navi-widget__clone-btn');

    assert.equal(
      currentURL(),
      `/dashboards/2/view?lastAddedWidgetId=${NEW_WIDGET_ID}`,
      'cloning widget stays in dashboard view and adds query param correctly'
    );

    assert.dom('.navi-widget').exists({ count: 3 }, 'cloning adds a widget to the dashboard');

    //remove cloned widget
    await click(findAll('.navi-widget__delete-btn')[2]);
    await click('.delete__modal-delete-btn');

    assert.equal(currentURL(), `/dashboards/2/view`, 'query param is removed');

    assert.dom('.navi-widget').exists({ count: 2 }, 'dashboard is back to 2 widgets');
  });
});

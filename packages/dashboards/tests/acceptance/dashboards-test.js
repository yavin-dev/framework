import { click, currentURL, fillIn, find, findAll, triggerEvent, visit } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import config from 'ember-get-config';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'ember-cli-mirage';
import { selectChoose } from 'ember-power-select/test-support';
import $ from 'jquery';

module('Acceptance | Dashboards', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('dashboard success', async function(assert) {
    assert.expect(2);

    await visit('/dashboards/1');
    assert.dom('.error').doesNotExist('Error message not present when route is successfully loaded');
    assert
      .dom('.navi-dashboard')
      .exists('the dashboard collection component is rendered when route is successfully loaded');
  });

  test('dashboard error', async function(assert) {
    assert.expect(2);

    this.urlPrefix = config.navi.appPersistence.uri;
    server.get('/dashboards/:id', () => new Response(500));

    await visit('/dashboards/1');
    assert.dom('.error').exists('Error message not present when route is successfully loaded');

    assert.dom('.navi-dashboard').doesNotExist('Navi dashboard collection component is not rendered');
  });

  test('dashboard loading', async function(assert) {
    assert.expect(1);

    await visit('/dashboards/loading');

    assert.dom('.loader-container').exists('Loader is present when visiting loading route');
  });

  test('updates to dashboard layout', async function(assert) {
    assert.expect(2);

    await visit('/dashboards/1');

    const route = this.owner.lookup('route:dashboards.dashboard');
    const layout = route.currentDashboard.presentation.layout;

    assert.deepEqual(
      layout,
      [
        { column: 0, height: 4, row: 0, widgetId: 1, width: 6 },
        { column: 6, height: 4, row: 0, widgetId: 2, width: 6 },
        { column: 0, height: 4, row: 4, widgetId: 3, width: 12 }
      ],
      'Original layout property is correct'
    );

    //swap widget rows
    const grid = $('.grid-stack').data('gridstack');
    const items = findAll('.grid-stack-item');
    run(() => grid.move(items[2], 0, 0));

    assert.deepEqual(
      layout,
      [
        { column: 0, height: 4, row: 4, widgetId: 1, width: 6 },
        { column: 6, height: 4, row: 4, widgetId: 2, width: 6 },
        { column: 0, height: 4, row: 0, widgetId: 3, width: 12 }
      ],
      "Moving widget locations updates the dashboard's layout property"
    );
  });

  test('empty dashboard', async function(assert) {
    assert.expect(2);

    await visit('/dashboards/5');

    assert.equal(
      find('.error-container .error')
        .textContent.replace(/\s\s+/g, ' ')
        .trim(),
      'Looks like this dashboard has no widgets. Go ahead and add a widget now?'
    );

    await click('.navi-dashboard-container__add-widget-text');
    assert.dom('.ember-modal-dialog').isVisible('Add Widget Dialog box is visible when `add a widget` text is clicked');
  });

  test('index route', async function(assert) {
    assert.expect(1);

    await visit('/dashboards');

    let titles = findAll('.navi-collection .table tr td:first-of-type').map(el => el.textContent.trim());

    assert.deepEqual(
      titles,
      ['Tumblr Goals Dashboard', 'Dashboard 2', 'Empty Dashboard'],
      'the dashboard collection component with `navi-users`s dashboards is shown'
    );
  });

  test('index route actions', async function(assert) {
    assert.expect(4);

    await visit('/dashboards');

    //https://github.com/emberjs/ember-test-helpers/issues/343
    await triggerEvent('.navi-collection__row:first-of-type', 'mouseover');

    // Click "Share"
    await click('.navi-collection__row:first-of-type .share .btn');

    assert.dom('.navi-collection__actions .action').exists({ count: 5 }, 'The second column contains five actions');

    assert
      .dom('.primary-header')
      .hasText('Share "Tumblr Goals Dashboard"', 'Share modal pops up when action is clicked');

    // Cancel modal and click "Delete"
    await click($('button:contains(Cancel)')[0]);
    await click('.navi-collection__row:first-of-type .delete button');

    assert
      .dom('.primary-header')
      .hasText('Delete "Tumblr Goals Dashboard"', 'Delete modal pops up when action is clicked');

    // Cancel modal and click "Clone"
    await click($('button:contains(Cancel)')[0]);
    await click('.navi-icon__copy');

    assert.equal(currentURL(), '/dashboards/6/view', 'A dashboard is cloned when the action is clicked');
  });

  test('Add new dashboard in index route', async function(assert) {
    assert.expect(2);

    await visit('/dashboards');
    await click('.dashboards-index__new-btn');

    assert
      .dom('.navi-dashboard .page-title')
      .hasText('Untitled Dashboard', 'Adding new dashboard in dashboards route transitions to new dasboard');

    await visit('/dashboards');

    let titles = findAll('.navi-collection .table tr td:first-of-type').map(el => el.textContent.trim());

    assert.deepEqual(
      titles,
      ['Tumblr Goals Dashboard', 'Dashboard 2', 'Empty Dashboard', 'Untitled Dashboard'],
      'The New Dashboard is shown along with `navi-user`s other dashboards '
    );
  });

  test('add widget button', async function(assert) {
    assert.expect(4);

    await visit('/dashboards/4');

    assert
      .dom('.add-widget button')
      .isNotVisible('The `Add Widget` button is not visible when user cannot edit the dashboard');

    await visit('/dashboards/5');

    assert.dom('.add-widget button').isVisible('The `Add Widget` button is visible when user can edit the dashboard');

    await click('.add-widget .btn');

    assert.equal(
      find('.add-widget-modal .btn').getAttribute('href'),
      `/dashboards/5/widgets/new`,
      'Create new assigns the new widget route to the primary button'
    );

    await selectChoose('.report-select', 'Report 12');

    assert.equal(
      find('.add-widget-modal .btn').getAttribute('href'),
      `/reports/4`,
      'Selecting a report assigns the route `/reports/${id}` to the primary button where id is the id of the report'
    );
  });

test('Collapsed filters render on load', async function(assert) {
  assert.expect(3);

  await visit('/dashboards/1');

  assert.dom('.dashboard-filters')
    .hasText('Settings', 'only settings label is rendered when no filters are associated with dashboard');

  await visit('/dashboards/2');

  const filters = find('.dashboard-filters-collapsed-filter')
    .map(el => el.textContent.replace(/\s+/g, ' ').trim());

  assert.equal(filters.length, 3, 'correct number of filters');

  assert.ok(
    filters.every(filter => /^Property (contains|not equals|equals) (.*?\d+.*?)(, .*?\d+.*?)*$/.test(filter)),
    'correct format of filters');
});

test('Delete a dashboard', function(assert) {
  assert.expect(3);

  test('Delete a dashboard', function(assert) {
    assert.expect(3);

    await visit('/dashboards');

    const initialTitles = findAll('.navi-collection .table tr td:first-of-type').map(el => el.textContent.trim());

    assert.deepEqual(
      initialTitles,
      ['Tumblr Goals Dashboard', 'Dashboard 2', 'Empty Dashboard'],
      '`navi-user`s dashboard are shown '
    );

    await visit('/dashboards/2');

    await click('.dashboard-actions .delete > button');
    await click($('button:contains(Confirm)')[0]);
    assert.equal(currentURL(), '/dashboards', 'Deleting a dashboard transitions to index route');

    const newTitles = findAll('.navi-collection .table tr td:first-of-type').map(el => el.textContent.trim());

    assert.deepEqual(
      newTitles,
      ['Tumblr Goals Dashboard', 'Empty Dashboard'],
      '`navi-user`s dashboard are shown after deleting `Dashboard 2`'
    );
  });

  test('favorite dashboards', async function(assert) {
    assert.expect(2);

    // Favorite dashboard 2
    await visit('/dashboards/2');
    await click('.navi-dashboard__fav-icon');

    // Filter by favorites
    await visit('/dashboards');
    await click($('.pick-form li:contains(Favorites)')[0]);

    const dashboardBefore = findAll('tbody tr td:first-of-type').map(el => el.textContent.trim());

    assert.deepEqual(dashboardBefore, ['Tumblr Goals Dashboard', 'Dashboard 2'], 'Two dashboards are in favories now');

    // Unfavorite dashboard 1
    await click($('tbody tr td a:contains(Tumblr Goals Dashboard)')[0]);
    await click('.navi-dashboard__fav-icon');
    await visit('/dashboards');
    await click($('.pick-form li:contains(Favorites)')[0]);

    const dashboardsAfter = findAll('tbody tr td:first-of-type').map(el => el.textContent.trim());

    assert.deepEqual(dashboardsAfter, ['Dashboard 2'], 'Only one dashboard is in favories now');
  });

  test('favorite dashboard - rollback on failure', async function(assert) {
    assert.expect(1);

    // Mock server path endpoint to mock failure
    server.patch('/users/:id', () => {
      return new Response(500);
    });

    /* == mark dashboard as favorite == */
    await visit('/dashboards/3');
    await click('.navi-dashboard__fav-icon');

    /* == list favorites in list view == */
    await visit('/dashboards');
    await click($('.pick-form li:contains(Favorites)')[0]);

    const listedDashboards = findAll('tbody tr td:first-of-type').map(el => el.textContent.trim());

    assert.deepEqual(listedDashboards, ['Tumblr Goals Dashboard'], 'The user state is rolled back on failure');
  });

  test('clone dashboard', async function(assert) {
    assert.expect(3);

    let originalDashboardTitle, originalWidgetTitles;

    await visit('/dashboards/2');

    originalDashboardTitle = find('.page-title .clickable').textContent.trim();

    originalWidgetTitles = findAll('.navi-widget__title').map(el => el.textContent.trim());

    await click('.navi-icon__copy');

    assert.equal(currentURL(), '/dashboards/6/view', 'Cloning a dashboard transitions to newly made dashboard');

    assert
      .dom('.page-title .clickable')
      .hasText(
        `Copy of ${originalDashboardTitle}`,
        'Cloned dashboard has the same title as Original dashboard with `copy of` prefix title'
      );

    assert.deepEqual(
      findAll('.navi-widget__title').map(el => el.textContent.trim()),
      originalWidgetTitles,
      'Cloned widgets are present in the dashboard '
    );
  });

  test('clone dashboard on failure', async function(assert) {
    assert.expect(1);

    server.post('/dashboards/', () => {
      return new Response(500);
    });

    await visit('/dashboards/2');

    click('.navi-icon__copy').then(() => {
      assert.equal(currentURL(), '/dashboards', 'Transition to `dashboards` route on failed cloning action');
    });
  });

  test('New widget', async function(assert) {
    assert.expect(4);

    // Check original set of widgets
    await visit('/dashboards/1');
    const widgetsBefore = findAll('.navi-widget__title').map(el => el.textContent.trim());

    assert.deepEqual(
      widgetsBefore,
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table'],
      '"Untitled Widget" is not initially present on dashboard'
    );

    // Create new widget
    await click('.add-widget .btn');
    await click('.add-widget-modal .add-to-dashboard');

    // Fill out request
    await click($('.checkbox-selector--metric .grouped-list__item:contains(Total Clicks) label')[0]);
    await click('.navi-report-widget__run-btn');
    // Regex to check that a string ends with "{uuid}/view"
    const TempIdRegex = /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/view$/;

    assert.ok(TempIdRegex.test(currentURL()), 'Creating a widget brings user to /view route with a temp id');

    // Save
    await click('.navi-report-widget__save-btn');
    assert.ok(
      currentURL().endsWith('/dashboards/1/view'),
      'After saving for the first time, user is brought back to dashboard view'
    );

    let widgetsAfter = findAll('.navi-widget__title').map(el => el.textContent.trim());

    assert.deepEqual(
      widgetsAfter,
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table', 'Untitled Widget'],
      '"Untitled Widget" has been added to dashboard'
    );
  });

  test('Failing to save a new widget', async function(assert) {
    assert.expect(2);

    server.patch('/dashboards/1', () => {
      return new Response(500);
    });

    // Create and save
    await visit('/dashboards/1/widgets/new');
    await click($('.checkbox-selector--metric .grouped-list__item:contains(Total Clicks) label')[0]);
    await click('.navi-report-widget__run-btn');
    await click('.navi-report-widget__save-btn');
    assert.ok(
      currentURL().endsWith('/dashboards'),
      'User ends up on dashboards route when there is an error adding a widget'
    );

    await visit('/dashboards/1');
    assert.dom('.navi-widget').exists({ count: 3 }, 'The new widget was never added to the dashboard');
  });

  test('Editing dashboard title', async function(assert) {
    assert.expect(2);

    // Edit title of the dashboard
    await visit('/dashboards/1');
    await click('.editable-label__icon');
    await fillIn('.editable-label__input', 'A new title');
    await triggerEvent('.editable-label__input', 'blur');

    assert
      .dom('.navi-dashboard .page-title')
      .hasText('A new title', 'New Dashboard title is persisted with value `A new title` ');

    //Not Editor
    await visit('/dashboards/3');
    assert.dom('.editable-label__icon').isNotVisible('Edit icon is not available if user is not the editor');
  });

  test('Unauthorized widget', async function(assert) {
    assert.expect(2);

    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.get('/data/network/day/os', function() {
      return new Response(403);
    });

    await visit('/dashboards/2/view');
    assert
      .dom('[data-gs-id="4"] .navi-widget__content')
      .hasClass('visualization-container', 'Widget shows visualization for authorized table');

    assert
      .dom('[data-gs-id="5"]')
      .includesText(
        'You do not have access to run queries against Network',
        'Unauthorized widget loaded unauthorized component'
      );
  });
});

import { click, currentURL, fillIn, find, findAll, visit, blur, waitFor } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import config from 'ember-get-config';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'ember-cli-mirage';
import { selectChoose } from 'ember-power-select/test-support';
import { clickItem } from 'navi-reports/test-support/report-builder';
import $ from 'jquery';

let confirm;

module('Acceptance | Dashboards', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(() => {
    confirm = window.confirm;
  });

  hooks.afterEach(() => {
    window.confirm = confirm;
  });

  test('dashboard success', async function (assert) {
    assert.expect(5);

    await visit('/dashboards/1');
    assert.dom('.error').doesNotExist('Error message not present when route is successfully loaded');
    assert.dom('.navi-dashboard').exists('the dashboard component is rendered when route is successfully loaded');
    assert.dom('.navi-widget__content .goal-gauge-widget').exists('the goal gauge widget is rendered');
    assert.dom('.navi-widget__content .line-chart-widget').exists('the line chart widget is rendered');
    assert.dom('.navi-widget__content .table-widget').exists('the table widget is rendered');
  });

  test('dashboard error', async function (assert) {
    assert.expect(2);

    this.urlPrefix = config.navi.appPersistence.uri;
    server.get('/dashboards/:id', () => new Response(500));

    await visit('/dashboards/1');
    assert.dom('.error').exists('Error message not present when route is successfully loaded');

    assert.dom('.navi-dashboard').doesNotExist('Navi dashboard collection component is not rendered');
  });

  test('dashboard loading', async function (assert) {
    assert.expect(1);

    await visit('/dashboards/loading');

    assert.dom('.loader-container').exists('Loader is present when visiting loading route');
  });

  test('navigating between dashboards', async function (assert) {
    assert.expect(5);

    let dataRequestsCount = 0;
    server.pretender.handledRequest = (_, url) => {
      if (url.includes('/v1/data')) {
        dataRequestsCount++;
      }
    };

    visit('/dashboards/1');

    //navigate to index route before widgets finish loading
    await waitFor('.dashboard-header__breadcrumb-link', { timeout: 40000 });
    assert.dom('.navi-widget__content.loader-container').exists({ count: 3 });
    await click('.dashboard-header__breadcrumb-link');
    //navigate to `Dashboard 2`
    await click('.navi-collection__row1 td:first-child a');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent.trim()),
      ['Clicks', 'Last Week By OS'],
      'Widgets of `Dashboard 2` are successfully rendered'
    );
    assert
      .dom('.navi-widget__content .line-chart-widget')
      .exists('the line chart widget of `Dashboard 2` is successfully loaded');
    assert
      .dom('.navi-widget__content .table-widget')
      .exists('the table widget of `Dashboard 2` is successfully loaded');
    assert.equal(dataRequestsCount, 4, 'only 4 requests were fired (third request of first dashboard was canceled)');
  });

  test('updates to dashboard layout', async function (assert) {
    assert.expect(5);

    await visit('/dashboards/4');

    //trigger a change
    const singlegrid = find('.grid-stack').gridstack;
    const item = findAll('.grid-stack-item')[0];
    run(() => {
      singlegrid.resize(item, 12, 4);
    });

    assert
      .dom('.navi-dashboard__save-button')
      .isNotVisible('Save button is not visible when user cannot edit the dashboard.');

    assert
      .dom('.navi-dashboard__revert-button')
      .isVisible('Revert button is visible even when user cannot edit the dashboard.');

    await visit('/dashboards/1');

    const route = this.owner.lookup('route:dashboards.dashboard');

    assert.deepEqual(
      route.currentDashboard.presentation.layout.serialize(),
      [
        { column: 0, height: 4, row: 0, widgetId: 1, width: 6 },
        { column: 6, height: 4, row: 0, widgetId: 2, width: 6 },
        { column: 0, height: 4, row: 4, widgetId: 3, width: 12 },
      ],
      'Original layout property is correct'
    );

    //swap widget rows
    const grid = find('.grid-stack').gridstack;
    const items = findAll('.grid-stack-item');

    run(() => {
      grid.move(items[2], 0, 0);
    });

    assert.deepEqual(
      route.currentDashboard.presentation.layout.serialize(),
      [
        { column: 0, height: 4, row: 4, widgetId: 1, width: 6 },
        { column: 6, height: 4, row: 4, widgetId: 2, width: 6 },
        { column: 0, height: 4, row: 0, widgetId: 3, width: 12 },
      ],
      "Moving widget locations updates the dashboard's layout property"
    );

    assert.dom('.navi-dashboard__save-button').isVisible('Save button is visible when user can edit the dashboard.');
  });

  test('empty dashboard', async function (assert) {
    assert.expect(2);

    await visit('/dashboards/5');

    assert.equal(
      find('.error-container .error').textContent.replace(/\s\s+/g, ' ').trim(),
      'Looks like this dashboard has no widgets. Go ahead and add a widget now?'
    );

    await click('.dashboard-header__add-widget-btn');
    assert.dom('.add-widget__modal').exists('Add Widget Dialog box is visible when `add a widget` text is clicked');
  });

  test('index route', async function (assert) {
    assert.expect(1);

    await visit('/dashboards');

    let titles = findAll('.navi-collection .table tr td:first-of-type').map((el) => el.textContent.trim());

    assert.deepEqual(
      titles,
      ['Tumblr Goals Dashboard', 'Dashboard 2', 'Empty Dashboard'],
      'the dashboard collection component with `navi-users`s dashboards is shown'
    );
  });

  test('Add new dashboard in index route', async function (assert) {
    assert.expect(2);

    await visit('/dashboards');
    await click('.dashboards-index__new-btn');

    assert
      .dom('.dashboard-header__page-title')
      .hasText('Untitled Dashboard', 'Adding new dashboard in dashboards route transitions to new dasboard');

    await visit('/dashboards');

    let titles = findAll('.navi-collection .table tr td:first-of-type').map((el) => el.textContent.trim());

    assert.deepEqual(
      titles,
      ['Tumblr Goals Dashboard', 'Dashboard 2', 'Empty Dashboard', 'Untitled Dashboard'],
      'The New Dashboard is shown along with `navi-user`s other dashboards '
    );
  });

  test('add widget button', async function (assert) {
    assert.expect(5);

    await visit('/dashboards/4');

    assert
      .dom('.dashboard-header__add-widget-btn')
      .isNotVisible('The `Add Widget` button is not visible when user cannot edit the dashboard');

    await visit('/dashboards/1');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent.trim()),
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table'],
      'There are 3 widgets in the dashboard'
    );

    assert
      .dom('.dashboard-header__add-widget-btn')
      .isVisible('The `Add Widget` button is visible when user can edit the dashboard');

    await click('.dashboard-header__add-widget-btn');
    assert
      .dom('.add-widget__new-btn')
      .hasAttribute(
        'href',
        `/dashboards/1/widgets/new`,
        'Create new assigns the new widget route to the primary button'
      );

    await selectChoose('.add-widget__report-select-trigger', 'Report 12');
    await click('.add-widget__add-btn');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent.trim()),
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table', 'Report 12'],
      'The widget is added to the dashboard'
    );
  });

  test('Collapsed filters render on load', async function (assert) {
    assert.expect(3);

    await visit('/dashboards/1');

    assert
      .dom('.dashboard-filters')
      .hasText('Filters', 'only filters label is rendered when no filters are associated with dashboard');

    await visit('/dashboards/2');

    const filters = findAll('.filter-collection--collapsed-item').map((el) =>
      el.textContent.replace(/\s+/g, ' ').trim()
    );

    assert.equal(filters.length, 4, 'correct number of filters');

    assert.ok(
      filters.every((filter) =>
        /^(Property|EventId) \(id\) (contains|not equals|equals) (.*?\d+.*?)( .*?\d+.*?)*$/.test(filter)
      ),
      'correct format of filters'
    );
  });

  test('Delete a dashboard', async function (assert) {
    assert.expect(3);

    await visit('/dashboards');

    const initialTitles = findAll('.navi-collection .table tr td:first-of-type').map((el) => el.textContent.trim());

    assert.deepEqual(
      initialTitles,
      ['Tumblr Goals Dashboard', 'Dashboard 2', 'Empty Dashboard'],
      '`navi-user`s dashboard are shown '
    );

    await visit('/dashboards/2');

    await click('.delete__action-btn');
    await click('.delete__delete-btn');
    assert.equal(currentURL(), '/dashboards', 'Deleting a dashboard transitions to index route');

    const newTitles = findAll('.navi-collection .table tr td:first-of-type').map((el) => el.textContent.trim());

    assert.deepEqual(
      newTitles,
      ['Tumblr Goals Dashboard', 'Empty Dashboard'],
      '`navi-user`s dashboard are shown after deleting `Dashboard 2`'
    );
  });

  test('favorite dashboards', async function (assert) {
    assert.expect(2);

    // Favorite dashboard 2
    await visit('/dashboards/2');
    await click('.dashboard-header__fav-icon');

    // Filter by favorites
    await visit('/dashboards');
    await selectChoose('.navi-collection__filter-trigger', 'Favorites');

    const dashboardBefore = findAll('tbody tr td:first-of-type').map((el) => el.textContent.trim());

    assert.deepEqual(dashboardBefore, ['Tumblr Goals Dashboard', 'Dashboard 2'], 'Two dashboards are in favories now');

    // Unfavorite dashboard 1
    await click($('tbody tr td a:contains(Tumblr Goals Dashboard)')[0]);
    await click('.dashboard-header__fav-icon');
    await visit('/dashboards');
    await selectChoose('.navi-collection__filter-trigger', 'Favorites');

    const dashboardsAfter = findAll('tbody tr td:first-of-type').map((el) => el.textContent.trim());

    assert.deepEqual(dashboardsAfter, ['Dashboard 2'], 'Only one dashboard is in favories now');
  });

  test('favorite dashboard - rollback on failure', async function (assert) {
    assert.expect(1);

    // Mock server path endpoint to mock failure
    server.patch('/users/:id', () => new Response(500));

    /* == mark dashboard as favorite == */
    await visit('/dashboards/3');
    await click('.dashboard-header__fav-icon');

    /* == list favorites in list view == */
    await visit('/dashboards');
    await selectChoose('.navi-collection__filter-trigger', 'Favorites');

    const listedDashboards = findAll('tbody tr td:first-of-type').map((el) => el.textContent.trim());

    assert.deepEqual(listedDashboards, ['Tumblr Goals Dashboard'], 'The user state is rolled back on failure');
  });

  test('clone dashboard', async function (assert) {
    assert.expect(3);

    let originalDashboardTitle, originalWidgetTitles;

    await visit('/dashboards/2');

    originalDashboardTitle = find('.dashboard-header__page-title .clickable').textContent.trim();

    originalWidgetTitles = findAll('.navi-widget__title').map((el) => el.textContent.trim());

    await click('.dashboard-header__clone-btn');

    assert.equal(currentURL(), '/dashboards/7/view', 'Cloning a dashboard transitions to newly made dashboard');

    assert
      .dom('.dashboard-header__page-title .clickable')
      .hasText(
        `Copy of ${originalDashboardTitle}`,
        'Cloned dashboard has the same title as Original dashboard with `copy of` prefix title'
      );

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent.trim()),
      originalWidgetTitles,
      'Cloned widgets are present in the dashboard '
    );
  });

  test('clone dashboard on failure', async function (assert) {
    assert.expect(1);

    server.post('/dashboards/', () => new Response(500));

    await visit('/dashboards/2');

    click('.dashboard-header__clone-btn').then(() => {
      assert.equal(currentURL(), '/dashboards', 'Transition to `dashboards` route on failed cloning action');
    });
  });

  test('New widget', async function (assert) {
    assert.expect(15);

    // Check original set of widgets
    await visit('/dashboards/1');
    const widgetsBefore = findAll('.navi-widget__title').map((el) => el.textContent.trim());

    assert.deepEqual(
      widgetsBefore,
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table'],
      '"Untitled Widget" is not initially present on dashboard'
    );

    // Create new widget
    await click('.dashboard-header__add-widget-btn');
    await click('.add-widget__new-btn');

    // Fill out request
    await selectChoose('.filter-builder__operator-trigger', 'In The Past');
    await clickItem('dimension', 'Date Time');
    await selectChoose('.navi-column-config-item__parameter-trigger', 'Day');
    await clickItem('metric', 'Total Clicks');

    // Save without running
    await click('.navi-report-widget__save-btn');
    assert.ok(
      currentURL().endsWith('/dashboards/1/view'),
      'After saving without running, user is brought back to dashboard view'
    );

    let widgetsAfter = findAll('.navi-widget__title').map((el) => el.textContent.trim());

    assert.deepEqual(
      widgetsAfter,
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table', 'Untitled Widget'],
      '"Untitled Widget" has been added to dashboard'
    );

    let widgetColumns = findAll('.navi-widget:nth-child(4) .table-header-cell').map((el) => el.textContent.trim());

    assert.deepEqual(
      widgetColumns,
      ['Date Time (day)', 'Total Clicks'],
      'Table columns for the new widget are rendered correctly'
    );

    // Create another new widget
    await click('.dashboard-header__add-widget-btn');
    await click('.add-widget__new-btn');

    // Fill out request
    await selectChoose('.filter-builder__operator-trigger', 'In The Past');
    await clickItem('dimension', 'Date Time');
    await selectChoose('.navi-column-config-item__parameter-trigger', 'Day');
    await clickItem('metric', 'Total Page Views');

    // Run request
    await click('.navi-report-widget__run-btn');
    // Regex to check that a string ends with "{uuid}/view"
    const TempIdRegex = /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/view$/;

    assert.ok(TempIdRegex.test(currentURL()), 'Creating a widget brings user to /view route with a temp id');

    // Save
    await click('.navi-report-widget__save-btn');
    assert.ok(currentURL().endsWith('/dashboards/1/view'), 'After saving, user is brought back to dashboard view');

    widgetsAfter = findAll('.navi-widget__title').map((el) => el.textContent.trim());

    assert.deepEqual(
      widgetsAfter,
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table', 'Untitled Widget', 'Untitled Widget'],
      'Another "Untitled Widget" has been added to dashboard'
    );

    widgetColumns = findAll('.navi-widget:nth-child(5) .table-header-cell').map((el) => el.textContent.trim());

    assert.deepEqual(
      widgetColumns,
      ['Date Time (day)', 'Total Page Views'],
      'Table columns for the second new widget are rendered correctly'
    );

    // hover css events are hard
    find('.navi-widget__actions').style.visibility = 'visible';
    await click('.navi-widget__explore-btn');

    assert.equal(currentURL(), '/dashboards/1/widgets/1/view', 'Taken to explore widget page');

    await click(findAll('.navi-report-widget__breadcrumb-link')[1]);

    assert.equal(currentURL(), '/dashboards/1/view', 'Taken back to dashboard page');

    assert.deepEqual(
      widgetsAfter,
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table', 'Untitled Widget', 'Untitled Widget'],
      '"Untitled Widget"s are still on dashboard after navigating to subroute'
    );

    window.confirm = () => {
      assert.step('navigation confirmation denied');
      return false;
    };

    await click('.dashboard-header__breadcrumb-link');

    assert.equal(currentURL(), '/dashboards/1/view', 'We are still on the dashboard route');

    await click('.navi-dashboard__save-button');
    await click('.dashboard-header__breadcrumb-link');

    assert.equal(currentURL(), '/dashboards', 'successfully navigated away with no unsaved changes');

    assert.verifySteps(['navigation confirmation denied']);
  });

  test('Failing to save a new widget', async function (assert) {
    assert.expect(8);

    server.patch('/dashboards/1', (_, request) => {
      assert.equal(
        request.requestHeaders['Content-Type'],
        'application/vnd.api+json',
        'Request header content-type is correct JSON-API mime type'
      );
      assert.equal(
        request.requestHeaders.Accept,
        'application/vnd.api+json',
        'Request header accept is correct JSON-API mime type'
      );

      return new Response(500);
    });

    // Create widget
    await visit('/dashboards/1/widgets/new');

    // Build Request
    await selectChoose('.filter-builder__operator-trigger', 'In The Past');
    await clickItem('dimension', 'Date Time');
    await selectChoose('.navi-column-config-item__parameter-trigger', 'Day');
    await clickItem('metric', 'Total Clicks');

    // Save
    await click('.navi-report-widget__run-btn');
    await click('.navi-report-widget__save-btn');

    assert.dom('.navi-notifications').hasText('', 'No notifications before save.');

    await click('.navi-dashboard__save-button');

    assert
      .dom('.alert.is-danger')
      .hasText(
        'An error occurred while trying to save your dashboard.',
        'The a navi notification appears for the error.'
      );

    assert.dom('.navi-dashboard__save-button').isVisible('Save button sticks around after failure.');

    assert.dom('.navi-widget').exists({ count: 4 }, 'The new widget was added to the dashboard');

    await click('.navi-dashboard__revert-button');

    assert.dom('.navi-widget').exists({ count: 3 }, 'The new widget vanishes after revert');

    assert.dom('.navi-dashboard__save-button').isNotVisible('Save button vanishes after revert.');
  });

  test('Editing dashboard title', async function (assert) {
    assert.expect(2);

    // Edit title of the dashboard
    await visit('/dashboards/1');
    await click('.editable-label__icon');
    await fillIn('.editable-label__input', 'A new title');
    await blur('.editable-label__input');

    assert
      .dom('.dashboard-header__page-title')
      .hasText('A new title', 'New Dashboard title is persisted with value `A new title` ');

    //Not Editor
    await visit('/dashboards/3');
    assert.dom('.editable-label__icon').isNotVisible('Edit icon is not available if user is not the editor');
  });

  test('Unauthorized widget', async function (assert) {
    assert.expect(2);

    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.get('/data/network/day/os;show=id', function () {
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

  test('dashboard save/revert', async function (assert) {
    assert.expect(10);

    server.patch('/dashboards/1', () => {
      assert.notOk(true, 'Dashboard should not be patched before save.');
      return new Response(500);
    });

    await visit('/dashboards/1');

    assert
      .dom('.navi-dashboard__revert-button')
      .isNotVisible('Revert button is not visible before making a change to the dashboard');

    await click('.editable-label__icon');
    await fillIn('.editable-label__input', 'ABCD');
    await blur('.editable-label__input');

    assert.dom('.dashboard-header__edit-title').hasText('ABCD', 'Has updated text');

    assert.dom('.navi-dashboard__revert-button').isVisible('Revert button appears after dashboard change');

    await click('.navi-dashboard__revert-button');

    assert.dom('.navi-dashboard__revert-button').isNotVisible('Revert button is not visible after reverting');

    assert.dom('.dashboard-header__edit-title').hasText('Tumblr Goals Dashboard', 'Has original text');

    assert.dom('.navi-dashboard__save-button').isNotVisible('Save should not be visible after revert');

    await click('.editable-label__icon');
    await fillIn('.editable-label__input', 'EFGH');
    await blur('.editable-label__input');

    assert.dom('.navi-dashboard__save-button').isVisible('Save appears after change');

    server.patch('/dashboards/1', () => {
      assert.ok(true, 'Dashboard should be patched after save.');
      return new Response(500);
    });

    assert.dom('.dashboard-header__edit-title').hasText('EFGH', 'Has updated text before save');

    await click('.navi-dashboard__save-button');

    assert.dom('.dashboard-header__edit-title').hasText('EFGH', 'Keeps updated text after save');
  });

  test('modifying dashboard filters, navigating away, and coming back to modifications', async function (assert) {
    assert.expect(3);

    let dataRequests = [];
    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.get('/data/*path', (schema, req) => {
      dataRequests.push(req);
      return { rows: [] };
    });

    // load the dashboard
    await visit('/dashboards/2/view');

    assert.deepEqual(
      dataRequests.map((thing) => thing.queryParams.filters),
      [
        'property|id-contains["114","100001"],property|id-notin["1"],property|id-notin["2","3"]',
        'property|id-contains["114","100001"],property|id-notin["1"],property|id-notin["2","3"]',
      ],
      'the filters from the request are unmodified from the dashboard'
    );

    // modify the filters
    await click('.dashboard-filters__expand-button');
    await click(findAll('.ember-power-select-multiple-remove-btn')[0]);

    const modifiedURL = currentURL();

    // navigate away
    window.confirm = () => true;
    await click('.dashboard-header__breadcrumb-link');

    dataRequests = [];

    // come back with modified filters
    await visit(modifiedURL);

    assert
      .dom('.navi-dashboard__save-dialogue')
      .exists(
        'The dashboard is in a dirty state after modifying the dashboard, navigating away, and coming back to the modified url'
      );

    assert.deepEqual(
      dataRequests.map((thing) => thing.queryParams.filters),
      [
        'property|id-contains["114","100001"],property|id-notin["2","3"]',
        'property|id-contains["114","100001"],property|id-notin["2","3"]',
      ],
      'the filters reflect the dashboards modified filters'
    );
  });

  test('New widget after clone', async function (assert) {
    assert.expect(4);

    await visit('/dashboards/1');

    await click('.dashboard-header__clone-btn');

    assert.equal(currentURL(), '/dashboards/7/view', 'Cloning a dashboard transitions to newly made dashboard');

    // Create new widget
    await click('.dashboard-header__add-widget-btn');
    await click('.add-widget__new-btn');

    // Fill out request
    await selectChoose('.filter-builder__operator-trigger', 'In The Past');
    await clickItem('dimension', 'Date Time');
    await selectChoose('.navi-column-config-item__parameter-trigger', 'Day');
    await clickItem('metric', 'Total Clicks');

    // Save without running
    await click('.navi-report-widget__save-btn');
    assert.ok(
      currentURL().endsWith('/dashboards/7/view'),
      'After saving without running, user is brought back to dashboard view'
    );

    let widgetsAfter = findAll('.navi-widget__title').map((el) => el.textContent.trim());

    assert.deepEqual(
      widgetsAfter,
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table', 'Untitled Widget'],
      '"Untitled Widget" has been added to dashboard'
    );

    let widgetColumns = findAll('.navi-widget:nth-child(4) .table-header-cell').map((el) => el.textContent.trim());

    assert.deepEqual(
      widgetColumns,
      ['Date Time (day)', 'Total Clicks'],
      'Table columns for the new widget are rendered correctly'
    );
  });
});

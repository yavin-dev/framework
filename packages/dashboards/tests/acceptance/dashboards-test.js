import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import Mirage from 'ember-cli-mirage';
import config from 'ember-get-config';

const { get } = Ember;

let Application,
    OriginalLoggerError,
    OriginalTestAdapterException;

module('Acceptance | Dashboards', {
  beforeEach: function() {
    Application = startApp();
    return wait();
  },

  afterEach: function() {
    server.shutdown();
    Ember.run(Application, 'destroy');
  }
});

test('dashboard success', function(assert) {
  assert.expect(2);

  visit('/dashboards/1');
  andThen(function() {
    assert.notOk(!!find('.error').length,
      'Error message not present when route is successfully loaded');

    assert.ok(!!find('.navi-dashboard').length,
      'the dashboard collection component is rendered when route is successfully loaded');
  });
});

test('dashboard error', function(assert) {
  assert.expect(2);

  // Allow testing of errors - https://github.com/emberjs/ember.js/issues/11469
  OriginalLoggerError = Ember.Logger.error;
  OriginalTestAdapterException = Ember.Test.adapter.exception;
  Ember.Logger.error = function() {};
  Ember.Test.adapter.exception = function() {};

  this.urlPrefix = config.navi.appPersistence.uri;
  server.get('/dashboards/:id', () => {
    return new Mirage.Response(500);
  });

  visit('/dashboards/1');
  andThen(function() {
    assert.ok(!!find('.error').length,
      'Error message is present when route encounters an error');

    assert.notOk(!!find('.navi-dashboard').length,
      'Navi dashboard collection component is not rendered');

    Ember.Logger.error = OriginalLoggerError;
    Ember.Test.adapter.exception = OriginalTestAdapterException;
  });
});

test('dashboard loading', function(assert) {
  assert.expect(1);

  visit('/dashboards/loading');

  andThen(function() {
    assert.ok(!!find('.loader-container').length,
      'Loader is present when visiting loading route');
  });
});

test('updates to dashboard layout', function(assert) {
  assert.expect(2);

  visit('/dashboards/1');

  andThen(function() {

    let route  = Application.__container__.lookup('route:dashboards.dashboard'),
        layout = get(route, 'currentDashboard.presentation.layout');

    assert.deepEqual(layout, [
      { 'column': 0, 'height': 4, 'row': 0, 'widgetId': 1, 'width': 6 },
      { 'column': 6, 'height': 4, 'row': 0, 'widgetId': 2, 'width': 6 },
      { 'column': 0, 'height': 4, 'row': 4, 'widgetId': 3, 'width': 12 }
    ], 'Original layout property is correct');

    //swap widget rows
    let grid = find('.grid-stack').data('gridstack'),
        items = find('.grid-stack-item');
    Ember.run(() => grid.move(items[2], 0, 0));

    assert.deepEqual(layout, [
      { 'column': 0, 'height': 4, 'row': 4, 'widgetId': 1, 'width': 6 },
      { 'column': 6, 'height': 4, 'row': 4, 'widgetId': 2, 'width': 6 },
      { 'column': 0, 'height': 4, 'row': 0, 'widgetId': 3, 'width': 12 }
    ], 'Moving widget locations updates the dashboard\'s layout property');
  });
});

test('empty dashboard', function(assert) {
  assert.expect(2);

  visit('/dashboards/5');

  andThen(() => {
    assert.equal(find('.error-container .error').text().replace(/\s+/g, " ").trim(),
      'Looks like this dashboard has no widgets. Go ahead and add a widget now?');

    click('.navi-dashboard-container__add-widget-text');
    andThen(() => {
      assert.ok($('.ember-modal-dialog').is(':visible'),
        'Add Widget Dialog box is visible when `add a widget` text is clicked');
    });
  });
});

test('index route', function(assert) {
  assert.expect(1);

  visit('/dashboards');

  andThen(() => {
    let titles = find('.navi-collection .table tr td:first-of-type').toArray().map(el => $(el).text().trim());
    assert.deepEqual(titles, [
      'Tumblr Goals Dashboard',
      'Dashboard 2'
    ], 'the dashboard collection component with `navi-users`s dashboards is shown');
  });
});

test('index route actions', function(assert) {
  assert.expect(4);

  visit('/dashboards');

  andThen(() => {
    // TriggerEvent does not work here, need to use jquery trigger mouseenter
    andThen(() => $('.navi-collection__row:first-of-type').trigger('mouseenter'));

    // Click "Share"
    click('.navi-collection__row:first-of-type .share .btn');

    andThen(() => {
      assert.equal(find('.navi-collection__row:first-of-type td:eq(1) .action').length,
        5,
        'The second column contains five actions');
      assert.equal(find('.primary-header').text().trim(),
        'Share "Tumblr Goals Dashboard"',
        'Share modal pops up when action is clicked');

      // Cancel modal and click "Delete"
      click('.btn:contains(Cancel)');
      click('.navi-collection__row:first-of-type .delete button');

      andThen(() => {
        assert.equal(find('.primary-header').text().trim(),
          'Delete "Tumblr Goals Dashboard"',
          'Delete modal pops up when action is clicked');

        // Cancel modal and click "Clone"
        click('.btn:contains(Cancel)');
        click('.navi-icon__copy');

        andThen(() => {
          assert.equal(currentURL(),
            '/dashboards/6/view',
            'A dashboard is cloned when the action is clicked');
        });
      });
    });
  });
});

test('Add new dashboard in index route', function(assert) {
  assert.expect(2);

  visit('/dashboards');
  click(".dashboards-index__new-btn");

  andThen(function() {
    assert.equal(find('.navi-dashboard .page-title').text().trim(),
      'Untitled Dashboard',
      'Adding new dashboard in dashboards route transitions to new dasboard');
  });

  visit('/dashboards');

  andThen( () => {
    let titles = find('.navi-collection .table tr td:first-of-type').toArray().map(el => $(el).text().trim());
    assert.deepEqual(titles, [
      'Tumblr Goals Dashboard',
      'Dashboard 2',
      'Untitled Dashboard'
    ], 'The New Dashboard is shown along with `navi-user`s other dashboards ');
  });
});

test('add widget button', function(assert) {
  assert.expect(4);

  visit('/dashboards/4');

  andThen(() => {
    assert.notOk(find('.add-widget button').is(':visible'),
      'The `Add Widget` button is not visible when user cannot edit the dashboard');
  });

  visit('/dashboards/5');

  andThen(() => {
    assert.ok(find('.add-widget button').is(':visible'),
      'The `Add Widget` button is visible when user can edit the dashboard');
  });

  click('.add-widget .btn');

  andThen(() => {
    assert.equal(find('.add-widget-modal .btn').attr('href'),
      `/dashboards/5/widgets/new`,
      'Create new assigns the new widget route to the primary button');
  });

  selectChoose('.report-select', 'Report 12');

  andThen(() => {
    assert.equal(find('.add-widget-modal .btn').attr('href'),
      `/reports/4`,
      'Selecting a report assigns the route `/reports/${id}` to the primary button where id is the id of the report');
  });
});

test('Delete a dashboard', function(assert) {
  assert.expect(3);

  visit('/dashboards');

  andThen(() => {
    let titles = find('.navi-collection .table tr td:first-of-type').toArray().map(el => $(el).text().trim());
    assert.deepEqual(titles, [
      'Tumblr Goals Dashboard',
      'Dashboard 2'
    ], '`navi-user`s dashboard are shown ');

    visit('/dashboards/2');

    click(".dashboard-actions .delete > button").then(function() {
      click('button:contains(Confirm)').then(function() {
        assert.equal(currentURL(),
          '/dashboards',
          'Deleting a dashboard transitions to index route');

        let titles = find('.navi-collection .table tr td:first-of-type').toArray().map(el => $(el).text().trim());
        assert.deepEqual(titles, [
          'Tumblr Goals Dashboard'
        ], '`navi-user`s dashboard are shown after deleting `Dashboard 2`');
      });
    });
  });
});

test('favorite dashboards', function(assert) {
  assert.expect(2);

  // Favorite dashboard 2
  visit('/dashboards/2');
  click('.navi-dashboard__fav-icon');

  // Filter by favorites
  visit('/dashboards');
  click('.pick-form li:contains(Favorites)');

  andThen(() => {
    let listedDashboards = find('tbody tr td:first-of-type').toArray().map(el => $(el).text().trim());

    assert.deepEqual(listedDashboards,[
      'Tumblr Goals Dashboard',
      'Dashboard 2',
    ], 'Two dashboards are in favories now');
  });

  // Unfavorite dashboard 1
  click('tbody tr td a:contains(Tumblr Goals Dashboard)');
  click('.navi-dashboard__fav-icon');
  visit('/dashboards');
  click('.pick-form li:contains(Favorites)');

  andThen(() => {
    let listedDashboards = find('tbody tr td:first-of-type').toArray().map(el => $(el).text().trim());

    assert.deepEqual(listedDashboards,[
      'Dashboard 2'
    ], 'Only one dashboard is in favories now');
  });
});

test('favorite dashboard - rollback on failure', function(assert) {
  assert.expect(1);

  // Mock server path endpoint to mock failure
  server.patch('/users/:id', () => {
    return new Mirage.Response(500);
  });

  /* == mark dashboard as favorite == */
  visit('/dashboards/3');
  click('.navi-dashboard__fav-icon');

  /* == list favorites in list view == */
  visit('/dashboards');
  click('.pick-form li:contains(Favorites)');

  andThen(() => {
    let listedDashboards = find('tbody tr td:first-of-type').toArray().map(el => $(el).text().trim());

    assert.deepEqual(listedDashboards, [
      'Tumblr Goals Dashboard'
    ], 'The user state is rolled back on failure');
  });
});

test('clone dashboard', function(assert) {
  assert.expect(3);

  let originalDashboardTitle, originalWidgetTitles;

  visit('/dashboards/2');

  andThen(() => {
    originalDashboardTitle = find('.page-title .clickable').text().trim();
    originalWidgetTitles = find('.navi-widget__title').toArray().map(el => $(el).text().trim());
  });

  click('.navi-icon__copy');

  andThen(() => {
    assert.equal(currentURL(),
      '/dashboards/6/view',
      'Cloning a dashboard transitions to newly made dashboard');

    assert.equal(find('.page-title .clickable').text().trim(),
      `Copy of ${originalDashboardTitle}`,
      'Cloned dashboard has the same title as Original dashboard with `copy of` prefix title');

    assert.deepEqual(find('.navi-widget__title').toArray().map(el => $(el).text().trim()),
      originalWidgetTitles,
      'Cloned widgets are present in the dashboard ');
  });
});

test('clone dashboard on failure', function(assert) {
  assert.expect(1);

  server.post('/dashboards/', () => {
    return new Mirage.Response(500);
  });

  visit('/dashboards/2');

  andThen(() => {
    click('.navi-icon__copy').then(() => {
      assert.equal(currentURL(),
        '/dashboards',
        'Transition to `dashboards` route on failed cloning action');
    });
  });
});

test('New widget', function(assert) {
  assert.expect(4);

  // Check original set of widgets
  visit('/dashboards/1');
  andThen(() => {
    let widgetNames = $('.navi-widget__title').map(function() {
      return this.textContent.trim();
    }).toArray();

    assert.deepEqual(widgetNames,
      [
        'Mobile DAU Goal',
        'Mobile DAU Graph',
        'Mobile DAU Table'
      ],
      '"Untitled Widget" is not initially present on dashboard');
  });

  // Create new widget
  click('.add-widget .btn');
  click('.add-widget-modal .add-to-dashboard');

  // Fill out request
  click('.checkbox-selector--metric .grouped-list__item:contains(Total Clicks) label');
  click('.navi-report-widget__run-btn');
  andThen(() => {
    // Regex to check that a string ends with "{uuid}/view"
    const TempIdRegex = /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/view$/;

    assert.ok(TempIdRegex.test(currentURL()),
      'Creating a widget brings user to /view route with a temp id');
  });

  // Save
  click('.navi-report-widget__save-btn');
  andThen(() => {
    assert.ok(currentURL().endsWith('/dashboards/1/view'),
      'After saving for the first time, user is brought back to dashboard view');

    let widgetNames = $('.navi-widget__title').map(function() {
      return this.textContent.trim();
    }).toArray();

    assert.deepEqual(widgetNames,
      [
        'Mobile DAU Goal',
        'Mobile DAU Graph',
        'Mobile DAU Table',
        'Untitled Widget'
      ],
      '"Untitled Widget" has been added to dashboard');
  });
});

test('Failing to save a new widget', function(assert) {
  assert.expect(2);

  server.patch('/dashboards/1', () => {
    return new Mirage.Response(500);
  });

  // Create and save
  visit('/dashboards/1/widgets/new');
  click('.checkbox-selector--metric .grouped-list__item:contains(Total Clicks) label');
  click('.navi-report-widget__run-btn');
  click('.navi-report-widget__save-btn');
  andThen(() => {
    assert.ok(currentURL().endsWith('/dashboards'),
      'User ends up on dashboards route when there is an error adding a widget');
  });

  visit('/dashboards/1');
  andThen(() => {
    assert.equal(find('.navi-widget').length,
      3,
      'The new widget was never added to the dashboard') ;
  });
});

test('Editing dashboard title', function(assert) {
  assert.expect(2);

  // Edit title of the dashboard
  visit('/dashboards/1');
  click('.editable-label__icon');
  fillIn('.editable-label__input', 'A new title');
  triggerEvent('.editable-label__input', 'blur');

  andThen(function() {
    assert.equal(find('.navi-dashboard .page-title').text().trim(),
      'A new title',
      'New Dashboard title is persisted with value `A new title` ');
  });

  //Not Editor
  visit('/dashboards/3');
  andThen(function() {
    assert.notOk($('.editable-label__icon').is(':visible'),
      'Edit icon is not available if user is not the editor');
  });
});

test('Unauthorized widget', function(assert) {
  assert.expect(2);
  // Allow testing of errors - https://github.com/emberjs/ember.js/issues/11469
  OriginalLoggerError = Ember.Logger.error;
  OriginalTestAdapterException = Ember.Test.adapter.exception;
  Ember.Logger.error = function() {};
  Ember.Test.adapter.exception = function() {};

  server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
  server.get('/data/network/day/os', function() {
    return new Mirage.Response(403);
  });

  visit('/dashboards/2/view');
  andThen(function() {
    assert.ok(find('.navi-widget:eq(0) .navi-widget__content').hasClass('visualization-container'),
      "Widget loaded visualization for allowed component");

    assert.ok(find('.navi-widget:eq(1) .navi-report-invalid__info-message .fa-lock').is(':visible'),
      "Unauthorized widget loaded unauthorized component");


    Ember.Logger.error = OriginalLoggerError;
    Ember.Test.adapter.exception = OriginalTestAdapterException;
  });
});

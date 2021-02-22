import { findAll, click, currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';

const sidebarToggle = '#dir-sidebar-toggle';
const sidebarOpenClass = 'tablet-down-toggle-tabs-left';
const sidebar = '.dir-sidebar';

module('Acceptance | dir sidebar toggle', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('toggle opens and closes sidebar', async function (assert) {
    await visit('/directory/my-data');
    assert.dom(sidebarToggle).exists('The sidebar toggle button exists');

    assert.dom(sidebar).doesNotHaveClass(sidebarOpenClass, 'The sidebar is not open by default');

    await click(sidebarToggle);
    assert.dom(sidebar).hasClass(sidebarOpenClass, 'After clicking the toggle the sidebar is opened');

    await click(sidebarToggle);
    assert.dom(sidebar).doesNotHaveClass(sidebarOpenClass, 'After clicking the toggle again the sidebar is closed');
  });

  test('Changing filters via sidebar closes the sidebar', async function (assert) {
    await visit('/directory/my-data');

    await click(sidebarToggle);
    assert.dom(sidebar).hasClass(sidebarOpenClass, 'After clicking the toggle the sidebar is opened');

    assert.deepEqual(currentURL(), '/directory/my-data', 'The my data route is active');
    await click(findAll('.dir-sidebar__link')[1]);
    assert.deepEqual(currentURL(), '/directory/other-data', 'Navigated to the other-data route');

    assert.dom(sidebar).doesNotHaveClass(sidebarOpenClass, 'The sidebar is close after going to another route');
  });

  test('navigating away closes the sidebar', async function (assert) {
    await visit('/directory/my-data');

    await click(sidebarToggle);
    assert.dom(sidebar).hasClass(sidebarOpenClass, 'After clicking the toggle the sidebar is opened');

    assert.deepEqual(currentURL(), '/directory/my-data', 'The my data route is active');

    await click('.dir-new-button');
    assert.ok(currentURL().startsWith('/reports/'), 'Navigates to a new report route');
    await visit('/directory/my-data');

    assert.deepEqual(currentURL(), '/directory/my-data', 'The my data route is active again');
    assert
      .dom(sidebar)
      .doesNotHaveClass(sidebarOpenClass, 'The sidebar is close after navigating away and coming back');
  });
});

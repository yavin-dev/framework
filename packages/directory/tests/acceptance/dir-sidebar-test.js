import { module, test } from 'qunit';
import { click, currentURL, find, findAll, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | dir sidebar', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('transitions for sidebar link-tos', async function(assert) {
    assert.expect(7);

    await visit('/directory');
    assert.equal(currentURL(), '/directory/my-data', 'Directory route redirects to `my-data` child route');
    assert.equal(
      find('.dir-sidebar__group.active').textContent.trim(),
      'My Data',
      'The active sidebar link corresponds to the active route'
    );

    await visit('/directory/my-data');
    assert.equal(
      find('.dir-sidebar .active').textContent.trim(),
      'My Data',
      'The active sidebar filter link corresponds to the active route and the active filter query param'
    );

    await click('.dir-sidebar__group:nth-of-type(2)');
    assert.equal(currentURL(), '/directory/other-data', 'Currently on a different directory subroute than my-data');

    let favoriteFilter = findAll('.dir-sidebar__filter').find(el => el.textContent.trim() === 'Favorites');
    await click(favoriteFilter);
    assert.equal(
      currentURL(),
      '/directory/my-data?filter=favorites',
      '`favorites` is set as the query param and applied to the my-data route when the favorites filter is clicked on'
    );
    assert.equal(
      find('.dir-sidebar .active').textContent.trim(),
      'Favorites',
      'The active sidebar filter link now corresponds to `favorites` filter query param'
    );

    await visit('/directory/my-data?filter=favorites&sortBy=author&sortDir=asc');
    await click('.dir-sidebar__group:nth-of-type(2)');
    assert.equal(
      currentURL(),
      '/directory/other-data?sortBy=author&sortDir=asc',
      'Clicking another directory removes the favorites filter but keeps sorting'
    );
  });
});

import { module, test } from 'qunit';
import { click, currentURL, find, findAll, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | dir sidebar', function(hooks) {
  setupApplicationTest(hooks);

  test('transitions for sidebar link-tos', async function(assert) {
    assert.expect(5);
    
    await visit('/directory');
    assert.equal(currentURL(), 
      '/directory/my-directory',
      'Directory route redirects to `my-directory` child route');
    assert.equal(find('.dir-sidebar__group.active').textContent.trim(),
      'My Directory',
      'The active sidebar link corresponds to the active route');
    
    await visit('/directory/my-directory');
    assert.equal(find('.dir-sidebar .active').textContent.trim(),
      'My Directory',
      'The active sidebar filter link corresponds to the active route and the active filter query param');

    let favoriteFilter = findAll('.dir-sidebar__filter').find(el => el.textContent.trim() === 'Favorites');
    await click(favoriteFilter);
    assert.equal(currentURL(),
      '/directory/my-directory?filter=favorites',
      '`favorites` is set as the query param when the favorites filter is clicked on');
    assert.equal(find('.dir-sidebar .active').textContent.trim(),
      'Favorites',
      'The active sidebar filter link now corresponds to `favorites` filter query param');
  });
});

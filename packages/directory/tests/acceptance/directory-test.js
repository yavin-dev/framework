import { module, test } from 'qunit';
import { visit, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | directory', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /directory', async function(assert) {
    assert.expect(1);

    await visit('/directory');
    assert.equal(currentURL(), '/directory/my-data', 'Directory route redirects to `my-data` automatically');
  });

  test('table title changes according to route', async function(assert) {
    assert.expect(3);

    await visit('/directory/my-data');
    assert.equal(find('.directory__table h1').textContent, 'My Data', 'Default title shows correctly');

    await visit('/directory/my-data?filter=favorites');
    assert.equal(
      find('.directory__table h1').textContent,
      'Favorites',
      'Title shows correctly when looking at favorites'
    );

    await visit('/directory/my-data?sortBy=updatedOn');
    assert.equal(
      find('.directory__table h1').textContent,
      'Recently Updated',
      'Title shows correctly when sorting by recently updated'
    );
  });
});

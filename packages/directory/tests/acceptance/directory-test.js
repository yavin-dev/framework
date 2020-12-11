import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | directory', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting /directory', async function(assert) {
    assert.expect(1);

    await visit('/directory');
    assert.equal(currentURL(), '/directory/my-data', 'Directory route redirects to `my-data` automatically');
  });

  test('table title changes according to route', async function(assert) {
    assert.expect(3);

    await visit('/directory/my-data');
    assert.dom('.directory__title').hasText('My Data', 'Default title shows correctly');

    await visit('/directory/my-data?filter=favorites');
    assert.dom('.directory__title').hasText('Favorites', 'Title shows correctly when looking at favorites');

    await visit('/directory/other-data');
    assert.dom('.directory__title').hasText('Other Data', 'Title shows correctly for some other directory');
  });
});

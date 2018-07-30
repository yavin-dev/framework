import { module, test } from 'qunit';
import { visit, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | dir table', function(hooks) {
  setupApplicationTest(hooks);

  test('dir-table is populated with items from the route', async function(assert) {
    assert.expect(2);

    await visit('/directory/my-directory');

    assert.equal(findAll('tbody>tr').length,
      5,
      'All items for a user are listed by default in my-directory');

    await visit('/directory/my-directory?filter=favorites');

    assert.equal(findAll('tbody>tr').length,
      2,
      'Only the favorite items are shown in the table when the favorites filter is applied');
  });
});

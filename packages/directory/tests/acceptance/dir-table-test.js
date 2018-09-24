import { module, test } from 'qunit';
import { click, currentURL, find, findAll, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | dir table', function(hooks) {
  setupApplicationTest(hooks);

  test('dir-table is populated with items from the route', async function(assert) {
    assert.expect(2);

    await visit('/directory/my-data');

    assert.equal(findAll('tbody>tr').length,
      5,
      'All items for a user are listed by default in my-data');

    await visit('/directory/my-data?filter=favorites');

    assert.equal(findAll('tbody>tr').length,
      2,
      'Only the favorite items are shown in the table when the favorites filter is applied');
  });

  test('dir-table-filter', async function(assert) {
    assert.expect(4);

    await visit('/directory/my-data');

    assert.equal(find('.dir-table-filter__trigger').textContent.trim(),
      'All',
      'Initially the selected type filter is `all`');

    await click('.dir-table-filter__trigger');
    let option = findAll('.dir-table-filter__dropdown-option').find(opt => opt.textContent.trim() === 'Reports');
    await click(option);
    assert.equal(find('.dir-table-filter__trigger').textContent.trim(),
      'Reports',
      'On click the selected option is set');
    assert.equal(currentURL(),
      '/directory/my-data?type=reports',
      'The selected type is set as a query param');

    await visit('/directory/my-data?type=dashboards');
    assert.equal(find('.dir-table-filter__trigger').textContent.trim(),
      'Dashboards',
      'The selected type is set based on the query param in the url');

  });
});

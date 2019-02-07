import { module, test } from 'qunit';
import { click, currentURL, find, findAll, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | dir table', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('dir-table is populated with items from the route', async function(assert) {
    assert.expect(2);

    await visit('/directory/my-data');

    assert.equal(findAll('tbody tr').length, 6, 'All items for a user are listed by default in my-data');

    await visit('/directory/my-data?filter=favorites');

    assert.equal(
      findAll('tbody tr').length,
      2,
      'Only the favorite items are shown in the table when the favorites filter is applied'
    );
  });

  test('dir-table sorting updates query params and items are sorted correctly', async function(assert) {
    assert.expect(4);

    let sortedItems = [
      '01/01/2016 - 12:00:00 am',
      '01/01/2016 - 12:00:00 am',
      '01/01/2016 - 12:00:00 am',
      '01/03/2015 - 12:00:00 am',
      '01/01/2015 - 11:00:00 am',
      '01/01/2015 - 12:00:00 am'
    ];

    await visit('/directory/my-data');

    assert.deepEqual(
      findAll('.dir-table__cell--lastUpdatedDate').map(elm => elm.innerText.trim()),
      sortedItems,
      'items are sorted by updatedOn desc'
    );

    await click(findAll('th')[3]);

    assert.equal(
      currentURL(),
      '/directory/my-data?sortDir=asc',
      'The sortDir is set as a query param after re-sorting by updatedOn'
    );

    assert.deepEqual(
      findAll('.dir-table__cell--lastUpdatedDate').map(elm => elm.innerText.trim()),
      sortedItems.reverse(),
      'items are sorted by updatedOn asc after re-sorting by updatedOn'
    );

    await click('th');

    assert.equal(
      currentURL(),
      '/directory/my-data?sortBy=title&sortDir=asc',
      'The sortBy is set as a query params after sorting by title'
    );
  });

  test('dir-table sorting keeps filter query param', async function(assert) {
    assert.expect(1);

    await visit('/directory/my-data?filter=favorites');

    await click(findAll('th')[2]);

    assert.equal(
      currentURL(),
      '/directory/my-data?filter=favorites&sortBy=author&sortDir=asc',
      'The sortBy and sortDir are added as query params'
    );
  });

  test('dir-table-filter', async function(assert) {
    assert.expect(4);

    await visit('/directory/my-data?sortBy=author&sortDir=asc');

    assert.equal(
      find('.dir-table-filter__trigger').textContent.trim(),
      'All',
      'Initially the selected type filter is `all`'
    );

    await click('.dir-table-filter__trigger');
    let option = findAll('.dir-table-filter__dropdown-option').find(opt => opt.textContent.trim() === 'Reports');
    await click(option);
    assert.equal(
      find('.dir-table-filter__trigger').textContent.trim(),
      'Reports',
      'On click the selected option is set'
    );
    assert.equal(
      currentURL(),
      '/directory/my-data?sortBy=author&sortDir=asc&type=reports',
      'The selected type is set as a query param while keeping other query params'
    );

    await visit('/directory/my-data?type=dashboards');
    assert.equal(
      find('.dir-table-filter__trigger').textContent.trim(),
      'Dashboards',
      'The selected type is set based on the query param in the url'
    );
  });
});

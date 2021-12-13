import { module, test } from 'qunit';
import { click, currentURL, findAll, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | dir-table', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('dir-table is populated with items from the route', async function (assert) {
    assert.expect(2);

    await visit('/directory/my-data');

    assert.dom('tbody tr').exists({ count: 7 }, 'All items for a user are listed by default in my-data');

    await visit('/directory/my-data?filter=favorites');

    assert
      .dom('tbody tr')
      .exists({ count: 2 }, 'Only the favorite items are shown in the table when the favorites filter is applied');
  });

  test('dir-table sorting updates query params and items are sorted correctly', async function (assert) {
    assert.expect(4);

    let sortedItems = [
      '04/01/2016 - 11:00:00 am',
      '02/01/2016 - 12:00:00 am',
      '01/01/2016 - 03:00:00 am',
      '01/01/2016 - 12:00:00 am',
      '04/01/2015 - 12:00:00 am',
      '01/03/2015 - 12:00:00 am',
      '01/01/2015 - 12:00:00 am',
    ];

    await visit('/directory/my-data');

    assert.deepEqual(
      findAll('.dir-table__cell--lastUpdatedDate').map((elm) => elm.innerText.trim()),
      sortedItems,
      'items are sorted by updatedOn desc'
    );

    await click(findAll('th')[4]);

    assert.equal(
      currentURL(),
      '/directory/my-data?sortDir=asc',
      'The sortDir is set as a query param after re-sorting by updatedOn'
    );

    assert.deepEqual(
      findAll('.dir-table__cell--lastUpdatedDate').map((elm) => elm.innerText.trim()),
      sortedItems.reverse(),
      'items are sorted by updatedOn asc after re-sorting by updatedOn'
    );

    await click(findAll('th')[1]);

    assert.equal(
      currentURL(),
      '/directory/my-data?sortBy=title&sortDir=asc',
      'The sortBy is set as a query params after sorting by title'
    );
  });

  test('dir-table - empty collection', async function (assert) {
    await visit('/');
    await click('.dir-sidebar__link[data-title="Other Data"] a');

    assert.dom('.dir-empty').exists('An empty placeholder is displayed when a collection has no items');

    const links = findAll('.dir-empty a').map((e) => new URL(e.href).pathname);
    assert.deepEqual(
      links,
      ['/reports/new', '/dashboards/new'],
      'Empty placeholder has links to new reports & dashboards'
    );
  });

  test('dir-table sorting keeps filter query param', async function (assert) {
    assert.expect(1);

    await visit('/directory/my-data?filter=favorites');

    await click(findAll('th')[3]);

    assert.equal(
      currentURL(),
      '/directory/my-data?filter=favorites&sortBy=owner&sortDir=asc',
      'The sortBy and sortDir are added as query params'
    );
  });

  test('dir-table-filter', async function (assert) {
    await visit('/directory/my-data?sortBy=owner&sortDir=asc');

    assert.dom('.dir-table-filter select').hasValue('All', 'Initially the selected type filter is `all`');

    await fillIn('.dir-table-filter select', 'Reports');

    assert.dom('.dir-table-filter select').hasValue('Reports', 'On click the selected option is set');
    assert.equal(
      currentURL(),
      '/directory/my-data?sortBy=owner&sortDir=asc&type=reports',
      'The selected type is set as a query param while keeping other query params'
    );

    await visit('/directory/my-data?type=dashboards');
    assert
      .dom('.dir-table-filter select')
      .hasValue('Dashboards', 'The selected type is set based on the query param in the url');
  });

  test('favorite item toggle', async function (assert) {
    assert.expect(5);
    await visit('/directory/my-data');
    const user = await this.owner.lookup('service:user').findUser();

    // returns list of favorite items (items with solid stars next to them)
    const getFavorites = () => {
      return findAll('.dir-table__row')
        .filter((el) => el.querySelector('.d-star-solid'))
        .map((fav) => fav.querySelector('.dir-item-name-cell').textContent.trim());
    };

    // find an item that starts as a favorite
    const testItem = findAll('.dir-table__row').filter((el) => el.querySelector('.d-star-solid'))[0];
    const itemTitle = testItem.querySelector('.dir-item-name-cell').textContent.trim();
    const favCell = testItem.firstElementChild;

    // un-favorite item
    await click(favCell.firstElementChild);
    assert.notOk(getFavorites().includes(itemTitle), 'non-favorite item does not show solid star');
    assert.dom(favCell.firstElementChild).hasClass('d-star', 'non-favorite item renders hollow star');

    // re-favorite item
    await click(favCell.firstElementChild);
    assert.ok(getFavorites().includes(itemTitle), 'favorite item shows a solid star');

    // Mock server path endpoint to mock failure
    server.patch('/users/:id', () => new Response(500));

    // favorite item data update error
    await click(favCell.firstElementChild);
    assert
      .dom('.alert.is-danger')
      .hasText(
        'Oh no! An error occurred while updating favorite reports',
        'Notification shown when error updating favorite reports'
      );

    // make sure UI hasn't changed and item is still favorite
    assert.ok(getFavorites().includes(itemTitle), 'item still shows favorite solid star');

    user.send('becameInvalid');
  });
});

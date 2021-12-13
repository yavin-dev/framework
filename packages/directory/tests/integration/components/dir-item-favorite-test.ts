import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import click from '@ember/test-helpers/dom/click';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import settled from '@ember/test-helpers/settled';

const TEMPLATE = hbs`<DirItemFavoriteCell @value={{this.item}} />`;

module('Integration | Component | dir-item-favorite-cell', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('UI toggle favorite updates user data', async function (assert) {
    assert.expect(3);

    const user = await this.owner.lookup('service:user').findUser();
    const item = await user.reports.toArray()[0];
    this.setProperties({
      item: item,
    });

    // returns list of all user's favorite report titles
    const getUserFavorites = () => {
      return user.favoriteReports.toArray().map((rep: { title: string }) => rep.title);
    };

    await render(TEMPLATE);

    // item starts as non-favorite
    assert.notOk(getUserFavorites().includes(item.title), 'item is not a user favorite');

    // toggle item to favorite
    await click('.d-star');
    await settled();
    assert.ok(getUserFavorites().includes(item.title), 'item is now a user favorite');

    // toggle item back to non-favorite
    await click('.d-star-solid');
    await settled();
    assert.notOk(getUserFavorites().includes(item.title), 'item is back to being user non-favorite');
  });
});

import { click, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | route helpers', function(hooks) {
  setupApplicationTest(hooks);

  test('route helpers', async function(assert) {
    assert.expect(6);

    await visit('/helpers');
    assert.dom('#parent').hasText('helpers', 'parent-route helper return parent route name');

    assert.dom('#current').hasText('helpers.index', 'current-route helper return current route name');

    assert
      .dom('#sibling')
      .hasText(
        'helpers.sibling',
        'sibling-route helper return a generated name based on parent and given sibling name'
      );

    await click('#link-to-child');
    assert.dom('#parent').hasText('helpers.child1', 'parent-route updates with route transition');

    assert.dom('#current').hasText('helpers.child1.child2', 'current-route updates with route transition');

    assert.dom('#sibling').hasText('helpers.child1.sibling', 'sibling-route updates with route transition');
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dir sidebar', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    await render(hbs`{{dir-sidebar}}`);
  });

  test('it renders', function(assert) {
    assert.expect(4);

    assert.ok(find('.dir-sidebar'),
      'The sidebar component is rendered');

    assert.deepEqual(findAll('.dir-sidebar__group').map(el => el.textContent.trim()),
      [ 'My Directory' ],
      'The sidebar component has the right groups');

    assert.deepEqual(findAll('.dir-sidebar__filter').map(el => el.textContent.trim()),
      [ 'All', 'Favorites' ],
      `The selected group's filters are shown in the filter section`);

    assert.equal(find('.dir-sidebar__filter--selected').textContent.trim(),
      'All',
      'The first filter for the group is initially selected');
  });
});

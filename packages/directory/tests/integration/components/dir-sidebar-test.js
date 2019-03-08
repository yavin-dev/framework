import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dir sidebar', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    await render(hbs`{{dir-sidebar}}`);
  });

  test('it renders', function(assert) {
    assert.expect(3);

    assert.dom('.dir-sidebar').exists('The sidebar component is rendered');

    assert.deepEqual(
      findAll('.dir-sidebar__group').map(el => el.textContent.trim()),
      ['My Data', 'Other Data'],
      'The sidebar component has the right groups'
    );

    assert.deepEqual(
      findAll('.dir-sidebar__filter').map(el => el.textContent.trim()),
      ['Favorites'],
      `The selected group's filters are shown in the filter section`
    );
  });
});

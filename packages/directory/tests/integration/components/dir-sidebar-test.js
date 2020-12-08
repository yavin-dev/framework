import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dir sidebar', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    await render(hbs`<DirSidebar />`);
  });

  test('it renders', function(assert) {
    assert.dom('.dir-sidebar').exists('The sidebar component is rendered');

    assert.deepEqual(
      findAll('.dir-sidebar__link').map(el => el.textContent.trim()),
      ['My Data', 'Other Data', 'Favorites'],
      'The sidebar component has the right groups and filters'
    );
  });
});

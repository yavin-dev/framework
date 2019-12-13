import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { set } from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dir-icon', function(hooks) {
  setupRenderingTest(hooks);

  test('Renders icon', async function(assert) {
    assert.expect(1);
    set(this, 'iconClass', 'star');

    await render(hbs`<DirIcon @iconClass={{this.iconClass}} />`);

    assert.ok(
      this.element.querySelector('.dir-icon>.fa-star'),
      'An fa icon element with parent class dir-icon is rendered with the `fa-star` class'
    );
  });
});

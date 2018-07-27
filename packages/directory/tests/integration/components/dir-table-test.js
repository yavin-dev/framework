import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dir table', function(hooks) {
  setupRenderingTest(hooks);

  skip('dir table', async function(assert) {
    assert.expect(1);

    await render(hbs`{{dir-table}}`);

    assert.equal(this.element.innerText.trim(), '');
  });
});

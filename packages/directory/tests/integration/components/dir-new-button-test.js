import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';

module('Integration | Component | dir new button', function(hooks) {
  setupRenderingTest(hooks);

  test('dir new button', async function(assert) {
    assert.expect(2);

    await render(hbs`{{dir-new-button}}`);

    assert.equal(this.element.innerText.trim(), 'New', 'The New button is labeled correctly');

    await clickTrigger('.dir-new-button__trigger');

    assert.deepEqual(
      [...this.element.parentElement.querySelectorAll('.dir-new-button__dropdown-option')].map(elm =>
        elm.innerText.trim()
      ),
      ['Reports', 'Dashboards'],
      'Reports and Dashboards are the options for creating a new document'
    );
  });
});

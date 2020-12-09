import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dir new button', function(hooks) {
  setupRenderingTest(hooks);

  test('dir new button', async function(assert) {
    await render(hbs`<DirNewButton />`);
    assert.deepEqual(
      findAll('.dir-new-button').map(elm => elm.innerText.trim()),
      ['New Report', 'New Dashboard'],
      'Report and Dashboard are the options for creating a new document'
    );
  });
});

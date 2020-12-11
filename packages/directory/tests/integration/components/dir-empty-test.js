import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dir-empty', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<DirEmpty />`);

    assert
      .dom(this.element)
      .hasText('Nothing Here Yet There currently is not anything in this collection. New Report New Dashboard');
  });
});

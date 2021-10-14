import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dir-empty', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<DirEmpty />`);

    assert
      .dom(this.element)
      .hasText(
        "Let's jump right in! Get started by creating a report or dashboard. Anything you create and save will be added here. New Report New Dashboard"
      );
  });
});

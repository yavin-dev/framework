import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render, triggerEvent } from '@ember/test-helpers';
import { set } from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dir search bar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);

    const fillInText = 'testString';

    set(this, 'searchFor', (val) => {
      assert.equal(val, fillInText, 'The entered text is passed on to the action on `key-up`');
    });

    await render(hbs`<DirSearchBar
      @searchFor={{action this.searchFor}}
    />`);

    assert.dom('.dir-search-bar__input').exists('The search bar input is visible when the component is rendered');

    await fillIn('.dir-search-bar__input', fillInText);
    await triggerEvent('.dir-search-bar__input', 'keyup');
    //Triggers the assert in the `searchFor` action
  });
});

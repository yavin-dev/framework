import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dir search bar', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(3);

    let fillInText = 'testString';

    this.set('searchFor', val => {
      assert.equal(val, fillInText, 'The entered text is passed on to the action on `key-up`');
    });

    await render(hbs`{{dir-search-bar
      searchFor=(action searchFor)
    }}`);

    assert.dom('.dir-search-bar__input').exists('The search bar input is visible when the component is rendered');

    assert
      .dom('.dir-search-bar__search-icon')
      .exists('The search bar search icon is visible when the component is rendered');

    await fillIn('.dir-search-bar__input', fillInText);
    await triggerEvent('.dir-search-bar__input', 'keyup');
    //Triggers the assert in the `searchFor` action
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, blur, focus, triggerEvent, triggerKeyEvent, click } from '@ember/test-helpers';
import { typeInSearch, clickTrigger } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | power-select-search', function(hooks) {
  setupRenderingTest(hooks);

  test('power-select-search', async function(assert) {
    assert.expect(10);

    this.set('searchEnabled', true);
    this.set('placeholder', 'This is a placeholder');
    this.set('select', {
      searchText: '',
      actions: {
        search() {
          return null; /*noop run on component teardown*/
        }
      }
    });
    this.set('onInput', () => assert.ok(true, 'onInput action is called on input'));
    this.set('onFocus', () => assert.ok(true, 'onFocus action is called on focus'));
    this.set('onBlur', () => assert.ok(true, 'onBlur action is called on blur'));
    this.set('onKeydown', () => assert.ok(true, 'onKeydown action is called on keydown'));

    await render(hbs`{{power-select-search
      searchEnabled=searchEnabled
      searchPlaceholder=placeholder
      select=select
      onInput=onInput
      onFocus=onFocus
      onBlur=onBlur
      onKeydown=onKeydown
    }}`);

    assert.dom('.navi-power-select-search').isVisible('Renders when searchEnabled is true');

    assert.dom('input').hasNoValue('No value when select.searchText is empty');
    assert
      .dom('input')
      .hasAttribute('placeholder', 'This is a placeholder', 'Placeholder is used when no value is present');

    this.set('select', { searchText: 'Some value' });

    assert.dom('input').hasValue('Some value', 'Value is displayed when select.searchText is populated');
    assert.dom('.fa-search').isVisible('Search icon is shown');

    await focus('input');
    await blur('input');
    await triggerEvent('input', 'input');
    await triggerKeyEvent('input', 'keydown', 8);

    this.set('searchEnabled', false);
    assert.dom('.navi-power-select-search').isNotVisible('Does not render when searchEnabled is true');
  });

  test('passed to power-select', async function(assert) {
    assert.expect(8);

    this.set('options', ['Link', 'Zelda', 'Ganon', 'Impa']);
    this.set('placeholder', 'Choose a LoZ character');
    this.set('searchPlaceholder', 'Search');
    this.set('selected', null);

    await render(hbs`
      {{#power-select 
        options=options
        onchange=(action (mut selected))
        placeholder=placeholder
        selected=selected
        searchPlaceholder=searchPlaceholder
        beforeOptionsComponent="power-select-search"
        as |option|
      }}
        {{option}}
      {{/power-select}}`);

    assert.dom('.ember-power-select-placeholder').isVisible('Placeholder visible when nothing selected');
    await clickTrigger();

    assert
      .dom('.navi-power-select-search input')
      .hasAttribute('placeholder', 'Search', 'Search placeholder is visible initially');
    assert.dom('.navi-power-select-search .fa-search').isVisible('Search icon shown');
    assert.dom('.ember-power-select-option').isVisible({ count: 4 }, 'All options listed initially');

    await typeInSearch('l');

    assert.dom('.ember-power-select-option').isVisible({ count: 2 }, 'Search value filters down the options');

    await click('li.ember-power-select-option:first-of-type');

    assert.dom('.ember-power-select-trigger').hasText('Link', 'Selected option is shown in trigger');

    await clickTrigger();

    assert.dom('.navi-power-select-search input').hasNoValue('Search text does not persist through open and close');
    assert.dom('.ember-power-select-option').isVisible({ count: 4 }, 'Clearing search shows all options');
  });
});

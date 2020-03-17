import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';

const options = [{ longName: 'network' }, { longName: 'network2' }];
const selected = options[0];

module('Integration | Component | navi table select', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function(assert) {
    this.set('selected', selected);
    this.set('options', options);
    this.set('onChange', value => {
      assert.equal(value.longName, 'network2', 'network2 should be selected');
      this.set('selected', value);
    });

    await render(hbs`
        <NaviTableSelect
            @selected={{selected}}
            @options={{options}}
            @onChange={{onChange}}
        />`);
  });

  test('it renders', async function(assert) {
    assert.expect(2);

    assert.dom('.navi-table-select-trigger__label').hasText('Table', 'The header text equals `table`');

    assert.dom('.navi-table-select-trigger__item').hasText('network', 'The selected item equals `network`');
  });

  test('trigger dropdown', async function(assert) {
    assert.expect(1);

    await clickTrigger();
    assert.deepEqual(
      findAll('.ember-power-select-option').map(el => el.textContent.trim()),
      ['network', 'network2'],
      'All options are shown'
    );
  });

  test('select option', async function(assert) {
    assert.expect(2);

    await clickTrigger();
    await nativeMouseUp($('.ember-power-select-option:contains(network2)')[0]);
    assert.dom('.navi-table-select-trigger__item').hasText('network2', 'The selected item equals `network2`');
  });

  test('enable search', async function(assert) {
    assert.expect(2);

    this.set('searchEnabled', true);
    this.set('searchField', 'longName');
    await render(hbs`<NaviTableSelect
          @selected={{selected}}
          @options={{options}}
          @onChange={{onChange}}
          @searchEnabled={{searchEnabled}}
          @searchField={{searchField}}
      />`);

    assert.dom('.ember-power-select-search').isNotVisible('search input should not be visible');
    await clickTrigger();
    assert.dom('.ember-power-select-search').isVisible('search input should be visible');
  });

  test('search longName', async function(assert) {
    assert.expect(2);

    this.set('searchEnabled', true);
    this.set('searchField', 'longName');
    await render(hbs`<NaviTableSelect
          @selected={{selected}}
          @options={{options}}
          @onChange={{onChange}}
          @searchEnabled={{searchEnabled}}
          @searchField={{searchField}}
      />`);

    await clickTrigger();
    assert.deepEqual(
      findAll('.ember-power-select-option').map(el => el.textContent.trim()),
      ['network', 'network2'],
      'All options are shown'
    );

    await fillIn('.ember-power-select-search-input', '2');
    assert.deepEqual(
      findAll('.ember-power-select-option').map(el => el.textContent.trim()),
      ['network2'],
      'Filtered options are shown'
    );
  });
});

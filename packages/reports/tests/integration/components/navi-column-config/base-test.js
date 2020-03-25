import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { helper as buildHelper } from '@ember/component/helper';
import { render, triggerKeyEvent, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
<NaviColumnConfig::Base 
  @column={{this.column}} 
  @metadata={{this.metadata}}
  @cloneColumn={{this.cloneColumn}}
  @toggleColumnFilter={{this.toggleColumnFilter}}
  @onUpdateColumnName={{this.onUpdateColumnName}}
/>`;

module('Integration | Component | navi-column-config/base', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.metadata = {};
    this.cloneColumn = () => undefined;
    this.toggleColumnFilter = () => undefined;
    this.onUpdateColumnName = () => undefined;
  });

  test('it renders', async function(assert) {
    assert.expect(3);
    this.owner.register('helper:update-report-action', buildHelper(() => {}), { instantiate: false });

    this.column = {
      name: 'property',
      type: 'dimension',
      displayName: 'Property',
      fragment: { dimension: { id: 'property', name: 'Property' } }
    };
    this.cloneColumn = () => assert.ok(true, 'cloneColumn is called when clone is clicked');
    this.toggleColumnFilter = () => assert.ok(true, 'toggleColumnFilter is called when filter is clicked');
    this.onUpdateColumnName = newName =>
      assert.equal(newName, 'Some other value', 'onUpdateColumnName action is called with new column name');

    await render(TEMPLATE);

    assert
      .dom('input.navi-column-config-base__column-name-input')
      .hasValue('Property', "Column Name field has value of column's display name");
    await fillIn('input', 'Some other value');
    await triggerKeyEvent('input', 'keyup', 13);

    await click('.navi-column-config-base__clone-icon');
    await click('.navi-column-config-base__filter-icon');
  });

  test('Filter is active when column is filtered', async function(assert) {
    assert.expect(2);
    this.owner.register('helper:update-report-action', buildHelper(() => {}), { instantiate: false });

    this.column = {
      name: 'property',
      type: 'dimension',
      displayName: 'Property',
      isFiltered: false,
      fragment: { dimension: { name: 'Property' } }
    };

    await render(TEMPLATE);

    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass('navi-column-config-base__filter-icon--active', 'The filter is not active by default');

    this.set('column', {
      ...this.column,
      isFiltered: true
    });

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass('navi-column-config-base__filter-icon--active', 'The filter is active when the column is filtered');
  });
});

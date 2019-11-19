import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | navi-request-column-config/base', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(3);

    this.set('column', {
      name: 'property',
      type: 'dimension',
      displayName: 'Property'
    });
    this.set('metadata', {});
    this.set('onClose', () => {
      assert.ok(true, 'onClose action is called when x is clicked');
    });
    this.set('onUpdateColumnName', newName => {
      assert.equal(newName, 'Some other value', 'onUpdateColumnName action is called with new column name');
    });

    await render(hbs`
      <NaviRequestColumnConfig::Base 
        @column={{column}} 
        @metadata={{metadata}}
        @onClose={{action onClose}}
        @onUpdateColumnName={{action onUpdateColumnName}}
      />
    `);

    assert.dom('input').hasValue('Property', "Column Name field has value of column's display name");
    await fillIn('input', 'Some other value');
    await triggerKeyEvent('input', 'keyup', 13);

    await click('.navi-request-column-config__exit-icon');
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { ParameterListItemArgs } from 'navi-reports/components/parameter-list-item';

module('Integration | Component | parameter-list-item', function (hooks) {
  setupRenderingTest(hooks);

  test('it decides whether to show id or not', async function (assert) {
    const arg1: ParameterListItemArgs['argument'] = { name: 'nameField', id: '1' };
    this.set('arg', arg1);
    await render(hbs`<ParameterListItem @argument={{this.arg}} />`);
    assert.dom(this.element).hasText('nameField', 'it should show name field when description is not available');

    const arg2: ParameterListItemArgs['argument'] = { description: 'descriptionField', name: 'nameField', id: '2' };
    this.set('arg', arg2);
    assert.dom(this.element).hasText('descriptionField', 'it should show description field when available');
  });
});

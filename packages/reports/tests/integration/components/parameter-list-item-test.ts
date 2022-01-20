import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { ParameterListItemArgs } from 'navi-reports/components/parameter-list-item';

module('Integration | Component | parameter-list-item', function (hooks) {
  setupRenderingTest(hooks);

  test('it decides whether to show id or not', async function (assert) {
    const arg1: ParameterListItemArgs['argument'] = { name: '', id: 'idField' };
    this.set('arg', arg1);
    await render(hbs`<ParameterListItem @argument={{this.arg}} />`);
    assert.dom(this.element).hasText(`${arg1.id}`, 'it should show id field when name is not available');

    const arg2: ParameterListItemArgs['argument'] = {
      description: 'descriptionField',
      name: 'nameField',
      id: 'idField',
    };
    this.set('arg', arg2);
    assert.dom(this.element).hasText(`${arg2.name}`, 'it should show name field when available');
  });
});

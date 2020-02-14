import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, triggerEvent, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';

let Template = hbs`
  <NumberFormatDropdown
    @column={{this.column}}
    @onUpdateReport={{this.onUpdateReport}}
  />`;

module('Integration | Component | number format dropdown', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('column', {
      type: 'metric',
      displayName: 'Coins',
      attributes: {
        name: 'coins',
        parameters: {},
        format: '$0,0[.]00'
      },
      hasCustomDisplayName: false,
      sortDirection: 'none'
    });
  });

  test('updating format', async function(assert) {
    assert.expect(3);

    this.set('onUpdateReport', (action, updatedColumn) => {
      assert.deepEqual(
        updatedColumn,
        {
          type: 'metric',
          displayName: 'Coins',
          attributes: {
            name: 'coins',
            parameters: {},
            format: '0.0a'
          },
          hasCustomDisplayName: false,
          sortDirection: 'none'
        },
        'onUpdateFormat is called on close with a deeply merged updated column'
      );
    });

    await render(Template);

    await clickTrigger('.number-format-dropdown'); // open dropdown

    assert.dom('.number-format-selector__radio-money input').isChecked('The money input is selected');

    find('.number-format-selector__radio-nice-number input').checked = true; // change format to nice number
    await triggerEvent('.number-format-selector__radio-nice-number input', 'change');

    assert.dom('.number-format-selector__radio-nice-number input').isChecked('The format changes to nice number');

    await click('.number-format-dropdown');
  });
});

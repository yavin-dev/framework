import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click, triggerEvent } from '@ember/test-helpers';
import { fillInSync } from '../../helpers/fill-in-sync';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
        {{editable-label
            value=value
            onChange=(action onChange)
        }}
    `;

module('Integration | Component | Editable Label', function(hooks) {
  setupRenderingTest(hooks);

  test('edit label triggers action', async function(assert) {
    assert.expect(3);

    this.set('value', 'Default Value');
    this.set('onChange', value => {
      assert.equal(value, 'Edited Value', '`onChange` action sent an updated value');
    });

    await render(TEMPLATE);

    await click('.editable-label__icon');

    assert.equal(find('.editable-label__input').value, 'Default Value', 'Label contains the default value');

    fillInSync('.editable-label__input', 'Edited Value');

    await triggerEvent('.editable-label__input', 'focusout');

    assert.equal(
      this.get('value'),
      'Default Value',
      'Editing the label does not mutate the provided `value` attribute'
    );
  });

  test('no change in value', async function(assert) {
    assert.expect(1);

    this.set('value', 'Default Value');
    this.set('onChange', () => {
      assert.notOk(true, '`onChange` is not invoked if `value` is not updated');
    });

    await render(TEMPLATE);

    await click('.editable-label__icon');

    await triggerEvent('.editable-label__input', 'focusout');

    assert.equal(
      this.get('value'),
      'Default Value',
      'Editing the label does not mutate the provided `value` attribute'
    );
  });

  test('_inputSize', async function(assert) {
    assert.expect(3);

    this.set('value', '');
    this.set('onChange', () => {});

    await render(TEMPLATE);

    await click('.editable-label__icon');

    assert.equal(find('.editable-label__input').getAttribute('size'), 1, 'Size of the input is greater or equal to 1');

    fillInSync('.editable-label__input', 'Default Value');
    assert.equal(
      find('.editable-label__input').getAttribute('size'),
      find('.editable-label__input').value.length + 1,
      'Size of the input is the string length plus 1'
    );

    let longValue = Array(100)
      .fill(1)
      .join('');
    fillInSync('.editable-label__input', longValue);
    assert.equal(
      find('.editable-label__input').getAttribute('size'),
      50,
      'Size of the input is less than or equal to 50'
    );
  });

  test('value is reset when editing', async function(assert) {
    assert.expect(3);

    this.set('value', 'Initial value');
    this.set('onChange', () => {});

    await render(TEMPLATE);
    await click('.editable-label__icon');

    assert.equal(
      find('.editable-label__input').value,
      'Initial value',
      'Input starts with text equal to given value property'
    );

    fillInSync('.editable-label__input', 'Something else');

    assert.equal(find('.editable-label__input').value, 'Something else', 'Input text changes with user input');

    await triggerEvent('.editable-label__input', 'focusout');
    await click('.editable-label__icon');

    assert.equal(
      find('.editable-label__input').value,
      'Initial value',
      'When focusing in and out, input text is reset to given value property'
    );
  });
});

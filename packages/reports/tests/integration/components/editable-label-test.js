import { moduleForComponent, test } from 'ember-qunit';
import { fillInSync } from '../../helpers/fill-in-sync';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
        {{editable-label
            value=value
            onChange=(action onChange)
        }}
    `;

moduleForComponent('editable-label', 'Integration | Component | Editable Label', {
  integration: true
});

test('edit label triggers action', function(assert) {
  assert.expect(3);

  this.set('value', 'Default Value');
  this.set('onChange', (value) => {
    assert.equal(value,
      'Edited Value',
      '`onChange` action sent an updated value');
  });

  this.render(TEMPLATE);

  this.$('.editable-label__icon').click();

  assert.equal(this.$('.editable-label__input').val(),
    'Default Value',
    'Label contains the default value');

  fillInSync('.editable-label__input', 'Edited Value');

  this.$('.editable-label__input').focusout();

  assert.equal(this.get('value'),
    'Default Value',
    'Editing the label does not mutate the provided `value` attribute');
});

test('no change in value', function(assert) {
  assert.expect(1);

  this.set('value', 'Default Value');
  this.set('onChange', () => {
    assert.notOk(true,
      '`onChange` is not invoked if `value` is not updated');
  });

  this.render(TEMPLATE);

  this.$('.editable-label__icon').click();

  this.$('.editable-label__input').focusout();

  assert.equal(this.get('value'),
    'Default Value',
    'Editing the label does not mutate the provided `value` attribute');
});

test('_inputSize', function(assert) {
  assert.expect(3);

  this.set('value', '');
  this.set('onChange', () => {});

  this.render(TEMPLATE);

  this.$('.editable-label__icon').click();

  assert.equal(this.$('.editable-label__input').attr('size'),
    1,
    'Size of the input is greater or equal to 1');

  fillInSync('.editable-label__input', 'Default Value');
  assert.equal(this.$('.editable-label__input').attr('size'),
    this.$('.editable-label__input').val().length + 1,
    'Size of the input is the string length plus 1');

  let longValue = Array(100).fill(1).join('');
  fillInSync('.editable-label__input', longValue);
  assert.equal(this.$('.editable-label__input').attr('size'),
    50,
    'Size of the input is less than or equal to 50');
});

test('value is reset when editing', function(assert) {
  assert.expect(3);

  this.set('value', 'Initial value');
  this.set('onChange', () => {});

  this.render(TEMPLATE);
  this.$('.editable-label__icon').click();

  assert.equal(this.$('.editable-label__input').val(),
    'Initial value',
    'Input starts with text equal to given value property');

  fillInSync('.editable-label__input', 'Something else');

  assert.equal(this.$('.editable-label__input').val(),
    'Something else',
    'Input text changes with user input');

  this.$('.editable-label__input').focusout();
  this.$('.editable-label__icon').click();

  assert.equal(this.$('.editable-label__input').val(),
    'Initial value',
    'When focusing in and out, input text is reset to given value property');
});

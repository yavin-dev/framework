import { run } from '@ember/runloop';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

let Template = hbs`
  {{number-format-selector
    format=format
    onUpdateFormat=(action onUpdateFormat)
  }}`;

moduleForComponent('number-format-selector', 'Integration | Component | number format selector', {
  integration: true,
  beforeEach() {
    this.set('format', '$0,0[.]00');
    this.set('onUpdateFormat', () => null);
  }
});

test('updateFormat from radio button', function (assert) {
  assert.expect(1);

  this.set('onUpdateFormat', result => {
    assert.equal(result,
      '0,0.00',
      'onUpdateFormat action is called by radio button');
  });

  this.render(Template);

  run(() => {
    $('.number-format-selector__radio-number input').click();
  });
});

test('clearFormat', function (assert) {
  assert.expect(1);

  this.set('onUpdateFormat', result => {
    assert.equal(result,
      '',
      'onUpdateFormat action is called by custom format radio button');
  });

  this.render(Template);

  run(() => {
    $('.number-format-selector__radio-custom input').click();
  });
});

test('highlight correct format when customFormat is changed', function (assert) {
  assert.expect(2);

  this.render(Template);

  run(() => {
    $('.number-format-selector__format-input').val('$0,0[.]00a');
    $('.number-format-selector__format-input').focusout();
  });

  return wait().then(() => {
    assert.ok($('.number-format-selector__radio-custom input').prop('checked'),
      'custom format correctly highlighted when user enters custom format');

    run(() => {
      $('.number-format-selector__format-input').val('0,0.00');
      $('.number-format-selector__format-input').focusout();
    });

    return wait().then(() => {
      assert.ok($('.number-format-selector__radio-number input').prop('checked'),
        'number format correctly highlighted when user enters number format');
    });
  });
});

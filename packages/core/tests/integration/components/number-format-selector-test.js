import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let Template = hbs`
  {{number-format-selector
    format=format
    onUpdateFormat=(action onUpdateFormat)
  }}`;

module('Integration | Component | number format selector', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('format', '$0,0[.]00');
    this.set('onUpdateFormat', () => null);
  });

  test('updateFormat from radio button', async function(assert) {
    assert.expect(1);

    this.set('onUpdateFormat', result => {
      assert.equal(result, '0,0.00', 'onUpdateFormat action is called by radio button');
    });

    await render(Template);

    run(() => {
      $('.number-format-selector__radio-number input').click();
    });
  });

  test('clearFormat', async function(assert) {
    assert.expect(1);

    this.set('onUpdateFormat', result => {
      assert.equal(result, '', 'onUpdateFormat action is called by custom format radio button');
    });

    await render(Template);

    run(() => {
      $('.number-format-selector__radio-custom input').click();
    });
  });

  test('highlight correct format when customFormat is changed', async function(assert) {
    assert.expect(2);

    await render(Template);

    run(() => {
      $('.number-format-selector__format-input').val('$0,0[.]00a');
      $('.number-format-selector__format-input').focusout();
    });

    return settled().then(() => {
      assert.ok(
        $('.number-format-selector__radio-custom input').prop('checked'),
        'custom format correctly highlighted when user enters custom format'
      );

      run(() => {
        $('.number-format-selector__format-input').val('0,0.00');
        $('.number-format-selector__format-input').focusout();
      });

      return settled().then(() => {
        assert.ok(
          $('.number-format-selector__radio-number input').prop('checked'),
          'number format correctly highlighted when user enters number format'
        );
      });
    });
  });
});

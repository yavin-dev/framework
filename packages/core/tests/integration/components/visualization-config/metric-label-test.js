import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, fillIn, blur } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let Template = hbs`
  {{visualization-config/metric-label
    response=response
    request=request
    options=options
    onUpdateConfig=(action onUpdateConfig)
  }}`;

module('Integration | Component | visualization config/metric-label', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('options', {
      description: "Glass Bottles of the ranch's finest pasteurized whole milk!!!!!!!",
      metric: 'bottles',
      format: '$0,0[.]00'
    });
    this.set('onUpdateConfig', () => null);
  });

  test('component renders', async function(assert) {
    assert.expect(2);

    await render(Template);

    assert.equal(
      find('.metric-label-config__description-input').value.trim(),
      "Glass Bottles of the ranch's finest pasteurized whole milk!!!!!!!",
      'Component correctly displays initial description'
    );

    assert.equal(
      find('.number-format-selector__format-input').value.trim(),
      '$0,0[.]00',
      'Component correctly displays initial format'
    );
  });

  test('onUpdateConfig format input', async function(assert) {
    assert.expect(1);

    this.set('onUpdateConfig', result => {
      assert.equal(result.format, 'foo', 'onUpdateConfig action is called by format input');
    });

    await render(Template);

    run(() => {
      fillIn('.number-format-selector__format-input', 'foo');
      blur('.number-format-selector__format-input');
    });
  });

  test('onUpdateConfig description input', async function(assert) {
    assert.expect(1);

    this.set('onUpdateConfig', result => {
      assert.equal(result.description, 'foo', 'onUpdateConfig action is called by description input');
    });

    await render(Template);

    run(() => {
      fillIn('.metric-label-config__description-input', 'foo');
      blur('.metric-label-config__description-input');
    });
  });
});

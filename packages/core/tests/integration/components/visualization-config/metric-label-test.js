import { run } from '@ember/runloop';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

let Template = hbs`
  {{visualization-config/metric-label
    response=response
    request=request
    options=options
    onUpdateConfig=(action onUpdateConfig)
  }}`;

moduleForComponent('visualization-config/metric-label', 'Integration | Component | visualization config/metric-label', {
  integration: true,
  beforeEach() {
    this.set('options', {
      description: "Glass Bottles of the ranch's finest pasteurized whole milk!!!!!!!",
      metric: 'bottles',
      format: '$0,0[.]00'
    });
    this.set('onUpdateConfig', () => null);
  }
});

test('component renders', function(assert) {
  assert.expect(2);

  this.render(Template);

  assert.equal(
    this.$('.metric-label-config__description-input')
      .val()
      .trim(),
    "Glass Bottles of the ranch's finest pasteurized whole milk!!!!!!!",
    'Component correctly displays initial description'
  );

  assert.equal(
    this.$('.number-format-selector__format-input')
      .val()
      .trim(),
    '$0,0[.]00',
    'Component correctly displays initial format'
  );
});

test('onUpdateConfig format input', function(assert) {
  assert.expect(1);

  this.set('onUpdateConfig', result => {
    assert.equal(result.format, 'foo', 'onUpdateConfig action is called by format input');
  });

  this.render(Template);

  run(() => {
    $('.number-format-selector__format-input').val('foo');
    $('.number-format-selector__format-input').focusout();
  });
});

test('onUpdateConfig description input', function(assert) {
  assert.expect(1);

  this.set('onUpdateConfig', result => {
    assert.equal(result.description, 'foo', 'onUpdateConfig action is called by description input');
  });

  this.render(Template);

  run(() => {
    $('.metric-label-config__description-input').val('foo');
    $('.metric-label-config__description-input').focusout();
  });
});

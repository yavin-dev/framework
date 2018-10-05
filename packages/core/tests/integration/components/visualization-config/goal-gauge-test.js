import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('visualization-config/goal-gauge', 'Integration | Component | visualization config/goal gauge', {
  integration: true
});

let Template = hbs`
  {{visualization-config/goal-gauge
    response=response
    request=request
    options=options
    onUpdateConfig=(action onUpdateConfig)
  }}`;

test('it renders', function(assert) {
  this.render(hbs`{{visualization-config/goal-gauge}}`);

  let headers = this.$('.goal-gauge-config__section-header')
    .toArray()
    .map(value =>
      this.$(value)
        .text()
        .trim()
    );
  assert.deepEqual(headers, ['Label', 'Baseline', 'Goal'], 'headers are displayed for goal gauge config');
});

test('onUpdateConfig baselineValue input', function(assert) {
  assert.expect(1);

  this.set('onUpdateConfig', result => {
    assert.equal(result.baselineValue, 1, 'onUpdateConfig action is called by baseline input');
  });

  this.render(Template);

  Ember.run(() => {
    this.$('.goal-gauge-config__baseline-input').val(1);
    this.$('.goal-gauge-config__baseline-input').focusout();
  });
});

test('onUpdateConfig goalValue input', function(assert) {
  assert.expect(1);

  this.set('onUpdateConfig', result => {
    assert.equal(result.goalValue, 10, 'onUpdateConfig action is called by goal input');
  });

  this.render(Template);

  Ember.run(() => {
    this.$('.goal-gauge-config__goal-input').val(10);
    this.$('.goal-gauge-config__goal-input').focusout();
  });
});

test('onUpdateConfig goal gauge label input', function(assert) {
  assert.expect(1);

  this.set('onUpdateConfig', result => {
    assert.equal(result.metricTitle, 'bottles', 'onUpdateConfig action is called by label input');
  });

  this.render(Template);

  Ember.run(() => {
    this.$('.goal-gauge-config__label-input').val('bottles');
    this.$('.goal-gauge-config__label-input').focusout();
  });
});

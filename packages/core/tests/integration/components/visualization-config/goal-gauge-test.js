import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, blur, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | visualization config/goal gauge', function(hooks) {
  setupRenderingTest(hooks);

  let Template = hbs`
    {{visualization-config/goal-gauge
      response=response
      request=request
      options=options
      onUpdateConfig=(action onUpdateConfig)
    }}`;

  test('it renders', async function(assert) {
    await render(hbs`{{visualization-config/goal-gauge}}`);

    const headers = findAll('.goal-gauge-config__section-header').map(el => el.textContent.trim());
    assert.deepEqual(headers, ['Label', 'Baseline', 'Goal'], 'headers are displayed for goal gauge config');
  });

  test('onUpdateConfig baselineValue input', async function(assert) {
    assert.expect(1);

    this.set('onUpdateConfig', result => {
      assert.equal(result.baselineValue, 1, 'onUpdateConfig action is called by baseline input');
    });

    await render(Template);
    await fillIn('.goal-gauge-config__baseline-input', '1');
    await blur('.goal-gauge-config__baseline-input');
  });

  test('onUpdateConfig goalValue input', async function(assert) {
    assert.expect(1);

    this.set('onUpdateConfig', result => {
      assert.equal(result.goalValue, 10, 'onUpdateConfig action is called by goal input');
    });

    await render(Template);

    run(async () => {
      await fillIn('.goal-gauge-config__goal-input', 10);
      await blur('.goal-gauge-config__goal-input');
    });
  });

  test('onUpdateConfig goal gauge label input', async function(assert) {
    assert.expect(1);

    this.set('onUpdateConfig', result => {
      assert.equal(result.metricTitle, 'bottles', 'onUpdateConfig action is called by label input');
    });

    await render(Template);

    run(async () => {
      await fillIn('.goal-gauge-config__label-input', 'bottles');
      await blur('.goal-gauge-config__label-input');
    });
  });
});

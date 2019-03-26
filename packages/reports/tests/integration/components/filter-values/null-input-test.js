import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | filter values/null input', function(hooks) {
  setupRenderingTest(hooks);

  test('changing values', async function(assert) {
    assert.expect(1);

    this.onUpdateFilter = changeSet => {
      assert.deepEqual(changeSet.values, ['""'], 'When rendering the component, "" is set as the filter value');
    };

    await render(hbs`{{filter-values/null-input onUpdateFilter=(action onUpdateFilter)}}`);

    // Assert handled in action
  });
});

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, click } from '@ember/test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';

module('Acceptance | Dropdown Parameter Picker test', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('verify dropdown parameter picker', async function (assert) {
    await visit('/reports/new');

    assert.dom('.dropdown-parameter-picker .chips').hasText('day', 'Date Time parameter is shown properly upon open');

    await clickTrigger('.dropdown-parameter-picker');
    assert.dom('.dropdown-parameter-picker__dropdown').isVisible('Dropdown is visible after clicking parameter chip');

    await click('.ember-power-select-option[data-option-index="0.0"]');
    assert.dom('.dropdown-parameter-picker .chips').hasText('hour', 'Date Time parameter is updated properly');
  });
});

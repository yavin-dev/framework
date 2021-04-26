import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { findAll, visit } from '@ember/test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';

module('Acceptance | Dropdown Parameter Picker test', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('verify dropdown parameter picker', async function (assert) {
    await visit('/reports/new');

    assert.dom('.dropdown-parameter-picker .chips').hasText('day', 'Date Time parameter is shown properly upon open');

    await clickTrigger('.dropdown-parameter-picker');
    assert.dom('.dropdown-parameter-picker__dropdown').isVisible('Dropdown is visible after clicking parameter chip');

    assert.deepEqual(
      findAll('.dropdown-parameter-picker__dropdown .ember-power-select-group-name').map((el) =>
        el.textContent?.trim()
      ),
      ['Time grain'],
      'The option groups are all represented properly'
    );

    assert.deepEqual(
      findAll('.dropdown-parameter-picker__dropdown .ember-power-select-option').map((el) => el.textContent?.trim()),
      ['hour', 'day', 'isoWeek', 'month', 'quarter', 'year'],
      'The options are all represented properly'
    );

    await selectChoose('.dropdown-parameter-picker', 'hour');
    assert.dom('.dropdown-parameter-picker .chips').hasText('hour', 'Date Time parameter is updated properly');
  });
});

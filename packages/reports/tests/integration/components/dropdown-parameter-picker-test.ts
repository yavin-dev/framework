import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import FragmentFactory from 'navi-core/services/fragment-factory';
import FilterFragment from 'navi-core/models/fragments/filter';
//@ts-ignore
import { selectChoose } from 'ember-power-select/test-support';

interface TestContext extends Context {
  filter: FilterFragment;
  updateParameters: (key: string, value: string) => void;
}

module('Integration | Component | dropdown parameter picker', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    const factory: FragmentFactory = this.owner.lookup('service:fragment-factory');
    this.set('selectedParameter', 'day');
    this.updateParameters = (_id: string, value: string) => this.set('selectedParameter', value);
    await this.owner.lookup('service:navi-metadata').loadMetadata();
    this.set(
      'filter',
      factory.createFilter('timeDimension', 'bardOne', 'network.dateTime', { grain: 'day' }, 'bet', [])
    );
  });

  test('dropdown-parameter-picker', async function (this: TestContext, assert) {
    assert.expect(8);

    await render(hbs`        
    {{#each-in this.filter.parameters as |paramName paramValue|}}
      <DropdownParameterPicker
        @parameterMetadata={{find-by "id" paramName this.filter.columnMetadata.parameters}}
        @parameterValue={{this.selectedParameter}}
        @onUpdate={{this.updateParameters}}
      />
    {{/each-in}}`);

    assert.dom('.dropdown-parameter-picker__trigger').exists('Parameter picker is rendered properly');

    assert
      .dom('.dropdown-parameter-picker__trigger.chips')
      .hasText('day', 'Parameter chip is rendered with default parameter');

    await click('.dropdown-parameter-picker__trigger');
    assert.dom('.dropdown-parameter-picker__dropdown').isVisible('Dropdown is visible after clicking');

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

    await selectChoose('.dropdown-parameter-picker', 'month');
    assert
      .dom('.dropdown-parameter-picker__trigger.chips')
      .hasText('month', 'Parameter chip value is changed after clicking a dropdown option');

    this.set('updateParameters', (id: string, value: string) => {
      assert.equal(id, 'grain', 'onUpdate action was called with the correct parameter id');
      assert.equal(value, 'hour', 'onUpdate action was called with the correct parameter value');
    });

    await selectChoose('.dropdown-parameter-picker', 'hour');
  });
});

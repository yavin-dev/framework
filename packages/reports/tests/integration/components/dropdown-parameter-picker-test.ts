import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import FragmentFactory from 'navi-core/services/fragment-factory';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';

interface TestContext extends Context {
  filter: FilterFragment;
  parameterIndex: number;
  updateParameters: (key: string, value: string) => void;
  parameterKeys: string[];
}

module('Integration | Component | dropdown parameter picker', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    const factory: FragmentFactory = this.owner.lookup('service:fragment-factory');
    this.set('parameterIndex', 0);
    this.set('parameterKeys', ['grain']);
    this.set('selectedParameter', 'day');
    //@ts-expect-error
    this.updateParameters = (id: string, value: string) => this.set('selectedParameter', value);
    await this.owner.lookup('service:navi-metadata').loadMetadata();
    this.set(
      'filter',
      factory.createFilter('timeDimension', 'bardOne', 'network.dateTime', { grain: 'day' }, 'bet', [])
    );
  });

  test('dropdown-parameter-picker', async function (this: TestContext, assert) {
    assert.expect(5);

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

    await click('.ember-power-select-option[data-option-index="0.3"]');
    assert
      .dom('.dropdown-parameter-picker__trigger.chips')
      .hasText('month', 'Parameter chip value is changed after clicking a dropdown option');

    //@ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.set('updateParameters', (id: string, value: string) =>
      assert.equal(id, 'grain', 'onUpdate action was called with grain id')
    );

    await click('.dropdown-parameter-picker__trigger');
    await click('.ember-power-select-option[data-option-index="0.0"]');
  });
});
